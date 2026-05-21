-- Add death_saves column to characters
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS death_saves jsonb NOT NULL DEFAULT '{"successes":0,"failures":0}';

-- Create combat_sessions table
CREATE TABLE IF NOT EXISTS combat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  initiative_order jsonb NOT NULL DEFAULT '[]',
  current_turn_index integer NOT NULL DEFAULT 0,
  round_number integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id)
);

-- RLS
ALTER TABLE combat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "combat_sessions_select" ON combat_sessions
  FOR SELECT USING (true);

CREATE POLICY "combat_sessions_insert" ON combat_sessions
  FOR INSERT WITH CHECK ((SELECT auth.role()) = 'service_role');

CREATE POLICY "combat_sessions_update" ON combat_sessions
  FOR UPDATE USING ((SELECT auth.role()) = 'service_role');

CREATE POLICY "combat_sessions_delete" ON combat_sessions
  FOR DELETE USING ((SELECT auth.role()) = 'service_role');

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE combat_sessions;
