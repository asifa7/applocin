
import React, { useState } from 'react';
// FIX: Corrected import path for types
import type { SessionExercise, SetEntry, WeightUnit } from '../types.ts';
import SetRow from './SetRow.tsx';
import Icon from './common/Icon.tsx';

interface ExerciseCardProps {
  exercise: SessionExercise;
  unit: WeightUnit;
  onUpdateSet: (exerciseId: string, setId: string, newSetData: Partial<SetEntry>) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, unit, onUpdateSet, onAddSet, onRemoveSet }) => {

  const exerciseVolume = exercise.sets.reduce((total, set) => total + (set.volume || 0), 0);

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-neutral-200 dark:bg-neutral-800 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-xl">{exercise.name}</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Volume: {exerciseVolume.toLocaleString()} {unit}</p>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-neutral-500 dark:text-neutral-400 px-2">
          <div className="col-span-1 text-center">SET</div>
          <div className="col-span-5 text-center">REPS</div>
          <div className="col-span-5 text-center">WEIGHT ({unit.toUpperCase()})</div>
          <div className="col-span-1"></div>
        </div>
        {exercise.sets.map((set, index) => (
          <SetRow
            key={set.id}
            set={set}
            setNumber={index + 1}
            unit={unit}
            onUpdate={(newSetData) => onUpdateSet(exercise.id, set.id, newSetData)}
            onRemove={() => onRemoveSet(exercise.id, set.id)}
          />
        ))}
        <button 
          onClick={() => onAddSet(exercise.id)} 
          className="w-full mt-2 bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 font-bold py-3 px-4 rounded-lg hover:bg-neutral-300/80 dark:hover:bg-neutral-700/80 transition-colors"
        >
          Add Set
        </button>
      </div>
    </div>
  );
};

// FIX: Added default export to the ExerciseCard component to resolve the import error.
export default ExerciseCard;
