
import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import type { UserRatings } from '../types.ts';
import { ALL_EXERCISES_BY_GROUP } from '../constants/allExercises.ts';
import Modal from './common/Modal.tsx';
import Icon from './common/Icon.tsx';
import StarRating from './common/StarRating.tsx';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercises: (exerciseIds: string[]) => void;
  userRatings: UserRatings;
  onRateExercise: React.Dispatch<React.SetStateAction<UserRatings>>;
  currentExerciseIds: string[];
}

const AddExerciseModal: React.FC<AddExerciseModalProps> = ({ isOpen, onClose, onAddExercises, userRatings, onRateExercise, currentExerciseIds }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(ALL_EXERCISES_BY_GROUP[0]?.group || null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredExercises = useMemo(() => {
    if (!searchTerm) return ALL_EXERCISES_BY_GROUP;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return ALL_EXERCISES_BY_GROUP.map(group => ({
      ...group,
      exercises: group.exercises.filter(ex => ex.name.toLowerCase().includes(lowerCaseSearch)),
    })).filter(group => group.exercises.length > 0);
  }, [searchTerm]);
  
  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const handleRate = (exId: string, rating: number) => {
    onRateExercise(prev => ({...prev, [exId]: rating}));
  };
  
  const handleAddClick = () => {
    onAddExercises(Array.from(selectedIds));
    setSelectedIds(new Set());
    setSearchTerm('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Exercises to Your Session" size="xl">
       <div className="h-[75vh] flex flex-col">
        <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-3 mb-4 bg-neutral-200 dark:bg-neutral-800 rounded-md border-transparent focus:ring-2 focus:ring-neutral-500 text-lg"
        />
        <div className="overflow-y-auto flex-grow pr-2">
          {filteredExercises.map(group => (
            <div key={group.group} className="mb-2">
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.group ? null : group.group)}
                className="w-full text-left p-3 bg-neutral-200 dark:bg-neutral-800 rounded-md font-semibold flex justify-between items-center transition-colors"
              >
                <span>{group.group} <span className="text-sm font-normal text-neutral-500">({group.exercises.length})</span></span>
                <Icon name={expandedGroup === group.group ? 'chevronUp' : 'chevronDown'} />
              </button>
              {expandedGroup === group.group && (
                <div className="pt-2 pl-1 space-y-1">
                  {group.exercises.map(ex => {
                    const isSelected = selectedIds.has(ex.id);
                    const isAlreadyInSession = currentExerciseIds.includes(ex.id);
                    return (
                        <div
                            key={ex.id}
                            onClick={() => !isAlreadyInSession && handleToggleSelection(ex.id)}
                            className={`p-3 rounded-md flex justify-between items-center transition-all duration-200 ${
                                isAlreadyInSession 
                                ? 'bg-neutral-200/50 dark:bg-neutral-800/50 opacity-60 cursor-not-allowed' 
                                : isSelected 
                                ? 'bg-neutral-800 text-white dark:bg-neutral-300 dark:text-black' 
                                : 'bg-neutral-50 dark:bg-neutral-700/50 hover:bg-neutral-200/70 dark:hover:bg-neutral-600/50 cursor-pointer'
                            }`}
                        >
                        <div className="flex flex-col">
                            <span className="font-semibold">{ex.name}</span>
                            {isAlreadyInSession && <span className="text-xs font-bold">(Already in session)</span>}
                        </div>
                        <div className="flex items-center gap-4">
                            <StarRating rating={userRatings[ex.id] || 0} onRate={(rating) => handleRate(ex.id, rating)} />
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-white border-white text-neutral-800' : 'border-neutral-400'}`}>
                                {isSelected && <Icon name="check" />}
                            </div>
                        </div>
                        </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-neutral-300 dark:border-neutral-700">
            <button
                onClick={handleAddClick}
                disabled={selectedIds.size === 0}
                className="w-full bg-neutral-800 text-neutral-100 hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300 font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed text-lg"
            >
                Add {selectedIds.size > 0 ? `${selectedIds.size} ` : ''}Exercise{selectedIds.size !== 1 && 's'}
            </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddExerciseModal;
