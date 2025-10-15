
import React, { useState } from 'react';
// FIX: Corrected import path for types
import type { SessionExercise, SetEntry, WeightUnit } from '../types';
import SetRow from './SetRow';
// FIX: Corrected import path for geminiService
import { getExerciseImage } from '../services/geminiService';
import Icon from './common/Icon';
import Modal from './common/Modal';

interface ExerciseCardProps {
  exercise: SessionExercise;
  unit: WeightUnit;
  onUpdateSet: (exerciseId: string, setId: string, newSetData: Partial<SetEntry>) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  imageCache: {[exerciseName: string]: string};
  onCacheImage: React.Dispatch<React.SetStateAction<{[exerciseName: string]: string}>>;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, unit, onUpdateSet, onAddSet, onRemoveSet, imageCache, onCacheImage }) => {
  const [isInfoModalOpen, setInfoModalOpen] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [error, setError] = useState('');

  const handleGetInfo = async () => {
    setInfoModalOpen(true);
    if (imageCache[exercise.name]) return; // Already cached

    setIsLoadingImage(true);
    setError('');
    try {
      const fetchedImage = await getExerciseImage(exercise.name);
      onCacheImage(prev => ({...prev, [exercise.name]: fetchedImage}));
    } catch(err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoadingImage(false);
    }
  };

  const exerciseVolume = exercise.sets.reduce((total, set) => total + (set.volume || 0), 0);
  const imageUrl = imageCache[exercise.name] ? `data:image/png;base64,${imageCache[exercise.name]}` : '';

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden">
      <div className="p-4 bg-neutral-200 dark:bg-neutral-800 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">{exercise.name}</h3>
        </div>
        <button
          onClick={handleGetInfo}
          className="bg-neutral-700 text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-neutral-600 transition-colors"
          title="Get AI Tip"
        >
          <Icon name="info" />
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2 px-2">
          <div className="col-span-1 text-center">Set</div>
          <div className="col-span-5 text-center">Reps</div>
          <div className="col-span-5 text-center">Weight ({unit})</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>
        <div className="space-y-2">
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
        </div>
        <button
          onClick={() => onAddSet(exercise.id)}
          className="mt-4 w-full bg-neutral-200/60 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 font-semibold py-2 px-4 rounded-lg hover:bg-neutral-300/60 dark:hover:bg-neutral-700/60 transition-colors"
        >
          <Icon name="plus" className="mr-2" />
          Add Set
        </button>
        <div className="mt-4 text-center">
            <span className="text-neutral-600 dark:text-neutral-400">Total Volume: </span>
            <span className="font-bold text-lg text-neutral-800 dark:text-neutral-200">{exerciseVolume.toLocaleString()} {unit}</span>
        </div>
      </div>
      
      <Modal isOpen={isInfoModalOpen} onClose={() => setInfoModalOpen(false)} title={`How to do ${exercise.name}`}>
        <div className="min-h-[200px] flex items-center justify-center">
          {isLoadingImage ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Icon name="spinner" className="text-3xl text-neutral-500 animate-spin" />
              <p className="ml-4 mt-4">Generating visual guide with AI...</p>
            </div>
          ) : error ? (
             <div className="text-center p-4 text-red-500">
                <p><strong>Error:</strong> {error}</p>
             </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt={`Visual guide for ${exercise.name}`} className="rounded-lg w-full h-auto object-contain" />
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default ExerciseCard;