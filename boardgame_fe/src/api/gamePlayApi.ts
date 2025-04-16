import apiClient from './index';
import { Play } from '../models/Play';

export const getGamePlays = async (): Promise<Play[]> => {
  const response = await apiClient.get<Play[]>('/game-plays');
  return response.data;
};

export const getGamePlay = async (playId: number): Promise<Play> => {
  const response = await apiClient.get<Play>(`/game-plays/${playId}`);
  return response.data;
};

export const createGamePlay = async (gamePlay: Partial<Play>): Promise<Play> => {
  const response = await apiClient.post<Play>('/game-plays', gamePlay);
  return response.data;
};

export const updateGamePlay = async (playId: number, gamePlay: Partial<Play>): Promise<Play> => {
  const response = await apiClient.put<Play>(`/game-plays/${playId}`, gamePlay);
  return response.data;
};

export const deleteGamePlay = async (playId: number): Promise<void> => {
  await apiClient.delete(`/game-plays/${playId}`);
};