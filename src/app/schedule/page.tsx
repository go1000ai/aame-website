"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/browser";
import { SAMPLE_SCHEDULE } from "@/lib/sample-data";
import type { CourseSchedule } from "@/lib/supabase/types";

const categoryColors: Record<string, string> = {
  Injectables: "bg-primary text-charcoal",
  "Fillers & Volume": "bg-primary text-charcoal",
  "Skin Care": "bg-emerald-500 text-white",
  Medical: "bg-blue-600 text-white",
  Body: "bg-violet-600 text-white",
  "Body Tech": "bg-violet-600 text-white",
  "Facial Tech": "bg-pink-500 text-white",
  Lifting: "bg-amber-500 text-charcoal",
  "Skin Tightening": "bg-rose-500 text-white",
  Dermatology: "bg-teal-600 text-white",
  "Blood Science": "bg-red-600 text-white",
  "Full Package": "bg-charcoal text-primary",
};

const statusConfig = {
  open: { label: "Open", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  filling: { label: "Filling Fast", color: "bg-amber-100 text-amber-800 border-amber-200" },
  sold_out: { label: "Sold Out", color: "bg-red-100 text-red-700 border-red-200" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-500 border-gray-200" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate(),
    weekday: date.toLocaleDateString("en-US", { weekday: "long" }),
    full: date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingSample, setUsingSample] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("course_schedule")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) {
          setSchedule(SAMPLE_SCHEDULE);
          setUsingSample(true);
        } else {
          setSchedule(data);
        }
        setLoading(false);
      });
  }, []);

  const categories = ["all", ...new Set(schedule.map((s) => s.category))];
  const filtered =
    filter === "all" ? schedule : schedule.filter((s) => s.category === filter);

  return (
    <div className="bg-[#f8fafc] text-charcoal antialiased font-sans min-h-screen">
      <Navbar />

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
                  calendar_month
                </span>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h1 className="text-4xl md:text-5xl font-[Montserrat] font-extrabold uppercase tracking-tighter leading-none">
                  Course
                  <br />
                  <span className="text-primary">Schedule</span>
                </h1>
              </div>
            </div>
            <p className="text-sm uppercase tracking-widest font-semibold max-w-lg">
              Upcoming on-site training sessions. Reserve your spot — class
              sizes are limited for hands-on learning.
            </p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        {usingSample && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-50 border border-amber-200 p-4 mb-8 flex items-start gap-3"
          >
            <span className="material-symbols-outlined text-amber-600 mt-0.5">
              info
            </span>
            <div>
              <p className="font-bold text-amber-800 text-sm">
                Sample Schedule Data
              </p>
              <p className="text-amber-700 text-xs mt-1">
                Connect your Supabase project to display live schedule data.
                These are placeholder entries for preview purposes.
              </p>
            </div>
          </motion.div>
        )}

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
              {cat === "all" ? "All Courses" : cat}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">
              event_busy
            </span>
            <p className="text-lg font-bold text-gray-400">
              No upcoming sessions
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Check back soon for new dates.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filtered.map((course, i) => {
              const date = formatDate(course.date);
              const status = statusConfig[course.status];
              const catColor =
                categoryColors[course.category] || "bg-gray-500 text-white";
              const spotsPercent =
                course.spots_total > 0
                  ? ((course.spots_total - course.spots_available) /
                      course.spots_total) *
                    100
                  : 100;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  whileHover={{ x: 4 }}
                  className="bg-white border border-slate-200 shadow-clinical overflow-hidden group"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Date block */}
                    <div className="bg-charcoal text-white p-6 flex flex-row md:flex-col items-center justify-center gap-2 md:gap-0 md:min-w-[120px] shrink-0">
                      <span className="text-primary text-xs font-bold tracking-widest">
                        {date.month}
                      </span>
                      <span className="text-4xl font-[Montserrat] font-black leading-none">
                        {date.day}
                      </span>
                      <span className="text-gray-400 text-xs font-semibold uppercase">
                        {date.weekday}
                      </span>
                    </div>

                    {/* Course info */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 ${catColor}`}
                        >
                          {course.category}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      <h3 className="text-2xl font-[Montserrat] font-black uppercase mb-2 group-hover:text-primary transition-colors">
                        {course.course_name}
                      </h3>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            schedule
                          </span>
                          {course.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            location_on
                          </span>
                          {course.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">
                            person
                          </span>
                          {course.instructor}
                        </span>
                      </div>

                      {/* Spots progress bar */}
                      {course.status !== "completed" && (
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 overflow-hidden max-w-[200px]">
                            <div
                              className={`h-full transition-all duration-500 ${
                                course.spots_available === 0
                                  ? "bg-red-500"
                                  : spotsPercent > 70
                                    ? "bg-amber-500"
                                    : "bg-primary"
                              }`}
                              style={{ width: `${spotsPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-400">
                            {course.spots_available} / {course.spots_total}{" "}
                            spots left
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price & CTA */}
                    <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 p-6 md:border-l border-slate-100 md:min-w-[200px] shrink-0">
                      <div className="text-center">
                        {course.price_discount_display && course.price_regular_display ? (
                          <>
                            <span className="text-gray-400 line-through text-sm block">
                              {course.price_regular_display}
                            </span>
                            <span className="text-2xl font-black tracking-tight text-primary">
                              {course.price_discount_display}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              with $200 reservation
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-black tracking-tight">
                            {course.price}
                          </span>
                        )}
                      </div>
                      {course.status !== "sold_out" &&
                      course.status !== "completed" ? (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="sparkle-btn text-charcoal font-black uppercase text-xs tracking-widest px-6 py-3 cursor-pointer"
                        >
                          Reserve Spot
                        </motion.button>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          {course.status === "sold_out"
                            ? "Waitlist"
                            : "Finished"}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 bg-charcoal p-12 text-center"
        >
          <h3 className="text-3xl font-[Montserrat] font-black uppercase text-white mb-4">
            Don&apos;t See Your Date?
          </h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            New sessions are added regularly. Contact us to request a specific
            date or join our mailing list for schedule updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/#contact"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="sparkle-btn text-charcoal font-black uppercase text-sm tracking-widest px-8 py-4 inline-block cursor-pointer"
            >
              Contact Us
            </motion.a>
            <motion.a
              href="/courses"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="border-2 border-primary text-primary font-black uppercase text-sm tracking-widest px-8 py-4 inline-block hover:bg-primary hover:text-charcoal transition-colors cursor-pointer"
            >
              View All Courses
            </motion.a>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
