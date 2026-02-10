-- ============================================
-- Create all databases
-- ============================================

-- Polaris catalog database
CREATE DATABASE polaris_db;

-- Hive Metastore database
CREATE DATABASE metastore_db;

-- Gravitino metadata database
CREATE DATABASE gravitino_db;

-- Grant permissions to postgres user (for initialization)
GRANT ALL PRIVILEGES ON DATABASE polaris_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE metastore_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE gravitino_db TO postgres;
