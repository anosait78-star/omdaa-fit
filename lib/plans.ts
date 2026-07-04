/**
 * Subscription plans offered on OmdaFit. Prices are in Egyptian Pounds (EGP)
 * and are the single source of truth for both the pricing section and the
 * checkout / payment screens.
 */
export type Plan = {
  id: string;
  months: number;
  priceEGP: number;
  /**
   * Optional "was" price. When set (and higher than priceEGP) the pricing UI
   * shows it struck through next to the current price — e.g. "خُصم من 2000".
   */
  originalPriceEGP?: number;
  /** Bilingual display names. */
  name: { ar: string; en: string };
  tagline: { ar: string; en: string };
  features: { ar: string; en: string }[];
  featured?: boolean;
  /**
   * Which storefront section the plan belongs to. Default (undefined) = the
   * main pricing grid. 'swimmers' = the Swimmers Bundle section: fitness +
   * swimming programs from two coaches, sport intake locked to swimming.
   */
  bundle?: 'swimmers';
};

export const PLANS: Plan[] = [
  {
    id: 'm1',
    months: 1,
    priceEGP: 1500,
    name: { ar: 'شهر واحد', en: '1 Month' },
    tagline: { ar: 'بداية قوية', en: 'Strong start' },
    features: [
      { ar: 'برنامج تمارين مخصّص بالفيديو', en: 'Custom workout plan with video' },
      { ar: 'نظام غذائي مرن حسب ميزانيتك', en: 'Flexible diet for your budget' },
      { ar: 'متابعة أسبوعية', en: 'Weekly follow-up' },
    ],
  },
  {
    id: 'm3',
    months: 3,
    priceEGP: 3200,
    name: { ar: '٣ شهور', en: '3 Months' },
    tagline: { ar: 'الأكثر اختياراً', en: 'Most chosen' },
    featured: true,
    features: [
      { ar: 'كل مزايا الشهر', en: 'Everything in monthly' },
      { ar: 'تعديل الخطة كل أسبوعين', en: 'Plan updated every 2 weeks' },
      { ar: 'متابعة دقيقة للقياسات', en: 'Detailed measurement tracking' },
    ],
  },
  {
    id: 'm6',
    months: 6,
    priceEGP: 6000,
    name: { ar: '٦ شهور', en: '6 Months' },
    tagline: { ar: 'نتائج تدوم', en: 'Lasting results' },
    features: [
      { ar: 'كل مزايا الـ٣ شهور', en: 'Everything in 3 months' },
      { ar: 'دعم أولوية على واتساب', en: 'Priority WhatsApp support' },
      { ar: 'مراجعة شهرية للصور', en: 'Monthly photo review' },
    ],
  },
  {
    id: 'm12',
    months: 12,
    priceEGP: 10000,
    name: { ar: 'سنة كاملة', en: '12 Months' },
    tagline: { ar: 'أفضل قيمة', en: 'Best value' },
    features: [
      { ar: 'كل مزايا الـ٦ شهور', en: 'Everything in 6 months' },
      { ar: 'تثبيت السعر طوال السنة', en: 'Price locked for a year' },
      { ar: 'خطة تثبيت ونمط حياة', en: 'Maintenance & lifestyle plan' },
    ],
  },
  {
    id: 'vip',
    months: 1,
    priceEGP: 5000,
    name: { ar: 'VIP', en: 'VIP' },
    tagline: { ar: 'دعم شخصي مباشر', en: 'Direct personal support' },
    features: [
      { ar: 'مكالمات هاتفية وفيديو', en: 'Phone & video calls' },
      { ar: 'رد فوري على مدار اليوم', en: 'Same-day replies' },
      { ar: 'متابعة يومية', en: 'Daily follow-up' },
    ],
  },
];

/** Swimmers Bundle defaults — prices fully editable from /admin like the rest. */
const SWIM_FEATURES = [
  { ar: 'برنامج جيم من كابتن عُمدة', en: 'Gym program from Coach Omda' },
  { ar: 'برنامج سباحة من الكابتن عبدالله عبد الناصر', en: 'Swim program from Coach Abdullah Abd El Nasser' },
  { ar: 'نظام غذائي مخصّص للسبّاحين', en: 'Swimmer-specific nutrition plan' },
  { ar: 'متابعة من المدربَين في تطبيق واحد', en: 'Both coaches follow you in one app' },
];

export const SWIM_PLANS: Plan[] = [
  {
    id: 'swim-m1',
    months: 1,
    priceEGP: 2000,
    bundle: 'swimmers',
    name: { ar: 'شهر واحد', en: '1 Month' },
    tagline: { ar: 'جيم + سباحة', en: 'Gym + swimming' },
    features: SWIM_FEATURES,
  },
  {
    id: 'swim-m3',
    months: 3,
    priceEGP: 4500,
    bundle: 'swimmers',
    featured: true,
    name: { ar: '٣ شهور', en: '3 Months' },
    tagline: { ar: 'الأكثر اختياراً', en: 'Most chosen' },
    features: SWIM_FEATURES,
  },
  {
    id: 'swim-m6',
    months: 6,
    priceEGP: 8000,
    bundle: 'swimmers',
    name: { ar: '٦ شهور', en: '6 Months' },
    tagline: { ar: 'موسم كامل', en: 'A full season' },
    features: SWIM_FEATURES,
  },
  {
    id: 'swim-m12',
    months: 12,
    priceEGP: 14000,
    bundle: 'swimmers',
    name: { ar: 'سنة كاملة', en: '12 Months' },
    tagline: { ar: 'أفضل قيمة', en: 'Best value' },
    features: SWIM_FEATURES,
  },
];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}
