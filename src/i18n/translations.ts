import type { Language, NoteName } from '../types';

export type TranslationKey = keyof typeof translations.en;

const translations = {
  en: {
    // App
    appName: 'Muse',

    // Navigation
    home: 'Home',
    back: 'Back',
    settings: 'Settings',

    // Categories
    'category.pitch-notes': 'Pitch & Notes',
    'category.intervals': 'Intervals',
    'category.chords': 'Chords',
    'category.rhythm': 'Rhythm',

    // Exercises
    'exercise.note-identification': 'Note Identification',
    'exercise.note-identification.desc': 'Identify notes on the staff',
    'exercise.pitch-hearing': 'Pitch Hearing',
    'exercise.pitch-hearing.desc': 'Identify notes by ear',
    'exercise.higher-or-lower': 'Higher or Lower',
    'exercise.higher-or-lower.desc': 'Compare two pitches',
    'exercise.interval-identification': 'Interval Identification',
    'exercise.interval-identification.desc': 'Identify intervals by ear',
    'exercise.interval-reading': 'Interval Reading',
    'exercise.interval-reading.desc': 'Identify intervals on the staff',
    'exercise.interval-drawing': 'Interval Drawing',
    'exercise.interval-drawing.desc': 'Draw intervals on the staff',
    'exercise.interval-quiz': 'Interval Quiz',
    'exercise.interval-quiz.desc': 'Test all interval skills',
    'exercise.chord-drawing': 'Chord Drawing',
    'exercise.chord-drawing.desc': 'Draw chords on the staff',
    'exercise.chord-identification-visual': 'Chord Identification (Visual)',
    'exercise.chord-identification-visual.desc': 'Identify chords on the staff',
    'exercise.chord-identification-auditory': 'Chord Identification (Auditory)',
    'exercise.chord-identification-auditory.desc': 'Identify chords by ear',
    'exercise.rhythm-transcription': 'Rhythm Transcription',
    'exercise.rhythm-transcription.desc': 'Transcribe rhythmic patterns',

    // Notes (English)
    'note.C': 'C',
    'note.D': 'D',
    'note.E': 'E',
    'note.F': 'F',
    'note.G': 'G',
    'note.A': 'A',
    'note.B': 'B',

    // Accidentals
    'accidental.natural': 'Natural',
    'accidental.sharp': 'Sharp',
    'accidental.flat': 'Flat',

    // Intervals
    'interval.perfect1': 'Unison',
    'interval.minor2': 'Minor 2nd',
    'interval.major2': 'Major 2nd',
    'interval.minor3': 'Minor 3rd',
    'interval.major3': 'Major 3rd',
    'interval.perfect4': 'Perfect 4th',
    'interval.augmented4': 'Tritone',
    'interval.tritone': 'Tritone',
    'interval.perfect5': 'Perfect 5th',
    'interval.minor6': 'Minor 6th',
    'interval.major6': 'Major 6th',
    'interval.minor7': 'Minor 7th',
    'interval.major7': 'Major 7th',
    'interval.perfect8': 'Octave',

    // Chords
    'chord.major': 'Major',
    'chord.minor': 'Minor',
    'chord.diminished': 'Diminished',
    'chord.augmented': 'Augmented',
    'chord.major7': 'Major 7th',
    'chord.minor7': 'Minor 7th',
    'chord.dominant7': 'Dominant 7th',
    'chord.selectRoot': 'Select root',
    'chord.selectQuality': 'Select quality',

    // Clefs
    'clef.treble': 'Treble',
    'clef.bass': 'Bass',
    'clef.both': 'Both',

    // Settings labels
    'settings.language': 'Language',
    'settings.sound': 'Sound',
    'settings.volume': 'Volume',
    'settings.pianoKeySounds': 'Piano key sounds',
    'settings.inputMethod': 'Input method',
    'settings.showCorrectAnswer': 'Show correct answer',
    'settings.clef': 'Clef',
    'settings.noteRange': 'Note range',
    'settings.includeAccidentals': 'Include accidentals',
    'settings.questionCount': 'Questions',
    'settings.timeLimit': 'Time limit',
    'settings.replayLimit': 'Replay limit',
    'settings.noteGap': 'Gap between notes',
    'settings.difficulty': 'Difficulty',
    'settings.intervals': 'Intervals',
    'settings.selectIntervals': 'Select Intervals',
    'settings.melodicHarmonic': 'Presentation',
    'settings.direction': 'Direction',
    'settings.chordTypes': 'Chord types',
    'settings.includeInversions': 'Include inversions',
    'settings.voicing': 'Voicing',
    'settings.timeSignature': 'Time signature',
    'settings.bars': 'Bars',
    'settings.tempo': 'Tempo',
    'settings.noteValues': 'Note values',
    'settings.includeRests': 'Include rests',

    // Rhythm note values
    'rhythm.whole': 'Whole',
    'rhythm.half': 'Half',
    'rhythm.quarter': 'Quarter',
    'rhythm.eighth': 'Eighth',
    'rhythm.sixteenth': 'Sixteenth',
    'rhythm.rest': 'Rest',
    'rhythm.note': 'Note',
    'rhythm.bpm': 'BPM',
    'rhythm.metronome': 'Metronome',
    'rhythm.beats': 'beats',
    'rhythm.addNote': 'Add Note',
    'rhythm.undo': 'Undo',
    'settings.modules': 'Modules',
    'settings.advancedSettings': 'Advanced Settings',
    'settings.readingClef': 'Reading Clef',
    'settings.writingDirection': 'Writing Direction',
    'settings.distribution': 'Distribution',
    'settings.octaveSpan': 'Octave Span',
    'value.octave': 'octave',
    'value.octaves': 'octaves',

    // Actions
    'action.selectAll': 'All',
    'action.selectNone': 'None',

    // Settings values
    'value.on': 'On',
    'value.off': 'Off',
    'value.unlimited': 'Unlimited',
    'value.endless': 'Endless',
    'value.piano': 'Piano',
    'value.buttons': 'Buttons',
    'value.staff': 'Staff',
    'value.melodic': 'Melodic (sequentially)',
    'value.harmonic': 'Harmonic (simultaneously)',
    'value.both': 'Both',
    'value.ascending': 'Ascending',
    'value.descending': 'Descending',
    'value.above': 'Above',
    'value.below': 'Below',
    'value.block': 'Block',
    'value.arpeggiated': 'Arpeggiated',
    'value.easy': 'Easy',
    'value.medium': 'Medium',
    'value.hard': 'Hard',
    'value.eighth': 'Eighth notes',
    'value.sixteenth': 'Sixteenth notes',
    'value.yes': 'Yes',
    'value.no': 'No',
    'value.treble': 'Treble',
    'value.bass': 'Bass',
    'value.equal': 'Equal',
    'value.custom': 'Custom',

    // Game UI
    'game.question': 'Question',
    'game.of': 'of',
    'game.score': 'Score',
    'game.streak': 'Streak',
    'game.best': 'Best',
    'game.skip': 'Skip',
    'game.submit': 'Submit',
    'game.next': 'Next',
    'game.quit': 'End Session',
    'game.replay': 'Replay',
    'game.reference': 'Reference Pitch',
    'game.clear': 'Clear',
    'game.startExercise': 'Start',
    'game.practiceMode': 'Practice Mode',
    'game.quizMode': 'Quiz Mode',

    // Quiz modules
    'quiz.module.ear': 'Ear Training',
    'quiz.module.read': 'Reading',
    'quiz.module.write': 'Writing',

    // Feedback
    'feedback.correct': 'Correct!',
    'feedback.incorrect': 'Incorrect',
    'feedback.skipped': 'Skipped',
    'feedback.why': 'Why?',
    'feedback.theAnswerWas': 'The answer was',

    // Results
    'results.title': 'Results',
    'results.score': 'Score',
    'results.accuracy': 'Accuracy',
    'results.time': 'Time',
    'results.bestStreak': 'Best Streak',
    'results.viewDetails': 'View Details',
    'results.hideDetails': 'Hide Details',
    'results.tryAgain': 'Try Again',
    'results.backToExercises': 'Back to Exercises',
    'results.newRecord': 'New Record!',

    // Directions
    'direction.higher': 'Higher',
    'direction.lower': 'Lower',
    'exercise.higher': 'Higher',
    'exercise.lower': 'Lower',
    'exercise.firstNote': 'First note',
    'exercise.secondNote': 'Second note',
    'exercise.previousNote': 'Previous note',
    'exercise.currentNote': 'Current note',
    'exercise.previous': 'Previous',
    'exercise.current': 'Current',
    'exercise.replayPrevious': 'Replay previous',
    'exercise.preview': 'Preview',
    'exercise.yourAnswer': 'Your Answer',
    'exercise.playCurrent': 'Play current',
    'exercise.replay': 'Replay',
    'exercise.referencePitch': 'Reference Pitch',

    // Settings values (aliases)
    'settings.endless': 'Endless',
    'settings.unlimited': 'Unlimited',
    'settings.easy': 'Easy',
    'settings.medium': 'Medium',
    'settings.hard': 'Hard',

    // Instructions
    'instruction.identifyNote': 'Identify this note',
    'instruction.identifyPitch': 'What note is this?',
    'instruction.hearFirstPitch': 'Press to hear the first pitch',
    'instruction.hearSecondPitch': 'Now press to hear the second pitch',
    'instruction.hearNextPitch': 'Press to hear the next pitch',
    'instruction.higherOrLower': 'Is the second note higher or lower?',
    'instruction.identifyInterval': 'What interval is this?',
    'instruction.identifyIntervalVisual': 'What interval do you see?',
    'instruction.identifyThird': 'Major or minor third?',
    'instruction.drawInterval': 'Draw a {interval} {direction} from this note',
    'instruction.drawChord': 'Draw {chord}',
    'instruction.identifyChord': 'What chord is this?',
    'instruction.transcribeRhythm': 'Transcribe the rhythm you hear',

    // Errors
    'error.audioRequired': 'Audio is required for this exercise. Please check your browser permissions.',
    'error.audioFailed': 'Failed to play audio. Please try again.',
  },
  nl: {
    // App
    appName: 'Muse',

    // Navigation
    home: 'Home',
    back: 'Terug',
    settings: 'Instellingen',

    // Categories
    'category.pitch-notes': 'Toonhoogte & Noten',
    'category.intervals': 'Intervallen',
    'category.chords': 'Akkoorden',
    'category.rhythm': 'Ritme',

    // Exercises
    'exercise.note-identification': 'Noten Herkennen',
    'exercise.note-identification.desc': 'Herken noten op de notenbalk',
    'exercise.pitch-hearing': 'Toonhoogte Horen',
    'exercise.pitch-hearing.desc': 'Herken noten op gehoor',
    'exercise.higher-or-lower': 'Hoger of Lager',
    'exercise.higher-or-lower.desc': 'Vergelijk twee tonen',
    'exercise.interval-identification': 'Intervallen Herkennen',
    'exercise.interval-identification.desc': 'Herken intervallen op gehoor',
    'exercise.interval-reading': 'Intervallen Lezen',
    'exercise.interval-reading.desc': 'Herken intervallen op de notenbalk',
    'exercise.interval-drawing': 'Intervallen Tekenen',
    'exercise.interval-drawing.desc': 'Teken intervallen op de notenbalk',
    'exercise.interval-quiz': 'Interval Quiz',
    'exercise.interval-quiz.desc': 'Test alle interval vaardigheden',
    'exercise.chord-drawing': 'Akkoorden Tekenen',
    'exercise.chord-drawing.desc': 'Teken akkoorden op de notenbalk',
    'exercise.chord-identification-visual': 'Akkoorden Herkennen (Visueel)',
    'exercise.chord-identification-visual.desc': 'Herken akkoorden op de notenbalk',
    'exercise.chord-identification-auditory': 'Akkoorden Herkennen (Gehoor)',
    'exercise.chord-identification-auditory.desc': 'Herken akkoorden op gehoor',
    'exercise.rhythm-transcription': 'Ritme Transcriptie',
    'exercise.rhythm-transcription.desc': 'Schrijf ritmische patronen over',

    // Notes (Solfège - Fixed Do)
    'note.C': 'do',
    'note.D': 're',
    'note.E': 'mi',
    'note.F': 'fa',
    'note.G': 'sol',
    'note.A': 'la',
    'note.B': 'si',

    // Accidentals
    'accidental.natural': 'Herstellingsteken',
    'accidental.sharp': 'Kruis',
    'accidental.flat': 'Mol',

    // Intervals
    'interval.perfect1': 'Prime',
    'interval.minor2': 'Kleine secunde',
    'interval.major2': 'Grote secunde',
    'interval.minor3': 'Kleine terts',
    'interval.major3': 'Grote terts',
    'interval.perfect4': 'Reine kwart',
    'interval.augmented4': 'Tritonus',
    'interval.tritone': 'Tritonus',
    'interval.perfect5': 'Reine kwint',
    'interval.minor6': 'Kleine sext',
    'interval.major6': 'Grote sext',
    'interval.minor7': 'Kleine septiem',
    'interval.major7': 'Grote septiem',
    'interval.perfect8': 'Octaaf',

    // Chords
    'chord.major': 'Majeur',
    'chord.minor': 'Mineur',
    'chord.diminished': 'Verminderd',
    'chord.augmented': 'Overmatig',
    'chord.major7': 'Majeur septiem',
    'chord.minor7': 'Mineur septiem',
    'chord.dominant7': 'Dominant septiem',
    'chord.selectRoot': 'Kies grondtoon',
    'chord.selectQuality': 'Kies kwaliteit',

    // Clefs
    'clef.treble': 'Vioolsleutel',
    'clef.bass': 'Bassleutel',
    'clef.both': 'Beide',

    // Settings labels
    'settings.language': 'Taal',
    'settings.sound': 'Geluid',
    'settings.volume': 'Volume',
    'settings.pianoKeySounds': 'Pianotoets geluiden',
    'settings.inputMethod': 'Invoermethode',
    'settings.showCorrectAnswer': 'Toon juiste antwoord',
    'settings.clef': 'Sleutel',
    'settings.noteRange': 'Notenbereik',
    'settings.includeAccidentals': 'Inclusief voortekens',
    'settings.questionCount': 'Vragen',
    'settings.timeLimit': 'Tijdslimiet',
    'settings.replayLimit': 'Herhaal limiet',
    'settings.noteGap': 'Tijd tussen noten',
    'settings.difficulty': 'Moeilijkheid',
    'settings.intervals': 'Intervallen',
    'settings.selectIntervals': 'Selecteer Intervallen',
    'settings.melodicHarmonic': 'Presentatie',
    'settings.direction': 'Richting',
    'settings.chordTypes': 'Akkoord types',
    'settings.includeInversions': 'Inclusief omkeringen',
    'settings.voicing': 'Stemvoering',
    'settings.timeSignature': 'Maatsoort',
    'settings.bars': 'Maten',
    'settings.tempo': 'Tempo',
    'settings.noteValues': 'Nootwaarden',
    'settings.includeRests': 'Inclusief rusten',

    // Rhythm note values
    'rhythm.whole': 'Hele',
    'rhythm.half': 'Halve',
    'rhythm.quarter': 'Kwart',
    'rhythm.eighth': 'Achtste',
    'rhythm.sixteenth': 'Zestiende',
    'rhythm.rest': 'Rust',
    'rhythm.note': 'Noot',
    'rhythm.bpm': 'BPM',
    'rhythm.metronome': 'Metronoom',
    'rhythm.beats': 'tellen',
    'rhythm.addNote': 'Noot Toevoegen',
    'rhythm.undo': 'Ongedaan maken',
    'settings.modules': 'Modules',
    'settings.advancedSettings': 'Geavanceerde Instellingen',
    'settings.readingClef': 'Lees Sleutel',
    'settings.writingDirection': 'Schrijfrichting',
    'settings.distribution': 'Verdeling',
    'settings.octaveSpan': 'Octaafbereik',
    'value.octave': 'octaaf',
    'value.octaves': 'octaven',

    // Actions
    'action.selectAll': 'Alles',
    'action.selectNone': 'Geen',

    // Settings values
    'value.on': 'Aan',
    'value.off': 'Uit',
    'value.unlimited': 'Onbeperkt',
    'value.endless': 'Eindeloos',
    'value.piano': 'Piano',
    'value.buttons': 'Knoppen',
    'value.staff': 'Notenbalk',
    'value.melodic': 'Melodisch (achtereenvolgens)',
    'value.harmonic': 'Harmonisch (gelijktijdig)',
    'value.both': 'Beide',
    'value.ascending': 'Stijgend',
    'value.descending': 'Dalend',
    'value.above': 'Boven',
    'value.below': 'Onder',
    'value.block': 'Blok',
    'value.arpeggiated': 'Gebroken',
    'value.easy': 'Makkelijk',
    'value.medium': 'Gemiddeld',
    'value.hard': 'Moeilijk',
    'value.eighth': 'Achtste noten',
    'value.sixteenth': 'Zestiende noten',
    'value.yes': 'Ja',
    'value.no': 'Nee',
    'value.treble': 'Vioolsleutel',
    'value.bass': 'Bassleutel',
    'value.equal': 'Gelijk',
    'value.custom': 'Aangepast',

    // Game UI
    'game.question': 'Vraag',
    'game.of': 'van',
    'game.score': 'Score',
    'game.streak': 'Reeks',
    'game.best': 'Beste',
    'game.skip': 'Overslaan',
    'game.submit': 'Bevestigen',
    'game.next': 'Volgende',
    'game.quit': 'Sessie Beëindigen',
    'game.replay': 'Opnieuw Afspelen',
    'game.reference': 'Referentietoon',
    'game.clear': 'Wissen',
    'game.startExercise': 'Start',
    'game.practiceMode': 'Oefenmodus',
    'game.quizMode': 'Quizmodus',

    // Quiz modules
    'quiz.module.ear': 'Gehoortraining',
    'quiz.module.read': 'Lezen',
    'quiz.module.write': 'Schrijven',

    // Feedback
    'feedback.correct': 'Correct!',
    'feedback.incorrect': 'Fout',
    'feedback.skipped': 'Overgeslagen',
    'feedback.why': 'Waarom?',
    'feedback.theAnswerWas': 'Het antwoord was',

    // Results
    'results.title': 'Resultaten',
    'results.score': 'Score',
    'results.accuracy': 'Nauwkeurigheid',
    'results.time': 'Tijd',
    'results.bestStreak': 'Beste Reeks',
    'results.viewDetails': 'Details Bekijken',
    'results.hideDetails': 'Details Verbergen',
    'results.tryAgain': 'Opnieuw Proberen',
    'results.backToExercises': 'Terug naar Oefeningen',
    'results.newRecord': 'Nieuw Record!',

    // Directions
    'direction.higher': 'Hoger',
    'direction.lower': 'Lager',
    'exercise.higher': 'Hoger',
    'exercise.lower': 'Lager',
    'exercise.firstNote': 'Eerste noot',
    'exercise.secondNote': 'Tweede noot',
    'exercise.previousNote': 'Vorige noot',
    'exercise.currentNote': 'Huidige noot',
    'exercise.previous': 'Vorige',
    'exercise.current': 'Huidige',
    'exercise.replayPrevious': 'Vorige afspelen',
    'exercise.preview': 'Voorbeeld',
    'exercise.yourAnswer': 'Jouw Antwoord',
    'exercise.playCurrent': 'Huidige afspelen',
    'exercise.replay': 'Opnieuw Afspelen',
    'exercise.referencePitch': 'Referentietoon',

    // Settings values (aliases)
    'settings.endless': 'Eindeloos',
    'settings.unlimited': 'Onbeperkt',
    'settings.easy': 'Makkelijk',
    'settings.medium': 'Gemiddeld',
    'settings.hard': 'Moeilijk',

    // Instructions
    'instruction.identifyNote': 'Welke noot is dit?',
    'instruction.identifyPitch': 'Welke noot hoor je?',
    'instruction.hearFirstPitch': 'Druk om de eerste toon te horen',
    'instruction.hearSecondPitch': 'Druk nu om de tweede toon te horen',
    'instruction.hearNextPitch': 'Druk om de volgende toon te horen',
    'instruction.higherOrLower': 'Is de tweede noot hoger of lager?',
    'instruction.identifyInterval': 'Welk interval is dit?',
    'instruction.identifyIntervalVisual': 'Welk interval zie je?',
    'instruction.identifyThird': 'Grote of kleine terts?',
    'instruction.drawInterval': 'Teken een {interval} {direction} vanaf deze noot',
    'instruction.drawChord': 'Teken {chord}',
    'instruction.identifyChord': 'Welk akkoord is dit?',
    'instruction.transcribeRhythm': 'Schrijf het ritme over dat je hoort',

    // Errors
    'error.audioRequired': 'Audio is vereist voor deze oefening. Controleer je browserinstellingen.',
    'error.audioFailed': 'Kon audio niet afspelen. Probeer het opnieuw.',
  },
} as const;

export function t(key: TranslationKey, language: Language): string {
  return translations[language][key] || translations.en[key] || key;
}

export function getNoteName(note: NoteName, language: Language): string {
  return t(`note.${note}` as TranslationKey, language);
}

export function getNoteNames(language: Language): string[] {
  const notes: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  return notes.map((note) => getNoteName(note, language));
}

export { translations };
