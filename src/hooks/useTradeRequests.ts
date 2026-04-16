import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface TradeRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  stickers_offered: string[];
  stickers_requested: string[];
  status: string;
  created_at: string;
  from_display_name?: string;
  to_display_name?: string;
}

export const useTradeRequests = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<TradeRequest[]>([]);
  const [myRequests, setMyRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Load incoming pending requests
    const { data: incoming } = await supabase
      .from("trade_requests")
      .select("*")
      .eq("to_user_id", user.id)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false });

    // Load my sent requests
    const { data: sent } = await supabase
      .from("trade_requests")
      .select("*")
      .eq("from_user_id", user.id)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false });

    // Get display names
    const userIds = new Set<string>();
    [...(incoming || []), ...(sent || [])].forEach((r) => {
      userIds.add(r.from_user_id);
      userIds.add(r.to_user_id);
    });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", [...userIds]);

    const nameMap: Record<string, string> = {};
    profiles?.forEach((p) => {
      nameMap[p.user_id] = p.display_name || "Colecionador";
    });

    const mapNames = (r: any): TradeRequest => ({
      ...r,
      from_display_name: nameMap[r.from_user_id] || "Colecionador",
      to_display_name: nameMap[r.to_user_id] || "Colecionador",
    });

    setPendingRequests((incoming || []).map(mapNames));
    setMyRequests((sent || []).map(mapNames));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`trade-requests-${user.id}-${Math.random().toString(36).slice(2)}`);
    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trade_requests" },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadRequests]);

  const sendTradeRequest = useCallback(
    async (toUserId: string, offered: string[], requested: string[]) => {
      if (!user) return;

      const { error } = await supabase.from("trade_requests").insert({
        from_user_id: user.id,
        to_user_id: toUserId,
        stickers_offered: offered,
        stickers_requested: requested,
        status: "pending",
      });

      if (error) {
        toast.error("Erro ao enviar pedido de troca.");
        return;
      }

      toast.success("Pedido de troca enviado!");
      loadRequests();
    },
    [user, loadRequests]
  );

  const acceptTrade = useCallback(
    async (tradeId: string) => {
      const { error } = await supabase
        .from("trade_requests")
        .update({ status: "accepted" })
        .eq("id", tradeId);

      if (error) {
        toast.error("Erro ao aceitar troca.");
        return;
      }
      loadRequests();
    },
    [loadRequests]
  );

  const rejectTrade = useCallback(
    async (tradeId: string) => {
      const { error } = await supabase
        .from("trade_requests")
        .update({ status: "rejected" })
        .eq("id", tradeId);

      if (error) {
        toast.error("Erro ao rejeitar troca.");
        return;
      }
      toast.info("Troca rejeitada.");
      loadRequests();
    },
    [loadRequests]
  );

  const confirmTrade = useCallback(
    async (tradeId: string) => {
      if (!user) return;

      const { data, error } = await supabase.functions.invoke("execute-trade", {
        body: { tradeId },
      });

      if (error) {
        toast.error("Erro ao executar troca.");
        return;
      }

      toast.success("Troca realizada com sucesso! Coleção atualizada.");
      loadRequests();
    },
    [user, loadRequests]
  );

  return {
    pendingRequests,
    myRequests,
    loading,
    sendTradeRequest,
    acceptTrade,
    rejectTrade,
    confirmTrade,
    refreshRequests: loadRequests,
  };
};
