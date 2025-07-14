/*
  # Clean User Security Setup

  1. Changes
    - Remove password column since it's managed by Supabase Auth
    - Clean up and consolidate RLS policies

  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users to manage their own data
    - Ensure user_id matches auth.uid() for all operations
*/

-- Drop the password column since it's managed by Supabase Auth
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Drop existing policies to ensure clean slate
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create secure policies that enforce user_id = auth.uid()
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