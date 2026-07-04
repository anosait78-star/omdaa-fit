import { NextResponse } from 'next/server';
import { listOrdersLight, getOrderImages, findOrder, recordApproval, recordRejection } from '@/lib/store';
import { toIntlDigits } from '@/lib/site';
import { getAdminKey, getSwimAdminKey } from '@/lib/admin-credentials';
import { SWIMMING_PAUSED } from '@/lib/swimming';

export const runtime = 'nodejs';

/**
 * Two admin roles:
 *   • 'full' — the main coach's key (ADMIN_KEY): sees and manages every order.
 *   • 'swim' — Coach Abdullah's key (SWIM_ADMIN_KEY): sees and manages ONLY
 *     Swimmers Bundle orders.
 */
type AdminRole = 'full' | 'swim' | null;

function authed(req: Request): AdminRole {
  const key = new URL(req.url).searchParams.get('key') || '';
  if (key && key === getAdminKey()) return 'full';
  // Swim sub-admin (Coach Abdullah) is disabled while swimming is paused.
  if (!SWIMMING_PAUSED && key && key === getSwimAdminKey()) return 'swim';
  return null;
}

const isSwimmers = (o: { bundle?: string | null; planId?: string }) =>
  o.bundle === 'swimmers' || String(o.planId || '').startsWith('swim');

/**
 * Private orders feed for the coach's admin view (key-protected).
 *
 * Default: returns the order list WITHOUT the heavy base64 photos (only small
 * text fields + a `hasPhotos` flag per order) so the database transfers almost
 * nothing on each load — this is what keeps OmdaFit safely on the free tier
 * forever, regardless of how many clients sign up.
 *
 * With `?images=<orderId>`: returns just that one order's photos, fetched on
 * demand when the coach actually opens it.
 */
export async function GET(req: Request) {
  const role = authed(req);
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const imagesFor = new URL(req.url).searchParams.get('images');
  if (imagesFor) {
    try {
      // The swim coach may only open photos on Swimmers Bundle orders.
      if (role === 'swim') {
        const order = await findOrder(imagesFor);
        if (!order || !isSwimmers(order)) {
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
      }
      const images = await getOrderImages(imagesFor);
      if (!images) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      return NextResponse.json({ images });
    } catch (e) {
      console.error('Failed to load order images', e);
      return NextResponse.json({ error: 'Could not load photos.' }, { status: 500 });
    }
  }

  try {
    const orders = await listOrdersLight();
    return NextResponse.json({
      orders: role === 'swim' ? orders.filter(isSwimmers) : orders,
      role,
    });
  } catch (e) {
    console.error('Failed to list OmdaFit orders', e);
    return NextResponse.json({ error: 'Could not load orders.' }, { status: 500 });
  }
}

/** Approve or reject a pending payment. */
export async function POST(req: Request) {
  const role = authed(req);
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const order = await findOrder(String(body?.orderId || ''));
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  // The swim coach can only act on Swimmers Bundle orders.
  if (role === 'swim' && !isSwimmers(order)) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Reject flow: record the reason and return a pre-filled WhatsApp link the
  // coach can tap to tell the customer what's wrong so they can re-submit.
  if (body?.action === 'reject') {
    const reason = String(body?.reason || '').trim();
    if (reason.length < 3) {
      return NextResponse.json({ error: 'Please enter a rejection reason.' }, { status: 400 });
    }
    const updated = await recordRejection(order.id, reason);
    const digits = toIntlDigits(order.customerPhone || '');
    const msg = `مرحبا ${order.customerName}، بخصوص طلبك في عُمدة (${order.reference}) — للأسف محتاج تعديل:\n${reason}\n\nياريت تظبط ده وتبعتلنا تاني. لو عندك أي استفسار اكتبلنا هنا.`;
    const whatsappLink = digits ? `https://wa.me/${digits}?text=${encodeURIComponent(msg)}` : null;
    return NextResponse.json({ ok: true, reference: order.reference, status: updated?.status, whatsappLink });
  }

  // Idempotent: re-approving an already-active order is a no-op.
  if (order.status === 'ACTIVE') {
    return NextResponse.json({ ok: true, reference: order.reference, status: order.status });
  }

  const updated = await recordApproval(order.id);
  return NextResponse.json({ ok: true, reference: order.reference, status: updated?.status });
}
