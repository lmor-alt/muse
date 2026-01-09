import { registerExercise } from '../registry';
import type {
  IntervalIdentificationSettings,
  IntervalReadingSettings,
  IntervalDrawingSettings,
  IntervalQuizSettings,
} from '../../types';
import { IntervalIdentification } from './IntervalIdentification';
import { IntervalIdentificationSettings as IntervalIdentificationSettingsComponent } from './IntervalIdentificationSettings';
import { IntervalReading } from './IntervalReading';
import { IntervalReadingSettings as IntervalReadingSettingsComponent } from './IntervalReadingSettings';
import { IntervalDrawing } from './IntervalDrawing';
import { IntervalDrawingSettings as IntervalDrawingSettingsComponent } from './IntervalDrawingSettings';
import { IntervalQuiz } from './IntervalQuiz';
import { IntervalQuizSettings as IntervalQuizSettingsComponent } from './IntervalQuizSettings';
import { ALL_INTERVALS } from '../../utils/musicTheory';

// Default settings for Interval Identification
const defaultIntervalIdentificationSettings: IntervalIdentificationSettings = {
  questionCount: 10,
  timeLimit: null,
  replayLimit: 3,
  intervals: ALL_INTERVALS.filter((i) => i.semitones <= 7), // Up to perfect 5th
  melodicOrHarmonic: 'melodic',
  direction: 'ascending',
  noteGap: 600, // milliseconds between notes in melodic mode
  octaveSpan: 1, // default to single octave
};

// Default settings for Interval Reading
const defaultIntervalReadingSettings: IntervalReadingSettings = {
  questionCount: 10,
  timeLimit: null,
  replayLimit: null,
  intervals: ALL_INTERVALS.filter((i) => i.semitones <= 7 && i.semitones > 0),
  clef: 'treble',
  direction: 'above',
  octaveSpan: 1, // default to single octave
};

// Default settings for Interval Drawing
const defaultIntervalDrawingSettings: IntervalDrawingSettings = {
  questionCount: 10,
  timeLimit: null,
  replayLimit: null,
  intervals: ALL_INTERVALS.filter((i) => i.semitones <= 7 && i.semitones > 0),
  direction: 'above',
  octaveSpan: 1, // default to single octave
};

// Default settings for Interval Quiz
const defaultIntervalQuizSettings: IntervalQuizSettings = {
  questionCount: 10,
  timeLimit: null,
  replayLimit: 3,
  modules: ['ear', 'read', 'write'],
  intervals: ALL_INTERVALS.filter((i) => i.semitones <= 7 && i.semitones > 0),
  octaveSpan: 1, // default to single octave
  melodicOrHarmonic: 'melodic',
  noteGap: 600,
  readingClef: 'treble',
  writingDirection: 'above',
  distribution: 'equal',
};

// Register Interval Identification
registerExercise({
  id: 'interval-identification',
  categoryId: 'intervals',
  nameKey: 'exercise.interval-identification',
  descriptionKey: 'exercise.interval-identification.desc',
  component: IntervalIdentification,
  settingsComponent: IntervalIdentificationSettingsComponent,
  defaultSettings: defaultIntervalIdentificationSettings,
  inputMethods: ['buttons'],
});

// Register Interval Reading
registerExercise({
  id: 'interval-reading',
  categoryId: 'intervals',
  nameKey: 'exercise.interval-reading',
  descriptionKey: 'exercise.interval-reading.desc',
  component: IntervalReading,
  settingsComponent: IntervalReadingSettingsComponent,
  defaultSettings: defaultIntervalReadingSettings,
  inputMethods: ['buttons'],
});

// Register Interval Drawing
registerExercise({
  id: 'interval-drawing',
  categoryId: 'intervals',
  nameKey: 'exercise.interval-drawing',
  descriptionKey: 'exercise.interval-drawing.desc',
  component: IntervalDrawing,
  settingsComponent: IntervalDrawingSettingsComponent,
  defaultSettings: defaultIntervalDrawingSettings,
  inputMethods: ['staff'],
});

// Register Interval Quiz
registerExercise({
  id: 'interval-quiz',
  categoryId: 'intervals',
  nameKey: 'exercise.interval-quiz',
  descriptionKey: 'exercise.interval-quiz.desc',
  component: IntervalQuiz,
  settingsComponent: IntervalQuizSettingsComponent,
  defaultSettings: defaultIntervalQuizSettings,
  inputMethods: ['buttons'],
});

export {
  IntervalIdentification,
  IntervalIdentificationSettingsComponent,
  IntervalReading,
  IntervalReadingSettingsComponent,
  IntervalDrawing,
  IntervalDrawingSettingsComponent,
  IntervalQuiz,
  IntervalQuizSettingsComponent,
};
