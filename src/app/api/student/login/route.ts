import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { email, accessCode } = await req.json();

  if (!email || !accessCode) {
    return NextResponse.json({ error: "Email and access code required" }, { status: 400 });
  }

  const supabase = await createClient();

  // Find enrollment matching email + access code
  const { data: enrollment, error } = await supabase
    .from("enrollments")
    .select("id, student_name, student_email, course_id, status, access_code")
    .eq("student_email", email.toLowerCase().trim())
    .eq("access_code", accessCode.toUpperCase().trim())
    .in("status", ["paid", "deposit_paid"])
    .limit(1)
    .single();

  if (error || !enrollment) {
    return NextResponse.json({ error: "Invalid email or access code" }, { status: 401 });
  }

  // Set a session cookie for student access
  const cookieStore = await cookies();
  const sessionData = JSON.stringify({
    email: enrollment.student_email,
    name: enrollment.student_name,
    enrollmentId: enrollment.id,
  });

  cookieStore.set("student_session", sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return NextResponse.json({ ok: true });
}
