import React from 'react';
import { GameMode, InstrumentType, NoiseType } from '../types';
import { FREQUENCY_RANGES, INSTRUMENT_OPTIONS, NOISE_OPTIONS } from '../constants';

interface SettingsScreenProps {
  gameMode: GameMode;
  changeGameMode: (mode: GameMode) => void;
  instrument: InstrumentType;
  changeInstrument: (instrument: InstrumentType) => void;
  backgroundNoise: NoiseType;
  changeBackgroundNoise: (noise: NoiseType) => void;
  sandboxMode: boolean;
  setSandboxMode: (val: boolean) => void;
  difficultyPercent: number;
  setDifficultyPercent: (val: number) => void;
  close: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  gameMode,
  changeGameMode,
  instrument,
  changeInstrument,
  backgroundNoise,
  changeBackgroundNoise,
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

    <p className="text-lg mb-4">Select Sound:</p>

    <div className="grid grid-cols-1 gap-2 mb-6">
      {Object.entries(INSTRUMENT_OPTIONS).map(([type, info]) => (
        <button
          key={type}
          onClick={() => changeInstrument(type as InstrumentType)}
          className={`py-2 px-4 rounded-lg text-left text-sm ${
            instrument === type
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="font-semibold">{info.name}</div>
          <div className="text-xs opacity-75">{info.description}</div>
        </button>
      ))}
    </div>

    <p className="text-lg mb-4">Background Noise:</p>

    <div className="grid grid-cols-1 gap-2 mb-6">
      {Object.entries(NOISE_OPTIONS).map(([type, info]) => (
        <button
          key={type}
          onClick={() => changeBackgroundNoise(type as NoiseType)}
          className={`py-2 px-4 rounded-lg text-left text-sm ${
            backgroundNoise === type
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="font-semibold">{info.name}</div>
          <div className="text-xs opacity-75">{info.description}</div>
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
