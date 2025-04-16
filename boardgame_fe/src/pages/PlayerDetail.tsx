import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getPlayer } from '../api/playerApi';
import { getGamePlays } from '../api/gamePlayApi';
import { getGames } from '../api/gameApi';
import { Player } from '../models/Player';
import { Play } from '../models/Play';
import { Game } from '../models/Game';

const PlayerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [gamePlays, setGamePlays] = useState<Play[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playerData, playsData, gamesData] = await Promise.all([
          getPlayer(Number(id)),
          getGamePlays(),
          getGames()
        ]);

        setPlayer(playerData);
        setGames(gamesData);
        
        // Filter game plays for this player
        const playerPlays = playsData.filter(play =>
          play.players.some(result => result.player_id === Number(id))
        );
        setGamePlays(playerPlays);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load player data');
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!player) return <ErrorMessage message="Player not found" />;

  // Calculate player statistics
  const totalPlays = gamePlays.length;
  const wins = gamePlays.filter(play => 
    play.players.find(r => r.player_id === Number(id))?.rank === 1
  ).length;
  const winRate = totalPlays > 0 ? Math.round((wins / totalPlays) * 100) : 0;

  // Group plays by game
  const playsByGame = games.map(game => {
    const gamePlaysCount = gamePlays.filter(play => play.game_id === game.game_id).length;
    const gameWins = gamePlays.filter(play => 
      play.game_id === game.game_id &&
      play.players.find(r => r.player_id === Number(id))?.rank === 1
    ).length;
    
    return {
      game,
      plays: gamePlaysCount,
      wins: gameWins
    };
  }).filter(g => g.plays > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{player.name}</h1>
      </div>

      {/* Player Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="p-4 text-center">
            <div className="text-4xl font-bold text-blue-600">{totalPlays}</div>
            <div className="text-gray-600">Total Games Played</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-4xl font-bold text-green-600">{wins}</div>
            <div className="text-gray-600">Wins</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <div className="text-4xl font-bold text-purple-600">{winRate}%</div>
            <div className="text-gray-600">Win Rate</div>
          </div>
        </Card>
      </div>

      {/* Games History */}
      <Card title="Games History">
        <div className="divide-y">
          {playsByGame
            .sort((a, b) => b.plays - a.plays)
            .map(({ game, plays, wins }) => (
              <div key={game.game_id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{game.name}</h3>
                  <p className="text-sm text-gray-600">
                    {plays} plays • {wins} wins ({Math.round((wins / plays) * 100)}% win rate)
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {/* Recent Games */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Games</h2>
        <div className="space-y-4">
          {gamePlays
            .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
            .slice(0, 5)
            .map(play => (
              <Card key={play.play_id}>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">
                        {games.find(g => g.game_id === play.game_id)?.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(play.start_time).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm">
                      Rank: {play.players.find(r => r.player_id === Number(id))?.rank}
                      {play.players.find(r => r.player_id === Number(id))?.score !== null && 
                        ` • Score: ${play.players.find(r => r.player_id === Number(id))?.score}`}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerDetail;