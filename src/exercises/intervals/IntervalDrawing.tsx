import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ExerciseProps, Note, Interval, Accidental, IntervalDrawingSettings } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t, getNoteName, type TranslationKey } from '../../i18n/translations';
import {
  randomNoteInRange,
  applyInterval,
  areEnharmonic,
  getIntervalKey,
  getIntervalSymbol,
  ALL_INTERVALS,
} from '../../utils/musicTheory';
import { InteractiveStaff } from '../../components/staff/InteractiveStaff';
import { Staff } from '../../components/staff/Staff';
import { AccidentalToolbar } from '../../components/ui/AccidentalToolbar';
import { Feedback } from '../../components/feedback/Feedback';
import { ExerciseWrapper } from '../../components/exercise/ExerciseWrapper';
import { Button } from '../../components/ui';
import styles from './IntervalDrawing.module.css';

export const IntervalDrawing: React.FC<ExerciseProps> = ({ settings }) => {
  const { language } = useGlobalStore();
  const { recordAnswer } = useExerciseStore();

  const drawingSettings = settings as IntervalDrawingSettings;

  const [startNote, setStartNote] = useState<Note | null>(null);
  const [targetInterval, setTargetInterval] = useState<Interval | null>(null);
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [drawnNotes, setDrawnNotes] = useState<Note[]>([]);
  const [selectedAccidental, setSelectedAccidental] = useState<Accidental>('natural');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [correctNote, setCorrectNote] = useState<Note | null>(null);

  const availableIntervals = drawingSettings.intervals.length > 0
    ? drawingSettings.intervals
    : ALL_INTERVALS.filter((i) => i.semitones <= 12 && i.semitones > 0);

  const defaultNoteRange = {
    low: { name: 'C' as const, octave: 4, accidental: 'natural' as const },
    high: { name: 'B' as const, octave: 4, accidental: 'natural' as const },
  };
  const prevIntervalRef = useRef<number | null>(null);

  const generateQuestion = useCallback(() => {
    let interval: Interval;
    let dir: 'above' | 'below';
    let note: Note;
    let attempts = 0;
    let extraOctaves = 0;

    // Octave span setting - how many octaves the interval can span
    const octaveSpan = drawingSettings.octaveSpan ?? 1;

    // Pick random interval, ensuring it's different from the previous one
    do {
      interval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
      attempts++;
    } while (
      availableIntervals.length > 1 &&
      interval.semitones === prevIntervalRef.current &&
      attempts < 10
    );
    prevIntervalRef.current = interval.semitones;

    // Determine direction
    dir = 'above';
    if (drawingSettings.direction === 'below') {
      dir = 'below';
    } else if (drawingSettings.direction === 'both') {
      dir = Math.random() > 0.5 ? 'above' : 'below';
    }

    // Generate start note
    note = randomNoteInRange(defaultNoteRange, false);

    // Calculate extra octaves based on octaveSpan setting
    extraOctaves = octaveSpan > 1 ? Math.floor(Math.random() * octaveSpan) : 0;

    // Extend interval with extra octaves
    const extendedInterval: Interval = {
      ...interval,
      semitones: interval.semitones + extraOctaves * 12,
    };

    setStartNote(note);
    setTargetInterval(extendedInterval);
    setDirection(dir);
    setDrawnNotes([]);
    setSelectedAccidental('natural');
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
    setCorrectNote(null);
  }, [drawingSettings, availableIntervals]);

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (!startNote || !targetInterval || drawnNotes.length === 0) return;

    // Calculate correct answer
    const correctAnswer = applyInterval(startNote, targetInterval, direction);

    // Check if drawn note matches (allowing enharmonic equivalents)
    const correct = areEnharmonic(drawnNotes[0], correctAnswer);
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    setIsCorrect(correct);
    setShowFeedback(true);
    setCorrectNote(correctAnswer);

    const drawnNoteName = `${getNoteName(drawnNotes[0].name, language)}${drawnNotes[0].accidental === 'sharp' ? '♯' : drawnNotes[0].accidental === 'flat' ? '♭' : ''}`;
    const correctNoteName = `${getNoteName(correctAnswer.name, language)}${correctAnswer.accidental === 'sharp' ? '♯' : correctAnswer.accidental === 'flat' ? '♭' : ''}`;

    recordAnswer(correct, drawnNoteName, correctNoteName, timeSpent);
  };

  const handleClear = () => {
    setDrawnNotes([]);
  };

  const handleNext = () => {
    generateQuestion();
  };

  if (!startNote || !targetInterval) return null;

  const intervalName = t(getIntervalKey(targetInterval) as TranslationKey, language);
  const intervalSymbol = getIntervalSymbol(targetInterval, direction, language);
  const directionText = direction === 'above'
    ? t('value.above', language).toLowerCase()
    : t('value.below', language).toLowerCase();

  return (
    <ExerciseWrapper onSkip={generateQuestion}>
      <div className={styles.exercise}>
        <div className={styles.instructionContainer}>
          <p className={styles.instruction}>
            {t('instruction.drawInterval', language)
              .replace('{interval}', intervalName)
              .replace('{direction}', directionText)}
          </p>
          <span className={styles.intervalSymbol}>{intervalSymbol}</span>
        </div>

        <div className={styles.staffContainer}>
          <InteractiveStaff
            clef="treble"
            notes={[startNote, ...drawnNotes]}
            onNotesChange={(notes) => {
              // Keep the start note, only allow changing the drawn note
              if (notes.length <= 2) {
                setDrawnNotes(notes.slice(1));
              }
            }}
            maxNotes={2}
            selectedAccidental={selectedAccidental}
            disabled={showFeedback}
            width={400}
            height={150}
          />
        </div>

        {!showFeedback && (
          <>
            <div className={styles.toolbar}>
              <AccidentalToolbar
                selected={selectedAccidental}
                onChange={setSelectedAccidental}
              />
              <Button variant="ghost" onClick={handleClear}>
                {t('game.clear', language)}
              </Button>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={drawnNotes.length === 0}
            >
              {t('game.submit', language)}
            </Button>
          </>
        )}

        {showFeedback && (
          <>
            {!isCorrect && correctNote && (
              <div className={styles.correctAnswerStaff}>
                <span className={styles.correctLabel}>{t('feedback.theAnswerWas', language)}:</span>
                <Staff
                  clef="treble"
                  notes={[startNote, correctNote]}
                  width={200}
                  height={100}
                />
              </div>
            )}
            <Feedback
              isCorrect={isCorrect}
              onNext={handleNext}
            />
          </>
        )}
      </div>
    </ExerciseWrapper>
  );
};
