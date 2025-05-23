// import React from 'react';
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RefreshCw, Settings, Share2, Trophy, Volume2, Info } from 'lucide-react';
import logo from './logo.svg';
import './App.css';

// Define types for game modes and pitches

type GameMode = 'high' | 'medium' | 'low' | 'changing';
type Pitch = { frequency: number; isHigher: boolean };
type HighScore = { score: number; difficulty: number };
type HighScores = Record<GameMode, HighScore>;

// Create an AudioContext for generating sounds
let audioContext: AudioContext | null = null;

// Define frequency ranges for different modes
const FREQUENCY_RANGES: Record<GameMode, { min: number; max: number }> = {
  high: { min: 660, max: 1320 }, // A5 to E6
  medium: { min: 330, max: 660 }, // E4 to E5
  low: { min: 110, max: 220 },    // A2 to A3
  changing: { min: 110, max: 1320 } // Full range, will be randomized
};

// Define sound effects
const SOUND_EFFECTS = {
  correct: {
    type: 'sine',
    frequencies: [523.25, 659.25, 783.99], // C5, E5, G5 (major chord)
    durations: [0.1, 0.1, 0.4]
  },
  incorrect: {
    type: 'sine',
    frequencies: [392.00, 369.99], // G4, F#4 (dissonant)
    durations: [0.1, 0.3]
  },
  gameOver: {
    type: 'sine',
    frequencies: [523.25, 392.00, 329.63, 261.63], // C5, G4, E4, C4 (descending)
    durations: [0.2, 0.2, 0.2, 0.5]
  }
};

