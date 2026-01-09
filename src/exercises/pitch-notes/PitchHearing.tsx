import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ExerciseProps, Note, PitchHearingSettings } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t, getNoteName } from '../../i18n/translations';
import { randomNoteInRange } from '../../utils/musicTheory';
import { audioEngine } from '../../audio/audioEngine';
import { Piano } from '../../components/piano/Piano';
import { NoteButtons, ReplayButton } from '../../components/ui';
import { Feedback } from '../../components/feedback/Feedback';
import { ExerciseWrapper } from '../../components/exercise/ExerciseWrapper';
import styles from './PitchHearing.module.css';

export const PitchHearing: React.FC<ExerciseProps> = ({
  settings,
  inputMethod,
}) => {
  const { language } = useGlobalStore();
  const { recordAnswer, exerciseState } = useExerciseStore();

  const isPracticeMode = exerciseState?.isPracticeMode ?? true;
  const pitchSettings = settings as PitchHearingSettings;

  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  const maxReplays = isPracticeMode ? Infinity : (pitchSettings.replayLimit ?? Infinity);
  const prevNoteRef = useRef<string | null>(null);

  const generateQuestion = useCallback(() => {
    let note: Note;
    let noteKey: string;
    let attempts = 0;
    do {
      note = randomNoteInRange(pitchSettings.noteRange, pitchSettings.includeAccidentals);
      noteKey = `${note.name}${note.octave}${note.accidental}`;
      attempts++;
    } while (noteKey === prevNoteRef.current && attempts < 10);
    prevNoteRef.current = noteKey;

    setCurrentNote(note);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
    setReplaysUsed(0);
    setHasPlayedOnce(false);
  }, [pitchSettings]);

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No auto-play - user must press button to hear
  const handlePlay = async () => {
    if (!currentNote || showFeedback) return;
    await audioEngine.playNote(currentNote, 1);
    if (!hasPlayedOnce) {
      setHasPlayedOnce(true);
    } else {
      setReplaysUsed((prev) => prev + 1);
    }
  };

  const handleReferencePitch = async () => {
    // Play A4 (440Hz) as reference
    const referenceNote: Note = { name: 'A', octave: 4, accidental: 'natural' };
    await audioEngine.playNote(referenceNote, 1);
  };

  const handleAnswer = (selectedNote: Note) => {
    if (showFeedback || !currentNote) return;

    // Compare only the note name and accidental (not octave)
    const correct =
      selectedNote.name === currentNote.name &&
      selectedNote.accidental === currentNote.accidental;

    const timeSpent = (Date.now() - questionStartTime) / 1000;

    setIsCorrect(correct);
    setShowFeedback(true);

    recordAnswer(
      correct,
      `${selectedNote.name}${selectedNote.accidental === 'sharp' ? '♯' : selectedNote.accidental === 'flat' ? '♭' : ''}`,
      `${currentNote.name}${currentNote.accidental === 'sharp' ? '♯' : currentNote.accidental === 'flat' ? '♭' : ''}`,
      timeSpent
    );
  };

  const handleNext = () => {
    generateQuestion();
  };

  const getCorrectAnswerDisplay = () => {
    if (!currentNote) return '';
    const noteName = getNoteName(currentNote.name, language);
    const accidental =
      currentNote.accidental === 'sharp' ? '♯' : currentNote.accidental === 'flat' ? '♭' : '';
    return `${noteName}${accidental}`;
  };

  if (!currentNote) return null;

  const canReplay = hasPlayedOnce ? replaysUsed < maxReplays : true;
  const replaysRemaining = maxReplays === Infinity ? '∞' : maxReplays - replaysUsed;

  return (
    <ExerciseWrapper onSkip={generateQuestion}>
      <div className={styles.exercise}>
        <p className={styles.instruction}>{t('instruction.identifyPitch', language)}</p>

        <ReplayButton
          onClick={handlePlay}
          disabled={!canReplay || showFeedback}
          replaysRemaining={hasPlayedOnce ? replaysRemaining : undefined}
          showCount={hasPlayedOnce && maxReplays !== Infinity}
          aria-label={t('exercise.replay', language)}
        />

        {!showFeedback && (
          <div className={styles.inputContainer}>
            {inputMethod === 'piano' ? (
              <Piano startOctave={4} endOctave={4} onNoteClick={handleAnswer} showLabels />
            ) : (
              <NoteButtons
                onNoteClick={handleAnswer}
                includeAccidentals={pitchSettings.includeAccidentals}
              />
            )}
          </div>
        )}

        {!showFeedback && (
          <button
            type="button"
            className={styles.referenceButton}
            onClick={handleReferencePitch}
          >
            {t('exercise.referencePitch', language)} ({getNoteName('A', language)})
          </button>
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
