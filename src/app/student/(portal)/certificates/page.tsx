import { createClient } from "@/lib/supabase/server";
import { getStudentSession } from "@/lib/student-session";
import Link from "next/link";

export default async function StudentCertificatesPage() {
  const session = await getStudentSession();
  const supabase = await createClient();

  const { data: completedEnrollments } = await supabase
    .from("enrollments")
    .select("*, courses:course_id(*)")
    .eq("student_email", session.email)
    .eq("attended", true)
    .in("status", ["paid", "deposit_paid"])
    .order("attendance_date", { ascending: false });

  const enrollments = completedEnrollments || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">
          My Certificates
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          View and download your certificates of completion.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">
            workspace_premium
          </span>
          <h2 className="text-lg font-bold text-gray-400 mb-2">No Certificates Yet</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Complete your first course to earn a certificate of completion. Certificates
            become available after your instructor confirms attendance.
          </p>
          <Link
            href="/student/courses"
            className="inline-block mt-6 bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3 hover:brightness-110 transition-all"
          >
            View My Courses
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-6">
            {enrollments.length} certificate{enrollments.length !== 1 ? "s" : ""} earned
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enrollment) => {
              const course = enrollment.courses;
              const completionDate = enrollment.attendance_date
                ? new Date(enrollment.attendance_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : new Date(enrollment.updated_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });

              return (
                <div
                  key={enrollment.id}
                  className="bg-white border border-gray-200 overflow-hidden hover:border-primary/50 transition-colors"
                >
                  {/* Certificate preview header */}
                  <div className="bg-gradient-to-r from-charcoal to-charcoal/90 text-white p-5 relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-6 -translate-x-6" />

                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-xl">
                          workspace_premium
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                          Certificate of Completion
                        </span>
                      </div>
                      <h3 className="text-lg font-[Montserrat] font-bold uppercase">
                        {course?.title || "Course"}
                      </h3>
                      {course?.num && (
                        <span className="text-xs text-gray-400">
                          Course {course.num} — {course.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        {completionDate}
                      </span>
                      <span
                        className={`font-bold uppercase px-1.5 py-0.5 ${
                          enrollment.modality === "online"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {enrollment.modality === "online" ? "Online" : "In-Person"}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/student/certificates/${enrollment.id}`}
                        className="flex-1 bg-primary text-charcoal font-bold uppercase text-[10px] tracking-widest px-4 py-2.5 hover:brightness-110 transition-all text-center flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">
                          visibility
                        </span>
                        View
                      </Link>
                      <Link
                        href={`/student/certificates/${enrollment.id}`}
                        className="flex-1 border-2 border-charcoal text-charcoal font-bold uppercase text-[10px] tracking-widest px-4 py-2.5 hover:bg-charcoal hover:text-white transition-all text-center flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">
                          download
                        </span>
                        Download
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
