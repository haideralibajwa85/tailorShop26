-- Reset User Credentials by Phone Number
-- This script finds the user with phone '9233456789' and updates their password and confirmation status.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    target_phone text := '9233456789';
    target_user_id uuid;
BEGIN
    -- Find the user ID
    SELECT id INTO target_user_id FROM auth.users WHERE phone = target_phone OR raw_user_meta_data->>'phone' = target_phone LIMIT 1;

    IF target_user_id IS NOT NULL THEN
        -- Update the user
        UPDATE auth.users
        SET 
            encrypted_password = crypt('admin@12345', gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            phone_confirmed_at = COALESCE(phone_confirmed_at, now()),
            updated_at = now(),
            raw_app_meta_data = raw_app_meta_data || '{"provider": "email", "providers": ["email", "phone"]}'
        WHERE id = target_user_id;
        
        RAISE NOTICE 'User with phone % updated successfully. ID: %', target_phone, target_user_id;
    ELSE
        RAISE NOTICE 'User with phone % NOT FOUND in auth.users', target_phone;
    END IF;
END $$;
