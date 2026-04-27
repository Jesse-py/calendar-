import { startOfWeek, endOfWeek, startOfDay, isBefore, format, eachDayOfInterval, startOfMonth, startOfQuarter, differenceInCalendarDays } from 'date-fns';
import { ShiftType } from '../types/shifts';

export const DAILY_TASKS = [
  'Digital tag errors',
  'Check water check',
  'Check wet wall'
];

export const WEEKLY_TASKS = [
  'Art convos',
  'Schedules',
  '5+ list'
];

// --- ROTATION PATTERN LOGIC (moved from App.tsx) ---
export const cycleStartDate = new Date(2026, 3, 25); // Set to April 25, 2026 so May 2nd starts on Week 2

export const shiftPattern: (ShiftType | null)[] = [
  // Week 1
  null, null, ShiftType.MORNING, ShiftType.MORNING, ShiftType.MORNING, ShiftType.AFTERNOON, ShiftType.AFTERNOON,
  // Week 2
  null, ShiftType.MORNING, ShiftType.AFTERNOON, ShiftType.AFTERNOON, null, ShiftType.MORNING, ShiftType.MORNING,
  // Week 3
  ShiftType.MORNING, ShiftType.MORNING, ShiftType.MORNING, null, ShiftType.AFTERNOON, ShiftType.MID_DAY, null,
  // Week 4
  ShiftType.AFTERNOON, ShiftType.AFTERNOON, null, null, ShiftType.MORNING, ShiftType.MORNING, ShiftType.MORNING,
];

export const freshCostInventoryDates = new Set([
  '2026-04-28', // Apr 28
  '2026-05-26', // May 26
  '2026-06-23', // June 23
  '2026-07-28', // July 28
  '2026-08-25', // Aug 25
  '2026-09-22', // Sept 22
  '2026-10-27', // Oct 27
  '2026-12-29', // Dec 29
  '2027-01-26', // Jan 26
]);

export function getShiftForDate(date: Date, customShifts: Record<string, string | null> = {}): { shift: string | null, isFreshCost: boolean } {
  const dateKey = format(date, 'yyyy-MM-dd');
  const isFreshCost = freshCostInventoryDates.has(dateKey);

  if (customShifts[dateKey] !== undefined) {
    return { shift: customShifts[dateKey], isFreshCost };
  }
  
  if (isFreshCost) {
    return { shift: ShiftType.EARLY, isFreshCost };
  }

  const normalizedDate = startOfDay(date);
  const diff = differenceInCalendarDays(normalizedDate, cycleStartDate);
  let index = diff % 28;
  if (index < 0) {
    index = (index + 28) % 28;
  }
  return { shift: shiftPattern[index], isFreshCost };
}


export function getWeekStart(date: Date) {
  // weekStartsOn: 6 means Saturday
  return startOfWeek(date, { weekStartsOn: 6 });
}

export function isTaskLocked(date: Date) {
  const today = startOfDay(new Date());
  // The task is locked if the date is strictly before today
  return isBefore(startOfDay(date), today);
}

export function getRating(percentage: number): { letter: string; color: string; bgClass: string } {
  if (percentage >= 90) return { letter: 'A', color: 'text-emerald-500', bgClass: 'bg-emerald-100/60 dark:bg-emerald-900/30' };
  if (percentage >= 80) return { letter: 'B', color: 'text-blue-500', bgClass: 'bg-blue-100/60 dark:bg-blue-900/30' };
  if (percentage >= 70) return { letter: 'C', color: 'text-yellow-500', bgClass: 'bg-yellow-100/60 dark:bg-yellow-900/30' };
  if (percentage >= 60) return { letter: 'D', color: 'text-orange-500', bgClass: 'bg-orange-100/60 dark:bg-orange-900/30' };
  if (percentage > 0) return { letter: 'F', color: 'text-red-500', bgClass: 'bg-red-100/60 dark:bg-red-900/30' };
  return { letter: '-', color: 'text-slate-300', bgClass: 'bg-white dark:bg-slate-900' };
}

export function getDayPercentage(date: Date, dailyData: Record<string, string[]>, dailyTasks: string[]) {
  const dateKey = format(date, 'yyyy-MM-dd');
  const completed = dailyData[dateKey]?.length || 0;
  return Math.round((completed / dailyTasks.length) * 100) || 0;
}

