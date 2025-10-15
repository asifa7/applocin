import type { TemplateExercise } from '../types';

// These presets are smaller, focused lists of exercises for building a workout day.

export const PUSH_PRESET: TemplateExercise[] = [
  { exerciseId: 'chest_4', defaultSets: 3, defaultReps: '6-10' },     // Bench Press (Barbell)
  { exerciseId: 'shoulder_22', defaultSets: 3, defaultReps: '10-12' }, // Shoulder Press (Dumbbell)
  { exerciseId: 'chest_41', defaultSets: 3, defaultReps: '12-15' },   // Standing Cable Chest Fly (for Low Cable Fly Crossovers)
  { exerciseId: 'tricep_8', defaultSets: 3, defaultReps: '12-15' },    // Triceps Extension (Dumbbell)
  { exerciseId: 'tricep_17', defaultSets: 3, defaultReps: '12-15' },   // Triceps Rope Pushdown
];

export const PULL_PRESET: TemplateExercise[] = [
  { exerciseId: 'back_5', defaultSets: 3, defaultReps: '6-10' },      // Bent Over Row (Barbell)
  { exerciseId: 'back_41', defaultSets: 3, defaultReps: '8-12' },     // Lat Pulldown (Cable)
  { exerciseId: 'bicep_10', defaultSets: 3, defaultReps: '12-15' },    // Bicep Curl (Dumbbell)
  { exerciseId: 'bicep_12', defaultSets: 3, defaultReps: '12-15' },    // Hammer Curl (Dumbbell)
  { exerciseId: 'shoulder_23', defaultSets: 3, defaultReps: '15-25' },// Face Pull
];

export const LEGS_PRESET: TemplateExercise[] = [
  { exerciseId: 'leg_61', defaultSets: 3, defaultReps: '6-10' },      // Squat (Barbell)
  { exerciseId: 'leg_19', defaultSets: 3, defaultReps: '8-12' },      // Glute Ham Raise
  { exerciseId: 'leg_15', defaultSets: 3, defaultReps: '10-15' },     // Lunge (Dumbbell)
  { exerciseId: 'leg_36', defaultSets: 3, defaultReps: '12-15' },     // Lying Leg Curl (Machine)
  { exerciseId: 'calve_8', defaultSets: 3, defaultReps: '8-12' },     // Standing Calf Raise (Smith)
];

export const UPPER_BODY_PRESET: TemplateExercise[] = [
  { exerciseId: 'back_54', defaultSets: 3, defaultReps: '5-10' },     // Pull Up
  { exerciseId: 'chest_22', defaultSets: 3, defaultReps: '8-10' },    // Incline Bench Press (Dumbbell)
  { exerciseId: 'back_69', defaultSets: 3, defaultReps: '10-15' },    // Straight Arm Lat Pulldown (Cable)
  { exerciseId: 'shoulder_34', defaultSets: 3, defaultReps: '10-12' }, // Seated Shoulder Press (Machine)
  { exerciseId: 'chest_32', defaultSets: 2, defaultReps: '12-20' },   // Push Up
];

export const LOWER_BODY_PRESET: TemplateExercise[] = [
  { exerciseId: 'leg_35', defaultSets: 3, defaultReps: '8-12' },      // Leg Press (Machine)
  { exerciseId: 'leg_50', defaultSets: 3, defaultReps: '8-10' },      // Romanian Deadlift (Barbell)
  { exerciseId: 'leg_34', defaultSets: 3, defaultReps: '12-15' },     // Leg Extension (Machine)
  { exerciseId: 'calve_7', defaultSets: 4, defaultReps: '12-20' },    // Seated Calf Raise
  { exerciseId: 'ab_3', defaultSets: 4, defaultReps: '12-15' },       // Cable Crunch
];

export const FULL_BODY_PRESET: TemplateExercise[] = [
  { exerciseId: 'leg_61', defaultSets: 3, defaultReps: '8-12' },     // Squat
  { exerciseId: 'chest_4', defaultSets: 3, defaultReps: '8-12' },    // Bench Press
  { exerciseId: 'back_5', defaultSets: 3, defaultReps: '8-12' },     // Barbell Row
  { exerciseId: 'shoulder_20', defaultSets: 2, defaultReps: '12-15' },// Lateral Raises
  { exerciseId: 'ab_37', defaultSets: 3, defaultReps: 'Hold' },    // Plank
];
