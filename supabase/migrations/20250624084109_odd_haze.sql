/*
  # Create Demo Users and Profiles

  1. New Tables
    - Creates demo user records in public schema (since we can't directly insert into auth.users)
    - Creates corresponding user roles
    - Creates doctor and patient profiles for demo accounts

  2. Security
    - Maintains existing RLS policies
    - Creates approved doctor profile for immediate access

  3. Demo Accounts
    - Admin: admin@medplatform.com
    - Doctor: doctor@medplatform.com (pre-approved)
    - Patient: patient@medplatform.com

  Note: In production, users should be created through Supabase Auth API.
  This migration creates the supporting data structure for demo accounts.
*/

-- First, let's create a temporary table to store demo user IDs
-- These IDs should match the ones created through Supabase Auth
CREATE TEMP TABLE demo_users (
  email text,
  user_id uuid,
  role text
);

-- Insert demo user references (these IDs will be used when users are created via Auth)
INSERT INTO demo_users (email, user_id, role) VALUES
  ('admin@medplatform.com', '11111111-1111-1111-1111-111111111111', 'admin'),
  ('doctor@medplatform.com', '22222222-2222-2222-2222-222222222222', 'doctor'),
  ('patient@medplatform.com', '33333333-3333-3333-3333-333333333333', 'patient');

-- Create user roles for demo accounts
INSERT INTO user_roles (user_id, role)
SELECT user_id, role FROM demo_users;

-- Create doctor profile for demo doctor
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
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Dr. John',
  'Smith',
  '+1-555-0123',
  'American',
  'Cardiology, Internal Medicine',
  'https://drjohnsmith.com',
  '@drjohnsmith',
  'Experienced cardiologist with over 15 years of practice. Specializing in preventive cardiology and heart disease management.',
  true
);

-- Create patient profile for demo patient
INSERT INTO patient_profiles (
  user_id,
  alias,
  bio
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'HealthSeeker',
  'Health-conscious individual looking for quality medical care and wellness advice.'
);

-- Create a function to help with demo user setup
CREATE OR REPLACE FUNCTION setup_demo_user_profile(user_email text, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user_roles with the actual user_id from auth
  UPDATE user_roles 
  SET user_id = setup_demo_user_profile.user_id
  WHERE user_id IN (
    SELECT demo_users.user_id 
    FROM demo_users 
    WHERE demo_users.email = user_email
  );
  
  -- Update doctor_profiles with the actual user_id from auth
  UPDATE doctor_profiles 
  SET user_id = setup_demo_user_profile.user_id
  WHERE user_id IN (
    SELECT demo_users.user_id 
    FROM demo_users 
    WHERE demo_users.email = user_email AND demo_users.role = 'doctor'
  );
  
  -- Update patient_profiles with the actual user_id from auth
  UPDATE patient_profiles 
  SET user_id = setup_demo_user_profile.user_id
  WHERE user_id IN (
    SELECT demo_users.user_id 
    FROM demo_users 
    WHERE demo_users.email = user_email AND demo_users.role = 'patient'
  );
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION setup_demo_user_profile(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION setup_demo_user_profile(text, uuid) TO anon;