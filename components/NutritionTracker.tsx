
import React, { useState } from 'react';
// FIX: Correcting import path for types
import type { DailyLog, FoodItem, Meal, LoggedFood, UserGoals } from '../types';
import Icon from './common/Icon';
import AddFoodModal from './AddFoodModal';
import CreateCustomFoodModal from './CreateCustomFoodModal';

interface NutritionTrackerProps {
  dailyLog: DailyLog | null;
  onUpdateLog: (updatedLog: DailyLog) => void;
  foodDatabase: FoodItem[];
  onAddCustomFood: (food: FoodItem) => void;
  userGoals: UserGoals;
}

const NutritionTracker: React.FC<NutritionTrackerProps> = ({ dailyLog, onUpdateLog, foodDatabase, onAddCustomFood, userGoals }) => {
    const [isAddFoodModalOpen, setAddFoodModalOpen] = useState(false);
    const [isCreateFoodModalOpen, setCreateFoodModalOpen] = useState(false);
    const [targetMeal, setTargetMeal] = useState<Meal['name'] | null>(null);

    if (!dailyLog) {
        return <div>Loading nutrition data...</div>;
    }

    const handleAddFood = (foodId: string, servings: number) => {
        if (!targetMeal) return;
        
        const updatedLog: DailyLog = JSON.parse(JSON.stringify(dailyLog));
        const meal = updatedLog.meals.find((m: Meal) => m.name === targetMeal);
        
        if (meal) {
            const newLoggedFood: LoggedFood = {
                id: `log-${Date.now()}`,
                foodId,
                servings,
                loggedAt: new Date().toISOString(),
            };
            meal.foods.push(newLoggedFood);
        }
        
        onUpdateLog(updatedLog);
        setAddFoodModalOpen(false);
    };

    const openAddFoodModal = (mealName: Meal['name']) => {
        setTargetMeal(mealName);
        setAddFoodModalOpen(true);
    };
    
    const totals = dailyLog.meals.reduce((acc, meal) => {
        meal.foods.forEach(loggedFood => {
            const foodDetails = foodDatabase.find(f => f.id === loggedFood.foodId);
            if (foodDetails) {
                acc.calories += foodDetails.calories * loggedFood.servings;
                acc.protein += foodDetails.protein * loggedFood.servings;
                acc.carbs += foodDetails.carbs * loggedFood.servings;
                acc.fat += foodDetails.fat * loggedFood.servings;
            }
        });
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Nutrition Tracker</h2>
            <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-4">Today's Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-sm text-neutral-500">Calories</p>
                        <p className="text-2xl font-bold">{Math.round(totals.calories)}<span className="text-base text-neutral-400"> / {userGoals.calorieTarget}</span></p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500">Protein (g)</p>
                        <p className="text-2xl font-bold">{Math.round(totals.protein)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500">Carbs (g)</p>
                        <p className="text-2xl font-bold">{Math.round(totals.carbs)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-500">Fat (g)</p>
                        <p className="text-2xl font-bold">{Math.round(totals.fat)}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {dailyLog.meals.map(meal => (
                    <div key={meal.name} className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                        <h4 className="font-bold mb-2">{meal.name}</h4>
                        <div className="space-y-1 text-sm">
                            {meal.foods.map(loggedFood => {
                                const foodDetails = foodDatabase.find(f => f.id === loggedFood.foodId);
                                return (
                                    <div key={loggedFood.id} className="flex justify-between">
                                        <span>{loggedFood.servings} x {foodDetails?.name || 'Unknown Food'}</span>
                                        <span>{foodDetails ? Math.round(foodDetails.calories * loggedFood.servings) : 0} kcal</span>
                                    </div>
                                )
                            })}
                        </div>
                        <button onClick={() => openAddFoodModal(meal.name)} className="mt-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200">
                            <Icon name="plus" className="w-4 h-4 mr-1"/> Add Food
                        </button>
                    </div>
                ))}
            </div>
            
            <AddFoodModal 
                isOpen={isAddFoodModalOpen}
                onClose={() => setAddFoodModalOpen(false)}
                onAddFood={handleAddFood}
                foodDatabase={foodDatabase}
                onOpenCreateFood={() => {setAddFoodModalOpen(false); setCreateFoodModalOpen(true);}}
            />
            <CreateCustomFoodModal
                isOpen={isCreateFoodModalOpen}
                onClose={() => setCreateFoodModalOpen(false)}
                onSave={onAddCustomFood}
            />
        </div>
    );
};

export default NutritionTracker;
