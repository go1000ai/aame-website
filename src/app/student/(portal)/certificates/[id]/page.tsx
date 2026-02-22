import { createClient } from "@/lib/supabase/server";
import { getStudentSession } from "@/lib/student-session";
import { redirect } from "next/navigation";
import CertificateActions from "../CertificateActions";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getStudentSession();
  const supabase = await createClient();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*, courses:course_id(*)")
    .eq("id", id)
    .eq("student_email", session.email)
    .eq("attended", true)
    .single();

  if (!enrollment) {
    redirect("/student/certificates");
  }

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

  const certId = enrollment.id.slice(0, 8).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto">
      <CertificateActions />

      {/* Certificate */}
      <div className="bg-white border-2 border-gray-200 print:border-none print:shadow-none">
        {/* Decorative top border */}
        <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary print:bg-primary" />

        <div className="p-10 sm:p-14 text-center">
          {/* Inner decorative border */}
          <div className="border-2 border-primary/20 p-8 sm:p-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-[Montserrat] font-black uppercase tracking-tighter text-charcoal">
                AAME
              </h1>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mt-1">
                American Academy of Medical Esthetics
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-primary/30" />
              <span className="material-symbols-outlined text-primary text-2xl print:text-charcoal">
                workspace_premium
              </span>
              <div className="flex-1 h-px bg-primary/30" />
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-[Montserrat] font-bold uppercase tracking-widest text-primary mb-8">
              Certificate of Completion
            </h2>

            {/* Body */}
            <p className="text-sm text-gray-500 mb-2">This certifies that</p>
            <p className="text-2xl sm:text-3xl font-[Montserrat] font-black text-charcoal mb-6">
              {enrollment.student_name}
            </p>

            <p className="text-sm text-gray-500 mb-2">
              has successfully completed the course
            </p>
            <p className="text-xl sm:text-2xl font-[Montserrat] font-bold uppercase text-charcoal mb-1">
              {course?.num && (
                <span className="text-primary mr-2">{course.num}</span>
              )}
              {course?.title}
            </p>
            {course?.category && (
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-8">
                {course.category}
              </p>
            )}

            {/* Details grid */}
            <div className="grid grid-cols-3 gap-4 mb-10 text-center">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Date of Completion
                </p>
                <p className="text-sm font-bold">{completionDate}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Modality
                </p>
                <p className="text-sm font-bold">
                  {enrollment.modality === "online" ? "Online" : "In-Person"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Duration
                </p>
                <p className="text-sm font-bold">{course?.duration || "—"}</p>
              </div>
            </div>

            {/* Signature area */}
            <div className="flex items-end justify-center gap-12 mb-6">
              <div className="text-center">
                <div className="w-48 border-b-2 border-charcoal mb-2" />
                <p className="text-sm font-bold">Strani Mayorga</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Founder & Lead Instructor
                </p>
              </div>
            </div>

            {/* Certificate ID */}
            <p className="text-[10px] text-gray-400 mt-8">
              Certificate ID: {certId}
            </p>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary print:bg-primary" />
      </div>
    </div>
  );
}
