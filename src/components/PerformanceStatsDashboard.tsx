import React from 'react';
import { startOfDay, format, startOfMonth, endOfMonth } from 'date-fns';
import { 
  calculateIntervalStats, 
  calculateStreaks, 
  TRACKING_START_DATE 
} from '../lib/taskEngine';
import { ProgressRing } from './ProgressRing';
import { Trophy, TrendingUp, Calendar, Target, Activity, Award, Flame, Star, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface PerformanceStatsDashboardProps {
  dailyTasks: string[];
  weeklyTasks: string[];
  dailyCompletions: Record<string, string[]>;
  weeklyCompletions: Record<string, string[]>;
  customShifts?: Record<string, string | null>;
}

export function PerformanceStatsDashboard({
  dailyTasks,
  weeklyTasks,
  dailyCompletions,
  weeklyCompletions,
  customShifts = {}
}: PerformanceStatsDashboardProps) {
  const today = startOfDay(new Date());
  
  // All-time stats
  const allTimeStats = calculateIntervalStats(
    TRACKING_START_DATE,
    today,
    dailyCompletions,
    weeklyCompletions,
    dailyTasks,
    weeklyTasks,
    customShifts
  );

  // Month stats
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const monthStats = calculateIntervalStats(
    monthStart,
    monthEnd,
    dailyCompletions,
    weeklyCompletions,
    dailyTasks,
    weeklyTasks,
    customShifts
  );

  // Streaks
  const { currentStreak, maxStreak } = calculateStreaks(dailyCompletions, dailyTasks, customShifts);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-6 md:mb-8 transition-colors duration-300">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight uppercase">
          <Activity className="w-5 h-5 text-indigo-500" />
          Overall Performance
        </h2>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          Since {format(TRACKING_START_DATE, 'MMM dd, yyyy')}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Score Area */}
          <div className="md:col-span-1 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50 flex flex-col items-center text-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
              <Trophy className="w-48 h-48 text-indigo-600 dark:text-indigo-400" strokeWidth={1} />
            </div>
            
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-1 relative z-10">
              <Award className="w-4 h-4" /> Lifetime Grade
            </span>
            
            <div className="relative inline-flex items-center justify-center z-10 mb-2">
              <ProgressRing percentage={allTimeStats.percentage} size={140} strokeWidth={8} showText={false} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-6xl font-black leading-none", allTimeStats.color)}>
                  {allTimeStats.letter}
                </span>
              </div>
            </div>
            
            <div className="z-10 mt-2">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                {allTimeStats.percentage}%
              </span>
              <p className="text-sm font-bold text-slate-500 mt-1">Total Completion Rate</p>
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-center transition-all hover:border-emerald-200 dark:hover:border-emerald-800/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Tasks Found
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {allTimeStats.completed}
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-0.5">
                of {allTimeStats.possible} possible
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-center transition-all hover:border-orange-200 dark:hover:border-orange-800/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                Current Streak
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-baseline gap-1">
                {currentStreak} <span className="text-sm text-slate-400">days</span>
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-0.5">
                Max: {maxStreak} days
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-center transition-all hover:border-blue-200 dark:hover:border-blue-800/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-500" />
                Daily Avg
              </span>
              <span className={cn("text-2xl font-black tracking-tight", allTimeStats.dailyColor)}>
                {allTimeStats.dailyPercentage}%
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-0.5">
                {allTimeStats.dailyCompleted} / {allTimeStats.dailyPossible}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-center transition-all hover:border-purple-200 dark:hover:border-purple-800/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-purple-500" />
                Weekly Rate
              </span>
              <span className={cn("text-2xl font-black tracking-tight", allTimeStats.weeklyColor)}>
                {allTimeStats.weeklyPercentage}%
              </span>
              <span className="text-xs font-semibold text-slate-400 mt-0.5">
                {allTimeStats.weeklyCompleted} / {allTimeStats.weeklyPossible}
              </span>
            </div>

            {/* This Month Mini Stats */}
            <div className="col-span-2 lg:col-span-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-4 md:p-5 border border-emerald-100 dark:border-emerald-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  This Month's Pace
                </span>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  You have completed <strong className="text-slate-800 dark:text-slate-200">{monthStats.completed}</strong> tasks so far in {format(today, 'MMMM')}.
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex flex-col items-end">
                  <span className={cn("text-xl font-black leading-none", monthStats.color)}>{monthStats.letter}</span>
                </div>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
                <div className="flex items-center gap-2">
                   <ProgressRing percentage={monthStats.percentage} size={32} strokeWidth={4} showText={false} />
                   <span className="text-lg font-black text-slate-800 dark:text-slate-200">{monthStats.percentage}%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
