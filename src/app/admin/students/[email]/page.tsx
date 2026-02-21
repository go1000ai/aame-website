"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Enrollment, Course } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/browser";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  deposit_paid: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function StudentDetailPage() {
  const params = useParams();
  const email = decodeURIComponent(params.email as string);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase
        .from("enrollments")
        .select("*")
        .eq("student_email", email)
        .order("created_at", { ascending: false })
        .then(({ data }) => data || []),
      fetch("/api/courses").then((r) => r.json()),
    ]).then(([enrData, coursesData]) => {
      setEnrollments(enrData);
      setCourses(coursesData || []);
      setLoading(false);
    });
  }, [email]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const student = enrollments[0];
  if (!student) return <p className="text-red-500">Student not found</p>;

  const totalPaid = enrollments.reduce(
    (sum, e) => sum + e.amount_paid_cents,
    0
  );

  function courseName(courseId: string | null): string {
    if (!courseId) return "Unknown Course";
    const c = courses.find((c) => c.id === courseId);
    return c ? `${c.num} — ${c.title}` : "Unknown Course";
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/students"
          className="text-gray-400 hover:text-charcoal transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-[Montserrat] font-bold text-charcoal">
            {student.student_name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">{student.student_email}</p>
        </div>
        <Link
          href="/admin/enrollments/new"
          className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-5 py-2.5 hover:brightness-110 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Enrollment
        </Link>
      </div>

      {/* Student Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Email
          </p>
          <p className="text-sm font-medium truncate">{student.student_email}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Phone
          </p>
          <p className="text-sm font-medium">
            {student.student_phone || "—"}
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Enrollments
          </p>
          <p className="text-sm font-bold text-primary">
            {enrollments.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Total Paid
          </p>
          <p className="text-sm font-bold text-primary">
            ${(totalPaid / 100).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Enrollment History */}
      <h2 className="text-lg font-[Montserrat] font-bold text-charcoal mb-4">
        Enrollment History
      </h2>
      <div className="space-y-3">
        {enrollments.map((e) => (
          <Link
            key={e.id}
            href={`/admin/enrollments/${e.id}`}
            className="block bg-white border border-gray-200 p-5 hover:border-primary transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-sm">
                  {courseName(e.course_id)}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(e.created_at).toLocaleDateString()} •{" "}
                  <span className="uppercase">{e.modality}</span> •{" "}
                  <span className="uppercase">{e.payment_method}</span>
                </p>
              </div>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-1 shrink-0 ml-2 ${statusColors[e.status] || "bg-gray-100"}`}
              >
                {e.status}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-500">
                Total:{" "}
                <span className="font-medium text-charcoal">
                  ${(e.total_amount_cents / 100).toFixed(2)}
                </span>
              </span>
              <span className="text-gray-500">
                Paid:{" "}
                <span className="font-medium text-primary">
                  ${(e.amount_paid_cents / 100).toFixed(2)}
                </span>
              </span>
              {e.access_code && (
                <span className="text-gray-500">
                  Code:{" "}
                  <code className="font-mono text-xs bg-primary/10 px-1.5 py-0.5 text-primary">
                    {e.access_code}
                  </code>
                </span>
              )}
              {e.attended !== null && (
                <span
                  className={`text-xs font-bold uppercase ${e.attended ? "text-emerald-500" : "text-red-500"}`}
                >
                  {e.attended ? "Attended" : "No-Show"}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
