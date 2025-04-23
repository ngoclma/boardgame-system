import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getGame } from '../api/gameApi';
import { getGamePlays } from '../api/gamePlayApi';
import { Game } from '../models/Game';
import { Play } from '../models/Play';

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [gamePlays, setGamePlays] = useState<Play[]>([]);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        const [gameData, gamePlayData] = await Promise.all([
          getGame(Number(id)),
          getGamePlays()
        ]);

        setGame(gameData || null);
        // Filter game plays for this specific game with null check
        const plays = Array.isArray(gamePlayData) ? gamePlayData : [];
        setGamePlays(plays.filter(play => play?.game_id === Number(id)));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game details');
        setLoading(false);
        setGame(null);
        setGamePlays([]);
      }
    };

    if (id) {
      fetchGameData();
    }
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!game) return <ErrorMessage message="Game not found" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">{game.name}</h1>
        <Link
          to={`/game-plays/add?game=${game.game_id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Record New Play
        </Link>
      </div>

      {/* Game Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Game Information">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Designers</h3>
              {/* <p className="mt-1">{game.designers}</p> */}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Release Year</h3>
              <p className="mt-1">{game.release_year}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1">{game.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Player Count</h3>
              <p className="mt-1">
                {game.min_players} - {game.max_players} players
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Playing Time</h3>
              <p className="mt-1">
                {game.avg_play_time} minutes
              </p>
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
              <h3 className="text-sm font-medium text-gray-500">Average Play Time</h3>
              <p className="text-2xl font-bold text-green-600">
                {gamePlays?.length > 0
                  ? Math.round(
                    gamePlays.reduce((acc, play) => {
                      if (!play?.start_time || !play?.end_time) return acc;
                      const duration = new Date(play.end_time).getTime() - new Date(play.start_time).getTime();
                      return acc + duration / (1000 * 60);
                    }, 0) / gamePlays.length
                  )
                  : 0}{' '}
                minutes
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Plays */}
      <Card title="Recent Plays">
        <div className="divide-y">
          {!gamePlays?.length ? (
            <p className="py-4 text-gray-500">No plays recorded yet</p>
          ) : (
            gamePlays
              .sort((a, b) =>
                new Date(b?.start_time || 0).getTime() -
                new Date(a?.start_time || 0).getTime()
              )
              .slice(0, 5)
              .map((play) => (
                <div key={play?.play_id} className="py-4">
                  <Link
                    to={`/game-plays/${play.play_id}`}
                    className="block hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {play?.start_time ?
                            new Date(play.start_time).toLocaleDateString() :
                            'Unknown Date'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {play?.mode ? `Mode: ${play.mode}` : 'Standard Game'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {play?.results?.length || 0} players
                      </div>
                    </div>
                  </Link>
                </div>
              ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default GameDetail;