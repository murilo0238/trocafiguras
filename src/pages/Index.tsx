import { useState } from "react";
import { CheckCircle, XCircle, Copy } from "lucide-react";
import StickerCard from "@/components/StickerCard";
import StatCard from "@/components/StatCard";
import FilterButtons from "@/components/FilterButtons";
import { useStickerCollection } from "@/hooks/useStickerCollection";
import { SECTIONS, STICKERS_PER_SECTION } from "@/data/teams";

type FilterType = "all" | "missing" | "duplicates";

const Index = () => {
  const {
    collection,
    toggleCollected,
    addDuplicate,
    removeDuplicate,
    stats,
  } = useStickerCollection();

  const [filter, setFilter] = useState<FilterType>("all");

  const getSectionStickers = (code: string) => {
    const ids: string[] = [];
    for (let i = 1; i <= STICKERS_PER_SECTION; i++) {
      const id = `${code}${i}`;
      const data = collection[id];
      const show =
        filter === "all" ||
        (filter === "missing" && !data?.collected) ||
        (filter === "duplicates" && (data?.duplicates || 0) > 0);
      if (show) ids.push(id);
    }
    return ids;
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-4">
        <h1 className="text-2xl font-bold text-center text-primary mb-4">
          📒 Meu Álbum
        </h1>

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

        <FilterButtons activeFilter={filter} onFilterChange={setFilter} />
      </header>

      {/* Sticker Grid by Sections */}
      <main className="px-3 pt-4 space-y-4">
        {SECTIONS.map((section) => {
          const stickers = getSectionStickers(section.code);
          if (stickers.length === 0) return null;

          return (
            <div key={section.code}>
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-lg">{section.flag}</span>
                <h2 className="text-sm font-bold text-primary">
                  {section.name}
                </h2>
                {section.group && (
                  <span className="text-[10px] font-medium bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                    Grupo {section.group}
                  </span>
                )}
              </div>

              {/* Sticker Grid */}
              <div className="grid grid-cols-10 gap-1">
                {stickers.map((id) => (
                  <StickerCard
                    key={id}
                    id={id}
                    collected={collection[id]?.collected || false}
                    duplicates={collection[id]?.duplicates || 0}
                    onToggle={() => toggleCollected(id)}
                    onAddDuplicate={() => addDuplicate(id)}
                    onRemoveDuplicate={() => removeDuplicate(id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {SECTIONS.every((s) => getSectionStickers(s.code).length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {filter === "missing"
                ? "🎉 Você completou o álbum!"
                : "Nenhuma figurinha repetida ainda"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
