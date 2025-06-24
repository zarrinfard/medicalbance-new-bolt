/*
  # Create Demo Users and Profiles

  1. Demo Users Setup
    - Creates demo users for admin, doctor, and patient roles
    - Sets up corresponding profiles in respective tables
    - Ensures proper role assignments

  2. User Accounts Created
    - Admin: admin@medplatform.com (password: password123)
    - Doctor: doctor@medplatform.com (password: password123)  
    - Patient: patient@medplatform.com (password: password123)

  3. Security
    - All demo accounts are properly configured with RLS policies
    - Doctor account is pre-approved for immediate access
    - Profiles are linked to authentication users

  Note: This migration creates demo users directly in auth.users table for development purposes.
  In production, users should register through the application interface.
*/

-- Insert demo users into auth.users table
-- Note: In a real production environment, users would be created through Supabase Auth API
-- This is for demo/development purposes only

-- Create admin user
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
  'admin@medplatform.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create doctor user
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
  'doctor@medplatform.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create patient user
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
  'patient@medplatform.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create user roles for demo accounts
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'admin@medplatform.com'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'doctor'
FROM auth.users 
WHERE email = 'doctor@medplatform.com'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'patient'
FROM auth.users 
WHERE email = 'patient@medplatform.com'
ON CONFLICT DO NOTHING;

-- Create doctor profile
INSERT INTO doctor_profiles (
  user_id,
  first_name,
  last_name,
  phone,
  nationality,
  specialties,
  website,
  social_media,
  bio,
  is_approved
)
SELECT 
  id,
  'Dr. John',
  'Smith',
  '+1-555-0123',
  'American',
  'Cardiology, Internal Medicine',
  'https://drjohnsmith.com',
  '@drjohnsmith',
  'Experienced cardiologist with over 15 years of practice. Specializing in preventive cardiology and heart disease management.',
  true
FROM auth.users 
WHERE email = 'doctor@medplatform.com'
ON CONFLICT DO NOTHING;

-- Create patient profile
INSERT INTO patient_profiles (
  user_id,
  alias,
  bio
)
SELECT 
  id,
  'HealthSeeker',
  'Health-conscious individual looking for quality medical care and wellness advice.'
FROM auth.users 
WHERE email = 'patient@medplatform.com'
ON CONFLICT DO NOTHING;