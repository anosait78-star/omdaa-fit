/**
 * Quick leads for OmdaFit — persisted in MongoDB (`leads` collection).
 *
 * Separate from `orders` (see `store.ts`) on purpose: these come from the
 * lightweight `/subscribe1` intake (name, phone, height, weight, gender) and
 * are not full subscription requests, so they must never enter the existing
 * approve/reject order flow (admin panel + Telegram). The coach follows up
 * on WhatsApp and later sends the customer the full `/subscribe` link.
 */
import crypto from 'crypto';
import { getDb } from './mongo';

export type Lead = {
  id: string;
  fullName: string;
  phone: string;
  heightCm: number | null;
  weightKg: number | null;
  gender: string | null;
  status: 'PENDING_INFO';
  createdAt: string;
};

async function leads() {
  const db = await getDb();
  const col = db.collection<Lead>('leads');
  await col.createIndex({ id: 1 }, { unique: true });
  await col.createIndex({ createdAt: -1 });
  return col;
}

export async function createLead(input: {
  fullName: string;
  phone: string;
  heightCm?: number | null;
  weightKg?: number | null;
  gender?: string | null;
}): Promise<Lead> {
  const lead: Lead = {
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    heightCm: input.heightCm ?? null,
    weightKg: input.weightKg ?? null,
    gender: input.gender?.trim() || null,
    status: 'PENDING_INFO',
    createdAt: new Date().toISOString(),
  };
  const col = await leads();
  await col.insertOne({ ...lead } as any);
  return lead;
}
