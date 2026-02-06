-- ============================================
-- ITS Entry Test Preparation - Bhakkar Campus
-- Student Result Portal - Supabase Schema
-- ============================================

CREATE TABLE students (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  roll_number TEXT NOT NULL UNIQUE,
  total_marks INT NOT NULL,
  obtained_marks INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view students"
  ON students FOR SELECT
  USING (true);

-- Fast search index
CREATE INDEX idx_students_roll_number ON students(roll_number);
