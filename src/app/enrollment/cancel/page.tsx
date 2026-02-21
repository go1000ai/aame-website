"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function EnrollmentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white max-w-lg w-full p-8 sm:p-12 text-center shadow-lg"
      >
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-gray-400 text-4xl">
            close
          </span>
        </div>

        <h1 className="text-3xl font-[Montserrat] font-black text-charcoal uppercase mb-3">
          Payment Cancelled
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          No worries — your payment was not processed. You can return to our
          course catalog to try again or explore other courses.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 hover:brightness-110 transition-all"
          >
            Browse Courses
          </Link>
          <Link
            href="/schedule"
            className="border-2 border-charcoal text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 hover:bg-charcoal hover:text-white transition-all"
          >
            View Schedule
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Need help? Contact us at{" "}
          <a
            href="tel:+17139275300"
            className="text-primary font-bold hover:underline"
          >
            (713) 927-5300
          </a>{" "}
          or{" "}
          <a
            href="mailto:aame0edu@gmail.com"
            className="text-primary font-bold hover:underline"
          >
            aame0edu@gmail.com
          </a>
        </p>
      </motion.div>
    </div>
  );
}
