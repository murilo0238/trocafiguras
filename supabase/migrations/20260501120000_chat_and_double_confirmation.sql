-- trade_messages table for collector chat
CREATE TABLE public.trade_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_request_id UUID NOT NULL REFERENCES public.trade_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trade_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trade participants can read messages"
  ON public.trade_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trade_requests t
      WHERE t.id = trade_messages.trade_request_id
        AND (t.from_user_id = auth.uid() OR t.to_user_id = auth.uid())
    )
  );

CREATE POLICY "Trade participants can send messages"
  ON public.trade_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.trade_requests t
      WHERE t.id = trade_messages.trade_request_id
        AND (t.from_user_id = auth.uid() OR t.to_user_id = auth.uid())
        AND t.status IN ('pending', 'accepted')
    )
  );

CREATE INDEX idx_trade_messages_trade_request_id
  ON public.trade_messages(trade_request_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_messages;

-- Double confirmation columns
ALTER TABLE public.trade_requests
  ADD COLUMN IF NOT EXISTS from_confirmed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS to_confirmed BOOLEAN NOT NULL DEFAULT false;

-- Updated trigger: allow confirmation flags + allow execute_trade() to set completed
CREATE OR REPLACE FUNCTION public.validate_trade_status_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Immutable fields after creation
  IF NEW.from_user_id IS DISTINCT FROM OLD.from_user_id
     OR NEW.to_user_id IS DISTINCT FROM OLD.to_user_id
     OR NEW.stickers_offered IS DISTINCT FROM OLD.stickers_offered
     OR NEW.stickers_requested IS DISTINCT FROM OLD.stickers_requested THEN
    RAISE EXCEPTION 'Trade content cannot be modified after creation';
  END IF;

  -- Allow execute_trade() function to set completed via session flag
  IF NEW.status = 'completed'
     AND current_setting('app.executing_trade', true) = 'true' THEN
    RETURN NEW;
  END IF;

  -- If only confirmation flags changed (status unchanged), allow both participants
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    IF auth.uid() NOT IN (OLD.from_user_id, OLD.to_user_id) THEN
      RAISE EXCEPTION 'Only trade participants can update confirmation';
    END IF;
    IF auth.uid() = OLD.from_user_id AND NEW.to_confirmed IS DISTINCT FROM OLD.to_confirmed THEN
      RAISE EXCEPTION 'Cannot set the other party confirmation flag';
    END IF;
    IF auth.uid() = OLD.to_user_id AND NEW.from_confirmed IS DISTINCT FROM OLD.from_confirmed THEN
      RAISE EXCEPTION 'Cannot set the other party confirmation flag';
    END IF;
    RETURN NEW;
  END IF;

  -- Status-changing validations
  IF NEW.status IN ('accepted', 'rejected') AND auth.uid() != OLD.to_user_id THEN
    RAISE EXCEPTION 'Only the recipient can accept or reject a trade';
  END IF;

  IF NEW.status = 'cancelled' AND auth.uid() NOT IN (OLD.from_user_id, OLD.to_user_id) THEN
    RAISE EXCEPTION 'Only trade participants can cancel a trade';
  END IF;

  IF NEW.status = 'completed' THEN
    RAISE EXCEPTION 'Trade completion must go through execute_trade()';
  END IF;

  IF OLD.status = 'pending' AND NEW.status NOT IN ('pending', 'accepted', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from pending';
  END IF;

  IF OLD.status = 'accepted' AND NEW.status NOT IN ('accepted', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from accepted';
  END IF;

  IF OLD.status IN ('completed', 'rejected', 'cancelled') AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Cannot update a finalized trade';
  END IF;

  RETURN NEW;
END;
$function$;

-- PostgreSQL RPC function that replaces the edge function
-- Called via supabase.rpc('execute_trade', { trade_id }) — works without edge functions
CREATE OR REPLACE FUNCTION public.execute_trade(trade_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trade record;
  v_sticker text;
  v_from_sticker record;
  v_to_sticker record;
BEGIN
  SELECT * INTO v_trade FROM trade_requests WHERE id = trade_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trade not found';
  END IF;

  IF auth.uid() NOT IN (v_trade.from_user_id, v_trade.to_user_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF v_trade.status != 'accepted' THEN
    RAISE EXCEPTION 'Trade must be accepted first';
  END IF;

  IF NOT v_trade.from_confirmed OR NOT v_trade.to_confirmed THEN
    RAISE EXCEPTION 'Both parties must confirm before executing';
  END IF;

  -- Process stickers offered: from_user gives to to_user
  FOREACH v_sticker IN ARRAY v_trade.stickers_offered LOOP
    UPDATE user_stickers
      SET duplicates = GREATEST(0, duplicates - 1)
      WHERE user_id = v_trade.from_user_id AND sticker_id = v_sticker;

    SELECT * INTO v_to_sticker FROM user_stickers
      WHERE user_id = v_trade.to_user_id AND sticker_id = v_sticker;

    IF FOUND THEN
      IF v_to_sticker.collected THEN
        UPDATE user_stickers SET duplicates = duplicates + 1
          WHERE user_id = v_trade.to_user_id AND sticker_id = v_sticker;
      ELSE
        UPDATE user_stickers SET collected = true
          WHERE user_id = v_trade.to_user_id AND sticker_id = v_sticker;
      END IF;
    ELSE
      INSERT INTO user_stickers (user_id, sticker_id, collected, duplicates)
        VALUES (v_trade.to_user_id, v_sticker, true, 0);
    END IF;
  END LOOP;

  -- Process stickers requested: to_user gives to from_user
  FOREACH v_sticker IN ARRAY v_trade.stickers_requested LOOP
    UPDATE user_stickers
      SET duplicates = GREATEST(0, duplicates - 1)
      WHERE user_id = v_trade.to_user_id AND sticker_id = v_sticker;

    SELECT * INTO v_from_sticker FROM user_stickers
      WHERE user_id = v_trade.from_user_id AND sticker_id = v_sticker;

    IF FOUND THEN
      IF v_from_sticker.collected THEN
        UPDATE user_stickers SET duplicates = duplicates + 1
          WHERE user_id = v_trade.from_user_id AND sticker_id = v_sticker;
      ELSE
        UPDATE user_stickers SET collected = true
          WHERE user_id = v_trade.from_user_id AND sticker_id = v_sticker;
      END IF;
    ELSE
      INSERT INTO user_stickers (user_id, sticker_id, collected, duplicates)
        VALUES (v_trade.from_user_id, v_sticker, true, 0);
    END IF;
  END LOOP;

  -- Set session flag so the trigger allows setting status = 'completed'
  PERFORM set_config('app.executing_trade', 'true', true);
  UPDATE trade_requests SET status = 'completed' WHERE id = trade_id;
END;
$$;
