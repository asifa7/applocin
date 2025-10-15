
import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import type { Session, DailyLog, WorkoutTemplate } from '../types';
import Icon from './common/Icon';
import BarChart from './common/Chart';

interface HistoryProps {
  sessions: Session[];
  unit: string;
  workoutTemplates: WorkoutTemplate[];
  dailyLogs: DailyLog[];
}

const AnalyticsView: React.FC<{sessions: Session[], dailyLogs: DailyLog[]}> = ({ sessions, dailyLogs }) => {
    const activityByHour = useMemo(() => {
        const hours = Array(24).fill(0);
        
        sessions.forEach(session => {
            session.exercises.forEach(ex => {
                ex.sets.forEach(set => {
                    if (set.completedAt) {
                        const hour = new Date(set.completedAt).getHours();
                        hours[hour]++;
                    }
                });
            });
        });

        dailyLogs.forEach(log => {
            log.meals.forEach(meal => {
                meal.foods.forEach(food => {
                    if (food.loggedAt) {
                        const hour = new Date(food.loggedAt).getHours();
                        hours[hour]++;
                    }
                });
            });
        });

        return hours.map((count, index) => ({
            label: `${index}:00`,
            value: count
        }));
    }, [sessions, dailyLogs]);

    const totalActivity = activityByHour.reduce((sum, item) => sum + item.value, 0);

    if (totalActivity === 0) {
        return (
            <div className="text-center py-16 px-6 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <Icon name="history" className="text-5xl text-neutral-400 mb-4" />
                <h3 className="text-xl font-semibold">Not Enough Data for Analytics</h3>
                <p className="text-neutral-500 mt-2">Log some meals and complete a few workouts to see your activity patterns here.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
            <h3 className="font-bold mb-1 text-lg">Activity by Hour</h3>
            <p className="text-sm text-neutral-500 mb-4">Shows when you log meals or complete exercise sets.</p>
            <BarChart data={activityByHour} />
        </div>
    );
};

const History: React.FC<HistoryProps> = ({ sessions, unit, workoutTemplates, dailyLogs }) => {
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const toggleSessionDetails = (sessionId: string) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId);
  };
  
  const completedSessions = sessions.filter(s => s.status === 'completed' && s.completedAt);
  
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Session ID,Date,Completed At,Workout,Exercise,Set,Reps,Weight,Volume,Unit\n";

    completedSessions.forEach(session => {
        const template = workoutTemplates.find(t => t.id === session.templateId);
        session.exercises.forEach(exercise => {
            exercise.sets.forEach((set, index) => {
                const row = [
                    session.id,
                    session.date,
                    set.completedAt || session.completedAt,
                    template?.title || 'Custom Workout',
                    exercise.name,
                    index + 1,
                    set.reps,
                    set.weight,
                    set.volume,
                    session.unit,
                ].join(",");
                csvContent += row + "\r\n";
            });
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ppl_tracker_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const sortedSessions = [...completedSessions].sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  const renderListView = () => (
     sortedSessions.length > 0 ? (
        <div className="space-y-4">
          {sortedSessions.map(session => {
            const template = workoutTemplates.find(t => t.id === session.templateId);
            return (
              <div key={session.id} className="bg-neutral-100 dark:bg-neutral-900 rounded-lg shadow-md">
                <div 
                    className="p-4 cursor-pointer flex justify-between items-center"
                    onClick={() => toggleSessionDetails(session.id)}
                >
                    <div>
                        <p className="font-bold text-lg">{template?.title || 'Custom Workout'}</p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {new Date(session.completedAt!).toLocaleDateString()} - Total Volume: {(session.totalVolume || 0).toLocaleString()} {session.unit}
                        </p>
                    </div>
                    <Icon name={expandedSessionId === session.id ? "chevronUp" : "chevronDown"} className="text-xl"/>
                </div>
                {expandedSessionId === session.id && (
                    <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
                        {session.exercises.map(ex => (
                            <div key={ex.id} className="mb-3">
                                <p className="font-semibold">{ex.name}</p>
                                <ul className="list-disc list-inside text-sm text-neutral-700 dark:text-neutral-300 pl-2">
                                    {ex.sets.map((set, index) => (
                                        <li key={set.id}>
                                            Set {index + 1}: {set.reps} reps @ {set.weight} {session.unit} (Volume: {set.volume})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
          <Icon name="history" className="text-5xl text-neutral-400 mb-4" />
          <h3 className="text-xl font-semibold">No Workouts Yet</h3>
          <p className="text-neutral-500 mt-2">Complete your first workout session to see it here.</p>
        </div>
      )
  );

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Workout History</h2>
            <div className="flex items-center gap-2">
                <button
                    onClick={exportToCSV}
                    className="bg-neutral-800 text-neutral-100 hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300 font-semibold py-2 px-3 rounded-lg transition-colors flex items-center gap-2"
                    disabled={sortedSessions.length === 0}
                >
                    <Icon name="download" className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Export</span>
                </button>
                <div className="flex bg-neutral-200 dark:bg-neutral-800 p-1 rounded-lg">
                    <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'list' ? 'bg-neutral-800 text-white dark:bg-neutral-100 dark:text-black' : ''}`}>List</button>
                    <button onClick={() => setViewMode('analytics')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'analytics' ? 'bg-neutral-800 text-white dark:bg-neutral-100 dark:text-black' : ''}`}>Analytics</button>
                </div>
            </div>
        </div>

        {viewMode === 'list' ? renderListView() : <AnalyticsView sessions={sessions} dailyLogs={dailyLogs} />}
    </div>
  );
};

export default History;
