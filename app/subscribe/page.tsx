'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePlans } from '@/lib/use-plans';
import { SITE } from '@/lib/site';
import { SPORTS, getSport } from '@/lib/sports';
import { SWIMMING_PAUSED } from '@/lib/swimming';

type Lang = 'ar' | 'en';

const TX = {
  back: { ar: 'الرئيسية', en: 'Home' },
  pickPlan: { ar: 'اختار باقتك', en: 'Choose your plan' },
  egp: { ar: 'ج.م', en: 'EGP' },
  step1: { ar: 'بياناتك', en: 'Details' },
  step2: { ar: 'صورك', en: 'Photos' },
  step3: { ar: 'الدفع', en: 'Payment' },
  detailsTitle: { ar: 'كمّل بياناتك', en: 'Complete your details' },
  detailsSub: {
    ar: 'الكابتن محتاج المعلومات دي عشان يجهّزلك برنامج التمارين والتغذية المناسب ليك.',
    en: 'The coach needs this to build the right training & nutrition plan for you.',
  },
  photosTitle: { ar: 'صور المتابعة', en: 'Assessment photos' },
  photosSub: {
    ar: 'صورة الإنبودي مطلوبة. صور الجسم اختيارية — ارفعها لو حابب الكابتن يقيّم شكل جسمك بدقة أكبر.',
    en: 'The InBody scan is required. Body photos are optional — add them if you want a more precise assessment.',
  },
  // Requirements / pre-intake page
  reqTitle: { ar: 'قبل ما تبدأ الطلب', en: 'Before you start' },
  reqSub: {
    ar: 'جهّز الحاجات دي عشان طلبك يتقبل بسرعة:',
    en: 'Have these ready so your request is approved quickly:',
  },
  reqItems: {
    ar: [
      'صورة تحليل الإنبودي (InBody) — مطلوبة',
      'بياناتك: السن، الطول، الوزن، وهدفك',
      'رياضتك وأرقام أدائك الحالية (لو مش جيم)',
      'أي أمراض أو إصابات + المكمّلات اللي بتاخدها',
      'صور الجسم (أمام/خلف/جنب) — اختيارية',
      'تحويل المبلغ عبر إنستا باي + صورة الإيصال',
    ],
    en: [
      'InBody scan photo — required',
      'Your details: age, height, weight, and goal',
      'Your sport and current performance numbers (if not gym)',
      'Any illness/injuries + supplements you take',
      'Body photos (front/back/sides) — optional',
      'InstaPay transfer + the receipt screenshot',
    ],
  },
  reqStart: { ar: 'جاهز، نبدأ', en: "I'm ready, let's start" },
  // Sport
  sport: { ar: 'رياضتك', en: 'Your sport' },
  sportMetricsTitle: { ar: 'أرقامك الحالية والمستهدفة', en: 'Your current & target numbers' },
  sportMetricsSub: {
    ar: 'اكتب رقمك الحالي والرقم اللي عايز توصله — ده بيساعد الكابتن يبني برنامج مخصّص لرياضتك.',
    en: 'Enter your current number and the target you want — this lets the coach build a sport-specific program.',
  },
  current: { ar: 'الحالي', en: 'Current' },
  target: { ar: 'المستهدف', en: 'Target' },
  payNow: { ar: 'ادفع الآن عبر إنستا باي', en: 'Pay now with InstaPay' },
  orManual: { ar: 'أو حوّل يدوياً على الرقم/الهاندل:', en: 'Or transfer manually to the number/handle:' },
  payTitle: { ar: 'ادفع عبر إنستا باي', en: 'Pay with InstaPay' },
  payHow: {
    ar: 'حوّل المبلغ على رقم إنستا باي ده، وبعدها اكتب الرقم اللي حوّلت منه وارفع صورة الإيصال.',
    en: 'Transfer the amount to this InstaPay number, then enter the number you paid from and upload the receipt.',
  },
  instapay: { ar: 'رقم إنستا باي', en: 'InstaPay number' },
  amount: { ar: 'المبلغ', en: 'Amount' },
  copy: { ar: 'نسخ', en: 'Copy' },
  copied: { ar: 'تم النسخ', en: 'Copied' },
  yourName: { ar: 'الاسم بالكامل', en: 'Full name' },
  yourPhone: { ar: 'رقم الموبايل (واتساب)', en: 'Phone (WhatsApp)' },
  yourEmail: { ar: 'الإيميل (اختياري)', en: 'Email (optional)' },
  gender: { ar: 'النوع', en: 'Gender' },
  male: { ar: 'ذكر', en: 'Male' },
  female: { ar: 'أنثى', en: 'Female' },
  age: { ar: 'السن', en: 'Age' },
  height: { ar: 'الطول (سم)', en: 'Height (cm)' },
  weight: { ar: 'الوزن (كجم)', en: 'Weight (kg)' },
  goal: { ar: 'هدفك من الاشتراك', en: 'Your goal' },
  goalPh: {
    ar: 'مثال: عايز أنزل ١٠ كيلو / أزوّد عضل / أحسّن لياقتي...',
    en: 'e.g. lose 10kg / build muscle / improve fitness...',
  },
  illness: { ar: 'أي أمراض أو إصابات؟', en: 'Any illness or injuries?' },
  illnessPh: {
    ar: 'مثال: ضغط، سكر، إصابة في الركبة... أو اكتب "لا يوجد"',
    en: 'e.g. blood pressure, diabetes, knee injury... or write "none"',
  },
  suppQ: { ar: 'بتاخد مكمّلات غذائية؟', en: 'Do you take supplements?' },
  yes: { ar: 'أيوه', en: 'Yes' },
  no: { ar: 'لا', en: 'No' },
  suppName: { ar: 'اكتب أسماء المكمّلات', en: 'Supplement name(s)' },
  suppPh: { ar: 'مثال: واي بروتين، كرياتين، فيتامين د...', en: 'e.g. whey protein, creatine, vitamin D...' },
  notes: { ar: 'أي تفاصيل تانية تحب الكابتن يعرفها', en: 'Anything else the coach should know' },
  notesPh: {
    ar: 'مثال: نظام يومي، شغل، نوع أكل بتكرهه...',
    en: 'e.g. daily routine, work, foods you dislike...',
  },
  notesTitle: { ar: 'ملاحظات إضافية', en: 'Additional notes' },
  goalTitle: { ar: 'هدفك من الاشتراك', en: 'Your goal' },
  illnessTitle: { ar: 'التاريخ المرضي', en: 'Medical history' },
  trainingDays: { ar: 'عدد أيام التمرين المتاحة (في الأسبوع)', en: 'Available training days (per week)' },
  trainingDaysNotes: { ar: 'أيام التمرين بالتحديد', en: 'Specific training days' },
  trainingDaysNotesPh: { ar: 'مثال: السبت، الإثنين، الأربعاء...', en: 'e.g. Saturday, Monday, Wednesday...' },
  inbody: { ar: 'صورة تحليل الإنبودي (InBody) — مطلوبة', en: 'InBody scan photo — required' },
  bodyPhotosLabel: { ar: 'صور الجسم (اختيارية)', en: 'Body photos (optional)' },
  pFront: { ar: 'من الأمام', en: 'Front' },
  pBack: { ar: 'من الخلف', en: 'Back' },
  pRight: { ar: 'جنب يمين', en: 'Right side' },
  pLeft: { ar: 'جنب شمال', en: 'Left side' },
  uploadHint: { ar: 'اضغط لرفع صورة', en: 'Tap to upload' },
  change: { ar: 'تغيير', en: 'Change' },
  payer: { ar: 'الرقم اللي حوّلت منه', en: 'Number you paid from' },
  receipt: { ar: 'صورة إيصال الدفع', en: 'Payment receipt photo' },
  receiptHint: { ar: 'ارفع صورة (سكرين شوت) للتحويل', en: 'Upload a screenshot of the transfer' },
  receiptChange: { ar: 'تغيير الصورة', en: 'Change photo' },
  next: { ar: 'التالي', en: 'Next' },
  confirm: { ar: 'أكّدت الدفع — أرسل الطلب', en: 'I paid — submit request' },
  sending: { ar: 'جارٍ الإرسال…', en: 'Submitting…' },
  changePlan: { ar: 'تغيير الباقة', en: 'Change plan' },
  backStep: { ar: 'رجوع', en: 'Back' },
  successTitle: { ar: 'استلمنا طلبك ✅', en: 'Request received ✅' },
  successSub: {
    ar: 'هيتم مراجعة الدفع، وبعد التأكيد هيتواصل معاك الكوتش على واتساب لتفعيل اشتراكك.',
    en: 'We will review your payment. Once confirmed, your coach will contact you on WhatsApp to activate your subscription.',
  },
  reference: { ar: 'رقم الطلب', en: 'Order reference' },
  saveNote: { ar: 'احتفظ برقم الطلب ده.', en: 'Keep this order reference.' },
  errName: { ar: 'اكتب اسمك بالكامل.', en: 'Please enter your full name.' },
  errPhone: { ar: 'اكتب رقم موبايل صحيح.', en: 'Please enter a valid phone number.' },
  errBody: { ar: 'محتاجين السن والطول والوزن.', en: 'Age, height and weight are required.' },
  errInbody: { ar: 'ارفع صورة الإنبودي.', en: 'Please upload your InBody photo.' },
  errPhotos: { ar: 'ارفع الـ٤ صور (أمام، خلف، يمين، شمال).', en: 'Please upload all 4 body photos.' },
  errReceipt: { ar: 'ارفع صورة الإيصال.', en: 'Please upload the payment receipt.' },
};
const HIDDEN_PRICE = { ar: 'السعر قريبًا', en: 'Price soon' };

