"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CourseActions({
  courseId,
  courseTitle,
  active,
}: {
  courseId: string;
  courseTitle: string;
  active: boolean;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Are you sure you want to ${active ? "deactivate" : "reactivate"} "${courseTitle}"?`)) return;

    const res = await fetch(`/api/courses/${courseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });

    if (res.ok) {
      router.refresh();
    }
  }

  async function handlePermanentDelete() {
    if (!confirm(`PERMANENTLY delete "${courseTitle}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/courses/${courseId}/edit`}
        className="text-gray-400 hover:text-primary transition-colors"
        title="Edit"
      >
        <span className="material-symbols-outlined text-lg">edit</span>
      </Link>
      <button
        onClick={handleDelete}
        className="text-gray-400 hover:text-amber-500 transition-colors cursor-pointer"
        title={active ? "Deactivate" : "Reactivate"}
      >
        <span className="material-symbols-outlined text-lg">
          {active ? "visibility_off" : "visibility"}
        </span>
      </button>
      <button
        onClick={handlePermanentDelete}
        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        title="Delete permanently"
      >
        <span className="material-symbols-outlined text-lg">delete</span>
      </button>
    </div>
  );
}
