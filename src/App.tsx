import React, { useState, useMemo, useEffect } from 'react';
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  differenceInCalendarDays,
  startOfDay,
  isBefore,
} from 'date-fns';
import { useTaskEngine } from './hooks/useTaskEngine';
import { TaskSidebar } from './components/TaskSidebar';
import { PerformanceStatsDashboard } from './components/PerformanceStatsDashboard';
import { TRACKING_START_DATE, cycleStartDate, getShiftForDate as getShiftForDateEngine } from './lib/taskEngine';
import { CalendarHeader } from './components/CalendarHeader';
import { CalendarGrid } from './components/CalendarGrid';
import { Legend } from './components/Legend';
import { EditShiftModal } from './components/EditShiftModal';

export default function App() {
  const [currentDate, setCurrentDate] = useState<Date>(startOfMonth(new Date()));
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [customShifts, setCustomShifts] = useState<Record<string, string | null>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shift_custom_overrides');
      if (saved) return JSON.parse(saved);
    }
    return {};
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'stats'>('calendar');

  // Initialize task engine
  const { 
    dailyTasks, 
    weeklyTasks, 
    dailyCompletions, 
    weeklyCompletions, 
    toggleDailyTask, 
    toggleWeeklyTask,
    addDailyTask,
    removeDailyTask,
    addWeeklyTask,
    removeWeeklyTask 
  } = useTaskEngine();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shift_custom_overrides', JSON.stringify(customShifts));
    }
  }, [customShifts]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  function getShiftForDate(date: Date): { shift: string | null, isFreshCost: boolean } {
    return getShiftForDateEngine(date, customShifts);
  }

  // Calendar Grid Generation
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart); // defaults to Sunday
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Navigation handlers
  const nextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const prevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const jumpToToday = () => setCurrentDate(startOfMonth(new Date()));
  const jumpToStart = () => setCurrentDate(startOfMonth(cycleStartDate));
  
  const handleShiftChange = (shift: string | null) => {
    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      setCustomShifts(prev => ({ ...prev, [dateKey]: shift }));
      setSelectedDate(null);
    }
  };

  const handleResetShift = () => {
    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      setCustomShifts(prev => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
      setSelectedDate(null);
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayStart = startOfDay(new Date());

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 flex flex-col items-center font-sans text-slate-900 dark:text-slate-100 border-x border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 w-full max-w-[1400px]">
        
        {/* Main Content (Calendar) */}
        <div className="flex-1 space-y-6 md:space-y-8 min-w-0">
        
          <CalendarHeader 
            viewMode={viewMode}
            setViewMode={setViewMode}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            jumpToToday={jumpToToday}
            jumpToStart={jumpToStart}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
            currentDate={currentDate}
          />

        {viewMode === 'stats' ? (
          <PerformanceStatsDashboard 
            dailyTasks={dailyTasks}
            weeklyTasks={weeklyTasks}
            dailyCompletions={dailyCompletions}
            weeklyCompletions={weeklyCompletions}
            customShifts={customShifts}
          />
        ) : (
          <>
            <Legend />

            <CalendarGrid 
              calendarDays={calendarDays}
              currentDate={currentDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              getShiftForDate={getShiftForDate}
              dailyCompletions={dailyCompletions}
              dailyTasks={dailyTasks}
              todayStart={todayStart}
              weekDays={weekDays}
              customShifts={customShifts}
            />
          </>
        )}
        
        </div>
        
        {/* Sidebar */}
        <TaskSidebar 
          currentDate={selectedDate || startOfDay(new Date())} 
          dailyTasks={dailyTasks}
          weeklyTasks={weeklyTasks}
          dailyCompletions={dailyCompletions}
          weeklyCompletions={weeklyCompletions}
          onToggleDaily={toggleDailyTask}
          onToggleWeekly={toggleWeeklyTask}
          onAddDailyTask={addDailyTask}
          onRemoveDailyTask={removeDailyTask}
          onAddWeeklyTask={addWeeklyTask}
          onRemoveWeeklyTask={removeWeeklyTask}
          customShifts={customShifts}
        />
        
      </div>

      {/* Edit Shift Modal */}
      {selectedDate && (
        <EditShiftModal 
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          handleShiftChange={handleShiftChange}
          handleResetShift={handleResetShift}
        />
      )}
    </div>
  );
}

