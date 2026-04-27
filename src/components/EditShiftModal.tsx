import React from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { ShiftType } from '../types/shifts';

interface EditShiftModalProps {
  selectedDate: Date;
  setSelectedDate: (date: Date | null) => void;
  handleShiftChange: (shift: string | null) => void;
  handleResetShift: () => void;
}

export function EditShiftModal({
  selectedDate,
  setSelectedDate,
  handleShiftChange,
  handleResetShift,
}: EditShiftModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Edit Shift</h3>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{format(selectedDate, 'EEEE, MMMM do yyyy')}</p>
          </div>
          <button 
            onClick={() => setSelectedDate(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-3">
          <button 
            onClick={() => handleShiftChange(ShiftType.EARLY)}
            className="w-full flex flex-col items-start px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 transition-all text-left"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Early Block (Fresh Cost Inv.)</span>
            <span className="font-mono font-black text-sm">4:00 AM - 2:00 PM</span>
          </button>
          
          <button 
            onClick={() => handleShiftChange(ShiftType.MORNING)}
            className="w-full flex flex-col items-start px-4 py-3 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-800 dark:text-blue-300 transition-all text-left"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Morning Block</span>
            <span className="font-mono font-black text-sm">7:00 AM - 5:00 PM</span>
          </button>
          
          <button 
            onClick={() => handleShiftChange(ShiftType.MID_DAY)}
            className="w-full flex flex-col items-start px-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 transition-all text-left"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Mid-Day Block</span>
            <span className="font-mono font-black text-sm">9:00 AM - 7:00 PM</span>
          </button>

          <button 
            onClick={() => handleShiftChange(ShiftType.AFTERNOON)}
            className="w-full flex flex-col items-start px-4 py-3 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-800 dark:text-purple-300 transition-all text-left"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Afternoon Block</span>
            <span className="font-mono font-black text-sm">12:00 PM - 10:00 PM</span>
          </button>

          <button 
            onClick={() => handleShiftChange(null)}
            className="w-full flex flex-col items-start px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all text-left"
          >
            <span className="font-bold text-sm uppercase tracking-widest">Off Duty / Remove Shift</span>
          </button>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={handleResetShift}
              className="w-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-amber-500 transition-colors"
            >
              Reset to Rotation Pattern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
