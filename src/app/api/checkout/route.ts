import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutLink, isSquareConfigured } from "@/lib/square";

// POST /api/checkout — Create a Square checkout link for a course
export async function POST(request: Request) {
  if (!(await isSquareConfigured())) {
    return NextResponse.json(
      { error: "Payment system not configured. Connect Square in Admin → Settings." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const { courseId, modality, studentEmail, discountCode } = body;

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Look up course
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  // Base price (use discounted price)
  let priceCents = course.price_discount_cents || course.price_regular_cents;

  // Apply coupon if provided
  let appliedDiscount = "";
  if (discountCode) {
    const { data: special } = await supabase
      .from("specials")
      .select("*")
      .eq("coupon_code", discountCode.toUpperCase())
      .eq("active", true)
      .single();

    if (special) {
      // Check if coupon applies to this course
      const appliesToCourse =
        !special.course_ids ||
        special.course_ids.length === 0 ||
        special.course_ids.includes(courseId);

      if (appliesToCourse) {
        if (special.discount_type === "percentage") {
          priceCents = Math.round(
            priceCents * (1 - special.discount_value / 100)
          );
        } else {
          priceCents = Math.max(0, priceCents - special.discount_value * 100);
        }
        appliedDiscount = discountCode.toUpperCase();
      }
    }
  }

  // Build metadata note (parsed by webhook to link enrollment)
  const metadata = JSON.stringify({
    courseId,
    modality: modality || "inperson",
    discountCode: appliedDiscount,
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aameaesthetics.com";

  try {
    const result = await createCheckoutLink({
      name: `${course.num} — ${course.title} (${modality === "online" ? "Online" : "In-Person"})`,
      amountCents: priceCents,
      redirectUrl: `${baseUrl}/enrollment/success`,
      buyerEmail: studentEmail || undefined,
      note: metadata,
    });

    return NextResponse.json({
      checkoutUrl: result.url,
      orderId: result.orderId,
      priceCents,
      appliedDiscount: appliedDiscount || null,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to create checkout";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
