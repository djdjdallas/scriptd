-- Generation Debug Logs
-- Stores structured debug data from each script generation for the admin debug panel.

CREATE TABLE IF NOT EXISTS generation_debug_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  script_id uuid REFERENCES scripts(id) ON DELETE SET NULL,
  channel_id uuid REFERENCES channels(id) ON DELETE SET NULL,
  voice_profile_id uuid,
  generation_path text NOT NULL DEFAULT 'v2_standard',
  hook_engine_used boolean DEFAULT false,
  hook_engine_fallback boolean DEFAULT false,
  hook_word_count integer,
  constraints_injected jsonb DEFAULT '[]'::jsonb,
  constraint_weights jsonb DEFAULT '{}'::jsonb,
  voice_confidence_score integer,
  voice_confidence_status text,
  compliance_scores jsonb,
  profile_source text,
  transcripts_analyzed integer,
  performance_data_available boolean DEFAULT false,
  generation_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Index for admin queries
CREATE INDEX idx_generation_debug_logs_created_at ON generation_debug_logs(created_at DESC);
CREATE INDEX idx_generation_debug_logs_channel_id ON generation_debug_logs(channel_id);
CREATE INDEX idx_generation_debug_logs_generation_path ON generation_debug_logs(generation_path);

-- Enable RLS
ALTER TABLE generation_debug_logs ENABLE ROW LEVEL SECURITY;

-- Policy: only admin users can SELECT
CREATE POLICY "Admin users can view debug logs"
  ON generation_debug_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: service role can INSERT (used by API routes via service key)
-- Authenticated users can insert their own rows (the API runs as the user)
CREATE POLICY "Authenticated users can insert own debug logs"
  ON generation_debug_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
