-- ============================================
-- CONSOLIDATED DATABASE INITIALIZATION
-- PostgreSQL instance for Polaris, HMS, Gravitino
-- ============================================

-- ============================================
-- 1. CREATE DATABASES
-- ============================================

CREATE DATABASE polaris_db;
CREATE DATABASE metastore_db;
CREATE DATABASE gravitino_db;

-- ============================================
-- 2. CREATE USERS
-- ============================================

CREATE USER polaris WITH PASSWORD 'polaris123';
CREATE USER hive WITH PASSWORD 'hive123';
CREATE USER gravitino WITH PASSWORD 'gravitino123';

-- ============================================
-- 3. GRANT DATABASE PERMISSIONS
-- ============================================

GRANT ALL PRIVILEGES ON DATABASE polaris_db TO polaris;
GRANT ALL PRIVILEGES ON DATABASE metastore_db TO hive;
GRANT ALL PRIVILEGES ON DATABASE gravitino_db TO gravitino;

-- ============================================
-- 4. INITIALIZE POLARIS DATABASE
-- ============================================

\c polaris_db;
GRANT ALL ON SCHEMA public TO polaris;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO polaris;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO polaris;

-- ============================================
-- 5. INITIALIZE HMS DATABASE
-- ============================================

\c metastore_db;
GRANT ALL ON SCHEMA public TO hive;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO hive;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO hive;
ALTER DATABASE metastore_db OWNER TO hive;

-- ============================================
-- 6. INITIALIZE GRAVITINO DATABASE
-- ============================================

\c gravitino_db;
GRANT ALL ON SCHEMA public TO gravitino;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO gravitino;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO gravitino;
ALTER DATABASE gravitino_db OWNER TO gravitino;

-- ============================================
-- 7. VERIFICATION
-- ============================================

\c postgres;

SELECT 
    datname as database,
    pg_catalog.pg_get_userbyid(datdba) as owner,
    pg_encoding_to_char(encoding) as encoding
FROM pg_database
WHERE datname IN ('polaris_db', 'metastore_db', 'gravitino_db');

-- Done!
```

---

## Directory Structure

Your PoC directory should look like this:
```
poc-iceberg-migration/
├── docker-compose.yml
├── init-scripts/
│   └── init-all.sql                    # Single consolidated script
├── polaris-server.yml                   # Polaris configuration
├── hive-site.xml                        # HMS configuration
├── core-site.xml                        # Hadoop S3 configuration
├── gravitino.conf                       # Gravitino configuration
├── spark-defaults.conf                  # Spark configuration
├── spark-jars/                          # Additional Spark JARs
│   ├── iceberg-spark-runtime-3.5_2.12-1.5.0.jar
│   ├── gravitino-spark-connector-runtime-3.5_2.12-0.6.0.jar
│   └── aws-java-sdk-bundle-1.12.262.jar
├── scripts/                             # Demo scripts
│   ├── 01-setup-gravitino.sh
│   ├── 02-create-hms-tables.py
│   ├── 03-create-iceberg-tables.py
│   ├── 04-demo-queries.py
│   └── 05-show-audit-logs.sh
└── notebooks/                           # Jupyter notebooks
    ├── 01-Gravitino-Setup.ipynb
    ├── 02-HMS-Migration.ipynb
    └── 03-Iceberg-Features.ipynb
