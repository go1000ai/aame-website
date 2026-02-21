import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function StudentCoursesPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("student_session");

  if (!sessionCookie?.value) {
    redirect("/student/login");
  }

  let session: { email: string; name: string };
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect("/student/login");
  }

  const supabase = await createClient();

  // Fetch all enrollments for this student
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses:course_id(*)")
    .eq("student_email", session.email)
    .in("status", ["paid", "deposit_paid"])
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Student Header */}
      <header className="bg-charcoal text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/aame-logo.jpeg"
              alt="AAME Logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full"
            />
            <div>
              <span className="font-[Montserrat] font-bold text-sm uppercase tracking-tight">AAME</span>
              <span className="text-primary text-[10px] uppercase tracking-widest ml-2">Student Portal</span>
            </div>
          </Link>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-gray-400 text-sm hidden sm:inline truncate max-w-[200px]">
              Welcome, <strong className="text-white">{session.name}</strong>
            </span>
            <form action="/api/student/logout" method="POST">
              <button
                type="submit"
                className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">My Courses</h1>
          <p className="text-gray-500 text-sm mt-1">Access your enrolled courses, materials, and certificates.</p>
        </div>

        {!enrollments || enrollments.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">school</span>
            <p className="text-gray-400 font-medium">No courses yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Your enrolled courses will appear here after payment is confirmed.
            </p>
            <Link
              href="/courses"
              className="inline-block mt-6 bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3 hover:brightness-110 transition-all"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const course = enrollment.courses;
              return (
                <div
                  key={enrollment.id}
                  className="bg-white border border-gray-200 overflow-hidden hover:border-primary transition-colors"
                >
                  {/* Course header */}
                  <div className="bg-charcoal text-white p-4 flex justify-between items-center">
                    <div>
                      <span className="text-primary font-black text-lg mr-2">{course?.num || "—"}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{course?.category}</span>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                      enrollment.modality === "online"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-primary/20 text-primary"
                    }`}>
                      {enrollment.modality === "online" ? "Online" : "In-Person"}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-[Montserrat] font-bold uppercase mb-2">
                      {course?.title || enrollment.course_id}
                    </h3>

                    {/* Status */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`w-2 h-2 rounded-full ${
                        enrollment.status === "paid" ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {enrollment.status === "paid" ? "Fully Paid" : "Deposit Paid"}
                      </span>
                    </div>

                    {/* Access code */}
                    {enrollment.access_code && (
                      <div className="bg-gray-50 px-3 py-2 mb-4">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Access Code</span>
                        <code className="text-primary font-mono font-bold">{enrollment.access_code}</code>
                      </div>
                    )}

                    {/* Actions */}
                    {enrollment.modality === "online" && enrollment.status === "paid" ? (
                      <Link
                        href={`/student/courses/${enrollment.id}`}
                        className="block w-full text-center bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-4 py-3 hover:brightness-110 transition-all"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-base">play_circle</span>
                          Access Course
                        </span>
                      </Link>
                    ) : enrollment.status === "deposit_paid" ? (
                      <div className="text-center text-xs text-gray-400 py-3 border border-dashed border-gray-200">
                        Complete full payment to unlock course materials.
                      </div>
                    ) : (
                      <Link
                        href={`/student/courses/${enrollment.id}`}
                        className="block w-full text-center border-2 border-charcoal text-charcoal font-bold uppercase text-xs tracking-widest px-4 py-3 hover:bg-charcoal hover:text-white transition-all"
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
