import { NextResponse } from 'next/server';
import { disconnectTelegram, getTelegramLink } from '@/lib/telegram';
import { getAdminKey } from '@/lib/admin-credentials';

export const runtime = 'nodejs';

function authed(req: Request) {
  const key = new URL(req.url).searchParams.get('key') || '';
  return key && key === getAdminKey();
}

export async function GET(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  return NextResponse.json(await getTelegramLink(url.origin));
}

export async function DELETE(req: Request) {
  if (!authed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await disconnectTelegram());
}
