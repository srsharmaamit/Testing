mindmap
  root((Iceberg Catalog Migration: Use Cases & What to Provide))
    Goals
      Replace HMS for container platform
      Keep legacy Hadoop/Hive working (if required)
      Enable new ingestion on latest Iceberg
      Multi-tenant isolation
      Governance & audit
    Use cases
      Legacy workloads
        Hive reads existing tables
        Hive writes (limited) if required
        Existing tools depending on HMS APIs
      Modern workloads
        Spark ingestion & batch ETL
        Trino interactive SQL
        Flink streaming ingestion
        Cross-engine consistency
      Data lifecycle
        Schema evolution
        Partition evolution
        Compaction
        Expire snapshots
        Time travel reads
        Backup/DR
      Governance
        RBAC
        Audit logs
        Encryption/TLS
        PII handling
        Data discovery (optional)
      Dev/Test isolation
        Branching catalogs
        Dev/UAT/Prod separation
        Rollback of metadata changes
    Components
      Hive Metastore (HMS)
        Strengths
          Widely supported
          Fits Hive-first environments
        Limitations
          Not version-control oriented
          Governance usually external
      Nessie
        Best for
          Branching
          Tags/commits
          Multi-table atomic commits
          Dev/UAT isolation workflows
        Needs
          Separate enterprise RBAC layer
          External UI/governance if required
      Polaris (REST Catalog)
        Best for
          API-first catalog
          Central control plane for engines
          Authorization/policy model
          HMS replacement direction for modern stacks
        Needs
          External UI for discovery/lineage (DataHub/OpenMetadata)
    Decision drivers (What you should provide)
      Engines to support day-1
        Hive?
        Spark? version
        Trino? version
        Flink? version
      Table features needed
        v1 only?
        v2 features (MERGE, row-level deletes)?
        Equality deletes?
      Isolation requirements
        Namespace-per-tenant?
        Catalog-per-tenant?
        Branching required?
      Security requirements
        AuthN (OIDC/LDAP/Kerberos)
        AuthZ model (RBAC/ABAC)
        Audit retention
        Key management/Vault
      Operations
        HA requirements
        Backup strategy (metastore/catalog db)
        Upgrade strategy
        Observability (metrics/logs/traces)
      Migration strategy
        Which databases/tables move first
        Dual-catalog period?
        Cutover approach
