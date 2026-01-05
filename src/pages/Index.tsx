import { useState } from "react";
import { CheckCircle, XCircle, Copy } from "lucide-react";
import StickerCard from "@/components/StickerCard";
import StatCard from "@/components/StatCard";
import FilterButtons from "@/components/FilterButtons";
import { useStickerCollection } from "@/hooks/useStickerCollection";

type FilterType = "all" | "missing" | "duplicates";

const Index = () => {
  const {
    collection,
    toggleCollected,
    addDuplicate,
    removeDuplicate,
    stats,
    totalStickers,
  } = useStickerCollection();

  const [filter, setFilter] = useState<FilterType>("all");

  const getFilteredStickers = () => {
    const numbers = Array.from({ length: totalStickers }, (_, i) => i + 1);

    switch (filter) {
      case "missing":
        return numbers.filter((n) => !collection[n]?.collected);
      case "duplicates":
        return numbers.filter((n) => collection[n]?.duplicates > 0);
      default:
        return numbers;
    }
  };

  const filteredStickers = getFilteredStickers();

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <h1 className="text-2xl font-bold text-center text-primary mb-4">
          📒 Meu Álbum
        </h1>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatCard
            label="Tenho"
            value={`${stats.collected}/${stats.total}`}
            icon={<CheckCircle className="w-5 h-5" />}
            variant="primary"
          />
          <StatCard
            label="Faltam"
            value={stats.missing}
            icon={<XCircle className="w-5 h-5" />}
            variant="secondary"
          />
          <StatCard
            label="Repetidas"
            value={stats.duplicates}
            icon={<Copy className="w-5 h-5" />}
            variant="accent"
          />
        </div>

        {/* Filter Buttons */}
        <FilterButtons activeFilter={filter} onFilterChange={setFilter} />
      </header>

      {/* Sticker Grid */}
      <main className="px-3 pt-4">
        {filteredStickers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {filter === "missing"
                ? "🎉 Você completou o álbum!"
                : "Nenhuma figurinha repetida ainda"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filteredStickers.map((number) => (
              <StickerCard
                key={number}
                number={number}
                collected={collection[number]?.collected || false}
                duplicates={collection[number]?.duplicates || 0}
                onToggle={() => toggleCollected(number)}
                onAddDuplicate={() => addDuplicate(number)}
                onRemoveDuplicate={() => removeDuplicate(number)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
