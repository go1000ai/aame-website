import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SQUARE_ENV = process.env.SQUARE_ENVIRONMENT || "sandbox";

// GET /api/auth/square/status — Check Square connection status
export async function GET() {
  const supabase = await createClient();

  // Verify admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data } = await supabase
    .from("square_settings")
    .select("merchant_id, business_name, location_id, environment, token_expires_at, updated_at")
    .eq("environment", SQUARE_ENV)
    .single();

  if (!data) {
    return NextResponse.json({ connected: false });
  }

  const expiresAt = new Date(data.token_expires_at);
  const isExpired = expiresAt <= new Date();

  return NextResponse.json({
    connected: !isExpired,
    merchantId: data.merchant_id,
    businessName: data.business_name,
    locationId: data.location_id,
    environment: data.environment,
    tokenExpiresAt: data.token_expires_at,
    lastUpdated: data.updated_at,
  });
}

// DELETE /api/auth/square/status — Disconnect Square
export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await supabase.from("square_settings").delete().eq("environment", SQUARE_ENV);

  return NextResponse.json({ disconnected: true });
}
