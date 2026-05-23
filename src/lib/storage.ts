/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Habit, Goal, DailyWaterLog, SleepLog, WorkoutLog, HealthStat, NotificationSettings } from '../types';

const KEYS = {
  HABITS: 'android_habits',
  GOALS: 'android_goals',
  WATER_LOGS: 'android_water',
  SLEEP_LOGS: 'android_sleep',
  WORKOUT_LOGS: 'android_workout',
  HEALTH_STATS: 'android_health_stats',
  NOTIFICATIONS: 'android_notification_settings',
};

export const getHabits = (): Habit[] => {
  const data = localStorage.getItem(KEYS.HABITS);
  return data ? JSON.parse(data) : [];
};

export const saveHabits = (habits: Habit[]): void => {
  localStorage.setItem(KEYS.HABITS, JSON.stringify(habits));
};

export const getGoals = (): Goal[] => {
  const data = localStorage.getItem(KEYS.GOALS);
  return data ? JSON.parse(data) : [];
};

export const saveGoals = (goals: Goal[]): void => {
  localStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
};

export const getWaterLogs = (): DailyWaterLog[] => {
  const data = localStorage.getItem(KEYS.WATER_LOGS);
  return data ? JSON.parse(data) : [];
};

export const saveWaterLogs = (logs: DailyWaterLog[]): void => {
  localStorage.setItem(KEYS.WATER_LOGS, JSON.stringify(logs));
};

export const getSleepLogs = (): SleepLog[] => {
  const data = localStorage.getItem(KEYS.SLEEP_LOGS);
  return data ? JSON.parse(data) : [];
};

export const saveSleepLogs = (logs: SleepLog[]): void => {
  localStorage.setItem(KEYS.SLEEP_LOGS, JSON.stringify(logs));
};

export const getWorkoutLogs = (): WorkoutLog[] => {
  const data = localStorage.getItem(KEYS.WORKOUT_LOGS);
  return data ? JSON.parse(data) : [];
};

export const saveWorkoutLogs = (logs: WorkoutLog[]): void => {
  localStorage.setItem(KEYS.WORKOUT_LOGS, JSON.stringify(logs));
};

export const getHealthStats = (): HealthStat[] => {
  const data = localStorage.getItem(KEYS.HEALTH_STATS);
  return data ? JSON.parse(data) : [];
};

export const saveHealthStats = (stats: HealthStat[]): void => {
  localStorage.setItem(KEYS.HEALTH_STATS, JSON.stringify(stats));
};

export const getNotificationSettings = (): NotificationSettings => {
  const data = localStorage.getItem(KEYS.NOTIFICATIONS);
  return data ? JSON.parse(data) : {
    enabled: true,
    permissionGranted: false,
    reminderTime: '08:00',
  };
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(settings));
};

export const clearLocalStorageData = () => {
  localStorage.removeItem(KEYS.HABITS);
  localStorage.removeItem(KEYS.GOALS);
  localStorage.removeItem(KEYS.WATER_LOGS);
  localStorage.removeItem(KEYS.SLEEP_LOGS);
  localStorage.removeItem(KEYS.WORKOUT_LOGS);
  localStorage.removeItem(KEYS.HEALTH_STATS);
};
