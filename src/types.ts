export type GameMode = 'high' | 'medium' | 'low' | 'changing';
export type Pitch = { frequency: number; isHigher: boolean };
export type HighScore = { score: number; difficulty: number };
export type HighScores = Record<GameMode, HighScore>;
