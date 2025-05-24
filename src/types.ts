export type GameMode = 'high' | 'medium' | 'low' | 'changing';
export type WaveformType = 'sine' | 'sawtooth' | 'square' | 'triangle';
export type InstrumentType = 'sine' | 'sawtooth' | 'square' | 'triangle' | 'piano' | 'violin' | 'flute';
export type NoiseType = 'none' | 'white' | 'pink';
export type Pitch = { frequency: number; isHigher: boolean };
export type HighScore = { score: number; difficulty: number };
export type HighScores = Record<GameMode, HighScore>;
