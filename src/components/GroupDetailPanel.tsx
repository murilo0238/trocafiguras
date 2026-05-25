import { useState, useMemo } from "react";
import { ChevronLeft, Sparkles, ArrowRight, UserPlus, X, Lightbulb } from "lucide-react";
import { Group } from "@/hooks/useGroups";
import { useGroups } from "@/hooks/useGroups";
import { useGroupTrades } from "@/hooks/useGroupTrades";
import { useAuth } from "@/hooks/useAuth";
import UserAvatar from "@/components/UserAvatar";
import GroupTradeProposal from "@/components/GroupTradeProposal";
import { getPlayerName, getSectionForSticker } from "@/data/teams";
import { isShiny } from "@/data/shinies";
import { TradeCycle } from "@/lib/findCycles";

interface Props {
  group: Group;
  onBack: () => void;
}

const stickerLabel = (id: string): string => {
  const player = getPlayerName(id);
  const section = getSectionForSticker(id);
  if (player) return `${id} – ${player}`;
  if (section && section.group) return `${id} – Escudo ${section.name}`;
  if (section) return `${id} – ${section.name}`;
  return id;
};

const GroupDetailPanel = ({ group, onBack }: Props) => {
  const { user } = useAuth();
  const { addMember, removeMember } = useGroups();
  const {
    inventories,
    cycles,
    pendingTrades,
    searching,
    findBestTrades,
    proposeTrade,
    confirmTrade,
    cancelTrade,
  } = useGroupTrades(group.id);

  const [openTradeId, setOpenTradeId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [addingName, setAddingName] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);

  const isOwner = group.createdBy === user?.id;
  const myInventory = inventories.find((i) => i.userId === user?.id);

  const nameOf = (uid: string): string => {
    if (uid === user?.id) return "Você";
    return group.members.find((m) => m.userId === uid)?.displayName || "?";
  };

  const openTrade = pendingTrades.find((t) => t.id === openTradeId);
  if (openTrade) {
    return (
      <GroupTradeProposal
        trade={openTrade}
        group={group}
        onBack={() => setOpenTradeId(null)}
        onConfirm={() => confirmTrade(openTrade.id)}
        onCancel={() => { cancelTrade(openTrade.id); setOpenTradeId(null); }}
      />
    );
  }

  // Bilateral suggestions vs selected member
  const bilateral = useMemo(() => {
    if (!selectedMember || !myInventory) return { iCanGive: [], theyCanGive: [] };
    const theirs = inventories.find((i) => i.userId === selectedMember);
    if (!theirs) return { iCanGive: [], theyCanGive: [] };
    const iCanGive = Array.from(myInventory.gives).filter((s) => theirs.wants.has(s));
    const theyCanGive = Array.from(theirs.gives).filter((s) => myInventory.wants.has(s));
    return { iCanGive, theyCanGive };
  }, [selectedMember, myInventory, inventories]);

  // Quick stats: my duplicates that anyone in group needs
  const mySuggestions = useMemo(() => {
    if (!myInventory) return { offerable: [], needsHere: [] };
    const offerable: { sticker: string; toName: string }[] = [];
    const needsHere: { sticker: string; fromName: string }[] = [];
    for (const other of inventories) {
      if (other.userId === user?.id) continue;
      for (const s of myInventory.gives) {
        if (other.wants.has(s)) offerable.push({ sticker: s, toName: nameOf(other.userId) });
      }
      for (const s of other.gives) {
        if (myInventory.wants.has(s)) needsHere.push({ sticker: s, fromName: nameOf(other.userId) });
      }
    }
    return { offerable: offerable.slice(0, 5), needsHere: needsHere.slice(0, 5) };
  }, [myInventory, inventories, user?.id]);

  const handleAddMember = async () => {
    setAdding(true);
    const ok = await addMember(group.id, addingName);
    setAdding(false);
    if (ok) {
      setAddingName("");
      setShowAddInput(false);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg text-foreground truncate">{group.name}</h2>
          <p className="text-xs text-muted-foreground">{group.members.length}/4 membros</p>
        </div>
      </div>

      {/* Members chips */}
      <div className="bg-card rounded-xl p-3 shadow-md">
        <div className="flex flex-wrap gap-2">
          {group.members.map((m) => {
            const isSelf = m.userId === user?.id;
            const isSelected = selectedMember === m.userId;
            return (
              <button
                key={m.userId}
                onClick={() => !isSelf && setSelectedMember(isSelected ? null : m.userId)}
                disabled={isSelf}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-border/40 text-foreground"
                } ${isSelf ? "opacity-70" : "hover:border-primary"}`}
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-card flex-shrink-0">
                  <UserAvatar avatarUrl={m.avatarUrl} displayName={m.displayName} className="w-full h-full" />
                </div>
                <span className="text-xs font-semibold">
                  {isSelf ? "Você" : m.displayName}
                </span>
                {isOwner && !isSelf && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remover ${m.displayName}?`)) removeMember(group.id, m.userId);
                    }}
                    className="ml-1 text-destructive/80 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
          {isOwner && group.members.length < 4 && (
            showAddInput ? (
              <div className="flex items-center gap-1 bg-muted rounded-full px-2 py-1 border border-primary/40">
                <input
                  type="text"
                  autoFocus
                  value={addingName}
                  onChange={(e) => setAddingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                  placeholder="Nome"
                  className="bg-transparent outline-none text-xs w-24"
                />
                <button onClick={handleAddMember} disabled={adding || !addingName.trim()} className="text-primary text-xs font-bold disabled:opacity-50">
                  {adding ? "…" : "OK"}
                </button>
                <button onClick={() => { setShowAddInput(false); setAddingName(""); }} className="text-muted-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddInput(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-dashed border-primary/40 text-xs font-bold hover:bg-primary/20"
              >
                <UserPlus className="w-3.5 h-3.5" /> Adicionar
              </button>
            )
          )}
        </div>
      </div>

      {/* Bilateral view */}
      {selectedMember && (
        <div className="bg-card rounded-xl p-4 shadow-md">
          <h3 className="font-bold text-sm text-foreground mb-3">
            Trocas com {nameOf(selectedMember)}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] uppercase font-bold text-muted-foreground mb-2">Você dá</p>
              {bilateral.iCanGive.length === 0 ? (
                <p className="text-xs text-muted-foreground/70">Nenhuma agora</p>
              ) : (
                <ul className="space-y-1">
                  {bilateral.iCanGive.slice(0, 8).map((s) => (
                    <li key={s} className={`text-xs ${isShiny(s) ? "text-amber-500 font-semibold" : "text-foreground"}`}>
                      {isShiny(s) && "✨ "}{s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-muted-foreground mb-2">Você recebe</p>
              {bilateral.theyCanGive.length === 0 ? (
                <p className="text-xs text-muted-foreground/70">Nenhuma agora</p>
              ) : (
                <ul className="space-y-1">
                  {bilateral.theyCanGive.slice(0, 8).map((s) => (
                    <li key={s} className={`text-xs ${isShiny(s) ? "text-amber-500 font-semibold" : "text-foreground"}`}>
                      {isShiny(s) && "✨ "}{s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending trades */}
      {pendingTrades.length > 0 && (
        <div className="bg-card rounded-xl p-4 shadow-md">
          <h3 className="font-bold text-sm text-foreground mb-3">Propostas em andamento</h3>
          <div className="space-y-2">
            {pendingTrades.map((t) => (
              <button
                key={t.id}
                onClick={() => setOpenTradeId(t.id)}
                className="w-full text-left p-3 rounded-lg border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-foreground">
                    {t.legs.length}-via — proposta de {nameOf(t.proposedBy)}
                  </span>
                  <span className="text-[10px] font-bold text-amber-600">
                    {t.confirmations.size}/{t.participants.size} confirmados
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {t.legs.map((l) => l.stickerId).join(" • ")}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Magic button */}
      <button
        onClick={() => findBestTrades()}
        disabled={searching || inventories.length < 2}
        className="w-full py-4 rounded-xl header-gradient text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 active:scale-[0.99] transition-all"
      >
        <Sparkles className="w-5 h-5" />
        {searching ? "Procurando…" : "Achar melhores trocas em grupo"}
      </button>

      {/* Suggested cycles */}
      {cycles.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-foreground px-1">
            Trocas sugeridas ({cycles.length})
          </h3>
          {cycles.map((c, i) => (
            <CycleCard
              key={i}
              cycle={c}
              nameOf={nameOf}
              onPropose={async () => {
                const id = await proposeTrade(c);
                if (id) setOpenTradeId(id);
              }}
            />
          ))}
        </div>
      )}

      {cycles.length === 0 && !searching && inventories.length >= 2 && (
        <div className="bg-card rounded-xl p-4 shadow-md text-center">
          <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground font-medium">
            Aperte o botão para buscar trocas
          </p>
        </div>
      )}

      {/* Suggestions */}
      {(mySuggestions.offerable.length > 0 || mySuggestions.needsHere.length > 0) && (
        <div className="bg-card rounded-xl p-4 shadow-md">
          <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" /> Dicas rápidas
          </h3>
          <div className="space-y-3">
            {mySuggestions.offerable.length > 0 && (
              <div>
                <p className="text-[11px] uppercase font-bold text-muted-foreground mb-1.5">
                  Suas duplicatas que alguém aqui precisa
                </p>
                <ul className="space-y-1">
                  {mySuggestions.offerable.map((o, i) => (
                    <li key={i} className="text-xs text-foreground">
                      <span className={isShiny(o.sticker) ? "text-amber-500 font-semibold" : ""}>
                        {isShiny(o.sticker) && "✨ "}{stickerLabel(o.sticker)}
                      </span>{" "}
                      → <span className="font-semibold">{o.toName}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {mySuggestions.needsHere.length > 0 && (
              <div>
                <p className="text-[11px] uppercase font-bold text-muted-foreground mb-1.5">
                  Faltam no seu álbum, alguém daqui tem
                </p>
                <ul className="space-y-1">
                  {mySuggestions.needsHere.map((o, i) => (
                    <li key={i} className="text-xs text-foreground">
                      <span className="font-semibold">{o.fromName}</span> tem{" "}
                      <span className={isShiny(o.sticker) ? "text-amber-500 font-semibold" : ""}>
                        {isShiny(o.sticker) && "✨ "}{stickerLabel(o.sticker)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CycleCard = ({
  cycle,
  nameOf,
  onPropose,
}: {
  cycle: TradeCycle;
  nameOf: (uid: string) => string;
  onPropose: () => void;
}) => {
  return (
    <div className={`rounded-xl p-4 shadow-md border ${cycle.shiny ? "bg-amber-500/5 border-amber-500/40" : "bg-card border-border/40"}`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold ${cycle.shiny ? "text-amber-600" : "text-primary"}`}>
          {cycle.shiny && "✨ "}{cycle.legs.length}-via {cycle.shiny ? "(brilhantes)" : ""}
        </span>
        <button
          onClick={onPropose}
          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90"
        >
          Propor
        </button>
      </div>
      <div className="space-y-2">
        {cycle.legs.map((leg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-foreground min-w-0 truncate">{nameOf(leg.fromUserId)}</span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className={`font-mono px-2 py-0.5 rounded ${cycle.shiny ? "bg-amber-500/20 text-amber-700 dark:text-amber-300" : "bg-muted text-foreground"}`}>
              {leg.stickerId}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="font-semibold text-foreground min-w-0 truncate">{nameOf(leg.toUserId)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupDetailPanel;
