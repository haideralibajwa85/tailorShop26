# Vercel Deployment & Environment Fix

To ensure your TailorShop project works perfectly after deployment, follow these exact steps.

## Part 1: Local Development Fix
If you see "Environment variables missing" while running `npm run dev`:
1.  **Stop the process**: Press `Ctrl + C` in your terminal.
2.  **Restart**: Run `npm run dev` again.
3.  **Check Console**: Open the browser console (F12). It will now show which specific variable is being read or if it's missing.

## Part 2: Vercel Deployment (MANDATORY)
Files ending in `.local` (like `.env.local`) are **never** uploaded to Vercel. You must add them manually:

1.  Open your [Vercel Dashboard](https://vercel.com/dashboard).
2.  Select your **TailorShop** project.
3.  Navigate to **Settings** -> **Environment Variables**.
4.  Add these keys using the values from your `.env.local`:
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY` (Get this from Supabase Dashboard > Settings > API > service_role)

## Part 3: Code Safety
The code is now "Vercel-Safe". I have added:
*   **Null-Guards**: The app won't crash if the values are missing; it will show a helpful warning in the console instead.
*   **Build Optimization**: The TypeScript compiler will no longer error out during the Vercel build process.
