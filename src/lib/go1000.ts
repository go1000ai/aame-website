// Go1000.ai API integration (services.leadconnectorhq.com)
const GO1000_BASE_URL = process.env.GO1000_BASE_URL || process.env.GHL_BASE_URL || "https://services.leadconnectorhq.com";
const GO1000_API_TOKEN = process.env.GO1000_API_TOKEN || process.env.GHL_API_TOKEN || "";
const GO1000_LOCATION_ID = process.env.GO1000_LOCATION_ID || process.env.GHL_LOCATION_ID || "";

const headers = {
  Authorization: `Bearer ${GO1000_API_TOKEN}`,
  "Content-Type": "application/json",
  Version: "2021-07-28",
};

export const go1000Configured = Boolean(GO1000_API_TOKEN && GO1000_LOCATION_ID);

// ── Coupons ──

const couponBase = `${GO1000_BASE_URL}/payments/coupon`;
const altParams = `altId=${GO1000_LOCATION_ID}&altType=location`;

export async function listCoupons() {
  const res = await fetch(`${couponBase}/list?${altParams}`, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Go1000.ai listCoupons failed (${res.status}): ${text}`);
  }
  return res.json();
}

export async function getCoupon(couponId: string) {
  const res = await fetch(`${couponBase}/${couponId}?${altParams}`, { headers });
  if (!res.ok) return null;
  return res.json();
}

export async function createCoupon(data: {
  name: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate?: string;
  durationLimitInMonths?: number;
  maxRedemptions?: number;
  productIds?: string[];
}) {
  const payload: Record<string, unknown> = {
    name: data.name,
    code: data.code,
    discountType: data.discountType,
    discountValue: data.discountValue,
    startDate: data.startDate,
    altId: GO1000_LOCATION_ID,
    altType: "location",
  };
  if (data.endDate) payload.endDate = data.endDate;
  if (data.maxRedemptions) payload.maxRedemptions = data.maxRedemptions;
  if (data.durationLimitInMonths) payload.durationLimitInMonths = data.durationLimitInMonths;
  if (data.productIds && data.productIds.length > 0) payload.productIds = data.productIds;

  const res = await fetch(couponBase, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Go1000.ai createCoupon failed (${res.status}): ${text}`);
  }
  return res.json();
}

// GHL doesn't support PUT for coupons — delete the old one and create a new one
export async function updateCoupon(
  oldCouponId: string,
  data: {
    name: string;
    code: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    startDate: string;
    endDate?: string;
    maxRedemptions?: number;
    productIds?: string[];
  }
) {
  await deleteCoupon(oldCouponId);
  return createCoupon(data);
}

export async function deleteCoupon(couponId: string) {
  // GoHighLevel DELETE requires id, altId, altType in the request body
  const res = await fetch(couponBase, {
    method: "DELETE",
    headers,
    body: JSON.stringify({
      id: couponId,
      altId: GO1000_LOCATION_ID,
      altType: "location",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Go1000.ai deleteCoupon failed (${res.status}): ${text}`);
  }
  return res.json();
}

// ── Contacts ──

export async function createContact(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags?: string[];
}) {
  const res = await fetch(`${GO1000_BASE_URL}/contacts/`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ...data,
      locationId: GO1000_LOCATION_ID,
    }),
  });
  if (!res.ok) throw new Error(`Go1000.ai createContact failed: ${res.status}`);
  return res.json();
}

// ── Orders ──

export async function getOrder(orderId: string) {
  const res = await fetch(
    `${GO1000_BASE_URL}/payments/orders/${orderId}?locationId=${GO1000_LOCATION_ID}`,
    { headers }
  );
  if (!res.ok) return null;
  return res.json();
}
