
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
export type WeightUnit = 'kg' | 'lbs';
export type View = 'DASHBOARD' | 'SESSION' | 'HISTORY' | 'PROFILE' | 'STRATEGY' | 'NUTRITION' | 'MORE' | 'ACTIVITY' | 'SETTINGS';

export type Sex = 'Female' | 'Male';
export type WeightTrend = 'losing' | 'gaining' | 'stable' | 'unsure';
export type BodyFatOption = '3-4%' | '5-7%' | '8-12%' | '13-17%' | '18-23%' | '24-29%' | '30-34%' | '35-39%' | '40% +';
export type ActivityLevel = 'sedentary' | 'moderate' | 'active';
export type ExperienceLevel = 'none' | 'beginner' | 'intermediate' | 'advanced';
export type ExerciseFrequency = '0' | '1-3' | '4-6' | '7+';
export type HeaviestWeightHistory = 'yes' | 'no' | 'unsure';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

export interface TemplateExercise {
  exerciseId: string;
  defaultSets: number;
  defaultReps: string;
}

export interface WorkoutTemplate {
  id: string;
  dayOfWeek: DayOfWeek;
  title: string;
  exercises: TemplateExercise[];
}

export interface SetEntry {
  id: string;
  reps: number;
  weight: number;
  volume: number;
  completedAt?: string; // ISO string
}

export interface SessionExercise extends Exercise {
  sets: SetEntry[];
}

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  templateId: string;
  exercises: SessionExercise[];
  status: 'in-progress' | 'completed';
  totalVolume: number;
  unit: WeightUnit;
  completedAt?: string; // ISO string
}

export interface UserRatings {
  [exerciseId: string]: number; // Rating from 1 to 5
}

export interface UserGoals {
    calorieTarget: number;
    stepTarget: number;
}

export interface UserProfile {
  name: string;
  age: number;
  dob?: string;
  sex?: Sex;
  height: number;
  heightUnit: 'cm' | 'in';
  weight: number;
  profileImage?: string; // base64 encoded image
  weightTrend?: WeightTrend;
  heaviestWeight?: HeaviestWeightHistory;
  bodyFat?: BodyFatOption;
  activityLevel?: ActivityLevel;
  exerciseFrequency?: ExerciseFrequency;
  cardioExperience?: ExperienceLevel;
  liftingExperience?: ExperienceLevel;
  measurements: {
    chest: number;
    waist: number;
    hips: number;
    leftArm: number;
    rightArm: number;
    leftThigh: number;
    rightThigh: number;
  };
  measurementUnit: 'cm' | 'in';
  lastUpdated?: string; // ISO string
  onboardingCompleted?: boolean;
  goals: UserGoals;
}

export interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string; // e.g., "100g", "1 cup"
    isCustom?: boolean;
}

export interface LoggedFood {
    id: string; // unique id for this logged entry
    foodId: string;
    servings: number;
    loggedAt: string; // ISO string
}

export interface Meal {
    name: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
    foods: LoggedFood[];
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    meals: Meal[];
    waterIntake: number; // in ml or oz
    steps: number;
    notes?: string;
}

export interface DailyChecklistItem {
    id: string;
    text: string;
    completed: boolean;
}
