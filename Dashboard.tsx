
import React, { useMemo, useState, useRef, TouchEvent } from 'react';
import type { Session, WorkoutTemplate, UserGoals, DailyLog, FoodItem, UserProfile } from '../types';
import Icon from './common/Icon';

const ProgressRing: React.FC<{ progress: number }> = ({ progress }) => {
  const safeProgress = Math.max(0, Math.min(progress, 100));
  const style = {
    '--progress-percent': safeProgress,
    background: `conic-gradient(rgb(var(--color-primary)) calc(var(--progress-percent) * 1%), rgb(var(--color-bg-subtle)) 0)`,
  } as React.CSSProperties;

  return (
    <div
      className="relative w-48 h-48 rounded-full flex items-center justify-center"
      style={style}
    >
      <div className="absolute w-[164px] h-[164px] bg-bg-muted rounded-full"></div>
    </div>
  );
};

const StatDisplay: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-text-muted">{label}</p>
  </div>
);

const MacroBar: React.FC<{ label: string; value: number; target: number; displayValue: string; color: string }> = ({ label, value, target, displayValue, color }) => {
  const percentage = target > 0 ? (value / target) * 100 : 0;
  return (
    <div className="flex-1 text-center">
      <p className="font-bold">{label}</p>
      <div className="w-full bg-bg-subtle rounded-full h-2 my-1.5">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
      </div>
      <p className="text-sm text-text-muted">{displayValue}</p>
    </div>
  );
};

const SegmentedControl: React.FC<{ options: string[]; selected: string; onChange: (option: string) => void }> = ({ options, selected, onChange }) => (
  <div className="bg-bg-subtle p-1 rounded-full flex items-center">
    {options.map(option => (
      <button
        key={option}
        onClick={() => onChange(option)}
        className={`flex-1 py-2 rounded-full font-semibold text-sm transition-colors ${selected === option ? 'bg-bg-base shadow-sm' : 'text-text-muted'}`}
      >
        {option}
      </button>
    ))}
  </div>
);

const NutritionCard: React.FC<{ dailyLog: DailyLog; foodDatabase: FoodItem[]; userGoals: UserGoals }> = ({ dailyLog, foodDatabase, userGoals }) => {
  const [mode, setMode] = useState('Consumed');

  const consumed = useMemo(() => {
    const totals = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    dailyLog.meals.forEach(meal => {
      meal.foods.forEach(loggedFood => {
        const food = foodDatabase.find(f => f.id === loggedFood.foodId);
        if (food) {
          totals.calories += food.calories * loggedFood.servings;
          totals.protein += food.protein * loggedFood.servings;
          totals.fat += food.fat * loggedFood.servings;
          totals.carbs += food.carbs * loggedFood.servings;
        }
      });
    });
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      fat: Math.round(totals.fat),
      carbs: Math.round(totals.carbs),
    };
  }, [dailyLog, foodDatabase]);

  const remaining = {
    calories: userGoals.calorieTarget - consumed.calories,
    protein: userGoals.proteinTarget - consumed.protein,
    fat: userGoals.fatTarget - consumed.fat,
    carbs: userGoals.carbsTarget - consumed.carbs,
  };

  const calorieProgress = userGoals.calorieTarget > 0 ? (consumed.calories / userGoals.calorieTarget) * 100 : 0;
  
  const displayData = mode === 'Consumed' ? consumed : remaining;

  return (
    <div className="bg-bg-muted p-6 rounded-2xl w-full flex-shrink-0">
      <h3 className="font-bold text-xl mb-4">Daily Nutrition</h3>
      <div className="flex justify-between items-center mb-6">
        <StatDisplay value={Math.max(0, remaining.calories)} label="Remaining" />
        <div className="relative">
          <ProgressRing progress={calorieProgress} />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <p className="text-4xl font-extrabold">{consumed.calories}</p>
            <p className="text-text-muted font-semibold">Consumed</p>
          </div>
        </div>
        <StatDisplay value={userGoals.calorieTarget} label="Target" />
      </div>
      <div className="flex justify-between items-start gap-4 mb-6">
        <MacroBar label="Protein" value={consumed.protein} target={userGoals.proteinTarget} displayValue={`${displayData.protein.toLocaleString()}g / ${userGoals.proteinTarget}g`} color="bg-orange-400" />
        <MacroBar label="Fat" value={consumed.fat} target={userGoals.fatTarget} displayValue={`${displayData.fat.toLocaleString()}g / ${userGoals.fatTarget}g`} color="bg-yellow-400" />
        <MacroBar label="Carbs" value={consumed.carbs} target={userGoals.carbsTarget} displayValue={`${displayData.carbs.toLocaleString()}g / ${userGoals.carbsTarget}g`} color="bg-green-400" />
      </div>
      <SegmentedControl options={['Consumed', 'Remaining']} selected={mode} onChange={setMode} />
    </div>
  );
};

