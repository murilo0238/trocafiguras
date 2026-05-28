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
      // Server-side computation: both users always get fresh, consistent numbers
      const { data, error } = await (supabase as any).rpc("get_all_trade_matches");
      if (error) throw error;

      const matches: FriendMatch[] = (data || []).map((m: any) => ({
        userId: m.other_user_id,
        displayName: m.display_name || "Colecionador",
        avatarUrl: m.avatar_url,
        iCanGive: Number(m.i_can_give),
        theyCanGive: Number(m.they_can_give),
        tradeScore: Number(m.trade_score),
      }));

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
