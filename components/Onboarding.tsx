import React, { useState, useEffect } from 'react';
// FIX: Added UserGoals to the import from '../types' to resolve the 'Cannot find name' error.
import { UserProfile, Sex, WeightTrend, BodyFatOption, ActivityLevel, ExperienceLevel, ExerciseFrequency, HeaviestWeightHistory, UserGoals } from '../types';
import { calculateTDEE } from '../utils/fitnessCalculations';
import Icon from './common/Icon';
import { bodyFatImages } from '../assets/bodyFatImages';
import { palettes } from '../constants/palettes';

interface OnboardingProps {
    onSave: (profileData: UserProfile) => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    palette: string;
    setPalette: (palette: string) => void;
}

const TOTAL_STEPS = 12;

const Onboarding: React.FC<OnboardingProps> = ({ onSave, theme, setTheme, palette, setPalette }) => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<Partial<UserProfile>>({
        heightUnit: 'cm',
        measurements: {},
        goals: {
            calorieTarget: 2200,
            proteinTarget: 165,
            fatTarget: 73,
            carbsTarget: 220,
            stepTarget: 10000,
            milesTarget: 5,
            caloriesBurnedTarget: 400,
            moveMinutesTarget: 100,
        }
    });

    const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS + 1));
    const back = () => setStep(s => Math.max(s - 1, 1));

    const updateData = (update: Partial<UserProfile>) => {
        setData(prev => ({ ...prev, ...update }));
    };

    const handleActivitySelect = (activityLevel: ActivityLevel) => {
        let stepTarget = 10000;
        if (activityLevel === 'sedentary') {
            stepTarget = 5000;
        } else if (activityLevel === 'moderate') {
            stepTarget = 10000;
        } else if (activityLevel === 'active') {
            stepTarget = 15000;
        }

        setData(prev => ({
            ...prev,
            activityLevel,
            goals: { ...(prev.goals as UserGoals), stepTarget }
        }));
        next();
    };

    const handleFinish = () => {
        onSave(data as UserProfile);
    };

    const estimatedTDEE = calculateTDEE(data);

    const renderStep = () => {
        switch(step) {
            case 1: return <StepName value={data.name} onSelect={(name) => { updateData({ name }); next(); }} />;
            case 2: return <StepSex value={data.sex} onSelect={(sex) => { updateData({ sex }); next(); }} />;
            case 3: return <StepDOB value={data.dob} onSelect={(dob) => { updateData({ dob }); next(); }} />;
            case 4: return <StepHeight value={data.height} unit={data.heightUnit} onSelect={(height, heightUnit) => { updateData({ height, heightUnit }); next(); }} />;
            case 5: return <StepWeight value={data.weight} onSelect={(weight) => { updateData({ weight }); next(); }} />;
            case 6: return <StepBodyFat value={data.bodyFat} onSelect={(bodyFat) => { updateData({ bodyFat }); next(); }} />;
            case 7: return <StepActivity value={data.activityLevel} onSelect={handleActivitySelect} />;
            case 8: return <StepExperienceLifting value={data.liftingExperience} onSelect={(lifting) => { updateData({ liftingExperience: lifting }); next(); }} />;
            case 9: return <StepExperienceCardio value={data.cardioExperience} onSelect={(cardio) => { updateData({ cardioExperience: cardio }); next(); }} />;
            case 10: return <StepFrequency value={data.exerciseFrequency} onSelect={(exerciseFrequency) => { updateData({ exerciseFrequency }); next(); }} />;
            case 11: return <StepGoals tdee={estimatedTDEE} goals={data.goals} onSelect={(goals) => { updateData({ goals }); next(); }} />;
            case 12: return <StepTheme theme={theme} setTheme={setTheme} palette={palette} setPalette={setPalette} onSelect={next} />;
            case 13: return <StepSummary onFinish={handleFinish} />;
            default: return null;
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col p-4">
            <header className="flex-shrink-0">
                {step > 1 && step <= TOTAL_STEPS + 1 && <button onClick={back} className="text-lg flex items-center gap-1"><Icon name="chevronLeft" /> Back</button>}
                <div className="w-full bg-neutral-800 rounded-full h-1.5 my-4">
                    <div className="bg-neutral-200 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}></div>
                </div>
            </header>
            <main className="flex-grow flex flex-col justify-center">
                {renderStep()}
            </main>
        </div>
    );
}

// Sub-components for each step

