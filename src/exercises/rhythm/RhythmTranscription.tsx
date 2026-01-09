import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ExerciseProps, RhythmTranscriptionSettings, RhythmEvent, RhythmValue, TimeSignature } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t } from '../../i18n/translations';
import { audioEngine } from '../../audio/audioEngine';
import { Feedback } from '../../components/feedback/Feedback';
import { ExerciseWrapper } from '../../components/exercise/ExerciseWrapper';
import { Button, ReplayButton } from '../../components/ui';
import { RhythmStaff, getBeatValue, calculateTotalBeats } from '../../components/staff/RhythmStaff';
import styles from './RhythmTranscription.module.css';

// Beat values in terms of quarter notes
const BEAT_VALUES: Record<RhythmValue, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
};

// Fixed note values for this exercise
const NOTE_VALUES: RhythmValue[] = ['quarter', 'eighth'];

// Generate a random rhythm pattern that fills the bars
function generateRhythmPattern(
  timeSignature: TimeSignature,
  bars: number,
  noteValues: RhythmValue[],
  includeRests: boolean
): RhythmEvent[] {
  const beatsPerBar = timeSignature[0];
  const totalBeats = beatsPerBar * bars;
  const events: RhythmEvent[] = [];
  let currentBeats = 0;

  // Sort note values by beat value (largest first) for better pattern generation
  const sortedValues = [...noteValues].sort((a, b) => BEAT_VALUES[b] - BEAT_VALUES[a]);

  while (currentBeats < totalBeats) {
    const remainingBeats = totalBeats - currentBeats;

    // Filter values that fit in remaining space
    const validValues = sortedValues.filter(v => BEAT_VALUES[v] <= remainingBeats);
    if (validValues.length === 0) break;

    // Pick a random value
    const value = validValues[Math.floor(Math.random() * validValues.length)];

    // Decide if it's a rest (but not the first event)
    const isRest = includeRests && events.length > 0 && Math.random() < 0.25;

    events.push({ value, isRest });
    currentBeats += BEAT_VALUES[value];
  }

  return events;
}

// Check if two rhythm patterns match
function rhythmsMatch(userEvents: RhythmEvent[], correctEvents: RhythmEvent[]): boolean {
  if (userEvents.length !== correctEvents.length) return false;
  return userEvents.every((event, i) =>
    event.value === correctEvents[i].value &&
    event.isRest === correctEvents[i].isRest
  );
}

// Convert events to display string
function eventsToString(events: RhythmEvent[]): string {
  return events.map(e => `${e.isRest ? 'R' : 'N'}:${e.value}`).join(' ');
}

// Randomly select time signature (4/4 or 3/4)
function getRandomTimeSignature(): TimeSignature {
  return Math.random() < 0.5 ? [4, 4] : [3, 4];
}

