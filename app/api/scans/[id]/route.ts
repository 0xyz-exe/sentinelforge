import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const scan = db.prepare('SELECT * FROM scans WHERE id = ?').get(id);
    if (!scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    const findings = db.prepare('SELECT * FROM findings WHERE scan_id = ?').all(id);
    return NextResponse.json({ scan, findings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scan' }, { status: 500 });
  }
}
