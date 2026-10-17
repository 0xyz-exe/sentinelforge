import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const findings = db.prepare(`
      SELECT * FROM findings ORDER BY 
      CASE severity 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
        ELSE 5
      END, first_seen DESC
    `).all();

    return NextResponse.json({ findings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch findings' }, { status: 500 });
  }
}
