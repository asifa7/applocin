
import React, { useMemo } from 'react';
import type { Session, WorkoutTemplate, UserGoals, DailyLog, FoodItem, View, UserProfile } from '../types';
import Icon from './common/Icon';
import DailyGoals from './DailyGoals';
import ActivityRings from './common/ActivityRings';

interface DashboardProps {
  sessions: Session[];
  dailyLog: DailyLog;
  allDailyLogs: DailyLog[];
  onUpdateLog: (log: DailyLog) => void;
  nextWorkoutTemplate: WorkoutTemplate | null;
  onStartWorkout: (template: WorkoutTemplate) => void;
  onChooseWorkout: () => void;
  userGoals: UserGoals;
  foodDatabase: FoodItem[];
  onViewActivity: (tab: 'calories' | 'steps') => void;
  onViewProfile: () => void;
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ sessions, dailyLog, allDailyLogs, onUpdateLog, nextWorkoutTemplate, onStartWorkout, onChooseWorkout, userGoals, foodDatabase, onViewActivity, onViewProfile, profile }) => {

  const caloriesConsumed = useMemo(() => {
    return dailyLog.meals.reduce((total, meal) => {
      return total + meal.foods.reduce((mealTotal, loggedFood) => {
        const foodDetails = foodDatabase.find(f => f.id === loggedFood.foodId);
        return mealTotal + (foodDetails ? foodDetails.calories * loggedFood.servings : 0);
      }, 0);
    }, 0);
  }, [dailyLog.meals, foodDatabase]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onViewProfile} className="p-1 rounded-full hover:opacity-80 transition-opacity">
            <img src={profile.profileImage || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}`} alt="Profile" className="w-12 h-12 rounded-full object-cover bg-bg-subtle" />
        </button>
        <h2 className="text-3xl font-bold">lockIn</h2>
        <div className="w-12"></div>
      </div>

      <ActivityRings
        calorieData={{ consumed: caloriesConsumed, target: userGoals.calorieTarget }}
        stepData={{ current: dailyLog.steps, target: userGoals.stepTarget }}
        onClick={onViewActivity}
      />
      
       <div className="bg-bg-muted p-4 rounded-lg">
          <label htmlFor="steps-input" className="block font-bold text-lg mb-2">Log Today's Steps</label>
          <input 
              id="steps-input"
              type="number"
              value={dailyLog.steps || ''}
              onChange={(e) => {
                  const steps = parseInt(e.target.value, 10);
                  onUpdateLog({
                      ...dailyLog,
                      steps: isNaN(steps) ? 0 : steps,
                  });
              }}
              placeholder="Enter steps"
              className="w-full bg-bg-subtle text-lg p-3 rounded-md border-transparent focus:ring-2 focus:ring-primary"
          />
      </div>

      <DailyGoals 
        dailyLogs={allDailyLogs}
        userGoals={userGoals}
        foodDatabase={foodDatabase}
        onClick={() => onViewActivity('steps')}
      />

      <div className="bg-bg-muted p-6 rounded-lg text-center">
        {nextWorkoutTemplate ? (
          <>
            <h3 className="font-bold mb-2 text-lg">Your Next Workout:</h3>
            <p className="text-2xl font-semibold text-text-base mb-6">{nextWorkoutTemplate.title}</p>
            <button
              onClick={() => onStartWorkout(nextWorkoutTemplate)}
              className="bg-primary text-primary-content hover:opacity-90 font-bold py-4 px-8 rounded-lg transition-all text-lg w-full sm:w-auto"
            >
              Start Workout
            </button>
            <button 
              onClick={onChooseWorkout} 
              className="mt-4 text-sm font-semibold text-text-muted hover:underline"
            >
              or choose a different one
            </button>
          </>
        ) : (
          <>
            <h3 className="font-bold mb-4 text-lg">No workout plan found.</h3>
            <p className="text-text-muted mb-6">Go to the Strategy page to set up your workout templates.</p>
          </>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
