export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SentinelForge</h1>
        <p className="text-zinc-400">Open-Source Application Security Lab</p>
      </header>

      <main className="space-y-6">
        <section className="border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900 p-4 rounded">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-zinc-400">Total Projects</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-zinc-400">Open Findings</div>
            </div>
            <div className="bg-zinc-900 p-4 rounded">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-zinc-400">Scans Run</div>
            </div>
          </div>
        </section>

        <section className="border border-zinc-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a href="/projects" className="block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
              Create Project
            </a>
            <a href="/scanners" className="block px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded">
              View Scanner Status
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
