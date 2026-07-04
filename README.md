# OmdaFit (عُمدة)

Public **landing + subscription site** for the Omda online-coaching brand.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4100
```

Copy `.env.example` → `.env.local` and fill it in. With `DATABASE_URL` left blank,
OmdaFit persists to a local JSON file (`data/`), so it runs with zero config.

## What it does

- **Landing (`/`)** — hero, services, transformations, swimmers, pricing,
  testimonials, FAQ. Bilingual Arabic/English with a live RTL toggle. All content
  (testimonials, galleries, custom sections) is **editable from `/admin`** — no
  redeploy needed.
- **Subscribe (`/subscribe`)** — pick a plan → pay via **InstaPay** → submit intake
  (height, weight, goal, photos, receipt). Order saved as `PENDING_REVIEW`.
- **Admin (`/admin`)**, key-protected, with four sections:
  - **Approvals** — review each order and receipt; approve marks it active with a
    one-tap **WhatsApp** link to follow up with the customer.
  - **Pricing** — add, edit, or remove plans and bundles (live source of truth).
  - **Content** — manage testimonials, photo galleries, and custom sections.
  - **Telegram** — connect Omda's chat to receive new-order alerts with inline
    Approve / Reject buttons.
- **Telegram alerts** — set `OMDAFIT_TELEGRAM_BOT_TOKEN`, connect via `/admin`; every
  new subscription pings that chat. Send `/credentials` in the bot to recover
  admin passwords.
- **Swimmers bundle** — dual-coach offering; `SWIM_ADMIN_KEY` scopes a swim coach
  to swim orders only.

## How approval works

Customer submits → order saved as `PENDING_REVIEW` → coach reviews in `/admin` →
**Approve** marks the order `ACTIVE` and surfaces a WhatsApp link for follow-up.

## Tech stack

- **Next.js 14** (App Router) — pages and API routes in one project.
- **React 18** + **TypeScript** + **Tailwind** (monochrome design system).
- **Persistence:** Postgres via `pg` when `DATABASE_URL` is set (Vercel + Neon free
  tier); local JSON file otherwise. Same API surface either way — see `lib/store.ts`.

## Structure

```
app/
  page.tsx              landing (uses live content)
  subscribe/page.tsx    plan → InstaPay → intake → order
  admin/page.tsx        approvals · pricing · content · telegram
  api/subscribe/        POST: create PENDING_REVIEW order + Telegram alert
  api/accounts/         GET/POST: admin order feed (key-protected)
  api/plans/            live pricing
  api/content/          editable site content
  api/telegram/         webhook + connect link
lib/
  store.ts              orders (Postgres or JSON)
  plans.ts / plans-store.ts     pricing
  content.ts / content-store.ts site content
  telegram.ts           bot: alerts + connect (no-op when token is unset)
  site.ts / sports.ts   brand config + sport metadata
```

## Deploy

Deploy like any Next.js app — **Vercel** is easiest (free tier). Set the
environment variables from `.env.example` in the host dashboard. For a
persistent database, create a free **Neon** Postgres project (https://neon.tech)
and paste its pooled connection string into `DATABASE_URL`. With `DATABASE_URL`
left blank the app stores data in a local JSON file, so it also runs with zero
setup for testing.
