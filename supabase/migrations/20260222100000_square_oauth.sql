-- Square OAuth settings table
-- Stores OAuth tokens obtained via Square's OAuth flow
CREATE TABLE IF NOT EXISTS square_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  location_id TEXT,
  business_name TEXT,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  webhook_signature_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one active Square connection per environment
CREATE UNIQUE INDEX IF NOT EXISTS idx_square_settings_env ON square_settings (environment);

-- Add receipt_number to enrollments for Zelle/cash payment tracking
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS receipt_number TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_receipt ON enrollments (receipt_number) WHERE receipt_number IS NOT NULL;
