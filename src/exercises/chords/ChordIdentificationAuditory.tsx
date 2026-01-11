import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ExerciseProps, Note, ChordQuality, ChordIdentificationAuditorySettings, Accidental } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t } from '../../i18n/translations';
import { randomNoteInRange, getChordDistractors, getChordAbbreviation, shuffle } from '../../utils/musicTheory';
import { audioEngine } from '../../audio/audioEngine';
import { Feedback } from '../../components/feedback/Feedback';
import { ExerciseWrapper } from '../../components/exercise/ExerciseWrapper';
import { Button, ReplayButton, NoteButtons } from '../../components/ui';
import styles from './ChordIdentificationAuditory.module.css';

// Chord intervals in semitones from root
const CHORD_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
};

function getSemitones(note: Note): number {
  const base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let s = base[note.name];
  if (note.accidental === 'sharp') s += 1;
  if (note.accidental === 'flat') s -= 1;
  return s;
}

function semitonesToNote(semitones: number): Note {
  const octave = Math.floor(semitones / 12);
  const pitchClass = ((semitones % 12) + 12) % 12;

  const noteMap: { name: Note['name']; accidental: Accidental }[] = [
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

function buildChord(root: Note, quality: ChordQuality): Note[] {
  const intervals = CHORD_INTERVALS[quality];
  const rootSemitones = root.octave * 12 + getSemitones(root);

  return intervals.map((interval) => {
    const semitones = rootSemitones + interval;
    return semitonesToNote(semitones);
  });
}

export const ChordIdentificationAuditory: React.FC<ExerciseProps> = ({ settings }) => {
  const { language } = useGlobalStore();
  const { recordAnswer, exerciseState } = useExerciseStore();

  const isPracticeMode = exerciseState?.isPracticeMode ?? true;

  const chordSettings = settings as ChordIdentificationAuditorySettings;

  const [rootNote, setRootNote] = useState<Note | null>(null);
  const [chordQuality, setChordQuality] = useState<ChordQuality>('major');
  const [chordNotes, setChordNotes] = useState<Note[]>([]);
  const [options, setOptions] = useState<ChordQuality[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  // Two-step selection: first pitch, then quality
  const [selectedRoot, setSelectedRoot] = useState<Note | null>(null);

  // In-exercise noteGap control for melodic chords (0-5 seconds)
  const [noteGap, setNoteGap] = useState(0.5);

  const maxReplays = isPracticeMode ? Infinity : (chordSettings.replayLimit ?? Infinity);
  const voicing = chordSettings.voicing || 'harmonic';
  const difficulty = chordSettings.difficulty || 'easy';

  const availableQualities = chordSettings.chordTypes.length > 0
    ? chordSettings.chordTypes
    : ['major', 'minor'] as ChordQuality[];

  const defaultNoteRange = {
    low: { name: 'C' as const, octave: 3, accidental: 'natural' as const },
    high: { name: 'G' as const, octave: 4, accidental: 'natural' as const },
  };
  const prevQuestionRef = useRef<string | null>(null);

  const generateQuestion = useCallback(() => {
    let quality: ChordQuality;
    let root: Note;
    let notes: Note[];
    let questionKey: string;
    let attempts = 0;

    do {
      quality = availableQualities[Math.floor(Math.random() * availableQualities.length)];
      root = randomNoteInRange(defaultNoteRange, false);
      notes = buildChord(root, quality);
      questionKey = `${root.name}${root.octave}-${quality}`;
      attempts++;
    } while (questionKey === prevQuestionRef.current && attempts < 10);
    prevQuestionRef.current = questionKey;

    const distractors = getChordDistractors(quality, 3, availableQualities);
    const allOptions = shuffle([quality, ...distractors]);

    setRootNote(root);
    setChordQuality(quality);
    setChordNotes(notes);
    setOptions(allOptions);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
    setReplaysUsed(0);
    setHasPlayedOnce(false);
    setSelectedRoot(null);
  }, [availableQualities]);

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No auto-play - user must press button to hear
  const handlePlay = async () => {
    if (showFeedback || chordNotes.length === 0) return;

    if (voicing === 'harmonic') {
      await audioEngine.playChordBlock(chordNotes, 1);
    } else {
      // Use noteGap for melodic chords (convert seconds to the gap parameter)
      await audioEngine.playChordArpeggiated(chordNotes, 0.4, noteGap);
    }

    if (!hasPlayedOnce) {
      setHasPlayedOnce(true);
    } else {
      setReplaysUsed((prev) => prev + 1);
    }
  };

  // Handler for pitch (root) selection - first step
  const handleRootSelect = (note: Note) => {
    if (showFeedback) return;
    setSelectedRoot(note);
  };

  // Handler for quality selection - submits the answer
  // In easy mode: just checks quality
  // In hard mode: checks both root pitch and quality
  const handleAnswer = (selectedQuality: ChordQuality) => {
    if (showFeedback || !rootNote) return;

    // In hard mode, require root selection first
    if (difficulty === 'hard' && !selectedRoot) return;

    const timeSpent = (Date.now() - questionStartTime) / 1000;
    let correct: boolean;
    let userAnswer: string;
    let correctAnswer: string;

    const correctRootDisplay = `${rootNote.name}${rootNote.accidental === 'sharp' ? '♯' : rootNote.accidental === 'flat' ? '♭' : ''}`;

    if (difficulty === 'easy') {
      // Easy mode: only check quality
      correct = selectedQuality === chordQuality;
      correctAnswer = `${correctRootDisplay} ${t(`chord.${chordQuality}`, 'en')} (${getChordAbbreviation(chordQuality)})`;
      userAnswer = `${correctRootDisplay} ${t(`chord.${selectedQuality}`, 'en')} (${getChordAbbreviation(selectedQuality)})`;
    } else {
      // Hard mode: check both root pitch and quality
      const rootCorrect =
        selectedRoot!.name === rootNote.name &&
        selectedRoot!.accidental === rootNote.accidental;
      const qualityCorrect = selectedQuality === chordQuality;
      correct = rootCorrect && qualityCorrect;

      const selectedRootDisplay = `${selectedRoot!.name}${selectedRoot!.accidental === 'sharp' ? '♯' : selectedRoot!.accidental === 'flat' ? '♭' : ''}`;
      correctAnswer = `${correctRootDisplay} ${t(`chord.${chordQuality}`, 'en')} (${getChordAbbreviation(chordQuality)})`;
      userAnswer = `${selectedRootDisplay} ${t(`chord.${selectedQuality}`, 'en')} (${getChordAbbreviation(selectedQuality)})`;
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    recordAnswer(correct, userAnswer, correctAnswer, timeSpent);
  };

  const handleNext = () => {
    generateQuestion();
  };

  if (!rootNote || chordNotes.length === 0) return null;

  const canReplay = hasPlayedOnce ? replaysUsed < maxReplays : true;
  const replaysRemaining = maxReplays === Infinity ? '∞' : maxReplays - replaysUsed;
  // Always use English note names
  const rootDisplay = `${rootNote.name}${rootNote.accidental === 'sharp' ? '♯' : rootNote.accidental === 'flat' ? '♭' : ''}`;

  // Only use timeLimit in quiz mode
  const timeLimit = isPracticeMode ? null : (chordSettings.timeLimit ?? null);

  return (
    <ExerciseWrapper onSkip={generateQuestion} timeLimit={timeLimit} pauseTimer={showFeedback}>
      <div className={styles.exercise}>
        <p className={styles.instruction}>{t('instruction.identifyChord', language)}</p>

        <ReplayButton
          onClick={handlePlay}
          disabled={!canReplay || showFeedback}
          replaysRemaining={hasPlayedOnce ? replaysRemaining : undefined}
          showCount={hasPlayedOnce && maxReplays !== Infinity}
          aria-label={t('exercise.replay', language)}
        />

        {/* Note Gap Slider - only show for melodic mode */}
        {voicing === 'melodic' && !showFeedback && (
          <div className={styles.noteGapControl}>
            <span className={styles.noteGapLabel}>
              {language === 'en' ? 'Gap' : 'Pauze'}
            </span>
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={noteGap}
              onChange={(e) => setNoteGap(Number(e.target.value))}
              className={styles.noteGapSlider}
            />
            <span className={styles.noteGapValue}>{noteGap.toFixed(1)}s</span>
          </div>
        )}

        {/* Easy mode: just quality buttons */}
        {!showFeedback && difficulty === 'easy' && (
          <div className={styles.options}>
            {options.map((quality, index) => (
              <Button
                key={index}
                variant="secondary"
                size="lg"
                onClick={() => handleAnswer(quality)}
              >
                {t(`chord.${quality}`, 'en')}
              </Button>
            ))}
          </div>
        )}

        {/* Hard mode: two-step selection (root pitch, then quality) */}
        {!showFeedback && difficulty === 'hard' && (
          <div className={styles.twoStepContainer}>
            {/* Step 1: Select root pitch */}
            <div className={styles.stepSection}>
              <p className={styles.stepLabel}>{t('chord.selectRoot', language)}</p>
              <NoteButtons
                onNoteClick={handleRootSelect}
                includeAccidentals={false}
                highlightedNote={selectedRoot}
                disabled={showFeedback}
              />
            </div>

            {/* Step 2: Select quality (enabled only after pitch selection) */}
            <div className={styles.stepSection}>
              <p className={styles.stepLabel}>{t('chord.selectQuality', language)}</p>
              <div className={`${styles.options} ${!selectedRoot ? styles.disabled : ''}`}>
                {options.map((quality, index) => (
                  <Button
                    key={index}
                    variant="secondary"
                    size="lg"
                    onClick={() => handleAnswer(quality)}
                    disabled={!selectedRoot}
                  >
                    {t(`chord.${quality}`, 'en')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showFeedback && (
          <Feedback
            isCorrect={isCorrect}
            correctAnswer={`${rootDisplay} ${t(`chord.${chordQuality}`, 'en')}`}
            onNext={handleNext}
          />
        )}
      </div>
    </ExerciseWrapper>
  );
};
