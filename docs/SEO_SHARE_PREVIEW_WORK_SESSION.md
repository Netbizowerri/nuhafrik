# Nuhafrik SEO/GEO Work Session Memory (Aug 18 2026)

Work-in-progress continuation log for the SEO + social share preview project. Read this first before resuming.

## Goal

- Every product has a SEO-friendly URL: `/product/:category/:slug` (e.g. `/product/accessories/coach-signature-chocolate-tote`).
- Sharing any product URL on Facebook/WhatsApp/social media must show professional meta tags, description, and product image.
- Hosting (user-confirmed): **both** — Vercel for the demo, cPanel (`public_html/`) for production after client approval.
- User's stated Vercel command `npx plugins add vercel/vercel-plugin` is NOT a valid npm command; actual deploy uses the standard Vercel CLI (already installed & logged in as `netbizowerri`).

## What is DONE and verified

- SEO repo `ultimate-seo-geo` cloned + audit run → `seo-report.html` (Overall 59/100; `social_meta` was 0/100).
- **Frontend** (all `npm run lint` clean):
  - `src/lib/productUrl.ts` (new): `slugify`, `getProductSlug`, `getCategorySlug`, `getProductPath`, `getProductUrl`.
  - `src/App.tsx`: route `/product/:category/:slug` + legacy `/product/:productId` kept.
  - `src/pages/product/ProductDetailPage.tsx`: fetch by slug, legacy id fallback, canonical `<Navigate>` redirect, share button (navigator.share/clipboard), Seo gets product image + product prop.
  - `src/components/product/ProductCard.tsx`: links → `getProductPath(product)`.
  - `src/components/seo/Seo.tsx`: added og:site_name, og:image:alt, twitter:site, product OG tags.
  - `src/lib/seo.ts`: `DEFAULT_SITE_URL` = `https://www.nuhafrikclothings.com`; `DEFAULT_OG_IMAGE_PATH` = `/og-default.png` (was .svg).
  - `index.html`: static meta description, OG/Twitter tags, WebSite + Organization JSON-LD; og:image/twitter:image/logo now point to `/og-default.png`.
  - `src/pages/{home,about,contact}/` pages now use `DEFAULT_OG_IMAGE_PATH`.
- **Server-side** (Vercel + cPanel dual path):
  - `middleware.ts` (repo root, Vercel): crawler UA detection, Firestore REST lookup, prerendered OG HTML + Product JSON-LD, legacy `/product/:id`, dynamic `/sitemap.xml`. Static-asset passthrough regex added; matcher is `['/:path*']` (match-all, filtering done in code). Currently contains a temporary unconditional `return new Response('MW_RESPONSE_OK')` + `console.log('NUHAFRIK_MIDDLEWARE_V3 marker', ...)` debug marker — **MUST BE REMOVED**.
  - `public/social-meta.php` (cPanel): same prerender logic, curl fallback; `DEFAULT_IMAGE` → `/og-default.png`.
  - `public/sitemap.php` (cPanel): dynamic sitemap from Firestore.
  - `public/.htaccess`: sitemap.xml→sitemap.php, crawler UA→social-meta.php, static passthrough, SPA fallback; preserves user's gzip/cache/security rules.
  - `public/robots.txt`: correct domain, AI crawler allows.
  - `public/sitemap.xml`: static pages only (generators add products).
  - `public/og-default.png`: generated 1200×630 brand image (46,452 bytes). NOTE: model could NOT visually verify it — user should eyeball it.
- Build verified: `npm run build` succeeds; `dist/` contains `.htaccess`, `sitemap.php`, `social-meta.php`, `og-default.png`, `robots.txt`, `sitemap.xml`.
- Local middleware tests via `node ./node_modules/tsx/dist/cli.mjs`: product page, homepage, sitemap (46 URLs), passthrough for static assets all pass.
- Firestore REST verified: `https://firestore.googleapis.com/v1/projects/nuhafrik-clothings/databases/(default)/documents:runQuery` with `collectionId` inside `structuredQuery.from` (NOT `documents/products:runQuery` — that 400s). 40 products live; slug field exists. Example: `Coach Signature Chocolate Tote`, slug `coach-signature-chocolate-tote`, category `accessories`, price 18000.
- PHP syntax validated via `php-parser` npm package (no local PHP binary installed).

