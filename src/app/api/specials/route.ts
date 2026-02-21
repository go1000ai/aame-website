import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Public endpoint — no auth required
// Returns active specials with course_ids for badge targeting
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: specials } = await supabase
      .from("specials")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      specials: (specials || []).map((s) => ({
        coupon_code: s.coupon_code || "",
        coupon_name: s.coupon_name || s.coupon_code || "",
        discount_type: s.discount_type || "percentage",
        discount_value: s.discount_value || 0,
        course_ids: s.course_ids || [],
      })),
    });
  } catch {
    return NextResponse.json({ specials: [] });
  }
}
