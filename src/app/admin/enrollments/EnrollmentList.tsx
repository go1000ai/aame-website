"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AdminSearch from "@/components/admin/AdminSearch";
import type { Enrollment } from "@/lib/supabase/types";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  deposit_paid: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function EnrollmentList({ enrollments }: { enrollments: Enrollment[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return enrollments;
    const q = search.toLowerCase();
    return enrollments.filter(
      (e) =>
        e.student_name.toLowerCase().includes(q) ||
        e.student_email.toLowerCase().includes(q) ||
        e.payment_method.toLowerCase().includes(q) ||
        e.status.toLowerCase().includes(q) ||
        e.modality.toLowerCase().includes(q) ||
        (e.receipt_number && e.receipt_number.toLowerCase().includes(q)) ||
        (e.access_code && e.access_code.toLowerCase().includes(q))
    );
  }, [enrollments, search]);

  if (enrollments.length === 0) {
    return (
      <div className="bg-white border border-gray-200 p-12 text-center">
        <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">group</span>
        <p className="text-gray-400 font-medium">No enrollments yet</p>
        <p className="text-gray-400 text-sm mt-1">Enrollments will appear here when students sign up.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <AdminSearch value={search} onChange={setSearch} placeholder="Search by name, email, receipt #, status, or payment..." />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 px-4 py-8 text-center text-gray-400 text-sm">
          No enrollments match your search.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="bg-white border border-gray-200 overflow-hidden hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-charcoal text-white text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Modality</th>
                    <th className="px-4 py-3 text-left">Payment</th>
                    <th className="px-4 py-3 text-left">Receipt #</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-sm">{e.student_name}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{e.student_email}</td>
                      <td className="px-4 py-3 text-xs uppercase">{e.modality}</td>
                      <td className="px-4 py-3 text-xs uppercase">{e.payment_method}</td>
                      <td className="px-4 py-3 text-xs">
                        {e.receipt_number ? (
                          <code className="bg-violet-50 text-violet-700 px-1.5 py-0.5 font-mono">{e.receipt_number}</code>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 ${statusColors[e.status] || "bg-gray-100"}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        ${(e.total_amount_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-primary font-medium">
                        ${(e.amount_paid_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(e.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/enrollments/${e.id}`}
                          className="text-gray-400 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((e) => (
              <Link
                key={e.id}
                href={`/admin/enrollments/${e.id}`}
                className="block bg-white border border-gray-200 p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{e.student_name}</h3>
                    <p className="text-xs text-gray-500 truncate">{e.student_email}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 shrink-0 ml-2 ${statusColors[e.status] || "bg-gray-100"}`}>
                    {e.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
                  <span className="uppercase">{e.modality}</span>
                  <span className="uppercase">{e.payment_method}</span>
                  {e.receipt_number && (
                    <code className="bg-violet-50 text-violet-700 px-1.5 py-0.5 font-mono text-[10px]">{e.receipt_number}</code>
                  )}
                  <span>{new Date(e.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-gray-500">Total: <span className="font-medium text-charcoal">${(e.total_amount_cents / 100).toFixed(2)}</span></span>
                  <span className="text-gray-500">Paid: <span className="font-medium text-primary">${(e.amount_paid_cents / 100).toFixed(2)}</span></span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
