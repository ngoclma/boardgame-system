import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Game } from "../../models/Game";
import { Player } from "../../models/Player";
import { Play } from "../../models/Play";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import { getGames } from "../../api/gameApi";
import { getPlayers } from "../../api/playerApi";
import { createGamePlay } from "../../api/gamePlayApi";
import { TrashIcon } from "@heroicons/react/24/outline";

const AddGamePlay: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);

  const [formData, setFormData] = useState({
    game_id: "",
    start_time: "",
    end_time: "",
    mode: "",
    notes: "",
    results: [] as Array<{
      player_id: string;
      score: string;
      rank: string;
      notes: string;
    }>,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gamesData, playersData] = await Promise.all([
          getGames(),
          getPlayers(),
        ]);
        setGames(gamesData);
        setPlayers(playersData);
      } catch (err) {
        setError("Failed to load required data");
      }
    };
    fetchData();
  }, []);

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
    field: string,
    value: string
  ) => {
    setFormData((prev) => {
      const newResults = [...prev.results];
      newResults[index] = {
        ...newResults[index],
        [field]: value,
      };
      return {
        ...prev,
        results: newResults,
      };
    });
  };

  const addPlayer = () => {
    setFormData((prev) => ({
      ...prev,
      results: [
        ...prev.results,
        { player_id: "", score: "", rank: "", notes: "" },
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
      // Calculate duration in minutes
      const startTime = new Date(formData.start_time);
      const endTime = new Date(formData.end_time);
      const durationInMinutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / (1000 * 60)
      );

      // Format data for API
      const payload: Partial<Play> = {
        game_id: parseInt(formData.game_id),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration: durationInMinutes,
        mode: formData.mode || undefined,
        notes: formData.notes || undefined,
        results: formData.results.map((result) => ({
          player_id: parseInt(result.player_id),
          score: result.score ? parseInt(result.score) : undefined,
          rank: parseInt(result.rank),
          notes: result.notes || undefined,
        })),
      };

      await createGamePlay(payload);
      queryClient.invalidateQueries({ queryKey: ['gamePlays'] });
      navigate("/game-plays");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Card title="Add New Game Play">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className="px-2 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
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
                value={formData.end_time}
                onChange={handleInputChange}
                className="px-2 mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
                required
              />
            </div>
          </div>

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

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Player Results</h3>
              <button
                type="button"
                onClick={addPlayer}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Player
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
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
                    value={result.score}
                    onChange={(e) =>
                      handlePlayerResultChange(index, "score", e.target.value)
                    }
                    className="px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
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
                    className="px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
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
                    value={result.notes}
                    onChange={(e) =>
                      handlePlayerResultChange(index, "notes", e.target.value)
                    }
                    rows={1}
                    className="px-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
                  />
                </div>
                <div className="col-span-1 flex items-end justify-center">
                  <button
                    type="button"
                    onClick={() => removePlayer(index)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove player"
                  >
                    <TrashIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate("/game-plays")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              Save Game Play
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddGamePlay;
