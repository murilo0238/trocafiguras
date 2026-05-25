import { useState } from "react";
import { ChevronLeft, Check, ArrowRight, X, Clock } from "lucide-react";
import { Group } from "@/hooks/useGroups";
import { PendingGroupTrade } from "@/hooks/useGroupTrades";
import { useAuth } from "@/hooks/useAuth";
import { isShiny } from "@/data/shinies";
import { getPlayerName } from "@/data/teams";
import UserAvatar from "@/components/UserAvatar";

interface Props {
  trade: PendingGroupTrade;
  group: Group;
  onBack: () => void;
  onConfirm: () => Promise<boolean> | void;
  onCancel: () => void;
}

const GroupTradeProposal = ({ trade, group, onBack, onConfirm, onCancel }: Props) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const memberOf = (uid: string) =>
    group.members.find((m) => m.userId === uid);
  const nameOf = (uid: string) =>
    uid === user?.id ? "Você" : memberOf(uid)?.displayName || "?";

  const meConfirmed = user ? trade.confirmations.has(user.id) : false;
  const isAllShiny = trade.legs.every((l) => isShiny(l.stickerId));

  const handleConfirm = async () => {
    setSubmitting(true);
    await onConfirm();
    setSubmitting(false);
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg text-foreground truncate">Proposta de troca</h2>
          <p className="text-xs text-muted-foreground">
            {trade.legs.length}-via {isAllShiny && "(✨ brilhantes)"} · {nameOf(trade.proposedBy)} propôs
          </p>
        </div>
      </div>

      {/* Legs visualization */}
      <div className={`rounded-xl p-4 shadow-md border ${isAllShiny ? "bg-amber-500/5 border-amber-500/40" : "bg-card border-border/40"}`}>
        <h3 className="font-bold text-sm text-foreground mb-3">As trocas</h3>
        <div className="space-y-3">
          {trade.legs.map((leg, i) => {
            const player = getPlayerName(leg.stickerId);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground min-w-[60px] truncate">{nameOf(leg.fromUserId)}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <div className={`flex-1 px-2.5 py-1.5 rounded-lg font-mono text-xs flex items-center gap-1 ${
                  isShiny(leg.stickerId) ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-muted text-foreground"
                }`}>
                  <span className="font-bold">{leg.stickerId}</span>
                  {player && <span className="text-[10px] opacity-70 truncate">– {player}</span>}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs font-bold text-foreground min-w-[60px] truncate text-right">{nameOf(leg.toUserId)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmations */}
      <div className="bg-card rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-foreground">Confirmações</h3>
          <span className="text-xs font-bold text-primary">
            {trade.confirmations.size}/{trade.participants.size}
          </span>
        </div>
        <div className="space-y-2">
          {Array.from(trade.participants).map((uid) => {
            const m = memberOf(uid);
            const confirmed = trade.confirmations.has(uid);
            return (
              <div key={uid} className="flex items-center gap-2 py-1.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <UserAvatar avatarUrl={m?.avatarUrl ?? null} displayName={m?.displayName || "?"} className="w-full h-full" />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {nameOf(uid)}
                </span>
                {confirmed ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                    <Check className="w-4 h-4" /> Confirmado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                    <Clock className="w-4 h-4" /> Aguardando
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        {!meConfirmed && (
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="w-full py-3.5 rounded-xl header-gradient text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            {submitting ? "Confirmando…" : "Confirmar minha parte"}
          </button>
        )}
        {meConfirmed && (
          <div className="w-full py-3 rounded-xl bg-green-500/10 border border-green-500/40 text-green-700 dark:text-green-400 font-bold text-sm text-center">
            ✓ Você já confirmou — aguardando os outros
          </div>
        )}
        <button
          onClick={() => { if (confirm("Cancelar esta proposta?")) onCancel(); }}
          className="w-full py-2.5 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/20"
        >
          <X className="w-4 h-4" /> Cancelar proposta
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
        Quando todos confirmarem, o app vai atualizar os álbuns automaticamente.
        As figurinhas mudam de dono no momento da última confirmação.
      </p>
    </div>
  );
};

export default GroupTradeProposal;
