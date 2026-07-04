/**
 * Sports & their performance metrics.
 *
 * A customer picks their sport during sign-up. If it isn't general gym/fitness,
 * we ask for the sport-specific metrics that matter to a coach — the athlete's
 * current personal record (PR) for each, plus the target they want to hit.
 * The coach uses these to build a sport-specific program.
 */
export type Metric = {
  id: string;
  label: { ar: string; en: string };
  /** Hint for the expected value, e.g. a time like 00:32.5 or a distance. */
  placeholder: { ar: string; en: string };
};

export type Sport = {
  id: string;
  name: { ar: string; en: string };
  /** Empty for gym/fitness — no extra metrics needed. */
  metrics: Metric[];
};

const TIME = { ar: 'مثال: 00:32.40', en: 'e.g. 00:32.40' };

export const SPORTS: Sport[] = [
  { id: 'gym', name: { ar: 'جيم / لياقة عامة', en: 'Gym / General fitness' }, metrics: [] },
  {
    id: 'swimming',
    name: { ar: 'سباحة', en: 'Swimming' },
    metrics: [
      { id: 'free50', label: { ar: '٥٠م حرة', en: '50m Freestyle' }, placeholder: TIME },
      { id: 'free100', label: { ar: '١٠٠م حرة', en: '100m Freestyle' }, placeholder: TIME },
      { id: 'breast50', label: { ar: '٥٠م صدر', en: '50m Breaststroke' }, placeholder: TIME },
      { id: 'back50', label: { ar: '٥٠م ظهر', en: '50m Backstroke' }, placeholder: TIME },
      { id: 'fly50', label: { ar: '٥٠م فراشة', en: '50m Butterfly' }, placeholder: TIME },
      { id: 'im200', label: { ar: '٢٠٠م متنوع', en: '200m Individual Medley' }, placeholder: TIME },
    ],
  },
  {
    id: 'running',
    name: { ar: 'جري', en: 'Running' },
    metrics: [
      { id: 'r5k', label: { ar: '٥ كم', en: '5K' }, placeholder: { ar: 'مثال: 00:24:30', en: 'e.g. 00:24:30' } },
      { id: 'r10k', label: { ar: '١٠ كم', en: '10K' }, placeholder: { ar: 'مثال: 00:52:00', en: 'e.g. 00:52:00' } },
      { id: 'rhalf', label: { ar: 'نصف ماراثون', en: 'Half marathon' }, placeholder: { ar: 'مثال: 02:00:00', en: 'e.g. 02:00:00' } },
    ],
  },
  {
    id: 'football',
    name: { ar: 'كرة قدم', en: 'Football' },
    metrics: [
      { id: 'sprint40', label: { ar: 'سرعة ٤٠م', en: '40m sprint' }, placeholder: { ar: 'مثال: 5.4 ث', en: 'e.g. 5.4s' } },
      { id: 'position', label: { ar: 'المركز', en: 'Position' }, placeholder: { ar: 'مثال: جناح', en: 'e.g. winger' } },
      { id: 'vertical', label: { ar: 'الوثب العمودي', en: 'Vertical jump' }, placeholder: { ar: 'مثال: 55 سم', en: 'e.g. 55cm' } },
    ],
  },
  {
    id: 'weightlifting',
    name: { ar: 'رفع أثقال / قوة', en: 'Weightlifting / Strength' },
    metrics: [
      { id: 'squat', label: { ar: 'سكوات (١ تكرار)', en: 'Squat 1RM' }, placeholder: { ar: 'مثال: 120 كجم', en: 'e.g. 120kg' } },
      { id: 'bench', label: { ar: 'بنش (١ تكرار)', en: 'Bench 1RM' }, placeholder: { ar: 'مثال: 90 كجم', en: 'e.g. 90kg' } },
      { id: 'deadlift', label: { ar: 'ديدليفت (١ تكرار)', en: 'Deadlift 1RM' }, placeholder: { ar: 'مثال: 150 كجم', en: 'e.g. 150kg' } },
    ],
  },
  {
    // Military / police college prep — the standard OmdaFit fitness test battery.
    // "Current" = the athlete's latest result; "Target" = the required standard.
    id: 'military',
    name: { ar: 'تأهيل عسكري', en: 'Military / Police prep' },
    metrics: [
      { id: 'run100', label: { ar: 'الجري 100 متر (السرعة)', en: '100m run (speed)' }, placeholder: { ar: 'المطلوب: حتى 13 ث', en: 'Required: ≤ 13s' } },
      { id: 'run1000', label: { ar: 'الجري 1000 متر (التحمل)', en: '1000m run (endurance)' }, placeholder: { ar: 'المطلوب: حتى 4:15 د', en: 'Required: ≤ 4:15' } },
      { id: 'pushups', label: { ar: 'الضغط (في دقيقة)', en: 'Push-ups (per minute)' }, placeholder: { ar: 'المطلوب: 40 عدة', en: 'Required: 40 reps' } },
      { id: 'situps', label: { ar: 'الجلوس من الرقود (في دقيقة)', en: 'Sit-ups (per minute)' }, placeholder: { ar: 'المطلوب: 40 عدة', en: 'Required: 40 reps' } },
      { id: 'broadjump', label: { ar: 'الوثب العريض من الثبات', en: 'Standing broad jump' }, placeholder: { ar: 'مثال: 220 سم', en: 'e.g. 220cm' } },
      { id: 'pullups', label: { ar: 'العقلة', en: 'Pull-ups' }, placeholder: { ar: 'المطلوب: 10 عدات', en: 'Required: 10 reps' } },
      { id: 'burpee', label: { ar: 'Burpee (في دقيقة)', en: 'Burpees (per minute)' }, placeholder: { ar: 'مثال: 20 عدة', en: 'e.g. 20 reps' } },
      { id: 'plank', label: { ar: 'البلانك', en: 'Plank (hold)' }, placeholder: { ar: 'مثال: 02:00 د', en: 'e.g. 02:00' } },
      { id: 'wallsit', label: { ar: 'Wall Sit (الحائط)', en: 'Wall sit (hold)' }, placeholder: { ar: 'مثال: 01:30 د', en: 'e.g. 01:30' } },
      { id: 'mChest', label: { ar: 'محيط الصدر (سم)', en: 'Chest (cm)' }, placeholder: { ar: 'مثال: 100', en: 'e.g. 100' } },
      { id: 'mWaist', label: { ar: 'محيط الخصر (سم)', en: 'Waist (cm)' }, placeholder: { ar: 'مثال: 82', en: 'e.g. 82' } },
      { id: 'mArm', label: { ar: 'محيط الذراع (سم)', en: 'Arm (cm)' }, placeholder: { ar: 'مثال: 35', en: 'e.g. 35' } },
      { id: 'mBodyFat', label: { ar: 'نسبة الدهون %', en: 'Body fat %' }, placeholder: { ar: 'مثال: 18', en: 'e.g. 18' } },
      { id: 'mMuscle', label: { ar: 'الكتلة العضلية (كجم)', en: 'Muscle mass (kg)' }, placeholder: { ar: 'مثال: 35', en: 'e.g. 35' } },
    ],
  },
  { id: 'other', name: { ar: 'رياضة أخرى', en: 'Other sport' }, metrics: [] },
];

export function getSport(id: string): Sport | undefined {
  return SPORTS.find((s) => s.id === id);
}
