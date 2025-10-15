
import React, { useMemo } from 'react';
import type { DailyLog, FoodItem, UserGoals } from '../types';
import Icon from './common/Icon';

const GoalCircle: React.FC<{ day: string, status: 'achieved' | 'partial' | 'none', isToday: boolean }> = ({ day, status, isToday }) => {
    const achievedColor = "text-accent";
    const partialColor = "text-accent";

    return (
        <div className="flex flex-col items-center gap-2 text-center">
            <div className="relative w-10 h-10">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        className="stroke-current text-bg-subtle"
                        fill="none"
                        strokeWidth="3"
                    />
                    {status !== 'none' && (
                        <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            className={`stroke-current ${status === 'achieved' ? achievedColor : partialColor}`}
                            fill="none"
                            strokeWidth="3"
                            strokeDasharray={status === 'achieved' ? "100, 100" : "50, 100"}
                            strokeLinecap="round"
                             transform="rotate(90 18 18)"
                        />
                    )}
                </svg>
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
            
            let goalsMetCount = 0;
            
            if (log) {
                const caloriesConsumed = log.meals.reduce((total, meal) => {
                  return total + meal.foods.reduce((mealTotal, loggedFood) => {
                    const foodDetails = foodDatabase.find(f => f.id === loggedFood.foodId);
                    return mealTotal + (foodDetails ? foodDetails.calories * loggedFood.servings : 0);
                  }, 0);
                }, 0);

                if (caloriesConsumed >= userGoals.calorieTarget) goalsMetCount++;
                if (log.steps >= userGoals.stepTarget) goalsMetCount++;
            }
            
            let status: 'achieved' | 'partial' | 'none' = 'none';
            if (goalsMetCount === 2) {
                status = 'achieved';
            } else if (goalsMetCount === 1) {
                status = 'partial';
            }

            data.push({
                day: dayInitial,
                status,
                isToday: i === 0
            });
        }
        return data;
    }, [dailyLogs, userGoals, foodDatabase]);

    const achievedCount = weeklyData.filter(d => d.status === 'achieved').length;

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
                        <GoalCircle key={i} day={d.day} status={d.status} isToday={d.isToday} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DailyGoals;