"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminSearch from "@/components/admin/AdminSearch";

type Coupon = {
  _id: string;
  name: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxRedemptions?: number;
};

type SpecialMapping = { coupon_code: string; course_ids: string[] };
type SimpleCourse = { id: string; num: string; title: string };

export default function AdminDiscountsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [specials, setSpecials] = useState<SpecialMapping[]>([]);
  const [courses, setCourses] = useState<SimpleCourse[]>([]);

  const filtered = useMemo(() => {
    if (!search) return coupons;
    const q = search.toLowerCase();
    return coupons.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [coupons, search]);

  useEffect(() => {
    Promise.all([
      fetch("/api/go1000/coupons").then((r) => {
        if (!r.ok) throw new Error("Failed to load coupons");
        return r.json();
      }),
      fetch("/api/courses").then((r) => r.json()).catch(() => []),
      fetch("/api/specials").then((r) => r.json()).catch(() => ({ specials: [] })),
    ])
      .then(([couponData, courseData, specialsData]) => {
        setCoupons(couponData.coupons || couponData.data || []);
        setCourses(courseData);
        setSpecials(
          (specialsData.specials || []).map((s: SpecialMapping) => ({
            coupon_code: s.coupon_code,
            course_ids: s.course_ids || [],
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function getLinkedCourseNames(code: string): string {
    const s = specials.find((sp) => sp.coupon_code === code.toUpperCase());
    const ids = s?.course_ids || [];
    if (ids.length === 0) return "All";
    return ids
      .map((id) => {
        const c = courses.find((course) => course.id === id);
        return c ? c.title : id;
      })
      .join(", ");
  }

  async function handleDelete(couponId: string, name: string, code: string) {
    if (!confirm(`Delete coupon "${name}"?`)) return;

    try {
      const res = await fetch(`/api/go1000/coupons/${couponId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ couponCode: code }),
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to delete coupon (${res.status})`);
      }
    } catch {
      setError("Failed to delete coupon");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">Discounts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage coupon codes via Go1000.ai
          </p>
        </div>
        <Link
          href="/admin/discounts/new"
          className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 hover:brightness-110 transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create Coupon
        </Link>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 mb-6 text-sm">
          {error === "Go1000.ai not configured"
            ? "Go1000.ai is not configured. Add GO1000_API_TOKEN and GO1000_LOCATION_ID to your .env.local file."
            : error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : coupons.length === 0 ? (
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
                <th className="px-4 py-3 text-center">Max Uses</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((coupon) => (
                <tr key={coupon._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-sm">{coupon.name}</td>
                  <td className="px-4 py-3">
                    <code className="bg-gray-100 px-2 py-1 text-sm font-mono text-primary">
                      {coupon.code}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `$${coupon.discountValue}`}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[180px] truncate">
                    {getLinkedCourseNames(coupon.code)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-gray-500">
                    {coupon.maxRedemptions || "Unlimited"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/discounts/${coupon._id}/edit`}
                        className="text-gray-400 hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(coupon._id, coupon.name, coupon.code)}
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
          {filtered.map((coupon) => (
            <div key={coupon._id} className="bg-white border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{coupon.name}</h3>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Link
                    href={`/admin/discounts/${coupon._id}/edit`}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(coupon._id, coupon.name, coupon.code)}
                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <code className="bg-gray-100 px-2 py-1 text-sm font-mono text-primary">
                  {coupon.code}
                </code>
                <span className="text-sm font-medium">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : `$${coupon.discountValue}`}
                </span>
              </div>
              <div className="text-xs text-gray-500 truncate">
                {getLinkedCourseNames(coupon.code)}
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
