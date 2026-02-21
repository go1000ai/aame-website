import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service-level access for webhook handler (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Handle payment events from Go1000.ai
  if (event.type === "InvoicePaid" || event.type === "OrderStatusUpdate") {
    const data = event.data || {};

    // Create enrollment record
    const { error } = await supabase.from("enrollments").insert({
      student_name: data.contactName || data.contact?.name || "Unknown",
      student_email: data.contactEmail || data.contact?.email || "",
      student_phone: data.contactPhone || data.contact?.phone || "",
      payment_method: "stripe",
      ghl_order_id: data.orderId || data.id || "",
      total_amount_cents: Math.round((data.amount || 0) * 100),
      amount_paid_cents: Math.round((data.amount || 0) * 100),
      status: "paid",
      modality: "inperson",
    });

    if (error) {
      console.error("Webhook enrollment error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
