-- Atomic group creation via SECURITY DEFINER to bypass RLS chicken-and-egg:
-- INSERT on groups needs no SELECT back, INSERT on group_members needs to
-- verify the creator exists — doing it all server-side avoids the issue.
CREATE OR REPLACE FUNCTION public.create_group(p_name text, p_member_ids uuid[])
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id uuid;
  v_member   uuid;
BEGIN
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Nome do grupo não pode ser vazio.';
  END IF;
  IF array_length(p_member_ids, 1) IS NULL OR array_length(p_member_ids, 1) = 0 THEN
    RAISE EXCEPTION 'Adicione pelo menos um membro.';
  END IF;
  IF array_length(p_member_ids, 1) > 3 THEN
    RAISE EXCEPTION 'Máximo 3 amigos (4 contando você).';
  END IF;

  INSERT INTO public.groups (name, created_by)
  VALUES (trim(p_name), auth.uid())
  RETURNING id INTO v_group_id;

  -- Add creator
  INSERT INTO public.group_members (group_id, user_id)
  VALUES (v_group_id, auth.uid());

  -- Add invited members
  FOREACH v_member IN ARRAY p_member_ids LOOP
    INSERT INTO public.group_members (group_id, user_id)
    VALUES (v_group_id, v_member);
  END LOOP;

  RETURN v_group_id;
END;
$$;
