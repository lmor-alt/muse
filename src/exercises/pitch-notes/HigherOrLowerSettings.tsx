import React from 'react';
import type { ExerciseSettingsProps, HigherOrLowerSettings as Settings } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { t } from '../../i18n/translations';
import styles from './ExerciseSettings.module.css';

export const HigherOrLowerSettings: React.FC<ExerciseSettingsProps> = ({
  settings,
  onChange,
  isPracticeMode = true,
}) => {
  const { language } = useGlobalStore();
  const holSettings = settings as Settings;

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...holSettings, [key]: value });
  };

  return (
    <div className={styles.settings}>
      {/* Difficulty */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.difficulty', language)}</label>
        <div className={styles.buttonGroup}>
          {(['easy', 'medium', 'hard'] as const).map((diff) => (
            <button
              key={diff}
              className={`${styles.optionButton} ${holSettings.difficulty === diff ? styles.active : ''}`}
              onClick={() => updateSetting('difficulty', diff)}
            >
              {t(`value.${diff}`, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Question count - only show for quiz mode */}
      {!isPracticeMode && (
        <div className={styles.field}>
          <label className={styles.label}>{t('settings.questionCount', language)}</label>
          <div className={styles.buttonGroup}>
            {[10, 20, 30].map((count) => (
              <button
                key={count}
                className={`${styles.optionButton} ${holSettings.questionCount === count ? styles.active : ''}`}
                onClick={() => updateSetting('questionCount', count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
