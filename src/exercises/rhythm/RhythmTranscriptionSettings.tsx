import React from 'react';
import type { ExerciseSettingsProps, RhythmTranscriptionSettings as Settings } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { t } from '../../i18n/translations';
import styles from './ExerciseSettings.module.css';

export const RhythmTranscriptionSettings: React.FC<ExerciseSettingsProps> = ({
  settings,
  onChange,
  isPracticeMode = true,
}) => {
  const { language } = useGlobalStore();
  const rhythmSettings = settings as Settings;

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...rhythmSettings, [key]: value });
  };

  return (
    <div className={styles.settings}>
      {/* Tempo Slider */}
      <div className={styles.field}>
        <label className={styles.label}>
          {t('settings.tempo', language)}: {rhythmSettings.tempo} BPM
        </label>
        <input
          type="range"
          min={0}
          max={90}
          value={rhythmSettings.tempo}
          onChange={(e) => updateSetting('tempo', Number(e.target.value))}
          className={styles.slider}
        />
      </div>

      {/* Quiz mode settings */}
      {!isPracticeMode && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>{t('settings.questionCount', language)}</label>
            <div className={styles.buttonGroup}>
              {[10, 20, 30].map((count) => (
                <button
                  key={count}
                  className={`${styles.optionButton} ${rhythmSettings.questionCount === count ? styles.active : ''}`}
                  onClick={() => updateSetting('questionCount', count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t('settings.timeLimit', language)}</label>
            <div className={styles.buttonGroup}>
              {[null, 5, 10, 15].map((limit) => (
                <button
                  key={limit ?? 'none'}
                  className={`${styles.optionButton} ${rhythmSettings.timeLimit === limit ? styles.active : ''}`}
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
