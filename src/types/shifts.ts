export enum ShiftType {
  MORNING = '7am - 5pm',
  AFTERNOON = '12pm - 10pm',
  MID_DAY = '9am - 7pm',
  EARLY = '4am - 2pm',
}

export const SHIFT_LABELS: Record<ShiftType, string> = {
  [ShiftType.EARLY]: 'Early Block',
  [ShiftType.MORNING]: 'Morning Block',
  [ShiftType.MID_DAY]: 'Mid-Day Block',
  [ShiftType.AFTERNOON]: 'Afternoon Block',
};

export const SHIFT_FORMATTED_TIMES: Record<ShiftType, string> = {
  [ShiftType.EARLY]: '4:00 AM - 2:00 PM',
  [ShiftType.MORNING]: '7:00 AM - 5:00 PM',
  [ShiftType.MID_DAY]: '9:00 AM - 7:00 PM',
  [ShiftType.AFTERNOON]: '12:00 PM - 10:00 PM',
};

export const SHIFT_STYLES: Record<string, string> = {
  [ShiftType.MORNING]: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/60',
  [ShiftType.AFTERNOON]: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800/60',
  [ShiftType.MID_DAY]: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800/60',
  [ShiftType.EARLY]: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800/60',
};
