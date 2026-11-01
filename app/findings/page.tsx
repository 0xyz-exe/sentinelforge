import db from '@/lib/db';

interface FindingRecord {
  id: string;
  project_id: string;
  scan_id: string;
  scanner: string;
  rule_id: string | null;
  title: string;
  description: string | null;
  severity: string;
  confidence: string | null;
  cwe: string | null;
  file_path: string | null;
  line_number: number | null;
  evidence: string | null;
  remediation: string | null;
  status: string;
  first_seen: number;
}

export default function FindingsPage() {
  const findings = db.prepare(`
    SELECT * FROM findings
    ORDER BY 
      CASE severity 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
      END, first_seen DESC
  `).all() as FindingRecord[];

  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const highCount = findings.filter(f => f.severity === 'high').length;
  const mediumCount = findings.filter(f => f.severity === 'medium').length;
  const lowCount = findings.filter(f => f.severity === 'low').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Finding Management & Triage</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              {findings.length} Active Items
            </span>
          </div>
          <p className="text-zinc-400 mt-1">
            Systematic vulnerability triaging, code-level flaw analysis, and verified remediation paths.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs font-semibold">
            Export SARIF
          </button>
          <button className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20">
            Batch Triage
          </button>
        </div>
      </div>

      {/* Filter and Quick Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-400 font-medium mr-2">Filter Severity:</span>
          <button className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-800 text-white border border-zinc-700">
            All ({findings.length})
          </button>
          <button className="px-3 py-1 rounded-md text-xs font-semibold bg-rose-950/70 text-rose-300 border border-rose-800/80">
            Critical ({criticalCount})
          </button>
          <button className="px-3 py-1 rounded-md text-xs font-semibold bg-orange-950/70 text-orange-300 border border-orange-800/80">
            High ({highCount})
          </button>
          <button className="px-3 py-1 rounded-md text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/80">
            Medium ({mediumCount})
          </button>
          <button className="px-3 py-1 rounded-md text-xs font-semibold bg-blue-950/70 text-blue-300 border border-blue-800/80">
            Low ({lowCount})
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span>Sort: <strong className="text-zinc-200">Severity (Desc)</strong></span>
          <span>•</span>
          <span>Scanner: <strong className="text-zinc-200">All Engines</strong></span>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {findings.map((f) => {
          const isCrit = f.severity === 'critical';
          const isHigh = f.severity === 'high';
          const isMed = f.severity === 'medium';

          return (
            <div
              key={f.id}
              className={`border rounded-xl p-6 transition-all bg-zinc-900/60 ${
                isCrit
                  ? 'border-rose-900/60 bg-gradient-to-r from-rose-950/20 via-zinc-900/60 to-zinc-900/60'
                  : isHigh
                  ? 'border-orange-900/50 bg-gradient-to-r from-orange-950/15 via-zinc-900/60 to-zinc-900/60'
                  : 'border-zinc-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider font-mono ${
                        isCrit
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : isHigh
                          ? 'bg-orange-950 text-orange-300 border border-orange-800'
                          : isMed
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {f.severity}
                    </span>
                    {f.cwe && (
                      <span className="text-xs font-mono text-zinc-300 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                        {f.cwe}
                      </span>
                    )}
                    <span className="text-xs font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      Engine: {f.scanner}
                    </span>
                    {f.rule_id && (
                      <span className="text-xs font-mono text-zinc-500">
                        Rule: {f.rule_id}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">{f.title}</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">{f.description}</p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      f.status === 'open'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/80'
                        : f.status === 'triaged'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-800/80'
                        : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80'
                    }`}
                  >
                    Status: {f.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 rounded">
                      Triage
                    </button>
                    <button className="px-3 py-1 bg-emerald-900/60 hover:bg-emerald-800/80 text-xs text-emerald-300 border border-emerald-700 rounded">
                      Resolve Fix
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Location & Evidence */}
              {f.file_path && (
                <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-mono">
                      <span>Vulnerable Location:</span>
                      <span className="text-blue-400 font-semibold">{f.file_path}:{f.line_number}</span>
                    </div>
                    {f.evidence && (
                      <pre className="text-xs font-mono text-rose-300 bg-rose-950/20 border border-rose-900/40 p-2.5 rounded overflow-x-auto">
                        <code>{f.evidence}</code>
                      </pre>
                    )}
                  </div>

                  {/* Remediation Advice */}
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-emerald-400 font-semibold mb-1.5 flex items-center gap-1.5">
                        <span>🛡️ Actionable Remediation:</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                        {f.remediation}
                      </p>
                    </div>
                    <div className="mt-2 text-[11px] text-zinc-500 font-mono">
                      Confidence: {f.confidence || 'High'} • Auto-verify on next scan
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
