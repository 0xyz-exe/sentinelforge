import Database from 'better-sqlite3';
import { join } from 'path';

const dataDir = join(process.cwd(), 'data');
const dbPath = join(dataDir, 'sentinelforge.db');
const db = new Database(dbPath);

console.log('Seeding realistic security lab data into:', dbPath);

// Clear old records
db.exec(`
  DELETE FROM findings;
  DELETE FROM scans;
  DELETE FROM projects;
`);

const now = Date.now();
const oneHourAgo = now - 3600000;
const twoHoursAgo = now - 7200000;
const oneDayAgo = now - 86400000;
const twoDaysAgo = now - 172800000;

// Seed Projects
const projects = [
  {
    id: 'prj_sentinelforge_core',
    name: 'SentinelForge Core Engine',
    description: 'Central security lab orchestration engine, scanner adapters, and telemetry',
    repo_path: 'C:/Users/wondr/HermesWorkspace/sentinelforge',
    base_url: 'http://localhost:3000',
    environment: 'production',
    owner: 'SecOps Team',
    created_at: twoDaysAgo,
    updated_at: oneHourAgo,
  },
  {
    id: 'prj_finsight_ai',
    name: 'FinSight AI Financial Microservice',
    description: 'Predictive portfolio modeling engine and trading strategy execution APIs',
    repo_path: 'C:/Users/wondr/HermesWorkspace/finsight-ai',
    base_url: 'https://staging-api.finsight.internal',
    environment: 'staging',
    owner: 'Algo Engineering',
    created_at: twoDaysAgo,
    updated_at: twoHoursAgo,
  },
  {
    id: 'prj_bigmarket_pos',
    name: 'BigMarket Enterprise POS Terminal',
    description: 'Multi-store retail cashier checkout, inventory sync, and hardware POS controller',
    repo_path: 'C:/Users/wondr/HermesWorkspace/big-market-pos',
    base_url: 'https://pos-gateway.internal.lan',
    environment: 'production',
    owner: 'Retail Platform Team',
    created_at: oneDayAgo,
    updated_at: oneHourAgo,
  },
  {
    id: 'prj_crypto_intel',
    name: 'Crypto Intelligence Real-Time Hub',
    description: 'Autonomous arbitrage bot, market orderbook stream, and multi-exchange gateway',
    repo_path: 'C:/Users/wondr/HermesWorkspace/crypto-intelligence-ai',
    base_url: 'https://stream.cryptointel.internal',
    environment: 'development',
    owner: 'Trading Ops',
    created_at: oneDayAgo,
    updated_at: now - 1800000,
  }
];

const insertProject = db.prepare(`
  INSERT INTO projects (id, name, description, repo_path, base_url, environment, owner, created_at, updated_at)
  VALUES (@id, @name, @description, @repo_path, @base_url, @environment, @owner, @created_at, @updated_at)
`);

projects.forEach(p => insertProject.run(p));

// Seed Scans
const scans = [
  {
    id: 'scn_sf_audit_01',
    project_id: 'prj_sentinelforge_core',
    scanner: 'npm_audit',
    scanner_ver: '11.2.0',
    status: 'completed',
    started_at: twoHoursAgo,
    completed_at: twoHoursAgo + 14200,
    exit_code: 0,
    config: JSON.stringify({ auditLevel: 'moderate', productionOnly: false })
  },
  {
    id: 'scn_sf_semgrep_02',
    project_id: 'prj_sentinelforge_core',
    scanner: 'semgrep',
    scanner_ver: '1.98.0',
    status: 'completed',
    started_at: oneHourAgo,
    completed_at: oneHourAgo + 28500,
    exit_code: 0,
    config: JSON.stringify({ ruleset: 'p/security-audit', strict: true })
  },
  {
    id: 'scn_finsight_01',
    project_id: 'prj_finsight_ai',
    scanner: 'semgrep',
    scanner_ver: '1.98.0',
    status: 'completed',
    started_at: twoHoursAgo + 1800000,
    completed_at: twoHoursAgo + 1835000,
    exit_code: 0,
    config: JSON.stringify({ ruleset: 'p/owasp-top-ten' })
  },
  {
    id: 'scn_bigmarket_01',
    project_id: 'prj_bigmarket_pos',
    scanner: 'npm_audit',
    scanner_ver: '11.2.0',
    status: 'completed',
    started_at: oneHourAgo + 900000,
    completed_at: oneHourAgo + 922000,
    exit_code: 0,
    config: JSON.stringify({ auditLevel: 'high' })
  },
  {
    id: 'scn_crypto_01',
    project_id: 'prj_crypto_intel',
    scanner: 'gitleaks',
    scanner_ver: '8.18.2',
    status: 'completed',
    started_at: now - 3600000,
    completed_at: now - 3570000,
    exit_code: 0,
    config: JSON.stringify({ depth: 50, redact: true })
  },
  {
    id: 'scn_live_active',
    project_id: 'prj_sentinelforge_core',
    scanner: 'semgrep',
    scanner_ver: '1.98.0',
    status: 'completed',
    started_at: now - 600000,
    completed_at: now - 570000,
    exit_code: 0,
    config: JSON.stringify({ ruleset: 'p/ci-cd-security' })
  }
];

