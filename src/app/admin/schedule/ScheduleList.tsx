"use client";

import { useMemo, useState } from "react";
import AdminSearch from "@/components/admin/AdminSearch";
import ScheduleActions from "./ScheduleActions";
import type { CourseSchedule } from "@/lib/supabase/types";

const statusColors: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  filling: "bg-amber-100 text-amber-700",
  sold_out: "bg-red-100 text-red-700",
  completed: "bg-gray-100 text-gray-500",
};

export default function ScheduleList({ schedule }: { schedule: CourseSchedule[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return schedule;
    const q = search.toLowerCase();
    return schedule.filter(
      (s) =>
        s.course_name.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [schedule, search]);

  return (
    <>
      <div className="mb-4">
        <AdminSearch value={search} onChange={setSearch} placeholder="Search by course, status, or category..." />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 px-4 py-8 text-center text-gray-400 text-sm">
          No sessions match your search.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="bg-white border border-gray-200 overflow-hidden hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-charcoal text-white text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Course</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Location</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Spots</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Discount</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => {
                    const isPast = new Date(s.date + "T23:59:59") < new Date();
                    return (
                      <tr
                        key={s.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isPast ? "opacity-50" : ""}`}
                      >
                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                          {new Date(s.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 font-semibold text-sm">{s.course_name}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{s.time}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">{s.location}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 ${statusColors[s.status] || "bg-gray-100 text-gray-500"}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          <span className="font-bold">{s.spots_available}</span>
                          <span className="text-gray-400">/{s.spots_total}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {s.price_regular_display || s.price}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-primary font-medium">
                          {s.price_discount_display || ""}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ScheduleActions sessionId={s.id} courseName={s.course_name} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((s) => {
              const isPast = new Date(s.date + "T23:59:59") < new Date();
              return (
                <div
                  key={s.id}
                  className={`bg-white border border-gray-200 p-4 ${isPast ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 ${statusColors[s.status] || "bg-gray-100 text-gray-500"}`}>
                        {s.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        <span className="font-bold text-charcoal">{s.spots_available}</span>/{s.spots_total} spots
                      </span>
                    </div>
                    <ScheduleActions sessionId={s.id} courseName={s.course_name} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{s.course_name}</h3>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">calendar_month</span>
                      {new Date(s.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric", year: "numeric",
                      })}
                      {s.time && ` at ${s.time}`}
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">location_on</span>
                      {s.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-sm">
                    <span className="font-medium">{s.price_regular_display || s.price}</span>
                    {s.price_discount_display && (
                      <span className="text-primary font-medium">{s.price_discount_display}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
