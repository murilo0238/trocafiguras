-- Server-side trade matching function.
-- Both users call this function and always get fresh, consistent numbers
-- because the computation happens in the database at query time.
CREATE OR REPLACE FUNCTION public.get_all_trade_matches()
RETURNS TABLE(
  other_user_id uuid,
  display_name  text,
  avatar_url    text,
  i_can_give    bigint,
  they_can_give bigint,
  trade_score   bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id                                     AS other_user_id,
    p.display_name,
    p.avatar_url,

    -- My duplicates that THEY haven't collected yet
    (SELECT COUNT(*)
       FROM user_stickers me
      WHERE me.user_id   = auth.uid()
        AND me.duplicates > 0
        AND NOT EXISTS (
              SELECT 1 FROM user_stickers th
               WHERE th.user_id    = p.user_id
                 AND th.sticker_id = me.sticker_id
                 AND th.collected  = true
            )
    )                                             AS i_can_give,

    -- Their duplicates that I haven't collected yet
    (SELECT COUNT(*)
       FROM user_stickers th
      WHERE th.user_id   = p.user_id
        AND th.duplicates > 0
        AND NOT EXISTS (
              SELECT 1 FROM user_stickers me
               WHERE me.user_id    = auth.uid()
                 AND me.sticker_id = th.sticker_id
                 AND me.collected  = true
            )
    )                                             AS they_can_give,

    -- trade_score = min(i_can_give, they_can_give)
    LEAST(
      (SELECT COUNT(*)
         FROM user_stickers me
        WHERE me.user_id   = auth.uid()
          AND me.duplicates > 0
          AND NOT EXISTS (
                SELECT 1 FROM user_stickers th
                 WHERE th.user_id    = p.user_id
                   AND th.sticker_id = me.sticker_id
                   AND th.collected  = true
              )
      ),
      (SELECT COUNT(*)
         FROM user_stickers th
        WHERE th.user_id   = p.user_id
          AND th.duplicates > 0
          AND NOT EXISTS (
                SELECT 1 FROM user_stickers me
                 WHERE me.user_id    = auth.uid()
                   AND me.sticker_id = th.sticker_id
                   AND me.collected  = true
              )
      )
    )                                             AS trade_score

  FROM profiles p
  WHERE p.user_id != auth.uid()
    AND COALESCE(p.show_in_trades, true) = true
  ORDER BY trade_score DESC, they_can_give DESC
$$;
