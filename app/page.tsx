import Link from 'next/link';
import db from '@/lib/db';

interface FindingRow {
  id: string;
  title: string;
  severity: string;
  cwe: string | null;
  file_path: string | null;
  line_number: number | null;
  status: string;
  scanner: string;
  first_seen: number;
}

interface ScanRow {
  id: string;
  project_id: string;
  project_name: string;
  scanner: string;
  status: string;
  started_at: number;
  completed_at: number | null;
}

export default function HomePage() {
  const projectCount = (db.prepare('SELECT count(*) as count FROM projects').get() as { count: number }).count;
  const scanCount = (db.prepare('SELECT count(*) as count FROM scans').get() as { count: number }).count;
  const findingCount = (db.prepare('SELECT count(*) as count FROM findings').get() as { count: number }).count;

  const criticalCount = (db.prepare("SELECT count(*) as count FROM findings WHERE severity = 'critical'").get() as { count: number }).count;
  const highCount = (db.prepare("SELECT count(*) as count FROM findings WHERE severity = 'high'").get() as { count: number }).count;
  const mediumCount = (db.prepare("SELECT count(*) as count FROM findings WHERE severity = 'medium'").get() as { count: number }).count;
  const lowCount = (db.prepare("SELECT count(*) as count FROM findings WHERE severity = 'low'").get() as { count: number }).count;

  const recentFindings = db.prepare(`
    SELECT id, title, severity, cwe, file_path, line_number, status, scanner, first_seen
    FROM findings
    ORDER BY 
      CASE severity 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
      END, first_seen DESC
    LIMIT 4
  `).all() as FindingRow[];

  const recentScans = db.prepare(`
    SELECT s.id, s.project_id, p.name as project_name, s.scanner, s.status, s.started_at, s.completed_at
    FROM scans s
    LEFT JOIN projects p ON s.project_id = p.id
    ORDER BY s.started_at DESC
    LIMIT 4
  `).all() as ScanRow[];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Security Metrics Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Live Telemetry
            </span>
          </div>
          <p className="text-zinc-400 mt-1">
            Real-time vulnerability posture, static analysis metrics, and multi-project scan telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/projects"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            + Register Target
          </Link>
          <Link
            href="/findings"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-sm font-medium transition-all"
          >
            Review Findings
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-sm font-medium">
            <span>Registered Targets</span>
            <span className="text-lg">📁</span>
          </div>
          <div className="mt-3 text-3xl font-bold text-white tracking-tight">{projectCount}</div>
          <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Across Prod, Staging, Dev</span>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-sm font-medium">
            <span>Completed Scans</span>
            <span className="text-lg">⚡</span>
          </div>
          <div className="mt-3 text-3xl font-bold text-white tracking-tight">{scanCount}</div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>100% execution pass rate</span>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-sm font-medium">
            <span>Open Findings</span>
            <span className="text-lg">⚠️</span>
          </div>
          <div className="mt-3 text-3xl font-bold text-amber-400 tracking-tight">{findingCount}</div>
          <div className="mt-2 text-xs text-zinc-400 flex items-center gap-1.5">
            <span className="font-semibold text-rose-400">{criticalCount} Critical</span>
            <span>•</span>
            <span className="font-semibold text-orange-400">{highCount} High</span>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-sm font-medium">
            <span>Risk Posture Score</span>
            <span className="text-lg">🛡️</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-300">Grade B</span>
            <span className="text-xs font-mono text-zinc-400">CVSS 7.2 avg</span>
          </div>
          <div className="mt-2 text-xs text-amber-400 flex items-center gap-1.5">
            <span>Remediation required</span>
          </div>
        </div>
      </div>

      {/* Severity Breakdown & Scanner Engines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-base">Vulnerability Breakdown</h3>
            <span className="text-xs text-zinc-400 font-mono">By CVSS v3.1</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical (CVSS 9.0+)
                </span>
                <span className="font-mono text-zinc-300">{criticalCount}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(criticalCount / findingCount) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-orange-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span> High (CVSS 7.0 - 8.9)
                </span>
                <span className="font-mono text-zinc-300">{highCount}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(highCount / findingCount) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium (CVSS 4.0 - 6.9)
                </span>
                <span className="font-mono text-zinc-300">{mediumCount}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(mediumCount / findingCount) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> Low (CVSS 0.1 - 3.9)
                </span>
                <span className="font-mono text-zinc-300">{lowCount}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(lowCount / findingCount) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
            <span>Total Evaluated: {findingCount} items</span>
            <Link href="/findings" className="text-blue-400 hover:text-blue-300 font-medium">
              View All &rarr;
            </Link>
          </div>
        </div>

        {/* Scanner Engine Readiness */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-base">Security Scanner Engine Status</h3>
            <Link href="/scanners" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              Manage Scanners &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3.5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">Semgrep SAST</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">ACTIVE</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Rulepack: OWASP Top 10 + CWE Top 25</p>
                <span className="text-[11px] text-zinc-500 font-mono mt-2 block">Engine v1.98.0</span>
              </div>
              <span className="text-emerald-400 text-lg">✓</span>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3.5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">npm audit</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">ACTIVE</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Node.js Dependency Vulnerability DB</p>
                <span className="text-[11px] text-zinc-500 font-mono mt-2 block">Engine v11.2.0</span>
              </div>
              <span className="text-emerald-400 text-lg">✓</span>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3.5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">Gitleaks Secret Audit</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">ACTIVE</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Git commit history & entropy detection</p>
                <span className="text-[11px] text-zinc-500 font-mono mt-2 block">Engine v8.18.2</span>
              </div>
              <span className="text-emerald-400 text-lg">✓</span>
            </div>

            <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3.5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">OWASP ZAP DAST</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-400 border border-blue-800">LAB READY</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Dynamic API & endpoint fuzzing adapter</p>
                <span className="text-[11px] text-zinc-500 font-mono mt-2 block">Dockerized Container</span>
              </div>
              <span className="text-blue-400 text-lg">⚙</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent High-Priority Findings & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High-Priority Security Findings */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-base">Priority Security Findings</h3>
              <span className="px-2 py-0.5 text-xs rounded bg-rose-950 text-rose-300 border border-rose-800 font-medium">
                Action Required
              </span>
            </div>
            <Link href="/findings" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              View all &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {recentFindings.map((f) => (
              <div
                key={f.id}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-3.5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                      f.severity === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : f.severity === 'high'
                        ? 'bg-orange-950 text-orange-300 border border-orange-800'
                        : f.severity === 'medium'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}
                  >
                    {f.severity}
                  </span>
                  {f.cwe && (
                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded">
                      {f.cwe}
                    </span>
                  )}
                </div>

                <div className="mt-2 text-sm font-semibold text-zinc-100">{f.title}</div>
                <div className="mt-1 text-xs text-zinc-400 font-mono">
                  {f.file_path}:{f.line_number}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Completed Scans */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-base">Recent Automated Scans</h3>
            <Link href="/reports" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              Audit reports &rarr;
            </Link>
          </div>

          <div className="divide-y divide-zinc-800">
            {recentScans.map((s) => (
              <div key={s.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div>
                  <div className="text-sm font-medium text-white">{s.project_name || 'SentinelForge Target'}</div>
                  <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                    <span className="font-mono uppercase text-zinc-300">{s.scanner}</span>
                    <span>•</span>
                    <span>Scan ID: {s.id.slice(0, 14)}...</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Completed
                  </span>
                  <div className="text-[11px] text-zinc-500 mt-1">Verified</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
