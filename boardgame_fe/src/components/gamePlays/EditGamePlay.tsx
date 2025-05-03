import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "../common/Card";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import { getGamePlay, updateGamePlay } from "../../api/gamePlayApi";
import { getGames } from "../../api/gameApi";
import { getPlayers } from "../../api/playerApi";
import { Game } from "../../models/Game";
import { Player } from "../../models/Player";
import { Play, PlayResult } from "../../models/Play";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/outline";

const EditGamePlay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [formData, setFormData] = useState<Play>({
    play_id: 0,
    game_id: 0,
    start_time: "",
    end_time: "",
    duration: 0,
    mode: "",
    notes: "",
    results: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, playersData, gamePlayData] = await Promise.all([
          getGames(),
          getPlayers(),
          getGamePlay(Number(id)),
        ]);

        setGames(gamesData);
        setPlayers(playersData);
        setFormData(gamePlayData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePlayerResultChange = (
    index: number,
    field: keyof PlayResult,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      results: prev.results.map((result, i) =>
        i === index ? { ...result, [field]: value } : result
      ),
    }));
  };

  const addPlayer = () => {
    setFormData((prev) => ({
      ...prev,
      results: [
        ...prev.results,
        { player_id: 0, rank: 0, score: 0, notes: "" },
      ],
    }));
  };

  const removePlayer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);
      const durationInMinutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      );

      const payload: Partial<Play> = {
        game_id: parseInt(formData.game_id.toString()),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration: durationInMinutes,
        mode: formData.mode || undefined,
        notes: formData.notes || undefined,
        results: formData.results.map((result) => ({
          player_id: parseInt(result.player_id.toString()),
          score: result.score ? parseInt(result.score.toString()) : undefined,
          rank: parseInt(result.rank.toString()),
          notes: result.notes || undefined,
        })),
      };

      await updateGamePlay(Number(id), payload);
      navigate(`/game-plays/${id}`);
    } catch (err) {
      console.error("Error updating game play:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update game play"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Card title="Edit Game Play">
        {error && <ErrorMessage message={error} />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game
            </label>
            <select
              name="game_id"
              value={formData.game_id}
              onChange={handleInputChange}
              className="px-2 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
              required
            >
              <option value="">Select a game</option>
              {[...games]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((game) => (
                  <option key={game.game_id} value={game.game_id}>
                    {game.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time?.slice(0, 16)}
                onChange={handleInputChange}
                className="p-2 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time?.slice(0, 16)}
                onChange={handleInputChange}
                className="p-2 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Mode and Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Mode
            </label>
            <input
              type="text"
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
              className="p-2 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="p-2 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Player Results */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Player Results</h3>
              <button
                type="button"
                onClick={addPlayer}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center space-x-1"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Add Player</span>
              </button>
            </div>

            {formData.results.map((result, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 mb-4 p-4 border rounded-lg bg-gray-50"
              >
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Player
                  </label>
                  <select
                    value={result.player_id}
                    onChange={(e) =>
                      handlePlayerResultChange(
                        index,
                        "player_id",
                        e.target.value
                      )
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                    required
                  >
                    <option value="">Select player</option>
                    {[...players]
                      .sort(
                        (a, b) => a.alias?.localeCompare(b.alias || "") || 0
                      )
                      .map((player) => (
                        <option key={player.player_id} value={player.player_id}>
                          {player.alias || player.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score
                  </label>
                  <input
                    type="number"
                    value={result.score || ""}
                    onChange={(e) =>
                      handlePlayerResultChange(index, "score", e.target.value)
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rank
                  </label>
                  <input
                    type="number"
                    value={result.rank}
                    onChange={(e) =>
                      handlePlayerResultChange(index, "rank", e.target.value)
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                    required
                    min="1"
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={result.notes || ""}
                    onChange={(e) =>
                      handlePlayerResultChange(index, "notes", e.target.value)
                    }
                    rows={1}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                  />
                </div>

                <div className="col-span-1 flex items-end justify-center">
                  <button
                    type="button"
                    onClick={() => removePlayer(index)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove player"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/game-plays/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditGamePlay;
