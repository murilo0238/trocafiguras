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
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const filteredSections = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return SECTIONS;
    return SECTIONS.filter(
      (s) => normalize(s.name).includes(q) || s.code.toLowerCase().includes(q)
    );
  }, [search]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
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

  const progressPct = stats.total > 0 ? Math.round((stats.collected / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 pt-4 pb-3">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-primary/20 rounded-full blur-md" />
              <img src={logo} alt="Troca Figurinha" className="relative w-9 h-9 object-contain drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">Álbum Copa 2026</h1>
              <p className="text-[10px] text-muted-foreground">🇲🇽 · 🇺🇸 · 🇨🇦 &nbsp;México · EUA · Canadá</p>
            </div>
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

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Progresso do álbum</span>
            <span className="text-xs font-bold text-primary">{progressPct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full progress-bar-fill rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatCard
            label="Tenho"
            value={`${stats.collected}/${stats.total}`}
            icon={<CheckCircle className="w-4 h-4" />}
            variant="primary"
          />
          <StatCard
            label="Faltam"
            value={stats.missing}
            icon={<XCircle className="w-4 h-4" />}
            variant="secondary"
          />
          <StatCard
            label="Repetidas"
            value={stats.duplicates}
            icon={<Copy className="w-4 h-4" />}
            variant="accent"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-3 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setTab("album")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === "album"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📒 Álbum
          </button>
          <button
            onClick={() => setTab("trades")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === "trades"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowLeftRight className="w-3 h-3" /> Trocas
          </button>
          <button
            onClick={() => setTab("ranking")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              tab === "ranking"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-3 h-3" /> Ranking
          </button>
        </div>

        {tab === "album" && (
          <>
            <div className="relative mb-2.5">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar seleção (ex: Brasil, BRA...)"
                className="w-full pl-9 pr-9 py-2 text-sm rounded-xl bg-muted text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted-foreground/20 transition-colors"
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
          <div className="text-center py-16 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">Carregando coleção...</p>
          </div>
        ) : tab === "album" ? (
          <div className="space-y-5">
            {filteredSections.map((section) => {
              const stickers = getSectionStickers(section.code);
              if (stickers.length === 0) return null;

              return (
                <div key={section.code}>
                  {/* Section header */}
                  <div className="flex items-center gap-2.5 mb-2.5 px-0.5">
                    <span className="text-2xl drop-shadow">{section.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-foreground truncate">{section.name}</h2>
                        {section.group && (
                          <span className="text-[9px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full border border-primary/25 flex-shrink-0">
                            G {section.group}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="section-divider mb-2.5" />

                  <div className="grid grid-cols-4 gap-2">
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
              <div className="text-center py-16 flex flex-col items-center gap-3">
                <span className="text-5xl">
                  {search ? "🔍" : filter === "missing" ? "🏆" : "🔁"}
                </span>
                <p className="text-foreground font-semibold">
                  {search
                    ? "Nenhuma seleção encontrada"
                    : filter === "missing"
                    ? "Álbum completo!"
                    : "Nenhuma figurinha repetida"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {filter === "missing" ? "Você colou todas as figurinhas 🎉" : ""}
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
