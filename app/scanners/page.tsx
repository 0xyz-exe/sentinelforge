'use client';
import { useEffect, useState } from 'react';

export default function ScannersPage() {
  const [scanners, setScanners] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scanners')
      .then(r => r.json())
      .then(data => {
        setScanners(data.scanners);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scanner Status</h1>
        <p className="text-zinc-400">Available security scanning tools</p>
      </header>

      <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800">
        {Object.entries(scanners || {}).map(([name, info]: [string, any]) => (
          <div key={name} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{name}</div>
              {info.version && <div className="text-sm text-zinc-400">{info.version}</div>}
            </div>
            <div className={`px-3 py-1 rounded text-sm ${info.available ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
              {info.available ? 'Available' : 'Missing'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <a href="/" className="text-blue-400 hover:underline">&larr; Back to Dashboard</a>
      </div>
    </div>
  );
}
