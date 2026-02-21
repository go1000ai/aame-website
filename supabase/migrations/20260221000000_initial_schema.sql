-- ============================================================
-- AAME Database Migration — Full Schema
-- ============================================================

-- 1. Auto-update trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. COURSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  num TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price_regular_cents INTEGER NOT NULL,
  price_regular_display TEXT NOT NULL,
  price_discount_cents INTEGER NOT NULL DEFAULT 0,
  price_discount_display TEXT NOT NULL DEFAULT '',
  reservation_deposit_cents INTEGER NOT NULL DEFAULT 20000,
  featured BOOLEAN DEFAULT false,
  description TEXT DEFAULT '',
  duration TEXT DEFAULT '',
  has_inperson BOOLEAN DEFAULT true,
  has_online BOOLEAN DEFAULT false,
  inperson_includes JSONB DEFAULT '{"kit":true,"practice_month":true,"digital_material":true,"certificate":true,"medical_director":true}'::jsonb,
  online_includes JSONB DEFAULT '{"access_code":true,"digital_material":true,"practice_month":true,"zoom_sessions":true}'::jsonb,
  ghl_payment_link_inperson TEXT DEFAULT '',
  ghl_payment_link_online TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  active BOOLEAN DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active courses"
  ON courses FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. COURSE_SCHEDULE TABLE (full create)
-- ============================================================
CREATE TABLE IF NOT EXISTS course_schedule (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  course_name TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT 'AAME Training Center, Houston TX',
  instructor TEXT NOT NULL DEFAULT 'Strani Mayorga',
  spots_total INTEGER NOT NULL DEFAULT 12,
  spots_available INTEGER NOT NULL DEFAULT 12,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filling', 'sold_out', 'completed')),
  price TEXT DEFAULT '',
  price_regular_display TEXT DEFAULT '',
  price_discount_display TEXT DEFAULT '',
  category TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE course_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read schedule"
  ON course_schedule FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage schedule"
  ON course_schedule FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER schedule_updated_at
  BEFORE UPDATE ON course_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. ENROLLMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_schedule_id UUID REFERENCES course_schedule(id) ON DELETE SET NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT DEFAULT '',
  modality TEXT NOT NULL DEFAULT 'inperson' CHECK (modality IN ('inperson', 'online')),
  payment_method TEXT NOT NULL DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'cherry', 'zelle', 'cash')),
  discount_code TEXT,
  total_amount_cents INTEGER NOT NULL DEFAULT 0,
  deposit_amount_cents INTEGER NOT NULL DEFAULT 0,
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  ghl_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'deposit_paid', 'paid', 'cancelled')),
  access_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage enrollments"
  ON enrollments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Students can read own enrollments"
  ON enrollments FOR SELECT
  USING (true);

