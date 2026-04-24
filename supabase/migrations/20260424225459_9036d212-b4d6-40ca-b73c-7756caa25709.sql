
-- Strengthen trade integrity: prevent tampering of stickers_offered/stickers_requested,
-- and ensure only proper roles can move status.

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

  -- Sender cannot accept their own trade
  IF NEW.status IN ('accepted', 'rejected') AND auth.uid() != OLD.to_user_id THEN
    RAISE EXCEPTION 'Only the recipient can accept or reject a trade';
  END IF;

  -- Only the sender can cancel a pending trade
  IF NEW.status = 'cancelled' AND auth.uid() NOT IN (OLD.from_user_id, OLD.to_user_id) THEN
    RAISE EXCEPTION 'Only trade participants can cancel a trade';
  END IF;

  -- The completed status should only be set by the edge function (service role bypasses this)
  IF NEW.status = 'completed' AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Trade completion must go through execute-trade';
  END IF;

  -- Validate allowed transitions
  IF OLD.status = 'pending' AND NEW.status NOT IN ('pending', 'accepted', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from pending';
  END IF;

  IF OLD.status = 'accepted' AND NEW.status NOT IN ('accepted', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from accepted';
  END IF;

  IF OLD.status IN ('completed', 'rejected', 'cancelled')
     AND NEW.status IS DISTINCT FROM OLD.status THEN
    RAISE EXCEPTION 'Cannot update a finalized trade';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS validate_trade_status_update_trigger ON public.trade_requests;
CREATE TRIGGER validate_trade_status_update_trigger
BEFORE UPDATE ON public.trade_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_trade_status_update();
