import React from 'react';
import type { ExerciseSettingsProps, IntervalReadingSettings as Settings } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { t } from '../../i18n/translations';
import styles from './ExerciseSettings.module.css';

export const IntervalReadingSettings: React.FC<ExerciseSettingsProps> = ({
  settings,
  onChange,
  isPracticeMode = true,
}) => {
  const { language } = useGlobalStore();
  const readingSettings = settings as Settings;

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...readingSettings, [key]: value });
  };

  return (
    <div className={styles.settings}>
      {/* Clef */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.clef', language)}</label>
        <div className={styles.buttonGroup}>
          {(['treble', 'bass', 'both'] as const).map((clef) => (
            <button
              key={clef}
              className={`${styles.optionButton} ${readingSettings.clef === clef ? styles.active : ''}`}
              onClick={() => updateSetting('clef', clef)}
            >
              {t(`value.${clef}`, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Direction */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.direction', language)}</label>
        <div className={styles.buttonGroup}>
          {(['above', 'below', 'both'] as const).map((dir) => (
            <button
              key={dir}
              className={`${styles.optionButton} ${readingSettings.direction === dir ? styles.active : ''}`}
              onClick={() => updateSetting('direction', dir)}
            >
              {t(`value.${dir}`, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Octave Span */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.octaveSpan', language)}</label>
        <select
          className={styles.select}
          value={readingSettings.octaveSpan ?? 1}
          onChange={(e) => updateSetting('octaveSpan', Number(e.target.value))}
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? t('value.octave', language) : t('value.octaves', language)}
            </option>
          ))}
        </select>
      </div>

      {/* Quiz mode settings */}
      {!isPracticeMode && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>{t('settings.questionCount', language)}</label>
            <input
              type="number"
              className={styles.numberInput}
              min={1}
              max={100}
              value={typeof readingSettings.questionCount === 'number' ? readingSettings.questionCount : 20}
              onChange={(e) => {
                const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 20));
                updateSetting('questionCount', value);
              }}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('settings.timeLimit', language)}</label>
            <div className={styles.buttonGroup}>
              {[null, 5, 10, 15].map((limit) => (
                <button
                  key={limit ?? 'none'}
                  className={`${styles.optionButton} ${readingSettings.timeLimit === limit ? styles.active : ''}`}
                  onClick={() => updateSetting('timeLimit', limit)}
                >
                  {limit === null ? t('value.off', language) : `${limit}s`}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