const App = () => {
  const [score, setScore] = useState(0);
  const [firstPitch, setFirstPitch] = useState<Pitch | null>(null);
  const [secondPitch, setSecondPitch] = useState<Pitch | null>(null);
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'feedback' | 'gameOver' | 'settings' | 'info'>('ready');
  const [feedback, setFeedback] = useState('');
  const [currentPitchIndex, setCurrentPitchIndex] = useState(0);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [difficultyPercent, setDifficultyPercent] = useState(100); // 100% of a half-step (easy)
  const [strikes, setStrikes] = useState(0);
  const [lowestDifficulty, setLowestDifficulty] = useState(100);
  const [gameMode, setGameMode] = useState<GameMode>('medium'); // high, medium, low, changing
  const [sandboxMode, setSandboxMode] = useState(false);
  const [highScores, setHighScores] = useState<HighScores>(() => {
    try {
      const savedScores = localStorage.getItem('intuneHighScores');
      return savedScores ? JSON.parse(savedScores) : {
        high: { score: 0, difficulty: 100 },
        medium: { score: 0, difficulty: 100 },
        low: { score: 0, difficulty: 100 },
        changing: { score: 0, difficulty: 100 }
      };
    } catch {
      return {
        high: { score: 0, difficulty: 100 },
        medium: { score: 0, difficulty: 100 },
        low: { score: 0, difficulty: 100 },
        changing: { score: 0, difficulty: 100 }
      };
    }
  });
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState('');
  
  // Refs for animation elements
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Initialize audio context on first user interaction
  const initAudio = useCallback(() => {
    if (!isAudioInitialized) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      setIsAudioInitialized(true);
    }
  }, [isAudioInitialized]);

  // Generate a random frequency between min and max Hz based on the current mode
  const getFrequencyForMode = useCallback((): number => {
    const range = FREQUENCY_RANGES[gameMode];
    return range.min + Math.random() * (range.max - range.min);
  }, [gameMode]);

  // Play a tone with the given frequency
  const playTone = useCallback((frequency: number, duration: number = 1) => {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    
    // Apply envelope to avoid clicks
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }, []);

  // Play a sequence of tones for sound effects
  const playSoundEffect = useCallback((effectName: keyof typeof SOUND_EFFECTS) => {
    if (!audioContext || !SOUND_EFFECTS[effectName]) return;
    
    const effect = SOUND_EFFECTS[effectName];
    let startTime = audioContext.currentTime;
    
    effect.frequencies.forEach((freq: number, index: number) => {
      if (!audioContext) return;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = effect.type as OscillatorType;
      oscillator.frequency.value = freq;
      
      // Apply envelope
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + effect.durations[index] - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + effect.durations[index]);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + effect.durations[index]);
      
      startTime += effect.durations[index];
    });
  }, []);

  // Generate a pair of pitches with one slightly higher or lower than the other
  const generatePitchPair = useCallback(() => {
    // Get base frequency according to selected mode
    const baseFreq = getFrequencyForMode();
    
    // Use current difficulty level
    const halfStepRatio = Math.pow(2, 1/12); // ratio for a half-step
    const percentOfHalfStep = difficultyPercent / 100; // Convert percentage to decimal
    const pitchDifference = Math.pow(halfStepRatio, percentOfHalfStep) - 1;
    
    // Randomly decide if second pitch should be higher or lower
    const isSecondPitchHigher = Math.random() > 0.5;
    
    let pitch1 = baseFreq;
    let pitch2;
    
    if (isSecondPitchHigher) {
      pitch2 = baseFreq * (1 + pitchDifference);
    } else {
      pitch2 = baseFreq / (1 + pitchDifference);
    }
    
    setFirstPitch({
      frequency: pitch1,
      isHigher: !isSecondPitchHigher
    });
    
    setSecondPitch({
      frequency: pitch2,
      isHigher: isSecondPitchHigher
    });
    
    return { pitch1, pitch2 };
  }, [difficultyPercent, getFrequencyForMode]);

  // Start a new round
  const startRound = useCallback(() => {
    initAudio();
    
    const { pitch1, pitch2 } = generatePitchPair();
    setGameState('playing');
    setCurrentPitchIndex(0);
    
    // Play the first pitch after a short delay
    setTimeout(() => {
      playTone(pitch1, 1);
      setCurrentPitchIndex(1);
      
      // Play the second pitch after the first one finishes
      setTimeout(() => {
        playTone(pitch2, 1);
        setCurrentPitchIndex(2);
      }, 1500);
    }, 500);
  }, [generatePitchPair, playTone, initAudio]);

  // Start a new game
  const startNewGame = useCallback(() => {
    setScore(0);
    setStrikes(0);
    if (!sandboxMode) {
      setDifficultyPercent(100);
    }
    setLowestDifficulty(100);
    setGameState('ready');
    setFeedback('');
  }, [sandboxMode]);

  // Open settings
  const openSettings = useCallback(() => {
    setGameState('settings');
  }, []);

  // Open info
  const openInfo = useCallback(() => {
    setGameState('info');
  }, []);

  // Close modal screens
  const closeModal = useCallback(() => {
    setGameState('ready');
  }, []);

  // Change game mode
  const changeGameMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
  }, []);

  // Replay the current pair of pitches
  const replayPitches = useCallback(() => {
    if (!firstPitch || !secondPitch || gameState !== 'playing') return;
    
    // Reset the pitch index
    setCurrentPitchIndex(0);
    
    // Play the pitches again
    setTimeout(() => {
      playTone(firstPitch.frequency, 1);
      setCurrentPitchIndex(1);
      
      setTimeout(() => {
        playTone(secondPitch.frequency, 1);
        setCurrentPitchIndex(2);
      }, 1500);
    }, 500);
  }, [firstPitch, secondPitch, gameState, playTone]);

  // Check and update high scores
  const updateHighScores = useCallback((finalScore: number, smallestDiff: number) => {
    setHighScores((prevScores: HighScores) => {
      const newScores = { ...prevScores };
      
      // Update if score is higher or difficulty is smaller
      if (
        finalScore > prevScores[gameMode].score || 
        (finalScore === prevScores[gameMode].score && smallestDiff < prevScores[gameMode].difficulty)
      ) {
        newScores[gameMode] = {
          score: finalScore,
          difficulty: smallestDiff
        };
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('intuneHighScores', JSON.stringify(newScores));
      } catch (e) {
        console.error('Failed to save high scores:', e);
      }
      
      return newScores;
    });
  }, [gameMode]);

  // Trigger animations
  const triggerAnimation = useCallback((type: string) => {
    // Clear any existing animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    setShowAnimation(true);
    setAnimationType(type);
    
    // Hide animation after a delay
    animationTimeoutRef.current = setTimeout(() => {
      setShowAnimation(false);
    }, 1000);
  }, []);

  // Adjust difficulty based on user performance
  const adjustDifficulty = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      // Make it harder (smaller pitch difference)
      // Decrease by ~23% each time, which creates a nice progression
      const newDifficulty = Math.max(difficultyPercent * 0.77, 1);
      setDifficultyPercent(newDifficulty);
      
      // Track the lowest difficulty (smallest pitch difference) achieved
      if (newDifficulty < lowestDifficulty) {
        setLowestDifficulty(newDifficulty);
      }
    } else {
      // Make it easier (larger pitch difference)
      // Increase by ~30% but cap at 100%
      setDifficultyPercent(Math.min(difficultyPercent * 1.3, 100));
    }
  }, [difficultyPercent, lowestDifficulty]);

  // Handle user's answer
  const handleAnswer = useCallback((userAnswer: 'higher' | 'lower') => {
    if (gameState !== 'playing' || currentPitchIndex < 2) return;
    if (!secondPitch) return;
    
    const isCorrect = 
      (userAnswer === 'higher' && secondPitch.isHigher) || 
      (userAnswer === 'lower' && !secondPitch.isHigher);
    
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
      setFeedback('Correct!');
      if (!sandboxMode) {
        adjustDifficulty(true);
      }
      playSoundEffect('correct');
      triggerAnimation('correct');
    } else {
      setFeedback('Oops! Incorrect!');
      if (!sandboxMode) {
        setStrikes(prevStrikes => prevStrikes + 1);
        adjustDifficulty(false);
      }
      playSoundEffect('incorrect');
      triggerAnimation('incorrect');
    }
    
    setGameState('feedback');
    
    // Check if game over (3 strikes)
    if (!sandboxMode && !isCorrect && strikes + 1 >= 3) {
      // Update high scores
      updateHighScores(score, lowestDifficulty);

      setTimeout(() => {
        playSoundEffect('gameOver');
        setGameState('gameOver');
      }, 1500);
    } else {
      // Start next round after feedback
      setTimeout(() => {
        setFeedback('');
        startRound();
      }, 1500);
    }
  }, [gameState, currentPitchIndex, secondPitch, strikes, score, lowestDifficulty,
      adjustDifficulty, startRound, playSoundEffect, triggerAnimation, updateHighScores, sandboxMode]);

  // Format the difficulty percentage with one decimal place
  const formatDifficulty = (percent: number) => {
    return percent < 10 ? percent.toFixed(1) : Math.round(percent);
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState === 'playing' && currentPitchIndex === 2) {
        if (event.key === 'ArrowUp') {
          handleAnswer('higher');
        } else if (event.key === 'ArrowDown') {
          handleAnswer('lower');
        } else if (event.key === 'r' || event.key === 'R') {
          replayPitches();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, currentPitchIndex, handleAnswer, replayPitches]);

  // Clean up animation timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">InTune Ear Training</h1>
      
      {/* Animation overlay */}
      {showAnimation && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className={`text-9xl ${animationType === 'correct' ? 'text-green-500' : 'text-red-500'} transform transition-all duration-700 ${showAnimation ? 'scale-100 opacity-100' : 'scale-150 opacity-0'}`}>
            {animationType === 'correct' ? '✓' : '✗'}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {/* Header with buttons */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {gameState === 'settings' ? 'Game Settings' : 
             gameState === 'info' ? 'About InTune' : 'Ear Training'}
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
        
        {/* Game Stats */}
        {(gameState === 'playing' || gameState === 'feedback' || gameState === 'gameOver') && (
          <div className="mb-6 text-center">
            <div className="flex justify-between mb-2">
              <p className="text-xl">Score: {score}</p>
              <p className="text-xl">
                {sandboxMode ? 'Sandbox' : `Strikes: ${strikes}/3`}
              </p>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-500">Current Difficulty</p>
              <p className="text-lg font-semibold">{formatDifficulty(difficultyPercent)}% of a half-step</p>
              {sandboxMode && (
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={difficultyPercent}
                  onChange={(e) => setDifficultyPercent(parseFloat(e.target.value))}
                  className="w-full mt-2"
                />
              )}
            </div>
            
            <div className="bg-gray-100 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-500">Mode</p>
              <p className="text-lg font-semibold capitalize">{gameMode} First Pitch</p>
            </div>
            
            {feedback && (
              <p className={`text-lg font-semibold ${feedback === 'Correct!' ? 'text-green-600' : 'text-red-600'}`}>
                {feedback}
              </p>
            )}
          </div>
        )}
        
        {/* Start Game Button */}
        {gameState === 'ready' && (
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
                <label className="block mb-2 text-center">Difficulty: {formatDifficulty(difficultyPercent)}%</label>
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
            
            {/* High Scores Display */}
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
        )}
        
        {/* Info Screen */}
        {gameState === 'info' && (
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
              onClick={closeModal}
              className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              Back to Game
            </button>
          </div>
        )}
        
        {/* Settings Screen */}
        {gameState === 'settings' && (
          <div className="mb-6">
            <p className="text-lg mb-4">Select First Pitch Register:</p>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {Object.keys(FREQUENCY_RANGES).map((mode) => (
                <button
                  key={mode}
                  onClick={() => changeGameMode(mode as GameMode)}
                  className={`py-3 px-4 rounded-lg font-semibold text-left pl-6 capitalize
                    ${gameMode === mode
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
              <label htmlFor="sandboxToggle" className="text-lg">Sandbox Mode</label>
            </div>

            {sandboxMode && (
              <div className="mb-6">
                <label className="block mb-2">Difficulty: {formatDifficulty(difficultyPercent)}%</label>
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
              onClick={closeModal}
              className="w-full py-3 px-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
            >
              Back to Game
            </button>
          </div>
        )}
        
        {/* Playing State */}
        {gameState === 'playing' && (
          <div className="flex flex-col mb-6 items-center">
            <div className="flex justify-between w-full mb-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPitchIndex > 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <div className="flex-1 h-1 self-center mx-2 bg-gray-200">
                <div className={`h-1 bg-indigo-600 transition-all duration-500 ${currentPitchIndex > 0 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPitchIndex > 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
            </div>
            
            <p className="text-gray-700 mb-2">
              {currentPitchIndex === 0 ? 'Get ready...' : 
               currentPitchIndex === 1 ? 'Listening to first pitch...' : 
               'Was the second pitch higher or lower?'}
            </p>
            
            {/* Replay button */}
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
        )}
        
        {/* Game Over Screen */}
        {gameState === 'gameOver' && (
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-3">Game Over!</h2>
            <p className="text-lg mb-2">Your Score: {score}</p>
            <p className="text-lg mb-4">Smallest Pitch Difference: {formatDifficulty(lowestDifficulty)}% of a half-step</p>
            
            {/* New high score message */}
            {highScores[gameMode].score === score && highScores[gameMode].difficulty === lowestDifficulty && score > 0 && (
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
        )}
        
        {/* Answer Buttons */}
        {(gameState === 'playing' || gameState === 'feedback') && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer('higher')}
              disabled={gameState !== 'playing' || currentPitchIndex < 2}
              className={`py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200
                ${(gameState === 'playing' && currentPitchIndex >= 2) 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              aria-label="Higher (Up Arrow)"
            >
              ↑ Higher
            </button>
            
            <button
              onClick={() => handleAnswer('lower')}
              disabled={gameState !== 'playing' || currentPitchIndex < 2}
              className={`py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200
                ${(gameState === 'playing' && currentPitchIndex >= 2) 
                  ? 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              aria-label="Lower (Down Arrow)"
            >
              ↓ Lower
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-6 text-sm text-gray-500">
        InTune Ear Training App Clone | Built with React
      </div>
    </div>
  );
};

export default App;
