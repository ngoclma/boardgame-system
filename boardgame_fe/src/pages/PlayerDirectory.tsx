import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { getPlayers } from "../api/playerApi";
import { getGamePlays } from "../api/gamePlayApi";
import { Player } from "../models/Player";
import { Play } from "../models/Play";
import { getGames } from "../api/gameApi";
import {
  calculateOverallPlayerStats,
  getGradeLabel,
  getGradeColor,
} from "../utils/gradeCalculator";
import { Game } from "../models/Game";

const PlayerDirectory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gamePlays, setGamePlays] = useState<Play[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "plays" | "wins">("name");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersData, playsData, gamesData] = await Promise.all([
          getPlayers(),
          getGamePlays(),
          getGames(),
        ]);

        // Set default empty arrays if data is undefined
        const players = Array.isArray(playersData) ? playersData : [];
        const plays = Array.isArray(playsData) ? playsData : [];

        setPlayers(
          players.map((player) => ({
            ...player,
            no_total_wins: 0,
            no_total_play: 0,
            total_victory_points: 0,
            victory_rate: 0,
          })) || []
        );

        setGamePlays(
          plays.map((play) => ({
            play_id: play.play_id,
            game_id: play.game_id,
            start_time: play.start_time,
            end_time: play.end_time,
            mode: play.mode,
            notes: play.notes,
            results: Array.isArray(play.results)
              ? play.results.map((player) => ({
                  ...player,
                  play_id: play.play_id,
                  victory_points: player.score || 0,
                }))
              : [],
            duration:
              play.end_time && play.start_time
                ? new Date(play.end_time).getTime() -
                  new Date(play.start_time).getTime()
                : 0,
          })) || []
        );

        setGames(Array.isArray(gamesData) ? gamesData : []);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setLoading(false);

        // Set empty arrays on error
        setPlayers([]);
        setGamePlays([]);
        setGames([]);
      }
    };

    fetchData();
  }, []);

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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Player Directory</h1>
        <Link
          to="/players/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Player
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
            <Card key={player.player_id}>
              <Link
                to={`/players/${player.player_id}`}
                className="block p-4 hover:bg-gray-50"
              >
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
