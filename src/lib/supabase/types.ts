export type Course = {
  id: string;
  num: string;
  title: string;
  category: string;
  price_regular_cents: number;
  price_regular_display: string;
  price_discount_cents: number;
  price_discount_display: string;
  reservation_deposit_cents: number;
  featured: boolean;
  description: string;
  duration: string;
  has_inperson: boolean;
  has_online: boolean;
  inperson_includes: {
    kit: boolean;
    practice_month: boolean;
    digital_material: boolean;
    certificate: boolean;
    medical_director: boolean;
  };
  online_includes: {
    access_code: boolean;
    digital_material: boolean;
    practice_month: boolean;
    zoom_sessions: boolean;
  };
  image_url: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CourseSchedule = {
  id: string;
  course_id: string | null;
  course_name: string;
  date: string;
  time: string;
  location: string;
  instructor: string;
  spots_total: number;
  spots_available: number;
  status: "open" | "filling" | "sold_out" | "completed";
  price: string;
  price_regular_display: string;
  price_discount_display: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export type Special = {
  id: string;
  coupon_code: string;
  coupon_name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  course_ids: string[]; // empty = all courses
  active: boolean;
  created_at: string;
};

export type SquareSettings = {
  id: string;
  merchant_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  location_id: string | null;
  business_name: string | null;
  environment: "sandbox" | "production";
  webhook_signature_key: string | null;
  created_at: string;
  updated_at: string;
};

export type Enrollment = {
  id: string;
  course_schedule_id: string | null;
  course_id: string | null;
  student_name: string;
  student_email: string;
  student_phone: string;
  modality: "inperson" | "online";
  payment_method: "square" | "stripe" | "cherry" | "zelle" | "cash";
  discount_code: string | null;
  total_amount_cents: number;
  deposit_amount_cents: number;
  amount_paid_cents: number;
  ghl_order_id: string | null;
  square_order_id: string | null;
  status: "pending" | "deposit_paid" | "paid" | "cancelled";
  access_code: string | null;
  receipt_number: string | null;
  attended: boolean | null;
  attendance_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};
