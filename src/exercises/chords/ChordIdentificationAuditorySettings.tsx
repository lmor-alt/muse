import React from 'react';
import type { ExerciseSettingsProps, ChordIdentificationAuditorySettings as Settings, ChordQuality } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { t } from '../../i18n/translations';
import styles from './ExerciseSettings.module.css';

const ALL_CHORD_TYPES: ChordQuality[] = ['major', 'minor', 'diminished', 'augmented', 'major7', 'minor7', 'dominant7'];

export const ChordIdentificationAuditorySettings: React.FC<ExerciseSettingsProps> = ({
  settings,
  onChange,
  isPracticeMode = true,
}) => {
  const { language } = useGlobalStore();
  const chordSettings = settings as Settings;

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...chordSettings, [key]: value });
  };

  const handleChordTypeToggle = (quality: ChordQuality) => {
    const current = chordSettings.chordTypes || [];
    const updated = current.includes(quality)
      ? current.filter((q) => q !== quality)
      : [...current, quality];
    onChange({ ...chordSettings, chordTypes: updated });
  };

  return (
    <div className={styles.settings}>
      {/* Difficulty */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.difficulty', language)}</label>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleButton} ${chordSettings.difficulty === 'easy' ? styles.active : ''}`}
            onClick={() => updateSetting('difficulty', 'easy')}
          >
            {t('value.easy', language)}
          </button>
          <button
            className={`${styles.toggleButton} ${chordSettings.difficulty === 'hard' ? styles.active : ''}`}
            onClick={() => updateSetting('difficulty', 'hard')}
          >
            {t('value.hard', language)}
          </button>
        </div>
      </div>

      {/* Voicing */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.voicing', language)}</label>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleButton} ${chordSettings.voicing === 'harmonic' ? styles.active : ''}`}
            onClick={() => updateSetting('voicing', 'harmonic')}
          >
            {t('value.harmonic', language)}
          </button>
          <button
            className={`${styles.toggleButton} ${chordSettings.voicing === 'melodic' ? styles.active : ''}`}
            onClick={() => updateSetting('voicing', 'melodic')}
          >
            {t('value.melodic', language)}
          </button>
        </div>
      </div>

      {/* Chord Types */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.chordTypes', language)}</label>
        <div className={styles.buttonGroup}>
          {ALL_CHORD_TYPES.map((quality) => (
            <button
              key={quality}
              className={`${styles.optionButton} ${(chordSettings.chordTypes || []).includes(quality) ? styles.active : ''}`}
              onClick={() => handleChordTypeToggle(quality)}
            >
              {t(`chord.${quality}`, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Include Inversions */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.includeInversions', language)}</label>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleButton} ${!chordSettings.includeInversions ? styles.active : ''}`}
            onClick={() => updateSetting('includeInversions', false)}
          >
            {t('value.no', language)}
          </button>
          <button
            className={`${styles.toggleButton} ${chordSettings.includeInversions ? styles.active : ''}`}
            onClick={() => updateSetting('includeInversions', true)}
          >
            {t('value.yes', language)}
          </button>
        </div>
      </div>

      {/* Question count - only show for quiz mode */}
      {!isPracticeMode && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>{t('settings.questionCount', language)}</label>
            <input
              type="number"
              className={styles.numberInput}
              min={1}
              max={100}
              value={typeof chordSettings.questionCount === 'number' ? chordSettings.questionCount : 20}
              onChange={(e) => {
                const value = Math.max(1, Math.min(100, parseInt(e.target.value) || 20));
                updateSetting('questionCount', value);
              }}
            />
          </div>

          {/* Time limit - only show for quiz mode */}
          <div className={styles.field}>
            <label className={styles.label}>{t('settings.timeLimit', language)}</label>
            <div className={styles.buttonGroup}>
              {[null, 5, 10, 15].map((limit) => (
                <button
                  key={limit ?? 'none'}
                  className={`${styles.optionButton} ${chordSettings.timeLimit === limit ? styles.active : ''}`}
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
