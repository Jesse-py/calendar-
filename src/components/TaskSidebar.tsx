import React from 'react';
import { startOfDay, startOfMonth, startOfQuarter, endOfMonth, endOfQuarter, format, isBefore, isSameDay } from 'date-fns';
import { 
  getWeekStart, 
  isTaskLocked, 
  calculateIntervalStats, 
  getDayPercentage,
  calculateStreaks
} from '../lib/taskEngine';
import { ProgressRing } from './ProgressRing';
import { CheckCircle2, Circle, Lock, TrendingUp, Calendar as CalIcon, BarChart3, AlertCircle, Plus, Trash2, Flame } from 'lucide-react';
import { cn } from '../lib/utils';
import { endOfWeek } from 'date-fns';

interface TaskSidebarProps {
  currentDate: Date; // The anchor date (could be today or a selected day)
  dailyTasks: string[];
  weeklyTasks: string[];
  dailyCompletions: Record<string, string[]>;
  weeklyCompletions: Record<string, string[]>;
  onToggleDaily: (date: Date, task: string) => void;
  onToggleWeekly: (date: Date, task: string) => void;
  onAddDailyTask: (task: string) => void;
  onRemoveDailyTask: (task: string) => void;
  onAddWeeklyTask: (task: string) => void;
  onRemoveWeeklyTask: (task: string) => void;
  customShifts?: Record<string, string | null>;
}

