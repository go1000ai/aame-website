"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type SquareStatus = {
  connected: boolean;
  merchantId?: string;
  businessName?: string;
  locationId?: string;
  environment?: string;
  tokenExpiresAt?: string;
  lastUpdated?: string;
};

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [squareStatus, setSquareStatus] = useState<SquareStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const squareConnected = searchParams.get("square_connected");
  const squareError = searchParams.get("square_error");

  useEffect(() => {
    fetch("/api/auth/square/status")
      .then((r) => r.json())
      .then((data) => {
        setSquareStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleDisconnect() {
    if (!confirm("Disconnect Square? Students won't be able to pay online until you reconnect.")) return;
    setDisconnecting(true);
    await fetch("/api/auth/square/status", { method: "DELETE" });
    setSquareStatus({ connected: false });
    setDisconnecting(false);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-[Montserrat] font-bold text-charcoal">
          Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure integrations and platform settings
        </p>
      </div>

      {/* Success/Error banners */}
      {squareConnected && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 mb-6 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          Square connected successfully! You can now accept online payments.
        </div>
      )}
      {squareError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          Square connection failed: {squareError}
        </div>
      )}

      {/* Square Integration */}
      <div className="bg-white border border-gray-200 mb-6">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M4.01 0C1.8 0 0 1.8 0 4.01v15.98C0 22.2 1.8 24 4.01 24h15.98C22.2 24 24 22.2 24 19.99V4.01C24 1.8 22.2 0 19.99 0H4.01zm11.67 7.12c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36zm-4.38 0c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36zM6.92 7.12c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36zm8.76 4.38c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36zm-4.38 0c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36zm-4.38 0c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36zm8.76 4.38c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36zm-4.38 0c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36zm-4.38 0c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-[Montserrat] font-bold text-charcoal">
                Square Payments
              </h2>
              <p className="text-xs text-gray-500">
                Accept credit card payments online via Square
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : squareStatus?.connected ? (
            <>
              {/* Connected state */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <span className="text-sm font-semibold text-emerald-600">Connected</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Business Name
                  </p>
                  <p className="text-sm font-medium">
                    {squareStatus.businessName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Merchant ID
                  </p>
                  <p className="text-sm font-mono text-gray-600">
                    {squareStatus.merchantId}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Location ID
                  </p>
                  <p className="text-sm font-mono text-gray-600">
                    {squareStatus.locationId || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Environment
                  </p>
                  <p className="text-sm">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                        squareStatus.environment === "production"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {squareStatus.environment}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Token Expires
                  </p>
                  <p className="text-sm text-gray-600">
                    {squareStatus.tokenExpiresAt
                      ? new Date(squareStatus.tokenExpiresAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Last Updated
                  </p>
                  <p className="text-sm text-gray-600">
                    {squareStatus.lastUpdated
                      ? new Date(squareStatus.lastUpdated).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href="/api/auth/square"
                  className="border border-gray-300 text-gray-600 font-bold uppercase text-xs tracking-widest px-5 py-2.5 hover:border-charcoal transition-colors inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                  Reconnect
                </a>
                <button
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="border border-red-300 text-red-500 font-bold uppercase text-xs tracking-widest px-5 py-2.5 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">link_off</span>
                  {disconnecting ? "Disconnecting..." : "Disconnect"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Not connected state */}
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-4 block">
                  credit_card_off
                </span>
                <p className="text-gray-500 font-medium mb-2">
                  Square is not connected
                </p>
                <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                  Connect your Square account to accept online credit card payments.
                  Your client clicks the button below and authorizes access — no
                  API keys needed.
                </p>
                <a
                  href="/api/auth/square"
                  className="inline-flex items-center gap-2 bg-black text-white font-bold uppercase text-xs tracking-widest px-6 py-3 hover:bg-gray-800 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M4.01 0C1.8 0 0 1.8 0 4.01v15.98C0 22.2 1.8 24 4.01 24h15.98C22.2 24 24 22.2 24 19.99V4.01C24 1.8 22.2 0 19.99 0H4.01zm11.67 7.12c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36zm-4.38 0c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36zM6.92 7.12c0-.57.46-1.03 1.03-1.03h.36c.57 0 1.03.46 1.03 1.03v.36c0 .57-.46 1.03-1.03 1.03h-.36c-.57 0-1.03-.46-1.03-1.03v-.36z"/>
                  </svg>
                  Connect with Square
                </a>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Methods Info */}
      <div className="bg-white border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-[Montserrat] font-bold text-charcoal">
            Payment Methods
          </h2>
          <p className="text-xs text-gray-500">
            Available payment methods for enrollments
          </p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-black flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-xl">credit_card</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Square (Online Payments)</p>
              <p className="text-xs text-gray-500">
                Credit/debit card payments via Square checkout
              </p>
            </div>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                squareStatus?.connected
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {squareStatus?.connected ? "Active" : "Not Connected"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-violet-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-xl">send_money</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Zelle</p>
              <p className="text-xs text-gray-500">
                Manual bank transfer — admin records payment after confirmation
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-700">
              Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-xl">local_florist</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Cherry</p>
              <p className="text-xs text-gray-500">
                Financing option — admin records payment after confirmation
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-700">
              Active
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-white text-xl">payments</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Cash</p>
              <p className="text-xs text-gray-500">
                In-person cash payment — admin records payment manually
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-700">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
