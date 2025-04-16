import apiClient from './index';
import { PlayerRanking, GameRanking, PlayerStats } from '../models/Ranking';

export const getOverallRanking = async (): Promise<PlayerRanking[]> => {
  const response = await apiClient.get<PlayerRanking[]>('/rankings/overall');
  return response.data;
};

export const getYearlyRanking = async (year: number): Promise<PlayerRanking[]> => {
  const response = await apiClient.get<PlayerRanking[]>(`/rankings/yearly/${year}`);
  return response.data;
};

export const getGameRanking = async (gameId: number): Promise<GameRanking> => {
  const response = await apiClient.get<GameRanking>(`/rankings/games/${gameId}`);
  return response.data;
};

export const getPlayerStats = async (playerId: number): Promise<PlayerStats> => {
  const response = await apiClient.get<PlayerStats>(`/rankings/players/${playerId}`);
  return response.data;
};