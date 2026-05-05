
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserConfig, ShiftType, RotationWeek } from '../types';
import { SHIFT_DETAILS } from '../constants';
import BottomNav from '../components/BottomNav';

interface ConfigScreenProps {
  config: UserConfig;
  onUpdate: (config: UserConfig) => void;
}

const ConfigScreen: React.FC<ConfigScreenProps> = ({ config, onUpdate }) => {
  const navigate = useNavigate();

  const addWeek = () => {
    const newWeek: RotationWeek = {
      id: Math.random().toString(36).substr(2, 9),
      shiftType: ShiftType.MORNING
    };
    onUpdate({ ...config, rotation: [...config.rotation, newWeek] });
  };

  const removeWeek = (id: string) => {
    onUpdate({ ...config, rotation: config.rotation.filter(w => w.id !== id) });
  };

  const updateWeekShift = (id: string, shift: ShiftType) => {
    onUpdate({
      ...config,
      rotation: config.rotation.map(w => w.id === id ? { ...w, shiftType: shift, customTime: SHIFT_DETAILS[shift]?.time || '' } : w)
    });
  };

  const updateWeekTime = (id: string, time: string) => {
    onUpdate({
      ...config,
      rotation: config.rotation.map(w => w.id === id ? { ...w, customTime: time } : w)
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...config, startDate: e.target.value });
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-[88px] shadow-2xl bg-white dark:bg-background-dark min-h-screen">
        <div className="flex items-center bg-white/95 dark:bg-background-dark/95 p-4 pb-2 justify-between sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 animate-fade-up backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="text-[#111418] dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-90 transition-all">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Mi Rotación</h2>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="text-primary font-bold px-4 py-2 rounded-lg hover:bg-primary/10 active:scale-90 transition-all"
        >
          Listo
        </button>
      </div>

      <div className="flex flex-col px-4 pt-6 pb-2 animate-fade-up stagger-1">
        <h1 className="text-[#111418] dark:text-white tracking-light text-[28px] font-bold leading-tight text-left">Define tu Rotación</h1>
        <p className="text-[#637588] dark:text-[#9eaec0] text-base font-normal leading-normal pt-2">
          Elige cuándo inicia tu ciclo y el orden de los turnos.
        </p>
      </div>

      <div className="flex flex-col mt-4 animate-fade-up stagger-2">
        <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-3">Fecha de Inicio</h3>
        <div className="px-4">
          <div className="bg-white dark:bg-surface-dark rounded-xl p-4 flex items-center justify-between border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 text-primary flex items-center justify-center size-10 rounded-full animate-pop">
                <span className="material-symbols-outlined text-[22px]">calendar_today</span>
              </div>
              <input 
                type="date" 
                value={config.startDate}
                onChange={handleDateChange}
                className="bg-transparent border-none focus:ring-0 text-[#111418] dark:text-white text-lg font-semibold cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col mt-8 animate-fade-up stagger-3">
        <div className="flex items-center justify-between px-4 pb-3">
          <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Orden de Turnos</h3>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full animate-pop">
            {config.rotation.length} Semanas
          </span>
        </div>
        <div className="flex flex-col gap-4 px-4">
          {config.rotation.map((week, index) => (
            <div 
              key={week.id} 
              className={`relative flex flex-col gap-3 bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-glow transition-all animate-slide-right stagger-${(index % 4) + 1}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#637588] dark:text-[#506070]">drag_indicator</span>
                  <span className="text-[#111418] dark:text-white text-base font-bold">Semana {index + 1}</span>
                </div>
                <button 
                  onClick={() => removeWeek(week.id)}
                  disabled={config.rotation.length <= 1}
                  className="text-[#637588] dark:text-[#9eaec0] hover:text-red-500 transition-colors disabled:opacity-30 p-2 active:scale-75"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(SHIFT_DETAILS) as ShiftType[]).map((st) => {
                  const details = SHIFT_DETAILS[st];
                  const isActive = week.shiftType === st;
                  return (
                    <button 
                      key={st}
                      onClick={() => updateWeekShift(week.id, st)}
                      className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl transition-all active:scale-90 ${isActive ? `border-2 ${details.border} ${details.bg} shadow-sm` : 'border border-gray-200 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 opacity-60 hover:opacity-100'}`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${details.color} ${isActive ? 'filled' : ''}`}>{details.icon}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? details.color : 'text-[#637588] dark:text-[#9eaec0]'}`}>{details.label}</span>
                    </button>
                  );
                })}
              </div>
              {week.shiftType !== ShiftType.OFF && (
                <div className="mt-2 flex flex-col gap-1.5 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Horario (Semana {index + 1})</label>
                  <input 
                    type="text" 
                    value={week.customTime || SHIFT_DETAILS[week.shiftType].time}
                    onChange={(e) => updateWeekTime(week.id, e.target.value)}
                    maxLength={30}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white font-medium"
                    placeholder="Ej: 06:00 - 14:00"
                  />
                </div>
              )}
            </div>
          ))}
          <button onClick={addWeek} className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-[#637588] dark:text-[#9eaec0] hover:border-primary hover:text-primary transition-all group bg-transparent active:scale-[0.98]">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
            <span className="font-semibold">Agregar semana</span>
          </button>
        </div>
      </div>

      </div>
    </div>
  );
};

export default ConfigScreen;
