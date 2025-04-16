import { useState } from 'react';
import { rankingsAPI } from '../utils/api';
import { Ranking } from '../models/Play';

export const useRankings = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getOverallRankings = async (period: string = 'all-time') => {
    try {
      setLoading(true);
      const data = await rankingsAPI.getOverall(period);
      return data;
    } catch (err) {
      setError('Failed to fetch overall rankings');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getGameRankings = async (gameId: number, period: string = 'all-time') => {
    try {
      setLoading(true);
      const data = await rankingsAPI.getByGame(gameId, period);
      return data;
    } catch (err) {
      setError('Failed to fetch game rankings');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getYearlyRankings = async (year: number) => {
    try {
      setLoading(true);
      const data = await rankingsAPI.getByYear(year);
      return data;
    } catch (err) {
      setError('Failed to fetch yearly rankings');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    error, 
    getOverallRankings, 
    getGameRankings, 
    getYearlyRankings 
  };
};