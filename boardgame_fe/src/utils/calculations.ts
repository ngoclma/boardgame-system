// src/utils/calculations.ts
import { Play, PlayResult } from '../models/Play';

/**
 * Calculate victory points based on player rank and total players
 * As per requirements:
 * - Half the players (rounded up) get points
 * - 1st place: 1 point
 * - 2nd place: 1/2 point
 * - 3rd place: 1/4 point
 * - Rest: 0 points
 */
export const calculateVictoryPoints = (rank: number, totalPlayers: number): number => {
  const pointsPositions = Math.ceil(totalPlayers / 2);
  
  if (rank > pointsPositions) {
    return 0;
  }
  
  // Calculate points based on position
  return Math.pow(0.5, rank - 1);
};

/**
 * Calculate victory rate from total victory points and games played
 */
export const calculateVictoryRate = (victoryPoints: number, gamesPlayed: number): number => {
  if (gamesPlayed === 0) return 0;
  return victoryPoints / gamesPlayed;
};

/**
 * Calculate player rankings based on victory rate
 */
export const calculateRankings = (
  players: Array<{ id: number; name: string; victoryPoints: number; plays: number }>
): Array<{ id: number; name: string; victoryPoints: number; plays: number; victoryRate: number; rank: number }> => {
  // Calculate victory rate for each player
  const playersWithRate = players.map(player => ({
    ...player,
    victoryRate: calculateVictoryRate(player.victoryPoints, player.plays)
  }));
  
  // Sort by victory rate in descending order
  const sortedPlayers = [...playersWithRate].sort((a, b) => b.victoryRate - a.victoryRate);
  
  // Assign ranks (players with same victory rate get the same rank)
  let currentRank = 1;
  let prevRate = -1;
  let skipPositions = 0;
  
  return sortedPlayers.map((player, index) => {
    if (player.victoryRate !== prevRate) {
      currentRank = index + 1 - skipPositions;
      prevRate = player.victoryRate;
    } else {
      skipPositions++;
    }
    
    return {
      ...player,
      rank: currentRank
    };
  });
};

/**
 * Calculate average game duration from play records
 */
export const calculateAverageGameDuration = (plays: Play[]): number => {
  if (plays.length === 0) return 0;
  
  const durations = plays.map(play => {
    // const start = new Date(play.start_time);
    // const end = new Date(play.end_time);
    // return (end.getTime() - start.getTime()) / (1000 * 60); // in minutes
    return play.duration || 0; // Use the duration if available
  });
  
  const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
  return Math.round(totalDuration / plays.length);
};