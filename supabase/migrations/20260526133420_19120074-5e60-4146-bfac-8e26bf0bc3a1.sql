
DO $$
DECLARE
  mapping RECORD;
  old_code TEXT;
  new_code TEXT;
BEGIN
  FOR mapping IN SELECT * FROM (VALUES ('ALE','GER'),('CUR','CUW'),('HOL','NED')) AS m(old_c, new_c) LOOP
    old_code := mapping.old_c;
    new_code := mapping.new_c;

    -- Merge into existing new rows for the same user
    UPDATE user_stickers AS new_row
    SET collected = new_row.collected OR old_row.collected,
        duplicates = new_row.duplicates + old_row.duplicates,
        updated_at = now()
    FROM user_stickers AS old_row
    WHERE old_row.sticker_id = old_code || regexp_replace(new_row.sticker_id, '^' || new_code, '')
      AND new_row.sticker_id LIKE new_code || '%'
      AND regexp_replace(new_row.sticker_id, '^' || new_code, '') = regexp_replace(old_row.sticker_id, '^' || old_code, '')
      AND new_row.user_id = old_row.user_id;

    -- Delete old rows where a new one already existed (merged above)
    DELETE FROM user_stickers old_row
    WHERE old_row.sticker_id LIKE old_code || '%'
      AND EXISTS (
        SELECT 1 FROM user_stickers new_row
        WHERE new_row.user_id = old_row.user_id
          AND new_row.sticker_id = new_code || regexp_replace(old_row.sticker_id, '^' || old_code, '')
      );

    -- Rename remaining old rows to the new code
    UPDATE user_stickers
    SET sticker_id = new_code || regexp_replace(sticker_id, '^' || old_code, ''),
        updated_at = now()
    WHERE sticker_id LIKE old_code || '%';
  END LOOP;
END $$;
