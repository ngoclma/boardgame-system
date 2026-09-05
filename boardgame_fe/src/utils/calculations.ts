// src/utils/calculations.ts
import { Play } from '../models/Play';

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
  const durations = plays
    .map(calculatePlayDuration)
    .filter((duration): duration is number => duration !== null);

  if (durations.length === 0) return 0;

  const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
  return Math.round(totalDuration / durations.length);
};

/**
 * Calculate the duration of a play in minutes.
 * Older records may not have a stored duration, so use their timestamps.
 */
export const calculatePlayDuration = (play: Play): number | null => {
  if (typeof play.duration === 'number' && play.duration > 0) {
    return play.duration;
  }

  if (!play.start_time || !play.end_time) return null;

  const duration =
    (new Date(play.end_time).getTime() - new Date(play.start_time).getTime()) /
    (1000 * 60);

  return Number.isFinite(duration) && duration > 0 ? duration : null;
};

/**
 * Calculate average play time grouped by the number of recorded players.
 */
export const calculateAveragePlayTimeByPlayerCount = (
  plays: Play[]
): Record<number, number> => {
  const durationsByPlayerCount: Record<number, number[]> = {};

  plays.forEach((play) => {
    const playerCount = play.results?.length ?? 0;
    const duration = calculatePlayDuration(play);

    if (playerCount > 0 && duration !== null) {
      durationsByPlayerCount[playerCount] ??= [];
      durationsByPlayerCount[playerCount].push(duration);
    }
  });

  return Object.fromEntries(
    Object.entries(durationsByPlayerCount).map(([playerCount, durations]) => [
      Number(playerCount),
      Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length),
    ])
  );
};