import { createClient } from "@/lib/supabase/server";
import { getStudentSession } from "@/lib/student-session";
import CourseFilters from "./CourseFilters";

export default async function StudentCoursesPage() {
  const session = await getStudentSession();
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses:course_id(*), schedule:course_schedule_id(*)")
    .eq("student_email", session.email)
    .in("status", ["paid", "deposit_paid"])
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">
          My Courses
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          View your enrolled courses, track progress, and access materials.
        </p>
      </div>

      <CourseFilters enrollments={enrollments || []} />
    </div>
  );
}
