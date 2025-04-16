import apiClient from './index';
import { Game } from '../models/Game';

export const getGames = async (): Promise<Game[]> => {
  const response = await apiClient.get<Game[]>('/games');
  return response.data;
};

export const getGame = async (gameId: number): Promise<Game> => {
  const response = await apiClient.get<Game>(`/games/${gameId}`);
  return response.data;
};

export const createGame = async (game: Partial<Game>): Promise<Game> => {
  const response = await apiClient.post<Game>('/games', game);
  return response.data;
};

export const updateGame = async (gameId: number, game: Partial<Game>): Promise<Game> => {
  const response = await apiClient.put<Game>(`/games/${gameId}`, game);
  return response.data;
};

export const deleteGame = async (gameId: number): Promise<void> => {
  await apiClient.delete(`/games/${gameId}`);
};