

import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import type { UserProfile, View, WeightUnit, Session, WorkoutTemplate, DailyLog, FoodItem, DailyChecklistItem, UserRatings, GoogleFitData } from './types.ts';

// Constants
import { ALL_FOODS } from './constants/foods.ts';
import { allExercises } from './constants/allExercises.ts';
import { palettes } from './constants/palettes.ts';
import { getAge } from './utils/fitnessCalculations.ts';

// Components
import LoginPage from './components/LoginPage.tsx';
import Onboarding from './components/Onboarding.tsx';
import Dashboard from './components/Dashboard.tsx';
import Strategy from './components/Strategy.tsx';
import NutritionTracker from './components/NutritionTracker.tsx';
import History from './components/History.tsx';
import Settings from './components/Settings.tsx';
import More from './components/More.tsx';
import WorkoutSession from './components/WorkoutSession.tsx';
import AddActionModal from './components/AddActionModal.tsx';
import WorkoutSelectionModal from './components/WorkoutSelectionModal.tsx';
import Icon from './components/common/Icon.tsx';
import Profile from './components/Profile.tsx';
import MyActivity from './components/MyActivity.tsx';

// --- GOOGLE FIT CONSTANTS & CONFIG ---
const GOOGLE_FIT_REDIRECT_URI = window.location.origin;
const GOOGLE_FIT_SCOPES = 'https://www.googleapis.com/auth/fitness.activity.read';

// --- PKCE HELPER FUNCTIONS ---
const generateCodeVerifier = (): string => {
  const randomBytes = new Uint8Array(32);
  window.crypto.getRandomValues(randomBytes);
  return btoa(String.fromCharCode.apply(null, Array.from(randomBytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const generateCodeChallenge = async (verifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};


// --- GOOGLE FIT SERVICE FUNCTIONS ---
const getGoogleFitAuthUrl = async (clientId: string): Promise<string> => {
  const verifier = generateCodeVerifier();
  sessionStorage.setItem('ppl_google_fit_code_verifier', verifier);
  const challenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: GOOGLE_FIT_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_FIT_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const exchangeCodeForTokens = async (code: string, clientId: string): Promise<GoogleFitData> => {
  const verifier = sessionStorage.getItem('ppl_google_fit_code_verifier');
  if (!verifier) {
    throw new Error('Code verifier not found in session storage.');
  }

  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    redirect_uri: GOOGLE_FIT_REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: verifier,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to exchange code for token: ${errorData.error_description || 'Unknown error'}`);
  }
  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    scope: data.scope,
  };
};

const refreshAccessToken = async (refreshToken: string, clientId: string): Promise<GoogleFitData> => {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const body = new URLSearchParams({
        client_id: clientId,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to refresh token: ${errorData.error_description || 'Unknown error'}`);
    }
    const data = await response.json();
    return {
        accessToken: data.access_token,
        refreshToken: refreshToken, // Reuse the existing refresh token
        expiresAt: Date.now() + data.expires_in * 1000,
        scope: data.scope,
    };
};

const fetchTodayStepCount = async (accessToken: string): Promise<number> => {
    const today = new Date();
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const endTime = Date.now();

    const requestBody = {
        aggregateBy: [{
            dataTypeName: "com.google.step_count.delta",
            dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:aggregated"
        }],
        bucketByTime: { durationMillis: 86400000 }, // 1 day
        startTimeMillis: startTime,
        endTimeMillis: endTime,
    };
    
    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.status === 'UNAUTHENTICATED') {
            throw new Error('Token is invalid or expired.');
        }
        throw new Error('Failed to fetch step count from Google Fit.');
    }

    const data = await response.json();
    if (data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal) {
        return data.bucket[0].dataset[0].point[0].value[0].intVal;
    }
    return 0;
};

const disconnectGoogleFit = async (accessToken: string): Promise<void> => {
    try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-type': 'application/x-www-form-urlencoded' }
        });
    } catch (error) {
        console.error("Error revoking Google Fit token:", error);
    }
};
// --- END GOOGLE FIT SERVICE FUNCTIONS ---

