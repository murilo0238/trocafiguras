import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { sendNotification } from "@/lib/notify";

export interface TradeRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  stickers_offered: string[];
  stickers_requested: string[];
  status: string;
  from_confirmed: boolean;
  to_confirmed: boolean;
  created_at: string;
  updated_at: string;
  from_display_name?: string;
  to_display_name?: string;
}

export const useTradeRequests = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<TradeRequest[]>([]);
  const [myRequests, setMyRequests] = useState<TradeRequest[]>([]);
  const [historyRequests, setHistoryRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: incoming } = await supabase
      .from("trade_requests")
      .select("*")
      .eq("to_user_id", user.id)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false });

    const { data: sent } = await supabase
      .from("trade_requests")
      .select("*")
      .eq("from_user_id", user.id)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false });

    const userIds = new Set<string>();
    [...(incoming || []), ...(sent || [])].forEach((r) => {
      userIds.add(r.from_user_id);
      userIds.add(r.to_user_id);
    });

    const { data: profiles } = userIds.size > 0
      ? await supabase.from("profiles").select("user_id, display_name").in("user_id", [...userIds])
      : { data: [] };

    const nameMap: Record<string, string> = {};
    profiles?.forEach((p) => { nameMap[p.user_id] = p.display_name || "Colecionador"; });

    const mapNames = (r: any): TradeRequest => ({
      ...r,
      from_confirmed: r.from_confirmed ?? false,
      to_confirmed: r.to_confirmed ?? false,
      from_display_name: nameMap[r.from_user_id] || "Colecionador",
      to_display_name: nameMap[r.to_user_id] || "Colecionador",
    });

    setPendingRequests((incoming || []).map(mapNames));
    setMyRequests((sent || []).map(mapNames));
    setLoading(false);
  }, [user]);

  const loadHistory = useCallback(async () => {
    if (!user) return;

    const { data: history } = await supabase
      .from("trade_requests")
      .select("*")
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .in("status", ["completed", "rejected", "cancelled"])
      .order("updated_at", { ascending: false })
      .limit(50);

    if (!history) return;

    const userIds = new Set<string>();
    history.forEach((r) => { userIds.add(r.from_user_id); userIds.add(r.to_user_id); });

    const { data: profiles } = userIds.size > 0
      ? await supabase.from("profiles").select("user_id, display_name").in("user_id", [...userIds])
      : { data: [] };

    const nameMap: Record<string, string> = {};
    profiles?.forEach((p) => { nameMap[p.user_id] = p.display_name || "Colecionador"; });

    setHistoryRequests(history.map((r) => ({
      ...r,
      from_confirmed: r.from_confirmed ?? false,
      to_confirmed: r.to_confirmed ?? false,
      from_display_name: nameMap[r.from_user_id] || "Colecionador",
      to_display_name: nameMap[r.to_user_id] || "Colecionador",
    })));
  }, [user]);

  useEffect(() => {
    loadRequests();
    loadHistory();
  }, [loadRequests, loadHistory]);

  useEffect(() => {
    if (!user) return;

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    supabase.realtime.setAuth();

    const channel = supabase.channel(`trade-requests:${user.id}`, {
      config: { private: true },
    });
    channel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trade_requests", filter: `to_user_id=eq.${user.id}` },
        () => {
          loadRequests();
          loadHistory();
          sendNotification(
            "Nova proposta de troca! 📩",
            "Alguém quer trocar figurinhas com você.",
            "trade-new"
          );
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "trade_requests", filter: `to_user_id=eq.${user.id}` },
        (payload) => {
          loadRequests();
          loadHistory();
          const r = payload.new as any;
          if (r.status === "completed") {
            sendNotification("Troca concluída! 🎉", "Sua coleção foi atualizada.", `trade-done-${r.id}`);
          } else if (r.status === "accepted" && r.from_confirmed) {
            sendNotification("Parceiro confirmou! 🤝", "Confirme sua parte para efetivar a troca.", `trade-confirm-${r.id}`);
          }
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "trade_requests", filter: `from_user_id=eq.${user.id}` },
        (payload) => {
          loadRequests();
          loadHistory();
          const r = payload.new as any;
          if (r.status === "accepted") {
            sendNotification("Troca aceita! ✅", "Sua proposta foi aceita. Confirme para efetivar.", `trade-accepted-${r.id}`);
          } else if (r.status === "completed") {
            sendNotification("Troca concluída! 🎉", "Sua coleção foi atualizada.", `trade-done-${r.id}`);
          } else if (r.status === "accepted" && r.to_confirmed) {
            sendNotification("Parceiro confirmou! 🤝", "Confirme sua parte para efetivar a troca.", `trade-confirm-${r.id}`);
          }
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadRequests, loadHistory]);

  const sendTradeRequest = useCallback(
    async (toUserId: string, offered: string[], requested: string[]): Promise<boolean> => {
      if (!user) return false;

      const { data: existing } = await supabase
        .from("trade_requests")
        .select("id")
        .eq("from_user_id", user.id)
        .eq("to_user_id", toUserId)
        .eq("status", "pending")
        .maybeSingle();

      if (existing) {
        toast.warning("Você já tem um pedido pendente com este colecionador.");
        return false;
      }

      const { error } = await supabase.from("trade_requests").insert({
        from_user_id: user.id,
        to_user_id: toUserId,
        stickers_offered: offered,
        stickers_requested: requested,
        status: "pending",
      });
      if (error) { toast.error("Erro ao enviar pedido de troca."); return false; }
      toast.success("Pedido de troca enviado!");
      loadRequests();
      return true;
    },
    [user, loadRequests]
  );

  const acceptTrade = useCallback(async (tradeId: string) => {
    const { error } = await supabase
      .from("trade_requests")
      .update({ status: "accepted" })
      .eq("id", tradeId);
    if (error) { toast.error("Erro ao aceitar troca."); return; }
    loadRequests();
  }, [loadRequests]);

  const rejectTrade = useCallback(async (tradeId: string) => {
    const { error } = await supabase
      .from("trade_requests")
      .update({ status: "rejected" })
      .eq("id", tradeId);
    if (error) { toast.error("Erro ao rejeitar troca."); return; }
    toast.info("Troca rejeitada.");
    loadRequests();
  }, [loadRequests]);

  const cancelTrade = useCallback(async (tradeId: string) => {
    const { error } = await supabase
      .from("trade_requests")
      .update({ status: "cancelled" })
      .eq("id", tradeId);
    if (error) { toast.error("Erro ao cancelar troca."); return; }
    toast.info("Pedido cancelado.");
    loadRequests();
    loadHistory();
  }, [loadRequests, loadHistory]);

  const confirmMyPart = useCallback(async (tradeId: string) => {
    if (!user) return;

    const allActive = [...pendingRequests, ...myRequests];
    const trade = allActive.find((r) => r.id === tradeId);
    if (!trade) return;

    const isFrom = trade.from_user_id === user.id;
    const updateField = isFrom ? { from_confirmed: true } : { to_confirmed: true };

    const { error } = await supabase
      .from("trade_requests")
      .update(updateField)
      .eq("id", tradeId);

    if (error) { toast.error("Erro ao confirmar troca."); return; }

    const updatedFromConfirmed = isFrom ? true : trade.from_confirmed;
    const updatedToConfirmed = isFrom ? trade.to_confirmed : true;
    const bothConfirmed = updatedFromConfirmed && updatedToConfirmed;

    if (bothConfirmed) {
      const { error: execError } = await supabase.rpc("execute_trade", { trade_id: tradeId });
      if (execError) { toast.error("Erro ao executar troca."); return; }
      toast.success("Troca realizada com sucesso! Coleção atualizada.");
    } else {
      toast.success("Confirmação registrada! Aguardando a outra parte.");
    }
    loadRequests();
  }, [user, pendingRequests, myRequests, loadRequests]);

  return {
    pendingRequests,
    myRequests,
    historyRequests,
    loading,
    sendTradeRequest,
    acceptTrade,
    rejectTrade,
    cancelTrade,
    confirmMyPart,
    refreshRequests: loadRequests,
  };
};
