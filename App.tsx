import React, { useState, useMemo, useEffect } from 'react';

// Import hooks
import { useLocalStorage } from './hooks/useLocalStorage';
// FIX: Corrected typo in the imported constant name from ALL_EXEXRCISES_BY_GROUP to ALL_EXERCISES_BY_GROUP.
import { ALL_EXERCISES_BY_GROUP } from './constants/allExercises';
import { ALL_FOODS } from './constants/foods';
import { getAge } from './utils/fitnessCalculations';
import { palettes } from './constants/palettes';

// Import types
import type {
  Session,
  WorkoutTemplate,
  WeightUnit,
  UserRatings,
  SetEntry,
  Exercise,
  UserProfile,
  DailyLog,
  FoodItem,
  View,
} from './types';

// Import components
import LoginPage from './components/LoginPage';
import WorkoutSession from './components/WorkoutSession';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Profile from './components/Profile';
import Strategy from './components/Strategy';
import WorkoutSelectionModal from './components/WorkoutSelectionModal';
import Onboarding from './components/Onboarding';
import NutritionTracker from './components/NutritionTracker';
import More from './components/More';
import Icon from './components/common/Icon';
import MyActivity from './components/MyActivity';
import Settings from './components/Settings';
import AddActionModal from './components/AddActionModal';


// Create a map for quick exercise lookups
export const allExercisesMap = new Map<string, Omit<Exercise, 'muscleGroup' | 'id'>>();
ALL_EXERCISES_BY_GROUP.forEach(group => {
  group.exercises.forEach(ex => {
    allExercisesMap.set(ex.id, { name: ex.name });
  });
});

