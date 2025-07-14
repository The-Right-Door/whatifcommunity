/*
  # Create streams table for educational pathways

  1. New Tables
    - streams
      - stream_id (uuid, primary key)
      - stream_name (text, not null)
      - description (text)
      - grade_range (integer array)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create streams table
CREATE TABLE IF NOT EXISTS streams (
  stream_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_name TEXT NOT NULL UNIQUE,
  description TEXT,
  grade_range INTEGER[] DEFAULT '{10,11,12}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_streams_name ON streams(stream_name);

-- Enable RLS
ALTER TABLE streams ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on streams"
  ON streams
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access on streams"
  ON streams
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid()
      AND special_permissions = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid()
      AND special_permissions = true
    )
  );

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_streams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER streams_updated_at
  BEFORE UPDATE ON streams
  FOR EACH ROW
  EXECUTE FUNCTION update_streams_updated_at();

-- Insert default streams
INSERT INTO streams (stream_name, description, grade_range)
VALUES 
  ('Pure Maths', 'Focus on advanced mathematical concepts, calculus, algebra, and problem-solving skills essential for STEM fields.', '{10,11,12}'),
  ('Maths Literacy', 'Practical mathematical applications focused on everyday scenarios, financial literacy, and statistical understanding.', '{10,11,12}'),
  ('Non-Maths', 'Focus on humanities, arts, languages, and social sciences with minimal mathematical requirements.', '{10,11,12}'),
  ('Science', 'Focus on physics, chemistry, and other scientific disciplines.', '{10,11,12}'),
  ('Commerce', 'Business studies, economics, and accounting for future entrepreneurs and business professionals.', '{10,11,12}'),
  ('Arts', 'Visual arts, performing arts, and creative expression.', '{10,11,12}'),
  ('Technical', 'Engineering, design, and technical skills development.', '{10,11,12}')
ON CONFLICT (stream_name) DO NOTHING;

-- Add stream_id column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'stream'
  ) THEN
    ALTER TABLE users ADD COLUMN stream TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'education_level'
  ) THEN
    ALTER TABLE users ADD COLUMN education_level TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'skill_path'
  ) THEN
    ALTER TABLE users ADD COLUMN skill_path TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'skill_level'
  ) THEN
    ALTER TABLE users ADD COLUMN skill_level TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'classrooms' AND column_name = 'stream_id'
  ) THEN
    ALTER TABLE classrooms ADD COLUMN stream_id UUID REFERENCES streams(stream_id);
  END IF;
END $$;