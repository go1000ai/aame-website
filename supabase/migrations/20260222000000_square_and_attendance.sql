-- ============================================================
-- Square Payment Integration + Attendance Tracking
-- ============================================================

-- 1. Add Square order tracking to enrollments
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS square_order_id TEXT;

-- 2. Expand payment_method constraint to include 'square'
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_payment_method_check;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_payment_method_check
  CHECK (payment_method IN ('square', 'stripe', 'cherry', 'zelle', 'cash'));

-- 3. Attendance tracking columns
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT NULL;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS attendance_date TIMESTAMPTZ;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- 4. Index for Square order deduplication
CREATE INDEX IF NOT EXISTS idx_enrollments_square_order_id
  ON enrollments (square_order_id)
  WHERE square_order_id IS NOT NULL;

-- 5. Index for student aggregation queries
CREATE INDEX IF NOT EXISTS idx_enrollments_student_email
  ON enrollments (student_email);
