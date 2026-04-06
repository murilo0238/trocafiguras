
-- Drop the permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update trades they're involved in" ON public.trade_requests;

-- Create a validation function for trade status transitions
CREATE OR REPLACE FUNCTION public.validate_trade_status_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only the recipient (to_user_id) can accept or reject
  IF NEW.status IN ('accepted', 'rejected') AND auth.uid() != OLD.to_user_id THEN
    RAISE EXCEPTION 'Only the recipient can accept or reject a trade';
  END IF;

  -- Only the sender (from_user_id) can cancel
  IF NEW.status = 'cancelled' AND auth.uid() != OLD.from_user_id THEN
    RAISE EXCEPTION 'Only the sender can cancel a trade';
  END IF;

  -- Validate allowed transitions
  IF OLD.status = 'pending' AND NEW.status NOT IN ('accepted', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from pending';
  END IF;

  IF OLD.status = 'accepted' AND NEW.status NOT IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from accepted';
  END IF;

  IF OLD.status IN ('completed', 'rejected', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot update a finalized trade';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to validate status transitions
CREATE TRIGGER validate_trade_status_trigger
  BEFORE UPDATE ON public.trade_requests
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.validate_trade_status_update();

-- Recreate UPDATE policy: both parties can update, but the trigger enforces who can do what
CREATE POLICY "Users can update trades they are involved in"
  ON public.trade_requests
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = from_user_id) OR (auth.uid() = to_user_id))
  WITH CHECK ((auth.uid() = from_user_id) OR (auth.uid() = to_user_id));
