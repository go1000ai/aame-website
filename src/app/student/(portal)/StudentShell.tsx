"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export type StudentStats = {
  totalCourses: number;
  certificates: number;
  upcoming: number;
  memberSince: string;
};

const navItems = [
  { href: "/student/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/student/courses", label: "My Courses", icon: "school" },
  { href: "/student/certificates", label: "Certificates", icon: "workspace_premium" },
  { href: "/student/profile", label: "Profile & Payments", icon: "person" },
];

export default function StudentShell({
  children,
  session,
  stats,
}: {
  children: React.ReactNode;
  session: { email: string; name: string };
  stats: StudentStats;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = session.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    await fetch("/api/student/logout", { method: "POST" });
    router.push("/student/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-charcoal text-white flex flex-col shrink-0 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo + close */}
        <div className="p-5 border-b border-gray-700 flex items-center justify-between">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-3"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="bg-primary/10 p-2">
              <span className="material-symbols-outlined text-primary text-2xl">
                school
              </span>
            </div>
            <div>
              <span className="font-[Montserrat] font-bold text-lg uppercase tracking-tighter">
                AAME
              </span>
              <p className="text-[8px] uppercase tracking-widest text-primary font-semibold">
                Student Portal
              </p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Student profile card */}
        <div className="px-5 py-6 border-b border-gray-700">
          {/* Avatar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-charcoal font-[Montserrat] font-black text-lg">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{session.name}</p>
              <p className="text-xs text-gray-400 truncate">{session.email}</p>
            </div>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-primary font-black text-lg leading-none">
                {stats.totalCourses}
              </p>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">
                Courses
              </p>
            </div>
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-emerald-400 font-black text-lg leading-none">
                {stats.certificates}
              </p>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">
                Certs
              </p>
            </div>
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-blue-400 font-black text-lg leading-none">
                {stats.upcoming}
              </p>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">
                Upcoming
              </p>
            </div>
          </div>

          {/* Member since */}
          {stats.memberSince && (
            <p className="text-[10px] text-gray-500 mt-3 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">calendar_today</span>
              Member since {stats.memberSince}
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/student/dashboard"
                ? pathname === "/student/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          <Link
            href="/courses"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">storefront</span>
            Browse Courses
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            View Website
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 bg-charcoal text-white px-4 py-3 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <span className="font-[Montserrat] font-bold text-sm uppercase tracking-tighter">
            AAME
          </span>
          <span className="text-primary text-[8px] uppercase tracking-widest font-semibold">
            Student
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-charcoal font-bold text-[10px]">{initials}</span>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
