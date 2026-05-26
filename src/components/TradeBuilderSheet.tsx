import { useState, useMemo } from "react";
import { X, Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { SECTIONS } from "@/data/teams";
import { getSectionForSticker } from "@/data/teams";

interface Props {
  open: boolean;
  onClose: () => void;
  myDuplicates: string[];
  theirDuplicates: string[];
  partnerName: string;
  initialOffered: string[];
  initialRequested: string[];
  onSend: (offered: string[], requested: string[]) => Promise<void>;
}

type Tab = "offer" | "request";

// Group sticker IDs by section, preserving SECTIONS order
const groupBySection = (ids: string[]) => {
  const set = new Set(ids);
  const groups: { code: string; name: string; flag?: string; stickers: string[] }[] = [];
  for (const section of SECTIONS) {
    const stickers = ids.filter((id) => {
      const sec = getSectionForSticker(id);
      return sec?.code === section.code;
    });
    if (stickers.length > 0) {
      groups.push({ code: section.code, name: section.name, flag: section.flag, stickers });
    }
  }
  return groups;
};

const TradeBuilderSheet = ({
  open,
  onClose,
  myDuplicates,
  theirDuplicates,
  partnerName,
  initialOffered,
  initialRequested,
  onSend,
}: Props) => {
  const [tab, setTab] = useState<Tab>("offer");
  const [offered, setOffered] = useState<Set<string>>(() => new Set(initialOffered));
  const [requested, setRequested] = useState<Set<string>>(() => new Set(initialRequested));
  const [sending, setSending] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => new Set());

  const offeredGroups = useMemo(() => groupBySection(myDuplicates), [myDuplicates]);
  const requestedGroups = useMemo(() => groupBySection(theirDuplicates), [theirDuplicates]);

  if (!open) return null;

  const toggle = (id: string, side: Tab) => {
    if (side === "offer") {
      setOffered((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    } else {
      setRequested((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  };

  const toggleSection = (code: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const selectAllInSection = (stickers: string[], side: Tab, allSelected: boolean) => {
    if (side === "offer") {
      setOffered((prev) => {
        const next = new Set(prev);
        stickers.forEach((id) => allSelected ? next.delete(id) : next.add(id));
        return next;
      });
    } else {
      setRequested((prev) => {
        const next = new Set(prev);
        stickers.forEach((id) => allSelected ? next.delete(id) : next.add(id));
        return next;
      });
    }
  };

  const handleSend = async () => {
    if (offered.size === 0 && requested.size === 0) return;
    setSending(true);
    await onSend([...offered], [...requested]);
    setSending(false);
    onClose();
  };

  const activeSet = tab === "offer" ? offered : requested;
  const groups = tab === "offer" ? offeredGroups : requestedGroups;
  const emptyMsg = tab === "offer"
    ? "Você não tem nenhuma figurinha repetida para oferecer."
    : `${partnerName} não tem nenhuma figurinha repetida disponível.`;

  const renderGroups = (side: Tab) => {
    const grps = side === "offer" ? offeredGroups : requestedGroups;
    const sel = side === "offer" ? offered : requested;

    if (grps.length === 0) {
      return <p className="text-center text-sm text-muted-foreground py-8">{emptyMsg}</p>;
    }

    return grps.map((group) => {
      const allSelected = group.stickers.every((id) => sel.has(id));
      const someSelected = group.stickers.some((id) => sel.has(id));
      const isExpanded = expandedSections.has(`${side}-${group.code}`);
      const selectedCount = group.stickers.filter((id) => sel.has(id)).length;

      return (
        <div key={group.code} className="border border-border/50 rounded-xl overflow-hidden">
          {/* Section header */}
          <button
            onClick={() => toggleSection(`${side}-${group.code}`)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{group.flag}</span>
              <span className="text-sm font-bold text-foreground">{group.name}</span>
              {someSelected && (
                <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {selectedCount}/{group.stickers.length}
                </span>
              )}
              {!someSelected && (
                <span className="text-[10px] text-muted-foreground">
                  {group.stickers.length} disponív{group.stickers.length === 1 ? "el" : "eis"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  selectAllInSection(group.stickers, side, allSelected);
                  if (!isExpanded) toggleSection(`${side}-${group.code}`);
                }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors ${
                  allSelected
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {allSelected ? "Tirar tudo" : "Selec. todos"}
              </button>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          </button>

          {/* Sticker chips */}
          {isExpanded && (
            <div className="flex flex-wrap gap-1.5 p-3">
              {group.stickers.map((id) => {
                const selected = sel.has(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id, side)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
                      selected
                        ? side === "offer"
                          ? "bg-orange-500/25 border-orange-400/60 text-orange-200"
                          : "bg-primary/25 border-primary/60 text-primary"
                        : "bg-muted/40 border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {id}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  const canSend = offered.size > 0 || requested.size > 0;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div>
          <p className="font-bold text-foreground text-sm">Montar troca</p>
          <p className="text-xs text-muted-foreground">com {partnerName}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border flex-shrink-0">
        <button
          onClick={() => setTab("offer")}
          className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
            tab === "offer" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            Eu ofereço
            {offered.size > 0 && (
              <span className="bg-orange-500/20 text-orange-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {offered.size}
              </span>
            )}
          </span>
          {tab === "offer" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-400 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setTab("request")}
          className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
            tab === "request" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            Eu peço
            {requested.size > 0 && (
              <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {requested.size}
              </span>
            )}
          </span>
          {tab === "request" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Hint */}
      <div className="px-4 py-2 bg-muted/20 flex-shrink-0">
        <p className="text-[11px] text-muted-foreground text-center">
          {tab === "offer"
            ? `Suas figurinhas repetidas — toque para incluir na proposta`
            : `Repetidas de ${partnerName} — toque para pedir`}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {renderGroups(tab)}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4 space-y-3 flex-shrink-0 bg-card">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className={offered.size > 0 ? "text-orange-400 font-bold" : "text-muted-foreground"}>
              Dando {offered.size}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className={requested.size > 0 ? "text-primary font-bold" : "text-muted-foreground"}>
              Pedindo {requested.size}
            </span>
          </div>
          {offered.size === 0 && requested.size > 0 && (
            <span className="text-[10px] text-amber-500 font-semibold">pedido sem oferta</span>
          )}
          {offered.size > 0 && requested.size === 0 && (
            <span className="text-[10px] text-blue-400 font-semibold">doação</span>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={!canSend || sending}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Enviar proposta
        </button>
      </div>
    </div>
  );
};

export default TradeBuilderSheet;
