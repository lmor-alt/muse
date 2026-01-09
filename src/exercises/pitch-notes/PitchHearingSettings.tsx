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

          {/* Question count */}
          <div className={styles.field}>
            <label className={styles.label}>{t('settings.questionCount', language)}</label>
            <div className={styles.buttonGroup}>
              {[10, 20, 30].map((count) => (
                <button
                  key={count}
                  className={`${styles.optionButton} ${pitchSettings.questionCount === count ? styles.active : ''}`}
                  onClick={() => updateSetting('questionCount', count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
