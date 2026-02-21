"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type SimpleCourse = { id: string; num: string; title: string };

const SKIP_WORDS = new Set([
  "the", "a", "an", "of", "for", "and", "or", "deal", "offer",
  "special", "savings", "discount", "promo", "access", "reward",
  "bonus", "limited", "exclusive", "premium", "introducing",
  "celebrate", "welcome", "save", "refer",
]);

function deriveCode(fromName: string, fromValue: string): string {
  const words = fromName
    .replace(/[^a-zA-Z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1);
  const keyword =
    words.find((w) => !SKIP_WORDS.has(w.toLowerCase())) || words[0] || "AAME";
  const num = parseFloat(fromValue);
  const numStr = num && num > 0 ? String(Math.round(num)) : "";
  return `${keyword.toUpperCase()}${numStr}`.slice(0, 10);
}

export default function EditDiscountPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Coupon fields
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");

  // Course linking
  const [courses, setCourses] = useState<SimpleCourse[]>([]);
  const [allCourses, setAllCourses] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [courseListOpen, setCourseListOpen] = useState(true);
  const codeEdited = useRef(false);
  const courseListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/go1000/coupons").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()).catch(() => []),
      fetch("/api/specials").then((r) => r.json()).catch(() => ({ specials: [] })),
    ])
      .then(([couponData, courseData, specialsData]) => {
        const coupons = couponData.coupons || couponData.data || [];
        const coupon = coupons.find((c: { _id: string }) => c._id === id);

        if (!coupon) {
          setError("Coupon not found");
          setLoading(false);
          return;
        }

        setName(coupon.name || "");
        setCode(coupon.code || "");
        setOriginalCode(coupon.code || "");
        setDiscountType(coupon.discountType || "percentage");
        setDiscountValue(String(coupon.discountValue || ""));
        setMaxRedemptions(coupon.maxRedemptions ? String(coupon.maxRedemptions) : "");

        if (coupon.startDate) {
          setStartDate(new Date(coupon.startDate).toISOString().split("T")[0]);
        }
        if (coupon.endDate) {
          setEndDate(new Date(coupon.endDate).toISOString().split("T")[0]);
        }

        setCourses(courseData);

        const special = (specialsData.specials || []).find(
          (s: { coupon_code: string }) => s.coupon_code === coupon.code?.toUpperCase()
        );
        if (special && special.course_ids && special.course_ids.length > 0) {
          setAllCourses(false);
          setSelectedIds(new Set(special.course_ids));
        }

        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load coupon data");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        courseListRef.current &&
        !courseListRef.current.contains(e.target as Node) &&
        selectedIds.size > 0
      ) {
        setCourseListOpen(false);
      }
    }
    if (!allCourses && courseListOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [allCourses, courseListOpen, selectedIds.size]);

  function toggleCourse(courseId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  }

  const selectedCourseNames = courses
    .filter((c) => selectedIds.has(c.id))
    .map((c) => c.title);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const courseIds = allCourses ? [] : Array.from(selectedIds);

    const body: Record<string, unknown> = {
      name,
      code: code.toUpperCase(),
      oldCouponCode: originalCode,
      discountType,
      discountValue: parseFloat(discountValue),
      startDate: startDate ? new Date(startDate + "T00:00:00").toISOString() : new Date().toISOString(),
      courseIds,
    };

    if (endDate) {
      body.endDate = new Date(endDate + "T23:59:59").toISOString();
    }
    if (maxRedemptions) {
      body.maxRedemptions = parseInt(maxRedemptions) || undefined;
    }

    const res = await fetch(`/api/go1000/coupons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to update coupon");
      setSaving(false);
      return;
    }

    router.push("/admin/discounts");
    router.refresh();
  }

  const OCCASIONS = [
    { label: "Flash Sale", icon: "bolt", templates: ["{topic} Flash Deal", "{topic} — Limited Flash Offer", "Flash: {topic} Savings", "{topic} Blitz Sale"] },
    { label: "Seasonal", icon: "eco", templates: ["{topic} {season} Special", "{season} {topic} Promo", "{topic} — {season} Savings", "{season} {topic} Deal"] },
    { label: "Student", icon: "school", templates: ["New Student {topic} Offer", "{topic} Student Starter", "Welcome: {topic} Discount", "{topic} — First-Time Student"] },
    { label: "Referral", icon: "group_add", templates: ["{topic} Referral Reward", "Refer & Save: {topic}", "{topic} Friend Bonus", "{topic} — Share & Save"] },
    { label: "Holiday", icon: "celebration", templates: ["{topic} Holiday Special", "Holiday {topic} Savings", "{topic} — Festive Deal", "Celebrate: {topic} Discount"] },
    { label: "Launch", icon: "rocket_launch", templates: ["{topic} Grand Launch", "Introducing: {topic} Deal", "{topic} — Launch Promo", "New: {topic} Special"] },
    { label: "VIP", icon: "workspace_premium", templates: ["VIP {topic} Access", "{topic} Exclusive Offer", "{topic} — VIP Only", "Premium: {topic} Deal"] },
    { label: "Bundle", icon: "inventory_2", templates: ["{topic} Bundle Deal", "{topic} Package Special", "Bundle: {topic} Savings", "{topic} — Combo Offer"] },
  ] as const;

  function getSeason(): string {
    const m = new Date().getMonth();
    if (m >= 2 && m <= 4) return "Spring";
    if (m >= 5 && m <= 7) return "Summer";
    if (m >= 8 && m <= 10) return "Fall";
    return "Winter";
  }

  function buildName(occasion: typeof OCCASIONS[number]) {
    const templates = occasion.templates;
    const template = templates[Math.floor(Math.random() * templates.length)];
    let topic = name.trim();
    if (topic.includes(" — ")) topic = "";
    if (topic.includes(":")) topic = "";
    if (!topic) {
      if (allCourses) {
        topic = "AAME";
      } else if (selectedIds.size === 1) {
        const full = selectedCourseNames[0] || "Course";
        topic = full.split(" ").slice(0, 3).join(" ");
      } else if (selectedIds.size > 1) {
        topic = `${selectedIds.size}-Course`;
      } else {
        topic = "AAME";
      }
    }
    const season = getSeason();
    return template.replace("{topic}", topic).replace("{season}", season);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/discounts" className="text-gray-400 hover:text-charcoal transition-colors shrink-0">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">Edit Discount</h1>
          <p className="text-gray-500 text-sm mt-1">Update coupon details and course assignments</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm break-words">{error}</div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-gray-200 p-4 sm:p-8 space-y-6">

        {/* Step 1: Course(s) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-charcoal text-white text-xs font-bold w-5 h-5 flex items-center justify-center">1</span>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Which course(s)?
            </label>
          </div>

          <label className="flex items-center gap-2 cursor-pointer px-4 py-3 border-2 transition-colors mb-2 border-primary bg-primary/5">
            <input
              type="checkbox"
              checked={allCourses}
              onChange={() => { setAllCourses(!allCourses); setCourseListOpen(true); }}
              className="accent-primary w-4 h-4"
            />
            <span className="material-symbols-outlined text-primary text-lg">select_all</span>
            <span className="text-sm font-bold">All Courses</span>
            <span className="text-xs text-gray-400 ml-auto">General coupon</span>
          </label>

          {!allCourses && (
            <div ref={courseListRef}>
              {!courseListOpen && selectedIds.size > 0 ? (
                <button
                  type="button"
                  onClick={() => setCourseListOpen(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 border border-gray-200 hover:border-primary transition-colors cursor-pointer text-left"
                >
                  <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                  <span className="text-sm font-medium">
                    {selectedIds.size} course{selectedIds.size > 1 ? "s" : ""} selected
                  </span>
                  <span className="text-xs text-gray-400 truncate flex-1">
                    {selectedCourseNames.join(", ")}
                  </span>
                  <span className="material-symbols-outlined text-gray-400 text-sm">edit</span>
                </button>
              ) : (
                <div className="border border-gray-200 max-h-52 overflow-y-auto">
                  {courses.length === 0 ? (
                    <p className="text-gray-400 text-xs text-center py-4">Loading courses...</p>
                  ) : (
                    courses.map((c) => (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                          selectedIds.has(c.id) ? "bg-primary/5" : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleCourse(c.id)}
                          className="accent-primary w-3.5 h-3.5"
                        />
                        <span className="text-primary font-bold text-xs w-6">{c.num}</span>
                        <span className="text-sm">{c.title}</span>
                      </label>
                    ))
                  )}
                </div>
              )}

              {courseListOpen && selectedIds.size === 0 && (
                <p className="text-amber-600 text-xs mt-1.5">Select at least one course.</p>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Discount details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-charcoal text-white text-xs font-bold w-5 h-5 flex items-center justify-center">2</span>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Discount details
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Coupon Name</label>
              <input
                required
                value={name}
                onChange={(e) => { setName(e.target.value); codeEdited.current = false; }}
                placeholder="Type your own or pick an occasion below"
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
              />

              <div className="mt-3">
                <p className="text-[11px] text-gray-500 mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">auto_awesome</span>
                  What&apos;s the occasion? Pick one to generate a name:
                </p>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5">
                  {OCCASIONS.map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      onClick={() => { setName(buildName(o)); codeEdited.current = false; }}
                      className="inline-flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-200 text-xs text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">{o.icon}</span>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Value</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="10"
                  value={discountValue}
                  onChange={(e) => { setDiscountValue(e.target.value); codeEdited.current = false; }}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Start Date</label>
                <input
                  required
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">
                  End Date <span className="text-gray-400">(optional — auto-expires)</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Max Redemptions <span className="text-gray-400">(leave empty for unlimited)</span>
              </label>
              <input
                type="number"
                placeholder="Unlimited"
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Coupon Code */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-charcoal text-white text-xs font-bold w-5 h-5 flex items-center justify-center">3</span>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Coupon Code
            </label>
          </div>

          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => { codeEdited.current = true; setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)); }}
              maxLength={10}
              className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary uppercase font-mono text-base sm:text-lg tracking-wider sm:tracking-widest font-bold text-primary"
            />
            <button
              type="button"
              onClick={() => { codeEdited.current = false; setCode(deriveCode(name, discountValue)); }}
              className="px-3 sm:px-4 py-3 border border-gray-200 hover:border-primary transition-colors cursor-pointer flex items-center gap-1 sm:gap-1.5 text-gray-500 hover:text-charcoal shrink-0"
              title="Re-generate from name & value"
            >
              <span className="material-symbols-outlined text-lg">autorenew</span>
              <span className="text-xs font-medium hidden sm:inline">Reset</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">You can edit the code manually or regenerate it.</p>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || (!allCourses && selectedIds.size === 0) || !code}
            className="w-full sm:w-auto bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer text-center"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/discounts" className="w-full sm:w-auto border border-gray-300 text-gray-600 font-bold uppercase text-xs tracking-widest px-8 py-3 hover:border-charcoal transition-colors text-center block">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
