import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface TradeMessage {
  id: string;
  trade_request_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export const useTradeChat = (tradeRequestId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TradeMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!tradeRequestId) return;
    setLoading(true);
    const { data } = await supabase
      .from("trade_messages")
      .select("*")
      .eq("trade_request_id", tradeRequestId)
      .order("created_at", { ascending: true });
    setMessages((data as TradeMessage[]) || []);
    setLoading(false);
  }, [tradeRequestId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!tradeRequestId) return;

    const channel = supabase
      .channel(`trade-chat:${tradeRequestId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trade_messages",
          filter: `trade_request_id=eq.${tradeRequestId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as TradeMessage]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [tradeRequestId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !tradeRequestId || !content.trim()) return;
    const { error } = await supabase.from("trade_messages").insert({
      trade_request_id: tradeRequestId,
      sender_id: user.id,
      content: content.trim(),
    });
    if (error) toast.error("Erro ao enviar mensagem.");
  }, [user, tradeRequestId]);

  return { messages, loading, sendMessage };
};
