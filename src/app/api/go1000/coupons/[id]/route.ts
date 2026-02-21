import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { deleteCoupon, updateCoupon, go1000Configured } from "@/lib/go1000";

// PUT /api/go1000/coupons/[id] — Update coupon (delete + recreate on GHL) + update Supabase specials
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!go1000Configured) {
    return NextResponse.json({ error: "Go1000.ai not configured" }, { status: 503 });
  }

  const body = await request.json();
  const oldCode = (body.oldCouponCode || "").toUpperCase();

  try {
    // Update coupon on Go1000.ai (delete old + create new)
    const data = await updateCoupon(id, {
      name: body.name,
      code: body.code,
      discountType: body.discountType,
      discountValue: body.discountValue,
      startDate: body.startDate,
      endDate: body.endDate,
      maxRedemptions: body.maxRedemptions,
    });

    // Update the Supabase specials row
    const newCode = (body.code || "").toUpperCase();
    const updateData: Record<string, unknown> = {
      coupon_code: newCode,
      coupon_name: body.name || "",
      discount_type: body.discountType || "percentage",
      discount_value: body.discountValue || 0,
      course_ids: body.courseIds || [],
      valid_from: body.startDate || null,
      valid_until: body.endDate || null,
    };

    if (oldCode && oldCode !== newCode) {
      // Code changed — delete old row, insert new
      await supabase.from("specials").delete().eq("coupon_code", oldCode);
      await supabase.from("specials").insert({ ...updateData, active: true });
    } else if (oldCode) {
      // Same code — just update
      await supabase.from("specials").update(updateData).eq("coupon_code", oldCode);
    }

    return NextResponse.json(data);
  } catch (err) {
    let message = "Failed to update coupon";
    if (err instanceof Error) {
      const jsonMatch = err.message.match(/:\s*(\{.+\})\s*$/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          message = parsed.message || err.message;
        } catch {
          message = err.message;
        }
      } else {
        message = err.message;
      }
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!go1000Configured) {
    return NextResponse.json({ error: "Go1000.ai not configured" }, { status: 503 });
  }

  // Read coupon code from request body so we can clean up specials
  let couponCode = "";
  try {
    const body = await request.json();
    couponCode = body.couponCode || "";
  } catch {
    // Body may be empty — that's fine, we'll skip specials cleanup
  }

  try {
    await deleteCoupon(id);

    // Also deactivate/remove the matching special in Supabase
    if (couponCode) {
      await supabase
        .from("specials")
        .delete()
        .eq("coupon_code", couponCode.toUpperCase());
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete coupon";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
