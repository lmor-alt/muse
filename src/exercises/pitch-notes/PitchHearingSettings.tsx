import React from 'react';
import type { ExerciseSettingsProps, PitchHearingSettings as Settings } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { t } from '../../i18n/translations';
import styles from './ExerciseSettings.module.css';

export const PitchHearingSettings: React.FC<ExerciseSettingsProps> = ({
  settings,
  onChange,
  isPracticeMode = true,
}) => {
  const { language } = useGlobalStore();
  const pitchSettings = settings as Settings;

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...pitchSettings, [key]: value });
  };

  return (
    <div className={styles.settings}>
      {/* Include accidentals */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.includeAccidentals', language)}</label>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleButton} ${pitchSettings.includeAccidentals ? styles.active : ''}`}
            onClick={() => updateSetting('includeAccidentals', true)}
          >
            {t('value.on', language)}
          </button>
          <button
            className={`${styles.toggleButton} ${!pitchSettings.includeAccidentals ? styles.active : ''}`}
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
          value={typeof pitchSettings.questionCount === 'number' ? pitchSettings.questionCount : 20}
          onChange={(e) => {
            const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 20));
            updateSetting('questionCount', value);
          }}
        />
      </div>

      {/* Quiz mode settings */}
      {!isPracticeMode && (
        <>
          {/* Replay limit - only show for quiz mode */}
          <div className={styles.field}>
            <label className={styles.label}>{t('settings.replayLimit', language)}</label>
            <div className={styles.buttonGroup}>
              {[1, 2, 3, null].map((limit) => (
                <button
                  key={limit ?? 'unlimited'}
                  className={`${styles.optionButton} ${pitchSettings.replayLimit === limit ? styles.active : ''}`}
                  onClick={() => updateSetting('replayLimit', limit)}
                >
                  {limit === null ? t('value.unlimited', language) : limit}
                </button>
              ))}
            </div>
          </div>

          {/* Time limit */}
          <div className={styles.field}>
            <label className={styles.label}>{t('settings.timeLimit', language)}</label>
            <div className={styles.buttonGroup}>
              {[null, 5, 10, 15].map((limit) => (
                <button
                  key={limit ?? 'none'}
                  className={`${styles.optionButton} ${pitchSettings.timeLimit === limit ? styles.active : ''}`}
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
