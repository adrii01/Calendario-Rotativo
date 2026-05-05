
export enum ShiftType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  NIGHT = 'night',
  OFF = 'off'
}

export interface RotationWeek {
  id: string;
  shiftType: ShiftType;
  customTime?: string; // Optional custom time for this week
}

export interface DayException {
  shiftType: ShiftType;
  customTime?: string; // Optional custom time for this day
}

export interface UserConfig {
  startDate: string; // ISO Date
  rotation: RotationWeek[];
  exceptions?: Record<string, DayException | ShiftType>; // DayException is new interface, ShiftType is fallback for old ones
}

export interface UserInfo {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AppState {
  isRegistered: boolean;
  config: UserConfig;
  user: UserInfo;
}
