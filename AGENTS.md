# AGENTS.md

React 19 + Vite + TypeScript + Tailwind v4 e-commerce SPA (Nuhafrik) with an embedded Express API and Firebase (Firestore/Auth/Storage). No tests are configured; `npm run lint` is the only static check.

## Commands

- `npm run dev` — starts `server.ts` (Express) via tsx, NOT the bare Vite server. Serves the SPA through Vite middleware plus the API on `http://localhost:3000`.
- `npm run lint` — `tsc --noEmit`. This is the typecheck; there is no ESLint/Prettier. Run this after any change to verify.
- `npm run build` — `vite build` → `dist`. `npm run preview` serves the built app (via Vite; the Express prod fallback in `server.ts` is the Vercel path).
- `npm run provision:admin` / `npm run deploy:firestore-rules` — see Admin & ops.
- `npm run transform:prd:audit` — validates the production baseline (files/SEO/etc.). Prints only; read-only.
- No test framework exists. Verification = `npm run lint` + manual dev-server check.

## Architecture

- Two runtimes in one app: `src/` frontend (React, `BrowserRouter`, route tree in `src/App.tsx`) and `src/server/` Express API mounted at `/api/v1` (only `/products` routes exist). `server.ts` wires them together.
- The Express API uses `firebase-admin` initialized with only `projectId` — no embedded credentials. Local API calls fail unless Application Default Credentials are available (`GOOGLE_APPLICATION_CREDENTIALS` or `gcloud auth application-default login`). The frontend talks to Firestore directly via the client SDK, so most features work locally even when the API doesn't.
- Vite path alias: `@/*` → repo root (e.g. `import { db } from '@/lib/firebase'`). Configured in both `tsconfig.json` and `vite.config.ts`.
- `src/lib/firebase.ts` re-exports from `src/firebase/config.ts` — import from `@/lib/firebase`, not the config module directly.

## Firebase / data layer

- Firebase web config lives in the committed `firebase-applet-config.json` and is read at runtime by both client (`src/firebase/config.ts`) and server (`src/server/services/products.service.ts`). It is NOT loaded from `.env`. Project: `nuhafrik-clothings` (`.firebaserc`).
- Firestore collections: `products`, `orders`, `users`. See `firestore.rules` for the data model and access control.
- `firestore.rules`: products readable by all, admin-only writes; orders readable by owner/admin; everything else is admin-only. Admin = `role == 'admin'` in `users/{uid}` OR the hardcoded owner email `nuhafrikclothings@gmail.com`.
- Client-side admin detection (`src/firebase/config.ts` `isConfiguredAdminEmail`, `src/context/AuthContext.tsx`) also relies on that same hardcoded email plus `profile.role`. Admin routes are guarded by `src/hoc/withAdminAuth.tsx`.
- Changing the owner/admin email means updating it in ALL of: `src/firebase/config.ts`, `firestore.rules`, `scripts/provision-admin.mjs`, `.env.example`.

## Admin & ops

- `npm run provision:admin` (scripts/provision-admin.mjs): creates/updates the owner account in Firebase Auth + Firestore profile. Uses `scripts/service-account.json` if present (gitignored) via firebase-admin; otherwise falls back to the client SDK. Requires `NUHAFRIK_ADMIN_PASSWORD` env var in either case.
- `npm run deploy:firestore-rules` (scripts/deploy-firestore-rules.mjs): deploys `firestore.rules` via the Firebase Rules REST API. REQUIRES `scripts/service-account.json` (gitignored) — it will crash without it. Manual JWT signing, no CLI login needed.
- Seeding: `seed.ts` (wipes `products` then seeds 14 catalogue items via client SDK) and `add-products*.ts`. These root-level TS scripts are not in package.json — run with `npx tsx seed.ts`.

## Env & gotchas

- `GEMINI_API_KEY`: injected at build time into the client via `vite.config.ts` `define` (from `.env` / `loadEnv`). Used by the admin product generator (`src/lib/gemini.ts`, model `gemini-3-flash-preview`). Only meaningful in `vite build`/dev, not at Express runtime.
- `VITE_SITE_URL`: canonical site origin for SEO (`src/lib/seo.ts`, `import.meta.env.VITE_SITE_URL`).
- `vite.config.ts` has a comment warning not to modify the HMR block — `DISABLE_HMR=true` disables HMR for agent-editing environments.
- Deployment is Vercel SPA (vercel.json rewrites all routes to `index.html`). README notes Vercel domains must be added to Firebase Auth authorized domains for login to work.
- `docs/TRANSFORM_PRD_TO_ECOMMERCE_PRODUCTION.md` + `docs/NUHAFRIK_PRODUCTION_MEMORY_SNAPSHOT.md` document the production baseline and reapply workflow; check them before restructuring.