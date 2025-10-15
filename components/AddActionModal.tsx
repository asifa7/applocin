import React, { ReactNode } from 'react';
import Icon from './common/Icon';

interface AddActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogFood: () => void;
  onStartWorkout: () => void;
}

const ActionButton: React.FC<{ icon: React.ComponentProps<typeof Icon>['name']; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 p-6 bg-bg-subtle/70 hover:bg-bg-subtle rounded-xl transition-colors w-full aspect-square">
        <Icon name={icon} className="w-12 h-12 text-primary" />
        <span className="font-semibold text-lg">{label}</span>
    </button>
);

const AddActionModal: React.FC<AddActionModalProps> = ({ isOpen, onClose, onLogFood, onStartWorkout }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-end p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-bg-muted rounded-2xl shadow-2xl w-full max-w-md relative p-6 transform transition-all duration-300 ease-out translate-y-4"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'slideInUp 0.3s forwards' }}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-text-base">What would you like to add?</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-base"><i className="fas fa-times text-2xl"></i></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <ActionButton icon="food" label="Log Food" onClick={onLogFood} />
            <ActionButton icon="dumbbell" label="Start Workout" onClick={onStartWorkout} />
        </div>
      </div>
       <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AddActionModal;