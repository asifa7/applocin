
import React from 'react';
// FIX: Correcting import path for types
import type { WorkoutTemplate, Session } from '../types';
import Icon from './common/Icon';

interface WeeklyScheduleProps {
  workoutTemplates: WorkoutTemplate[];
  onStartWorkout: (template: WorkoutTemplate) => void;
  sessions: Session[];
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ workoutTemplates, onStartWorkout, sessions }) => {
  const today = new Date();
  const todayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const todayDateStr = today.toISOString().split('T')[0];
  const todaysSession = sessions.find(s => s.date === todayDateStr);
  const todaysTemplate = workoutTemplates.find(t => t.dayOfWeek === todayName);

  const getDayStatus = (day: string) => {
    const template = workoutTemplates.find(t => t.dayOfWeek === day);
    if (!template) return 'Rest';
    
    const dayIndex = DAYS_OF_WEEK.indexOf(day);
    const todayIndex = today.getDay();
    const dateOfThisDayInWeek = new Date(today);
    dateOfThisDayInWeek.setDate(today.getDate() - (todayIndex - dayIndex));
    const dateStr = dateOfThisDayInWeek.toISOString().split('T')[0];

    const session = sessions.find(s => s.date === dateStr);

    if (session?.status === 'completed') return 'Done';
    if (session?.status === 'in-progress') return 'In Progress';
    return template.title;
  };
  
  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-lg">
      <h3 className="font-bold mb-4 text-lg">This Week's Schedule</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {DAYS_OF_WEEK.map(day => {
          const isToday = day === todayName;
          const status = getDayStatus(day);
          const isDone = status === 'Done';
          return (
            <div key={day} className={`p-3 rounded-md text-center ${isToday ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black' : 'bg-neutral-200 dark:bg-neutral-800'}`}>
              <p className={`font-bold text-sm ${isToday ? '' : 'text-neutral-500'}`}>{day.substring(0,3)}</p>
              <div className={`mt-2 text-xs font-semibold ${isDone ? 'text-green-500' : ''}`}>
                {isDone ? <Icon name="check" className="mx-auto" /> : status}
              </div>
            </div>
          );
        })}
      </div>
       <div className="mt-6 text-center">
        {todaysTemplate && !todaysSession ? (
          <button
            onClick={() => onStartWorkout(todaysTemplate)}
            className="bg-neutral-800 text-neutral-100 hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Start Today's Workout: {todaysTemplate.title}
          </button>
        ) : todaysSession ? (
          <p className="font-semibold text-neutral-600 dark:text-neutral-400">
            Workout for today is already {todaysSession.status}.
          </p>
        ) : (
          <p className="font-semibold text-neutral-600 dark:text-neutral-400">
            Today is a rest day.
          </p>
        )}
      </div>
    </div>
  );
};

export default WeeklySchedule;
