

import React, { useMemo } from 'react';
import type { DailyLog, FoodItem, UserGoals } from '../types.ts';
import Icon from './common/Icon.tsx';

const MiniProgressRing: React.FC<{ percentage: number; size: number; strokeWidth: number; color: string; }> = ({ percentage, size, strokeWidth, color }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    // Clamp percentage to avoid visual artifacts if it exceeds 100
    const clampedPercentage = Math.max(0, Math.min(percentage, 100));
    const offset = circumference - (clampedPercentage / 100) * circumference;

    return (
        <svg className="transform -rotate-90" width={size} height={size}>
            {/* Background track */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                className="text-bg-subtle"
            />
            {/* Foreground progress */}
            {clampedPercentage > 0 && (
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            )}
        </svg>
    );
};

const MiniActivityRings: React.FC<{ day: string; caloriePercentage: number; stepPercentage: number; isToday: boolean }> = ({ day, caloriePercentage, stepPercentage, isToday }) => {
    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <div className="relative w-10 h-10 flex items-center justify-center">
                {/* Outer Ring - Calories */}
                <div className="absolute text-secondary">
                   <MiniProgressRing percentage={caloriePercentage} size={40} strokeWidth={4} color="currentColor" />
                </div>
                
                {/* Inner Ring - Steps */}
                <div className="absolute text-accent">
                  <MiniProgressRing percentage={stepPercentage} size={28} strokeWidth={4} color="currentColor" />
                </div>
            </div>
            <span className={`font-semibold text-sm ${isToday ? 'text-text-base' : 'text-text-muted'}`}>{day}</span>
        </div>
    );
}

interface DailyGoalsProps {
    dailyLogs: DailyLog[];
    userGoals: UserGoals;
    foodDatabase: FoodItem[];
    onClick: () => void;
}

const DailyGoals: React.FC<DailyGoalsProps> = ({ dailyLogs, userGoals, foodDatabase, onClick }) => {
    const weeklyData = useMemo(() => {
        const data = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayInitial = date.toLocaleDateString('en-US', { weekday: 'short' })[0];
            
            const log = dailyLogs.find(l => l.date === dateStr);
            
            let caloriesConsumed = 0;
            let steps = 0;
            
            if (log) {
                caloriesConsumed = log.meals.reduce((total, meal) => {
                  return total + meal.foods.reduce((mealTotal, loggedFood) => {
                    const foodDetails = foodDatabase.find(f => f.id === loggedFood.foodId);
                    return mealTotal + (foodDetails ? foodDetails.calories * loggedFood.servings : 0);
                  }, 0);
                }, 0);
                steps = log.steps || 0;
            }
            
            const caloriePercentage = userGoals.calorieTarget > 0 ? (caloriesConsumed / userGoals.calorieTarget) * 100 : 0;
            const stepPercentage = userGoals.stepTarget > 0 ? (steps / userGoals.stepTarget) * 100 : 0;
            
            const isAchieved = caloriePercentage >= 100 && stepPercentage >= 100;

            data.push({
                day: dayInitial,
                caloriePercentage,
                stepPercentage,
                isAchieved,
                isToday: i === 0
            });
        }
        return data;
    }, [dailyLogs, userGoals, foodDatabase]);

    const achievedCount = weeklyData.filter(d => d.isAchieved).length;

    return (
        <div onClick={onClick} className="bg-bg-muted p-4 rounded-lg cursor-pointer hover:bg-bg-subtle/60 transition-colors">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="font-bold text-lg">Your daily goals</h3>
                    <p className="text-sm text-text-muted">Last 7 days</p>
                </div>
                <Icon name="chevronRight" />
            </div>
            <div className="flex justify-between items-center">
                <div className="text-center">
                    <p className="text-3xl font-bold">{achievedCount}/7</p>
                    <p className="text-text-muted">Achieved</p>
                </div>
                <div className="flex gap-1 sm:gap-3">
                    {weeklyData.map((d, i) => (
                        <MiniActivityRings 
                            key={i} 
                            day={d.day} 
                            caloriePercentage={d.caloriePercentage} 
                            stepPercentage={d.stepPercentage} 
                            isToday={d.isToday} 
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DailyGoals;
