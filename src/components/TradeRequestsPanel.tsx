import { useState, useEffect } from "react";
import { useTradeRequests, TradeRequest } from "@/hooks/useTradeRequests";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Send, ArrowRight, Loader2, MessageSquare, Clock, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import TradeChatPanel from "@/components/TradeChatPanel";
import EventModePanel from "@/components/EventModePanel";
import TradeBuilderSheet from "@/components/TradeBuilderSheet";

interface TradeRequestsPanelProps {
  scannedUserId: string | null;
  onClearScanned: () => void;
  onPendingCountChange?: (count: number) => void;
}

const statusLabel: Record<string, { text: string; className: string }> = {
  completed: { text: "Concluída", className: "bg-green-100 text-green-700" },
  rejected:  { text: "Recusada",  className: "bg-destructive/10 text-destructive" },
  cancelled: { text: "Cancelada", className: "bg-orange-100 text-orange-700" },
};

const TradeRequestsPanel = ({ scannedUserId, onClearScanned, onPendingCountChange }: TradeRequestsPanelProps) => {
  const { user } = useAuth();
  const {
    pendingRequests,
    myRequests,
    historyRequests,
    sendTradeRequest,
    acceptTrade,
    rejectTrade,
    cancelTrade,
    confirmMyPart,
    loading,
  } = useTradeRequests();

  const [activeTab, setActiveTab] = useState<"ativas" | "historico">("ativas");
  const [chatTradeId, setChatTradeId] = useState<string | null>(null);
  const [chatPartnerName, setChatPartnerName] = useState("");
  const [scannedName, setScannedName] = useState<string>("");
  const [eventMode, setEventMode] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [matchData, setMatchData] = useState<{
    iCanGive: string[];
    theyCanGive: string[];
    myDuplicates: string[];
    theirDuplicates: string[];
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (!scannedUserId || !user) return;

    const computeMatch = async () => {
      const { data: profile } = await supabase
        .from("profiles").select("display_name").eq("user_id", scannedUserId).single();
      setScannedName(profile?.display_name || "Colecionador");

      const { data: myStickers } = await supabase
        .from("user_stickers").select("sticker_id, collected, duplicates").eq("user_id", user.id);
      const { data: theirStickers } = await supabase
        .from("user_stickers").select("sticker_id, collected, duplicates").eq("user_id", scannedUserId);

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

      setMatchData({
        iCanGive: [...myDuplicates].filter((id) => theirNeeded.has(id)),
        theyCanGive: [...theirDuplicates].filter((id) => myNeeded.has(id)),
        myDuplicates: [...myDuplicates],
        theirDuplicates: [...theirDuplicates],
      });
    };

    computeMatch();
  }, [scannedUserId, user]);

  const handleSendTrade = async (offered?: string[], requested?: string[]) => {
    if (!scannedUserId || !matchData) return;
    setSending(true);
    const count = Math.min(matchData.iCanGive.length, matchData.theyCanGive.length);
    const finalOffered = offered ?? matchData.iCanGive.slice(0, count);
    const finalRequested = requested ?? matchData.theyCanGive.slice(0, count);
    const ok = await sendTradeRequest(scannedUserId, finalOffered, finalRequested);
    setSending(false);
    if (ok !== false) {
      onClearScanned();
      setMatchData(null);
    }
  };

  const handleConfirm = async (trade: TradeRequest) => {
    setConfirming(trade.id);
    await confirmMyPart(trade.id);
    setConfirming(null);
  };

  const handleCancel = async (trade: TradeRequest) => {
    setCancelling(trade.id);
    await cancelTrade(trade.id);
    setCancelling(null);
  };

  const openChat = (trade: TradeRequest) => {
    const partnerName = trade.from_user_id === user?.id ? trade.to_display_name : trade.from_display_name;
    setChatPartnerName(partnerName || "Colecionador");
    setChatTradeId(trade.id);
  };

  const renderConfirmSection = (req: TradeRequest) => {
    const isFrom = req.from_user_id === user?.id;
    const myConfirmed = isFrom ? req.from_confirmed : req.to_confirmed;
    const otherConfirmed = isFrom ? req.to_confirmed : req.from_confirmed;

    if (myConfirmed && !otherConfirmed) {
      return (
        <div className="flex items-center justify-center gap-1.5 py-2 text-xs text-muted-foreground">
          <Loader2 className="w-3 h-3 animate-spin" />
          Aguardando confirmação do parceiro...
        </div>
      );
    }

    if (!myConfirmed) {
      return (
        <button
          onClick={() => handleConfirm(req)}
          disabled={confirming === req.id}
          className="w-full py-2 rounded-lg bg-green-600 text-white font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-50"
        >
          {confirming === req.id
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <ArrowRight className="w-4 h-4" />}
          Confirmar Troca
        </button>
      );
    }

    return null;
  };

  useEffect(() => {
    onPendingCountChange?.(pendingRequests.length);
  }, [pendingRequests.length, onPendingCountChange]);

  const allActive = [...pendingRequests, ...myRequests];
  const totalAtivas = allActive.length;

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex rounded-xl bg-muted p-1 gap-1">
        <button
          onClick={() => setActiveTab("ativas")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "ativas" ? "bg-background shadow text-foreground" : "text-muted-foreground"
          }`}
        >
          Ativas {totalAtivas > 0 && <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[9px]">{totalAtivas}</span>}
        </button>
        <button
          onClick={() => setActiveTab("historico")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeTab === "historico" ? "bg-background shadow text-foreground" : "text-muted-foreground"
          }`}
        >
          Histórico
        </button>
      </div>

      {activeTab === "ativas" ? (
        <>
          {/* Scanned user proposal */}
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
                          <span key={id} className="bg-amber-500/20 text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-500/30">{id}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-2">
                      <p className="font-bold text-primary">Você recebe</p>
                      <div className="flex flex-wrap gap-0.5 mt-1 max-h-20 overflow-y-auto">
                        {matchData.theyCanGive.slice(0, Math.min(matchData.iCanGive.length, matchData.theyCanGive.length)).map((id) => (
                          <span key={id} className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-500/30">{id}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendTrade()}
                      disabled={sending}
                      className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Enviar sugestão
                    </button>
                    <button
                      onClick={() => setShowBuilder(true)}
                      className="px-3 py-2.5 rounded-lg border border-border hover:bg-muted text-foreground font-bold transition-colors text-sm"
                    >
                      Personalizar
                    </button>
                    <button
                      onClick={() => setEventMode(true)}
                      className="px-3 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground transition-colors flex items-center justify-center"
                      title="Modo Evento"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Incoming requests */}
          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-foreground text-sm px-1">
                📩 Pedidos recebidos ({pendingRequests.length})
              </h3>
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-card rounded-xl p-4 shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">{req.from_display_name}</p>
                    <button
                      onClick={() => openChat(req)}
                      className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                    >
                      <MessageSquare className="w-3 h-3" /> Chat
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <p className="font-bold text-primary">Você recebe</p>
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {req.stickers_offered.map((id) => (
                          <span key={id} className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-500/30">{id}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-accent/30 rounded-lg p-2">
                      <p className="font-bold text-accent-foreground">Você dá</p>
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {req.stickers_requested.map((id) => (
                          <span key={id} className="bg-amber-500/20 text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-500/30">{id}</span>
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
                        ✅ Aceita! Ambos devem confirmar para efetivar:
                      </p>
                      {renderConfirmSection(req)}
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
                <div key={req.id} className="bg-card rounded-xl p-3 shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">{req.to_display_name}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openChat(req)}
                        className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                      >
                        <MessageSquare className="w-3 h-3" /> Chat
                      </button>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status === "accepted"
                          ? "bg-green-100 text-green-700"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {req.status === "pending" ? "Pendente" : req.status === "accepted" ? "Aceita" : "Recusada"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-accent/30 rounded-lg p-2">
                      <p className="font-bold text-accent-foreground">Você dá</p>
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {req.stickers_offered.map((id) => (
                          <span key={id} className="bg-amber-500/20 text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-500/30">{id}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-2">
                      <p className="font-bold text-primary">Você recebe</p>
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {req.stickers_requested.map((id) => (
                          <span key={id} className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-500/30">{id}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {req.status === "pending" && (
                    <button
                      onClick={() => handleCancel(req)}
                      disabled={cancelling === req.id}
                      className="w-full py-1.5 rounded-lg border border-destructive/40 text-destructive font-bold text-xs flex items-center justify-center gap-1 hover:bg-destructive/5 transition-colors disabled:opacity-50"
                    >
                      {cancelling === req.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <X className="w-3 h-3" />}
                      Cancelar pedido
                    </button>
                  )}
                  {req.status === "accepted" && (
                    <div className="space-y-1">
                      <p className="text-center text-xs font-bold text-green-600">
                        ✅ Aceita! Confirme para efetivar a troca:
                      </p>
                      {renderConfirmSection(req)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {pendingRequests.length === 0 && myRequests.length === 0 && !scannedUserId && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Escaneie o QR Code de outro colecionador ou busque trocas por localização
            </p>
          )}
        </>
      ) : (
        /* History tab */
        <div className="space-y-2">
          {historyRequests.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-2">
              <Clock className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nenhuma troca no histórico ainda</p>
            </div>
          ) : (
            historyRequests.map((req) => {
              const isFrom = req.from_user_id === user?.id;
              const partnerName = isFrom ? req.to_display_name : req.from_display_name;
              const s = statusLabel[req.status] ?? { text: req.status, className: "bg-muted text-muted-foreground" };
              const date = new Date(req.updated_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });

              return (
                <details key={req.id} className="bg-card rounded-xl shadow-md group">
                  <summary className="p-3 flex items-center justify-between cursor-pointer list-none">
                    <div>
                      <p className="text-sm font-bold text-foreground">{partnerName}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {isFrom ? "Deu" : "Recebeu"} {req.stickers_offered.length} · {isFrom ? "Recebeu" : "Deu"} {req.stickers_requested.length} · {date}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${s.className}`}>
                      {s.text}
                    </span>
                  </summary>
                  <div className="px-3 pb-3 grid grid-cols-2 gap-2 text-xs border-t border-border/40 pt-2 mt-0">
                    <div className="bg-accent/30 rounded-lg p-2">
                      <p className="font-bold text-accent-foreground mb-1">{isFrom ? "Você deu" : "Você recebeu"}</p>
                      <div className="flex flex-wrap gap-0.5">
                        {req.stickers_offered.map((id) => (
                          <span key={id} className="bg-amber-500/20 text-amber-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-amber-500/30">{id}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-primary/10 rounded-lg p-2">
                      <p className="font-bold text-primary mb-1">{isFrom ? "Você recebeu" : "Você deu"}</p>
                      <div className="flex flex-wrap gap-0.5">
                        {req.stickers_requested.map((id) => (
                          <span key={id} className="bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-500/30">{id}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              );
            })
          )}
        </div>
      )}

      {/* Chat sheet */}
      <TradeChatPanel
        tradeRequestId={chatTradeId}
        myUserId={user?.id || ""}
        partnerName={chatPartnerName}
        open={!!chatTradeId}
        onClose={() => setChatTradeId(null)}
      />

      {/* Event mode */}
      {matchData && (
        <EventModePanel
          open={eventMode}
          onClose={() => setEventMode(false)}
          partnerName={scannedName}
          myName={user?.user_metadata?.display_name || "Você"}
          iCanGive={matchData.iCanGive}
          theyCanGive={matchData.theyCanGive}
        />
      )}

      {/* Custom trade builder — só monta quando aberto para garantir estado fresco */}
      {matchData && scannedUserId && showBuilder && (
        <TradeBuilderSheet
          open={true}
          onClose={() => setShowBuilder(false)}
          myDuplicates={matchData.myDuplicates}
          theirDuplicates={matchData.theirDuplicates}
          partnerName={scannedName}
          initialOffered={matchData.iCanGive}
          initialRequested={matchData.theyCanGive}
          onSend={async (offered, requested) => {
            await handleSendTrade(offered, requested);
          }}
        />
      )}
    </div>
  );
};

export default TradeRequestsPanel;
