// Single source of truth for the public app URL used in server-side code.
// Priority: APP_URL (Vercel server-only env) > NEXT_PUBLIC_APP_URL > hardcoded fallback.
// Never use NEXT_PUBLIC_APP_URL alone — it bakes in the build-time value (may be a preview URL).
export const APP_URL =
  process.env.APP_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'https://freelanceflow.com.br'
