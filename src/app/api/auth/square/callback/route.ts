import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeOAuthCode,
  getMerchantInfo,
  getLocations,
} from "@/lib/square";
import { createClient } from "@supabase/supabase-js";

const SQUARE_ENV = process.env.SQUARE_ENVIRONMENT || "sandbox";

// GET /api/auth/square/callback — Handle Square OAuth callback
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aameaesthetics.com";

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/admin/settings?square_error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${baseUrl}/admin/settings?square_error=no_code`
    );
  }

  // Verify state parameter
  const cookieStore = await cookies();
  const savedState = cookieStore.get("square_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      `${baseUrl}/admin/settings?square_error=invalid_state`
    );
  }

  try {
    // Exchange authorization code for tokens
    const tokenData = await exchangeOAuthCode(code);

    // Get merchant info
    const merchant = await getMerchantInfo(tokenData.access_token);
    const businessName = merchant?.business_name || "";

    // Get first location
    const locations = await getLocations(tokenData.access_token);
    const locationId = locations[0]?.id || "";

    // Save to Supabase using service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upsert (replace if same environment exists)
    await supabase.from("square_settings").upsert(
      {
        merchant_id: tokenData.merchant_id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: tokenData.expires_at,
        location_id: locationId,
        business_name: businessName,
        environment: SQUARE_ENV,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "environment" }
    );

    // Clear the state cookie
    const response = NextResponse.redirect(
      `${baseUrl}/admin/settings?square_connected=true`
    );
    response.cookies.delete("square_oauth_state");
    return response;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "OAuth exchange failed";
    return NextResponse.redirect(
      `${baseUrl}/admin/settings?square_error=${encodeURIComponent(message)}`
    );
  }
}
