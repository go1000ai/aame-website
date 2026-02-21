import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import EnrollmentList from "./EnrollmentList";

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient();
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">Enrollments</h1>
          <p className="text-gray-500 text-sm mt-1">Track student enrollments and payments</p>
        </div>
        <Link
          href="/admin/enrollments/new"
          className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-5 py-2.5 hover:brightness-110 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          New Enrollment
        </Link>
      </div>

      <EnrollmentList enrollments={enrollments || []} />
    </div>
  );
}
