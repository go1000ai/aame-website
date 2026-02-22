import { createClient } from "@/lib/supabase/server";
import { getStudentSession } from "@/lib/student-session";
import Link from "next/link";

export default async function StudentDashboardPage() {
  const session = await getStudentSession();
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses:course_id(*), schedule:course_schedule_id(*)")
    .eq("student_email", session.email)
    .in("status", ["paid", "deposit_paid"])
    .order("created_at", { ascending: false });

  const all = enrollments || [];
  const completed = all.filter((e) => e.attended === true);
  const upcoming = all.filter((e) => e.attended !== true);
  const totalInvested = all.reduce((sum, e) => sum + e.amount_paid_cents, 0);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">
          Welcome back, {session.name.split(" ")[0]}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{formattedDate}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="school"
          label="Enrolled Courses"
          value={all.length}
          color="text-primary"
          bgColor="bg-primary/10"
        />
        <StatCard
          icon="check_circle"
          label="Completed"
          value={completed.length}
          color="text-emerald-500"
          bgColor="bg-emerald-50"
        />
        <StatCard
          icon="workspace_premium"
          label="Certificates"
          value={completed.length}
          color="text-violet-500"
          bgColor="bg-violet-50"
        />
        <StatCard
          icon="payments"
          label="Total Invested"
          value={`$${(totalInvested / 100).toLocaleString()}`}
          color="text-blue-500"
          bgColor="bg-blue-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Courses */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">event</span>
                Upcoming Courses
              </h2>
              <Link
                href="/student/courses"
                className="text-xs text-primary font-bold hover:underline"
              >
                View All
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">
                  event_available
                </span>
                <p className="text-gray-400 text-sm">No upcoming courses</p>
                <Link
                  href="/courses"
                  className="inline-block mt-3 text-primary text-xs font-bold hover:underline"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {upcoming.slice(0, 3).map((enrollment) => {
                  const course = enrollment.courses;
                  const schedule = enrollment.schedule;
                  return (
                    <Link
                      key={enrollment.id}
                      href={`/student/courses/${enrollment.id}`}
                      className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors"
                    >
                      {/* Date block */}
                      {schedule ? (
                        <div className="bg-charcoal text-white w-14 h-14 flex flex-col items-center justify-center shrink-0">
                          <span className="text-primary text-[10px] font-bold uppercase">
                            {new Date(schedule.date + "T00:00:00").toLocaleDateString(
                              "en-US",
                              { month: "short" }
                            )}
                          </span>
                          <span className="text-xl font-[Montserrat] font-black leading-none">
                            {new Date(schedule.date + "T00:00:00").getDate()}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-gray-100 w-14 h-14 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-gray-400">
                            calendar_today
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          {course?.title || "Course"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-bold uppercase px-1.5 py-0.5 ${
                              enrollment.modality === "online"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {enrollment.modality === "online" ? "Online" : "In-Person"}
                          </span>
                          {schedule && (
                            <span className="text-[10px] text-gray-400">
                              {schedule.time}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="material-symbols-outlined text-gray-300">
                        chevron_right
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Progress */}
          <div className="bg-white border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  trending_up
                </span>
                Progress
              </h2>
            </div>
            <div className="p-5">
              {all.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">
                  Enroll in a course to start tracking progress.
                </p>
              ) : (
                <div className="space-y-4">
                  {all.slice(0, 4).map((enrollment) => {
                    const course = enrollment.courses;
                    const isComplete = enrollment.attended === true;
                    return (
                      <div key={enrollment.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-xs font-bold truncate max-w-[180px]">
                            {course?.title || "Course"}
                          </p>
                          <span
                            className={`text-[10px] font-bold uppercase ${
                              isComplete ? "text-emerald-500" : "text-amber-500"
                            }`}
                          >
                            {isComplete ? "Complete" : "In Progress"}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              isComplete ? "bg-emerald-500" : "bg-amber-400"
                            }`}
                            style={{ width: isComplete ? "100%" : "33%" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  bolt
                </span>
                Quick Actions
              </h2>
            </div>
            <div className="p-3 space-y-1">
              <QuickAction
                href="/courses"
                icon="storefront"
                label="Browse More Courses"
              />
              <QuickAction
                href="/student/certificates"
                icon="workspace_premium"
                label="View My Certificates"
              />
              <QuickAction
                href="/student/profile"
                icon="receipt_long"
                label="Payment History"
              />
              <QuickAction
                href="tel:+17139275300"
                icon="call"
                label="Contact AAME"
                external
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: string;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${bgColor} flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${color}`}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-[Montserrat] font-black">{value}</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  external,
}: {
  href: string;
  icon: string;
  label: string;
  external?: boolean;
}) {
  const Tag = external ? "a" : Link;
  return (
    <Tag
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors rounded"
    >
      <span className="material-symbols-outlined text-primary text-lg">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
      <span className="material-symbols-outlined text-gray-300 text-sm ml-auto">
        chevron_right
      </span>
    </Tag>
  );
}
