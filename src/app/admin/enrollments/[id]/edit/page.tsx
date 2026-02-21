"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Course, CourseSchedule, Enrollment } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/browser";

export default function EditEnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase
        .from("enrollments")
        .select("*")
        .eq("id", params.id)
        .single()
        .then(({ data }) => data),
      fetch("/api/courses").then((r) => r.json()),
      supabase
        .from("course_schedule")
        .select("*")
        .order("date", { ascending: true })
        .then(({ data }) => data || []),
    ]).then(([enr, coursesData, schedData]) => {
      setEnrollment(enr);
      setCourses(coursesData || []);
      setSchedules(schedData);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!enrollment) return <p className="text-red-500">Enrollment not found</p>;

  const filteredSchedules = enrollment.course_id
    ? schedules.filter(
        (s) => s.course_id === enrollment.course_id || !s.course_id
      )
    : schedules;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);

    const body = {
      student_name: form.get("student_name"),
      student_email: form.get("student_email"),
      student_phone: form.get("student_phone"),
      course_id: form.get("course_id") || null,
      course_schedule_id: form.get("course_schedule_id") || null,
      modality: form.get("modality"),
      payment_method: form.get("payment_method"),
      discount_code: form.get("discount_code") || null,
      total_amount_cents:
        Math.round(parseFloat(form.get("total_amount") as string) * 100) || 0,
      deposit_amount_cents:
        Math.round(parseFloat(form.get("deposit_amount") as string) * 100) || 0,
      amount_paid_cents:
        Math.round(parseFloat(form.get("amount_paid") as string) * 100) || 0,
      status: form.get("status"),
      access_code: form.get("access_code"),
      notes: form.get("notes") || "",
    };

    const res = await fetch(`/api/admin/enrollments/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update enrollment");
      setSaving(false);
      return;
    }

    router.push(`/admin/enrollments/${params.id}`);
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/admin/enrollments/${params.id}`}
          className="text-gray-400 hover:text-charcoal transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-[Montserrat] font-bold text-charcoal">
            Edit Enrollment
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {enrollment.student_name}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 p-8 space-y-6"
      >
        {/* Student Info */}
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2">
          Student Information
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Full Name *
            </label>
            <input
              name="student_name"
              required
              defaultValue={enrollment.student_name}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Email *
            </label>
            <input
              name="student_email"
              type="email"
              required
              defaultValue={enrollment.student_email}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Phone
            </label>
            <input
              name="student_phone"
              defaultValue={enrollment.student_phone}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Access Code
            </label>
            <input
              name="access_code"
              defaultValue={enrollment.access_code || ""}
              className="w-full px-4 py-3 border border-gray-200 text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Course */}
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2 pt-2">
          Course
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Course
            </label>
            <select
              name="course_id"
              defaultValue={enrollment.course_id || ""}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">— No course —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.num} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Schedule Session
            </label>
            <select
              name="course_schedule_id"
              defaultValue={enrollment.course_schedule_id || ""}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">— No specific session —</option>
              {filteredSchedules.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.course_name} — {s.date}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Modality
            </label>
            <select
              name="modality"
              defaultValue={enrollment.modality}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            >
              <option value="inperson">In-Person</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>

        {/* Payment */}
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-2 pt-2">
          Payment
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <select
              name="payment_method"
              defaultValue={enrollment.payment_method}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            >
              <option value="square">Square</option>
              <option value="stripe">Stripe</option>
              <option value="zelle">Zelle</option>
              <option value="cherry">Cherry</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Status
            </label>
            <select
              name="status"
              defaultValue={enrollment.status}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            >
              <option value="pending">Pending</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Total Amount ($)
            </label>
            <input
              name="total_amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(enrollment.total_amount_cents / 100).toFixed(2)}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Deposit Amount ($)
            </label>
            <input
              name="deposit_amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(enrollment.deposit_amount_cents / 100).toFixed(2)}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Amount Paid ($)
            </label>
            <input
              name="amount_paid"
              type="number"
              step="0.01"
              min="0"
              defaultValue={(enrollment.amount_paid_cents / 100).toFixed(2)}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Discount Code
            </label>
            <input
              name="discount_code"
              defaultValue={enrollment.discount_code || ""}
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={enrollment.notes || ""}
            className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href={`/admin/enrollments/${params.id}`}
            className="border border-gray-300 text-gray-600 font-bold uppercase text-xs tracking-widest px-8 py-3 hover:border-charcoal transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
