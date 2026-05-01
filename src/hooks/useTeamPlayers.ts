import { useQuery } from "@tanstack/react-query";
import { fetchTeamPlayers, PlayerInfo } from "@/services/playerService";

export function useTeamPlayers(teamCode: string) {
  return useQuery<PlayerInfo[]>({
    queryKey: ["teamPlayers", teamCode],
    queryFn: () => fetchTeamPlayers(teamCode),
    staleTime: 7 * 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    enabled: !!teamCode && teamCode !== "FWC",
    retry: 1,
  });
}
