import React, { useState } from 'react';
import type { ExerciseSettingsProps, IntervalReadingSettings as Settings, Interval } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { t, type TranslationKey } from '../../i18n/translations';
import { ALL_INTERVALS, getIntervalKey } from '../../utils/musicTheory';
import styles from './ExerciseSettings.module.css';
import advancedStyles from './IntervalQuizSettings.module.css';

const COMMON_INTERVALS = ALL_INTERVALS.filter((i) => i.semitones <= 12 && i.semitones > 0);

export const IntervalReadingSettings: React.FC<ExerciseSettingsProps> = ({
  settings,
  onChange,
  isPracticeMode = true,
}) => {
  const { language } = useGlobalStore();
  const readingSettings = settings as Settings;
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...readingSettings, [key]: value });
  };

  const toggleInterval = (interval: Interval) => {
    const current = readingSettings.intervals || [];
    const exists = current.some((i) => i.semitones === interval.semitones);
    if (exists) {
      // Don't allow removing if it's the only one
      if (current.length > 1) {
        updateSetting('intervals', current.filter((i) => i.semitones !== interval.semitones));
      }
    } else {
      updateSetting('intervals', [...current, interval]);
    }
  };

  const isIntervalEnabled = (interval: Interval) => {
    const intervals = readingSettings.intervals || [];
    // If empty, all are enabled
    if (intervals.length === 0) return true;
    return intervals.some((i) => i.semitones === interval.semitones);
  };

  const selectAllIntervals = () => {
    updateSetting('intervals', COMMON_INTERVALS);
  };

  const selectNoneIntervals = () => {
    // Keep at least one
    updateSetting('intervals', [COMMON_INTERVALS[0]]);
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

      {/* Advanced Settings Toggle */}
      <button
        className={advancedStyles.advancedToggle}
        onClick={() => setAdvancedOpen(!advancedOpen)}
        aria-expanded={advancedOpen}
      >
        <span>{t('settings.selectIntervals', language)}</span>
        <span className={`${advancedStyles.chevron} ${advancedOpen ? advancedStyles.open : ''}`}>
          ›
        </span>
      </button>

      {/* Advanced Settings Panel */}
      {advancedOpen && (
        <div className={advancedStyles.advancedPanel}>
          {/* Intervals Selection */}
          <div className={styles.field}>
            <div className={advancedStyles.intervalHeader}>
              <label className={styles.label}>{t('settings.intervals', language)}</label>
              <div className={advancedStyles.intervalActions}>
                <button
                  className={advancedStyles.textButton}
                  onClick={selectAllIntervals}
                >
                  {t('action.selectAll', language)}
                </button>
                <span className={advancedStyles.divider}>|</span>
                <button
                  className={advancedStyles.textButton}
                  onClick={selectNoneIntervals}
                >
                  {t('action.selectNone', language)}
                </button>
              </div>
            </div>
            <div className={advancedStyles.intervalGrid}>
              {COMMON_INTERVALS.map((interval) => (
                <button
                  key={interval.semitones}
                  className={`${advancedStyles.intervalChip} ${isIntervalEnabled(interval) ? advancedStyles.active : ''}`}
                  onClick={() => toggleInterval(interval)}
                >
                  {t(getIntervalKey(interval) as TranslationKey, language)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
