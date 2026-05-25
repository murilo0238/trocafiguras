import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { findCycles, MemberInventory, TradeCycle, TradeLeg } from "@/lib/findCycles";

export interface PendingGroupTrade {
  id: string;
  groupId: string;
  proposedBy: string;
  createdAt: string;
  legs: TradeLeg[];
  confirmations: Set<string>;
  participants: Set<string>;
}

const buildInventories = async (memberIds: string[]): Promise<MemberInventory[]> => {
  if (!memberIds.length) return [];
  const { data: stickers } = await supabase
    .from("user_stickers")
    .select("user_id, sticker_id, collected, duplicates")
    .in("user_id", memberIds);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", memberIds);

  const nameMap: Record<string, string> = {};
  for (const p of profiles || []) nameMap[p.user_id] = p.display_name || "Colecionador";

  const inventories: Record<string, MemberInventory> = {};
  for (const id of memberIds) {
    inventories[id] = {
      userId: id,
      displayName: nameMap[id] || "Colecionador",
      gives: new Set(),
      wants: new Set(),
    };
  }

  for (const row of stickers || []) {
    const inv = inventories[row.user_id];
    if (!inv) continue;
    if (row.duplicates > 0) inv.gives.add(row.sticker_id);
    if (!row.collected) inv.wants.add(row.sticker_id);
  }

  return Object.values(inventories);
};

