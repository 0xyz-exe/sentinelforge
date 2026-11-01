'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/findings', label: 'Findings & Triage' },
    { href: '/projects', label: 'Projects & Scanners' },
    { href: '/scanners', label: 'Scanner Status' },
    { href: '/reports', label: 'Scan Reports' },
  ];

  return (
    <nav className="border-b border-zinc-800 bg-zinc-900/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black text-sm group-hover:border-blue-400 transition-colors">
              🛡️
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-blue-400 transition-colors">
                SentinelForge
              </span>
              <span className="ml-2 text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                SecLab v0.1
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ENGINES READY</span>
          </div>
          <span className="text-xs text-zinc-500 font-mono">SQLite Local DB</span>
        </div>
      </div>
    </nav>
  );
}
