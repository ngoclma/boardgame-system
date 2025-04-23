import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getGamePlays } from '../api/gamePlayApi';
import { getGames } from '../api/gameApi';
import { getPlayers } from '../api/playerApi';
import { Play } from '../models/Play';
import { Game } from '../models/Game';
import { Player } from '../models/Player';

const GamePlayLog: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gamePlays, setGamePlays] = useState<Play[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filters, setFilters] = useState({
    gameId: '',
    playerId: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playsData, gamesData, playersData] = await Promise.all([
          getGamePlays(),
          getGames(),
          getPlayers(),
        ]);
        setGamePlays(playsData);
        setGames(gamesData);
        setPlayers(playersData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load game plays');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredGamePlays = gamePlays.filter(play => {
    const matchesGame = !filters.gameId || play.game_id === parseInt(filters.gameId);
    const matchesPlayer = !filters.playerId || play.results.some(r => r.player_id === parseInt(filters.playerId));
    const matchesDateFrom = !filters.dateFrom || new Date(play.start_time) >= new Date(filters.dateFrom);
    const matchesDateTo = !filters.dateTo || new Date(play.start_time) <= new Date(filters.dateTo);
    
    return matchesGame && matchesPlayer && matchesDateFrom && matchesDateTo;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Game Play Log</h1>
        <Link
          to="/game-plays/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Record New Play
        </Link>
      </div>

      <Card className="mb-6">
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Game</label>
            <select
              name="gameId"
              value={filters.gameId}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2"
            >
              <option value="">All Games</option>
              {games.map(game => (
                <option key={game.game_id} value={game.game_id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Player</label>
            <select
              name="playerId"
              value={filters.playerId}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2"
            >
              <option value="">All Players</option>
              {players.map(player => (
                <option key={player.player_id} value={player.player_id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2"
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
            .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
            .map(play => (
              <Card key={play.play_id}>
                <Link
                  to={`/game-plays/${play.play_id}`}
                  className="block p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold mb-2">
                        {games.find(g => g.game_id === play.game_id)?.name}
                      </h2>
                      <p className="text-gray-600">
                        {new Date(play.start_time).toLocaleDateString()} •{' '}
                        {play.mode || 'Standard Game'}
                      </p>
                      <div className="mt-2">
                        {play.results
                          .sort((a, b) => a.rank - b.rank)
                          .map((result, index) => (
                            <span key={result.player_id} className="text-sm text-gray-600">
                              {index > 0 ? ', ' : ''}
                              {players.find(p => p.player_id === result.player_id)?.name}
                              {result.score !== null ? ` (${result.score})` : ''}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round(
                        (new Date(play.end_time).getTime() - new Date(play.start_time).getTime()) /
                          (1000 * 60)
                      )}{' '}
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