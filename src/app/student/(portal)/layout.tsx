import { createClient } from "@/lib/supabase/server";
import { getStudentSession } from "@/lib/student-session";
import StudentShell from "./StudentShell";
import type { StudentStats } from "./StudentShell";

export const metadata = {
  title: "AAME Student Portal",
};

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStudentSession();
  const supabase = await createClient();

  // Fetch enrollment summary for sidebar stats
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, attended, course_schedule_id, created_at")
    .eq("student_email", session.email)
    .in("status", ["paid", "deposit_paid"]);

  const all = enrollments || [];
  const certificates = all.filter((e) => e.attended === true).length;
  const upcoming = all.filter((e) => e.attended !== true).length;
  const earliest = all.length > 0
    ? all.reduce((min, e) => (e.created_at < min ? e.created_at : min), all[0].created_at)
    : "";

  const stats: StudentStats = {
    totalCourses: all.length,
    certificates,
    upcoming,
    memberSince: earliest
      ? new Date(earliest).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "",
  };

  return (
    <StudentShell session={session} stats={stats}>
      {children}
    </StudentShell>
  );
}
