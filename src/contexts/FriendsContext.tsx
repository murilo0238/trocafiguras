import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Friend {
  friendshipId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  status: "pending" | "accepted";
  iAmRequester: boolean;
}

interface FriendsContextValue {
  friends: Friend[];
  accepted: Friend[];
  pendingReceived: Friend[];
  pendingSent: Friend[];
  loading: boolean;
  sendRequest: (addresseeId: string, displayName: string) => Promise<void>;
  acceptRequest: (friendshipId: string) => Promise<void>;
  rejectRequest: (friendshipId: string) => Promise<void>;
  removeFriend: (friendshipId: string) => Promise<void>;
  getFriendshipStatus: (otherUserId: string) => Friend | null;
  reload: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextValue | null>(null);

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setFriends([]); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .neq("status", "rejected");

    if (error || !data) { setLoading(false); return; }

    const otherIds = data.map((f) =>
      f.requester_id === user.id ? f.addressee_id : f.requester_id
    );

    if (otherIds.length === 0) { setFriends([]); setLoading(false); return; }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", otherIds);

    const profileMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
    for (const p of profiles || []) {
      profileMap[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
    }

    setFriends(
      data.map((f) => {
        const iAmRequester = f.requester_id === user.id;
        const otherId = iAmRequester ? f.addressee_id : f.requester_id;
        const profile = profileMap[otherId];
        return {
          friendshipId: f.id,
          userId: otherId,
          displayName: profile?.display_name || "Colecionador",
          avatarUrl: profile?.avatar_url || null,
          status: f.status as "pending" | "accepted",
          iAmRequester,
        };
      })
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Single realtime subscription at the context level
  useEffect(() => {
    if (!user) return;
    const channelName = `friendships-ctx-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendRequest = useCallback(async (addresseeId: string, displayName: string) => {
    if (!user) return;
    const { error } = await supabase.from("friendships").insert({
      requester_id: user.id,
      addressee_id: addresseeId,
      status: "pending",
    });
    if (error) {
      if (error.code === "23505") toast.info("Pedido de amizade já enviado.");
      else toast.error("Erro ao enviar pedido.");
      return;
    }
    toast.success(`Pedido enviado para ${displayName}!`);
  }, [user]);

  const acceptRequest = useCallback(async (friendshipId: string) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", friendshipId);
    if (error) { toast.error("Erro ao aceitar."); return; }
    toast.success("Amizade aceita!");
  }, []);

  const rejectRequest = useCallback(async (friendshipId: string) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", friendshipId);
    if (error) toast.error("Erro ao recusar.");
  }, []);

  const removeFriend = useCallback(async (friendshipId: string) => {
    const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
    if (error) toast.error("Erro ao remover amigo.");
  }, []);

  const getFriendshipStatus = useCallback(
    (otherUserId: string) => friends.find((f) => f.userId === otherUserId) ?? null,
    [friends]
  );

  const pendingReceived = friends.filter((f) => f.status === "pending" && !f.iAmRequester);
  const pendingSent = friends.filter((f) => f.status === "pending" && f.iAmRequester);
  const accepted = friends.filter((f) => f.status === "accepted");

  return (
    <FriendsContext.Provider value={{
      friends, accepted, pendingReceived, pendingSent, loading,
      sendRequest, acceptRequest, rejectRequest, removeFriend,
      getFriendshipStatus, reload: load,
    }}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error("useFriends must be used inside FriendsProvider");
  return ctx;
};
