import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/square";

// Use service-role key for webhook handler (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature") || "";
  const notificationUrl =
    process.env.SQUARE_WEBHOOK_URL ||
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/square`;

  // Verify signature
  if (signature) {
    const valid = await verifyWebhookSignature(
      rawBody,
      signature,
      notificationUrl
    );
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Handle payment.completed event
  if (event.type === "payment.completed") {
    const payment = event.data?.object?.payment;
    if (!payment) {
      return NextResponse.json({ received: true });
    }

    const orderId = payment.order_id || "";
    const squareOrderId = orderId || payment.id;

    // Deduplicate: check if this order already created an enrollment
    if (squareOrderId) {
      const { data: existing } = await supabase
        .from("enrollments")
        .select("id")
        .eq("square_order_id", squareOrderId)
        .single();

      if (existing) {
        return NextResponse.json({ received: true, duplicate: true });
      }
    }

    // Parse metadata from payment note
    let courseId = "";
    let modality: "inperson" | "online" = "inperson";
    let discountCode = "";

    const note = payment.note || "";
    try {
      const meta = JSON.parse(note);
      courseId = meta.courseId || "";
      modality = meta.modality || "inperson";
      discountCode = meta.discountCode || "";
    } catch {
      // Note wasn't JSON — try to extract what we can
    }

    // Get buyer info
    const buyerName =
      payment.buyer_email_address
        ? payment.buyer_email_address.split("@")[0]
        : "Unknown";
    const buyerEmail = payment.buyer_email_address || "";
    const buyerPhone = "";

    // Calculate amount in cents
    const amountCents = payment.total_money?.amount || 0;

    // Create enrollment
    const { error } = await supabase.from("enrollments").insert({
      course_id: courseId || null,
      student_name: buyerName,
      student_email: buyerEmail,
      student_phone: buyerPhone,
      modality,
      payment_method: "square",
      discount_code: discountCode || null,
      total_amount_cents: amountCents,
      deposit_amount_cents: 0,
      amount_paid_cents: amountCents,
      square_order_id: squareOrderId,
      status: "paid",
      access_code: generateAccessCode(),
    });

    if (error) {
      console.error("Square webhook enrollment error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Decrement spots on matching course_schedule
    if (courseId) {
      const { data: schedules } = await supabase
        .from("course_schedule")
        .select("id, spots_available")
        .eq("course_id", courseId)
        .in("status", ["open", "filling"])
        .order("date", { ascending: true })
        .limit(1);

      if (schedules && schedules.length > 0) {
        const sched = schedules[0];
        const newSpots = Math.max(0, sched.spots_available - 1);
        await supabase
          .from("course_schedule")
          .update({
            spots_available: newSpots,
            status: newSpots === 0 ? "sold_out" : newSpots <= 3 ? "filling" : "open",
          })
          .eq("id", sched.id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
