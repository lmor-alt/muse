import React from 'react';
import type { ExerciseSettingsProps, NoteIdentificationSettings as Settings } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { t } from '../../i18n/translations';
import styles from './ExerciseSettings.module.css';

export const NoteIdentificationSettings: React.FC<ExerciseSettingsProps> = ({
  settings,
  onChange,
  isPracticeMode = true,
}) => {
  const { language } = useGlobalStore();
  const noteSettings = settings as Settings;

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...noteSettings, [key]: value });
  };

  return (
    <div className={styles.settings}>
      {/* Clef selection */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.clef', language)}</label>
        <div className={styles.buttonGroup}>
          {(['treble', 'bass', 'both'] as const).map((clef) => (
            <button
              key={clef}
              className={`${styles.optionButton} ${noteSettings.clef === clef ? styles.active : ''}`}
              onClick={() => updateSetting('clef', clef)}
            >
              {t(`clef.${clef}` as keyof typeof import('../../i18n/translations').translations.en, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Include accidentals */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.includeAccidentals', language)}</label>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleButton} ${noteSettings.includeAccidentals ? styles.active : ''}`}
            onClick={() => updateSetting('includeAccidentals', true)}
          >
            {t('value.on', language)}
          </button>
          <button
            className={`${styles.toggleButton} ${!noteSettings.includeAccidentals ? styles.active : ''}`}
            onClick={() => updateSetting('includeAccidentals', false)}
          >
            {t('value.off', language)}
          </button>
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
          value={typeof noteSettings.questionCount === 'number' ? noteSettings.questionCount : 20}
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
                className={`${styles.optionButton} ${noteSettings.timeLimit === limit ? styles.active : ''}`}
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
