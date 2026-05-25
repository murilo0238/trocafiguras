import { useState } from "react";
import { Shield, Plus, X, Users as UsersIcon, Trash2, LogOut } from "lucide-react";
import { useGroups, Group } from "@/hooks/useGroups";
import { useAuth } from "@/hooks/useAuth";
import UserAvatar from "@/components/UserAvatar";
import GroupDetailPanel from "@/components/GroupDetailPanel";

const GroupsPanel = () => {
  const { user } = useAuth();
  const { groups, loading, createGroup, leaveGroup, deleteGroup } = useGroups();
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [m1, setM1] = useState("");
  const [m2, setM2] = useState("");
  const [m3, setM3] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const open = groups.find((g) => g.id === openId);
  if (open) {
    return <GroupDetailPanel group={open} onBack={() => setOpenId(null)} />;
  }

  const handleCreate = async () => {
    setSubmitting(true);
    const id = await createGroup(name, [m1, m2, m3].filter(Boolean));
    setSubmitting(false);
    if (id) {
      setCreating(false);
      setName(""); setM1(""); setM2(""); setM3("");
      setOpenId(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Meus grupos
          </h3>
          <button
            onClick={() => setCreating(true)}
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Novo grupo</h3>
              <button onClick={() => setCreating(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome do grupo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <p className="text-xs text-muted-foreground">Adicione até 3 amigos (você fica como 4º membro):</p>
              {[
                { value: m1, set: setM1, ph: "Nome do 1º amigo" },
                { value: m2, set: setM2, ph: "Nome do 2º amigo (opcional)" },
                { value: m3, set: setM3, ph: "Nome do 3º amigo (opcional)" },
              ].map((row, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={row.ph}
                  value={row.value}
                  onChange={(e) => row.set(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              ))}
              <button
                onClick={handleCreate}
                disabled={submitting || !name.trim() || !m1.trim()}
                className="w-full py-2.5 rounded-lg header-gradient text-white font-bold text-sm hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Criando…" : "Criar grupo"}
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
