import { NextResponse } from 'next/server';
import { createLead } from '@/lib/leads';

export const runtime = 'nodejs';

/**
 * Quick-intake endpoint for `/subscribe1`. Saves a minimal lead (name, phone,
 * height, weight, gender) as PENDING_INFO — the customer is then sent to
 * WhatsApp to reach the coach directly. This is intentionally separate from
 * `/api/subscribe` (the full checkout) so it never touches the existing
 * order/approval/Telegram flow.
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const fullName = String(body?.fullName || '').trim();
  const phone = String(body?.phone || '').trim();
  if (fullName.length < 2) {
    return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
  }
  if (!/^[0-9+\-\s]{8,}$/.test(phone)) {
    return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
  }

  const num = (v: any): number | null => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  };

  let lead;
  try {
    lead = await createLead({
      fullName,
      phone,
      heightCm: num(body?.heightCm),
      weightKg: num(body?.weightKg),
      gender: body?.gender ?? null,
    });
  } catch (e) {
    console.error('Failed to save OmdaFit lead', e);
    return NextResponse.json({ error: 'Could not save your info. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: lead.id });
}
