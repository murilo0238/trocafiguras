-- Add PIN hash column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pin_hash text;
