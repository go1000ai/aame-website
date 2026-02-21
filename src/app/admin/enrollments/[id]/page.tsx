"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Enrollment } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/browser";

export default function EnrollmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("enrollments")
      .select("*")
      .eq("id", params.id)
      .single()
      .then(({ data }) => {
        setEnrollment(data);
        setLoading(false);
      });
  }, [params.id]);

  async function updateStatus(newStatus: string) {
    const supabase = createClient();
    await supabase.from("enrollments").update({ status: newStatus }).eq("id", params.id);
    setEnrollment((prev) => (prev ? { ...prev, status: newStatus as Enrollment["status"] } : prev));
  }

  async function confirmPayment() {
    if (!enrollment) return;
    const supabase = createClient();
    await supabase
      .from("enrollments")
      .update({
        status: "paid",
        amount_paid_cents: enrollment.total_amount_cents,
      })
      .eq("id", params.id);
    setEnrollment((prev) =>
      prev ? { ...prev, status: "paid", amount_paid_cents: prev.total_amount_cents } : prev
    );
  }

  async function handleDelete() {
    if (!confirm("Delete this enrollment? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("enrollments").delete().eq("id", params.id);
    router.push("/admin/enrollments");
    router.refresh();
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!enrollment) return <p className="text-red-500">Enrollment not found</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/enrollments" className="text-gray-400 hover:text-charcoal transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-[Montserrat] font-bold text-charcoal">Enrollment Details</h1>
          <p className="text-gray-500 text-sm mt-1">{enrollment.student_name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/enrollments/${params.id}/receipt`}
            className="border border-gray-300 text-gray-600 font-bold uppercase text-xs tracking-widest px-5 py-2.5 hover:border-charcoal transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            Receipt
          </Link>
          <Link
            href={`/admin/enrollments/${params.id}/edit`}
            className="bg-charcoal text-white font-bold uppercase text-xs tracking-widest px-5 py-2.5 hover:bg-charcoal/80 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            Edit
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Student</p>
            <p className="font-semibold">{enrollment.student_name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
            <p>{enrollment.student_email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</p>
            <p>{enrollment.student_phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Modality</p>
            <p className="uppercase">{enrollment.modality}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
            <p className="uppercase">{enrollment.payment_method}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</p>
            <p className="uppercase font-bold text-primary">{enrollment.status}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
            <p className="font-bold">${(enrollment.total_amount_cents / 100).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Amount Paid</p>
            <p className="font-bold text-primary">${(enrollment.amount_paid_cents / 100).toFixed(2)}</p>
          </div>
          {enrollment.discount_code && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Discount Code</p>
              <code className="bg-gray-100 px-2 py-1 font-mono text-sm">{enrollment.discount_code}</code>
            </div>
          )}
          {enrollment.access_code && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Access Code</p>
              <code className="bg-primary/10 px-2 py-1 font-mono text-sm text-primary">{enrollment.access_code}</code>
            </div>
          )}
          {enrollment.receipt_number && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Receipt Number</p>
              <code className="bg-violet-100 px-2 py-1 font-mono text-sm text-violet-700">{enrollment.receipt_number}</code>
            </div>
          )}
          {enrollment.ghl_order_id && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">GHL Order ID</p>
              <code className="bg-gray-100 px-2 py-1 font-mono text-xs">{enrollment.ghl_order_id}</code>
            </div>
          )}
          {enrollment.square_order_id && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Square Order ID</p>
              <code className="bg-gray-100 px-2 py-1 font-mono text-xs">{enrollment.square_order_id}</code>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Attendance</p>
            <p className={`font-bold uppercase ${enrollment.attended === true ? "text-emerald-500" : enrollment.attended === false ? "text-red-500" : "text-gray-400"}`}>
              {enrollment.attended === true ? "Attended" : enrollment.attended === false ? "No-Show" : "Pending"}
            </p>
          </div>
          {enrollment.notes && (
            <div className="col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-gray-600">{enrollment.notes}</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Actions</p>
          <div className="flex flex-wrap gap-3">
            {enrollment.status !== "paid" && (
              <button
                onClick={confirmPayment}
                className="bg-emerald-500 text-white font-bold uppercase text-xs tracking-widest px-6 py-2.5 hover:bg-emerald-600 transition-colors cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">check</span>
                Confirm Full Payment
              </button>
            )}
            {enrollment.status === "pending" && (
              <button
                onClick={() => updateStatus("deposit_paid")}
                className="bg-blue-500 text-white font-bold uppercase text-xs tracking-widest px-6 py-2.5 hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Mark Deposit Paid
              </button>
            )}
            {enrollment.status !== "cancelled" && (
              <button
                onClick={() => updateStatus("cancelled")}
                className="border border-red-300 text-red-500 font-bold uppercase text-xs tracking-widest px-6 py-2.5 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleDelete}
              className="border border-gray-300 text-gray-500 font-bold uppercase text-xs tracking-widest px-6 py-2.5 hover:border-red-300 hover:text-red-500 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
