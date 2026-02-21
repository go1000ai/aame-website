"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/lib/i18n";

type Special = {
  coupon_code: string;
  coupon_name: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  course_ids: string[];
};

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function SpecialsPage() {
  const { t } = useLanguage();
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/specials")
      .then((r) => r.json())
      .then((data) => {
        setSpecials(data.specials || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  }

  return (
    <div className="bg-[#f8fafc] text-charcoal antialiased font-sans min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <FadeIn>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold uppercase text-xs tracking-widest px-4 py-2 mb-6">
                <span className="material-symbols-outlined text-base">local_offer</span>
                {t("specials.tag")}
              </div>
              <h1 className="text-4xl sm:text-5xl font-[Montserrat] font-black uppercase tracking-tight mb-4">
                {t("specials.title")}
              </h1>
              <p className="text-gray-500 max-w-lg mx-auto">
                {t("specials.subtitle")}
              </p>
            </div>
          </FadeIn>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : specials.length === 0 ? (
            <FadeIn>
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">
                  loyalty
                </span>
                <h2 className="text-xl font-bold text-gray-400 mb-2">
                  {t("specials.empty.title")}
                </h2>
                <p className="text-gray-400 text-sm">
                  {t("specials.empty.text")}
                </p>
              </div>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {specials.map((special, i) => (
                <FadeIn key={special.coupon_code} delay={Math.min(i * 0.1, 0.3)}>
                  <div className="bg-white border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
                    {/* Top accent */}
                    <div className="bg-charcoal p-5 relative">
                      <div className="absolute top-3 right-3 bg-primary text-charcoal text-[10px] font-black uppercase tracking-widest px-2 py-1">
                        {t("catalog.especial")}
                      </div>
                      <div className="text-white">
                        <span className="text-4xl font-black text-primary">
                          {special.discount_type === "percentage"
                            ? `${special.discount_value}%`
                            : `$${special.discount_value}`}
                        </span>
                        <span className="text-sm text-gray-400 ml-2 uppercase tracking-wider font-bold">
                          {t("specials.discount")}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-[Montserrat] font-bold text-lg mb-3">
                        {special.coupon_name}
                      </h3>

                      {/* Code display */}
                      <div className="bg-gray-50 border-2 border-dashed border-primary/40 p-4 text-center mb-4">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                          {t("specials.code")}
                        </p>
                        <p className="font-mono text-2xl font-black text-primary tracking-widest">
                          {special.coupon_code}
                        </p>
                      </div>

                      <button
                        onClick={() => copyCode(special.coupon_code)}
                        className="w-full bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-4 py-3 hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">
                          {copiedCode === special.coupon_code ? "check" : "content_copy"}
                        </span>
                        {copiedCode === special.coupon_code ? t("specials.copied") : t("specials.copy")}
                      </button>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}

          {/* CTA */}
          {specials.length > 0 && (
            <FadeIn>
              <div className="text-center mt-16 bg-charcoal text-white p-8 sm:p-12">
                <h2 className="text-2xl sm:text-3xl font-[Montserrat] font-black uppercase mb-3">
                  {t("specials.cta.title")}
                </h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
                  {t("specials.cta.text")}
                </p>
                <a
                  href="/schedule"
                  className="inline-flex items-center gap-2 bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3 hover:brightness-110 transition-all"
                >
                  <span className="material-symbols-outlined text-base">event</span>
                  {t("specials.cta.button")}
                </a>
              </div>
            </FadeIn>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
