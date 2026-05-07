import { Plus, Minus, Check } from "lucide-react";
import { getPlayerName } from "@/data/teams";

interface StickerCardProps {
  id: string;
  collected: boolean;
  duplicates: number;
  onToggle: () => void;
  onAddDuplicate: () => void;
  onRemoveDuplicate: () => void;
}

const StickerCard = ({
  id,
  collected,
  duplicates,
  onToggle,
  onAddDuplicate,
  onRemoveDuplicate,
}: StickerCardProps) => {
  const match = id ? id.match(/^([A-Za-z]+)(\d+)$/) : null;
  const code = match ? match[1] : id;
  const number = match ? match[2] : "";
  const playerName = getPlayerName(id);

  return (
    <div
      className={`relative p-2 rounded-[1.25rem] flex flex-col gap-2 transition-all duration-200 ${
        collected
          ? "border border-gold/40 bg-card shadow-md"
          : "border-2 border-dashed border-white/10 bg-transparent"
      }`}
    >
      {/* Inner Card (Sticker Graphic) */}
      <div
        className={`relative aspect-[3/4] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 ${
          collected
            ? "bg-gradient-to-br from-gold-light via-gold to-[#9e844a] shadow-inner"
            : "bg-white/5 hover:bg-white/10"
        }`}
        onClick={onToggle}
      >
        {/* Shine effect for collected */}
        {collected && (
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-xl h-1/2" />
        )}

        {/* Top Right Badge */}
        <div className="absolute top-2 right-2">
          {collected ? (
            <span className="bg-[#1a1000]/15 text-[#1a1000]/80 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Coletada
            </span>
          ) : (
            <span className="bg-black/30 text-white/40 text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Precisa
            </span>
          )}
        </div>

        {/* Sticker Content */}
        <span
          className={`text-2xl font-black tracking-wide ${
            collected ? "text-[#1a1000] drop-shadow-sm" : "text-white/40"
          }`}
        >
          {id === "FWC00" ? "00" : code}
        </span>
        {id !== "FWC00" && (
          <span
            className={`text-[10px] font-bold mt-0.5 ${
              collected ? "text-[#1a1000]/70" : "text-white/20"
            }`}
          >
            {id}
          </span>
        )}
      </div>

      {/* Nome do jogador ou ID da figurinha */}
      <div className="text-center px-0.5">
        {playerName ? (
          <span className="text-[10px] font-semibold text-foreground leading-tight line-clamp-2 block">
            {playerName}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {id}
          </span>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (duplicates > 0) onRemoveDuplicate();
          }}
          disabled={duplicates === 0}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            duplicates > 0
              ? "bg-destructive/15 text-destructive hover:bg-destructive/25 active:scale-90 cursor-pointer"
              : "bg-white/5 text-white/20 cursor-not-allowed"
          }`}
        >
          <Minus className="w-3.5 h-3.5" strokeWidth={3} />
        </button>

        <span className="text-sm font-bold text-foreground w-6 text-center">
          {duplicates}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (collected) onAddDuplicate();
          }}
          disabled={!collected}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            collected
              ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 active:scale-90 cursor-pointer"
              : "bg-white/5 text-white/20 cursor-not-allowed"
          }`}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default StickerCard;
