
import React, { useState } from 'react';
import Modal from './common/Modal';
// FIX: Corrected import path for types
import type { FoodItem } from '../types';

interface CreateCustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (food: FoodItem) => void;
}

const CreateCustomFoodModal: React.FC<CreateCustomFoodModalProps> = ({ isOpen, onClose, onSave }) => {
    const [food, setFood] = useState<Omit<FoodItem, 'id' | 'isCustom'>>({
        name: '', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: '100g'
    });

    const handleSave = () => {
        if (food.name && food.calories > 0) {
            onSave({ ...food, id: `custom-${Date.now()}`, isCustom: true });
            setFood({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: '100g' });
            onClose();
        } else {
            alert('Please fill in at least a name and calories.');
        }
    };

    const handleChange = (field: keyof typeof food, value: string) => {
        if (field === 'name' || field === 'servingSize') {
            setFood(prev => ({...prev, [field]: value}));
        } else {
            const numValue = parseFloat(value);
            setFood(prev => ({...prev, [field]: isNaN(numValue) ? 0 : numValue}));
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Custom Food">
            <div className="space-y-4">
                <div>
                    <label className="font-semibold">Food Name</label>
                    <input type="text" value={food.name} onChange={e => handleChange('name', e.target.value)} className="w-full p-2 mt-1 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
                </div>
                <div>
                    <label className="font-semibold">Serving Size</label>
                    <input type="text" value={food.servingSize} onChange={e => handleChange('servingSize', e.target.value)} className="w-full p-2 mt-1 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="font-semibold">Calories</label>
                        <input type="number" value={food.calories || ''} onChange={e => handleChange('calories', e.target.value)} className="w-full p-2 mt-1 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
                    </div>
                    <div>
                        <label className="font-semibold">Protein (g)</label>
                        <input type="number" value={food.protein || ''} onChange={e => handleChange('protein', e.target.value)} className="w-full p-2 mt-1 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
                    </div>
                    <div>
                        <label className="font-semibold">Carbs (g)</label>
                        <input type="number" value={food.carbs || ''} onChange={e => handleChange('carbs', e.target.value)} className="w-full p-2 mt-1 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
                    </div>
                    <div>
                        <label className="font-semibold">Fat (g)</label>
                        <input type="number" value={food.fat || ''} onChange={e => handleChange('fat', e.target.value)} className="w-full p-2 mt-1 bg-neutral-200 dark:bg-neutral-800 rounded-md" />
                    </div>
                </div>
                 <div className="mt-6 pt-4 border-t border-neutral-300 dark:border-neutral-700">
                    <button onClick={handleSave} className="w-full p-3 bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black font-bold rounded-lg">
                        Save Custom Food
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateCustomFoodModal;
