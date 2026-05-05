import { UserConfig, ShiftType } from '../types';
import { getShiftForDate } from '../utils';

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  
  if (Notification.permission === 'granted') return true;
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const scheduleNotifications = (config: UserConfig) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  
  // Clear previous timeouts if we want to reset them, but simpler to just 
  // check periodically or schedule for the end of the current shift.
  
  // Here we just find the end of the week.
  // A simple way is to check every hour if the week has ended.
  // We can save the last notified week in localStorage.
  
  const start = new Date(config.startDate);
  start.setHours(0, 0, 0, 0);
  
  const diffMs = now.getTime() - start.getTime();
  if (diffMs < 0) return;
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const fullWeeks = Math.floor(diffDays / 7);
  
  const lastNotifiedWeek = localStorage.getItem('lastNotifiedWeek');
  
  if (lastNotifiedWeek !== fullWeeks.toString()) {
    // Transitioned to a new week!
    // But wait, the exact time they finish the shift matters.
    // "cuando pase el turno de mañana establecido... enhorabuena has superado otra semana"
  }
};

export const checkAndNotify = (config: UserConfig) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const todayShift = getShiftForDate(now, config);
  
  // Let's parse the end time of the current shift
  let endTimeParts = [14, 0]; // Default fallback
  if (todayShift.time && todayShift.time.includes('-')) {
    const endStr = todayShift.time.split('-')[1].trim();
    const parts = endStr.split(':');
    if (parts.length >= 2) {
      endTimeParts = [parseInt(parts[0], 10), parseInt(parts[1], 10)];
    }
  }

  const shiftEndTime = new Date(now);
  shiftEndTime.setHours(endTimeParts[0], endTimeParts[1], 0, 0);

  // Check if we are at the end of the work week
  const dayOfWeek = now.getDay();
  const isFridayAfterShift = dayOfWeek === 5 && now.getTime() > shiftEndTime.getTime();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (isFridayAfterShift || isWeekend) {
      const start = new Date(config.startDate);
      start.setHours(0, 0, 0, 0);
      const diffMs = now.getTime() - start.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      const fullWeeks = Math.floor(diffDays / 7);
      
      // We will only notify once per week
      const lastNotifiedWeek = localStorage.getItem('lastNotifiedWeek');
      
      if (lastNotifiedWeek !== fullWeeks.toString()) {
         // Determine next week's shift
         // Jump to next Monday: 
         const daysToNextMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
         const nextMonday = new Date(now);
         nextMonday.setDate(now.getDate() + daysToNextMonday);
         
         const nextShiftInfo = getShiftForDate(nextMonday, config);
         
         const shiftName = {
           [ShiftType.MORNING]: 'Mañana',
           [ShiftType.AFTERNOON]: 'Tarde',
           [ShiftType.NIGHT]: 'Noche',
           [ShiftType.OFF]: 'Libre'
         }[nextShiftInfo.type];

         new Notification('¡Semana Superada!', {
           body: `¡Enhorabuena, has superado otra semana! La próxima semana te toca turno de ${shiftName}.`,
           icon: '/favicon.ico'
         });
         
         localStorage.setItem('lastNotifiedWeek', fullWeeks.toString());
      }
  }
};
