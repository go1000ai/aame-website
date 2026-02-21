"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdminSearch from "@/components/admin/AdminSearch";
import type { CourseSchedule } from "@/lib/supabase/types";

export default function DashboardSessions({ sessions }: { sessions: CourseSchedule[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return sessions;
    const q = search.toLowerCase();
    return sessions.filter(
      (s) =>
        s.course_name.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
    );
  }, [sessions, search]);

  return (
    <div className="bg-white border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-charcoal">Upcoming Sessions</h2>
        <Link
          href="/admin/schedule"
          className="text-sm text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      {sessions.length > 0 && (
        <div className="mb-4">
          <AdminSearch value={search} onChange={setSearch} placeholder="Search sessions..." />
        </div>
      )}

      {sessions.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">
          No upcoming sessions scheduled.
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-sm py-8 text-center">
          No sessions match your search.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="py-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-charcoal text-white text-center px-2.5 py-1.5 sm:px-3 sm:py-2 min-w-[50px] sm:min-w-[60px] shrink-0">
                  <p className="text-[10px] sm:text-xs text-primary font-bold">
                    {new Date(s.date + "T00:00:00")
                      .toLocaleDateString("en-US", { month: "short" })
                      .toUpperCase()}
                  </p>
                  <p className="text-lg sm:text-xl font-bold leading-none">
                    {new Date(s.date + "T00:00:00").getDate()}
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-charcoal text-sm sm:text-base truncate">{s.course_name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {s.time} &middot; {s.location}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 sm:mt-0 sm:hidden">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                        s.status === "open"
                          ? "bg-emerald-100 text-emerald-700"
                          : s.status === "filling"
                            ? "bg-amber-100 text-amber-700"
                            : s.status === "sold_out"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {s.spots_available}/{s.spots_total} spots
                    </span>
                  </div>
                </div>
                <div className="text-right hidden sm:block shrink-0">
                  <span
                    className={`text-xs font-bold uppercase px-2 py-1 ${
                      s.status === "open"
                        ? "bg-emerald-100 text-emerald-700"
                        : s.status === "filling"
                          ? "bg-amber-100 text-amber-700"
                          : s.status === "sold_out"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {s.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {s.spots_available}/{s.spots_total} spots
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
