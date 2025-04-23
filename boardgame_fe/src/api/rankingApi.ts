import apiClient from './index';
import { Ranking, PlayerStats } from '../models/Ranking';

export const getOverallRanking = async (): Promise<Ranking[]> => {
  const response = await apiClient.get<Ranking[]>('/rankings/overall');
  return response.data;
};

export const getYearlyRanking = async (year: number): Promise<Ranking[]> => {
  const response = await apiClient.get<Ranking[]>(`/rankings/yearly/${year}`);
  return response.data;
};

export const getGameRanking = async (gameId: number): Promise<Ranking> => {
  const response = await apiClient.get<Ranking>(`/rankings/games/${gameId}`);
  return response.data;
};

export const getPlayerStats = async (playerId: number): Promise<PlayerStats> => {
  const response = await apiClient.get<PlayerStats>(`/rankings/players/${playerId}`);
  return response.data;
};