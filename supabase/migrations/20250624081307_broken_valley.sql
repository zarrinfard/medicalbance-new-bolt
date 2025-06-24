/*
  # Create Admin User

  1. Insert admin user role
  2. This will be used to identify admin users in the application
*/

-- Insert admin user role (this will be created after the first admin signs up)
-- The admin user should sign up normally and then we'll update their role

-- Function to make a user admin (to be called after admin signs up)
CREATE OR REPLACE FUNCTION make_user_admin(user_email text)
RETURNS void AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get user ID from auth.users
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NOT NULL THEN
    -- Insert or update user role to admin
    INSERT INTO user_roles (user_id, role)
    VALUES (user_id, 'admin')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'admin';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION make_user_admin(text) TO authenticated;