-- Create new admin user in Supabase
-- Email: gospelachuenu4321@gmail.com
-- Password: Gospower1234@

-- Insert the new user into auth.users table
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'gospelachuenu4321@gmail.com',
    crypt('Gospower1234@', gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Admin", "last_name": "User", "full_name": "Admin User"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Get the user ID for the newly created user
-- You can use this to create a user profile if needed
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'gospelachuenu4321@gmail.com';

-- Create user profile with admin privileges
INSERT INTO user_profiles (
    id,
    first_name,
    last_name,
    is_admin,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'gospelachuenu4321@gmail.com'),
    'Admin',
    'User',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    is_admin = true,
    updated_at = NOW();

-- Verify the admin user was created
SELECT id, first_name, last_name, is_admin, created_at 
FROM user_profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'gospelachuenu4321@gmail.com');
