-- Groups and multi-way trades
-- A group is a private circle of up to 4 collectors who can exchange
-- stickers in cycles (A→B→C→A). Different from trade_requests which is 1:1.

-- ============================================================================
-- Tables
-- ============================================================================

CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.group_members (
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_group_members_user ON public.group_members(user_id);

CREATE TABLE public.group_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  proposed_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_group_trades_group ON public.group_trades(group_id, status);

CREATE TABLE public.group_trade_legs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES public.group_trades(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES auth.users(id),
  to_user_id   UUID NOT NULL REFERENCES auth.users(id),
  sticker_id TEXT NOT NULL
);

CREATE INDEX idx_group_trade_legs_trade ON public.group_trade_legs(trade_id);

CREATE TABLE public.group_trade_confirmations (
  trade_id UUID NOT NULL REFERENCES public.group_trades(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES auth.users(id),
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (trade_id, user_id)
);

-- ============================================================================
-- Group size enforcement (max 4 members)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_group_size()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.group_members WHERE group_id = NEW.group_id) >= 4 THEN
    RAISE EXCEPTION 'Grupo cheio (máx 4 membros).';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_group_size
  BEFORE INSERT ON public.group_members
  FOR EACH ROW EXECUTE FUNCTION public.enforce_group_size();

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read group"
  ON public.groups FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "User creates group"
  ON public.groups FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Creator deletes group"
  ON public.groups FOR DELETE TO authenticated
  USING (created_by = auth.uid());

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Members can see who else is in their groups.
-- Use a SECURITY DEFINER helper to avoid recursive policy evaluation.
CREATE OR REPLACE FUNCTION public.is_group_member(p_group_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = p_group_id AND user_id = p_user_id
  );
$$;

CREATE POLICY "Members read members"
  ON public.group_members FOR SELECT TO authenticated
  USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Creator or self inserts member"
  ON public.group_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_id AND created_by = auth.uid()
    )
  );

CREATE POLICY "Self or creator removes member"
  ON public.group_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_id AND created_by = auth.uid()
    )
  );

-- Group trades
ALTER TABLE public.group_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read group trades"
  ON public.group_trades FOR SELECT TO authenticated
  USING (public.is_group_member(group_id, auth.uid()));

CREATE POLICY "Member proposes trade"
  ON public.group_trades FOR INSERT TO authenticated
  WITH CHECK (
    proposed_by = auth.uid()
    AND public.is_group_member(group_id, auth.uid())
  );

CREATE POLICY "Member cancels trade"
  ON public.group_trades FOR UPDATE TO authenticated
  USING (public.is_group_member(group_id, auth.uid()));

-- Group trade legs
ALTER TABLE public.group_trade_legs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read legs"
  ON public.group_trade_legs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_trades t
      WHERE t.id = trade_id AND public.is_group_member(t.group_id, auth.uid())
    )
  );

CREATE POLICY "Proposer inserts legs"
  ON public.group_trade_legs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_trades t
      WHERE t.id = trade_id
        AND t.proposed_by = auth.uid()
        AND t.status = 'pending'
    )
  );

-- Group trade confirmations
ALTER TABLE public.group_trade_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read confirmations"
  ON public.group_trade_confirmations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_trades t
      WHERE t.id = trade_id AND public.is_group_member(t.group_id, auth.uid())
    )
  );

CREATE POLICY "Self confirms"
  ON public.group_trade_confirmations FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.group_trades t
      WHERE t.id = trade_id
        AND t.status = 'pending'
        AND public.is_group_member(t.group_id, auth.uid())
    )
  );

CREATE POLICY "Self unconfirms"
  ON public.group_trade_confirmations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- Cross-member visibility into user_stickers
-- Required for the cycle-finding algorithm to see members' collections.
-- ============================================================================

CREATE POLICY "Group members see each other stickers"
  ON public.user_stickers FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members me
      JOIN public.group_members them ON me.group_id = them.group_id
      WHERE me.user_id = auth.uid()
        AND them.user_id = user_stickers.user_id
    )
  );

-- ============================================================================
-- Execute group trade RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.execute_group_trade(p_trade_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trade record;
  v_leg record;
  v_required INT;
  v_confirmed INT;
  v_dest_collected BOOLEAN;
BEGIN
  SELECT * INTO v_trade FROM public.group_trades WHERE id = p_trade_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Troca não encontrada.';
  END IF;
  IF v_trade.status <> 'pending' THEN
    RAISE EXCEPTION 'Troca já finalizada.';
  END IF;

  -- Caller must be a member of the trade group
  IF NOT public.is_group_member(v_trade.group_id, auth.uid()) THEN
    RAISE EXCEPTION 'Não autorizado.';
  END IF;

  -- Count distinct participants (any user appearing as giver or receiver)
  SELECT COUNT(DISTINCT u) INTO v_required FROM (
    SELECT from_user_id AS u FROM public.group_trade_legs WHERE trade_id = p_trade_id
    UNION
    SELECT to_user_id   AS u FROM public.group_trade_legs WHERE trade_id = p_trade_id
  ) s;

  -- Only count confirmations from actual participants
  SELECT COUNT(DISTINCT c.user_id) INTO v_confirmed
    FROM public.group_trade_confirmations c
    WHERE c.trade_id = p_trade_id
      AND c.user_id IN (
        SELECT from_user_id FROM public.group_trade_legs WHERE trade_id = p_trade_id
        UNION
        SELECT to_user_id   FROM public.group_trade_legs WHERE trade_id = p_trade_id
      );

  IF v_confirmed < v_required THEN
    RAISE EXCEPTION 'Faltam confirmações (% de %).', v_confirmed, v_required;
  END IF;

  -- Process each leg: decrement sender duplicates, add to receiver
  FOR v_leg IN
    SELECT * FROM public.group_trade_legs WHERE trade_id = p_trade_id
  LOOP
    -- Decrement sender
    UPDATE public.user_stickers
      SET duplicates = GREATEST(0, duplicates - 1)
      WHERE user_id = v_leg.from_user_id AND sticker_id = v_leg.sticker_id;

    -- Add to receiver: collected if missing, else duplicates+1
    SELECT collected INTO v_dest_collected
      FROM public.user_stickers
      WHERE user_id = v_leg.to_user_id AND sticker_id = v_leg.sticker_id;

    IF NOT FOUND THEN
      INSERT INTO public.user_stickers (user_id, sticker_id, collected, duplicates)
        VALUES (v_leg.to_user_id, v_leg.sticker_id, true, 0);
    ELSIF v_dest_collected THEN
      UPDATE public.user_stickers SET duplicates = duplicates + 1
        WHERE user_id = v_leg.to_user_id AND sticker_id = v_leg.sticker_id;
    ELSE
      UPDATE public.user_stickers SET collected = true
        WHERE user_id = v_leg.to_user_id AND sticker_id = v_leg.sticker_id;
    END IF;
  END LOOP;

  UPDATE public.group_trades SET status = 'completed' WHERE id = p_trade_id;
END;
$$;

-- ============================================================================
-- Realtime publication
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_trades;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_trade_legs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_trade_confirmations;
