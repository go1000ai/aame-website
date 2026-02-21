import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { listCoupons, go1000Configured } from "@/lib/go1000";

// Auto-match a coupon name to course IDs by checking if any course title
// appears in the coupon name (case-insensitive). e.g. "Winter Botox Basico Promo"
// matches course "Botox Basico" → returns ["s04"].
function autoMatchCourses(
  couponName: string,
  allCourses: { id: string; title: string }[]
): string[] {
  const name = couponName.toLowerCase();
  const matched: string[] = [];
  for (const course of allCourses) {
    if (name.includes(course.title.toLowerCase())) {
      matched.push(course.id);
    }
  }
  return matched;
}

// POST /api/admin/specials — Sync Go1000.ai coupons → Supabase specials table
// - Inserts missing specials
// - Auto-matches coupon names to courses
// - Updates existing specials that have empty course_ids
// - Removes orphaned specials
export async function POST(_request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!go1000Configured) {
    return NextResponse.json(
      { error: "Go1000.ai not configured" },
      { status: 503 }
    );
  }

  try {
    // 1. Fetch all coupons from Go1000.ai
    const ghlData = await listCoupons();
    const ghlCoupons: {
      _id: string;
      name: string;
      code: string;
      discountType: string;
      discountValue: number;
    }[] = ghlData.coupons || ghlData.data || [];

    if (ghlCoupons.length === 0) {
      return NextResponse.json({
        synced: 0,
        skipped: 0,
        message: "No coupons found in Go1000.ai",
      });
    }

    // 2. Fetch courses for auto-matching
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title")
      .eq("active", true);
    const allCourses = (coursesData || []) as { id: string; title: string }[];

    // 3. Fetch existing specials from Supabase
    const { data: existingSpecials } = await supabase
      .from("specials")
      .select("coupon_code, coupon_name, course_ids");
    const existingMap = new Map(
      (existingSpecials || []).map((s) => [s.coupon_code?.toUpperCase(), s])
    );

    // 4. Remove orphaned specials (not in Go1000.ai)
    const ghlCodes = new Set(
      ghlCoupons.map((c) => c.code?.toUpperCase()).filter(Boolean)
    );
    let removed = 0;
    for (const existing of existingSpecials || []) {
      const code = existing.coupon_code?.toUpperCase();
      if (code && !ghlCodes.has(code)) {
        await supabase.from("specials").delete().eq("coupon_code", code);
        removed++;
      }
    }

    // 5. Insert missing coupons + update existing ones with empty course_ids
    let synced = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const coupon of ghlCoupons) {
      const code = coupon.code?.toUpperCase();
      if (!code) continue;

      const matchedCourseIds = autoMatchCourses(coupon.name, allCourses);
      const existing = existingMap.get(code);

      if (existing) {
        // Already exists — check if it needs course_ids auto-filled
        const currentIds = existing.course_ids || [];
        if (currentIds.length === 0 && matchedCourseIds.length > 0) {
          const { error } = await supabase
            .from("specials")
            .update({ course_ids: matchedCourseIds })
            .eq("coupon_code", code);
          if (error) {
            errors.push(`${code} update: ${error.message}`);
          } else {
            updated++;
          }
        } else {
          skipped++;
        }
        continue;
      }

      // New — insert with auto-matched courses
      const { error } = await supabase.from("specials").insert({
        coupon_code: code,
        coupon_name: coupon.name || code,
        discount_type: coupon.discountType || "percentage",
        discount_value: coupon.discountValue || 0,
        course_ids: matchedCourseIds,
        active: true,
      });

      if (error) {
        errors.push(`${code}: ${error.message}`);
      } else {
        synced++;
      }
    }

    return NextResponse.json({
      synced,
      updated,
      skipped,
      removed,
      total: ghlCoupons.length,
      ...(errors.length > 0 && { errors }),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to sync specials";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

// PATCH /api/admin/specials — Update course_ids for a special
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { couponCode, courseIds } = await request.json();
    if (!couponCode) {
      return NextResponse.json(
        { error: "couponCode is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("specials")
      .update({ course_ids: courseIds || [] })
      .eq("coupon_code", couponCode.toUpperCase());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update special" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/specials — Remove a special by coupon code
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { couponCode } = await request.json();
    if (!couponCode) {
      return NextResponse.json(
        { error: "couponCode is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("specials")
      .delete()
      .eq("coupon_code", couponCode.toUpperCase());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete special" },
      { status: 500 }
    );
  }
}
