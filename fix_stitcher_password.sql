-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fix User Auth Status and Password
-- This updates the auth.users table directly to ensure the password is 'admin@12345'
-- and the email is marked as confirmed.

UPDATE auth.users
SET 
    encrypted_password = crypt('admin@12345', gen_salt('bf')),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'AA0926@worker.stitcher-mail.com';

-- Verify the update
SELECT id, email, email_confirmed_at, last_sign_in_at 
FROM auth.users 
WHERE email = 'AA0926@worker.stitcher-mail.com';
