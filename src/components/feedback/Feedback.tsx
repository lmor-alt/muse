import React, { useState } from 'react';
import { useGlobalStore } from '../../stores/globalStore';
import { t } from '../../i18n/translations';
import styles from './Feedback.module.css';

interface FeedbackProps {
  isCorrect: boolean;
  correctAnswer?: string;
  explanation?: string;
  onNext: () => void;
}

export const Feedback: React.FC<FeedbackProps> = ({
  isCorrect,
  correctAnswer,
  explanation,
  onNext,
}) => {
  const { language } = useGlobalStore();
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div
      className={`${styles.feedback} ${isCorrect ? styles.correct : styles.incorrect}`}
    >
      <div className={styles.content}>
        <div className={styles.icon}>{isCorrect ? '✓' : '✗'}</div>

        <div className={styles.message}>
          <span className={styles.status}>
            {isCorrect
              ? t('feedback.correct', language)
              : t('feedback.incorrect', language)}
          </span>

          {!isCorrect && correctAnswer && (
            <span className={styles.answer}>
              {t('feedback.theAnswerWas', language)}: <strong>{correctAnswer}</strong>
            </span>
          )}
        </div>

        {explanation && !isCorrect && (
          <button
            className={styles.whyButton}
            onClick={() => setShowExplanation(!showExplanation)}
          >
            {t('feedback.why', language)}
          </button>
        )}
      </div>

      {showExplanation && explanation && (
        <div className={styles.explanation}>{explanation}</div>
      )}

      <button className={styles.nextButton} onClick={onNext} autoFocus>
        {t('game.next', language)}
      </button>
    </div>
  );
};
