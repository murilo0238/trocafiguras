import { useState } from "react";
import { Search, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Result {
  userId: string;
  displayName: string;
}

const StickerSearch = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = query.trim().toUpperCase();
    if (!id || !user) return;

    setSearching(true);
    setSearched(true);
    setLastQuery(id);

    const { data: rows } = await supabase
      .from("user_stickers")
      .select("user_id")
      .eq("sticker_id", id)
      .gt("duplicates", 0)
      .neq("user_id", user.id);

    const ids = (rows || []).map((r) => r.user_id);
    if (ids.length === 0) {
      setResults([]);
      setSearching(false);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", ids);

    setResults(
      (profiles || []).map((p) => ({
        userId: p.user_id,
        displayName: p.display_name || "Colecionador",
      }))
    );
    setSearching(false);
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-md space-y-3">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">Quem tem essa figurinha?</h3>
      </div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearched(false); }}
          placeholder="Ex: BRA01, MEX05, FWC12…"
          className="flex-1 px-3 py-2 rounded-lg bg-muted text-foreground placeholder:text-muted-foreground text-sm border border-border focus:border-primary/50 outline-none transition-all"
          autoCapitalize="characters"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm disabled:opacity-50 transition-opacity"
        >
          {searching ? "…" : "Buscar"}
        </button>
      </form>

      {searched && !searching && (
        results.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-1">
            Ninguém tem <span className="font-bold text-foreground">{lastQuery}</span> como duplicata.
          </p>
        ) : (
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground font-medium px-0.5">
              {results.length} pessoa{results.length > 1 ? "s têm" : " tem"}{" "}
              <span className="font-bold text-foreground">{lastQuery}</span> como duplicata:
            </p>
            {results.map((r) => (
              <div key={r.userId} className="flex items-center gap-2.5 bg-primary/8 rounded-lg px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{r.displayName}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default StickerSearch;
