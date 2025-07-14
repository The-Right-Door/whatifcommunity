/*
  # Add subjects_majored column to users table

  1. Changes
    - Add subjects_majored as text[] to store multiple subject names
    - Add experience column for teacher details
    - Add achievements column for all users

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'subjects_majored'
  ) THEN
    ALTER TABLE users ADD COLUMN subjects_majored text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'experience'
  ) THEN
    ALTER TABLE users ADD COLUMN experience text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'achievements'
  ) THEN
    ALTER TABLE users ADD COLUMN achievements text;
  END IF;
END $$;