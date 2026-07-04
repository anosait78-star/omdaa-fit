import { NextResponse } from 'next/server';
import { getActiveContent, saveContent, sanitizeContent } from '@/lib/content-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Uploaded photos (data URLs) can push the body size up.
export const maxDuration = 30;

/** Only the MAIN coach key edits site content (the swim key manages orders only). */
function authed(req: Request): boolean {
  const key = new URL(req.url).searchParams.get('key') || '';
  return key === (process.env.ADMIN_KEY || 'omda-admin');
}

/** Public: the live site content (testimonials, galleries, custom sections). */
export async function GET() {
  try {
    return NextResponse.json({ content: await getActiveContent() });
  } catch (e) {
    console.error('Failed to load content', e);
    return NextResponse.json({ error: 'Could not load content.' }, { status: 500 });
  }
}

/** Admin-only: replace the site content — full control, no deploy needed. */
export async function PUT(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  let content;
  try {
    content = sanitizeContent(body?.content);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Invalid content' }, { status: 400 });
  }

  try {
    await saveContent(content);
    return NextResponse.json({ ok: true, content });
  } catch (e) {
    console.error('Failed to save content', e);
    return NextResponse.json({ error: 'Could not save content.' }, { status: 500 });
  }
}
