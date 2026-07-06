'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SITE, whatsappLink } from '@/lib/site';

type Lang = 'ar' | 'en';

const TX = {
  back: { ar: 'الرئيسية', en: 'Home' },
  title: { ar: 'ابدأ اشتراكك', en: 'Start your subscription' },
  sub: {
    ar: 'اكتب بياناتك الأساسية وهنحولك مباشرة للتواصل مع الكابتن  واتساب.',
    en: "Enter your basic info and we'll connect you with the coach on WhatsApp right away.",
  },
  fullName: { ar: 'الاسم بالكامل', en: 'Full name' },
  phone: { ar: 'رقم الهاتف', en: 'Phone number' },
  height: { ar: 'الطول (سم)', en: 'Height (cm)' },
  weight: { ar: 'الوزن (كجم)', en: 'Weight (kg)' },
  gender: { ar: 'النوع', en: 'Gender' },
  male: { ar: 'ذكر', en: 'Male' },
  female: { ar: 'أنثى', en: 'Female' },
  submit: { ar: 'إرسال والتواصل مع المدرب', en: 'Send & contact the coach' },
  sending: { ar: 'جاري الإرسال…', en: 'Sending…' },
  errName: { ar: 'اكتب اسمك بالكامل.', en: 'Enter your full name.' },
  errPhone: { ar: 'اكتب رقم هاتف صحيح.', en: 'Enter a valid phone number.' },
  errBody: { ar: 'اكتب الطول والوزن والنوع.', en: 'Enter height, weight and gender.' },
  errGeneric: { ar: 'حصل خطأ، حاول تاني.', en: 'Something went wrong. Try again.' },
};

const waMessage =
  'السلام عليكم كابتن، تم تسجيل بياناتي الأولية في OmdaFit وأرغب في استكمال الاشتراك.';

export default function Subscribe1Page() {
  const [lang, setLang] = useState<Lang>('ar');
  const ar = lang === 'ar';
  const t = <T,>(v: { ar: T; en: T }) => v[lang];

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const field =
    'w-full rounded-2xl border hair bg-white/[0.02] px-4 py-3.5 text-sm outline-none placeholder:text-white/35 focus:border-blood/60';

  const submit = async () => {
    setError('');
    if (fullName.trim().length < 2) return setError(t(TX.errName));
    if (!/^[0-9+\-\s]{8,}$/.test(phone)) return setError(t(TX.errPhone));
    if (!height || !weight || !gender) return setError(t(TX.errBody));

    setBusy(true);
    try {
      const res = await fetch('/api/subscribe1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, heightCm: height, weightKg: weight, gender }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Error');
      window.location.href = whatsappLink(waMessage);
    } catch {
      setError(t(TX.errGeneric));
      setBusy(false);
    }
  };

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

      <div className="mx-auto max-w-md px-6 py-14">
        <h1 className="animate-fade-up text-3xl font-black">{t(TX.title)}</h1>
        <p className="mt-3 animate-fade-up text-sm leading-7 text-white/60">{t(TX.sub)}</p>

        <div className="mt-8 animate-fade-up space-y-3">
          <input className={field} placeholder={t(TX.fullName)} value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className={field} placeholder={t(TX.phone)} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className={field} placeholder={t(TX.height)} inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value.replace(/[^0-9]/g, ''))} />
            <input className={field} placeholder={t(TX.weight)} inputMode="numeric" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^0-9]/g, ''))} />
          </div>
          <select className={field} value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="" className="bg-ink">{t(TX.gender)}</option>
            <option value="male" className="bg-ink">{t(TX.male)}</option>
            <option value="female" className="bg-ink">{t(TX.female)}</option>
          </select>

          {error && <p className="text-sm font-bold text-blood">{error}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className="mt-2 w-full rounded-full bg-blood px-8 py-4 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-60"
          >
            {busy ? t(TX.sending) : t(TX.submit)}
          </button>
        </div>
      </div>
    </main>
  );
}
