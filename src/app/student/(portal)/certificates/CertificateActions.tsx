"use client";

import Link from "next/link";

export default function CertificateActions() {
  return (
    <div className="flex items-center justify-between mb-6 print:hidden">
      <Link
        href="/student/certificates"
        className="text-gray-400 hover:text-charcoal transition-colors flex items-center gap-1 text-sm"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Back to Certificates
      </Link>
      <button
        onClick={() => window.print()}
        className="bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-5 py-2.5 hover:brightness-110 transition-all cursor-pointer flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-base">print</span>
        Print / Download PDF
      </button>
    </div>
  );
}
