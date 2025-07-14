/*
  # Create skills and skill_levels tables

  1. New Tables
    - skills
      - skill_id (uuid, primary key)
      - skill_name (text, unique)
      - description (text)
      - icon (text)
      - level (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - skill_levels
      - level_id (text, primary key)
      - level_name (text)
      - level_order (integer)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS
    - Add policies for public read access
*/

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  skill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  level TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create skill_levels table
CREATE TABLE IF NOT EXISTS skill_levels (
  level_id TEXT PRIMARY KEY,
  level_name TEXT NOT NULL,
  level_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_skills_level ON skills(level);
CREATE INDEX IF NOT EXISTS idx_skill_levels_order ON skill_levels(level_order);

-- Enable RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_levels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on skills"
  ON skills
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access on skills"
  ON skills
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

CREATE POLICY "Allow public read access on skill_levels"
  ON skill_levels
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin write access on skill_levels"
  ON skill_levels
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

-- Create triggers to update updated_at
CREATE OR REPLACE FUNCTION update_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_skills_updated_at();

CREATE OR REPLACE FUNCTION update_skill_levels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skill_levels_updated_at
  BEFORE UPDATE ON skill_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_skill_levels_updated_at();

-- Insert default skill levels
INSERT INTO skill_levels (level_id, level_name, level_order)
VALUES 
  ('beginner', 'Beginner', 1),
  ('intermediate', 'Intermediate', 2),
  ('advanced', 'Advanced', 3)
ON CONFLICT (level_id) DO NOTHING;

-- Insert default skills
INSERT INTO skills (skill_name, description, icon, level)
VALUES 
  ('Programming', 'Learn software development, web programming, mobile app development, and coding fundamentals.', 'Code', 'beginner'),
  ('Analysis', 'Develop skills in data analysis, business intelligence, statistical methods, and research techniques.', 'BarChart2', 'beginner'),
  ('AI', 'Explore artificial intelligence, machine learning, neural networks, and AI application development.', 'Brain', 'beginner'),
  ('Web Development', 'Create responsive websites and web applications using modern frameworks and technologies.', 'Globe', 'intermediate'),
  ('Mobile Development', 'Build native and cross-platform mobile applications for iOS and Android.', 'Smartphone', 'intermediate'),
  ('Data Science', 'Apply statistical methods and machine learning to extract insights from complex datasets.', 'Database', 'intermediate'),
  ('Cloud Computing', 'Design, deploy, and manage applications in cloud environments like AWS, Azure, and GCP.', 'Cloud', 'advanced'),
  ('DevOps', 'Implement continuous integration, delivery, and deployment pipelines for software projects.', 'Settings', 'advanced'),
  ('Cybersecurity', 'Protect systems and data from threats through security analysis and implementation.', 'Shield', 'advanced')
ON CONFLICT (skill_name) DO NOTHING;