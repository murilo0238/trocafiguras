import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Copy, LogOut, User, Search, X, BookOpen, ArrowLeftRight, BarChart3, Users, Shield } from "lucide-react";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import StickerCard from "@/components/StickerCard";
import ShareCollection from "@/components/ShareCollection";
import StatCard from "@/components/StatCard";
import FilterButtons from "@/components/FilterButtons";
import TradingPanel from "@/components/TradingPanel";
import StickerRanking from "@/components/StickerRanking";
import FriendsPanel from "@/components/FriendsPanel";
import GroupsPanel from "@/components/GroupsPanel";
import { useStickerCollection } from "@/hooks/useStickerCollection";
import { useFriends } from "@/contexts/FriendsContext";
import { useAuth } from "@/hooks/useAuth";
import { SECTIONS, STICKERS_PER_SECTION, getStickerNumber, TeamSection } from "@/data/teams";
import Auth from "./Auth";

type FilterType = "all" | "missing" | "duplicates";
type TabType = "album" | "trades" | "groups" | "friends" | "ranking";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { collection, toggleCollected, addDuplicate, removeDuplicate, stats, loading: collectionLoading } = useStickerCollection();
  const { pendingReceived } = useFriends();
  const [pendingCount, setPendingCount] = useState(0);

  const [filter, setFilter] = useState<FilterType>("all");
  const [tab, setTab] = useState<TabType>("album");
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .in("role", ["admin", "super_admin"]);
      setIsAdmin((data || []).length > 0);
    })();
  }, [user]);

  // Detect section completion for celebration
  const prevCompleted = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (collectionLoading) return;
    SECTIONS.forEach((section) => {
      const sCount = section.stickerCount ?? STICKERS_PER_SECTION;
      const count = Array.from({ length: sCount }, (_, i) =>
        collection[`${section.code}${getStickerNumber(section.code, i + 1)}`]?.collected ? 1 : 0
      ).reduce((a, b) => a + b, 0);
      const isComplete = count === sCount;
      const wasComplete = prevCompleted.current.has(section.code);
      if (isComplete && !wasComplete) {
        toast.success(`${section.flag} ${section.name} completa! 🎉`, { duration: 4000 });
        prevCompleted.current.add(section.code);
      } else if (!isComplete) {
        prevCompleted.current.delete(section.code);
      }
    });
  }, [collection, collectionLoading]);

  const normalize = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const filteredSections = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return SECTIONS;
    return SECTIONS.filter((s) => normalize(s.name).includes(q) || s.code.toLowerCase().includes(q));
  }, [search]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Carregando...</p>
      </div>
    );
  }

  if (!user) return <Auth />;

  const getSectionStickers = (section: TeamSection) => {
    const count = section.stickerCount ?? STICKERS_PER_SECTION;
    const ids: string[] = [];
    for (let i = 1; i <= count; i++) {
      const id = `${section.code}${getStickerNumber(section.code, i)}`;
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

      {/* ── HEADER VERMELHO ── */}
      <header className="sticky top-0 z-50 header-gradient px-4 pt-4 pb-3 shadow-2xl shadow-black/50">

        {/* Topo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/25 shadow-inner">
              <img src={logo} alt="logo" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-white leading-tight">Troca Figurinha</h1>
              <p className="text-[11px] text-white/75 leading-none">Controle da Coleção</p>
              <p className="text-[10px] text-white/55 leading-none">Álbum da Copa 2026</p>
            </div>
          </div>
          <div className="flex items-center">
            {isAdmin && (
              <Link to="/admin" className="p-2 rounded-full hover:bg-white/15 transition-colors" title="Painel Admin">
                <Shield className="w-4 h-4 text-gold-light" />
              </Link>
            )}
            <Link to="/profile" className="p-2 rounded-full hover:bg-white/15 transition-colors">
              <User className="w-4 h-4 text-white/75" />
            </Link>
            <div className="[&_button]:p-2 [&_button]:rounded-full [&_button]:text-white/75 [&_button]:hover:bg-white/15">
              <ShareCollection collection={collection} />
            </div>
            <button onClick={signOut} className="p-2 rounded-full hover:bg-white/15 transition-colors">
              <LogOut className="w-4 h-4 text-white/75" />
            </button>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[10px] text-white/60 font-semibold uppercase tracking-widest">Progresso</span>
            <span className="text-base font-bold text-gold-light">{progressPct}% completo</span>
          </div>
          <div className="h-3 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full progress-bar-fill rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <StatCard label="Tenho" value={`${stats.collected}/${stats.total}`} icon={<CheckCircle className="w-3.5 h-3.5" />} variant="primary" />
          <StatCard label="Faltam" value={stats.missing} icon={<XCircle className="w-3.5 h-3.5" />} variant="secondary" />
          <StatCard label="Repetidas" value={stats.duplicates} icon={<Copy className="w-3.5 h-3.5" />} variant="accent" />
        </div>

        {/* Busca + filtros */}
        {tab === "album" && (
          <>
            <div className="relative">
              <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar seleção..."
                className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl bg-black/25 text-white placeholder:text-white/40 border border-white/15 focus:border-gold/50 outline-none transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-white/60" />
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
              const stickers = getSectionStickers(section);
              if (stickers.length === 0) return null;
              const sCount = section.stickerCount ?? STICKERS_PER_SECTION;
              const collectedCount = Array.from({ length: sCount }, (_, i) =>
                collection[`${section.code}${getStickerNumber(section.code, i + 1)}`]?.collected ? 1 : 0
              ).reduce((a, b) => a + b, 0);
              const sectionComplete = collectedCount === sCount;
              return (
                <div key={section.code}>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="text-2xl">{section.flag}</span>
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      <h2 className="text-sm font-bold text-foreground">{section.name}</h2>
                      {section.group && (
                        <span className="text-[9px] font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-full border border-primary/25">
                          Grupo {section.group}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      sectionComplete
                        ? "bg-[#2a5671]/20 text-gold-light border border-[#2a5671]/30"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {sectionComplete ? "✓ " : ""}{collectedCount}/{sCount}
                    </span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-primary/40 to-transparent mb-3" />
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

            {filteredSections.every((s) => getSectionStickers(s).length === 0) && (
              <div className="text-center py-20 flex flex-col items-center gap-3">
                <span className="text-6xl">{search ? "🔍" : filter === "missing" ? "🏆" : "🔁"}</span>
                <p className="text-foreground font-bold text-lg">
                  {search ? "Nenhuma seleção encontrada" : filter === "missing" ? "Álbum completo!" : "Sem figurinhas repetidas"}
                </p>
                {filter === "missing" && <p className="text-muted-foreground text-sm">Você colou tudo! 🎉</p>}
              </div>
            )}
          </div>
        ) : tab === "trades" ? (
          <TradingPanel onPendingCountChange={setPendingCount} />
        ) : tab === "groups" ? (
          <GroupsPanel />
        ) : tab === "friends" ? (
          <FriendsPanel />
        ) : (
          <StickerRanking />
        )}
      </main>

      {/* ── BOTTOM NAV ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/60 shadow-2xl shadow-black/40">
        <div className="flex">
          {([
            { key: "album", icon: <BookOpen className="w-5 h-5" />, label: "Álbum" },
            {
              key: "trades",
              icon: (
                <div className="relative">
                  <ArrowLeftRight className="w-5 h-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 ring-1 ring-background">
                      {pendingCount > 9 ? "9+" : pendingCount}
                    </span>
                  )}
                </div>
              ),
              label: "Trocas",
            },
            { key: "groups", icon: <Shield className="w-5 h-5" />, label: "Grupos" },
            {
              key: "friends",
              icon: (
                <div className="relative">
                  <Users className="w-5 h-5" />
                  {pendingReceived.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 ring-1 ring-background">
                      {pendingReceived.length > 9 ? "9+" : pendingReceived.length}
                    </span>
                  )}
                </div>
              ),
              label: "Amigos",
            },
            { key: "ranking", icon: <BarChart3 className="w-5 h-5" />, label: "Ranking" },
          ] as { key: TabType; icon: React.ReactNode; label: string }[]).map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 relative transition-colors ${
                tab === key ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`transition-transform ${tab === key ? "scale-110" : ""}`}>{icon}</div>
              <span className="text-[10px] font-bold">{label}</span>
              {tab === key && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
