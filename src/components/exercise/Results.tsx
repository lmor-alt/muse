import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../../stores/globalStore';
import { useExerciseStore } from '../../stores/exerciseStore';
import { t } from '../../i18n/translations';
import { formatTime } from '../../utils/musicTheory';
import { Button, Card } from '../ui';
import styles from './Results.module.css';

interface ResultsProps {
  onRetry: () => void;
}

export const Results: React.FC<ResultsProps> = ({ onRetry }) => {
  const navigate = useNavigate();
  const { language } = useGlobalStore();
  const { exerciseState, resetExercise, streakRecords, currentExercise } = useExerciseStore();
  const [showDetails, setShowDetails] = useState(false);

  if (!exerciseState) return null;

  const { answers, startTime, bestStreak, isPracticeMode } = exerciseState;

  const totalQuestions = answers.length;
  const correctAnswers = answers.filter((a) => a.correct).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const totalTime = Math.floor((Date.now() - startTime) / 1000);

  const previousBest = currentExercise ? streakRecords[currentExercise] ?? 0 : 0;
  const isNewRecord = bestStreak > previousBest && !isPracticeMode;

  const handleBackToExercises = () => {
    resetExercise();
    navigate(-1);
  };

  const handleRetry = () => {
    onRetry();
  };

  return (
    <div className={styles.results}>
      <h1 className={styles.title}>{t('results.title', language)}</h1>

      {isNewRecord && (
        <div className={styles.newRecord}>{t('results.newRecord', language)}</div>
      )}

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <span className={styles.statLabel}>{t('results.score', language)}</span>
          <span className={styles.statValue}>
            {correctAnswers} / {totalQuestions}
          </span>
        </Card>

        <Card className={styles.statCard}>
          <span className={styles.statLabel}>{t('results.accuracy', language)}</span>
          <span className={styles.statValue}>{accuracy}%</span>
        </Card>

        <Card className={styles.statCard}>
          <span className={styles.statLabel}>{t('results.time', language)}</span>
          <span className={styles.statValue}>{formatTime(totalTime)}</span>
        </Card>

        <Card className={styles.statCard}>
          <span className={styles.statLabel}>{t('results.bestStreak', language)}</span>
          <span className={styles.statValue}>{bestStreak}</span>
        </Card>
      </div>

      {!isPracticeMode && (
        <button
          className={styles.detailsToggle}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails
            ? t('results.hideDetails', language)
            : t('results.viewDetails', language)}
        </button>
      )}

      {showDetails && (
        <div className={styles.details}>
          {answers.map((answer, index) => (
            <div
              key={index}
              className={`${styles.answerRow} ${
                answer.correct ? styles.correct : styles.incorrect
              }`}
            >
              <span className={styles.answerNumber}>{index + 1}</span>
              <span className={styles.answerStatus}>
                {answer.skipped
                  ? t('feedback.skipped', language)
                  : answer.correct
                  ? '✓'
                  : '✗'}
              </span>
              {!answer.correct && answer.correctAnswer !== null && (
                <span className={styles.correctAnswer}>
                  {String(answer.correctAnswer)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleRetry}>
          {t('results.tryAgain', language)}
        </Button>
        <Button variant="secondary" onClick={handleBackToExercises}>
          {t('results.backToExercises', language)}
        </Button>
      </div>
    </div>
  );
};
