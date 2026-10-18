'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string | null;
  repo_path: string | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', repoPath: '', baseUrl: '' });

  useEffect(() => {
    loadProjects();
  }, []);

  function loadProjects() {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => {
        setProjects(data.projects || []);
        setLoading(false);
      });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowForm(false);
    setFormData({ name: '', description: '', repoPath: '', baseUrl: '' });
    loadProjects();
  }

  if (loading) return <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Projects</h1>
          <p className="text-zinc-400">Registered applications and repositories</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 border border-zinc-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Repository Path</label>
            <input
              type="text"
              value={formData.repoPath}
              onChange={e => setFormData({ ...formData, repoPath: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Base URL (for DAST)</label>
            <input
              type="url"
              value={formData.baseUrl}
              onChange={e => setFormData({ ...formData, baseUrl: e.target.value })}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">
            Create Project
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="border border-zinc-800 rounded-lg p-12 text-center text-zinc-400">
          No projects yet. Create your first project to get started.
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800">
          {projects.map(p => (
            <div key={p.id} className="p-4">
              <div className="font-semibold">{p.name}</div>
              {p.description && <div className="text-sm text-zinc-400 mt-1">{p.description}</div>}
              {p.repo_path && <div className="text-xs text-zinc-500 mt-1">Path: {p.repo_path}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link href="/" className="text-blue-400 hover:underline">&larr; Back to Dashboard</Link>
      </div>
    </div>
  );
}
