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
      className={`sticker-card relative aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 ${
        collected
          ? "bg-gradient-to-br from-orange-400 via-amber-400 to-yellow-400 collected-glow"
          : "bg-card border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5"
      }`}
      onClick={onToggle}
    >
      {collected && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/20 rounded-full blur-md" />
        </div>
      )}

      <span
        className={`text-[11px] leading-tight font-bold text-center px-0.5 z-10 ${
          collected ? "text-white drop-shadow" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>

      {!collected && (
        <span className="text-[18px] opacity-20 mt-0.5">⭐</span>
      )}

      {duplicates > 0 && (
        <div className="absolute -top-2 -right-2 bg-violet-600 text-white text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center bounce-in shadow-lg shadow-violet-600/50 z-20">
          {duplicates}
        </div>
      )}

      {collected && (
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1 px-1 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (duplicates > 0) onRemoveDuplicate();
            }}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              duplicates > 0
                ? "bg-white/30 hover:bg-red-400/50 active:scale-90"
                : "bg-white/15 cursor-not-allowed opacity-40"
            }`}
            disabled={duplicates === 0}
          >
            <Minus className="w-2.5 h-2.5 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddDuplicate();
            }}
            className="w-5 h-5 rounded-full bg-white/30 hover:bg-white/50 active:scale-90 flex items-center justify-center transition-all"
          >
            <Plus className="w-2.5 h-2.5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StickerCard;
