/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Habit,
  Goal,
  DailyWaterLog,
  SleepLog,
  WorkoutLog,
  HealthStat,
  NotificationSettings,
} from '../types';

const KEYS = {
  HABITS: 'android_habits',
  GOALS: 'android_goals',
  WATER_LOGS: 'android_water',
  SLEEP_LOGS: 'android_sleep',
  WORKOUT_LOGS: 'android_workout',
  HEALTH_STATS: 'android_health_stats',
  NOTIFICATIONS: 'android_notification_settings',
  NOTIFICATION_LOGS: 'android_notification_logs',
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

  return data
    ? JSON.parse(data)
    : {
        enabled: true,
        permissionGranted: false,
        reminderTime: '08:00',
      };
};

export const saveNotificationSettings = (
  settings: NotificationSettings
): void => {
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(settings));
};

// -----------------------------
// BACKUP / EXPORT
// -----------------------------

export const exportAppData = () => {
  const backupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),

    habits: getHabits(),
    goals: getGoals(),
    waterLogs: getWaterLogs(),
    sleepLogs: getSleepLogs(),
    workoutLogs: getWorkoutLogs(),
    healthStats: getHealthStats(),
    notificationSettings: getNotificationSettings(),
    notificationLogs:
      JSON.parse(
        localStorage.getItem(KEYS.NOTIFICATION_LOGS) || '[]'
      ) || [],
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `h2-tracker-backup-${Date.now()}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

// -----------------------------
// IMPORT / RESTORE
// -----------------------------

export const importAppData = async (file: File) => {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data) {
    throw new Error('Invalid backup file');
  }

  if (data.habits) {
    localStorage.setItem(KEYS.HABITS, JSON.stringify(data.habits));
  }

  if (data.goals) {
    localStorage.setItem(KEYS.GOALS, JSON.stringify(data.goals));
  }

  if (data.waterLogs) {
    localStorage.setItem(KEYS.WATER_LOGS, JSON.stringify(data.waterLogs));
  }

  if (data.sleepLogs) {
    localStorage.setItem(KEYS.SLEEP_LOGS, JSON.stringify(data.sleepLogs));
  }

  if (data.workoutLogs) {
    localStorage.setItem(
      KEYS.WORKOUT_LOGS,
      JSON.stringify(data.workoutLogs)
    );
  }

  if (data.healthStats) {
    localStorage.setItem(
      KEYS.HEALTH_STATS,
      JSON.stringify(data.healthStats)
    );
  }

  if (data.notificationSettings) {
    localStorage.setItem(
      KEYS.NOTIFICATIONS,
      JSON.stringify(data.notificationSettings)
    );
  }

  if (data.notificationLogs) {
    localStorage.setItem(
      KEYS.NOTIFICATION_LOGS,
      JSON.stringify(data.notificationLogs)
    );
  }

  return true;
};

export const clearLocalStorageData = () => {
  localStorage.removeItem(KEYS.HABITS);
  localStorage.removeItem(KEYS.GOALS);
  localStorage.removeItem(KEYS.WATER_LOGS);
  localStorage.removeItem(KEYS.SLEEP_LOGS);
  localStorage.removeItem(KEYS.WORKOUT_LOGS);
  localStorage.removeItem(KEYS.HEALTH_STATS);
};
