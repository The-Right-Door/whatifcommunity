/*
  # Add subject and grade data

  1. New Data
    - Add sample subjects with their details
    - Add grades
    - Create subject-grade relationships

  2. Changes
    - Insert data into subjects table
    - Insert data into grades table
    - Insert data into subject_grade table

  3. Security
    - Enable RLS on all tables
    - Add policies for public read access
*/

-- Insert subjects
INSERT INTO subjects (subjects_name, subjects_status, subjects_short_description)
VALUES 
  ('Mathematics', 'active', 'From algebra to calculus, build strong mathematical foundations'),
  ('Physical Sciences', 'active', 'Explore physics and chemistry through practical experiments'),
  ('Life Sciences', 'active', 'Discover the wonders of biology and natural sciences'),
  ('English', 'active', 'Master language skills through literature and communication'),
  ('Geography', 'active', 'Understand our world''s physical and human systems'),
  ('History', 'active', 'Learn from the past to understand the present')
ON CONFLICT (subjects_id) DO NOTHING;

-- Insert grades if not exists
INSERT INTO grades (grade_no)
VALUES 
  (11),
  (12)
ON CONFLICT (grades_id) DO NOTHING;

-- Create subject-grade relationships
INSERT INTO subject_grade (subject_id, grade_id)
SELECT s.subjects_id, g.grades_id
FROM subjects s
CROSS JOIN grades g
WHERE s.subjects_status = 'active'
ON CONFLICT (subject_id, grade_id) DO NOTHING;

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_grade ENABLE ROW LEVEL SECURITY;

-- Add policies for public read access
CREATE POLICY "Allow public read access on subjects"
  ON subjects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on grades"
  ON grades
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access on subject_grade"
  ON subject_grade
  FOR SELECT
  TO public
  USING (true);