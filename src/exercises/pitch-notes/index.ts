import { registerExercise } from '../registry';
import type { NoteIdentificationSettings, PitchHearingSettings, HigherOrLowerSettings } from '../../types';
import { NoteIdentification } from './NoteIdentification';
import { NoteIdentificationSettings as NoteIdentificationSettingsComponent } from './NoteIdentificationSettings';
import { PitchHearing } from './PitchHearing';
import { PitchHearingSettings as PitchHearingSettingsComponent } from './PitchHearingSettings';
import { HigherOrLower } from './HigherOrLower';
import { HigherOrLowerSettings as HigherOrLowerSettingsComponent } from './HigherOrLowerSettings';

// Default settings for Note Identification
const defaultNoteIdentificationSettings: NoteIdentificationSettings = {
  questionCount: 10,
  timeLimit: null,
  replayLimit: null,
  clef: 'treble',
  noteRange: {
    low: { name: 'C', octave: 4, accidental: 'natural' },
    high: { name: 'C', octave: 5, accidental: 'natural' },
  },
  includeAccidentals: false,
  accidentalTypes: ['sharp', 'flat'],
};

// Default settings for Pitch Hearing
const defaultPitchHearingSettings: PitchHearingSettings = {
  questionCount: 10,
  timeLimit: null,
  replayLimit: 3,
  noteRange: {
    low: { name: 'C', octave: 4, accidental: 'natural' },
    high: { name: 'C', octave: 5, accidental: 'natural' },
  },
  includeAccidentals: false,
};

// Default settings for Higher or Lower
const defaultHigherOrLowerSettings: HigherOrLowerSettings = {
  questionCount: 10,
  timeLimit: null,
  replayLimit: null,
  difficulty: 'medium',
  noteRange: {
    low: { name: 'C', octave: 3, accidental: 'natural' },
    high: { name: 'C', octave: 5, accidental: 'natural' },
  },
};

// Register Note Identification
registerExercise({
  id: 'note-identification',
  categoryId: 'pitch-notes',
  nameKey: 'exercise.note-identification',
  descriptionKey: 'exercise.note-identification.desc',
  component: NoteIdentification,
  settingsComponent: NoteIdentificationSettingsComponent,
  defaultSettings: defaultNoteIdentificationSettings,
  inputMethods: ['piano', 'buttons'],
});

// Register Pitch Hearing
registerExercise({
  id: 'pitch-hearing',
  categoryId: 'pitch-notes',
  nameKey: 'exercise.pitch-hearing',
  descriptionKey: 'exercise.pitch-hearing.desc',
  component: PitchHearing,
  settingsComponent: PitchHearingSettingsComponent,
  defaultSettings: defaultPitchHearingSettings,
  inputMethods: ['piano', 'buttons'],
});

// Register Higher or Lower
registerExercise({
  id: 'higher-or-lower',
  categoryId: 'pitch-notes',
  nameKey: 'exercise.higher-or-lower',
  descriptionKey: 'exercise.higher-or-lower.desc',
  component: HigherOrLower,
  settingsComponent: HigherOrLowerSettingsComponent,
  defaultSettings: defaultHigherOrLowerSettings,
  inputMethods: ['buttons'],
});

export {
  NoteIdentification,
  NoteIdentificationSettingsComponent,
  PitchHearing,
  PitchHearingSettingsComponent,
  HigherOrLower,
  HigherOrLowerSettingsComponent,
};
