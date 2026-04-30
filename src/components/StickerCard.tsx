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
      className={`sticker-card relative aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-200 ${
        collected
          ? "bg-card-collected ring-2 ring-secondary/40 shadow-md"
          : "bg-card-uncollected hover:bg-muted"
      }`}
      onClick={onToggle}
    >
      <span
        className={`text-[11px] leading-tight font-bold text-center px-0.5 ${
          collected ? "text-accent-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>

      {duplicates > 0 && (
        <div className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center bounce-in shadow-sm">
          {duplicates}
        </div>
      )}

      {collected && (
        <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-1 px-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (duplicates > 0) onRemoveDuplicate();
            }}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
              duplicates > 0
                ? "bg-foreground/20 hover:bg-destructive/30 active:scale-90"
                : "bg-foreground/10 cursor-not-allowed"
            }`}
            disabled={duplicates === 0}
          >
            <Minus className={`w-3 h-3 ${duplicates > 0 ? "text-accent-foreground" : "text-muted-foreground/40"}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddDuplicate();
            }}
            className="w-5 h-5 rounded-full bg-foreground/20 hover:bg-primary/30 active:scale-90 flex items-center justify-center transition-colors"
          >
            <Plus className="w-3 h-3 text-accent-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StickerCard;
