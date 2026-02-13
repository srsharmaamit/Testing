```mermaid
sequenceDiagram
  participant Spark
  participant Catalog
  participant ObjectStore

  Spark->>Catalog: Resolve "finance.customer"
  Catalog-->>Spark: metadata-v7.json location

  Spark->>ObjectStore: Write new data files
  Spark->>ObjectStore: Write new manifest file
  Spark->>ObjectStore: Write metadata-v8.json

  Spark->>Catalog: Update pointer to metadata-v8.json
  Catalog-->>Spark: Commit success

```
