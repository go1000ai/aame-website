"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ZelleInstructionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ZelleContent />
    </Suspense>
  );
}

function ZelleContent() {
  const searchParams = useSearchParams();
  const receiptNumber = searchParams.get("ref") || "";
  const amount = searchParams.get("amount") || "0";
  const courseTitle = searchParams.get("course") || "Your Course";

  const amountDisplay = `$${(parseInt(amount) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })}`;

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="bg-charcoal text-white p-6 text-center">
          <span className="material-symbols-outlined text-primary text-4xl mb-2 block">
            receipt_long
          </span>
          <h1 className="text-2xl font-[Montserrat] font-black uppercase">
            Zelle Payment Instructions
          </h1>
          <p className="text-gray-400 text-sm mt-1">{courseTitle}</p>
        </div>

        {/* Receipt number highlight */}
        <div className="bg-primary text-charcoal p-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-1">
            Your Receipt Number
          </p>
          <p className="text-3xl font-mono font-black tracking-wider">
            {receiptNumber}
          </p>
          <p className="text-xs mt-1 opacity-70">
            Include this in your Zelle memo
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white p-6 space-y-5">
          <div className="text-center border-b border-gray-100 pb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
              Amount Due
            </p>
            <p className="text-3xl font-black text-charcoal">{amountDisplay}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
              How to Pay
            </h3>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                  1
                </span>
                <div>
                  <p className="text-sm font-semibold">Open your Zelle app</p>
                  <p className="text-xs text-gray-500">
                    Through your bank app or the Zelle app
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                  2
                </span>
                <div>
                  <p className="text-sm font-semibold">Send payment to</p>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm">
                      Email:{" "}
                      <strong className="text-charcoal font-mono bg-gray-100 px-2 py-0.5">
                        aame0edu@gmail.com
                      </strong>
                    </p>
                    <p className="text-xs text-gray-400">or</p>
                    <p className="text-sm">
                      Phone:{" "}
                      <strong className="text-charcoal font-mono bg-gray-100 px-2 py-0.5">
                        (713) 927-5300
                      </strong>
                    </p>
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-7 h-7 bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                  3
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Enter amount:{" "}
                    <span className="text-primary">{amountDisplay}</span>
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-7 h-7 bg-red-50 flex items-center justify-center shrink-0 text-red-500 font-bold text-sm">
                  4
                </span>
                <div>
                  <p className="text-sm font-semibold text-red-600">
                    In the memo, type:{" "}
                    <span className="font-mono bg-red-50 px-2 py-0.5">
                      {receiptNumber}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This is how we match your payment to your enrollment
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 text-sm">
            <div className="flex gap-2">
              <span className="material-symbols-outlined text-amber-500 text-lg shrink-0">
                info
              </span>
              <div>
                <p className="font-semibold text-amber-800 mb-1">
                  What happens next?
                </p>
                <p className="text-amber-700 text-xs leading-relaxed">
                  Once we receive and verify your Zelle payment, we&apos;ll update
                  your enrollment status and send you a confirmation with your
                  access code. This usually takes 1-2 business days.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/"
              className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-6 py-3 text-center hover:brightness-110 transition-all"
            >
              Back to Home
            </Link>
            <Link
              href="/schedule"
              className="border border-gray-300 text-gray-600 font-bold uppercase text-xs tracking-widest px-6 py-3 text-center hover:border-charcoal transition-colors"
            >
              View Schedule
            </Link>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400 mb-2">
            Questions? Contact us
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="tel:+17139275300"
              className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">call</span>
              (713) 927-5300
            </a>
            <a
              href="mailto:aame0edu@gmail.com"
              className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">mail</span>
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
