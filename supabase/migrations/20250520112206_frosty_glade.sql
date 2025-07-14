/*
  # Create classroom tables

  1. New Tables
    - classrooms
      - classroom_id (serial, primary key)
      - classroom_name (text)
      - grade_id (foreign key to grades)
      - capacity (integer)
      - created_at (timestamp)
      - updated_at (timestamp)

    - classroom_assignments
      - assignment_id (uuid, primary key)
      - classroom_id (foreign key to classrooms)
      - subject_id (foreign key to subjects)
      - teacher_id (foreign key to users)
      - created_at (timestamp)
      - updated_at (timestamp)

    - classroom_learners
      - classroom_id (foreign key to classrooms)
      - learner_id (foreign key to users)
      - assigned_by (foreign key to users)
      - created_at (timestamp)
      - PRIMARY KEY (classroom_id, learner_id)

  2. Security
    - Enable RLS
    - Add policies for special permission users
*/

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  classroom_id SERIAL PRIMARY KEY,
  classroom_name TEXT NOT NULL,
  grade_id BIGINT REFERENCES grades(grades_id) ON DELETE CASCADE,
  capacity INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create classroom_assignments table
CREATE TABLE IF NOT EXISTS classroom_assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id INT REFERENCES classrooms(classroom_id) ON DELETE CASCADE,
  subject_id BIGINT REFERENCES subjects(subjects_id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(classroom_id, subject_id)
);

-- Create classroom_learners table
CREATE TABLE IF NOT EXISTS classroom_learners (
  classroom_id INT REFERENCES classrooms(classroom_id) ON DELETE CASCADE,
  learner_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (classroom_id, learner_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_classrooms_grade ON classrooms(grade_id);
CREATE INDEX IF NOT EXISTS idx_classroom_assignments_classroom ON classroom_assignments(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_assignments_subject ON classroom_assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_classroom_assignments_teacher ON classroom_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classroom_learners_learner ON classroom_learners(learner_id);

-- Enable RLS
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_learners ENABLE ROW LEVEL SECURITY;

-- Create policies for classrooms
CREATE POLICY "Users with special permissions can manage classrooms"
  ON classrooms
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

CREATE POLICY "All authenticated users can view classrooms"
  ON classrooms
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for classroom_assignments
CREATE POLICY "Users with special permissions can manage classroom assignments"
  ON classroom_assignments
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

CREATE POLICY "Teachers can view their own classroom assignments"
  ON classroom_assignments
  FOR SELECT
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid()
      AND role = 'teacher'
    )
  );

-- Create policies for classroom_learners
CREATE POLICY "Users with special permissions can manage classroom learners"
  ON classroom_learners
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

CREATE POLICY "Teachers can view classroom learners"
  ON classroom_learners
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE user_id = auth.uid()
      AND role = 'teacher'
    )
  );

CREATE POLICY "Learners can view their own classroom assignments"
  ON classroom_learners
  FOR SELECT
  TO authenticated
  USING (
    learner_id = auth.uid()
  );

-- Create triggers to update updated_at
CREATE OR REPLACE FUNCTION update_classrooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER classrooms_updated_at
  BEFORE UPDATE ON classrooms
  FOR EACH ROW
  EXECUTE FUNCTION update_classrooms_updated_at();

CREATE OR REPLACE FUNCTION update_classroom_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER classroom_assignments_updated_at
  BEFORE UPDATE ON classroom_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_classroom_assignments_updated_at();