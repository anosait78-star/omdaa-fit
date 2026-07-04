/**
 * Persistence for the editable site content (testimonials, photo galleries and
 * custom sections) so the coach has FULL control of the website from /admin —
 * add/delete comments, add/replace/delete photos, add whole sections — without
 * a code deploy.
 *
 * Mirrors lib/plans-store.ts: Postgres (omda_settings, key 'content') when
 * DATABASE_URL is set, otherwise a local JSON file. Server-only.
 */
import { promises as fs } from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { DEFAULT_CONTENT, type SiteContent, type Bi } from './content';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
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
    if (usePg) {
      const client = await sql();
      const result = await client.query(`SELECT data FROM omda_settings WHERE key = 'content'`);
      const data = result.rows[0]?.data;
      if (data && typeof data === 'object') return data as SiteContent;
      return DEFAULT_CONTENT;
    }
    const parsed = JSON.parse(await fs.readFile(CONTENT_FILE, 'utf8'));
    return parsed?.content && typeof parsed.content === 'object' ? (parsed.content as SiteContent) : DEFAULT_CONTENT;
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  if (usePg) {
    const client = await sql();
    await client.query(
      `INSERT INTO omda_settings (key, data, updated_at) VALUES ('content', $1, now())
       ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [JSON.stringify(content)],
    );
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CONTENT_FILE, JSON.stringify({ content }, null, 2), 'utf8');
}
