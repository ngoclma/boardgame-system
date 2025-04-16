import React, { useState } from 'react';
import { Ranking, RankingPeriod } from '../../models/Play';
import Card from '../common/Card';
import { formatPercentage, formatVictoryPoints, formatRankWithColor } from '../../utils/formatters';
import { RANKING_PERIODS } from '../../utils/constants';

interface RankingTableProps {
  rankings: Ranking[];
  loading: boolean;
  title?: string;
  onChangePeriod?: (period: RankingPeriod) => void;
  selectedPeriod?: RankingPeriod;
}

const RankingTable: React.FC<RankingTableProps> = ({ 
  rankings, 
  loading, 
  title = "Player Rankings", 
  onChangePeriod,
  selectedPeriod = 'all-time'
}) => {
  return (
    <Card 
      title={title}
      footer={onChangePeriod && (
        <div className="flex justify-end">
          <select
            value={selectedPeriod}
            onChange={(e) => onChangePeriod(e.target.value as RankingPeriod)}
            className="block w-40 bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {RANKING_PERIODS.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      )}
    >
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Plays</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">V. Points</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">V. Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                    No rankings available
                  </td>
                </tr>
              ) : (
                rankings.map((ranking) => {
                  const { text, color } = formatRankWithColor(ranking.rank);
                  return (
                    <tr key={ranking.player_id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`font-bold ${color}`}>{text}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <a 
                          href={`/players/${ranking.player_id}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {ranking.player_name}
                        </a>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        {ranking.plays}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        {formatVictoryPoints(ranking.victory_points)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        {formatPercentage(ranking.victory_rate)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default RankingTable;