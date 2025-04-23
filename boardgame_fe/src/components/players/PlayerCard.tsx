import React from 'react';
import { Player } from '../../models/Player';
import Card from '../common/Card';
import { formatPercentage } from '../../utils/formatters';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-center sm:items-start">
        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6">
          <span className="text-3xl font-bold text-gray-400">
            {player.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold">{player.name}</h2>
          {player.alias && (
            <div className="text-gray-600 mb-2">
              aka "{player.alias}"
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
            <div>
              <div className="text-sm text-gray-500">Total Plays</div>
              {/* <div className="text-xl font-bold">{player.no_total_play}</div> */}
            </div>
            <div>
              <div className="text-sm text-gray-500">Wins</div>
              {/* <div className="text-xl font-bold">{player.no_total_wins}</div> */}
            </div>
            <div>
              <div className="text-sm text-gray-500">Victory Points</div>
              {/* <div className="text-xl font-bold">{player.total_victory_points.toFixed(2)}</div> */}
            </div>
            <div>
              <div className="text-sm text-gray-500">Victory Rate</div>
              {/* <div className="text-xl font-bold">{formatPercentage(player.victory_rate)}</div> */}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlayerCard;