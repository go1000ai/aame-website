import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateReceiptNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `AAME-${code}`;
}

// POST /api/admin/enrollments — Create a manual enrollment
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const enrollment = {
    course_id: body.course_id || null,
    course_schedule_id: body.course_schedule_id || null,
    student_name: body.student_name || "",
    student_email: body.student_email || "",
    student_phone: body.student_phone || "",
    modality: body.modality || "inperson",
    payment_method: body.payment_method || "cash",
    discount_code: body.discount_code || null,
    total_amount_cents: body.total_amount_cents || 0,
    deposit_amount_cents: body.deposit_amount_cents || 0,
    amount_paid_cents: body.amount_paid_cents || 0,
    status: body.status || "pending",
    access_code: generateAccessCode(),
    receipt_number: ["zelle", "cash"].includes(body.payment_method) ? generateReceiptNumber() : null,
    notes: body.notes || "",
  };

  const { data, error } = await supabase
    .from("enrollments")
    .insert(enrollment)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Decrement spots on schedule if linked
  if (enrollment.course_schedule_id) {
    const { data: sched } = await supabase
      .from("course_schedule")
      .select("id, spots_available")
      .eq("id", enrollment.course_schedule_id)
      .single();

    if (sched) {
      const newSpots = Math.max(0, sched.spots_available - 1);
      await supabase
        .from("course_schedule")
        .update({
          spots_available: newSpots,
          status:
            newSpots === 0 ? "sold_out" : newSpots <= 3 ? "filling" : "open",
        })
        .eq("id", sched.id);
    }
  }

  return NextResponse.json(data, { status: 201 });
}
