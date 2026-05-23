import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, Sparkles, Send, Trash2, Settings, CheckCircle, Volume2, Info, TriangleAlert } from 'lucide-react';
import { Habit, Goal, DailyWaterLog, NotificationSettings } from '../types';
import { getNotificationSettings, saveNotificationSettings, clearLocalStorageData } from '../lib/storage';
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
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings());
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [notificationInbox, setNotificationInbox] = useState<NotificationLog[]>([]);
  
  // Wipe Configuration
  const [confirmWipe, setConfirmWipe] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const historical = localStorage.getItem('android_notification_logs');
    if (historical) {
      setNotificationInbox(JSON.parse(historical));
    }
  }, []);

  const saveAndSyncSettings = (updated: NotificationSettings) => {
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
      triggerNotification('Notification Error ⚠️', 'This browser does not support browser notifications. Reminders will simulate in-app.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);
      
      const isGranted = permission === 'granted';
      saveAndSyncSettings({
        ...settings,
        permissionGranted: isGranted,
      });

      if (isGranted) {
        triggerNotification(
          'Notifications Authorized! 🔔',
          'Standard daily tracker notifications and habit reminders are now live.'
        );
      } else {
        triggerNotification('Permission Declined ⚠️', 'Permission was declined. Reminders will fall back to in-app notification toasts.');
      }
    } catch (e) {
      console.log('Permission blocked in iframe sandboxing', e);
      saveAndSyncSettings({
        ...settings,
        permissionGranted: true,
      });
      triggerNotification(
        'Simulated Mode Active ✨',
        'Standard notifications enabled in simulated sandbox mode!'
      );
    }
  };

  const handleTestTrigger = () => {
    const choice = { t: 'Test Notification 🔔', b: 'This is a test notification payload.' };
    triggerNotification(choice.t, choice.b);
    
    const logEntry: NotificationLog = {
      id: `log_${Date.now()}`,
      title: choice.t,
      body: choice.b,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
    };

    const newInbox = [logEntry, ...notificationInbox].slice(0, 30);
    setNotificationInbox(newInbox);
    localStorage.setItem('android_notification_logs', JSON.stringify(newInbox));
  };

  const handleClearInbox = () => {
    setNotificationInbox([]);
    localStorage.removeItem('android_notification_logs');
  };

  const handleDeleteLogEntry = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = notificationInbox.filter(log => log.id !== id);
    setNotificationInbox(updated);
    localStorage.setItem('android_notification_logs', JSON.stringify(updated));
  };

  return (
    <div className="flex-1 p-5 lg:p-8 relative select-none animate-fade-in w-full max-w-4xl mx-auto space-y-8" id="settings-session-root">
      {/* Header */}
      <div className="flex items-end justify-between mb-8 relative z-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white font-sans tracking-tight">Settings.</h1>
          <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono font-bold">SYSTEM CONFIGURATION AND ACCOUNTS</p>
        </div>
      </div>

      {/* CORE APP SETTINGS MODULE */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider text-left border-b border-zinc-800/80 pb-2 flex items-center justify-between">
          <span>Core Mechanisms</span>
        </h3>

        {/* Global Notifications Switch */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-zinc-900/50 rounded-xl border border-zinc-800 shrink-0 text-zinc-400">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  Synthesizer Alarms
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-zinc-500 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 bg-zinc-800 text-[10px] text-zinc-300 p-2 rounded-xl text-center shadow-xl border border-zinc-700 z-50">
                      Enables high-frequency oscillator audio chimes when triggering haptic notifications or standard browser events. 
                    </div>
                  </div>
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Allow system to play sound for popups.</p>
              </div>
            </div>
            
            <button
              onClick={() => saveAndSyncSettings({...settings, enabled: !settings.enabled})}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors uppercase border ${
                settings.enabled ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-zinc-900 border-zinc-800 text-zinc-500'
              }`}
            >
              {settings.enabled ? 'ENABLED' : 'MUTED'}
            </button>
          </div>
        </div>

        {/* Wipe Data Module */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-zinc-900/50 rounded-xl border border-zinc-800 shrink-0 text-zinc-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  Wipe Database
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-zinc-500 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-48 bg-zinc-800 text-[10px] text-zinc-300 p-2 rounded-xl text-center shadow-xl border border-zinc-700 z-50">
                      Fully formats localhost state mechanisms resetting habits, water tracking logs, and active session history instantly.
                    </div>
                  </div>
                </h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">Clear local hardware cache and logs.</p>
              </div>
            </div>
            
            <button
              onClick={handleClearData}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase border w-32 ${
                confirmWipe
                  ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                  : 'bg-zinc-900 border-zinc-800 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30'
              }`}
            >
              {confirmWipe ? 'CONFIRM?' : 'ERASE'}
            </button>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS MODULE */}
      <div className="space-y-4 pt-4 relative">
        <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider text-left border-b border-zinc-800/80 pb-2">
          Notifications & Alerts System
        </h3>

        {/* BROKEN TAG OVERLAY */}
        <div className="absolute inset-0 top-8 z-10 bg-zinc-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 rounded-3xl border border-rose-900/30">
           <div className="flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest text-xs font-mono shadow-[0_0_20px_rgba(244,63,94,0.3)]">
             <TriangleAlert className="w-4 h-4" />
             <span>Broken</span>
           </div>
           <p className="text-[10px] text-zinc-400 mt-4 text-center max-w-[280px] font-bold">
             This module is currently disconnected from the core pipeline suite due to refactoring.
           </p>
        </div>

        {/* Content Grayed Out Behind Overlay */}
        <div className="space-y-4 opacity-30 grayscale pointer-events-none">
          {permissionState !== 'granted' ? (
            <div className="bg-amber-500/10 p-5 rounded-3xl border border-amber-500/20 text-center space-y-3">
              <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
              <button 
                onClick={handleRequestPermission}
                className="w-full mt-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold py-3 rounded-xl cursor-pointer">
                Authorize Notifications
              </button>
            </div>
          ) : (
            <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-900 flex items-start gap-4">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-left text-xs space-y-1">
                <span className="font-bold text-white block">Channels Authorized</span>
              </div>
            </div>
          )}

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider text-left flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" />
              ALARM SIMULATION
            </h3>
            <button 
              onClick={handleTestTrigger}
              className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/30 text-indigo-400 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all">
              <Send className="w-3.5 h-3.5" />
              <span>FIRE IMMEDIATE PUSH</span>
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
