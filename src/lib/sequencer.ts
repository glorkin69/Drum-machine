// Sequencer hook logic - manages playback timing
export interface SequencerState {
  isPlaying: boolean;
  currentStep: number;
  bpm: number;
}

export function getStepInterval(bpm: number): number {
  // 16 steps per bar in 4/4 time = each step is a 16th note
  // 60000ms / bpm = ms per beat (quarter note)
  // quarter note / 4 = 16th note
  return (60000 / bpm) / 4;
}
