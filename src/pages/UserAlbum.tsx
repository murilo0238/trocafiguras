import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Copy, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StickerCard from "@/components/StickerCard";
import StatCard from "@/components/StatCard";
import UserAvatar from "@/components/UserAvatar";
import { SECTIONS, STICKERS_PER_SECTION, getStickerNumber, getAllStickerIds, TOTAL_STICKERS, TeamSection } from "@/data/teams";

interface StickerData { collected: boolean; duplicates: number }

const ALL_IDS = getAllStickerIds();

const defaultCollection = () => {
  const c: Record<string, StickerData> = {};
  for (const id of ALL_IDS) c[id] = { collected: false, duplicates: 0 };
  return c;
};

const UserAlbum = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [collection, setCollection] = useState<Record<string, StickerData>>(defaultCollection);
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null; share_collection: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notShared, setNotShared] = useState(false);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, share_collection")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      setProfile(prof ?? null);

      if (!prof?.share_collection && userId !== user?.id) {
        setNotShared(true);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("user_stickers")
        .select("sticker_id, collected, duplicates")
        .eq("user_id", userId);
      if (cancelled) return;
      const col = defaultCollection();
      for (const row of data || []) {
        if (!(row.sticker_id in col)) continue;
        col[row.sticker_id] = { collected: row.collected, duplicates: row.duplicates };
      }
      setCollection(col);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId, user?.id]);

  const stats = useMemo(() => {
    const values = Object.values(collection);
    const collected = values.filter((s) => s.collected).length;
    return {
      total: TOTAL_STICKERS,
      collected,
      missing: TOTAL_STICKERS - collected,
      duplicates: values.reduce((sum, s) => sum + s.duplicates, 0),
    };
  }, [collection]);

  const progressPct = stats.total > 0 ? Math.round((stats.collected / stats.total) * 100) : 0;

  const getSectionStickers = (section: TeamSection) => {
    const count = section.stickerCount ?? STICKERS_PER_SECTION;
    const ids: string[] = [];
    for (let i = 1; i <= count; i++) {
      ids.push(`${section.code}${getStickerNumber(section.code, i)}`);
    }
    return ids;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Carregando álbum...</p>
      </div>
    );
  }

  if (notShared) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Álbum privado</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          {profile?.display_name ?? "Este usuário"} ainda não ativou o compartilhamento da coleção.
        </p>
        <Link to="/" className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-50 header-gradient px-4 pt-4 pb-3 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="p-2 rounded-full hover:bg-white/15 transition-colors">
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white/15 border border-white/25 flex-shrink-0">
            <UserAvatar avatarUrl={profile?.avatar_url ?? null} displayName={profile?.display_name ?? "?"} className="w-full h-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] font-bold text-white leading-tight truncate">
              Álbum de {profile?.display_name ?? "Colecionador"}
            </h1>
            <p className="text-[11px] text-white/75 leading-none">Somente visualização</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-[10px] text-white/60 font-semibold uppercase tracking-widest">Progresso</span>
            <span className="text-base font-bold text-gold-light">{progressPct}% completo</span>
          </div>
          <div className="h-3 bg-black/30 rounded-full overflow-hidden">
            <div className="h-full progress-bar-fill rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Tem" value={`${stats.collected}/${stats.total}`} icon={<CheckCircle className="w-3.5 h-3.5" />} variant="primary" />
          <StatCard label="Faltam" value={stats.missing} icon={<XCircle className="w-3.5 h-3.5" />} variant="secondary" />
          <StatCard label="Repetidas" value={stats.duplicates} icon={<Copy className="w-3.5 h-3.5" />} variant="accent" />
        </div>
      </header>

      <main className="px-3 pt-5 space-y-6">
        {SECTIONS.map((section) => {
          const stickers = getSectionStickers(section);
          const sCount = section.stickerCount ?? STICKERS_PER_SECTION;
          const collectedCount = stickers.filter((id) => collection[id]?.collected).length;
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
                  sectionComplete ? "bg-[#2a5671]/20 text-gold-light border border-[#2a5671]/30" : "bg-muted text-muted-foreground"
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
                    onToggle={() => {}}
                    onAddDuplicate={() => {}}
                    onRemoveDuplicate={() => {}}
                    readOnly
                  />
                ))}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default UserAlbum;
