import { createClient } from "@/lib/supabase/server";
import { getStudentSession } from "@/lib/student-session";

export default async function StudentProfilePage() {
  const session = await getStudentSession();
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses:course_id(num, title, category)")
    .eq("student_email", session.email)
    .order("created_at", { ascending: false });

  const all = enrollments || [];
  const latest = all[0];
  const totalPaid = all.reduce((sum, e) => sum + e.amount_paid_cents, 0);
  const completed = all.filter((e) => e.attended === true).length;
  const earliest = all.length > 0
    ? all.reduce((min, e) => (e.created_at < min ? e.created_at : min), all[0].created_at)
    : "";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">
          Profile & Payments
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Your account information and payment history.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Student Info Card */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Student Information
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                Full Name
              </p>
              <p className="font-bold">{session.name}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                Email
              </p>
              <p className="text-sm">{session.email}</p>
            </div>
            {latest?.student_phone && (
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Phone
                </p>
                <p className="text-sm">{latest.student_phone}</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              To update your information, contact AAME
            </p>
            <a
              href="tel:+17139275300"
              className="text-primary text-xs font-bold hover:underline mt-1 inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              (713) 927-5300
            </a>
          </div>
        </div>

        {/* Account Summary */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6">
          <h2 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            Account Summary
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 text-center">
              <p className="text-2xl font-[Montserrat] font-black text-primary">
                {all.length}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                Total Courses
              </p>
            </div>
            <div className="bg-gray-50 p-4 text-center">
              <p className="text-2xl font-[Montserrat] font-black text-emerald-500">
                {completed}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                Completed
              </p>
            </div>
            <div className="bg-gray-50 p-4 text-center">
              <p className="text-2xl font-[Montserrat] font-black">
                ${(totalPaid / 100).toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                Total Invested
              </p>
            </div>
            <div className="bg-gray-50 p-4 text-center">
              <p className="text-2xl font-[Montserrat] font-black">
                {all.length > 0 ? Math.round((completed / all.length) * 100) : 0}%
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                Completion Rate
              </p>
            </div>
          </div>

          {earliest && (
            <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Member since{" "}
              {new Date(earliest).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            Payment History
          </h2>
        </div>

        {all.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">
              receipt_long
            </span>
            <p className="text-sm">No payment records yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left p-4 font-semibold">Course</th>
                  <th className="text-left p-4 font-semibold hidden sm:table-cell">Date</th>
                  <th className="text-left p-4 font-semibold hidden md:table-cell">Method</th>
                  <th className="text-right p-4 font-semibold">Amount</th>
                  <th className="text-center p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {all.map((enrollment) => {
                  const course = enrollment.courses;
                  const isPaid = enrollment.status === "paid";
                  const balanceDue =
                    enrollment.total_amount_cents - enrollment.amount_paid_cents;

                  return (
                    <tr key={enrollment.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <p className="font-medium">
                          {course
                            ? `${course.num} — ${course.title}`
                            : "Course"}
                        </p>
                        <p className="text-xs text-gray-400 sm:hidden">
                          {new Date(enrollment.created_at).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </p>
                      </td>
                      <td className="p-4 text-gray-500 hidden sm:table-cell">
                        {new Date(enrollment.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-xs uppercase font-bold text-gray-500">
                          {enrollment.payment_method}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-bold">
                          ${(enrollment.amount_paid_cents / 100).toFixed(2)}
                        </p>
                        {balanceDue > 0 && (
                          <p className="text-[10px] text-amber-600">
                            ${(balanceDue / 100).toFixed(2)} due
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-600"
                              : enrollment.status === "deposit_paid"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {enrollment.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