CREATE TRIGGER enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. SEED 21 COURSES
-- ============================================================
INSERT INTO courses (num, title, category, price_regular_cents, price_regular_display, price_discount_cents, price_discount_display, featured, sort_order, has_inperson, has_online, duration) VALUES
  ('01', 'Aparatologia Corporal', 'Body Tech', 85000, '$850', 65000, '$650', false, 1, true, false, '8 hours'),
  ('02', 'Aparatologia Facial', 'Facial Tech', 65000, '$650', 50000, '$500', false, 2, true, false, '8 hours'),
  ('03', 'Botox Avanzado', 'Injectables', 140000, '$1,400', 120000, '$1,200', false, 3, true, true, '8 hours'),
  ('04', 'Botox Basico', 'Injectables', 115000, '$1,150', 95000, '$950', false, 4, true, true, '8 hours'),
  ('05', 'Dermaplening', 'Skin Care', 35000, '$350', 25000, '$250', false, 5, true, false, '6 hours'),
  ('06', 'EKG Tech+ CPR BLS', 'Medical', 101600, '$1,016', 85000, '$850', false, 6, true, false, '8 hours'),
  ('07', 'Fibroblast', 'Skin Tightening', 115000, '$1,150', 85000, '$850', false, 7, true, false, '8 hours'),
  ('08', 'Fillers Avanzado', 'Fillers & Volume', 125000, '$1,250', 105000, '$1,050', false, 8, true, true, '8 hours'),
  ('09', 'Fillers Basico', 'Fillers & Volume', 115000, '$1,150', 95000, '$950', false, 9, true, true, '8 hours'),
  ('10', 'Full Package', 'Full Package', 299500, '$2,995', 249500, '$2,495', true, 10, true, true, 'Multiple days'),
  ('11', 'Hilos de PDO', 'Lifting', 165000, '$1,650', 140000, '$1,400', false, 11, true, false, '8 hours'),
  ('12', 'Hydradermoabración', 'Skin Care', 15000, '$150', 10000, '$100', false, 12, true, false, '4 hours'),
  ('13', 'Linfático', 'Body', 45000, '$450', 35000, '$350', false, 13, true, false, '6 hours'),
  ('14', 'Maderoterapia', 'Body', 45000, '$450', 35000, '$350', false, 14, true, false, '6 hours'),
  ('15', 'Microdermoabrasión', 'Skin Care', 17500, '$175', 12500, '$125', false, 15, true, false, '4 hours'),
  ('16', 'Microneedling', 'Dermatology', 35000, '$350', 25000, '$250', false, 16, true, false, '5 hours'),
  ('17', 'Peeling', 'Skin Care', 65000, '$650', 50000, '$500', false, 17, true, false, '6 hours'),
  ('18', 'Phlebotomy', 'Medical', 115000, '$1,150', 95000, '$950', false, 18, true, false, '8 hours'),
  ('19', 'Plasma PRP', 'Blood Science', 65000, '$650', 55000, '$550', false, 19, true, false, '7 hours'),
  ('20', 'Reflexologia Corporal', 'Body', 80000, '$800', 65000, '$650', false, 20, true, false, '8 hours'),
  ('21', 'Reflexologia Podal y Craneal', 'Body', 60000, '$600', 45000, '$450', false, 21, true, false, '6 hours')
ON CONFLICT (num) DO NOTHING;

-- ============================================================
-- 6. SEED SCHEDULE (6 upcoming sessions)
-- ============================================================
INSERT INTO course_schedule (course_name, date, time, location, instructor, spots_total, spots_available, status, price, price_regular_display, price_discount_display, category, course_id) VALUES
  ('Fillers', '2026-02-15', '10:00 AM - 5:00 PM', 'AAME Training Center, Houston TX', 'Strani Mayorga', 12, 4, 'filling', '$1,150', '$1,150', '$950', 'Fillers & Volume', (SELECT id FROM courses WHERE num = '09')),
  ('Armonización Facial + Definición de Mandíbula', '2026-03-07', '10:00 AM - 5:00 PM', 'AAME Training Center, Houston TX', 'Strani Mayorga', 10, 7, 'open', '$1,295', '$1,295', '$1,095', 'Injectables', NULL),
  ('Fibroblast + Lunares', '2026-03-14', '10:00 AM - 5:00 PM', 'AAME Training Center, Houston TX', 'Strani Mayorga', 12, 12, 'open', '$850', '$850', '$650', 'Skin Tightening', (SELECT id FROM courses WHERE num = '07')),
  ('PDNR de Salmón, Exosomas y Carboxiterapia', '2026-03-21', '10:00 AM - 5:00 PM', 'AAME Training Center, Houston TX', 'Strani Mayorga', 12, 10, 'open', '$850', '$850', '$650', 'Skin Care', NULL),
  ('Flebotomía, PRP', '2026-03-28', '10:00 AM - 5:00 PM', 'AAME Training Center, Houston TX', 'Strani Mayorga', 12, 8, 'open', '$1,095', '$1,095/$650', '$950/$550', 'Medical', NULL),
  ('Botox', '2026-04-11', '10:00 AM - 5:00 PM', 'AAME Training Center, Houston TX', 'Strani Mayorga', 12, 12, 'open', '$950', '$950', '$755', 'Injectables', (SELECT id FROM courses WHERE num = '04'));

-- ============================================================
-- 7. TEST ENROLLMENT (for student portal testing)
-- ============================================================
INSERT INTO enrollments (student_name, student_email, student_phone, modality, payment_method, total_amount_cents, deposit_amount_cents, amount_paid_cents, status, access_code, course_id)
VALUES (
  'Test Student', 'test@test.com', '7135551234',
  'online', 'stripe', 95000, 20000, 95000,
  'paid', 'TEST123',
  (SELECT id FROM courses WHERE num = '04')
);
