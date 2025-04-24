import { Play } from "../models/Play";
import { Player } from "../models/Player";
import { Game } from "../models/Game";

export const getRankGradePoint = (rank: number): number => {
  switch (rank) {
    case 1:
      return 5.0; // A
    case 2:
      return 4.5; // A-
    case 3:
      return 4.0; // B+
    case 4:
      return 3.5; // B
    case 5:
      return 3.0; // B-
    case 6:
      return 2.5; // C+
    case 7:
      return 2.0; // C
    case 8:
      return 1.5; // C-
    default:
      return 1.0; // D for ranks > 8
  }
};

export const getGradeLabel = (gradePoint: number): string => {
  if (gradePoint == 5.0) return "A+";
  if (gradePoint >= 4.5) return "A";
  if (gradePoint >= 4.0) return "A-";
  if (gradePoint >= 3.5) return "B+";
  if (gradePoint >= 3.0) return "B";
  if (gradePoint >= 2.5) return "B-";
  if (gradePoint >= 2.0) return "C+";
  if (gradePoint >= 1.5) return "C";
  if (gradePoint >= 1.0) return "C-";
  return "D";
};

export const getGradeColor = (grade: number): string => {
    if (!grade && grade !== 0) return "text-gray-500";

    if (grade <= 1) return "text-red-500";
    if (grade <= 2) return "text-yellow-500";
    if (grade <= 3) return "text-yellow-500";
    if (grade <= 4) return "text-green-500";
    return "text-emerald-500";
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
    play.results?.forEach((result) => {
      if (!result.player_id) return;

      if (!playerStats[result.player_id]) {
        playerStats[result.player_id] = { points: 0, plays: 0 };
      }

      playerStats[result.player_id].points += getRankGradePoint(result.rank);
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
  players: Player[]
): PlayerGameStats[] => {
  console.log("Input Data:", {
    gamesCount: games.length,
    gamePlaysCount: gamePlays.length,
    playersCount: players.length,
  });

  const playerGameStats: Record<
    number,
    Record<number, { points: number; plays: number }>
  > = {};

  // Calculate stats for each player for each game
  gamePlays.forEach((play) => {
    console.log(`\nProcessing game play ID: ${play.play_id}`);

    const game = games.find((g) => g.game_id === play.game_id);
    if (!game) {
      console.warn(`Game not found for game_id: ${play.game_id}`);
      return;
    }
    console.log(`Found game: ${game.name} (Complexity: ${Number(game.complexity)})`);

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

      const gradePoint = getRankGradePoint(result.rank);
      console.log(
        `Player ${result.player_id} - Rank: ${result.rank} - Grade Points: ${gradePoint}`
      );

      playerGameStats[result.player_id][play.game_id].points += gradePoint;
      playerGameStats[result.player_id][play.game_id].plays += 1;
    });
  });

  console.log("\nIntermediate playerGameStats:", playerGameStats);

  // Calculate weighted average for each player
  return players
    .map((player) => {
      console.log(`\nCalculating overall stats for player: ${player.name}`);
      let totalWeightedPoints = 0;
      let totalWeights = 0;

      games.forEach((game) => {
        const playerGameStat =
          playerGameStats[player.player_id]?.[game.game_id];
        if (playerGameStat && playerGameStat.plays > 0) {
          const avgGamePoints = playerGameStat.points / playerGameStat.plays;
          const weightedPoints = avgGamePoints * Number(game.complexity);

          console.log(`Game: ${game.name}`);
          console.log(`- Total Points: ${playerGameStat.points}`);
          console.log(`- Total Plays: ${playerGameStat.plays}`);
          console.log(`- Avg Points: ${avgGamePoints.toFixed(2)}`);
          console.log(`- Game Complexity: ${Number(game.complexity).toFixed(2)}`);
          console.log(`- Weighted Points: ${weightedPoints.toFixed(2)}`);

          totalWeightedPoints += weightedPoints;
          totalWeights += Number(game.complexity);
        }
      });

      const finalGradePoint =
        totalWeights > 0 ? totalWeightedPoints / totalWeights : 0;
      console.log("Final calculation:");
      console.log(`- Total Weighted Points: ${totalWeightedPoints}`);
      console.log(`- Total Weights: ${totalWeights}`);
      console.log(`- Final Grade Point: ${finalGradePoint.toFixed(2)}`);

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
