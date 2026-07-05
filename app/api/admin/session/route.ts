import { NextResponse } from 'next/server';
import { sessionRole } from '@/lib/admin-auth';

export const runtime = 'nodejs';

/** Lets the /admin page restore the dashboard after a refresh without re-entering credentials. */
export async function GET(req: Request) {
  const role = sessionRole(req);
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ role });
}
