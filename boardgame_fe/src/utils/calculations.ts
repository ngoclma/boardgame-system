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

export interface PlayerPlayStats {
  player_id: number;
  play_count: number;
  characters: string[];
}

export interface CharacterPlayStats {
  character: string;
  play_count: number;
  average_rank: number;
  average_score: number | null;
}

/** Remove parenthetical details so equivalent character names are grouped. */
export const normalizeCharacterName = (character: string): string =>
  character.replace(/\s*\([^)]*\)/g, '').trim();

/**
 * Collect the characters recorded for each player across a game's plays.
 * Character names are stored in the result notes field.
 */
export const calculatePlayerPlayStats = (plays: Play[]): PlayerPlayStats[] => {
  const statsByPlayer: Record<number, { play_count: number; characters: Set<string> }> = {};

  plays.forEach((play) => {
    play.results?.forEach((result) => {
      statsByPlayer[result.player_id] ??= {
        play_count: 0,
        characters: new Set<string>(),
      };

      statsByPlayer[result.player_id].play_count += 1;

      const character = result.notes
        ? normalizeCharacterName(result.notes)
        : '';
      if (character) {
        statsByPlayer[result.player_id].characters.add(character);
      }
    });
  });

  return Object.entries(statsByPlayer)
    .map(([playerId, stats]) => ({
      player_id: Number(playerId),
      play_count: stats.play_count,
      characters: Array.from(stats.characters).sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.player_id - b.player_id);
};

/**
 * Calculate average rank and play count for each character used in a game's plays.
 */
export const calculateCharacterPlayStats = (
  plays: Play[]
): CharacterPlayStats[] => {
  const statsByCharacter: Record<string, { ranks: number[]; scores: number[] }> = {};

  plays.forEach((play) => {
    play.results?.forEach((result) => {
      const character = result.notes
        ? normalizeCharacterName(result.notes)
        : '';

      if (!character || typeof result.rank !== 'number') return;

      statsByCharacter[character] ??= { ranks: [], scores: [] };
      statsByCharacter[character].ranks.push(result.rank);

      if (typeof result.score === 'number') {
        statsByCharacter[character].scores.push(result.score);
      }
    });
  });

  return Object.entries(statsByCharacter)
    .map(([character, stats]) => ({
      character,
      play_count: stats.ranks.length,
      average_rank: Number(
        (stats.ranks.reduce((sum, rank) => sum + rank, 0) / stats.ranks.length).toFixed(2)
      ),
      average_score:
        stats.scores.length > 0
          ? Number(
              (stats.scores.reduce((sum, score) => sum + score, 0) / stats.scores.length).toFixed(2)
            )
          : null,
    }))
    .sort((a, b) => {
      if (a.average_rank !== b.average_rank) {
        return a.average_rank - b.average_rank;
      }

      if (a.average_score === null && b.average_score !== null) return 1;
      if (a.average_score !== null && b.average_score === null) return -1;
      if (a.average_score !== b.average_score) {
        return (b.average_score ?? 0) - (a.average_score ?? 0);
      }

      return a.character.localeCompare(b.character);
    });
};