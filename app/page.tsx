'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePlans } from '@/lib/use-plans';
import { useContent } from '@/lib/use-content';
import type { Plan } from '@/lib/plans';
import { SITE, whatsappLink } from '@/lib/site';

type Lang = 'ar' | 'en';
const pick = <T,>(lang: Lang, v: { ar: T; en: T }) => v[lang];
const SWIM_COACH_NAME = {
  ar: 'الكابتن عبدالله عبد الناصر',
  en: 'Coach Abdullah Abd El Nasser',
};
const HIDDEN_PRICE = { ar: 'السعر قريبًا', en: 'Price soon' };
const HIDDEN_COACH = { ar: 'مدرب السباحة', en: 'Swimming coach' };

const T = {
  nav: {
    services: { ar: 'الخدمات', en: 'Services' },
    about: { ar: 'الكابتن', en: 'Coach' },
    results: { ar: 'النتائج', en: 'Results' },
    swimmers: { ar: 'السباحة', en: 'Swimming' },
    pricing: { ar: 'الأسعار', en: 'Pricing' },
    faq: { ar: 'الأسئلة', en: 'FAQ' },
    subscribe: { ar: 'اشترك الآن', en: 'Subscribe' },
  },
  hero: {
    eyebrow: { ar: 'تدريب أونلاين احترافي', en: 'Online coaching' },
    line1: { ar: 'أنا جاهز،', en: "I'm ready." },
    line2: { ar: 'إنت جاهز؟', en: 'Are you ready?' },
    sub: {
      ar: 'برنامج تمارين وتغذية مفصّل على مقاسك، مع متابعة حقيقية خطوة بخطوة حتى توصل لهدفك.',
      en: 'A training and nutrition plan built around you, with real step-by-step follow-up until you reach your goal.',
    },
    cta: { ar: 'ابدأ التغيير', en: 'Start now' },
    ctaAlt: { ar: 'شوف الباقات', en: 'See plans' },
  },
  services: {
    kicker: { ar: 'إزاي بنشتغل', en: 'How it works' },
    title: { ar: 'كل اللي محتاجه في مكان واحد', en: 'Everything you need, in one place' },
    items: [
      { n: '01', t: { ar: 'تمارين بالفيديو', en: 'Workouts with video' }, d: { ar: 'برنامج مخصّص لمستواك وأهدافك، مع فيديو لكل تمرين عشان تأدّيه صح.', en: 'A plan for your level and goals, with a video for every exercise so your form is right.' } },
      { n: '02', t: { ar: 'تغذية مرنة', en: 'Flexible nutrition' }, d: { ar: 'نظام غذائي على ذوقك وميزانيتك — مش هتاكل نفس الأكل كل يوم.', en: "A diet built around your taste and budget — you won't eat the same food every day." } },
      { n: '03', t: { ar: 'متابعة مستمرة', en: 'Continuous follow-up' }, d: { ar: 'تواصل مباشر، تعديل الخطة أول بأول، ودعم حقيقي طول رحلتك.', en: 'Direct contact, plans adjusted as you go, and real support the whole way.' } },
    ],
  },
  about: {
    kicker: { ar: 'مين الكابتن', en: 'Your coach' },
    title: { ar: 'مين هو عمده؟', en: 'Who is Omda?' },
    creds: [
      { ar: 'مدرب شخصي معتمد من منظمة EREPS لعلوم الرياضة', en: 'Personal trainer certified by EREPS for sports science' },
      { ar: 'مُعِدّ بدني ومخطّط أحمال معتمد من ACE', en: 'Strength & conditioning coach and load planner certified by ACE' },
      { ar: 'المُعِدّ البدني لفريق السباحة بنادي وادي دجلة أسيوط', en: 'Strength & conditioning coach for the swimming team at Wadi Degla Club, Assiut' },
      { ar: 'أخصائي تدريب وظيفي', en: 'Functional training specialist' },
      { ar: 'محاضر مدربين بمعهد INSEP Pro', en: 'Trainer lecturer at INSEP Pro institute' },
    ],
    stats: [
      { v: '500+', l: { ar: 'متدرب', en: 'Clients' } },
      { v: '7+', l: { ar: 'سنين خبرة', en: 'Years' } },
      { v: '24/7', l: { ar: 'متابعة', en: 'Support' } },
    ],
  },
  results: {
    kicker: { ar: 'نتائج حقيقية', en: 'Real results' },
    title: { ar: 'تحوّلات العملاء', en: 'Client transformations' },
    sub: { ar: 'نتائج فعلية في خلال شهور — بالالتزام والمتابعة الصح.', en: 'Real change in months — with the right commitment and follow-up.' },
  },
  swimmers: {
    kicker: { ar: 'بطولات وميداليات', en: 'Medals & titles' },
    title: { ar: 'سبّاحون على منصّات التتويج', en: 'Swimmers on the podium' },
    sub: { ar: 'لاعبون درّبهم الكابتن وحقّقوا ميداليات في بطولات السباحة.', en: 'Athletes coached to medals in swimming championships.' },
  },
  pricing: {
    kicker: { ar: 'الاشتراكات', en: 'Plans' },
    title: { ar: 'اختار اللي يناسبك', en: 'Pick what fits you' },
    egp: { ar: 'ج.م', en: 'EGP' },
    choose: { ar: 'اشترك', en: 'Subscribe' },
    popular: { ar: 'الأكثر اختياراً', en: 'Most chosen' },
  },
  swimBundle: {
    kicker: { ar: 'جديد · للسبّاحين', en: 'New · For swimmers' },
    title: { ar: '🏊 باقة السبّاحين', en: '🏊 Swimmers Bundle' },
    sub: {
      ar: 'جيم وسباحة في اشتراك واحد. برنامج لياقة من كابتن عُمدة، وبرنامج سباحة احترافي من الكابتن عبدالله عبد الناصر — والاتنين بيتابعوك في نفس التطبيق.',
      en: 'Gym and swimming in one subscription. A fitness program from Coach Omda and a competitive swim program from Coach Abdullah Abd El Nasser — both coaching you inside one app.',
    },
  },
  testimonials: {
    kicker: { ar: 'آراء العملاء', en: 'Testimonials' },
    title: { ar: 'الناس بتقول إيه', en: 'What people say' },
    items: [
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
      { q: { ar: 'التمارين بالفيديو سهّلت عليّا كل حاجة، بعمل التمرين صح من غير ما حد يصححلي.', en: 'The video exercises made everything easy — I do each move correctly without anyone correcting me.' }, a: { ar: 'ياسمين', en: 'Yasmin' } },
      { q: { ar: 'رقمي في الجري اتحسن خالص، بقيت أجري ٥ كيلو من غير ما أقف.', en: 'My running improved a lot — I now run 5 km without stopping.' }, a: { ar: 'خالد', en: 'Khaled' } },
      { q: { ar: 'المتابعة الأسبوعية بتحفّزني، كل أسبوع بستنى أبعت قياساتي.', en: 'The weekly check-in motivates me — I look forward to sending my measurements.' }, a: { ar: 'إنجي', en: 'Engy' } },
      { q: { ar: 'نزّلت الكرش اللي قاعد معايا سنين، ولأول مرة بان عندي عضلات بطن.', en: 'Lost the belly I had for years, and for the first time I can see abs.' }, a: { ar: 'طارق', en: 'Tarek' } },
      { q: { ar: 'الكابتن صبور جدا وبيشرح، حسيت إني بتعلم مش بس بنفّذ.', en: 'The coach is very patient and explains everything — I felt I was learning, not just following.' }, a: { ar: 'ملك', en: 'Malak' } },
      { q: { ar: 'اشتغلت على إصابتي في الكتف بأمان والكابتن عارف بيعمل إيه، رجعت أرفع عادي.', en: 'We worked around my shoulder injury safely — the coach knows his stuff and I’m lifting normally again.' }, a: { ar: 'حسام', en: 'Hossam' } },
      { q: { ar: 'بقيت بنام أحسن ونفسيتي بقت رايقة، مش بس الجسم اللي اتغير.', en: 'I sleep better and my mood is calmer — it’s not just the body that changed.' }, a: { ar: 'رنا', en: 'Rana' } },
      { q: { ar: 'طالب وميزانيتي محدودة، النظام اتظبط عليّا وعملتله مكان جوه يومي.', en: 'I’m a student on a tight budget — the plan was tailored to me and fits my day.' }, a: { ar: 'زياد', en: 'Ziad' } },
      { q: { ar: 'صيام رمضان عدّى وأنا محافظة على وزني، الكابتن ظبطلي الأكل حوالين الفطار والسحور.', en: 'I kept my weight through Ramadan — the coach arranged my food around iftar and suhoor.' }, a: { ar: 'فاطمة', en: 'Fatma' } },
      { q: { ar: 'أول كوتش يخليني ألتزم فعلاً، النتيجة بتتكلم عن نفسها.', en: 'First coach who actually made me commit — the results speak for themselves.' }, a: { ar: 'عبدالرحمن', en: 'Abdelrahman' } },
      { q: { ar: 'نزلت مقاسين في الهدوم في شهر، وكل اللي حواليا لاحظوا.', en: 'Dropped two clothing sizes in a month, and everyone around me noticed.' }, a: { ar: 'شيماء', en: 'Shaimaa' } },
      { q: { ar: 'بشتغل ١٢ ساعة وكنت فاكر مستحيل، طلع ينفع مع برنامج مرتب وبسيط.', en: 'I work 12 hours and thought it was impossible — it works with a simple, organized plan.' }, a: { ar: 'تامر', en: 'Tamer' } },
      { q: { ar: 'الكابتن بيحفّزني لما بزهق، رسالة منه بتقلب يومي.', en: 'The coach motivates me when I lose steam — one message from him flips my whole day.' }, a: { ar: 'ندى', en: 'Nada' } },
      { q: { ar: 'زودت قوتي في البنش والديدلفت بأرقام مكنتش بحلم بيها.', en: 'My bench and deadlift numbers went up beyond what I dreamed of.' }, a: { ar: 'إسلام', en: 'Islam' } },
      { q: { ar: 'بحس إن فيه خطة واضحة قدامي مش مجرد كلام، كل أسبوع خطوة لقدام.', en: 'I feel there’s a clear plan ahead, not just talk — every week a step forward.' }, a: { ar: 'ريم', en: 'Reem' } },
      { q: { ar: 'السبليمنتس اللي رشّحهالي فرقت معايا، وكل ده بنصيحة مظبوطة مش بيع.', en: 'The supplements he recommended made a difference — honest advice, not a sales pitch.' }, a: { ar: 'باسم', en: 'Bassem' } },
      { q: { ar: 'أنا بنت ومكنتش بعرف أدخل الجيم، البرنامج خلاني واثقة في نفسي.', en: 'As a girl I didn’t know how to use the gym — this program made me confident.' }, a: { ar: 'جنى', en: 'Jana' } },
      { q: { ar: 'النتايج بانت من غير ما أكسر نفسي، كل حاجة متدرجة ومحسوبة.', en: 'Results showed without burning myself out — everything is gradual and measured.' }, a: { ar: 'وليد', en: 'Walid' } },
      { q: { ar: 'بقيت بشرب مياه وبنام كويس وباكل صح، حياتي كلها اتظبطت.', en: 'I drink water, sleep well, and eat right now — my whole life got organized.' }, a: { ar: 'سلمى', en: 'Salma' } },
      { q: { ar: 'بعد ٤٠ سنة لقيت حد بيفهمني ويصبر عليّا، نزلت ١٠ كيلو وضغطي اتحسن.', en: 'At 40 I finally found someone patient who gets me — lost 10 kg and my blood pressure improved.' }, a: { ar: 'هاني', en: 'Hany' } },
      { q: { ar: 'الأكل المصري كله موجود في الدايت، مكلتش حاجة غريبة ولا فلوس زيادة.', en: 'All the Egyptian food is in the diet — nothing weird and no extra cost.' }, a: { ar: 'آية', en: 'Aya' } },
      { q: { ar: 'كابتن محترف وبيرد بسرعة، حسيت إني مهم مش مجرد رقم.', en: 'Professional coach who replies fast — I felt important, not just a number.' }, a: { ar: 'شريف', en: 'Sherif' } },
      { q: { ar: 'اتغيّر شكل جسمي وثقتي قدام الناس بقت حاجة تانية خالص.', en: 'My body changed and my confidence around people is on a whole other level.' }, a: { ar: 'لينا', en: 'Lina' } },
      { q: { ar: 'لاعب كورة ومحتاج أداء، البرنامج زود سرعتي ونفسي في الماتش.', en: 'I’m a footballer who needs performance — the program boosted my speed and stamina on the pitch.' }, a: { ar: 'عمرو', en: 'Amr' } },
      { q: { ar: 'كل أسبوع بشوف تطور في الصور، ده بيخليني مكمّلة.', en: 'Every week I see progress in the photos — that keeps me going.' }, a: { ar: 'هنا', en: 'Hana' } },
      { q: { ar: 'بدأت من الصفر وانهاردة بمرّن لوحدي بثقة، شكراً كابتن.', en: 'Started from zero and today I train on my own with confidence — thank you, coach.' }, a: { ar: 'مازن', en: 'Mazen' } },
      { q: { ar: 'الدايت سهل التطبيق في الشغل، بحضّر أكلي في دقايق.', en: 'The diet is easy to follow at work — I prep my food in minutes.' }, a: { ar: 'روان', en: 'Rawan' } },
      { q: { ar: 'نتيجة حقيقية بسعر معقول جدا مقارنة بأي حد تاني.', en: 'Real results at a very reasonable price compared to anyone else.' }, a: { ar: 'فادي', en: 'Fady' } },
      { q: { ar: 'حسيت بالفرق في صحتي قبل الشكل، تحاليلي اتحسنت كلها.', en: 'I felt the difference in my health before my looks — all my lab tests improved.' }, a: { ar: 'مايا', en: 'Maya' } },
      { q: { ar: 'التزمت ٣ شهور والنتيجة قلبت شكلي، أحسن استثمار في نفسي.', en: 'Committed for 3 months and the result transformed me — the best investment in myself.' }, a: { ar: 'سيف', en: 'Seif' } },
      { q: { ar: 'الكابتن بيسمعني وبيعدّل الخطة على حالتي، مش برنامج جاهز للكل.', en: 'The coach listens and adjusts the plan to my situation — not a one-size-fits-all.' }, a: { ar: 'دارين', en: 'Dareen' } },
      { q: { ar: 'زودت وزن صحّي وعضل بعد ما كنت نحيف جدا، أخيراً بان عليّا.', en: 'Gained healthy weight and muscle after being very skinny — it finally shows.' }, a: { ar: 'بيشوي', en: 'Bishoy' } },
      { q: { ar: 'بحب إن المتابعة شخصية، حاسة إني مع كابتن خاص بيا.', en: 'I love that the follow-up is personal — I feel like I have my own private coach.' }, a: { ar: 'مارينا', en: 'Marina' } },
      { q: { ar: 'رجعت أسبح بقوة، نَفَسي بقى أطول وأرقامي في حمام السباحة اتحسنت كتير.', en: 'I’m back to swimming strong — my breath lasts longer and my pool times improved a lot.' }, a: { ar: 'جورج', en: 'George' } },
      { q: { ar: 'نفسيتي اتحسنت مع جسمي، بقيت بحب المرايا تاني.', en: 'My mood improved along with my body — I love the mirror again.' }, a: { ar: 'منة', en: 'Menna' } },
      { q: { ar: 'بسيط وواضح، عارف كل يوم أعمل إيه من غير لخبطة.', en: 'Simple and clear — I know exactly what to do each day with no confusion.' }, a: { ar: 'رامي', en: 'Ramy' } },
      { q: { ar: 'اشتركت بسبب صاحبتي ومبقتش نادمة ولا ثانية، النتيجة بتفرّح.', en: 'Joined because of my friend and haven’t regretted a second — the results are joyful.' }, a: { ar: 'نرمين', en: 'Nermin' } },
      { q: { ar: 'كابتن بجد بيهتم، أنا بنزل وزن وبتعلم عادات هتفضل معايا للأبد.', en: 'A coach who truly cares — I’m losing weight and learning habits that will stay with me forever.' }, a: { ar: 'كنزي', en: 'Kenzy' } },
    ],
  },
  faq: {
    kicker: { ar: 'الأسئلة الشائعة', en: 'FAQ' },
    title: { ar: 'أسئلة بتتكرر', en: 'Common questions' },
    items: [
      { q: { ar: 'إزاي بدفع؟', en: 'How do I pay?' }, a: { ar: `الدفع عن طريق إنستا باي على الرقم ${SITE.instapayNumber}، وبعد ما الكابتن يأكد الدفع هيتواصل معاك على واتساب لتفعيل اشتراكك.`, en: `Payment is via InstaPay to ${SITE.instapayNumber}. After the coach confirms your payment, they will contact you on WhatsApp to activate your subscription.` } },
      { q: { ar: 'هستلم البرنامج إمتى؟', en: 'When do I get my plan?' }, a: { ar: 'خلال ٢٤–٤٨ ساعة من تأكيد الدفع بيتبعتلك البرنامج كامل.', en: 'Within 24–48 hours of payment confirmation your full plan is sent.' } },
      { q: { ar: 'البرنامج للستات والرجالة؟', en: 'Is it for men and women?' }, a: { ar: 'أيوه، البرامج متاحة للجنسين وبتتفصّل حسب الهدف.', en: 'Yes — plans are for everyone and tailored to your goal.' } },
    ],
  },
  finalCta: {
    title: { ar: SITE.tagline.ar, en: SITE.tagline.en },
    sub: { ar: 'دلوقتي وقت تبدأ.', en: 'Now is the time to start.' },
    cta: { ar: 'اشترك الآن', en: 'Subscribe now' },
  },
  footer: {
    rights: { ar: 'جميع الحقوق محفوظة', en: 'All rights reserved' },
    contact: { ar: 'تواصل', en: 'Contact' },
  },
};