const insertScan = db.prepare(`
  INSERT INTO scans (id, project_id, scanner, scanner_ver, status, started_at, completed_at, exit_code, config)
  VALUES (@id, @project_id, @scanner, @scanner_ver, @status, @started_at, @completed_at, @exit_code, @config)
`);

scans.forEach(s => insertScan.run(s));

// Seed Findings
const findings = [
  {
    id: 'fnd_sql_inj_01',
    project_id: 'prj_sentinelforge_core',
    scan_id: 'scn_sf_semgrep_02',
    scanner: 'semgrep',
    rule_id: 'security.detect-sql-injection',
    title: 'SQL Injection in Dynamic Query Concatenation',
    description: 'Detected raw user-supplied string concatenated directly into SQL statement without parameterization or sanitization.',
    severity: 'critical',
    confidence: 'high',
    cwe: 'CWE-89',
    file_path: 'lib/db.ts',
    line_number: 42,
    evidence: 'db.prepare(`SELECT * FROM ${table} WHERE id = "${userId}"`).all()',
    remediation: 'Use parameterized queries: db.prepare("SELECT * FROM users WHERE id = ?").all(userId)',
    status: 'open',
    first_seen: twoDaysAgo,
    last_seen: oneHourAgo,
    resolved_at: null
  },
  {
    id: 'fnd_jwt_algo_02',
    project_id: 'prj_finsight_ai',
    scan_id: 'scn_finsight_01',
    scanner: 'semgrep',
    rule_id: 'auth.jwt-insecure-none-algorithm',
    title: 'Insecure JWT Signature Verification Algorithm "none"',
    description: 'JWT token verification routine allows unsigned tokens with algorithm set to none, permitting signature bypass.',
    severity: 'critical',
    confidence: 'high',
    cwe: 'CWE-347',
    file_path: 'app/api/auth/verify.ts',
    line_number: 78,
    evidence: 'jwt.verify(token, secret, { algorithms: ["HS256", "none"] })',
    remediation: 'Explicitly restrict allowed algorithms to ["HS256", "RS256"] and never accept algorithm none in verification options.',
    status: 'open',
    first_seen: twoDaysAgo,
    last_seen: twoHoursAgo,
    resolved_at: null
  },
  {
    id: 'fnd_ssrf_03',
    project_id: 'prj_finsight_ai',
    scan_id: 'scn_finsight_01',
    scanner: 'semgrep',
    rule_id: 'network.server-side-request-forgery',
    title: 'Server-Side Request Forgery (SSRF) via Webhook URL',
    description: 'External webhook URL received from user request payload is fetched directly without internal IP subnet range filtering.',
    severity: 'high',
    confidence: 'high',
    cwe: 'CWE-918',
    file_path: 'services/webhook_dispatcher.ts',
    line_number: 114,
    evidence: 'const response = await fetch(userPayload.callbackUrl, { method: "POST" })',
    remediation: 'Validate callback URLs against an explicit domain allowlist and block private RFC-1918 IPv4/IPv6 loopback addresses.',
    status: 'open',
    first_seen: oneDayAgo,
    last_seen: twoHoursAgo,
    resolved_at: null
  },
  {
    id: 'fnd_npm_glob_04',
    project_id: 'prj_sentinelforge_core',
    scan_id: 'scn_sf_audit_01',
    scanner: 'npm_audit',
    rule_id: 'GHSA-m6cv-4p6j-cr2x',
    title: 'fast-glob: Regular Expression Denial of Service (ReDoS)',
    description: 'Malicious path patterns containing exponential backtracking constructs can hang Node.js event loop indefinitely.',
    severity: 'high',
    confidence: 'high',
    cwe: 'CWE-1333',
    file_path: 'package.json',
    line_number: 18,
    evidence: 'Dependency tree: sentinelforge -> globby -> fast-glob (<3.3.3)',
    remediation: 'Upgrade fast-glob dependency to version 3.3.3 or higher via npm update.',
    status: 'triaged',
    first_seen: twoDaysAgo,
    last_seen: twoHoursAgo,
    resolved_at: null
  },
  {
    id: 'fnd_proto_pollute_05',
    project_id: 'prj_bigmarket_pos',
    scan_id: 'scn_bigmarket_01',
    scanner: 'npm_audit',
    rule_id: 'GHSA-72xf-g2v4-qvf3',
    title: 'lodash.merge: Prototype Pollution Vulnerability',
    description: 'Unsanitized recursive object merging allows modification of Object.prototype properties, enabling RCE or auth bypass.',
    severity: 'high',
    confidence: 'high',
    cwe: 'CWE-1321',
    file_path: 'package.json',
    line_number: 22,
    evidence: 'Package lodash.merge @ 4.6.1 vulnerable to prototype pollution via __proto__ keys',
    remediation: 'Upgrade lodash to >= 4.17.21 or sanitize __proto__ / constructor keys prior to merge.',
    status: 'in_remediation',
    first_seen: oneDayAgo,
    last_seen: oneHourAgo,
    resolved_at: null
  },
  {
    id: 'fnd_cors_06',
    project_id: 'prj_bigmarket_pos',
    scan_id: 'scn_bigmarket_01',
    scanner: 'semgrep',
    rule_id: 'security.cors-wildcard-origin',
    title: 'Permissive CORS Header with Access-Control-Allow-Origin: *',
    description: 'API endpoint responds with wildcard origin header alongside credentials enabled, violating origin isolation.',
    severity: 'medium',
    confidence: 'high',
    cwe: 'CWE-942',
    file_path: 'app/api/middleware.ts',
    line_number: 31,
    evidence: 'res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Credentials", "true");',
    remediation: 'Specify explicit trusted origins in CORS header instead of wildcard when credentials flag is enabled.',
    status: 'open',
    first_seen: oneDayAgo,
    last_seen: oneHourAgo,
    resolved_at: null
  },
  {
    id: 'fnd_path_trav_07',
    project_id: 'prj_sentinelforge_core',
    scan_id: 'scn_sf_semgrep_02',
    scanner: 'semgrep',
    rule_id: 'fs.path-traversal-resolve',
    title: 'Potential Path Traversal in File Report Retrieval',
    description: 'File path resolved from client query parameter without canonicalization check against allowed report storage directory.',
    severity: 'medium',
    confidence: 'medium',
    cwe: 'CWE-22',
    file_path: 'app/api/reports/download.ts',
    line_number: 55,
    evidence: 'const filePath = path.resolve(REPORT_DIR, req.query.filename);',
    remediation: 'Verify resolved path starts with base directory: if (!resolved.startsWith(REPORT_DIR)) throw new Error("Unauthorized path")',
    status: 'open',
    first_seen: twoDaysAgo,
    last_seen: oneHourAgo,
    resolved_at: null
  },
  {
    id: 'fnd_sec_header_08',
    project_id: 'prj_sentinelforge_core',
    scan_id: 'scn_live_active',
    scanner: 'semgrep',
    rule_id: 'web.missing-content-security-policy',
    title: 'Missing Content-Security-Policy (CSP) Response Header',
    description: 'Application HTTP response lacks a Content-Security-Policy header, increasing vulnerability to Cross-Site Scripting (XSS).',
    severity: 'low',
    confidence: 'high',
    cwe: 'CWE-1021',
    file_path: 'next.config.ts',
    line_number: 12,
    evidence: 'Header Content-Security-Policy not configured in securityHeaders array',
    remediation: 'Configure strict CSP headers in next.config.ts with default-src "self" and script-src restrictions.',
    status: 'open',
    first_seen: oneDayAgo,
    last_seen: now - 570000,
    resolved_at: null
  }
];

const insertFinding = db.prepare(`
  INSERT INTO findings (
    id, project_id, scan_id, scanner, rule_id, title, description,
    severity, confidence, cwe, file_path, line_number, evidence, remediation,
    status, first_seen, last_seen, resolved_at
  ) VALUES (
    @id, @project_id, @scan_id, @scanner, @rule_id, @title, @description,
    @severity, @confidence, @cwe, @file_path, @line_number, @evidence, @remediation,
    @status, @first_seen, @last_seen, @resolved_at
  )
`);

findings.forEach(f => insertFinding.run(f));

console.log(`Seeding complete: ${projects.length} projects, ${scans.length} scans, ${findings.length} findings.`);
