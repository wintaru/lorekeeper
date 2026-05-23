-- Add silver, copper, and custom currency to party wallet
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS silver integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS copper integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS custom_currency jsonb NOT NULL DEFAULT '[]';

-- Add full coin wallet to characters
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS gold integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS silver integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS copper integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS custom_currency jsonb NOT NULL DEFAULT '[]';
