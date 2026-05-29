import { useState, useMemo } from "react";

const EPICS = [
  { id:"E01", name:"Core Catalog Operations", color:"#22d3ee" },
  { id:"E02", name:"Version Control Semantics", color:"#a78bfa" },
  { id:"E03", name:"Branch Isolation & Governance", color:"#34d399" },
  { id:"E04", name:"Merge, Conflict & Cherry-pick", color:"#f97316" },
  { id:"E05", name:"Optimistic Concurrency", color:"#fb7185" },
  { id:"E06", name:"Time Travel & Reproducibility", color:"#fbbf24" },
  { id:"E07", name:"Enterprise Infrastructure & HA", color:"#60a5fa" },
  { id:"E08", name:"Disaster Recovery & Durability", color:"#f43f5e" },
  { id:"E09", name:"Performance & Scale", color:"#4ade80" },
  { id:"E10", name:"Observability & Operations", color:"#e879f9" },
  { id:"E11", name:"Iceberg Data Plane", color:"#38bdf8" },
  { id:"E12", name:"Multi-Engine Interoperability", color:"#fb923c" },
  { id:"E13", name:"Garbage Collection & Lifecycle", color:"#a3e635" },
  { id:"E14", name:"Error Handling & API Contract", color:"#94a3b8" },
];

