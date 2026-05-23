-- Extended character sheet fields
ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS race               text,
  ADD COLUMN IF NOT EXISTS background         text,
  ADD COLUMN IF NOT EXISTS ability_scores     jsonb,
  ADD COLUMN IF NOT EXISTS speed              integer,
  ADD COLUMN IF NOT EXISTS passive_perception integer,
  ADD COLUMN IF NOT EXISTS personality_traits text,
  ADD COLUMN IF NOT EXISTS ideals             text,
  ADD COLUMN IF NOT EXISTS bonds              text,
  ADD COLUMN IF NOT EXISTS flaws              text,
  ADD COLUMN IF NOT EXISTS backstory          text;
