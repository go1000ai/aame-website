"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { X, Check, ArrowRight } from "lucide-react";
import { GodRays, MeshGradient } from "@paper-design/shaders-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseDetailModal from "@/components/CourseDetailModal";
import { createClient } from "@/lib/supabase/browser";
import { SAMPLE_COURSES } from "@/lib/sample-data";
import type { Course } from "@/lib/supabase/types";
import { slugify } from "@/lib/seo";
import { useLanguage } from "@/lib/i18n";

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


export default function Home() {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  // Course data from Supabase (falls back to sample data)
  const [courses, setCourses] = useState<Course[]>(SAMPLE_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  // Map of courseId → special info (code, discount) for badge display
  type SpecialInfo = { coupon_code: string; discount_type: string; discount_value: number };
  const [courseSpecials, setCourseSpecials] = useState<Map<string, SpecialInfo>>(new Map());
  const [hasAnySpecials, setHasAnySpecials] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("courses")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setCourses(data);
      });

    // Fetch active specials — build a map of courseId → special info for badge + code display
    fetch("/api/specials")
      .then((r) => r.json())
      .then((data) => {
        const specials = data.specials || [];
        if (specials.length > 0) {
          setHasAnySpecials(true);
          const map = new Map<string, SpecialInfo>();
          for (const s of specials) {
            if (s.course_ids && s.course_ids.length > 0) {
              const info: SpecialInfo = {
                coupon_code: s.coupon_code,
                discount_type: s.discount_type,
                discount_value: s.discount_value,
              };
              for (const cid of s.course_ids) map.set(cid, info);
            }
          }
          setCourseSpecials(map);
        }
      })
      .catch(() => {});
  }, []);

  // Helper: compute promo price after coupon discount
  function getPromoPrice(course: Course): string | null {
    const special = courseSpecials.get(course.id);
    if (!special) return null;
    const baseCents = course.price_discount_cents;
    let finalCents: number;
    if (special.discount_type === "percentage") {
      finalCents = Math.round(baseCents * (1 - special.discount_value / 100));
    } else {
      finalCents = Math.max(0, baseCents - special.discount_value * 100);
    }
    return `$${(finalCents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
  }

  // Expandable CTA state
  const [isExpanded, setIsExpanded] = useState(false);
  const [formStep, setFormStep] = useState<"idle" | "submitting" | "success">("idle");

  const handleExpand = () => setIsExpanded(true);
  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => setFormStep("idle"), 500);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStep("submitting");
    setTimeout(() => setFormStep("success"), 1500);
  };

  useEffect(() => {
    if (isExpanded || selectedCourse) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isExpanded, selectedCourse]);

  return (
    <>
      <div className="bg-[#f8fafc] text-charcoal antialiased font-sans">
        <Navbar />

        {/* Hero with GodRays Background */}
        <section ref={heroRef} className="relative min-h-[100dvh] flex items-center overflow-hidden bg-white">
          {/* GodRays Shader Background — subtle rays on white */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <GodRays
              colorBack="#fdfdfd"
              colors={["#08d1ce30", "#00f2fe25", "#08d1ce18", "#00f2fe20"]}
              colorBloom="#08d1ce"
              offsetX={0.85}
              offsetY={-1}
              intensity={0.35}
              spotty={0.3}
              midSize={8}
              midIntensity={0.1}
              density={0.35}
              bloom={0.2}
              speed={0.3}
              scale={2.0}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full pt-28 pb-16">
            <div className="grid grid-cols-12 gap-6 items-center">
              {/* Left — Image with light shade + parallax */}
              <FadeIn className="col-span-12 lg:col-span-7 relative order-2 lg:order-1">
                <div className="relative overflow-hidden h-[300px] sm:h-[420px] md:h-[520px]">
                  <motion.div style={{ y: heroImageY }} className="absolute inset-0">
                    <Image
                      alt="Medical Aesthetics Training Classroom"
                      className="w-full h-[130%] object-cover"
                      src="https://plus.unsplash.com/premium_photo-1719617673192-61b02470619d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1920"
                      width={1920}
                      height={1280}
                      priority
                    />
                  </motion.div>
                  {/* Light shade overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10 z-10" />
                  <div className="absolute inset-0 shadow-clinical" />
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 40, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="absolute -bottom-8 left-4 sm:left-8 bg-primary p-8 sm:p-10 hidden md:block geometric-block max-w-xs shadow-xl"
                >
                  <h2 className="text-3xl sm:text-4xl font-[Montserrat] font-extrabold text-charcoal leading-none mb-3 uppercase">
                    Excellence in Training
                  </h2>
                  <p className="text-charcoal font-medium text-sm">
                    Elevate your practice with clinically certified aesthetics courses.
                  </p>
                </motion.div>
              </FadeIn>

              {/* Right — Headline & Expandable CTA */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4 }}
                className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center lg:items-start text-center lg:text-left pt-4 lg:pt-0 order-1 lg:order-2"
              >
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                  <div className="bg-charcoal p-3">
                    <span className="material-symbols-outlined text-primary text-4xl">
                      medical_services
                    </span>
                  </div>
                  <div className="border-l-4 border-primary pl-4">
                    <span className="font-[Montserrat] font-extrabold text-3xl md:text-4xl uppercase tracking-tighter leading-none">
                      AAME
                    </span>
                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
                      American Aesthetics Medical Education
                    </p>
                  </div>
                </div>

                <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-[Montserrat] font-extrabold uppercase leading-[0.85] mb-6 sm:mb-8">
                  Your
                  <br />
                  Career
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#00f2fe]">
                    Starts
                  </span>
                  <br />
                  Here
                </h1>

                <div className="border-t-2 border-charcoal pt-5 w-full lg:max-w-sm">
                  <p className="text-base leading-relaxed font-medium mb-6">
                    Hands-on training in injectables, skin rejuvenation, and body
                    contouring — taught by practitioners, not textbooks.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {/* Expandable CTA Button */}
                    <AnimatePresence initial={false}>
                      {!isExpanded && (
                        <motion.div className="relative w-full sm:w-auto">
                          <motion.div
                            style={{ borderRadius: "4px" }}
                            layout
                            layoutId="enroll-card"
                            className="absolute inset-0 sparkle-btn"
                          />
                          <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: 0.1 }}
                            layout={false}
                            onClick={handleExpand}
                            className="relative w-full sm:w-auto flex items-center justify-center gap-2 text-charcoal font-black uppercase text-xs tracking-widest px-7 py-3.5 cursor-pointer"
                          >
                            Start Your Journey
                            <ArrowRight className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <motion.a
                      href="/courses"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full sm:w-auto text-center border-2 border-charcoal text-charcoal font-black uppercase text-xs tracking-widest px-7 py-3.5 hover:bg-charcoal hover:text-white transition-colors cursor-pointer"
                    >
                      Browse Courses
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Choose AAME */}
        <section className="bg-white py-16 sm:py-20 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <FadeIn>
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-[Montserrat] font-black uppercase tracking-wide">
                  Why Choose <span className="text-primary">AAME</span>
                </h2>
                <div className="h-1 w-16 bg-primary mx-auto mt-4" />
              </div>
            </FadeIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "clinical_notes", title: "15+ Years of Expertise", desc: "Led by Strani Mayorga, a Magister in Aesthetic Medicine with over 15 years of clinical experience." },
                { icon: "science", title: "80% Hands-On Training", desc: "Practice on live models under expert supervision. Theory is only 20% — the rest is real experience." },
                { icon: "workspace_premium", title: "Certified Upon Completion", desc: "Receive an official AAME Certificate of Completion, recognized for professional practice." },
                { icon: "translate", title: "Bilingual: Spanish & English", desc: "All courses taught in both Spanish and English. No language barriers to your career." },
                { icon: "payments", title: "Flexible Financing", desc: "Pay with card, Cherry 0% interest plans, or Zelle. $200 deposit locks your discounted price." },
                { icon: "groups", title: "Small Class Sizes", desc: "Limited enrollment for personalized instruction and hands-on mentorship from Strani herself." },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#f8fafc] border border-gray-100 p-6 sm:p-8 text-center group hover:border-primary/30 transition-all"
                >
                  <div className="w-14 h-14 bg-charcoal mx-auto mb-4 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <span className="material-symbols-outlined text-primary text-2xl group-hover:text-charcoal transition-colors">
                      {item.icon}
                    </span>
                  </div>
                  <h3 className="font-[Montserrat] font-bold text-sm uppercase tracking-wider mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">

          {/* About AAME */}
          <section className="mb-32">
            <FadeIn>
              <div className="flex items-center gap-4 mb-16">
                <span className="h-px flex-1 bg-charcoal opacity-20" />
                <h2 className="text-2xl font-[Montserrat] font-black uppercase tracking-widest italic">
                  About AAME
                </h2>
                <span className="h-px flex-1 bg-charcoal opacity-20" />
              </div>
            </FadeIn>

            <div className="grid grid-cols-12 gap-8 items-center">
              <FadeIn className="col-span-12 lg:col-span-7 text-center lg:text-left">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-[Montserrat] font-black uppercase leading-[0.9] mb-6">
                  Shaping the Future of
                  <br />
                  <span className="text-primary">Medical Aesthetics</span>
                </h3>
                <div className="h-1 w-24 bg-primary mb-8 mx-auto lg:mx-0" />
                <p className="text-lg leading-relaxed mb-6">
                  <strong>American Aesthetics Medical Education (AAME)</strong> is a
                  premier training institution dedicated to empowering medical
                  professionals and aspiring aestheticians with the knowledge,
                  hands-on skills, and clinical confidence they need to excel.
                </p>
                <p className="text-base leading-relaxed text-gray-600 mb-8">
                  From injectables and dermal fillers to advanced body contouring
                  and skin rejuvenation, our curriculum is designed by industry
                  practitioners who bring real-world expertise into every lesson.
                  Every course blends scientific rigor with artistic technique —
                  because great aesthetics is both a science and an art.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {[
                    { value: "21+", label: "Courses" },
                    { value: "2.5K+", label: "Trained" },
                    { value: "98%", label: "Success Rate" },
                    { value: "CME", label: "Accredited" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="text-center"
                    >
                      <p className="text-3xl font-[Montserrat] font-black text-primary">
                        {stat.value}
                      </p>
                      <p className="text-xs font-bold uppercase tracking-widest mt-1">
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={0.2} className="col-span-12 lg:col-span-5">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.03 }} className="shadow-clinical">
                    <Image
                      alt="Hands-on training at AAME"
                      className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm3alre5sEC2no0PrvSC9BaQw60r9tJra8gmvxOn42zdgzCdzqfSxON_7iyWDr7Zbpa50qMWD6h3Z8iAacKCnJrgBxJyLS0PlZ9bIlkPpzlaoh7WS3QB6oZzbUKgEW8jUhqg03_zw312bROvMWr8rj0-MsEfQ05rG1nzcxLhw2XFnqq-P8lnhRDELMFvDB8rSjdMb2QyUDUU9zPrGoDG9V7k1QaI05DZYJpPLCthQaYIGElzNaUWRK9o4ih6Ay_lIQZ90wom7pyEU"
                      width={400}
                      height={300}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} className="shadow-clinical mt-8">
                    <Image
                      alt="Clinical environment at AAME"
                      className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-700"
                      src="https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc7b9e85ccacffe1c20.jpeg"
                      width={400}
                      height={300}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </motion.div>
                </div>
                <div className="mt-6 bg-charcoal p-6">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-3xl mt-0.5">
                      verified
                    </span>
                    <div>
                      <p className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                        Our Promise
                      </p>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Every graduate leaves with the clinical confidence, certification,
                        and portfolio to launch or advance their aesthetics career.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </section>

          {/* Meet the Founder */}
          <section className="mb-40">
            <FadeIn>
              <div className="flex items-center gap-4 mb-16">
                <span className="h-px flex-1 bg-charcoal opacity-20" />
                <h2 className="text-2xl font-[Montserrat] font-black uppercase tracking-widest italic">
                  Meet the Founder
                </h2>
                <span className="h-px flex-1 bg-charcoal opacity-20" />
              </div>
            </FadeIn>

            <div className="grid grid-cols-12 gap-6 items-center">
              <FadeIn className="col-span-12 lg:col-span-5 relative overflow-hidden">
                <div className="relative">
                  <div className="bg-charcoal p-3 shadow-2xl">
                    <Image
                      alt="Strani Mayorga - Founder of AAME"
                      className="w-full h-[400px] sm:h-[500px] lg:h-[550px] object-cover object-top grayscale hover:grayscale-0 transition-all duration-700"
                      src="https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc7b9127758b46061bc.jpeg"
                      width={600}
                      height={550}
                    />
                  </div>
                  <div className="absolute -top-6 -left-6 bg-primary w-32 h-32 -z-10 opacity-20 hidden lg:block" />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="absolute -bottom-6 -right-6 bg-primary p-6 shadow-xl hidden md:block"
                  >
                    <p className="text-charcoal font-black text-3xl">15+</p>
                    <p className="text-charcoal text-xs font-bold uppercase tracking-widest">
                      Years Experience
                    </p>
                  </motion.div>
                </div>
              </FadeIn>

              <FadeIn delay={0.2} className="col-span-12 lg:col-span-7 lg:pl-12 text-center lg:text-left">
                <div className="mb-6">
                  <h3 className="text-4xl sm:text-5xl lg:text-6xl font-[Montserrat] font-black uppercase leading-[0.85] mb-4">
                    Strani
                    <br />
                    <span className="text-primary">Mayorga</span>
                  </h3>
                  <div className="h-1 w-20 bg-primary mb-4 mx-auto lg:mx-0" />
                  <p className="text-sm font-bold uppercase tracking-widest text-primary">
                    Founder &amp; Lead Educator, AAME
                  </p>
                </div>

                <p className="text-lg leading-relaxed mb-6">
                  With over <strong>15 years of specialized experience</strong> in
                  facial and body aesthetics, Strani Mayorga founded AAME with a
                  singular vision: enhancing natural beauty through education,
                  safety, and artistic precision.
                </p>

                <p className="text-base leading-relaxed text-gray-600 mb-8">
                  A <strong>Magister in Aesthetic Medicine</strong>, US-endorsed
                  Medical Assistant, certified Phlebotomist, and Certified
                  Injector, Strani brings a rare combination of scientific rigor
                  and artistic intuition to every course she teaches. Her approach
                  integrates technique and artistry to deliver natural, safe, and
                  highly personalized results — and she trains her students to do
                  the same.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8">
                  {[
                    "Comprehensive Facial Rejuvenation",
                    "Facial Harmonization",
                    "Advanced Injection Techniques",
                    "Body Contouring Procedures",
                  ].map((specialty, i) => (
                    <motion.div
                      key={specialty}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="flex items-center justify-center lg:justify-start gap-2"
                    >
                      <span className="material-symbols-outlined text-primary text-lg">
                        check_circle
                      </span>
                      <span className="text-sm font-semibold">{specialty}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} className="shadow-clinical">
                    <Image
                      alt="Strani Mayorga performing procedure"
                      className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-500"
                      src="https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc7b9e85ccacffe1c20.jpeg"
                      width={500}
                      height={400}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} className="shadow-clinical">
                    <Image
                      alt="Strani Mayorga in clinic"
                      className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-500"
                      src="https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc77fc451fc11eab846.jpeg"
                      width={500}
                      height={400}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </motion.div>
                </div>
              </FadeIn>
            </div>

            {/* Certifications */}
            <FadeIn delay={0.1} className="mt-20">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-10">
                <div className="h-0.5 w-12 bg-primary" />
                <h4 className="text-lg font-[Montserrat] font-black uppercase tracking-widest">
                  Certifications &amp; Credentials
                </h4>
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                {[
                  { src: "https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc7b912778bf16061aa.jpeg", alt: "Certification 1" },
                  { src: "https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc7e2d75b3832254c54.jpeg", alt: "Certification 2" },
                  { src: "https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc77fc451b7a0eab847.jpeg", alt: "Certification 3" },
                  { src: "https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc7e2d75b2a87254c55.jpeg", alt: "Certification 4" },
                ].map((cert, i) => (
                  <motion.div
                    key={cert.alt}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    whileHover={{ scale: 2.5, zIndex: 50 }}
                    className="relative w-20 h-20 bg-white border border-slate-200 p-1.5 shadow-clinical cursor-pointer origin-center"
                  >
                    <Image
                      alt={cert.alt}
                      className="w-full h-full object-contain"
                      src={cert.src}
                      width={80}
                      height={80}
                    />
                  </motion.div>
                ))}
              </div>
            </FadeIn>
          </section>

          {/* Animated Stats Counter */}
          <section className="bg-charcoal py-14 sm:py-16 -mx-4 sm:-mx-6 px-4 sm:px-6 mb-32">
            <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-center">
              {[
                { end: 15, suffix: "+", label: "Years Experience" },
                { end: 21, suffix: "+", label: "Courses Available" },
                { end: 2500, suffix: "+", label: "Graduates Trained" },
                { end: 98, suffix: "%", label: "Success Rate" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                >
                  <motion.p
                    className="text-4xl sm:text-5xl lg:text-6xl font-[Montserrat] font-black text-primary"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 + 0.2 }}
                  >
                    {stat.end.toLocaleString()}{stat.suffix}
                  </motion.p>
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-400 mt-2">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Course Catalog & Pricing */}
          <section id="pricing" className="mb-32">
            <FadeIn>
              <div className="flex items-center gap-4 mb-12">
                <span className="h-px flex-1 bg-charcoal opacity-20" />
                <h2 className="text-2xl font-[Montserrat] font-black uppercase tracking-widest italic">
                  Course Catalog &amp; Pricing
                </h2>
                <span className="h-px flex-1 bg-charcoal opacity-20" />
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, i) => (
                <FadeIn key={course.num} delay={Math.min(i * 0.05, 0.3)} className="h-full">
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="group cursor-pointer relative h-full"
                    onClick={() => setSelectedCourse(course)}
                  >
                    {/* Diagonal ribbon badge — corner special indicator */}
                    {courseSpecials.has(course.id) && (
                      <div className="absolute top-0 right-0 z-10 overflow-hidden w-24 h-24 pointer-events-none">
                        <span className="absolute top-[10px] right-[-28px] w-[120px] text-center rotate-45 bg-red-500 text-white text-[9px] font-black uppercase tracking-wider py-1 shadow-md block">
                          {t("catalog.especial")}
                        </span>
                      </div>
                    )}
                    {course.featured ? (
                      <div className="bg-primary border border-slate-200 geometric-block overflow-hidden flex flex-col h-full shadow-clinical">
                        <div className="bg-charcoal text-white px-4 py-2 flex justify-between items-center border-b border-charcoal">
                          <span className="text-2xl font-black text-primary">{course.num}</span>
                          <span className="text-xs font-bold uppercase tracking-tighter">{course.category}</span>
                        </div>
                        <div className="p-8 flex-grow">
                          <div className="bg-charcoal text-white text-[10px] px-2 py-0.5 inline-block mb-4 font-bold uppercase tracking-widest">Mejor Valor</div>
                          <h3 className="text-2xl font-[Montserrat] font-black uppercase mb-2 text-charcoal">{course.title}</h3>
                          <p className="text-xs font-bold uppercase opacity-70">Programa Completo de Certificación</p>
                          <Link
                            href={`/courses/${slugify(course.title)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 mt-3 text-xs font-bold uppercase tracking-wider text-charcoal/80 hover:text-charcoal transition-colors"
                          >
                            Learn More
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        </div>
                        <div className="bg-white p-5 border-t border-charcoal">
                          <div className="flex justify-between items-baseline">
                            <span className="text-charcoal uppercase text-[10px] font-black tracking-widest">Con Reservación de $200</span>
                            <div className="text-right">
                              {courseSpecials.has(course.id) ? (
                                <>
                                  <span className="text-gray-400 line-through text-xs mr-1">{course.price_regular_display}</span>
                                  <span className="text-red-500 line-through text-sm mr-2">{course.price_discount_display}</span>
                                  <span className="text-red-600 text-2xl font-black tracking-tight">{getPromoPrice(course)}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-gray-400 line-through text-sm mr-2">{course.price_regular_display}</span>
                                  <span className="text-charcoal text-2xl font-black tracking-tight">{course.price_discount_display}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {courseSpecials.has(course.id) && (
                          <div className="bg-red-500 text-white text-center py-2 px-3">
                            <span className="text-[11px] font-bold">
                              {t("catalog.code")}: <span className="font-mono bg-white/20 px-1.5 py-0.5 tracking-wider">{courseSpecials.get(course.id)!.coupon_code}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 geometric-block overflow-hidden flex flex-col h-full shadow-clinical">
                        <div className="bg-primary text-charcoal px-4 py-2 flex justify-between items-center border-b border-charcoal">
                          <span className="text-2xl font-black">{course.num}</span>
                          <span className="text-xs font-bold uppercase tracking-tighter">{course.category}</span>
                        </div>
                        <div className="p-8 flex-grow">
                          <h3 className="text-2xl font-[Montserrat] font-black uppercase mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                          <div className="h-0.5 w-12 bg-primary mb-4" />
                          {(course.has_inperson && course.has_online) && (
                            <div className="flex gap-2">
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 uppercase font-bold tracking-wider">Presencial</span>
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 uppercase font-bold tracking-wider">En Línea</span>
                            </div>
                          )}
                          <Link
                            href={`/courses/${slugify(course.title)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 mt-3 text-xs font-bold uppercase tracking-wider text-primary hover:text-charcoal transition-colors"
                          >
                            Learn More
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        </div>
                        <div className="bg-charcoal p-5">
                          <div className="flex justify-between items-baseline">
                            <span className="text-primary uppercase text-[10px] font-black tracking-widest">Con Reservación</span>
                            <div className="text-right">
                              {courseSpecials.has(course.id) ? (
                                <>
                                  <span className="text-gray-600 line-through text-xs mr-1">{course.price_regular_display}</span>
                                  <span className="text-red-400 line-through text-sm mr-2">{course.price_discount_display}</span>
                                  <span className="text-red-400 text-2xl font-black tracking-tight">{getPromoPrice(course)}</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-gray-500 line-through text-sm mr-2">{course.price_regular_display}</span>
                                  <span className="text-white text-2xl font-black tracking-tight">{course.price_discount_display}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {courseSpecials.has(course.id) && (
                          <div className="bg-red-500 text-white text-center py-2 px-3">
                            <span className="text-[11px] font-bold">
                              {t("catalog.code")}: <span className="font-mono bg-white/20 px-1.5 py-0.5 tracking-wider">{courseSpecials.get(course.id)!.coupon_code}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </FadeIn>
              ))}
            </div>
          </section>

          {/* Student Testimonials */}
          <section className="mb-32">
            <FadeIn>
              <div className="flex items-center gap-4 mb-12">
                <span className="h-px flex-1 bg-charcoal opacity-20" />
                <h2 className="text-2xl font-[Montserrat] font-black uppercase tracking-widest italic">
                  What Our Students Say
                </h2>
                <span className="h-px flex-1 bg-charcoal opacity-20" />
              </div>
            </FadeIn>

            <div className="overflow-hidden">
              <motion.div
                className="flex gap-6 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: -900, right: 0 }}
                dragElastic={0.1}
              >
                {[
                  { quote: "AAME changed my career. The hands-on training gave me the confidence to start my own practice within weeks of graduating.", name: "Maria G.", role: "Licensed Esthetician", initials: "MG", color: "bg-primary" },
                  { quote: "Strani is an incredible instructor. She makes complex injection techniques feel approachable and breaks everything down step by step.", name: "Ana R.", role: "Medical Assistant", initials: "AR", color: "bg-emerald-500" },
                  { quote: "I took the Full Package and it was the best investment I've ever made. Now I offer 10+ services at my own clinic.", name: "Carlos M.", role: "Clinic Owner", initials: "CM", color: "bg-blue-500" },
                  { quote: "The bilingual classes were perfect for me. I learned in Spanish and now I serve clients in both languages confidently.", name: "Lucia P.", role: "Beauty Professional", initials: "LP", color: "bg-violet-500" },
                  { quote: "From phlebotomy to body contouring, AAME covered everything. The certification opened doors immediately after graduation.", name: "David S.", role: "Aesthetics Practitioner", initials: "DS", color: "bg-amber-500" },
                ].map((testimonial, i) => (
                  <motion.div
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="min-w-[320px] sm:min-w-[380px] bg-white border border-gray-200 p-6 sm:p-8 flex-shrink-0 shadow-clinical"
                  >
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="material-symbols-outlined text-amber-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                      ))}
                    </div>
                    <blockquote className="text-gray-600 text-sm leading-relaxed mb-6 italic">
                      &ldquo;{testimonial.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                      <div className={`w-10 h-10 ${testimonial.color} flex items-center justify-center text-white font-bold text-xs`}>
                        {testimonial.initials}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{testimonial.name}</p>
                        <p className="text-xs text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">
              Swipe to see more &rarr;
            </p>
          </section>

          {/* Professional Pathways */}
          <section id="pathways" className="grid grid-cols-12 gap-6 mb-32 relative overflow-hidden">
            <FadeIn className="col-span-12 lg:col-span-5 bg-charcoal text-white p-8 sm:p-12 geometric-block relative z-20 shadow-2xl">
              <h4 className="text-3xl sm:text-4xl lg:text-5xl font-[Montserrat] font-black uppercase leading-[0.85] mb-6 sm:mb-8 break-words">
                Professional
                <br />
                <span className="text-primary">Pathways</span>
              </h4>
              <div className="space-y-6">
                {[
                  "All courses include lifetime access to the AAME digital library and video modules.",
                  "Physical certificates are dispatched within 10 days of completion of the online exam.",
                  "Enrollment is open year-round with rolling start dates for all online programs.",
                ].map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="flex gap-4"
                  >
                    <span className="text-primary font-black">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm font-medium border-l border-primary pl-4">
                      {text}
                    </p>
                  </motion.div>
                ))}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExpand}
                className="mt-12 w-full bg-primary text-charcoal font-black uppercase py-4 hover:bg-white transition-colors cursor-pointer"
              >
                Start Your Journey Now
              </motion.button>
            </FadeIn>

            <FadeIn
              delay={0.2}
              className="col-span-12 lg:col-span-7 lg:ml-[-4rem] mt-12 lg:mt-24 z-10"
            >
              <Image
                alt="Clinical Environment"
                className="w-full h-[400px] object-cover grayscale brightness-50 shadow-clinical"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm3alre5sEC2no0PrvSC9BaQw60r9tJra8gmvxOn42zdgzCdzqfSxON_7iyWDr7Zbpa50qMWD6h3Z8iAacKCnJrgBxJyLS0PlZ9bIlkPpzlaoh7WS3QB6oZzbUKgEW8jUhqg03_zw312bROvMWr8rj0-MsEfQ05rG1nzcxLhw2XFnqq-P8lnhRDELMFvDB8rSjdMb2QyUDUU9zPrGoDG9V7k1QaI05DZYJpPLCthQaYIGElzNaUWRK9o4ih6Ay_lIQZ90wom7pyEU"
                width={1200}
                height={400}
              />
              <div className="mt-4 flex gap-2">
                <div className="h-2 w-full bg-primary" />
                <div className="h-2 w-24 bg-charcoal" />
              </div>
            </FadeIn>
          </section>

          {/* The AAME Promise */}
          <section className="mb-32 bg-primary -mx-4 sm:-mx-6 px-4 sm:px-6 py-16 sm:py-20">
            <FadeIn>
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-charcoal text-4xl">verified_user</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-[Montserrat] font-black uppercase text-charcoal">
                  The AAME Promise
                </h2>
                <div className="h-1 w-16 bg-charcoal mx-auto mt-4" />
              </div>
            </FadeIn>
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  icon: "workspace_premium",
                  title: "Certified Graduate",
                  desc: "Every student who completes their course receives an official AAME Certificate of Completion, recognized for professional practice.",
                },
                {
                  icon: "science",
                  title: "Hands-On From Day One",
                  desc: "80% of in-person time is real practice — live models, professional equipment, and expert supervision by Strani Mayorga.",
                },
                {
                  icon: "rocket_launch",
                  title: "Career Ready",
                  desc: "You leave with the skills, certificate, and confidence to start offering services to real clients immediately.",
                },
              ].map((promise, i) => (
                <motion.div
                  key={promise.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="bg-charcoal p-8 text-center"
                >
                  <span className="material-symbols-outlined text-primary text-4xl mb-4 block">
                    {promise.icon}
                  </span>
                  <h3 className="font-[Montserrat] font-bold text-white text-sm uppercase tracking-wider mb-3">
                    {promise.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {promise.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Follow Us — Social Proof Grid */}
          <section className="mb-32">
            <FadeIn>
              <div className="flex items-center gap-4 mb-12">
                <span className="h-px flex-1 bg-charcoal opacity-20" />
                <h2 className="text-2xl font-[Montserrat] font-black uppercase tracking-widest italic">
                  Follow Us
                </h2>
                <span className="h-px flex-1 bg-charcoal opacity-20" />
              </div>
            </FadeIn>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {[
                { src: "https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc7b9e85ccacffe1c20.jpeg", caption: "Hands-on training in our Houston clinic" },
                { src: "https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc7b9127758b46061bc.jpeg", caption: "Founder Strani Mayorga leading a session" },
                { src: "https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc77fc451fc11eab846.jpeg", caption: "Advanced injection technique demonstration" },
                { src: "https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc7b912778bf16061aa.jpeg", caption: "AAME certification ceremony" },
                { src: "https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc7e2d75b3832254c54.jpeg", caption: "Professional development at AAME" },
                { src: "https://storage.googleapis.com/msgsndr/RzaSM3pnkTvspklzSgHf/media/69669dc77fc451b7a0eab847.jpeg", caption: "Our state-of-the-art training facility" },
              ].map((post, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="relative aspect-square overflow-hidden group cursor-pointer"
                >
                  <Image
                    alt={post.caption}
                    src={post.src}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/70 transition-all duration-300 flex items-center justify-center">
                    <p className="text-white text-xs sm:text-sm font-medium px-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {post.caption}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <FadeIn>
              <div className="text-center mt-8">
                <motion.a
                  href="https://www.instagram.com/aameaesthetics"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-charcoal text-white font-bold uppercase text-xs tracking-widest px-8 py-4 hover:bg-primary hover:text-charcoal transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">photo_camera</span>
                  Follow @aameaesthetics
                </motion.a>
              </div>
            </FadeIn>
          </section>

          {/* Location & Contact */}
          <section id="contact" className="mb-32">
            <FadeIn>
              <div className="flex items-center gap-4 mb-16">
                <span className="h-px flex-1 bg-charcoal opacity-20" />
                <h2 className="text-2xl font-[Montserrat] font-black uppercase tracking-widest italic">
                  Visit Us
                </h2>
                <span className="h-px flex-1 bg-charcoal opacity-20" />
              </div>
            </FadeIn>

            <div className="grid grid-cols-12 gap-8">
              {/* Map */}
              <FadeIn className="col-span-12 lg:col-span-7">
                <div className="w-full h-[350px] sm:h-[420px] shadow-clinical overflow-hidden">
                  <iframe
                    title="AAME Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3464.2!2d-95.481!3d29.7328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjnCsDQzJzU4LjEiTiA5NcKwMjgnNTEuNiJX!5e0!3m2!1sen!2sus!4v1700000000000"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </FadeIn>

              {/* Contact Info */}
              <FadeIn delay={0.2} className="col-span-12 lg:col-span-5 text-center lg:text-left">
                <div className="bg-charcoal p-8 sm:p-10 h-full flex flex-col justify-center">
                  <div className="mb-8">
                    <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
                      location_on
                    </span>
                    <h3 className="text-2xl font-[Montserrat] font-black text-white uppercase mb-2">
                      Our Location
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      430 Richmond Ave. Office 270
                      <br />
                      Houston, TX 77057
                    </p>
                  </div>

                  <div className="mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl mb-3 block">
                      phone
                    </span>
                    <a
                      href="tel:+17139275300"
                      className="text-white text-2xl font-[Montserrat] font-black hover:text-primary transition-colors"
                    >
                      (713) 927-5300
                    </a>
                  </div>

                  <div className="mb-8">
                    <span className="material-symbols-outlined text-primary text-3xl mb-3 block">
                      schedule
                    </span>
                    <p className="text-gray-300 text-sm font-semibold uppercase tracking-wider">
                      Tue – Sat: 11am – 5pm
                    </p>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mt-1">
                      Sun – Mon: Closed
                    </p>
                  </div>

                  {/* Google Maps & Waze Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.a
                      href="https://www.google.com/maps/dir/?api=1&destination=430+Richmond+Ave+Office+270+Houston+TX+77057"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 sparkle-btn text-charcoal font-black uppercase text-xs tracking-widest px-6 py-3.5 text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">map</span>
                      Google Maps
                    </motion.a>
                    <motion.a
                      href="https://waze.com/ul?ll=29.7328,-95.481&navigate=yes&zoom=17"
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 border-2 border-primary text-primary font-black uppercase text-xs tracking-widest px-6 py-3.5 text-center hover:bg-primary hover:text-charcoal transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">navigation</span>
                      Waze
                    </motion.a>
                  </div>
                </div>
              </FadeIn>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* ═══ Expanded Enrollment Modal ═══ */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
            <motion.div
              layoutId="enroll-card"
              transition={{ type: "spring", bounce: 0, duration: 0.45 }}
              style={{ borderRadius: "16px" }}
              layout
              className="relative flex h-full w-full overflow-hidden bg-charcoal sm:rounded-2xl shadow-2xl"
            >
              {/* MeshGradient Background */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 pointer-events-none"
              >
                <MeshGradient
                  speed={0.5}
                  colors={["#2c2c2c", "#08d1ce", "#0a4f4e", "#1a1a1a"]}
                  distortion={0.6}
                  swirl={0.1}
                  grainMixer={0.12}
                  grainOverlay={0}
                  style={{ height: "100%", width: "100%" }}
                />
              </motion.div>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleClose}
                className="absolute right-4 top-4 sm:right-8 sm:top-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative z-10 flex flex-col lg:flex-row h-full w-full max-w-7xl mx-auto overflow-y-auto lg:overflow-hidden"
              >
                {/* Left Side — Info & Benefits */}
                <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 gap-8 text-white">
                  <div className="space-y-4">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-[Montserrat] font-black leading-tight tracking-tight uppercase">
                      Begin Your
                      <br />
                      <span className="text-primary">Journey</span>
                    </h2>
                    <p className="text-gray-300 text-lg max-w-md">
                      Join thousands of professionals who&apos;ve launched their aesthetics careers with AAME.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { icon: "school", title: "21+ Courses", desc: "From Botox to body contouring — certifications for every specialty." },
                      { icon: "workspace_premium", title: "Certified", desc: "CME-accredited programs with physical certificates upon completion." },
                      { icon: "groups", title: "Hands-On", desc: "Small class sizes with real clinical practice, not just theory." },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                          <span className="material-symbols-outlined text-primary text-xl">{item.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <p className="text-gray-400 text-sm leading-relaxed mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-8 border-t border-white/20 hidden lg:block">
                    <figure>
                      <blockquote className="text-xl font-[Montserrat] font-bold leading-relaxed mb-6 text-gray-200">
                        &ldquo;AAME gave me the clinical confidence to advance my career in aesthetics within months.&rdquo;
                      </blockquote>
                      <figcaption className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-[#00f2fe] flex items-center justify-center text-lg font-bold text-charcoal">
                          SM
                        </div>
                        <div>
                          <div className="font-semibold">Strani Mayorga</div>
                          <div className="text-sm text-gray-400">Founder &amp; Lead Educator</div>
                        </div>
                      </figcaption>
                    </figure>
                  </div>
                </div>

                {/* Right Side — Enrollment Form */}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-16 bg-black/10 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
                  <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
                    {formStep === "success" ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center h-[400px] space-y-6"
                      >
                        <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                          <Check className="w-10 h-10 text-charcoal" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
                          <p className="text-gray-300">We&apos;ll be in touch shortly to help you get started.</p>
                        </div>
                        <button
                          onClick={handleClose}
                          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
                        >
                          Return to Homepage
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                          <h3 className="text-xl font-[Montserrat] font-bold text-white uppercase">Enroll Now</h3>
                          <p className="text-sm text-gray-400">Fill out the form and we&apos;ll contact you.</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="name" className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                              Full Name
                            </label>
                            <input
                              required
                              type="text"
                              id="name"
                              placeholder="Your full name"
                              className="w-full px-4 py-3 rounded-lg bg-charcoal/60 border border-primary/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                              Email
                            </label>
                            <input
                              required
                              type="email"
                              id="email"
                              placeholder="you@email.com"
                              className="w-full px-4 py-3 rounded-lg bg-charcoal/60 border border-primary/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="phone" className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                                Phone
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                placeholder="(305) 555-0123"
                                className="w-full px-4 py-3 rounded-lg bg-charcoal/60 border border-primary/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="course" className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                                Interest
                              </label>
                              <select
                                id="course"
                                className="w-full px-4 py-3 rounded-lg bg-charcoal/60 border border-primary/20 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
                              >
                                <option className="bg-charcoal">Full Package</option>
                                <option className="bg-charcoal">Botox</option>
                                <option className="bg-charcoal">Fillers</option>
                                <option className="bg-charcoal">Body Contouring</option>
                                <option className="bg-charcoal">Skin Care</option>
                                <option className="bg-charcoal">Other</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="message" className="block text-xs font-medium text-gray-300 mb-1.5 uppercase tracking-wider">
                              Message
                            </label>
                            <textarea
                              id="message"
                              rows={3}
                              placeholder="Tell us about your goals..."
                              className="w-full px-4 py-3 rounded-lg bg-charcoal/60 border border-primary/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-sm"
                            />
                          </div>
                        </div>

                        <button
                          disabled={formStep === "submitting"}
                          type="submit"
                          className="w-full flex items-center justify-center px-8 py-3.5 rounded-lg bg-primary text-charcoal font-bold hover:brightness-110 focus:ring-4 focus:ring-primary/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 cursor-pointer"
                        >
                          {formStep === "submitting" ? (
                            <span className="flex items-center gap-2">
                              <span className="h-4 w-4 border-2 border-charcoal border-t-transparent rounded-full animate-spin" />
                              Sending...
                            </span>
                          ) : "Submit Enrollment Request"}
                        </button>

                        <p className="text-xs text-center text-gray-500 mt-4">
                          By submitting, you agree to be contacted about AAME courses.
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          special={courseSpecials.get(selectedCourse.id) || null}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </>
  );
}
