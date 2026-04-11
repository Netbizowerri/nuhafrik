# TRANSFORM PRD TO E-COMMERCE PRODUCTION

## Action Phrase

`TRANSFORM PRD TO E-COMMERCE PRODUCTION`

When you use this phrase in a React 19 scaffold, execution should default to this workflow end-to-end.

## Execution Contract

Input expected from user:
- PRD or product brief
- target brand name
- Firebase config (if Firebase-backed)
- deployment target (`Vercel`, `Netlify`, or `cPanel`)

Default assumptions if not provided:
- React 19 + Vite
- `BrowserRouter` paths (no hash routes)
- Firebase Firestore + Auth for commerce data and admin gating
- SEO-ready public routes and non-indexed private routes

Output required:
- production-grade storefront
- secure checkout and order flow
- admin operations (dashboard/products/orders)
- SEO assets + per-page metadata
- deployment-ready routing fallback config

## Non-Negotiable Standards

1. React routing standard:
- Use `BrowserRouter` from `react-router-dom`.
- Keep clean route paths (`/shop`, `/product/:id`), never hash navigation.

2. UI system standard:
- Establish design tokens in global CSS (`:root` variables for colors, typography, spacing, radius, shadows, motion).
- Reuse shared primitives for buttons, inputs, cards, pills, sections.
- Preserve mobile + desktop behavior and include sticky nav / mobile bottom nav when relevant.

3. SEO standard:
- Include reusable metadata component (`react-helmet-async`).
- Add unique page title/description/OG tags for indexable routes.
- Maintain `public/sitemap.xml` and `public/robots.txt`.

4. Security standard:
- Validate untrusted input at boundaries (e.g., Zod for forms and API).
- Keep auth-based access control for admin routes and protected data paths.
- Use secure middleware (`helmet`, `rate-limit`, structured error handling) when server routes exist.
- Keep secrets out of source code; use env vars.

5. Deployment standard:
- SPA rewrite fallback must exist for chosen host.
- `vercel.json` rewrite or Netlify `_redirects` or Apache `.htaccess` fallback.

## Phase Workflow

Phase 1: Foundation
- Inspect scaffold structure and dependencies.
- Lock architecture (routes, state, data, auth, deployment target).
- Normalize app shell and route layout.

Phase 2: Design System + Layout
- Build tokenized CSS theme and utility classes.
- Implement shell components (header/footer/mobile nav/menu).
- Establish consistent typography, spacing, and interaction states.

Phase 3: Commerce Core
- Implement home/shop/product/cart/checkout/order success flows.
- Add cart state persistence and totals.
- Add product listing/search/filter/category support.

Phase 4: Auth + Admin
- Implement auth context and admin route guard.
- Ship admin dashboard + products + orders management.
- Support publish/unpublish and CRUD where required.

Phase 5: SEO + Compliance
- Add SEO component and per-route metadata.
- Add structured data where meaningful (`Product`, `CollectionPage`, `ClothingStore`, etc.).
- Add sitemap + robots and canonical URL helpers.

Phase 6: Security + Deployment Hardening
- Verify Firestore rules or API auth/authorization.
- Add/verify server middleware protections.
- Add deployment rewrites/fallback and production environment checks.

Phase 7: Verification
- Type-check/lint/build.
- Validate route refresh behavior in production mode.
- Validate primary commerce journeys (browse -> cart -> checkout -> order).

## Definition Of Done

All boxes must be true:
- [ ] public storefront routes complete and navigable
- [ ] product detail + variant selection + add-to-cart working
- [ ] checkout saves order and confirms success state
- [ ] admin pages are gated and operational
- [ ] SEO metadata exists for each public route
- [ ] `robots.txt` and `sitemap.xml` are valid
- [ ] deployment rewrite fallback is configured
- [ ] no hardcoded secrets in tracked files
- [ ] lint/type-check/build pass

## Invocation Pattern For Future Projects

Use this exact message:

`TRANSFORM PRD TO E-COMMERCE PRODUCTION`

Optional append:
- brand and style direction
- PRD content
- preferred backend/provider
- target host

Execution should then proceed directly through this workflow unless a hard blocker is found.
