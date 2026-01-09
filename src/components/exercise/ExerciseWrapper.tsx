import React from 'react';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t } from '../../i18n/translations';
import { Button } from '../ui';
import styles from './ExerciseWrapper.module.css';

interface ExerciseWrapperProps {
  children: React.ReactNode;
  showSkip?: boolean;
  onSkip?: () => void;
}

export const ExerciseWrapper: React.FC<ExerciseWrapperProps> = ({
  children,
  showSkip = true,
  onSkip,
}) => {
  const { language } = useGlobalStore();
  const { exerciseState, skipQuestion, completeExercise } = useExerciseStore();

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

  return (
    <div className={styles.wrapper}>
      {/* Header with question count and stats */}
      <div className={styles.header}>
        <span className={styles.questionCount}>
          {t('game.question', language)} {currentQuestion}
          {!isEndless && ` ${t('game.of', language)} ${totalQuestions}`}
        </span>

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
