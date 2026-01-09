import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ExerciseProps, Note, Interval, IntervalIdentificationSettings } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t, type TranslationKey } from '../../i18n/translations';
import {
  randomNoteInRange,
  applyInterval,
  getIntervalKey,
  getIntervalAbbreviation,
  getIntervalDistractors,
  shuffle,
  ALL_INTERVALS,
} from '../../utils/musicTheory';
import { audioEngine } from '../../audio/audioEngine';
import { Feedback } from '../../components/feedback/Feedback';
import { ExerciseWrapper } from '../../components/exercise/ExerciseWrapper';
import { Button, ReplayButton } from '../../components/ui';
import styles from './IntervalIdentification.module.css';

export const IntervalIdentification: React.FC<ExerciseProps> = ({ settings }) => {
  const { language } = useGlobalStore();
  const { recordAnswer, exerciseState } = useExerciseStore();

  const intervalSettings = settings as IntervalIdentificationSettings;
  const isPracticeMode = exerciseState?.isPracticeMode ?? true;

  const [currentInterval, setCurrentInterval] = useState<Interval | null>(null);
  const [firstNote, setFirstNote] = useState<Note | null>(null);
  const [secondNote, setSecondNote] = useState<Note | null>(null);
  const [options, setOptions] = useState<Interval[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  // In-exercise noteGap control (0-5 seconds, stored in seconds)
  const [noteGap, setNoteGap] = useState(2);

  // Track if current playback is melodic (for showing slider)
  const [isMelodicPlayback, setIsMelodicPlayback] = useState(
    intervalSettings.melodicOrHarmonic === 'melodic' || intervalSettings.melodicOrHarmonic === 'both'
  );

  // In practice mode: unlimited replays
  const maxReplays = isPracticeMode ? Infinity : (intervalSettings.replayLimit ?? Infinity);
  const availableIntervals = intervalSettings.intervals.length > 0
    ? intervalSettings.intervals
    : ALL_INTERVALS.filter((i) => i.semitones <= 12);

  const defaultNoteRange = {
    low: { name: 'C' as const, octave: 3, accidental: 'natural' as const },
    high: { name: 'C' as const, octave: 5, accidental: 'natural' as const },
  };
  const prevQuestionRef = useRef<string | null>(null);

  const generateQuestion = useCallback(() => {
    let interval: Interval;
    let note1: Note;
    let note2: Note;
    let direction: 'above' | 'below';
    let questionKey: string;
    let attempts = 0;

    // Octave span setting - how many octaves the interval can span
    const octaveSpan = intervalSettings.octaveSpan ?? 1;

    do {
      // Pick random interval from available intervals
      interval = availableIntervals[Math.floor(Math.random() * availableIntervals.length)];

      // Generate first note
      note1 = randomNoteInRange(defaultNoteRange, false);

      // Determine direction
      direction = 'above';
      if (intervalSettings.direction === 'descending') {
        direction = 'below';
      } else if (intervalSettings.direction === 'both') {
        direction = Math.random() > 0.5 ? 'above' : 'below';
      }

      // Calculate second note - optionally add extra octaves based on octaveSpan
      const extraOctaves = octaveSpan > 1 ? Math.floor(Math.random() * octaveSpan) : 0;
      const extendedInterval: Interval = {
        ...interval,
        semitones: interval.semitones + extraOctaves * 12,
      };
      note2 = applyInterval(note1, extendedInterval, direction);
      questionKey = `${note1.name}${note1.octave}-${interval.semitones}-${extraOctaves}-${direction}`;
      attempts++;
    } while (questionKey === prevQuestionRef.current && attempts < 10);
    prevQuestionRef.current = questionKey;

    // Generate distractors
    const distractors = getIntervalDistractors(interval, 3);
    const allOptions = shuffle([interval, ...distractors]);

    setCurrentInterval(interval);
    setFirstNote(note1);
    setSecondNote(note2);
    setOptions(allOptions);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
    setReplaysUsed(0);
    setHasPlayedOnce(false);
    setShowCorrectAnswer(false);
  }, [intervalSettings, availableIntervals]);

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update isMelodicPlayback when settings change
  useEffect(() => {
    setIsMelodicPlayback(
      intervalSettings.melodicOrHarmonic === 'melodic' || intervalSettings.melodicOrHarmonic === 'both'
    );
  }, [intervalSettings.melodicOrHarmonic]);

  // No auto-play - user must press button to hear
  const handlePlay = async () => {
    if (!firstNote || !secondNote || showFeedback) return;

    const isMelodic = intervalSettings.melodicOrHarmonic === 'melodic' ||
      (intervalSettings.melodicOrHarmonic === 'both' && Math.random() > 0.5);

    if (isMelodic) {
      // Use local noteGap state (convert seconds to milliseconds)
      const gapMs = noteGap * 1000;
      await audioEngine.playNote(firstNote, 0.6);
      await new Promise((resolve) => setTimeout(resolve, gapMs));
      await audioEngine.playNote(secondNote, 0.6);
    } else {
      await audioEngine.playInterval(firstNote, secondNote);
    }

    if (!hasPlayedOnce) {
      setHasPlayedOnce(true);
    } else {
      setReplaysUsed((prev) => prev + 1);
    }
  };

  const handleAnswer = (selectedInterval: Interval) => {
    if (showFeedback || !currentInterval) return;

    const correct = selectedInterval.semitones === currentInterval.semitones;
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    setIsCorrect(correct);
    setShowFeedback(true);

    if (!correct) {
      setShowCorrectAnswer(true);
    }

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

  const canReplay = hasPlayedOnce ? replaysUsed < maxReplays : true;
  const replaysRemaining = maxReplays === Infinity ? '∞' : maxReplays - replaysUsed;

  return (
    <ExerciseWrapper onSkip={generateQuestion}>
      <div className={styles.exercise}>
        <p className={styles.instruction}>{t('instruction.identifyInterval', language)}</p>

        <ReplayButton
          onClick={handlePlay}
          disabled={!canReplay || showFeedback}
          replaysRemaining={hasPlayedOnce ? replaysRemaining : undefined}
          showCount={hasPlayedOnce && maxReplays !== Infinity}
          aria-label={t('exercise.replay', language)}
        />

        {/* Note Gap Slider - only show for melodic mode */}
        {isMelodicPlayback && !showFeedback && (
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
