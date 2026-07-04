'use client';

import { useState, useEffect } from 'react';
import { toIntlDigits } from '@/lib/site';
import type { Plan } from '@/lib/plans';

type Lang = 'ar' | 'en';

/**
 * Private dashboard for the coach. Enter the admin key to load every paid order.
 * Review each customer's intake and receipt, then approve or reject.
 * Fully bilingual (Arabic / English) via the toggle in the header.
 */
const TX = {
  title: { ar: 'عُمدة · لوحة التحكم', en: 'OMDA · ADMIN' },
  adminKey: { ar: 'كود الأدمن', en: 'Admin key' },
  load: { ar: 'تحميل', en: 'Load' },
  wrongKey: { ar: 'الكود غير صحيح.', en: 'Wrong key.' },
  backendError: { ar: 'حصل خطأ في السيرفر. حاول تاني بعد لحظات.', en: 'Admin backend error. Try again in a moment.' },
  noOrders: { ar: 'لا توجد طلبات بعد.', en: 'No orders yet.' },
  months: { ar: 'شهر', en: 'mo' },
  // intake labels
  phone: { ar: 'الهاتف', en: 'Phone' },
  email: { ar: 'البريد', en: 'Email' },
  gender: { ar: 'النوع', en: 'Gender' },
  age: { ar: 'السن', en: 'Age' },
  height: { ar: 'الطول', en: 'Height' },
  weight: { ar: 'الوزن', en: 'Weight' },
  paidFrom: { ar: 'دفع من', en: 'Paid from' },
  goal: { ar: 'الهدف', en: 'Goal' },
  sport: { ar: 'الرياضة', en: 'Sport' },
  performance: { ar: 'الأداء (الحالي ← المستهدف)', en: 'Performance (now → target)' },
  illness: { ar: 'أمراض / إصابات', en: 'Illness / injuries' },
  supplements: { ar: 'مكملات', en: 'Supplements' },
  notes: { ar: 'ملاحظات', en: 'Notes' },
  trainingDays: { ar: 'أيام التمرين', en: 'Training days' },
  trainingDaysNotes: { ar: 'أيام التمرين المحددة', en: 'Specific training days' },
  // photos
  showPhotos: { ar: '📷 إظهار الصور', en: '📷 Show photos' },
  loading: { ar: 'جاري التحميل…', en: 'Loading…' },
  inbody: { ar: 'إن بودي', en: 'InBody' },
  front: { ar: 'أمامي', en: 'Front' },
  back: { ar: 'خلفي', en: 'Back' },
  right: { ar: 'يمين', en: 'Right' },
  left: { ar: 'يسار', en: 'Left' },
  receipt: { ar: 'الإيصال', en: 'Receipt' },
  // actions / states
  approvedNoLogin: { ar: '✅ تم قبول الطلب وتفعيله.', en: '✅ Order approved and activated.' },
  rejectedLabel: { ar: 'مرفوض: ', en: 'Rejected: ' },
  messageCustomer: { ar: 'مراسلة العميل على واتساب ←', en: 'Message customer on WhatsApp →' },
  approveInstead: { ar: 'قبول بدلاً من ذلك', en: 'Approve instead' },
  reasonPlaceholder: { ar: 'سبب الرفض (سيظهر للعميل)…', en: 'Reason for rejection (shown to the customer)…' },
  rejecting: { ar: 'جاري الرفض…', en: 'Rejecting…' },
  confirmReject: { ar: 'تأكيد الرفض', en: 'Confirm reject' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  enterReason: { ar: 'اكتب سبب الرفض.', en: 'Enter a rejection reason.' },
  approving: { ar: 'جاري القبول…', en: 'Approving…' },
  retryApprove: { ar: 'إعادة المحاولة', en: 'Retry approve' },
  approveCreate: { ar: 'قبول الطلب', en: 'Approve order' },
  reject: { ar: 'رفض', en: 'Reject' },
  // status badges
  stPending: { ar: 'قيد المراجعة', en: 'PENDING' },
  stActive: { ar: 'مُفعّل', en: 'ACTIVE' },
  stFailed: { ar: 'فشل', en: 'FAILED' },
  stRejected: { ar: 'مرفوض', en: 'REJECTED' },
  // Pricing manager
  pricingTitle: { ar: 'الباقات والأسعار', en: 'Bundles & pricing' },
  pricingSub: { ar: 'تحكّم كامل: عدّل السعر، أضف باقة، أو احذف باقة. التغييرات تظهر فوراً في صفحة الأسعار.', en: 'Full control: edit price, add a bundle, or remove one. Changes appear instantly on the pricing page.' },
  planNameAr: { ar: 'الاسم (عربي)', en: 'Name (Arabic)' },
  planNameEn: { ar: 'الاسم (إنجليزي)', en: 'Name (English)' },
  planTagAr: { ar: 'وصف قصير (عربي)', en: 'Tagline (Arabic)' },
  planTagEn: { ar: 'وصف قصير (إنجليزي)', en: 'Tagline (English)' },
  planMonths: { ar: 'عدد الشهور', en: 'Months' },
  planPrice: { ar: 'السعر الحالي (ج.م)', en: 'Current price (EGP)' },
  planOriginalPrice: { ar: 'السعر قبل الخصم (اختياري)', en: 'Price before discount (optional)' },
  discountHint: { ar: 'لو أكبر من السعر الحالي، هيظهر مشطوب مع نسبة الخصم.', en: 'If higher than the current price, it shows struck-through with a discount %.' },
  planFeatured: { ar: 'الباقة المميّزة (تظهر مكبّرة)', en: 'Highlighted plan' },
  loading2: { ar: 'جاري التحميل…', en: 'Loading…' },
  planFeatures: { ar: 'المزايا', en: 'Features' },
  featAr: { ar: 'ميزة (عربي)', en: 'Feature (Arabic)' },
  featEn: { ar: 'ميزة (إنجليزي)', en: 'Feature (English)' },
  addFeature: { ar: '+ إضافة ميزة', en: '+ Add feature' },
  removeBundle: { ar: 'حذف الباقة', en: 'Remove bundle' },
  addBundle: { ar: '+ إضافة باقة', en: '+ Add bundle' },
  savePricing: { ar: 'حفظ الأسعار', en: 'Save pricing' },
  savingPricing: { ar: 'جاري الحفظ…', en: 'Saving…' },
  pricingSaved: { ar: 'تم حفظ الأسعار ✓', en: 'Pricing saved ✓' },
  loadingPricing: { ar: 'جاري تحميل الباقات…', en: 'Loading bundles…' },
  newBundleName: { ar: 'باقة جديدة', en: 'New bundle' },
  // Telegram
  telegramTitle: { ar: 'إشعارات تيليجرام', en: 'Telegram notifications' },
  telegramDesc: { ar: 'اربط تيليجرام عشان يوصلك إشعار فوري عند وصول طلب عميل جديد.', en: 'Connect Telegram to receive an instant alert when a new client request arrives.' },
  telegramConnected: { ar: 'متصل', en: 'Connected' },
  telegramConnect: { ar: 'ربط تيليجرام', en: 'Connect Telegram' },
  telegramReconnect: { ar: 'ربط شات جديد', en: 'Connect new chat' },
  telegramDisconnect: { ar: 'فصل تيليجرام', en: 'Disconnect Telegram' },
  telegramDisconnecting: { ar: 'جاري الفصل…', en: 'Disconnecting…' },
  telegramMissing: { ar: 'توكن بوت تيليجرام غير مضبوط على Vercel.', en: 'Telegram bot token is not configured on Vercel.' },
  telegramHint: { ar: 'بعد فتح تيليجرام اضغط Start. بعدها أي طلب جديد هيظهر هنا وهناك.', en: 'After Telegram opens, press Start. New requests will show here and there.' },
} as const;

export default function AdminPage() {
  const [lang, setLang] = useState<Lang>('ar');
  const ar = lang === 'ar';
  const t = <T,>(v: { ar: T; en: T }) => v[lang];

  const [key, setKey] = useState('');
  // 'full' = main coach key; 'swim' = Coach Abdullah's key (Swimmers Bundle only).
  const [role, setRole] = useState<'full' | 'swim'>('full');
  // The dashboard is organised into sections: approvals / pricing / content.
  const [section, setSection] = useState<'orders' | 'pricing' | 'content'>('orders');
  const [orders, setOrders] = useState<any[] | null>(null);
  const [telegram, setTelegram] = useState<{ configured: boolean; connected: boolean; link: string | null } | null>(null);
  const [telegramBusy, setTelegramBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  // Photos are fetched per-order on demand (keeps the free-tier DB transfer tiny).
  const [photos, setPhotos] = useState<Record<string, any>>({});
  const [photoBusy, setPhotoBusy] = useState<string | null>(null);

  const loadPhotos = async (orderId: string) => {
    setPhotoBusy(orderId);
    try {
      const res = await fetch(
        `/api/accounts?key=${encodeURIComponent(key)}&images=${encodeURIComponent(orderId)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.images) setPhotos((p) => ({ ...p, [orderId]: data.images }));
    } finally {
      setPhotoBusy(null);
    }
  };

  const load = async () => {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/accounts?key=${encodeURIComponent(key)}`);
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) return setError(t(TX.wrongKey));
      if (!res.ok) return setError(data?.error || t(TX.backendError));
      setOrders(data.orders || []);
      const nextRole = data.role === 'swim' ? 'swim' : 'full';
      setRole(nextRole);
      if (nextRole === 'full') {
        fetch(`/api/telegram/link?key=${encodeURIComponent(key)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => setTelegram(d))
          .catch(() => setTelegram(null));
      } else {
        setTelegram(null);
      }
    } catch {
      setError(t(TX.backendError));
    } finally {
      setLoading(false);
    }
  };

  const refreshTelegram = async () => {
    if (role !== 'full' || !key.trim()) return;
    const res = await fetch(`/api/telegram/link?key=${encodeURIComponent(key)}`);
    const data = await res.json().catch(() => null);
    if (res.ok) setTelegram(data);
  };

  const disconnectTelegram = async () => {
    if (telegramBusy) return;
    setTelegramBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/telegram/link?key=${encodeURIComponent(key)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data?.error || t(TX.backendError));
      await refreshTelegram();
    } catch {
      setError(t(TX.backendError));
    } finally {
      setTelegramBusy(false);
    }
  };

  const approve = async (orderId: string) => {
    setBusyId(orderId);
    setError('');
    try {
      const res = await fetch(`/api/accounts?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data?.error || 'Approval failed.');
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (orderId: string) => {
    if (reason.trim().length < 3) return setError(t(TX.enterReason));
    setBusyId(orderId);
    setError('');
    try {
      const res = await fetch(`/api/accounts?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'reject', reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data?.error || 'Reject failed.');
      setRejectingId(null);
      setReason('');
      await load();
    } finally {
      setBusyId(null);
    }
  };

  /** wa.me link to message the customer (e.g. about a rejection). */
  const customerWa = (o: any, text: string) => {
    const d = toIntlDigits(o.customerPhone || '');
    return d ? `https://wa.me/${d}?text=${encodeURIComponent(text)}` : null;
  };

  const badge = (s: string) =>
    s === 'ACTIVE'
      ? 'bg-emerald-500/15 text-emerald-300'
      : s === 'FAILED'
      ? 'bg-red-500/15 text-red-300'
      : s === 'REJECTED'
      ? 'bg-amber-500/15 text-amber-300'
      : 'bg-white/10 text-white/70';

  const statusLabel = (s: string) =>
    s === 'ACTIVE' ? t(TX.stActive)
      : s === 'FAILED' ? t(TX.stFailed)
      : s === 'REJECTED' ? t(TX.stRejected)
      : t(TX.stPending);

  /* ─── Login gate ───────────────────────────────────────────────
     Until the coach loads their orders we show a dedicated, premium
     liquid-glass sign-in screen instead of a bare input. */
  if (!orders) {
    return (
      <main
        dir={ar ? 'rtl' : 'ltr'}
        className="glow-stage flex min-h-screen items-center justify-center bg-ink px-5 py-12 text-paper"
      >
        {/* Faint film-grain backdrop kept subtle under the blobs. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_-10%,rgba(229,9,20,0.12),transparent_55%)]" />

        <div className="animate-fade-up relative w-full max-w-[420px]">
          {/* Brand mark */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="glass-red mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black tracking-tight">
              ع
            </div>
            <h1 className="text-2xl font-black tracking-[0.22em]">{t(TX.title)}</h1>
            <p className="mt-2 text-xs font-medium tracking-wide text-white/45">
              {ar ? 'لوحة تحكم المدرب الخاصة' : 'Private coach control panel'}
            </p>
          </div>

          {/* Glass sign-in card */}
          <div className="glass rounded-[28px] p-7">
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
              {t(TX.adminKey)}
            </label>
            <div className="relative">
              <input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                type="password"
                placeholder="••••••••••"
                dir="ltr"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && load()}
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5 text-sm tracking-wide text-white outline-none transition focus:border-blood/60 focus:bg-black/35 focus:ring-2 focus:ring-blood/25"
              />
            </div>

            <button
              onClick={load}
              disabled={loading || !key.trim()}
              className="sheen mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-paper px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-ink transition-all duration-200 hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Spinner /> {t(TX.loading2)}
                </>
              ) : (
                <>
                  {t(TX.load)}
                  <span className="text-base leading-none">{ar ? '←' : '→'}</span>
                </>
              )}
            </button>

            {error && (
              <p className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-center text-sm text-red-300">
                {error}
              </p>
            )}
          </div>

          {/* Language toggle */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setLang(ar ? 'en' : 'ar')}
              className="glass rounded-full px-5 py-2 text-xs font-bold text-white/70 transition hover:text-white"
            >
              {ar ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main dir={ar ? 'rtl' : 'ltr'} className="glow-stage min-h-screen bg-ink px-4 py-12 text-paper sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="glass sticky top-4 z-30 flex items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="glass-red flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black">ع</span>
            <div>
              <h1 className="text-base font-black tracking-[0.18em] leading-tight">{t(TX.title)}</h1>
              <p className="text-[10px] font-medium tracking-wide text-white/40">
                {role === 'swim' ? (ar ? 'كابتن عبدالله' : 'Coach Abdullah') : ar ? 'المدرب الرئيسي' : 'Head coach'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-1.5 text-xs font-bold text-white/70 transition hover:text-white disabled:opacity-50"
              aria-label="refresh"
            >
              {loading ? <Spinner /> : <span className="text-sm leading-none">⟳</span>}
              {ar ? 'تحديث' : 'Refresh'}
            </button>
            <button
              onClick={() => setLang(ar ? 'en' : 'ar')}
              className="rounded-full border border-white/12 bg-white/[0.03] px-3.5 py-1.5 text-xs font-bold text-white/70 transition hover:text-white"
            >
              {ar ? 'EN' : 'ع'}
            </button>
          </div>
        </div>
        {error && <p className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>}
        {orders && role === 'swim' && (
          <p className="mt-4 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs text-sky-200">
            {ar
              ? '🏊 وضع كابتن عبدالله — بتشوف طلبات باقة السبّاحين فقط.'
              : '🏊 Coach Abdullah mode — you see Swimmers Bundle orders only.'}
          </p>
        )}

        {orders && role === 'full' && telegram && (
          <div className="glass mt-4 rounded-2xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black">{t(TX.telegramTitle)}</h2>
                  {telegram.connected && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {t(TX.telegramConnected)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-white/45">
                  {telegram.configured ? t(TX.telegramDesc) : t(TX.telegramMissing)}
                </p>
                {telegram.configured && <p className="mt-1 text-[11px] text-white/35">{t(TX.telegramHint)}</p>}
              </div>
              {telegram.configured && telegram.link && (
                <div className="flex flex-wrap gap-2">
                  <a
                    href={telegram.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setTimeout(refreshTelegram, 3000)}
                    className="rounded-full bg-paper px-5 py-2 text-xs font-bold text-ink transition hover:bg-white/85"
                  >
                    {telegram.connected ? t(TX.telegramReconnect) : t(TX.telegramConnect)}
                  </a>
                  {telegram.connected && (
                    <button
                      onClick={disconnectTelegram}
                      disabled={telegramBusy}
                      className="rounded-full border border-red-500/40 px-5 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {telegramBusy ? t(TX.telegramDisconnecting) : t(TX.telegramDisconnect)}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section tabs: Approvals / Pricing / Content. Pricing & content are
            the MAIN coach's full-control areas; the swim key sees orders only. */}
        {orders && role === 'full' && (
          <div className="glass mt-6 inline-flex flex-wrap gap-1.5 rounded-full p-1.5">
            {([
              ['orders', { ar: '📥 الطلبات والموافقات', en: '📥 Orders & approvals' }],
              ['pricing', { ar: '💰 الباقات والأسعار', en: '💰 Bundles & pricing' }],
              ['content', { ar: '🎨 محتوى الموقع', en: '🎨 Site content' }],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`rounded-full px-5 py-2 text-sm font-bold transition-all duration-200 ${
                  section === id
                    ? 'bg-blood text-white shadow-[0_8px_24px_-8px_rgba(229,9,20,0.7)]'
                    : 'text-white/55 hover:text-white'
                }`}
              >
                {t(label)}
              </button>
            ))}
          </div>
        )}

        {orders && role === 'full' && section === 'pricing' && <PricingManager keyValue={key} t={t} />}
        {orders && role === 'full' && section === 'content' && <ContentManager keyValue={key} t={t} ar={ar} onZoom={setZoom} />}

        {orders && (role === 'swim' || section === 'orders') && (
          <div className="mt-8 grid gap-4">
            {orders.length === 0 && <p className="text-white/40">{t(TX.noOrders)}</p>}
            {orders.map((o) => (
              <div key={o.id} className="glass rounded-3xl p-5 transition-transform duration-300 hover:-translate-y-0.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white/45" dir="ltr">{o.reference}</span>
                      {(o.bundle === 'swimmers' || String(o.planId || '').startsWith('swim')) && (
                        <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                          🏊 {ar ? 'باقة السبّاحين' : 'SWIMMERS'}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-lg font-bold">{o.customerName}</div>
                    <div className="text-xs text-white/45">
                      {o.months} {t(TX.months)} · {o.amountEGP} {ar ? 'ج.م' : 'EGP'}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${badge(o.status)}`}>{statusLabel(o.status)}</span>
                </div>

                {/* Intake */}
                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-4">
                  <Info label={t(TX.phone)} value={o.customerPhone} />
                  <Info label={t(TX.email)} value={o.customerEmail} />
                  <Info label={t(TX.gender)} value={o.gender} />
                  <Info label={t(TX.age)} value={o.age} />
                  <Info label={t(TX.height)} value={o.heightCm ? `${o.heightCm} cm` : null} />
                  <Info label={t(TX.weight)} value={o.weightKg ? `${o.weightKg} kg` : null} />
                  <Info label={t(TX.paidFrom)} value={o.payerHandle} />
                  <Info label={t(TX.trainingDays)} value={o.trainingDays ? `${o.trainingDays} / wk` : null} />
                </div>
                {o.trainingDaysNotes && <Note label={t(TX.trainingDaysNotes)} value={o.trainingDaysNotes} />}
                {o.goal && <Note label={t(TX.goal)} value={o.goal} />}
                {o.sport && <Note label={t(TX.sport)} value={o.sport} />}
                {o.sportMetrics && <Note label={t(TX.performance)} value={o.sportMetrics} />}
                {o.illness && <Note label={t(TX.illness)} value={o.illness} />}
                {o.supplements && <Note label={t(TX.supplements)} value={o.supplements} />}
                {o.notes && <Note label={t(TX.notes)} value={o.notes} />}

                {/* Photo gallery — loaded on demand to keep the database on the free tier */}
                {o.hasPhotos && !photos[o.id] && (
                  <button
                    onClick={() => loadPhotos(o.id)}
                    disabled={photoBusy === o.id}
                    className="mt-4 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
                  >
                    {photoBusy === o.id ? t(TX.loading) : t(TX.showPhotos)}
                  </button>
                )}
                {photos[o.id] && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Thumb label={t(TX.inbody)} src={photos[o.id].inbody} onZoom={setZoom} />
                    <Thumb label={t(TX.front)} src={photos[o.id].photoFront} onZoom={setZoom} />
                    <Thumb label={t(TX.back)} src={photos[o.id].photoBack} onZoom={setZoom} />
                    <Thumb label={t(TX.right)} src={photos[o.id].photoSideRight} onZoom={setZoom} />
                    <Thumb label={t(TX.left)} src={photos[o.id].photoSideLeft} onZoom={setZoom} />
                    <Thumb label={t(TX.receipt)} src={photos[o.id].receipt} onZoom={setZoom} />
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex-1" />

                  {o.status === 'ACTIVE' ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4 text-sm">
                      <div className="text-emerald-200">{t(TX.approvedNoLogin)}</div>
                    </div>
                  ) : o.status === 'REJECTED' ? (
                    <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-sm sm:w-auto">
                      <div className="text-amber-200"><span className="text-white/45">{t(TX.rejectedLabel)}</span>{o.rejectReason}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {customerWa(o, `مرحبا ${o.customerName}، بخصوص طلبك في عُمدة (${o.reference}) محتاج تعديل: ${o.rejectReason} — ياريت تظبط ده وتبعتلنا تاني.`) && (
                          <a
                            href={customerWa(o, `مرحبا ${o.customerName}، بخصوص طلبك في عُمدة (${o.reference}) محتاج تعديل: ${o.rejectReason} — ياريت تظبط ده وتبعتلنا تاني.`)!}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-amber-500 px-5 py-2 text-xs font-bold text-ink transition hover:bg-amber-400"
                          >
                            {t(TX.messageCustomer)}
                          </a>
                        )}
                        <button onClick={() => approve(o.id)} disabled={busyId === o.id} className="rounded-full border hair px-4 py-2 text-xs font-bold text-white/70 transition hover:text-white disabled:opacity-50">
                          {t(TX.approveInstead)}
                        </button>
                      </div>
                    </div>
                  ) : rejectingId === o.id ? (
                    <div className="w-full max-w-md">
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={t(TX.reasonPlaceholder)}
                        rows={2}
                        className="w-full rounded-2xl border border-amber-500/30 bg-white/[0.02] px-4 py-3 text-sm outline-none placeholder:text-white/35 focus:border-amber-500/60"
                      />
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => reject(o.id)} disabled={busyId === o.id} className="rounded-full bg-amber-500 px-5 py-2 text-xs font-bold text-ink transition hover:bg-amber-400 disabled:opacity-50">
                          {busyId === o.id ? t(TX.rejecting) : t(TX.confirmReject)}
                        </button>
                        <button onClick={() => { setRejectingId(null); setReason(''); }} className="rounded-full border hair px-4 py-2 text-xs font-bold text-white/70 transition hover:text-white">
                          {t(TX.cancel)}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => approve(o.id)}
                        disabled={busyId === o.id}
                        className="rounded-full bg-paper px-6 py-2.5 text-sm font-bold text-ink transition hover:bg-white/85 disabled:opacity-50"
                      >
                        {busyId === o.id ? t(TX.approving) : o.status === 'FAILED' ? t(TX.retryApprove) : t(TX.approveCreate)}
                      </button>
                      <button
                        onClick={() => { setRejectingId(o.id); setReason(''); setError(''); }}
                        className="rounded-full border border-amber-500/40 px-6 py-2.5 text-sm font-bold text-amber-300 transition hover:bg-amber-500/10"
                      >
                        {t(TX.reject)}
                      </button>
                    </div>
                  )}
                </div>

                {o.status === 'FAILED' && o.error && (
                  <p className="mt-3 text-xs text-red-300">⚠︎ {o.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receipt lightbox */}
      {zoom && (
        <div onClick={() => setZoom(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="receipt" className="max-h-[90vh] max-w-full rounded-xl" />
        </div>
      )}
    </main>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/35">{label}</div>
      <div className="text-white/85">{value || '—'}</div>
    </div>
  );
}

function Note({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 rounded-xl bg-white/5 px-4 py-2 text-sm text-white/80">
      <span className="text-white/40">{label}: </span>{value}
    </div>
  );
}

function Thumb({ label, src, onZoom }: { label: string; src: string | null; onZoom: (s: string) => void }) {
  if (!src) return null;
  return (
    <button onClick={() => onZoom(src)} className="group text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="h-20 w-20 rounded-xl object-cover ring-1 ring-white/10 transition group-hover:ring-white/40" />
      <div className="mt-1 text-[10px] text-white/40">{label}</div>
    </button>
  );
}

/* ───────────────────────── Pricing / bundles manager ───────────────────────── */

const blankPlan = (): Plan => ({
  id: 'plan-' + Math.random().toString(36).slice(2, 7),
  months: 1,
  // Left blank so the coach types a fresh price (no leading "0" to fight).
  priceEGP: undefined as unknown as number,
  name: { ar: '', en: '' },
  tagline: { ar: '', en: '' },
  features: [],
  featured: false,
});

function PricingManager({ keyValue, t }: { keyValue: string; t: <T,>(v: { ar: T; en: T }) => T }) {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setPlans(d?.plans?.length ? (d.plans as Plan[]) : []))
      .catch(() => setPlans([]));
  }, []);

  const patch = (i: number, p: Partial<Plan>) =>
    setPlans((ps) => ps!.map((pl, idx) => (idx === i ? { ...pl, ...p } : pl)));
  const patchName = (i: number, lang: 'ar' | 'en', v: string) =>
    setPlans((ps) => ps!.map((pl, idx) => (idx === i ? { ...pl, name: { ...pl.name, [lang]: v } } : pl)));
  const patchTag = (i: number, lang: 'ar' | 'en', v: string) =>
    setPlans((ps) => ps!.map((pl, idx) => (idx === i ? { ...pl, tagline: { ...pl.tagline, [lang]: v } } : pl)));
  const patchFeat = (i: number, fi: number, lang: 'ar' | 'en', v: string) =>
    setPlans((ps) =>
      ps!.map((pl, idx) =>
        idx === i ? { ...pl, features: pl.features.map((f, j) => (j === fi ? { ...f, [lang]: v } : f)) } : pl,
      ),
    );
  const addFeat = (i: number) =>
    setPlans((ps) => ps!.map((pl, idx) => (idx === i ? { ...pl, features: [...pl.features, { ar: '', en: '' }] } : pl)));
  const removeFeat = (i: number, fi: number) =>
    setPlans((ps) => ps!.map((pl, idx) => (idx === i ? { ...pl, features: pl.features.filter((_, j) => j !== fi) } : pl)));
  const removePlan = (i: number) => setPlans((ps) => ps!.filter((_, idx) => idx !== i));
  const addPlan = () => setPlans((ps) => [...(ps || []), blankPlan()]);
  // Single-select highlight: turning one on turns the rest off (radio-like);
  // clicking the active one clears it.
  const toggleFeatured = (i: number) =>
    setPlans((ps) => ps!.map((pl, idx) => ({ ...pl, featured: idx === i ? !pl.featured : false })));

  const save = async () => {
    if (!plans) return;
    setBusy(true);
    setErr('');
    setMsg('');
    try {
      const res = await fetch(`/api/plans?key=${encodeURIComponent(keyValue)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || 'Save failed.');
      } else {
        setPlans(data.plans);
        setMsg(t(TX.pricingSaved));
        setTimeout(() => setMsg(''), 3000);
      }
    } catch {
      setErr('Save failed.');
    } finally {
      setBusy(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none transition focus:border-blood/50 focus:ring-1 focus:ring-blood/20';

  return (
    <section className="glass mt-8 rounded-3xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">{t(TX.pricingTitle)}</h2>
          <p className="mt-1 text-xs text-white/45">{t(TX.pricingSub)}</p>
        </div>
        <button onClick={addPlan} className="rounded-full border hair px-4 py-2 text-xs font-bold text-white/80 transition hover:text-white">
          {t(TX.addBundle)}
        </button>
      </div>

      {plans === null ? (
        <p className="mt-4 text-sm text-white/40">{t(TX.loadingPricing)}</p>
      ) : (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {plans.map((p, i) => (
              <div key={i} className={`rounded-2xl p-4 ${p.featured ? 'glass-red' : 'glass'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-white/40" dir="ltr">{p.id}</span>
                  <button onClick={() => removePlan(i)} className="rounded-full border border-red-500/30 px-3 py-1 text-[11px] font-bold text-red-300 transition hover:bg-red-500/10">
                    {t(TX.removeBundle)}
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Field label={t(TX.planNameAr)}><input dir="rtl" value={p.name.ar} onChange={(e) => patchName(i, 'ar', e.target.value)} className={inputCls} /></Field>
                  <Field label={t(TX.planNameEn)}><input dir="ltr" value={p.name.en} onChange={(e) => patchName(i, 'en', e.target.value)} className={inputCls} /></Field>
                  <Field label={t(TX.planTagAr)}><input dir="rtl" value={p.tagline.ar} onChange={(e) => patchTag(i, 'ar', e.target.value)} className={inputCls} /></Field>
                  <Field label={t(TX.planTagEn)}><input dir="ltr" value={p.tagline.en} onChange={(e) => patchTag(i, 'en', e.target.value)} className={inputCls} /></Field>
                  <Field label={t(TX.planMonths)}><NumInput min={1} value={p.months} onChange={(v) => patch(i, { months: v })} className={inputCls} /></Field>
                  <Field label={t(TX.planPrice)}><NumInput min={0} value={p.priceEGP} onChange={(v) => patch(i, { priceEGP: v })} className={inputCls} /></Field>
                  <Field label={t(TX.planOriginalPrice)}><NumInput min={0} value={p.originalPriceEGP} onChange={(v) => patch(i, { originalPriceEGP: v })} className={inputCls} /></Field>
                </div>
                <p className="mt-1.5 text-[10px] leading-4 text-white/35">{t(TX.discountHint)}</p>

                <button
                  type="button"
                  onClick={() => toggleFeatured(i)}
                  className={`mt-3 flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                    p.featured ? 'border-blood bg-blood text-white' : 'hair text-white/70 hover:text-white'
                  }`}
                >
                  <span>{t(TX.planFeatured)}</span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${p.featured ? 'border-white bg-white text-blood' : 'border-white/40'}`}>
                    {p.featured ? '✓' : ''}
                  </span>
                </button>

                {/* Which section the plan lives in: main grid or Swimmers Bundle. */}
                <button
                  type="button"
                  onClick={() => patch(i, { bundle: p.bundle === 'swimmers' ? undefined : 'swimmers' })}
                  className={`mt-2 flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                    p.bundle === 'swimmers' ? 'border-sky-400 bg-sky-500/15 text-sky-200' : 'hair text-white/70 hover:text-white'
                  }`}
                >
                  <span>🏊 {t({ ar: 'باقة السبّاحين (جيم + سباحة)', en: 'Swimmers Bundle (gym + swim)' })}</span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${p.bundle === 'swimmers' ? 'border-sky-300 bg-sky-300 text-ink' : 'border-white/40'}`}>
                    {p.bundle === 'swimmers' ? '✓' : ''}
                  </span>
                </button>

                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-widest text-white/35">{t(TX.planFeatures)}</div>
                  <div className="mt-2 space-y-2">
                    {p.features.map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2">
                        <input dir="rtl" placeholder={t(TX.featAr)} value={f.ar} onChange={(e) => patchFeat(i, fi, 'ar', e.target.value)} className={inputCls} />
                        <input dir="ltr" placeholder={t(TX.featEn)} value={f.en} onChange={(e) => patchFeat(i, fi, 'en', e.target.value)} className={inputCls} />
                        <button onClick={() => removeFeat(i, fi)} className="flex-shrink-0 rounded-lg border border-red-500/30 px-2 py-2 text-xs text-red-300 transition hover:bg-red-500/10">✕</button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => addFeat(i)} className="mt-2 text-xs font-bold text-white/60 transition hover:text-white">{t(TX.addFeature)}</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button onClick={save} disabled={busy} className="flex items-center justify-center gap-2 rounded-full bg-paper px-6 py-2.5 text-sm font-bold text-ink transition-all duration-200 hover:bg-white/85 active:scale-[0.97] disabled:opacity-50">
              {busy ? <><Spinner /> {t(TX.savingPricing)}</> : t(TX.savePricing)}
            </button>
            {msg && <span className="text-sm font-bold text-emerald-300">{msg}</span>}
            {err && <span className="text-sm text-red-300">{err}</span>}
          </div>
        </>
      )}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-white/35">{label}</span>
      {children}
    </label>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Numeric input that keeps its own text state so the field can be fully cleared
 * while typing — no more "0" stuck on the left when you delete the price. Empty
 * reports `undefined` to the parent; leading zeros are stripped on blur.
 */
function NumInput({
  value,
  onChange,
  min = 0,
  className,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  min?: number;
  className?: string;
}) {
  const [txt, setTxt] = useState(value === undefined || value === null ? '' : String(value));
  useEffect(() => {
    setTxt(value === undefined || value === null ? '' : String(value));
  }, [value]);
  return (
    <input
      type="number"
      min={min}
      dir="ltr"
      inputMode="numeric"
      value={txt}
      onChange={(e) => {
        const raw = e.target.value;
        setTxt(raw);
        onChange(raw === '' ? undefined : Number(raw));
      }}
      onBlur={() => {
        if (txt === '') return;
        const n = Number(txt);
        setTxt(Number.isFinite(n) ? String(n) : '');
      }}
      className={className}
    />
  );
}

/* ───────────────────────── Site content manager ───────────────────────── */

type Bi = { ar: string; en: string };
type Testimonial = { q: Bi; a: Bi };
type CustomSection = { id: string; title: Bi; body: Bi; images: string[] };
type SiteContent = { testimonials: Testimonial[]; transformations: string[]; swimmers: string[]; sections: CustomSection[] };

/** Downscale an image file to a compact JPEG data URL for storage. */
function compressImage(file: File, maxSide = 1100, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('no canvas'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
    img.src = url;
  });
}

/**
 * Full control over the public site: testimonials (add / edit / delete),
 * transformation + swimmer photo galleries (add / replace / delete) and custom
 * sections (add / edit / delete). Persisted to omda_settings via /api/content.
 */
function ContentManager({ keyValue, t, ar, onZoom }: { keyValue: string; t: <T,>(v: { ar: T; en: T }) => T; ar: boolean; onZoom: (src: string) => void }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/content')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setContent(d?.content || { testimonials: [], transformations: [], swimmers: [], sections: [] }))
      .catch(() => setContent({ testimonials: [], transformations: [], swimmers: [], sections: [] }));
  }, []);

  const save = async () => {
    if (!content) return;
    setBusy(true); setErr(''); setMsg('');
    try {
      const res = await fetch(`/api/content?key=${encodeURIComponent(keyValue)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setErr(data?.error || 'Save failed.');
      else { setContent(data.content); setMsg(t({ ar: 'تم حفظ المحتوى ✓', en: 'Content saved ✓' })); setTimeout(() => setMsg(''), 3000); }
    } catch { setErr('Save failed.'); }
    finally { setBusy(false); }
  };

  const addPhotos = async (key: 'transformations' | 'swimmers', files: FileList | null) => {
    if (!files || !content) return;
    try {
      const urls = await Promise.all(Array.from(files).slice(0, 12).map((f) => compressImage(f)));
      setContent({ ...content, [key]: [...content[key], ...urls].slice(0, 24) });
    } catch { setErr(t({ ar: 'تعذّرت قراءة الصورة', en: 'Could not read image' })); }
  };

  const card = 'glass rounded-2xl p-4';
  const input = 'w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none transition focus:border-blood/50 focus:ring-1 focus:ring-blood/20';

  if (!content) return <p className="mt-6 text-sm text-white/40">{t({ ar: 'جاري التحميل…', en: 'Loading…' })}</p>;

  const PhotoGrid = ({ section }: { section: 'transformations' | 'swimmers' }) => (
    <div className={card}>
      <div className="flex items-center justify-between">
        <h3 className="font-black">{section === 'transformations' ? t({ ar: 'صور التحوّلات', en: 'Transformation photos' }) : t({ ar: 'صور السبّاحين', en: 'Swimmer photos' })}</h3>
        <span className="text-[11px] text-white/40">{content[section].length}/24</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {content[section].map((src, i) => (
          <div key={i} className="group relative h-20 w-16 overflow-hidden rounded-lg border hair">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" onClick={() => onZoom(src)} className="h-full w-full cursor-zoom-in object-cover" />
            <button onClick={() => setContent({ ...content, [section]: content[section].filter((_, j) => j !== i) })}
              className="absolute right-0 top-0 z-10 bg-black/70 px-1 text-xs text-white opacity-0 transition group-hover:opacity-100">✕</button>
            <label className="absolute bottom-0 inset-x-0 cursor-pointer bg-black/60 text-center text-[9px] text-white opacity-0 transition group-hover:opacity-100">
              {t({ ar: 'استبدال', en: 'Replace' })}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]; e.target.value = '';
                if (f) { try { const u = await compressImage(f); setContent((c) => c ? { ...c, [section]: c[section].map((x, j) => j === i ? u : x) } : c); } catch {} }
              }} />
            </label>
          </div>
        ))}
        {content[section].length < 24 && (
          <label className="flex h-20 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/25 text-white/50 hover:border-white/50">
            <span className="text-lg">＋</span>
            <span className="text-[9px]">{t({ ar: 'صورة', en: 'Photo' })}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addPhotos(section, e.target.files)} />
          </label>
        )}
      </div>
    </div>
  );

  return (
    <section className="mt-8 space-y-4">
      {/* Testimonials */}
      <div className={card}>
        <div className="flex items-center justify-between">
          <h3 className="font-black">{t({ ar: 'آراء العملاء', en: 'Testimonials' })}</h3>
          <button onClick={() => setContent({ ...content, testimonials: [...content.testimonials, { q: { ar: '', en: '' }, a: { ar: '', en: '' } }] })}
            className="rounded-full border hair px-3 py-1.5 text-xs font-bold text-white/80 hover:text-white">{t({ ar: '+ إضافة رأي', en: '+ Add testimonial' })}</button>
        </div>
        <div className="mt-3 space-y-3">
          {content.testimonials.map((tm, i) => (
            <div key={i} className="rounded-xl border hair p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <textarea dir="rtl" value={tm.q.ar} onChange={(e) => setContent({ ...content, testimonials: content.testimonials.map((x, j) => j === i ? { ...x, q: { ...x.q, ar: e.target.value } } : x) })} placeholder={t({ ar: 'الرأي (عربي)', en: 'Quote (Arabic)' })} rows={2} className={input + ' resize-none'} />
                <textarea dir="ltr" value={tm.q.en} onChange={(e) => setContent({ ...content, testimonials: content.testimonials.map((x, j) => j === i ? { ...x, q: { ...x.q, en: e.target.value } } : x) })} placeholder={t({ ar: 'الرأي (إنجليزي)', en: 'Quote (English)' })} rows={2} className={input + ' resize-none'} />
                <input dir="rtl" value={tm.a.ar} onChange={(e) => setContent({ ...content, testimonials: content.testimonials.map((x, j) => j === i ? { ...x, a: { ...x.a, ar: e.target.value } } : x) })} placeholder={t({ ar: 'الاسم (عربي)', en: 'Name (Arabic)' })} className={input} />
                <input dir="ltr" value={tm.a.en} onChange={(e) => setContent({ ...content, testimonials: content.testimonials.map((x, j) => j === i ? { ...x, a: { ...x.a, en: e.target.value } } : x) })} placeholder={t({ ar: 'الاسم (إنجليزي)', en: 'Name (English)' })} className={input} />
              </div>
              <button onClick={() => setContent({ ...content, testimonials: content.testimonials.filter((_, j) => j !== i) })}
                className="mt-2 rounded-full border border-red-500/30 px-3 py-1 text-[11px] font-bold text-red-300 hover:bg-red-500/10">{t({ ar: 'حذف', en: 'Delete' })}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Photo galleries */}
      <div className="grid gap-4 md:grid-cols-2">
        <PhotoGrid section="transformations" />
        <PhotoGrid section="swimmers" />
      </div>

      {/* Custom sections */}
      <div className={card}>
        <div className="flex items-center justify-between">
          <h3 className="font-black">{t({ ar: 'أقسام مخصّصة', en: 'Custom sections' })}</h3>
          <button onClick={() => setContent({ ...content, sections: [...content.sections, { id: `sec${Date.now().toString(36)}`, title: { ar: '', en: '' }, body: { ar: '', en: '' }, images: [] }] })}
            className="rounded-full border hair px-3 py-1.5 text-xs font-bold text-white/80 hover:text-white">{t({ ar: '+ إضافة قسم', en: '+ Add section' })}</button>
        </div>
        <div className="mt-3 space-y-3">
          {content.sections.map((sec, i) => (
            <div key={sec.id} className="rounded-xl border hair p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input dir="rtl" value={sec.title.ar} onChange={(e) => setContent({ ...content, sections: content.sections.map((x, j) => j === i ? { ...x, title: { ...x.title, ar: e.target.value } } : x) })} placeholder={t({ ar: 'العنوان (عربي)', en: 'Title (Arabic)' })} className={input} />
                <input dir="ltr" value={sec.title.en} onChange={(e) => setContent({ ...content, sections: content.sections.map((x, j) => j === i ? { ...x, title: { ...x.title, en: e.target.value } } : x) })} placeholder={t({ ar: 'العنوان (إنجليزي)', en: 'Title (English)' })} className={input} />
                <textarea dir="rtl" value={sec.body.ar} onChange={(e) => setContent({ ...content, sections: content.sections.map((x, j) => j === i ? { ...x, body: { ...x.body, ar: e.target.value } } : x) })} placeholder={t({ ar: 'الوصف (عربي)', en: 'Description (Arabic)' })} rows={2} className={input + ' resize-none'} />
                <textarea dir="ltr" value={sec.body.en} onChange={(e) => setContent({ ...content, sections: content.sections.map((x, j) => j === i ? { ...x, body: { ...x.body, en: e.target.value } } : x) })} placeholder={t({ ar: 'الوصف (إنجليزي)', en: 'Description (English)' })} rows={2} className={input + ' resize-none'} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {sec.images.map((src, k) => (
                  <div key={k} className="group relative h-16 w-16 overflow-hidden rounded-lg border hair">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" onClick={() => onZoom(src)} className="h-full w-full cursor-zoom-in object-cover" />
                    <button onClick={() => setContent({ ...content, sections: content.sections.map((x, j) => j === i ? { ...x, images: x.images.filter((_, m) => m !== k) } : x) })}
                      className="absolute right-0 top-0 z-10 bg-black/70 px-1 text-xs text-white opacity-0 transition group-hover:opacity-100">✕</button>
                  </div>
                ))}
                {sec.images.length < 8 && (
                  <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/25 text-white/50 hover:border-white/50">
                    <span>＋</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                      const files = e.target.files; e.target.value = '';
                      if (files && content) {
                        try {
                          const urls = await Promise.all(Array.from(files).slice(0, 8 - sec.images.length).map((f) => compressImage(f)));
                          setContent((c) => c ? { ...c, sections: c.sections.map((x, j) => j === i ? { ...x, images: [...x.images, ...urls].slice(0, 8) } : x) } : c);
                        } catch {}
                      }
                    }} />
                  </label>
                )}
              </div>
              <button onClick={() => setContent({ ...content, sections: content.sections.filter((_, j) => j !== i) })}
                className="mt-2 rounded-full border border-red-500/30 px-3 py-1 text-[11px] font-bold text-red-300 hover:bg-red-500/10">{t({ ar: 'حذف القسم', en: 'Delete section' })}</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className="rounded-full bg-blood px-8 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-50">
          {busy ? t({ ar: 'جاري الحفظ…', en: 'Saving…' }) : t({ ar: 'حفظ المحتوى', en: 'Save content' })}
        </button>
        {msg && <span className="text-sm text-emerald-300">{msg}</span>}
        {err && <span className="text-sm text-red-300">{err}</span>}
      </div>
    </section>
  );
}
