
import React from 'react';
import { ShiftType } from './types';

export const SHIFT_DETAILS = {
  [ShiftType.MORNING]: {
    label: 'Mañana',
    icon: 'wb_sunny',
    color: 'text-amber-500',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400',
    time: '06:00 - 14:00',
    dot: 'bg-shift-morning'
  },
  [ShiftType.AFTERNOON]: {
    label: 'Tarde',
    icon: 'wb_twilight',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500',
    time: '14:00 - 22:00',
    dot: 'bg-shift-afternoon'
  },
  [ShiftType.NIGHT]: {
    label: 'Noche',
    icon: 'bedtime',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500',
    time: '22:00 - 06:00',
    dot: 'bg-shift-night'
  },
  [ShiftType.OFF]: {
    label: 'Libre',
    icon: 'block',
    color: 'text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800',
    border: 'border-gray-200 dark:border-gray-700',
    time: 'Descanso',
    dot: 'bg-transparent'
  }
};

export const WEEK_DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
