import React, { useState } from 'react';
import Icon from './common/Icon';
import type { UserProfile, WorkoutTemplate, DailyLog, Session } from '../types';
import { generatePlan } from '../constants/presets';

interface LoginPageProps {
  onLogin: (mobileNumber: string) => void;
}

const AUTH_PREFIX = 'ppl_tracker_auth_';
const checkUserExists = (mobile: string): boolean => !!localStorage.getItem(AUTH_PREFIX + mobile);
const registerUser = (mobile: string, pass: string): void => localStorage.setItem(AUTH_PREFIX + mobile, pass);
const loginUser = (mobile: string, pass: string): boolean => localStorage.getItem(AUTH_PREFIX + mobile) === pass;

// Seeds local storage with sample data for the test user
const seedTestData = (mobile: string) => {
    // 1. Seed Profile to skip onboarding
    const testProfile: UserProfile = {
        name: 'Test User',
        profileImage: `https://api.dicebear.com/8.x/initials/svg?seed=Test`,
        sex: 'Male',
        dob: '1995-05-10',
        age: 29,
        height: 180,
        heightUnit: 'cm',
        weight: 82,
        bodyFat: '13-17%',
        activityLevel: 'moderate',
        liftingExperience: 'intermediate',
        cardioExperience: 'beginner',
        exerciseFrequency: '1-3',
        measurements: { waist: 85, chest: 105 },
        measurementUnit: 'cm',
        goals: {
            calorieTarget: 2500,
            proteinTarget: 180,
            fatTarget: 80,
            carbsTarget: 260,
            stepTarget: 8000,
            milesTarget: 4,
            caloriesBurnedTarget: 320,
            moveMinutesTarget: 90,
        },
        onboardingCompleted: true,
        lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(`ppl_profile_${mobile}`, JSON.stringify(testProfile));

    // 2. Seed Workout Templates (PPL Split)
    const testTemplates = generatePlan(3, 'Push/Pull/Legs');
    if (testTemplates) {
        localStorage.setItem(`ppl_templates_${mobile}`, JSON.stringify(testTemplates));
    }

    // 3. Seed some recent daily logs and a session
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(today.getDate() - 2);

    const testDailyLogs: DailyLog[] = [
        {
            date: yesterday.toISOString().split('T')[0],
            meals: [
                { name: 'Breakfast', foods: [{ id: 'log1', foodId: 'food_7', servings: 1.5, loggedAt: new Date().toISOString() }] },
                { name: 'Lunch', foods: [{ id: 'log2', foodId: 'food_1', servings: 2, loggedAt: new Date().toISOString() }, { id: 'log3', foodId: 'food_2', servings: 1, loggedAt: new Date().toISOString() }] },
                { name: 'Dinner', foods: [] },
                { name: 'Snacks', foods: [{ id: 'log4', foodId: 'food_5', servings: 1, loggedAt: new Date().toISOString() }] },
            ],
            steps: 7540,
        },
        { date: dayBefore.toISOString().split('T')[0], meals: [], steps: 4210 },
    ];
    localStorage.setItem(`ppl_daily_logs_${mobile}`, JSON.stringify(testDailyLogs));
    
    // Seed a completed session
    const pushTemplate = testTemplates?.find(t => t.title === 'Push');
    if (pushTemplate) {
        const testSession: Session = {
            id: `session-test-1`,
            date: dayBefore.toISOString().split('T')[0],
            templateId: pushTemplate.id,
            exercises: [
                { id: 'chest_4', name: 'Bench Press', muscleGroup: 'Chest', sets: [
                    { id: 'set1', reps: 8, weight: 80, volume: 640, completedAt: new Date().toISOString() },
                    { id: 'set2', reps: 8, weight: 80, volume: 640, completedAt: new Date().toISOString() },
                ]},
                { id: 'shoulder_22', name: 'Dumbbell Shoulder Press', muscleGroup: 'Shoulders', sets: [
                    { id: 'set4', reps: 10, weight: 20, volume: 200, completedAt: new Date().toISOString() },
                ]},
            ],
            status: 'completed',
            totalVolume: 1480,
            unit: 'kg',
            completedAt: new Date().toISOString(),
        };
        localStorage.setItem(`ppl_sessions_${mobile}`, JSON.stringify([testSession]));
    }
};

type Stage = 'MOBILE' | 'LOGIN' | 'REGISTER';

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [stage, setStage] = useState<Stage>('MOBILE');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMobile = mobileNumber.trim();
    if (trimmedMobile.length !== 10 && trimmedMobile !== '1') {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    
    // Auto-register the old test user if they don't exist
    if (trimmedMobile === '7200134807' && !checkUserExists(trimmedMobile)) {
      registerUser(trimmedMobile, 'Asif');
    }
    
    // Auto-register the new test user '1' and seed data
    if (trimmedMobile === '1' && !checkUserExists(trimmedMobile)) {
        registerUser('1', '1');
        seedTestData('1');
    }

    if (checkUserExists(trimmedMobile)) {
      setStage('LOGIN');
    } else {
      setStage('REGISTER');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser(mobileNumber.trim(), password)) {
      setError('');
      onLogin(mobileNumber.trim());
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6 && mobileNumber.trim() !== '1') {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    registerUser(mobileNumber.trim(), password);
    onLogin(mobileNumber.trim());
  };

  const handleBack = () => {
    setStage('MOBILE');
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const renderMobileForm = () => (
    <form onSubmit={handleMobileSubmit} className="space-y-6">
      <div>
        <label htmlFor="mobile" className="sr-only">Mobile Number</label>
        <input
          id="mobile"
          name="mobile"
          type="tel"
          autoComplete="tel"
          required
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
          className="w-full px-4 py-3 text-lg text-center bg-neutral-900 text-white border-2 border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
          placeholder="Enter Mobile Number"
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 px-4 text-lg font-bold rounded-lg transition-colors bg-white text-black hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-black"
      >
        Continue
      </button>
    </form>
  );

  const renderLoginForm = () => (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <p className="text-neutral-400">Welcome back! Please enter your password for <span className="font-semibold text-white">{mobileNumber}</span>.</p>
      <div>
        <label htmlFor="password-login" className="sr-only">Password</label>
        <input
          id="password-login"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 text-lg text-center bg-neutral-900 text-white border-2 border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
          placeholder="Enter Password"
        />
      </div>
      <button type="submit" className="w-full py-3 px-4 text-lg font-bold rounded-lg transition-colors bg-white text-black hover:bg-neutral-200">
        Log In
      </button>
    </form>
  );

  const renderRegisterForm = () => (
    <form onSubmit={handleRegisterSubmit} className="space-y-4">
      <p className="text-neutral-400">Welcome! Create a password to secure your account for <span className="font-semibold text-white">{mobileNumber}</span>.</p>
      <div>
        <label htmlFor="password-register" className="sr-only">Create Password</label>
        <input
          id="password-register"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 text-lg text-center bg-neutral-900 text-white border-2 border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
          placeholder="Create a Password"
        />
      </div>
      <div>
        <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
        <input
          id="confirm-password"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 text-lg text-center bg-neutral-900 text-white border-2 border-neutral-800 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent transition-colors"
          placeholder="Confirm Password"
        />
      </div>
      <button type="submit" className="w-full py-3 px-4 text-lg font-bold rounded-lg transition-colors bg-white text-black hover:bg-neutral-200">
        Create Account
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
         {stage !== 'MOBILE' && (
          <button onClick={handleBack} className="absolute top-4 left-4 flex items-center gap-2 text-neutral-400 hover:text-white font-semibold p-2 rounded-lg">
            <Icon name="chevronLeft" /> Back
          </button>
        )}
        <header className="mb-8 text-center">
          <h1 className="text-5xl font-bold text-white">
            lockIn
          </h1>
          <p className="text-neutral-400 mt-2">
            {stage === 'MOBILE' && 'Log in or sign up to track your progress.'}
            {stage === 'LOGIN' && 'Enter your password to continue.'}
            {stage === 'REGISTER' && 'Create your new account.'}
          </p>
        </header>
        <main>
          {stage === 'MOBILE' && renderMobileForm()}
          {stage === 'LOGIN' && renderLoginForm()}
          {stage === 'REGISTER' && renderRegisterForm()}
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
        </main>
        <footer className="mt-12 text-center text-sm text-neutral-500">
          <p>Your data is stored locally on your device.</p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;