import { NextResponse } from 'next/server';
import { getActivePlans } from '@/lib/plans-store';
import { createOrder } from '@/lib/store';
import { notifyNewOrder } from '@/lib/telegram';
import { SWIMMING_PAUSED } from '@/lib/swimming';

export const runtime = 'nodejs';
// Receipt images can push the request body past the default limit.
export const maxDuration = 30;

/**
 * Checkout endpoint. Called after the customer transfers the fee over InstaPay.
 * Captures the customer's full intake (name, measurements, photos, receipt) and
 * records the order as PENDING_REVIEW for the coach to review and approve.
 */
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Validate against the LIVE plan set (admin-edited prices/bundles included),
  // so the amount recorded always matches what the pricing page showed.
  const plans = await getActivePlans();
  const plan = plans.find((p) => p.id === String(body?.planId || ''));
  if (!plan) return NextResponse.json({ error: 'Unknown plan.' }, { status: 400 });
  if (SWIMMING_PAUSED && plan.bundle === 'swimmers') {
    return NextResponse.json({ error: 'Swimming plans are coming soon.' }, { status: 400 });
  }
  const sportText = String(body?.sport || '').toLowerCase();
  if (SWIMMING_PAUSED && (sportText.includes('swim') || sportText.includes('سباح'))) {
    return NextResponse.json({ error: 'Swimming is coming soon.' }, { status: 400 });
  }

  const customerName = String(body?.customerName || '').trim();
  const customerPhone = String(body?.customerPhone || '').trim();
  if (customerName.length < 2) {
    return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
  }
  if (!/^[0-9+\-\s]{8,}$/.test(customerPhone)) {
    return NextResponse.json({ error: 'Please enter a valid phone number.' }, { status: 400 });
  }

  // Numeric intake — coerced safely, left null when blank.
  const num = (v: any): number | null => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  };

  // Images are stored inline as data URLs. Accept only strings and cap each one
  // so a single huge upload can't bloat a row. (The client already downscales.)
  const img = (v: any): string | null => {
    if (typeof v !== 'string' || !v.startsWith('data:image/')) return null;
    return v.length > 4_500_000 ? null : v;
  };
  const receipt = img(body?.receipt);

  let order;
  try {
    order = await createOrder({
      planId: plan.id,
      bundle: plan.bundle ?? null,
      months: plan.months,
      amountEGP: plan.priceEGP,
      customerName,
      customerPhone,
      customerEmail: body?.customerEmail ?? null,
      gender: body?.gender ?? null,
      age: num(body?.age),
      heightCm: num(body?.heightCm),
      weightKg: num(body?.weightKg),
      trainingDays: num(body?.trainingDays),
      trainingDaysNotes: body?.trainingDaysNotes ?? null,
      goal: body?.goal ?? null,
      sport: body?.sport ?? null,
      sportMetrics: body?.sportMetrics ?? null,
      illness: body?.illness ?? null,
      supplements: body?.supplements ?? null,
      notes: body?.notes ?? null,
      inbody: img(body?.inbody),
      photoFront: img(body?.photoFront),
      photoBack: img(body?.photoBack),
      photoSideRight: img(body?.photoSideRight),
      photoSideLeft: img(body?.photoSideLeft),
      payerHandle: body?.payerHandle ?? null,
      receipt,
    });
    await notifyNewOrder(order);
  } catch (e) {
    console.error('Failed to create OmdaFit order', e);
    return NextResponse.json({ error: 'Could not save the subscription request. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reference: order.reference, status: order.status });
}
