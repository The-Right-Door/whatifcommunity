/*
  # Add missing columns to assessments table

  1. Changes
    - Add target_audience column to assessments table
    - Add selected_learners column to store JSON array of learner IDs
    - Add selected_groups column to store JSON array of group IDs

  2. Security
    - Maintain existing RLS policies
*/

-- Add missing columns to assessments table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assessments' AND column_name = 'target_audience'
  ) THEN
    ALTER TABLE assessments ADD COLUMN target_audience TEXT DEFAULT 'class';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assessments' AND column_name = 'selected_learners'
  ) THEN
    ALTER TABLE assessments ADD COLUMN selected_learners JSONB DEFAULT '[]';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assessments' AND column_name = 'selected_groups'
  ) THEN
    ALTER TABLE assessments ADD COLUMN selected_groups JSONB DEFAULT '[]';
  END IF;
END $$;