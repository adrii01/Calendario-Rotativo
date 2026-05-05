
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserConfig, ShiftType, UserInfo } from '../types';
import { SHIFT_DETAILS } from '../constants';
import BottomNav from '../components/BottomNav';
import { getShiftForDate, calculateShiftProgress, calculateWeeklyHours } from '../utils';

import { requestNotificationPermission, checkAndNotify } from '../services/notifications';

interface DashboardScreenProps {
  config: UserConfig;
  user: UserInfo;
  onUpdate: (config: UserConfig) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ config, user, onUpdate }) => {
  const navigate = useNavigate();
  const [now, setNow] = React.useState(new Date());

  const handleShiftForDate = (date: Date) => getShiftForDate(date, config);

  React.useEffect(() => {
    requestNotificationPermission();
    
    // Check purely on mount
    checkAndNotify(config);

    // And check periodically every minute
    const intervalId = setInterval(() => {
      setNow(new Date());
      checkAndNotify(config);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [config]);

  const todayShift = handleShiftForDate(now);
  const tomorrowShift = handleShiftForDate(new Date(now.getTime() + 86400000));
  
  const todayType = todayShift.type;
  const tomorrowType = tomorrowShift.type;
  const todayDetails = todayShift.defaultDetails;
  const tomorrowDetails = tomorrowShift.defaultDetails;
  const todayTime = todayShift.time;
  const tomorrowTime = tomorrowShift.time;

  const progress = calculateShiftProgress(todayTime, now);
  const weeklyHours = calculateWeeklyHours(config, now);
  const totalCycleDays = config.rotation.length * 7;
  const dayInCycle = (() => {
    const start = new Date(config.startDate);
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const dateMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = dateMidnight.getTime() - startMidnight.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 0;
    return (diffDays % totalCycleDays) + 1;
  })();

  const formatHours = (hours: number) => {
    return Number.isInteger(hours) ? hours.toString() : hours.toFixed(1).replace('.', ',');
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-[88px] shadow-2xl bg-white dark:bg-background-dark min-h-screen">
        <header className="flex items-center justify-between px-6 pt-8 pb-4 sticky top-0 z-40 bg-white/95 dark:bg-background-dark/95 backdrop-blur-sm animate-fade-up">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Hola, {user.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/profile')}
            className="relative group transition-transform hover:scale-110 active:scale-90"
          >
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 ring-2 ring-primary/20 shadow-glow" style={{backgroundImage: `url("${user.avatarUrl}")`}}></div>
            <div className="absolute -top-1 -right-1 size-3 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark animate-pulse"></div>
          </button>
        </div>
      </header>

      <section className="px-4 mt-2 mb-6 animate-fade-up stagger-1">
        <div className="flex items-center justify-between mb-3 px-2">
          <h2 className="text-lg font-bold tracking-tight">Turno Actual</h2>
          <span className="text-xs font-semibold px-2 py-1 rounded bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">En curso</span>
        </div>
        <div className="relative overflow-hidden rounded-2xl shadow-lg group cursor-pointer hover:shadow-hover-glow transition-all duration-300">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80")'}}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"></div>
          <div className="relative z-10 p-6 flex flex-col h-[200px] justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`material-symbols-outlined ${todayDetails.color} filled text-[20px] animate-pop`}>{todayDetails.icon}</span>
                  <span className={`${todayDetails.color} font-bold uppercase tracking-wider text-xs`}>{todayDetails.label}</span>
                </div>
                <h3 className="text-white text-3xl font-bold tracking-tight group-hover:translate-x-1 transition-transform">{todayType !== ShiftType.OFF ? todayTime : 'Día libre'}</h3>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/month'); }}
                className="bg-white/10 hover:bg-white/30 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 text-white"
              >
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
            <div className="w-full">
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-200 text-sm font-medium">Progreso del turno</span>
                <span className="text-white text-sm font-bold">{progress}%</span>
              </div>
              <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className={`h-full bg-gradient-to-r from-primary to-blue-300 rounded-full transition-all duration-1000 ease-out`} 
                  style={{width: `${progress}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 mb-6 animate-fade-up stagger-2">
        <h2 className="text-lg font-bold tracking-tight mb-3 px-2">Próximo Turno</h2>
        <div 
          onClick={() => navigate('/month')}
          className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:border-primary/40 hover:translate-y-[-2px] active:scale-[0.98] transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className={`size-12 rounded-full ${tomorrowDetails.bg} flex items-center justify-center ${tomorrowDetails.color} group-hover:scale-110 transition-transform`}>
              <span className="material-symbols-outlined group-hover:animate-bounce">{tomorrowDetails.icon}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Mañana, {new Date(now.getTime() + 86400000).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Turno {tomorrowDetails.label}</h4>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{tomorrowType !== ShiftType.OFF ? tomorrowTime : 'Día libre'}</span>
            </div>
          </div>
          <div className="flex items-center">
            <button className="size-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 mb-6 animate-fade-up stagger-3">
        <h2 className="text-lg font-bold tracking-tight mb-3 px-2">Estadísticas Rápidas</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-glow transition-all">
             <div className="flex items-center gap-3 mb-2">
               <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
                 <span className="material-symbols-outlined text-sm">event_repeat</span>
               </div>
               <span className="text-xs font-bold text-slate-400 uppercase">Ciclo</span>
             </div>
             <p className="text-xl font-bold dark:text-white">Día {dayInCycle} / {totalCycleDays}</p>
          </div>
          <div className="bg-white dark:bg-card-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-glow transition-all">
             <div className="flex items-center gap-3 mb-2">
               <div className="size-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-500 flex items-center justify-center">
                 <span className="material-symbols-outlined text-sm">timer</span>
               </div>
               <span className="text-xs font-bold text-slate-400 uppercase">Horas Sem.</span>
             </div>
             <p className="text-xl font-bold dark:text-white">{formatHours(weeklyHours)}h Est.</p>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default DashboardScreen;
