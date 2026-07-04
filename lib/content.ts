/**
 * Editable site content — types + built-in defaults.
 *
 * CLIENT-SAFE (no pg/fs imports): the landing page falls back to these defaults
 * until the coach saves his own content from /admin. The saved copy lives in
 * the omda_settings table (see lib/content-store.ts) and is served by
 * GET /api/content.
 */

export type Bi = { ar: string; en: string };

export type Testimonial = { q: Bi; a: Bi };

export type CustomSection = {
  id: string;
  title: Bi;
  body: Bi;
  /** Optional gallery (image URLs or data URLs). */
  images: string[];
};

export type SiteContent = {
  testimonials: Testimonial[];
  /** Transformation photos (paths under /public or uploaded data URLs). */
  transformations: string[];
  /** Swimmer/medal photos. */
  swimmers: string[];
  /** Extra sections the coach adds — rendered before the footer. */
  sections: CustomSection[];
};

export const DEFAULT_CONTENT: SiteContent = {
  testimonials: [
    { q: { ar: 'والحمدلله لما انتظمت في اخر اسبوعين كسرت رقم الخمسين دولفين زعانف بثانيتين والخمسين دولفين من غير زعانف مثبتة رقم البطولة مع اني اخر فترة كنت معلية جدا علي رقمي', en: 'Thank God — once I got consistent, in the last two weeks I broke my 50m dolphin (with fins) by two seconds, and my 50m dolphin without fins matched the championship record — even though I’d been way off my times lately.' }, a: { ar: 'سلفيا', en: 'Silvia' } },
    { q: { ar: 'أول مرة ألتزم لآخر الشهر، الكابتن بيتابع معايا أول بأول والأكل سهل ومش ممل.', en: 'First time I stick to a full month. The coach follows up constantly and the food is easy.' }, a: { ar: 'يوسف', en: 'Youssef' } },
    { q: { ar: 'النظام اتعمل على ميزانيتي بالظبط، ونزلت وزن من غير ما أحس إني محرومة.', en: 'The plan fit my exact budget, and I lost weight without feeling deprived.' }, a: { ar: 'سارة', en: 'Sara' } },
    { q: { ar: 'أحسن حاجة المتابعة، حاسس إن فيه حد فعلاً مهتم بنتيجتي.', en: 'The best part is the follow-up — someone genuinely cares about my result.' }, a: { ar: 'عمر', en: 'Omar' } },
    { q: { ar: 'نزلت ٧ كيلو في شهرين وأنا مبسوطة، الأكل بيشبّع وعمري ما حسيت بجوع.', en: 'Lost 7 kg in two months and I’m thrilled — the food is filling and I never felt hungry.' }, a: { ar: 'مريم', en: 'Mariam' } },
    { q: { ar: 'البرنامج فهّمني آكل إزاي مش بس إيه، دلوقتي عارف أتصرف في أي مطعم.', en: 'It taught me how to eat, not just what — now I can handle any restaurant.' }, a: { ar: 'أحمد', en: 'Ahmed' } },
    { q: { ar: 'حسيت بفرق في طاقتي من أول أسبوع، بصحى نشيطة ومبقتش تعبانة بسرعة.', en: 'My energy changed from the first week — I wake up active and don’t tire quickly.' }, a: { ar: 'نور', en: 'Nour' } },
    { q: { ar: 'الكابتن رد عليّا على الواتس في نص الليل لما اتلخبطت، خدمة مفيش زيها.', en: 'The coach replied on WhatsApp at midnight when I got confused — service like no other.' }, a: { ar: 'محمود', en: 'Mahmoud' } },
    { q: { ar: 'بعد الولادة كنت يائسة، رجّعلي ثقتي في نفسي ورجع جسمي أحسن من الأول.', en: 'After giving birth I was hopeless — he brought back my confidence and my body is better than before.' }, a: { ar: 'دينا', en: 'Dina' } },
    { q: { ar: 'زودت عضل بشكل واضح، صحابي كلهم بيسألوني بتعمل إيه.', en: 'Gained visible muscle — all my friends keep asking what I’m doing.' }, a: { ar: 'كريم', en: 'Karim' } },
    { q: { ar: 'الدايت مرن ومفيهوش حرمان، باكل اللي بحبه وبنزل، حاجة مكنتش مصدقاها.', en: 'The diet is flexible with no deprivation — I eat what I love and still lose. Couldn’t believe it.' }, a: { ar: 'هبة', en: 'Heba' } },
    { q: { ar: 'اشتركت وأنا مش متوقع حاجة، طلع أحسن قرار خدته السنة دي.', en: 'I subscribed expecting nothing — turned out to be the best decision I made this year.' }, a: { ar: 'مصطفى', en: 'Mostafa' } },
  ],
  transformations: Array.from({ length: 9 }, (_, i) => `/transformations/t-${i + 1}.jpg`),
  swimmers: Array.from({ length: 11 }, (_, i) => `/swimmers/sw-${i + 1}.jpg`),
  sections: [],
};
