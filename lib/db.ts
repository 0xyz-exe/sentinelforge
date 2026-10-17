import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';

const dataDir = join(process.cwd(), 'data');
mkdirSync(dataDir, { recursive: true });

const dbPath = join(dataDir, 'sentinelforge.db');
const db = new Database(dbPath);

// Schema migration
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    repo_path TEXT,
    base_url TEXT,
    environment TEXT DEFAULT 'development',
    owner TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    scanner TEXT NOT NULL,
    scanner_ver TEXT,
    status TEXT DEFAULT 'pending',
    started_at INTEGER NOT NULL,
    completed_at INTEGER,
    exit_code INTEGER,
    config TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS findings (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    scan_id TEXT NOT NULL,
    scanner TEXT NOT NULL,
    rule_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL,
    confidence TEXT DEFAULT 'medium',
    cwe TEXT,
    file_path TEXT,
    line_number INTEGER,
    evidence TEXT,
    remediation TEXT,
    status TEXT DEFAULT 'open',
    first_seen INTEGER NOT NULL,
    last_seen INTEGER NOT NULL,
    resolved_at INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_scans_project ON scans(project_id);
  CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
  CREATE INDEX IF NOT EXISTS idx_findings_project ON findings(project_id);
  CREATE INDEX IF NOT EXISTS idx_findings_scan ON findings(scan_id);
  CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
  CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings(severity);
`);

export default db;
