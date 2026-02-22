"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { Course } from "@/lib/supabase/types";
import VideoUploader from "../../VideoUploader";

function formatPrice(cents: number): string {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Course not found");
        setLoading(false);
      });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const priceRegularCents = Math.round(parseFloat(form.get("price_regular") as string) * 100);
    const priceDiscountCents = Math.round(parseFloat(form.get("price_discount") as string) * 100);

    const body = {
      num: form.get("num"),
      title: form.get("title"),
      category: form.get("category"),
      price_regular_cents: priceRegularCents,
      price_regular_display: formatPrice(priceRegularCents),
      price_discount_cents: priceDiscountCents,
      price_discount_display: formatPrice(priceDiscountCents),
      reservation_deposit_cents: Math.round(parseFloat(form.get("deposit") as string || "200") * 100),
      featured: form.get("featured") === "on",
      description: form.get("description"),
      duration: form.get("duration"),
      has_inperson: form.get("has_inperson") === "on",
      has_online: form.get("has_online") === "on",
      image_url: form.get("image_url"),
      video_url: form.get("video_url"),
      active: form.get("active") === "on",
      sort_order: parseInt(form.get("sort_order") as string) || 0,
    };

    const res = await fetch(`/api/courses/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update course");
      setSaving(false);
      return;
    }

    router.push("/admin/courses");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return <p className="text-red-500">Course not found</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/courses" className="text-gray-400 hover:text-charcoal transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-[Montserrat] font-bold text-charcoal">Edit Course</h1>
          <p className="text-gray-500 text-sm mt-1">{course.title}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Course Number</label>
            <input name="num" required defaultValue={course.num} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sort Order</label>
            <input name="sort_order" type="number" defaultValue={course.sort_order} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title</label>
          <input name="title" required defaultValue={course.title} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
            <input name="category" required defaultValue={course.category} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Duration</label>
            <input name="duration" defaultValue={course.duration} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Regular Price ($)</label>
            <input name="price_regular" required type="number" step="0.01" defaultValue={course.price_regular_cents / 100} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Discount Price ($)</label>
            <input name="price_discount" required type="number" step="0.01" defaultValue={course.price_discount_cents / 100} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Deposit ($)</label>
            <input name="deposit" type="number" step="0.01" defaultValue={course.reservation_deposit_cents / 100} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</label>
          <textarea name="description" rows={3} defaultValue={course.description} className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary resize-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">image</span>
              Image URL
            </span>
          </label>
          <input name="image_url" type="url" defaultValue={course.image_url} placeholder="https://storage.googleapis.com/msgsndr/..." className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary" />
          <p className="text-xs text-gray-400 mt-1">Paste a direct link to the course image.</p>
        </div>

        <VideoUploader defaultValue={course.video_url} />

        {/* Payment is handled automatically via Square Checkout */}

        <div className="flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 border border-gray-200 hover:border-primary transition-colors">
            <input name="has_inperson" type="checkbox" defaultChecked={course.has_inperson} className="accent-primary w-4 h-4" />
            <span className="material-symbols-outlined text-emerald-500 text-lg">groups</span>
            <span className="text-sm font-medium">In-Person</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 border border-gray-200 hover:border-primary transition-colors">
            <input name="has_online" type="checkbox" defaultChecked={course.has_online} className="accent-primary w-4 h-4" />
            <span className="material-symbols-outlined text-blue-500 text-lg">laptop_mac</span>
            <span className="text-sm font-medium">Online</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 border-2 border-amber-300 bg-amber-50 hover:border-amber-400 transition-colors">
            <input name="featured" type="checkbox" defaultChecked={course.featured} className="accent-amber-500 w-4 h-4" />
            <span className="material-symbols-outlined text-amber-500 text-lg">star</span>
            <span className="text-sm font-bold text-amber-700">Featured (Best Value)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 border border-gray-200 hover:border-primary transition-colors">
            <input name="active" type="checkbox" defaultChecked={course.active} className="accent-primary w-4 h-4" />
            <span className="material-symbols-outlined text-emerald-500 text-lg">visibility</span>
            <span className="text-sm font-medium">Active</span>
          </label>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving} className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/courses" className="border border-gray-300 text-gray-600 font-bold uppercase text-xs tracking-widest px-8 py-3 hover:border-charcoal transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
