/*
  # Update User Table Security

  1. Changes
    - Remove password column since it's managed by Supabase Auth
    - Update RLS policies for better security

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop the password column since it's managed by Supabase Auth
ALTER TABLE users DROP COLUMN IF EXISTS password;

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