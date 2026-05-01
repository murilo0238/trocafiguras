import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  share_location: boolean;
  share_collection: boolean;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, city, state, share_location, share_collection")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setProfile(data as ProfileData);
      setLoading(false);
    })();
  }, [user]);

  if (!user) {
    navigate("/");
    return null;
  }

  const update = async (patch: Partial<ProfileData>) => {
    if (!user || !profile) return;
    setProfile({ ...profile, ...patch });
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", user.id);
    if (error) toast.error("Erro ao salvar");
  };

  const saveDetails = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        city: profile.city,
        state: profile.state,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error("Erro ao salvar");
    else toast.success("Perfil atualizado!");
  };

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 2MB");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
    });
    if (upErr) {
      setUploading(false);
      toast.error("Erro ao enviar imagem");
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await update({ avatar_url: data.publicUrl });
    setUploading(false);
    toast.success("Foto atualizada!");
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const inputCls =
    "w-full px-4 py-3 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground border-none focus:ring-2 focus:ring-primary outline-none";

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-gold px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-bold text-primary">Meu Perfil</h1>
      </header>

      <main className="px-4 pt-6 max-w-md mx-auto space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-muted overflow-hidden border-4 border-gold/40">
              <UserAvatar avatarUrl={profile.avatar_url} displayName={profile.display_name} className="w-full h-full" />
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatar}
            />
          </div>
          <p className="text-xs text-muted-foreground">Foto opcional (máx 2MB)</p>
          <button
            onClick={() => {
              const link = `${window.location.origin}/trade/${user.id}`;
              navigator.clipboard.writeText(link);
              toast.success("Link de troca copiado!");
            }}
            className="flex items-center gap-2 text-xs text-primary font-bold px-3 py-1.5 rounded-lg border border-primary/30 hover:bg-primary/10 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" /> Copiar link de troca
          </button>
        </div>

        {/* Dados */}
        <div className="space-y-3 bg-card rounded-xl p-4 shadow-sm">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Nome</label>
            <input
              type="text"
              value={profile.display_name || ""}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Cidade (opcional)</label>
              <input
                type="text"
                value={profile.city || ""}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="Ex: São Paulo"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Estado (opcional)</label>
              <input
                type="text"
                value={profile.state || ""}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                placeholder="Ex: SP"
                maxLength={40}
                className={inputCls}
              />
            </div>
          </div>
          <button
            onClick={saveDetails}
            disabled={saving}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>

        {/* Privacidade */}
        <div className="space-y-4 bg-card rounded-xl p-4 shadow-sm">
          <h2 className="font-bold text-foreground">Privacidade</h2>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-sm text-foreground">Compartilhar localização</p>
              <p className="text-xs text-muted-foreground mt-1">
                Posição arredondada para ~100m. Necessária para encontrar trocas próximas.
              </p>
            </div>
            <Switch
              checked={profile.share_location}
              onCheckedChange={(v) => update({ share_location: v })}
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-sm text-foreground">Compartilhar coleção</p>
              <p className="text-xs text-muted-foreground mt-1">
                Permite que outros usuários vejam suas figurinhas e repetidas.
              </p>
            </div>
            <Switch
              checked={profile.share_collection}
              onCheckedChange={(v) => update({ share_collection: v })}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
