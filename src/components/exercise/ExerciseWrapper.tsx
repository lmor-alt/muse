import React, { useState, useEffect, useRef } from 'react';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t } from '../../i18n/translations';
import { Button } from '../ui';
import styles from './ExerciseWrapper.module.css';

interface ExerciseWrapperProps {
  children: React.ReactNode;
  showSkip?: boolean;
  onSkip?: () => void;
  timeLimit?: number | null; // seconds per question, null = no limit
  onTimeout?: () => void; // called when time runs out
  pauseTimer?: boolean; // pause the timer (e.g., when showing feedback)
}

export const ExerciseWrapper: React.FC<ExerciseWrapperProps> = ({
  children,
  showSkip = true,
  onSkip,
  timeLimit = null,
  onTimeout,
  pauseTimer = false,
}) => {
  const { language } = useGlobalStore();
  const { exerciseState, skipQuestion, completeExercise } = useExerciseStore();

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number | null>(timeLimit);
  const [timerVisible, setTimerVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTimedOut = useRef(false);
  const wasPaused = useRef(pauseTimer);

  // Reset timer when transitioning from paused (feedback) to active (new question)
  useEffect(() => {
    if (wasPaused.current && !pauseTimer && timeLimit !== null) {
      // Transitioning from paused to active - reset timer
      hasTimedOut.current = false;
      setTimeRemaining(timeLimit);
    }
    wasPaused.current = pauseTimer;
  }, [pauseTimer, timeLimit]);

  // Initialize timer on mount or when timeLimit changes
  useEffect(() => {
    if (timeLimit !== null) {
      setTimeRemaining(timeLimit);
    }
  }, [timeLimit]);

  // Timer countdown (paused when pauseTimer is true)
  useEffect(() => {
    if (timeLimit === null || timeRemaining === null || timeRemaining <= 0 || pauseTimer) {
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return null;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeRemaining, timeLimit, pauseTimer]);

  // Handle timeout
  useEffect(() => {
    if (timeRemaining === 0 && !hasTimedOut.current) {
      hasTimedOut.current = true;
      if (onTimeout) {
        onTimeout();
      } else {
        // Default behavior: skip the question
        skipQuestion();
        onSkip?.();
      }
    }
  }, [timeRemaining, onTimeout, skipQuestion, onSkip]);

  if (!exerciseState) return null;

  const {
    currentQuestion,
    totalQuestions,
    score,
  } = exerciseState;

  const isEndless = totalQuestions === 'endless';

  const handleSkip = () => {
    skipQuestion();
    onSkip?.();
  };

  const handleQuit = () => {
    completeExercise();
  };

  // Format time remaining for display
  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  // Determine timer urgency for styling
  const timerUrgency = timeRemaining !== null && timeRemaining <= 3 ? 'critical' :
                       timeRemaining !== null && timeRemaining <= 5 ? 'warning' : 'normal';

  return (
    <div className={styles.wrapper}>
      {/* Header with question count and stats */}
      <div className={styles.header}>
        <span className={styles.questionCount}>
          {t('game.question', language)} {currentQuestion}
          {!isEndless && ` ${t('game.of', language)} ${totalQuestions}`}
        </span>

        {/* Timer display with visibility toggle */}
        {timeLimit !== null && timeRemaining !== null && (
          <div className={styles.timerContainer}>
            {timerVisible ? (
              <span className={`${styles.timer} ${styles[timerUrgency]}`}>
                {formatTime(timeRemaining)}
              </span>
            ) : (
              <span className={styles.timerHidden}>--</span>
            )}
            <button
              className={styles.timerToggle}
              onClick={() => setTimerVisible(!timerVisible)}
              aria-label={timerVisible ? 'Hide timer' : 'Show timer'}
            >
              {timerVisible ? '👁' : '👁‍🗨'}
            </button>
          </div>
        )}

        <span className={styles.score}>SCORE: {score}</span>
      </div>

      {/* Main content */}
      <div className={styles.content}>{children}</div>

      {/* Actions */}
      <div className={styles.actions}>
        {showSkip && (
          <Button variant="ghost" onClick={handleSkip}>
            {t('game.skip', language)}
          </Button>
        )}
        {isEndless && (
          <Button variant="secondary" onClick={handleQuit}>
            {t('game.quit', language)}
          </Button>
        )}
      </div>
    </div>
  );
};