export function TaskSidebar({
  currentDate,
  dailyTasks,
  weeklyTasks,
  dailyCompletions,
  weeklyCompletions,
  onToggleDaily,
  onToggleWeekly,
  onAddDailyTask,
  onRemoveDailyTask,
  onAddWeeklyTask,
  onRemoveWeeklyTask,
  customShifts = {}
}: TaskSidebarProps) {
  const [newDailyTask, setNewDailyTask] = React.useState('');
  const [newWeeklyTask, setNewWeeklyTask] = React.useState('');

  const selectedDayStart = startOfDay(currentDate);
  const selectedDateKey = format(selectedDayStart, 'yyyy-MM-dd');
  const locked = isTaskLocked(selectedDayStart);
  
  // Daily logic
  const dayCompletedTasks = dailyCompletions[selectedDateKey] || [];
  const dayPercentage = getDayPercentage(selectedDayStart, dailyCompletions, dailyTasks);
  
  // Weekly logic
  const weekStart = getWeekStart(selectedDayStart);
  const weekEnd = endOfWeek(selectedDayStart, { weekStartsOn: 6 });
  const weekKey = format(weekStart, 'yyyy-MM-dd');
  const weekCompletedTasks = weeklyCompletions[weekKey] || [];
  const weekLocked = isBefore(weekEnd, startOfDay(new Date()));

  // Calculate generic intervals
  const todayStart = startOfDay(new Date());

  // Week stats
  const weekStats = calculateIntervalStats(weekStart, weekEnd, dailyCompletions, weeklyCompletions, dailyTasks, weeklyTasks, customShifts);
  
  // Month stats
  const mStart = startOfMonth(selectedDayStart);
  const mEnd = endOfMonth(selectedDayStart);
  const monthStats = calculateIntervalStats(mStart, mEnd, dailyCompletions, weeklyCompletions, dailyTasks, weeklyTasks, customShifts);

  // Quarter stats
  const qStart = startOfQuarter(selectedDayStart);
  const qEnd = endOfQuarter(selectedDayStart);
  const quarterStats = calculateIntervalStats(qStart, qEnd, dailyCompletions, weeklyCompletions, dailyTasks, weeklyTasks, customShifts);

  // Streaks
  const { currentStreak, maxStreak } = calculateStreaks(dailyCompletions, dailyTasks, customShifts);

  return (
    <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full rounded-xl lg:rounded-none shadow-sm lg:shadow-none overflow-y-auto">
      <div className="p-5 md:p-6 pb-2 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Performance
          </h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Analytics Engine</p>
        </div>
        
        {currentStreak > 0 && (
          <div className="flex flex-col items-center justify-center bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 px-3 py-1.5 rounded-lg border border-orange-200 dark:border-orange-500/20 shadow-sm transition-all hover:scale-105" title={`Max streak: ${maxStreak} days`}>
            <div className="flex items-center gap-1">
              <Flame className={cn("w-4 h-4", currentStreak >= 3 && "fill-orange-500 animate-pulse")} />
              <span className="font-black text-lg leading-none">{currentStreak}</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5">Day Streak</span>
          </div>
        )}
      </div>

      <div className="p-5 md:p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-2 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2 py-4 md:p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-between text-center min-h-[110px]">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 leading-tight max-w-[60px]">Daily Avg</span>
            <ProgressRing percentage={weekStats.dailyPercentage} size={40} strokeWidth={4} showText={false} />
            <div className={cn("mt-2 text-base font-black", weekStats.dailyColor)}>{weekStats.dailyPercentage}%</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2 py-4 md:p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-between text-center min-h-[110px]">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 leading-tight max-w-[60px]">Week Goals</span>
            <ProgressRing percentage={weekStats.weeklyPercentage} size={40} strokeWidth={4} showText={false} />
            <div className={cn("mt-2 text-base font-black", weekStats.weeklyColor)}>{weekStats.weeklyPercentage}%</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2 py-4 md:p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-between text-center min-h-[110px]">
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 leading-tight max-w-[60px]">Combined Total</span>
            <ProgressRing percentage={weekStats.percentage} size={40} strokeWidth={4} showText={false} />
            <div className={cn("mt-2 text-base font-black", weekStats.color)}>{weekStats.percentage}%</div>
          </div>
        </div>

        {/* QTD Stats */}
        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest mb-1">
              <TrendingUp className="w-3 h-3" /> QTD Rating
            </span>
            <div className="flex items-baseline gap-2">
              <span className={cn("text-2xl font-black", quarterStats.color)}>{quarterStats.letter}</span>
              <span className="text-sm font-bold text-slate-500">[{quarterStats.percentage}%]</span>
            </div>
          </div>
          <ProgressRing percentage={quarterStats.percentage} size={40} className="opacity-80" />
        </div>

        {/* Task Lists */}
        <div>
          <div className="flex items-center justify-between mb-3 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
              <CalIcon className="w-4 h-4 text-emerald-500" />
              Daily Actions
            </h3>
            {locked && (
              <span className="bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {dailyTasks.map(task => {
              const isChecked = dayCompletedTasks.includes(task);
              return (
                <div key={task} className="flex gap-2 items-center">
                  <button
                    disabled={locked}
                    onClick={() => onToggleDaily(selectedDayStart, task)}
                    className={cn(
                      "flex-1 flex items-center justify-between p-3 rounded-lg border transition-all",
                      locked ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800",
                      isChecked 
                        ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/40" 
                        : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    )}
                  >
                    <span className={cn(
                      "text-xs md:text-sm font-bold",
                      isChecked ? "text-emerald-700 dark:text-emerald-400 line-through opacity-80" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {task}
                    </span>
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>
                  <button 
                    onClick={() => onRemoveDailyTask(task)}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (newDailyTask.trim() && !dailyTasks.includes(newDailyTask.trim())) {
                  onAddDailyTask(newDailyTask.trim());
                  setNewDailyTask('');
                }
              }}
              className="flex gap-2 items-center mt-2"
            >
              <input
                type="text"
                value={newDailyTask}
                onChange={e => setNewDailyTask(e.target.value)}
                placeholder="Add daily task..."
                className="flex-1 text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 dark:text-slate-200 dark:placeholder-slate-500"
              />
              <button 
                type="submit"
                disabled={!newDailyTask.trim()}
                className="p-2 bg-emerald-100 text-emerald-700 disabled:opacity-50 dark:bg-emerald-900/60 dark:text-emerald-400 rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              Weekly Goals
            </h3>
            {weekLocked && (
              <span className="bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-widest">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
          
          <div className="space-y-2 pb-6">
            {weeklyTasks.map(task => {
              const isChecked = weekCompletedTasks.includes(task);
              return (
                <div key={`weekly-${task}`} className="flex gap-2 items-center">
                  <button
                    disabled={weekLocked}
                    onClick={() => onToggleWeekly(selectedDayStart, task)}
                    className={cn(
                      "flex-1 flex items-center justify-between p-3 rounded-lg border transition-all",
                      weekLocked ? "opacity-70 cursor-not-allowed" : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800",
                      isChecked 
                        ? "bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800/40" 
                        : "bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800"
                    )}
                  >
                    <span className={cn(
                      "text-xs md:text-sm font-bold",
                      isChecked ? "text-blue-700 dark:text-blue-400 line-through opacity-80" : "text-slate-700 dark:text-slate-300"
                    )}>
                      {task}
                    </span>
                    {isChecked ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>
                  <button 
                    onClick={() => onRemoveWeeklyTask(task)}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (newWeeklyTask.trim() && !weeklyTasks.includes(newWeeklyTask.trim())) {
                  onAddWeeklyTask(newWeeklyTask.trim());
                  setNewWeeklyTask('');
                }
              }}
              className="flex gap-2 items-center mt-2"
            >
              <input
                type="text"
                value={newWeeklyTask}
                onChange={e => setNewWeeklyTask(e.target.value)}
                placeholder="Add weekly task..."
                className="flex-1 text-sm bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-200 dark:placeholder-slate-500"
              />
              <button 
                type="submit"
                disabled={!newWeeklyTask.trim()}
                className="p-2 bg-blue-100 text-blue-700 disabled:opacity-50 dark:bg-blue-900/60 dark:text-blue-400 rounded-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
