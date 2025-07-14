/*
  # Create lessons table

  1. New Tables
    - lessons
      - lesson_id (uuid, primary key)
      - teacher_id (uuid, references users)
      - topic_id (bigint, references topics)
      - title (text)
      - description (text)
      - objectives (text[])
      - duration (integer, minutes)
      - materials (text[])
      - activities (jsonb)
      - homework (text)
      - notes (text)
      - status (enum)
      - scheduled_for (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for teachers
*/

-- Create enum type for lesson status
CREATE TYPE lesson_status AS ENUM ('draft', 'published');

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  lesson_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES users(user_id) ON DELETE CASCADE,
  topic_id bigint REFERENCES topics(topics_id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  objectives text[] NOT NULL DEFAULT '{}',
  duration integer NOT NULL CHECK (duration > 0),
  materials text[] DEFAULT '{}',
  activities jsonb DEFAULT '[]',
  homework text,
  notes text,
  status lesson_status NOT NULL DEFAULT 'draft',
  scheduled_for timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_topic ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_scheduled ON lessons(scheduled_for);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Teachers can manage their own lessons"
  ON lessons
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
CREATE OR REPLACE FUNCTION update_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_lessons_updated_at();