/** Downscale + JPEG-compress an image file in the browser before upload. */
function fileToCompressedDataUrl(file: File, maxSide = 1000, quality = 0.65): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image failed'));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no canvas'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function SubscribePage() {
  const [lang, setLang] = useState<Lang>('ar');
  const ar = lang === 'ar';
  const t = <T,>(v: { ar: T; en: T }) => v[lang];

  const plans = usePlans();
  const getPlan = (id: string) => plans.find((p) => p.id === id);

  const [planId, setPlanId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [seenReqs, setSeenReqs] = useState(false);

  // Intake — details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [trainingDays, setTrainingDays] = useState('');
  const [trainingDaysNotes, setTrainingDaysNotes] = useState<string[]>([]);
  const [goal, setGoal] = useState('');
  const [sport, setSport] = useState('gym');
  const [metrics, setMetrics] = useState<Record<string, { current: string; target: string }>>({});
  const [illness, setIllness] = useState('');
  const [takesSupp, setTakesSupp] = useState<boolean | null>(null);
  const [supplements, setSupplements] = useState('');
  const [notes, setNotes] = useState('');

  // Intake — photos
  const [inbody, setInbody] = useState<string | null>(null);
  const [photoFront, setPhotoFront] = useState<string | null>(null);
  const [photoBack, setPhotoBack] = useState<string | null>(null);
  const [photoSideRight, setPhotoSideRight] = useState<string | null>(null);
  const [photoSideLeft, setPhotoSideLeft] = useState<string | null>(null);

  // Payment
  const [payer, setPayer] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState<null | { reference: string }>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('plan');
    const picked = q ? getPlan(q) : null;
    if (picked && !(SWIMMING_PAUSED && picked.bundle === 'swimmers')) setPlanId((cur) => cur ?? q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans]);

  const plan = planId ? getPlan(planId) : null;
  // Swimmers Bundle: the sport is part of the product — lock it to swimming.
  const swimBundle = plan?.bundle === 'swimmers';
  useEffect(() => {
    if (SWIMMING_PAUSED && plan?.bundle === 'swimmers') {
      setPlanId(null);
      setSport('gym');
      setMetrics({});
    }
  }, [plan?.bundle]);

  useEffect(() => {
    if (swimBundle && sport !== 'swimming') {
      setSport('swimming');
      setMetrics({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swimBundle]);

  useEffect(() => {
    const pickedSport = getSport(sport);
    const unavailableSport = !pickedSport || (SWIMMING_PAUSED && !swimBundle && sport === 'swimming');
    if (unavailableSport) {
      setSport('gym');
      setMetrics({});
    }
  }, [sport, swimBundle]);

  const upload = (setter: (v: string) => void) => async (file?: File | null) => {
    if (!file) return;
    try {
      setter(await fileToCompressedDataUrl(file));
    } catch {
      setError('Could not read that image.');
    }
  };

  const toStep2 = () => {
    setError('');
    if (name.trim().length < 2) return setError(t(TX.errName));
    if (!/^[0-9+\-\s]{8,}$/.test(phone)) return setError(t(TX.errPhone));
    if (!age || !height || !weight) return setError(t(TX.errBody));
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toStep3 = () => {
    setError('');
    if (!inbody) return setError(t(TX.errInbody)); // InBody required; body photos optional
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Build a readable "metric: current → target" blob for the selected sport. */
  const buildSportMetrics = (): string => {
    const s = getSport(sport);
    if (!s || !s.metrics.length) return '';
    return s.metrics
      .map((m) => {
        const v = metrics[m.id];
        if (!v || (!v.current && !v.target)) return null;
        const cur = v.current || '—';
        const tgt = v.target || '—';
        // Military has no target field — report the current number only.
        return s.id === 'military' ? `${m.label[lang]}: ${cur}` : `${m.label[lang]}: ${cur} → ${tgt}`;
      })
      .filter(Boolean)
      .join('، ');
  };

  const submit = async () => {
    setError('');
    if (!receipt) return setError(t(TX.errReceipt));
    setBusy(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          gender,
          age,
          heightCm: height,
          weightKg: weight,
          trainingDays,
          trainingDaysNotes: trainingDaysNotes.length ? trainingDaysNotes.join('، ') : null,
          goal,
          sport: getSport(sport)?.name[lang] || sport,
          sportMetrics: buildSportMetrics(),
          illness,
          supplements: takesSupp ? supplements : (ar ? 'لا يوجد' : 'none'),
          notes,
          inbody,
          photoFront,
          photoBack,
          photoSideRight,
          photoSideLeft,
          payerHandle: payer,
          receipt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error');
      setDone({ reference: data.reference });
    } catch (e: any) {
      setError(e?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const field =
    'w-full rounded-2xl border hair bg-white/[0.02] px-4 py-3.5 text-sm outline-none placeholder:text-white/35 focus:border-blood/60';

  const StepDot = ({ n, label }: { n: 1 | 2 | 3; label: string }) => (
    <span className={step === n ? 'text-white' : 'text-white/35'}>{n} · {label}</span>
  );

  return (
    <main dir={ar ? 'rtl' : 'ltr'} className="min-h-screen bg-ink text-paper">
      <header className="border-b hair">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label={`${SITE.brand} home`} className="block h-9 w-32 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SITE.logoSrc} alt={SITE.brand} className="h-full w-full object-contain object-left" />
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(ar ? 'en' : 'ar')} className="rounded-full border hair px-3 py-1.5 text-xs font-bold text-white/70 transition hover:text-white">
              {ar ? 'EN' : 'ع'}
            </button>
            <Link href="/" className="text-sm text-white/55 transition hover:text-white">{t(TX.back)}</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {done ? (
          <div className="animate-fade-up rounded-3xl border hair p-8 text-center">
            <h1 className="text-3xl font-black">{t(TX.successTitle)}</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-white/60">{t(TX.successSub)}</p>
            <div className="mx-auto mt-8 max-w-xs rounded-2xl border hair p-4">
              <div className="text-[11px] uppercase tracking-widest text-white/40">{t(TX.reference)}</div>
              <div className="mt-1.5 font-mono text-lg">{done.reference}</div>
            </div>
            <p className="mt-6 text-xs text-white/40">{t(TX.saveNote)}</p>
            <Link href="/" className="mt-8 inline-block rounded-full bg-blood px-8 py-3 text-sm font-bold text-white transition hover:bg-red-500">{t(TX.back)}</Link>
          </div>
        ) : !seenReqs ? (
          <div className="animate-fade-up">
            <h1 className="text-3xl font-black">{t(TX.reqTitle)}</h1>
            <p className="mt-3 text-sm leading-7 text-white/60">{t(TX.reqSub)}</p>
            <ul className="mt-6 space-y-3 rounded-3xl border hair p-6">
              {t(TX.reqItems).map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] leading-7 text-white/80">
                  <span className="mt-1 text-blood">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => setSeenReqs(true)} className="mt-7 w-full rounded-full bg-blood px-8 py-4 text-sm font-bold text-white transition hover:bg-red-500">{t(TX.reqStart)} →</button>
          </div>
        ) : !plan ? (
          <>
            <h1 className="text-3xl font-black">{t(TX.pickPlan)}</h1>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {plans.map((p) => {
                const swimSoon = SWIMMING_PAUSED && p.bundle === 'swimmers';
                return (
                <button
                  key={p.id}
                  type="button"
                  disabled={swimSoon}
                  onClick={() => {
                    if (!swimSoon) setPlanId(p.id);
                  }}
                  className={`flex items-center justify-between rounded-2xl border p-5 text-start transition ${
                    p.bundle === 'swimmers'
                      ? swimSoon
                        ? 'cursor-not-allowed border-sky-500/25 bg-sky-500/[0.035] opacity-70'
                        : 'border-sky-500/40 bg-sky-500/[0.06] hover:bg-sky-500/15'
                      : `hover:bg-blood/10 ${p.featured ? 'border-blood bg-blood/10' : 'hair'}`
                  }`}
                >
                  <div>
                    <div className="font-bold">
                      {p.bundle === 'swimmers' ? '🏊 ' : ''}{t(p.name)}
                      {p.bundle === 'swimmers' && (
                        <span className="ms-2 rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                          {swimSoon ? t({ ar: 'قريبًا', en: 'Soon' }) : t({ ar: 'باقة السبّاحين', en: 'Swimmers Bundle' })}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/45">{t(p.tagline)}</div>
                  </div>
                  <div className="text-right">
                    {p.originalPriceEGP && p.originalPriceEGP > p.priceEGP && (
                      <PriceValue
                        value={p.originalPriceEGP.toLocaleString()}
                        masked={p.bundle === 'swimmers'}
                        className="text-xs text-white/35 line-through"
                      />
                    )}
                    <PriceValue
                      value={p.bundle === 'swimmers' ? t(HIDDEN_PRICE) : p.priceEGP.toLocaleString()}
                      masked={p.bundle === 'swimmers'}
                      className="text-xl font-black"
                    />
                    {p.bundle !== 'swimmers' && <div className="text-[11px] text-white/40">{t(TX.egp)}</div>}
                  </div>
                </button>
              );
              })}
            </div>
          </>
        ) : (
          <>
            {/* Stepper + chosen plan */}
            <div className="flex items-center justify-between">
              <button onClick={() => { setPlanId(null); setStep(1); }} className="text-xs text-white/50 transition hover:text-white">← {t(TX.changePlan)}</button>
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
                <StepDot n={1} label={t(TX.step1)} />
                <span className="text-white/20">—</span>
                <StepDot n={2} label={t(TX.step2)} />
                <span className="text-white/20">—</span>
                <StepDot n={3} label={t(TX.step3)} />
              </div>
            </div>
            <div className="mt-4 rounded-2xl border hair px-5 py-3 text-sm">
              <span className="text-white/45">{t(plan.name)} · </span>
              <span className="font-black">{plan.priceEGP.toLocaleString()} {t(TX.egp)}</span>
            </div>

            {step === 1 && (
              <>
                <h1 className="mt-7 text-3xl font-black">{t(TX.detailsTitle)}</h1>
                <p className="mt-2 text-sm leading-7 text-white/60">{t(TX.detailsSub)}</p>

                <div className="mt-6 space-y-3">
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t(TX.yourName)} className={field} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t(TX.yourPhone)} dir="ltr" className={field} />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t(TX.yourEmail)} dir="ltr" className={field} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={field + ' appearance-none'}>
                      <option value="" className="bg-ink">{t(TX.gender)}</option>
                      <option value="male" className="bg-ink">{t(TX.male)}</option>
                      <option value="female" className="bg-ink">{t(TX.female)}</option>
                    </select>
                    <input value={age} onChange={(e) => setAge(e.target.value)} placeholder={t(TX.age)} inputMode="numeric" className={field} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={height} onChange={(e) => setHeight(e.target.value)} placeholder={t(TX.height)} inputMode="numeric" className={field} />
                    <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={t(TX.weight)} inputMode="numeric" className={field} />
                  </div>
                  
                  {/* Training Days */}
                  <div className="rounded-2xl border hair bg-white/[0.02] p-4">
                    <div className="text-sm font-bold text-white/85 mb-3">{t(TX.trainingDays)}</div>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setTrainingDays(String(d))}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold transition ${
                            trainingDays === String(d) ? 'bg-blood text-white' : 'border hair bg-white/[0.02] text-white/60 hover:text-white'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>

                    <div className="mt-5 text-sm font-bold text-white/85 mb-3">{t(TX.trainingDaysNotes)}</div>
                    <div className="flex flex-wrap gap-2">
                      {(ar
                        ? ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
                        : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                      ).map((day) => {
                        const active = trainingDaysNotes.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => {
                              setTrainingDaysNotes((prev) =>
                                active ? prev.filter((d) => d !== day) : [...prev, day]
                              );
                            }}
                            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                              active ? 'bg-blood text-white' : 'border hair bg-white/[0.02] text-white/60 hover:text-white'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border hair bg-white/[0.02] p-4">
                    <div className="text-sm font-bold text-white/85 mb-3">{t(TX.goalTitle)}</div>
                    <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder={t(TX.goalPh)} rows={2} className={field + ' resize-none'} />
                  </div>

                  {/* Sport — locked to swimming on the Swimmers Bundle */}
                  {swimBundle ? (
                    <div className="flex items-center justify-between rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm font-bold text-sky-200">
                      <span>{t(TX.sport)}: {getSport('swimming')?.name[lang]}</span>
                      <span>🏊</span>
                    </div>
                  ) : (
                    <select value={sport} onChange={(e) => { setSport(e.target.value); setMetrics({}); }} className={field + ' appearance-none'}>
                      {SPORTS.map((s) => {
                        const soon = s.id === 'swimming';
                        return (
                          <option key={s.id} value={s.id} disabled={soon} className="bg-ink">
                            {t(TX.sport)}: {s.name[lang]}{soon ? (lang === 'ar' ? ' (قريبًا)' : ' (Soon)') : ''}
                          </option>
                        );
                      })}
                    </select>
                  )}

                  {/* Sport-specific metrics. Military uses a clear per-test card:
                      test name + the required standard as a badge + one input
                      for the athlete's own result. Other sports keep current+target. */}
                  {(() => {
                    const s = getSport(sport);
                    if (!s || !s.metrics.length) return null;
                    const military = s.id === 'military';

                    if (military) {
                      return (
                        <div className="rounded-2xl border hair bg-white/[0.02] p-4">
                          <div className="text-sm font-bold text-white/85">
                            {lang === 'ar' ? 'اختبارات اللياقة — سجّل نتيجتك' : 'Fitness tests — log your result'}
                          </div>
                          <p className="mt-1 text-xs leading-6 text-white/45">
                            {lang === 'ar'
                              ? 'لكل اختبار اكتب نتيجتك أنت في الخانة. الرقم المطلوب للنجاح مكتوب بجانب اسم الاختبار.'
                              : 'For each test, type your own result in the box. The number you need to pass is shown next to the test name.'}
                          </p>
                          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {s.metrics.map((m) => (
                              <div key={m.id} className="rounded-xl border hair bg-white/[0.015] p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-sm font-semibold leading-5 text-white/85">{m.label[lang]}</span>
                                </div>
                                <span className="mt-1.5 inline-block rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-300/90" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                                  {m.placeholder[lang]}
                                </span>
                                <input
                                  value={metrics[m.id]?.current || ''}
                                  onChange={(e) => setMetrics((prev) => ({ ...prev, [m.id]: { current: e.target.value, target: '' } }))}
                                  placeholder={lang === 'ar' ? 'اكتب نتيجتك' : 'Your result'}
                                  dir="ltr"
                                  className={field + ' mt-2 py-2.5'}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="rounded-2xl border hair bg-white/[0.02] p-4">
                        <div className="text-sm font-bold text-white/85">{t(TX.sportMetricsTitle)}</div>
                        <p className="mt-1 text-xs leading-6 text-white/45">{t(TX.sportMetricsSub)}</p>
                        <div className="mt-3 space-y-3">
                          {s.metrics.map((m) => (
                            <div key={m.id} className="grid grid-cols-[1fr_1fr] items-center gap-2 sm:grid-cols-[140px_1fr_1fr]">
                              <div className="text-sm text-white/70 sm:col-span-1 col-span-2">{m.label[lang]}</div>
                              <input
                                value={metrics[m.id]?.current || ''}
                                onChange={(e) => setMetrics((prev) => ({ ...prev, [m.id]: { current: e.target.value, target: prev[m.id]?.target || '' } }))}
                                placeholder={`${t(TX.current)} · ${m.placeholder[lang]}`}
                                dir="ltr"
                                className={field + ' py-2.5'}
                              />
                              <input
                                value={metrics[m.id]?.target || ''}
                                onChange={(e) => setMetrics((prev) => ({ ...prev, [m.id]: { current: prev[m.id]?.current || '', target: e.target.value } }))}
                                placeholder={t(TX.target)}
                                dir="ltr"
                                className={field + ' py-2.5'}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="rounded-2xl border hair bg-white/[0.02] p-4">
                    <div className="text-sm font-bold text-white/85 mb-3">{t(TX.illnessTitle)}</div>
                    <textarea value={illness} onChange={(e) => setIllness(e.target.value)} placeholder={t(TX.illnessPh)} rows={2} className={field + ' resize-none'} />
                  </div>

                  {/* Supplements */}
                  <div className="rounded-2xl border hair bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-white/80">{t(TX.suppQ)}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setTakesSupp(true)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${takesSupp === true ? 'bg-blood text-white' : 'border hair text-white/60'}`}>{t(TX.yes)}</button>
                        <button type="button" onClick={() => { setTakesSupp(false); setSupplements(''); }} className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${takesSupp === false ? 'bg-blood text-white' : 'border hair text-white/60'}`}>{t(TX.no)}</button>
                      </div>
                    </div>
                    {takesSupp && (
                      <textarea value={supplements} onChange={(e) => setSupplements(e.target.value)} placeholder={t(TX.suppPh)} rows={2} className={field + ' mt-3 resize-none'} />
                    )}
                  </div>

                  <div className="rounded-2xl border hair bg-white/[0.02] p-4">
                    <div className="text-sm font-bold text-white/85 mb-3">{t(TX.notesTitle)}</div>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t(TX.notesPh)} rows={3} className={field + ' resize-none'} />
                  </div>
                </div>

                {error && <p className="mt-4 text-sm text-blood">⚠︎ {error}</p>}
                <button onClick={toStep2} className="mt-6 w-full rounded-full bg-blood px-8 py-4 text-sm font-bold text-white transition hover:bg-red-500">{t(TX.next)} →</button>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="mt-7 text-3xl font-black">{t(TX.photosTitle)}</h1>
                <p className="mt-2 text-sm leading-7 text-white/60">{t(TX.photosSub)}</p>

                <div className="mt-6 space-y-4">
                  <PhotoBox label={t(TX.inbody)} hint={t(TX.uploadHint)} change={t(TX.change)} value={inbody} onFile={upload(setInbody)} wide />
                  <div className="pt-2 text-[11px] font-bold uppercase tracking-widest text-white/40">{t(TX.bodyPhotosLabel)}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <PhotoBox label={t(TX.pFront)} hint={t(TX.uploadHint)} change={t(TX.change)} value={photoFront} onFile={upload(setPhotoFront)} />
                    <PhotoBox label={t(TX.pBack)} hint={t(TX.uploadHint)} change={t(TX.change)} value={photoBack} onFile={upload(setPhotoBack)} />
                    <PhotoBox label={t(TX.pRight)} hint={t(TX.uploadHint)} change={t(TX.change)} value={photoSideRight} onFile={upload(setPhotoSideRight)} />
                    <PhotoBox label={t(TX.pLeft)} hint={t(TX.uploadHint)} change={t(TX.change)} value={photoSideLeft} onFile={upload(setPhotoSideLeft)} />
                  </div>
                </div>

                {error && <p className="mt-4 text-sm text-blood">⚠︎ {error}</p>}
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep(1)} className="rounded-full border hair px-6 py-4 text-sm font-bold text-white/70 transition hover:text-white">← {t(TX.backStep)}</button>
                  <button onClick={toStep3} className="flex-1 rounded-full bg-blood px-8 py-4 text-sm font-bold text-white transition hover:bg-red-500">{t(TX.next)} →</button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="mt-7 text-3xl font-black">{t(TX.payTitle)}</h1>
                <p className="mt-2 text-sm leading-7 text-white/60">{t(TX.payHow)}</p>

                {/* One-tap InstaPay quick-send */}
                <a
                  href={SITE.instapayLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-blood px-6 py-4 text-center text-base font-bold text-white shadow-lg transition hover:bg-red-500"
                >
                  <span>⚡ {t(TX.payNow)} ({plan.priceEGP.toLocaleString()} {t(TX.egp)})</span>
                </a>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border hair p-5">
                    <div className="text-[11px] uppercase tracking-widest text-white/40">{t(TX.orManual)}</div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span dir="ltr" className="text-2xl font-black tracking-wide">{SITE.instapayNumber}</span>
                      <button onClick={() => copy(SITE.instapayNumber)} className="rounded-full border hair px-3 py-1.5 text-xs font-bold text-white/70 hover:text-white">{copied ? t(TX.copied) : t(TX.copy)}</button>
                    </div>
                    <div dir="ltr" className="mt-1 text-xs text-white/45">{SITE.instapayHandle}</div>
                  </div>
                  <div className="rounded-2xl border hair p-5">
                    <div className="text-[11px] uppercase tracking-widest text-white/40">{t(TX.amount)}</div>
                    <div className="mt-2 text-2xl font-black">
                      {plan.priceEGP.toLocaleString()} <span className="text-sm font-normal text-white/45">{t(TX.egp)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <input value={payer} onChange={(e) => setPayer(e.target.value)} placeholder={t(TX.payer)} dir="ltr" className={field} />
                  <PhotoBox label={t(TX.receipt)} hint={t(TX.receiptHint)} change={t(TX.receiptChange)} value={receipt} onFile={upload(setReceipt)} wide />
                </div>

                {error && <p className="mt-4 text-sm text-blood">⚠︎ {error}</p>}
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setStep(2)} className="rounded-full border hair px-6 py-4 text-sm font-bold text-white/70 transition hover:text-white">← {t(TX.backStep)}</button>
                  <button onClick={submit} disabled={busy} className="flex-1 rounded-full bg-blood px-8 py-4 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50">
                    {busy ? t(TX.sending) : t(TX.confirm)}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function PriceValue({ value, masked, className }: { value: string; masked?: boolean; className?: string }) {
  if (!masked) return <div className={className}>{value}</div>;
  return (
    <div
      className={`relative inline-flex min-h-8 min-w-28 select-none items-center justify-center overflow-hidden rounded-full bg-sky-200/10 px-5 text-transparent ring-1 ring-inset ring-sky-200/25 ${className || ''}`}
      aria-label="Hidden price"
    >
      <span aria-hidden="true" className="opacity-0">
        {value}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 top-1/2 h-5 -translate-y-1/2 rounded-full bg-white/45 blur-md"
      />
    </div>
  );
}

function PhotoBox({
  label,
  hint,
  change,
  value,
  onFile,
  wide = false,
}: {
  label: string;
  hint: string;
  change: string;
  value: string | null;
  onFile: (f?: File | null) => void;
  wide?: boolean;
}) {
  return (
    <label className="block cursor-pointer rounded-2xl border hair bg-white/[0.02] p-4 transition hover:border-blood/60">
      <div className="text-[11px] uppercase tracking-widest text-white/40">{label}</div>
      {value ? (
        <div className="mt-3 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className={`${wide ? 'h-28 w-28' : 'h-24 w-24'} rounded-xl object-cover ring-1 ring-blood/30`} />
          <span className="text-xs text-blood">{change}</span>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2 text-sm text-white/50">
          <span className="text-lg">＋</span> {hint}
        </div>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </label>
  );
}
