"""
Spark-side integration test suites for the Nessie/Iceberg lakehouse.

Invoked by the Airflow DAG `lakehouse_nessie_test_suite` as:

    spark-submit ... spark_nessie_test_suite.py \
        --suite write_read --catalog nessie \
        --branch test/20260611_xxx --s3-prefix s3://lakehouse-test/test-runs/...

All Spark/Nessie/S3 configuration (including the TLS-verification bypass for
the un-certed Nessie HTTPS endpoint) is injected via --conf by the DAG, so
this file contains test logic only. Every suite raises on failure, which
fails spark-submit, which fails the pod, which fails the Airflow task.
"""

from __future__ import annotations

import argparse
import sys
import time

from pyspark.sql import SparkSession


def log(msg: str) -> None:
    print(f"[nessie-test-suite] {msg}", flush=True)


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(f"TEST FAILED: {message}")


# --------------------------------------------------------------------------
# Suites
# --------------------------------------------------------------------------

def suite_preflight(spark: SparkSession, cat: str, branch: str, prefix: str) -> None:
    """Nessie reachable over (unverified) TLS + catalog initialises."""
    refs = spark.sql(f"LIST REFERENCES IN {cat}").collect()
    require(any(r["name"] == "main" for r in refs), "branch 'main' not visible")
    log(f"Nessie reachable, {len(refs)} reference(s) visible")


def suite_create_branch(spark: SparkSession, cat: str, branch: str, prefix: str) -> None:
    spark.sql(f"CREATE BRANCH IF NOT EXISTS `{branch}` IN {cat} FROM main")
    refs = [r["name"] for r in spark.sql(f"LIST REFERENCES IN {cat}").collect()]
    require(branch in refs, f"ephemeral branch {branch} was not created")
    log(f"created ephemeral branch {branch}")


def _use_branch(spark: SparkSession, cat: str, branch: str) -> None:
    spark.sql(f"USE REFERENCE `{branch}` IN {cat}")


def suite_smoke_ddl(spark: SparkSession, cat: str, branch: str, prefix: str) -> None:
    _use_branch(spark, cat, branch)
    spark.sql(f"CREATE NAMESPACE IF NOT EXISTS {cat}.itest")
    spark.sql(
        f"""CREATE TABLE IF NOT EXISTS {cat}.itest.smoke (
              id BIGINT, label STRING, ts TIMESTAMP)
            USING iceberg
            LOCATION '{prefix}/smoke'
            TBLPROPERTIES ('format-version'='2', 'write.parquet.compression-codec'='zstd')"""
    )
    tables = [t["tableName"] for t in spark.sql(f"SHOW TABLES IN {cat}.itest").collect()]
    require("smoke" in tables, "smoke table missing after CREATE")
    log("DDL smoke test passed")


def suite_write_read(spark: SparkSession, cat: str, branch: str, prefix: str) -> None:
    _use_branch(spark, cat, branch)
    spark.sql(
        f"""CREATE TABLE IF NOT EXISTS {cat}.itest.roundtrip (
              id BIGINT, payload STRING) USING iceberg
            LOCATION '{prefix}/roundtrip'"""
    )
    spark.range(10_000).selectExpr("id", "uuid() AS payload") \
        .writeTo(f"{cat}.itest.roundtrip").append()
    count = spark.table(f"{cat}.itest.roundtrip").count()
    require(count == 10_000, f"expected 10000 rows on StorageGRID, got {count}")
    # MERGE exercises the v2 row-level path end to end.
    spark.sql(
        f"""MERGE INTO {cat}.itest.roundtrip t
            USING (SELECT 1 AS id, 'updated' AS payload) s ON t.id = s.id
            WHEN MATCHED THEN UPDATE SET t.payload = s.payload"""
    )
    updated = spark.sql(
        f"SELECT payload FROM {cat}.itest.roundtrip WHERE id = 1"
    ).first()["payload"]
    require(updated == "updated", "MERGE INTO did not apply")
    log("write/read/merge round-trip on StorageGRID passed")


