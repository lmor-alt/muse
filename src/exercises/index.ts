// Import all exercise modules to register them
// Each module auto-registers when imported

import './pitch-notes';
import './intervals';
import './chords';
import './rhythm';

export { categories, getExercise, getExercisesForCategory } from './registry';
