import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../stores/globalStore';
import { t } from '../i18n/translations';
import { categories } from '../exercises/registry';
import { Header, Card } from '../components/ui';
import styles from './Home.module.css';

// Category descriptions for the home page
const categoryDescriptions: Record<string, { en: string; nl: string }> = {
  'pitch-notes': {
    en: 'Identify notes and pitches',
    nl: 'Herken noten en toonhoogtes',
  },
  intervals: {
    en: 'Recognize musical distances',
    nl: 'Herken muzikale afstanden',
  },
  chords: {
    en: 'Build and identify chords',
    nl: 'Bouw en herken akkoorden',
  },
  rhythm: {
    en: 'Master timing and beats',
    nl: 'Beheers timing en ritme',
  },
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useGlobalStore();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.heroTagline}>
            {language === 'en'
              ? 'Train your ear, refine your craft'
              : 'Train je gehoor, verfijn je vak'}
          </p>
        </section>

        <div className={styles.categories}>
          {categories.map((category) => (
            <Card
              key={category.id}
              className={styles.categoryCard}
              onClick={() => handleCategoryClick(category.id)}
              interactive
              padding="none"
            >
              <div className={styles.categoryIconWrapper}>
                <span className={styles.categoryIcon}>{category.icon}</span>
              </div>
              <div className={styles.categoryContent}>
                <h2 className={styles.categoryName}>
                  {t(
                    category.nameKey as keyof typeof import('../i18n/translations').translations.en,
                    language
                  )}
                </h2>
                <p className={styles.categoryDescription}>
                  {categoryDescriptions[category.id]?.[language] || ''}
                </p>
                <span className={styles.categoryCount}>
                  {category.exercises.length}{' '}
                  {language === 'en' ? 'exercises' : 'oefeningen'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};
