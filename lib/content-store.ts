/**
 * Persistence for the editable site content (testimonials, photo galleries and
 * custom sections) so the coach has FULL control of the website from /admin —
 * add/delete comments, add/replace/delete photos, add whole sections — without
 * a code deploy.
 *
 * Stored in MongoDB, same `settings` collection as lib/plans-store.ts, doc key
 * `'content'`. Server-only.
 */
import { getDb } from './mongo';
import { DEFAULT_CONTENT, type SiteContent, type Bi } from './content';

async function settings() {
  const db = await getDb();
  return db.collection<{ key: string; data: unknown }>('settings');
}

const bi = (v: any): Bi => ({ ar: String(v?.ar || '').trim(), en: String(v?.en || '').trim() });

/** Accept /public paths, http(s) URLs and uploaded data URLs (size-capped). */
const img = (v: any): string | null => {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (s.startsWith('data:image/')) return s.length <= 2_500_000 ? s : null;
  if (s.startsWith('/') || /^https?:\/\//.test(s)) return s.length <= 2000 ? s : null;
  return null;
};

/** Coerce arbitrary input into a clean, safe SiteContent. Throws on bad shape. */
export function sanitizeContent(input: any): SiteContent {
  if (!input || typeof input !== 'object') throw new Error('Content must be an object');

  const testimonials = (Array.isArray(input.testimonials) ? input.testimonials : [])
    .map((t: any) => ({ q: bi(t?.q), a: bi(t?.a) }))
    .filter((t: any) => t.q.ar || t.q.en)
    .slice(0, 40);

  const photos = (arr: any, max: number) =>
    (Array.isArray(arr) ? arr : []).map(img).filter(Boolean).slice(0, max) as string[];

  const sections = (Array.isArray(input.sections) ? input.sections : [])
    .map((s: any, i: number) => ({
      id: String(s?.id || `sec${i + 1}`).slice(0, 40),
      title: bi(s?.title),
      body: bi(s?.body),
      images: photos(s?.images, 8),
    }))
    .filter((s: any) => s.title.ar || s.title.en)
    .slice(0, 8);

  return {
    testimonials,
    transformations: photos(input.transformations, 24),
    swimmers: photos(input.swimmers, 24),
    sections,
  };
}

/** The live content, or the built-in defaults when nothing is saved yet. */
export async function getActiveContent(): Promise<SiteContent> {
  try {
    const col = await settings();
    const doc = await col.findOne({ key: 'content' });
    const data = doc?.data;
    return data && typeof data === 'object' ? (data as SiteContent) : DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  const col = await settings();
  await col.updateOne({ key: 'content' }, { $set: { data: content, updatedAt: new Date() } }, { upsert: true });
}