export const TRACKING_START_DATE = startOfDay(new Date(2026, 3, 26)); // April 26, 2026

export function calculateStreaks(
  dailyData: Record<string, string[]>,
  dailyTasks: string[],
  customShifts: Record<string, string | null> = {}
) {
  const days = eachDayOfInterval({ start: TRACKING_START_DATE, end: startOfDay(new Date()) });
  
  let currentStreak = 0;
  let maxStreak = 0;
  
  // Calculate streaks (every day counts to build routines)
  for (const day of days) {
    const dateKey = format(day, 'yyyy-MM-dd');
    
    if (dailyTasks.length > 0 && dailyData[dateKey]?.length === dailyTasks.length) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }
  
  let activeStreak = 0;
  const reversedDays = [...days].reverse();
  const todayDateKey = format(startOfDay(new Date()), 'yyyy-MM-dd');

  for (let i = 0; i < reversedDays.length; i++) {
    const day = reversedDays[i];
    const dateKey = format(day, 'yyyy-MM-dd');

    const isComplete = dailyTasks.length > 0 && dailyData[dateKey]?.length === dailyTasks.length;
    
    if (isComplete) {
      activeStreak++;
    } else {
      // If it's today and it's incomplete, we don't break the streak yet.
      if (dateKey === todayDateKey) {
        continue;
      }
      break; // Streak broken
    }
  }
  
  return { currentStreak: activeStreak, maxStreak: Math.max(maxStreak, activeStreak) };
}

export function calculateIntervalStats(
  startDate: Date,
  endDate: Date,
  dailyData: Record<string, string[]>,
  weeklyData: Record<string, string[]>,
  dailyTasks: string[],
  weeklyTasks: string[],
  customShifts: Record<string, string | null> = {}
) {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const today = startOfDay(new Date());
  
  let totalDailyCompleted = 0;
  let totalDailyPossible = 0;

  // Only consider days that have occurred (up to "today") and are on or after tracking start date
  const validDays = days.filter(day => {
    const dayStart = startOfDay(day);
    return !isBefore(today, dayStart) && !isBefore(dayStart, TRACKING_START_DATE);
  });

  validDays.forEach((day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    
    // Include every day regardless of shift
    totalDailyCompleted += dailyData[dateKey]?.length || 0;
    totalDailyPossible += dailyTasks.length;
  });

  let totalWeeklyCompleted = 0;
  let totalWeeklyPossible = 0;

  // Track unique weeks in this interval for weekly tasks
  const uniqueWeeks = new Map<string, Date>();
  days.forEach(day => {
    const dayStart = startOfDay(day);
    // Only include weeks that overlap with our tracking
    if (!isBefore(dayStart, TRACKING_START_DATE)) {
      const ws = getWeekStart(day);
      uniqueWeeks.set(format(ws, 'yyyy-MM-dd'), ws);
    }
  });

  uniqueWeeks.forEach((weekStart, weekKey) => {
    const completedInWeek = weeklyData[weekKey]?.length || 0;
    totalWeeklyCompleted += completedInWeek;
    
    // Only count weekly tasks as possible if the week has started
    if (!isBefore(today, startOfDay(weekStart))) {
      totalWeeklyPossible += weeklyTasks.length;
    }
  });

  const totalCompleted = totalDailyCompleted + totalWeeklyCompleted;
  const totalPossible = totalDailyPossible + totalWeeklyPossible;

  const percentage = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);
  const dailyPercentage = totalDailyPossible === 0 ? 0 : Math.round((totalDailyCompleted / totalDailyPossible) * 100);
  const weeklyPercentage = totalWeeklyPossible === 0 ? 0 : Math.round((totalWeeklyCompleted / totalWeeklyPossible) * 100);

  return {
    percentage,
    completed: totalCompleted,
    possible: totalPossible,
    dailyPercentage,
    dailyCompleted: totalDailyCompleted,
    dailyPossible: totalDailyPossible,
    dailyColor: getRating(dailyPercentage).color,
    weeklyPercentage,
    weeklyCompleted: totalWeeklyCompleted,
    weeklyPossible: totalWeeklyPossible,
    weeklyColor: getRating(weeklyPercentage).color,
    ...getRating(percentage)
  };
}
