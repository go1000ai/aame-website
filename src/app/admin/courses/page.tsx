import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CourseList from "./CourseList";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">
            Courses
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your course catalog
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 hover:brightness-110 transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Course
        </Link>
      </div>

      <CourseList courses={courses || []} />
    </div>
  );
}
