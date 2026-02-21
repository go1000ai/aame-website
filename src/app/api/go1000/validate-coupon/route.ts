import { NextResponse } from "next/server";
import { getCoupon, go1000Configured } from "@/lib/go1000";

export async function POST(request: Request) {
  if (!go1000Configured) {
    return NextResponse.json({ error: "Go1000.ai not configured" }, { status: 503 });
  }

  const { code } = await request.json();
  if (!code) {
    return NextResponse.json({ error: "Code is required" }, { status: 400 });
  }

  const coupon = await getCoupon(code);
  if (!coupon) {
    return NextResponse.json({ valid: false, error: "Coupon not found" }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    name: coupon.name,
  });
}
