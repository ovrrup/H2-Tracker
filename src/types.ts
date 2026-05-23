/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  category: 'fitness' | 'nutrition' | 'mind' | 'productivity' | 'custom';
  createdAt: string; // ISO DateTime
  completedDates: string[]; // YYYY-MM-DD format
  streak: number;
  reminderTime: string; // HH:MM
  targetDaysPerWeek?: number;
}

export interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., kg, km, steps, hours, times
  category: 'fitness' | 'health' | 'learning' | 'personal' | 'life';
  deadline: string; // YYYY-MM-DD
  createdAt: string; // ISO DateTime
  isCompleted: boolean;
}

export interface WaterLogEntry {
  id: string;
  amountMl: number;
  loggedAt: string; // ISO DateTime
}

export interface DailyWaterLog {
  date: string; // YYYY-MM-DD
  entries: WaterLogEntry[];
  dailyGoalMl: number;
}

export interface SleepLog {
  id: string;
  date: string; // YYYY-MM-DD for the waking morning
  bedTime: string; // ISO DateTime or HH:MM
  wakeTime: string; // ISO DateTime or HH:MM
  qualityRating: number; // 1-5 scale
  actualHours: number;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  type: string; // e.g., Running, Cycling, Strength, Yoga
  durationMinutes: number;
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned?: number;
  notes?: string;
}

export interface HealthStat {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg?: number;
  systolicBp?: number;
  diastolicBp?: number;
  restingHeartRateBpm?: number;
  notes?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  permissionGranted: boolean;
  reminderTime: string; // HH:MM
}

export type AndroidTab = 'home' | 'habits' | 'goals' | 'health' | 'settings';
