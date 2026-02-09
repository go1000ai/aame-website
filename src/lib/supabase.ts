import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured =
  supabaseUrl &&
  supabaseUrl !== "your_supabase_url_here" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "your_supabase_anon_key_here";

// Only create the real client when credentials are configured
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseConfigured = isConfigured;

export type CourseSchedule = {
  id: string;
  course_name: string;
  date: string;
  time: string;
  location: string;
  instructor: string;
  spots_total: number;
  spots_available: number;
  status: "open" | "filling" | "sold_out" | "completed";
  price: string;
  category: string;
  created_at: string;
};
