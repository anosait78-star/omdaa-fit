/**
 * Order store for OmdaFit — persisted in MongoDB (`orders` collection).
 */
import crypto from 'crypto';
import { getDb } from './mongo';

/** Login credentials issued to a customer, stored on the order record. */
export type IssuedAccount = {
  email: string;
  /** Plain temporary password, shown once to the coach so they can relay it. */
  password: string;
  /** Pre-filled WhatsApp deep link the coach taps to send the credentials. */
  whatsappLink: string | null;
  createdAt: string;
};

export type Order = {
  id: string;
  reference: string;
  planId: string;
  /** 'swimmers' when the plan was a Swimmers Bundle (two coaches), else null. */
  bundle: string | null;
  months: number;
  amountEGP: number;
  /** Customer name collected at checkout. */
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  gender: string | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  /** How many days per week they can train */
  trainingDays: number | null;
  /** Which specific days they can train */
  trainingDaysNotes: string | null;
  goal: string | null;
  /** Sport (gym, swimming, running, …). */
  sport: string | null;
  /** Sport-specific metrics: current PRs → targets, as a readable text blob. */
  sportMetrics: string | null;
  /** Health/medical conditions or injuries the coach must know about. */
  illness: string | null;
  /** Supplements the customer currently takes (names), or null if none. */
  supplements: string | null;
  /** Any extra notes the customer wants the coach to know. */
  notes: string | null;
  /** InBody / body-composition scan screenshot (data URL). */
  inbody: string | null;
  /** Four body photos for assessment (data URLs). */
  photoFront: string | null;
  photoBack: string | null;
  photoSideRight: string | null;
  photoSideLeft: string | null;
  /** The InstaPay number the customer paid FROM (for the coach to match). */
  payerHandle: string | null;
  /** Payment receipt screenshot, stored inline as a data URL. */
  receipt: string | null;
  status: 'PENDING_REVIEW' | 'ACTIVE' | 'FAILED' | 'REJECTED';
  /** Set when the coach rejects the order — the reason shown to the customer. */
  rejectReason: string | null;
  /** Historical account data from older approvals, if present. */
  account: IssuedAccount | null;
  /** Populated if approval failed, so the coach can see why. */
  error: string | null;
  createdAt: string;
  approvedAt: string | null;
};

async function orders() {
  const db = await getDb();
  const col = db.collection<Order>('orders');
  await col.createIndex({ id: 1 }, { unique: true });
  await col.createIndex({ createdAt: -1 });
  return col;
}

function reference(): string {
  return 'OMDA-' + crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

/**
 * Record a paid subscription as PENDING_REVIEW. No login is created here.
 */
export async function createOrder(input: {
  planId: string;
  bundle?: string | null;
  months: number;
  amountEGP: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  gender?: string | null;
  age?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  trainingDays?: number | null;
  trainingDaysNotes?: string | null;
  goal?: string | null;
  sport?: string | null;
  sportMetrics?: string | null;
  illness?: string | null;
  supplements?: string | null;
  notes?: string | null;
  inbody?: string | null;
  photoFront?: string | null;
  photoBack?: string | null;
  photoSideRight?: string | null;
  photoSideLeft?: string | null;
  payerHandle?: string | null;
  receipt?: string | null;
}): Promise<Order> {
  const order: Order = {
    id: crypto.randomUUID(),
    reference: reference(),
    planId: input.planId,
    bundle: input.bundle ?? null,
    months: input.months,
    amountEGP: input.amountEGP,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    customerEmail: input.customerEmail?.trim() || null,
    gender: input.gender?.trim() || null,
    age: input.age ?? null,
    heightCm: input.heightCm ?? null,
    weightKg: input.weightKg ?? null,
    trainingDays: input.trainingDays ?? null,
    trainingDaysNotes: input.trainingDaysNotes?.trim() || null,
    goal: input.goal?.trim() || null,
    sport: input.sport?.trim() || null,
    sportMetrics: input.sportMetrics?.trim() || null,
    illness: input.illness?.trim() || null,
    supplements: input.supplements?.trim() || null,
    notes: input.notes?.trim() || null,
    inbody: input.inbody || null,
    photoFront: input.photoFront || null,
    photoBack: input.photoBack || null,
    photoSideRight: input.photoSideRight || null,
    photoSideLeft: input.photoSideLeft || null,
    payerHandle: input.payerHandle?.trim() || null,
    receipt: input.receipt || null,
    status: 'PENDING_REVIEW',
    rejectReason: null,
    account: null,
    error: null,
    createdAt: new Date().toISOString(),
    approvedAt: null,
  };
  const col = await orders();
  await col.insertOne({ ...order } as any);
  return order;
}

export async function findOrder(id: string): Promise<Order | null> {
  const col = await orders();
  const doc = await col.findOne({ id }, { projection: { _id: 0 } });
  return (doc as Order) ?? null;
}

/** Mark an order approved, optionally preserving historical account data. */
export async function recordApproval(
  id: string,
  result: { account?: IssuedAccount; error?: string } = {},
): Promise<Order | null> {
  const col = await orders();
  const update = result.error
    ? { status: 'FAILED' as const, error: result.error || 'Unknown error' }
    : {
        account: result.account ?? null,
        status: 'ACTIVE' as const,
        error: null,
        approvedAt: new Date().toISOString(),
      };
  await col.updateOne({ id }, { $set: update });
  return findOrder(id);
}

/** Coach rejects an order, recording the reason shown to the customer. */
export async function recordRejection(id: string, reason: string): Promise<Order | null> {
  const col = await orders();
  await col.updateOne(
    { id },
    { $set: { status: 'REJECTED', rejectReason: reason.trim() || 'Your request needs changes.', account: null } },
  );
  return findOrder(id);
}

/** All orders, newest first (private admin view). */
export async function listOrders(): Promise<Order[]> {
  const col = await orders();
  const docs = await col.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return docs as Order[];
}

/**
 * The heavy base64 image fields on an order. Stripped from the admin list so the
 * database never ships megabytes of photos on every dashboard load — they're
 * fetched one order at a time, on demand (see getOrderImages). Keeps free-tier
 * network transfer tiny no matter how many clients sign up.
 */
export const IMAGE_KEYS = [
  'inbody',
  'photoFront',
  'photoBack',
  'photoSideRight',
  'photoSideLeft',
  'receipt',
] as const;

/**
 * Admin list WITHOUT the base64 images. Each order gets a `hasPhotos` flag so
 * the UI knows whether to offer a "show photos" button.
 */
export async function listOrdersLight(): Promise<(Order & { hasPhotos: boolean })[]> {
  const col = await orders();
  const docs = await col.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return docs.map((d: any) => {
    const hasPhotos = IMAGE_KEYS.some((k) => d[k]);
    const copy: any = { ...d };
    for (const k of IMAGE_KEYS) copy[k] = null;
    copy.hasPhotos = hasPhotos;
    return copy as Order & { hasPhotos: boolean };
  });
}

/** Just the base64 images for one order, fetched on demand by the admin view. */
export async function getOrderImages(id: string): Promise<Record<string, string | null> | null> {
  const col = await orders();
  const projection = Object.fromEntries(IMAGE_KEYS.map((k) => [k, 1]));
  const doc = await col.findOne({ id }, { projection });
  if (!doc) return null;
  const out: Record<string, string | null> = {};
  for (const k of IMAGE_KEYS) out[k] = ((doc as any)[k] as string) ?? null;
  return out;
}
