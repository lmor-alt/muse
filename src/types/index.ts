// Core type definitions for the Music Theory Practice App

// ============ Language ============
export type Language = 'en' | 'nl';

export type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type SolfegeName = 'do' | 're' | 'mi' | 'fa' | 'sol' | 'la' | 'si';

// ============ Music Theory ============
export type Accidental = 'natural' | 'sharp' | 'flat';
export type Clef = 'treble' | 'bass';

export interface Note {
  name: NoteName;
  octave: number;
  accidental: Accidental;
}

export interface NoteRange {
  low: Note;
  high: Note;
}

export type IntervalQuality = 'minor' | 'major' | 'perfect' | 'augmented' | 'diminished';
export type IntervalNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Interval {
  quality: IntervalQuality;
  number: IntervalNumber;
  semitones: number;
}

export type ChordQuality = 'major' | 'minor' | 'diminished' | 'augmented' | 'major7' | 'minor7' | 'dominant7';

export interface Chord {
  root: Note;
  quality: ChordQuality;
  inversion: 0 | 1 | 2 | 3;
}

// ============ Rhythm ============
export type RhythmValue = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth';

export interface RhythmEvent {
  value: RhythmValue;
  isRest: boolean;
}

export type TimeSignature = [4, 4] | [3, 4] | [2, 4];

// ============ Exercise System ============
export type CategoryId = 'pitch-notes' | 'intervals' | 'chords' | 'rhythm';

export interface Category {
  id: CategoryId;
  nameKey: string;
  icon: string;
  exercises: ExerciseId[];
}

export type ExerciseId =
  | 'note-identification'
  | 'pitch-hearing'
  | 'higher-or-lower'
  | 'interval-identification'
  | 'interval-reading'
  | 'interval-drawing'
  | 'interval-quiz'
  | 'chord-drawing'
  | 'chord-identification-visual'
  | 'chord-identification-auditory'
  | 'rhythm-transcription';

export interface ExerciseDefinition {
  id: ExerciseId;
  categoryId: CategoryId;
  nameKey: string;
  descriptionKey: string;
  component: React.ComponentType<ExerciseProps>;
  settingsComponent: React.ComponentType<ExerciseSettingsProps>;
  defaultSettings: ExerciseSettings;
  inputMethods: InputMethod[];
}

export type InputMethod = 'piano' | 'buttons' | 'staff';

// ============ Exercise Settings ============
export interface BaseExerciseSettings {
  questionCount: number | 'endless';
  timeLimit: number | null; // seconds, null = no limit
  replayLimit: number | null; // null = unlimited
}

export interface NoteIdentificationSettings extends BaseExerciseSettings {
  clef: Clef | 'both';
  noteRange: NoteRange;
  includeAccidentals: boolean;
  accidentalTypes: Accidental[];
}

export interface PitchHearingSettings extends BaseExerciseSettings {
  noteRange: NoteRange;
  includeAccidentals: boolean;
}

export interface HigherOrLowerSettings extends BaseExerciseSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  noteRange: NoteRange;
}

export interface IntervalIdentificationSettings extends BaseExerciseSettings {
  intervals: Interval[];
  melodicOrHarmonic: 'melodic' | 'harmonic' | 'both';
  direction: 'ascending' | 'descending' | 'both';
  noteGap: number; // milliseconds between notes in melodic mode
  octaveSpan: number; // max octaves between notes (1 = within single octave)
}

export interface IntervalReadingSettings extends BaseExerciseSettings {
  intervals: Interval[];
  clef: Clef | 'both';
  direction: 'above' | 'below' | 'both';
  octaveSpan: number; // max octaves between notes (1 = within single octave)
}

export interface IntervalDrawingSettings extends BaseExerciseSettings {
  intervals: Interval[];
  direction: 'above' | 'below' | 'both';
  octaveSpan: number; // max octaves between notes (1 = within single octave)
}

export type IntervalQuizModule = 'ear' | 'read' | 'write';

export interface IntervalQuizSettings extends BaseExerciseSettings {
  // Module selection
  modules: IntervalQuizModule[];
  // Shared settings
  intervals: Interval[];
  octaveSpan: number; // max octaves between notes (1 = within single octave)
  // Ear training settings
  melodicOrHarmonic: 'melodic' | 'harmonic' | 'both';
  noteGap: number;
  // Reading settings
  readingClef: Clef | 'both';
  // Writing settings
  writingDirection: 'above' | 'below' | 'both';
  // Distribution (percentages that sum to 100)
  distribution: 'equal' | 'custom';
  customDistribution?: { ear: number; read: number; write: number };
}

export interface ChordDrawingSettings extends BaseExerciseSettings {
  chordTypes: ChordQuality[];
  includeInversions: boolean;
}

export interface ChordIdentificationVisualSettings extends BaseExerciseSettings {
  chordTypes: ChordQuality[];
  includeInversions: boolean;
}

export interface ChordIdentificationAuditorySettings extends BaseExerciseSettings {
  chordTypes: ChordQuality[];
  voicing: 'harmonic' | 'melodic';
  includeInversions: boolean;
  difficulty: 'easy' | 'hard'; // easy = quality only, hard = root + quality
}

export interface RhythmTranscriptionSettings extends BaseExerciseSettings {
  timeSignature: [4, 4] | [3, 4] | [2, 4];
  bars: number;
  includeRests: boolean;
  noteValues: RhythmValue[]; // Which note values to include in generated rhythms
  tempo: number; // BPM for playback
}

export type ExerciseSettings =
  | NoteIdentificationSettings
  | PitchHearingSettings
  | HigherOrLowerSettings
  | IntervalIdentificationSettings
  | IntervalReadingSettings
  | IntervalDrawingSettings
  | IntervalQuizSettings
  | ChordDrawingSettings
  | ChordIdentificationVisualSettings
  | ChordIdentificationAuditorySettings
  | RhythmTranscriptionSettings;

// ============ Exercise State ============
export interface ExerciseState {
  currentQuestion: number;
  totalQuestions: number | 'endless';
  score: number;
  streak: number;
  bestStreak: number;
  answers: AnswerRecord[];
  startTime: number;
  isComplete: boolean;
  isPracticeMode: boolean;
}

export interface AnswerRecord {
  questionIndex: number;
  correct: boolean;
  userAnswer: unknown;
  correctAnswer: unknown;
  timeSpent: number;
  skipped: boolean;
}

// ============ Component Props ============
export interface ExerciseProps {
  settings: ExerciseSettings;
  state: ExerciseState;
  onAnswer: (correct: boolean, userAnswer: unknown, correctAnswer: unknown) => void;
  onSkip: () => void;
  onComplete: () => void;
  onQuit: () => void;
  inputMethod: InputMethod;
}

export interface ExerciseSettingsProps {
  settings: ExerciseSettings;
  onChange: (settings: ExerciseSettings) => void;
  isPracticeMode?: boolean;
}

// ============ Global Settings ============
export interface GlobalSettings {
  language: Language;
  soundEnabled: boolean;
  volume: number;
  pianoKeySounds: boolean;
  defaultInputMethod: InputMethod;
}

// ============ Persistence ============
export interface PersistedData {
  globalSettings: GlobalSettings;
  exerciseSettings: Record<ExerciseId, ExerciseSettings>;
  streakRecords: Record<ExerciseId, number>;
  stats: Record<ExerciseId, ExerciseStats>;
}

export interface ExerciseStats {
  totalAttempts: number;
  correctAnswers: number;
  bestStreak: number;
  lastPlayed: number;
}
