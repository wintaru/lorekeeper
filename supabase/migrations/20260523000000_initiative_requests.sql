CREATE TABLE IF NOT EXISTS initiative_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  rolls jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id)
);

ALTER PUBLICATION supabase_realtime ADD TABLE initiative_requests;
