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

      {/* Question count */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.questionCount', language)}</label>
        <input
          type="number"
          className={styles.numberInput}
          min={1}
          max={100}
          value={typeof holSettings.questionCount === 'number' ? holSettings.questionCount : 20}
          onChange={(e) => {
            const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 20));
            updateSetting('questionCount', value);
          }}
        />
      </div>

      {/* Time limit - only show for quiz mode */}
      {!isPracticeMode && (
        <div className={styles.field}>
          <label className={styles.label}>{t('settings.timeLimit', language)}</label>
          <div className={styles.buttonGroup}>
            {[null, 5, 10, 15].map((limit) => (
              <button
                key={limit ?? 'none'}
                className={`${styles.optionButton} ${holSettings.timeLimit === limit ? styles.active : ''}`}
                onClick={() => updateSetting('timeLimit', limit)}
              >
                {limit === null ? t('value.off', language) : `${limit}s`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
