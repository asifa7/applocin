
import { UserProfile, Sex, ActivityLevel, ExerciseFrequency } from '../types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
    sedentary: 1.3,
    moderate: 1.55,
    active: 1.725,
};

const EXERCISE_FREQUENCY_BONUS: Record<ExerciseFrequency, number> = {
    '0': 0,
    '1-3': 100,
    '4-6': 250,
    '7+': 400,
};

// Calculates age from a date of birth string (YYYY-MM-DD)
export const getAge = (dobString: string): number => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const calculateTDEE = (profile: Partial<UserProfile>): number => {
    if (!profile.dob || !profile.sex || !profile.weight || !profile.height || !profile.activityLevel || !profile.exerciseFrequency) {
        return 2200; // Return a sensible default if data is missing
    }

    const age = getAge(profile.dob);
    
    // Ensure weight is in kg and height is in cm. The onboarding flow will handle conversion if needed.
    const weightInKg = profile.weight; 
    const heightInCm = profile.height;
    
    const sexModifier = profile.sex === 'Male' ? 5 : -161;

    // Mifflin-St Jeor Equation for BMR
    const bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) + sexModifier;

    // TDEE = BMR * Activity Multiplier + Exercise Bonus
    const activityMultiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel];
    const exerciseBonus = EXERCISE_FREQUENCY_BONUS[profile.exerciseFrequency];

    const tdee = (bmr * activityMultiplier) + exerciseBonus;

    return Math.round(tdee / 10) * 10; // Round to nearest 10
};