export default function Home() {
  const [lang, setLang] = useState<Lang>('ar');
  const ar = lang === 'ar';
  const t = <T,>(v: { ar: T; en: T }) => pick(lang, v);
  // Live, coach-editable content (photos, testimonials, custom sections).
  const content = useContent();
  const transformations = content.transformations;
  const swimmers = content.swimmers;
  const plans = usePlans();

  return (
    <main dir={ar ? 'rtl' : 'ltr'} className="relative min-h-screen bg-ink text-paper">
      <Nav lang={lang} setLang={setLang} t={t} />

      {/* HERO */}
      <section className="vignette relative overflow-hidden border-b hair">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pt-24 pb-16 md:grid-cols-2 md:pt-32 md:pb-24">
          <div>
            <p className="kicker animate-fade-up">{t(T.hero.eyebrow)}</p>
            <h1 className="mt-6 animate-fade-up text-5xl font-black leading-[1.05] tracking-tight md:text-7xl" style={{ animationDelay: '60ms' }}>
              {t(T.hero.line1)}
              <br />
              <span className="text-blood">{t(T.hero.line2)}</span>
            </h1>
            <p className="mt-7 max-w-md animate-fade-up text-base leading-8 text-white/65" style={{ animationDelay: '120ms' }}>
              {t(T.hero.sub)}
            </p>
            <div className="mt-9 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: '180ms' }}>
              <Link href="/subscribe" className="rounded-full bg-blood px-8 py-4 text-sm font-bold text-white transition hover:bg-red-500">{t(T.hero.cta)}</Link>
              <a href="#pricing" className="rounded-full border border-blood/50 px-8 py-4 text-sm font-bold text-paper transition hover:bg-blood/10">{t(T.hero.ctaAlt)}</a>
            </div>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '160ms' }}>
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[2rem] border hair">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/coach/coach-1.jpg" alt={t(SITE.coachName)} className="h-full w-full object-cover grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
              <div className="absolute bottom-0 p-6">
                <div className="text-xl font-black">{t(SITE.coachName)}</div>
                <div className="text-xs uppercase tracking-[0.3em] text-white/55">{ar ? 'مدرب معتمد' : 'Certified coach'}</div>
              </div>
            </div>
          </div>
        </div>
        <Marquee />
      </section>

      {/* SERVICES */}
      <Section id="services" kicker={t(T.services.kicker)} title={t(T.services.title)}>
        <div className="grid gap-px overflow-hidden rounded-3xl border border-blood/25 bg-blood/25 md:grid-cols-3">
          {T.services.items.map((s) => (
            <div key={s.n} className="bg-ink p-8 transition hover:bg-white/[0.03]">
              <div className="font-mono text-sm text-white/35">{s.n}</div>
              <h3 className="mt-5 text-xl font-bold">{t(s.t)}</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">{t(s.d)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ABOUT THE COACH */}
      <section id="about" className="border-b hair">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="order-2 grid grid-cols-2 gap-4 md:order-1">
            {['/coach/coach-2.jpg', '/coach/coach-3.jpg', '/coach/coach-4.jpg', '/coach/coach-5.jpg'].map((src, i) => (
              <div key={i} className={`overflow-hidden rounded-2xl border hair ${i % 2 ? 'translate-y-5' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="aspect-[3/4] w-full object-cover grayscale transition duration-500 hover:grayscale-0" />
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <p className="kicker">{t(T.about.kicker)}</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">{t(T.about.title)}</h2>
            <ul className="mt-6 space-y-3">
              {T.about.creds.map((c, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-7 text-white/75">
                  <span className="mt-1 text-blood">▪</span>
                  <span>{t(c)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {T.about.stats.map((s, i) => (
                <div key={i} className="rounded-2xl border hair p-4 text-center">
                  <div className="text-2xl font-black">{s.v}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-widest text-white/45">{t(s.l)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RESULTS — transformation carousel */}
      <Section id="results" kicker={t(T.results.kicker)} title={t(T.results.title)} sub={t(T.results.sub)}>
        <PhotoMarquee imgs={transformations} grayscale />
      </Section>

      {/* SWIMMERS — medals & achievements carousel */}
      <Section id="swimmers" kicker={t(T.swimmers.kicker)} title={t(T.swimmers.title)} sub={t(T.swimmers.sub)}>
        <PhotoMarquee imgs={swimmers} border="border-blood/25" />
      </Section>

      {/* PRICING */}
      <Section id="pricing" kicker={t(T.pricing.kicker)} title={t(T.pricing.title)}>
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-5">
          {plans.filter((p) => p.bundle !== 'swimmers').map((p) => (
            <PlanCard key={p.id} p={p} t={t} />
          ))}
        </div>
      </Section>

      {/* SWIMMERS BUNDLE — gym + swim, two coaches, one app */}
      {plans.some((p) => p.bundle === 'swimmers') && (
        <Section
          id="swim-bundle"
          kicker={t(T.swimBundle.kicker)}
          title={t(T.swimBundle.title)}
          sub={maskText(t(T.swimBundle.sub), t(SWIM_COACH_NAME), t(HIDDEN_COACH))}
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {plans.filter((p) => p.bundle === 'swimmers').map((p) => (
              <PlanCard key={p.id} p={p} t={t} swim />
            ))}
          </div>
        </Section>
      )}

      {/* TESTIMONIALS */}
      <Section id="testimonials" kicker={t(T.testimonials.kicker)} title={t(T.testimonials.title)}>
        <TestimonialMarquee items={content.testimonials} t={t} ar={ar} />
      </Section>

      {/* FAQ */}
      <Section id="faq" kicker={t(T.faq.kicker)} title={t(T.faq.title)}>
        <div className="mx-auto max-w-3xl divide-y divide-white/10 overflow-hidden rounded-3xl border hair">
          {T.faq.items.map((it, i) => (
            <details key={i} className="group p-6 [&_summary]:cursor-pointer">
              <summary className="flex items-center justify-between text-base font-bold marker:content-none">
                {t(it.q)}
                <span className="text-white/40 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-white/60">{t(it.a)}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* CUSTOM SECTIONS — added by the coach from /admin */}
      {content.sections.map((sec) => (
        <Section key={sec.id} id={`custom-${sec.id}`} kicker="" title={t(sec.title)} sub={t(sec.body) || undefined}>
          {sec.images.length > 0 ? <PhotoMarquee imgs={sec.images} /> : <div />}
        </Section>
      ))}

      {/* FINAL CTA */}
      <section className="border-t hair">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <h2 className="text-4xl font-black tracking-tight md:text-6xl">{t(T.finalCta.title)}</h2>
          <p className="mt-4 text-white/55">{t(T.finalCta.sub)}</p>
          <Link href="/subscribe" className="mt-9 inline-block rounded-full bg-blood px-10 py-4 text-sm font-bold text-white transition hover:bg-red-500">{t(T.finalCta.cta)}</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t hair">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-white/45 md:flex-row">
          <LogoMark className="h-9 w-32" />
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="transition hover:text-white" dir="ltr">
            {t(T.footer.contact)}: {SITE.whatsapp}
          </a>
          <div>© {new Date().getFullYear()} {ar ? SITE.brandAr : SITE.brand} · {t(T.footer.rights)}</div>
        </div>
      </footer>

      {/* Floating WhatsApp button */}
      <a
        href={whatsappLink(ar ? 'مرحبا كابتن، حابب أستفسر عن الاشتراك' : 'Hi Coach, I want to ask about subscribing')}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
        className="fixed bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition hover:scale-105 ltr:right-5 rtl:left-5"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white" aria-hidden="true">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.515 5.26l-.999 3.648 3.743-.957zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>
    </main>
  );
}

function Nav({ lang, setLang, t }: { lang: Lang; setLang: (l: Lang) => void; t: <T,>(v: { ar: T; en: T }) => T }) {
  return (
    <header className="sticky top-0 z-40 border-b hair bg-ink/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <LogoMark className="h-12 w-48" />
        <div className="hidden items-center gap-7 text-sm text-white/65 md:flex">
          <a href="#services" className="transition hover:text-white">{t(T.nav.services)}</a>
          <a href="#about" className="transition hover:text-white">{t(T.nav.about)}</a>
          <a href="#results" className="transition hover:text-white">{t(T.nav.results)}</a>
          <a href="#swimmers" className="transition hover:text-white">{t(T.nav.swimmers)}</a>
          <a href="#pricing" className="transition hover:text-white">{t(T.nav.pricing)}</a>
          <a href="#faq" className="transition hover:text-white">{t(T.nav.faq)}</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="rounded-full border hair px-3 py-1.5 text-xs font-bold text-white/70 transition hover:text-white">
            {lang === 'ar' ? 'EN' : 'ع'}
          </button>
          <Link href="/subscribe" className="rounded-full bg-blood px-5 py-2 text-xs font-bold text-white transition hover:bg-red-500">{t(T.nav.subscribe)}</Link>
        </div>
      </nav>
    </header>
  );
}

function LogoMark({ className = 'h-9 w-32' }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${SITE.brand} home`} className={`block overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={SITE.logoSrc} alt={SITE.brand} className="h-full w-full object-contain object-left" />
    </Link>
  );
}

/** One pricing card — `swim` switches the accent to the Swimmers Bundle blue. */
function PlanCard({ p, t, swim = false }: { p: Plan; t: <T,>(v: { ar: T; en: T }) => T; swim?: boolean }) {
  const accentBg = swim ? 'bg-sky-600' : 'bg-blood';
  const accentBorder = swim ? 'border-sky-500' : 'border-blood';
  const accentHover = swim ? 'hover:bg-sky-500' : 'hover:bg-red-500';
  return (
    <div className={`relative flex flex-col rounded-3xl border p-6 ${p.featured ? `${accentBorder} ${accentBg} text-white` : 'hair bg-white/[0.02]'}`}>
      {swim && (
        <span className="absolute -top-3 left-6 rounded-full bg-sky-300 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-ink">
          {t({ ar: 'قريبًا', en: 'Soon' })}
        </span>
      )}
      {p.featured && (
        <span className="absolute -top-3 right-6 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink">
          {t({ ar: 'الأكثر اختياراً', en: 'Most chosen' })}
        </span>
      )}
      <div className={`text-sm font-bold ${p.featured ? 'text-white' : 'text-white/70'}`}>{t(p.name)}</div>
      <div className={`mt-1 text-xs ${p.featured ? 'text-white/75' : 'text-white/40'}`}>{t(p.tagline)}</div>
      {p.originalPriceEGP && p.originalPriceEGP > p.priceEGP && (
        <div className="mt-4 flex items-center gap-2">
          <PriceValue
            value={`${p.originalPriceEGP.toLocaleString()} ${t({ ar: 'ج.م', en: 'EGP' })}`}
            masked={swim}
            className={`text-sm line-through ${p.featured ? 'text-white/55' : 'text-white/35'}`}
          />
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${p.featured ? `bg-white ${swim ? 'text-sky-600' : 'text-blood'}` : `${accentBg} text-white`}`}>
            {t({ ar: 'خصم', en: 'Save' })} {Math.round((1 - p.priceEGP / p.originalPriceEGP) * 100)}%
          </span>
        </div>
      )}
      <div className={`flex items-end gap-1 ${p.originalPriceEGP && p.originalPriceEGP > p.priceEGP ? 'mt-1' : 'mt-5'}`}>
        <PriceValue
          value={swim ? t(HIDDEN_PRICE) : p.priceEGP.toLocaleString()}
          masked={swim}
          className="text-4xl font-black tracking-tight"
        />
        {!swim && <span className={`pb-1 text-xs ${p.featured ? 'text-white/75' : 'text-white/40'}`}>{t({ ar: 'ج.م', en: 'EGP' })}</span>}
      </div>
      <ul className={`mt-5 flex-1 space-y-2 text-[13px] leading-6 ${p.featured ? 'text-white/85' : 'text-white/60'}`}>
        {p.features.map((f, i) => (
          <li key={i} className="flex gap-2">
            <span className={p.featured ? 'text-white' : swim ? 'text-sky-400' : 'text-blood'}>—</span>
            <span>{swim ? maskText(t(f), t(SWIM_COACH_NAME), t(HIDDEN_COACH)) : t(f)}</span>
          </li>
        ))}
      </ul>
      {swim ? (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="mt-6 cursor-not-allowed rounded-full border border-sky-400/40 bg-sky-500/10 px-5 py-3 text-center text-sm font-bold text-sky-200/70"
        >
          {t({ ar: 'قريبًا', en: 'Soon' })}
        </button>
      ) : (
        <Link href={`/subscribe?plan=${p.id}`} className={`mt-6 rounded-full px-5 py-3 text-center text-sm font-bold transition ${p.featured ? 'bg-white text-ink hover:bg-white/85' : `${accentBg} text-white ${accentHover}`}`}>
          {t({ ar: 'اشترك', en: 'Subscribe' })}
        </Link>
      )}
    </div>
  );
}

function PriceValue({ value, masked, className }: { value: string; masked?: boolean; className?: string }) {
  if (!masked) return <span className={className}>{value}</span>;
  return (
    <span
      className={`relative inline-flex min-h-12 min-w-44 select-none items-center justify-center overflow-hidden rounded-full bg-sky-200/10 px-8 text-transparent ring-1 ring-inset ring-sky-200/25 ${className || ''}`}
      aria-label="Hidden price"
    >
      <span aria-hidden="true" className="opacity-0">
        {value}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 top-1/2 h-7 -translate-y-1/2 rounded-full bg-white/45 blur-md"
      />
    </span>
  );
}

function maskText(text: string, target: string, replacement: string) {
  const parts = text.split(target);
  if (parts.length === 1) return text;
  return parts.flatMap((part, index) => [
    part,
    index < parts.length - 1 ? <BlurMask key={`${target}-${index}`}>{replacement}</BlurMask> : null,
  ]);
}

function BlurMask({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="relative inline-flex min-h-6 min-w-32 select-none items-center justify-center overflow-hidden rounded-full bg-sky-200/10 px-6 text-transparent ring-1 ring-inset ring-sky-200/20"
      aria-label="Hidden text"
    >
      <span aria-hidden="true" className="opacity-0">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 top-1/2 h-4 -translate-y-1/2 rounded-full bg-white/35 blur-md"
      />
    </span>
  );
}

function Section({ id, kicker, title, sub, children }: { id: string; kicker: string; title: string; sub?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="border-b hair">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <p className="kicker">{kicker}</p>
        <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight md:text-5xl">{title}</h2>
        {sub && <p className="mt-4 max-w-xl text-white/55">{sub}</p>}
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

/**
 * Horizontal photo carousel that scrolls itself automatically but is also fully
 * hand-scrollable. The image list is rendered twice and `scrollLeft` is nudged
 * each frame; when it passes the half-way point it wraps back for a seamless
 * loop. Auto-scroll pauses while the pointer is over it (or during touch), so the
 * visitor can freely drag/swipe through the photos. Forced LTR so scrollLeft math
 * is consistent even on the Arabic (RTL) page.
 */
function PhotoMarquee({
  imgs,
  grayscale = false,
  border = 'hair',
}: {
  imgs: string[];
  grayscale?: boolean;
  border?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const row = [...imgs, ...imgs];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      if (el && !paused.current) {
        const half = el.scrollWidth / 2;
        el.scrollLeft += 0.6; // gentle auto-advance
        if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const hold = () => (paused.current = true);
  const release = () => (paused.current = false);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-ink to-transparent md:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-ink to-transparent md:w-16" />
      <div
        ref={ref}
        dir="ltr"
        onMouseEnter={hold}
        onMouseLeave={release}
        onTouchStart={hold}
        onTouchEnd={() => setTimeout(release, 2500)}
        className="flex cursor-grab gap-4 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {row.map((src, i) => (
          <div key={i} className={`h-72 w-52 shrink-0 overflow-hidden rounded-2xl border ${border} bg-white/[0.02]`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              loading="lazy"
              decoding="async"
              draggable={false}
              className={`h-full w-full object-cover transition duration-500 ${grayscale ? 'grayscale hover:grayscale-0' : ''}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

type Testimonial = { q: { ar: string; en: string }; a: { ar: string; en: string } };

/**
 * Testimonials shown as two auto-scrolling rows (opposite directions) so 50+
 * reviews fit in a compact, lively band instead of a giant wall. Each row is
 * hand-scrollable and pauses on hover/touch. Forced LTR so the scrollLeft math
 * is consistent on the Arabic (RTL) page.
 */
function TestimonialMarquee({
  items,
  t,
  ar,
}: {
  items: Testimonial[];
  t: <T,>(v: { ar: T; en: T }) => T;
  ar: boolean;
}) {
  const mid = Math.ceil(items.length / 2);
  return (
    <div className="space-y-4">
      <TestimonialRow items={items.slice(0, mid)} t={t} ar={ar} speed={0.5} />
      <TestimonialRow items={items.slice(mid)} t={t} ar={ar} speed={0.5} reverse />
    </div>
  );
}

function TestimonialRow({
  items,
  t,
  ar,
  speed,
  reverse = false,
}: {
  items: Testimonial[];
  t: <T,>(v: { ar: T; en: T }) => T;
  ar: boolean;
  speed: number;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const row = [...items, ...items];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Start the reversed row in the middle so it has room to scroll backwards.
    if (reverse) el.scrollLeft = el.scrollWidth / 2;
    let raf = 0;
    const tick = () => {
      if (el && !paused.current) {
        const half = el.scrollWidth / 2;
        el.scrollLeft += reverse ? -speed : speed;
        if (half > 0) {
          if (el.scrollLeft >= half) el.scrollLeft -= half;
          else if (el.scrollLeft <= 0) el.scrollLeft += half;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reverse, speed]);

  const hold = () => (paused.current = true);
  const release = () => (paused.current = false);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-ink to-transparent md:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-ink to-transparent md:w-16" />
      <div
        ref={ref}
        dir="ltr"
        onMouseEnter={hold}
        onMouseLeave={release}
        onTouchStart={hold}
        onTouchEnd={() => setTimeout(release, 2500)}
        className="flex cursor-grab gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {row.map((it, i) => (
          <figure key={i} dir={ar ? 'rtl' : 'ltr'} className="flex w-[300px] shrink-0 flex-col rounded-3xl border hair bg-white/[0.02] p-6 text-start">
            <div className="text-3xl leading-none text-blood/70">“</div>
            <blockquote className="mt-2 flex-1 text-[14px] leading-7 text-white/80">{t(it.q)}</blockquote>
            <figcaption className="mt-4 flex items-center gap-2 text-sm font-bold text-white/55">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blood/15 text-xs text-blood">★</span>
              {t(it.a)}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function Marquee() {
  const words = ['TRAINING', 'NUTRITION', 'FOLLOW-UP', 'STRENGTH', 'DISCIPLINE', 'RESULTS'];
  const row = [...words, ...words];
  return (
    <div className="overflow-hidden border-t hair py-4">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap px-5 text-sm font-black uppercase tracking-[0.3em] text-blood/60">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10">{w} <span className="text-white/10">/</span></span>
        ))}
      </div>
    </div>
  );
}
