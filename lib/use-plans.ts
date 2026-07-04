'use client';

import { useEffect, useState } from 'react';
import { PLANS, SWIM_PLANS, type Plan } from './plans';

const DEFAULT_CLIENT_PLANS: Plan[] = [...PLANS, ...SWIM_PLANS];

/**
 * Live subscription plans for client components. Starts from the built-in
 * defaults (so there's never an empty pricing section on first paint), then
 * swaps in whatever the coach has saved via the admin dashboard.
 */
export function usePlans(): Plan[] {
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_CLIENT_PLANS);
  useEffect(() => {
    let alive = true;
    fetch('/api/plans')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d?.plans?.length) setPlans(d.plans as Plan[]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return plans;
}
