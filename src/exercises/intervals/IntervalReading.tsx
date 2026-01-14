import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ExerciseProps, Note, Interval, IntervalReadingSettings, Clef } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t, type TranslationKey } from '../../i18n/translations';
import {
  randomNoteInRange,
  applyInterval,
  getIntervalKey,
  getIntervalAbbreviation,
  getIntervalDistractors,
  ALL_INTERVALS,
} from '../../utils/musicTheory';
import { Staff } from '../../components/staff/Staff';
import { Feedback } from '../../components/feedback/Feedback';
import { ExerciseWrapper } from '../../components/exercise/ExerciseWrapper';
import { Button } from '../../components/ui';
import styles from './IntervalReading.module.css';

export const IntervalReading: React.FC<ExerciseProps> = ({ settings }) => {
  const { language } = useGlobalStore();
  const { recordAnswer, exerciseState } = useExerciseStore();

  const isPracticeMode = exerciseState?.isPracticeMode ?? true;

  const readingSettings = settings as IntervalReadingSettings;

  const [currentInterval, setCurrentInterval] = useState<Interval | null>(null);
  const [firstNote, setFirstNote] = useState<Note | null>(null);
  const [secondNote, setSecondNote] = useState<Note | null>(null);
  const [currentClef, setCurrentClef] = useState<Clef>('treble');
  const [options, setOptions] = useState<Interval[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const availableIntervals = readingSettings.intervals.length > 0
    ? readingSettings.intervals
    : ALL_INTERVALS.filter((i) => i.semitones <= 12 && i.semitones > 0);

  const defaultNoteRange = {
    treble: {
      low: { name: 'C' as const, octave: 4, accidental: 'natural' as const },
      high: { name: 'G' as const, octave: 5, accidental: 'natural' as const },
    },
    bass: {
      low: { name: 'E' as const, octave: 2, accidental: 'natural' as const },
      high: { name: 'C' as const, octave: 4, accidental: 'natural' as const },
    },
  };

  const prevIntervalRef = useRef<number | null>(null);

  const generateQuestion = useCallback(() => {
    let interval: Interval;
    let note1: Note;
    let note2: Note;
    let direction: 'above' | 'below';
    let clef: Clef;
    let attempts = 0;

    // Octave span setting - how many octaves the interval can span
    const octaveSpan = readingSettings.octaveSpan ?? 1;

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

    // Determine clef
    if (readingSettings.clef === 'both') {
      clef = Math.random() > 0.5 ? 'treble' : 'bass';
    } else {
      clef = readingSettings.clef;
    }

    // Generate first note in appropriate range for clef
    const range = defaultNoteRange[clef];
    note1 = randomNoteInRange(range, false);

    // Determine direction
    direction = 'above';
    if (readingSettings.direction === 'below') {
      direction = 'below';
    } else if (readingSettings.direction === 'both') {
      direction = Math.random() > 0.5 ? 'above' : 'below';
    }

    // Calculate second note - optionally add extra octaves based on octaveSpan
    const extraOctaves = octaveSpan > 1 ? Math.floor(Math.random() * octaveSpan) : 0;
    const extendedInterval: Interval = {
      ...interval,
      semitones: interval.semitones + extraOctaves * 12,
    };
    note2 = applyInterval(note1, extendedInterval, direction);

    // In quiz mode: show all selected intervals as options
    // In practice mode: show 4 options (1 correct + 3 distractors)
    // Sort by semitones from low to high for consistent ordering
    const allOptions = isPracticeMode
      ? [interval, ...getIntervalDistractors(interval, 3, availableIntervals)].sort((a, b) => a.semitones - b.semitones)
      : [...availableIntervals].sort((a, b) => a.semitones - b.semitones);

    setCurrentInterval(interval);
    setFirstNote(note1);
    setSecondNote(note2);
    setCurrentClef(clef);
    setOptions(allOptions);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
  }, [readingSettings, availableIntervals, isPracticeMode]);

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = (selectedInterval: Interval) => {
    if (showFeedback || !currentInterval) return;

    const correct = selectedInterval.semitones === currentInterval.semitones;
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    setIsCorrect(correct);
    setShowFeedback(true);

    recordAnswer(
      correct,
      t(getIntervalKey(selectedInterval) as TranslationKey, language),
      t(getIntervalKey(currentInterval) as TranslationKey, language),
      timeSpent
    );
  };

  const handleNext = () => {
    generateQuestion();
  };

  if (!currentInterval || !firstNote || !secondNote) return null;

  return (
    <ExerciseWrapper onSkip={generateQuestion}>
      <div className={styles.exercise}>
        <p className={styles.instruction}>{t('instruction.identifyIntervalVisual', language)}</p>

        <div className={styles.staffContainer}>
          <Staff
            clef={currentClef}
            notes={[firstNote, secondNote]}
            width={280}
            height={160}
          />
        </div>

        {!showFeedback && (
          <div className={styles.options}>
            {options.map((interval, index) => (
              <Button
                key={index}
                variant="secondary"
                size="lg"
                onClick={() => handleAnswer(interval)}
              >
                {t(getIntervalKey(interval) as TranslationKey, language)} ({getIntervalAbbreviation(interval, language)})
              </Button>
            ))}
          </div>
        )}

        {showFeedback && (
          <Feedback
            isCorrect={isCorrect}
            correctAnswer={t(getIntervalKey(currentInterval) as TranslationKey, language)}
            onNext={handleNext}
          />
        )}
      </div>
    </ExerciseWrapper>
  );
};
