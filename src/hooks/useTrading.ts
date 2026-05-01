import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TradeMatch {
  userId: string;
  displayName: string;
  distance: number; // km
  iCanGive: string[]; // stickers I have as duplicates that they need
  theyCanGive: string[]; // stickers they have as duplicates that I need
  tradeScore: number; // total possible trades
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
  const [radius, setRadius] = useState(10); // km
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

  const updateLocation = useCallback(async () => {
    if (!user) return;

    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const loc = { lat: latitude, lng: longitude };
          setMyLocation(loc);

          await supabase
            .from("profiles")
            .update({
              latitude,
              longitude,
              location_updated_at: new Date().toISOString(),
              share_location: true,
            })
            .eq("user_id", user.id);

          resolve(loc);
        },
        (error) => {
          toast.error("Não foi possível obter sua localização. Verifique as permissões.");
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    });
  }, [user]);

  const findMatches = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Get/update my location
      let loc = myLocation;
      if (!loc) {
        loc = await updateLocation();
      }
      if (!loc) {
        setLoading(false);
        return;
      }

      // Get all profiles with location
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, latitude, longitude")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .neq("user_id", user.id);

      if (!profiles || profiles.length === 0) {
        setMatches([]);
        setLoading(false);
        toast.info("Nenhum colecionador encontrado por perto.");
        return;
      }

      // Filter by radius
      const nearbyProfiles = profiles
        .map((p) => ({
          ...p,
          distance: haversineDistance(loc!.lat, loc!.lng, p.latitude!, p.longitude!),
        }))
        .filter((p) => p.distance <= radius);

      if (nearbyProfiles.length === 0) {
        setMatches([]);
        setLoading(false);
        toast.info(`Nenhum colecionador num raio de ${radius}km.`);
        return;
      }

      // Get my stickers
      const { data: myStickers } = await supabase
        .from("user_stickers")
        .select("sticker_id, collected, duplicates")
        .eq("user_id", user.id);

      const myNeeded = new Set<string>();
      const myDuplicates = new Set<string>();

      if (myStickers) {
        for (const s of myStickers) {
          if (!s.collected) myNeeded.add(s.sticker_id);
          if (s.duplicates > 0) myDuplicates.add(s.sticker_id);
        }
      }

      // Get nearby users' stickers
      const nearbyUserIds = nearbyProfiles.map((p) => p.user_id);
      const { data: otherStickers } = await supabase
        .from("user_stickers")
        .select("user_id, sticker_id, collected, duplicates")
        .in("user_id", nearbyUserIds);

      // Build matches
      const userStickersMap: Record<string, { needed: Set<string>; duplicates: Set<string> }> = {};
      
      if (otherStickers) {
        for (const s of otherStickers) {
          if (!userStickersMap[s.user_id]) {
            userStickersMap[s.user_id] = { needed: new Set(), duplicates: new Set() };
          }
          if (!s.collected) userStickersMap[s.user_id].needed.add(s.sticker_id);
          if (s.duplicates > 0) userStickersMap[s.user_id].duplicates.add(s.sticker_id);
        }
      }

      const tradeMatches: TradeMatch[] = [];

      for (const profile of nearbyProfiles) {
        const theirData = userStickersMap[profile.user_id];
        if (!theirData) continue;

        // Stickers I can give them (my duplicates that they need)
        const iCanGive = [...myDuplicates].filter((id) => theirData.needed.has(id));
        // Stickers they can give me (their duplicates that I need)
        const theyCanGive = [...theirData.duplicates].filter((id) => myNeeded.has(id));

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

      // Sort by trade score (most effective trades first)
      tradeMatches.sort((a, b) => b.tradeScore - a.tradeScore);
      setMatches(tradeMatches);

      if (tradeMatches.length === 0) {
        toast.info("Nenhuma troca possível encontrada por perto.");
      }
    } catch (error) {
      console.error("Error finding matches:", error);
      toast.error("Erro ao buscar trocas.");
    } finally {
      setLoading(false);
    }
  }, [user, myLocation, radius, updateLocation]);

  return {
    matches,
    loading,
    radius,
    setRadius,
    findMatches,
    updateLocation,
    myLocation,
  };
};
