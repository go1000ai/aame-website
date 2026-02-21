// Square API integration with OAuth support
// Reads credentials from DB (OAuth flow) with fallback to env vars

const SQUARE_ENV = process.env.SQUARE_ENVIRONMENT || "sandbox";
const SQUARE_BASE_URL =
  SQUARE_ENV === "production"
    ? "https://connect.squareup.com/v2"
    : "https://connect.squareupsandbox.com/v2";

// Env-var fallbacks (used if no OAuth token in DB)
const ENV_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN || "";
const ENV_LOCATION_ID = process.env.SQUARE_LOCATION_ID || "";
export const SQUARE_WEBHOOK_SIGNATURE_KEY =
  process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "";

// OAuth app credentials (needed for OAuth flow + token refresh)
export const SQUARE_APP_ID = process.env.SQUARE_APPLICATION_ID || "";
export const SQUARE_APP_SECRET = process.env.SQUARE_APPLICATION_SECRET || "";

const SQUARE_OAUTH_BASE =
  SQUARE_ENV === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";

export const SQUARE_OAUTH_AUTHORIZE_URL = `${SQUARE_OAUTH_BASE}/oauth2/authorize`;
export const SQUARE_OAUTH_TOKEN_URL = `${SQUARE_OAUTH_BASE}/oauth2/token`;

// Required OAuth scopes
export const SQUARE_OAUTH_SCOPES = [
  "PAYMENTS_READ",
  "PAYMENTS_WRITE",
  "ORDERS_READ",
  "ORDERS_WRITE",
  "MERCHANT_PROFILE_READ",
  "ITEMS_READ",
  "ONLINE_STORE_SITE_READ",
];

// ── Credentials from DB ──

type SquareCredentials = {
  accessToken: string;
  locationId: string;
  webhookSignatureKey: string;
};

/**
 * Get Square credentials. Tries database first (OAuth tokens), falls back to env vars.
 * Also auto-refreshes tokens if they expire within 24 hours.
 */
export async function getSquareCredentials(): Promise<SquareCredentials> {
  // Try to get from database
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from("square_settings")
        .select("*")
        .eq("environment", SQUARE_ENV)
        .single();

      if (data) {
        // Check if token needs refresh (expires within 24 hours)
        const expiresAt = new Date(data.token_expires_at);
        const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);

        if (expiresAt <= oneDayFromNow && data.refresh_token) {
          const refreshed = await refreshOAuthToken(data.refresh_token);
          if (refreshed) {
            // Update DB with new tokens
            await supabase
              .from("square_settings")
              .update({
                access_token: refreshed.access_token,
                refresh_token: refreshed.refresh_token,
                token_expires_at: refreshed.expires_at,
                updated_at: new Date().toISOString(),
              })
              .eq("id", data.id);

            return {
              accessToken: refreshed.access_token,
              locationId: data.location_id || "",
              webhookSignatureKey: data.webhook_signature_key || "",
            };
          }
        }

        return {
          accessToken: data.access_token,
          locationId: data.location_id || "",
          webhookSignatureKey: data.webhook_signature_key || "",
        };
      }
    }
  } catch {
    // DB not available, fall through to env vars
  }

  // Fallback to env vars
  return {
    accessToken: ENV_ACCESS_TOKEN,
    locationId: ENV_LOCATION_ID,
    webhookSignatureKey: SQUARE_WEBHOOK_SIGNATURE_KEY,
  };
}

/**
 * Check if Square is configured (either via DB or env vars).
 */
export async function isSquareConfigured(): Promise<boolean> {
  const creds = await getSquareCredentials();
  return Boolean(creds.accessToken && creds.locationId);
}

// Sync check using env vars only (for fast checks that don't need DB)
export const squareConfigured = Boolean(ENV_ACCESS_TOKEN && ENV_LOCATION_ID);

function makeHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "Square-Version": "2025-01-23",
  };
}

// ── OAuth Token Exchange ──

export async function exchangeOAuthCode(code: string) {
  const res = await fetch(SQUARE_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SQUARE_APP_ID,
      client_secret: SQUARE_APP_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Square OAuth token exchange failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: string;
    merchant_id: string;
    token_type: string;
  }>;
}

export async function refreshOAuthToken(refreshToken: string) {
  try {
    const res = await fetch(SQUARE_OAUTH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SQUARE_APP_ID,
        client_secret: SQUARE_APP_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!res.ok) return null;

    return res.json() as Promise<{
      access_token: string;
      refresh_token: string;
      expires_at: string;
    }>;
  } catch {
    return null;
  }
}

// ── Get Merchant Info ──

export async function getMerchantInfo(accessToken: string) {
  const res = await fetch(`${SQUARE_BASE_URL}/merchants/me`, {
    headers: makeHeaders(accessToken),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.merchant || null;
}

export async function getLocations(accessToken: string) {
  const res = await fetch(`${SQUARE_BASE_URL}/locations`, {
    headers: makeHeaders(accessToken),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.locations || [];
}

// ── Checkout ──

export async function createCheckoutLink(data: {
  name: string;
  amountCents: number;
  redirectUrl: string;
  buyerEmail?: string;
  note?: string;
}) {
  const creds = await getSquareCredentials();
  if (!creds.accessToken || !creds.locationId) {
    throw new Error("Square is not configured");
  }

  const idempotencyKey = crypto.randomUUID();

  const payload: Record<string, unknown> = {
    idempotency_key: idempotencyKey,
    quick_pay: {
      name: data.name,
      price_money: {
        amount: data.amountCents,
        currency: "USD",
      },
      location_id: creds.locationId,
    },
    checkout_options: {
      redirect_url: data.redirectUrl,
    },
  };

  if (data.note) {
    payload.payment_note = data.note;
  }

  if (data.buyerEmail) {
    payload.pre_populated_data = {
      buyer_email: data.buyerEmail,
    };
  }

  const res = await fetch(`${SQUARE_BASE_URL}/online-checkout/payment-links`, {
    method: "POST",
    headers: makeHeaders(creds.accessToken),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Square createCheckoutLink failed (${res.status}): ${text}`);
  }

  const result = await res.json();
  return {
    url: result.payment_link?.url || result.payment_link?.long_url || "",
    id: result.payment_link?.id || "",
    orderId: result.payment_link?.order_id || result.related_resources?.orders?.[0]?.id || "",
  };
}

// ── Payments ──

export async function getPayment(paymentId: string) {
  const creds = await getSquareCredentials();
  const res = await fetch(`${SQUARE_BASE_URL}/payments/${paymentId}`, {
    headers: makeHeaders(creds.accessToken),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.payment || null;
}

// ── Orders ──

export async function getOrder(orderId: string) {
  const creds = await getSquareCredentials();
  const res = await fetch(`${SQUARE_BASE_URL}/orders/${orderId}`, {
    method: "POST",
    headers: makeHeaders(creds.accessToken),
    body: JSON.stringify({ order_ids: [orderId] }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.orders?.[0] || null;
}

// ── Webhook Signature Verification ──

export async function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  notificationUrl: string
): Promise<boolean> {
  const creds = await getSquareCredentials();
  const sigKey = creds.webhookSignatureKey || SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!sigKey) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sigKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const data = encoder.encode(notificationUrl + rawBody);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return computed === signature;
}
