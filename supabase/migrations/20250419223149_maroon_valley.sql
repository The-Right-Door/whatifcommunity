/*
  # Update users table for Supabase Auth integration

  1. Changes
    - Remove password column as it's handled by Supabase Auth
    - Change user_id to UUID type
    - Add RLS policies for secure access

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop the password column since it's managed by Supabase Auth
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Update user_id to use UUID type
--ALTER TABLE users ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
--no need to update the user_id to use UUID type, it is already changed

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

  