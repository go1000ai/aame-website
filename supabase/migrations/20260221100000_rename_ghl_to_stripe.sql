-- ============================================================
-- Rename payment_method 'ghl' → 'stripe'
-- ============================================================

-- 1. Drop old CHECK constraint FIRST (must happen before updating values)
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_payment_method_check;

-- 2. Update any existing rows that have 'ghl' as payment_method
UPDATE enrollments SET payment_method = 'stripe' WHERE payment_method = 'ghl';

-- 3. Add new CHECK constraint with 'stripe' instead of 'ghl'
ALTER TABLE enrollments ADD CONSTRAINT enrollments_payment_method_check
  CHECK (payment_method IN ('stripe', 'cherry', 'zelle', 'cash'));

-- 4. Update default value
ALTER TABLE enrollments ALTER COLUMN payment_method SET DEFAULT 'stripe';
