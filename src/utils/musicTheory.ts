import type { Note, NoteName, Accidental, Interval, IntervalQuality, ChordQuality, NoteRange } from '../types';

// Semitone distances from C
const SEMITONES_FROM_C: Record<NoteName, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};

// All intervals with their properties
export const ALL_INTERVALS: Interval[] = [
  { quality: 'perfect', number: 1, semitones: 0 },
  { quality: 'minor', number: 2, semitones: 1 },
  { quality: 'major', number: 2, semitones: 2 },
  { quality: 'minor', number: 3, semitones: 3 },
  { quality: 'major', number: 3, semitones: 4 },
  { quality: 'perfect', number: 4, semitones: 5 },
  { quality: 'augmented', number: 4, semitones: 6 }, // tritone
  { quality: 'perfect', number: 5, semitones: 7 },
  { quality: 'minor', number: 6, semitones: 8 },
  { quality: 'major', number: 6, semitones: 9 },
  { quality: 'minor', number: 7, semitones: 10 },
  { quality: 'major', number: 7, semitones: 11 },
  { quality: 'perfect', number: 8, semitones: 12 },
];

// Convert note to absolute pitch (semitones from C0)
export function noteToSemitones(note: Note): number {
  let semitones = note.octave * 12 + SEMITONES_FROM_C[note.name];
  if (note.accidental === 'sharp') semitones += 1;
  if (note.accidental === 'flat') semitones -= 1;
  return semitones;
}

// Convert semitones back to note (prefers naturals, then sharps)
export function semitonesToNote(semitones: number): Note {
  const octave = Math.floor(semitones / 12);
  const pitchClass = ((semitones % 12) + 12) % 12;

  // Map pitch class to note
  const noteMap: { name: NoteName; accidental: Accidental }[] = [
    { name: 'C', accidental: 'natural' },
    { name: 'C', accidental: 'sharp' },
    { name: 'D', accidental: 'natural' },
    { name: 'D', accidental: 'sharp' },
    { name: 'E', accidental: 'natural' },
    { name: 'F', accidental: 'natural' },
    { name: 'F', accidental: 'sharp' },
    { name: 'G', accidental: 'natural' },
    { name: 'G', accidental: 'sharp' },
    { name: 'A', accidental: 'natural' },
    { name: 'A', accidental: 'sharp' },
    { name: 'B', accidental: 'natural' },
  ];

  const { name, accidental } = noteMap[pitchClass];
  return { name, octave, accidental };
}

// Calculate interval between two notes
export function getInterval(note1: Note, note2: Note): Interval {
  const semitones = Math.abs(noteToSemitones(note2) - noteToSemitones(note1)) % 12;
  const interval = ALL_INTERVALS.find((i) => i.semitones === semitones);
  return interval || { quality: 'perfect', number: 1, semitones: 0 };
}

// Apply interval to a note
export function applyInterval(note: Note, interval: Interval, direction: 'above' | 'below'): Note {
  const baseSemitones = noteToSemitones(note);
  const newSemitones = direction === 'above'
    ? baseSemitones + interval.semitones
    : baseSemitones - interval.semitones;
  return semitonesToNote(newSemitones);
}

// Check if two notes are enharmonically equivalent
export function areEnharmonic(note1: Note, note2: Note): boolean {
  return noteToSemitones(note1) === noteToSemitones(note2);
}

// Check if a chord is correct (allowing enharmonic equivalents)
export function isChordCorrect(drawnNotes: Note[], correctNotes: Note[]): boolean {
  if (drawnNotes.length !== correctNotes.length) return false;

  // Sort both by semitones
  const drawnSorted = [...drawnNotes].sort((a, b) => noteToSemitones(a) - noteToSemitones(b));
  const correctSorted = [...correctNotes].sort((a, b) => noteToSemitones(a) - noteToSemitones(b));

  return drawnSorted.every((note, i) => areEnharmonic(note, correctSorted[i]));
}

// Get note count required for chord type
export function getChordNoteCount(quality: ChordQuality): number {
  switch (quality) {
    case 'major7':
    case 'minor7':
    case 'dominant7':
      return 4;
    default:
      return 3;
  }
}

// Get chord abbreviation (always English: Maj, min, dim, aug, Maj7, min7, dom7)
export function getChordAbbreviation(quality: ChordQuality): string {
  const abbreviations: Record<ChordQuality, string> = {
    major: 'Maj',
    minor: 'min',
    diminished: 'dim',
    augmented: 'aug',
    major7: 'Maj7',
    minor7: 'min7',
    dominant7: 'dom7',
  };
  return abbreviations[quality];
}

// Generate random note within range
export function randomNoteInRange(range: NoteRange, includeAccidentals: boolean): Note {
  const lowSemitones = noteToSemitones(range.low);
  const highSemitones = noteToSemitones(range.high);

  let semitones: number;
  let note: Note;

  do {
    semitones = lowSemitones + Math.floor(Math.random() * (highSemitones - lowSemitones + 1));
    note = semitonesToNote(semitones);
  } while (!includeAccidentals && note.accidental !== 'natural');

  // If it's an accidental, randomly choose between sharp and flat representation
  if (includeAccidentals && note.accidental === 'sharp' && Math.random() > 0.5) {
    note = sharpToFlat(note);
  }

  return note;
}

