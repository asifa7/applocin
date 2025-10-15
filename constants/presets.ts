
import type { WorkoutTemplate, DayOfWeek } from '../types';

// =================================================================
// INDIVIDUAL DAY TEMPLATES
// These are the building blocks for the plan generator.
// =================================================================

const PUSH_DAY = {
  title: 'Push',
  exercises: [
    { exerciseId: 'chest_4', defaultSets: 3, defaultReps: '6-10' },
    { exerciseId: 'shoulder_22', defaultSets: 3, defaultReps: '10-12' },
    { exerciseId: 'chest_41', defaultSets: 3, defaultReps: '12-15' },
    { exerciseId: 'tricep_8', defaultSets: 3, defaultReps: '12-15' },
    { exerciseId: 'tricep_17', defaultSets: 3, defaultReps: '12-15' },
  ],
};

const PULL_DAY = {
  title: 'Pull',
  exercises: [
    { exerciseId: 'back_5', defaultSets: 3, defaultReps: '6-10' },
    { exerciseId: 'back_41', defaultSets: 3, defaultReps: '8-12' },
    { exerciseId: 'bicep_10', defaultSets: 3, defaultReps: '12-15' },
    { exerciseId: 'bicep_12', defaultSets: 3, defaultReps: '12-15' },
    { exerciseId: 'shoulder_23', defaultSets: 3, defaultReps: '15-25' },
  ],
};

const LEGS_DAY_A = {
  title: 'Legs (Quad Focus)',
  exercises: [
    { exerciseId: 'leg_61', defaultSets: 3, defaultReps: '6-10' },
    { exerciseId: 'leg_19', defaultSets: 3, defaultReps: '8-12' },
    { exerciseId: 'leg_15', defaultSets: 3, defaultReps: '10-15' },
    { exerciseId: 'leg_36', defaultSets: 3, defaultReps: '12-15' },
    { exerciseId: 'calve_8', defaultSets: 3, defaultReps: '8-12' },
  ],
};

const LEGS_DAY_B = {
  title: 'Legs (Hamstring Focus)',
  exercises: [
    { exerciseId: 'leg_35', defaultSets: 3, defaultReps: '8-12' },
    { exerciseId: 'leg_50', defaultSets: 3, defaultReps: '8-10' },
    { exerciseId: 'leg_34', defaultSets: 3, defaultReps: '12-15' },
    { exerciseId: 'calve_7', defaultSets: 4, defaultReps: '12-20' },
    { exerciseId: 'ab_3', defaultSets: 4, defaultReps: '12-15' },
  ],
};

const UPPER_DAY_A = {
    title: 'Upper Body (Strength)',
    exercises: [
        { exerciseId: 'chest_4', defaultSets: 3, defaultReps: '5-8' },
        { exerciseId: 'back_5', defaultSets: 3, defaultReps: '5-8' },
        { exerciseId: 'shoulder_37', defaultSets: 3, defaultReps: '6-10' },
        { exerciseId: 'back_54', defaultSets: 3, defaultReps: 'Failure' },
        { exerciseId: 'bicep_1', defaultSets: 2, defaultReps: '8-12' },
    ],
};

const UPPER_DAY_B = {
    title: 'Upper Body (Hypertrophy)',
    exercises: [
        { exerciseId: 'chest_22', defaultSets: 3, defaultReps: '8-12' },
        { exerciseId: 'back_41', defaultSets: 3, defaultReps: '8-12' },
        { exerciseId: 'shoulder_22', defaultSets: 3, defaultReps: '10-15' },
        { exerciseId: 'back_9', defaultSets: 3, defaultReps: '10-15' },
        { exerciseId: 'tricep_17', defaultSets: 3, defaultReps: '10-15' },
    ],
};

