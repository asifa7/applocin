
import React, { useState, useMemo } from 'react';
import Modal from './common/Modal.tsx';
// FIX: Corrected import path for types
import type { FoodItem } from '../types.ts';
import Icon from './common/Icon.tsx';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFood: (foodId: string, servings: number) => void;
  foodDatabase: FoodItem[];
  onOpenCreateFood: () => void;
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose, onAddFood, foodDatabase, onOpenCreateFood }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [servings, setServings] = useState(1);

    const filteredFood = useMemo(() => {
        if (!searchTerm) return foodDatabase;
        return foodDatabase.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, foodDatabase]);

    const handleAdd = () => {
        if (selectedFood) {
            onAddFood(selectedFood.id, servings);
            resetState();
        }
    };
    
    const resetState = () => {
        setSearchTerm('');
        setSelectedFood(null);
        setServings(1);
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={resetState} title="Add Food" size="lg">
            {!selectedFood ? (
                 <div className="h-[60vh] flex flex-col">
                    <input
                        type="text"
                        placeholder="Search your food library..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 mb-4 bg-neutral-200 dark:bg-neutral-800 rounded-md"
                    />
                    <div className="flex-grow overflow-y-auto space-y-2">
                        {filteredFood.map(food => (
                            <div key={food.id} onClick={() => setSelectedFood(food)} className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700">
                                <p className="font-semibold">{food.name}</p>
                                <p className="text-sm text-neutral-500">{food.calories} kcal per {food.servingSize}</p>
                            </div>
                        ))}
                    </div>
                     <div className="mt-4 pt-4 border-t border-neutral-300 dark:border-neutral-700">
                        <p className="text-sm text-center text-neutral-500 mb-2">Can't find it?</p>
                        <button onClick={onOpenCreateFood} className="w-full text-center p-2 bg-neutral-200 dark:bg-neutral-800 rounded-md font-semibold">
                            Create a Custom Food
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">{selectedFood.name}</h3>
                    <p className="text-neutral-500">
                        {selectedFood.calories} kcal, {selectedFood.protein}g P, {selectedFood.carbs}g C, {selectedFood.fat}g F per {selectedFood.servingSize}
                    </p>
                    <div>
                        <label className="font-semibold">Servings</label>
                        <input
                            type="number"
                            value={servings}
                            onChange={e => setServings(parseFloat(e.target.value) || 0)}
                            className="w-full p-2 mt-1 bg-neutral-200 dark:bg-neutral-800 rounded-md"
                            step="0.1"
                            min="0.1"
                        />
                    </div>
                    <button onClick={handleAdd} className="w-full p-3 bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black font-bold rounded-lg">
                        Add to Meal
                    </button>
                    <button onClick={() => setSelectedFood(null)} className="w-full text-center text-sm text-neutral-500 mt-2">
                        Back to search
                    </button>
                </div>
            )}
        </Modal>
    );
};

export default AddFoodModal;
