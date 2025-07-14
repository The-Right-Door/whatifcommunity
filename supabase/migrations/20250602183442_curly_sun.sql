/*
  # Add grade_name column to grades table

  1. Changes
    - Add grade_name column to grades table
    - Update existing grades with default names
    - Add grade_name to classroom queries

  2. Security
    - Maintain existing RLS policies
*/

-- Add grade_name column to grades table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'grades' AND column_name = 'grade_name'
  ) THEN
    ALTER TABLE grades ADD COLUMN grade_name TEXT;
  END IF;
END $$;

-- Update existing grades with default names
UPDATE grades
SET grade_name = 'Grade ' || grade_no
WHERE grade_name IS NULL;