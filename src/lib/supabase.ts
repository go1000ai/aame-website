// Compatibility shim — re-exports from new module structure
// Existing code that imports from "@/lib/supabase" continues to work.
import { createClient as createBrowserClientFn } from "@supabase/supabase-js";

export type { CourseSchedule } from "@/lib/supabase/types";
export type { Course } from "@/lib/supabase/types";
export type { Enrollment } from "@/lib/supabase/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isConfigured =
  supabaseUrl &&
  supabaseUrl !== "your_supabase_url_here" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "your_supabase_anon_key_here";

export const supabase = isConfigured
  ? createBrowserClientFn(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseConfigured = isConfigured;
