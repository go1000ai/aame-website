"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { CourseSchedule } from "@/lib/supabase/types";

export default function EditSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const [session, setSession] = useState<CourseSchedule | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/schedule/${params.id}`)
      .then((r) => r.json())
      .then((data) => { setSession(data); setLoading(false); })
      .catch(() => { setError("Session not found"); setLoading(false); });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const body = {
      course_name: form.get("course_name"),
      date: form.get("date"),
      time: form.get("time"),
      location: form.get("location"),
      instructor: form.get("instructor"),
      spots_total: parseInt(form.get("spots_total") as string),
      spots_available: parseInt(form.get("spots_available") as string),
      status: form.get("status"),
      price: form.get("price_regular_display"),
      price_regular_display: form.get("price_regular_display"),
      price_discount_display: form.get("price_discount_display"),
      category: form.get("category"),
    };

    const res = await fetch(`/api/schedule/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update session");
      setSaving(false);
      return;
    }

    router.push("/admin/schedule");
    router.refresh();
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!session) return <p className="text-red-500">Session not found</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/schedule" className="text-gray-400 hover:text-charcoal transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-[Montserrat] font-bold text-charcoal">Edit Session</h1>
          <p className="text-gray-500 text-sm mt-1">{session.course_name}</p>
        </div>
        <Link
          href={`/admin/schedule/${params.id}/attendance`}
          className="bg-charcoal text-white font-bold uppercase text-xs tracking-widest px-5 py-2.5 hover:bg-charcoal/80 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">fact_check</span>
          Attendance
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Course Name</label>
            <input name="course_name" required defaultValue={session.course_name} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
            <input name="category" required defaultValue={session.category} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
            <input name="date" required type="date" defaultValue={session.date} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Time</label>
            <input name="time" required defaultValue={session.time} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</label>
            <input name="location" required defaultValue={session.location} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Instructor</label>
            <input name="instructor" required defaultValue={session.instructor} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Spots</label>
            <input name="spots_total" type="number" required defaultValue={session.spots_total} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available Spots</label>
            <input name="spots_available" type="number" required defaultValue={session.spots_available} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <select name="status" defaultValue={session.status} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary">
              <option value="open">Open</option>
              <option value="filling">Filling</option>
              <option value="sold_out">Sold Out</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Regular Price</label>
            <input name="price_regular_display" required defaultValue={session.price_regular_display || session.price} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Discount Price</label>
            <input name="price_discount_display" defaultValue={session.price_discount_display} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving} className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/schedule" className="border border-gray-300 text-gray-600 font-bold uppercase text-xs tracking-widest px-8 py-3 hover:border-charcoal transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
