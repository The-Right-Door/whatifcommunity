/*
  # Create reviews and lessons tables

  1. New Tables
    - reviews
      - review_id (uuid, primary key)
      - teacher_id (foreign key to users)
      - title (text)
      - description (text)
      - type (enum: 'daily', 'performance', 'final')
      - status (enum: 'draft', 'published')
      - start_date (date)
      - end_date (date)
      - created_at (timestamp)
      - updated_at (timestamp)

    - review_subtopics
      - review_id (foreign key to reviews)
      - subtopic_id (foreign key to subtopics)
      - PRIMARY KEY (review_id, subtopic_id)

  2. Security
    - Enable RLS
    - Add policies for teachers to manage their reviews
*/

-- Create enum types
CREATE TYPE review_type AS ENUM ('daily', 'performance', 'final');
CREATE TYPE review_status AS ENUM ('draft', 'published');

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES users(user_id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type review_type NOT NULL,
  status review_status NOT NULL DEFAULT 'draft',
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create review_subtopics table
CREATE TABLE IF NOT EXISTS review_subtopics (
  review_id uuid REFERENCES reviews(review_id) ON DELETE CASCADE,
  subtopic_id bigint REFERENCES subtopics(subtopic_id) ON DELETE CASCADE,
  PRIMARY KEY (review_id, subtopic_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_teacher ON reviews(teacher_id);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON reviews(type);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_subtopics ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Teachers can manage their own reviews"
  ON reviews
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

-- Create policies for review_subtopics
CREATE POLICY "Teachers can manage their review subtopics"
  ON review_subtopics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.review_id = review_subtopics.review_id
      AND r.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.review_id = review_subtopics.review_id
      AND r.teacher_id = auth.uid()
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();