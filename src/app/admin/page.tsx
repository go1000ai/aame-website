import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DashboardSessions from "./DashboardSessions";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [coursesRes, scheduleRes, enrollmentsRes, attendanceRes] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact" }).eq("active", true),
    supabase
      .from("course_schedule")
      .select("id, spots_available", { count: "exact" })
      .gte("date", new Date().toISOString().split("T")[0]),
    supabase.from("enrollments").select("id, status", { count: "exact" }),
    supabase.from("enrollments").select("attended").not("attended", "is", null),
  ]);

  const courseCount = coursesRes.count || 0;
  const upcomingCount = scheduleRes.count || 0;
  const totalSpots = (scheduleRes.data || []).reduce(
    (sum, s) => sum + (s.spots_available || 0),
    0
  );
  const enrollmentCount = enrollmentsRes.count || 0;

  const attendanceData = attendanceRes.data || [];
  const attendedCount = attendanceData.filter((a) => a.attended === true).length;
  const attendanceRate = attendanceData.length > 0
    ? Math.round((attendedCount / attendanceData.length) * 100)
    : 0;

  const stats = [
    { label: "Active Courses", value: courseCount, icon: "school", color: "text-primary", href: "/admin/courses" },
    { label: "Upcoming Sessions", value: upcomingCount, icon: "calendar_month", color: "text-blue-500", href: "/admin/schedule" },
    { label: "Enrollments", value: enrollmentCount, icon: "group", color: "text-violet-500", href: "/admin/enrollments" },
    { label: "Students", value: "—", icon: "person", color: "text-amber-500", href: "/admin/students" },
    { label: "Open Spots", value: totalSpots, icon: "event_seat", color: "text-emerald-500", href: "/admin/schedule" },
    { label: "Attendance Rate", value: attendanceData.length > 0 ? `${attendanceRate}%` : "—", icon: "fact_check", color: "text-rose-500", href: "/admin/schedule" },
  ];

  // Recent upcoming sessions
  const { data: recentSchedule } = await supabase
    .from("course_schedule")
    .select("*")
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true })
    .limit(5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of your AAME platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-10">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white p-4 sm:p-6 border border-gray-200 hover:border-primary transition-colors"
          >
            <span className={`material-symbols-outlined text-2xl sm:text-3xl ${stat.color} mb-2 sm:mb-4 block`}>
              {stat.icon}
            </span>
            <p className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">
              {stat.value}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Schedule with Search */}
      <DashboardSessions sessions={recentSchedule || []} />
    </div>
  );
}
