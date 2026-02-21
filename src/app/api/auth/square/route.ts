import { NextResponse } from "next/server";
import {
  SQUARE_APP_ID,
  SQUARE_OAUTH_AUTHORIZE_URL,
  SQUARE_OAUTH_SCOPES,
} from "@/lib/square";

// GET /api/auth/square — Redirect to Square's OAuth authorization page
export async function GET() {
  if (!SQUARE_APP_ID) {
    return NextResponse.json(
      { error: "SQUARE_APPLICATION_ID not configured" },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aameaesthetics.com";

  const params = new URLSearchParams({
    client_id: SQUARE_APP_ID,
    scope: SQUARE_OAUTH_SCOPES.join(" "),
    session: "false",
    state,
  });

  const authorizeUrl = `${SQUARE_OAUTH_AUTHORIZE_URL}?${params.toString()}`;

  // Set state in a cookie so we can verify it on callback
  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("square_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