const StepName: React.FC<{ value?: string; onSelect: (name: string) => void; }> = ({ value, onSelect }) => {
    const [name, setName] = useState(value || '');

    const handleSubmit = () => {
        if (name.trim()) {
            onSelect(name.trim());
        }
    };

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">What should we call you?</h1>
            <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full max-w-sm mx-auto bg-neutral-800 p-3 text-2xl rounded text-center mb-8"
            />
            <NextButton onClick={handleSubmit} disabled={!name.trim()}>Next</NextButton>
        </div>
    );
};

const StepTheme: React.FC<{
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    palette: string;
    setPalette: (palette: string) => void;
    onSelect: () => void;
}> = ({ theme, setTheme, palette, setPalette, onSelect }) => {
    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Choose Your Look</h1>
            <p className="text-neutral-400 mb-8">Personalize the app's appearance.</p>
            
            <div className="max-w-md mx-auto space-y-8">
                <div>
                    <h4 className="font-semibold text-lg mb-3 text-left">Theme</h4>
                    <div className="flex space-x-4">
                        <button onClick={() => setTheme('light')} className={`flex-1 p-3 rounded-md text-center font-semibold transition-all ${theme === 'light' ? 'bg-white text-black ring-2 ring-white' : 'bg-neutral-800'}`}>
                            <i className="fas fa-sun mr-2"></i> Light
                        </button>
                        <button onClick={() => setTheme('dark')} className={`flex-1 p-3 rounded-md text-center font-semibold transition-all ${theme === 'dark' ? 'bg-white text-black ring-2 ring-white' : 'bg-neutral-800'}`}>
                            <i className="fas fa-moon mr-2"></i> Dark
                        </button>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-lg mb-3 text-left">Color Palette</h4>
                    <div className="flex flex-wrap gap-4 justify-center">
                        {palettes.map(p => (
                            <button
                                key={p.name}
                                onClick={() => setPalette(p.name)}
                                className={`p-2 rounded-lg border-2 transition-all ${palette === p.name ? 'border-white' : 'border-transparent hover:border-neutral-700'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full border-2 border-neutral-700" style={{ backgroundColor: `rgb(${p[theme]['primary']})` }}></div>
                                        <div className="w-6 h-6 rounded-full border-2 border-neutral-700" style={{ backgroundColor: `rgb(${p[theme]['accent']})` }}></div>
                                    </div>
                                    <span className="font-semibold pr-2">{p.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-12 max-w-sm mx-auto">
                <NextButton onClick={onSelect}>Next</NextButton>
            </div>
        </div>
    );
};

const StepSex: React.FC<{ value?: Sex; onSelect: (sex: Sex) => void; }> = ({ value, onSelect }) => (
    <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">What is your sex?</h1>
        <div className="space-y-4 max-w-sm mx-auto">
            <OptionButton selected={value === 'Female'} onClick={() => onSelect('Female')}>Female</OptionButton>
            <OptionButton selected={value === 'Male'} onClick={() => onSelect('Male')}>Male</OptionButton>
        </div>
    </div>
);

const StepDOB: React.FC<{ value?: string; onSelect: (dob: string) => void; }> = ({ value, onSelect }) => {
    const [date, setDate] = useState(value || '1999-06-15');
    
    const handleSubmit = () => {
        if (date) onSelect(date);
    };

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">When were you born?</h1>
            <p className="text-neutral-400 mb-8">This helps us calculate your metabolism.</p>
            <div className="flex justify-center items-center gap-4 mb-8">
                <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="w-full max-w-sm bg-neutral-800 p-3 rounded text-center text-xl"
                    placeholder="YYYY-MM-DD"
                />
            </div>
            <NextButton onClick={handleSubmit} disabled={!date}>Next</NextButton>
        </div>
    );
};

const StepHeight: React.FC<{ value?: number; unit?: 'cm' | 'in'; onSelect: (height: number, unit: 'cm' | 'in') => void; }> = ({ onSelect }) => {
    const [height, setHeight] = useState(175);
    const [unit, setUnit] = useState<'cm' | 'in'>('cm');

    const handleSubmit = () => onSelect(height, unit);

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">What is your height?</h1>
            <div className="flex justify-center mb-4">
                 <div className="flex bg-neutral-800 p-1 rounded-lg">
                    <button onClick={() => setUnit('cm')} className={`px-4 py-1.5 rounded-md font-semibold transition-colors ${unit === 'cm' ? 'bg-neutral-100 text-black' : ''}`}>Centimeters</button>
                    <button onClick={() => setUnit('in')} className={`px-4 py-1.5 rounded-md font-semibold transition-colors ${unit === 'in' ? 'bg-neutral-100 text-black' : ''}`}>Inches</button>
                </div>
            </div>
            <input type="number" value={height} onChange={e => setHeight(parseFloat(e.target.value))} className="w-48 bg-neutral-800 p-3 text-2xl rounded text-center mb-8" />
            <NextButton onClick={handleSubmit}>Next</NextButton>
        </div>
    );
};

const StepWeight: React.FC<{ value?: number; onSelect: (weight: number) => void; }> = ({ onSelect }) => {
    const [weight, setWeight] = useState(70);

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">What is your current weight? (kg)</h1>
             <input type="number" value={weight} onChange={e => setWeight(parseFloat(e.target.value))} className="w-48 bg-neutral-800 p-3 text-2xl rounded text-center mb-8" />
            <NextButton onClick={() => onSelect(weight)}>Next</NextButton>
        </div>
    )
};

const StepBodyFat: React.FC<{ value?: BodyFatOption; onSelect: (bodyFat: BodyFatOption) => void; }> = ({ value, onSelect }) => {
    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">What is your body fat level?</h1>
            <p className="text-neutral-400 mb-8 max-w-sm mx-auto">Use a visual assessment and don't worry about being too precise.</p>
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                {bodyFatImages.map(item => (
                    <button
                        key={item.range}
                        onClick={() => onSelect(item.range)}
                        className={`aspect-square p-1 rounded-lg border-2 relative group focus:outline-none ${value === item.range ? 'border-white' : 'border-neutral-700 hover:border-neutral-500'}`}
                    >
                        <div className="bg-neutral-800 rounded-md w-full h-full flex items-center justify-center">
                            {item.svg}
                        </div>
                        <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-[90%] text-center text-sm font-semibold py-1 px-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${value === item.range ? 'bg-white text-black' : 'bg-black/80 text-white'}`}>
                           {value === item.range && <Icon name="check" className="w-4 h-4" />}
                           {item.range}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const StepActivity: React.FC<{ value?: ActivityLevel; onSelect: (level: ActivityLevel) => void; }> = ({ value, onSelect }) => (
    <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">How active are you?</h1>
        <p className="text-neutral-400 mb-8">Select your level of physical activity outside of exercise.</p>
        <div className="space-y-4 max-w-md mx-auto">
            <OptionButton selected={value === 'sedentary'} onClick={() => onSelect('sedentary')}>
                <span className="font-bold">Mostly Sedentary</span>
                <span className="text-sm text-neutral-400 block">Commonly under 5,000 steps a day</span>
            </OptionButton>
            <OptionButton selected={value === 'moderate'} onClick={() => onSelect('moderate')}>
                 <span className="font-bold">Moderately Active</span>
                <span className="text-sm text-neutral-400 block">Commonly 5,000 - 15,000 steps a day</span>
            </OptionButton>
            <OptionButton selected={value === 'active'} onClick={() => onSelect('active')}>
                <span className="font-bold">Very Active</span>
                <span className="text-sm text-neutral-400 block">Commonly more than 15,000 steps a day</span>
            </OptionButton>
        </div>
    </div>
);

const StepExperienceLifting: React.FC<{ value?: ExperienceLevel; onSelect: (lifting: ExperienceLevel) => void; }> = ({ value, onSelect }) => {
    const options: ExperienceLevel[] = ['none', 'beginner', 'intermediate', 'advanced'];
    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">What is your lifting experience?</h1>
            <div className="space-y-4 max-w-sm mx-auto">
                {options.map(opt => <OptionButton key={opt} selected={value === opt} onClick={() => onSelect(opt)}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</OptionButton>)}
            </div>
        </div>
    );
};

const StepExperienceCardio: React.FC<{ value?: ExperienceLevel; onSelect: (cardio: ExperienceLevel) => void; }> = ({ value, onSelect }) => {
    const options: ExperienceLevel[] = ['none', 'beginner', 'intermediate', 'advanced'];
    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">What is your cardio experience?</h1>
            <div className="space-y-4 max-w-sm mx-auto">
                {options.map(opt => <OptionButton key={opt} selected={value === opt} onClick={() => onSelect(opt)}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</OptionButton>)}
            </div>
        </div>
    );
};

const StepFrequency: React.FC<{ value?: ExerciseFrequency; onSelect: (freq: ExerciseFrequency) => void; }> = ({ value, onSelect }) => {
    const options: ExerciseFrequency[] = ['0', '1-3', '4-6', '7+'];
    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">How often do you exercise?</h1>
            <p className="text-neutral-400 mb-8">Estimate the number of sessions per week.</p>
            <div className="space-y-4 max-w-sm mx-auto">
                {options.map(opt => <OptionButton key={opt} selected={value === opt} onClick={() => onSelect(opt)}>{opt} sessions / week</OptionButton>)}
            </div>
        </div>
    );
};

const StepGoals: React.FC<{ tdee: number, goals?: UserGoals, onSelect: (goals: UserGoals) => void; }> = ({ tdee, goals, onSelect }) => {
    const [calories, setCalories] = useState(tdee);
    const [steps, setSteps] = useState(goals?.stepTarget || 10000);

    useEffect(() => {
        setCalories(tdee);
    }, [tdee]);

    useEffect(() => {
        if (goals?.stepTarget) {
            setSteps(goals.stepTarget);
        }
    }, [goals?.stepTarget]);

    const handleSelect = () => {
        const proteinTarget = Math.round((calories * 0.3) / 4);
        const fatTarget = Math.round((calories * 0.3) / 9);
        const carbsTarget = Math.round((calories * 0.4) / 4);
        const milesTarget = parseFloat((steps / 2000).toFixed(1));
        const caloriesBurnedTarget = Math.round(steps * 0.04);
        const moveMinutesTarget = Math.round(steps / 100);
        
        onSelect({ 
            calorieTarget: calories, 
            stepTarget: steps,
            proteinTarget,
            fatTarget,
            carbsTarget,
            milesTarget,
            caloriesBurnedTarget,
            moveMinutesTarget
        });
    };


    return (
         <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Let's Set Your Goals</h1>
            <p className="text-neutral-400 mb-8">Based on your answers, this is the estimate for how many calories you burn each day (maintenance).</p>
            <div className="bg-neutral-900 p-4 rounded-lg inline-block mb-8">
                <span className="text-4xl font-bold">{tdee} kcal</span>
            </div>
            
            <div className="max-w-sm mx-auto space-y-4">
                 <div>
                    <label className="font-semibold">My Daily Calorie Goal</label>
                    <input 
                        type="number" 
                        value={calories || ''} 
                        onChange={e => setCalories(parseInt(e.target.value) || 0)} 
                        className="w-full bg-neutral-800 p-3 mt-2 text-xl rounded text-center" 
                    />
                </div>
                 <div>
                    <label className="font-semibold">My Daily Step Goal</label>
                    <input 
                        type="number" 
                        value={steps || ''} 
                        onChange={e => setSteps(parseInt(e.target.value) || 0)} 
                        className="w-full bg-neutral-800 p-3 mt-2 text-xl rounded text-center" 
                    />
                </div>
            </div>

            <div className="mt-8 max-w-sm mx-auto">
                <NextButton onClick={handleSelect}>Next</NextButton>
            </div>
        </div>
    );
};

const StepSummary: React.FC<{ onFinish: () => void; }> = ({ onFinish }) => (
    <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">You're All Set!</h1>
        <p className="text-neutral-300 text-lg mb-8">Your profile is complete and your goals are set. Let's start tracking your progress.</p>
        <NextButton onClick={onFinish}>Start Using App</NextButton>
    </div>
);


// Common UI elements for onboarding
const OptionButton: React.FC<{ selected: boolean; onClick: () => void; children: React.ReactNode; }> = ({ selected, onClick, children }) => (
    <button onClick={onClick} className={`w-full text-left p-4 rounded-lg border-2 flex justify-between items-center transition-all ${selected ? 'border-white bg-neutral-800' : 'border-neutral-700 bg-neutral-900'}`}>
        <span>{children}</span>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? 'border-white bg-white' : 'border-neutral-500'}`}>
            {selected && <div className="w-3 h-3 rounded-full bg-black"></div>}
        </div>
    </button>
);

const NextButton: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean; }> = ({ onClick, children, disabled }) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className="w-full max-w-sm mx-auto py-3 px-4 text-lg font-bold rounded-lg transition-colors bg-neutral-200 text-neutral-900 hover:bg-neutral-300 disabled:bg-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed">
        {children}
    </button>
);


export default Onboarding;