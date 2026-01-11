import React, { useState } from 'react';
import type { ExerciseSettingsProps, IntervalQuizSettings as Settings, IntervalQuizModule, Interval } from '../../types';
import { useGlobalStore } from '../../stores/globalStore';
import { t, type TranslationKey } from '../../i18n/translations';
import { ALL_INTERVALS, getIntervalKey } from '../../utils/musicTheory';
import styles from './ExerciseSettings.module.css';
import quizStyles from './IntervalQuizSettings.module.css';

const COMMON_INTERVALS = ALL_INTERVALS.filter((i) => i.semitones <= 12 && i.semitones > 0);

export const IntervalQuizSettings: React.FC<ExerciseSettingsProps> = ({
  settings,
  onChange,
  isPracticeMode = true,
}) => {
  const { language } = useGlobalStore();
  const quizSettings = settings as Settings;
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    onChange({ ...quizSettings, [key]: value });
  };

  const toggleModule = (module: IntervalQuizModule) => {
    const current = quizSettings.modules || ['ear', 'read', 'write'];
    if (current.includes(module)) {
      // Don't allow removing if it's the only one
      if (current.length > 1) {
        updateSetting('modules', current.filter((m) => m !== module));
      }
    } else {
      updateSetting('modules', [...current, module]);
    }
  };

  const isModuleEnabled = (module: IntervalQuizModule) => {
    return (quizSettings.modules || ['ear', 'read', 'write']).includes(module);
  };

  const toggleInterval = (interval: Interval) => {
    const current = quizSettings.intervals || [];
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
    const intervals = quizSettings.intervals || [];
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
      {/* Modules Selection */}
      <div className={styles.field}>
        <label className={styles.label}>{t('settings.modules', language)}</label>
        <div className={styles.buttonGroup}>
          {(['ear', 'read', 'write'] as IntervalQuizModule[]).map((module) => (
            <button
              key={module}
              className={`${styles.optionButton} ${isModuleEnabled(module) ? styles.active : ''}`}
              onClick={() => toggleModule(module)}
            >
              {t(`quiz.module.${module}` as TranslationKey, language)}
            </button>
          ))}
        </div>
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
                  className={`${styles.optionButton} ${quizSettings.questionCount === count ? styles.active : ''}`}
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
                  className={`${styles.optionButton} ${quizSettings.timeLimit === limit ? styles.active : ''}`}
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
        className={quizStyles.advancedToggle}
        onClick={() => setAdvancedOpen(!advancedOpen)}
        aria-expanded={advancedOpen}
      >
        <span>{t('settings.advancedSettings', language)}</span>
        <span className={`${quizStyles.chevron} ${advancedOpen ? quizStyles.open : ''}`}>
          ›
        </span>
      </button>

      {/* Advanced Settings Panel */}
      {advancedOpen && (
        <div className={quizStyles.advancedPanel}>
          {/* Octave Span */}
          <div className={styles.field}>
            <label className={styles.label}>{t('settings.octaveSpan', language)}</label>
            <select
              className={styles.select}
              value={quizSettings.octaveSpan ?? 1}
              onChange={(e) => updateSetting('octaveSpan', Number(e.target.value))}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? t('value.octave', language) : t('value.octaves', language)}
                </option>
              ))}
            </select>
          </div>

          {/* Intervals Selection */}
          <div className={styles.field}>
            <div className={quizStyles.intervalHeader}>
              <label className={styles.label}>{t('settings.intervals', language)}</label>
              <div className={quizStyles.intervalActions}>
                <button
                  className={quizStyles.textButton}
                  onClick={selectAllIntervals}
                >
                  {t('action.selectAll', language)}
                </button>
                <span className={quizStyles.divider}>|</span>
                <button
                  className={quizStyles.textButton}
                  onClick={selectNoneIntervals}
                >
                  {t('action.selectNone', language)}
                </button>
              </div>
            </div>
            <div className={quizStyles.intervalGrid}>
              {COMMON_INTERVALS.map((interval) => (
                <button
                  key={interval.semitones}
                  className={`${quizStyles.intervalChip} ${isIntervalEnabled(interval) ? quizStyles.active : ''}`}
                  onClick={() => toggleInterval(interval)}
                >
                  {t(getIntervalKey(interval) as TranslationKey, language)}
                </button>
              ))}
            </div>
          </div>

          {/* Ear Training Settings - only show if ear module enabled */}
          {isModuleEnabled('ear') && (
            <>
              {/* Melodic/Harmonic */}
              <div className={styles.field}>
                <label className={styles.label}>{t('settings.melodicHarmonic', language)}</label>
                <div className={styles.buttonGroup}>
                  {(['melodic', 'harmonic', 'both'] as const).map((type) => (
                    <button
                      key={type}
                      className={`${styles.optionButton} ${quizSettings.melodicOrHarmonic === type ? styles.active : ''}`}
                      onClick={() => updateSetting('melodicOrHarmonic', type)}
                    >
                      {t(`value.${type}`, language)}
                    </button>
                  ))}
                </div>
              </div>

            </>
          )}

          {/* Reading Settings - only show if read module enabled */}
          {isModuleEnabled('read') && (
            <div className={styles.field}>
              <label className={styles.label}>{t('settings.readingClef', language)}</label>
              <div className={styles.buttonGroup}>
                {(['treble', 'bass', 'both'] as const).map((clef) => (
                  <button
                    key={clef}
                    className={`${styles.optionButton} ${quizSettings.readingClef === clef ? styles.active : ''}`}
                    onClick={() => updateSetting('readingClef', clef)}
                  >
                    {t(`value.${clef}`, language)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Writing Settings - only show if write module enabled */}
          {isModuleEnabled('write') && (
            <div className={styles.field}>
              <label className={styles.label}>{t('settings.writingDirection', language)}</label>
              <div className={styles.buttonGroup}>
                {(['above', 'below', 'both'] as const).map((dir) => (
                  <button
                    key={dir}
                    className={`${styles.optionButton} ${quizSettings.writingDirection === dir ? styles.active : ''}`}
                    onClick={() => updateSetting('writingDirection', dir)}
                  >
                    {t(`value.${dir}`, language)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Distribution - only show if multiple modules enabled */}
          {(quizSettings.modules?.length || 3) > 1 && (
            <div className={styles.field}>
              <label className={styles.label}>{t('settings.distribution', language)}</label>
              <div className={styles.buttonGroup}>
                {(['equal', 'custom'] as const).map((dist) => (
                  <button
                    key={dist}
                    className={`${styles.optionButton} ${quizSettings.distribution === dist ? styles.active : ''}`}
                    onClick={() => updateSetting('distribution', dist)}
                  >
                    {t(`value.${dist}`, language)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
