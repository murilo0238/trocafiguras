import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTradeRequests } from "@/hooks/useTradeRequests";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";

const TradeLinkPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendTradeRequest } = useTradeRequests();

  const [partnerProfile, setPartnerProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);
  const [matchData, setMatchData] = useState<{ iCanGive: string[]; theyCanGive: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user || !userId) return;
    if (userId === user.id) {
      toast.error("Este é o seu próprio link de troca.");
      navigate("/");
      return;
    }

    const load = async () => {
      setLoading(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", userId)
        .single();

      setPartnerProfile(profile);

      const [{ data: myStickers }, { data: theirStickers }] = await Promise.all([
        supabase.from("user_stickers").select("sticker_id, collected, duplicates").eq("user_id", user.id),
        supabase.from("user_stickers").select("sticker_id, collected, duplicates").eq("user_id", userId),
      ]);

      const myCollected = new Set<string>();
      const myDuplicates = new Set<string>();
      const theirCollected = new Set<string>();
      const theirDuplicates = new Set<string>();

      for (const s of myStickers || []) {
        if (s.collected) myCollected.add(s.sticker_id);
        if (s.duplicates > 0) myDuplicates.add(s.sticker_id);
      }
      for (const s of theirStickers || []) {
        if (s.collected) theirCollected.add(s.sticker_id);
        if (s.duplicates > 0) theirDuplicates.add(s.sticker_id);
      }

      setMatchData({
        iCanGive: [...myDuplicates].filter((id) => !theirCollected.has(id)),
        theyCanGive: [...theirDuplicates].filter((id) => !myCollected.has(id)),
      });

      setLoading(false);
    };

    load();
  }, [user, userId, navigate]);

  const handleSend = async () => {
    if (!userId || !matchData) return;
    setSending(true);
    const count = Math.min(matchData.iCanGive.length, matchData.theyCanGive.length);
    await sendTradeRequest(userId, matchData.iCanGive.slice(0, count), matchData.theyCanGive.slice(0, count));
    setSending(false);
    navigate("/");
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/60 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-foreground">Propor Troca</h1>
      </header>

      <main className="px-4 pt-6 max-w-md mx-auto space-y-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {partnerProfile && (
              <div className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-sm">
                <UserAvatar avatarUrl={partnerProfile.avatar_url} displayName={partnerProfile.display_name} className="w-12 h-12" />
                <div>
                  <p className="font-bold text-foreground">{partnerProfile.display_name || "Colecionador"}</p>
                  <p className="text-xs text-muted-foreground">Pedido de troca via link</p>
                </div>
              </div>
            )}

            {!matchData || (matchData.iCanGive.length === 0 && matchData.theyCanGive.length === 0) ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground text-sm">Nenhuma troca possível com este colecionador no momento.</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl p-4 shadow-sm space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-accent/30 rounded-lg p-2">
                    <p className="font-bold text-accent-foreground mb-1">Você dá ({Math.min(matchData.iCanGive.length, matchData.theyCanGive.length)})</p>
                    <div className="flex flex-wrap gap-0.5 max-h-24 overflow-y-auto">
                      {matchData.iCanGive.slice(0, Math.min(matchData.iCanGive.length, matchData.theyCanGive.length)).map((id) => (
                        <span key={id} className="bg-secondary text-secondary-foreground text-[8px] px-1 rounded">{id}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-2">
                    <p className="font-bold text-primary mb-1">Você recebe ({Math.min(matchData.iCanGive.length, matchData.theyCanGive.length)})</p>
                    <div className="flex flex-wrap gap-0.5 max-h-24 overflow-y-auto">
                      {matchData.theyCanGive.slice(0, Math.min(matchData.iCanGive.length, matchData.theyCanGive.length)).map((id) => (
                        <span key={id} className="bg-primary/20 text-primary text-[8px] px-1 rounded">{id}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={sending || Math.min(matchData.iCanGive.length, matchData.theyCanGive.length) === 0}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Enviar Pedido de Troca
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TradeLinkPage;
