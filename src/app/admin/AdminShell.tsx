"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/courses", label: "Courses", icon: "school" },
  { href: "/admin/schedule", label: "Schedule", icon: "calendar_month" },
  { href: "/admin/discounts", label: "Discounts", icon: "sell" },
  { href: "/admin/enrollments", label: "Enrollments", icon: "group" },
  { href: "/admin/students", label: "Students", icon: "person" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-[#f5f5f5]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-charcoal text-white flex flex-col shrink-0 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="bg-primary/10 p-2">
              <span className="material-symbols-outlined text-primary text-2xl">
                medical_services
              </span>
            </div>
            <div>
              <span className="font-[Montserrat] font-bold text-lg uppercase tracking-tighter">
                AAME
              </span>
              <p className="text-[8px] uppercase tracking-widest text-primary font-semibold">
                Admin Panel
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

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
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

        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 mb-3 truncate">{user.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Sign Out
          </button>
        </div>

        <div className="px-4 pb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            View Public Site
          </Link>
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
            Admin
          </span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
