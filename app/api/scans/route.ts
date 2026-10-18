import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { cuid, timestamp } from '@/lib/utils';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

interface ProjectRecord {
  id: string;
  repo_path: string | null;
}

interface FindingRecord {
  ruleId?: string;
  title: string;
  description?: string;
  severity: string;
  confidence?: string;
  filePath?: string;
  lineNumber?: number;
  evidence?: string;
}

interface NpmAuditVulnerability {
  via: unknown;
  severity: string;
  range?: string;
}

interface NpmAuditResult {
  vulnerabilities?: Record<string, NpmAuditVulnerability>;
}

interface SemgrepResult {
  check_id: string;
  path?: string;
  start?: { line?: number };
  extra?: {
    message?: string;
    metadata?: { message?: string };
    severity?: string;
    lines?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { projectId, scanner } = await req.json();

    if (!projectId || !scanner) {
      return NextResponse.json({ error: 'projectId and scanner required' }, { status: 400 });
    }

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!isProjectRecord(project)) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const scanId = cuid();
    const now = timestamp();

    db.prepare(`
      INSERT INTO scans (id, project_id, scanner, status, started_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(scanId, projectId, scanner, 'running', now);

    // Run scan async
    runScan(scanId, scanner, project).catch(console.error);

    return NextResponse.json({ scanId, status: 'running' }, { status: 202 });
  } catch {
    return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 });
  }
}

async function runScan(scanId: string, scanner: string, project: ProjectRecord) {
  try {
    let findings: FindingRecord[] = [];

    if (scanner === 'npm_audit' && project.repo_path) {
      console.log('[SCAN]', scanId, 'Running npm audit in', project.repo_path);
      findings = await runNpmAudit(project.repo_path);
      console.log('[SCAN]', scanId, 'Found', findings.length, 'findings');
    } else if (scanner === 'semgrep' && project.repo_path) {
      findings = await runSemgrep(project.repo_path);
    }

    // Store findings
    for (const f of findings) {
      const id = cuid();
      const now = timestamp();
      db.prepare(`
        INSERT INTO findings (
          id, project_id, scan_id, scanner, rule_id, title, description,
          severity, confidence, file_path, line_number, evidence, status,
          first_seen, last_seen
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, project.id, scanId, scanner, f.ruleId, f.title, f.description,
        f.severity, f.confidence || 'medium', f.filePath, f.lineNumber,
        f.evidence, 'open', now, now
      );
    }

    db.prepare(`
      UPDATE scans SET status = ?, completed_at = ?, exit_code = ?
      WHERE id = ?
    `).run('completed', timestamp(), 0, scanId);
  } catch (error) {
    console.error('[SCAN]', scanId, 'Error:', error);
    db.prepare(`
      UPDATE scans SET status = ?, completed_at = ?
      WHERE id = ?
    `).run('failed', timestamp(), scanId);
  }
}

async function runNpmAudit(repoPath: string): Promise<FindingRecord[]> {
  try {
    // npm audit returns non-zero with vulnerabilities, catch both
    let stdout = '';
    try {
      const result = await execFileAsync('npm', ['audit', '--json'], {
        cwd: repoPath,
        timeout: 60000
      });
      stdout = result.stdout;
    } catch (error: unknown) {
      // npm audit exits 1 when vulnerabilities found
      if (isExecFileError(error) && error.stdout) {
        stdout = error.stdout;
      } else {
        throw error;
      }
    }
    
    const result: NpmAuditResult = JSON.parse(stdout);
    const findings: FindingRecord[] = [];

    if (result.vulnerabilities) {
      for (const [pkg, vuln] of Object.entries(result.vulnerabilities)) {
        const via = Array.isArray(vuln.via) ? vuln.via[0] : vuln.via;
        const viaObj = isNpmAuditAdvisory(via) ? via : null;
        
        findings.push({
          ruleId: viaObj?.source?.toString() || 'UNKNOWN',
          title: `${pkg}: ${viaObj?.title || vuln.severity || 'Vulnerability'}`,
          description: viaObj?.url || '',
          severity: mapSeverity(vuln.severity),
          confidence: 'high',
          evidence: `Package: ${pkg}, Range: ${vuln.range}`,
        });
      }
    }

    return findings;
  } catch {
    return [];
  }
}

async function runSemgrep(repoPath: string): Promise<FindingRecord[]> {
  try {
    const { stdout } = await execFileAsync('semgrep', [
      '--config=auto',
      '--json',
      repoPath
    ], { timeout: 120000 });

    const result: { results?: SemgrepResult[] } = JSON.parse(stdout);
    return (result.results || []).map((r) => ({
      ruleId: r.check_id,
      title: r.extra?.message || r.check_id,
      description: r.extra?.metadata?.message || '',
      severity: mapSeverity(r.extra?.severity || 'info'),
      confidence: 'medium',
      filePath: r.path,
      lineNumber: r.start?.line,
      evidence: r.extra?.lines,
    }));
  } catch {
    return [];
  }
}

function isNpmAuditAdvisory(value: unknown): value is {
  source?: string | number;
  title?: string;
  url?: string;
} {
  return typeof value === 'object' && value !== null;
}

function isProjectRecord(value: unknown): value is ProjectRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, 'id') === 'string' &&
    (typeof Reflect.get(value, 'repo_path') === 'string' ||
      Reflect.get(value, 'repo_path') === null)
  );
}

function isExecFileError(value: unknown): value is { stdout?: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    (typeof Reflect.get(value, 'stdout') === 'string' ||
      typeof Reflect.get(value, 'stdout') === 'undefined')
  );
}

function mapSeverity(s: string): string {
  const lower = s.toLowerCase();
  if (lower === 'critical' || lower === 'high') return 'high';
  if (lower === 'moderate' || lower === 'medium') return 'medium';
  return 'low';
}
