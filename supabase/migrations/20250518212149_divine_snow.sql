/*
  # Create review_questions table

  1. New Tables
    - review_questions
      - question_id (uuid, primary key)
      - review_id (foreign key to reviews)
      - question_number (integer)
      - question_text (text)
      - options (jsonb)
      - correct_answer (text)
      - explanation (text)
      - hint (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for teachers to manage their questions
*/

-- Create review_questions table
CREATE TABLE IF NOT EXISTS review_questions (
  question_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid REFERENCES reviews(review_id) ON DELETE CASCADE,
  question_number integer NOT NULL,
  question_text text NOT NULL,
  options jsonb,
  correct_answer text,
  explanation text,
  hint text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_review_questions_review ON review_questions(review_id);

-- Enable RLS
ALTER TABLE review_questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can manage their review questions"
  ON review_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.review_id = review_questions.review_id
      AND r.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.review_id = review_questions.review_id
      AND r.teacher_id = auth.uid()
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_review_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_questions_updated_at
  BEFORE UPDATE ON review_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_review_questions_updated_at();