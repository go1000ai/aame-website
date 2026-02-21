import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/admin/students — Aggregate unique students from enrollments
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*")
    .order("created_at", { ascending: false });

  if (!enrollments) return NextResponse.json([]);

  // Aggregate by email
  const studentMap = new Map<
    string,
    {
      student_name: string;
      student_email: string;
      student_phone: string;
      enrollment_count: number;
      total_paid_cents: number;
      courses: string[];
      last_enrollment: string;
      statuses: string[];
    }
  >();

  for (const e of enrollments) {
    const key = e.student_email.toLowerCase();
    const existing = studentMap.get(key);

    if (existing) {
      existing.enrollment_count++;
      existing.total_paid_cents += e.amount_paid_cents;
      if (e.course_id && !existing.courses.includes(e.course_id)) {
        existing.courses.push(e.course_id);
      }
      if (!existing.statuses.includes(e.status)) {
        existing.statuses.push(e.status);
      }
      // Use most recent name/phone
      if (e.student_name) existing.student_name = e.student_name;
      if (e.student_phone) existing.student_phone = e.student_phone;
    } else {
      studentMap.set(key, {
        student_name: e.student_name,
        student_email: e.student_email,
        student_phone: e.student_phone || "",
        enrollment_count: 1,
        total_paid_cents: e.amount_paid_cents,
        courses: e.course_id ? [e.course_id] : [],
        last_enrollment: e.created_at,
        statuses: [e.status],
      });
    }
  }

  const students = Array.from(studentMap.values()).sort(
    (a, b) =>
      new Date(b.last_enrollment).getTime() -
      new Date(a.last_enrollment).getTime()
  );

  return NextResponse.json(students);
}