const FULL_BODY_A = {
  title: 'Full Body A',
  exercises: [
    { exerciseId: 'leg_61', defaultSets: 3, defaultReps: '8-12' },
    { exerciseId: 'chest_4', defaultSets: 3, defaultReps: '8-12' },
    { exerciseId: 'back_5', defaultSets: 3, defaultReps: '8-12' },
    { exerciseId: 'shoulder_20', defaultSets: 2, defaultReps: '12-15' },
    { exerciseId: 'ab_37', defaultSets: 3, defaultReps: 'Hold' },
  ],
};

const FULL_BODY_B = {
  title: 'Full Body B',
  exercises: [
    { exerciseId: 'back_17', defaultSets: 3, defaultReps: '5-8' },
    { exerciseId: 'back_54', defaultSets: 3, defaultReps: 'Failure' },
    { exerciseId: 'shoulder_37', defaultSets: 3, defaultReps: '8-12' },
    { exerciseId: 'leg_15', defaultSets: 3, defaultReps: '10-15' },
    { exerciseId: 'bicep_10', defaultSets: 2, defaultReps: '10-15' },
  ],
};

const FULL_BODY_C = {
    title: 'Full Body C',
    exercises: [
        { exerciseId: 'leg_35', defaultSets: 3, defaultReps: '10-15' },
        { exerciseId: 'chest_22', defaultSets: 3, defaultReps: '10-15' },
        { exerciseId: 'back_9', defaultSets: 3, defaultReps: '10-15' },
        { exerciseId: 'leg_36', defaultSets: 2, defaultReps: '12-15' },
        { exerciseId: 'tricep_16', defaultSets: 2, defaultReps: '10-15' },
    ],
};

const CHEST_DAY = { title: 'Chest', exercises: PUSH_DAY.exercises.filter(e => e.exerciseId.startsWith('chest') || e.exerciseId.startsWith('tricep')) };
const BACK_DAY = { title: 'Back & Biceps', exercises: PULL_DAY.exercises.filter(e => e.exerciseId.startsWith('back') || e.exerciseId.startsWith('bicep')) };
const SHOULDERS_DAY = { title: 'Shoulders', exercises: [
    { exerciseId: 'shoulder_37', defaultSets: 3, defaultReps: '6-10' },
    { exerciseId: 'shoulder_20', defaultSets: 3, defaultReps: '10-15' },
    { exerciseId: 'shoulder_44', defaultSets: 3, defaultReps: '12-15' },
    { exerciseId: 'shoulder_23', defaultSets: 3, defaultReps: '15-20' },
]};
const ARMS_DAY = { title: 'Arms', exercises: [
    { exerciseId: 'bicep_1', defaultSets: 3, defaultReps: '8-12' },
    { exerciseId: 'tricep_4', defaultSets: 3, defaultReps: '8-12' },
    { exerciseId: 'bicep_13', defaultSets: 3, defaultReps: '10-15' },
    { exerciseId: 'tricep_17', defaultSets: 3, defaultReps: '10-15' },
]};

const DAY_TEMPLATES = {
    PUSH: PUSH_DAY, PULL: PULL_DAY, LEGS_A: LEGS_DAY_A, LEGS_B: LEGS_DAY_B,
    UPPER_A: UPPER_DAY_A, UPPER_B: UPPER_DAY_B,
    FULL_BODY_A: FULL_BODY_A, FULL_BODY_B: FULL_BODY_B, FULL_BODY_C: FULL_BODY_C,
    CHEST: CHEST_DAY, BACK: BACK_DAY, SHOULDERS: SHOULDERS_DAY, ARMS: ARMS_DAY,
};

// =================================================================
// PLAN GENERATION LOGIC
// =================================================================

type SplitConfig = {
    [key: string]: {
        name: string;
        description: string;
        validDays: number[];
        generator: (days: number) => WorkoutTemplate[];
    }
}

