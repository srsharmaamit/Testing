"""
Lakehouse integration test suite: Spark 3.5.5 + Iceberg 1.9.1 + Nessie 0.106.0.

Pattern
-------
1. Create an ephemeral Nessie branch for this DAG run (full isolation, no
   pollution of `main`).
2. Run the Spark-based test suites against that branch, writing data under a
   run-scoped S3 prefix on NetApp StorageGRID.
3. Tear down: drop the ephemeral branch and the S3 test prefix, ALWAYS
   (trigger_rule=ALL_DONE), so failed runs don't leak state.

TLS note
--------
The Nessie endpoint is HTTPS without a trusted PKI cert. Certificate and
hostname verification are disabled via the Nessie client option
`nessie.ssl.no-certificate-verification=true` (surfaced as the Spark catalog
property `spark.sql.catalog.<cat>.ssl.no-certificate-verification`). In
Nessie 0.106.0 this installs a no-op X509ExtendedTrustManager, which skips
both chain validation and HTTPS endpoint identification (hostname checks).
This is acceptable for a test environment only — the strategic fix is to
issue a server cert from the internal CA / Vault PKI and ship the CA into
the Spark image truststore, then delete that single property.

Configuration
-------------
All environment-specific values come from Airflow Variables (JSON variable
`lakehouse_test_env`) so the DAG file itself is environment-agnostic and can
be promoted dev -> uat -> prod unchanged. S3 credentials are mounted from a
Kubernetes Secret (Vault-synced), never templated into the pod spec.

Expected Airflow Variable `lakehouse_test_env` (JSON), example:
{
  "namespace": "lakehouse-test",
  "spark_image": "registry.internal/lakehouse/spark:3.5.5-iceberg-1.9.1-nessie-0.106.0",
  "service_account": "spark-test-runner",
  "nessie_uri": "https://nessie.lakehouse.svc:19120/api/v2",
  "s3_endpoint": "https://storagegrid.internal:10443",
  "s3_bucket": "lakehouse-test",
  "s3_secret_name": "storagegrid-test-credentials",
  "executor_instances": "2",
  "executor_memory": "2g",
  "executor_cores": "1"
}
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta

from airflow.models import Variable
from airflow.models.dag import DAG
from airflow.operators.empty import EmptyOperator
from airflow.providers.cncf.kubernetes.operators.pod import KubernetesPodOperator
from airflow.utils.task_group import TaskGroup
from airflow.utils.trigger_rule import TriggerRule
from kubernetes.client import models as k8s

# --------------------------------------------------------------------------
# Environment configuration (single JSON Airflow Variable, no hardcoding)
# --------------------------------------------------------------------------
ENV = json.loads(Variable.get("lakehouse_test_env"))

DAG_ID = "lakehouse_nessie_test_suite"
CATALOG = "nessie"

# Run-scoped identifiers: ephemeral branch + isolated S3 prefix per DAG run.
# run_id contains characters Nessie branch names dislike, so use ts_nodash.
TEST_BRANCH = "test/{{ ds_nodash }}_{{ ts_nodash | lower }}"
TEST_S3_PREFIX = "s3://{bucket}/test-runs/{{{{ ds_nodash }}}}/{{{{ ts_nodash | lower }}}}".format(
    bucket=ENV["s3_bucket"]
)

# --------------------------------------------------------------------------
# Spark configuration, assembled once and shared by every suite
# --------------------------------------------------------------------------
SPARK_CONF: dict[str, str] = {
    # --- Kubernetes runtime -------------------------------------------------
    "spark.master": f"k8s://https://kubernetes.default.svc",
    "spark.kubernetes.namespace": ENV["namespace"],
    "spark.kubernetes.container.image": ENV["spark_image"],
    "spark.kubernetes.authenticate.driver.serviceAccountName": ENV["service_account"],
    "spark.executor.instances": ENV.get("executor_instances", "2"),
    "spark.executor.memory": ENV.get("executor_memory", "2g"),
    "spark.executor.cores": ENV.get("executor_cores", "1"),
    "spark.kubernetes.executor.podNamePrefix": "nessie-test",
    # Propagate S3 credentials (Vault-synced K8s Secret) into executors too.
    "spark.kubernetes.driver.secretKeyRef.AWS_ACCESS_KEY_ID": f"{ENV['s3_secret_name']}:access-key",
    "spark.kubernetes.driver.secretKeyRef.AWS_SECRET_ACCESS_KEY": f"{ENV['s3_secret_name']}:secret-key",
    "spark.kubernetes.executor.secretKeyRef.AWS_ACCESS_KEY_ID": f"{ENV['s3_secret_name']}:access-key",
    "spark.kubernetes.executor.secretKeyRef.AWS_SECRET_ACCESS_KEY": f"{ENV['s3_secret_name']}:secret-key",
    # --- SQL extensions (Iceberg + Nessie branch DDL) -----------------------
    "spark.sql.extensions": (
        "org.apache.iceberg.spark.extensions.IcebergSparkSessionExtensions,"
        "org.projectnessie.spark.extensions.NessieSparkSessionExtensions"
    ),
    # --- Nessie catalog ------------------------------------------------------
    f"spark.sql.catalog.{CATALOG}": "org.apache.iceberg.spark.SparkCatalog",
    f"spark.sql.catalog.{CATALOG}.catalog-impl": "org.apache.iceberg.nessie.NessieCatalog",
    f"spark.sql.catalog.{CATALOG}.uri": ENV["nessie_uri"],
    f"spark.sql.catalog.{CATALOG}.ref": "main",
    f"spark.sql.catalog.{CATALOG}.authentication.type": "NONE",
    f"spark.sql.catalog.{CATALOG}.client-api-version": "2",
    # TEST-ENV ONLY: Nessie endpoint is HTTPS without a CA-signed cert.
    # Disables certificate verification AND hostname verification (no-op
    # X509ExtendedTrustManager). Remove once Vault PKI issues a proper cert.
    f"spark.sql.catalog.{CATALOG}.ssl.no-certificate-verification": "true",
    # --- Object store: NetApp StorageGRID via Iceberg native S3FileIO --------
    f"spark.sql.catalog.{CATALOG}.io-impl": "org.apache.iceberg.aws.s3.S3FileIO",
    f"spark.sql.catalog.{CATALOG}.s3.endpoint": ENV["s3_endpoint"],
    f"spark.sql.catalog.{CATALOG}.s3.path-style-access": "true",
    f"spark.sql.catalog.{CATALOG}.client.region": "us-east-1",
    f"spark.sql.catalog.{CATALOG}.warehouse": f"s3://{ENV['s3_bucket']}/warehouse",
    # --- Hygiene -------------------------------------------------------------
    "spark.sql.catalog.nessie.cache-enabled": "false",  # tests must see fresh state
    "spark.sql.session.timeZone": "UTC",
    "spark.ui.showConsoleProgress": "false",
}


def spark_submit_args(suite: str, extra: list[str] | None = None) -> list[str]:
    """Build the spark-submit argument list for one test suite."""
    args = ["/opt/spark/bin/spark-submit", "--deploy-mode", "client"]
    for key, value in SPARK_CONF.items():
        args += ["--conf", f"{key}={value}"]
    args += [
        "local:///opt/lakehouse/jobs/spark_nessie_test_suite.py",
        "--suite", suite,
        "--catalog", CATALOG,
        "--branch", TEST_BRANCH,
        "--s3-prefix", TEST_S3_PREFIX,
    ]
    return args + (extra or [])


def test_pod(task_id: str, suite: str, **kwargs) -> KubernetesPodOperator:
    """Factory for a uniform, production-configured Spark test pod."""
    return KubernetesPodOperator(
        task_id=task_id,
        name=f"nessie-test-{suite.replace('_', '-')}",
        namespace=ENV["namespace"],
        image=ENV["spark_image"],
        service_account_name=ENV["service_account"],
        cmds=spark_submit_args(suite),
        env_from=[
            k8s.V1EnvFromSource(
                secret_ref=k8s.V1SecretEnvSource(name=ENV["s3_secret_name"])
            )
        ],
        container_resources=k8s.V1ResourceRequirements(
            requests={"cpu": "1", "memory": "2Gi"},
            limits={"cpu": "2", "memory": "4Gi"},
        ),
        startup_timeout_seconds=300,
        get_logs=True,
        log_events_on_failure=True,
        on_finish_action="delete_pod",
        do_xcom_push=False,
        **kwargs,
    )


# --------------------------------------------------------------------------
# DAG definition
# --------------------------------------------------------------------------
with DAG(
    dag_id=DAG_ID,
    description="Spark+Iceberg+Nessie integration test suite on StorageGRID",
    start_date=datetime(2026, 6, 1),
    schedule="0 5 * * 1-5",          # weekday mornings; also triggered by CI
    catchup=False,
    max_active_runs=1,
    dagrun_timeout=timedelta(hours=2),
    default_args={
        "owner": "data-platform",
        "retries": 2,
        "retry_delay": timedelta(minutes=3),
        "retry_exponential_backoff": True,
        "execution_timeout": timedelta(minutes=30),
    },
    tags=["lakehouse", "nessie", "iceberg", "integration-tests"],
    doc_md=__doc__,
) as dag:

    # ---- Phase 1: preflight + isolated branch ------------------------------
    preflight = test_pod(
        task_id="preflight_connectivity",
        suite="preflight",          # Nessie API reachable, S3 HeadBucket OK
        retries=3,
    )

    create_branch = test_pod(
        task_id="create_test_branch",
        suite="create_branch",      # CREATE BRANCH <test_branch> IN nessie FROM main
    )

    # ---- Phase 2: test suites ----------------------------------------------
    with TaskGroup(group_id="test_suites") as suites:
        smoke = test_pod(task_id="smoke_ddl", suite="smoke_ddl")
        write_read = test_pod(task_id="write_read_roundtrip", suite="write_read")
        schema_evolution = test_pod(task_id="schema_evolution", suite="schema_evolution")
        branch_isolation = test_pod(task_id="branch_isolation", suite="branch_isolation")
        time_travel = test_pod(task_id="time_travel", suite="time_travel")

        smoke >> write_read >> [schema_evolution, branch_isolation, time_travel]

    # ---- Phase 3: teardown (always runs) ------------------------------------
    cleanup = test_pod(
        task_id="cleanup_branch_and_data",
        suite="cleanup",            # DROP BRANCH + delete S3 run prefix
        trigger_rule=TriggerRule.ALL_DONE,
        retries=3,
    )

    done = EmptyOperator(task_id="done", trigger_rule=TriggerRule.NONE_FAILED)

    preflight >> create_branch >> suites >> cleanup >> done
