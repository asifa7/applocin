
import React from 'react';
// FIX: Corrected import path for types
import type { SetEntry, WeightUnit } from '../types';
import Icon from './common/Icon';

interface SetRowProps {
  set: SetEntry;
  setNumber: number;
  unit: WeightUnit;
  onUpdate: (newSetData: Partial<SetEntry>) => void;
  onRemove: () => void;
}

const SetRow: React.FC<SetRowProps> = ({ set, setNumber, unit, onUpdate, onRemove }) => {
  const kgSuggestions = [5, 7.5, 10, 12.5, 15, 17.5, 20];
  const lbsSuggestions = [10, 15, 20, 25, 30, 45];
  const suggestions = unit === 'kg' ? kgSuggestions : lbsSuggestions;

  const handleInputChange = (field: 'reps' | 'weight', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdate({ [field]: numValue });
    } else if (value === '') {
      onUpdate({ [field]: 0 });
    }
  };

  const handleWeightFocus = () => {
    if (set.reps === 0) {
      onUpdate({ reps: 12 });
    }
  };
  
  const handleWeightInteraction = (newWeight: number) => {
    const updates: Partial<SetEntry> = { weight: newWeight };
    if (set.reps === 0) {
      updates.reps = 12;
    }
    onUpdate(updates);
  };
  
  const handleWeightAdjust = (amount: number) => {
    const currentWeight = set.weight || 0;
    const newWeight = Math.max(0, currentWeight + amount);
    handleWeightInteraction(newWeight);
  };

  const handleRepAdjust = (amount: number) => {
    const currentReps = set.reps || 0;
    const newReps = Math.max(0, currentReps + amount);
    onUpdate({ reps: newReps });
  };

  return (
    <div className="p-2 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/30">
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-1 text-center font-bold text-xl text-neutral-700 dark:text-neutral-300">{setNumber}</div>
        <div className="col-span-5 flex items-center justify-center gap-1.5">
          <button
            onClick={() => handleRepAdjust(-1)}
            className="w-8 h-10 rounded-md bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition-colors font-bold text-lg flex items-center justify-center flex-shrink-0"
            aria-label="Decrease reps by 1"
          >
            -
          </button>
          <input
            type="number"
            value={set.reps === 0 ? '' : set.reps}
            onChange={(e) => handleInputChange('reps', e.target.value)}
            className="w-full min-w-0 flex-grow bg-neutral-50 dark:bg-neutral-700 text-center rounded-md py-3 px-1 text-xl font-semibold border-transparent focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
            placeholder="0"
          />
           <button
            onClick={() => handleRepAdjust(1)}
            className="w-8 h-10 rounded-md bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition-colors font-bold text-lg flex items-center justify-center flex-shrink-0"
            aria-label="Increase reps by 1"
          >
            +
          </button>
        </div>
        <div className="col-span-5 flex items-center justify-center gap-1.5">
           <button
            onClick={() => handleWeightAdjust(-2.5)}
            className="w-8 h-10 rounded-md bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition-colors font-bold text-lg flex items-center justify-center flex-shrink-0"
            aria-label="Decrease weight by 2.5"
          >
            -
          </button>
          <input
            type="number"
            step="0.5"
            value={set.weight === 0 ? '' : set.weight}
            onChange={(e) => handleInputChange('weight', e.target.value)}
            onFocus={handleWeightFocus}
            className="w-full min-w-0 flex-grow bg-neutral-50 dark:bg-neutral-700 text-center rounded-md py-3 px-1 text-xl font-semibold border-transparent focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
            placeholder="0"
          />
           <button
            onClick={() => handleWeightAdjust(2.5)}
            className="w-8 h-10 rounded-md bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-400 dark:hover:bg-neutral-600 transition-colors font-bold text-lg flex items-center justify-center flex-shrink-0"
            aria-label="Increase weight by 2.5"
          >
            +
          </button>
        </div>
        <div className="col-span-1 flex justify-center items-center">
          <button onClick={onRemove} className="text-neutral-400 hover:text-red-500 dark:hover:text-red-500 transition-colors text-2xl">
            <Icon name="trash" />
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5 justify-center items-center px-1">
        {suggestions.map(w => (
          <button
            key={w}
            onClick={() => handleWeightInteraction(w)}
            className="text-sm px-3 py-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-900 hover:text-white dark:hover:bg-neutral-200 dark:hover:text-black transition-colors"
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SetRow;