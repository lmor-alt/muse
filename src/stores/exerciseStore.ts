import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ExerciseId,
  ExerciseState,
  ExerciseSettings,
  ExerciseStats,
  AnswerRecord,
} from '../types';

interface ExerciseStore {
  // Current exercise state (not persisted)
  currentExercise: ExerciseId | null;
  exerciseState: ExerciseState | null;

  // Persisted data
  exerciseSettings: Partial<Record<ExerciseId, ExerciseSettings>>;
  streakRecords: Partial<Record<ExerciseId, number>>;
  stats: Partial<Record<ExerciseId, ExerciseStats>>;

  // Actions
  setCurrentExercise: (id: ExerciseId | null) => void;
  startExercise: (totalQuestions: number | 'endless', isPracticeMode: boolean) => void;
  recordAnswer: (correct: boolean, userAnswer: unknown, correctAnswer: unknown, timeSpent: number) => void;
  skipQuestion: () => void;
  completeExercise: () => void;
  resetExercise: () => void;

  // Settings persistence
  saveExerciseSettings: (exerciseId: ExerciseId, settings: ExerciseSettings) => void;
  getExerciseSettings: (exerciseId: ExerciseId) => ExerciseSettings | undefined;

  // Stats
  updateStats: (exerciseId: ExerciseId, correct: boolean) => void;
  getStats: (exerciseId: ExerciseId) => ExerciseStats | undefined;
}

const createInitialExerciseState = (
  totalQuestions: number | 'endless',
  isPracticeMode: boolean,
  bestStreak: number
): ExerciseState => ({
  currentQuestion: 1,
  totalQuestions,
  score: 0,
  streak: 0,
  bestStreak,
  answers: [],
  startTime: Date.now(),
  isComplete: false,
  isPracticeMode,
});

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      currentExercise: null,
      exerciseState: null,
      exerciseSettings: {},
      streakRecords: {},
      stats: {},

      setCurrentExercise: (id) => set({ currentExercise: id }),

      startExercise: (totalQuestions, isPracticeMode) => {
        const { currentExercise, streakRecords } = get();
        const bestStreak = currentExercise ? streakRecords[currentExercise] ?? 0 : 0;
        set({
          exerciseState: createInitialExerciseState(totalQuestions, isPracticeMode, bestStreak),
        });
      },

      recordAnswer: (correct, userAnswer, correctAnswer, timeSpent) => {
        const { exerciseState, currentExercise, streakRecords } = get();
        if (!exerciseState || !currentExercise) return;

        const newStreak = correct ? exerciseState.streak + 1 : 0;
        const newBestStreak = Math.max(exerciseState.bestStreak, newStreak);

        const answer: AnswerRecord = {
          questionIndex: exerciseState.currentQuestion,
          correct,
          userAnswer,
          correctAnswer,
          timeSpent,
          skipped: false,
        };

        const newState: ExerciseState = {
          ...exerciseState,
          currentQuestion: exerciseState.currentQuestion + 1,
          score: correct ? exerciseState.score + 1 : exerciseState.score,
          streak: newStreak,
          bestStreak: newBestStreak,
          answers: [...exerciseState.answers, answer],
        };

        // Check if exercise is complete
        if (
          exerciseState.totalQuestions !== 'endless' &&
          newState.currentQuestion > exerciseState.totalQuestions
        ) {
          newState.isComplete = true;
        }

        // Update streak record if new best
        const currentRecord = streakRecords[currentExercise] ?? 0;
        if (newBestStreak > currentRecord) {
          set({
            exerciseState: newState,
            streakRecords: { ...streakRecords, [currentExercise]: newBestStreak },
          });
        } else {
          set({ exerciseState: newState });
        }

        // Update stats if not practice mode
        if (!exerciseState.isPracticeMode) {
          get().updateStats(currentExercise, correct);
        }
      },

      skipQuestion: () => {
        const { exerciseState } = get();
        if (!exerciseState) return;

        const answer: AnswerRecord = {
          questionIndex: exerciseState.currentQuestion,
          correct: false,
          userAnswer: null,
          correctAnswer: null,
          timeSpent: 0,
          skipped: true,
        };

        const newState: ExerciseState = {
          ...exerciseState,
          currentQuestion: exerciseState.currentQuestion + 1,
          streak: 0,
          answers: [...exerciseState.answers, answer],
        };

        if (
          exerciseState.totalQuestions !== 'endless' &&
          newState.currentQuestion > exerciseState.totalQuestions
        ) {
          newState.isComplete = true;
        }

        set({ exerciseState: newState });
      },

      completeExercise: () => {
        const { exerciseState } = get();
        if (!exerciseState) return;
        set({ exerciseState: { ...exerciseState, isComplete: true } });
      },

      resetExercise: () => {
        set({ exerciseState: null, currentExercise: null });
      },

      saveExerciseSettings: (exerciseId, settings) => {
        const { exerciseSettings } = get();
        set({ exerciseSettings: { ...exerciseSettings, [exerciseId]: settings } });
      },

      getExerciseSettings: (exerciseId) => {
        return get().exerciseSettings[exerciseId];
      },

      updateStats: (exerciseId, correct) => {
        const { stats } = get();
        const current = stats[exerciseId] ?? {
          totalAttempts: 0,
          correctAnswers: 0,
          bestStreak: 0,
          lastPlayed: 0,
        };

        set({
          stats: {
            ...stats,
            [exerciseId]: {
              totalAttempts: current.totalAttempts + 1,
              correctAnswers: current.correctAnswers + (correct ? 1 : 0),
              bestStreak: Math.max(current.bestStreak, get().exerciseState?.bestStreak ?? 0),
              lastPlayed: Date.now(),
            },
          },
        });
      },

      getStats: (exerciseId) => {
        return get().stats[exerciseId];
      },
    }),
    {
      name: 'muse-exercise-data',
      partialize: (state) => ({
        exerciseSettings: state.exerciseSettings,
        streakRecords: state.streakRecords,
        stats: state.stats,
      }),
    }
  )
);
