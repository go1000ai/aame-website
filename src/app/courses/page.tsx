"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseDetailModal from "@/components/CourseDetailModal";
import { createClient } from "@/lib/supabase/browser";
import { SAMPLE_COURSES } from "@/lib/sample-data";
import type { Course } from "@/lib/supabase/types";
import { useState, useEffect, useMemo } from "react";

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(SAMPLE_COURSES);
  const [filter, setFilter] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

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
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedCourse]);

  const categories = useMemo(
    () => ["All", ...new Set(courses.map((c) => c.category))],
    [courses]
  );

  const filtered = filter === "All" ? courses : courses.filter((c) => c.category === filter);

  return (
    <div className="bg-[#f8fafc] text-charcoal antialiased font-sans min-h-screen">
      <Navbar />

      {/* Header */}
      <header className="pt-28 pb-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-charcoal p-3">
                <span className="material-symbols-outlined text-primary text-4xl">
                  school
                </span>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h1 className="text-4xl md:text-5xl font-[Montserrat] font-extrabold uppercase tracking-tighter leading-none">
                  Course
                  <br />
                  <span className="text-primary">Catalog</span>
                </h1>
              </div>
            </div>
            <p className="text-sm uppercase tracking-widest font-semibold max-w-lg">
              {courses.length} professional certification courses in medical aesthetics, body
              contouring, injectables, and more.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                filter === cat
                  ? "bg-charcoal text-primary"
                  : "bg-white text-charcoal border border-slate-200 hover:border-primary"
              }`}
            >
              {cat === "All" ? "All Courses" : cat}
            </button>
          ))}
        </motion.div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => (
            <FadeIn key={course.num} delay={Math.min(i * 0.04, 0.3)}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="group h-full cursor-pointer"
                onClick={() => setSelectedCourse(course)}
              >
                {course.featured ? (
                  <div className="bg-primary border border-slate-200 geometric-block overflow-hidden flex flex-col h-full shadow-clinical">
                    <div className="bg-charcoal text-white px-4 py-2 flex justify-between items-center border-b border-charcoal">
                      <span className="text-2xl font-black text-primary">{course.num}</span>
                      <span className="text-xs font-bold uppercase tracking-tighter">{course.category}</span>
                    </div>
                    <div className="p-8 flex-grow">
                      <div className="bg-charcoal text-white text-[10px] px-2 py-0.5 inline-block mb-4 font-bold uppercase tracking-widest">Best Value</div>
                      <h3 className="text-2xl font-[Montserrat] font-black uppercase mb-2 text-charcoal">{course.title}</h3>
                      <p className="text-xs font-bold uppercase opacity-70">Complete Certification Program</p>
                    </div>
                    <div className="bg-white p-5 border-t border-charcoal">
                      <div className="flex justify-between items-baseline">
                        <span className="text-charcoal uppercase text-[10px] font-black tracking-widest">With $200 Reservation</span>
                        <div className="text-right">
                          <span className="text-gray-400 line-through text-sm mr-2">{course.price_regular_display}</span>
                          <span className="text-charcoal text-2xl font-black tracking-tight">{course.price_discount_display}</span>
                        </div>
                      </div>
                    </div>
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
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 uppercase font-bold tracking-wider">In-Person</span>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 uppercase font-bold tracking-wider">Online</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-charcoal p-5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-primary uppercase text-[10px] font-black tracking-widest">With Reservation</span>
                        <div className="text-right">
                          <span className="text-gray-500 line-through text-sm mr-2">{course.price_regular_display}</span>
                          <span className="text-white text-2xl font-black tracking-tight">{course.price_discount_display}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </FadeIn>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-charcoal p-12 text-center"
        >
          <h3 className="text-3xl font-[Montserrat] font-black uppercase text-white mb-4">
            Ready to Start?
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Enroll in any course online and begin your journey in medical
            aesthetics. All programs include certification upon completion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/schedule"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="sparkle-btn text-charcoal font-black uppercase text-sm tracking-widest px-8 py-4 inline-block cursor-pointer"
            >
              View Schedule
            </motion.a>
            <motion.a
              href="/#contact"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="border-2 border-primary text-primary font-black uppercase text-sm tracking-widest px-8 py-4 inline-block hover:bg-primary hover:text-charcoal transition-colors cursor-pointer"
            >
              Contact Us
            </motion.a>
          </div>
        </motion.div>
      </main>

      <Footer />

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
