-- Allow viewing stickers of users who share location (for trade matching)
-- Previously only share_collection = true allowed this, blocking the matching algorithm
CREATE POLICY "Users can view stickers of location-sharing users"
ON public.user_stickers FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = user_stickers.user_id
      AND p.share_location = true
  )
);
