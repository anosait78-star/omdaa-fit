/**
 * Order store for OmdaFit.
 *
 * OmdaFit runs entirely on free tiers. Persistence has two interchangeable
 * backends, chosen automatically:
 *
 *   • Postgres (Neon free tier) when `DATABASE_URL` is set — used in production
 *     on serverless hosting (Vercel) where the local filesystem is read-only.
 *   • A local JSON file otherwise — zero-config for local development.
 *
 * Either way the public function surface is identical, so the rest of the app
 * never needs to know which backend is active.
 */
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Pool } from 'pg';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const usePg = !!process.env.DATABASE_URL;

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

/* ------------------------------------------------------------------ */
/* Backend: Postgres (Neon)                                            */
/* ------------------------------------------------------------------ */

let pgPool: Pool | null = null;
let pgReady: Promise<void> | null = null;

function pool() {
  if (!pgPool) {
    const url = process.env.DATABASE_URL!;
    // Neon (and any sslmode=require host) needs TLS. The node-postgres driver
    // doesn't read sslmode from the URL, so enable SSL explicitly.
    const needsSsl = /neon\.tech|sslmode=require/i.test(url);
    pgPool = new Pool({
      connectionString: url,
      max: 3,
      ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });
  }
  return pgPool;
}

async function sql() {
  const client = pool();
  if (!pgReady) {
    pgReady = client
      .query(
        `CREATE TABLE IF NOT EXISTS omda_orders (
           id TEXT PRIMARY KEY,
           created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
           data JSONB NOT NULL
         )`,
      )
      .then(() => undefined);
  }
  await pgReady;
  return client;
}

/* ------------------------------------------------------------------ */
/* Backend: local JSON file                                            */
/* ------------------------------------------------------------------ */

async function readFile(): Promise<Order[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
    return parsed.orders ?? [];
  } catch {
    return [];
  }
}
async function writeFile(orders: Order[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify({ orders }, null, 2), 'utf8');
}

/* ------------------------------------------------------------------ */
/* Unified persistence helpers                                         */
/* ------------------------------------------------------------------ */

async function getOrder(id: string): Promise<Order | null> {
  if (usePg) {
    const client = await sql();
    const result = await client.query(`SELECT data FROM omda_orders WHERE id = $1`, [id]);
    return result.rows[0]?.data ?? null;
  }
  return (await readFile()).find((o) => o.id === id) ?? null;
}

async function saveOrder(order: Order): Promise<void> {
  if (usePg) {
    const client = await sql();
    await client.query(
      `INSERT INTO omda_orders (id, created_at, data) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
      [order.id, order.createdAt, JSON.stringify(order)],
    );
    return;
  }
  const orders = await readFile();
  const i = orders.findIndex((o) => o.id === order.id);
  if (i >= 0) orders[i] = order;
  else orders.push(order);
  await writeFile(orders);
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
  await saveOrder(order);
  return order;
}

export async function findOrder(id: string): Promise<Order | null> {
  return getOrder(id);
}

/** Mark an order approved, optionally preserving historical account data. */
export async function recordApproval(
  id: string,
  result: { account?: IssuedAccount; error?: string } = {},
): Promise<Order | null> {
  const order = await getOrder(id);
  if (!order) return null;
  if (result.error) {
    order.status = 'FAILED';
    order.error = result.error || 'Unknown error';
  } else {
    order.account = result.account ?? null;
    order.status = 'ACTIVE';
    order.error = null;
    order.approvedAt = new Date().toISOString();
  }
  await saveOrder(order);
  return order;
}

/** Coach rejects an order, recording the reason shown to the customer. */
export async function recordRejection(id: string, reason: string): Promise<Order | null> {
  const order = await getOrder(id);
  if (!order) return null;
  order.status = 'REJECTED';
  order.rejectReason = reason.trim() || 'Your request needs changes.';
  order.account = null;
  await saveOrder(order);
  return order;
}

/** All orders, newest first (private admin view). */
export async function listOrders(): Promise<Order[]> {
  if (usePg) {
    const client = await sql();
    const result = await client.query(
      `SELECT data FROM omda_orders ORDER BY created_at DESC`,
    );
    return result.rows.map((r) => r.data as Order);
  }
  return (await readFile()).slice().reverse();
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
 * Admin list WITHOUT the base64 images. On Postgres the images are removed
 * server-side via the JSONB `-` operator, so Neon only transfers the small text
 * fields. Each order gets a `hasPhotos` flag so the UI knows whether to offer a
 * "show photos" button.
 */
export async function listOrdersLight(): Promise<(Order & { hasPhotos: boolean })[]> {
  if (usePg) {
    const client = await sql();
    const strip = IMAGE_KEYS.map((k) => `- '${k}'`).join(' ');
    const hasExpr = IMAGE_KEYS.map((k) => `data->>'${k}' IS NOT NULL`).join(' OR ');
    const result = await client.query(
      `SELECT (data ${strip}) AS data, (${hasExpr}) AS has_photos
         FROM omda_orders ORDER BY created_at DESC`,
    );
    return result.rows.map((r) => ({ ...(r.data as Order), hasPhotos: !!r.has_photos }));
  }
  const orders = (await readFile()).slice().reverse();
  return orders.map((o) => {
    const hasPhotos = IMAGE_KEYS.some((k) => (o as any)[k]);
    const copy: any = { ...o };
    for (const k of IMAGE_KEYS) copy[k] = null;
    copy.hasPhotos = hasPhotos;
    return copy as Order & { hasPhotos: boolean };
  });
}

/** Just the base64 images for one order, fetched on demand by the admin view. */
export async function getOrderImages(id: string): Promise<Record<string, string | null> | null> {
  if (usePg) {
    const client = await sql();
    const sel = IMAGE_KEYS.map((k) => `'${k}', data->'${k}'`).join(', ');
    const result = await client.query(
      `SELECT jsonb_build_object(${sel}) AS imgs FROM omda_orders WHERE id = $1`,
      [id],
    );
    if (!result.rows[0]) return null;
    return result.rows[0].imgs as Record<string, string | null>;
  }
  const o = (await readFile()).find((x) => x.id === id);
  if (!o) return null;
  const out: Record<string, string | null> = {};
  for (const k of IMAGE_KEYS) out[k] = ((o as any)[k] as string) ?? null;
  return out;
}
