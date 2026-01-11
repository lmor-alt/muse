import React, { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ExerciseProps,
  Note,
  Interval,
  Accidental,
  IntervalQuizSettings,
  IntervalQuizModule,
  Clef,
} from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t, getNoteName, type TranslationKey } from '../../i18n/translations';
import {
  randomNoteInRange,
  applyInterval,
  areEnharmonic,
  getIntervalKey,
  getIntervalAbbreviation,
  getIntervalDistractors,
  shuffle,
  ALL_INTERVALS,
} from '../../utils/musicTheory';
import { audioEngine } from '../../audio/audioEngine';
import { Staff } from '../../components/staff/Staff';
import { InteractiveStaff } from '../../components/staff/InteractiveStaff';
import { AccidentalToolbar } from '../../components/ui/AccidentalToolbar';
import { Feedback } from '../../components/feedback/Feedback';
import { ExerciseWrapper } from '../../components/exercise/ExerciseWrapper';
import { Button, ReplayButton } from '../../components/ui';
import styles from './IntervalQuiz.module.css';

export const IntervalQuiz: React.FC<ExerciseProps> = ({ settings }) => {
  const { language } = useGlobalStore();
  const { recordAnswer, exerciseState } = useExerciseStore();

  const quizSettings = settings as IntervalQuizSettings;
  const isPracticeMode = exerciseState?.isPracticeMode ?? true;

  // Current module being tested
  const [currentModule, setCurrentModule] = useState<IntervalQuizModule>('ear');

  // Shared state
  const [currentInterval, setCurrentInterval] = useState<Interval | null>(null);
  const [firstNote, setFirstNote] = useState<Note | null>(null);
  const [secondNote, setSecondNote] = useState<Note | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Ear module state
  const [options, setOptions] = useState<Interval[]>([]);
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  // Read module state
  const [currentClef, setCurrentClef] = useState<Clef>('treble');

  // Write module state
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [drawnNotes, setDrawnNotes] = useState<Note[]>([]);
  const [selectedAccidental, setSelectedAccidental] = useState<Accidental>('natural');

  const maxReplays = isPracticeMode ? Infinity : (quizSettings.replayLimit ?? Infinity);

  const availableIntervals = quizSettings.intervals.length > 0
    ? quizSettings.intervals
    : ALL_INTERVALS.filter((i) => i.semitones <= 12 && i.semitones > 0);

  const enabledModules = quizSettings.modules.length > 0
    ? quizSettings.modules
    : ['ear', 'read', 'write'] as IntervalQuizModule[];

  const prevIntervalRef = useRef<number | null>(null);

  // Note ranges for different contexts
  const noteRanges = {
    ear: {
      low: { name: 'C' as const, octave: 3, accidental: 'natural' as const },
      high: { name: 'C' as const, octave: 5, accidental: 'natural' as const },
    },
    read: {
      treble: {
        low: { name: 'C' as const, octave: 4, accidental: 'natural' as const },
        high: { name: 'G' as const, octave: 5, accidental: 'natural' as const },
      },
      bass: {
        low: { name: 'E' as const, octave: 2, accidental: 'natural' as const },
        high: { name: 'C' as const, octave: 4, accidental: 'natural' as const },
      },
    },
    write: {
      low: { name: 'C' as const, octave: 4, accidental: 'natural' as const },
      high: { name: 'B' as const, octave: 4, accidental: 'natural' as const },
    },
  };

  // Select module based on distribution
  const selectModule = useCallback((): IntervalQuizModule => {
    if (enabledModules.length === 1) return enabledModules[0];

    if (quizSettings.distribution === 'custom' && quizSettings.customDistribution) {
      const { ear, read, write } = quizSettings.customDistribution;
      const total = ear + read + write;
      const rand = Math.random() * total;

      let cumulative = 0;
      if (enabledModules.includes('ear')) {
        cumulative += ear;
        if (rand < cumulative) return 'ear';
      }
      if (enabledModules.includes('read')) {
        cumulative += read;
        if (rand < cumulative) return 'read';
      }
      if (enabledModules.includes('write')) {
        return 'write';
      }
    }

    // Equal distribution
    return enabledModules[Math.floor(Math.random() * enabledModules.length)];
  }, [enabledModules, quizSettings.distribution, quizSettings.customDistribution]);

  const generateQuestion = useCallback(() => {
    const module = selectModule();
    setCurrentModule(module);

    let interval: Interval;
    let note1: Note;
    let note2: Note;
    let dir: 'above' | 'below' = 'above';
    let clef: Clef = 'treble';
    let attempts = 0;

    // Octave span setting - how many octaves the interval can span
    const octaveSpan = quizSettings.octaveSpan ?? 1;

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

    // Generate based on module type
    if (module === 'ear') {
      note1 = randomNoteInRange(noteRanges.ear, false);

      // Determine direction for ear
      if (quizSettings.melodicOrHarmonic !== 'harmonic') {
        dir = Math.random() > 0.5 ? 'above' : 'below';
      }
    } else if (module === 'read') {
      // Determine clef for reading
      if (quizSettings.readingClef === 'both') {
        clef = Math.random() > 0.5 ? 'treble' : 'bass';
      } else {
        clef = quizSettings.readingClef;
      }

      const range = noteRanges.read[clef];
      note1 = randomNoteInRange(range, false);
      dir = Math.random() > 0.5 ? 'above' : 'below';
    } else {
      // Write module
      note1 = randomNoteInRange(noteRanges.write, false);

      if (quizSettings.writingDirection === 'below') {
        dir = 'below';
      } else if (quizSettings.writingDirection === 'both') {
        dir = Math.random() > 0.5 ? 'above' : 'below';
      }
    }

    // Calculate second note - optionally add extra octaves based on octaveSpan
    const extraOctaves = octaveSpan > 1 ? Math.floor(Math.random() * octaveSpan) : 0;
    const extendedInterval: Interval = {
      ...interval,
      semitones: interval.semitones + extraOctaves * 12,
    };
    note2 = applyInterval(note1, extendedInterval, dir);

    setCurrentInterval(interval);
    setFirstNote(note1);
    setSecondNote(note2);
    setDirection(dir);
    setCurrentClef(clef);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());

    // Reset module-specific state
    if (module === 'ear') {
      const distractors = getIntervalDistractors(interval, 3);
      setOptions(shuffle([interval, ...distractors]));
      setReplaysUsed(0);
      setHasPlayedOnce(false);
    } else if (module === 'read') {
      const distractors = getIntervalDistractors(interval, 3);
      setOptions(shuffle([interval, ...distractors]));
    } else {
      setDrawnNotes([]);
      setSelectedAccidental('natural');
    }
  }, [availableIntervals, selectModule, quizSettings]);

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ear module: play audio
  const handlePlay = async () => {
    if (!firstNote || !secondNote || showFeedback) return;

    const isMelodic = quizSettings.melodicOrHarmonic === 'melodic' ||
      (quizSettings.melodicOrHarmonic === 'both' && Math.random() > 0.5);

    if (isMelodic) {
      const noteGap = quizSettings.noteGap ?? 600;
      await audioEngine.playNote(firstNote, 0.6);
      await new Promise((resolve) => setTimeout(resolve, noteGap));
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

  // Handle button answer (ear and read modules)
  const handleButtonAnswer = (selectedInterval: Interval) => {
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

  // Handle write module submit
  const handleWriteSubmit = () => {
    if (!firstNote || !currentInterval || drawnNotes.length === 0) return;

    const correctNote = applyInterval(firstNote, currentInterval, direction);
    const correct = areEnharmonic(drawnNotes[0], correctNote);
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    setIsCorrect(correct);
    setShowFeedback(true);

    const drawnNoteName = `${getNoteName(drawnNotes[0].name, language)}${drawnNotes[0].accidental === 'sharp' ? '♯' : drawnNotes[0].accidental === 'flat' ? '♭' : ''}`;
    const correctNoteName = `${getNoteName(correctNote.name, language)}${correctNote.accidental === 'sharp' ? '♯' : correctNote.accidental === 'flat' ? '♭' : ''}`;

    recordAnswer(correct, drawnNoteName, correctNoteName, timeSpent);
  };

  const handleClear = () => {
    setDrawnNotes([]);
  };

  const handleNext = () => {
    generateQuestion();
  };

  if (!currentInterval || !firstNote || !secondNote) return null;

  const canReplay = hasPlayedOnce ? replaysUsed < maxReplays : true;
  const replaysRemaining = maxReplays === Infinity ? '∞' : maxReplays - replaysUsed;

  // Module badge
  const moduleBadge = (
    <div className={styles.moduleBadge}>
      {currentModule === 'ear' && t('quiz.module.ear', language)}
      {currentModule === 'read' && t('quiz.module.read', language)}
      {currentModule === 'write' && t('quiz.module.write', language)}
    </div>
  );

  // Render ear module
  const renderEarModule = () => (
    <>
      <p className={styles.instruction}>{t('instruction.identifyInterval', language)}</p>

      <ReplayButton
        onClick={handlePlay}
        disabled={!canReplay || showFeedback}
        replaysRemaining={hasPlayedOnce ? replaysRemaining : undefined}
        showCount={hasPlayedOnce && maxReplays !== Infinity}
        aria-label={t('exercise.replay', language)}
      />

      {!showFeedback && (
        <div className={styles.options}>
          {options.map((interval, index) => (
            <Button
              key={index}
              variant="brass"
              size="lg"
              onClick={() => handleButtonAnswer(interval)}
            >
              {t(getIntervalKey(interval) as TranslationKey, language)} ({getIntervalAbbreviation(interval, language)})
            </Button>
          ))}
        </div>
      )}
    </>
  );

  // Render read module
  const renderReadModule = () => (
    <>
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
              variant="brass"
              size="lg"
              onClick={() => handleButtonAnswer(interval)}
            >
              {t(getIntervalKey(interval) as TranslationKey, language)} ({getIntervalAbbreviation(interval, language)})
            </Button>
          ))}
        </div>
      )}
    </>
  );

  // Render write module
  const renderWriteModule = () => {
    const intervalName = t(getIntervalKey(currentInterval) as TranslationKey, language);
    const directionText = direction === 'above'
      ? t('value.above', language).toLowerCase()
      : t('value.below', language).toLowerCase();

    return (
      <>
        <p className={styles.instruction}>
          {t('instruction.drawInterval', language)
            .replace('{interval}', intervalName)
            .replace('{direction}', directionText)}
        </p>

        <div className={styles.staffContainer}>
          <InteractiveStaff
            clef="treble"
            notes={[firstNote, ...drawnNotes]}
            onNotesChange={(notes) => {
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
              onClick={handleWriteSubmit}
              disabled={drawnNotes.length === 0}
            >
              {t('game.submit', language)}
            </Button>
          </>
        )}
      </>
    );
  };

  return (
    <ExerciseWrapper onSkip={generateQuestion}>
      <div className={styles.exercise}>
        {moduleBadge}

        {currentModule === 'ear' && renderEarModule()}
        {currentModule === 'read' && renderReadModule()}
        {currentModule === 'write' && renderWriteModule()}

        {showFeedback && (
          <Feedback
            isCorrect={isCorrect}
            correctAnswer={
              currentModule === 'write'
                ? `${getNoteName(applyInterval(firstNote, currentInterval, direction).name, language)}${applyInterval(firstNote, currentInterval, direction).accidental === 'sharp' ? '♯' : applyInterval(firstNote, currentInterval, direction).accidental === 'flat' ? '♭' : ''}`
                : t(getIntervalKey(currentInterval) as TranslationKey, language)
            }
            onNext={handleNext}
          />
        )}
      </div>
    </ExerciseWrapper>
  );
};
