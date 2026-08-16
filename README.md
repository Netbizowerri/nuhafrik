<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Nuhafrik Clothing and Accessories Store

A production-grade e-commerce SPA for an African-inspired fashion brand — **Nuhafrik Clothing and Accessories**.

This app was built and orchestrated in **Google AI Studio**. View it in AI Studio: https://ai.studio/apps/7e2a2979-a131-40ff-aebf-bda43044dde8

---

## 👨‍💻 Project Created By

**Kelechi Nwachukwu — The Code Orchestrator**

🔗 https://kelechi-nwachukwu.vercel.app/

---

## Overview

React 19 + Vite + TypeScript + Tailwind v4 e-commerce SPA with an embedded Express API and Firebase (Firestore/Auth/Storage). Features a browsable catalogue, cart, checkout, order tracking, customer accounts, and a full admin panel with a Gemini-powered product generator.

The store is live in Google AI Studio and deploys to Vercel as a Vite SPA. The dev server is an Express app that serves the SPA through Vite middleware and exposes the REST API on the same port.

---

## 🚀 Tech Stack

### Frontend
- **React 19** — component UI with Strict Mode
- **TypeScript** (~5.8) — strict, type-safe codebase
- **Vite 6** — build tool & dev server middleware
- **Tailwind CSS v4** — utility-first styling with `@tailwindcss/vite`
- **React Router v7** — `BrowserRouter` SPA routing
- **Zustand** — lightweight cart state management
- **React Hook Form + Zod** — typed forms & validation
- **react-helmet-async** — per-page SEO metadata
- **Motion (Framer Motion)** — spring/physics animations
- **Lucide React** — icon set

### Backend
- **Node.js + Express** — embedded API mounted at `/api/v1`
- **firebase-admin** — server-side Firebase access (provisioning & rules scripts)
- **helmet, cors, morgan, cookie-parser** — security & middleware
- **express-rate-limit** — API rate limiting

### Data & Auth
- **Firebase** — Firestore (products, orders, users), Authentication, Storage
- **Firestore Security Rules** — role-based access control

### Tooling & Ops
- **tsx** — runs TypeScript server (`server.ts`)
- **@google/genai** — Gemini-powered admin product generator
- **Vercel** — deployment (SPA rewrites via `vercel.json`)

---

## 📦 Installation

**Prerequisites:**
- **Node.js** (v18+) and npm
- A **Firebase** project (web config) — the committed `firebase-applet-config.json` points to the `nuhafrik-clothings` project
- *(Optional)* A **Gemini API key** for the admin product generator
- *(Optional)* Application Default Credentials for local API calls

**Steps:**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Netbizowerri/nuhafrik.git
   cd nuhafrik
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then set `GEMINI_API_KEY` in `.env` to your Gemini API key (used only by the admin product generator).

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open **http://localhost:3000** — the Express server serves the SPA via Vite middleware and mounts the API at `/api/v1`. Do NOT use a bare Vite server; it will not expose the API.

5. **(Optional) Seed the product catalogue**
   ```bash
   npx tsx seed.ts
   ```

6. **(Optional) Provision the admin account**
   ```bash
   NUHAFRIK_ADMIN_PASSWORD=your_password npm run provision:admin
   ```

Notes:
- Firebase config is read from [`firebase-applet-config.json`](./firebase-applet-config.json), not from `.env`.
- The frontend talks to Firestore directly via the client SDK, so most features work locally without backend credentials. Local API calls only work if Application Default Credentials are available (`GOOGLE_APPLICATION_CREDENTIALS` or `gcloud auth application-default login`).
- If `GEMINI_API_KEY` is missing, the store still loads fine — only the "Generate placeholder products" button in the admin panel reports that the key is not set.

---

## 📜 Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Express + Vite dev server on `http://localhost:3000` |
| `npm run build` | `vite build` → `dist` |
| `npm run preview` | Preview the built app via Vite |
| `npm run lint` | `tsc --noEmit` typecheck |
| `npm run provision:admin` | Create/update the owner admin account (Auth + Firestore profile); requires `NUHAFRIK_ADMIN_PASSWORD` |
| `npm run deploy:firestore-rules` | Deploy `firestore.rules` via the Firebase Rules REST API; requires `scripts/service-account.json` |
| `npm run transform:prd` | Print the production transformation workflow |
| `npm run transform:prd:audit` | Validate baseline production requirements |
| `npx tsx seed.ts` | Wipe `products` and seed the 14-item catalogue |

---

## ☁️ Deploy To Vercel

This project is configured to deploy as a Vite SPA on Vercel.

**Vercel settings:**
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

**Important notes:**
- Client-side routing uses `BrowserRouter`, so [`vercel.json`](./vercel.json) rewrites all non-file routes to `index.html`.
- If you use the Gemini-powered admin generator, set `GEMINI_API_KEY` in the Vercel project Environment Variables before deploying.
- Add your Vercel domain(s) to Firebase Authentication Authorized Domains if you need login to work in production.

---

## 🔐 Firestore Rules & Access Control

See [`firestore.rules`](./firestore.rules): products are publicly readable (admin-only writes), orders are readable by owner/admin, everything else is admin-only. Admin = `role == 'admin'` in `users/{uid}` OR the hardcoded owner email `nuhafrikclothings@gmail.com`. Changing that email requires updating `src/firebase/config.ts`, `firestore.rules`, `scripts/provision-admin.mjs`, and `.env.example` together.

---

## 🔁 Action Phrase Workflow

This repository includes a reusable production transformation workflow:

- Action phrase: `TRANSFORM PRD TO E-COMMERCE PRODUCTION`
- Blueprint: [`docs/TRANSFORM_PRD_TO_ECOMMERCE_PRODUCTION.md`](./docs/TRANSFORM_PRD_TO_ECOMMERCE_PRODUCTION.md)
- Project memory snapshot: [`docs/NUHAFRIK_PRODUCTION_MEMORY_SNAPSHOT.md`](./docs/NUHAFRIK_PRODUCTION_MEMORY_SNAPSHOT.md)

Commands:

1. `npm run transform:prd` to print the execution workflow.
2. `npm run transform:prd:audit` to validate baseline production requirements in the current codebase.

---

## 📝 Changelog

- **Promo alert** — homepage shows a timed "Buy 2, Get 1 FREE" modal (`src/components/promo/PromoAlert.tsx`).
- **Gemini key guard** — the Gemini client is now lazy-initialized so a missing `GEMINI_API_KEY` no longer crashes the app at load.
- **Firebase Admin** — pinned to `^12.1.0` for the provisioning / rules-deploy scripts.