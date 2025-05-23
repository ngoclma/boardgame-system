import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../common/Card";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import {
  calculateGamePlayerStats,
  getGradeLabel,
  getGradeColor,
} from "../../utils/gradeCalculator";
import { PlusIcon } from "@heroicons/react/24/outline";
import { cleanDescription } from "../../utils/textUtils";
import { usePlayers, useGamePlays, useGameDetail } from '../../hooks';

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const { data: game, isLoading: gameLoading, error: gameError } = useGameDetail(Number(id));
  const { data: allGamePlays = [], isLoading: playsLoading } = useGamePlays();
  const { data: players = [], isLoading: playersLoading } = usePlayers();

  const gamePlays = useMemo(() => {
    return allGamePlays.filter((play) => play?.game_id === Number(id));
  }, [allGamePlays, id]);

  const getComplexityColor = (complexity: number): string => {
    if (!complexity && complexity !== 0) return "text-gray-500";

    if (complexity <= 1) return "text-emerald-500";
    if (complexity <= 2) return "text-green-500";
    if (complexity <= 3) return "text-yellow-500";
    if (complexity <= 4) return "text-orange-500";
    return "text-red-500";
  };

  const isLoading = gameLoading || playsLoading || playersLoading;
  
  if (isLoading) return <LoadingSpinner />;
  if (gameError) return <ErrorMessage message={gameError.message} />;
  if (!game) return <ErrorMessage message="Game not found" />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section with Game Image */}
      <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
        <div className="relative h-64 md:h-96">
          {game.image_url ? (
            <img
              src={game.image_url}
              alt={game.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-4xl font-bold text-white mb-2">{game.name}</h1>
            <div className="flex items-center space-x-4">
              <span className="text-white/80">
                {game.min_players} - {game.max_players} players
              </span>
              <span className="text-white/80">•</span>
              <span className="text-white/80">
                {game.avg_play_time} minutes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6 flex justify-end">
        <Link
          to="/game-plays/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Record</span>
        </Link>
      </div>

      {/* Game Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Game Information">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Release Year
              </h3>
              <p className="mt-1">{game.release_year}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <div className="mt-1">
                <p
                  className={`whitespace-pre-wrap ${
                    !isDescriptionExpanded ? "line-clamp-3" : ""
                  }`}
                >
                  {game.description
                    ? cleanDescription(game.description)
                    : "No description available"}
                </p>
                {game.description && game.description.length > 200 && (
                  <button
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {isDescriptionExpanded ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Player Count
              </h3>
              <p className="mt-1">
                {game.min_players} - {game.max_players} players
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Playing Time
              </h3>
              <p className="mt-1">{game.avg_play_time} minutes</p>
            </div>
          </div>
        </Card>

        <Card title="Game Statistics">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Plays</h3>
              <p className="text-2xl font-bold text-blue-600">
                {gamePlays?.length || 0}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Average Play Time
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {gamePlays?.length > 0
                  ? Math.round(
                      gamePlays.reduce((acc, play) => {
                        if (!play?.start_time || !play?.end_time) return acc;
                        const duration =
                          new Date(play.end_time).getTime() -
                          new Date(play.start_time).getTime();
                        return acc + duration / (1000 * 60);
                      }, 0) / gamePlays.length
                    )
                  : 0}{" "}
                minutes
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Complexity</h3>
              <div className="flex items-baseline space-x-2">
                <p
                  className={`text-2xl font-bold ${getComplexityColor(
                    game.complexity
                  )}`}
                >
                  {game.complexity || "N/A"}
                </p>
                <span className="text-sm text-gray-500">/ 5.0</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
        {/* Ranking */}
        <Card title="Player Rankings">
          <div className="divide-y">
            {calculateGamePlayerStats(gamePlays, players).map((stat, index) => (
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
                    {getGradeLabel(stat.grade_point)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Game Plays */}
        <Card title="Game Plays">
          <div className="divide-y">
            {!gamePlays?.length ? (
              <p className="py-4 text-gray-500">No plays recorded yet</p>
            ) : (
              gamePlays
                .sort(
                  (a, b) =>
                    new Date(b?.start_time || 0).getTime() -
                    new Date(a?.start_time || 0).getTime()
                )
                .map((play) => (
                  <div key={play?.play_id} className="py-4">
                    <Link
                      to={`/game-plays/${play.play_id}`}
                      className="block hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {play?.start_time
                              ? new Date(play.start_time).toLocaleDateString()
                              : "Unknown Date"}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
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
                          </p>
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
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameDetail;
