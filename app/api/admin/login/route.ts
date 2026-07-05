import { NextResponse } from 'next/server';
import { verifyLogin, createSessionToken, SESSION_COOKIE } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const email = String(body?.email || '');
  const password = String(body?.password || '');
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  let role;
  try {
    role = await verifyLogin(email, password);
  } catch (e) {
    console.error('Admin login failed', e);
    return NextResponse.json({ error: 'Admin backend error.' }, { status: 500 });
  }

  if (!role) return NextResponse.json({ error: 'Wrong email or password.' }, { status: 401 });

  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(SESSION_COOKIE, createSessionToken(role), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
