"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ScheduleActions({
  sessionId,
  courseName,
}: {
  sessionId: string;
  courseName: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete the "${courseName}" session? This cannot be undone.`)) return;

    const res = await fetch(`/api/schedule/${sessionId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/schedule/${sessionId}/edit`}
        className="text-gray-400 hover:text-primary transition-colors"
        title="Edit"
      >
        <span className="material-symbols-outlined text-lg">edit</span>
      </Link>
      <button
        onClick={handleDelete}
        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        title="Delete"
      >
        <span className="material-symbols-outlined text-lg">delete</span>
      </button>
    </div>
  );
}
