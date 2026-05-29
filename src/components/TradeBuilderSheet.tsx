import { useState, useMemo } from "react";
import { X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { SECTIONS } from "@/data/teams";
import { getSectionForSticker } from "@/data/teams";

interface Props {
  open: boolean;
  onClose: (offered: string[], requested: string[]) => void;
  myDuplicates: string[];        // only those they don't have (filtered)
  theirDuplicates: string[];     // only those I don't have (filtered)
  myAllDuplicates: string[];     // every duplicate I own
  theirAllDuplicates: string[];  // every duplicate they own
  partnerName: string;
  initialOffered: string[];
  initialRequested: string[];
}

type Tab = "offer" | "request";

const groupBySection = (ids: string[]) => {
  const groups: { code: string; name: string; flag?: string; stickers: string[] }[] = [];
  for (const section of SECTIONS) {
    const stickers = ids.filter((id) => getSectionForSticker(id)?.code === section.code);
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
  myAllDuplicates,
  theirAllDuplicates,
  partnerName,
  initialOffered,
  initialRequested,
}: Props) => {
  const [tab, setTab] = useState<Tab>("offer");
  const [offered, setOffered] = useState<string[]>(initialOffered);
  const [requested, setRequested] = useState<string[]>(initialRequested);
  const [showAllOffer, setShowAllOffer] = useState(false);
  const [showAllRequest, setShowAllRequest] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const expanded: string[] = [];
    for (const section of SECTIONS) {
      if (initialOffered.some((id) => getSectionForSticker(id)?.code === section.code))
        expanded.push(`offer-${section.code}`);
      if (initialRequested.some((id) => getSectionForSticker(id)?.code === section.code))
        expanded.push(`request-${section.code}`);
    }
    return expanded;
  });

  const offerSource = showAllOffer ? myAllDuplicates : myDuplicates;
  const requestSource = showAllRequest ? theirAllDuplicates : theirDuplicates;
  const offeredGroups = useMemo(() => groupBySection(offerSource), [offerSource]);
  const requestedGroups = useMemo(() => groupBySection(requestSource), [requestSource]);


  if (!open) return null;

  const toggle = (id: string, side: Tab) => {
    if (side === "offer") {
      setOffered((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setRequested((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const toggleSection = (code: string) => {
    setExpandedSections((prev) =>
      prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]
    );
  };

  const selectAllInSection = (stickers: string[], side: Tab, allSelected: boolean) => {
    if (side === "offer") {
      setOffered((prev) =>
        allSelected
          ? prev.filter((id) => !stickers.includes(id))
          : [...new Set([...prev, ...stickers])]
      );
    } else {
      setRequested((prev) =>
        allSelected
          ? prev.filter((id) => !stickers.includes(id))
          : [...new Set([...prev, ...stickers])]
      );
    }
  };

  const renderGroups = (side: Tab) => {
    const grps = side === "offer" ? offeredGroups : requestedGroups;
    const sel = side === "offer" ? offered : requested;

    const emptyMsg = side === "offer"
      ? `Você não tem repetidas que ${partnerName} ainda não possui.`
      : `${partnerName} não tem repetidas que você ainda não possui.`;

    if (grps.length === 0) {
      return <p className="text-center text-sm text-muted-foreground py-8">{emptyMsg}</p>;
    }

    return grps.map((group) => {
      const allSelected = group.stickers.every((id) => sel.includes(id));
      const someSelected = group.stickers.some((id) => sel.includes(id));
      const isExpanded = expandedSections.includes(`${side}-${group.code}`);
      const selectedCount = group.stickers.filter((id) => sel.includes(id)).length;

      return (
        <div key={group.code} className="border border-border/50 rounded-xl overflow-hidden">
          <div
            className="w-full flex items-center justify-between px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => toggleSection(`${side}-${group.code}`)}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{group.flag}</span>
              <span className="text-sm font-bold text-foreground">{group.name}</span>
              {someSelected ? (
                <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  {selectedCount}/{group.stickers.length}
                </span>
              ) : (
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
              {isExpanded
                ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              }
            </div>
          </div>

          {isExpanded && (
            <div className="flex flex-wrap gap-1.5 p-3">
              {group.stickers.map((id) => {
                const selected = sel.includes(id);
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

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div>
          <p className="font-bold text-foreground text-sm">Personalizar troca</p>
          <p className="text-xs text-muted-foreground">com {partnerName} — clique nas figurinhas para marcar/desmarcar</p>
        </div>
        <button onClick={() => onClose(offered, requested)} className="p-2 rounded-lg hover:bg-muted transition-colors">
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
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${offered.length > 0 ? "bg-orange-500/20 text-orange-400" : "bg-muted text-muted-foreground"}`}>
              {offered.length}
            </span>
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
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${requested.length > 0 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
              {requested.length}
            </span>
          </span>
          {tab === "request" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {renderGroups(tab)}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4 flex-shrink-0 bg-card">
        <button
          onClick={() => onClose(offered, requested)}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Check className="w-4 h-4" />
          Confirmar — dando {offered.length}, pedindo {requested.length}
        </button>
      </div>
    </div>
  );
};

export default TradeBuilderSheet;
