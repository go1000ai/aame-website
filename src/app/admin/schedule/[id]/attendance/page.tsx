"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Enrollment, CourseSchedule } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/browser";

export default function AttendancePage() {
  const params = useParams();
  const [session, setSession] = useState<CourseSchedule | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendance, setAttendance] = useState<
    Record<string, boolean | null>
  >({});

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      fetch(`/api/schedule/${params.id}`)
        .then((r) => r.json())
        .catch(() => null),
      supabase
        .from("enrollments")
        .select("*")
        .eq("course_schedule_id", params.id)
        .neq("status", "cancelled")
        .order("student_name")
        .then(({ data }) => data || []),
    ]).then(([sessionData, enrData]) => {
      setSession(sessionData);
      setEnrollments(enrData);

      // Initialize attendance state from existing data
      const att: Record<string, boolean | null> = {};
      for (const e of enrData) {
        att[e.id] = e.attended ?? null;
      }
      setAttendance(att);
      setLoading(false);
    });
  }, [params.id]);

  function markAll(value: boolean) {
    const updated: Record<string, boolean | null> = {};
    for (const e of enrollments) {
      updated[e.id] = value;
    }
    setAttendance(updated);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const now = new Date().toISOString();

    const promises = enrollments.map((e) => {
      const attended = attendance[e.id];
      return supabase
        .from("enrollments")
        .update({
          attended: attended ?? null,
          attendance_date: attended !== null ? now : null,
        })
        .eq("id", e.id);
    });

    await Promise.all(promises);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <p className="text-red-500">Session not found</p>;

  const attendedCount = Object.values(attendance).filter(
    (v) => v === true
  ).length;
  const totalCount = enrollments.length;
  const rate = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/schedule/${params.id}/edit`}
          className="text-gray-400 hover:text-charcoal transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-[Montserrat] font-bold text-charcoal">
            Attendance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {session.course_name} — {session.date}
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 p-4 text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Enrolled
          </p>
          <p className="text-2xl font-black text-charcoal">{totalCount}</p>
        </div>
        <div className="bg-white border border-gray-200 p-4 text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Attended
          </p>
          <p className="text-2xl font-black text-emerald-500">
            {attendedCount}
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-4 text-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Rate
          </p>
          <p
            className={`text-2xl font-black ${rate >= 80 ? "text-emerald-500" : rate >= 50 ? "text-amber-500" : "text-red-500"}`}
          >
            {rate}%
          </p>
        </div>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">
            group
          </span>
          <p className="text-gray-400 font-medium">
            No students enrolled for this session
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Enrollments linked to this session will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Bulk Actions */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => markAll(true)}
              className="bg-emerald-500 text-white font-bold uppercase text-xs tracking-widest px-4 py-2 hover:bg-emerald-600 transition-colors cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">
                check_circle
              </span>
              Mark All Present
            </button>
            <button
              onClick={() => markAll(false)}
              className="border border-red-300 text-red-500 font-bold uppercase text-xs tracking-widest px-4 py-2 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">
                cancel
              </span>
              Mark All Absent
            </button>
          </div>

          {/* Student List */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            {enrollments.map((e, i) => (
              <div
                key={e.id}
                className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-gray-100" : ""}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{e.student_name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {e.student_email}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 ${e.status === "paid" ? "bg-emerald-100 text-emerald-700" : e.status === "deposit_paid" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {e.status}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setAttendance((prev) => ({
                        ...prev,
                        [e.id]: true,
                      }))
                    }
                    className={`w-9 h-9 flex items-center justify-center cursor-pointer transition-colors ${
                      attendance[e.id] === true
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-400 hover:bg-emerald-100"
                    }`}
                    title="Present"
                  >
                    <span className="material-symbols-outlined text-lg">
                      check
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      setAttendance((prev) => ({
                        ...prev,
                        [e.id]: false,
                      }))
                    }
                    className={`w-9 h-9 flex items-center justify-center cursor-pointer transition-colors ${
                      attendance[e.id] === false
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-400 hover:bg-red-100"
                    }`}
                    title="Absent"
                  >
                    <span className="material-symbols-outlined text-lg">
                      close
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      setAttendance((prev) => ({
                        ...prev,
                        [e.id]: null,
                      }))
                    }
                    className={`w-9 h-9 flex items-center justify-center cursor-pointer transition-colors ${
                      attendance[e.id] === null || attendance[e.id] === undefined
                        ? "bg-gray-300 text-white"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                    title="Not yet"
                  >
                    <span className="material-symbols-outlined text-lg">
                      remove
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Save */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
            <Link
              href={`/admin/schedule/${params.id}/edit`}
              className="border border-gray-300 text-gray-600 font-bold uppercase text-xs tracking-widest px-8 py-3 hover:border-charcoal transition-colors"
            >
              Back to Session
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
