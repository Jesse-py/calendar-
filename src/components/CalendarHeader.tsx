import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Sun, Moon, BarChart2, ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react';
import { cn } from '../lib/utils';

export type ViewMode = 'calendar' | 'stats' | 'snake';

interface CalendarHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  jumpToToday: () => void;
  jumpToStart: () => void;
  prevMonth: () => void;
  nextMonth: () => void;
  currentDate: Date;
}

export function CalendarHeader({
  viewMode,
  setViewMode,
  isDarkMode,
  setIsDarkMode,
  jumpToToday,
  jumpToStart,
  prevMonth,
  nextMonth,
  currentDate,
}: CalendarHeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-5 md:px-8 md:py-6 flex flex-col lg:flex-row lg:items-center justify-between rounded-xl shadow-sm gap-6 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 dark:bg-indigo-500 w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase leading-tight">ShiftMaster Pro</h1>
          <p className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Expert Scheduling Assistant</p>
        </div>
      </div>

      <div className="flex flex-row flex-wrap items-center justify-center lg:justify-end gap-4 md:gap-6 w-full lg:w-auto">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('calendar')}
            className={cn(
              "px-3 py-1.5 md:py-2 rounded flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-all",
              viewMode === 'calendar' 
                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <CalendarIcon className="w-4 h-4" /> <span className="hidden sm:inline">Planner</span>
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={cn(
              "px-3 py-1.5 md:py-2 rounded flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-all",
              viewMode === 'stats' 
                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <BarChart2 className="w-4 h-4" /> <span className="hidden sm:inline">Stats</span>
          </button>
          <button
            onClick={() => setViewMode('snake')}
            aria-label="Snake"
            className={cn(
              "px-3 py-1.5 md:py-2 rounded flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-all",
              viewMode === 'snake'
                ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <Gamepad2 className="w-4 h-4" /> <span className="hidden sm:inline">Snake</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 md:px-3 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {viewMode === 'calendar' && (
            <>
              <button
                onClick={jumpToToday}
                className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm cursor-pointer w-full sm:w-auto"
              >
                Today
              </button>
              <button
                onClick={jumpToStart}
                className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border border-slate-900 dark:border-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors shadow-sm cursor-pointer w-full sm:w-auto whitespace-nowrap"
              >
                Go to Start
              </button>
            </>
          )}
        </div>

        {viewMode === 'calendar' && (
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden lg:block"></div>
        )}

        {viewMode === 'calendar' && (
          <div className="flex items-center justify-between gap-3 w-full sm:w-auto">
            <button
              onClick={prevMonth}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 p-2 md:px-3 md:py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4 md:w-4 md:h-4" />
            </button>
            <div className="w-32 md:w-40 text-center">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block leading-none mb-1 md:mb-1 tracking-widest">Period</span>
              <span className="text-base md:text-lg font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-tighter leading-none whitespace-nowrap">
                {format(currentDate, 'MMM yyyy')}
              </span>
            </div>
            <button
              onClick={nextMonth}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 p-2 md:px-3 md:py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4 md:w-4 md:h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
