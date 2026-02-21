"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-charcoal border border-gray-700 p-3">
              <span className="material-symbols-outlined text-primary text-3xl">
                admin_panel_settings
              </span>
            </div>
            <div className="text-left">
              <span className="font-[Montserrat] font-extrabold text-2xl text-white uppercase tracking-tighter">
                AAME
              </span>
              <p className="text-[9px] uppercase tracking-widest text-primary font-bold">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-charcoal border border-gray-700 p-8 space-y-6"
        >
          <h1 className="text-xl font-[Montserrat] font-bold text-white uppercase">
            Sign In
          </h1>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary text-sm"
              placeholder="admin@aame.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-charcoal font-bold uppercase text-sm tracking-widest py-3 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