const SPLIT_CONFIG: SplitConfig = {
    'Full Body': {
        name: 'Full Body',
        description: "Train your entire body each session, promoting overall strength and efficiency.",
        validDays: [1, 2, 3],
        generator: (days) => {
            const sequence = [DAY_TEMPLATES.FULL_BODY_A, DAY_TEMPLATES.FULL_BODY_B, DAY_TEMPLATES.FULL_BODY_C];
            const workoutDays: DayOfWeek[] = days === 1 ? ['Wednesday'] : days === 2 ? ['Tuesday', 'Friday'] : ['Monday', 'Wednesday', 'Friday'];
            return workoutDays.map((day, i) => ({
                id: `preset_fb${days}_${i}`, dayOfWeek: day, ...sequence[i]
            }));
        },
    },
    'Upper/Lower': {
        name: 'Upper/Lower',
        description: "Split your training between upper body and lower body days.",
        validDays: [2, 4],
        generator: (days) => {
            if (days === 2) {
                const workoutDays: DayOfWeek[] = ['Tuesday', 'Friday'];
                const sequence = [DAY_TEMPLATES.UPPER_A, DAY_TEMPLATES.LEGS_A];
                return workoutDays.map((day, i) => ({ id: `preset_ul2_${i}`, dayOfWeek: day, ...sequence[i] }));
            }
            // days === 4
            const workoutDays: DayOfWeek[] = ['Monday', 'Tuesday', 'Thursday', 'Friday'];
            const sequence = [DAY_TEMPLATES.UPPER_A, DAY_TEMPLATES.LEGS_A, DAY_TEMPLATES.UPPER_B, DAY_TEMPLATES.LEGS_B];
            return workoutDays.map((day, i) => ({ id: `preset_ul4_${i}`, dayOfWeek: day, ...sequence[i] }));
        }
    },
    'Push/Pull/Legs': {
        name: 'Push/Pull/Legs (PPL)',
        description: "A classic split targeting specific muscle groups each day for balanced development.",
        validDays: [3, 6],
        generator: (days) => {
            const pplSequence = [DAY_TEMPLATES.PUSH, DAY_TEMPLATES.PULL, DAY_TEMPLATES.LEGS_A];
            if (days === 3) {
                const workoutDays: DayOfWeek[] = ['Monday', 'Wednesday', 'Friday'];
                return workoutDays.map((day, i) => ({ id: `preset_ppl3_${i}`, dayOfWeek: day, ...pplSequence[i] }));
            }
            // days === 6
            const workoutDays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const sequence = [...pplSequence, ...pplSequence];
            return workoutDays.map((day, i) => ({ id: `preset_ppl6_${i}`, dayOfWeek: day, ...sequence[i] }));
        }
    },
    'Bro Split': {
        name: 'Bro Split',
        description: "Focus on one major muscle group per day for high-volume, targeted training.",
        validDays: [4, 5],
        generator: (days) => {
            const broSequence = [DAY_TEMPLATES.CHEST, DAY_TEMPLATES.BACK, DAY_TEMPLATES.LEGS_A, DAY_TEMPLATES.SHOULDERS, DAY_TEMPLATES.ARMS];
            const workoutDays: DayOfWeek[] = days === 4 ? ['Monday', 'Tuesday', 'Thursday', 'Friday'] : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            return workoutDays.map((day, i) => ({ id: `preset_bro${days}_${i}`, dayOfWeek: day, ...broSequence[i] }));
        }
    }
};

/**
 * Returns a list of available workout splits for a given number of training days.
 * @param days The number of days the user wants to train per week.
 */
export const getAvailableSplits = (days: number) => {
    return Object.values(SPLIT_CONFIG)
        .filter(split => split.validDays.includes(days))
        .map(({ name, description }) => ({ name, description }));
};

/**
 * Generates a full workout plan based on the number of days and the chosen split.
 * @param days The number of training days.
 * @param splitName The name of the chosen split.
 * @returns An array of WorkoutTemplate objects or null if the split is invalid.
 */
export const generatePlan = (days: number, splitName: string): WorkoutTemplate[] | null => {
    const split = SPLIT_CONFIG[splitName];
    if (split && split.validDays.includes(days)) {
        return split.generator(days);
    }
    return null;
};
