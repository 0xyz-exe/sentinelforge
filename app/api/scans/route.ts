import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { cuid, timestamp } from '@/lib/utils';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const { projectId, scanner } = await req.json();

    if (!projectId || !scanner) {
      return NextResponse.json({ error: 'projectId and scanner required' }, { status: 400 });
    }

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) {
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
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start scan' }, { status: 500 });
  }
}

async function runScan(scanId: string, scanner: string, project: any) {
  const startTime = timestamp();
  
  try {
    let findings: any[] = [];

    if (scanner === 'npm_audit' && project.repo_path) {
      findings = await runNpmAudit(project.repo_path);
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
    db.prepare(`
      UPDATE scans SET status = ?, completed_at = ?
      WHERE id = ?
    `).run('failed', timestamp(), scanId);
  }
}

async function runNpmAudit(repoPath: string): Promise<any[]> {
  try {
    const { stdout } = await execFileAsync('npm', ['audit', '--json'], {
      cwd: repoPath,
      timeout: 60000
    });
    
    const result = JSON.parse(stdout);
    const findings: any[] = [];

    if (result.vulnerabilities) {
      for (const [pkg, vuln] of Object.entries(result.vulnerabilities as any)) {
        findings.push({
          ruleId: vuln.via?.[0]?.source || 'UNKNOWN',
          title: `${pkg}: ${vuln.via?.[0]?.title || 'Vulnerability'}`,
          description: vuln.via?.[0]?.url || '',
          severity: mapSeverity(vuln.severity),
          confidence: 'high',
          evidence: `Package: ${pkg}, Range: ${vuln.range}`,
        });
      }
    }

    return findings;
  } catch (error) {
    return [];
  }
}

async function runSemgrep(repoPath: string): Promise<any[]> {
  try {
    const { stdout } = await execFileAsync('semgrep', [
      '--config=auto',
      '--json',
      repoPath
    ], { timeout: 120000 });

    const result = JSON.parse(stdout);
    return (result.results || []).map((r: any) => ({
      ruleId: r.check_id,
      title: r.extra?.message || r.check_id,
      description: r.extra?.metadata?.message || '',
      severity: mapSeverity(r.extra?.severity || 'info'),
      confidence: 'medium',
      filePath: r.path,
      lineNumber: r.start?.line,
      evidence: r.extra?.lines,
    }));
  } catch (error) {
    return [];
  }
}

function mapSeverity(s: string): string {
  const lower = s.toLowerCase();
  if (lower === 'critical' || lower === 'high') return 'high';
  if (lower === 'moderate' || lower === 'medium') return 'medium';
  return 'low';
}
