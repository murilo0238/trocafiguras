import { useState, useEffect } from "react";
import { useTradeRequests, TradeRequest } from "@/hooks/useTradeRequests";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Send, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TradeRequestsPanelProps {
  scannedUserId: string | null;
  onClearScanned: () => void;
}

const TradeRequestsPanel = ({ scannedUserId, onClearScanned }: TradeRequestsPanelProps) => {
  const { user } = useAuth();
  const {
    pendingRequests,
    myRequests,
    sendTradeRequest,
    acceptTrade,
    rejectTrade,
    confirmTrade,
    loading,
  } = useTradeRequests();

  const [scannedName, setScannedName] = useState<string>("");
  const [matchData, setMatchData] = useState<{
    iCanGive: string[];
    theyCanGive: string[];
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);

  // When a user is scanned, compute match data
  useEffect(() => {
    if (!scannedUserId || !user) return;

    const computeMatch = async () => {
      // Get scanned user's name
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", scannedUserId)
        .single();

      setScannedName(profile?.display_name || "Colecionador");

      // Get my stickers
      const { data: myStickers } = await supabase
        .from("user_stickers")
        .select("sticker_id, collected, duplicates")
        .eq("user_id", user.id);

      // Get their stickers
      const { data: theirStickers } = await supabase
        .from("user_stickers")
        .select("sticker_id, collected, duplicates")
        .eq("user_id", scannedUserId);

      const myNeeded = new Set<string>();
      const myDuplicates = new Set<string>();
      const theirNeeded = new Set<string>();
      const theirDuplicates = new Set<string>();

      myStickers?.forEach((s) => {
        if (!s.collected) myNeeded.add(s.sticker_id);
        if (s.duplicates > 0) myDuplicates.add(s.sticker_id);
      });

      theirStickers?.forEach((s) => {
        if (!s.collected) theirNeeded.add(s.sticker_id);
        if (s.duplicates > 0) theirDuplicates.add(s.sticker_id);
      });

      const iCanGive = [...myDuplicates].filter((id) => theirNeeded.has(id));
      const theyCanGive = [...theirDuplicates].filter((id) => myNeeded.has(id));

      setMatchData({ iCanGive, theyCanGive });
    };

    computeMatch();
  }, [scannedUserId, user]);

  const handleSendTrade = async () => {
    if (!scannedUserId || !matchData) return;
    setSending(true);

    // Send equal amounts (min of both)
    const count = Math.min(matchData.iCanGive.length, matchData.theyCanGive.length);
    const offered = matchData.iCanGive.slice(0, count);
    const requested = matchData.theyCanGive.slice(0, count);

    await sendTradeRequest(scannedUserId, offered, requested);
    setSending(false);
    onClearScanned();
    setMatchData(null);
  };

  const handleConfirmTrade = async (trade: TradeRequest) => {
    setConfirming(trade.id);
    await confirmTrade(trade.id);
    setConfirming(null);
  };

  return (
    <div className="space-y-4">
      {/* Scanned user - propose trade */}
      {scannedUserId && matchData && (
        <div className="bg-card rounded-xl p-4 shadow-md space-y-3 border-2 border-primary">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground text-sm">📱 Troca com {scannedName}</h3>
            <button onClick={() => { onClearScanned(); setMatchData(null); }} className="p-1 rounded-full hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {matchData.iCanGive.length === 0 && matchData.theyCanGive.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhuma troca possível com este colecionador.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-accent/30 rounded-lg p-2">
                  <p className="font-bold text-accent-foreground">Você dá</p>
                  <div className="flex flex-wrap gap-0.5 mt-1 max-h-20 overflow-y-auto">
                    {matchData.iCanGive.slice(0, Math.min(matchData.iCanGive.length, matchData.theyCanGive.length)).map((id) => (
                      <span key={id} className="bg-secondary text-secondary-foreground text-[8px] px-1 rounded">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-primary/10 rounded-lg p-2">
                  <p className="font-bold text-primary">Você recebe</p>
                  <div className="flex flex-wrap gap-0.5 mt-1 max-h-20 overflow-y-auto">
                    {matchData.theyCanGive.slice(0, Math.min(matchData.iCanGive.length, matchData.theyCanGive.length)).map((id) => (
                      <span key={id} className="bg-primary/20 text-primary text-[8px] px-1 rounded">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSendTrade}
                disabled={sending}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar Pedido de Troca
              </button>
            </>
          )}
        </div>
      )}

      {/* Incoming trade requests */}
      {pendingRequests.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-foreground text-sm px-1">
            📩 Pedidos recebidos ({pendingRequests.length})
          </h3>

          {pendingRequests.map((req) => (
            <div key={req.id} className="bg-card rounded-xl p-4 shadow-md space-y-2">
              <p className="text-sm font-bold text-foreground">
                {req.from_display_name}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-primary/10 rounded-lg p-2">
                  <p className="font-bold text-primary">Você recebe</p>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {req.stickers_offered.map((id) => (
                      <span key={id} className="bg-primary/20 text-primary text-[8px] px-1 rounded">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-accent/30 rounded-lg p-2">
                  <p className="font-bold text-accent-foreground">Você dá</p>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {req.stickers_requested.map((id) => (
                      <span key={id} className="bg-secondary text-secondary-foreground text-[8px] px-1 rounded">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {req.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptTrade(req.id)}
                    className="flex-1 py-2 rounded-lg bg-green-600 text-white font-bold text-sm flex items-center justify-center gap-1"
                  >
                    <Check className="w-4 h-4" /> Aceitar
                  </button>
                  <button
                    onClick={() => rejectTrade(req.id)}
                    className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground font-bold text-sm flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" /> Recusar
                  </button>
                </div>
              ) : req.status === "accepted" ? (
                <div className="space-y-2">
                  <p className="text-center text-xs font-bold text-green-600">
                    ✅ Aceita! Confirme para efetivar a troca:
                  </p>
                  <p className="text-center text-[10px] text-muted-foreground">
                    Confirma a troca das figurinhas{" "}
                    <span className="font-bold text-foreground">{req.stickers_requested.join(", ")}</span>{" "}
                    pelas figurinhas{" "}
                    <span className="font-bold text-foreground">{req.stickers_offered.join(", ")}</span>?
                  </p>
                  <button
                    onClick={() => handleConfirmTrade(req)}
                    disabled={confirming === req.id}
                    className="w-full py-2 rounded-lg bg-green-600 text-white font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {confirming === req.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                    Confirmar Troca
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* My sent requests */}
      {myRequests.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-bold text-foreground text-sm px-1">
            📤 Pedidos enviados ({myRequests.length})
          </h3>

          {myRequests.map((req) => (
            <div key={req.id} className="bg-card rounded-xl p-3 shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-foreground">{req.to_display_name}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  req.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : req.status === "accepted"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {req.status === "pending" ? "Pendente" : req.status === "accepted" ? "Aceita" : "Recusada"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Dando {req.stickers_offered.length} · Recebendo {req.stickers_requested.length}
              </p>
            </div>
          ))}
        </div>
      )}

      {pendingRequests.length === 0 && myRequests.length === 0 && !scannedUserId && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Escaneie o QR Code de outro colecionador ou busque trocas por localização
        </p>
      )}
    </div>
  );
};

export default TradeRequestsPanel;
