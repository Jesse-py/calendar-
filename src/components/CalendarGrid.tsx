import React from 'react';
import { format, isSameMonth, isToday, isSameDay, isBefore } from 'date-fns';
import { cn } from '../lib/utils';
import { ProgressRing } from './ProgressRing';
import { getDayPercentage, getRating, TRACKING_START_DATE, cycleStartDate } from '../lib/taskEngine';
import { SHIFT_FORMATTED_TIMES, SHIFT_STYLES, ShiftType } from '../types/shifts';

interface CalendarGridProps {
  calendarDays: Date[];
  currentDate: Date;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  getShiftForDate: (date: Date) => { shift: string | null; isFreshCost: boolean };
  dailyCompletions: Record<string, string[]>;
  dailyTasks: string[];
  todayStart: Date;
  weekDays: string[];
  customShifts: Record<string, string | null>;
}

export function CalendarGrid({
  calendarDays,
  currentDate,
  selectedDate,
  setSelectedDate,
  getShiftForDate,
  dailyCompletions,
  dailyTasks,
  todayStart,
  weekDays,
  customShifts,
}: CalendarGridProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Day Names headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-4 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 bg-white dark:bg-slate-900">
        {calendarDays.map((day, idx) => {
          const { shift, isFreshCost } = getShiftForDate(day);
          const dateKey = format(day, 'yyyy-MM-dd');
          const isCustom = customShifts[dateKey] !== undefined;
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const isPast = isBefore(day, todayStart);
          const isStartAnchor = day.getTime() === cycleStartDate.getTime();
          
          const dayPercentage = getDayPercentage(day, dailyCompletions, dailyTasks);
          const dayRating = getRating(dayPercentage);
          const isTrackedDay = !isBefore(day, TRACKING_START_DATE);

          // customShifts check is mostly visual inside the calendar (if it has `isCustom`), 
          // let's assume it gets passed out or derived inside if needed... wait, the logic for `isCustom` 
          // needs to be updated. It checks `customShifts[dateKey] !== undefined`. I can accept `customShifts` as a prop.

          const showRatingBg = isTrackedDay;
          const baseBg = showRatingBg ? dayRating.bgClass : 'bg-white dark:bg-slate-900';

          return (
            <div
              key={day.toISOString() + idx}
              onClick={() => setSelectedDate(day)}
              className={cn(
                'min-h-[90px] md:min-h-[140px] transition-colors flex flex-col cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 relative group border-r border-b border-slate-200 dark:border-slate-800',
                idx % 7 === 6 && 'border-r-0',
                idx >= calendarDays.length - 7 && 'border-b-0',
                baseBg,
                !isCurrentMonth && 'opacity-60',
                isPast && !isTrackedDay && 'bg-slate-100 dark:bg-slate-900 grayscale-[40%] opacity-80',
                isCurrentDay && 'ring-2 ring-indigo-500 z-10',
                selectedDate && isSameDay(day, selectedDate) && 'ring-2 ring-indigo-400 inset-0 z-10'
              )}
            >
              {/* Day Header Context */}
              <div className="flex flex-wrap items-center justify-between px-1.5 md:px-2 pt-1.5 md:pt-2 pb-1 relative z-20">
                <span
                  className={cn(
                    'text-[10px] md:text-sm font-bold w-6 h-6 flex items-center justify-center rounded',
                    isCurrentMonth ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600',
                    isCurrentDay && 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm',
                    isStartAnchor && !isCurrentDay && 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm'
                  )}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex items-center gap-1.5">
                   {/* Performance Ring */}
                   {isTrackedDay && <ProgressRing percentage={dayPercentage} size={16} strokeWidth={2} />}
                   
                   {/* The Edited badge (for now logic checks customShifts) */}
                   {isCustom && <span className="text-[8px] font-black tracking-widest uppercase text-amber-600 dark:text-amber-500 px-1 border border-amber-200 dark:border-amber-800/80 rounded bg-amber-50 dark:bg-amber-900/30">Edited</span>}
                   {isStartAnchor && !isCustom && <span className="text-[8px] font-black tracking-widest uppercase text-slate-400 dark:text-slate-500 px-1 border border-slate-200 dark:border-slate-700/80 rounded bg-slate-50 dark:bg-slate-800 hidden xl:inline-block">Anchor Shift</span>}
                   {isFreshCost && <span className="text-[8px] font-black tracking-widest uppercase text-emerald-700 dark:text-emerald-400 px-1 border border-emerald-200 dark:border-emerald-800/80 rounded bg-emerald-100 dark:bg-emerald-900/40 hidden md:inline-block">Fresh Cost Inv.</span>}
                </div>
              </div>

              {/* Shift Label Content */}
              <div className="px-1 md:px-2 pb-2 md:pb-3 flex-1 flex flex-col justify-end relative z-20">
                {shift ? (
                  <div
                    className={cn(
                      'text-[8px] md:text-xs font-black px-1 md:px-2 py-1 md:py-2 rounded flex flex-col xl:flex-row items-center justify-center border text-center shadow-[0_1px_2px_rgba(0,0,0,0.05)] uppercase leading-tight font-mono tracking-tight transition-all',
                      SHIFT_STYLES[shift] || ''
                    )}
                  >
                    <span className="hidden md:inline">{SHIFT_FORMATTED_TIMES[shift as ShiftType] || shift}</span>
                    <span className="md:hidden tracking-tighter">
                      {(SHIFT_FORMATTED_TIMES[shift as ShiftType] || shift).replace(' AM', 'a').replace(' PM', 'p').replace(' - ', '-')}
                    </span>
                  </div>
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-300 dark:text-slate-700 text-center uppercase tracking-widest pb-1">
                    Off Duty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
