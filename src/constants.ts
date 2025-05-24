import { GameMode, WaveformType, InstrumentType, NoiseType } from './types';

export const FREQUENCY_RANGES: Record<GameMode, { min: number; max: number }> = {
  high: { min: 660, max: 1320 }, // A5 to E6
  medium: { min: 330, max: 660 }, // E4 to E5
  low: { min: 110, max: 220 }, // A2 to A3
  changing: { min: 110, max: 1320 }, // Full range
};

export const WAVEFORM_OPTIONS: Record<WaveformType, { name: string; description: string }> = {
  sine: { name: 'Sine Wave', description: 'Pure tone, easiest to distinguish' },
  sawtooth: { name: 'Sawtooth', description: 'Bright, buzzy sound' },
  square: { name: 'Square Wave', description: 'Hollow, clarinet-like tone' },
  triangle: { name: 'Triangle', description: 'Mellow, flute-like tone' },
};

export const INSTRUMENT_OPTIONS: Record<InstrumentType, { name: string; description: string }> = {
  sine: { name: 'Sine Wave', description: 'Pure tone, easiest to distinguish' },
  sawtooth: { name: 'Sawtooth', description: 'Bright, buzzy sound' },
  square: { name: 'Square Wave', description: 'Hollow, clarinet-like tone' },
  triangle: { name: 'Triangle', description: 'Mellow, flute-like tone' },
  piano: { name: 'Piano', description: 'Rich harmonic tone with decay' },
  violin: { name: 'Violin', description: 'Bright string timbre' },
  flute: { name: 'Flute', description: 'Breathy, hollow woodwind' },
};

export const NOISE_OPTIONS: Record<NoiseType, { name: string; description: string }> = {
  none: { name: 'No Background Noise', description: 'Clean listening environment' },
  white: { name: 'White Noise', description: 'All frequencies equally present' },
  pink: { name: 'Pink Noise', description: 'More natural, frequency-balanced' },
};
