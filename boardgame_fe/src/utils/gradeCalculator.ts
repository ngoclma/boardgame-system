import { Play } from "../models/Play";
import { Player } from "../models/Player";
import { Game } from "../models/Game";

export const getPlayerCount = (results: any[]): number => {
  if (!results || results.length === 0) return 0;
  // Find the highest rank number (which represents total player count)
  return Math.max(...results.map(r => r.rank));
};

export const getRankGradePoint = (
  rank: number,
  totalPlayers: number
): number => {
  const maxPoints = 10;
  const minPoints = 4;
  const pointRange = maxPoints - minPoints;

  // Calculate points with even distribution
  const pointsPerRank = pointRange / (totalPlayers - 1);
  const points = maxPoints - pointsPerRank * (rank - 1);

  return Number(points.toFixed(2));
};

export const getGradeLabel = (gradePoint: number): string => {
  if (gradePoint >= 8.5) return "A+";
  if (gradePoint >= 8.0) return "A";
  if (gradePoint >= 7.5) return "A-";
  if (gradePoint >= 7.0) return "B+";
  if (gradePoint >= 6.5) return "B";
  if (gradePoint >= 6.0) return "B-";
  if (gradePoint >= 5.5) return "C+";
  if (gradePoint >= 5.0) return "C";
  if (gradePoint >= 4.5) return "C-";
  return "D";
};

export const getGradeColor = (grade: number): string => {
  if (!grade && grade !== 0) return "text-gray-500";

  if (grade < 4.5) return "text-red-500";
  if (grade < 6) return "text-orange-500";
  if (grade < 7.5) return "text-yellow-500";
  return "text-green-500";
};

export interface PlayerGameStats {
  player_id: number;
  player_name: string;
  total_plays: number;
  grade_point: number;
}

export const calculateGamePlayerStats = (
  gamePlays: Play[],
  players: Player[]
): PlayerGameStats[] => {
  const playerStats: Record<number, { points: number; plays: number }> = {};

  // Calculate total points and plays for each player
  gamePlays.forEach((play) => {
    const totalPlayers = getPlayerCount(play.results);

    play.results?.forEach((result) => {
      if (!result.player_id) return;

      if (!playerStats[result.player_id]) {
        playerStats[result.player_id] = { points: 0, plays: 0 };
      }

      playerStats[result.player_id].points += getRankGradePoint(
        result.rank,
        totalPlayers
      );
      playerStats[result.player_id].plays += 1;
    });
  });

  // Convert to array and calculate averages
  return players
    .map((player) => ({
      player_id: player.player_id,
      player_name: player.name,
      total_plays: playerStats[player.player_id]?.plays || 0,
      grade_point: playerStats[player.player_id]
        ? playerStats[player.player_id].points /
          playerStats[player.player_id].plays
        : 0,
    }))
    .filter((stat) => stat.total_plays > 0)
    .sort((a, b) => b.grade_point - a.grade_point);
};

export const calculateOverallPlayerStats = (
  games: Game[],
  gamePlays: Play[],
  players: Player[],
  year?: number
): PlayerGameStats[] => {
  const filteredGamePlays = year
    ? gamePlays.filter(
        (play) => new Date(play.start_time).getFullYear() === year
      )
    : gamePlays;

  const playerGameStats: Record<
    number,
    Record<number, { points: number; plays: number }>
  > = {};

  // Calculate stats for each player for each game
  filteredGamePlays.forEach((play) => {
    const totalPlayers = getPlayerCount(play.results);

    const game = games.find((g) => g.game_id === play.game_id);
    if (!game) {
      console.warn(`Game not found for game_id: ${play.game_id}`);
      return;
    }

    play.results?.forEach((result) => {
      if (!result.player_id) {
        console.warn("Player ID missing in result");
        return;
      }

      if (!playerGameStats[result.player_id]) {
        playerGameStats[result.player_id] = {};
      }

      if (!playerGameStats[result.player_id][play.game_id]) {
        playerGameStats[result.player_id][play.game_id] = {
          points: 0,
          plays: 0,
        };
      }

      const gradePoint = getRankGradePoint(result.rank, totalPlayers);

      playerGameStats[result.player_id][play.game_id].points += gradePoint;
      playerGameStats[result.player_id][play.game_id].plays += 1;
    });
  });

  // Calculate weighted average for each player
  return players
    .map((player) => {
      let totalWeightedPoints = 0;
      let totalWeights = 0;

      games.forEach((game) => {
        const playerGameStat =
          playerGameStats[player.player_id]?.[game.game_id];
        if (playerGameStat && playerGameStat.plays > 0) {
          const avgGamePoints = playerGameStat.points / playerGameStat.plays;
          const weightedPoints = avgGamePoints * Number(game.complexity);

          totalWeightedPoints += weightedPoints;
          totalWeights += Number(game.complexity);
        }
      });

      const finalGradePoint =
        totalWeights > 0 ? totalWeightedPoints / totalWeights : 0;

      return {
        player_id: player.player_id,
        player_name: player.name,
        total_plays: Object.values(
          playerGameStats[player.player_id] || {}
        ).reduce((sum, stat) => sum + stat.plays, 0),
        grade_point: finalGradePoint,
      };
    })
    .filter((stat) => stat.total_plays > 0)
    .sort((a, b) => b.grade_point - a.grade_point);
};
