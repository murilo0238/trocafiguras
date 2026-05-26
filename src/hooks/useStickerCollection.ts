import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAllStickerIds, TOTAL_STICKERS } from "@/data/teams";
import { useAuth } from "@/hooks/useAuth";
import { parseImportText, buildCollectionFromImport } from "@/utils/parseImportText";

interface StickerData {
  collected: boolean;
  duplicates: number;
}

type StickerCollection = Record<string, StickerData>;

const ALL_IDS = getAllStickerIds();

const getDefaultCollection = (): StickerCollection => {
  const collection: StickerCollection = {};
  for (const id of ALL_IDS) {
    collection[id] = { collected: false, duplicates: 0 };
  }
  return collection;
};

export const useStickerCollection = () => {
  const { user } = useAuth();
  const [collection, setCollection] = useState<StickerCollection>(getDefaultCollection);
  const [loading, setLoading] = useState(true);

  // Load collection from Supabase
  useEffect(() => {
    if (!user) {
      setCollection(getDefaultCollection());
      setLoading(false);
      return;
    }

    const loadCollection = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_stickers")
        .select("sticker_id, collected, duplicates")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading stickers:", error);
        setLoading(false);
        return;
      }

      const col = getDefaultCollection();
      if (data) {
        for (const row of data) {
          // Ignore stale sticker IDs that no longer exist in the current album
          if (!(row.sticker_id in col)) continue;
          col[row.sticker_id] = {
            collected: row.collected,
            duplicates: row.duplicates,
          };
        }
      }
      setCollection(col);
      setLoading(false);
    };

    loadCollection();
  }, [user]);

  // Sync a single sticker to Supabase
  const syncSticker = useCallback(
    async (stickerId: string, data: StickerData) => {
      if (!user) return;
      await supabase
        .from("user_stickers")
        .upsert(
          {
            user_id: user.id,
            sticker_id: stickerId,
            collected: data.collected,
            duplicates: data.duplicates,
          },
          { onConflict: "user_id,sticker_id" }
        );
    },
    [user]
  );

  const toggleCollected = (id: string) => {
    setCollection((prev) => {
      const current = prev[id] || { collected: false, duplicates: 0 };
      const newData = {
        collected: !current.collected,
        duplicates: !current.collected ? current.duplicates : 0,
      };
      syncSticker(id, newData);
      return { ...prev, [id]: newData };
    });
  };

  const addDuplicate = (id: string) => {
    setCollection((prev) => {
      const current = prev[id] || { collected: false, duplicates: 0 };
      if (!current.collected) return prev; // precisa estar coletada primeiro
      const newData = { ...current, duplicates: current.duplicates + 1 };
      syncSticker(id, newData);
      return { ...prev, [id]: newData };
    });
  };

  const removeDuplicate = (id: string) => {
    setCollection((prev) => {
      const current = prev[id] || { collected: false, duplicates: 0 };
      const newData = { ...current, duplicates: Math.max(0, current.duplicates - 1) };
      syncSticker(id, newData);
      return { ...prev, [id]: newData };
    });
  };

  const resetCollection = useCallback(async () => {
    if (!user) throw new Error("Não autenticado");
    const rows = getAllStickerIds().map((id) => ({
      user_id: user.id,
      sticker_id: id,
      collected: false,
      duplicates: 0,
    }));
    const BATCH = 200;
    for (let i = 0; i < rows.length; i += BATCH) {
      const { error } = await supabase
        .from("user_stickers")
        .upsert(rows.slice(i, i + BATCH), { onConflict: "user_id,sticker_id" });
      if (error) throw error;
    }
    setCollection(getDefaultCollection());
  }, [user]);

  const importCollection = useCallback(
    async (text: string): Promise<{ imported: number; unknown: string[] }> => {
      if (!user) throw new Error("Não autenticado");
      const parsed = parseImportText(text);
      const rows = buildCollectionFromImport(parsed).map((r) => ({
        ...r,
        user_id: user.id,
      }));

      // Upsert in batches of 200 to stay within Supabase limits
      const BATCH = 200;
      for (let i = 0; i < rows.length; i += BATCH) {
        const { error } = await supabase
          .from("user_stickers")
          .upsert(rows.slice(i, i + BATCH), { onConflict: "user_id,sticker_id" });
        if (error) throw error;
      }

      // Rebuild local state from the upserted data
      const newCol = getDefaultCollection();
      for (const r of rows) {
        newCol[r.sticker_id] = { collected: r.collected, duplicates: r.duplicates };
      }
      setCollection(newCol);

      return { imported: rows.length, unknown: parsed.unknown };
    },
    [user]
  );

  const values = Object.values(collection);
  const stats = {
    total: TOTAL_STICKERS,
    collected: values.filter((s) => s.collected).length,
    missing: TOTAL_STICKERS - values.filter((s) => s.collected).length,
    duplicates: values.reduce((sum, s) => sum + s.duplicates, 0),
  };

  return {
    collection,
    toggleCollected,
    addDuplicate,
    removeDuplicate,
    importCollection,
    resetCollection,
    stats,
    allStickerIds: ALL_IDS,
    loading,
  };
};
