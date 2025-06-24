/*
  # Demo User Setup Helper

  This migration creates a helper function to set up demo user profiles
  after the users are created through Supabase Auth.
  
  1. Helper Functions
     - `setup_demo_user_profile()` - Links auth users to their demo profiles
     - `create_demo_profiles()` - Creates demo profiles when auth users exist
  
  2. Usage
     - Call these functions after creating users through Supabase Auth
     - Or integrate into your application's user registration flow
*/

-- Create a function to set up demo user profiles
CREATE OR REPLACE FUNCTION setup_demo_user_profile(user_email text, user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role_name text;
BEGIN
  -- Determine role based on email
  IF user_email = 'admin@medplatform.com' THEN
    user_role_name := 'admin';
  ELSIF user_email = 'doctor@medplatform.com' THEN
    user_role_name := 'doctor';
  ELSIF user_email = 'patient@medplatform.com' THEN
    user_role_name := 'patient';
  ELSE
    RETURN; -- Not a demo user
  END IF;

  -- Insert user role
  INSERT INTO user_roles (user_id, role)
  VALUES (user_id, user_role_name)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create doctor profile if this is the demo doctor
  IF user_email = 'doctor@medplatform.com' THEN
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
      user_id,
      'Dr. John',
      'Smith',
      '+1-555-0123',
      'American',
      'Cardiology, Internal Medicine',
      'https://drjohnsmith.com',
      '@drjohnsmith',
      'Experienced cardiologist with over 15 years of practice. Specializing in preventive cardiology and heart disease management.',
      true
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- Create patient profile if this is the demo patient
  IF user_email = 'patient@medplatform.com' THEN
    INSERT INTO patient_profiles (
      user_id,
      alias,
      bio
    ) VALUES (
      user_id,
      'HealthSeeker',
      'Health-conscious individual looking for quality medical care and wellness advice.'
    ) ON CONFLICT (user_id) DO NOTHING;
  END IF;
END;
$$;

-- Create a function to set up all demo profiles if the auth users exist
CREATE OR REPLACE FUNCTION create_demo_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
  doctor_user_id uuid;
  patient_user_id uuid;
BEGIN
  -- Get user IDs from auth.users if they exist
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@medplatform.com' LIMIT 1;
  SELECT id INTO doctor_user_id FROM auth.users WHERE email = 'doctor@medplatform.com' LIMIT 1;
  SELECT id INTO patient_user_id FROM auth.users WHERE email = 'patient@medplatform.com' LIMIT 1;

  -- Set up profiles for existing users
  IF admin_user_id IS NOT NULL THEN
    PERFORM setup_demo_user_profile('admin@medplatform.com', admin_user_id);
  END IF;

  IF doctor_user_id IS NOT NULL THEN
    PERFORM setup_demo_user_profile('doctor@medplatform.com', doctor_user_id);
  END IF;

  IF patient_user_id IS NOT NULL THEN
    PERFORM setup_demo_user_profile('patient@medplatform.com', patient_user_id);
  END IF;
END;
$$;

-- Create a trigger function to automatically set up demo profiles when users sign up
CREATE OR REPLACE FUNCTION handle_demo_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if this is a demo user and set up their profile
  IF NEW.email IN ('admin@medplatform.com', 'doctor@medplatform.com', 'patient@medplatform.com') THEN
    PERFORM setup_demo_user_profile(NEW.email, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically handle demo user signups
-- Note: This trigger will only work if we have access to auth.users table
-- In some Supabase setups, this might not be available
DO $$
BEGIN
  -- Try to create the trigger, but don't fail if we can't access auth.users
  BEGIN
    DROP TRIGGER IF EXISTS on_demo_user_created ON auth.users;
    CREATE TRIGGER on_demo_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION handle_demo_user_signup();
  EXCEPTION
    WHEN insufficient_privilege OR undefined_table THEN
      -- Ignore if we don't have access to auth.users
      NULL;
  END;
END $$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION setup_demo_user_profile(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION setup_demo_user_profile(text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION create_demo_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION create_demo_profiles() TO anon;

-- Try to set up demo profiles if the users already exist
SELECT create_demo_profiles();