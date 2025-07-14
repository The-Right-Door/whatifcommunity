/*
  # Create topics coverage table

  1. New Tables
    - topics_coverage
      - coverage_id (uuid, primary key)
      - topic_id (foreign key to topics)
      - teacher_id (foreign key to users)
      - covered_date (date)
      - notes (text)
      - resources (jsonb)
      - status (enum: 'planned', 'in_progress', 'covered')
      - last_covered_at (timestamp)
      - last_tested_at (timestamp)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for teachers to manage their own records
    - Allow read access for authenticated users
*/

-- Create enum type for coverage status
CREATE TYPE coverage_status AS ENUM ('planned', 'in_progress', 'covered');

-- Create topics_coverage table
CREATE TABLE IF NOT EXISTS topics_coverage (
  coverage_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id bigint REFERENCES topics(topics_id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES users(user_id) ON DELETE CASCADE,
  covered_date date NOT NULL,
  notes text,
  resources jsonb,
  status coverage_status NOT NULL DEFAULT 'planned',
  last_covered_at timestamptz,
  last_tested_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_topics_coverage_topic ON topics_coverage(topic_id);
CREATE INDEX IF NOT EXISTS idx_topics_coverage_teacher ON topics_coverage(teacher_id);
CREATE INDEX IF NOT EXISTS idx_topics_coverage_status ON topics_coverage(status);

-- Enable RLS
ALTER TABLE topics_coverage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can manage their own coverage records"
  ON topics_coverage
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid()
      AND role = 'teacher'
    )
  )
  WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid()
      AND role = 'teacher'
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_topics_coverage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topics_coverage_updated_at
  BEFORE UPDATE ON topics_coverage
  FOR EACH ROW
  EXECUTE FUNCTION update_topics_coverage_updated_at();