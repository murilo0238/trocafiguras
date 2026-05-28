import { useState, useEffect } from "react";
import { Shield, Plus, X, Users as UsersIcon, Trash2, LogOut, Search, Check } from "lucide-react";
import { useGroups, Group } from "@/hooks/useGroups";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import UserAvatar from "@/components/UserAvatar";
import GroupDetailPanel from "@/components/GroupDetailPanel";

interface Profile { userId: string; displayName: string; avatarUrl: string | null; }

const GroupsPanel = () => {
  const { user } = useAuth();
  const { groups, loading, createGroup, leaveGroup, deleteGroup } = useGroups();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile[]>([]);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const open = groups.find((g) => g.id === openId);
  if (open) return <GroupDetailPanel group={open} onBack={() => setOpenId(null)} />;

  const openModal = async () => {
    setCreating(true);
    setName(""); setSearch(""); setSelected([]);
    setLoadingUsers(true);
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "super_admin"]);
    const adminIds = new Set((adminRoles || []).map((r: any) => r.user_id));

    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .neq("user_id", user?.id ?? "")
      .order("display_name");
    setAllUsers(
      (data || [])
        .filter((p) => !adminIds.has(p.user_id))
        .map((p) => ({
          userId: p.user_id,
          displayName: p.display_name || "Colecionador",
          avatarUrl: p.avatar_url,
        }))
    );
    setLoadingUsers(false);
  };

  const toggleUser = (profile: Profile) => {
    setSelected((prev) => {
      const already = prev.find((p) => p.userId === profile.userId);
      if (already) return prev.filter((p) => p.userId !== profile.userId);
      if (prev.length >= 3) return prev;
      return [...prev, profile];
    });
  };

  const handleCreate = async () => {
    setSubmitting(true);
    const id = await createGroup(name, selected.map((p) => p.userId));
    setSubmitting(false);
    if (id) { setCreating(false); setOpenId(id); }
  };

  const filtered = allUsers.filter((p) =>
    p.displayName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Meus grupos
          </h3>
          <button
            onClick={openModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" /> Criar
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-muted-foreground text-center py-6">Carregando…</p>
        ) : groups.length === 0 ? (
          <div className="text-center py-8">
            <UsersIcon className="w-12 h-12 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground font-medium">
              Você ainda não está em nenhum grupo
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Crie um para trocar com seus amigos!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((g) => (
              <GroupRow
                key={g.id}
                group={g}
                isOwner={g.createdBy === user?.id}
                onOpen={() => setOpenId(g.id)}
                onLeave={() => leaveGroup(g.id)}
                onDelete={() => deleteGroup(g.id)}
              />
            ))}
          </div>
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-card rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
              <h3 className="font-bold text-foreground">Novo grupo</h3>
              <button onClick={() => setCreating(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 pb-3 space-y-3 flex-shrink-0">
              {/* Group name */}
              <input
                type="text"
                placeholder="Nome do grupo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm"
              />

              {/* Selected chips */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selected.map((p) => (
                    <button
                      key={p.userId}
                      onClick={() => toggleUser(p)}
                      className="flex items-center gap-1.5 bg-primary/15 border border-primary/30 text-primary text-xs font-semibold px-2.5 py-1 rounded-full"
                    >
                      {p.displayName}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Selecione até 3 amigos ({selected.length}/3):
              </p>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nome…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground outline-none text-sm"
                />
              </div>
            </div>

            {/* User list */}
            <div className="flex-1 overflow-y-auto px-5 pb-3 min-h-0">
              {loadingUsers ? (
                <p className="text-xs text-muted-foreground text-center py-6">Carregando…</p>
              ) : filtered.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum usuário encontrado.</p>
              ) : (
                <div className="space-y-1">
                  {filtered.map((p) => {
                    const isSelected = selected.some((s) => s.userId === p.userId);
                    const isDisabled = !isSelected && selected.length >= 3;
                    return (
                      <button
                        key={p.userId}
                        onClick={() => toggleUser(p)}
                        disabled={isDisabled}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                          isSelected
                            ? "bg-primary/15 border border-primary/30"
                            : isDisabled
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-muted/60"
                        }`}
                      >
                        <UserAvatar avatarUrl={p.avatarUrl} displayName={p.displayName} className="w-8 h-8 flex-shrink-0" />
                        <span className="flex-1 text-sm font-semibold text-foreground truncate">{p.displayName}</span>
                        {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border flex-shrink-0">
              <button
                onClick={handleCreate}
                disabled={submitting || !name.trim() || selected.length === 0}
                className="w-full py-2.5 rounded-lg header-gradient text-white font-bold text-sm hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Criando…" : `Criar grupo com ${selected.length} amigo${selected.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GroupRow = ({
  group,
  isOwner,
  onOpen,
  onLeave,
  onDelete,
}: {
  group: Group;
  isOwner: boolean;
  onOpen: () => void;
  onLeave: () => void;
  onDelete: () => void;
}) => (
  <div className="border border-border/40 rounded-xl p-3 flex items-center gap-3">
    <button onClick={onOpen} className="flex-1 min-w-0 text-left">
      <div className="font-bold text-sm text-foreground truncate">{group.name}</div>
      <div className="flex items-center gap-1 mt-1">
        {group.members.slice(0, 4).map((m) => (
          <div key={m.userId} className="w-6 h-6 rounded-full overflow-hidden bg-muted ring-1 ring-card">
            <UserAvatar avatarUrl={m.avatarUrl} displayName={m.displayName} className="w-full h-full" />
          </div>
        ))}
        <span className="text-[10px] text-muted-foreground ml-1">
          {group.members.length}/4
        </span>
      </div>
    </button>
    <button
      onClick={onOpen}
      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
    >
      Abrir
    </button>
    {isOwner ? (
      <button
        onClick={() => { if (confirm(`Excluir o grupo "${group.name}"?`)) onDelete(); }}
        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"
        title="Excluir grupo"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    ) : (
      <button
        onClick={() => { if (confirm("Sair deste grupo?")) onLeave(); }}
        className="p-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80"
        title="Sair do grupo"
      >
        <LogOut className="w-4 h-4" />
      </button>
    )}
  </div>
);

export default GroupsPanel;
