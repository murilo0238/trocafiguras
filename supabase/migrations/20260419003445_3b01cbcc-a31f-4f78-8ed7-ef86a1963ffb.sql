-- Add opt-in privacy flags
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS share_location boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS share_collection boolean NOT NULL DEFAULT false;

-- Trigger to fuzz coordinates to ~100m precision (3 decimal places ≈ 111m)
CREATE OR REPLACE FUNCTION public.fuzz_location_coordinates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.latitude IS NOT NULL THEN
    NEW.latitude = ROUND(NEW.latitude::numeric, 3)::double precision;
  END IF;
  IF NEW.longitude IS NOT NULL THEN
    NEW.longitude = ROUND(NEW.longitude::numeric, 3)::double precision;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fuzz_profile_location ON public.profiles;
CREATE TRIGGER fuzz_profile_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.fuzz_location_coordinates();

-- Replace overly permissive profiles SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view profiles that share location"
ON public.profiles FOR SELECT
TO authenticated
USING (share_location = true);

-- Replace overly permissive user_stickers SELECT policy
DROP POLICY IF EXISTS "Users can view all stickers for trading" ON public.user_stickers;

CREATE POLICY "Users can view their own stickers"
ON public.user_stickers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view stickers of users sharing collection"
ON public.user_stickers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = user_stickers.user_id
      AND p.share_collection = true
  )
);

-- Users involved in a trade can see each other's stickers (needed for trade execution)
CREATE POLICY "Users in active trade can view each other stickers"
ON public.user_stickers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trade_requests t
    WHERE t.status IN ('pending', 'accepted')
      AND (
        (t.from_user_id = auth.uid() AND t.to_user_id = user_stickers.user_id)
        OR (t.to_user_id = auth.uid() AND t.from_user_id = user_stickers.user_id)
      )
  )
);