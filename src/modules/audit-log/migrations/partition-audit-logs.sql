-- This script transforms the existing audit_logs table into a partitioned table.
-- WARNING: Ensure you have backed up the database before running this script in production.

BEGIN;

-- 1. Rename the existing table
ALTER TABLE audit_logs RENAME TO audit_logs_old;

-- 2. Create the partitioned table with the exact same schema
CREATE TABLE audit_logs (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    correlation_id uuid,
    session_id uuid,
    organization_id uuid,
    branch_id uuid,
    user_id character varying(100),
    role_id uuid,
    action character varying NOT NULL,
    entity_name character varying(100) NOT NULL,
    entity_id uuid NOT NULL,
    version_number integer NOT NULL DEFAULT 1,
    status integer,
    duration integer,
    severity character varying NOT NULL DEFAULT 'INFO',
    reason character varying(255),
    changed_fields jsonb,
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(45),
    browser character varying(100),
    os character varying(100),
    device character varying(100),
    source character varying(50),
    endpoint character varying(255),
    method character varying(10),
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id, created_at) -- PostgreSQL requires the partition key to be part of the primary key
) PARTITION BY RANGE (created_at);

-- 3. Create partitions for the current and next few months
CREATE TABLE audit_logs_y2026m07 PARTITION OF audit_logs FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE audit_logs_y2026m08 PARTITION OF audit_logs FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE audit_logs_y2026m09 PARTITION OF audit_logs FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE audit_logs_y2026m10 PARTITION OF audit_logs FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE audit_logs_y2026m11 PARTITION OF audit_logs FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE audit_logs_y2026m12 PARTITION OF audit_logs FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- Default partition for anything else (optional, but good for migrating old data if older than 2026-07)
CREATE TABLE audit_logs_default PARTITION OF audit_logs DEFAULT;

-- 4. Move data from the old table
INSERT INTO audit_logs SELECT * FROM audit_logs_old;

-- 5. Create Indexes for efficient querying
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_name, entity_id);
CREATE INDEX idx_audit_logs_correlation ON audit_logs (correlation_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);

-- 6. Drop the old table
DROP TABLE audit_logs_old;

COMMIT;