def suite_schema_evolution(spark: SparkSession, cat: str, branch: str, prefix: str) -> None:
    _use_branch(spark, cat, branch)
    spark.sql(f"ALTER TABLE {cat}.itest.roundtrip ADD COLUMN score DOUBLE")
    spark.sql(f"INSERT INTO {cat}.itest.roundtrip VALUES (99999, 'evolved', 0.99)")
    row = spark.sql(
        f"SELECT score FROM {cat}.itest.roundtrip WHERE id = 99999"
    ).first()
    require(row and abs(row["score"] - 0.99) < 1e-9, "evolved column not readable")
    log("schema evolution passed")


def suite_branch_isolation(spark: SparkSession, cat: str, branch: str, prefix: str) -> None:
    """Writes on the test branch must be invisible on main."""
    _use_branch(spark, cat, branch)
    table_on_branch = spark.catalog.tableExists(f"{cat}.itest.roundtrip")
    require(table_on_branch, "test table missing on test branch")

    spark.sql(f"USE REFERENCE main IN {cat}")
    leaked = spark.catalog.tableExists(f"{cat}.itest.roundtrip")
    require(not leaked, "ISOLATION BREACH: test table visible on main")
    log("branch isolation verified — main is clean")


def suite_time_travel(spark: SparkSession, cat: str, branch: str, prefix: str) -> None:
    _use_branch(spark, cat, branch)
    snapshots = spark.sql(
        f"SELECT snapshot_id FROM {cat}.itest.roundtrip.snapshots ORDER BY committed_at"
    ).collect()
    require(len(snapshots) >= 2, "expected >=2 snapshots for time travel")
    first = snapshots[0]["snapshot_id"]
    historical = spark.read.option("snapshot-id", first) \
        .table(f"{cat}.itest.roundtrip").count()
    current = spark.table(f"{cat}.itest.roundtrip").count()
    require(historical != current, "snapshot read returned current state")
    log(f"time travel passed (snapshot {first}: {historical} rows vs {current} now)")


def suite_cleanup(spark: SparkSession, cat: str, branch: str, prefix: str) -> None:
    """Best-effort teardown; must never mask the run's real result."""
    try:
        spark.sql(f"DROP BRANCH IF EXISTS `{branch}` IN {cat} FORCE")
        log(f"dropped branch {branch}")
    except Exception as exc:  # noqa: BLE001 — cleanup is best-effort
        log(f"WARN: branch drop failed: {exc}")
    # Data files under the run prefix are orphaned by design once the branch
    # is gone; the nightly Nessie GC + StorageGRID lifecycle rule on
    # 'test-runs/' (e.g. expire after 7 days) reclaims them.
    log("cleanup complete")


SUITES = {
    "preflight": suite_preflight,
    "create_branch": suite_create_branch,
    "smoke_ddl": suite_smoke_ddl,
    "write_read": suite_write_read,
    "schema_evolution": suite_schema_evolution,
    "branch_isolation": suite_branch_isolation,
    "time_travel": suite_time_travel,
    "cleanup": suite_cleanup,
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--suite", required=True, choices=sorted(SUITES))
    parser.add_argument("--catalog", default="nessie")
    parser.add_argument("--branch", required=True)
    parser.add_argument("--s3-prefix", required=True)
    args = parser.parse_args()

    spark = SparkSession.builder.appName(f"nessie-itest-{args.suite}").getOrCreate()
    started = time.monotonic()
    try:
        SUITES[args.suite](spark, args.catalog, args.branch, args.s3_prefix)
        log(f"suite '{args.suite}' PASSED in {time.monotonic() - started:.1f}s")
        return 0
    except Exception as exc:  # noqa: BLE001
        log(f"suite '{args.suite}' FAILED: {exc}")
        raise
    finally:
        spark.stop()


if __name__ == "__main__":
    sys.exit(main())
