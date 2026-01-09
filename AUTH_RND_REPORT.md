# Authentication & Dashboard Access R&D Report

## Summary
- Superadmin sessions were authenticating correctly, but navigation links still pushed them to `/admin/dashboard`, which produced empty data for that role.
- All dashboard pages rely on the shared client-side Supabase instance; missing Row Level Security (RLS) policies or profile rows in `public.users` cause blank states after login.
- Middleware was simplified to let Supabase helpers manage cookies without blocking requests.

## Fixes Implemented
1. **Consistent dashboard routing** – added a helper in the navigation bar so each role routes to its own dashboard (`/superadmin`, `/admin`, `/tailor`, `/customer`). @src/components/Navigation.tsx#40-205
2. **Middleware passthrough** – ensured middleware just hydrates the Supabase client and forwards headers; it no longer blocks requests so sessions persist. @src/middleware.ts#1-27

## Supabase Requirements
- Every authenticated user must have a matching row in `public.users` with `role`, `full_name`, and (for non-superadmins) `organization_id`. @src/context/AppContext.tsx#22-82
- Create RLS policies that allow:
  - Superadmins: unrestricted read/write on `users`, `organizations`, `orders`, and related tables.
  - Admins/Tailors/Customers: access limited to rows matching their `organization_id` or `id`.
- Dashboards query Supabase directly from the browser, so the policies must support both `select` and relevant mutations. @src/lib/api.ts#18-354

## Verification Checklist
1. Start the dev server (`npm run dev`).
2. Log in with a superadmin. Confirm redirect to `/superadmin/dashboard` and that organization stats populate.
3. Repeat for admin, tailor, and customer accounts; each should land on their dashboard with data.
4. Trigger logout from the navigation menu and confirm redirect to `/auth/login`.

## Next Steps
- Once RLS policies are in place, add automated tests or a health-check script to verify role access regularly.
- If more granular role permissions are needed, extend `getDashboardRoute` and `getNavItems` with additional routes.
