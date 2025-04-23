import React, { useState, useEffect } from 'react';
import { Ranking, RankingPeriod } from '../../models/Ranking';
import { useRankings } from '../../hooks/useRankings';
import Card from '../common/Card';
import { RANKING_PERIODS, YEARS_OPTIONS } from '../../utils/constants';

interface PlayerRankingsProps {
  playerId: number;
}

const PlayerRankings: React.FC<PlayerRankingsProps> = ({ playerId }) => {
  const [period, setPeriod] = useState<RankingPeriod>('all-time');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [rankings, setRankings] = useState<Ranking[]>([]);
  
  const { getOverallRankings, getYearlyRankings, loading, error } = useRankings();
  
  useEffect(() => {
    const fetchRankings = async () => {
      let data;
      if (period === 'yearly') {
        data = await getYearlyRankings(year);
      } else {
        data = await getOverallRankings(period);
      }
      
      if (data) {
        setRankings(data);
      }
    };
    
    fetchRankings();
  }, [period, year, getOverallRankings, getYearlyRankings]);
  
  const playerRanking = rankings.find(r => r.player_id === playerId);
  const totalPlayers = rankings.length;
  
  return (
    <Card 
      title="Rankings"
      footer={
        <div className="flex justify-end space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as RankingPeriod)}
            className="block bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {RANKING_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          
          {period === 'yearly' && (
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="block bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {YEARS_OPTIONS().map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="animate-pulse space-y-4 py-4">
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : !playerRanking ? (
        <div className="text-gray-500 text-center py-4">
          No ranking data available for this player in the selected period.
        </div>
      ) : (
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 text-blue-800 mb-4">
            <span className="text-3xl font-bold">#{playerRanking.rank}</span>
          </div>
          <div className="text-sm text-gray-500 mb-1">
            of {totalPlayers} players
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-6">
            <div>
              <div className="text-sm text-gray-500">Plays</div>
              <div className="text-xl font-bold">{playerRanking.plays}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Victory Points</div>
              <div className="text-xl font-bold">{playerRanking.victory_points.toFixed(2)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-sm text-gray-500">Victory Rate</div>
              <div className="text-2xl font-bold">{(playerRanking.victory_rate * 100).toFixed(1)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${playerRanking.victory_rate * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PlayerRankings;