import React, { useState } from 'react';
import type { ExerciseSettingsProps, IntervalIdentificationSettings as Settings, Interval } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { t, type TranslationKey } from '../../i18n/translations';
import { ALL_INTERVALS, getIntervalKey } from '../../utils/musicTheory';
import styles from './ExerciseSettings.module.css';
import advancedStyles from './IntervalQuizSettings.module.css';

const COMMON_INTERVALS = ALL_INTERVALS.filter((i) => i.semitones <= 12 && i.semitones > 0);

export const IntervalIdentificationSettings: React.FC<ExerciseSettingsProps> = ({
  settings,
  onChange,
  isPracticeMode = true,
}) => {
  const { language } = useGlobalStore();
  const intervalSettings = settings as Settings;
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...intervalSettings, [key]: value });
  };

  const toggleInterval = (interval: Interval) => {
    const current = intervalSettings.intervals || [];
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
    const intervals = intervalSettings.intervals || [];
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
      {/* Melodic/Harmonic */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.melodicHarmonic', language)}</label>
        <div className={styles.buttonGroup}>
          {(['melodic', 'harmonic', 'both'] as const).map((type) => (
            <button
              key={type}
              className={`${styles.optionButton} ${intervalSettings.melodicOrHarmonic === type ? styles.active : ''}`}
              onClick={() => updateSetting('melodicOrHarmonic', type)}
            >
              {t(`value.${type}`, language)}
            </button>
          ))}
        </div>
      </div>

      {/* Direction */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.direction', language)}</label>
        <div className={styles.buttonGroup}>
          {(['ascending', 'descending', 'both'] as const).map((dir) => (
            <button
              key={dir}
              className={`${styles.optionButton} ${intervalSettings.direction === dir ? styles.active : ''}`}
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
          value={intervalSettings.octaveSpan ?? 1}
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
            <div className={styles.buttonGroup}>
              {[10, 20, 30].map((count) => (
                <button
                  key={count}
                  className={`${styles.optionButton} ${intervalSettings.questionCount === count ? styles.active : ''}`}
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
                  className={`${styles.optionButton} ${intervalSettings.timeLimit === limit ? styles.active : ''}`}
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
