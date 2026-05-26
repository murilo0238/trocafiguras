import { X, RotateCcw } from "lucide-react";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  partnerName: string;
  myName: string;
  iCanGive: string[];
  theyCanGive: string[];
}

const StickerList = ({ ids, color }: { ids: string[]; color: "orange" | "blue" }) => {
  const cls = color === "orange"
    ? "bg-orange-500/20 border border-orange-400/40 text-orange-200"
    : "bg-blue-500/20 border border-blue-400/40 text-blue-200";
  return (
    <div className="flex flex-wrap gap-2 justify-center max-h-44 overflow-y-auto px-4">
      {ids.map((id) => (
        <span key={id} className={`${cls} font-bold text-xl px-3 py-2 rounded-xl`}>
          {id}
        </span>
      ))}
      {ids.length === 0 && <span className="text-white/30 text-base">—</span>}
    </div>
  );
};

const EventModePanel = ({ open, onClose, partnerName, myName, iCanGive, theyCanGive }: Props) => {
  const [flipped, setFlipped] = useState(false);

  if (!open) return null;

  const count = Math.min(iCanGive.length, theyCanGive.length);
  const giving = iCanGive.slice(0, count);
  const receiving = theyCanGive.slice(0, count);

  // top = visible to you (top of screen), bottom = visible to partner (bottom of screen)
  const top = flipped
    ? { name: partnerName, label: "Você recebe", ids: receiving, color: "blue" as const }
    : { name: myName,      label: "Você dá",     ids: giving,    color: "orange" as const };
  const bottom = flipped
    ? { name: myName,      label: "Você dá",     ids: giving,    color: "orange" as const }
    : { name: partnerName, label: "Você recebe",  ids: receiving, color: "blue" as const };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-center flex-1">
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Modo Evento</p>
          <p className="text-white font-bold text-sm">{myName} ↔ {partnerName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFlipped((v) => !v)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
            title="Virar para o parceiro ver"
          >
            <RotateCcw className="w-4 h-4 text-white/70" />
          </button>
          <button
            onClick={() => { onClose(); setFlipped(false); }}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center justify-center gap-2 py-2 bg-primary/10 border-b border-primary/20 flex-shrink-0">
        <span className="text-primary font-bold text-sm">
          ⚡ {count} troca{count !== 1 ? "s" : ""} possível{count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Top half — facing you */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 border-b border-white/10">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{top.name}</p>
        <p className="text-white/60 text-sm font-bold">{top.label}</p>
        <StickerList ids={top.ids} color={top.color} />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 px-4 py-1 flex-shrink-0">
        <div className="flex-1 h-px bg-white/10" />
        <button
          onClick={() => setFlipped((v) => !v)}
          className="text-white/20 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 hover:text-white/40 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> vira para o parceiro
        </button>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Bottom half — facing partner */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 border-t border-white/10">
        <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{bottom.name}</p>
        <p className="text-white/60 text-sm font-bold">{bottom.label}</p>
        <StickerList ids={bottom.ids} color={bottom.color} />
      </div>
    </div>
  );
};

export default EventModePanel;