## CURRENT BLOCKER (in progress)

**Vercel middleware is deployed but never executes at runtime.** Evidence:
- Deployment build shows `λ middleware (22.24KB)` — Vercel sees it.
- Logs (`npx vercel logs <deployment-url> --json`) show `"source":"edge-middleware"` entries but `"responseStatusCode":0` and empty `logs:[]` — i.e. passthrough, marker console.log never appears.
- Deployed a version whose first line was an unconditional `return new Response('MW_RESPONSE_OK')`; live site STILL returned normal index.html → middleware body genuinely never runs.
- Suspicious: two deploys with different middleware code both reported `λ middleware (22.19KB)` (identical), suggesting stale build cache despite `npx vercel deploy --prod --yes --force`.
- **Deployment Protection appears to be ON**: direct deployment URL returns a Vercel "Protected Deployment" shell (`<html data-dpl-id=...>`). This auth wall can intercept before middleware runs.

### Deployments made (project `nuhafrik` under `netbiz-owerris-projects`, already linked)
- Preview: `nuhafrik-h3kdj66ac-netbiz-owerris-projects.vercel.app`
- Production (all aliased to `https://nuhafrik.vercel.app`): `hg5cd9gj5`, `fsnsefu7j`, `8eliwn4b3`, `72365uxll`, `f21kbgua8` (last = the debug marker version).

### Verification commands (PowerShell 5.1 — NO ternary operator; use `if ($c -match $p){}`)
- Crawler request: `Invoke-WebRequest -Uri "<url>" -Headers @{'User-Agent'='facebookexternalhit/1.1'} -UseBasicParsing`
- Check for `property="og:title" content="..."`, `rel="canonical"`, `product:price:amount`, and header `x-nuhafrik-seo`.
- Current failure signature on live: og:title == static index.html title, canonical MISSING, `x-nuhafrik-seo` MISSING, sitemap = 6 static URLs (546 bytes) instead of ~46 dynamic.

## NEXT STEPS (resume here)

1. **Remove debug marker** from `middleware.ts` (the unconditional return + console.log).
2. **Disable/check Vercel Deployment Protection** (project → Settings → Deployment Protection). This is the prime suspect for middleware not running. If toggling off is not possible via CLI, do it in the dashboard or ask the user.
3. **Clear Vercel build cache** (or make a meaningful code change to bust the stale 22.19/22.24KB bundle) and redeploy `npx vercel --prod --yes --force`.
4. Re-verify live: product URL + facebookexternalhit UA → expect real product og:title, product image, canonical, product:price, `x-nuhafrik-seo` header; `/sitemap.xml` → ~46 URLs.
5. Then test with real sharing: Facebook Sharing Debugger / WhatsApp preview.
6. cPanel production (after client approval): upload `dist/*` (incl. `.htaccess`, `social-meta.php`, `sitemap.php`) to `public_html/`; verify `https://www.nuhafrikclothings.com/sitemap.xml` and a product URL with crawler UA.
7. Clean up untracked temp files: `mw-test.tmp.ts`, `live-home.html`, `seo-report.html`, `ultimate-seo-geo/`, `Nuhafrik-deploy.zip` (decide keep/remove).

## KEY GOTCHAS / NOTES

- Windows PowerShell 5.1: no `?:` ternary; avoid `&&`/newlines; use `;` or `if ($?)`.
- Vercel CLI: `npx vercel deploy --prod --yes --force`; inspect build with `npx vercel inspect <url>`; logs with `npx vercel logs <url> --json`.
- `vercel.json` already configured: framework vite, outputDirectory dist, rewrite `/(.*)` → `/index.html`. Middleware runs before rewrites.
- Middleware matcher: match-all `['/:path*']` with in-code static-asset filter is more reliable than a complex lookahead regex (Vercel matcher compiler may choke on the old pattern).
- Vite copies `public/` (including dotfiles like `.htaccess` and PHP files) into `dist/`.
- Frontend admin emails / firebase config unchanged this session.
- User's uncommitted local changes also present (Footer, PromoAlert, ContactPage, Meta Pixel in index.html, tracking component, `public_html/`, `Nuhafrik-deploy.zip`). Do NOT commit anything unless asked.