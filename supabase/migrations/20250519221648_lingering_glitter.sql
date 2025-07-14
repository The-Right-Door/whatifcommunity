/*
  # Add special_permissions field to users table

  1. Changes
    - Add special_permissions boolean field to users table with default false
    - Update existing users to have special_permissions set to false

  2. Security
    - Maintain existing RLS policies
*/

-- Add special_permissions column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'special_permissions'
  ) THEN
    ALTER TABLE users ADD COLUMN special_permissions boolean DEFAULT false;
  END IF;
END $$;