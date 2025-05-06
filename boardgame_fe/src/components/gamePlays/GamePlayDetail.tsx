import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Card from "../common/Card";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import { getGamePlay } from "../../api/gamePlayApi";
import { getGame } from "../../api/gameApi";
import { getPlayer } from "../../api/playerApi";
import { Player } from "../../models/Player";
import { Play } from "../../models/Play";
import { Game } from "../../models/Game";
import { PencilIcon } from "@heroicons/react/24/outline";

const GamePlayDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gamePlay, setGamePlay] = useState<Play | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Record<number, Player>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const playData = await getGamePlay(Number(id));
        setGamePlay(playData);

        if (playData?.game_id) {
          const gameData = await getGame(playData.game_id);
          setGame(gameData);
        }

        if (playData?.results) {
          const playerPromises = playData.results.map((result) =>
            getPlayer(result.player_id)
          );
          const playerData = await Promise.all(playerPromises);
          const playerMap = playerData.reduce((acc, player) => {
            if (player) {
              acc[player.player_id] = player;
            }
            return acc;
          }, {} as Record<number, Player>);
          setPlayers(playerMap);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching game play:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load game play"
        );
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!gamePlay) return <ErrorMessage message="Game play not found" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link
          to={`/games/${game?.game_id}`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to {game?.name || "Game Details"}
        </Link>
        <Link
          to={`/game-plays/${id}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
        >
          <PencilIcon className="h-5 w-5" />
          <span>Edit Game Play</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Game Details">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Game</h3>
              <p className="mt-1 text-lg font-medium">
                {game?.name || "Unknown Game"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date Played</h3>
              <p className="mt-1">
                {gamePlay.start_time
                  ? new Date(gamePlay.start_time).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Duration</h3>
              <p className="mt-1">
                {gamePlay.duration
                  ? `${gamePlay.duration} minutes`
                  : "Not recorded"}
              </p>
            </div>
            {gamePlay.mode && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Mode</h3>
                <p className="mt-1">{gamePlay.mode}</p>
              </div>
            )}
            {gamePlay.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-1">{gamePlay.notes}</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Results">
          <div className="divide-y">
            {gamePlay.results
              .sort((a, b) => (a.rank || 0) - (b.rank || 0))
              .map((result) => (
                <div key={result.result_id} className="py-3">
                  <div className="flex justify-between items-center">
                    <Link
                      to={`/players/${result.player_id}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {players[result.player_id]?.name || "Unknown Player"}
                    </Link>
                    <span className="text-sm text-gray-600">
                      Rank: {result.rank}
                    </span>
                  </div>
                  {result.score !== undefined && (
                    <p className="text-sm text-gray-600 mt-1">
                      Score: {result.score}
                    </p>
                  )}
                  {result.notes && (
                    <p className="text-sm text-gray-500 mt-1">{result.notes}</p>
                  )}
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GamePlayDetail;