const STORIES = [
  // E01
  { id:"US-001", epic:"E01", title:"Namespace lifecycle management",
    story:"As a data platform engineer, I want to create, list, and delete namespaces via the Nessie REST API, so that I can organise Iceberg tables into versioned business domains.",
    ac:["Namespace created via REST commit operation","Nested namespaces supported (e.g. sales.emea.transactions)","Namespace properties are settable and retrievable","Deleting a non-empty namespace fails with a descriptive error","Deletion is recorded in the branch commit log"],
    priority:"High", points:3 },
  { id:"US-002", epic:"E01", title:"Table metadata registration and listing",
    story:"As a data engineer, I want to register and list Iceberg table metadata entries in Nessie, so that all table definitions are centrally catalogued and versioned.",
    ac:["Table entry committed to a branch is retrievable by key","Listing entries on a branch returns all registered tables and namespaces","Entries carry a stable content ID independent of the table name","Pagination works correctly when entries exceed page size"],
    priority:"Critical", points:5 },
  { id:"US-003", epic:"E01", title:"Content ID stability across table rename",
    story:"As a data lineage engineer, I want a table's content ID to remain unchanged when the table is renamed, so that lineage pipelines don't break on schema refactoring.",
    ac:["Content ID before rename equals content ID after rename","Old key returns 404 after rename","New key resolves to the original content","Rename is recorded as a single commit"],
    priority:"High", points:3 },

  // E02
  { id:"US-004", epic:"E02", title:"Branch lifecycle management",
    story:"As a data platform engineer, I want to create, list, assign, and safely delete branches, so that I can manage isolated workspaces for concurrent teams.",
    ac:["Branch created from main tip or a specific commit hash","Branch list includes all created refs with their current hashes","Safe delete: requires passing the current expected hash","Deleting a non-existent branch returns 404","Branch can be reset (assigned) to a different hash"],
    priority:"Critical", points:3 },
  { id:"US-005", epic:"E02", title:"Immutable tag management",
    story:"As a release manager, I want to create immutable tags on commits so that production dataset versions are permanently labelled and never drift.",
    ac:["Tag created from a branch tip or hash","Tags appear in the reference listing","Tag deletion requires the expected hash","Reading from a tag always returns the tagged commit state"],
    priority:"High", points:2 },
  { id:"US-006", epic:"E02", title:"Full commit history and metadata",
    story:"As an auditor, I want to view the full commit log for any branch including author, timestamp, and message, so that every data change is fully traceable.",
    ac:["History API returns paginated log entries for any reference","Each entry includes: commit hash, author, timestamp, commit message","History supports max-records and page-token parameters","Log is correct even on branches with 500+ commits"],
    priority:"High", points:3 },
  { id:"US-007", epic:"E02", title:"Diff between any two references",
    story:"As a data engineer, I want to diff two references (branch vs. main, hash vs. tag) so that I can audit exactly what changed before a merge.",
    ac:["Diff reports added, modified, and removed content entries","Works between branch tips, specific hashes, and tags","Result is paginated for large diffs","Empty diff correctly reported when references are identical"],
    priority:"Medium", points:3 },

  // E03
  { id:"US-008", epic:"E03", title:"Write isolation — branch changes invisible on main",
    story:"As a data platform engineer, I want changes committed to a feature branch to be completely invisible on main until an explicit merge, so that production pipelines never see partial or experimental data.",
    ac:["Namespace/table created on branch B is absent from main's entry list","Multiple concurrent branches coexist without cross-contamination","Branch history is independent of main history","Isolation holds under concurrent writers on different branches"],
    priority:"Critical", points:5 },
  { id:"US-009", epic:"E03", title:"Atomic multi-table change via branch-merge",
    story:"As a data pipeline developer, I want to commit changes to multiple tables on a branch and merge them to main atomically, so that downstream consumers never observe a partial state.",
    ac:["N tables updated on a branch all land on main in one catalog transaction","Downstream sees either all N changes or none","Commit log records the merge as a single entry","Atomic guarantee holds even if a merge races with another writer"],
    priority:"Critical", points:8 },
  { id:"US-010", epic:"E03", title:"Schema evolution isolated on branch",
    story:"As a data engineer, I want schema changes (column add/rename/drop) to be applied and validated on a branch before promotion to main, so that production table schemas are never broken by untested changes.",
    ac:["Column added on branch is absent from main schema","Merge propagates schema change atomically","Historical snapshots remain readable under the original schema","Supports: add column, rename column, drop column, type promotion"],
    priority:"High", points:5 },

  // E04
  { id:"US-011", epic:"E04", title:"Clean merge — fast-forward and standard",
    story:"As a data platform engineer, I want to merge a feature branch into main when there are no conflicts, so that validated changes are promoted without manual intervention.",
    ac:["Merge succeeds for a branch with no key conflicts on main","Both fast-forward and keep-individual-commits modes tested","Resultant target hash returned in merge response","Merged entries visible in main's commit log"],
    priority:"Critical", points:5 },
  { id:"US-012", epic:"E04", title:"Conflict detection prevents silent data corruption",
    story:"As a data governance engineer, I want conflicting merges to be rejected with a structured error, so that concurrent writers cannot silently overwrite each other's changes.",
    ac:["Merging branches that update the same key returns HTTP 409","Conflict response identifies the conflicting content keys","Dry-run merge surfaces conflicts without mutating state","FORCE and DROP merge modes are tested and documented"],
    priority:"Critical", points:8 },
  { id:"US-013", epic:"E04", title:"Cherry-pick individual commits (transplant)",
    story:"As a release manager, I want to cherry-pick specific commits from a branch onto another, so that hotfixes can be selectively promoted without pulling in unfinished work.",
    ac:["Transplant applies selected commit hashes to target branch","Non-conflicting transplant succeeds and appears in target history","Source branch is unchanged after transplant","Conflicting transplant returns a structured error"],
    priority:"Medium", points:3 },

  // E05
  { id:"US-014", epic:"E05", title:"Stale-hash commit rejection (lost-update prevention)",
    story:"As a pipeline developer, I want commits using a stale expected hash to be rejected with HTTP 409, so that lost-update anomalies are structurally impossible.",
    ac:["Commit with out-of-date expected hash returns 409","Error body identifies the current hash so client can refresh and retry","Concurrent writers on the same branch: exactly one succeeds per round","Retry with fresh hash succeeds"],
    priority:"Critical", points:5 },
  { id:"US-015", epic:"E05", title:"Consistent read isolation under concurrent writes",
    story:"As an analytics engineer, I want catalog reads to always return a consistent snapshot, so that queries never observe a torn or partially-written state.",
    ac:["Read at a specific hash returns exactly the state at that commit","Entry listing never returns a partial commit","Consistent even when concurrent writes are in flight"],
    priority:"Critical", points:3 },

  // E06
  { id:"US-016", epic:"E06", title:"Hash-based point-in-time catalog read",
    story:"As a data engineer, I want to read the catalog state at any earlier commit hash, so that I can reproduce any historical pipeline run exactly.",
    ac:["GET entries at ref@hash returns state at that exact commit","Tables added after the hash are invisible","Tables deleted after the hash are visible (they existed then)","Works on branches and tags"],
    priority:"High", points:3 },
  { id:"US-017", epic:"E06", title:"Tag-pinned reproducible snapshot",
    story:"As a data science team, I want to create a tag at a known-good state and read from it reproducibly, so that ML training pipelines have a fully stable input.",
    ac:["Tag created at a hash is unaffected by subsequent commits","All readers of the same tag see identical catalog state","Tags survive server restarts (when using a persistent backend)","Multiple tags coexist independently"],
    priority:"High", points:3 },
  { id:"US-018", epic:"E06", title:"Timestamp-based reference read",
    story:"As a platform engineer, I want to query the catalog as-of a timestamp so that I can reconstruct any historical state without manually tracking commit hashes.",
    ac:["Ref spec with ISO-8601 timestamp returns closest commit at or before that time","Correctly handles timezone and DST boundaries","Works for both branches and tags"],
    priority:"Medium", points:3 },

  // E07
  { id:"US-019", epic:"E07", title:"High-availability multi-instance deployment",
    story:"As an infrastructure engineer, I want to run multiple Nessie instances behind a load balancer with a shared persistent backend, so that catalog service survives individual instance failures.",
    ac:["Two instances sharing JDBC/Cassandra backend serve consistent reads and writes","Killing one instance does not cause errors on the load balancer","No data inconsistency or duplicate entries under failover","Client retries are sufficient to absorb an instance restart"],
    priority:"Critical", points:13 },
  { id:"US-020", epic:"E07", title:"Kubernetes Helm chart deployment",
    story:"As a DevOps engineer, I want to deploy Nessie via the official Helm chart meeting enterprise K8s standards, so that the deployment is repeatable, auditable, and production-safe.",
    ac:["Helm chart deploys to a standard namespace without cluster-admin","Readiness and liveness probes configured and passing","Resource requests/limits set on all containers","PodDisruptionBudget applied for HA","Secrets managed via K8s Secret or external secrets operator"],
    priority:"High", points:8 },
  { id:"US-021", epic:"E07", title:"Zero-downtime rolling upgrade",
    story:"As an infrastructure engineer, I want to upgrade Nessie to a new patch/minor version with zero downtime, so that data pipelines are never interrupted during maintenance.",
    ac:["Rolling update completes with no 5xx on the LB during rollout","Catalog state is identical before and after upgrade","Rollback to previous version is clean","Zero uncommitted transactions lost"],
    priority:"High", points:13 },
  { id:"US-022", epic:"E07", title:"PostgreSQL persistent backend validation",
    story:"As a data platform engineer, I want Nessie to use PostgreSQL (JDBC2) as its persistent backend, so that catalog state is durable and survives all restarts and upgrades.",
    ac:["All refs, commits, and content survive a server restart","JDBC2 store type configured; schema auto-created on first start","Connection pooling configured (min/max connections)","Write throughput meets baseline SLO under JDBC2"],
    priority:"Critical", points:8 },
  { id:"US-023", epic:"E07", title:"Alternative cloud-native backends (Cassandra / DynamoDB / MongoDB)",
    story:"As a cloud infrastructure engineer, I want to validate Nessie with cloud-native backends in our stack, so that we are not locked into PostgreSQL.",
    ac:["At least one cloud-native backend passes the full REST validation suite","State survives restart with the chosen backend","Performance within acceptable bounds vs. JDBC2","Documented configuration for each backend variant"],
    priority:"Medium", points:8 },
  { id:"US-024", epic:"E07", title:"Health check and readiness endpoint validation",
    story:"As an SRE, I want Nessie's health endpoints to accurately reflect service status, so that orchestration and monitoring systems can trust them.",
    ac:["/q/health/ready returns 200 only when catalog is fully operational","/q/health/live returns 200 once the JVM is running","Health degrades gracefully when the backend is unreachable","Management port (9000) separates health traffic from data path (19120)"],
    priority:"High", points:3 },

  // E08
  { id:"US-025", epic:"E08", title:"Repository export and import round-trip",
    story:"As a platform engineer, I want to export the full Nessie repository and import it into a fresh instance, so that disaster recovery procedures are tested and proven.",
    ac:["Export via nessie-server-admin produces a complete, portable archive","Import recreates all references and commit hashes exactly","Spot-check of entries and content on all key branches confirms parity","Export/import documented as a step-by-step runbook"],
    priority:"High", points:8 },
  { id:"US-026", epic:"E08", title:"Data integrity after backend failover",
    story:"As an SRE, I want the catalog to remain fully consistent after a primary-to-replica database failover, so that no commits are lost or corrupted in a DR event.",
    ac:["A failover is performed while writes are in-flight","All committed entries before failover are present after","No duplicate or ghost entries after failover","Uncommitted writes at failover moment are cleanly rejected or retried"],
    priority:"High", points:8 },
  { id:"US-027", epic:"E08", title:"Storage backend migration without data loss",
    story:"As a platform architect, I want to migrate Nessie from one backend to another (e.g. JDBC2 → Cassandra) without data loss, so that we can evolve infrastructure without a hard cutover.",
    ac:["Export from source, import to target completes cleanly","All reference names and commit hashes match post-migration","Documented migration runbook with rollback steps"],
    priority:"Medium", points:8 },

  // E09
  { id:"US-028", epic:"E09", title:"Catalog scale — 1,000+ tables and 100+ namespaces",
    story:"As a data platform engineer, I want Nessie to handle a large catalog without performance degradation, so that it can sustain long-term lakehouse growth.",
    ac:["All 1,000+ entries retrievable via pagination with no gaps or duplicates","Entry list p99 latency under 500ms per page","Creating additional tables does not measurably degrade read latency","Single namespace with 100+ tables lists correctly"],
    priority:"High", points:8 },
  { id:"US-029", epic:"E09", title:"Concurrent write throughput",
    story:"As a data engineering team, I want multiple pipelines writing to different branches simultaneously without interference, so that our parallel ingestion architecture is validated.",
    ac:["10 concurrent pipelines each committing to their own branch all succeed","Concurrent commits to same branch: retry loop converges within 3 retries","No deadlock, timeout, or data loss observed","Throughput documented at concurrency levels: 5, 10, 20 clients"],
    priority:"High", points:8 },
  { id:"US-030", epic:"E09", title:"Paginated listing correctness at scale",
    story:"As a platform engineer, I want paginated listing of entries and references to be complete and stable, so that tooling never misses catalog entries.",
    ac:["All entries returned across pages with no gaps or duplicates","Cursor-based pagination is stable even if writes occur mid-iteration","Pagination works for both entries and references"],
    priority:"High", points:5 },
  { id:"US-031", epic:"E09", title:"Deep commit history performance",
    story:"As an auditor, I want commit history retrieval to be fast even on deep branches, so that audit queries are practical in production.",
    ac:["Fetching latest 50 commits from a 500-commit branch: under 2s","Full history pagination completes without timeout","Performance does not degrade significantly at 1,000+ commits"],
    priority:"Medium", points:5 },
  { id:"US-032", epic:"E09", title:"Large single-commit bulk operations",
    story:"As a batch migration engineer, I want to issue a single commit with 100+ operations, so that bulk catalog migrations are atomic and performant.",
    ac:["Commit with 100 PUT namespace operations succeeds","Response time under 5s for 100-operation commit","Commit appears as a single entry in the log","Large commit is correct on replay from history"],
    priority:"Medium", points:3 },

  // E10
  { id:"US-033", epic:"E10", title:"Prometheus metrics integration",
    story:"As an SRE, I want Nessie to expose Prometheus-compatible metrics so that I can monitor latency, error rates, and throughput in Grafana.",
    ac:["/q/metrics returns Prometheus text-format metrics","Key metrics present: request count, error count, p50/p99 latency histograms","Metrics are accurate under synthetic load","Custom dimensional labels configurable via nessie.metrics.tags.*"],
    priority:"High", points:5 },
  { id:"US-034", epic:"E10", title:"Structured audit logging",
    story:"As a compliance officer, I want all write operations captured in structured logs so that I can answer 'who changed what, when?' for any table at any time.",
    ac:["Author, timestamp, branch, message logged for every commit","Logs are structured JSON, machine-parseable","Log volume is manageable (no per-row logging)","Logs can be shipped to enterprise SIEM without loss"],
    priority:"High", points:3 },
  { id:"US-035", epic:"E10", title:"Alerting on catalog degradation",
    story:"As an SRE, I want monitoring alerts to fire when the catalog is degraded, so that on-call engineers are notified before pipelines are impacted.",
    ac:["Alert fires when Nessie API error rate exceeds threshold for 5m","Alert fires when health endpoint returns non-200","Alert fires when p99 latency exceeds SLO","Integration with Alertmanager / PagerDuty documented"],
    priority:"Medium", points:5 },
  { id:"US-036", epic:"E10", title:"Operational runbook validation",
    story:"As a platform team, I want a validated runbook for all common operational tasks, so that any engineer can maintain the catalog safely.",
    ac:["Runbook covers: restart, GC run, export/import, branch cleanup, version upgrade","Each step tested against the live system","Runbook includes rollback instructions","Available in the team's internal wiki"],
    priority:"Medium", points:5 },

  // E11
  { id:"US-037", epic:"E11", title:"Iceberg table CRUD via Nessie Iceberg REST",
    story:"As a data engineer, I want to create, load, and drop Iceberg tables through Nessie's Iceberg REST endpoint, so that any Iceberg-compatible engine can manage tables via our catalog.",
    ac:["Table created via Iceberg REST is visible as a Nessie commit","Metadata location resolves to the configured warehouse","Table loadable from any Iceberg-compatible client","Purge drop removes both catalog entry and data files"],
    priority:"Critical", points:8 },
  { id:"US-038", epic:"E11", title:"Schema evolution via Nessie branch workflow",
    story:"As a data engineer, I want to evolve Iceberg table schemas (add/rename/drop columns) on a branch and merge them, so that schema changes go through the same validation workflow as data changes.",
    ac:["Add column on branch is invisible on main","Merge propagates schema change atomically to main","Historical snapshots readable under original schema after evolution","Type promotion follows Iceberg spec (widening only)"],
    priority:"High", points:8 },
  { id:"US-039", epic:"E11", title:"Partition evolution on branch",
    story:"As a data engineer, I want to change a table's partition spec on a branch, so that re-partitioning can be validated before production impact.",
    ac:["New partition spec on branch does not affect main's spec","Data written under the old spec remains readable after evolution","Merge promotes the new spec to main atomically"],
    priority:"Medium", points:5 },
  { id:"US-040", epic:"E11", title:"Snapshot expiry and Iceberg lifecycle",
    story:"As a storage engineer, I want expired Iceberg snapshots to be cleaned up by GC, so that storage costs don't grow unbounded.",
    ac:["Snapshots older than the expiry window are marked for deletion","Data files referenced only by expired snapshots are deleted","Files referenced by live branches or tags are retained","GC produces a per-table report of retained vs deleted snapshots"],
    priority:"High", points:8 },
  { id:"US-041", epic:"E11", title:"Row-level data isolation on branches",
    story:"As a data quality engineer, I want rows appended to a table on a branch to be isolated from main until merge, so that data quality checks can run before exposure.",
    ac:["Rows appended on branch are absent from main","Merge delivers rows to main atomically","Row counts before and after merge are consistent","Works for both append and overwrite operations"],
    priority:"Critical", points:8 },

  // E12
  { id:"US-042", epic:"E12", title:"Spark + Nessie NessieCatalog integration",
    story:"As a Spark developer, I want to configure Spark to use Nessie as its Iceberg catalog, so that Spark jobs can read and write versioned tables across any Nessie reference.",
    ac:["SparkCatalog + NessieCatalog configured and functional","DDL (CREATE, DROP, RENAME) on a branch is isolated from main","DML (INSERT, MERGE INTO) commits appear in Nessie history","Branch selection via spark.sql.catalog.nessie.ref works at session level"],
    priority:"Critical", points:8 },
  { id:"US-043", epic:"E12", title:"Trino / Dremio read consistency",
    story:"As an analytics engineer, I want Trino or Dremio to read Nessie-catalogued tables accurately, so that SQL analytics always see the correct version of the data.",
    ac:["Trino can query a table on a specific Nessie reference","Row counts match exactly what Spark wrote","Tables added after the queried ref are invisible","No full-table scans required to resolve the catalog entry"],
    priority:"High", points:8 },
  { id:"US-044", epic:"E12", title:"Flink streaming integration",
    story:"As a stream processing engineer, I want Flink to read and write Iceberg tables through Nessie, so that streaming pipelines participate in the versioned catalog.",
    ac:["Flink can write to an Iceberg table on a Nessie branch","Commits appear in Nessie history with correct metadata","Merge promotes streaming-written data to main","Flink checkpointing works correctly with Nessie-backed catalog"],
    priority:"Medium", points:8 },
  { id:"US-045", epic:"E12", title:"pyiceberg REST catalog client compatibility",
    story:"As a data scientist, I want to use pyiceberg pointed at Nessie's Iceberg REST endpoint without Spark, so that Python-based ML pipelines can read production tables directly.",
    ac:["pyiceberg RestCatalog loads tables by reference/prefix","Data read via pyiceberg matches data written by Spark","Schema correctly reflected in pyiceberg's Table object","pyarrow scan returns correct DataFrame"],
    priority:"High", points:5 },
  { id:"US-046", epic:"E12", title:"Cross-engine snapshot consistency",
    story:"As a platform architect, I want all engines to observe identical data when reading the same reference, so that there are no engine-specific inconsistencies in the lakehouse.",
    ac:["Table written by Engine A, read by Engine B: identical row count and content","All engines resolve the same metadata location for a given table+ref","Tag-pinned reads are consistent across all engines","Test covers Spark, pyiceberg, and at least one SQL engine"],
    priority:"Critical", points:8 },

  // E13
  { id:"US-047", epic:"E13", title:"GC removes orphaned data files only",
    story:"As a storage engineer, I want the Nessie GC tool to remove only unreachable data files, so that live data is never accidentally deleted.",
    ac:["GC dry-run identifies files for deletion without deleting them","Real GC run deletes only files not referenced by any live ref","Files referenced by any tag are always retained","GC output log clearly distinguishes retained from deleted files"],
    priority:"Critical", points:8 },
  { id:"US-048", epic:"E13", title:"Snapshot expiry policy enforcement",
    story:"As a data platform engineer, I want configurable snapshot expiry policies enforced by GC, so that old snapshots don't accumulate unbounded storage cost.",
    ac:["Configurable expiry window (e.g. retain 7 days of snapshots)","GC expires snapshots older than the window","Table remains readable from the tip after expiry","Per-table expiry configuration is supported"],
    priority:"High", points:5 },
  { id:"US-049", epic:"E13", title:"Stale branch and reference cleanup",
    story:"As a platform engineer, I want to identify and delete stale branches so that the reference listing stays manageable at scale.",
    ac:["Stale branches (no commits for N days) can be listed","Deleting a stale branch succeeds if no live tags reference its commits","GC can collect content from deleted refs after a configurable grace period","Branch cleanup documented in the operational runbook"],
    priority:"Medium", points:3 },

  // E14
  { id:"US-050", epic:"E14", title:"Graceful, typed error responses",
    story:"As an API consumer, I want all Nessie errors to return structured JSON so that client error handling is reliable and not dependent on message parsing.",
    ac:["404 for missing reference includes reference name in body","409 for concurrency conflict identifies the conflicting hash and key","400 for malformed request identifies the invalid field","No plain-text or HTML error bodies under any code path"],
    priority:"High", points:3 },
  { id:"US-051", epic:"E14", title:"Client retry semantics for transient failures",
    story:"As a pipeline developer, I want a documented and tested retry strategy for transient Nessie errors, so that pipelines are resilient to momentary catalog hiccups.",
    ac:["503 and 429 responses include Retry-After header where applicable","Idempotent operations (reads, lists) are safe to retry unconditionally","Commit retry with refreshed hash is documented and tested","Retry behaviour under backend restart is validated"],
    priority:"Medium", points:3 },
  { id:"US-052", epic:"E14", title:"API version negotiation and backward compatibility",
    story:"As a platform architect, I want to verify API version negotiation so that client and server upgrades can be decoupled.",
    ac:["Server advertises min and max API version in /config","v2 client with current server: all core operations work","Deprecated v1 endpoints return a deprecation header","Version negotiation documented in integration guide"],
    priority:"Medium", points:5 },
  { id:"US-053", epic:"E14", title:"Nessie CLI integration validation",
    story:"As an operator, I want to validate all catalog operations via the Nessie CLI, so that the catalog can be managed and debugged without writing code.",
    ac:["CONNECT, USE, LIST REFERENCES, CREATE BRANCH, MERGE, DROP BRANCH work via CLI","Errors exit with non-zero exit code and a clear message","CLI connects to both /api/v2 and /iceberg endpoints","CLI-based workflow is included in the operational runbook"],
    priority:"Medium", points:3 },
];

