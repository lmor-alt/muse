import { registerExercise } from '../registry';
import type { RhythmTranscriptionSettings } from '../../types';
import { RhythmTranscription } from './RhythmTranscription';
import { RhythmTranscriptionSettings as RhythmTranscriptionSettingsComponent } from './RhythmTranscriptionSettings';

// Default settings for Rhythm Transcription
// Note: timeSignature is randomized per question (4/4 or 3/4)
// bars is always 1, includeRests is always true, noteValues are fixed
const defaultRhythmTranscriptionSettings: RhythmTranscriptionSettings = {
  questionCount: 10,
  timeLimit: null,
  replayLimit: 3,
  timeSignature: [4, 4], // Not used - randomized per question
  bars: 1, // Fixed
  includeRests: true, // Fixed
  noteValues: ['quarter', 'eighth'], // Fixed
  tempo: 30,
};

// Register Rhythm Transcription
registerExercise({
  id: 'rhythm-transcription',
  categoryId: 'rhythm',
  nameKey: 'exercise.rhythm-transcription',
  descriptionKey: 'exercise.rhythm-transcription.desc',
  component: RhythmTranscription,
  settingsComponent: RhythmTranscriptionSettingsComponent,
  defaultSettings: defaultRhythmTranscriptionSettings,
  inputMethods: ['buttons'],
});

export {
  RhythmTranscription,
  RhythmTranscriptionSettingsComponent,
};
