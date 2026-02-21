"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function EnrollmentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white max-w-lg w-full p-8 sm:p-12 text-center shadow-lg"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-4xl">
            check_circle
          </span>
        </div>

        <h1 className="text-3xl font-[Montserrat] font-black text-charcoal uppercase mb-3">
          Payment Received!
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Thank you for enrolling at AAME Academy. Your payment has been
          processed successfully. You will receive a confirmation email with
          your access code and course details shortly.
        </p>

        <div className="bg-primary/5 border border-primary/20 p-5 mb-8 text-left">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
            What&apos;s Next?
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-base mt-0.5">
                mail
              </span>
              Check your email for your access code and enrollment confirmation
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-base mt-0.5">
                login
              </span>
              Use your access code to log into the student portal
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-primary text-base mt-0.5">
                calendar_today
              </span>
              Check the schedule page for your upcoming class dates
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 hover:brightness-110 transition-all"
          >
            Back to Home
          </Link>
          <Link
            href="/student/login"
            className="border-2 border-charcoal text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 hover:bg-charcoal hover:text-white transition-all"
          >
            Student Portal
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Questions? Contact us at{" "}
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
