"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Course } from "@/lib/supabase/types";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

type SpecialInfo = {
  coupon_code: string;
  discount_type: string;
  discount_value: number;
};

type Props = {
  course: Course | null;
  special?: SpecialInfo | null;
  onClose: () => void;
};

export default function CourseDetailModal({ course, special, onClose }: Props) {
  const { t } = useLanguage();
  // Auto-select modality when only one option exists (skip Step 1)
  const hasBoth = course ? course.has_inperson && course.has_online : false;

  const [modality, setModality] = useState<"inperson" | "online" | null>(null);

  useEffect(() => {
    if (course && !course.has_inperson !== !course.has_online) {
      // Only one modality available — auto-select it
      setModality(course.has_inperson ? "inperson" : "online");
    } else {
      setModality(null);
    }
  }, [course?.id]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showZelleForm, setShowZelleForm] = useState(false);
  const [zelleLoading, setZelleLoading] = useState(false);

  if (!course) return null;

  // Compute promo price after coupon discount
  const promoPrice = (() => {
    if (!special) return null;
    const baseCents = course.price_discount_cents;
    let finalCents: number;
    if (special.discount_type === "percentage") {
      finalCents = Math.round(baseCents * (1 - special.discount_value / 100));
    } else {
      finalCents = Math.max(0, baseCents - special.discount_value * 100);
    }
    return `$${(finalCents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
  })();

  const handleClose = () => {
    setModality(null);
    onClose();
  };

  const handleBack = () => setModality(null);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-charcoal/70 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl z-10"
        >
          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 z-50 w-10 h-10 flex items-center justify-center bg-charcoal/10 hover:bg-charcoal/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="bg-charcoal text-white p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-primary font-black text-3xl">{course.num}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{course.category}</span>
              {course.featured && (
                <span className="bg-primary text-charcoal text-[10px] font-bold uppercase px-2 py-0.5 tracking-wider">
                  Best Value
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-[Montserrat] font-black uppercase">
              {course.title}
            </h2>
            {course.duration && (
              <p className="text-gray-400 text-sm mt-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">schedule</span>
                {course.duration}
              </p>
            )}
          </div>

          {/* Promo Banner */}
          {special && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-500 px-6 py-4 overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-white">
                  <span className="material-symbols-outlined text-2xl animate-pulse">auto_awesome</span>
                  <div>
                    <p className="font-black text-sm uppercase tracking-wider">{t("catalog.promoActive")}</p>
                    <p className="text-white/90 text-xs">
                      {t("catalog.useCode")}{" "}
                      <span className="font-mono font-black bg-white/20 px-2 py-0.5 tracking-wider text-sm">{special.coupon_code}</span>{" "}
                      {t("catalog.atCheckout")}{" "}
                      <span className="font-black text-sm">
                        {special.discount_type === "percentage" ? `${special.discount_value}%` : `$${special.discount_value}`}
                      </span>{" "}
                      {t("catalog.off")}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-white/40 text-3xl hidden sm:block">celebration</span>
              </div>
            </motion.div>
          )}

          {/* Body */}
          <div className="p-6 sm:p-8">
            {!modality ? (
              /* Step 1: Pick Modality */
              <div>
                <h3 className="text-lg font-[Montserrat] font-bold uppercase mb-1">Choose Your Learning Experience</h3>
                <p className="text-gray-500 text-sm mb-6">Select how you&apos;d like to take this course.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* In-Person Card */}
                  {course.has_inperson && (
                    <button
                      onClick={() => setModality("inperson")}
                      className="text-left border-2 border-gray-200 hover:border-primary p-6 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-2xl">groups</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base group-hover:text-primary transition-colors">In-Person</h4>
                          <p className="text-[11px] text-gray-400 uppercase tracking-wider">80% Hands-on, 20% Theory</p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {course.inperson_includes.kit && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">check</span>
                            Professional Kit Included
                          </li>
                        )}
                        {course.inperson_includes.practice_month && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">check</span>
                            1 Month of Practice
                          </li>
                        )}
                        {course.inperson_includes.certificate && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">check</span>
                            Physical Certificate
                          </li>
                        )}
                        {course.inperson_includes.medical_director && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">check</span>
                            Medical Director Supervision
                          </li>
                        )}
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-baseline justify-between">
                        <div>
                          {promoPrice ? (
                            <>
                              <span className="text-gray-400 line-through text-xs">{course.price_regular_display}</span>
                              <span className="text-red-500 line-through text-sm ml-1">{course.price_discount_display}</span>
                              <span className="text-red-600 font-black text-xl ml-2">{promoPrice}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-400 line-through text-sm">{course.price_regular_display}</span>
                              <span className="text-primary font-black text-xl ml-2">{course.price_discount_display}</span>
                            </>
                          )}
                        </div>
                        <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">arrow_forward</span>
                      </div>
                    </button>
                  )}

                  {/* Online Card */}
                  {course.has_online && (
                    <button
                      onClick={() => setModality("online")}
                      className="text-left border-2 border-gray-200 hover:border-primary p-6 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-2xl">laptop_mac</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-base group-hover:text-primary transition-colors">Online</h4>
                          <p className="text-[11px] text-gray-400 uppercase tracking-wider">Learn at Your Own Pace</p>
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {course.online_includes.access_code && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">check</span>
                            Personal Access Code
                          </li>
                        )}
                        {course.online_includes.digital_material && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">check</span>
                            Digital Materials & PDFs
                          </li>
                        )}
                        {course.online_includes.practice_month && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">check</span>
                            1 Month Practice Access
                          </li>
                        )}
                        {course.online_includes.zoom_sessions && (
                          <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">check</span>
                            Live Zoom Q&A Sessions
                          </li>
                        )}
                      </ul>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-baseline justify-between">
                        <div>
                          {promoPrice ? (
                            <>
                              <span className="text-gray-400 line-through text-xs">{course.price_regular_display}</span>
                              <span className="text-red-500 line-through text-sm ml-1">{course.price_discount_display}</span>
                              <span className="text-red-600 font-black text-xl ml-2">{promoPrice}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-400 line-through text-sm">{course.price_regular_display}</span>
                              <span className="text-primary font-black text-xl ml-2">{course.price_discount_display}</span>
                            </>
                          )}
                        </div>
                        <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors">arrow_forward</span>
                      </div>
                    </button>
                  )}

                  {/* If only one modality, show "not available" for the other */}
                  {!course.has_inperson && !course.has_online && (
                    <p className="text-gray-400 text-sm col-span-2 text-center py-8">
                      Contact us for availability.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Step 2: Course Details + Pricing + Payment */
              <div>
                {hasBoth && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-gray-400 hover:text-charcoal text-sm mb-6 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Change modality
                  </button>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    {modality === "inperson" ? "groups" : "laptop_mac"}
                  </span>
                  <h3 className="text-lg font-[Montserrat] font-bold uppercase">
                    {modality === "inperson" ? "In-Person" : "Online"} — {course.title}
                  </h3>
                </div>

                {course.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">{course.description}</p>
                )}

                {/* What's Included */}
                <div className="bg-gray-50 p-5 mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">What&apos;s Included</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {modality === "inperson" ? (
                      <>
                        {course.inperson_includes.kit && <IncludeItem label="Professional Kit" />}
                        {course.inperson_includes.practice_month && <IncludeItem label="1 Month Practice" />}
                        {course.inperson_includes.digital_material && <IncludeItem label="Digital Materials" />}
                        {course.inperson_includes.certificate && <IncludeItem label="Physical Certificate" />}
                        {course.inperson_includes.medical_director && <IncludeItem label="Medical Director" />}
                      </>
                    ) : (
                      <>
                        {course.online_includes.access_code && <IncludeItem label="Access Code" />}
                        {course.online_includes.digital_material && <IncludeItem label="Digital Materials" />}
                        {course.online_includes.practice_month && <IncludeItem label="1 Month Practice" />}
                        {course.online_includes.zoom_sessions && <IncludeItem label="Live Zoom Q&A" />}
                      </>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className={`border-2 p-5 mb-6 ${promoPrice ? "border-red-500" : "border-primary"}`}>
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      {promoPrice ? (
                        <>
                          <span className="text-gray-400 line-through text-sm">{course.price_regular_display}</span>
                          <span className="text-red-500 line-through text-lg ml-2">{course.price_discount_display}</span>
                          <span className="text-red-600 font-black text-3xl ml-3">{promoPrice}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-400 line-through text-lg">{course.price_regular_display}</span>
                          <span className="text-primary font-black text-3xl ml-3">{course.price_discount_display}</span>
                        </>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 tracking-wider ${promoPrice ? "bg-red-50 text-red-600" : "bg-primary/10 text-primary"}`}>
                      Save {Math.round(((course.price_regular_cents - course.price_discount_cents) / course.price_regular_cents) * 100)}%
                      {promoPrice && special ? ` + ${special.discount_type === "percentage" ? `${special.discount_value}%` : `$${special.discount_value}`}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="material-symbols-outlined text-primary text-base">lock</span>
                    <span>$200 reservation locks your discount price</span>
                  </div>
                </div>

                {/* Payment Options */}
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Payment Options</h4>
                <div className="space-y-3">
                  {/* Pay with Card (Square Checkout) */}
                  <button
                    onClick={async () => {
                      setCheckoutLoading(true);
                      try {
                        const res = await fetch("/api/checkout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            courseId: course.id,
                            modality,
                            discountCode: special?.coupon_code || undefined,
                          }),
                        });
                        const data = await res.json();
                        if (data.checkoutUrl) {
                          window.location.href = data.checkoutUrl;
                        } else {
                          alert(data.error || "Unable to create checkout. Please try again.");
                          setCheckoutLoading(false);
                        }
                      } catch {
                        alert("Connection error. Please try again.");
                        setCheckoutLoading(false);
                      }
                    }}
                    disabled={checkoutLoading}
                    className="flex items-center justify-between w-full bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-4 hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">credit_card</span>
                      {checkoutLoading ? "Creating checkout..." : "Pay Now — Card / Payment Plan"}
                    </span>
                    {checkoutLoading ? (
                      <span className="w-5 h-5 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined">open_in_new</span>
                    )}
                  </button>

                  {/* Cherry Financing */}
                  <a
                    href={process.env.NEXT_PUBLIC_CHERRY_URL || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full border-2 border-gray-200 text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-4 hover:border-primary transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">account_balance</span>
                      Finance with Cherry
                    </span>
                    <span className="text-[10px] font-normal normal-case text-gray-400">0% Interest Available</span>
                  </a>

                  {/* Zelle */}
                  {!showZelleForm ? (
                    <button
                      onClick={() => setShowZelleForm(true)}
                      className="flex items-center justify-between w-full border-2 border-gray-200 text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-4 hover:border-violet-400 transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">smartphone</span>
                        Pay via Zelle
                      </span>
                      <span className="text-[10px] font-normal normal-case text-gray-400">Get receipt number</span>
                    </button>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setZelleLoading(true);
                        const form = new FormData(e.currentTarget);
                        try {
                          const res = await fetch("/api/enroll/zelle", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              courseId: course.id,
                              modality,
                              studentName: form.get("zelle_name"),
                              studentEmail: form.get("zelle_email"),
                              studentPhone: form.get("zelle_phone"),
                              discountCode: special?.coupon_code || undefined,
                            }),
                          });
                          const data = await res.json();
                          if (data.receiptNumber) {
                            window.location.href = `/enrollment/zelle?ref=${data.receiptNumber}&amount=${data.totalAmountCents}&course=${encodeURIComponent(data.courseTitle)}`;
                          } else {
                            alert(data.error || "Failed to create enrollment");
                            setZelleLoading(false);
                          }
                        } catch {
                          alert("Connection error. Please try again.");
                          setZelleLoading(false);
                        }
                      }}
                      className="border-2 border-violet-300 p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-violet-500">smartphone</span>
                          <span className="font-bold uppercase text-xs tracking-widest">Pay via Zelle</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowZelleForm(false)}
                          className="text-gray-400 hover:text-charcoal cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">close</span>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter your info to get a receipt number for the Zelle memo.
                      </p>
                      <input
                        name="zelle_name"
                        required
                        placeholder="Full Name *"
                        className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-primary"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          name="zelle_email"
                          type="email"
                          required
                          placeholder="Email *"
                          className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-primary"
                        />
                        <input
                          name="zelle_phone"
                          placeholder="Phone (optional)"
                          className="w-full px-3 py-2 border border-gray-200 text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={zelleLoading}
                        className="w-full bg-violet-500 text-white font-bold uppercase text-xs tracking-widest px-4 py-3 hover:bg-violet-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
                      >
                        {zelleLoading ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-base">receipt_long</span>
                            Get Receipt Number
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

                {/* Contact CTA */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400 mb-2">Questions? We&apos;re here to help.</p>
                  <div className="flex justify-center gap-4">
                    <a href="tel:+17139275300" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">call</span>
                      (713) 927-5300
                    </a>
                    <a href="mailto:aame0edu@gmail.com" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">mail</span>
                      Email Us
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function IncludeItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
      {label}
    </div>
  );
}
