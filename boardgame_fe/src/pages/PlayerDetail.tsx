import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { getPlayer } from "../api/playerApi";
import { getGamePlays } from "../api/gamePlayApi";
import { getGames } from "../api/gameApi";
import { Player } from "../models/Player";
import { Play } from "../models/Play";
import { Game } from "../models/Game";
import {
  getGradeLabel,
  getGradeColor,
  getRankGradePoint,
  calculateOverallPlayerStats,
} from "../utils/gradeCalculator";

const PlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [gamePlays, setGamePlays] = useState<Play[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playerData, playsData, gamesData] = await Promise.all([
          getPlayer(Number(id)),
          getGamePlays(),
          getGames(),
        ]);

        // Add null checks and default values
        setPlayer(playerData || null);
        setGames(Array.isArray(gamesData) ? gamesData : []);

        // Filter game plays for this player with null checks
        const plays = Array.isArray(playsData) ? playsData : [];
        const playerPlays = plays.filter(
          (play) =>
            play &&
            Array.isArray(play.results) &&
            play.results.some(
              (result) => result && result.player_id === Number(id)
            )
        );
        setGamePlays(playerPlays);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setLoading(false);

        // Set default values on error
        setPlayer(null);
        setGames([]);
        setGamePlays([]);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!player) return <ErrorMessage message="Player not found" />;

  // Calculate player statistics
  const totalPlays = gamePlays?.length || 0;
  const wins =
    gamePlays?.filter((play) =>
      play.results?.find((r) => r?.player_id === Number(id) && r?.rank === 1)
    )?.length || 0;
  const winRate = totalPlays > 0 ? Math.round((wins / totalPlays) * 100) : 0;

  const calculatePlayerGameStats = () => {
    return games
      .map((game) => {
        const filteredGamePlays = gamePlays.filter(
          (play) => play.game_id === game.game_id
        );
        if (filteredGamePlays.length === 0) return null;

        const playerResults = filteredGamePlays.flatMap((play) =>
          play.results.filter((r) => r.player_id === Number(id))
        );

        if (playerResults.length === 0) return null;

        const totalPoints = playerResults.reduce(
          (sum, result) => sum + getRankGradePoint(result.rank),
          0
        );

        // Calculate wins for this game
        const wins = playerResults.filter((result) => result.rank === 1).length;
        const winRate = Math.round((wins / playerResults.length) * 100);

        return {
          game,
          plays: playerResults.length,
          wins,
          winRate,
          gradePoint: totalPoints / playerResults.length,
        };
      })
      .filter((stat): stat is NonNullable<typeof stat> => stat !== null)
      .sort((a, b) => b.gradePoint - a.gradePoint);
  };

  const gameStats = calculatePlayerGameStats();
  const overallStats = calculateOverallPlayerStats(games, gamePlays, [
    player,
  ])[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{player.name}</h1>
      </div>

      {/* Player Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-4 text-center">
            <div className="text-4xl font-bold text-blue-600">{totalPlays}</div>
            <div className="text-gray-600">Total Games Played</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-4xl font-bold text-green-600">{wins}</div>
            <div className="text-gray-600">Wins</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-4xl font-bold text-purple-600">{winRate}%</div>
            <div className="text-gray-600">Win Rate</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div
              className={`text-4xl font-bold ${getGradeColor(
                overallStats?.grade_point || 0
              )}`}
            >
              {overallStats ? overallStats.grade_point.toFixed(2) : "N/A"}
            </div>
            <div className="text-gray-600">Grade Point Average</div>
          </div>
        </Card>
      </div>

      {/* Best Game Performance */}
      <Card title="Best Game Performance" className="mb-8">
        <div className="divide-y">
          {gameStats.map(({ game, plays, wins, winRate, gradePoint }) => (
            <div
              key={game.game_id}
              className="p-4 flex justify-between items-center"
            >
              <div className="flex-1">
                <h3 className="font-medium mb-2">{game.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {plays} plays • Complexity:{" "}
                  {Number(game.complexity).toFixed(1) || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  {wins} wins • {winRate}% win rate
                </p>
              </div>
              <div className="ml-4 text-right">
                <div className={`font-bold ${getGradeColor(gradePoint)}`}>
                  {gradePoint.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  {getGradeLabel(gradePoint)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Games */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Games</h2>
        <div className="space-y-4">
          {gamePlays
            .sort(
              (a, b) =>
                new Date(b.start_time).getTime() -
                new Date(a.start_time).getTime()
            )
            .slice(0, 5)
            .map((play) => (
              <Card key={play.play_id}>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {games.find((g) => g.game_id === play.game_id)?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(play.start_time).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm">
                      Rank:{" "}
                      {
                        play.results.find((r) => r.player_id === Number(id))
                          ?.rank
                      }
                      {play.results.find((r) => r.player_id === Number(id))
                        ?.score !== null &&
                        ` • Score: ${
                          play.results.find((r) => r.player_id === Number(id))
                            ?.score
                        }`}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;
