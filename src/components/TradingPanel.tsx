import { useState, useEffect, useCallback } from "react";
import { Users, RefreshCw, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import QRCodePanel from "@/components/QRCodePanel";
import TradeRequestsPanel from "@/components/TradeRequestsPanel";
import UserAvatar from "@/components/UserAvatar";
import StickerSearch from "@/components/StickerSearch";

interface TradingPanelProps {
  onPendingCountChange?: (count: number) => void;
}

interface FriendMatch {
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  iCanGive: number;
  theyCanGive: number;
  tradeScore: number;
}

const TradingPanel = ({ onPendingCountChange }: TradingPanelProps) => {
  const { user } = useAuth();
  const [scannedUserId, setScannedUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendMatch[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .neq("user_id", user.id);
      if (pErr) throw pErr;

      const { data: myStickers } = await supabase
        .from("user_stickers")
        .select("sticker_id, collected, duplicates")
        .eq("user_id", user.id);

      const myCollected = new Set<string>();
      const myDuplicates = new Set<string>();
      myStickers?.forEach((s) => {
        if (s.collected) myCollected.add(s.sticker_id);
        if ((s.duplicates ?? 0) > 0) myDuplicates.add(s.sticker_id);
      });

      const otherIds = (profiles || []).map((p) => p.user_id);
      let othersMap: Record<string, { collected: Set<string>; duplicates: Set<string> }> = {};
      if (otherIds.length > 0) {
        const { data: others } = await supabase
          .from("user_stickers")
          .select("user_id, sticker_id, collected, duplicates")
          .in("user_id", otherIds);
        others?.forEach((s) => {
          if (!othersMap[s.user_id]) {
            othersMap[s.user_id] = { collected: new Set(), duplicates: new Set() };
          }
          if (s.collected) othersMap[s.user_id].collected.add(s.sticker_id);
          if ((s.duplicates ?? 0) > 0) othersMap[s.user_id].duplicates.add(s.sticker_id);
        });
      }

      const matches: FriendMatch[] = (profiles || []).map((p) => {
        const their = othersMap[p.user_id] || { collected: new Set<string>(), duplicates: new Set<string>() };
        const iCanGive = [...myDuplicates].filter((id) => !their.collected.has(id)).length;
        const theyCanGive = [...their.duplicates].filter((id) => !myCollected.has(id)).length;
        return {
          userId: p.user_id,
          displayName: p.display_name || "Amigo",
          avatarUrl: p.avatar_url,
          iCanGive,
          theyCanGive,
          tradeScore: Math.min(iCanGive, theyCanGive),
        };
      });

      matches.sort((a, b) => b.tradeScore - a.tradeScore || b.theyCanGive - a.theyCanGive);
      setFriends(matches);
    } catch (e: any) {
      toast.error("Erro ao carregar amigos.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  return (
    <div className="space-y-4">
      <QRCodePanel onUserScanned={(userId) => setScannedUserId(userId)} />

      <TradeRequestsPanel
        scannedUserId={scannedUserId}
        onClearScanned={() => setScannedUserId(null)}
        onPendingCountChange={onPendingCountChange}
      />

      <StickerSearch />

      <div className="bg-card rounded-xl p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Amigos do álbum</h3>
          </div>
          <button
            onClick={loadFriends}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading && friends.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">Carregando...</p>
        ) : friends.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            Ainda não há outros amigos cadastrados.
          </p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <button
                key={f.userId}
                onClick={() => setScannedUserId(f.userId)}
                className="w-full text-left bg-muted/40 hover:bg-muted rounded-lg p-3 flex items-center gap-3 transition-colors"
              >
                <UserAvatar
                  avatarUrl={f.avatarUrl}
                  displayName={f.displayName}
                  className="w-10 h-10"
                />

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">{f.displayName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Você dá <span className="font-bold text-foreground">{f.iCanGive}</span>
                    {" · "}recebe <span className="font-bold text-foreground">{f.theyCanGive}</span>
                  </p>
                </div>
                {f.tradeScore > 0 ? (
                  <span className="text-[10px] font-bold bg-primary/15 text-primary px-2 py-1 rounded-full whitespace-nowrap">
                    ⚡ {f.tradeScore} troca{f.tradeScore > 1 ? "s" : ""}
                  </span>
                ) : (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingPanel;
