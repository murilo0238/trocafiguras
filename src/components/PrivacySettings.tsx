import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PrivacySettings = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [shareLocation, setShareLocation] = useState(false);
  const [shareCollection, setShareCollection] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("share_location, share_collection")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setShareLocation(!!data.share_location);
        setShareCollection(!!data.share_collection);
      }
    })();
  }, [open, user]);

  const update = async (field: "share_location" | "share_collection", value: boolean) => {
    if (!user) return;
    setLoading(true);
    const payload = field === "share_location"
      ? { share_location: value }
      : { share_collection: value };
    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast.error("Erro ao salvar preferência");
      return;
    }
    if (field === "share_location") setShareLocation(value);
    else setShareCollection(value);
    toast.success("Preferência salva");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-2 rounded-full hover:bg-muted transition-colors"
          title="Privacidade"
        >
          <Shield className="w-4 h-4 text-muted-foreground" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Privacidade</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-sm text-foreground">Compartilhar localização</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sua posição é arredondada para cerca de 100m de precisão. Necessário para encontrar trocas próximas.
              </p>
            </div>
            <Switch
              checked={shareLocation}
              disabled={loading}
              onCheckedChange={(v) => update("share_location", v)}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-sm text-foreground">Compartilhar coleção</p>
              <p className="text-xs text-muted-foreground mt-1">
                Permite que outros usuários vejam suas figurinhas e repetidas para sugerir trocas.
              </p>
            </div>
            <Switch
              checked={shareCollection}
              disabled={loading}
              onCheckedChange={(v) => update("share_collection", v)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacySettings;
