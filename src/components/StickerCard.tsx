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
  // Extract the code part (letters) and number part
  const label = id ? id.replace(/(\D+)(\d+)/, "$1 $2") : "";

  return (
    <div
      className={`sticker-card relative aspect-square rounded-md flex items-center justify-center cursor-pointer select-none ${
        collected ? "bg-card-collected" : "bg-card-uncollected"
      }`}
      onClick={onToggle}
    >
      <span
        className={`text-[7px] leading-tight font-bold text-center ${
          collected ? "text-accent-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>

      {duplicates > 0 && (
        <div className="absolute -top-0.5 -right-0.5 bg-secondary text-secondary-foreground text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center bounce-in">
          {duplicates}
        </div>
      )}

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