const BottomNavItem = ({ icon, label, active, onClick }: { icon: React.ComponentProps<typeof Icon>['name']; label: string; active: boolean; onClick: () => void; }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center transition-colors w-16 ${active ? 'text-primary' : 'text-text-muted hover:text-primary'}`}>
        <Icon name={icon} className="w-6 h-6 mb-1"/>
        <span className="text-xs font-semibold">{label}</span>
    </button>
);


function App() {
  // Authentication
  const [currentUser, setCurrentUser] = useLocalStorage<string | null>('ppl_current_user', null);

  // User-specific data keys
  const userKey = (key: string) => currentUser ? `${currentUser}_${key}` : key;

  // App State
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(userKey('ppl_theme'), 'light');
  const [palette, setPalette] = useLocalStorage<string>(userKey('ppl_palette'), 'Ocean');
  const [unit, setUnit] = useLocalStorage<WeightUnit>(userKey('ppl_unit'), 'kg');
  const [sessions, setSessions] = useLocalStorage<Session[]>(userKey('ppl_sessions'), []);
  const [workoutTemplates, setWorkoutTemplates] = useLocalStorage<WorkoutTemplate[]>(userKey('ppl_templates'), []);
  const [userRatings, setUserRatings] = useLocalStorage<UserRatings>(userKey('ppl_ratings'), {});
  const [imageCache, setImageCache] = useLocalStorage<{[exerciseName: string]: string}>(userKey('ppl_image_cache'), {});
  const [userProfile, setProfile] = useLocalStorage<UserProfile>(userKey('ppl_profile'), {
    name: '', age: 0, height: 0, heightUnit: 'cm', weight: 0,
    measurements: { chest: 0, waist: 0, hips: 0, leftArm: 0, rightArm: 0, leftThigh: 0, rightThigh: 0 },
    measurementUnit: 'cm',
    onboardingCompleted: false,
    goals: { calorieTarget: 2000, stepTarget: 10000 },
  });
  const [dailyLogs, setDailyLogs] = useLocalStorage<DailyLog[]>(userKey('ppl_daily_logs'), []);
  const [customFoods, setCustomFoods] = useLocalStorage<FoodItem[]>(userKey('ppl_custom_foods'), []);

  // UI State
  const [view, setView] = useState<View>('DASHBOARD');
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isWorkoutSelectionModalOpen, setWorkoutSelectionModalOpen] = useState(false);
  const [workoutRequestDate, setWorkoutRequestDate] = useState<string | null>(null);
  const [isAddActionModalOpen, setAddActionModalOpen] = useState(false);
  const [initialActivityTab, setInitialActivityTab] = useState<'calories' | 'steps'>('calories');
  
  // Centralized food database
  const foodDatabase = useMemo(() => [...ALL_FOODS, ...customFoods], [customFoods]);
  
  // Data migration/cleanup effect to handle outdated user profiles in localStorage
  useEffect(() => {
    // This effect checks if the loaded user profile has the necessary nested objects.
    // If not, it adds them with default values to prevent runtime errors like
    // "Cannot read properties of undefined (reading 'chest')".
    if (userProfile && (!userProfile.measurements || !userProfile.goals || !userProfile.measurementUnit)) {
      setProfile(currentProfile => {
        const newProfile = { ...currentProfile };
        if (!newProfile.measurements) {
          newProfile.measurements = { chest: 0, waist: 0, hips: 0, leftArm: 0, rightArm: 0, leftThigh: 0, rightThigh: 0 };
        }
        if (!newProfile.goals) {
          newProfile.goals = { calorieTarget: 2000, stepTarget: 10000 };
        }
        if (!newProfile.measurementUnit) {
          newProfile.measurementUnit = 'cm';
        }
        return newProfile;
      });
    }
  }, [userProfile, setProfile]);

  // Apply theme and palette
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');

    const selectedPalette = palettes.find(p => p.name === palette) || palettes[0];
    const themeColors = selectedPalette[theme];

    for (const [key, value] of Object.entries(themeColors)) {
        document.documentElement.style.setProperty(`--color-${key.replace(/'/g, "")}`, value);
    }
  }, [theme, palette]);
  
  const handleLogin = (mobileNumber: string) => {
    const isTestUser = mobileNumber === '7200134807';
    const profileKey = `${mobileNumber}_ppl_profile`;
    const profileExists = !!localStorage.getItem(profileKey);

    if (!profileExists && isTestUser) {
        // --- SEED DATA FOR TEST USER ---
        localStorage.setItem(`ppl_tracker_auth_${mobileNumber}`, 'Asif');
        
        const testProfile: UserProfile = {
            name: 'Asif',
            age: 28,
            dob: '1996-05-20',
            sex: 'Male',
            height: 178,
            heightUnit: 'cm',
            weight: 75,
            measurements: { chest: 100, waist: 80, hips: 95, leftArm: 38, rightArm: 38, leftThigh: 55, rightThigh: 55 },
            measurementUnit: 'cm',
            onboardingCompleted: true,
            goals: { calorieTarget: 2500, stepTarget: 8000 },
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(profileKey, JSON.stringify(testProfile));
        
        const testTemplates: WorkoutTemplate[] = [
          { id: 'tpl_ppl_1', dayOfWeek: 'Monday', title: 'Push Day', exercises: [{ exerciseId: 'chest_4', defaultSets: 3, defaultReps: '8-12'}, { exerciseId: 'shoulder_22', defaultSets: 3, defaultReps: '10-15' }, { exerciseId: 'tricep_17', defaultSets: 3, defaultReps: '10-15' }] },
          { id: 'tpl_ppl_2', dayOfWeek: 'Wednesday', title: 'Pull Day', exercises: [{ exerciseId: 'back_5', defaultSets: 3, defaultReps: '8-12'}, { exerciseId: 'back_41', defaultSets: 3, defaultReps: '10-15' }, { exerciseId: 'bicep_10', defaultSets: 3, defaultReps: '10-15' }] },
          { id: 'tpl_ppl_3', dayOfWeek: 'Friday', title: 'Leg Day', exercises: [{ exerciseId: 'leg_61', defaultSets: 3, defaultReps: '8-12'}, { exerciseId: 'leg_35', defaultSets: 3, defaultReps: '10-15' }, { exerciseId: 'calve_8', defaultSets: 3, defaultReps: '15-20' }] },
        ];
        localStorage.setItem(`${mobileNumber}_ppl_templates`, JSON.stringify(testTemplates));

        const getDateStr = (offset: number) => {
          const d = new Date();
          d.setDate(d.getDate() - offset);
          return d.toISOString().split('T')[0];
        };
        
        const testSessions: Session[] = [
            { id: 'sess_1', date: getDateStr(2), templateId: 'tpl_ppl_3', status: 'completed', totalVolume: 8500, unit: 'kg', completedAt: new Date(getDateStr(2) + 'T18:00:00Z').toISOString(), exercises: [] },
            { id: 'sess_2', date: getDateStr(4), templateId: 'tpl_ppl_2', status: 'completed', totalVolume: 7200, unit: 'kg', completedAt: new Date(getDateStr(4) + 'T17:30:00Z').toISOString(), exercises: [] },
            { id: 'sess_3', date: getDateStr(6), templateId: 'tpl_ppl_1', status: 'completed', totalVolume: 9100, unit: 'kg', completedAt: new Date(getDateStr(6) + 'T18:15:00Z').toISOString(), exercises: [] },
        ];
        localStorage.setItem(`${mobileNumber}_ppl_sessions`, JSON.stringify(testSessions));
        
        const testLogs: DailyLog[] = [
            { date: getDateStr(0), meals: [ { name: 'Breakfast', foods: [ { id: 'log-b1', foodId: 'food_7', servings: 1, loggedAt: new Date().toISOString() }, { id: 'log-b2', foodId: 'food_5', servings: 1, loggedAt: new Date().toISOString() } ] }, { name: 'Lunch', foods: [] }, { name: 'Dinner', foods: [] }, { name: 'Snacks', foods: [] } ], waterIntake: 1000, steps: 3450 },
            { date: getDateStr(1), meals: [ { name: 'Breakfast', foods: [] }, { name: 'Lunch', foods: [{ id: 'log-l1', foodId: 'food_1', servings: 1.5, loggedAt: new Date().toISOString() }] }, { name: 'Dinner', foods: [] }, { name: 'Snacks', foods: [] } ], waterIntake: 2000, steps: 9800 },
            { date: getDateStr(2), meals: [], waterIntake: 2500, steps: 11200 },
            { date: getDateStr(3), meals: [], waterIntake: 1500, steps: 6500 },
        ];
        localStorage.setItem(`${mobileNumber}_ppl_daily_logs`, JSON.stringify(testLogs));
    }
    // For both existing and new users, just set the current user.
    // The reactive useLocalStorage hook will handle loading the correct data.
    setCurrentUser(mobileNumber);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
  };

  const startWorkout = (template: WorkoutTemplate, date: string = new Date().toISOString().split('T')[0]) => {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      date,
      templateId: template.id,
      status: 'in-progress',
      totalVolume: 0,
      unit,
      exercises: template.exercises.map(tempEx => {
        const details = allExercisesMap.get(tempEx.exerciseId);
        const fullDetails = ALL_EXERCISES_BY_GROUP.flatMap(g => g.exercises.map(e => ({...e, muscleGroup: g.group}))).find(e => e.id === tempEx.exerciseId);
        const sets: SetEntry[] = Array.from({ length: tempEx.defaultSets }, (_, i) => ({
          id: `set-${Date.now()}-${i}`, reps: 0, weight: 0, volume: 0,
        }));
        return {
          id: tempEx.exerciseId,
          name: details?.name || 'Unknown Exercise',
          muscleGroup: fullDetails?.muscleGroup || 'Unknown',
          sets,
        };
      }),
    };
    setActiveSession(newSession);
    setSessions(prev => [...prev.filter(s => s.id !== newSession.id), newSession]);
    setView('SESSION');
  };
  
  const handleStartWorkoutRequest = (date: string) => {
      setWorkoutRequestDate(date);
      setWorkoutSelectionModalOpen(true);
  };

  const handleSelectWorkout = (template: WorkoutTemplate) => {
      if (workoutRequestDate) {
          startWorkout(template, workoutRequestDate);
          setWorkoutRequestDate(null);
      }
      setWorkoutSelectionModalOpen(false);
  };
  
  const handleEditSession = (sessionId: string) => {
    const sessionToEdit = sessions.find(s => s.id === sessionId);
    if(sessionToEdit) {
      setActiveSession(sessionToEdit);
      setView('SESSION');
    }
  };

  const handleUpdateSession = (updatedSession: Session) => {
    setActiveSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  };
  
  const handleSaveTemplates = (newTemplates: WorkoutTemplate[]) => {
    setWorkoutTemplates(newTemplates);
  };
  
  const handleSaveProfile = (profileData: UserProfile) => {
    const age = profileData.dob ? getAge(profileData.dob) : 0;
    setProfile({
      ...profileData,
      age,
      onboardingCompleted: true,
      lastUpdated: new Date().toISOString(),
    });
  };
  
  const todayLog = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let log = dailyLogs.find(l => l.date === todayStr);
    if (!log) {
        log = {
            date: todayStr,
            meals: [
                { name: 'Breakfast', foods: [] },
                { name: 'Lunch', foods: [] },
                { name: 'Dinner', foods: [] },
                { name: 'Snacks', foods: [] },
            ],
            waterIntake: 0,
            steps: 0,
        };
    }
    return log;
  }, [dailyLogs]);

  const handleUpdateLog = (updatedLog: DailyLog) => {
    setDailyLogs(prev => {
        const existing = prev.find(l => l.date === updatedLog.date);
        if(existing) {
            return prev.map(l => l.date === updatedLog.date ? updatedLog : l);
        }
        return [...prev, updatedLog];
    });
  };
  
  const handleAddCustomFood = (food: FoodItem) => {
    setCustomFoods(prev => [...prev, food]);
  };

  const nextWorkoutTemplate = useMemo(() => {
    if (!workoutTemplates || workoutTemplates.length === 0) {
        return null;
    }

    const lastCompletedSession = [...sessions]
        .filter(s => s.status === 'completed' && s.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
        [0];
    
    if (!lastCompletedSession) {
        return workoutTemplates[0];
    }

    const lastTemplateIndex = workoutTemplates.findIndex(t => t.id === lastCompletedSession.templateId);

    if (lastTemplateIndex === -1) {
        return workoutTemplates[0]; // Fallback
    }
    
    const nextIndex = (lastTemplateIndex + 1) % workoutTemplates.length;
    return workoutTemplates[nextIndex];
  }, [sessions, workoutTemplates]);

  const handleViewActivity = (tab: 'calories' | 'steps') => {
    setInitialActivityTab(tab);
    setView('ACTIVITY');
  };
  
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  if (currentUser && !userProfile.onboardingCompleted) {
    return <Onboarding 
            onSave={handleSaveProfile} 
            theme={theme}
            setTheme={setTheme}
            palette={palette}
            setPalette={setPalette}
           />;
  }

  const renderView = () => {
    switch (view) {
      case 'SESSION':
        return activeSession ? (
          <WorkoutSession
            session={activeSession}
            onUpdateSession={handleUpdateSession}
            onExit={() => { setActiveSession(null); setView('DASHBOARD'); }}
            unit={unit}
            workoutTemplates={workoutTemplates}
            userRatings={userRatings}
            onRateExercise={setUserRatings}
            imageCache={imageCache}
            onCacheImage={setImageCache}
          />
        ) : <p>No active session. Go to Dashboard to start one.</p>;
      case 'HISTORY':
        return <History 
                  sessions={sessions} 
                  unit={unit} 
                  workoutTemplates={workoutTemplates} 
                  dailyLogs={dailyLogs}
                />;
      case 'PROFILE':
        return <Profile 
                  profile={userProfile} 
                  setProfile={setProfile}
                  unit={unit}
                  sessions={sessions}
                />;
       case 'SETTINGS':
        return <Settings 
                  theme={theme}
                  setTheme={setTheme}
                  unit={unit}
                  setUnit={setUnit}
                  palette={palette}
                  setPalette={setPalette}
                  onLogout={handleLogout}
                />;
      case 'STRATEGY':
        return <Strategy 
                 currentTemplates={workoutTemplates} 
                 onSaveTemplates={handleSaveTemplates}
                 sessions={sessions}
                 onStartWorkoutRequest={handleStartWorkoutRequest}
                 onEditSession={handleEditSession}
                />;
      case 'MORE':
        return <More onViewChange={setView} onLogout={handleLogout} />;
      case 'NUTRITION':
        return <NutritionTracker dailyLog={todayLog} onUpdateLog={handleUpdateLog} foodDatabase={foodDatabase} onAddCustomFood={handleAddCustomFood} userGoals={userProfile.goals} />;

      case 'ACTIVITY':
          return <MyActivity 
                    dailyLogs={dailyLogs}
                    foodDatabase={foodDatabase}
                    userGoals={userProfile.goals}
                    onBack={() => setView('DASHBOARD')}
                    initialTab={initialActivityTab}
                  />;

      case 'DASHBOARD':
      default:
        return <Dashboard 
                 sessions={sessions}
                 profile={userProfile}
                 dailyLog={todayLog}
                 allDailyLogs={dailyLogs}
                 onUpdateLog={handleUpdateLog}
                 onStartWorkout={(template) => startWorkout(template)} 
                 nextWorkoutTemplate={nextWorkoutTemplate}
                 onChooseWorkout={() => handleStartWorkoutRequest(new Date().toISOString().split('T')[0])}
                 userGoals={userProfile.goals}
                 foodDatabase={foodDatabase}
                 onViewActivity={handleViewActivity}
                 onViewProfile={() => setView('PROFILE')}
               />;
    }
  };

  const isFullScreenView = view === 'SESSION' || view === 'ACTIVITY';

  return (
    <div className={`min-h-screen bg-bg-base text-text-base`}>
      <div className={`container mx-auto p-4 ${!isFullScreenView ? 'pb-24' : ''}`}>
        <main>{renderView()}</main>
      </div>

      {!isFullScreenView && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-muted border-t border-border">
          <div className="container mx-auto px-4">
              <div className="flex justify-around items-center h-16">
                  <BottomNavItem icon="lock" label="lockIn" active={view === 'DASHBOARD'} onClick={() => setView('DASHBOARD')} />
                  <BottomNavItem icon="food" label="Food Log" active={view === 'NUTRITION'} onClick={() => setView('NUTRITION')} />
                  <button 
                      onClick={() => setAddActionModalOpen(true)}
                      className="bg-primary text-primary-content rounded-full w-14 h-14 flex items-center justify-center -mt-6 shadow-lg hover:scale-110 transition-transform"
                      aria-label="Add new entry"
                  >
                      <Icon name="plus" className="w-8 h-8"/>
                  </button>
                  <BottomNavItem icon="clipboard" label="Strategy" active={view === 'STRATEGY'} onClick={() => setView('STRATEGY')} />
                  <BottomNavItem icon="cog" label="More" active={view === 'MORE'} onClick={() => setView('MORE')} />
              </div>
          </div>
        </div>
      )}

      <WorkoutSelectionModal
        isOpen={isWorkoutSelectionModalOpen}
        onClose={() => setWorkoutSelectionModalOpen(false)}
        onSelect={handleSelectWorkout}
        workoutTemplates={workoutTemplates}
      />
      
      <AddActionModal 
        isOpen={isAddActionModalOpen}
        onClose={() => setAddActionModalOpen(false)}
        onLogFood={() => { setView('NUTRITION'); setAddActionModalOpen(false); }}
        onStartWorkout={() => { handleStartWorkoutRequest(new Date().toISOString().split('T')[0]); setAddActionModalOpen(false); }}
      />
    </div>
  );
}

export default App;