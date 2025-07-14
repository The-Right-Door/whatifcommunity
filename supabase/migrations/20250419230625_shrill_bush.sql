/*
  # Update User Table Configuration

  1. Changes
    - Remove password column since it's managed by Supabase Auth
    - Add trigger to automatically set user_id from auth.uid()
    - Update RLS policies for better security

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add trigger for automatic user_id assignment
*/

-- Drop the password column since it's managed by Supabase Auth
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Add trigger to automatically set user_id from auth.uid()
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- Update RLS policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

  