import React from 'react';
import { RefreshCw, Settings, Trophy } from 'lucide-react';
import { GameMode, HighScores } from '../types';

interface GameOverScreenProps {
  score: number;
  lowestDifficulty: number;
  gameMode: GameMode;
  highScores: HighScores;
  startNewGame: () => void;
  openSettings: () => void;
  formatDifficulty: (percent: number) => string;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  lowestDifficulty,
  gameMode,
  highScores,
  startNewGame,
  openSettings,
  formatDifficulty,
}) => (
  <div className="mb-6 text-center">
    <h2 className="text-2xl font-bold mb-3">Game Over!</h2>
    <p className="text-lg mb-2">Your Score: {score}</p>
    <p className="text-lg mb-4">
      Smallest Pitch Difference: {formatDifficulty(lowestDifficulty)}% of a half-step
    </p>

    {highScores[gameMode].score === score &&
      highScores[gameMode].difficulty === lowestDifficulty &&
      score > 0 && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4 flex items-center">
          <Trophy size={20} className="mr-2 text-yellow-500" />
          <p className="text-yellow-800">New high score for {gameMode} mode!</p>
        </div>
      )}

    <div className="grid grid-cols-2 gap-3 mb-4">
      <button
        onClick={startNewGame}
        className="flex items-center justify-center py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
      >
        <RefreshCw className="mr-2" size={18} />
        Play Again
      </button>

      <button
        onClick={openSettings}
        className="flex items-center justify-center py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
      >
        <Settings className="mr-2" size={18} />
        Settings
      </button>
    </div>
  </div>
);

export default GameOverScreen;
