import { Plus, Minus, Check } from "lucide-react";

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
      className={`sticker-card relative aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 ${
        collected
          ? "bg-gradient-to-br from-emerald-500 to-green-700 sticker-collected-glow ring-1 ring-emerald-400/50"
          : "bg-card border border-border hover:border-primary/30 hover:bg-muted/60"
      }`}
      onClick={onToggle}
    >
      {collected && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/8 rounded-t-xl" />
        </div>
      )}

      {collected && (
        <Check className="w-3 h-3 text-white/60 absolute top-1.5 left-1.5" strokeWidth={3} />
      )}

      <span
        className={`text-[11px] leading-tight font-bold text-center px-0.5 z-10 ${
          collected ? "text-white drop-shadow-sm" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>

      {duplicates > 0 && (
        <div className="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-900 text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center bounce-in shadow-md shadow-amber-400/40 z-20 ring-1 ring-background">
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
                ? "bg-white/20 hover:bg-red-500/40 active:scale-90"
                : "bg-white/10 cursor-not-allowed opacity-40"
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
            className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/35 active:scale-90 flex items-center justify-center transition-all"
          >
            <Plus className="w-2.5 h-2.5 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StickerCard;
