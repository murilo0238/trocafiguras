-- Fix trade confirmation flow.
-- Adds from_confirmed / to_confirmed if missing, cleans up conflicting triggers,
-- and (re)creates the execute_trade RPC with a session-flag approach.

-- 1. Columns (idempotent)
ALTER TABLE public.trade_requests
  ADD COLUMN IF NOT EXISTS from_confirmed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS to_confirmed   BOOLEAN NOT NULL DEFAULT false;

-- 2. Drop every old trigger variant so we start clean
DROP TRIGGER IF EXISTS validate_trade_status_trigger          ON public.trade_requests;
DROP TRIGGER IF EXISTS validate_trade_status_update_trigger   ON public.trade_requests;
DROP TRIGGER IF EXISTS validate_trade_status_update_trigger2  ON public.trade_requests;

-- 3. Single consolidated validation function
CREATE OR REPLACE FUNCTION public.validate_trade_status_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Immutable fields
  IF NEW.from_user_id      IS DISTINCT FROM OLD.from_user_id
  OR NEW.to_user_id        IS DISTINCT FROM OLD.to_user_id
  OR NEW.stickers_offered  IS DISTINCT FROM OLD.stickers_offered
  OR NEW.stickers_requested IS DISTINCT FROM OLD.stickers_requested
  THEN
    RAISE EXCEPTION 'Trade content cannot be modified after creation';
  END IF;

  -- Allow execute_trade() to mark completed via session flag
  IF NEW.status = 'completed'
     AND current_setting('app.executing_trade', true) = 'true' THEN
    RETURN NEW;
  END IF;

  -- Confirmation-flag-only update (status unchanged)
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    IF auth.uid() NOT IN (OLD.from_user_id, OLD.to_user_id) THEN
      RAISE EXCEPTION 'Only trade participants can update confirmation';
    END IF;
    -- Each side may only flip their own flag
    IF auth.uid() = OLD.from_user_id
       AND NEW.to_confirmed IS DISTINCT FROM OLD.to_confirmed THEN
      RAISE EXCEPTION 'Cannot set the other party confirmation flag';
    END IF;
    IF auth.uid() = OLD.to_user_id
       AND NEW.from_confirmed IS DISTINCT FROM OLD.from_confirmed THEN
      RAISE EXCEPTION 'Cannot set the other party confirmation flag';
    END IF;
    RETURN NEW;
  END IF;

  -- Status-changing rules
  IF NEW.status IN ('accepted', 'rejected')
     AND auth.uid() != OLD.to_user_id THEN
    RAISE EXCEPTION 'Only the recipient can accept or reject a trade';
  END IF;

  IF NEW.status = 'cancelled'
     AND auth.uid() NOT IN (OLD.from_user_id, OLD.to_user_id) THEN
    RAISE EXCEPTION 'Only trade participants can cancel a trade';
  END IF;

  IF NEW.status = 'completed' THEN
    RAISE EXCEPTION 'Trade completion must go through execute_trade()';
  END IF;

  IF OLD.status = 'pending'
     AND NEW.status NOT IN ('pending', 'accepted', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from pending';
  END IF;

  IF OLD.status = 'accepted'
     AND NEW.status NOT IN ('accepted', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from accepted';
  END IF;

  IF OLD.status IN ('completed', 'rejected', 'cancelled')
     AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Cannot update a finalized trade';
  END IF;

  RETURN NEW;
END;
$$;

-- 4. Single clean trigger (fires on every row update)
CREATE TRIGGER validate_trade_status_update_trigger
BEFORE UPDATE ON public.trade_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_trade_status_update();

-- 5. execute_trade RPC (SECURITY DEFINER — runs as db owner, sets session flag)
CREATE OR REPLACE FUNCTION public.execute_trade(trade_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trade  record;
  v_sticker text;
  v_other   record;
BEGIN
  SELECT * INTO v_trade FROM trade_requests WHERE id = trade_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Trade not found'; END IF;

  IF auth.uid() NOT IN (v_trade.from_user_id, v_trade.to_user_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF v_trade.status != 'accepted' THEN
    RAISE EXCEPTION 'Trade must be accepted first (status: %)', v_trade.status;
  END IF;

  IF NOT v_trade.from_confirmed OR NOT v_trade.to_confirmed THEN
    RAISE EXCEPTION 'Both parties must confirm before executing';
  END IF;

  -- from_user gives stickers_offered → to_user
  FOREACH v_sticker IN ARRAY v_trade.stickers_offered LOOP
    UPDATE user_stickers
      SET duplicates = GREATEST(0, duplicates - 1)
      WHERE user_id = v_trade.from_user_id AND sticker_id = v_sticker;

    SELECT * INTO v_other FROM user_stickers
      WHERE user_id = v_trade.to_user_id AND sticker_id = v_sticker;
    IF FOUND THEN
      IF v_other.collected THEN
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

  -- to_user gives stickers_requested → from_user
  FOREACH v_sticker IN ARRAY v_trade.stickers_requested LOOP
    UPDATE user_stickers
      SET duplicates = GREATEST(0, duplicates - 1)
      WHERE user_id = v_trade.to_user_id AND sticker_id = v_sticker;

    SELECT * INTO v_other FROM user_stickers
      WHERE user_id = v_trade.from_user_id AND sticker_id = v_sticker;
    IF FOUND THEN
      IF v_other.collected THEN
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

  -- Set session flag so trigger allows completed
  PERFORM set_config('app.executing_trade', 'true', true);
  UPDATE trade_requests SET status = 'completed' WHERE id = trade_id;
END;
$$;
