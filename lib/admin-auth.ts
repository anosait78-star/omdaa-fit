/**
 * Admin authentication for OmdaFit — username + password (instead of the old
 * shared "admin key"), backed by a MongoDB `admins` collection.
 *
 * On first use the collection is seeded from environment variables (or the
 * built-in defaults below) with a bcrypt-hashed password, so the plaintext
 * password never touches the database or the source code after the first run.
 *
 * Sessions are a signed, httpOnly cookie (HMAC-SHA256 over `role.expiry`) —
 * no session table needed, and it survives serverless cold starts.
 */
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb } from './mongo';

export type AdminRole = 'full' | 'swim';

type AdminDoc = { email: string; passwordHash: string; role: AdminRole };

// Fallback credentials used only when the env vars below are not set. Change
// these (or, better, set the env vars) before going live.
const DEFAULT_ADMIN_EMAIL = 'omda@admin.com';
const DEFAULT_ADMIN_PASSWORD = 'omda2026#';

const SESSION_SECRET = process.env.SESSION_SECRET || 'omda-session-secret-change-me';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const SESSION_COOKIE = 'omda_session';

async function admins() {
  const db = await getDb();
  const col = db.collection<AdminDoc>('admins');
  await col.createIndex({ email: 1 }, { unique: true });
  return col;
}

let seeded: Promise<void> | null = null;

/** Ensure the main coach (and, if configured, the swim coach) admin accounts exist. */
function seedAdmins(): Promise<void> {
  if (!seeded) {
    seeded = (async () => {
      const col = await admins();

      const mainEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
      if (!(await col.findOne({ email: mainEmail }))) {
        const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
        await col.insertOne({ email: mainEmail, passwordHash: await bcrypt.hash(password, 10), role: 'full' });
      }

      const swimEmail = process.env.SWIM_ADMIN_EMAIL?.trim().toLowerCase();
      const swimPassword = process.env.SWIM_ADMIN_PASSWORD;
      if (swimEmail && swimPassword && !(await col.findOne({ email: swimEmail }))) {
        await col.insertOne({ email: swimEmail, passwordHash: await bcrypt.hash(swimPassword, 10), role: 'swim' });
      }
    })();
  }
  return seeded;
}

/** Verify an email/password pair against the stored (hashed) credentials. */
export async function verifyLogin(email: string, password: string): Promise<AdminRole | null> {
  await seedAdmins();
  const col = await admins();
  const doc = await col.findOne({ email: email.trim().toLowerCase() });
  if (!doc) return null;
  const ok = await bcrypt.compare(password, doc.passwordHash);
  return ok ? doc.role : null;
}

/** Change an admin's password (used by a future "change password" flow). */
export async function setPassword(email: string, newPassword: string): Promise<boolean> {
  const col = await admins();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const result = await col.updateOne({ email: email.trim().toLowerCase() }, { $set: { passwordHash } });
  return result.matchedCount > 0;
}

/* ------------------------------------------------------------------ */
/* Signed session tokens                                               */
/* ------------------------------------------------------------------ */

function sign(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

export function createSessionToken(role: AdminRole): string {
  const payload = `${role}.${Date.now() + SESSION_TTL_MS}`;
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): AdminRole | null {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  let payload: string;
  try {
    payload = Buffer.from(encoded, 'base64url').toString('utf8');
  } catch {
    return null;
  }
  const expected = sign(payload);
  if (expected.length !== signature.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return null;
  }
  const [role, expiryStr] = payload.split('.');
  if (role !== 'full' && role !== 'swim') return null;
  if (Date.now() > Number(expiryStr)) return null;
  return role;
}

/** Read the admin role from a request's session cookie, or null if unauthenticated. */
export function sessionRole(req: Request): AdminRole | null {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)omda_session=([^;]+)/);
  return verifySessionToken(match ? decodeURIComponent(match[1]) : null);
}
