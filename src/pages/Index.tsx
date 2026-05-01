import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Copy, LogOut, User, Search, X, BookOpen, ArrowLeftRight, BarChart3 } from "lucide-react";
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
        <div className="w-10 h-10 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Carregando...</p>
      </div>
    );
  }

  if (!user) return <Auth />;

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
    <div className="min-h-screen bg-background pb-24">

      {/* ── HEADER com gradiente ── */}
      <header className="sticky top-0 z-50 header-gradient px-4 pt-4 pb-3 shadow-2xl shadow-purple-900/30">

        {/* Topo: logo + ações */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm" />
              <div className="relative w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <img src={logo} alt="logo" className="w-7 h-7 object-contain drop-shadow" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight tracking-tight">Copa 2026</h1>
              <p className="text-[10px] text-white/60 leading-none mt-0.5">🇲🇽 · 🇺🇸 · 🇨🇦</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <Link to="/profile" className="p-2 rounded-full hover:bg-white/15 transition-colors">
              <User className="w-4 h-4 text-white/80" />
            </Link>
            <div className="[&_button]:text-white/80 [&_button]:hover:bg-white/15">
              <ShareCollection collection={collection} />
            </div>
            <button onClick={signOut} className="p-2 rounded-full hover:bg-white/15 transition-colors">
              <LogOut className="w-4 h-4 text-white/80" />
            </button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs text-white/70 font-medium">Progresso do álbum</span>
            <span className="text-lg font-bold text-white">{progressPct}%</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700 ease-out shadow-sm"
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

        {/* Busca + filtros — apenas na aba Álbum */}
        {tab === "album" && (
          <>
            <div className="relative">
              <Search className="w-4 h-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar seleção (ex: Brasil, BRA...)"
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl bg-white/15 text-white placeholder:text-white/50 border border-white/20 focus:border-white/50 focus:bg-white/20 outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/20"
                >
                  <X className="w-3.5 h-3.5 text-white/70" />
                </button>
              )}
            </div>
            <FilterButtons activeFilter={filter} onFilterChange={setFilter} />
          </>
        )}
      </header>

      {/* ── CONTEÚDO ── */}
      <main className="px-3 pt-5">
        {collectionLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">Carregando coleção...</p>
          </div>
        ) : tab === "album" ? (
          <div className="space-y-6">
            {filteredSections.map((section) => {
              const stickers = getSectionStickers(section.code);
              if (stickers.length === 0) return null;

              return (
                <div key={section.code}>
                  {/* Cabeçalho da seleção */}
                  <div className="flex items-center gap-3 mb-3 px-0.5">
                    <span className="text-3xl drop-shadow-sm">{section.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-bold text-foreground">{section.name}</h2>
                        {section.group && (
                          <span className="text-[9px] font-bold bg-primary/12 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                            Grupo {section.group}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-gradient-to-r from-primary/30 to-transparent mb-3" />

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
              <div className="text-center py-20 flex flex-col items-center gap-3">
                <span className="text-6xl">{search ? "🔍" : filter === "missing" ? "🏆" : "🔁"}</span>
                <p className="text-foreground font-bold text-lg">
                  {search
                    ? "Nenhuma seleção encontrada"
                    : filter === "missing"
                    ? "Álbum completo!"
                    : "Sem figurinhas repetidas"}
                </p>
                {filter === "missing" && (
                  <p className="text-muted-foreground text-sm">Parabéns, você colou tudo! 🎉</p>
                )}
              </div>
            )}
          </div>
        ) : tab === "trades" ? (
          <TradingPanel />
        ) : (
          <StickerRanking />
        )}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-2xl shadow-black/20">
        <div className="flex">
          {[
            { key: "album" as TabType, icon: <BookOpen className="w-5 h-5" />, label: "Álbum" },
            { key: "trades" as TabType, icon: <ArrowLeftRight className="w-5 h-5" />, label: "Trocas" },
            { key: "ranking" as TabType, icon: <BarChart3 className="w-5 h-5" />, label: "Ranking" },
          ].map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all ${
                tab === key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`transition-all ${tab === key ? "scale-110" : ""}`}>{icon}</div>
              <span className="text-[10px] font-semibold">{label}</span>
              {tab === key && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
