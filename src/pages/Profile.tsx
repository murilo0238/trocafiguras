import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Loader2, Link2, MapPin, Satellite, MapPinOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";
import LocationPickerMap from "@/components/LocationPickerMap";

type LocationMode = "inactive" | "default" | "real";

interface ProfileData {
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  share_location: boolean;
  share_collection: boolean;
  location_mode: LocationMode;
  default_latitude: number | null;
  default_longitude: number | null;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settingDefaultLoc, setSettingDefaultLoc] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, city, state, share_location, share_collection, location_mode, default_latitude, default_longitude")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setProfile({
        ...data,
        location_mode: (data.location_mode as LocationMode) || "inactive",
      } as ProfileData);
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

  const setLocationMode = async (mode: LocationMode) => {
    await update({ location_mode: mode, share_location: mode !== "inactive" });
  };

  const captureDefaultLocation = () => {
    setMapOpen(true);
  };

  const handleMapConfirm = async (lat: number, lng: number) => {
    setSettingDefaultLoc(true);
    await update({
      default_latitude: lat,
      default_longitude: lng,
      latitude: lat,
      longitude: lng,
      location_mode: "default",
      share_location: true,
    });
    setSettingDefaultLoc(false);
    toast.success("Ponto de troca definido!");
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

        {/* Localização */}
        <div className="space-y-3 bg-card rounded-xl p-4 shadow-sm">
          <h2 className="font-bold text-foreground">Localização</h2>
          <p className="text-xs text-muted-foreground">Escolha como sua localização é usada nas buscas de troca.</p>

          {/* Opção: Inativa */}
          <button
            onClick={() => setLocationMode("inactive")}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
              profile.location_mode === "inactive"
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30 hover:bg-muted/60"
            }`}
          >
            <MapPinOff className={`w-5 h-5 mt-0.5 flex-shrink-0 ${profile.location_mode === "inactive" ? "text-primary" : "text-muted-foreground"}`} />
            <div>
              <p className={`text-sm font-semibold ${profile.location_mode === "inactive" ? "text-primary" : "text-foreground"}`}>Localização inativa</p>
              <p className="text-xs text-muted-foreground mt-0.5">Você não aparece nas buscas de trocas por localização.</p>
            </div>
          </button>

          {/* Opção: Padrão */}
          <button
            onClick={() => setLocationMode("default")}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
              profile.location_mode === "default"
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30 hover:bg-muted/60"
            }`}
          >
            <MapPin className={`w-5 h-5 mt-0.5 flex-shrink-0 ${profile.location_mode === "default" ? "text-primary" : "text-muted-foreground"}`} />
            <div className="flex-1">
              <p className={`text-sm font-semibold ${profile.location_mode === "default" ? "text-primary" : "text-foreground"}`}>Localização padrão</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ponto fixo de localização. Você sempre aparece nesse local, independentemente de onde estiver.
              </p>
              {profile.location_mode === "default" && (
                <button
                  onClick={(e) => { e.stopPropagation(); captureDefaultLocation(); }}
                  disabled={settingDefaultLoc}
                  className="mt-2 flex items-center gap-1.5 text-xs font-bold text-primary border border-primary/30 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {settingDefaultLoc ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                  {profile.default_latitude ? "Atualizar ponto de troca" : "Definir como ponto de troca"}
                </button>
              )}
              {profile.location_mode === "default" && profile.default_latitude && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Ponto salvo: {profile.default_latitude.toFixed(4)}, {profile.default_longitude?.toFixed(4)}
                </p>
              )}
            </div>
          </button>

          {/* Opção: Real */}
          <button
            onClick={() => setLocationMode("real")}
            className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
              profile.location_mode === "real"
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30 hover:bg-muted/60"
            }`}
          >
            <Satellite className={`w-5 h-5 mt-0.5 flex-shrink-0 ${profile.location_mode === "real" ? "text-primary" : "text-muted-foreground"}`} />
            <div>
              <p className={`text-sm font-semibold ${profile.location_mode === "real" ? "text-primary" : "text-foreground"}`}>Localização real</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sua posição real, atualizada cada vez que você busca trocas.</p>
            </div>
          </button>
        </div>

        {/* Privacidade */}
        <div className="space-y-4 bg-card rounded-xl p-4 shadow-sm">
          <h2 className="font-bold text-foreground">Privacidade</h2>
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

      <LocationPickerMap
        open={mapOpen}
        initialLat={profile.default_latitude}
        initialLng={profile.default_longitude}
        onConfirm={handleMapConfirm}
        onClose={() => setMapOpen(false)}
      />
    </div>
  );
};

export default Profile;
