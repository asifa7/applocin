import React, { useState, useMemo } from 'react';
// FIX: Corrected import path for types
import type { WorkoutTemplate, Session } from '../types';
import Icon from './common/Icon';

interface CalendarViewProps {
  sessions: Session[];
  onStartWorkoutRequest: (date: string) => void;
  onEditSession: (sessionId: string) => void;
  workoutTemplates: WorkoutTemplate[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ sessions, onStartWorkoutRequest, onEditSession, workoutTemplates }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const sessionMap = useMemo(() => {
    const map = new Map<string, Session[]>();
    sessions.forEach(s => {
      const dateSessions = map.get(s.date) || [];
      dateSessions.push(s);
      map.set(s.date, dateSessions);
    });
    return map;
  }, [sessions]);

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center p-4 bg-bg-base rounded-t-lg">
      <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-bg-muted" aria-label="Previous month">
        <Icon name="chevronLeft" />
      </button>
      <h2 className="text-xl font-bold">
        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-bg-muted" aria-label="Next month">
        <Icon name="chevronRight" />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 gap-2 p-2">
        {days.map(day => (
          <div key={day} className="text-center font-semibold text-text-muted text-sm">{day}</div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));

    const days = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);

    return (
      <div className="grid grid-cols-7 gap-1 sm:gap-2 p-2">
        {days.map((d, i) => {
          const dateString = d.toISOString().split('T')[0];
          const isCurrentMonth = d.getMonth() === currentDate.getMonth();
          const isToday = d.getTime() === today.getTime();
          const daySessions = sessionMap.get(dateString) || [];
          
          return (
            <div
              key={i}
              className={`aspect-square border rounded-lg flex flex-col justify-start transition-colors overflow-hidden ${
                isCurrentMonth ? 'bg-bg-muted border-border' : 'bg-bg-subtle/50 border-transparent text-text-muted'
              } ${isToday ? 'border-2 border-text-base' : ''}`}
            >
              <span className={`font-semibold text-xs p-1 ${isToday ? 'text-primary' : ''}`}>{d.getDate()}</span>
              
              <div className="flex-grow flex flex-col items-center justify-center p-1 space-y-1">
                {isCurrentMonth ? (
                  <>
                    {daySessions.map(session => {
                      const template = workoutTemplates.find(t => t.id === session.templateId);
                      const workoutTitle = template ? template.title : "Workout";
                      const statusColor = 'bg-yellow-300 text-yellow-800 dark:bg-amber-800 dark:text-amber-100';

                      return (
                        <button 
                          key={session.id} 
                          onClick={() => onEditSession(session.id)} 
                          className={`w-full text-center text-[10px] font-semibold p-1 rounded-md transition-colors ${statusColor} hover:opacity-80 truncate`} 
                          title={`Edit: ${workoutTitle} (${session.status})`}
                        >
                          {workoutTitle}
                        </button>
                      );
                    })}
                    {daySessions.length === 0 && (
                      <div className="flex-grow w-full flex items-center justify-center">
                          <button 
                              onClick={() => onStartWorkoutRequest(dateString)} 
                              className="h-8 w-8 text-text-muted rounded-full hover:bg-bg-subtle transition-colors flex items-center justify-center opacity-50 hover:opacity-100" 
                              aria-label={`Log workout for ${dateString}`}
                          >
                              <Icon name="plus" className="w-5 h-5" />
                          </button>
                      </div>
                    )}
                  </>
                ) : (
                  // Empty div for days not in the current month to maintain grid structure
                  <div />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-bg-base shadow-lg rounded-lg">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CalendarView;