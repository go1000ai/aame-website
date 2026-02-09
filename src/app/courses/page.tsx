"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";

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

type Course = {
  num: string;
  category: string;
  title: string;
  price: string;
  featured?: boolean;
};

const courses: Course[] = [
  { num: "01", category: "Body Tech", title: "Aparatologia Corporal", price: "$850.00" },
  { num: "02", category: "Facial Tech", title: "Aparatologia Facial", price: "$650.00" },
  { num: "03", category: "Injectables", title: "Botox Avanzado", price: "$1,400.00" },
  { num: "04", category: "Injectables", title: "Botox Basico", price: "$1,150.00" },
  { num: "05", category: "Skin Care", title: "Dermaplening", price: "$350.00" },
  { num: "06", category: "Medical", title: "EKG Tech+ CPR BLS", price: "$1,016.00" },
  { num: "07", category: "Skin Tightening", title: "Fibroblast", price: "$1,150.00" },
  { num: "08", category: "Fillers & Volume", title: "Fillers Avanzado", price: "$1,250.00" },
  { num: "09", category: "Fillers & Volume", title: "Fillers Basico", price: "$1,150.00" },
  { num: "10", category: "Full Package", title: "Full Package", price: "$2,995.00", featured: true },
  { num: "11", category: "Lifting", title: "Hilos de PDO", price: "$1,650.00" },
  { num: "12", category: "Skin Care", title: "Hydradermoabración", price: "$150.00" },
  { num: "13", category: "Body", title: "Linfático", price: "$450.00" },
  { num: "14", category: "Body", title: "Maderoterapia", price: "$450.00" },
  { num: "15", category: "Skin Care", title: "Microdermoabrasión", price: "$175.00" },
  { num: "16", category: "Dermatology", title: "Microneedling", price: "$350.00" },
  { num: "17", category: "Skin Care", title: "Peeling", price: "$650.00" },
  { num: "18", category: "Medical", title: "Phlebotomy", price: "$1,150.00" },
  { num: "19", category: "Blood Science", title: "Plasma PRP", price: "$650.00" },
  { num: "20", category: "Body", title: "Reflexologia Corporal", price: "$800.00" },
  { num: "21", category: "Body", title: "Reflexologia Podal y Craneal", price: "$600.00" },
];

const categories = ["All", ...new Set(courses.map((c) => c.category))] as string[];

export default function CoursesPage() {
  const [filter, setFilter] = useState("All");

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
              21 professional certification courses in medical aesthetics, body
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
                className="group h-full"
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
                    <div className="bg-white p-5 flex justify-between items-center border-t border-charcoal">
                      <span className="text-charcoal uppercase text-[10px] font-black tracking-widest">Bundle Price</span>
                      <span className="text-charcoal text-2xl font-black tracking-tight">{course.price}</span>
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
                    </div>
                    <div className="bg-charcoal p-5 flex justify-between items-center">
                      <span className="text-primary uppercase text-[10px] font-black tracking-widest">Online Cost</span>
                      <span className="text-white text-2xl font-black tracking-tight">{course.price}</span>
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
              href="#contact"
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
    </div>
  );
}
