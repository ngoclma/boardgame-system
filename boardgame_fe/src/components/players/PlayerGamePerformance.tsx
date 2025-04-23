import React, { useState } from 'react';
import { PlayerStats } from '../../models/Ranking';
import Card from '../common/Card';
import { formatPercentage, formatVictoryPoints, formatOrdinal } from '../../utils/formatters';
import { Link } from 'react-router-dom';

interface PlayerGamePerformanceProps {
  gameStats: PlayerStats[];
  loading: boolean;
}

const PlayerGamePerformance: React.FC<PlayerGamePerformanceProps> = ({ gameStats, loading }) => {
  const [sortBy, setSortBy] = useState<keyof PlayerStats>('player_id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: keyof PlayerStats) => {
    if (column === sortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const sortedStats = [...gameStats].sort((a, b) => {
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortDirection === 'asc' 
        ? valueA - valueB 
        : valueB - valueA;
    }
    
    return 0;
  });

  const renderSortIcon = (column: keyof PlayerStats) => {
    if (column !== sortBy) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <Card title="Game Performance">
      {loading ? (
        <div className="py-4">
          <div className="animate-pulse space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Game
                </th>
                {/* <th 
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('plays')}
                >
                  Plays {renderSortIcon('plays')}
                </th>
                <th 
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('victory_points')}
                >
                  V. Points {renderSortIcon('victory_points')}
                </th>
                <th 
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('victory_rate')}
                >
                  V. Rate {renderSortIcon('victory_rate')}
                </th>
                <th 
                  className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('best_rank')}
                >
                  Best Rank {renderSortIcon('best_rank')}
                </th> */}
              </tr>
            </thead>
            {/* <tbody className="bg-white divide-y divide-gray-200">
              {sortedStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                    No game performance data available
                  </td>
                </tr>
              ) : (
                sortedStats.map((stat) => (
                  <tr key={stat.game_id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Link 
                        to={`/games/${stat.game_id}`} 
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {stat.game_name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      {stat.plays}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      {formatVictoryPoints(stat.victory_points)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      {formatPercentage(stat.victory_rate)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      {formatOrdinal(stat.best_rank)}
                    </td>
                  </tr>
                ))
              )}
            </tbody> */}
          </table>
        </div>
      )}
    </Card>
  );
};

export default PlayerGamePerformance;