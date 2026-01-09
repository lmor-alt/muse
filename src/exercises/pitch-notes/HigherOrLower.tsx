import React, { useState, useEffect, useCallback } from 'react';
import type { ExerciseProps, Note, HigherOrLowerSettings } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t, getNoteName } from '../../i18n/translations';
import { randomNoteInRange, noteToSemitones } from '../../utils/musicTheory';
import { audioEngine } from '../../audio/audioEngine';
import { Staff } from '../../components/staff/Staff';
import { Feedback } from '../../components/feedback/Feedback';
import { ExerciseWrapper } from '../../components/exercise/ExerciseWrapper';
import { Button, ReplayButton } from '../../components/ui';
import styles from './HigherOrLower.module.css';

export const HigherOrLower: React.FC<ExerciseProps> = ({ settings }) => {
  const { language } = useGlobalStore();
  const { recordAnswer, exerciseState } = useExerciseStore();

  const holSettings = settings as HigherOrLowerSettings;
  const isPracticeMode = exerciseState?.isPracticeMode ?? true;

  // Notes in the chain
  const [previousNote, setPreviousNote] = useState<Note | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  // Playback tracking
  const [hasPreviousBeenPlayed, setHasPreviousBeenPlayed] = useState(false);
  const [hasCurrentBeenPlayed, setHasCurrentBeenPlayed] = useState(false);
  const [currentPlayCount, setCurrentPlayCount] = useState(0);

  // Answer state
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showNotes, setShowNotes] = useState(false);

  // Generate a new note that's different from the reference note
  const generateNewNote = useCallback((referenceNote: Note | null): Note => {
    const minInterval = holSettings.difficulty === 'easy' ? 3 : holSettings.difficulty === 'medium' ? 2 : 1;
    let newNote: Note;
    let attempts = 0;

    do {
      newNote = randomNoteInRange(holSettings.noteRange, false);
      attempts++;
    } while (
      referenceNote &&
      Math.abs(noteToSemitones(referenceNote) - noteToSemitones(newNote)) < minInterval &&
      attempts < 50
    );

    // Ensure notes are different
    if (referenceNote && noteToSemitones(referenceNote) === noteToSemitones(newNote)) {
      newNote = {
        ...newNote,
        octave: newNote.octave + (Math.random() > 0.5 ? 1 : -1),
      };
    }

    return newNote;
  }, [holSettings]);

  // Start fresh (first round of the exercise)
  // On first round, we only set the first note - second note generated after first is heard
  const startFresh = useCallback(() => {
    const note1 = randomNoteInRange(holSettings.noteRange, false);
    setPreviousNote(null); // No previous yet on first round
    setCurrentNote(note1); // First note to hear
    setHasPreviousBeenPlayed(false);
    setHasCurrentBeenPlayed(false);
    setCurrentPlayCount(0);
    setShowFeedback(false);
    setShowNotes(false);
    setQuestionStartTime(Date.now());
  }, [holSettings]);

  // Continue chain (after answering, generate next note in sequence)
  const continueChain = useCallback(() => {
    // Current note becomes the new previous note
    if (currentNote) {
      setPreviousNote(currentNote);
      setHasPreviousBeenPlayed(true); // User just heard this as the "current" note
    }
    // Generate a fresh current note
    const newNote = generateNewNote(currentNote);
    setCurrentNote(newNote);
    setHasCurrentBeenPlayed(false);
    setCurrentPlayCount(0);
    setShowFeedback(false);
    setShowNotes(false);
    setQuestionStartTime(Date.now());
  }, [currentNote, generateNewNote]);

  // Initialize
  useEffect(() => {
    startFresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play the previous note (replay)
  const handlePlayPrevious = async () => {
    if (!previousNote || showFeedback) return;
    await audioEngine.playNote(previousNote, 0.8);
    setHasPreviousBeenPlayed(true);
  };

  // Play the current note
  const handlePlayCurrent = async () => {
    if (!currentNote || showFeedback) return;
    // In quiz mode, only allow playing once (per note)
    if (!isPracticeMode && currentPlayCount >= 1) return;

    await audioEngine.playNote(currentNote, 0.8);

    // First round special case: after hearing the first note, advance to set up the comparison
    if (previousNote === null) {
      // First note becomes previous, generate a new current
      setPreviousNote(currentNote);
      setHasPreviousBeenPlayed(true);
      const newNote = generateNewNote(currentNote);
      setCurrentNote(newNote);
      setHasCurrentBeenPlayed(false);
      setCurrentPlayCount(0);
    } else {
      // Normal case: just mark current as played
      setHasCurrentBeenPlayed(true);
      setCurrentPlayCount((prev) => prev + 1);
    }
  };

  const handleAnswer = (answer: 'higher' | 'lower') => {
    if (showFeedback || !previousNote || !currentNote) return;
    // Must have heard current note to answer
    if (!hasCurrentBeenPlayed) return;

    const prevSemitones = noteToSemitones(previousNote);
    const currSemitones = noteToSemitones(currentNote);
    const correctAnswer = currSemitones > prevSemitones ? 'higher' : 'lower';

    const correct = answer === correctAnswer;
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    setIsCorrect(correct);
    setShowFeedback(true);
    setShowNotes(true);

    recordAnswer(
      correct,
      t(`exercise.${answer}`, language),
      t(`exercise.${correctAnswer}`, language),
      timeSpent
    );
  };

  const handleNext = () => {
    continueChain();
  };

  const getCorrectAnswerDisplay = () => {
    if (!previousNote || !currentNote) return '';
    const prevSemitones = noteToSemitones(previousNote);
    const currSemitones = noteToSemitones(currentNote);
    return currSemitones > prevSemitones
      ? t('exercise.higher', language)
      : t('exercise.lower', language);
  };

  const getNoteDisplay = (note: Note) => {
    const name = getNoteName(note.name, language);
    const accidental =
      note.accidental === 'sharp' ? '♯' : note.accidental === 'flat' ? '♭' : '';
    return `${name}${accidental}${note.octave}`;
  };

  // Only need currentNote to render - previousNote can be null on first round
  if (!currentNote) return null;

  // Button states
  // Previous: disabled on very first play (user hasn't heard anything yet), or in quiz mode after first round
  const canPlayPrevious = isPracticeMode && hasPreviousBeenPlayed && !showFeedback;

  // Current: always available in practice, only once in quiz mode
  const canPlayCurrent = !showFeedback && (isPracticeMode || currentPlayCount < 1);

  // Can answer: only after hearing current note AND we have a previous note to compare with
  const canAnswer = previousNote !== null && hasCurrentBeenPlayed && !showFeedback;

  // Dynamic instruction
  const getInstruction = () => {
    // First round, haven't heard anything yet
    if (previousNote === null) {
      return t('instruction.hearFirstPitch', language);
    }
    // Have a previous note but haven't heard current yet
    if (!hasCurrentBeenPlayed) {
      return t('instruction.hearNextPitch', language);
    }
    // Ready to answer
    return t('instruction.higherOrLower', language);
  };

  return (
    <ExerciseWrapper onSkip={startFresh}>
      <div className={styles.exercise}>
        <p className={styles.instruction}>{getInstruction()}</p>

        <div className={styles.audioControls}>
          {/* Replay Previous button - always visible but may be disabled */}
          <div className={styles.buttonWithLabel}>
            <ReplayButton
              onClick={handlePlayPrevious}
              disabled={!canPlayPrevious}
              aria-label={t('exercise.replayPrevious', language) || 'Replay previous'}
            />
            <span className={styles.buttonLabel}>{t('exercise.previous', language)}</span>
          </div>

          {/* Play Current button - always visible but may be disabled */}
          <div className={styles.buttonWithLabel}>
            <ReplayButton
              onClick={handlePlayCurrent}
              disabled={!canPlayCurrent}
              aria-label={t('exercise.playCurrent', language) || 'Play current'}
            />
            <span className={styles.buttonLabel}>{t('exercise.current', language)}</span>
          </div>
        </div>

        {showNotes && previousNote && (
          <div className={styles.notesReveal}>
            <div className={styles.noteDisplay}>
              <span className={styles.noteLabel}>{t('exercise.previousNote', language)}:</span>
              <span className={styles.noteName}>{getNoteDisplay(previousNote)}</span>
            </div>
            <Staff clef="treble" notes={[previousNote]} width={150} height={100} />

            <div className={styles.noteDisplay}>
              <span className={styles.noteLabel}>{t('exercise.currentNote', language)}:</span>
              <span className={styles.noteName}>{getNoteDisplay(currentNote)}</span>
            </div>
            <Staff clef="treble" notes={[currentNote]} width={150} height={100} />
          </div>
        )}

        {/* Higher/Lower buttons - visible once user has heard something */}
        {!showFeedback && (
          <div className={styles.answerButtons}>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleAnswer('higher')}
              disabled={!canAnswer}
            >
              ↑ {t('exercise.higher', language)}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleAnswer('lower')}
              disabled={!canAnswer}
            >
              ↓ {t('exercise.lower', language)}
            </Button>
          </div>
        )}

        {showFeedback && (
          <Feedback
            isCorrect={isCorrect}
            correctAnswer={getCorrectAnswerDisplay()}
            onNext={handleNext}
          />
        )}
      </div>
    </ExerciseWrapper>
  );
};
