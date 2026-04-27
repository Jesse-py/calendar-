import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getWeekStart, DAILY_TASKS as DEFAULT_DAILY_TASKS, WEEKLY_TASKS as DEFAULT_WEEKLY_TASKS } from '../lib/taskEngine';

export function useTaskEngine() {
  const [dailyTasks, setDailyTasks] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shift_daily_tasks_list');
      return saved ? JSON.parse(saved) : DEFAULT_DAILY_TASKS;
    }
    return DEFAULT_DAILY_TASKS;
  });

  const [weeklyTasks, setWeeklyTasks] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shift_weekly_tasks_list');
      return saved ? JSON.parse(saved) : DEFAULT_WEEKLY_TASKS;
    }
    return DEFAULT_WEEKLY_TASKS;
  });

  const [dailyCompletions, setDailyCompletions] = useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shift_daily_tasks');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const [weeklyCompletions, setWeeklyCompletions] = useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shift_weekly_tasks');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shift_daily_tasks_list', JSON.stringify(dailyTasks));
    }
  }, [dailyTasks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shift_weekly_tasks_list', JSON.stringify(weeklyTasks));
    }
  }, [weeklyTasks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shift_daily_tasks', JSON.stringify(dailyCompletions));
    }
  }, [dailyCompletions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shift_weekly_tasks', JSON.stringify(weeklyCompletions));
    }
  }, [weeklyCompletions]);

  const toggleDailyTask = (date: Date, task: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setDailyCompletions((prev) => {
      const dayTasks = prev[dateKey] || [];
      const isCompleted = dayTasks.includes(task);
      return {
        ...prev,
        [dateKey]: isCompleted ? dayTasks.filter((t) => t !== task) : [...dayTasks, task]
      };
    });
  };

  const toggleWeeklyTask = (date: Date, task: string) => {
    const weekKey = format(getWeekStart(date), 'yyyy-MM-dd');
    setWeeklyCompletions((prev) => {
      const weekTasks = prev[weekKey] || [];
      const isCompleted = weekTasks.includes(task);
      return {
        ...prev,
        [weekKey]: isCompleted ? weekTasks.filter((t) => t !== task) : [...weekTasks, task]
      };
    });
  };

  const addDailyTask = (task: string) => {
    setDailyTasks(prev => [...prev, task]);
  };

  const removeDailyTask = (task: string) => {
    setDailyTasks(prev => prev.filter(t => t !== task));
  };

  const addWeeklyTask = (task: string) => {
    setWeeklyTasks(prev => [...prev, task]);
  };

  const removeWeeklyTask = (task: string) => {
    setWeeklyTasks(prev => prev.filter(t => t !== task));
  };

  return {
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
  };
}

