import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function generateReceiptNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `AAME-${code}`;
}

function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// POST /api/enroll/zelle — Create a pending enrollment for Zelle payment
export async function POST(request: Request) {
  const body = await request.json();
  const { courseId, modality, studentName, studentEmail, studentPhone, discountCode } = body;

  if (!courseId || !studentName || !studentEmail) {
    return NextResponse.json(
      { error: "courseId, studentName, and studentEmail are required" },
      { status: 400 }
    );
  }

  // Use service role key for public endpoint (no auth required)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Look up course
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Calculate price
  let priceCents = course.price_discount_cents || course.price_regular_cents;
  let appliedDiscount = "";

  if (discountCode) {
    const { data: special } = await supabase
      .from("specials")
      .select("*")
      .eq("coupon_code", discountCode.toUpperCase())
      .eq("active", true)
      .single();

    if (special) {
      const appliesToCourse =
        !special.course_ids ||
        special.course_ids.length === 0 ||
        special.course_ids.includes(courseId);

      if (appliesToCourse) {
        if (special.discount_type === "percentage") {
          priceCents = Math.round(priceCents * (1 - special.discount_value / 100));
        } else {
          priceCents = Math.max(0, priceCents - special.discount_value * 100);
        }
        appliedDiscount = discountCode.toUpperCase();
      }
    }
  }

  const receiptNumber = generateReceiptNumber();

  const enrollment = {
    course_id: courseId,
    course_schedule_id: null,
    student_name: studentName,
    student_email: studentEmail,
    student_phone: studentPhone || "",
    modality: modality || "inperson",
    payment_method: "zelle" as const,
    discount_code: appliedDiscount || null,
    total_amount_cents: priceCents,
    deposit_amount_cents: 0,
    amount_paid_cents: 0,
    status: "pending" as const,
    access_code: generateAccessCode(),
    receipt_number: receiptNumber,
    notes: "",
  };

  const { data, error } = await supabase
    .from("enrollments")
    .insert(enrollment)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    receiptNumber,
    totalAmountCents: priceCents,
    courseTitle: `${course.num} — ${course.title}`,
    enrollmentId: data.id,
  });
}
