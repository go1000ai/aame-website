"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminSearch from "@/components/admin/AdminSearch";
import { createClient } from "@/lib/supabase/browser";
import type { Special } from "@/lib/supabase/types";

type SimpleCourse = { id: string; num: string; title: string };

export default function AdminDiscountsPage() {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [courses, setCourses] = useState<SimpleCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return specials;
    const q = search.toLowerCase();
    return specials.filter(
      (s) =>
        s.coupon_name.toLowerCase().includes(q) ||
        s.coupon_code.toLowerCase().includes(q)
    );
  }, [specials, search]);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("specials").select("*").order("created_at", { ascending: false }),
      fetch("/api/courses").then((r) => r.json()).catch(() => []),
    ]).then(([{ data }, courseData]) => {
      setSpecials(data || []);
      setCourses(courseData);
      setLoading(false);
    });
  }, []);

  function getLinkedCourseNames(courseIds: string[]): string {
    if (!courseIds || courseIds.length === 0) return "All Courses";
    return courseIds
      .map((id) => {
        const c = courses.find((course) => course.id === id);
        return c ? c.title : id;
      })
      .join(", ");
  }

  async function handleDelete(special: Special) {
    if (!confirm(`Delete discount "${special.coupon_name}"?`)) return;
    const supabase = createClient();
    await supabase.from("specials").delete().eq("id", special.id);
    setSpecials((prev) => prev.filter((s) => s.id !== special.id));
  }

  async function handleToggleActive(special: Special) {
    const supabase = createClient();
    const newActive = !special.active;
    await supabase.from("specials").update({ active: newActive }).eq("id", special.id);
    setSpecials((prev) =>
      prev.map((s) => (s.id === special.id ? { ...s, active: newActive } : s))
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">Discounts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage coupon codes and promotions</p>
        </div>
        <Link
          href="/admin/discounts/new"
          className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 hover:brightness-110 transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create Coupon
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : specials.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">sell</span>
          <p className="text-gray-400 font-medium">No coupons yet</p>
          <p className="text-gray-400 text-sm mt-1">Create your first discount code above.</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <AdminSearch value={search} onChange={setSearch} placeholder="Search by name or code..." />
          </div>

          {/* Desktop table */}
          <div className="bg-white border border-gray-200 overflow-hidden hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="bg-charcoal text-white text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-right">Discount</th>
                  <th className="px-4 py-3 text-left">Courses</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-sm">{s.coupon_name}</td>
                    <td className="px-4 py-3">
                      <code className="bg-gray-100 px-2 py-1 text-sm font-mono text-primary">
                        {s.coupon_code}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {s.discount_type === "percentage"
                        ? `${s.discount_value}%`
                        : `$${s.discount_value}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">
                      {getLinkedCourseNames(s.course_ids)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`text-[10px] font-bold uppercase px-2 py-1 cursor-pointer ${
                          s.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {s.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/discounts/${s.id}/edit`}
                          className="text-gray-400 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(s)}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filtered.map((s) => (
              <div key={s.id} className="bg-white border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{s.coupon_name}</h3>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                      onClick={() => handleToggleActive(s)}
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 cursor-pointer ${
                        s.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {s.active ? "Active" : "Off"}
                    </button>
                    <Link
                      href={`/admin/discounts/${s.id}/edit`}
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(s)}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <code className="bg-gray-100 px-2 py-1 text-sm font-mono text-primary">
                    {s.coupon_code}
                  </code>
                  <span className="text-sm font-medium">
                    {s.discount_type === "percentage"
                      ? `${s.discount_value}%`
                      : `$${s.discount_value}`}
                  </span>
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {getLinkedCourseNames(s.course_ids)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
