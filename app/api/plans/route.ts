import { NextResponse } from 'next/server';
import { getActivePlans, savePlans, sanitizePlans } from '@/lib/plans-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authed(req: Request): boolean {
  const key = new URL(req.url).searchParams.get('key') || '';
  return key === (process.env.ADMIN_KEY || 'omda-admin');
}

/**
 * Public: the live subscription plans (bundles) shown on the landing and
 * checkout pages. Returns the coach's saved plans, or the built-in defaults
 * when none have been saved yet.
 */
export async function GET() {
  try {
    return NextResponse.json({ plans: await getActivePlans(), version: 'swim-soon-2026-06-21' });
  } catch (e) {
    console.error('Failed to load plans', e);
    return NextResponse.json({ error: 'Could not load plans.' }, { status: 500 });
  }
}

/**
 * Admin-only: replace the full set of plans. The coach has complete control —
 * change prices, add bundles, remove bundles, reorder, mark one as featured.
 */
export async function PUT(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  let plans;
  try {
    plans = sanitizePlans(body?.plans);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid plans' }, { status: 400 });
  }

  try {
    await savePlans(plans);
    return NextResponse.json({ ok: true, plans });
  } catch (e) {
    console.error('Failed to save plans', e);
    return NextResponse.json({ error: 'Could not save plans.' }, { status: 500 });
  }
}
