/*
  # Add mandatory assessment fields to subtopics table

  1. Changes
    - Add must_complete_assessment boolean field to subtopics table
    - Add required_assessment_id field to subtopics table (foreign key to assessments)

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subtopics' AND column_name = 'must_complete_assessment'
  ) THEN
    ALTER TABLE subtopics ADD COLUMN must_complete_assessment BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subtopics' AND column_name = 'required_assessment_id'
  ) THEN
    ALTER TABLE subtopics ADD COLUMN required_assessment_id UUID REFERENCES assessments(assessment_id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subtopics_required_assessment ON subtopics(required_assessment_id);