import { NextResponse } from 'next/server';
import { handleTelegramUpdate } from '@/lib/telegram';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let update: any = null;
  try {
    update = await req.json();
  } catch {
    update = null;
  }
  return NextResponse.json(await handleTelegramUpdate(update));
}
