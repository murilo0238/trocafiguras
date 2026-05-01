import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Copy, LogOut, ArrowLeftRight, BarChart3, User, Search, X } from "lucide-react";
import logo from "@/assets/logo.png";
import StickerCard from "@/components/StickerCard";
import ShareCollection from "@/components/ShareCollection";
import StatCard from "@/components/StatCard";
import FilterButtons from "@/components/FilterButtons";
import TradingPanel from "@/components/TradingPanel";
import StickerRanking from "@/components/StickerRanking";
import { useStickerCollection } from "@/hooks/useStickerCollection";
import { useAuth } from "@/hooks/useAuth";
import { SECTIONS, STICKERS_PER_SECTION } from "@/data/teams";
import Auth from "./Auth";

type FilterType = "all" | "missing" | "duplicates";
type TabType = "album" | "trades" | "ranking";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    collection,
    toggleCollected,
    addDuplicate,
    removeDuplicate,
    stats,
    loading: collectionLoading,
  } = useStickerCollection();

  const [filter, setFilter] = useState<FilterType>("all");
  const [tab, setTab] = useState<TabType>("album");
  const [search, setSearch] = useState("");

  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredSections = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return SECTIONS;
    return SECTIONS.filter(
      (s) => normalize(s.name).includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [search]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-lg">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

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
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-gold px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Troca Figurinha" className="w-8 h-8 object-contain" />
            <h1 className="text-lg font-bold text-primary">Álbum da Copa 2026</h1>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/profile"
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title="Meu Perfil"
            >
              <User className="w-4 h-4 text-muted-foreground" />
            </Link>
            <ShareCollection collection={collection} />
            <button
              onClick={signOut}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-3 gap-2 mb-3">
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

        {/* Tabs */}
        <div className="flex gap-1.5 mb-3">
          <button
            onClick={() => setTab("album")}
            className={`flex-1 py-2 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1 ${
              tab === "album"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground"
            }`}
          >
            📒 Álbum
          </button>
          <button
            onClick={() => setTab("trades")}
            className={`flex-1 py-2 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1 ${
              tab === "trades"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <ArrowLeftRight className="w-3 h-3" /> Trocas
          </button>
          <button
            onClick={() => setTab("ranking")}
            className={`flex-1 py-2 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1 ${
              tab === "ranking"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <BarChart3 className="w-3 h-3" /> Ranking
          </button>
        </div>

        {tab === "album" && (
          <>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar seleção (ex: Brasil, BRA, FWC)"
                className="w-full pl-9 pr-9 py-2 text-sm rounded-full bg-muted text-foreground placeholder:text-muted-foreground border-none focus:ring-2 focus:ring-primary outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-background/50"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <FilterButtons activeFilter={filter} onFilterChange={setFilter} />
          </>
        )}
      </header>

      {/* Content */}
      <main className="px-3 pt-4">
        {collectionLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground animate-pulse">Carregando coleção...</p>
          </div>
        ) : tab === "album" ? (
          <div className="space-y-4">
            {filteredSections.map((section) => {
              const stickers = getSectionStickers(section.code);
              if (stickers.length === 0) return null;

              return (
                <div key={section.code}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-2xl drop-shadow-sm">{section.flag}</span>
                    <h2 className="text-sm font-bold text-primary">{section.name}</h2>
                    {section.group && (
                      <span className="text-[10px] font-medium bg-gold/20 text-primary px-1.5 py-0.5 rounded-full border border-gold/30">
                        Grupo {section.group}
                      </span>
                    )}
                  </div>

                  <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
                  >
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

            {filteredSections.every((s) => getSectionStickers(s.code).length === 0) && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {search
                    ? "Nenhuma seleção encontrada"
                    : filter === "missing"
                    ? "🎉 Você completou o álbum!"
                    : "Nenhuma figurinha repetida ainda"}
                </p>
              </div>
            )}
          </div>
        ) : tab === "trades" ? (
          <TradingPanel />
        ) : (
          <StickerRanking />
        )}
      </main>
    </div>
  );
};

export default Index;
