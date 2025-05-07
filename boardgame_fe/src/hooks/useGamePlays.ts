import { useQuery } from '@tanstack/react-query';
import { getGamePlays } from '../api/gamePlayApi';

export const useGamePlays = () => {
  return useQuery({
    queryKey: ['gamePlays'],
    queryFn: getGamePlays,
    staleTime: 5 * 60 * 1000,
  });
};