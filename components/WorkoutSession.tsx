
import React, { useMemo, useState } from 'react';
// FIX: Corrected import path for types
import type { Session, SessionExercise, SetEntry, WeightUnit, WorkoutTemplate, UserRatings } from '../types';
import ExerciseCard from './ExerciseCard';
import Icon from './common/Icon';
import AddExerciseModal from './AddExerciseModal';
// FIX: Corrected import path to get exercise data from constants
import { allExercisesMap } from '../constants/allExercises';

interface WorkoutSessionProps {
  session: Session;
  onUpdateSession: (updatedSession: Session) => void;
  onExit: () => void;
  unit: WeightUnit;
  workoutTemplates: WorkoutTemplate[];
  userRatings: UserRatings;
  onRateExercise: React.Dispatch<React.SetStateAction<UserRatings>>;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ session, onUpdateSession, onExit, unit, workoutTemplates, userRatings, onRateExercise }) => {
  const [isAddExerciseModalOpen, setAddExerciseModalOpen] = useState(false);

  const updateSet = (exerciseId: string, setId: string, newSetData: Partial<SetEntry>) => {
    const updatedExercises = session.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(set => {
            if (set.id === setId) {
              const updatedSet = { ...set, ...newSetData };
              updatedSet.volume = (updatedSet.reps || 0) * (updatedSet.weight || 0);
              // Add timestamp when set is first completed
              if (updatedSet.reps > 0 && updatedSet.weight > 0 && !set.completedAt) {
                updatedSet.completedAt = new Date().toISOString();
              }
              return updatedSet;
            }
            return set;
          }),
        };
      }
      return ex;
    });
    onUpdateSession({ ...session, exercises: updatedExercises });
  };
  
  const addSet = (exerciseId: string) => {
    const newSet: SetEntry = { id: `set-${Date.now()}`, reps: 0, weight: 0, volume: 0 };
    const updatedExercises = session.exercises.map(ex => ex.id === exerciseId ? {...ex, sets: [...ex.sets, newSet]} : ex)
    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  const removeSet = (exerciseId: string, setId: string) => {
    const updatedExercises = session.exercises.map(ex => ex.id === exerciseId ? {...ex, sets: ex.sets.filter(s => s.id !== setId)} : ex)
    onUpdateSession({ ...session, exercises: updatedExercises });
  };
  
  const handleAddExercises = (exerciseIds: string[]) => {
    const newExercises: SessionExercise[] = exerciseIds
      .map(id => {
        if (session.exercises.some(ex => ex.id === id)) return null; // Avoid duplicates
        const details = allExercisesMap.get(id);
        if (!details) return null;
        
        const sets: SetEntry[] = Array.from({ length: 3 }, (_, i) => ({
          id: `set-${Date.now()}-${i}`, reps: 0, weight: 0, volume: 0,
        }));
        
        return { id, name: details.name, muscleGroup: 'Unknown', sets };
      })
      .filter((ex): ex is SessionExercise => ex !== null);
      
    if (newExercises.length > 0) {
      onUpdateSession({
        ...session,
        exercises: [...session.exercises, ...newExercises]
      });
    }
    setAddExerciseModalOpen(false);
  };

  const totalVolume = useMemo(() => {
    return session.exercises.reduce((total, ex) => total + ex.sets.reduce((exTotal, set) => exTotal + (set.volume || 0), 0), 0);
  }, [session.exercises]);

  const handleSaveAndExit = () => {
    const sessionToSave = { ...session, totalVolume };
    onUpdateSession(sessionToSave);
    onExit();
  };

  const handleFinishWorkout = () => {
    const finishedSession = {
      ...session,
      totalVolume,
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
    };
    onUpdateSession(finishedSession);
    onExit();
  };

  if (!session) {
    return <div className="text-center p-8"><Icon name="spinner" className="text-2xl animate-spin" /> Loading session...</div>;
  }
  
  const template = workoutTemplates.find(t => t.id === session.templateId);

  return (
    <>
      <div className="pb-28">
        <div className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex justify-between items-center">
          <div>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{template?.title || "Workout"}</h2>
              <p className="text-neutral-600 dark:text-neutral-400">{new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="space-y-6">
          {session.exercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              unit={unit}
              onUpdateSet={updateSet}
              onAddSet={addSet}
              onRemoveSet={removeSet}
            />
          ))}
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => setAddExerciseModalOpen(true)}
            className="w-full bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 font-bold py-4 px-4 rounded-lg hover:bg-neutral-300/80 dark:hover:bg-neutral-700/80 transition-colors border-2 border-dashed border-neutral-300 dark:border-neutral-700"
          >
            <Icon name="plus" className="mr-2" />
            Add More Exercises
          </button>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <div className="container mx-auto px-4">
            <div className="bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-xl shadow-lg h-24 p-5 flex justify-between items-center gap-4">
              <div>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Total Volume</span>
                <p className="text-2xl font-bold">{totalVolume.toLocaleString()} {unit}</p>
              </div>
              <div className="flex gap-3">
                 <button
                  onClick={handleSaveAndExit}
                  className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  Save & Exit
                </button>
                <button
                  onClick={handleFinishWorkout}
                  className="bg-neutral-900 hover:bg-neutral-700 text-neutral-50 dark:bg-neutral-100 dark:hover:bg-neutral-300 dark:text-neutral-900 font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <Icon name="check"/>
                  Finish Workout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddExerciseModal 
        isOpen={isAddExerciseModalOpen}
        onClose={() => setAddExerciseModalOpen(false)}
        onAddExercises={handleAddExercises}
        userRatings={userRatings}
        onRateExercise={onRateExercise}
        currentExerciseIds={session.exercises.map(e => e.id)}
      />
    </>
  );
};

export default WorkoutSession;
