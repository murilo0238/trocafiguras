import { Plus, Minus } from "lucide-react";

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
  const label = id ? id.replace(/(\D+)(\d+)/, "$1 $2") : "";

  return (
    <div
      className={`sticker-card relative aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer select-none ${
        collected
          ? "bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 collected-glow"
          : "bg-card border border-border/60 hover:border-primary/40"
      }`}
      onClick={onToggle}
    >
      {/* Brilho no canto para as coletadas */}
      {collected && (
        <div className="absolute top-0 left-0 right-0 h-1/3 rounded-t-2xl bg-white/20 pointer-events-none" />
      )}

      <span
        className={`text-[11px] leading-tight font-bold text-center px-1 z-10 ${
          collected ? "text-amber-900 drop-shadow-sm" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>

      {!collected && (
        <span className="text-base opacity-15 mt-0.5 select-none">⬜</span>
      )}

      {duplicates > 0 && (
        <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center bounce-in shadow-lg shadow-red-500/60 z-20 ring-2 ring-background">
          {duplicates}
        </div>
      )}

      {collected && (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 px-1 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); if (duplicates > 0) onRemoveDuplicate(); }}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              duplicates > 0 ? "bg-amber-900/30 hover:bg-red-500/40 active:scale-90" : "opacity-30 cursor-not-allowed"
            }`}
            disabled={duplicates === 0}
          >
            <Minus className="w-2.5 h-2.5 text-amber-900" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAddDuplicate(); }}
            className="w-5 h-5 rounded-full bg-amber-900/30 hover:bg-amber-900/50 active:scale-90 flex items-center justify-center transition-all"
          >
            <Plus className="w-2.5 h-2.5 text-amber-900" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StickerCard;
