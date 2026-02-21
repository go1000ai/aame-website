import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { listCoupons, createCoupon, go1000Configured } from "@/lib/go1000";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!go1000Configured) {
    return NextResponse.json({ error: "Go1000.ai not configured" }, { status: 503 });
  }

  try {
    const data = await listCoupons();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list coupons";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!go1000Configured) {
    return NextResponse.json({ error: "Go1000.ai not configured" }, { status: 503 });
  }

  const body = await request.json();
  try {
    const data = await createCoupon(body);

    // Save the coupon→course mapping in Supabase for the specials feature
    const specialRow: Record<string, unknown> = {
      coupon_code: body.code?.toUpperCase() || "",
      coupon_name: body.name || "",
      discount_type: body.discountType || "percentage",
      discount_value: body.discountValue || 0,
      course_ids: body.courseIds || [],
      active: true,
    };
    if (body.endDate) {
      specialRow.valid_until = body.endDate;
    }
    if (body.startDate) {
      specialRow.valid_from = body.startDate;
    }
    const { error: specialsError } = await supabase.from("specials").insert(specialRow);

    return NextResponse.json({
      ...data,
      // Surface the specials error so the admin knows if it failed
      ...(specialsError && { specialsWarning: `Coupon created in Go1000.ai but failed to save to specials: ${specialsError.message}` }),
    }, { status: 201 });
  } catch (err) {
    let message = "Failed to create coupon";
    if (err instanceof Error) {
      // The go1000.ts error includes raw JSON — try to extract the readable message
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
