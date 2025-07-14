/*
  # Create users table with UUID primary key

  1. New Tables
    - users
      - user_id (uuid, primary key)
      - first_name (varchar 50)
      - middle_name (varchar 50)
      - last_name (varchar 50) 
      - email (varchar 100, unique)
      - phone (varchar 20)
      - password (text)
      - role (varchar 20)
      - date_of_birth (date)
      - registration_complete (boolean)
      - created_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Clean up legacy column
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Recreate correct trigger
CREATE OR REPLACE FUNCTION set_user_id_from_auth()
RETURNS trigger AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS insert_user_id_from_auth ON users;

CREATE TRIGGER insert_user_id_from_auth
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_user_id_from_auth();

-- Reapply secure RLS policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
