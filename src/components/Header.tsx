import React from 'react';
import { Info, Settings } from 'lucide-react';

interface HeaderProps {
  gameState: string;
  openInfo: () => void;
  openSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ gameState, openInfo, openSettings }) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">
      {gameState === 'settings'
        ? 'Game Settings'
        : gameState === 'info'
        ? 'About Intonation Ear Trainer'
        : 'Ear Training'}
    </h2>
    {gameState === 'ready' && (
      <div className="flex">
        <button
          onClick={openInfo}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 mr-1"
          aria-label="Information"
        >
          <Info size={20} />
        </button>
        <button
          onClick={openSettings}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>
      </div>
    )}
  </div>
);

export default Header;
