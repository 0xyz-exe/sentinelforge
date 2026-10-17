import { NextResponse } from 'next/server';
import { execFileSync } from 'child_process';

// Safe: hardcoded command names, no user input
function checkTool(cmd: string, args: string[]) {
  try {
    const output = execFileSync(cmd, args, { encoding: 'utf8', timeout: 5000 });
    return { available: true, version: output.trim() };
  } catch {
    return { available: false, version: null };
  }
}

export async function GET() {
  const scanners = {
    semgrep: checkTool('semgrep', ['--version']),
    npm_audit: checkTool('npm', ['--version']),
    gitleaks: checkTool('gitleaks', ['version']),
  };

  return NextResponse.json({ scanners });
}
