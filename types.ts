// --- Units & Basic Types ---
export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'in';
export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
// FIX: Added 'WORKOUT_SESSION' to the View type to allow navigation to the workout session view.
export type View = 'DASHBOARD' | 'STRATEGY' | 'NUTRITION' | 'HISTORY' | 'MORE' | 'PROFILE' | 'ACTIVITY' | 'SETTINGS' | 'WORKOUT_SESSION';
export type Sex = 'Male' | 'Female';

// --- Profile & Onboarding ---
export type ActivityLevel = 'sedentary' | 'moderate' | 'active';
export type ExperienceLevel = 'none' | 'beginner' | 'intermediate' | 'advanced';
export type ExerciseFrequency = '0' | '1-3' | '4-6' | '7+';
export type BodyFatOption = '3-4%' | '5-7%' | '8-12%' | '13-17%' | '18-23%' | '24-29%' | '30-34%' | '35-39%' | '40% +';
export type WeightTrend = 'lost' | 'maintained' | 'gained';
export type HeaviestWeightHistory = 'never' | 'within-year' | '1-3-years' | '3-plus-years';

export interface UserMeasurements {
    [key: string]: number | undefined;
    chest?: number;
    waist?: number;
    hips?: number;
    leftArm?: number;
    rightArm?: number;
    leftThigh?: number;
    rightThigh?: number;
}

export interface UserGoals {
    calorieTarget: number;
    proteinTarget: number;
    fatTarget: number;
    carbsTarget: number;
    stepTarget: number;
    milesTarget: number;
    caloriesBurnedTarget: number;
    moveMinutesTarget: number;
}

export interface UserProfile {
    name: string;
    profileImage?: string; // base64 string
    sex: Sex;
    dob: string;
    age: number;
    height: number;
    heightUnit: HeightUnit;
    weight: number;
    // weightUnit is a global setting, not per profile
    bodyFat: BodyFatOption;
    activityLevel: ActivityLevel;
    liftingExperience: ExperienceLevel;
    cardioExperience: ExperienceLevel;
    exerciseFrequency: ExerciseFrequency;
    
    measurements: UserMeasurements;
    measurementUnit: 'cm' | 'in';
    
    goals: UserGoals;
    
    onboardingCompleted: boolean;
    lastUpdated?: string;
}

// --- Workouts ---
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
    title: string;
    dayOfWeek: DayOfWeek;
    exercises: TemplateExercise[];
}

export interface SetEntry {
    id: string;
    reps: number;
    weight: number;
    volume: number;
    completedAt?: string;
}

export interface SessionExercise {
    id: string;
    name: string;
    muscleGroup: string;
    sets: SetEntry[];
}

export interface Session {
    id: string;
    date: string; // YYYY-MM-DD
    templateId: string;
    exercises: SessionExercise[];
    status: 'in-progress' | 'completed';
    totalVolume?: number;
    unit: WeightUnit;
    completedAt?: string;
}

export type UserRatings = { [exerciseId: string]: number };

// --- Nutrition ---
export interface FoodItem {
    id: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string;
    isCustom?: boolean;
}

export interface LoggedFood {
    id: string;
    foodId: string;
    servings: number;
    loggedAt: string;
}

export interface Meal {
    name: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
    foods: LoggedFood[];
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    meals: Meal[];
    steps: number;
}

// --- UI / Other ---
export interface DailyChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// --- Google Fit Integration ---
export interface GoogleFitData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Timestamp in ms
  scope: string;
}
