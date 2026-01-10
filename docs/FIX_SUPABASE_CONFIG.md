# Supabase Configuration Guide (Permanent Fix)

If you are seeing "Supabase configuration: Environment variables are missing" in your browser console, please follow these steps exactly.

## 1. Verify `.env.local` Content
Ensure your `.env.local` file is in the **root** of the `TailorShop` folder (not inside `src`).
It MUST contain exactly these variable names:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Common Issues:
*   **Spaces**: Ensure there are no spaces after the `=` or at the end of the line.
*   **Quotes**: Do **not** use quotes around the values (e.g., `KEY=value`, not `KEY="value"`).
*   **Typos**: Double-check `NEXT_PUBLIC_SUPABASE_URL` is spelled correctly.
*   **Prefix**: All variables used in the browser **MUST** start with `NEXT_PUBLIC_`.

## 2. Restart Development Server
If you add or change `.env.local`, you **MUST** stop the server and start it again:
1.  Press `Ctrl + C` in the terminal.
2.  Run `npm run dev` again.

## 3. Deployment (Vercel/etc.)
If you are deploying online, you must add these variables in your hosting provider's dashboard (Environment Variables section). They are **not** automatically uploaded from `.env.local` because that file is (and should be) gitignored.

## 4. Troubleshooting Tool
I have updated `src/lib/supabase.ts` to show exactly which variable is missing in the console. Check it again to see which one is `undefined`.
