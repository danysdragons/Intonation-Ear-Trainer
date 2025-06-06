import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import ReadyScreen from './components/ReadyScreen';
import InfoScreen from './components/InfoScreen';
import SettingsScreen from './components/SettingsScreen';
import GameOverScreen from './components/GameOverScreen';
import PlayingScreen from './components/PlayingScreen';
import AnswerButtons from './components/AnswerButtons';
import AnimationOverlay from './components/AnimationOverlay';
import { FREQUENCY_RANGES } from './constants';
import { GameMode, InstrumentType, NoiseType, Pitch, HighScores } from './types';

let audioContext: AudioContext | null = null;

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
  const [instrument, setInstrument] = useState<InstrumentType>('sine');
  const [backgroundNoise, setBackgroundNoise] = useState<NoiseType>('none');
  const [noiseGainNode, setNoiseGainNode] = useState<GainNode | null>(null);
  const [noiseSource, setNoiseSource] = useState<AudioBufferSourceNode | null>(null);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [highScores, setHighScores] = useState<HighScores>(() => {
    try {
      const savedScores = localStorage.getItem('intonationEarTrainerHighScores');
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

  // Generate noise buffers
  const createNoiseBuffer = useCallback((type: 'white' | 'pink'): AudioBuffer => {
    if (!audioContext) throw new Error('Audio context not initialized');
    
    const bufferSize = audioContext.sampleRate * 2; // 2 seconds of noise
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    if (type === 'white') {
      // White noise: equal power across all frequencies
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      // Pink noise: power decreases by 3dB per octave
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // Scale down
        b6 = white * 0.115926;
      }
    }
    
    return buffer;
  }, []);

  // Start background noise
  const startBackgroundNoise = useCallback(() => {
    if (!audioContext || backgroundNoise === 'none') return;
    
    // Stop existing noise
    if (noiseSource) {
      noiseSource.stop();
      setNoiseSource(null);
    }
    
    try {
      const buffer = createNoiseBuffer(backgroundNoise as 'white' | 'pink');
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = buffer;
      source.loop = true;
      gainNode.gain.value = 0.05; // Low volume background noise
      
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      source.start();
      setNoiseSource(source);
      setNoiseGainNode(gainNode);
    } catch (error) {
      console.error('Failed to start background noise:', error);
    }
  }, [audioContext, backgroundNoise, noiseSource, createNoiseBuffer]);

  // Stop background noise
  const stopBackgroundNoise = useCallback(() => {
    if (noiseSource) {
      noiseSource.stop();
      setNoiseSource(null);
      setNoiseGainNode(null);
    }
  }, [noiseSource]);

  // Generate a random frequency between min and max Hz based on the current mode
  const getFrequencyForMode = useCallback((): number => {
    const range = FREQUENCY_RANGES[gameMode];
    return range.min + Math.random() * (range.max - range.min);
  }, [gameMode]);

  // Synthesize instrument sounds
  const playInstrument = useCallback((frequency: number, duration: number = 1) => {
    if (!audioContext) return;
    
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    
    switch (instrument) {
      case 'piano':
        // Piano: fundamental + harmonics with exponential decay
        [1, 2, 3, 4, 5].forEach((harmonic, index) => {
          const osc = audioContext!.createOscillator();
          const harmGain = audioContext!.createGain();
          
          osc.frequency.value = frequency * harmonic;
          osc.type = 'sine';
          
          const amplitude = 0.3 / Math.pow(harmonic, 0.8);
          harmGain.gain.setValueAtTime(0, audioContext!.currentTime);
          harmGain.gain.linearRampToValueAtTime(amplitude, audioContext!.currentTime + 0.01);
          harmGain.gain.exponentialRampToValueAtTime(0.001, audioContext!.currentTime + duration);
          
          osc.connect(harmGain);
          harmGain.connect(gainNode);
          osc.start();
          osc.stop(audioContext!.currentTime + duration);
        });
        break;
        
      case 'violin':
        // Violin: sawtooth with slight vibrato and bow noise
        const violinOsc = audioContext.createOscillator();
        const violinGain = audioContext.createGain();
        const vibratoOsc = audioContext.createOscillator();
        const vibratoGain = audioContext.createGain();
        
        violinOsc.type = 'sawtooth';
        violinOsc.frequency.value = frequency;
        
        // Add subtle vibrato
        vibratoOsc.frequency.value = 5; // 5Hz vibrato
        vibratoGain.gain.value = 2; // Small frequency modulation
        vibratoOsc.connect(vibratoGain);
        vibratoGain.connect(violinOsc.frequency);
        
        violinGain.gain.setValueAtTime(0, audioContext.currentTime);
        violinGain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.1);
        violinGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + duration - 0.1);
        violinGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
        
        violinOsc.connect(violinGain);
        violinGain.connect(gainNode);
        violinOsc.start();
        vibratoOsc.start();
        violinOsc.stop(audioContext.currentTime + duration);
        vibratoOsc.stop(audioContext.currentTime + duration);
        break;
        
      case 'flute':
        // Flute: sine wave with breath noise and harmonics
        const fluteOsc = audioContext.createOscillator();
        const fluteGain = audioContext.createGain();
        const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        
        // Generate breath noise
        for (let i = 0; i < noiseData.length; i++) {
          noiseData[i] = (Math.random() * 2 - 1) * 0.02;
        }
        
        const noiseSource = audioContext.createBufferSource();
        const noiseGain = audioContext.createGain();
        const noiseFilter = audioContext.createBiquadFilter();
        
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = frequency * 2;
        noiseGain.gain.value = 0.1;
        
        fluteOsc.type = 'sine';
        fluteOsc.frequency.value = frequency;
        
        fluteGain.gain.setValueAtTime(0, audioContext.currentTime);
        fluteGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
        fluteGain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + duration - 0.05);
        fluteGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
        
        fluteOsc.connect(fluteGain);
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(gainNode);
        fluteGain.connect(gainNode);
        
        fluteOsc.start();
        noiseSource.start();
        fluteOsc.stop(audioContext.currentTime + duration);
        noiseSource.stop(audioContext.currentTime + duration);
        break;
        
      default:
        // Basic waveforms (sine, sawtooth, square, triangle)
        const oscillator = audioContext.createOscillator();
        const basicGain = audioContext.createGain();
        
        oscillator.type = instrument as OscillatorType;
        oscillator.frequency.value = frequency;
        
        basicGain.gain.setValueAtTime(0, audioContext.currentTime);
        basicGain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
        basicGain.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + duration - 0.05);
        basicGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
        
        oscillator.connect(basicGain);
        basicGain.connect(gainNode);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
        break;
    }
  }, [instrument]);

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
    
    // Start background noise if enabled
    if (backgroundNoise !== 'none') {
      startBackgroundNoise();
    }
    
    const { pitch1, pitch2 } = generatePitchPair();
    setGameState('playing');
    setCurrentPitchIndex(0);
    
    // Play the first pitch after a short delay
    setTimeout(() => {
      playInstrument(pitch1, 1);
      setCurrentPitchIndex(1);
      
      // Play the second pitch after the first one finishes
      setTimeout(() => {
        playInstrument(pitch2, 1);
        setCurrentPitchIndex(2);
      }, 1500);
    }, 500);
  }, [generatePitchPair, playInstrument, initAudio, backgroundNoise, startBackgroundNoise]);

  // Start a new game
  const startNewGame = useCallback(() => {
    setScore(0);
    setStrikes(0);
    if (!sandboxMode) {
      setDifficultyPercent(100);
    }
    setLowestDifficulty(100);
    stopBackgroundNoise();
    setGameState('ready');
    setFeedback('');
  }, [sandboxMode, stopBackgroundNoise]);

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

  // Change instrument
  const changeInstrument = useCallback((newInstrument: InstrumentType) => {
    setInstrument(newInstrument);
  }, []);

  // Change background noise
  const changeBackgroundNoise = useCallback((newNoise: NoiseType) => {
    setBackgroundNoise(newNoise);
    // Restart noise if game is active
    if (gameState === 'playing' || gameState === 'feedback') {
      stopBackgroundNoise();
      if (newNoise !== 'none') {
        setTimeout(startBackgroundNoise, 100);
      }
    }
  }, [gameState, startBackgroundNoise, stopBackgroundNoise]);

  // Replay the current pair of pitches
  const replayPitches = useCallback(() => {
    if (!firstPitch || !secondPitch || gameState !== 'playing') return;
    
    // Reset the pitch index
    setCurrentPitchIndex(0);
    
    // Play the pitches again
    setTimeout(() => {
      playInstrument(firstPitch.frequency, 1);
      setCurrentPitchIndex(1);
      
      setTimeout(() => {
        playInstrument(secondPitch.frequency, 1);
        setCurrentPitchIndex(2);
      }, 1500);
    }, 500);
  }, [firstPitch, secondPitch, gameState, playInstrument]);

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
        localStorage.setItem('intonationEarTrainerHighScores', JSON.stringify(newScores));
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
        stopBackgroundNoise();
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
  const formatDifficulty = (percent: number): string => {
    return percent < 10 ? percent.toFixed(1) : Math.round(percent).toString();
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
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Intonation Ear Trainer</h1>

      <AnimationOverlay show={showAnimation} type={animationType} />

      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <Header gameState={gameState} openInfo={openInfo} openSettings={openSettings} />

        {(gameState === 'playing' || gameState === 'feedback' || gameState === 'gameOver') && (
          <div className="mb-6 text-center">
            <div className="flex justify-between mb-2">
              <p className="text-xl">Score: {score}</p>
              <p className="text-xl">{sandboxMode ? 'Sandbox' : `Strikes: ${strikes}/3`}</p>
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
              <p className={`text-lg font-semibold ${feedback === 'Correct!' ? 'text-green-600' : 'text-red-600'}`}>{feedback}</p>
            )}
          </div>
        )}

        {gameState === 'ready' && (
          <ReadyScreen
            startRound={startRound}
            sandboxMode={sandboxMode}
            difficultyPercent={difficultyPercent}
            setDifficultyPercent={setDifficultyPercent}
            highScores={highScores}
            formatDifficulty={formatDifficulty}
          />
        )}

        {gameState === 'info' && <InfoScreen close={closeModal} />}

        {gameState === 'settings' && (
          <SettingsScreen
            gameMode={gameMode}
            changeGameMode={changeGameMode}
            instrument={instrument}
            changeInstrument={changeInstrument}
            backgroundNoise={backgroundNoise}
            changeBackgroundNoise={changeBackgroundNoise}
            sandboxMode={sandboxMode}
            setSandboxMode={setSandboxMode}
            difficultyPercent={difficultyPercent}
            setDifficultyPercent={setDifficultyPercent}
            close={closeModal}
          />
        )}

        {gameState === 'playing' && (
          <PlayingScreen currentPitchIndex={currentPitchIndex} replayPitches={replayPitches} />
        )}

        {gameState === 'gameOver' && (
          <GameOverScreen
            score={score}
            lowestDifficulty={lowestDifficulty}
            gameMode={gameMode}
            highScores={highScores}
            startNewGame={startNewGame}
            openSettings={openSettings}
            formatDifficulty={formatDifficulty}
          />
        )}

        {(gameState === 'playing' || gameState === 'feedback') && (
          <AnswerButtons
            handleAnswer={handleAnswer}
            disabled={gameState !== 'playing' || currentPitchIndex < 2}
          />
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500">Intonation Ear Trainer App Clone | Built with React</div>
    </div>
  );
};

export default App;
