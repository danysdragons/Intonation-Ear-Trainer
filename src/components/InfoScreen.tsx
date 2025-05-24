import React from 'react';

interface InfoScreenProps {
  close: () => void;
}

const InfoScreen: React.FC<InfoScreenProps> = ({ close }) => (
  <div className="mb-6">
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-bold mb-2">How to Play</h3>
      <p className="mb-2">InTune helps you train your ear to distinguish small pitch differences:</p>
      <ol className="list-decimal pl-5 mb-3">
        <li className="mb-1">Listen carefully to two consecutive pitches</li>
        <li className="mb-1">Determine if the second pitch is higher or lower than the first</li>
        <li className="mb-1">The game becomes harder with each correct answer</li>
        <li className="mb-1">Three incorrect answers ends the game</li>
      </ol>
      <p>Use different modes to practice with pitches in different registers.</p>
    </div>

    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-bold mb-2">Keyboard Controls</h3>
      <ul className="list-disc pl-5 mb-3">
        <li className="mb-1">↑ (Up Arrow): Select "Higher"</li>
        <li className="mb-1">↓ (Down Arrow): Select "Lower"</li>
        <li className="mb-1">R: Replay the pitch pair</li>
      </ul>
    </div>

    <button
      onClick={close}
      className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
    >
      Back to Game
    </button>
  </div>
);

export default InfoScreen;
