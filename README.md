<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Nuhafrik Clothing and Accessories Store

React 19 + Vite + TypeScript + Tailwind v4 e-commerce SPA with an embedded Express API and Firebase (Firestore/Auth/Storage).

View your app in AI Studio: https://ai.studio/apps/7e2a2979-a131-40ff-aebf-bda43044dde8

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create a `.env` file from [`.env.example`](./.env.example) and set `GEMINI_API_KEY` to your Gemini API key (used by the admin product generator only).
3. Run the app:
   `npm run dev`

The dev server is `server.ts` (Express via tsx) on `http://localhost:3000`. It serves the SPA through Vite middleware and mounts the API at `/api/v1`. Do NOT use a bare Vite server — it will not expose the API.

Notes:
- Firebase config is read from [`firebase-applet-config.json`](./firebase-applet-config.json), not from `.env`.
- The frontend talks to Firestore directly via the client SDK, so most features work locally without backend credentials. API calls only work if Application Default Credentials are available (`GOOGLE_APPLICATION_CREDENTIALS` or `gcloud auth application-default login`).
- If `GEMINI_API_KEY` is missing, the store still loads fine — only the "Generate placeholder products" button in the admin panel reports that the key is not set.

## Commands

- `npm run dev` — Express + Vite dev server on `http://localhost:3000`
- `npm run build` — `vite build` → `dist`
- `npm run preview` — preview the built app via Vite
- `npm run lint` — `tsc --noEmit` typecheck
- `npm run provision:admin` — create/update the owner admin account (Auth + Firestore profile); requires `NUHAFRIK_ADMIN_PASSWORD`
- `npm run deploy:firestore-rules` — deploy `firestore.rules` via the Firebase Rules REST API; requires `scripts/service-account.json`
- `npm run transform:prd` / `npm run transform:prd:audit` — print / validate the production baseline workflow
- `npx tsx seed.ts` — wipe `products` and seed the 14-item catalogue

## Deploy To Vercel

This project is configured to deploy as a Vite SPA on Vercel.

Vercel settings:
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Important notes:
- Client-side routing uses `BrowserRouter`, so [`vercel.json`](./vercel.json) rewrites all non-file routes to `index.html`.
- If you use the Gemini-powered admin generator, set `GEMINI_API_KEY` in the Vercel project Environment Variables before deploying.
- Add your Vercel domain(s) to Firebase Authentication Authorized Domains if you need login to work in production.

## Firestore Rules & Access Control

See [`firestore.rules`](./firestore.rules): products are publicly readable (admin-only writes), orders are readable by owner/admin, everything else is admin-only. Admin = `role == 'admin'` in `users/{uid}` OR the hardcoded owner email `nuhafrikclothings@gmail.com`. Changing that email requires updating `src/firebase/config.ts`, `firestore.rules`, `scripts/provision-admin.mjs`, and `.env.example` together.

## Action Phrase Workflow

This repository includes a reusable production transformation workflow:

- Action phrase: `TRANSFORM PRD TO E-COMMERCE PRODUCTION`
- Blueprint: [`docs/TRANSFORM_PRD_TO_ECOMMERCE_PRODUCTION.md`](./docs/TRANSFORM_PRD_TO_ECOMMERCE_PRODUCTION.md)
- Project memory snapshot: [`docs/NUHAFRIK_PRODUCTION_MEMORY_SNAPSHOT.md`](./docs/NUHAFRIK_PRODUCTION_MEMORY_SNAPSHOT.md)

Commands:

1. `npm run transform:prd` to print the execution workflow.
2. `npm run transform:prd:audit` to validate baseline production requirements in the current codebase.

## Changelog

- **Promo alert** — homepage shows a timed "Buy 2, Get 1 FREE" modal (`src/components/promo/PromoAlert.tsx`).
- **Gemini key guard** — the Gemini client is now lazy-initialized so a missing `GEMINI_API_KEY` no longer crashes the app at load.
- **Firebase Admin** — pinned to `^12.1.0` for the provisioning / rules-deploy scripts.