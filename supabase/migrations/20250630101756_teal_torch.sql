/*
  # Create learning_progress table

  1. New Tables
    - learning_progress
      - id (uuid, primary key)
      - user_id (foreign key to users)
      - subject_id (foreign key to subjects)
      - subtopic_id (foreign key to subtopics)
      - viewed (boolean)
      - understood (boolean)
      - unclear (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for learners to manage their own progress
*/

-- Create learning_progress table
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(subjects_id) ON DELETE CASCADE,
  subtopic_id BIGINT REFERENCES subtopics(subtopic_id) ON DELETE CASCADE,
  viewed BOOLEAN DEFAULT false,
  understood BOOLEAN DEFAULT false,
  unclear BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, subtopic_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_learning_progress_user ON learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_subject ON learning_progress(subject_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_subtopic ON learning_progress(subtopic_id);

-- Enable RLS
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own learning progress"
  ON learning_progress
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_learning_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER learning_progress_updated_at
  BEFORE UPDATE ON learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_progress_updated_at();