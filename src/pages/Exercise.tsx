import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../stores/globalStore';
import { useExerciseStore } from '../stores/exerciseStore';
import { t } from '../i18n/translations';
import { getExercise } from '../exercises/registry';
import type { ExerciseId, ExerciseSettings, InputMethod } from '../types';
import { Header, Modal, Button } from '../components/ui';
import { Results } from '../components/exercise/Results';
import styles from './Exercise.module.css';

// Input method icons
const inputMethodIcons: Record<string, string> = {
  piano: '🎹',
  buttons: '🔘',
  staff: '🎼',
};

export const Exercise: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { language, defaultInputMethod } = useGlobalStore();
  const {
    setCurrentExercise,
    startExercise,
    exerciseState,
    resetExercise,
    saveExerciseSettings,
    getExerciseSettings,
  } = useExerciseStore();

  const [showSettings, setShowSettings] = useState(true);
  const [isPracticeMode, setIsPracticeMode] = useState(true);
  const [inputMethod, setInputMethod] = useState<InputMethod>(defaultInputMethod);

  const exercise = getExercise(exerciseId as ExerciseId);
  const savedSettings = getExerciseSettings(exerciseId as ExerciseId);
  const [settings, setSettings] = useState<ExerciseSettings>(
    savedSettings || exercise?.defaultSettings || ({} as ExerciseSettings)
  );

  useEffect(() => {
    if (exercise) {
      setCurrentExercise(exercise.id);
    }
    return () => {
      // Don't reset if exercise is complete (to show results)
    };
  }, [exercise, setCurrentExercise]);

  if (!exercise) {
    return (
      <div className={styles.page}>
        <Header showBack />
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎵</span>
            <p className={styles.emptyMessage}>
              {language === 'en' ? 'Exercise not found' : 'Oefening niet gevonden'}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const handleSettingsChange = (newSettings: ExerciseSettings) => {
    setSettings(newSettings);
  };

  const handleStart = () => {
    saveExerciseSettings(exercise.id, settings);
    // Practice mode is always endless, quiz mode uses question count
    const questionCount = isPracticeMode
      ? 'endless'
      : (settings as { questionCount?: number | 'endless' }).questionCount ?? 10;
    startExercise(questionCount, isPracticeMode);
    setShowSettings(false);
  };

  const handleRetry = () => {
    // Practice mode is always endless, quiz mode uses question count
    const questionCount = isPracticeMode
      ? 'endless'
      : (settings as { questionCount?: number | 'endless' }).questionCount ?? 10;
    startExercise(questionCount, isPracticeMode);
  };

  const handleQuit = () => {
    resetExercise();
    navigate(-1);
  };

  const ExerciseComponent = exercise.component;
  const SettingsComponent = exercise.settingsComponent;

  const exerciseName = t(
    exercise.nameKey as keyof typeof import('../i18n/translations').translations.en,
    language
  );

  // Show results if exercise is complete
  if (exerciseState?.isComplete) {
    return (
      <div className={styles.page}>
        <Header showBack title={exerciseName} />
        <main className={styles.main}>
          <Results onRetry={handleRetry} />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header showBack title={exerciseName} />

      {/* Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => navigate(-1)}
        title={exerciseName}
        subtitle={t(
          exercise.descriptionKey as keyof typeof import('../i18n/translations').translations.en,
          language
        )}
        size="md"
        variant="accented"
        footer={
          <Button variant="brass" size="lg" fullWidth onClick={handleStart}>
            {t('game.startExercise', language)}
          </Button>
        }
      >
        <div className={styles.settingsContent}>
          {/* Mode Toggle - at the top */}
          <div className={styles.settingsSection}>
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeButton} ${isPracticeMode ? styles.active : ''}`}
                onClick={() => setIsPracticeMode(true)}
              >
                <span className={styles.modeIcon}>🎯</span>
                {t('game.practiceMode', language)}
              </button>
              <button
                className={`${styles.modeButton} ${!isPracticeMode ? styles.active : ''}`}
                onClick={() => setIsPracticeMode(false)}
              >
                <span className={styles.modeIcon}>📝</span>
                {t('game.quizMode', language)}
              </button>
            </div>
          </div>

          {/* Exercise-specific settings */}
          <SettingsComponent settings={settings} onChange={handleSettingsChange} isPracticeMode={isPracticeMode} />

          {/* Input Method Toggle */}
          {exercise.inputMethods.length > 1 && (
            <div className={styles.settingsSection}>
              <h4 className={styles.settingsSectionTitle}>
                {language === 'en' ? 'Input Method' : 'Invoermethode'}
              </h4>
              <div className={styles.inputMethodToggle}>
                {exercise.inputMethods.map((method) => (
                  <button
                    key={method}
                    className={`${styles.inputMethodButton} ${inputMethod === method ? styles.active : ''}`}
                    onClick={() => setInputMethod(method)}
                  >
                    <span className={styles.inputMethodIcon}>
                      {inputMethodIcons[method] || '⚙'}
                    </span>
                    {t(
                      `value.${method}` as keyof typeof import('../i18n/translations').translations.en,
                      language
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Exercise */}
      {exerciseState && !showSettings && (
        <main className={styles.main}>
          <div className={styles.exerciseContainer}>
            <ExerciseComponent
              settings={settings}
              state={exerciseState}
              onAnswer={() => {}}
              onSkip={() => {}}
              onComplete={() => {}}
              onQuit={handleQuit}
              inputMethod={inputMethod}
            />
          </div>
        </main>
      )}
    </div>
  );
};
