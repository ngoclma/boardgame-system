import apiClient from './index';
import { Game } from '../models/Game';

export interface BGGImportResponse {
  addedGames: Game[];
  errors: string[];
}

export const importBGGCollection = async (username: string): Promise<BGGImportResponse> => {
  try {
    if (!username) {
      throw new Error('BGG username is required');
    }

    const response = await apiClient.post<BGGImportResponse>('/games/import-bgg', { username });
    
    if (!response.data) {
      throw new Error('No data received from BGG import');
    }

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to import BGG collection: ${error.message}`);
    } else {
      throw new Error('An unexpected error occurred while importing BGG collection');
    }
  }
};