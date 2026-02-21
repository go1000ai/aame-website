import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PUT /api/admin/enrollments/[id] — Update an enrollment
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  const fields = [
    "student_name",
    "student_email",
    "student_phone",
    "course_id",
    "course_schedule_id",
    "modality",
    "payment_method",
    "discount_code",
    "total_amount_cents",
    "deposit_amount_cents",
    "amount_paid_cents",
    "status",
    "access_code",
    "attended",
    "attendance_date",
    "notes",
  ];

  for (const field of fields) {
    if (field in body) {
      updateData[field] = body[field];
    }
  }

  const { data, error } = await supabase
    .from("enrollments")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/enrollments/[id] — Delete an enrollment
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get enrollment to restore spots if needed
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("course_schedule_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("enrollments").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Restore spot on schedule
  if (enrollment?.course_schedule_id) {
    const { data: sched } = await supabase
      .from("course_schedule")
      .select("id, spots_available, spots_total")
      .eq("id", enrollment.course_schedule_id)
      .single();

    if (sched) {
      const newSpots = Math.min(sched.spots_total, sched.spots_available + 1);
      await supabase
        .from("course_schedule")
        .update({
          spots_available: newSpots,
          status: newSpots === 0 ? "sold_out" : newSpots <= 3 ? "filling" : "open",
        })
        .eq("id", sched.id);
    }
  }

  return NextResponse.json({ success: true });
}
