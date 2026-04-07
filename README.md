<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7e2a2979-a131-40ff-aebf-bda43044dde8

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy To Vercel

This project is configured to deploy as a Vite SPA on Vercel.

Vercel settings:
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Important notes:
- Client-side routing uses `BrowserRouter`, so [`vercel.json`](./vercel.json) rewrites all non-file routes to `index.html`.
- Firebase config is read from [`firebase-applet-config.json`](./firebase-applet-config.json), not from `.env.local`.
- If you use the Gemini-powered admin generator, set `GEMINI_API_KEY` in the Vercel project Environment Variables before deploying.
- Add your Vercel domain(s) to Firebase Authentication Authorized Domains if you need login to work in production.
