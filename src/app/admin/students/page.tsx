"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminSearch from "@/components/admin/AdminSearch";

type Student = {
  student_name: string;
  student_email: string;
  student_phone: string;
  enrollment_count: number;
  total_paid_cents: number;
  courses: string[];
  last_enrollment: string;
  statuses: string[];
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((data) => {
        setStudents(data);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.student_name.toLowerCase().includes(q) ||
        s.student_email.toLowerCase().includes(q) ||
        s.student_phone.includes(q)
    );
  }, [students, search]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">
            Students
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {students.length} student{students.length !== 1 ? "s" : ""} enrolled
          </p>
        </div>
        <Link
          href="/admin/enrollments/new"
          className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-5 py-2.5 hover:brightness-110 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Student
        </Link>
      </div>

      <div className="mb-4">
        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or phone..."
        />
      </div>

      {students.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">
            person
          </span>
          <p className="text-gray-400 font-medium">No students yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Students will appear here when they enroll in courses.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 px-4 py-8 text-center text-gray-400 text-sm">
          No students match your search.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="bg-white border border-gray-200 overflow-hidden hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-charcoal text-white text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-center">Courses</th>
                    <th className="px-4 py-3 text-right">Total Paid</th>
                    <th className="px-4 py-3 text-left">Last Enrolled</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.student_email}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-semibold text-sm">
                        {s.student_name}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {s.student_email}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {s.student_phone || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5">
                          {s.enrollment_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-primary">
                        ${(s.total_paid_cents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(s.last_enrollment).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/students/${encodeURIComponent(s.student_email)}`}
                          className="text-gray-400 hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            visibility
                          </span>
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
            {filtered.map((s) => (
              <Link
                key={s.student_email}
                href={`/admin/students/${encodeURIComponent(s.student_email)}`}
                className="block bg-white border border-gray-200 p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{s.student_name}</h3>
                    <p className="text-xs text-gray-500 truncate">
                      {s.student_email}
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 shrink-0 ml-2">
                    {s.enrollment_count} course
                    {s.enrollment_count !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>
                    Paid:{" "}
                    <span className="font-medium text-primary">
                      ${(s.total_paid_cents / 100).toFixed(2)}
                    </span>
                  </span>
                  <span>
                    {new Date(s.last_enrollment).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
