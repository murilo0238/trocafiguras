import { TrendingUp, TrendingDown } from "lucide-react";
import { useStickerStats } from "@/hooks/useStickerStats";

const StickerRanking = () => {
  const { easiest, hardest, loading } = useStickerStats();

  if (loading) {
    return (
      <p className="text-center text-muted-foreground animate-pulse py-4 text-sm">
        Carregando ranking...
      </p>
    );
  }

  if (easiest.length === 0 && hardest.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-4 text-sm">
        Ainda não há dados suficientes para o ranking.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Easiest */}
      <div className="bg-card rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h3 className="font-bold text-foreground text-sm">🟢 10 Mais Fáceis</h3>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {easiest.map((s, i) => (
            <div
              key={s.sticker_id}
              className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 text-center"
            >
              <span className="text-[9px] text-muted-foreground">#{i + 1}</span>
              <p className="text-xs font-bold text-foreground">{s.sticker_id}</p>
              <p className="text-[9px] text-muted-foreground">{s.count}x</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hardest */}
      <div className="bg-card rounded-xl p-4 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-foreground text-sm">🔴 10 Mais Difíceis</h3>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {hardest.map((s, i) => (
            <div
              key={s.sticker_id}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center"
            >
              <span className="text-[9px] text-muted-foreground">#{i + 1}</span>
              <p className="text-xs font-bold text-foreground">{s.sticker_id}</p>
              <p className="text-[9px] text-muted-foreground">{s.count}x</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StickerRanking;
