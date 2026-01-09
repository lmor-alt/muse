import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../stores/globalStore';
import { t } from '../i18n/translations';
import { getCategory, getExercisesForCategory } from '../exercises/registry';
import type { CategoryId } from '../types';
import { Header, Card } from '../components/ui';
import styles from './Category.module.css';

// Category subtitles
const categorySubtitles: Record<string, { en: string; nl: string }> = {
  'pitch-notes': {
    en: 'Develop your pitch recognition skills',
    nl: 'Ontwikkel je toonhoogte-herkenning',
  },
  intervals: {
    en: 'Learn to identify musical distances',
    nl: 'Leer muzikale afstanden herkennen',
  },
  chords: {
    en: 'Master chord construction and recognition',
    nl: 'Beheers akkoord opbouw en herkenning',
  },
  rhythm: {
    en: 'Sharpen your sense of timing',
    nl: 'Verscherp je gevoel voor timing',
  },
};

export const Category: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { language } = useGlobalStore();

  const category = getCategory(categoryId as CategoryId);
  const exercises = getExercisesForCategory(categoryId as CategoryId);

  if (!category) {
    return (
      <div className={styles.page}>
        <Header showBack />
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔍</span>
            <p className={styles.emptyMessage}>
              {language === 'en' ? 'Category not found' : 'Categorie niet gevonden'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const handleExerciseClick = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };

  const categoryName = t(
    category.nameKey as keyof typeof import('../i18n/translations').translations.en,
    language
  );

  return (
    <div className={styles.page}>
      <Header showBack />

      <main className={styles.main}>
        <header className={styles.categoryHeader}>
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>{category.icon}</span>
          </div>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{categoryName}</h1>
            <p className={styles.subtitle}>
              {categorySubtitles[category.id]?.[language] || ''}
            </p>
          </div>
        </header>

        <div className={styles.exercises}>
          {exercises.map((exercise, index) => {
            const isQuiz = exercise.id.endsWith('-quiz');
            return (
              <Card
                key={exercise.id}
                className={styles.exerciseCard}
                onClick={() => handleExerciseClick(exercise.id)}
                interactive
                padding="none"
              >
                <span className={styles.exerciseNumber}>
                  {isQuiz ? '📋' : index + 1}
                </span>
                <div className={styles.exerciseInfo}>
                  <h3 className={styles.exerciseName}>
                    {t(
                      exercise.nameKey as keyof typeof import('../i18n/translations').translations.en,
                      language
                    )}
                  </h3>
                  <p className={styles.exerciseDescription}>
                    {t(
                      exercise.descriptionKey as keyof typeof import('../i18n/translations').translations.en,
                      language
                    )}
                  </p>
                </div>
                <span className={styles.arrow}>→</span>
              </Card>
            );
          })}

          {exercises.length === 0 && (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📝</span>
              <p className={styles.emptyMessage}>
                {language === 'en'
                  ? 'No exercises available yet'
                  : 'Nog geen oefeningen beschikbaar'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
