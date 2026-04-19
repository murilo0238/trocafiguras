-- Enable RLS on realtime.messages (safe if already enabled)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop previous policy if exists, then recreate
DROP POLICY IF EXISTS "Users can only subscribe to their own trade channel" ON realtime.messages;

CREATE POLICY "Users can only subscribe to their own trade channel"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'trade-requests:' || auth.uid()::text
);
