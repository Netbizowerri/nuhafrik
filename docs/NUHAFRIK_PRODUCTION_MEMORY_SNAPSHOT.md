# Nuhafrik Production Memory Snapshot

This file captures the production baseline extracted from this project so it can be reapplied to future React 19 e-commerce scaffolds.

## Architecture Snapshot

- Frontend: React 19 + Vite + TypeScript + Tailwind v4
- Routing: `BrowserRouter` route tree with public and admin layout separation
- State:
- `zustand` persisted cart store
- React context for auth/profile/admin role state
- Backend runtime: Express server + Vite middleware (dev) + static serve (prod)
- Data: Firebase Firestore/Auth/Storage
- SEO: `react-helmet-async` metadata component + sitemap + robots

## Route Baseline

Public:
- `/`
- `/shop`
- `/product/:productId`
- `/cart`
- `/checkout`
- `/checkout/success/:orderId`
- `/orders`
- `/orders/:orderId`
- `/account`
- `/login`
- `/search`
- `/about`
- `/contact`
- `/faq`
- `/shipping-returns`

Admin:
- `/admin`
- `/admin/products`
- `/admin/orders`

## Commerce Feature Baseline

- product catalog fetch from Firestore
- category filtering + search query matching
- product detail with image gallery and variant selection
- add-to-cart and buy-now behavior
- persisted cart totals and quantity updates
- 2-step checkout (delivery -> payment)
- order creation to Firestore with generated order number
- order confirmation data persisted locally for success page rendering

## Admin Baseline

- admin auth guard HOC (`withAdminAuth`)
- admin dashboard metrics and management pages
- product CRUD modal flow
- publish/draft toggle and listing filters
- order management page scaffold

## Design System Baseline

- tokenized CSS variables in `src/index.css`
- reusable classes for:
- page shells and spacing
- cards/surfaces
- buttons and form fields
- badges/status pills
- floating labels and choice cards
- visual language:
- warm neutral + orange accent palette
- strong typography hierarchy using `Poppins`
- motion and hover states with consistent transitions
- mobile-first layout with fixed bottom nav on small screens

## SEO Baseline

- reusable `Seo` component with:
- title/description/canonical
- robots + googlebot tags
- OpenGraph + Twitter tags
- optional JSON-LD structured data injection
- helper utilities in `src/lib/seo.ts` for:
- site URL normalization
- canonical absolute URL generation
- description sanitization/truncation
- default OG image resolution
- static SEO files:
- `public/sitemap.xml`
- `public/robots.txt`

## Security Baseline

- Firestore rules include:
- admin checks by role/email
- order creation shape validation
- owner/admin read controls
- Express middleware includes:
- `helmet`
- `cors`
- `cookie-parser`
- API rate limiter
- typed error middleware and structured responses
- form validation with `zod` + `react-hook-form`

## Deployment Baseline

- Vercel SPA fallback rewrite in `vercel.json`
- production static serving fallback in `server.ts` (`* -> index.html`)

## Reapply Guidance

To reproduce this baseline in a new scaffold, run the workflow in:
- `docs/TRANSFORM_PRD_TO_ECOMMERCE_PRODUCTION.md`
