import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TradeMatch {
  userId: string;
  displayName: string;
  distance: number;
  iCanGive: string[];
  theyCanGive: string[];
  tradeScore: number;
}

function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const useTrading = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<TradeMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(10);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

  const updateLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!user) { reject(new Error("no_user")); return; }

      if (!navigator.geolocation) {
        toast.error("Seu navegador não suporta geolocalização.");
        reject(new Error("no_geolocation"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const loc = { lat: latitude, lng: longitude };
          setMyLocation(loc);

          const { error } = await supabase
            .from("profiles")
            .update({
              latitude,
              longitude,
              location_updated_at: new Date().toISOString(),
              share_location: true,
            })
            .eq("user_id", user.id);

          if (error) {
            toast.error("Erro ao salvar localização.");
            reject(error);
            return;
          }

          resolve(loc);
        },
        () => {
          toast.error("Permissão de localização negada. Ative nas configurações do navegador.");
          reject(new Error("permission_denied"));
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, [user]);

  const findMatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Step 1: get location
      let loc = myLocation;
      if (!loc) {
        try {
          loc = await updateLocation();
        } catch {
          setLoading(false);
          return;
        }
      }

      // Step 2: get other users with location
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, display_name, latitude, longitude")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .neq("user_id", user.id);

      if (profilesError) {
        toast.error("Erro ao buscar colecionadores.");
        setLoading(false);
        return;
      }

      if (!profiles || profiles.length === 0) {
        setMatches([]);
        setLoading(false);
        toast.info("Nenhum colecionador com localização ativa encontrado.");
        return;
      }

      // Step 3: filter by radius
      const nearbyProfiles = profiles
        .map((p) => ({
          ...p,
          distance: haversineDistance(loc!.lat, loc!.lng, p.latitude!, p.longitude!),
        }))
        .filter((p) => p.distance <= radius);

      if (nearbyProfiles.length === 0) {
        setMatches([]);
        setLoading(false);
        toast.info(`Nenhum colecionador num raio de ${radius} km.`);
        return;
      }

      // Step 4: get my stickers
      const { data: myStickers, error: myStickersError } = await supabase
        .from("user_stickers")
        .select("sticker_id, collected, duplicates")
        .eq("user_id", user.id);

      if (myStickersError) {
        toast.error("Erro ao carregar suas figurinhas.");
        setLoading(false);
        return;
      }

      const myCollected = new Set<string>();
      const myDuplicates = new Set<string>();
      for (const s of myStickers || []) {
        if (s.collected) myCollected.add(s.sticker_id);
        if (s.duplicates > 0) myDuplicates.add(s.sticker_id);
      }

      // Step 5: get nearby users' stickers
      const nearbyUserIds = nearbyProfiles.map((p) => p.user_id);
      const { data: otherStickers, error: otherStickersError } = await supabase
        .from("user_stickers")
        .select("user_id, sticker_id, collected, duplicates")
        .in("user_id", nearbyUserIds);

      if (otherStickersError) {
        toast.error("Erro ao carregar figurinhas dos colecionadores.");
        setLoading(false);
        return;
      }

      // Step 6: build match map using collected sets (not "needed" — stickers never
      // touched have no row in the table, so checking !collected would miss them)
      const userStickersMap: Record<string, { collected: Set<string>; duplicates: Set<string> }> = {};
      for (const s of otherStickers || []) {
        if (!userStickersMap[s.user_id]) {
          userStickersMap[s.user_id] = { collected: new Set(), duplicates: new Set() };
        }
        if (s.collected) userStickersMap[s.user_id].collected.add(s.sticker_id);
        if (s.duplicates > 0) userStickersMap[s.user_id].duplicates.add(s.sticker_id);
      }

      // Step 7: compute matches
      // iCanGive  = my duplicates the other hasn't collected yet
      // theyCanGive = their duplicates I haven't collected yet
      const tradeMatches: TradeMatch[] = [];
      for (const profile of nearbyProfiles) {
        const theirData = userStickersMap[profile.user_id];
        if (!theirData) continue;

        const iCanGive = [...myDuplicates].filter((id) => !theirData.collected.has(id));
        const theyCanGive = [...theirData.duplicates].filter((id) => !myCollected.has(id));
        const tradeScore = Math.min(iCanGive.length, theyCanGive.length);

        if (tradeScore > 0) {
          tradeMatches.push({
            userId: profile.user_id,
            displayName: profile.display_name || "Colecionador",
            distance: Math.max(0.1, Math.round(profile.distance * 10) / 10),
            iCanGive,
            theyCanGive,
            tradeScore,
          });
        }
      }

      tradeMatches.sort((a, b) => b.tradeScore - a.tradeScore);
      setMatches(tradeMatches);

      if (tradeMatches.length === 0) {
        toast.info(`${nearbyProfiles.length} colecionador(es) por perto, mas nenhuma troca possível.`);
      }
    } finally {
      setLoading(false);
    }
  }, [user, myLocation, radius, updateLocation]);

  return { matches, loading, radius, setRadius, findMatches, updateLocation, myLocation };
};
