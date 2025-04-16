import React from 'react';
import { Link } from 'react-router-dom';
import { Game } from '../../models/Game';
import Card from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

interface GameLibraryProps {
  games: Game[];
  loading: boolean;
  error: string | null;
}

const GameLibrary: React.FC<GameLibraryProps> = ({ games, loading, error }) => {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Card title="My Boardgame Collection">
      {games.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No games in your collection yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <div key={game.game_id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-40 bg-gray-200 overflow-hidden">
                {game.image_url ? (
                  <img 
                    src={game.image_url} 
                    alt={game.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-lg mb-1 truncate">{game.name}</h3>
                <div className="text-sm text-gray-600 mb-2">
                  {game.min_players && game.max_players && (
                    <span className="mr-3">
                      {game.min_players}{game.min_players !== game.max_players ? `-${game.max_players}` : ''} players
                    </span>
                  )}
                  {game.min_playtime && game.max_playtime && (
                    <span>
                      {game.min_playtime}{game.min_playtime !== game.max_playtime ? `-${game.max_playtime}` : ''} min
                    </span>
                  )}
                </div>
                <Link 
                  to={`/games/${game.game_id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default GameLibrary;