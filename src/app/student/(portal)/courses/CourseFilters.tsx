"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course, CourseSchedule } from "@/lib/supabase/types";

type EnrollmentWithRelations = {
  id: string;
  course_id: string | null;
  course_schedule_id: string | null;
  student_name: string;
  modality: "inperson" | "online";
  status: string;
  access_code: string | null;
  attended: boolean | null;
  attendance_date: string | null;
  amount_paid_cents: number;
  total_amount_cents: number;
  created_at: string;
  courses: Course | null;
  schedule: CourseSchedule | null;
};

const tabs = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Completed" },
] as const;

export default function CourseFilters({
  enrollments,
}: {
  enrollments: EnrollmentWithRelations[];
}) {
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed">("all");

  const filtered = enrollments.filter((e) => {
    if (activeTab === "upcoming") return e.attended !== true;
    if (activeTab === "completed") return e.attended === true;
    return true;
  });

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-charcoal text-primary"
                : "bg-white text-charcoal border border-gray-200 hover:border-primary"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-[10px] opacity-60">
              ({tab.key === "all"
                ? enrollments.length
                : tab.key === "upcoming"
                  ? enrollments.filter((e) => e.attended !== true).length
                  : enrollments.filter((e) => e.attended === true).length})
            </span>
          </button>
        ))}
      </div>

      {/* Course cards */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">
            {activeTab === "completed" ? "workspace_premium" : "school"}
          </span>
          <p className="text-gray-400 font-medium">
            {activeTab === "completed"
              ? "No completed courses yet"
              : activeTab === "upcoming"
                ? "No upcoming courses"
                : "No courses yet"}
          </p>
          <Link
            href="/courses"
            className="inline-block mt-4 bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-2.5 hover:brightness-110 transition-all"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((enrollment) => {
            const course = enrollment.courses;
            const schedule = enrollment.schedule;
            const isCompleted = enrollment.attended === true;
            const balanceDue =
              enrollment.total_amount_cents - enrollment.amount_paid_cents;

            return (
              <div
                key={enrollment.id}
                className="bg-white border border-gray-200 overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Left: course info */}
                  <div className="flex-1 p-5">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {course?.num && (
                        <span className="text-primary font-black text-sm">
                          {course.num}
                        </span>
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {course?.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                          enrollment.modality === "online"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {enrollment.modality === "online" ? "Online" : "In-Person"}
                      </span>
                    </div>

                    <h3 className="text-lg font-[Montserrat] font-bold uppercase mb-3">
                      {course?.title || "Course"}
                    </h3>

                    {/* Schedule info */}
                    {schedule && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            calendar_today
                          </span>
                          {new Date(schedule.date + "T00:00:00").toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" }
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            schedule
                          </span>
                          {schedule.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            location_on
                          </span>
                          {schedule.location}
                        </span>
                      </div>
                    )}

                    {/* 3-step progress */}
                    <div className="flex items-center gap-1 text-[10px]">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-emerald-500 text-sm">
                          check_circle
                        </span>
                        <span className="text-emerald-600 font-bold uppercase">
                          Enrolled
                        </span>
                      </div>
                      <div className="w-6 h-px bg-gray-200" />
                      <div className="flex items-center gap-1">
                        <span
                          className={`material-symbols-outlined text-sm ${
                            isCompleted ? "text-emerald-500" : "text-gray-300"
                          }`}
                        >
                          {isCompleted ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span
                          className={`font-bold uppercase ${
                            isCompleted ? "text-emerald-600" : "text-gray-400"
                          }`}
                        >
                          Attended
                        </span>
                      </div>
                      <div className="w-6 h-px bg-gray-200" />
                      <div className="flex items-center gap-1">
                        <span
                          className={`material-symbols-outlined text-sm ${
                            isCompleted ? "text-emerald-500" : "text-gray-300"
                          }`}
                        >
                          {isCompleted ? "check_circle" : "radio_button_unchecked"}
                        </span>
                        <span
                          className={`font-bold uppercase ${
                            isCompleted ? "text-emerald-600" : "text-gray-400"
                          }`}
                        >
                          Certified
                        </span>
                      </div>
                    </div>

                    {/* Balance warning */}
                    {balanceDue > 0 && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          warning
                        </span>
                        Balance due: ${(balanceDue / 100).toFixed(2)}
                      </p>
                    )}
                  </div>

                  {/* Right: actions */}
                  <div className="flex sm:flex-col items-center justify-center gap-3 p-5 sm:border-l border-gray-100 sm:min-w-[160px] shrink-0">
                    <Link
                      href={`/student/courses/${enrollment.id}`}
                      className="bg-charcoal text-white font-bold uppercase text-[10px] tracking-widest px-5 py-2.5 hover:bg-charcoal/80 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    {isCompleted && (
                      <Link
                        href={`/student/certificates/${enrollment.id}`}
                        className="bg-primary text-charcoal font-bold uppercase text-[10px] tracking-widest px-5 py-2.5 hover:brightness-110 transition-all text-center flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">
                          workspace_premium
                        </span>
                        Certificate
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