const StepsCard: React.FC<{ dailyLog: DailyLog; userGoals: UserGoals }> = ({ dailyLog, userGoals }) => {
    const [mode, setMode] = useState('Consumed');

    const consumed = {
        steps: dailyLog.steps,
        miles: parseFloat((dailyLog.steps / 2000).toFixed(1)),
        caloriesBurned: Math.round(dailyLog.steps * 0.04),
        moveMinutes: Math.round(dailyLog.steps / 100),
    };

    const remaining = {
        steps: userGoals.stepTarget - consumed.steps,
        miles: userGoals.milesTarget - consumed.miles,
        caloriesBurned: userGoals.caloriesBurnedTarget - consumed.caloriesBurned,
        moveMinutes: userGoals.moveMinutesTarget - consumed.moveMinutes,
    };
    
    const stepProgress = userGoals.stepTarget > 0 ? (consumed.steps / userGoals.stepTarget) * 100 : 0;
    const displayData = mode === 'Consumed' ? consumed : remaining;

    return (
        <div className="bg-bg-muted p-6 rounded-2xl w-full flex-shrink-0">
            <h3 className="font-bold text-xl mb-4">Daily Activity</h3>
            <div className="flex justify-between items-center mb-6">
                <StatDisplay value={Math.max(0, remaining.steps).toLocaleString()} label="Remaining" />
                <div className="relative">
                    <ProgressRing progress={stepProgress} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <p className="text-4xl font-extrabold">{consumed.steps.toLocaleString()}</p>
                        <p className="text-text-muted font-semibold">Steps</p>
                    </div>
                </div>
                <StatDisplay value={userGoals.stepTarget.toLocaleString()} label="Target" />
            </div>
            <div className="flex justify-between items-start gap-4 mb-6">
                <MacroBar label="Miles" value={consumed.miles} target={userGoals.milesTarget} displayValue={`${displayData.miles.toFixed(1)} mi`} color="bg-orange-400" />
                <MacroBar label="Calories" value={consumed.caloriesBurned} target={userGoals.caloriesBurnedTarget} displayValue={`${displayData.caloriesBurned.toLocaleString()} kcal`} color="bg-yellow-400" />
                <MacroBar label="Move Mins" value={consumed.moveMinutes} target={userGoals.moveMinutesTarget} displayValue={`${displayData.moveMinutes.toLocaleString()} min`} color="bg-green-400" />
            </div>
            <SegmentedControl options={['Consumed', 'Remaining']} selected={mode} onChange={setMode} />
        </div>
    );
};


const SwipeableDashboard: React.FC<Omit<DashboardProps, 'profile' | 'sessions' | 'onUpdateLog' | 'nextWorkoutTemplate' | 'onStartWorkout' | 'onChooseWorkout' | 'onViewActivity' | 'onViewProfile' | 'allDailyLogs' | 'isGoogleFitConnected' | 'isSyncingSteps' | 'syncGoogleFitSteps' | 'onGoToSettings'>> = ({ dailyLog, userGoals, foodDatabase }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = (e: TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current - touchEndX.current > 75) {
            // Swiped left
            setActiveIndex(1);
        }

        if (touchStartX.current - touchEndX.current < -75) {
            // Swiped right
            setActiveIndex(0);
        }
    };

    return (
        <div>
            <div className="overflow-hidden" ref={containerRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                    <NutritionCard dailyLog={dailyLog} foodDatabase={foodDatabase} userGoals={userGoals} />
                    <StepsCard dailyLog={dailyLog} userGoals={userGoals} />
                </div>
            </div>
            <div className="flex justify-center items-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full transition-colors ${activeIndex === 0 ? 'bg-text-base' : 'bg-bg-subtle'}`}></div>
                <div className={`w-2 h-2 rounded-full transition-colors ${activeIndex === 1 ? 'bg-text-base' : 'bg-bg-subtle'}`}></div>
            </div>
        </div>
    );
};


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
  isGoogleFitConnected: boolean;
  isSyncingSteps: boolean;
  syncGoogleFitSteps: () => void;
  onGoToSettings: () => void;
}

const GoogleFitCard: React.FC<{
  isConnected: boolean;
  isSyncing: boolean;
  onSync: () => void;
  onConnect: () => void;
}> = ({ isConnected, isSyncing, onSync, onConnect }) => {
    if (!isConnected) {
        return (
            <div className="bg-bg-muted p-6 rounded-lg text-center">
                <h3 className="font-bold text-lg mb-2">Track Steps Automatically</h3>
                <p className="text-text-muted mb-4">Connect to Google Fit to sync your daily steps instead of entering them manually.</p>
                <button onClick={onConnect} className="bg-primary text-primary-content font-semibold py-2 px-4 rounded-lg transition-colors hover:opacity-90">
                    Connect in Settings
                </button>
            </div>
        )
    }
    return (
         <div className="bg-bg-muted p-4 rounded-lg flex justify-between items-center">
            <div>
                <h3 className="font-bold text-lg">Google Fit Steps</h3>
                <p className="text-sm text-text-muted">Synced from your Google account</p>
            </div>
            <button onClick={onSync} disabled={isSyncing} className="bg-primary text-primary-content font-bold py-3 px-5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {isSyncing ? <Icon name="spinner" className="animate-spin" /> : <i className="fas fa-sync-alt"></i>}
                {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
        </div>
    )
}

const Dashboard: React.FC<DashboardProps> = ({ sessions, dailyLog, allDailyLogs, onUpdateLog, nextWorkoutTemplate, onStartWorkout, onChooseWorkout, userGoals, foodDatabase, onViewActivity, onViewProfile, profile, isGoogleFitConnected, isSyncingSteps, syncGoogleFitSteps, onGoToSettings }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onViewProfile} className="p-1 rounded-full hover:opacity-80 transition-opacity">
            <img src={profile.profileImage || `https://api.dicebear.com/8.x/initials/svg?seed=${profile.name}`} alt="Profile" className="w-12 h-12 rounded-full object-cover bg-bg-subtle" />
        </button>
        <h2 className="text-3xl font-bold">lockIn</h2>
        <div className="w-12"></div>
      </div>

      <SwipeableDashboard 
        dailyLog={dailyLog}
        userGoals={userGoals}
        foodDatabase={foodDatabase}
      />
      
      <GoogleFitCard
        isConnected={isGoogleFitConnected}
        isSyncing={isSyncingSteps}
        onSync={syncGoogleFitSteps}
        onConnect={onGoToSettings}
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
