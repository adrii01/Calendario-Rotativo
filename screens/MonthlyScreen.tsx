
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { UserConfig, ShiftType } from '../types';
import { SHIFT_DETAILS, WEEK_DAYS } from '../constants';
import BottomNav from '../components/BottomNav';
import { getShiftForDate } from '../utils';

interface MonthlyScreenProps {
  config: UserConfig;
  onUpdate: (config: UserConfig) => void;
}

const MonthlyScreen: React.FC<MonthlyScreenProps> = ({ config, onUpdate }) => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isChangingMonth, setIsChangingMonth] = useState(false);
  const [isEditingDay, setIsEditingDay] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType>(ShiftType.OFF);

  const handleShiftForDate = (date: Date) => getShiftForDate(date, config);

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Normalize firstDay to 0 = Monday
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentMonth]);

  const shiftCounts = useMemo(() => {
    const counts = { [ShiftType.MORNING]: 0, [ShiftType.AFTERNOON]: 0, [ShiftType.NIGHT]: 0, [ShiftType.OFF]: 0 };
    calendarData.forEach(d => {
      if (d) counts[handleShiftForDate(d).type]++;
    });
    return counts;
  }, [calendarData, config]);

  const changeMonth = (offset: number) => {
    setIsChangingMonth(true);
    setTimeout(() => {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
      setIsChangingMonth(false);
    }, 200);
  };

  const handleSetException = () => {
    const dateStr = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, '0'),
      String(selectedDate.getDate()).padStart(2, '0')
    ].join('-');
    
    const newExceptions = { ...(config.exceptions || {}) };
    
    newExceptions[dateStr] = {
      shiftType: selectedShiftType,
      customTime: customTimeInput
    };
    
    onUpdate({
      ...config,
      exceptions: newExceptions
    });
    setIsEditingDay(false);
  };

  const handleClearException = () => {
    const dateStr = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, '0'),
      String(selectedDate.getDate()).padStart(2, '0')
    ].join('-');
    const newExceptions = { ...(config.exceptions || {}) };
    delete newExceptions[dateStr];
    onUpdate({
      ...config,
      exceptions: newExceptions
    });
    setIsEditingDay(false);
  };

  const currentShiftInfo = handleShiftForDate(selectedDate);
  const currentShiftType = currentShiftInfo.type;
  const currentDetails = currentShiftInfo.defaultDetails;
  const currentTime = currentShiftInfo.time;
  const dateStrSelected = [
    selectedDate.getFullYear(),
    String(selectedDate.getMonth() + 1).padStart(2, '0'),
    String(selectedDate.getDate()).padStart(2, '0')
  ].join('-');
  const hasException = !!(config.exceptions && config.exceptions[dateStrSelected]);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full pb-24 shadow-2xl bg-white dark:bg-background-dark min-h-screen">
        <header className="sticky top-0 z-50 flex items-center justify-between bg-white/95 dark:bg-background-dark/95 backdrop-blur-md px-4 py-3 border-b border-gray-200 dark:border-gray-800 animate-fade-up">
        <button onClick={() => changeMonth(-1)} className="flex size-10 items-center justify-center rounded-full text-slate-600 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all">
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h1 className={`text-lg font-bold leading-tight tracking-tight uppercase transition-all duration-300 ${isChangingMonth ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h1>
        <div className="flex items-center gap-1">
          <button onClick={() => changeMonth(1)} className="flex size-10 items-center justify-center rounded-full text-slate-600 dark:text-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-all">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </header>
      
      <section className="px-4 pt-4 pb-2 animate-fade-up stagger-1">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:scale-105 transition-transform">
            <span className="text-2xl font-bold text-shift-morning tracking-tight animate-pop">{shiftCounts[ShiftType.MORNING]}</span>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Mañanas</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:scale-105 transition-transform">
            <span className="text-2xl font-bold text-shift-afternoon tracking-tight animate-pop stagger-1">{shiftCounts[ShiftType.AFTERNOON]}</span>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tardes</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:scale-105 transition-transform">
            <span className="text-2xl font-bold text-shift-night tracking-tight animate-pop stagger-2">{shiftCounts[ShiftType.NIGHT]}</span>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Noches</span>
          </div>
        </div>
      </section>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className={`flex flex-col p-4 pt-2 transition-all duration-300 ${isChangingMonth ? 'opacity-30 scale-98 blur-[1px]' : 'opacity-100 scale-100'}`}
      >
        <div className="grid grid-cols-7 mb-2 border-b border-gray-100 dark:border-gray-800 pb-2">
          {WEEK_DAYS.map((d, i) => (
            <div key={i} className={`text-center text-[11px] font-bold ${i >= 5 ? 'text-rose-500/80 dark:text-rose-400/80' : 'text-gray-400 dark:text-gray-500'}`}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-4 gap-x-1">
          {calendarData.map((d, i) => {
            if (!d) return <div key={i} className="h-14"></div>;
            const shiftInfo = handleShiftForDate(d);
            const shiftType = shiftInfo.type;
            const isToday = d.toDateString() === new Date().toDateString();
            const isSelected = d.toDateString() === selectedDate.toDateString();
            const details = shiftInfo.defaultDetails;
            
            const localDateStr = [
              d.getFullYear(),
              String(d.getMonth() + 1).padStart(2, '0'),
              String(d.getDate()).padStart(2, '0')
            ].join('-');
            const hasEx = !!(config.exceptions && config.exceptions[localDateStr]);

            return (
              <button 
                key={i} 
                onClick={() => { setSelectedDate(d); setIsEditingDay(false); }}
                className="flex flex-col items-center justify-start h-14 w-full gap-1 group relative outline-none transition-all duration-300 active:scale-75"
              >
                <div className="relative">
                  <span className={`flex size-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-300 ${isSelected ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-background-dark scale-110 shadow-glow' : ''} ${isToday ? 'bg-primary text-white shadow-glow' : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                    {d.getDate()}
                  </span>
                  {hasEx && (
                    <div className="absolute -top-1 -right-1 size-2 bg-yellow-400 rounded-full border border-white dark:border-black"></div>
                  )}
                </div>
                {shiftType !== ShiftType.OFF && (
                  <div className={`h-1.5 w-5 rounded-full ${details.dot} shadow-sm transition-all duration-300 ${isSelected ? 'w-8 h-2' : ''}`}></div>
                )}
              </button>
            );
          })}
        </div>
      </motion.section>

      <section className="px-4 mt-2 animate-fade-up">
        {isEditingDay ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark p-5 shadow-lg dark:shadow-none animate-fade-up">
            <div className="flex items-center justify-between">
              <h3 className="font-bold dark:text-white">Editar turno para {selectedDate.getDate()}/{selectedDate.getMonth()+1}</h3>
              <button onClick={() => setIsEditingDay(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={() => { setSelectedShiftType(ShiftType.MORNING); setCustomTimeInput(SHIFT_DETAILS[ShiftType.MORNING].time); }} className={`p-3 rounded-xl border ${selectedShiftType === ShiftType.MORNING ? 'border-primary ring-2 ring-primary/20 bg-shift-morning/20 dark:bg-shift-morning/20' : 'border-gray-200 dark:border-gray-700 bg-shift-morning/5 dark:bg-shift-morning/5 hover:bg-shift-morning/10'} text-shift-morning font-bold transition-all`}>Mañana</button>
              <button onClick={() => { setSelectedShiftType(ShiftType.AFTERNOON); setCustomTimeInput(SHIFT_DETAILS[ShiftType.AFTERNOON].time); }} className={`p-3 rounded-xl border ${selectedShiftType === ShiftType.AFTERNOON ? 'border-primary ring-2 ring-primary/20 bg-shift-afternoon/20 dark:bg-shift-afternoon/20' : 'border-gray-200 dark:border-gray-700 bg-shift-afternoon/5 dark:bg-shift-afternoon/5 hover:bg-shift-afternoon/10'} text-shift-afternoon font-bold transition-all`}>Tarde</button>
              <button onClick={() => { setSelectedShiftType(ShiftType.NIGHT); setCustomTimeInput(SHIFT_DETAILS[ShiftType.NIGHT].time); }} className={`p-3 rounded-xl border ${selectedShiftType === ShiftType.NIGHT ? 'border-primary ring-2 ring-primary/20 bg-shift-night/20 dark:bg-shift-night/20' : 'border-gray-200 dark:border-gray-700 bg-shift-night/5 dark:bg-shift-night/5 hover:bg-shift-night/10'} text-shift-night font-bold transition-all`}>Noche</button>
              <button onClick={() => { setSelectedShiftType(ShiftType.OFF); setCustomTimeInput(SHIFT_DETAILS[ShiftType.OFF].time); }} className={`p-3 rounded-xl border ${selectedShiftType === ShiftType.OFF ? 'border-primary ring-2 ring-primary/20 bg-gray-200 dark:bg-gray-700' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100'} text-gray-600 dark:text-gray-400 font-bold transition-all`}>Libre</button>
            </div>
            {selectedShiftType !== ShiftType.OFF && (
              <div className="flex flex-col gap-2 mb-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Horario</label>
                <input 
                  type="text" 
                  value={customTimeInput}
                  onChange={(e) => setCustomTimeInput(e.target.value)}
                  maxLength={30}
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="Ej: 06:00 - 14:00"
                />
              </div>
            )}
            <button
               onClick={handleSetException}
               className="w-full py-3 bg-primary text-white font-bold rounded-xl active:scale-95 transition-transform"
            >
               Guardar Cambios
            </button>
            {hasException && (
               <button onClick={handleClearException} className="mt-2 text-sm font-semibold text-rose-500 hover:underline text-center">
                 Restablecer a turno de ciclo
               </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark p-5 shadow-lg dark:shadow-none hover:shadow-hover-glow transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-lg font-bold text-slate-900 dark:text-white transition-all">
                  {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  {selectedDate.toDateString() === new Date().toDateString() ? ' (Hoy)' : ''}
                </p>
                <div className="flex items-center gap-2">
                  <div className={`flex size-2.5 rounded-full ${currentDetails.dot} shadow-glow animate-pulse`}></div>
                  <p className="text-slate-500 dark:text-gray-300 text-sm font-medium">Turno {currentDetails.label} {hasException ? '(Personalizado)' : ''}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsEditingDay(!isEditingDay);
                  if (!isEditingDay) {
                    setSelectedShiftType(currentShiftType);
                    setCustomTimeInput(currentTime);
                  }
                }}
                className={`group flex items-center justify-center size-10 rounded-full text-primary hover:text-white transition-all ${isEditingDay ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-primary'}`}
              >
                <span className="material-symbols-outlined text-[20px]">{isEditingDay ? 'close' : 'edit'}</span>
              </button>
            </div>
            <div className="w-full h-px bg-gray-100 dark:bg-gray-700/50"></div>
            <div className="flex items-center gap-3 group/item">
              <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Horario Laboral</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{currentTime}</p>
              </div>
            </div>
          </div>
        )}
      </section>
      </div>
    </div>
  );
};

export default MonthlyScreen;
;