const PRIORITY_CONFIG = {
  Critical: { color:"#ef4444", bg:"rgba(239,68,68,0.15)" },
  High:     { color:"#f97316", bg:"rgba(249,115,22,0.15)" },
  Medium:   { color:"#eab308", bg:"rgba(234,179,8,0.15)" },
  Low:      { color:"#22d3ee", bg:"rgba(34,211,238,0.15)" },
};

const epicMap = Object.fromEntries(EPICS.map(e => [e.id, e]));

function Badge({ children, color, bg, size="sm" }) {
  return (
    <span style={{
      background: bg || "rgba(255,255,255,0.08)",
      color: color || "#94a3b8",
      border: `1px solid ${color || "#334155"}`,
      borderRadius:4, padding: size==="sm" ? "2px 7px":"3px 10px",
      fontSize: size==="sm"?11:12, fontWeight:600, letterSpacing:"0.04em",
      fontFamily:"'Fira Code',monospace", whiteSpace:"nowrap",
    }}>{children}</span>
  );
}

function StoryCard({ story, epic }) {
  const [open, setOpen] = useState(false);
  const pr = PRIORITY_CONFIG[story.priority] || PRIORITY_CONFIG.Medium;
  return (
    <div style={{
      background:"#141C2F", border:"1px solid #1E2D4A",
      borderLeft:`3px solid ${epic.color}`,
      borderRadius:8, padding:"14px 16px", marginBottom:10,
      transition:"box-shadow 0.2s",
    }}
    onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 0 1px ${epic.color}40`}
    onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
    >
      <div style={{ display:"flex", alignItems:"flex-start", gap:10, flexWrap:"wrap" }}>
        <span style={{ fontFamily:"'Fira Code',monospace", color:epic.color, fontSize:11, fontWeight:700, marginTop:2, whiteSpace:"nowrap" }}>{story.id}</span>
        <span style={{ flex:1, color:"#e2e8f0", fontSize:14, fontWeight:600, lineHeight:1.4 }}>{story.title}</span>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginLeft:"auto" }}>
          <Badge color={pr.color} bg={pr.bg}>{story.priority}</Badge>
          <Badge color="#64748b" bg="rgba(100,116,139,0.15)">{story.points} pt{story.points!==1?"s":""}</Badge>
        </div>
      </div>

      <p style={{ margin:"10px 0 0", color:"#94a3b8", fontSize:13, lineHeight:1.6, fontStyle:"italic" }}>
        {story.story}
      </p>

      <button onClick={()=>setOpen(!open)} style={{
        background:"none", border:"none", color:epic.color, fontSize:12,
        cursor:"pointer", padding:"8px 0 0", fontFamily:"'Fira Code',monospace",
        display:"flex", alignItems:"center", gap:4,
      }}>
        <span style={{ fontSize:10 }}>{open?"▼":"▶"}</span>
        Acceptance Criteria ({story.ac.length})
      </button>

      {open && (
        <ul style={{ margin:"8px 0 0 0", paddingLeft:0, listStyle:"none" }}>
          {story.ac.map((a,i)=>(
            <li key={i} style={{ display:"flex", gap:8, padding:"4px 0", borderTop:"1px solid #1E2D4A" }}>
              <span style={{ color:epic.color, fontSize:11, marginTop:2, flexShrink:0 }}>✓</span>
              <span style={{ color:"#cbd5e1", fontSize:12, lineHeight:1.5 }}>{a}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function exportCSV(stories) {
  const epicsSeen = new Set();
  const rows = [["Issue Type","Summary","Epic Name","Priority","Story Points","Description","Labels","Acceptance Criteria"]];
  const storyRows = [];

  stories.forEach(s => {
    const epic = epicMap[s.epic];
    if (!epicsSeen.has(s.epic)) {
      rows.push(["Epic", epic.name, epic.name, "High", "", `Nessie enterprise validation epic: ${epic.name}`, "nessie-validation", ""]);
      epicsSeen.add(s.epic);
    }
    const jiraPriority = { Critical:"Highest", High:"High", Medium:"Medium", Low:"Low" }[s.priority] || "Medium";
    const acText = s.ac.map((a,i)=>`${i+1}. ${a}`).join("\n");
    storyRows.push(["Story", s.title, epic.name, jiraPriority, s.points, s.story, `nessie-validation ${s.epic.toLowerCase()}`, acText]);
  });

  const all = [...rows, ...storyRows];
  const csv = all.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type:"text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="nessie-user-stories-jira.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function NessieUserStories() {
  const [selectedEpic, setSelectedEpic] = useState("ALL");
  const [searchQ, setSearchQ] = useState("");
  const [expandedEpics, setExpandedEpics] = useState(new Set(EPICS.map(e=>e.id)));

  const filtered = useMemo(() => STORIES.filter(s => {
    const epicOk = selectedEpic==="ALL" || s.epic===selectedEpic;
    const q = searchQ.toLowerCase();
    const textOk = !q || s.title.toLowerCase().includes(q) || s.story.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
    return epicOk && textOk;
  }), [selectedEpic, searchQ]);

  const byEpic = useMemo(() => {
    const m = {};
    EPICS.forEach(e => { m[e.id] = filtered.filter(s=>s.epic===e.id); });
    return m;
  }, [filtered]);

  const epicCounts = useMemo(()=> Object.fromEntries(EPICS.map(e=>[e.id, STORIES.filter(s=>s.epic===e.id).length])), []);
  const criticalCount = STORIES.filter(s=>s.priority==="Critical").length;
  const totalPoints = STORIES.reduce((s,x)=>s+x.points,0);

  const toggleEpic = id => {
    setExpandedEpics(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0A0F1E", fontFamily:"'IBM Plex Sans',system-ui,sans-serif", color:"#e2e8f0" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Fira+Code:wght@500;700&display=swap');
        ::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-track{background:#0A0F1E}::-webkit-scrollbar-thumb{background:#1E2D4A;border-radius:3px}`}
      </style>

      {/* Header */}
      <div style={{ background:"linear-gradient(180deg,#0F1629 0%,#0A0F1E 100%)", borderBottom:"1px solid #1E2D4A", padding:"24px 32px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
          <span style={{ fontFamily:"'Fira Code',monospace", color:"#22d3ee", fontSize:11, background:"rgba(34,211,238,0.1)", padding:"3px 10px", borderRadius:4, border:"1px solid rgba(34,211,238,0.3)" }}>ENTERPRISE VALIDATION</span>
          <span style={{ color:"#334155", fontSize:12 }}>v1.0 · Nessie as Iceberg Catalog</span>
        </div>
        <h1 style={{ margin:"6px 0 0", fontSize:26, fontWeight:600, letterSpacing:"-0.02em", color:"#f1f5f9" }}>
          Nessie User Story Map
        </h1>
        <p style={{ margin:"4px 0 0", color:"#64748b", fontSize:13 }}>
          {STORIES.length} user stories · {EPICS.length} epics · {criticalCount} critical · {totalPoints} total story points
        </p>

        {/* Stats row */}
        <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
          {Object.entries(PRIORITY_CONFIG).map(([p,cfg])=>{
            const n = STORIES.filter(s=>s.priority===p).length;
            return <div key={p} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${cfg.color}30`, borderRadius:6, padding:"6px 14px", fontSize:12 }}>
              <span style={{ color:cfg.color, fontWeight:700 }}>{n}</span>
              <span style={{ color:"#64748b", marginLeft:5 }}>{p}</span>
            </div>;
          })}
          <button onClick={()=>exportCSV(filtered)} style={{
            marginLeft:"auto", background:"rgba(34,211,238,0.1)", color:"#22d3ee",
            border:"1px solid rgba(34,211,238,0.4)", borderRadius:6, padding:"6px 16px",
            fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Fira Code',monospace",
            display:"flex", alignItems:"center", gap:6,
          }}>
            ⬇ Export Jira CSV ({filtered.length} stories)
          </button>
        </div>
      </div>

      <div style={{ display:"flex", height:"calc(100vh - 185px)", overflow:"hidden" }}>
        {/* Sidebar */}
        <div style={{ width:260, flexShrink:0, borderRight:"1px solid #1E2D4A", padding:"16px 12px", overflowY:"auto", background:"#0D1220" }}>
          <input
            value={searchQ} onChange={e=>setSearchQ(e.target.value)}
            placeholder="Search stories…"
            style={{ width:"100%", background:"#141C2F", border:"1px solid #1E2D4A", color:"#e2e8f0", borderRadius:6, padding:"8px 10px", fontSize:12, marginBottom:12, boxSizing:"border-box", outline:"none" }}
          />
          <div
            onClick={()=>setSelectedEpic("ALL")}
            style={{ padding:"8px 10px", borderRadius:6, cursor:"pointer", marginBottom:4,
              background:selectedEpic==="ALL"?"rgba(34,211,238,0.1)":"transparent",
              border:selectedEpic==="ALL"?"1px solid rgba(34,211,238,0.3)":"1px solid transparent",
              color:selectedEpic==="ALL"?"#22d3ee":"#94a3b8", fontSize:12, fontWeight:600,
              display:"flex", justifyContent:"space-between",
            }}>
            <span>All Epics</span>
            <span style={{ fontFamily:"'Fira Code',monospace", fontSize:11 }}>{filtered.length}</span>
          </div>
          {EPICS.map(epic=>(
            <div key={epic.id}
              onClick={()=>setSelectedEpic(epic.id)}
              style={{ padding:"7px 10px", borderRadius:6, cursor:"pointer", marginBottom:2,
                background:selectedEpic===epic.id?`${epic.color}18`:"transparent",
                border:selectedEpic===epic.id?`1px solid ${epic.color}40`:"1px solid transparent",
                transition:"all 0.15s",
              }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:epic.color, flexShrink:0 }} />
                  <span style={{ color:selectedEpic===epic.id?epic.color:"#94a3b8", fontSize:11.5, lineHeight:1.3 }}>{epic.name}</span>
                </div>
                <span style={{ fontFamily:"'Fira Code',monospace", fontSize:10, color:epic.color, marginLeft:6 }}>{epicCounts[epic.id]}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
          {filtered.length === 0 && (
            <div style={{ textAlign:"center", color:"#475569", padding:"60px 0" }}>
              <div style={{ fontSize:32 }}>⊘</div>
              <div style={{ marginTop:8 }}>No stories match your filter</div>
            </div>
          )}
          {EPICS.map(epic=>{
            const stories = byEpic[epic.id];
            if (!stories || stories.length===0) return null;
            const expanded = expandedEpics.has(epic.id);
            const epicPts = stories.reduce((s,x)=>s+x.points,0);
            return (
              <div key={epic.id} style={{ marginBottom:28 }}>
                <div
                  onClick={()=>toggleEpic(epic.id)}
                  style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:12, padding:"8px 0", borderBottom:`1px solid ${epic.color}30` }}
                >
                  <span style={{ color:epic.color, fontSize:10 }}>{expanded?"▼":"▶"}</span>
                  <span style={{ fontFamily:"'Fira Code',monospace", color:epic.color, fontSize:11, fontWeight:700 }}>{epic.id}</span>
                  <span style={{ color:"#e2e8f0", fontSize:15, fontWeight:600 }}>{epic.name}</span>
                  <span style={{ marginLeft:"auto", fontFamily:"'Fira Code',monospace", fontSize:11, color:"#475569" }}>
                    {stories.length} stories · {epicPts} pts
                  </span>
                </div>
                {expanded && stories.map(s=>(
                  <StoryCard key={s.id} story={s} epic={epic} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