// Helper to get today's date string
const getTodayDateString = () => new Date().toISOString().split('T')[0];

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem('ppl_current_user'));

    const handleLogin = (user: string) => {
        localStorage.setItem('ppl_current_user', user);
        setCurrentUser(user);
    };

    const handleLogout = () => {
        localStorage.removeItem('ppl_current_user');
        setCurrentUser(null);
    };

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return <MainApp userKey={currentUser} onLogout={handleLogout} />;
};

const MainApp: React.FC<{ userKey: string; onLogout: () => void; }> = ({ userKey, onLogout }) => {
    // --- LOCAL STORAGE STATE ---
    const [profile, setProfile] = useLocalStorage<UserProfile | null>(`ppl_profile_${userKey}`, null);
    const [sessions, setSessions] = useLocalStorage<Session[]>(`ppl_sessions_${userKey}`, []);
    const [workoutTemplates, setWorkoutTemplates] = useLocalStorage<WorkoutTemplate[]>(`ppl_templates_${userKey}`, []);
    const [dailyLogs, setDailyLogs] = useLocalStorage<DailyLog[]>(`ppl_daily_logs_${userKey}`, []);
    const [foodDatabase, setFoodDatabase] = useLocalStorage<FoodItem[]>(`ppl_foods_${userKey}`, ALL_FOODS);
    const [userRatings, setUserRatings] = useLocalStorage<UserRatings>(`ppl_ratings_${userKey}`, {});
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>(`ppl_theme_${userKey}`, 'dark');
    const [palette, setPalette] = useLocalStorage<string>(`ppl_palette_${userKey}`, 'Monochrome');
    const [unit, setUnit] = useLocalStorage<WeightUnit>(`ppl_unit_${userKey}`, 'kg');
    const [googleFitData, setGoogleFitData] = useLocalStorage<GoogleFitData | null>(`ppl_google_fit_${userKey}`, null);
    const [googleClientId, setGoogleClientId] = useLocalStorage<string | null>(`ppl_google_client_id_${userKey}`, null);


    // --- UI STATE ---
    const [view, setView] = useState<View>('DASHBOARD');
    const [activeSession, setActiveSession] = useState<Session | null>(null);
    const [isAddActionModalOpen, setAddActionModalOpen] = useState(false);
    const [isWorkoutSelectionModalOpen, setWorkoutSelectionModalOpen] = useState(false);
    const [isSyncingSteps, setIsSyncingSteps] = useState(false);
    
    // --- THEME MANAGEMENT ---
    useEffect(() => {
        const root = document.documentElement;
        const selectedPalette = palettes.find(p => p.name === palette) || palettes[0];
        const colors = selectedPalette[theme];

        for (const [key, value] of Object.entries(colors)) {
            root.style.setProperty(`--color-${key}`, value);
        }
        
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme, palette]);

    // --- DATA DERIVATION & HELPERS ---
    const todaysLog = useMemo(() => {
        const todayStr = getTodayDateString();
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
                steps: 0,
            };
        }
        return log;
    }, [dailyLogs]);
    
    const updateTodaysLog = (updatedLog: DailyLog) => {
        setDailyLogs(prevLogs => {
            const index = prevLogs.findIndex(l => l.date === updatedLog.date);
            if (index > -1) {
                const newLogs = [...prevLogs];
                newLogs[index] = updatedLog;
                return newLogs;
            }
            return [...prevLogs, updatedLog];
        });
    };
    
    const nextWorkoutTemplate = useMemo(() => {
        const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }) as any;
        return workoutTemplates.find(t => t.dayOfWeek === todayName) || null;
    }, [workoutTemplates]);

    // --- GOOGLE FIT INTEGRATION ---
     const syncGoogleFitSteps = async () => {
        if (!googleFitData || !googleClientId) return;
        setIsSyncingSteps(true);

        try {
            let currentTokens = googleFitData;

            // Check if token is expired and refresh if necessary
            if (Date.now() >= currentTokens.expiresAt) {
                if (currentTokens.refreshToken) {
                    console.log("Refreshing Google Fit access token...");
                    const newTokens = await refreshAccessToken(currentTokens.refreshToken, googleClientId);
                    setGoogleFitData(newTokens);
                    currentTokens = newTokens;
                } else {
                    throw new Error("Session expired and no refresh token available.");
                }
            }

            const steps = await fetchTodayStepCount(currentTokens.accessToken);
            updateTodaysLog({ ...todaysLog, steps });
        } catch (error) {
            console.error("Google Fit sync failed:", error);
            alert("Could not sync from Google Fit. You may need to reconnect in Settings.");
            await handleDisconnectGoogleFit(); // Disconnect on failure to force re-auth
        } finally {
            setIsSyncingSteps(false);
        }
    };
    
    const handleConnectGoogleFit = async () => {
        if (!googleClientId) {
            alert("Please configure your Google Client ID in the Settings tab first.");
            setView('SETTINGS');
            return;
        }
        try {
            const authUrl = await getGoogleFitAuthUrl(googleClientId);
            window.location.href = authUrl;
        } catch (error) {
            console.error("Could not generate Google Fit auth URL:", error);
            alert("An error occurred while preparing to connect to Google Fit. Please check the console.");
        }
    };
    
    const handleDisconnectGoogleFit = async () => {
        if (googleFitData) {
            await disconnectGoogleFit(googleFitData.accessToken);
            setGoogleFitData(null);
            // Reset steps in today's log if we disconnect
            updateTodaysLog({ ...todaysLog, steps: 0 });
        }
    };

    // Handle OAuth redirect from Google
    useEffect(() => {
        const handleOAuthRedirect = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            const error = params.get('error');

            if (error) {
                console.error('OAuth Error:', error);
                alert('Google Fit connection failed. Please try again.');
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            if (code) {
                 if (!googleClientId) {
                    console.error("Received OAuth code but no Client ID is configured.");
                    alert("Google Client ID is not configured. Please set it in Settings before connecting.");
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return;
                }
                try {
                    const tokens = await exchangeCodeForTokens(code, googleClientId);
                    setGoogleFitData(tokens);
                    sessionStorage.removeItem('ppl_google_fit_code_verifier');
                } catch (err) {
                    console.error("Error exchanging Google Fit code:", err);
                    alert("Failed to connect to Google Fit. Please ensure the Client ID is configured correctly and try again.");
                } finally {
                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        };
        handleOAuthRedirect();
    }, [setGoogleFitData, googleClientId]);
    
    // Automatically sync steps when the app loads and is connected to Google Fit
    useEffect(() => {
        if (googleFitData) {
            syncGoogleFitSteps();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [googleFitData]); // Runs when googleFitData is first loaded or changed

    // --- WORKOUT SESSION MANAGEMENT ---
    const startWorkout = (template: WorkoutTemplate, date?: string) => {
        const sessionDate = date || getTodayDateString();
        
        const existingSession = sessions.find(s => s.date === sessionDate);
        if (existingSession) {
            setActiveSession(existingSession);
            setView('WORKOUT_SESSION');
            return;
        }

        const newSession: Session = {
            id: `session-${Date.now()}`,
            date: sessionDate,
            templateId: template.id,
            exercises: template.exercises.map(exTemplate => {
                const exerciseDetails = allExercises.find(ex => ex.id === exTemplate.exerciseId);
                return {
                    id: exTemplate.exerciseId,
                    name: exerciseDetails?.name || 'Unknown Exercise',
                    muscleGroup: exerciseDetails?.muscleGroup || 'Unknown',
                    sets: Array.from({ length: exTemplate.defaultSets }, (_, i) => ({
                        id: `set-${Date.now()}-${i}`,
                        reps: 0,
                        weight: 0,
                        volume: 0,
                    })),
                };
            }),
            status: 'in-progress',
            unit: unit,
        };
        setSessions(prev => [...prev, newSession]);
        setActiveSession(newSession);
        setView('WORKOUT_SESSION');
        setWorkoutSelectionModalOpen(false);
    };

    const updateActiveSession = (updatedSession: Session) => {
        setActiveSession(updatedSession);
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    };

    const exitWorkout = () => {
        setActiveSession(null);
        setView('DASHBOARD');
    };
    
    // --- APP NAVIGATION & MODALS ---
    const NAV_ITEMS = [
        { view: 'DASHBOARD', icon: 'home', label: 'Dashboard' },
        { view: 'STRATEGY', icon: 'clipboard', label: 'Strategy' },
        { view: 'ADD_ACTION', icon: 'plus', label: 'Add' },
        { view: 'NUTRITION', icon: 'utensils', label: 'Nutrition' },
        { view: 'MORE', icon: 'cog', label: 'More' }
    ] as const;

    const handleNavClick = (targetView: typeof NAV_ITEMS[number]['view'] | 'ADD_ACTION') => {
        if (targetView === 'ADD_ACTION') {
            setAddActionModalOpen(true);
        } else {
            setView(targetView);
        }
    };
    
    const handleAddCustomFood = (food: FoodItem) => {
        setFoodDatabase(prev => [...prev, food]);
    };
    
    if (!profile || !profile.onboardingCompleted) {
        return <Onboarding onSave={(p) => { setProfile({...p, onboardingCompleted: true}); }} theme={theme} setTheme={setTheme} palette={palette} setPalette={setPalette} />;
    }
    
    const renderView = () => {
        switch(view) {
            case 'DASHBOARD': return <Dashboard 
                                        profile={profile}
                                        sessions={sessions}
                                        dailyLog={todaysLog}
                                        allDailyLogs={dailyLogs}
                                        onUpdateLog={updateTodaysLog}
                                        nextWorkoutTemplate={nextWorkoutTemplate}
                                        onStartWorkout={(template) => startWorkout(template)}
                                        onChooseWorkout={() => setWorkoutSelectionModalOpen(true)}
                                        userGoals={profile.goals}
                                        foodDatabase={foodDatabase}
                                        onViewActivity={(tab) => { setView('ACTIVITY'); }}
                                        onViewProfile={() => setView('PROFILE')}
                                        isGoogleFitConnected={!!googleFitData}
                                        isSyncingSteps={isSyncingSteps}
                                        syncGoogleFitSteps={syncGoogleFitSteps}
                                        onGoToSettings={() => setView('SETTINGS')}
                                     />;
            case 'STRATEGY': return <Strategy 
                                        currentTemplates={workoutTemplates} 
                                        onSaveTemplates={setWorkoutTemplates}
                                        sessions={sessions}
                                        onStartWorkoutRequest={(date) => {
                                            const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }) as any;
                                            const template = workoutTemplates.find(t => t.dayOfWeek === dayName);
                                            if (template) {
                                                startWorkout(template, date);
                                            } else {
                                                alert("No workout template found for this day.");
                                            }
                                        }}
                                        onEditSession={(sessionId) => {
                                            const session = sessions.find(s => s.id === sessionId);
                                            if (session) {
                                                setActiveSession(session);
                                                setView('WORKOUT_SESSION');
                                            }
                                        }}
                                    />;
            case 'NUTRITION': return <NutritionTracker 
                                        dailyLog={todaysLog} 
                                        onUpdateLog={updateTodaysLog}
                                        foodDatabase={foodDatabase}
                                        onAddCustomFood={handleAddCustomFood}
                                        userGoals={profile.goals}
                                      />;
            case 'HISTORY': return <History sessions={sessions} unit={unit} workoutTemplates={workoutTemplates} dailyLogs={dailyLogs}/>;
            case 'SETTINGS': return <Settings 
                                        theme={theme} setTheme={setTheme}
                                        unit={unit} setUnit={setUnit}
                                        palette={palette} setPalette={setPalette}
                                        onLogout={onLogout}
                                        isGoogleFitConnected={!!googleFitData}
                                        onConnectGoogleFit={handleConnectGoogleFit}
                                        onDisconnectGoogleFit={handleDisconnectGoogleFit}
                                        googleClientId={googleClientId}
                                        setGoogleClientId={setGoogleClientId}
                                    />;
            case 'MORE': return <More onViewChange={setView} onLogout={onLogout} />;
            case 'PROFILE': return <Profile profile={profile} setProfile={setProfile} unit={unit} sessions={sessions} />;
            case 'ACTIVITY': return <MyActivity dailyLogs={dailyLogs} foodDatabase={foodDatabase} userGoals={profile.goals} onBack={() => setView('DASHBOARD')} initialTab='calories' />;
            default: return <Dashboard 
                                profile={profile}
                                sessions={sessions}
                                dailyLog={todaysLog}
                                allDailyLogs={dailyLogs}
                                onUpdateLog={updateTodaysLog}
                                nextWorkoutTemplate={nextWorkoutTemplate}
                                onStartWorkout={(template) => startWorkout(template)}
                                onChooseWorkout={() => setWorkoutSelectionModalOpen(true)}
                                userGoals={profile.goals}
                                foodDatabase={foodDatabase}
                                onViewActivity={(tab) => { setView('ACTIVITY'); }}
                                onViewProfile={() => setView('PROFILE')}
                                isGoogleFitConnected={!!googleFitData}
                                isSyncingSteps={isSyncingSteps}
                                syncGoogleFitSteps={syncGoogleFitSteps}
                                onGoToSettings={() => setView('SETTINGS')}
                             />;
        }
    }
    
    if (activeSession) {
        return (
             <div className="container mx-auto px-4 pt-4">
                <WorkoutSession 
                    session={activeSession}
                    onUpdateSession={updateActiveSession}
                    onExit={exitWorkout}
                    unit={unit}
                    workoutTemplates={workoutTemplates}
                    userRatings={userRatings}
                    onRateExercise={setUserRatings}
                />
             </div>
        )
    }

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 pt-4 pb-28">
                {renderView()}
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-muted border-t border-border">
                <div className="container mx-auto px-4 h-20 grid grid-cols-5 items-center">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.view}
                            onClick={() => handleNavClick(item.view === 'ADD_ACTION' ? 'ADD_ACTION' : item.view)}
                            className={`flex flex-col items-center justify-center h-full transition-colors ${
                                view === item.view ? 'text-primary' : 'text-text-muted hover:text-text-base'
                            } ${item.view === 'ADD_ACTION' ? '-mt-8' : ''}`}
                        >
                            {item.view === 'ADD_ACTION' ? (
                                <div className="w-16 h-16 rounded-full bg-primary text-primary-content flex items-center justify-center shadow-lg border-4 border-bg-muted">
                                    <Icon name={item.icon} className="w-8 h-8"/>
                                </div>
                            ) : (
                                <>
                                    <Icon name={item.icon} className="w-7 h-7" />
                                    <span className="text-xs font-semibold mt-1">{item.label}</span>
                                </>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <AddActionModal
                isOpen={isAddActionModalOpen}
                onClose={() => setAddActionModalOpen(false)}
                onLogFood={() => { setAddActionModalOpen(false); setView('NUTRITION'); }}
                onStartWorkout={() => { setAddActionModalOpen(false); setWorkoutSelectionModalOpen(true); }}
            />
            <WorkoutSelectionModal
                isOpen={isWorkoutSelectionModalOpen}
                onClose={() => setWorkoutSelectionModalOpen(false)}
                onSelect={(template) => startWorkout(template)}
                workoutTemplates={workoutTemplates}
                suggestedTemplate={nextWorkoutTemplate || undefined}
            />
        </div>
    );
};

export default App;