
import React, { useState, useMemo, useEffect } from 'react';
import type { DailyLog, FoodItem, Meal } from '../types';
import Icon from './common/Icon';

// --- HELPER FUNCTIONS ---

const getWeekBoundaries = (date: Date): { start: Date; end: Date } => {
  const d = date ? new Date(date.valueOf()) : new Date();
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 0);
  const start = new Date(d.setDate(diff));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

const getMonthBoundaries = (date: Date): { start: Date; end: Date } => {
  const d = date ? new Date(date.valueOf()) : new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start, end };
};

const getMonthMatrix = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const matrix = [];
    let day = 1;
    for (let i = 0; i < 6; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                week.push(null);
            } else if (day > daysInMonth) {
                week.push(null);
            } else {
                week.push(new Date(year, month, day));
                day++;
            }
        }
        matrix.push(week);
        if(day > daysInMonth) break;
    }
    return matrix;
};

// --- VIEW COMPONENTS ---

const DayView: React.FC<{ dayData: any, dataType: 'calories' | 'steps' }> = ({ dayData, dataType }) => {
    const isCalories = dataType === 'calories';
    const colorClass = isCalories ? 'bg-secondary' : 'bg-accent';
    const chartData = isCalories ? dayData.hourlyData : Array(24).fill(0); // Only show hourly for calories
    const maxValue = Math.max(...chartData, 30); // Use 30 as a minimum for y-axis
    const activities = isCalories ? dayData.activities : [];

    return (
        <div className="space-y-6">
            <div className="h-48 bg-bg-muted rounded-lg p-4 flex items-end relative">
                {/* Y-Axis Labels & Lines */}
                <div className="absolute top-0 left-0 right-4 bottom-10 flex flex-col justify-between">
                    {[0.5, 1].map(multiple => (
                        <div key={multiple} className="flex items-center">
                            <span className="text-xs text-text-muted pr-2">{Math.round(maxValue * multiple)}</span>
                            <div className="flex-grow border-b border-border/50 border-dashed"></div>
                        </div>
                    ))}
                </div>
                 <div className="w-full h-full flex items-end gap-[2px] pt-4">
                    {chartData.map((value, hour) => (
                        <div key={hour} className="w-full h-full flex flex-col justify-end items-center relative">
                            <div 
                                className={`w-1.5 ${colorClass} rounded-t-full transition-all duration-300`}
                                style={{ height: `${(value / maxValue) * 100}%` }}
                            ></div>
                            {hour % 4 === 0 && (
                                <span className="absolute -bottom-5 text-xs text-text-muted mt-1">
                                    {hour === 0 ? '12am' : hour === 12 ? '12pm' : (hour > 12 ? hour - 12 : hour) + (hour >= 12 ? 'pm' : 'am')}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {isCalories ? (
                <div className="space-y-4 pt-4">
                    {activities.map((activity: any, index: number) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="w-8 h-8 flex-shrink-0 bg-bg-subtle rounded-full flex items-center justify-center mt-1">
                                <Icon name="utensils" className="w-4 h-4 text-text-muted" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">{activity.time}</p>
                                <p className="font-bold">{activity.name}</p>
                                <p className={`text-sm ${dataType === 'calories' ? 'text-secondary' : 'text-accent'}`}>{activity.details}</p>
                            </div>
                        </div>
                    ))}
                    {activities.length === 0 && (
                        <div className="text-center py-10 bg-bg-muted rounded-lg">
                            <p className="text-text-muted">No food logged for this day.</p>
                        </div>
                    )}
                </div>
            ) : (
                 <div className="text-center py-10 bg-bg-muted rounded-lg">
                    <p className="text-text-muted">Steps are logged for the entire day.</p>
                </div>
            )}
        </div>
    );
};

const WeekView: React.FC<{ weekData: any[]; dataType: 'calories' | 'steps' }> = ({ weekData, dataType }) => {
    const maxValue = Math.max(...weekData.map(d => d.value), 1);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const colorClass = dataType === 'calories' ? 'bg-secondary' : 'bg-accent';

    return (
        <div className="h-48 bg-bg-muted rounded-lg p-4 flex items-end gap-2">
            {weekData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center h-full">
                    <div className="w-full h-full flex items-end justify-center">
                        <div
                            className={`w-4/5 ${item.label === today ? colorClass : 'bg-bg-subtle'} rounded-t-md transition-all duration-500 ease-out`}
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                            title={`${item.label}: ${item.value.toLocaleString()}`}
                        ></div>
                    </div>
                    <span className={`text-xs font-semibold mt-2 ${item.label === today ? 'text-text-base' : 'text-text-muted'}`}>{item.label}</span>
                </div>
            ))}
        </div>
    );
};

const MonthView: React.FC<{ monthData: any; dataType: 'calories' | 'steps' }> = ({ monthData, dataType }) => {
    const calendarMatrix = getMonthMatrix(monthData.days[15]?.date || new Date());
    const today = new Date();
    const colorClass = dataType === 'calories' ? 'bg-secondary' : 'bg-accent';
    const textColorClass = dataType === 'calories' ? 'text-secondary' : 'text-accent';

    return (
        <div className="bg-bg-muted rounded-lg p-2 sm:p-4">
            <div className="grid grid-cols-7 gap-y-2 sm:gap-y-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-bold text-sm text-text-muted">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-2 sm:gap-y-4 mt-2">
                {calendarMatrix.flat().map((date, index) => {
                    if (!date) return <div key={index} className="h-10 w-10 sm:h-12 sm:w-12"></div>;

                    const day = date.getDate();
                    const dayData = monthData.days.find((d: any) => d.date.getDate() === day);
                    const value = dayData ? dayData.value : 0;
                    const size = monthData.max > 0 ? (value / monthData.max) * 44 : 0;
                    const clampedSize = Math.max(size, value > 0 ? 18 : 0);
                    
                    return (
                        <div key={index} className="relative h-10 w-10 sm:h-12 sm:w-12 mx-auto flex items-center justify-center">
                           {value > 0 && (
                                <div 
                                    className={`absolute ${colorClass}/50 rounded-full transition-all duration-300`}
                                    style={{ width: `${clampedSize}px`, height: `${clampedSize}px`}}
                                ></div>
                           )}
                           <span className={`relative font-semibold text-sm ${date.toDateString() === today.toDateString() ? textColorClass : ''}`}>{day}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

interface MyActivityProps {
  dailyLogs: DailyLog[];
  foodDatabase: FoodItem[];
  userGoals: any; // Using any to avoid TS errors on a complex but unused prop
  onBack: () => void;
  initialTab: 'calories' | 'steps';
}

const MyActivity: React.FC<MyActivityProps> = ({ dailyLogs, foodDatabase, onBack, initialTab }) => {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [dataType, setDataType] = useState<'calories' | 'steps'>(initialTab || 'calories');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  useEffect(() => {
    if(initialTab) {
        setDataType(initialTab);
    }
  }, [initialTab]);

  const handleDateChange = (amount: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (period === 'day') newDate.setDate(newDate.getDate() + amount);
      else if (period === 'week') newDate.setDate(newDate.getDate() + (amount * 7));
      else newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const data = useMemo(() => {
    const safeDate = (currentDate && !isNaN(currentDate.getTime())) ? currentDate : new Date();
    let start: Date, end: Date, title: string;

    if (period === 'day') {
      start = new Date(safeDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      title = start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    } else if (period === 'week') {
      ({ start, end } = getWeekBoundaries(safeDate));
      const startStr = start.toLocaleDateString('en-US', { day: 'numeric' });
      const endStr = end.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
      title = `${startStr}–${endStr}`;
    } else {
      ({ start, end } = getMonthBoundaries(safeDate));
      title = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    const getCaloriesForLog = (log: DailyLog | undefined) => {
        if (!log) return 0;
        return Math.round(log.meals.reduce((total, meal) => (
            total + meal.foods.reduce((mealTotal, loggedFood) => {
                const food = foodDatabase.find(f => f.id === loggedFood.foodId);
                return mealTotal + (food ? food.calories * loggedFood.servings : 0);
            }, 0)
        ), 0));
    };

    const listData = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const log = dailyLogs.find(l => l.date === dateStr);
        listData.push({
            date: new Date(d),
            calories: getCaloriesForLog(log),
            steps: log?.steps || 0
        });
    }

    const totalValue = listData.reduce((sum, item) => sum + item[dataType], 0);

    let viewSpecificData: any = {};
    if (period === 'day') {
        const log = dailyLogs.find(l => l.date === start.toISOString().split('T')[0]);
        const hourlyData = Array(24).fill(0);
        let activities: any[] = [];
        if (log) {
            log.meals.forEach(meal => {
                if(meal.foods.length > 0) {
                    const mealCals = meal.foods.reduce((sum, foodLog) => {
                        const food = foodDatabase.find(f => f.id === foodLog.foodId);
                        const cals = food ? food.calories * foodLog.servings : 0;
                        if (foodLog.loggedAt) hourlyData[new Date(foodLog.loggedAt).getHours()] += cals;
                        return sum + cals;
                    }, 0);

                    const firstLogTime = meal.foods.reduce((earliest, curr) => Math.min(earliest, new Date(curr.loggedAt).getTime()), Infinity);
                    activities.push({
                        time: new Date(firstLogTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                        name: meal.name,
                        details: `${meal.foods.length} items • ${Math.round(mealCals)} kcal`
                    });
                }
            });
        }
        viewSpecificData = { hourlyData, activities: activities.sort((a,b) => new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime()) };
    } else if (period === 'week') {
        viewSpecificData = listData.map(d => ({
            label: d.date.toLocaleDateString('en-US', { weekday: 'short' }),
            value: d[dataType],
        }));
    } else { // month
        const max = Math.max(...listData.map(d => d[dataType]), 1);
        viewSpecificData = { days: listData.map(d => ({ date: d.date, value: d[dataType] })), max };
    }

    return { totalValue, dateRangeString: title, listData, viewSpecificData };
  }, [currentDate, period, dataType, dailyLogs, foodDatabase]);
  
  const PeriodTab: React.FC<{ label: 'Day' | 'Week' | 'Month' }> = ({ label }) => (
    <button
      onClick={() => setPeriod(label.toLowerCase() as any)}
      className={`flex-1 py-3 text-center font-semibold transition-colors ${period === label.toLowerCase() ? 'text-text-base' : 'text-text-muted'}`}
    >{label}</button>
  );

  const StatButton: React.FC<{ label: 'Calories' | 'Steps'; type: 'calories' | 'steps' }> = ({ label, type }) => (
    <button
      onClick={() => setDataType(type)}
      className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${dataType === type ? 'bg-bg-subtle text-text-base' : 'bg-transparent border border-border text-text-muted hover:bg-bg-muted'}`}
    >{label}</button>
  );

  const textColorClass = dataType === 'calories' ? 'text-secondary' : 'text-accent';

  return (
    <div className="bg-bg-base text-text-base min-h-screen">
      <header className="p-4 flex justify-between items-center">
        <button onClick={onBack} className="p-2 -ml-2"><Icon name="chevronLeft" className="w-8 h-8" /></button>
        <h1 className="text-xl font-bold">My Activity</h1>
        <div className="w-12"></div>
      </header>
      
      <nav className="px-4 flex justify-around items-center border-b border-border relative">
        <PeriodTab label="Day" />
        <PeriodTab label="Week" />
        <PeriodTab label="Month" />
        <div className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300" style={{
            width: '33.33%',
            left: period === 'day' ? '0%' : period === 'week' ? '33.33%' : '66.67%'
        }}></div>
      </nav>

      <main className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <button onClick={() => handleDateChange(-1)} className="p-2 rounded-full hover:bg-bg-muted"><Icon name="chevronLeft" /></button>
          <div className="text-center">
            <p className="font-semibold text-lg">{data.dateRangeString}</p>
            <p className={`text-sm ${textColorClass} flex items-center justify-center gap-1.5`}>
              <i className={dataType === 'calories' ? 'fas fa-fire' : 'fas fa-shoe-prints'}></i>
              {data.totalValue.toLocaleString()} {dataType === 'calories' ? 'kcal' : 'steps'}
            </p>
          </div>
          <button onClick={() => handleDateChange(1)} className="p-2 rounded-full hover:bg-bg-muted"><Icon name="chevronRight" /></button>
        </div>

        {period === 'day' && <DayView dayData={data.viewSpecificData} dataType={dataType} />}
        {period === 'week' && <WeekView weekData={data.viewSpecificData} dataType={dataType} />}
        {period === 'month' && <MonthView monthData={data.viewSpecificData} dataType={dataType} />}
        
        <div className="flex justify-center items-center gap-3">
          <StatButton label="Calories" type="calories" />
          <StatButton label="Steps" type="steps" />
        </div>
        
        <p className="text-center text-sm text-text-muted px-4">
          {dataType === 'calories' 
            ? 'Calories are a measure of energy from food, crucial for managing weight.'
            : 'Steps track your daily movement, a key indicator of overall activity.'}
        </p>
        
        {period !== 'day' && (
            <div className="space-y-2 pt-4 border-t border-border">
            {data.listData.map(({ date, calories, steps }) => (
                <div key={date.toISOString()} className="flex justify-between items-center py-1">
                    <p className="font-semibold">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    <p className="font-bold text-lg">
                        {dataType === 'calories' ? `${calories.toLocaleString()} kcal` : `${steps.toLocaleString()} steps`}
                    </p>
                </div>
            ))}
            </div>
        )}
      </main>
    </div>
  );
};

export default MyActivity;
