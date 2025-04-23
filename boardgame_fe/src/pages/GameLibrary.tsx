import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { getGames } from "../api/gameApi";
import { Game } from "../models/Game";
import { importBGGCollection } from "../api/importBgg";

const GameLibrary: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "release_year">("name");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const gamesData = await getGames();
        setGames(gamesData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load games");
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleBGGImport = async () => {
    try {
      setImporting(true);

      const result = await importBGGCollection("HarryTr");

      // Refresh games list with newly added games
      const updatedGames = await getGames();
      setGames(updatedGames);

      // Show success message
      alert(`Successfully imported ${result.addedGames.length} games from BGG`);
    } catch (err) {
      console.error("BGG import error:", err);
    } finally {
      setImporting(false);
    }
  };

  const filteredAndSortedGames = games
    .filter((game) =>
      game.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b.release_year - a.release_year;
    });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

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

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "release_year")}
          className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Sort by Name</option>
          <option value="release_year">Sort by Year</option>
        </select>
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
                  {game.min_players}-{game.max_players} players • {game.avg_play_time} min
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
