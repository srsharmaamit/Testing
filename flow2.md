```mermaid
flowchart TB
  %% =======================
  %% Actors / Use-cases
  %% =======================
  subgraph UC[Use cases]
    UC1[Legacy Hive queries\n-read existing tables]
    UC2[Legacy Hive writes\n-optional, usually constrained]
    UC3[New ingestion\n-Spark/Flink]
    UC4[Interactive queries\n-Trino/Spark SQL-]
    UC5[Dev/UAT isolation\n-branches / environments-]
    UC6[Governance & audit\n-RBAC, policies, logs-]
  end

  %% =======================
  %% Compute engines
  %% =======================
  subgraph CE[Compute Engines]
    HIVE[Hive]
    SPARK[Spark]
    TRINO[Trino]
    FLINK[Flink]
  end

  %% =======================
  %% Catalog options
  %% =======================
  subgraph CAT[Catalog / Metastore Layer (choose 1 or combine)]
    HMS[(Hive Metastore)]
    NESSIE[(Nessie Catalog)]
    POLARIS[(Polaris REST Catalog)]
  end

  %% =======================
  %% Governance / UI (optional but common)
  %% =======================
  subgraph GOV[Governance & UI Layer]
    AUTHZ[AuthZ/Policy Engine\n(Ranger/OpenFGA/custom)]
    IAM[AuthN/IAM\n(OIDC/LDAP/Kerberos)]
    AUDIT[Audit Logs\n(SIEM/ELK/Splunk)]
    UI[Metadata UI\n(DataHub/OpenMetadata)]
  end

  %% =======================
  %% Storage
  %% =======================
  subgraph STOR[Storage]
    OBJ[(S3-Compatible Object Store\n(ECS/NetApp/MinIO/etc.))]
    WH[(Warehouse path\n(Iceberg data+metadata files))]
  end

  %% =======================
  %% Core relationships
  %% =======================
  UC1 --> HIVE
  UC2 --> HIVE
  UC3 --> SPARK
  UC3 --> FLINK
  UC4 --> TRINO
  UC4 --> SPARK
  UC5 --> NESSIE
  UC5 --> POLARIS
  UC6 --> GOV

  %% Engines to catalogs (possible integrations)
  HIVE --> HMS
  HIVE -. "possible/depends on distro\n(often constrained)" .-> POLARIS
  HIVE -. "possible via Iceberg+Nessie\n(verify your Hive version)" .-> NESSIE

  SPARK --> POLARIS
  SPARK --> NESSIE
  SPARK --> HMS

  TRINO --> POLARIS
  TRINO --> NESSIE
  TRINO --> HMS

  FLINK --> POLARIS
  FLINK --> NESSIE
  FLINK --> HMS

  %% Catalogs to storage
  HMS --> WH
  NESSIE --> WH
  POLARIS --> WH
  WH --> OBJ

  %% Governance wiring
  IAM --> CE
  AUTHZ --> CE
  AUTHZ --> CAT
  CAT --> AUDIT
  CE --> AUDIT
  UI --> CAT
  UI --> AUDIT

  %% =======================
  %% What you should provide (inputs)
  %% =======================
  subgraph INPUTS[Inputs you should provide for final design]
    I1[Engine matrix:\nHive/Spark/Trino/Flink + versions]
    I2[Iceberg features needed:\nv1/v2, MERGE, deletes, time travel]
    I3[Tenancy model:\nnamespace-per-tenant, catalog-per-tenant,\nbranching required?]
    I4[Security:\nAuthN, AuthZ, audit retention, TLS, Vault/KMS]
    I5[Ops:\nHA, backup/DR, upgrades, observability]
    I6[Migration plan:\ndual run, cutover, table wave plan]
  end

  INPUTS --> CAT
  INPUTS --> GOV
  INPUTS --> CE
  INPUTS --> STOR

```
