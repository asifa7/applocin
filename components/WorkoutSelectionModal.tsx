
import React from 'react';
// FIX: Corrected import path for types
import type { WorkoutTemplate } from '../types';
import Modal from './common/Modal';
import Icon from './common/Icon';

interface WorkoutSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: WorkoutTemplate) => void;
  suggestedTemplate?: WorkoutTemplate;
  workoutTemplates: WorkoutTemplate[];
}

const WorkoutSelectionModal: React.FC<WorkoutSelectionModalProps> = ({ isOpen, onClose, onSelect, suggestedTemplate, workoutTemplates }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Your Workout">
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Select the workout you want to start.
        </p>
        {workoutTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="w-full text-left p-4 rounded-lg flex justify-between items-center transition-all duration-200 ease-in-out bg-neutral-200/50 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          >
            <div>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">{template.title}</p>
              <p className="text-sm text-neutral-500">{template.dayOfWeek}</p>
            </div>
            {suggestedTemplate?.id === template.id && (
              <span className="bg-neutral-700 text-neutral-100 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                <Icon name="check" className="mr-1" /> Recommended
              </span>
            )}
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default WorkoutSelectionModal;