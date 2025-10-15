import React, { useState, useMemo } from 'react';
import { WorkoutTemplate, Exercise as FullExercise, DayOfWeek, TemplateExercise } from '../types';
import { generatePlan, getAvailableSplits } from '../constants/presets';
// FIX: Corrected typo in imported constant name from ALL_EXEXRCISES_BY_GROUP to ALL_EXERCISES_BY_GROUP.
import { ALL_EXERCISES_BY_GROUP } from '../constants/allExercises';
import { PUSH_PRESET, PULL_PRESET, LEGS_PRESET, UPPER_BODY_PRESET, LOWER_BODY_PRESET, FULL_BODY_PRESET } from '../constants/miniTemplates';
import Icon from './common/Icon';
import Modal from './common/Modal';

interface StrategyBuilderProps {
  onSavePlan: (templates: WorkoutTemplate[]) => void;
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// A sub-component for the exercise picker modal
const ExercisePickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Omit<FullExercise, 'muscleGroup'>) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(ALL_EXERCISES_BY_GROUP[0]?.group || null);

  const filteredExercises = useMemo(() => {
    if (!searchTerm) return ALL_EXERCISES_BY_GROUP;
    const lowerCaseSearch = searchTerm.toLowerCase();
    return ALL_EXERCISES_BY_GROUP.map(group => ({
      ...group,
      exercises: group.exercises.filter(ex => ex.name.toLowerCase().includes(lowerCaseSearch)),
    })).filter(group => group.exercises.length > 0);
  }, [searchTerm]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select an Exercise">
       <div className="h-[70vh] flex flex-col">
        <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full p-2 mb-4 bg-neutral-200 dark:bg-neutral-800 rounded-md border-transparent focus:ring-2 focus:ring-neutral-500"
        />
        <div className="overflow-y-auto flex-grow">
          {filteredExercises.map(group => (
            <div key={group.group} className="mb-2">
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.group ? null : group.group)}
                className="w-full text-left p-3 bg-neutral-200 dark:bg-neutral-800 rounded-md font-semibold flex justify-between items-center"
              >
                {group.group}
                <Icon name={expandedGroup === group.group ? 'chevronUp' : 'chevronDown'} />
              </button>
              {expandedGroup === group.group && (
                <div className="pt-2 pl-2 space-y-1">
                  {group.exercises.map(ex => (
                    <div
                      key={ex.id}
                      onClick={() => { onSelect(ex); onClose(); }}
                      className="p-2 bg-neutral-50 dark:bg-neutral-700 rounded-md cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-600"
                    >
                      {ex.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

// A sub-component for the custom workout editing modal
const WorkoutDayEditorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    day: DayOfWeek;
    template: WorkoutTemplate;
    onSave: (updatedTemplate: WorkoutTemplate) => void;
    onSetAsRestDay: (day: DayOfWeek) => void;
}> = ({ isOpen, onClose, day, template, onSave, onSetAsRestDay }) => {
    const [editedTemplate, setEditedTemplate] = useState<WorkoutTemplate>(template);
    const [isPickerOpen, setPickerOpen] = useState(false);

    const presets = [
        { name: 'Push', template: PUSH_PRESET },
        { name: 'Pull', template: PULL_PRESET },
        { name: 'Legs', template: LEGS_PRESET },
        { name: 'Upper', template: UPPER_BODY_PRESET },
        { name: 'Lower', template: LOWER_BODY_PRESET },
        { name: 'Full Body', template: FULL_BODY_PRESET },
    ];

    const applyPreset = (presetName: string, presetExercises: TemplateExercise[]) => {
        setEditedTemplate(prev => ({
            ...prev,
            title: prev.title || `${presetName} Day`,
            exercises: presetExercises
        }));
    };

    const handleTitleChange = (newTitle: string) => {
        setEditedTemplate(prev => ({ ...prev, title: newTitle }));
    };

    const addExercise = (exercise: Omit<FullExercise, 'muscleGroup'>) => {
        if (editedTemplate.exercises.some(e => e.exerciseId === exercise.id)) return; // Avoid duplicates
        const newExercise: TemplateExercise = {
            exerciseId: exercise.id,
            defaultSets: 3,
            defaultReps: '8-12'
        };
        setEditedTemplate(prev => ({...prev, exercises: [...prev.exercises, newExercise] }));
    };

    const removeExercise = (exId: string) => {
        setEditedTemplate(prev => ({
            ...prev,
            exercises: prev.exercises.filter(ex => ex.exerciseId !== exId)
        }));
    };

    const handleSave = () => {
        if (!editedTemplate.title.trim()) {
            alert("Please provide a title for the workout.");
            return;
        }
        onSave(editedTemplate);
        onClose();
    };
    
    const handleSetRest = () => {
        onSetAsRestDay(day);
        onClose();
    }

    const exerciseMap = new Map(ALL_EXERCISES_BY_GROUP.flatMap(g => g.exercises).map(e => [e.id, e.name]));

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={`Plan Workout for ${day}`}>
                <div className="h-[75vh] flex flex-col">
                    <input
                        type="text"
                        value={editedTemplate.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="Workout Title (e.g., Push Day)"
                        className="w-full p-3 mb-4 text-lg font-semibold bg-neutral-200 dark:bg-neutral-800 rounded-md border-transparent focus:ring-2 focus:ring-neutral-500"
                    />
                    <div className="mb-4">
                        <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Load a Preset</label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {presets.map(p => (
                            <button key={p.name} onClick={() => applyPreset(p.name, p.template)}
                                className="px-3 py-1.5 text-sm bg-neutral-200 dark:bg-neutral-800 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                            >{p.name}</button>
                            ))}
                        </div>
                    </div>
                    <div className="border-b border-neutral-300 dark:border-neutral-700 mb-4"></div>

                    <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                        {editedTemplate.exercises.map(ex => (
                            <div key={ex.exerciseId} className="bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg flex justify-between items-center">
                                <p className="font-semibold">{exerciseMap.get(ex.exerciseId) || 'Unknown'}</p>
                                <button onClick={() => removeExercise(ex.exerciseId)} className="text-red-500 hover:text-red-700">
                                    <Icon name="trash"/>
                                </button>
                            </div>
                        ))}
                         {editedTemplate.exercises.length === 0 && (
                            <div className="text-center py-8 text-neutral-500">
                                <p>No exercises planned for this day.</p>
                                <p>Add exercises below or load a preset.</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-300 dark:border-neutral-700">
                         <button
                            onClick={() => setPickerOpen(true)}
                            className="w-full mb-3 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold py-3 px-4 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                         >
                            <Icon name="plus" className="mr-2"/> Add Exercise
                         </button>
                         <div className="flex gap-2">
                             <button
                                onClick={handleSetRest}
                                className="w-full bg-neutral-200 hover:bg-neutral-300 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 font-bold py-3 px-4 rounded-lg transition-colors"
                             >
                               Set as Rest Day
                             </button>
                             <button
                                onClick={handleSave}
                                className="w-full bg-neutral-800 text-neutral-100 hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300 font-bold py-3 px-4 rounded-lg transition-colors"
                             >
                               Save Day's Plan
                             </button>
                         </div>
                    </div>
                </div>
            </Modal>
            <ExercisePickerModal isOpen={isPickerOpen} onClose={() => setPickerOpen(false)} onSelect={addExercise} />
        </>
    );
};


const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ onSavePlan }) => {
  const [step, setStep] = useState<'days' | 'split' | 'review' | 'custom'>('days');
  const [days, setDays] = useState<number | null>(null);
  const [plan, setPlan] = useState<WorkoutTemplate[] | null>(null);
  const [editingDay, setEditingDay] = useState<DayOfWeek | null>(null);

  const [isPickerOpen, setPickerOpen] = useState(false);
  const [swappingExercise, setSwappingExercise] = useState<{ dayId: string; exerciseId: string; } | null>(null);

  const availableSplits = useMemo(() => {
    if (!days) return [];
    return getAvailableSplits(days);
  }, [days]);
  
  const handleDaySelect = (numDays: number) => {
    setDays(numDays);
    setPlan(null);
    setStep('split');
  };

  const handleSplitSelect = (splitName: string) => {
    if (!days) return;
    if (splitName === 'Custom') {
      const blankPlan: WorkoutTemplate[] = DAYS_OF_WEEK.map(day => ({
          id: `template-custom-${day}`,
          dayOfWeek: day,
          title: 'Rest Day',
          exercises: []
      }));
      setPlan(blankPlan);
      setStep('custom');
    } else {
        const generatedPlan = generatePlan(days, splitName);
        if (generatedPlan) {
          setPlan(generatedPlan);
          setStep('review');
        }
    }
  };

  const handleSaveCustomDay = (updatedTemplate: WorkoutTemplate) => {
    if (!plan) return;
    setPlan(plan.map(p => p.dayOfWeek === updatedTemplate.dayOfWeek ? updatedTemplate : p));
  };
  
  const handleSetRestDay = (day: DayOfWeek) => {
    if (!plan) return;
    setPlan(plan.map(p => p.dayOfWeek === day ? {...p, title: 'Rest Day', exercises: []} : p));
  };
  
  const handleSwapExercise = (newExercise: Omit<FullExercise, 'muscleGroup'>) => {
    if (!swappingExercise || !plan) return;
    const newPlan = plan.map(dayPlan => {
      if (dayPlan.id === swappingExercise.dayId) {
        return {
          ...dayPlan,
          exercises: dayPlan.exercises.map(ex =>
            ex.exerciseId === swappingExercise.exerciseId
              ? { ...ex, exerciseId: newExercise.id }
              : ex
          )
        };
      }
      return dayPlan;
    });
    setPlan(newPlan);
    setSwappingExercise(null);
  };
  
  const handleFinalSave = () => {
    if (plan) {
      // Filter out days that are explicitly rest days
      const finalPlan = plan.filter(p => p.title !== 'Rest Day' && p.exercises.length > 0);
      onSavePlan(finalPlan);
    }
  };

  const getStepIndicator = (stepNum: number, currentStepNum: number, label: string) => (
    <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${currentStepNum >= stepNum ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-black' : 'bg-neutral-200 dark:bg-neutral-800'}`}>
            {currentStepNum > stepNum ? <Icon name="check" /> : stepNum}
        </div>
        <span className={`font-semibold ${currentStepNum >= stepNum ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-400'}`}>{label}</span>
    </div>
  );
  
  const stepToNum = { days: 1, split: 2, custom: 3, review: 3 };

  const renderStepContent = () => {
    switch (step) {
      case 'days':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <button key={d} onClick={() => handleDaySelect(d)} className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-center">
                <span className="font-semibold text-lg">{d} {d > 1 ? 'days' : 'day'}/week</span>
              </button>
            ))}
          </div>
        );
      case 'split':
        return (
          <div className="space-y-3">
            {availableSplits.map(s => (
              <button key={s.name} onClick={() => handleSplitSelect(s.name)} className="w-full text-left p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
                <h4 className="font-semibold text-lg">{s.name}</h4>
                <p className="text-sm text-neutral-500">{s.description}</p>
              </button>
            ))}
             <button onClick={() => setStep('days')} className="mt-4 text-sm font-semibold text-neutral-500">
                &larr; Back to day selection
             </button>
          </div>
        );
      case 'custom':
          if (!plan) return null;
          return (
            <div>
                 <div className="space-y-4">
                    {plan.map(dayTemplate => (
                        <div key={dayTemplate.dayOfWeek} className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold text-lg">{dayTemplate.dayOfWeek}</p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {dayTemplate.title}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingDay(dayTemplate.dayOfWeek)}
                                className="font-semibold text-neutral-700 dark:text-neutral-300 py-2 px-4 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                            >
                                <Icon name="edit" /> {dayTemplate.title !== 'Rest Day' ? 'Edit' : 'Plan Workout'}
                            </button>
                        </div>
                    ))}
                </div>
                 <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row gap-4">
                     <button onClick={() => setStep('split')} className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 font-bold py-3 px-6 rounded-lg flex-1">
                        Go Back
                     </button>
                     <button onClick={handleFinalSave} className="bg-neutral-800 text-neutral-100 hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300 font-bold py-3 px-6 rounded-lg flex-1">
                        Save My Custom Plan
                     </button>
                 </div>
            </div>
          );
       case 'review':
         if (!plan) return <p>Loading plan...</p>;
         const exerciseMap = new Map(ALL_EXERCISES_BY_GROUP.flatMap(g => g.exercises).map(e => [e.id, e.name]));
         return (
             <div className="space-y-4">
                 {plan.map(day => (
                     <div key={day.id} className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                         <h4 className="font-bold">{day.dayOfWeek}: <span className="text-neutral-800 dark:text-neutral-300">{day.title}</span></h4>
                         <ul className="mt-2 space-y-2">
                             {day.exercises.map(ex => (
                                 <li key={ex.exerciseId} className="flex justify-between items-center p-2 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-md">
                                     <span>{exerciseMap.get(ex.exerciseId) || 'Unknown Exercise'} ({ex.defaultSets}x{ex.defaultReps})</span>
                                     <button onClick={() => { setSwappingExercise({ dayId: day.id, exerciseId: ex.exerciseId }); setPickerOpen(true); }} className="text-sm font-semibold text-neutral-600 hover:underline">
                                         Swap
                                     </button>
                                 </li>
                             ))}
                         </ul>
                     </div>
                 ))}
                 <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row gap-4">
                     <button onClick={() => setStep('split')} className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-200 font-bold py-3 px-6 rounded-lg flex-1">
                        Go Back
                     </button>
                     <button onClick={handleFinalSave} className="bg-neutral-800 text-neutral-100 hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300 font-bold py-3 px-6 rounded-lg flex-1">
                        Save My Plan
                     </button>
                 </div>
             </div>
         );
      default: return null;
    }
  };
  
  const editingTemplate = useMemo(() => {
     if (!editingDay || !plan) return null;
     return plan.find(t => t.dayOfWeek === editingDay);
  }, [editingDay, plan]);

  return (
    <div>
      <h2 className="text-3xl font-bold">Strategy Builder</h2>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6">
        Let's create the perfect workout plan for you.
      </p>
      <div className="space-y-4 mb-8">
          {getStepIndicator(1, stepToNum[step], "Training Frequency")}
          {getStepIndicator(2, stepToNum[step], "Select Split")}
          {getStepIndicator(3, stepToNum[step], "Build & Customize")}
      </div>
      <div className="bg-neutral-200/50 dark:bg-neutral-950 p-6 rounded-lg">
        {renderStepContent()}
      </div>

      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSwapExercise}
      />
      {editingDay && editingTemplate && (
        <WorkoutDayEditorModal
            key={editingDay}
            isOpen={!!editingDay}
            onClose={() => setEditingDay(null)}
            day={editingDay}
            template={editingTemplate}
            onSave={handleSaveCustomDay}
            onSetAsRestDay={handleSetRestDay}
        />
      )}
    </div>
  );
};

export default StrategyBuilder;
