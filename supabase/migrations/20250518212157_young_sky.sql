/*
  # Create assessments table

  1. New Tables
    - assessments
      - assessment_id (uuid, primary key)
      - review_id (uuid, foreign key to reviews)
      - title (text)
      - description (text)
      - subject (text)
      - grade (text)
      - start_date (date)
      - end_date (date)
      - status (text)
      - difficulty_level (text)
      - question_count (integer)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for teachers and learners
*/

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  assessment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(review_id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  subject text NOT NULL,
  grade text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  difficulty_level text,
  question_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assessments_review ON assessments(review_id);
CREATE INDEX IF NOT EXISTS idx_assessments_subject ON assessments(subject);
CREATE INDEX IF NOT EXISTS idx_assessments_grade ON assessments(grade);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can manage their assessments"
  ON assessments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.review_id = assessments.review_id
      AND r.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.review_id = assessments.review_id
      AND r.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Learners can view active assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (
    status = 'active' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid()
      AND role = 'learner'
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_assessments_updated_at();