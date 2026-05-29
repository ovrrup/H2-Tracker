import React, { useState, useEffect } from 'react';
import {
  Bell,
  ShieldAlert,
  Sparkles,
  Send,
  Trash2,
  Settings,
  CheckCircle,
  Volume2,
  Info,
  TriangleAlert,
  Download,
  Upload,
} from 'lucide-react';

import {
  Habit,
  Goal,
  DailyWaterLog,
  NotificationSettings,
} from '../types';

import {
  getNotificationSettings,
  saveNotificationSettings,
  clearLocalStorageData,
  exportAppData,
  importAppData,
} from '../lib/storage';

import { triggerHaptic } from '../lib/haptic';

interface SettingsTabProps {
  habits: Habit[];
  goals: Goal[];
  waterLogs: DailyWaterLog[];
  onDataRefresh: () => void;
  triggerNotification: (title: string, body: string) => void;
}

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  timestamp: string;
}

export default function SettingsTab({
  habits,
  goals,
  waterLogs,
  onDataRefresh,
  triggerNotification,
}: SettingsTabProps) {
  const [settings, setSettings] =
    useState<NotificationSettings>(
      getNotificationSettings()
    );

  const [permissionState, setPermissionState] =
    useState<NotificationPermission>('default');

  const [notificationInbox, setNotificationInbox] =
    useState<NotificationLog[]>([]);

  const [confirmWipe, setConfirmWipe] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const historical = localStorage.getItem(
      'android_notification_logs'
    );

    if (historical) {
      setNotificationInbox(JSON.parse(historical));
    }
  }, []);

  const saveAndSyncSettings = (
    updated: NotificationSettings
  ) => {
    setSettings(updated);
    saveNotificationSettings(updated);
    onDataRefresh();
  };

  const handleClearData = () => {
    triggerHaptic('warning');

    if (!confirmWipe) {
      setConfirmWipe(true);
      setTimeout(() => setConfirmWipe(false), 4000);
      return;
    }

    clearLocalStorageData();
    onDataRefresh();

    triggerHaptic('success');
    setConfirmWipe(false);
  };

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      triggerNotification(
        'Notification Error ⚠️',
        'This browser does not support browser notifications.'
      );
      return;
    }

    try {
      const permission =
        await Notification.requestPermission();

      setPermissionState(permission);

      const isGranted = permission === 'granted';

      saveAndSyncSettings({
        ...settings,
        permissionGranted: isGranted,
      });

      if (isGranted) {
        triggerNotification(
          'Notifications Authorized! 🔔',
          'Daily tracker notifications are enabled.'
        );
      } else {
        triggerNotification(
          'Permission Declined ⚠️',
          'Permission was declined.'
        );
      }
    } catch (e) {
      console.log(e);

      saveAndSyncSettings({
        ...settings,
        permissionGranted: true,
      });

      triggerNotification(
        'Simulated Mode Active ✨',
        'Notifications enabled in sandbox mode!'
      );
    }
  };

  const handleTestTrigger = () => {
    const choice = {
      t: 'Test Notification 🔔',
      b: 'This is a test notification payload.',
    };

    triggerNotification(choice.t, choice.b);

    const logEntry: NotificationLog = {
      id: `log_${Date.now()}`,
      title: choice.t,
      body: choice.b,
      timestamp: new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    const newInbox = [logEntry, ...notificationInbox]
      .slice(0, 30);

    setNotificationInbox(newInbox);

    localStorage.setItem(
      'android_notification_logs',
      JSON.stringify(newInbox)
    );
  };

  const handleClearInbox = () => {
    setNotificationInbox([]);
    localStorage.removeItem(
      'android_notification_logs'
    );
  };

  const handleDeleteLogEntry = (
    e: React.MouseEvent,
    id: string
  ) => {
    e.stopPropagation();

    const updated = notificationInbox.filter(
      log => log.id !== id
    );

    setNotificationInbox(updated);

    localStorage.setItem(
      'android_notification_logs',
      JSON.stringify(updated)
    );
  };

  // =========================
  // IMPORT BACKUP HANDLER
  // =========================

  const handleImportBackup = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      await importAppData(file);

      triggerNotification(
        'Backup Restored ✅',
        'Your data has been restored successfully.'
      );

      onDataRefresh();
    } catch (error) {
      console.error(error);

      triggerNotification(
        'Import Failed ❌',
        'The backup file is invalid.'
      );
    }
  };

  return (
    <div className="flex-1 p-5 lg:p-8 relative select-none animate-fade-in w-full max-w-4xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex items-end justify-between mb-8 relative z-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight">
            Settings.
          </h1>

          <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono font-bold">
            SYSTEM CONFIGURATION
          </p>
        </div>
      </div>

      {/* CORE SETTINGS */}
      <div className="space-y-4">

        <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 pb-2">
          Core Mechanisms
        </h3>

        {/* SOUND SETTINGS */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-sm">

          <div className="flex justify-between items-start gap-4">

            <div className="flex items-start gap-3 flex-1">

              <div className="p-2 bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-400">
                <Volume2 className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  Synthesizer Alarms
                </h4>

                <p className="text-[11px] text-zinc-500">
                  Allow sound for popup notifications.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                saveAndSyncSettings({
                  ...settings,
                  enabled: !settings.enabled,
                })
              }
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors uppercase border ${
                settings.enabled
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              {settings.enabled
                ? 'ENABLED'
                : 'MUTED'}
            </button>
          </div>
        </div>

        {/* CLEAR DATA */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-sm">

          <div className="flex justify-between items-start gap-4">

            <div className="flex items-start gap-3 flex-1">

              <div className="p-2 bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-400">
                <Trash2 className="w-5 h-5" />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  Wipe Database
                </h4>

                <p className="text-[11px] text-zinc-500">
                  Clear all locally stored app data.
                </p>
              </div>
            </div>

            <button
              onClick={handleClearData}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase border w-32 ${
                confirmWipe
                  ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                  : 'bg-zinc-900 border-zinc-800 text-rose-400'
              }`}
            >
              {confirmWipe
                ? 'CONFIRM?'
                : 'ERASE'}
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="space-y-4">

        <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 pb-2">
          Notifications
        </h3>

        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">

          {permissionState !== 'granted' ? (
            <button
              onClick={handleRequestPermission}
              className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold py-3 rounded-xl"
            >
              Authorize Notifications
            </button>
          ) : (
            <div className="flex items-center gap-3 text-emerald-400 text-sm font-bold">
              <CheckCircle className="w-5 h-5" />
              Notifications Authorized
            </div>
          )}

          <button
            onClick={handleTestTrigger}
            className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            TEST NOTIFICATION
          </button>
        </div>
      </div>

      {/* BACKUP & RESTORE */}
      <div className="space-y-4">

        <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 pb-2">
          Backup & Restore
        </h3>

        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-sm space-y-4">

          <button
            onClick={() => {
              exportAppData();

              triggerNotification(
                'Backup Created 📦',
                'Backup downloaded successfully.'
              );
            }}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-5 h-5" />
            Export Backup
          </button>

          <label className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer">

            <Upload className="w-5 h-5" />
            Import Backup

            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportBackup}
            />
          </label>

          <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
            Export and restore all habits, goals,
            logs, workouts, health stats, and settings.
          </p>
        </div>
      </div>
    </div>
  );
}
