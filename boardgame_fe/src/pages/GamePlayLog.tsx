import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useGames, usePlayers, useGamePlays } from "../hooks";

const GamePlayLog: React.FC = () => {
  const { data: games = [], isLoading: gamesLoading } = useGames();
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { data: gamePlays = [], isLoading: playsLoading } = useGamePlays();
  const [filters, setFilters] = useState({
    gameId: "",
    playerId: "",
    dateFrom: "",
    dateTo: "",
  });

  const isLoading = gamesLoading || playersLoading || playsLoading;

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredGamePlays = gamePlays.filter((play) => {
    const matchesGame =
      !filters.gameId || play.game_id === parseInt(filters.gameId);
    const matchesPlayer =
      !filters.playerId ||
      play.results.some((r) => r.player_id === parseInt(filters.playerId));
    const matchesDateFrom =
      !filters.dateFrom ||
      new Date(play.start_time) >= new Date(filters.dateFrom);
    const matchesDateTo =
      !filters.dateTo || new Date(play.start_time) <= new Date(filters.dateTo);

    return matchesGame && matchesPlayer && matchesDateFrom && matchesDateTo;
  });

  if (isLoading) return <LoadingSpinner />;
  if (!games || !players || !gamePlays) return <ErrorMessage message="Failed to load data" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Game Play Log</h1>
        <Link
          to="/game-plays/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Record</span>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Game
            </label>
            <select
              name="gameId"
              value={filters.gameId}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 mt-1"
            >
              <option value="">All Games</option>
              {[...games]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((game) => (
                  <option key={game.game_id} value={game.game_id}>
                    {game.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Player
            </label>
            <select
              name="playerId"
              value={filters.playerId}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 mt-1"
            >
              <option value="">All Players</option>
              {players.map((player) => (
                <option key={player.player_id} value={player.player_id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 mt-1"
            />
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredGamePlays.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No game plays found matching your criteria.
          </div>
        ) : (
          filteredGamePlays
            .sort(
              (a, b) =>
                new Date(b.start_time).getTime() -
                new Date(a.start_time).getTime()
            )
            .map((play) => (
              <Card key={play.play_id} className="transition-all duration-300 hover:ring-4 hover:ring-blue-600 hover:ring-opacity-50 rounded-lg">
                <Link
                  to={`/game-plays/${play.play_id}`}
                  className="block p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold mb-2">
                        {games.find((g) => g.game_id === play.game_id)?.name}
                      </h2>
                      <p className="text-gray-600">
                        {new Date(play.start_time).toLocaleDateString()} •{" "}
                        {play.mode || "Standard Game"}
                      </p>
                      <div className="mt-2">
                        {play.results
                          .sort((a, b) => a.rank - b.rank)
                          .map((result, index) => (
                            <span
                              key={result.player_id}
                              className="text-sm text-gray-600"
                            >
                              {index > 0 ? ", " : ""}
                              {
                                players.find(
                                  (p) => p.player_id === result.player_id
                                )?.name
                              }
                              {result.score !== null
                                ? ` (${result.score})`
                                : ""}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round(
                        (new Date(play.end_time).getTime() -
                          new Date(play.start_time).getTime()) /
                          (1000 * 60)
                      )}{" "}
                      min
                    </div>
                  </div>
                </Link>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default GamePlayLog;
