CREATE POLICY "Public album when share_collection"
ON public.user_stickers
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = user_stickers.user_id
      AND p.share_collection = true
  )
);