import { Plus, Minus } from "lucide-react";

interface StickerCardProps {
  number: number;
  collected: boolean;
  duplicates: number;
  onToggle: () => void;
  onAddDuplicate: () => void;
  onRemoveDuplicate: () => void;
}

const StickerCard = ({
  number,
  collected,
  duplicates,
  onToggle,
  onAddDuplicate,
  onRemoveDuplicate,
}: StickerCardProps) => {
  return (
    <div
      className={`sticker-card relative aspect-square rounded-md flex items-center justify-center cursor-pointer select-none ${
        collected
          ? "bg-card-collected"
          : "bg-card-uncollected"
      }`}
      onClick={onToggle}
    >
      {/* Sticker number */}
      <span
        className={`text-xs font-bold ${
          collected ? "text-accent-foreground" : "text-muted-foreground"
        }`}
      >
        {number}
      </span>

      {/* Duplicates badge */}
      {duplicates > 0 && (
        <div className="absolute -top-0.5 -right-0.5 bg-secondary text-secondary-foreground text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center bounce-in">
          {duplicates}
        </div>
      )}

      {/* Add/Remove duplicate buttons - only show when collected */}
      {collected && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5 pb-0.5">
          {duplicates > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveDuplicate();
              }}
              className="w-3 h-3 rounded-full bg-foreground/20 hover:bg-foreground/30 flex items-center justify-center transition-colors"
            >
              <Minus className="w-2 h-2 text-accent-foreground" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddDuplicate();
            }}
            className="w-3 h-3 rounded-full bg-foreground/20 hover:bg-foreground/30 flex items-center justify-center transition-colors"
          >
            <Plus className="w-2 h-2 text-accent-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};

export default StickerCard;
