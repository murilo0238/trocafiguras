import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export const useDirectChat = (otherUserId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user || !otherUserId) return;
    setLoading(true);
    const { data } = await supabase
      .from("direct_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });
    setMessages((data as DirectMessage[]) || []);
    setLoading(false);
  }, [user, otherUserId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!user || !otherUserId) return;
    const channel = supabase
      .channel(`dm:${[user.id, otherUserId].sort().join("-")}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          const msg = payload.new as DirectMessage;
          const relevant =
            (msg.sender_id === user.id && msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.receiver_id === user.id);
          if (relevant) setMessages((prev) => [...prev, msg]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, otherUserId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user || !otherUserId || !content.trim()) return;
    const { error } = await supabase.from("direct_messages").insert({
      sender_id: user.id,
      receiver_id: otherUserId,
      content: content.trim(),
    });
    if (error) toast.error("Erro ao enviar mensagem.");
  }, [user, otherUserId]);

  return { messages, loading, sendMessage };
};
