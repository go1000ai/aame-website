import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listCoupons, deleteCoupon, go1000Configured } from "@/lib/go1000";

// Public endpoint — no auth required
// Returns active specials with course_ids for badge targeting
// Automatically deactivates expired specials and deletes them from Go1000.ai
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: specials } = await supabase
      .from("specials")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    const now = new Date();
    const active: typeof specials = [];
    const expiredCodes: string[] = [];

    for (const s of specials || []) {
      if (s.valid_until && new Date(s.valid_until) < now) {
        expiredCodes.push(s.coupon_code);
      } else {
        active.push(s);
      }
    }

    // Auto-cleanup expired specials: deactivate in Supabase + delete from Go1000.ai
    if (expiredCodes.length > 0) {
      // 1. Deactivate in Supabase immediately
      supabase
        .from("specials")
        .update({ active: false })
        .in("coupon_code", expiredCodes)
        .then(() => {});

      // 2. Delete from Go1000.ai in the background (find coupon IDs by matching codes)
      if (go1000Configured) {
        cleanupExpiredFromGo1000(expiredCodes).catch(() => {});
      }
    }

    return NextResponse.json({
      specials: active.map((s) => ({
        coupon_code: s.coupon_code || s.discount_code || "",
        coupon_name: s.coupon_name || s.description_es || s.coupon_code || "",
        discount_type: s.discount_type || s.special_type || "percentage",
        discount_value: s.discount_value || s.special_value || 0,
        course_ids: s.course_ids || [],
      })),
    });
  } catch {
    return NextResponse.json({ specials: [] });
  }
}

// Look up expired coupon codes in Go1000.ai and delete them
async function cleanupExpiredFromGo1000(expiredCodes: string[]) {
  const expiredSet = new Set(expiredCodes.map((c) => c.toUpperCase()));
  const data = await listCoupons();
  const coupons: { _id: string; code: string }[] = data.coupons || data.data || [];

  for (const coupon of coupons) {
    if (coupon.code && expiredSet.has(coupon.code.toUpperCase())) {
      await deleteCoupon(coupon._id).catch(() => {});
    }
  }
}
