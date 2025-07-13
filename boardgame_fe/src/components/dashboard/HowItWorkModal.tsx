import React from "react";

interface HowItWorkModalProps {
  open: boolean;
  onClose: () => void;
}

const HowItWorkModal: React.FC<HowItWorkModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">How Rankings & Scores Work</h2>
        <div className="space-y-3 text-gray-700 text-sm">
          <div>
            <strong>Grade Score:</strong> Your grade is a weighted average that reflects your performance across all games played. It is based on your ranks in each game, the number of players in each play, and the complexity of each game.
          </div>
          <div>
            <strong>How Grade Points Are Calculated:</strong>
            <ul className="list-disc ml-6">
              <li>
                For each play, your <b>grade point</b> is determined by your rank and the total number of players. 
                <br />
                <span className="italic">
                  (First place gets the most points, last place the least. Points are distributed evenly between ranks.)
                </span>
              </li>
              <li>
                <b>Grade Point Formula:</b> 
                <br />
                <code>
                  Points = 10 - ((Rank - 1) × ((10-4) / (Total Players - 1)))
                </code>
                <br />
                (First place: 10 points, last place: 4 points, with even steps in between)
              </li>
              <li>
                For each game, your average grade point is calculated across all your plays of that game.
              </li>
              <li>
                <b>Game Complexity Weight:</b> Each game's complexity is used as a weight. Your overall grade is a weighted average of your grade points in each game, weighted by the game's complexity.
              </li>
              <li>
                <b>Final Grade:</b> 
                <br />
                <code>
                  Weighted Grade = (Sum of (Avg Grade Point × Game Complexity)) / (Sum of Game Complexities)
                </code>
              </li>
            </ul>
          </div>
          <div>
            <strong>Grade Labels & Colors:</strong>
            <ul className="list-disc ml-6">
              <li>
                <b>A+, A, A-</b> (8.5+): Outstanding performance <span className="text-green-500">(green)</span>
              </li>
              <li>
                <b>B+, B, B-</b> (7.0 - 8.5): Good performance <span className="text-yellow-500">(yellow)</span>
              </li>
              <li>
                <b>C+, C, C-</b> (5.0 - 7.0): Average performance <span className="text-orange-500">(orange)</span>
              </li>
              <li>
                <b>D</b> (&lt; 5.0): Needs improvement <span className="text-red-500">(red)</span>
              </li>
            </ul>
          </div>
          <div>
            <strong>Win Rate:</strong> The percentage of games you have won (rank 1) out of all games you have played.<br />
            <code>Win Rate = (Number of Wins / Total Plays) × 100%</code>
          </div>
          <div>
            <strong>Filters:</strong> You can filter rankings by year and by minimum number of plays to see who’s best over different periods and levels of activity.
          </div>
          <div>
            <strong>Notes:</strong>
            <ul className="list-disc ml-6">
              <li>
                Only games with results are counted for rankings.
              </li>
              <li>
                The more complex the game, the more it contributes to your overall grade.
              </li>
              <li>
                Consistency and playing more games can improve your grade.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorkModal;