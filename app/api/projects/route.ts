import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { cuid, timestamp } from '@/lib/utils';

export async function GET() {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, repoPath, baseUrl, environment } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const id = cuid();
    const now = timestamp();

    db.prepare(`
      INSERT INTO projects (id, name, description, repo_path, base_url, environment, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, description || null, repoPath || null, baseUrl || null, environment || 'development', now, now);

    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    return NextResponse.json({ project }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
