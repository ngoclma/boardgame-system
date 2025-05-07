import { useQuery } from "@tanstack/react-query";
import { getGames, getGame } from "../api/gameApi";

export const useGames = () => {
  return useQuery({
    queryKey: ["games"],
    queryFn: getGames,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGameDetail = (id: number) => {
  return useQuery({
    queryKey: ["game", id],
    queryFn: () => getGame(id),
    staleTime: 5 * 60 * 1000,
  });
};
