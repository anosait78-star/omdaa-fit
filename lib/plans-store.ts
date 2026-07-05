/**
 * Persistence for the subscription plans (bundles) so the coach can edit prices,
 * add bundles and remove bundles from the admin dashboard — full control over the
 * pricing page without a code deploy.
 *
 * Stored in MongoDB (`settings` collection, doc `{ key: 'plans', data }`). When
 * nothing has been saved yet we fall back to the built-in defaults in
 * lib/plans.ts, so the site always has a valid set of plans.
 *
 * This module is server-only; never import it from a client component. Client
 * code reads plans through the public GET /api/plans.
 */
import { getDb } from './mongo';
import { PLANS, SWIM_PLANS, type Plan } from './plans';

async function settings() {
  const db = await getDb();
  return db.collection<{ key: string; data: unknown }>('settings');
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
    const col = await settings();
    const doc = await col.findOne({ key: 'plans' });
    const data = doc?.data;
    if (data && Array.isArray(data) && data.length) return withSwimDefaults(data as Plan[]);
    return defaultPlans();
  } catch {
    return defaultPlans();
  }
}

/** Persist a new set of plans (already sanitized by the caller). */
export async function savePlans(plans: Plan[]): Promise<void> {
  const col = await settings();
  await col.updateOne({ key: 'plans' }, { $set: { data: plans, updatedAt: new Date() } }, { upsert: true });
}
