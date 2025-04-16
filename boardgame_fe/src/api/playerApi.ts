import apiClient from './index';
import { Player } from '../models/Player';

export const getPlayers = async (): Promise<Player[]> => {
  const response = await apiClient.get<Player[]>('/players');
  return response.data;
};

export const getPlayer = async (playerId: number): Promise<Player> => {
  const response = await apiClient.get<Player>(`/players/${playerId}`);
  return response.data;
};

export const createPlayer = async (player: Partial<Player>): Promise<Player> => {
  const response = await apiClient.post<Player>('/players', player);
  return response.data;
};

export const updatePlayer = async (playerId: number, player: Partial<Player>): Promise<Player> => {
  const response = await apiClient.put<Player>(`/players/${playerId}`, player);
  return response.data;
};

export const deletePlayer = async (playerId: number): Promise<void> => {
  await apiClient.delete(`/players/${playerId}`);
};