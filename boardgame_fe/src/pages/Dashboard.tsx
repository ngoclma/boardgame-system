import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { getGamePlays } from "../api/gamePlayApi";
import { getPlayers } from "../api/playerApi";
import { getGames } from "../api/gameApi";
import { PlusIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import {
  calculateOverallPlayerStats,
  getGradeLabel,
  getGradeColor,
} from "../utils/gradeCalculator";
import { Game } from "../models/Game";
import { Player } from "../models/Player";
import { Play } from "../models/Play";

interface DashboardStats {
  totalGames: number;
  totalPlayers: number;
  totalPlays: number;
  recentPlays: Array<{
    game_play_id: number;
    game_name: string;
    date: string;
    winner: string;
  }>;
  topPlayers: Array<{
    player_name: string;
    winRate: number;
    totalPlays: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 0,
    totalPlayers: 0,
    totalPlays: 0,
    recentPlays: [],
    topPlayers: [],
  });
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gamePlays, setGamePlays] = useState<Play[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );
  const [minPlays, setMinPlays] = useState<number>(10);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [gamesData, playersData, gamePlaysData] = await Promise.all([
          getGames(),
          getPlayers(),
          getGamePlays(),
        ]);

        // Ensure we have arrays even if API returns null/undefined
        const gamesArray = Array.isArray(gamesData) ? gamesData : [];
        const playersArray = Array.isArray(playersData) ? playersData : [];
        const gamePlaysArray = Array.isArray(gamePlaysData)
          ? gamePlaysData
          : [];

        setGames(gamesArray);
        setPlayers(playersArray);
        setGamePlays(gamePlaysArray);

        // Process data for dashboard stats with null checks
        const recentPlays = gamePlaysArray
          .filter((play) => play && play.results) // Ensure play and results exist
          .sort(
            (a, b) =>
              new Date(b.start_time).getTime() -
              new Date(a.start_time).getTime()
          )
          .slice(0, 5)
          .map((play) => {
            const winnerResult = play.results?.find((r) => r?.rank === 1);
            const game = gamesArray.find((g) => g?.game_id === play.game_id);
            const winner = playersArray.find(
              (p) => p?.player_id === winnerResult?.player_id
            );

            return {
              game_play_id: play.play_id,
              game_name: game?.name || "Unknown Game",
              date: play.start_time
                ? new Date(play.start_time).toLocaleDateString()
                : "Unknown Date",
              winner: winner?.name || "Unknown Player",
            };
          });

        // Calculate top players with null checks
        const playerStats = playersArray
          .map((player) => {
            const playerPlays = gamePlaysArray.filter((play) =>
              play?.results?.some((r) => r?.player_id === player.player_id)
            );

            const wins = playerPlays.filter((play) =>
              play?.results?.some(
                (r) => r?.player_id === player.player_id && r?.rank === 1
              )
            ).length;

            const totalPlays = playerPlays.length;
            const winRate = totalPlays > 0 ? (wins / totalPlays) * 100 : 0;

            return {
              player_name: player.name,
              winRate: Number(winRate.toFixed(1)),
              totalPlays,
            };
          })
          .filter((player) => player.totalPlays >= 3) // Optional: Only show players with minimum games
          .sort((a, b) => b.winRate - a.winRate)
          .slice(0, 5);

        setStats({
          totalGames: gamesArray.length,
          totalPlayers: playersArray.length,
          totalPlays: gamePlaysArray.length,
          recentPlays,
          topPlayers: playerStats,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setLoading(false);

        // Set default values on error
        setStats({
          totalGames: 0,
          totalPlayers: 0,
          totalPlays: 0,
          recentPlays: [],
          topPlayers: [],
        });
      }
    };

    fetchDashboardData();
  }, []);

  const getAvailableYears = (plays: Play[]): number[] => {
    const years = plays.map((play) => new Date(play.start_time).getFullYear());
    return Array.from(new Set(years)).sort((a, b) => b - a); // Sort descending
  };

  const calculateWinRates = (
    players: Player[],
    plays: Play[],
    minPlays: number,
    year?: number
  ) => {
    const filteredPlays = year
      ? plays.filter((play) => new Date(play.start_time).getFullYear() === year)
      : plays;

    return players
      .map((player) => {
        const playerPlays = filteredPlays.filter((play) =>
          play?.results?.some((r) => r?.player_id === player.player_id)
        );

        const wins = playerPlays.filter((play) =>
          play?.results?.some(
            (r) => r?.player_id === player.player_id && r?.rank === 1
          )
        ).length;

        const totalPlays = playerPlays.length;
        const winRate = totalPlays > 0 ? (wins / totalPlays) * 100 : 0;

        return {
          player_id: player.player_id,
          player_name: player.name,
          winRate: Number(winRate.toFixed(1)),
          totalPlays,
        };
      })
      .filter((player) => player.totalPlays >= minPlays)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 5);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4 mb-8">
        <Link
          to="/game-plays/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add New Record</span>
        </Link>
        <Link
          to="/game-plays"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors inline-flex items-center space-x-2"
        >
          <DocumentTextIcon className="h-5 w-5" />
          <span>View Game Log</span>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Total Games">
          <div className="text-4xl font-bold text-blue-600">
            {stats.totalGames}
          </div>
        </Card>
        <Card title="Total Players">
          <div className="text-4xl font-bold text-green-600">
            {stats.totalPlayers}
          </div>
        </Card>
        <Card title="Total Plays">
          <div className="text-4xl font-bold text-purple-600">
            {stats.totalPlays}
          </div>
        </Card>
      </div>

      {/* Overall Player Rankings */}
      <div className="mt-8 mb-8">
        <Card title="Player Rankings">
          <div className="mb-4 flex justify-end space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Min. Plays:</label>
              <input
                type="number"
                min="1"
                value={minPlays}
                onChange={(e) =>
                  setMinPlays(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="p-2 w-16 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <select
              value={selectedYear || ""}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Time</option>
              {getAvailableYears(gamePlays).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="divide-y">
            {calculateOverallPlayerStats(
              games,
              gamePlays,
              players,
              selectedYear
            )
              .filter((stat) => stat.total_plays >= minPlays)
              .map((stat, index) => (
                <div
                  key={stat.player_id}
                  className="py-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-medium w-8">{index + 1}</span>
                    <Link
                      to={`/players/${stat.player_id}`}
                      className="hover:text-blue-600"
                    >
                      {stat.player_name}
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {stat.total_plays} plays
                    </span>
                    <span
                      className={`font-bold ${getGradeColor(stat.grade_point)}`}
                    >
                      {stat.grade_point.toFixed(2)} (
                      {getGradeLabel(Number(stat.grade_point.toFixed(2)))})
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Plays */}
        <Card title="Recent Game Plays">
          <div className="divide-y">
            {stats.recentPlays.map((play) => (
              <div key={play.game_play_id} className="py-3">
                <Link
                  to={`/game-plays/${play.game_play_id}`}
                  className="hover:text-blue-600"
                >
                  <p className="font-medium">{play.game_name}</p>
                  <p className="text-sm text-gray-600">
                    Winner: {play.winner} - {play.date}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </Card>

        {/* Win Rate Rankings */}
        <Card title="Win Rate Rankings">
          <div className="divide-y">
            {calculateWinRates(players, gamePlays, minPlays, selectedYear).map(
              (player) => (
                <div
                  key={player.player_id}
                  className="py-3 flex justify-between items-center"
                >
                  <Link
                    to={`/players/${player.player_id}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {player.player_name}
                  </Link>
                  <div className="text-sm text-gray-600 space-x-2">
                    <span className="font-semibold text-blue-600">
                      {player.winRate}%
                    </span>
                    <span className="text-gray-400">
                      ({player.totalPlays} plays)
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
