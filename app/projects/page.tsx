'use client';

import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  repo_path: string | null;
  base_url: string | null;
  environment?: string;
  owner?: string | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [formData, setFormData] = useState({
    name: 'FinTech Secure Auth API',
    description: 'OAuth2/OIDC token broker with biometric passkey authentication & session isolation',
    repoPath: 'C:/Users/wondr/HermesWorkspace/fintech-auth',
    baseUrl: 'https://auth-sec.internal.fintech.lan',
    environment: 'production',
    scannerSemgrep: true,
    scannerNpmAudit: true,
    scannerGitleaks: true,
    scannerZap: false,
  });

  useEffect(() => {
    loadProjects();
  }, []);

  function loadProjects() {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
        repoPath: formData.repoPath,
        baseUrl: formData.baseUrl,
      }),
    });
    setShowForm(false);
    loadProjects();
  }

  if (loading) return <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">Loading Projects...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Project Scanner Configuration</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {projects.length} Monitored Repos
            </span>
          </div>
          <p className="text-zinc-400 mt-1">
            Register target repositories, configure automated security scanners, and fine-tune rulesets.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all"
        >
          {showForm ? 'Close Configuration Form' : '+ New Project & Scanner Config'}
        </button>
      </div>

      {/* Scanner Configuration Form Modal / Banner */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-blue-900/60 bg-zinc-900/90 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
              <h2 className="text-lg font-bold text-white">Target & Security Scanner Profile Setup</h2>
            </div>
            <span className="text-xs font-mono text-zinc-400">Strict Isolation Mode</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
                Target Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
                Deployment Environment
              </label>
              <select
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="production">Production (Strict SAST + Zero Tolerated Vulns)</option>
                <option value="staging">Staging (Continuous Integration Scan)</option>
                <option value="development">Development (Rapid Local Scan)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
                Application Architecture & Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
                Local Repository Path (for SAST & npm audit)
              </label>
              <input
                type="text"
                value={formData.repoPath}
                onChange={(e) => setFormData({ ...formData, repoPath: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 uppercase tracking-wider mb-1.5">
                Target Endpoint Base URL (for DAST & API fuzzing)
              </label>
              <input
                type="url"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Scanner Selection Checkboxes */}
          <div className="pt-2 border-t border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
              Enable Security Scanner Adapters
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700">
                <input
                  type="checkbox"
                  checked={formData.scannerSemgrep}
                  onChange={(e) => setFormData({ ...formData, scannerSemgrep: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-semibold text-white">Semgrep SAST</div>
                  <div className="text-[10px] text-zinc-400">OWASP Top 10 Rules</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700">
                <input
                  type="checkbox"
                  checked={formData.scannerNpmAudit}
                  onChange={(e) => setFormData({ ...formData, scannerNpmAudit: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-semibold text-white">npm audit</div>
                  <div className="text-[10px] text-zinc-400">Dependency CVE DB</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700">
                <input
                  type="checkbox"
                  checked={formData.scannerGitleaks}
                  onChange={(e) => setFormData({ ...formData, scannerGitleaks: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-semibold text-white">Gitleaks Audit</div>
                  <div className="text-[10px] text-zinc-400">Hardcoded Secret Scan</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-700">
                <input
                  type="checkbox"
                  checked={formData.scannerZap}
                  onChange={(e) => setFormData({ ...formData, scannerZap: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <div>
                  <div className="text-xs font-semibold text-white">OWASP ZAP DAST</div>
                  <div className="text-[10px] text-zinc-400">Dynamic HTTP Fuzzing</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/30"
            >
              Save Project & Register Scanners
            </button>
          </div>
        </form>
      )}

      {/* Registered Projects Cards / Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Configured Target Repositories</h2>
          <span className="text-xs text-zinc-400">Showing {projects.length} targets</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-5 hover:border-zinc-700 transition-colors flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{p.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-950 text-blue-300 border border-blue-800">
                      {p.environment || 'production'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Active Lab
                  </span>
                </div>

                {p.description && (
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{p.description}</p>
                )}

                <div className="mt-4 space-y-1.5 text-xs font-mono">
                  {p.repo_path && (
                    <div className="text-zinc-400 truncate">
                      <span className="text-zinc-500">Repo:</span> {p.repo_path}
                    </div>
                  )}
                  {p.base_url && (
                    <div className="text-zinc-400 truncate">
                      <span className="text-zinc-500">Base URL:</span> {p.base_url}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">Semgrep</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">npm audit</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">Gitleaks</span>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 rounded border border-zinc-700">
                    Configure
                  </button>
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold rounded shadow-sm shadow-blue-600/30">
                    Run Scan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
