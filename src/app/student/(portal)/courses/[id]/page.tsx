import { createClient } from "@/lib/supabase/server";
import { getStudentSession } from "@/lib/student-session";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getStudentSession();
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*, courses:course_id(*), schedule:course_schedule_id(*)")
    .eq("id", id)
    .eq("student_email", session.email)
    .single();

  if (!enrollment) {
    redirect("/student/courses");
  }

  const course = enrollment.courses;
  const schedule = enrollment.schedule;
  const isPaid = enrollment.status === "paid";
  const isOnline = enrollment.modality === "online";
  const isCompleted = enrollment.attended === true;

  return (
    <div>
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
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
            {course?.category}
          </span>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 ml-auto ${
              isOnline ? "bg-blue-500/20 text-blue-300" : "bg-primary/20 text-primary"
            }`}
          >
            {isOnline ? "Online" : "In-Person"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-black uppercase">
          {course?.title}
        </h1>
        {course?.duration && (
          <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">
              schedule
            </span>
            {course.duration}
          </p>
        )}
      </div>

      {/* Course Description */}
      {course?.description && (
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">description</span>
            About This Course
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
        </div>
      )}

      {/* Progress Timeline */}
      <div className="bg-white border border-gray-200 p-6 mb-6">
        <h2 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">trending_up</span>
          Course Progress
        </h2>
        <div className="flex items-center gap-3">
          {/* Step 1: Enrolled */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">check</span>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase">Enrolled</p>
              <p className="text-[10px] text-gray-400">
                {new Date(enrollment.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex-1 h-px bg-gray-200" />

          {/* Step 2: Attended */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? "bg-emerald-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`material-symbols-outlined text-sm ${
                  isCompleted ? "text-white" : "text-gray-400"
                }`}
              >
                {isCompleted ? "check" : "schedule"}
              </span>
            </div>
            <div>
              <p
                className={`text-xs font-bold uppercase ${
                  isCompleted ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                Attended
              </p>
              <p className="text-[10px] text-gray-400">
                {isCompleted && enrollment.attendance_date
                  ? new Date(enrollment.attendance_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "Pending"}
              </p>
            </div>
          </div>

          <div className="flex-1 h-px bg-gray-200" />

          {/* Step 3: Certified */}
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? "bg-emerald-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`material-symbols-outlined text-sm ${
                  isCompleted ? "text-white" : "text-gray-400"
                }`}
              >
                {isCompleted ? "workspace_premium" : "lock"}
              </span>
            </div>
            <div>
              <p
                className={`text-xs font-bold uppercase ${
                  isCompleted ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                Certified
              </p>
              {isCompleted ? (
                <Link
                  href={`/student/certificates/${enrollment.id}`}
                  className="text-[10px] text-primary font-bold hover:underline"
                >
                  View Certificate
                </Link>
              ) : (
                <p className="text-[10px] text-gray-400">After attendance</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule info */}
      {schedule && (
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">event</span>
            Session Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Date</p>
              <p className="font-bold text-sm">
                {new Date(schedule.date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Time</p>
              <p className="font-bold text-sm">{schedule.time}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Location</p>
              <p className="font-bold text-sm">{schedule.location}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pre-course checklist */}
      {!isCompleted && (
        <div className="bg-blue-50 border border-blue-200 p-6 mb-6">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-blue-800">
            <span className="material-symbols-outlined text-blue-500">checklist</span>
            Pre-Course Checklist
          </h2>
          <ul className="space-y-2">
            {isOnline ? (
              <>
                <CheckItem label="Test your Zoom connection before class" />
                <CheckItem label="Ensure a stable internet connection" />
                <CheckItem label="Have a quiet, well-lit workspace" />
                <CheckItem label="Have a notebook ready for notes" />
              </>
            ) : (
              <>
                <CheckItem label="Arrive 15 minutes early for check-in" />
                <CheckItem label="Bring a valid photo ID" />
                <CheckItem label="Wear comfortable clothing" />
                <CheckItem label="Eat beforehand — sessions are intensive" />
              </>
            )}
          </ul>
        </div>
      )}

      {/* Content */}
      {!isPaid ? (
        <div className="bg-white border border-gray-200 p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-amber-400 mb-4 block">
            lock
          </span>
          <h2 className="text-xl font-bold text-charcoal mb-2">Payment Required</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Complete your full payment to unlock course materials.
          </p>
          <p className="text-sm text-gray-500">
            Amount Paid:{" "}
            <strong>${(enrollment.amount_paid_cents / 100).toFixed(2)}</strong> of{" "}
            <strong>${(enrollment.total_amount_cents / 100).toFixed(2)}</strong>
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="tel:+17139275300"
              className="inline-flex items-center justify-center gap-2 bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 hover:brightness-110 transition-all"
            >
              <span className="material-symbols-outlined text-base">call</span>
              Call to Complete Payment
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
                <h2 className="font-bold text-sm uppercase tracking-wider">
                  Course Video
                </h2>
              </div>
              {course?.video_url ? (
                isDirectVideo(course.video_url) ? (
                  <div className="aspect-video bg-black">
                    <video
                      src={course.video_url}
                      controls
                      className="w-full h-full"
                      controlsList="nodownload"
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <div className="aspect-video">
                    <iframe
                      src={getEmbedUrl(course.video_url)}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={course.title}
                    />
                  </div>
                )
              ) : (
                <div className="aspect-video bg-charcoal flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <span className="material-symbols-outlined text-6xl text-gray-600 mb-3 block">
                      videocam
                    </span>
                    <p className="text-sm font-medium text-gray-400">
                      Video content will be available here.
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Your instructor will upload the video soon.
                    </p>
                  </div>
                </div>
              )}
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
                  {course?.online_includes?.access_code && (
                    <IncludeItem icon="vpn_key" label="Personal Access Code" />
                  )}
                  {course?.online_includes?.digital_material && (
                    <IncludeItem icon="description" label="Digital Materials & PDFs" />
                  )}
                  {course?.online_includes?.practice_month && (
                    <IncludeItem icon="calendar_month" label="1 Month Practice Access" />
                  )}
                  {course?.online_includes?.zoom_sessions && (
                    <IncludeItem icon="video_call" label="Live Zoom Q&A Sessions" />
                  )}
                </>
              ) : (
                <>
                  {course?.inperson_includes?.kit && (
                    <IncludeItem icon="medical_services" label="Professional Kit" />
                  )}
                  {course?.inperson_includes?.practice_month && (
                    <IncludeItem icon="calendar_month" label="1 Month Practice" />
                  )}
                  {course?.inperson_includes?.digital_material && (
                    <IncludeItem icon="description" label="Digital Materials" />
                  )}
                  {course?.inperson_includes?.certificate && (
                    <IncludeItem icon="workspace_premium" label="Physical Certificate" />
                  )}
                  {course?.inperson_includes?.medical_director && (
                    <IncludeItem icon="local_hospital" label="Medical Director Supervision" />
                  )}
                </>
              )}
            </div>
          </section>

          {/* Course Materials */}
          <section className="bg-white border border-gray-200 p-6">
            <h2 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">folder</span>
              Course Materials
            </h2>
            <div className="text-center py-8 text-gray-400">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">
                cloud_upload
              </span>
              <p className="text-sm font-medium">Materials will be uploaded here.</p>
              <p className="text-xs mt-1">
                PDFs, guides, and resources will appear once uploaded by your instructor.
              </p>
            </div>
          </section>

          {/* Support */}
          <section className="bg-gray-50 border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">Need help with your course?</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+17139275300"
                className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">call</span>
                (713) 927-5300
              </a>
              <a
                href="mailto:aame0edu@gmail.com"
                className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">mail</span>
                aame0edu@gmail.com
              </a>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function isDirectVideo(url: string): boolean {
  return (
    /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url) ||
    url.includes("supabase.co/storage")
  );
}

function getEmbedUrl(url: string): string {
  // YouTube: youtube.com/watch?v=ID or youtu.be/ID
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  // Fallback: return URL as-is (in case it's already an embed URL)
  return url;
}

function IncludeItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function CheckItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-blue-700">
      <span className="material-symbols-outlined text-blue-400 text-base">
        check_box_outline_blank
      </span>
      {label}
    </li>
  );
}
