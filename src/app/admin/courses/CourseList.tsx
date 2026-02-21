"use client";

import { useMemo, useState } from "react";
import AdminSearch from "@/components/admin/AdminSearch";
import CourseActions from "./CourseActions";
import type { Course } from "@/lib/supabase/types";

export default function CourseList({ courses }: { courses: Course[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return courses;
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.num.toLowerCase().includes(q)
    );
  }, [courses, search]);

  return (
    <>
      <div className="mb-4">
        <AdminSearch value={search} onChange={setSearch} placeholder="Search by title, category, or number..." />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 px-4 py-8 text-center text-gray-400 text-sm">
          No courses match your search.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="bg-white border border-gray-200 overflow-hidden hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-charcoal text-white text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Regular</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                    <th className="px-4 py-3 text-center">Featured</th>
                    <th className="px-4 py-3 text-center">In-Person</th>
                    <th className="px-4 py-3 text-center">Online</th>
                    <th className="px-4 py-3 text-center">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((course) => (
                    <tr
                      key={course.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !course.active ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-bold text-primary">{course.num}</td>
                      <td className="px-4 py-3 font-semibold text-sm">{course.title}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{course.category}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{course.price_regular_display}</td>
                      <td className="px-4 py-3 text-sm text-right text-primary font-medium">{course.price_discount_display}</td>
                      <td className="px-4 py-3 text-center">
                        {course.featured && <span className="material-symbols-outlined text-amber-500 text-lg">star</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {course.has_inperson && <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {course.has_online && <span className="material-symbols-outlined text-blue-500 text-lg">check_circle</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${course.active ? "bg-emerald-500" : "bg-red-500"}`} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <CourseActions courseId={course.id} courseTitle={course.title} active={course.active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((course) => (
              <div
                key={course.id}
                className={`bg-white border border-gray-200 p-4 ${!course.active ? "opacity-50" : ""}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-primary font-bold text-sm shrink-0">{course.num}</span>
                    <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${course.active ? "bg-emerald-500" : "bg-red-500"}`} />
                  </div>
                  <CourseActions courseId={course.id} courseTitle={course.title} active={course.active} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{course.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{course.category}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">{course.price_regular_display}</span>
                  {course.price_discount_display && (
                    <span className="text-primary font-medium">{course.price_discount_display}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {course.featured && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600">
                      <span className="material-symbols-outlined text-xs">star</span>Featured
                    </span>
                  )}
                  {course.has_inperson && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600">
                      <span className="material-symbols-outlined text-xs">check_circle</span>In-Person
                    </span>
                  )}
                  {course.has_online && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-blue-600">
                      <span className="material-symbols-outlined text-xs">check_circle</span>Online
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
