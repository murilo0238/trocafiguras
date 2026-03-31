import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface StickerRank {
  sticker_id: string;
  count: number;
}

export const useStickerStats = () => {
  const [easiest, setEasiest] = useState<StickerRank[]>([]);
  const [hardest, setHardest] = useState<StickerRank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // Get all collected stickers across users
      const { data, error } = await supabase
        .from("user_stickers")
        .select("sticker_id, collected")
        .eq("collected", true);

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Count how many users have each sticker
      const countMap: Record<string, number> = {};
      for (const row of data) {
        countMap[row.sticker_id] = (countMap[row.sticker_id] || 0) + 1;
      }

      const ranked = Object.entries(countMap)
        .map(([sticker_id, count]) => ({ sticker_id, count }));

      ranked.sort((a, b) => b.count - a.count);
      setEasiest(ranked.slice(0, 10));

      ranked.sort((a, b) => a.count - b.count);
      setHardest(ranked.slice(0, 10));

      setLoading(false);
    };

    fetchStats();
  }, []);

  return { easiest, hardest, loading };
};
