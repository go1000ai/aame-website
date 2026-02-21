import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/admin/specials — List all specials
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("specials")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH /api/admin/specials — Update course_ids for a special
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { couponCode, courseIds } = await request.json();
    if (!couponCode) {
      return NextResponse.json({ error: "couponCode is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("specials")
      .update({ course_ids: courseIds || [] })
      .eq("coupon_code", couponCode.toUpperCase());

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update special" }, { status: 500 });
  }
}

// DELETE /api/admin/specials — Remove a special by coupon code
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { couponCode } = await request.json();
    if (!couponCode) {
      return NextResponse.json({ error: "couponCode is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("specials")
      .delete()
      .eq("coupon_code", couponCode.toUpperCase());

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete special" }, { status: 500 });
  }
}
