import { registerExercise } from '../registry';
import type {
  ChordDrawingSettings,
  ChordIdentificationVisualSettings,
  ChordIdentificationAuditorySettings,
} from '../../types';
import { ChordDrawing } from './ChordDrawing';
import { ChordDrawingSettings as ChordDrawingSettingsComponent } from './ChordDrawingSettings';
import { ChordIdentificationVisual } from './ChordIdentificationVisual';
import { ChordIdentificationVisualSettings as ChordIdentificationVisualSettingsComponent } from './ChordIdentificationVisualSettings';
import { ChordIdentificationAuditory } from './ChordIdentificationAuditory';
import { ChordIdentificationAuditorySettings as ChordIdentificationAuditorySettingsComponent } from './ChordIdentificationAuditorySettings';

// Default settings for Chord Drawing
const defaultChordDrawingSettings: ChordDrawingSettings = {
  questionCount: 10,
  timeLimit: null,
  replayLimit: null,
  chordTypes: ['major', 'minor'],
  includeInversions: false,
};

// Default settings for Chord Identification (Visual)
const defaultChordIdentificationVisualSettings: ChordIdentificationVisualSettings = {
  questionCount: 10,
  timeLimit: null,
  replayLimit: null,
  chordTypes: ['major', 'minor'],
  includeInversions: false,
};

// Default settings for Chord Identification (Auditory)
const defaultChordIdentificationAuditorySettings: ChordIdentificationAuditorySettings = {
  questionCount: 10,
  timeLimit: null,
  replayLimit: 3,
  chordTypes: ['major', 'minor'],
  voicing: 'harmonic',
  includeInversions: false,
  difficulty: 'easy', // easy = quality only, hard = root + quality
};

// Register Chord Drawing
registerExercise({
  id: 'chord-drawing',
  categoryId: 'chords',
  nameKey: 'exercise.chord-drawing',
  descriptionKey: 'exercise.chord-drawing.desc',
  component: ChordDrawing,
  settingsComponent: ChordDrawingSettingsComponent,
  defaultSettings: defaultChordDrawingSettings,
  inputMethods: ['staff'],
});

// Register Chord Identification (Visual)
registerExercise({
  id: 'chord-identification-visual',
  categoryId: 'chords',
  nameKey: 'exercise.chord-identification-visual',
  descriptionKey: 'exercise.chord-identification-visual.desc',
  component: ChordIdentificationVisual,
  settingsComponent: ChordIdentificationVisualSettingsComponent,
  defaultSettings: defaultChordIdentificationVisualSettings,
  inputMethods: ['buttons'],
});

// Register Chord Identification (Auditory)
registerExercise({
  id: 'chord-identification-auditory',
  categoryId: 'chords',
  nameKey: 'exercise.chord-identification-auditory',
  descriptionKey: 'exercise.chord-identification-auditory.desc',
  component: ChordIdentificationAuditory,
  settingsComponent: ChordIdentificationAuditorySettingsComponent,
  defaultSettings: defaultChordIdentificationAuditorySettings,
  inputMethods: ['buttons'],
});

export {
  ChordDrawing,
  ChordDrawingSettingsComponent,
  ChordIdentificationVisual,
  ChordIdentificationVisualSettingsComponent,
  ChordIdentificationAuditory,
  ChordIdentificationAuditorySettingsComponent,
};
