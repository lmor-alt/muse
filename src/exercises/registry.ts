import type {
  ExerciseId,
  ExerciseDefinition,
  Category,
  CategoryId,
} from '../types';

// Exercise registry - exercises register themselves here
const exerciseRegistry = new Map<ExerciseId, ExerciseDefinition>();

// Category definitions
export const categories: Category[] = [
  {
    id: 'pitch-notes',
    nameKey: 'category.pitch-notes',
    icon: '🎵',
    exercises: ['note-identification', 'pitch-hearing', 'higher-or-lower'],
  },
  {
    id: 'intervals',
    nameKey: 'category.intervals',
    icon: '↕️',
    exercises: ['interval-identification', 'interval-reading', 'interval-drawing', 'interval-quiz'],
  },
  {
    id: 'chords',
    nameKey: 'category.chords',
    icon: '🎹',
    // Order: auditory → visual identification → visual drawing (consistent with intervals)
    exercises: ['chord-identification-auditory', 'chord-identification-visual', 'chord-drawing'],
  },
  // Rhythm category temporarily disabled - code preserved for future use
  // {
  //   id: 'rhythm',
  //   nameKey: 'category.rhythm',
  //   icon: '🥁',
  //   exercises: ['rhythm-transcription'],
  // },
];

// Register an exercise
export function registerExercise(definition: ExerciseDefinition): void {
  if (exerciseRegistry.has(definition.id)) {
    console.warn(`Exercise ${definition.id} is already registered. Overwriting.`);
  }
  exerciseRegistry.set(definition.id, definition);
}

// Get an exercise by ID
export function getExercise(id: ExerciseId): ExerciseDefinition | undefined {
  return exerciseRegistry.get(id);
}

// Get all exercises for a category
export function getExercisesForCategory(categoryId: CategoryId): ExerciseDefinition[] {
  const category = categories.find((c) => c.id === categoryId);
  if (!category) return [];

  return category.exercises
    .map((id) => exerciseRegistry.get(id))
    .filter((ex): ex is ExerciseDefinition => ex !== undefined);
}

// Get category by ID
export function getCategory(id: CategoryId): Category | undefined {
  return categories.find((c) => c.id === id);
}

// Get all registered exercises
export function getAllExercises(): ExerciseDefinition[] {
  return Array.from(exerciseRegistry.values());
}

// Check if an exercise is registered
export function isExerciseRegistered(id: ExerciseId): boolean {
  return exerciseRegistry.has(id);
}
