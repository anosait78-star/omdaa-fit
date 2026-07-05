/**
 * ─────────────────────────────────────────────────────────────────────────
 *  SINGLE-FILE BRANDING — clone this site for another coach by editing here.
 * ─────────────────────────────────────────────────────────────────────────
 *  Everything coach-specific that lives in code is in this one object. To spin
 *  up a new coach's site you only touch THREE things:
 *    1. The values below (name, colours, contact, payment, links, metadata).
 *    2. The logo image at `public/<logoSrc>` (swap the file, keep the name or
 *       update `logoSrc`).
 *    3. The environment variables (admin email/password, Telegram bot token,
 *       MONGODB_URI) — see TEMPLATE.md.
 *  All page CONTENT (plans, prices, transformations, "who is the coach" copy)
 *  is edited at runtime from the /admin panel, so it is NOT in code.
 */
export const SITE = {
  brand: 'OmdaFit',
  /** Brand name shown in Arabic copy (footer, etc.). */
  brandAr: 'عُمدة',
  coachName: { ar: 'كابتن عمده', en: 'Coach Omda' },

  /** Logo file under /public. Swap the image to rebrand. */
  logoSrc: '/omdafit-logo.jpg',

  /** Brand accent colour (the action red). Drives the whole site via the
   *  `--brand-rgb` CSS variable injected in the root layout — change this one
   *  value to re-skin every button, link and glow. Format: "R G B". */
  brandRgb: '229 9 20',

  /** <head> metadata. */
  meta: {
    title: 'OmdaFit — Online Coaching',
    description:
      'Personal online coaching with custom training, flexible nutrition and real follow-up. Subscribe and start your transformation.',
  },

  /** Optional social links (shown when set; leave '' to hide). */
  social: {
    instagram: '',
    tiktok: '',
    youtube: '',
  },

  /** InstaPay is the payment gateway. Customers transfer to this number. */
  instapayNumber: '01010082746',
  /** InstaPay handle + one-tap quick-send link (opens the InstaPay payment page). */
  instapayHandle: 'ahmedemadc4@instapay',
  instapayLink: 'https://ipn.eg/S/ahmedemadc4/instapay/5FoDfU',
  whatsapp: '01010082746',
  tagline: {
    ar: 'جاهز تبدأ التغيير؟',
    en: "I'm ready.. You ready?",
  },
};

/**
 * Normalise an Egyptian phone number to international digits for WhatsApp.
 * WhatsApp (wa.me) rejects local numbers like 01010082746 because they have no
 * country code, so we convert a leading 0 to the +20 Egypt code.
 */
export function toIntlDigits(raw: string): string {
  let d = (raw || '').replace(/[^0-9]/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('20')) return d;
  if (d.startsWith('0')) return '20' + d.slice(1);
  if (d.length === 10 && d.startsWith('1')) return '20' + d; // 1XXXXXXXXX
  return d;
}

/** Build a wa.me link to the coach, with an optional pre-filled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${toIntlDigits(SITE.whatsapp)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
