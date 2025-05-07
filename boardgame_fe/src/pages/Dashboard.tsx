import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { getGamePlays } from "../api/gamePlayApi";
import { getPlayers } from "../api/playerApi";
import { getGames } from "../api/gameApi";
import {
  PlusIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  UserGroupIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  calculateOverallPlayerStats,
  getGradeLabel,
  getGradeColor,
} from "../utils/gradeCalculator";
import { Player } from "../models/Player";
import { Play } from "../models/Play";

const Dashboard: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );
  const [minPlays, setMinPlays] = useState<number>(10);
  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ["games"],
    queryFn: getGames,
  });

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["players"],
    queryFn: getPlayers,
  });

  const { data: gamePlays = [], isLoading: playsLoading } = useQuery({
    queryKey: ["gamePlays"],
    queryFn: getGamePlays,
  });

  const stats = useMemo(() => {
    try {
      if (!games.length || !players.length || !gamePlays.length) {
        return {
          totalGames: 0,
          totalPlayers: 0,
          totalPlays: 0,
          recentPlays: [],
        };
      }

      const recentPlays = gamePlays
        .filter((play) => {
          try {
            return (
              play && Array.isArray(play.results) && play.results.length > 0
            );
          } catch (err) {
            console.error("Error filtering play:", err);
            return false;
          }
        })
        .sort((a, b) => {
          try {
            return (
              new Date(b.start_time).getTime() -
              new Date(a.start_time).getTime()
            );
          } catch (err) {
            console.error("Error sorting dates:", err);
            return 0;
          }
        })
        .slice(0, 5)
        .map((play) => {
          try {
            const winnerResult = play.results?.find((r) => r?.rank === 1);
            const game = games.find((g) => g?.game_id === play.game_id);
            const winner = players.find(
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
          } catch (err) {
            console.error("Error mapping play data:", err);
            return {
              game_play_id: play.play_id || 0,
              game_name: "Error Loading Game",
              date: "Unknown Date",
              winner: "Unknown Player",
            };
          }
        });

      return {
        totalGames: games.length || 0,
        totalPlayers: players.length || 0,
        totalPlays: gamePlays.length || 0,
        recentPlays,
      };
    } catch (err) {
      console.error("Error calculating dashboard stats:", err);
      setError(
        err instanceof Error ? err.message : "Failed to calculate stats"
      );
      return {
        totalGames: 0,
        totalPlayers: 0,
        totalPlays: 0,
        recentPlays: [],
      };
    }
  }, [games, players, gamePlays]);

  const loading = gamesLoading || playersLoading || playsLoading;

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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Game Gala Dashboard
        </h1>
        <p className="text-gray-600">Track 717 & Jelebu adventures! 🎮 🎲</p>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-4 mb-8 justify-center">
        <Link
          to="/game-plays/add"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 inline-flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Record</span>
        </Link>
        <Link
          to="/game-plays"
          className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors inline-flex items-center space-x-2"
        >
          <DocumentTextIcon className="h-5 w-5" />
          <span>View Game Log</span>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="p-4 text-center">
            <PuzzlePieceIcon className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Total Games
            </h3>
            <div className="text-4xl font-bold text-blue-600">
              {stats.totalGames}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Total Players
            </h3>
            <div className="text-4xl font-bold text-green-600">
              {stats.totalPlayers}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <PlayIcon className="h-12 w-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Total Plays
            </h3>
            <div className="text-4xl font-bold text-purple-600">
              {stats.totalPlays}
            </div>
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
                  className="py-4 flex items-center justify-between hover:bg-blue-50 transition-colors rounded-lg px-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                      {index + 1}
                    </div>
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
              (player, index) => (
                <div
                  key={player.player_id}
                  className="py-3 flex justify-between items-center"
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-lg font-medium w-8">{index + 1}</span>
                    <Link
                      to={`/players/${player.player_id}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {player.player_name}
                    </Link>
                  </div>
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