export const RhythmTranscription: React.FC<ExerciseProps> = ({ settings }) => {
  const { language, soundEnabled } = useGlobalStore();
  const { recordAnswer, exerciseState } = useExerciseStore();

  const isPracticeMode = exerciseState?.isPracticeMode ?? true;
  const rhythmSettings = settings as RhythmTranscriptionSettings;
  const tempo = rhythmSettings.tempo || 30;

  // Fixed values
  const bars = 1;
  const includeRests = true;

  // Exercise state
  const [currentTimeSignature, setCurrentTimeSignature] = useState<TimeSignature>([4, 4]);
  const [currentRhythm, setCurrentRhythm] = useState<RhythmEvent[] | null>(null);
  const [userEvents, setUserEvents] = useState<RhythmEvent[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingEventIndex, setPlayingEventIndex] = useState<number | null>(null);

  // Metronome state
  const [metronomeEnabled, setMetronomeEnabled] = useState(true);
  const playbackAbortRef = useRef<boolean>(false);

  const maxReplays = isPracticeMode ? Infinity : (rhythmSettings.replayLimit ?? Infinity);
  const beatsPerBar = currentTimeSignature[0];
  const totalBeats = beatsPerBar * bars;
  const prevRhythmRef = useRef<string | null>(null);

  const generateQuestion = useCallback(() => {
    // Abort any ongoing playback
    playbackAbortRef.current = true;

    // Random time signature for each question
    const timeSignature = getRandomTimeSignature();
    setCurrentTimeSignature(timeSignature);

    let rhythm: RhythmEvent[];
    let rhythmKey: string;
    let attempts = 0;

    do {
      rhythm = generateRhythmPattern(
        timeSignature,
        bars,
        NOTE_VALUES,
        includeRests
      );
      rhythmKey = eventsToString(rhythm);
      attempts++;
    } while (rhythmKey === prevRhythmRef.current && attempts < 10);

    prevRhythmRef.current = rhythmKey;

    setCurrentRhythm(rhythm);
    setUserEvents([]);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
    setReplaysUsed(0);
    setHasPlayed(false);
    setPlayingEventIndex(null);
    setIsPlaying(false);

    // Reset abort flag for new question
    setTimeout(() => {
      playbackAbortRef.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    generateQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-play rhythm when question changes
  useEffect(() => {
    if (currentRhythm && soundEnabled && !hasPlayed && !playbackAbortRef.current) {
      const timer = setTimeout(() => {
        if (!playbackAbortRef.current) {
          playRhythmWithMetronome(currentRhythm);
        }
      }, 500);
      setHasPlayed(true);
      return () => clearTimeout(timer);
    }
  }, [currentRhythm, soundEnabled, hasPlayed]);

  // Play rhythm synchronized with metronome
  const playRhythmWithMetronome = async (events: RhythmEvent[]) => {
    if (isPlaying || tempo === 0) return;
    setIsPlaying(true);
    playbackAbortRef.current = false;

    const beatDuration = 60000 / tempo; // ms per quarter note
    const note = { name: 'C' as const, octave: 5, accidental: 'natural' as const };

    // Count-in: play metronome for one bar before rhythm starts
    if (metronomeEnabled) {
      for (let i = 0; i < beatsPerBar; i++) {
        if (playbackAbortRef.current) {
          setIsPlaying(false);
          return;
        }
        audioEngine.playMetronomeClick(i === 0);
        await new Promise((resolve) => setTimeout(resolve, beatDuration));
      }
    }

    // Play the rhythm with metronome clicks on each beat
    let currentBeat = 0;

    for (let i = 0; i < events.length; i++) {
      if (playbackAbortRef.current) {
        setIsPlaying(false);
        setPlayingEventIndex(null);
        return;
      }

      setPlayingEventIndex(i);
      const event = events[i];
      const eventBeats = BEAT_VALUES[event.value];
      const eventDuration = beatDuration * eventBeats;

      // Play metronome click at the start of this event if it falls on a beat
      if (metronomeEnabled && currentBeat % 1 === 0) {
        const isDownbeat = currentBeat % beatsPerBar === 0;
        audioEngine.playMetronomeClick(isDownbeat);
      }

      // Play the note (or silence for rest)
      if (!event.isRest) {
        audioEngine.playNote(note, eventDuration / 1000 * 0.8);
      }

      // Wait for the event duration, playing metronome clicks on intermediate beats
      const startTime = Date.now();
      const endTime = startTime + eventDuration;
      let nextMetronomeBeat = Math.ceil(currentBeat + 0.001); // Next whole beat

      while (Date.now() < endTime) {
        if (playbackAbortRef.current) {
          setIsPlaying(false);
          setPlayingEventIndex(null);
          return;
        }

        const elapsed = (Date.now() - startTime) / beatDuration;
        const currentPosition = currentBeat + elapsed;

        // Check if we've reached the next beat for a metronome click
        if (metronomeEnabled && currentPosition >= nextMetronomeBeat && nextMetronomeBeat < currentBeat + eventBeats) {
          const isDownbeat = nextMetronomeBeat % beatsPerBar === 0;
          audioEngine.playMetronomeClick(isDownbeat);
          nextMetronomeBeat++;
        }

        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      currentBeat += eventBeats;
    }

    setPlayingEventIndex(null);
    setIsPlaying(false);
  };

  const handleReplay = async () => {
    if (!currentRhythm || replaysUsed >= maxReplays || showFeedback || isPlaying) return;
    await playRhythmWithMetronome(currentRhythm);
    setReplaysUsed((prev) => prev + 1);
  };

  // Direct tap: clicking a note type adds it immediately
  const handleAddNote = (value: RhythmValue, isRest: boolean) => {
    if (showFeedback) return;

    const currentUserBeats = calculateTotalBeats(userEvents);
    const eventBeats = getBeatValue(value);

    // Check if adding this event would exceed total beats
    if (currentUserBeats + eventBeats > totalBeats) return;

    setUserEvents([...userEvents, { value, isRest }]);
  };

  const handleRemoveLastEvent = () => {
    if (showFeedback || userEvents.length === 0) return;
    setUserEvents(userEvents.slice(0, -1));
  };

  const handleEventClick = (index: number) => {
    if (showFeedback) return;
    // Remove clicked event and all after it
    setUserEvents(userEvents.slice(0, index));
  };

  const handleSubmit = () => {
    if (!currentRhythm) return;

    const correct = rhythmsMatch(userEvents, currentRhythm);
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    setIsCorrect(correct);
    setShowFeedback(true);

    const userPattern = eventsToString(userEvents);
    const correctPattern = eventsToString(currentRhythm);

    recordAnswer(correct, userPattern, correctPattern, timeSpent);
  };

  const handleClear = () => {
    setUserEvents([]);
  };

  const handleNext = () => {
    generateQuestion();
  };

  if (!currentRhythm) return null;

  const canReplay = replaysUsed < maxReplays;
  const replaysRemaining = maxReplays === Infinity ? undefined : maxReplays - replaysUsed;
  const currentUserBeats = calculateTotalBeats(userEvents);

  return (
    <ExerciseWrapper onSkip={generateQuestion}>
      <div className={styles.exercise}>
        <p className={styles.instruction}>{t('instruction.transcribeRhythm', language)}</p>

        {/* Replay Button + Metronome Toggle */}
        <div className={styles.audioControls}>
          <ReplayButton
            onClick={handleReplay}
            disabled={!canReplay || showFeedback || isPlaying}
            replaysRemaining={replaysRemaining}
            showCount={!isPracticeMode}
            size="lg"
          />
          <button
            className={`${styles.metronomeToggle} ${metronomeEnabled ? styles.active : ''}`}
            onClick={() => setMetronomeEnabled(!metronomeEnabled)}
            title={t('rhythm.metronome', language)}
          >
            <span className={styles.metronomeIcon}>♩</span>
          </button>
        </div>

        {/* User's Rhythm Staff */}
        <div className={styles.staffContainer}>
          <div className={styles.staffLabel}>{t('exercise.yourAnswer', language)}</div>
          <RhythmStaff
            timeSignature={currentTimeSignature}
            bars={bars}
            events={userEvents}
            onEventClick={handleEventClick}
            interactive={!showFeedback}
            highlightIndex={playingEventIndex ?? undefined}
            showCorrect={showFeedback ? currentRhythm : undefined}
            width={Math.max(600, 150 * bars)}
            height={140}
          />
          <div className={styles.beatsInfo}>
            {currentUserBeats} / {totalBeats} {t('rhythm.beats', language)}
          </div>
        </div>

        {/* Note Palette - Direct Tap */}
        {!showFeedback && (
          <div className={styles.notePalette}>
            <div className={styles.paletteSection}>
              <span className={styles.paletteLabel}>{t('rhythm.note', language)}</span>
              <div className={styles.paletteButtons}>
                {NOTE_VALUES.map((value) => {
                  const wouldExceed = currentUserBeats + getBeatValue(value) > totalBeats;
                  return (
                    <button
                      key={`note-${value}`}
                      className={`${styles.paletteButton} ${wouldExceed ? styles.disabled : ''}`}
                      onClick={() => handleAddNote(value, false)}
                      disabled={wouldExceed}
                    >
                      {t(`rhythm.${value}`, language)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.paletteSection}>
              <span className={styles.paletteLabel}>{t('rhythm.rest', language)}</span>
              <div className={styles.paletteButtons}>
                {NOTE_VALUES.map((value) => {
                  const wouldExceed = currentUserBeats + getBeatValue(value) > totalBeats;
                  return (
                    <button
                      key={`rest-${value}`}
                      className={`${styles.paletteButton} ${styles.restButton} ${wouldExceed ? styles.disabled : ''}`}
                      onClick={() => handleAddNote(value, true)}
                      disabled={wouldExceed}
                    >
                      {t(`rhythm.${value}`, language)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.paletteActions}>
              <Button
                variant="ghost"
                onClick={handleRemoveLastEvent}
                disabled={userEvents.length === 0}
              >
                {t('rhythm.undo', language)}
              </Button>
              <Button variant="ghost" onClick={handleClear} disabled={userEvents.length === 0}>
                {t('game.clear', language)}
              </Button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!showFeedback && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={userEvents.length === 0}
          >
            {t('game.submit', language)}
          </Button>
        )}

        {/* Feedback */}
        {showFeedback && (
          <Feedback
            isCorrect={isCorrect}
            correctAnswer={currentRhythm.map(e =>
              `${t(`rhythm.${e.value}`, language)}${e.isRest ? ` (${t('rhythm.rest', language)})` : ''}`
            ).join(' → ')}
            onNext={handleNext}
          />
        )}
      </div>
    </ExerciseWrapper>
  );
};