export const useGroupTrades = (groupId: string | null) => {
  const { user } = useAuth();
  const [inventories, setInventories] = useState<MemberInventory[]>([]);
  const [cycles, setCycles] = useState<TradeCycle[]>([]);
  const [pendingTrades, setPendingTrades] = useState<PendingGroupTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const channelId = useRef(`group-trades-${Math.random().toString(36).slice(2)}`);

  const loadInventories = useCallback(async () => {
    if (!groupId) {
      setInventories([]);
      return;
    }
    setLoading(true);
    const { data: members } = await supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);
    const ids = (members || []).map((m) => m.user_id);
    const invs = await buildInventories(ids);
    setInventories(invs);
    setLoading(false);
  }, [groupId]);

  const loadPending = useCallback(async () => {
    if (!groupId) {
      setPendingTrades([]);
      return;
    }
    const { data: trades } = await supabase
      .from("group_trades")
      .select("id, group_id, proposed_by, created_at")
      .eq("group_id", groupId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (!trades?.length) {
      setPendingTrades([]);
      return;
    }
    const tradeIds = trades.map((t) => t.id);

    const [{ data: legs }, { data: confs }] = await Promise.all([
      supabase.from("group_trade_legs").select("trade_id, from_user_id, to_user_id, sticker_id").in("trade_id", tradeIds),
      supabase.from("group_trade_confirmations").select("trade_id, user_id").in("trade_id", tradeIds),
    ]);

    const result: PendingGroupTrade[] = trades.map((t) => {
      const tLegs: TradeLeg[] = (legs || [])
        .filter((l) => l.trade_id === t.id)
        .map((l) => ({ fromUserId: l.from_user_id, toUserId: l.to_user_id, stickerId: l.sticker_id }));
      const participants = new Set<string>();
      tLegs.forEach((l) => { participants.add(l.fromUserId); participants.add(l.toUserId); });
      const confirmations = new Set<string>(
        (confs || []).filter((c) => c.trade_id === t.id).map((c) => c.user_id)
      );
      return {
        id: t.id,
        groupId: t.group_id,
        proposedBy: t.proposed_by,
        createdAt: t.created_at,
        legs: tLegs,
        confirmations,
        participants,
      };
    });
    setPendingTrades(result);
  }, [groupId]);

  useEffect(() => { loadInventories(); loadPending(); }, [loadInventories, loadPending]);

  useEffect(() => {
    if (!groupId) return;
    const channel = supabase
      .channel(channelId.current)
      .on("postgres_changes", { event: "*", schema: "public", table: "group_trades", filter: `group_id=eq.${groupId}` }, () => loadPending())
      .on("postgres_changes", { event: "*", schema: "public", table: "group_trade_legs" }, () => loadPending())
      .on("postgres_changes", { event: "*", schema: "public", table: "group_trade_confirmations" }, () => loadPending())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_stickers" }, () => loadInventories())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [groupId, loadPending, loadInventories]);

  const findBestTrades = useCallback(async () => {
    setSearching(true);
    await loadInventories();
    setSearching(false);
  }, [loadInventories]);

  // Compute cycles whenever inventories change
  useEffect(() => {
    if (inventories.length < 2) {
      setCycles([]);
      return;
    }
    const found = findCycles(inventories, { maxResults: 8 });
    setCycles(found);
  }, [inventories]);

  const proposeTrade = useCallback(
    async (cycle: TradeCycle): Promise<string | null> => {
      if (!user || !groupId) return null;
      const { data: trade, error } = await supabase
        .from("group_trades")
        .insert({ group_id: groupId, proposed_by: user.id, status: "pending" })
        .select("id")
        .single();
      if (error || !trade) {
        toast.error("Erro ao criar proposta.");
        return null;
      }
      const legRows = cycle.legs.map((l) => ({
        trade_id: trade.id,
        from_user_id: l.fromUserId,
        to_user_id: l.toUserId,
        sticker_id: l.stickerId,
      }));
      const { error: lErr } = await supabase.from("group_trade_legs").insert(legRows);
      if (lErr) {
        await supabase.from("group_trades").delete().eq("id", trade.id);
        toast.error("Erro ao registrar as trocas.");
        return null;
      }
      // Auto-confirm proposer if they are part of the cycle
      const proposerInCycle = cycle.legs.some(
        (l) => l.fromUserId === user.id || l.toUserId === user.id
      );
      if (proposerInCycle) {
        await supabase
          .from("group_trade_confirmations")
          .insert({ trade_id: trade.id, user_id: user.id });
      }
      await loadPending();
      toast.success("Proposta enviada — esperando confirmação dos outros!");
      return trade.id;
    },
    [user, groupId, loadPending]
  );

  const confirmTrade = useCallback(
    async (tradeId: string): Promise<boolean> => {
      if (!user) return false;
      const { error } = await supabase
        .from("group_trade_confirmations")
        .insert({ trade_id: tradeId, user_id: user.id });
      if (error && error.code !== "23505") {
        toast.error("Erro ao confirmar.");
        return false;
      }
      // Check if all participants confirmed → execute
      const trade = pendingTrades.find((t) => t.id === tradeId);
      const participants = trade?.participants;
      const required = participants ? participants.size : 0;
      // Re-fetch confirmations to be safe
      const { data: confs } = await supabase
        .from("group_trade_confirmations")
        .select("user_id")
        .eq("trade_id", tradeId);
      const participantConfirms = participants
        ? (confs || []).filter((c) => participants.has(c.user_id)).length
        : 0;
      if (participantConfirms >= required && required > 0) {
        const { error: execErr } = await supabase.rpc("execute_group_trade", { p_trade_id: tradeId });
        if (execErr) {
          toast.error(`Erro ao executar: ${execErr.message}`);
          return false;
        }
        toast.success("Troca concluída! Álbuns atualizados.");
      } else {
        toast.success("Sua parte confirmada!");
      }
      await loadPending();
      await loadInventories();
      return true;
    },
    [user, pendingTrades, loadPending, loadInventories]
  );

  const cancelTrade = useCallback(
    async (tradeId: string): Promise<boolean> => {
      const { error } = await supabase
        .from("group_trades")
        .update({ status: "cancelled" })
        .eq("id", tradeId);
      if (error) {
        toast.error("Erro ao cancelar.");
        return false;
      }
      toast.info("Proposta cancelada.");
      await loadPending();
      return true;
    },
    [loadPending]
  );

  return {
    inventories,
    cycles,
    pendingTrades,
    loading,
    searching,
    findBestTrades,
    proposeTrade,
    confirmTrade,
    cancelTrade,
  };
};
