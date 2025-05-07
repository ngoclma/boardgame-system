import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import {
  calculateOverallPlayerStats,
  getGradeLabel,
  getGradeColor,
} from "../utils/gradeCalculator";
import { useGames, usePlayers, useGamePlays } from "../hooks";

const PlayerDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "plays" | "wins">("name");
  const { data: games = [], isLoading: gamesLoading } = useGames();
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { data: gamePlays = [], isLoading: playsLoading } = useGamePlays();

  const getPlayerStats = (playerId: number) => {
    const playerPlays = gamePlays.filter((play) =>
      play.results.some((r) => r.player_id === playerId)
    );
    const wins = playerPlays.filter(
      (play) => play.results.find((r) => r.player_id === playerId)?.rank === 1
    ).length;

    return {
      plays: playerPlays.length,
      wins,
      winRate:
        playerPlays.length > 0
          ? Math.round((wins / playerPlays.length) * 100)
          : 0,
    };
  };

  const filteredAndSortedPlayers = players
    .filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);

      const statsA = getPlayerStats(a.player_id);
      const statsB = getPlayerStats(b.player_id);

      if (sortBy === "plays") return statsB.plays - statsA.plays;
      return statsB.wins - statsA.wins;
    });

  const isLoading = gamesLoading || playersLoading || playsLoading;

  if (isLoading) return <LoadingSpinner />;
  if (!games || !players || !gamePlays)
    return <ErrorMessage message="Failed to load data" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Player Directory</h1>
        <Link
          to="/players/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Player
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "name" | "plays" | "wins")
          }
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Sort by Name</option>
          <option value="plays">Sort by Games Played</option>
          <option value="wins">Sort by Wins</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedPlayers.map((player) => {
          const stats = getPlayerStats(player.player_id);
          const playerStats = calculateOverallPlayerStats(games, gamePlays, [
            player,
          ])[0];

          return (
            <Card
              key={player.player_id}
              className="transition-all duration-300 hover:ring-4 hover:ring-blue-600 hover:ring-opacity-50 rounded-lg"
            >
              <Link to={`/players/${player.player_id}`} className="block p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">{player.name}</h2>

                  <span
                    className={`text-lg font-semibold ${getGradeColor(
                      playerStats?.grade_point || 0
                    )}`}
                  >
                    {playerStats
                      ? `${playerStats.grade_point.toFixed(2)} (${getGradeLabel(
                          Number(playerStats.grade_point.toFixed(2))
                        )})`
                      : "N/A"}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-medium">{stats.plays}</div>
                    <div className="text-xs text-gray-500">Games</div>
                  </div>
                  <div>
                    <div className="font-medium">{stats.wins}</div>
                    <div className="text-xs text-gray-500">Wins</div>
                  </div>
                  <div>
                    <div className="font-medium">{stats.winRate}%</div>
                    <div className="text-xs text-gray-500">Win Rate</div>
                  </div>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>

      {filteredAndSortedPlayers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No players found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default PlayerDirectory;
