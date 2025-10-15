import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import type { WorkoutTemplate, DayOfWeek, Session } from '../types';
import Icon from './common/Icon';
import Modal from './common/Modal';
import CalendarView from './CalendarView';
import StrategyBuilder from './StrategyBuilder'; // Import the new wizard

interface StrategyProps {
  currentTemplates: WorkoutTemplate[];
  onSaveTemplates: (newTemplates: WorkoutTemplate[]) => void;
  sessions: Session[];
  onStartWorkoutRequest: (date: string) => void;
  onEditSession: (sessionId: string) => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Strategy: React.FC<StrategyProps> = ({ currentTemplates, onSaveTemplates, sessions, onStartWorkoutRequest, onEditSession }) => {
    const [viewMode, setViewMode] = useState<'planner' | 'calendar'>('planner');
    const [isResetConfirmOpen, setResetConfirmOpen] = useState(false);
    
    // Determine if the user has an active plan (more than 0 templates)
    const hasActivePlan = useMemo(() => currentTemplates.length > 0, [currentTemplates]);

    const handleResetPlanConfirm = () => {
        onSaveTemplates([]);
        setResetConfirmOpen(false);
    };

    const renderPlannerView = () => (
        <>
            <div className="space-y-4">
                {DAYS_OF_WEEK.map(day => {
                    const template = currentTemplates.find(t => t.dayOfWeek === day);
                    return (
                        <div key={day} className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg">{day}</p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {template && template.title ? template.title : 'Rest Day'}
                                </p>
                            </div>
                            <button
                                disabled // Editing is disabled as per new flow, focus is on the builder
                                className="font-semibold text-neutral-500 dark:text-neutral-600 py-2 px-4 rounded-lg flex items-center gap-2 cursor-not-allowed"
                            >
                                <Icon name="edit" /> Edit
                            </button>
                        </div>
                    );
                })}
            </div>
            <div className="mt-8 text-center">
                 <button onClick={() => setResetConfirmOpen(true)} className="bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold py-3 px-6 rounded-lg transition-colors">
                    Reset Plan & Start Over
                </button>
            </div>
        </>
    );
    
    // If there's no active plan, show the new Strategy Builder wizard
    if (!hasActivePlan) {
         return <StrategyBuilder onSavePlan={onSaveTemplates} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Strategy</h2>
                    <p className="text-neutral-500">Your current plan and workout history.</p>
                </div>
                 <div className="flex bg-neutral-200 dark:bg-neutral-800 p-1 rounded-lg">
                    <button onClick={() => setViewMode('planner')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'planner' ? 'bg-neutral-800 text-white dark:bg-neutral-100 dark:text-black' : ''}`}>Plan</button>
                    <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'calendar' ? 'bg-neutral-800 text-white dark:bg-neutral-100 dark:text-black' : ''}`}>Calendar</button>
                </div>
            </div>

            {viewMode === 'planner' ? renderPlannerView() : (
                 <CalendarView 
                    sessions={sessions}
                    onStartWorkoutRequest={onStartWorkoutRequest}
                    onEditSession={onEditSession}
                    workoutTemplates={currentTemplates}
                />
            )}
            
            <Modal isOpen={isResetConfirmOpen} onClose={() => setResetConfirmOpen(false)} title="Confirm Reset Plan">
                <div className="text-center">
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                        Are you sure you want to delete your current workout plan? This action cannot be undone.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => setResetConfirmOpen(false)} className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 font-bold py-3 px-6 rounded-lg">
                            Cancel
                        </button>
                        <button onClick={handleResetPlanConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg">
                            Yes, Reset
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Strategy;