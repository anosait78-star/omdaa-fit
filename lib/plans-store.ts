/**
 * Persistence for the subscription plans (bundles) so the coach can edit prices,
 * add bundles and remove bundles from the admin dashboard — full control over the
 * pricing page without a code deploy.
 *
 * Mirrors lib/store.ts: Postgres (Neon) when DATABASE_URL is set, otherwise a
 * local JSON file. When nothing has been saved yet we fall back to the built-in
 * defaults in lib/plans.ts, so the site always has a valid set of plans.
 *
 * This module is server-only (it touches `pg`/`fs`); never import it from a
 * client component. Client code reads plans through the public GET /api/plans.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { PLANS, SWIM_PLANS, type Plan } from './plans';

const DATA_DIR = path.join(process.cwd(), 'data');
const PLANS_FILE = path.join(DATA_DIR, 'plans.json');
const usePg = !!process.env.DATABASE_URL;

let pgPool: Pool | null = null;
let pgReady: Promise<void> | null = null;

function pool() {
  if (!pgPool) {
    const url = process.env.DATABASE_URL!;
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
        `CREATE TABLE IF NOT EXISTS omda_settings (
           key TEXT PRIMARY KEY,
           data JSONB NOT NULL,
           updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
         )`,
      )
      .then(() => undefined);
  }
  await pgReady;
  return client;
}

/** Coerce arbitrary input into a clean, safe Plan[]. Throws on invalid shape. */
export function sanitizePlans(input: unknown): Plan[] {
  if (!Array.isArray(input)) throw new Error('Plans must be an array');
  if (input.length === 0) throw new Error('At least one plan is required');
  if (input.length > 12) throw new Error('Too many plans (max 12)');

  const seen = new Set<string>();
  return input.map((raw: any, i) => {
    const id = String(raw?.id || '').trim() || `plan${i + 1}`;
    if (seen.has(id)) throw new Error(`Duplicate plan id: ${id}`);
    seen.add(id);

    const months = Math.max(1, Math.round(Number(raw?.months) || 1));
    const priceEGP = Math.max(0, Math.round(Number(raw?.priceEGP) || 0));
    // "Was" price — only kept when it's a positive number strictly above the
    // current price (otherwise there's no discount to show).
    const origRaw = Math.round(Number(raw?.originalPriceEGP) || 0);
    const originalPriceEGP = origRaw > priceEGP ? origRaw : undefined;
    const nameAr = String(raw?.name?.ar || '').trim();
    const nameEn = String(raw?.name?.en || '').trim();
    if (!nameAr || !nameEn) throw new Error(`Plan "${id}" needs an Arabic and English name`);

    const features = Array.isArray(raw?.features)
      ? raw.features
          .map((f: any) => ({ ar: String(f?.ar || '').trim(), en: String(f?.en || '').trim() }))
          .filter((f: { ar: string; en: string }) => f.ar || f.en)
          .slice(0, 12)
      : [];

    return {
      id,
      months,
      priceEGP,
      ...(originalPriceEGP ? { originalPriceEGP } : {}),
      name: { ar: nameAr, en: nameEn },
      tagline: { ar: String(raw?.tagline?.ar || '').trim(), en: String(raw?.tagline?.en || '').trim() },
      features,
      featured: !!raw?.featured,
      ...(raw?.bundle === 'swimmers' ? { bundle: 'swimmers' as const } : {}),
    } satisfies Plan;
  });
}

/**
 * Sets saved before the Swimmers Bundle existed have no swim plans — append the
 * built-in defaults so the bundle shows up without re-saving from /admin. Once
 * the coach saves pricing (which includes them), the stored copy governs.
 */
function withSwimDefaults(plans: Plan[]): Plan[] {
  return plans.some((p) => p.bundle === 'swimmers') ? plans : [...plans, ...SWIM_PLANS];
}

/** Default plan set. Swimmers stay visible while paused, but checkout blocks them. */
function defaultPlans(): Plan[] {
  return [...PLANS, ...SWIM_PLANS];
}

/** Read the saved plans, or the built-in defaults when nothing is stored yet. */
export async function getActivePlans(): Promise<Plan[]> {
  try {
    if (usePg) {
      const client = await sql();
      const result = await client.query(`SELECT data FROM omda_settings WHERE key = 'plans'`);
      const data = result.rows[0]?.data;
      if (data && Array.isArray(data) && data.length) return withSwimDefaults(data as Plan[]);
      return defaultPlans();
    }
    const parsed = JSON.parse(await fs.readFile(PLANS_FILE, 'utf8'));
    return Array.isArray(parsed?.plans) && parsed.plans.length
      ? withSwimDefaults(parsed.plans as Plan[])
      : defaultPlans();
  } catch {
    return defaultPlans();
  }
}

/** Persist a new set of plans (already sanitized by the caller). */
export async function savePlans(plans: Plan[]): Promise<void> {
  if (usePg) {
    const client = await sql();
    await client.query(
      `INSERT INTO omda_settings (key, data, updated_at) VALUES ('plans', $1, now())
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [JSON.stringify(plans)],
    );
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PLANS_FILE, JSON.stringify({ plans }, null, 2), 'utf8');
}
