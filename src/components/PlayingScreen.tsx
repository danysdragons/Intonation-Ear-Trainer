import React from 'react';
import { Volume2 } from 'lucide-react';

interface PlayingScreenProps {
  currentPitchIndex: number;
  replayPitches: () => void;
}

const PlayingScreen: React.FC<PlayingScreenProps> = ({ currentPitchIndex, replayPitches }) => (
  <div className="flex flex-col mb-6 items-center">
    <div className="flex justify-between w-full mb-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPitchIndex > 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>1</div>
      <div className="flex-1 h-1 self-center mx-2 bg-gray-200">
        <div className={`h-1 bg-indigo-600 transition-all duration-500 ${currentPitchIndex > 0 ? 'w-full' : 'w-0'}`}></div>
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPitchIndex > 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>2</div>
    </div>

    <p className="text-gray-700 mb-2">
      {currentPitchIndex === 0
        ? 'Get ready...'
        : currentPitchIndex === 1
        ? 'Listening to first pitch...'
        : 'Was the second pitch higher or lower?'}
    </p>

    {currentPitchIndex === 2 && (
      <button
        onClick={replayPitches}
        className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm mb-4"
      >
        <Volume2 size={16} className="mr-1" />
        Replay Pitches (R)
      </button>
    )}
  </div>
);

export default PlayingScreen;
