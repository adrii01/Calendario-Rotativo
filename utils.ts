import { UserConfig, ShiftType, DayException } from './types';
import { SHIFT_DETAILS } from './constants';

export interface ShiftInfo {
  type: ShiftType;
  defaultDetails: typeof SHIFT_DETAILS[ShiftType];
  time: string;
}

export const getShiftForDate = (date: Date, config: UserConfig): ShiftInfo => {
  const dateStr = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
  
  if (config.exceptions && config.exceptions[dateStr]) {
    const ex = config.exceptions[dateStr];
    const type = typeof ex === 'string' ? ex as ShiftType : (ex as DayException).shiftType;
    const time = typeof ex === 'string' ? SHIFT_DETAILS[type].time : (ex as DayException).customTime || SHIFT_DETAILS[type].time;
    return { type, defaultDetails: SHIFT_DETAILS[type], time };
  }

  const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { type: ShiftType.OFF, defaultDetails: SHIFT_DETAILS[ShiftType.OFF], time: SHIFT_DETAILS[ShiftType.OFF].time };
  }

  const start = new Date(config.startDate);
  const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (dateMidnight < startMidnight) {
    return { type: ShiftType.OFF, defaultDetails: SHIFT_DETAILS[ShiftType.OFF], time: SHIFT_DETAILS[ShiftType.OFF].time };
  }

  const diffMs = dateMidnight.getTime() - startMidnight.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  const fullWeeks = Math.floor(diffDays / 7);
  let weekdays = fullWeeks * 5;
  
  const remainderDays = diffDays % 7;
  let current = new Date(startMidnight);
  current.setDate(current.getDate() + fullWeeks * 7);
  
  for (let i = 0; i < remainderDays; i++) {
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      weekdays++;
    }
    current.setDate(current.getDate() + 1);
  }

  const cycleDays = config.rotation.length * 5;
  const currentDayInCycle = weekdays % cycleDays;
  const weekIndex = Math.floor(currentDayInCycle / 5);
  
  if (weekIndex >= config.rotation.length || weekIndex < 0) {
    return { type: ShiftType.OFF, defaultDetails: SHIFT_DETAILS[ShiftType.OFF], time: SHIFT_DETAILS[ShiftType.OFF].time };
  }
  
  const rotation = config.rotation[weekIndex];
  return { 
    type: rotation.shiftType, 
    defaultDetails: SHIFT_DETAILS[rotation.shiftType], 
    time: rotation.customTime || SHIFT_DETAILS[rotation.shiftType].time 
  };
};

export const calculateShiftProgress = (shiftTime: string, now: Date): number => {
  if (shiftTime === 'Descanso' || !shiftTime.includes(' - ')) return 0;

  const [startStr, endStr] = shiftTime.split(' - ');
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);

  const startTime = new Date(now);
  startTime.setHours(startH, startM, 0, 0);
  
  const endTime = new Date(now);
  endTime.setHours(endH, endM, 0, 0);

  // Handle shifts crossing midnight (like Night shift)
  if (endTime <= startTime) {
    // If current time is after start, end is next day
    if (now.getHours() >= startH || (now.getHours() === startH && now.getMinutes() >= startM)) {
      endTime.setDate(endTime.getDate() + 1);
    } else {
      // If current time is before start (e.g. 01:00), start was yesterday
      startTime.setDate(startTime.getDate() - 1);
    }
  }

  const total = endTime.getTime() - startTime.getTime();
  const elapsed = now.getTime() - startTime.getTime();

  if (elapsed < 0) return 0;
  if (elapsed > total) return 100;

  return Math.round((elapsed / total) * 100);
};

export const calculateWeeklyHours = (config: UserConfig, targetDate: Date): number => {
  // Get Monday of the current week
  const startOfWeek = new Date(targetDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  let totalHours = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    const shift = getShiftForDate(d, config);
    if (shift.type !== ShiftType.OFF && shift.time.includes(' - ')) {
      const [start, end] = shift.time.split(' - ');
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      
      let duration = (endH + endM/60) - (startH + startM/60);
      if (duration <= 0) duration += 24; // Handle midnight crossing
      totalHours += duration;
    }
  }
  return totalHours;
};
