"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/student/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, accessCode }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Invalid credentials");
      setLoading(false);
      return;
    }

    router.push("/student/courses");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <Image
              src="/aame-logo.jpeg"
              alt="AAME Logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full"
            />
            <div className="text-left">
              <span className="font-[Montserrat] font-extrabold text-xl uppercase tracking-tighter">
                AAME
              </span>
              <p className="text-[8px] uppercase tracking-widest text-primary font-bold">
                Student Portal
              </p>
            </div>
          </Link>
          <h1 className="text-2xl font-[Montserrat] font-bold text-charcoal">
            Access Your Courses
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter your email and access code to continue.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8 space-y-6 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Access Code
            </label>
            <input
              type="text"
              required
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter your access code"
              className="w-full px-4 py-3 border border-gray-200 text-sm focus:outline-none focus:border-primary font-mono uppercase"
            />
            <p className="text-xs text-gray-400 mt-1">
              Your access code was sent to your email after payment.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-charcoal font-bold uppercase text-xs tracking-widest px-8 py-3.5 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in..." : "Access My Courses"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Don&apos;t have an access code?{" "}
            <Link href="/courses" className="text-primary font-bold hover:underline">
              Browse Courses
            </Link>
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Need help?{" "}
            <a href="tel:+17139275300" className="text-primary font-bold hover:underline">
              (713) 927-5300
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
