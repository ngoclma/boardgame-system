import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getGamePlays } from '../api/gamePlayApi';
import { getPlayers } from '../api/playerApi';
import { getGames } from '../api/gameApi';

interface DashboardStats {
  totalGames: number;
  totalPlayers: number;
  totalPlays: number;
  recentPlays: Array<{
    game_play_id: number;
    game_name: string;
    date: string;
    winner: string;
  }>;
  topPlayers: Array<{
    player_name: string;
    wins: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalGames: 0,
    totalPlayers: 0,
    totalPlays: 0,
    recentPlays: [],
    topPlayers: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [games, players, gamePlays] = await Promise.all([
          getGames(),
          getPlayers(),
          getGamePlays()
        ]);

        // Process data for dashboard stats
        const recentPlays = gamePlays
          .slice(0, 5)
          .map(play => ({
            game_play_id: play.play_id,
            game_name: games.find(g => g.game_id === play.game_id)?.name || 'Unknown Game',
            date: new Date(play.start_time).toLocaleDateString(),
            winner: players.find(p => p.player_id === play.players.find(r => r.rank === 1)?.player_id)?.name || 'Unknown'
          }));

        // Calculate top players
        const playerWins = players.map(player => ({
          player_name: player.name,
          wins: gamePlays.filter(play => 
            play.players.some(r => r.player_id === player.player_id && r.rank === 1)
          ).length
        })).sort((a, b) => b.wins - a.wins).slice(0, 5);

        setStats({
          totalGames: games.length,
          totalPlayers: players.length,
          totalPlays: gamePlays.length,
          recentPlays,
          topPlayers: playerWins
        });

        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Total Games">
          <div className="text-4xl font-bold text-blue-600">{stats.totalGames}</div>
        </Card>
        <Card title="Total Players">
          <div className="text-4xl font-bold text-green-600">{stats.totalPlayers}</div>
        </Card>
        <Card title="Total Plays">
          <div className="text-4xl font-bold text-purple-600">{stats.totalPlays}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Plays */}
        <Card title="Recent Game Plays">
          <div className="divide-y">
            {stats.recentPlays.map((play) => (
              <div key={play.game_play_id} className="py-3">
                <Link 
                  to={`/game-plays/${play.game_play_id}`}
                  className="hover:text-blue-600"
                >
                  <p className="font-medium">{play.game_name}</p>
                  <p className="text-sm text-gray-600">
                    Winner: {play.winner} - {play.date}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Players */}
        <Card title="Top Players">
          <div className="divide-y">
            {stats.topPlayers.map((player, index) => (
              <div key={index} className="py-3 flex justify-between items-center">
                <span className="font-medium">{player.player_name}</span>
                <span className="text-sm text-gray-600">{player.wins} wins</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-4">
        <Link
          to="/game-plays/add"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Record New Game Play
        </Link>
        <Link
          to="/games"
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          View All Games
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;