import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from '../../models/Play';
import Card from '../common/Card';
import { formatDate, formatDuration, calculateDuration } from '../../utils/formatters';

interface RecentPlaysProps {
  plays: Play[];
  loading: boolean;
}

const RecentPlays: React.FC<RecentPlaysProps> = ({ plays, loading }) => {
  return (
    <Card title="Recent Plays">
      {loading ? (
        <div className="py-4">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : plays.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent plays recorded.</p>
      ) : (
        <div className="space-y-4">
          {plays.map((play) => (
            <div key={play.play_id} className="border rounded-lg p-3 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <Link 
                    to={`/games/${play.game_id}`}
                    className="font-medium text-blue-600 hover:text-blue-800"
                  >
                    {play.game_name}
                  </Link>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatDate(play.start_time)} • 
                    {formatDuration(calculateDuration(play.start_time, play.end_time))} • 
                    {play.players.length} players
                  </div>
                </div>
                <Link 
                  to={`/plays/${play.play_id}`}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Details
                </Link>
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-600">
                  Winner: {play.players.find(p => p.rank === 1)?.player_name || 'Unknown'}
                </div>
                {play.notes && (
                  <div className="text-sm text-gray-500 mt-1 truncate">
                    {play.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentPlays;