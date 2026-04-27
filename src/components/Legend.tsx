import React from 'react';
import { ShiftType, SHIFT_LABELS, SHIFT_FORMATTED_TIMES } from '../types/shifts';

const LEGEND_COLORS: Record<string, { bg: string, border: string }> = {
  [ShiftType.MORNING]: { bg: 'bg-blue-100 dark:bg-blue-900/60', border: 'border-blue-200 dark:border-blue-800' },
  [ShiftType.AFTERNOON]: { bg: 'bg-purple-100 dark:bg-purple-900/60', border: 'border-purple-200 dark:border-purple-800' },
  [ShiftType.MID_DAY]: { bg: 'bg-indigo-100 dark:bg-indigo-900/60', border: 'border-indigo-200 dark:border-indigo-800' },
  [ShiftType.EARLY]: { bg: 'bg-emerald-100 dark:bg-emerald-900/60', border: 'border-emerald-200 dark:border-emerald-800' },
};

export function Legend() {
  return (
    <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-4 md:p-6 flex flex-wrap items-center justify-start xl:justify-between gap-6 md:gap-12 w-full shadow-sm">
      <div className="flex flex-wrap items-center gap-6 md:gap-12">
        {Object.values(ShiftType).map((shiftType) => (
          <div key={shiftType} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded shrink-0 ${LEGEND_COLORS[shiftType]?.bg} ${LEGEND_COLORS[shiftType]?.border} border`}></div>
            <div>
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight mb-0.5">{SHIFT_LABELS[shiftType]}</span>
              <span className="text-xs md:text-sm font-mono font-black text-slate-800 dark:text-slate-200 leading-tight">{SHIFT_FORMATTED_TIMES[shiftType]}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-slate-50 dark:bg-slate-800/80 border border-dashed border-slate-300 dark:border-slate-700 rounded shrink-0"></div>
        <div>
          <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight mb-0.5">Off Duty</span>
          <span className="text-xs md:text-sm font-mono font-black text-slate-400 dark:text-slate-500 leading-tight">NO SHIFT</span>
        </div>
      </div>
    </div>
  );
}
