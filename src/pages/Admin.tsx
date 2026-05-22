import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Search, Shield, Ban, Trash2, KeyRound, UserCog, Plus, RefreshCw, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

type Perm = "list_users" | "reset_password" | "ban_user" | "delete_user" | "edit_profile" | "manage_admins";
const ALL_PERMS: { key: Perm; label: string }[] = [
  { key: "list_users", label: "Listar usuários" },
  { key: "reset_password", label: "Resetar senha" },
  { key: "ban_user", label: "Banir / desbanir" },
  { key: "delete_user", label: "Excluir conta" },
  { key: "edit_profile", label: "Editar perfil" },
  { key: "manage_admins", label: "Gerenciar admins (apenas super)" },
];

interface AppUser {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
  banned: { reason: string; created_at: string } | null;
}

interface AdminEntry {
  user_id: string;
  email: string | null;
  display_name: string | null;
  is_super: boolean;
  permissions: Perm[];
}

interface AuditEntry {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  details: unknown;
  created_at: string;
}

const call = async (action: string, payload: Record<string, unknown> = {}) => {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action, payload },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
};

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState<{ isSuper: boolean; permissions: Perm[] } | null>(null);
  const [tab, setTab] = useState<"users" | "admins" | "audit">("users");
  const [users, setUsers] = useState<AppUser[]>([]);
  const [admins, setAdmins] = useState<AdminEntry[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [grantOpen, setGrantOpen] = useState(false);
  const [grantTarget, setGrantTarget] = useState<AppUser | null>(null);
  const [grantPerms, setGrantPerms] = useState<Perm[]>([]);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    call("me").then((d) => {
      if (!d.isAdmin) { setDenied(true); return; }
      setMe({ isSuper: d.isSuper, permissions: d.permissions });
    }).catch(() => setDenied(true));
  }, [user, authLoading, navigate]);

  const can = (p: Perm) => me?.isSuper || me?.permissions.includes(p);

  const loadUsers = async () => {
    if (!can("list_users")) return;
    setLoading(true);
    try {
      const d = await call("list_users", { search, page: 1, perPage: 100 });
      setUsers(d.users);
    } catch (e) { toast.error((e as Error).message); }
    setLoading(false);
  };
  const loadAdmins = async () => {
    setLoading(true);
    try { setAdmins((await call("list_admins")).admins); } catch (e) { toast.error((e as Error).message); }
    setLoading(false);
  };
  const loadAudit = async () => {
    setLoading(true);
    try { setAudit((await call("audit_log")).log); } catch (e) { toast.error((e as Error).message); }
    setLoading(false);
  };

  useEffect(() => {
    if (!me) return;
    if (tab === "users") loadUsers();
    if (tab === "admins") loadAdmins();
    if (tab === "audit") loadAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, tab]);

  const handleReset = async (u: AppUser) => {
    if (!u.email) return;
    try {
      await call("reset_password", { email: u.email, user_id: u.id, origin: window.location.origin });
      toast.success("Email de reset enviado");
    } catch (e) { toast.error((e as Error).message); }
  };
  const handleBan = async (u: AppUser) => {
    const reason = prompt("Motivo do banimento:", "") || "";
    try { await call("ban_user", { user_id: u.id, reason }); toast.success("Usuário banido"); loadUsers(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const handleUnban = async (u: AppUser) => {
    try { await call("unban_user", { user_id: u.id }); toast.success("Banimento removido"); loadUsers(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const handleDelete = async (u: AppUser) => {
    if (!confirm(`Excluir definitivamente ${u.email}? Esta ação não pode ser desfeita.`)) return;
    try { await call("delete_user", { user_id: u.id }); toast.success("Usuário excluído"); loadUsers(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const openGrant = (u: AppUser) => {
    setGrantTarget(u);
    setGrantPerms([]);
    setGrantOpen(true);
  };
  const submitGrant = async () => {
    if (!grantTarget) return;
    try {
      await call("grant_admin", { user_id: grantTarget.id, permissions: grantPerms });
      toast.success("Permissões atualizadas");
      setGrantOpen(false); loadUsers(); loadAdmins();
    } catch (e) { toast.error((e as Error).message); }
  };
  const handleRevoke = async (a: AdminEntry) => {
    if (a.is_super) { toast.error("Super admin não pode ser revogado por aqui"); return; }
    if (!confirm(`Remover privilégios de admin de ${a.email}?`)) return;
    try { await call("revoke_admin", { user_id: a.user_id }); toast.success("Admin removido"); loadAdmins(); }
    catch (e) { toast.error((e as Error).message); }
  };
  const editAdminPerms = async (a: AdminEntry) => {
    setGrantTarget({ id: a.user_id, email: a.email, display_name: a.display_name, avatar_url: null, created_at: "", last_sign_in_at: null, roles: ["admin"], banned: null });
    setGrantPerms(a.permissions);
    setGrantOpen(true);
  };

  if (denied) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 p-6 text-center">
        <Shield className="w-12 h-12 text-destructive" />
        <h1 className="text-xl font-bold">Acesso negado</h1>
        <p className="text-muted-foreground text-sm">Você não tem permissão para acessar o painel administrativo.</p>
        <Link to="/" className="text-primary underline">Voltar</Link>
      </div>
    );
  }
  if (!me) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-10 h-10 rounded-full border-[3px] border-primary border-t-transparent animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="header-gradient px-4 py-3 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/" className="p-1.5 rounded-full hover:bg-white/15"><ArrowLeft className="w-5 h-5 text-white" /></Link>
          <div className="flex-1">
            <h1 className="text-white font-bold text-base flex items-center gap-2"><Shield className="w-4 h-4" /> Painel Administrativo</h1>
            <p className="text-white/70 text-[11px]">{me.isSuper ? "Super Admin" : "Admin"}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {can("list_users") && <button onClick={() => setTab("users")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${tab === "users" ? "bg-white text-primary" : "bg-black/25 text-white/80"}`}>Usuários</button>}
          {me.isSuper && <button onClick={() => setTab("admins")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${tab === "admins" ? "bg-white text-primary" : "bg-black/25 text-white/80"}`}>Admins</button>}
          {me.isSuper && <button onClick={() => setTab("audit")} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${tab === "audit" ? "bg-white text-primary" : "bg-black/25 text-white/80"}`}>Auditoria</button>}
        </div>
      </header>

      <main className="px-3 pt-4 space-y-3">
        {tab === "users" && (
          <>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por email ou nome..." className="pl-9" onKeyDown={(e) => e.key === "Enter" && loadUsers()} />
              </div>
              <Button onClick={loadUsers} disabled={loading}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></Button>
            </div>
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="bg-card rounded-xl p-3 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-foreground/60 flex-shrink-0">
                      {(u.display_name || u.email || "?")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-sm truncate">{u.display_name || "Sem nome"}</p>
                        {u.roles.includes("super_admin") && <span className="text-[9px] font-bold bg-gold/20 text-gold-light px-1.5 py-0.5 rounded">SUPER</span>}
                        {u.roles.includes("admin") && <span className="text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">ADMIN</span>}
                        {u.banned && <span className="text-[9px] font-bold bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">BANIDO</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Cadastro: {new Date(u.created_at).toLocaleDateString("pt-BR")} · Último login: {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR") : "nunca"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {can("reset_password") && <Button size="sm" variant="outline" onClick={() => handleReset(u)} className="h-7 text-[11px]"><KeyRound className="w-3 h-3 mr-1" />Reset senha</Button>}
                    {can("ban_user") && !u.banned && <Button size="sm" variant="outline" onClick={() => handleBan(u)} className="h-7 text-[11px]"><Ban className="w-3 h-3 mr-1" />Banir</Button>}
                    {can("ban_user") && u.banned && <Button size="sm" variant="outline" onClick={() => handleUnban(u)} className="h-7 text-[11px]">Desbanir</Button>}
                    {me.isSuper && !u.roles.includes("admin") && !u.roles.includes("super_admin") && (
                      <Button size="sm" variant="outline" onClick={() => openGrant(u)} className="h-7 text-[11px]"><Plus className="w-3 h-3 mr-1" />Tornar admin</Button>
                    )}
                    {can("delete_user") && !u.roles.includes("super_admin") && (
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(u)} className="h-7 text-[11px]"><Trash2 className="w-3 h-3 mr-1" />Excluir</Button>
                    )}
                  </div>
                </div>
              ))}
              {!loading && users.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Nenhum usuário</p>}
            </div>
          </>
        )}

        {tab === "admins" && (
          <div className="space-y-2">
            {admins.map((a) => (
              <div key={a.user_id} className="bg-card rounded-xl p-3 border border-border/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{a.display_name || a.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{a.email}</p>
                  </div>
                  {a.is_super ? <span className="text-[10px] font-bold bg-gold/20 text-gold-light px-2 py-0.5 rounded">SUPER ADMIN</span>
                    : <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded">ADMIN</span>}
                </div>
                {!a.is_super && (
                  <>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {a.permissions.length === 0 && <span className="text-[10px] text-muted-foreground">sem permissões</span>}
                      {a.permissions.map((p) => (
                        <span key={p} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{ALL_PERMS.find((x) => x.key === p)?.label}</span>
                      ))}
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      <Button size="sm" variant="outline" onClick={() => editAdminPerms(a)} className="h-7 text-[11px]"><UserCog className="w-3 h-3 mr-1" />Editar permissões</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleRevoke(a)} className="h-7 text-[11px]">Remover admin</Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {!loading && admins.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Nenhum admin</p>}
          </div>
        )}

        {tab === "audit" && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2"><ScrollText className="w-3.5 h-3.5" /> Últimas ações administrativas</div>
            {audit.map((a) => (
              <div key={a.id} className="bg-card rounded-lg p-2.5 border border-border/40 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="font-bold text-primary">{a.action}</span>
                  <span className="text-muted-foreground text-[10px]">{new Date(a.created_at).toLocaleString("pt-BR")}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">admin: {a.admin_id.slice(0, 8)}… · alvo: {a.target_user_id?.slice(0, 8) || "—"}</p>
                {a.details ? <pre className="text-[10px] text-muted-foreground mt-1 overflow-x-auto">{JSON.stringify(a.details)}</pre> : null}
              </div>
            ))}
            {!loading && audit.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Sem registros</p>}
          </div>
        )}
      </main>

      <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Permissões para {grantTarget?.display_name || grantTarget?.email}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {ALL_PERMS.filter((p) => p.key !== "manage_admins").map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={grantPerms.includes(p.key)}
                  onCheckedChange={(v) => setGrantPerms((prev) => v ? [...prev, p.key] : prev.filter((x) => x !== p.key))}
                />
                {p.label}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantOpen(false)}>Cancelar</Button>
            <Button onClick={submitGrant}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
