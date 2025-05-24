import { GameMode } from './types';

export const FREQUENCY_RANGES: Record<GameMode, { min: number; max: number }> = {
  high: { min: 660, max: 1320 }, // A5 to E6
  medium: { min: 330, max: 660 }, // E4 to E5
  low: { min: 110, max: 220 }, // A2 to A3
  changing: { min: 110, max: 1320 }, // Full range
};