// Convert a sharp note to its enharmonic flat equivalent
export function sharpToFlat(note: Note): Note {
  if (note.accidental !== 'sharp') return note;

  const sharpToFlatMap: Record<NoteName, { name: NoteName; octaveAdjust: number }> = {
    'C': { name: 'D', octaveAdjust: 0 },  // C# -> Db
    'D': { name: 'E', octaveAdjust: 0 },  // D# -> Eb
    'F': { name: 'G', octaveAdjust: 0 },  // F# -> Gb
    'G': { name: 'A', octaveAdjust: 0 },  // G# -> Ab
    'A': { name: 'B', octaveAdjust: 0 },  // A# -> Bb
    'E': { name: 'F', octaveAdjust: 0 },  // E# -> F (rare, but handle)
    'B': { name: 'C', octaveAdjust: 1 },  // B# -> C (rare, but handle)
  };

  const mapping = sharpToFlatMap[note.name];
  return {
    name: mapping.name,
    octave: note.octave + mapping.octaveAdjust,
    accidental: 'flat',
  };
}

// Compare two notes for equality
export function notesEqual(note1: Note, note2: Note): boolean {
  return (
    note1.name === note2.name &&
    note1.octave === note2.octave &&
    note1.accidental === note2.accidental
  );
}

// Get display name for interval
export function getIntervalKey(interval: Interval): string {
  const qualityMap: Record<IntervalQuality, string> = {
    minor: 'minor',
    major: 'major',
    perfect: 'perfect',
    augmented: 'augmented',
    diminished: 'diminished',
  };

  if (interval.number === 4 && interval.semitones === 6) {
    return 'interval.tritone';
  }

  return `interval.${qualityMap[interval.quality]}${interval.number}`;
}

// Get short abbreviation for interval without direction (e.g., "M2" for major 2nd)
export function getIntervalAbbreviation(
  interval: Interval,
  language: 'en' | 'nl'
): string {
  // Tritone special case
  if (interval.number === 4 && interval.semitones === 6) {
    return 'tt';
  }

  if (language === 'nl') {
    // Dutch: k=klein, G=groot, r=rein, o=octaaf, p=prime
    const qualitySymbol: Record<IntervalQuality, string> = {
      minor: 'k',      // klein
      major: 'G',      // groot
      perfect: 'r',    // rein
      augmented: '+',
      diminished: 'v', // verminderd
    };
    // Special cases for Dutch
    if (interval.number === 1) return 'p1';  // prime
    if (interval.number === 8) return 'o8';  // octaaf
    return `${qualitySymbol[interval.quality]}${interval.number}`;
  } else {
    // English: m=minor, M=major, P=perfect
    const qualitySymbol: Record<IntervalQuality, string> = {
      minor: 'm',
      major: 'M',
      perfect: 'P',
      augmented: 'A',
      diminished: 'd',
    };
    return `${qualitySymbol[interval.quality]}${interval.number}`;
  }
}

// Get short symbol for interval with direction (e.g., "M2↑" for major 2nd ascending)
export function getIntervalSymbol(
  interval: Interval,
  direction: 'above' | 'below',
  language: 'en' | 'nl'
): string {
  const arrow = direction === 'above' ? '↑' : '↓';
  return `${getIntervalAbbreviation(interval, language)}${arrow}`;
}

// Generate intelligent distractors for intervals
export function getIntervalDistractors(correct: Interval, count: number): Interval[] {
  const distractors: Interval[] = [];
  const confusionPairs: [number, number][] = [
    [3, 4], // minor/major 3rd
    [1, 2], // minor/major 2nd
    [5, 7], // perfect 4th/5th
    [8, 9], // minor/major 6th
    [10, 11], // minor/major 7th
  ];

  // First, add commonly confused intervals
  for (const [a, b] of confusionPairs) {
    if (correct.semitones === a) {
      const confused = ALL_INTERVALS.find((i) => i.semitones === b);
      if (confused && distractors.length < count) distractors.push(confused);
    } else if (correct.semitones === b) {
      const confused = ALL_INTERVALS.find((i) => i.semitones === a);
      if (confused && distractors.length < count) distractors.push(confused);
    }
  }

  // Fill remaining with nearby intervals
  const sorted = [...ALL_INTERVALS].sort(
    (a, b) => Math.abs(a.semitones - correct.semitones) - Math.abs(b.semitones - correct.semitones)
  );

  for (const interval of sorted) {
    if (distractors.length >= count) break;
    if (interval.semitones !== correct.semitones && !distractors.some((d) => d.semitones === interval.semitones)) {
      distractors.push(interval);
    }
  }

  return distractors.slice(0, count);
}

// Generate intelligent distractors for chords
export function getChordDistractors(
  correctQuality: ChordQuality,
  count: number,
  availableQualities?: ChordQuality[]
): ChordQuality[] {
  const allQualities: ChordQuality[] = availableQualities && availableQualities.length > 1
    ? availableQualities
    : ['major', 'minor', 'diminished', 'augmented', 'major7', 'minor7', 'dominant7'];

  const confusionPairs: [ChordQuality, ChordQuality][] = [
    ['major', 'minor'],
    ['major7', 'dominant7'],
    ['minor7', 'dominant7'],
    ['diminished', 'minor'],
  ];

  const distractors: ChordQuality[] = [];

  // Add confused pairs first (only if both are in available qualities)
  for (const [a, b] of confusionPairs) {
    if (correctQuality === a && distractors.length < count && allQualities.includes(b)) {
      distractors.push(b);
    } else if (correctQuality === b && distractors.length < count && allQualities.includes(a)) {
      distractors.push(a);
    }
  }

  // Fill with random others from available qualities
  const remaining = allQualities.filter((q) => q !== correctQuality && !distractors.includes(q));
  while (distractors.length < count && remaining.length > 0) {
    const idx = Math.floor(Math.random() * remaining.length);
    distractors.push(remaining.splice(idx, 1)[0]);
  }

  return distractors.slice(0, count);
}

// Shuffle array
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Format time (seconds to mm:ss)
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
