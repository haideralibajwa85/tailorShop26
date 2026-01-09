# Supabase Authentication Settings Guide

To ensure that Stitchers (and other users) can login properly without needing to verify their email addresses manually, please follow these steps in your Supabase Dashboard.

## Disable Email Confirmation

1.  **Log in** to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project (**Tailor Shop**).
3.  In the left sidebar, click on **Authentication**.
4.  Click on **Providers** under the Configuration section.
5.  Click on **Email** to expand the settings.
6.  **Toggle OFF** the switch for **"Confirm email"** (it might be labeled "Confirm email" or "Enable Email Confirmations").
7.  Click **Save**.

> **Note:** Disabling this ensures that when you create a user via the API (like we do for Stitchers), they are immediately "confirmed" and can login right away without clicking any link in an email inbox.

## Verify Stitcher Login
After applying these settings and running the fix script, your stitcher can login with:
*   **Phone:** `9233456789`
*   **Password:** `admin@12345`
