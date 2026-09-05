import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { importBGGCollection } from "../api/importBgg";
import { useGames, useGamePlays } from '../hooks';
import { useQueryClient } from '@tanstack/react-query';
import { calculateAveragePlayTimeByPlayerCount } from "../utils/calculations";

const GameLibrary: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: games = [], isLoading: gamesLoading, error: gamesError } = useGames();
  const {
    data: gamePlays = [],
    isLoading: playsLoading,
    error: playsError,
  } = useGamePlays();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "avg_play_time" | "actual_play_time_asc" | "actual_play_time_desc"
  >("name");
  const [playerCount, setPlayerCount] = useState(2);
  const [importing, setImporting] = useState(false);

  const availablePlayerCounts = Array.from(
    new Set(gamePlays.flatMap((play) => play.results?.length ?? 0).filter((count) => count > 0))
  ).sort((a, b) => a - b);
  const selectedPlayerCount = availablePlayerCounts.includes(playerCount)
    ? playerCount
    : availablePlayerCounts[0] ?? playerCount;

  const handleBGGImport = async () => {
    try {
      setImporting(true);

      const result = await importBGGCollection("HarryTr");

      // Invalidate and refetch games
      await queryClient.invalidateQueries({ queryKey: ['games'] });

      // Show success message
      alert(`Successfully imported ${result.addedGames.length} games from BGG`);
    } catch (err) {
      console.error("BGG import error:", err);
    } finally {
      setImporting(false);
    }
  };

  const filteredAndSortedGames = [...games]
    .filter((game) =>
      game.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "avg_play_time") return b.avg_play_time - a.avg_play_time;

      const aAverage = calculateAveragePlayTimeByPlayerCount(
        gamePlays.filter((play) => play.game_id === a.game_id)
      )[selectedPlayerCount] ?? 0;
      const bAverage = calculateAveragePlayTimeByPlayerCount(
        gamePlays.filter((play) => play.game_id === b.game_id)
      )[selectedPlayerCount] ?? 0;

      if (aAverage === 0 && bAverage !== 0) return 1;
      if (bAverage === 0 && aAverage !== 0) return -1;
      return sortBy === "actual_play_time_asc"
        ? aAverage - bAverage
        : bAverage - aAverage;
    });

    const getActualPlayTime = (gameId: number): number | undefined =>
      calculateAveragePlayTimeByPlayerCount(
        gamePlays.filter((play) => play.game_id === gameId)
      )[selectedPlayerCount];

    if (gamesLoading || playsLoading) return <LoadingSpinner />;
    if (gamesError || playsError) {
      return <ErrorMessage message={(gamesError || playsError as Error).message} />;
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Game Library</h1>
        <button
          onClick={handleBGGImport}
          disabled={importing}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? "Importing..." : "Retrieve from BGG"}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value as
                | "name"
                | "avg_play_time"
                | "actual_play_time_asc"
                | "actual_play_time_desc"
            )
          }
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Sort by Name</option>
          <option value="avg_play_time">Sort by Catalog Play Time</option>
          <option value="actual_play_time_asc" disabled={availablePlayerCounts.length === 0}>
            Actual Play Time: Shortest to Longest
          </option>
          <option value="actual_play_time_desc" disabled={availablePlayerCounts.length === 0}>
            Actual Play Time: Longest to Shortest
          </option>
        </select>
        {availablePlayerCounts.length > 0 && (
          <select
            value={selectedPlayerCount}
            onChange={(e) => setPlayerCount(Number(e.target.value))}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availablePlayerCounts.map((count) => (
              <option key={count} value={count}>
                Display actual time for {count} players
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedGames.map((game) => (
          <Card key={game.game_id} className="transition-all duration-300 hover:ring-4 hover:ring-blue-600 hover:ring-opacity-50 rounded-lg">
            <Link
              to={`/games/${game.game_id}`}
              className="block"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                {game.image_url ? (
                  <img
                    src={game.image_url}
                    alt={game.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-game.png"; // Add a placeholder image
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-t-lg">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{game.name}</h2>
                <p className="text-gray-600 mb-2">{game.publisher}</p>
                <p className="text-sm text-gray-500">{game.release_year}</p>
                <div className="mt-4 text-sm text-gray-600">
                  {game.min_players}-{game.max_players} players • Catalog: {game.avg_play_time} min
                </div>
                <div className="mt-1 text-sm font-medium text-blue-600">
                  Actual ({selectedPlayerCount} players): {getActualPlayTime(game.game_id) ?? "No plays"} min
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {game.description}
                </p>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      {filteredAndSortedGames.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No games found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default GameLibrary;
