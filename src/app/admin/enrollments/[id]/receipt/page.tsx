"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Enrollment, Course } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/browser";

export default function ReceiptPage() {
  const params = useParams();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("enrollments")
      .select("*")
      .eq("id", params.id)
      .single()
      .then(async ({ data }) => {
        setEnrollment(data);
        if (data?.course_id) {
          const { data: c } = await supabase
            .from("courses")
            .select("*")
            .eq("id", data.course_id)
            .single();
          setCourse(c);
        }
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

  const courseName = course ? `${course.num} — ${course.title}` : "Course";
  const isPaid = enrollment.status === "paid";

  return (
    <div className="max-w-2xl mx-auto">
      {/* Print / Back buttons - hidden when printing */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link
          href={`/admin/enrollments/${params.id}`}
          className="text-gray-400 hover:text-charcoal transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-charcoal text-white font-bold uppercase text-xs tracking-widest px-5 py-2.5 hover:bg-charcoal/80 transition-colors cursor-pointer flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">print</span>
          Print Receipt
        </button>
      </div>

      {/* Receipt */}
      <div className="bg-white border border-gray-200 print:border-none print:shadow-none">
        {/* Header */}
        <div className="bg-charcoal text-white p-8 print:bg-white print:text-charcoal print:border-b-2 print:border-charcoal">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-[Montserrat] font-black uppercase tracking-tighter">
                AAME
              </h1>
              <p className="text-xs text-gray-400 print:text-gray-500 mt-0.5">
                American Academy of Medical Esthetics
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-[Montserrat] font-bold uppercase">
                {isPaid ? "Receipt" : "Invoice"}
              </p>
              {enrollment.receipt_number && (
                <p className="text-sm font-mono text-primary print:text-charcoal mt-1">
                  {enrollment.receipt_number}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status banner */}
        <div
          className={`px-8 py-3 text-center text-xs font-bold uppercase tracking-widest ${
            isPaid
              ? "bg-emerald-50 text-emerald-700 print:bg-white print:text-emerald-700 print:border-b"
              : "bg-amber-50 text-amber-700 print:bg-white print:text-amber-700 print:border-b"
          }`}
        >
          {isPaid ? "Payment Confirmed" : `Status: ${enrollment.status.replace("_", " ")}`}
        </div>

        <div className="p-8 space-y-6">
          {/* Date & Method */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Date
              </p>
              <p className="text-sm">
                {new Date(enrollment.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Payment Method
              </p>
              <p className="text-sm uppercase">{enrollment.payment_method}</p>
            </div>
          </div>

          {/* Student Info */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Student
            </p>
            <p className="font-semibold">{enrollment.student_name}</p>
            <p className="text-sm text-gray-500">{enrollment.student_email}</p>
            {enrollment.student_phone && (
              <p className="text-sm text-gray-500">{enrollment.student_phone}</p>
            )}
          </div>

          {/* Course Line Item */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Course
            </p>
            <div className="border border-gray-200 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{courseName}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase">
                    {enrollment.modality === "online" ? "Online" : "In-Person"}
                  </p>
                </div>
                <p className="font-bold text-lg">
                  ${(enrollment.total_amount_cents / 100).toFixed(2)}
                </p>
              </div>
              {enrollment.discount_code && (
                <p className="text-xs text-primary mt-2">
                  Discount applied: {enrollment.discount_code}
                </p>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t-2 border-charcoal pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-medium">
                ${(enrollment.total_amount_cents / 100).toFixed(2)}
              </span>
            </div>
            {enrollment.deposit_amount_cents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Deposit</span>
                <span>
                  ${(enrollment.deposit_amount_cents / 100).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-primary">
              <span>Amount Paid</span>
              <span>
                ${(enrollment.amount_paid_cents / 100).toFixed(2)}
              </span>
            </div>
            {enrollment.total_amount_cents - enrollment.amount_paid_cents > 0 && (
              <div className="flex justify-between text-sm font-bold text-red-500">
                <span>Balance Due</span>
                <span>
                  $
                  {(
                    (enrollment.total_amount_cents -
                      enrollment.amount_paid_cents) /
                    100
                  ).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Access Code */}
          {enrollment.access_code && isPaid && (
            <div className="bg-primary/10 p-4 text-center">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Your Access Code
              </p>
              <p className="text-2xl font-mono font-black text-primary tracking-wider">
                {enrollment.access_code}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              American Academy of Medical Esthetics
            </p>
            <p className="text-xs text-gray-400">
              aame0edu@gmail.com | (713) 927-5300
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Thank you for your enrollment!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
