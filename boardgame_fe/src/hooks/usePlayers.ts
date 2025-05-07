import { useQuery } from "@tanstack/react-query";
import { getPlayers, getPlayer } from "../api/playerApi";

export const usePlayers = () => {
  return useQuery({
    queryKey: ["players"],
    queryFn: getPlayers,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlayerDetail = (id: number) => {
  return useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayer(id),
    staleTime: 5 * 60 * 1000,
  });
};
