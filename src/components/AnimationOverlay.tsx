import React from 'react';

interface AnimationOverlayProps {
  show: boolean;
  type: string;
}

const AnimationOverlay: React.FC<AnimationOverlayProps> = ({ show, type }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className={`text-9xl ${type === 'correct' ? 'text-green-500' : 'text-red-500'} transform transition-all duration-700 ${show ? 'scale-100 opacity-100' : 'scale-150 opacity-0'}`}
      >
        {type === 'correct' ? '✓' : '✗'}
      </div>
    </div>
  );
};

export default AnimationOverlay;
