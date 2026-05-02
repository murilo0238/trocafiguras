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
  const match = id ? id.match(/^([A-Za-z]+)(\d+)$/) : null;
  const code = match ? match[1] : id;
  const number = match ? match[2] : "";

  return (
    <div
      className={`sticker-card relative aspect-[3/4] rounded-xl cursor-pointer select-none transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        collected
          ? "bg-gradient-to-br from-gold-light via-gold to-[#9e844a] collected-glow shadow-md"
          : "bg-card border border-border/50 hover:border-primary/40 shadow-sm"
      }`}
      onClick={onToggle}
    >
      {/* Shine effect */}
      {collected && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none h-1/2" />
      )}

      {/* Duplicate badge */}
      {duplicates > 0 && (
        <div className="absolute top-1.5 right-1.5 bg-[#2a5671] text-white text-[11px] font-black rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1 shadow-lg ring-2 ring-[#2a5671]/20 z-20">
          {duplicates > 9 ? "9+" : duplicates}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 relative z-10 pointer-events-none">
        <span className={`text-[11px] font-bold uppercase tracking-widest leading-none mb-1 ${
          collected ? "text-[#1a1000]/60" : "text-muted-foreground/60"
        }`}>
          {code}
        </span>
        <span className={`text-[28px] font-black leading-none tabular-nums ${
          collected ? "text-[#1a1000] drop-shadow-md" : "text-foreground/20"
        }`}>
          {number}
        </span>
      </div>

      {/* Bottom Controls */}
      {collected && (
        <div 
          className="h-[38px] w-full bg-black/10 backdrop-blur-md flex items-center justify-between px-1.5 border-t border-black/10 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { if (duplicates > 0) onRemoveDuplicate(); }}
            disabled={duplicates === 0}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
              duplicates > 0
                ? "bg-[#1a3a4c]/20 hover:bg-[#1a3a4c]/30 text-[#1a1000]"
                : "opacity-30 cursor-not-allowed text-[#1a1000]"
            }`}
          >
            <Minus className="w-4 h-4" strokeWidth={3} />
          </button>

          <div className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center shadow-inner">
            <Check className="w-3 h-3 text-[#1a1000]" strokeWidth={4} />
          </div>

          <button
            onClick={onAddDuplicate}
            className="w-7 h-7 rounded-lg bg-[#1a3a4c]/20 hover:bg-[#1a3a4c]/30 text-[#1a1000] flex items-center justify-center transition-all active:scale-90"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
};

export default StickerCard;
