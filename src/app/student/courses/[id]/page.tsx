import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  // Verify this enrollment belongs to the logged-in student
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*, courses:course_id(*)")
    .eq("id", id)
    .eq("student_email", session.email)
    .single();

  if (!enrollment) {
    redirect("/student/courses");
  }

  const course = enrollment.courses;
  const isPaid = enrollment.status === "paid";
  const isOnline = enrollment.modality === "online";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Student Header */}
      <header className="bg-charcoal text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/student/courses" className="flex items-center gap-3">
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
          <form action="/api/student/logout" method="POST">
            <button
              type="submit"
              className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          href="/student/courses"
          className="text-gray-400 hover:text-charcoal text-sm flex items-center gap-1 mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to My Courses
        </Link>

        {/* Course Header */}
        <div className="bg-charcoal text-white p-6 sm:p-8 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-primary font-black text-3xl">{course?.num || "—"}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{course?.category}</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 ml-auto ${
              isOnline ? "bg-blue-500/20 text-blue-300" : "bg-primary/20 text-primary"
            }`}>
              {isOnline ? "Online" : "In-Person"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-black uppercase">
            {course?.title}
          </h1>
          {course?.duration && (
            <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">schedule</span>
              {course.duration}
            </p>
          )}
        </div>

        {/* Content */}
        {!isPaid ? (
          <div className="bg-white border border-gray-200 p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-amber-400 mb-4 block">lock</span>
            <h2 className="text-xl font-bold text-charcoal mb-2">Payment Required</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
              Complete your full payment to unlock course materials, video lessons, and downloadable resources.
            </p>
            <div className="text-sm text-gray-500">
              <p>Status: <strong className="text-amber-600 uppercase">{enrollment.status.replace("_", " ")}</strong></p>
              <p className="mt-1">
                Amount Paid: <strong>${(enrollment.amount_paid_cents / 100).toFixed(2)}</strong> of <strong>${(enrollment.total_amount_cents / 100).toFixed(2)}</strong>
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+17139275300"
                className="inline-flex items-center justify-center gap-2 bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-base">call</span>
                Call to Complete Payment
              </a>
              <a
                href="mailto:aame0edu@gmail.com"
                className="inline-flex items-center justify-center gap-2 border-2 border-charcoal text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 hover:bg-charcoal hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-base">mail</span>
                Email Us
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Video Section */}
            {isOnline && (
              <section className="bg-white border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">play_circle</span>
                  <h2 className="font-bold text-sm uppercase tracking-wider">Course Video</h2>
                </div>
                <div className="aspect-video bg-charcoal flex items-center justify-center">
                  {/* Placeholder — videos hosted externally (Vimeo/YouTube unlisted) */}
                  <div className="text-center text-gray-500">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-3 block">videocam</span>
                    <p className="text-sm font-medium text-gray-400">Video content will be available here.</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your instructor will provide the video link via email.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* What's Included */}
            <section className="bg-white border border-gray-200 p-6">
              <h2 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">inventory_2</span>
                What&apos;s Included
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isOnline ? (
                  <>
                    {course?.online_includes?.access_code && <IncludeItem icon="vpn_key" label="Personal Access Code" />}
                    {course?.online_includes?.digital_material && <IncludeItem icon="description" label="Digital Materials & PDFs" />}
                    {course?.online_includes?.practice_month && <IncludeItem icon="calendar_month" label="1 Month Practice Access" />}
                    {course?.online_includes?.zoom_sessions && <IncludeItem icon="video_call" label="Live Zoom Q&A Sessions" />}
                  </>
                ) : (
                  <>
                    {course?.inperson_includes?.kit && <IncludeItem icon="medical_services" label="Professional Kit" />}
                    {course?.inperson_includes?.practice_month && <IncludeItem icon="calendar_month" label="1 Month Practice" />}
                    {course?.inperson_includes?.digital_material && <IncludeItem icon="description" label="Digital Materials" />}
                    {course?.inperson_includes?.certificate && <IncludeItem icon="workspace_premium" label="Physical Certificate" />}
                    {course?.inperson_includes?.medical_director && <IncludeItem icon="local_hospital" label="Medical Director Supervision" />}
                  </>
                )}
              </div>
            </section>

            {/* Downloadable Resources */}
            <section className="bg-white border border-gray-200 p-6">
              <h2 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">folder</span>
                Course Materials
              </h2>
              <div className="text-center py-8 text-gray-400">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">cloud_upload</span>
                <p className="text-sm font-medium">Materials will be uploaded here.</p>
                <p className="text-xs mt-1">PDFs, guides, and resources will appear once uploaded by your instructor.</p>
              </div>
            </section>

            {/* Contact / Support */}
            <section className="bg-gray-50 border border-gray-200 p-6 text-center">
              <p className="text-sm text-gray-500 mb-3">Need help with your course?</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="tel:+17139275300" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">call</span>
                  (713) 927-5300
                </a>
                <a href="mailto:aame0edu@gmail.com" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                  <span className="material-symbols-outlined text-base">mail</span>
                  aame0edu@gmail.com
                </a>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function IncludeItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
