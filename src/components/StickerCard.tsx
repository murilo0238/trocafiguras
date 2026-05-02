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
      className={`sticker-card relative rounded-xl cursor-pointer select-none transition-all duration-150 active:scale-95 ${
        collected
          ? "bg-gradient-to-b from-gold-light via-gold to-[#b8973a] collected-glow shadow-md"
          : "bg-card border border-border/50 hover:border-primary/30 shadow-sm"
      }`}
      onClick={onToggle}
    >
      {/* Shine strip */}
      {collected && (
        <div className="absolute inset-x-0 top-0 h-2/5 rounded-t-xl bg-white/25 pointer-events-none" />
      )}

      {/* Duplicate badge */}
      {duplicates > 0 && (
        <div className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 bounce-in shadow-md ring-2 ring-background z-20">
          {duplicates > 9 ? "9+" : duplicates}
        </div>
      )}

      <div className="flex flex-col items-center pt-2.5 pb-2 px-1 gap-0.5">
        {/* Team code */}
        <span className={`text-[9px] font-black uppercase tracking-widest leading-none ${
          collected ? "text-[#3a2000]/70" : "text-muted-foreground/60"
        }`}>
          {code}
        </span>

        {/* Sticker number — big and bold */}
        <span className={`text-[22px] font-black leading-none tabular-nums ${
          collected ? "text-[#1a1000] drop-shadow-sm" : "text-foreground/25"
        }`}>
          {number}
        </span>

        {/* Collected check */}
        {collected && (
          <div className="w-4 h-4 rounded-full bg-[#1a3a1a]/20 flex items-center justify-center mt-0.5">
            <Check className="w-2.5 h-2.5 text-[#1a3a1a]" strokeWidth={3} />
          </div>
        )}

        {/* +/- duplicates controls */}
        {collected && (
          <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { if (duplicates > 0) onRemoveDuplicate(); }}
              disabled={duplicates === 0}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-all active:scale-90 ${
                duplicates > 0
                  ? "bg-[#1a3a4c]/20 hover:bg-[#1a3a4c]/35 text-[#1a3a4c]"
                  : "bg-[#1a3a4c]/10 text-[#1a3a4c]/30 cursor-not-allowed"
              }`}
            >
              <Minus className="w-3 h-3" strokeWidth={2.5} />
            </button>
            <button
              onClick={onAddDuplicate}
              className="w-6 h-6 rounded-md bg-[#1a3a4c]/20 hover:bg-[#1a3a4c]/35 text-[#1a3a4c] flex items-center justify-center transition-all active:scale-90"
            >
              <Plus className="w-3 h-3" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StickerCard;
