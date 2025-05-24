import React from 'react';
import { GameMode } from '../types';
import { FREQUENCY_RANGES } from '../constants';

interface SettingsScreenProps {
  gameMode: GameMode;
  changeGameMode: (mode: GameMode) => void;
  sandboxMode: boolean;
  setSandboxMode: (val: boolean) => void;
  difficultyPercent: number;
  setDifficultyPercent: (val: number) => void;
  close: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  gameMode,
  changeGameMode,
  sandboxMode,
  setSandboxMode,
  difficultyPercent,
  setDifficultyPercent,
  close,
}) => (
  <div className="mb-6">
    <p className="text-lg mb-4">Select First Pitch Register:</p>

    <div className="grid grid-cols-1 gap-3 mb-6">
      {Object.keys(FREQUENCY_RANGES).map((mode) => (
        <button
          key={mode}
          onClick={() => changeGameMode(mode as GameMode)}
          className={`py-3 px-4 rounded-lg font-semibold text-left pl-6 capitalize ${
            gameMode === mode
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {mode} First Pitch
        </button>
      ))}
    </div>

    <div className="flex items-center mb-4">
      <input
        id="sandboxToggle"
        type="checkbox"
        checked={sandboxMode}
        onChange={() => setSandboxMode(!sandboxMode)}
        className="mr-2"
      />
      <label htmlFor="sandboxToggle" className="text-lg">
        Sandbox Mode
      </label>
    </div>

    {sandboxMode && (
      <div className="mb-6">
        <label className="block mb-2">
          Difficulty: {difficultyPercent < 10 ? difficultyPercent.toFixed(1) : Math.round(difficultyPercent)}%
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

    <button
      onClick={close}
      className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
    >
      Back to Game
    </button>
  </div>
);

export default SettingsScreen;
