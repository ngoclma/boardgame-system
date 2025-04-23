import { Play } from '../models/Play';
import { PlayerStats, Ranking} from '../models/Ranking';
import { Game } from '../models/Game';
import { Player } from '../models/Player';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Generic fetch function with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Games API
export const gamesAPI = {
  getAll: () => fetchAPI<Game[]>('/games'),
  getById: (id: number) => fetchAPI<Game>(`/games/${id}`),
};

// Players API
export const playersAPI = {
  getAll: () => fetchAPI<Player[]>('/players'),
  getById: (id: number) => fetchAPI<Player>(`/players/${id}`),
  getGameStats: (id: number) => fetchAPI<PlayerStats[]>(`/players/${id}/games`),
  getRankings: (period: string = 'all-time') => fetchAPI<Ranking[]>(`/rankings/players?period=${period}`),
  getGameRankings: (gameId: number, period: string = 'all-time') => 
    fetchAPI<Ranking[]>(`/rankings/games/${gameId}/players?period=${period}`),
};

// Plays API
export const playsAPI = {
  getAll: (limit: number = 10) => fetchAPI<Play[]>(`/plays?limit=${limit}`),
  getById: (id: number) => fetchAPI<Play>(`/plays/${id}`),
  getByGame: (gameId: number) => fetchAPI<Play[]>(`/games/${gameId}/plays`),
  getByPlayer: (playerId: number) => fetchAPI<Play[]>(`/players/${playerId}/plays`),
};

// Rankings API
export const rankingsAPI = {
  getOverall: (period: string = 'all-time') => 
    fetchAPI<Ranking[]>(`/rankings/overall?period=${period}`),
  getByGame: (gameId: number, period: string = 'all-time') => 
    fetchAPI<Ranking[]>(`/rankings/games/${gameId}?period=${period}`),
  getByYear: (year: number) => 
    fetchAPI<Ranking[]>(`/rankings/yearly/${year}`),
};