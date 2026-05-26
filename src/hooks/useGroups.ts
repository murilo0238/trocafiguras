import { useCallback, useEffect, useRef, useState } from "react";
import { supabase as supabaseTyped } from "@/integrations/supabase/client";
const supabase = supabaseTyped as any;
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { resolveProfileByName } from "@/lib/nameMatch";

export interface GroupMember {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  members: GroupMember[];
}

export const useGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const channelId = useRef(`groups-${Math.random().toString(36).slice(2)}`);

  const load = useCallback(async () => {
    if (!user) {
      setGroups([]);
      return;
    }
    setLoading(true);

    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id);

    const groupIds = (memberships || []).map((m) => m.group_id);
    if (groupIds.length === 0) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const [{ data: groupRows }, { data: allMembers }] = await Promise.all([
      supabase.from("groups").select("id, name, created_by, created_at").in("id", groupIds),
      supabase.from("group_members").select("group_id, user_id, joined_at").in("group_id", groupIds),
    ]);

    const memberUserIds = Array.from(new Set((allMembers || []).map((m) => m.user_id)));
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", memberUserIds);

    const profMap: Record<string, { display_name: string | null; avatar_url: string | null }> = {};
    for (const p of profiles || []) {
      profMap[p.user_id] = { display_name: p.display_name, avatar_url: p.avatar_url };
    }

    const byGroup: Record<string, GroupMember[]> = {};
    for (const m of allMembers || []) {
      const p = profMap[m.user_id];
      (byGroup[m.group_id] ||= []).push({
        userId: m.user_id,
        displayName: p?.display_name || "Colecionador",
        avatarUrl: p?.avatar_url ?? null,
      });
    }

    const result: Group[] = (groupRows || []).map((g) => ({
      id: g.id,
      name: g.name,
      createdBy: g.created_by,
      createdAt: g.created_at,
      members: byGroup[g.id] || [],
    }));

    result.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    setGroups(result);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(channelId.current)
      .on("postgres_changes", { event: "*", schema: "public", table: "groups" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "group_members" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  const createGroup = useCallback(
    async (name: string, memberIds: string[]): Promise<string | null> => {
      if (!user) return null;
      const trimmed = name.trim();
      if (!trimmed) { toast.error("Dê um nome ao grupo."); return null; }
      if (memberIds.length === 0) { toast.error("Adicione pelo menos um amigo."); return null; }
      if (memberIds.length > 3) { toast.error("Máximo 3 amigos (4 contando você)."); return null; }

      const { data: g, error } = await supabase
        .from("groups")
        .insert({ name: trimmed, created_by: user.id })
        .select("id")
        .single();
      if (error || !g) { toast.error("Erro ao criar grupo."); return null; }

      const rows = [
        { group_id: g.id, user_id: user.id },
        ...memberIds.map((id) => ({ group_id: g.id, user_id: id })),
      ];
      const { error: memErr } = await supabase.from("group_members").insert(rows);
      if (memErr) {
        await supabase.from("groups").delete().eq("id", g.id);
        toast.error("Erro ao adicionar membros.");
        return null;
      }

      toast.success(`Grupo "${trimmed}" criado!`);
      await load();
      return g.id;
    },
    [user, load]
  );

  const addMember = useCallback(
    async (groupId: string, name: string): Promise<boolean> => {
      const { exact, suggestion } = await resolveProfileByName(name);
      const pick = exact || suggestion;
      if (!pick) {
        toast.error(`Não encontrei "${name}".`);
        return false;
      }
      const { error } = await supabase
        .from("group_members")
        .insert({ group_id: groupId, user_id: pick.userId });
      if (error) {
        if (error.code === "23505") toast.info("Já está no grupo.");
        else if (error.message?.includes("Grupo cheio")) toast.error("Grupo cheio (máx 4).");
        else toast.error("Erro ao adicionar.");
        return false;
      }
      toast.success(`${pick.displayName} adicionado!`);
      return true;
    },
    []
  );

  const removeMember = useCallback(
    async (groupId: string, userId: string): Promise<boolean> => {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", userId);
      if (error) {
        toast.error("Erro ao remover.");
        return false;
      }
      return true;
    },
    []
  );

  const leaveGroup = useCallback(
    async (groupId: string): Promise<boolean> => {
      if (!user) return false;
      return removeMember(groupId, user.id);
    },
    [user, removeMember]
  );

  const deleteGroup = useCallback(
    async (groupId: string): Promise<boolean> => {
      const { error } = await supabase.from("groups").delete().eq("id", groupId);
      if (error) {
        toast.error("Erro ao excluir grupo.");
        return false;
      }
      toast.success("Grupo excluído.");
      return true;
    },
    []
  );

  return {
    groups,
    loading,
    createGroup,
    addMember,
    removeMember,
    leaveGroup,
    deleteGroup,
    reload: load,
  };
};
