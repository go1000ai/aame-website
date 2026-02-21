"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Course } from "@/lib/supabase/types";

export default function NewSchedulePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then(setCourses);
  }, []);

  function handleCourseSelect(courseId: string) {
    const c = courses.find((c) => c.id === courseId) || null;
    setSelectedCourse(c);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const body = {
      course_id: form.get("course_id") || null,
      course_name: form.get("course_name"),
      date: form.get("date"),
      time: form.get("time"),
      location: form.get("location"),
      instructor: form.get("instructor"),
      spots_total: parseInt(form.get("spots_total") as string) || 12,
      spots_available: parseInt(form.get("spots_available") as string) || 12,
      status: form.get("status"),
      price: form.get("price_regular_display"),
      price_regular_display: form.get("price_regular_display"),
      price_discount_display: form.get("price_discount_display"),
      category: form.get("category"),
    };

    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create session");
      setSaving(false);
      return;
    }

    router.push("/admin/schedule");
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/schedule" className="text-gray-400 hover:text-charcoal transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-[Montserrat] font-bold text-charcoal">Add Session</h1>
          <p className="text-gray-500 text-sm mt-1">Schedule a new course session</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Select Course (optional — auto-fills fields)
          </label>
          <select
            name="course_id"
            onChange={(e) => handleCourseSelect(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">— Custom session —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.num} — {c.title} ({c.category})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Course Name</label>
            <input
              name="course_name"
              required
              defaultValue={selectedCourse?.title || ""}
              key={selectedCourse?.id || "empty"}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
            <input
              name="category"
              required
              defaultValue={selectedCourse?.category || ""}
              key={(selectedCourse?.id || "empty") + "-cat"}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Date</label>
            <input name="date" required type="date" className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Time</label>
            <input name="time" required placeholder="10:00 AM - 5:00 PM" defaultValue="10:00 AM - 5:00 PM" className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location</label>
            <input name="location" required defaultValue="AAME Training Center, Houston TX" className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Instructor</label>
            <input name="instructor" required defaultValue="Strani Mayorga" className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Spots</label>
            <input name="spots_total" type="number" required defaultValue={12} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available Spots</label>
            <input name="spots_available" type="number" required defaultValue={12} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <select name="status" className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary">
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
            <input
              name="price_regular_display"
              required
              placeholder="$1,150"
              defaultValue={selectedCourse?.price_regular_display || ""}
              key={(selectedCourse?.id || "empty") + "-pr"}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Discount Price (with $200 reservation)</label>
            <input
              name="price_discount_display"
              placeholder="$950"
              defaultValue={selectedCourse?.price_discount_display || ""}
              key={(selectedCourse?.id || "empty") + "-pd"}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving} className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer">
            {saving ? "Saving..." : "Create Session"}
          </button>
          <Link href="/admin/schedule" className="border border-gray-300 text-gray-600 font-bold uppercase text-xs tracking-widest px-8 py-3 hover:border-charcoal transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
