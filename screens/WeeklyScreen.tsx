
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserConfig, ShiftType } from '../types';
import { SHIFT_DETAILS } from '../constants';
import BottomNav from '../components/BottomNav';
import { getShiftForDate } from '../utils';

interface WeeklyScreenProps {
  config: UserConfig;
  onUpdate: (config: UserConfig) => void;
}

const WeeklyScreen: React.FC<WeeklyScreenProps> = ({ config, onUpdate }) => {
  const navigate = useNavigate();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const handleShiftForDate = (date: Date) => getShiftForDate(date, config);

  const weekDays = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const baseMonday = new Date(now.setDate(diffToMonday));
    baseMonday.setHours(0, 0, 0, 0);
    
    const targetMonday = new Date(baseMonday);
    targetMonday.setDate(baseMonday.getDate() + (currentWeekOffset * 7));
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(targetMonday);
      nextDay.setDate(targetMonday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, [currentWeekOffset]);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <div className="flex-1 flex flex-col max-w-lg mx-auto bg-white dark:bg-background-dark shadow-2xl overflow-x-hidden min-h-screen pb-24">
        <header className="sticky top-0 z-20 flex items-center justify-between bg-white/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-4 border-b border-gray-200 dark:border-gray-800 animate-fade-up">
        <button 
          onClick={() => setCurrentWeekOffset(prev => prev - 1)}
          className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#233648] transition-all active:scale-75 text-slate-600 dark:text-slate-200"
        >
          <span className="material-symbols-outlined text-2xl">chevron_left</span>
        </button>
        <div className="flex flex-col items-center animate-pop">
          <h2 className="text-base font-bold leading-tight tracking-tight">
            {currentWeekOffset === 0 ? 'Esta Semana' : currentWeekOffset === 1 ? 'Próxima Semana' : currentWeekOffset === -1 ? 'Semana Pasada' : `Semana ${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset}`}
          </h2>
          <span className="text-xs font-medium text-slate-500 dark:text-[#92adc9]">
            {weekDays[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#233648] transition-all active:scale-75 text-slate-600 dark:text-slate-200"
          >
            <span className="material-symbols-outlined text-2xl">chevron_right</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 p-4 pb-24 overflow-y-auto">
        {weekDays.map((day, idx) => {
          const shiftInfo = handleShiftForDate(day);
          const shiftType = shiftInfo.type;
          const details = shiftInfo.defaultDetails;
          const timeDetails = shiftInfo.time;
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <details 
              key={idx} 
              className={`group rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm border ${isToday ? 'border-primary ring-1 ring-primary/20' : 'border-gray-200 dark:border-[#233648]'} overflow-hidden transition-all duration-500 animate-slide-left stagger-${idx + 1}`}
              open={isToday}
            >
              <summary className={`flex cursor-pointer items-center justify-between p-4 bg-transparent hover:bg-gray-50 dark:hover:bg-[#233648]/50 transition-colors select-none ${isToday ? 'bg-primary/5' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-10">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isToday ? 'text-primary' : 'text-slate-500 dark:text-[#92adc9]'}`}>
                      {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </span>
                    <span className={`text-xl font-bold ${isToday ? 'text-primary' : 'text-slate-800 dark:text-white'} transition-transform group-hover:scale-110`}>
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="h-8 w-[2px] bg-gray-200 dark:bg-[#233648] rounded-full"></div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${details.bg} ${details.color} border ${details.border}/20`}>
                        {details.label}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{timeDetails}</span>
                    </div>
                    {shiftType !== ShiftType.OFF ? (
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mt-1">Turno programado</p>
                    ) : (
                      <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1 italic">Día libre</p>
                    )}
                  </div>
                </div>
                <span className={`material-symbols-outlined transition-transform duration-500 group-open:rotate-180 ${isToday ? 'text-primary' : 'text-slate-400'}`}>expand_more</span>
              </summary>
              <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-[#233648]/50 animate-fade-up">
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-lg mt-0.5">sticky_note_2</span>
                    <div className="flex flex-col">
                      <p className="text-sm text-slate-600 dark:text-[#92adc9] leading-relaxed">
                        {shiftType === ShiftType.OFF ? "Día de recuperación. Aprovecha para descansar al máximo." : `Preparado para el turno de ${details.label.toLowerCase()}. Revisa tu equipo.`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </main>

      </div>
    </div>
  );
};

export default WeeklyScreen;
