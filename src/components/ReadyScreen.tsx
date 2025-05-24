import React from 'react';
import { Play, Trophy } from 'lucide-react';
import { HighScores, HighScore } from '../types';

interface ReadyScreenProps {
  startRound: () => void;
  sandboxMode: boolean;
  difficultyPercent: number;
  setDifficultyPercent: (value: number) => void;
  highScores: HighScores;
  formatDifficulty: (percent: number) => string;
}

const ReadyScreen: React.FC<ReadyScreenProps> = ({
  startRound,
  sandboxMode,
  difficultyPercent,
  setDifficultyPercent,
  highScores,
  formatDifficulty,
}) => (
  <div>
    <button
      onClick={startRound}
      className="flex items-center justify-center w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 mb-4"
    >
      <Play className="mr-2" size={20} />
      Start Game
    </button>

    {sandboxMode && (
      <div className="mb-4">
        <label className="block mb-2 text-center">
          Difficulty: {formatDifficulty(difficultyPercent)}%
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={difficultyPercent}
          onChange={(e) => setDifficultyPercent(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    )}

    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Trophy size={18} className="mr-2 text-yellow-500" />
        High Scores
      </h3>

      <div className="bg-gray-50 rounded-lg p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2">Mode</th>
              <th className="text-right py-2">Score</th>
              <th className="text-right py-2">Best Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(highScores).map(([mode, data]) => (
              <tr key={mode} className="border-b border-gray-100">
                <td className="py-2 capitalize">{mode}</td>
                <td className="text-right py-2">{(data as HighScore).score}</td>
                <td className="text-right py-2">{formatDifficulty((data as HighScore).difficulty)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default ReadyScreen;
