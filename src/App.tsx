/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AnimatePresence, motion } from 'motion/react';
import AndroidShell from './components/AndroidShell';
import DashboardHome from './components/DashboardHome';
import HabitsManager from './components/HabitsManager';
import GoalsManager from './components/GoalsManager';
import HealthTracker from './components/HealthTracker';
import SettingsTab from './components/SettingsTab';
import { AndroidTab, Habit, Goal, DailyWaterLog, SleepLog, WorkoutLog, HealthStat } from './types';
import {
  getHabits,
  saveHabits,
  getGoals,
  saveGoals,
  getWaterLogs,
  saveWaterLogs,
  getSleepLogs,
  saveSleepLogs,
  getWorkoutLogs,
  saveWorkoutLogs,
  getHealthStats,
  saveHealthStats,
  getNotificationSettings,
} from './lib/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<AndroidTab>('home');

  // Unified States
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [waterLogs, setWaterLogs] = useState<DailyWaterLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [healthStats, setHealthStats] = useState<HealthStat[]>([]);

  // Sound and local toaster configuration
  const [triggerCount, setTriggerCount] = useState(0);

  // Sync logic from storage helper
  const syncFromLocalStorage = () => {
    setHabits(getHabits());
    setGoals(getGoals());
    setWaterLogs(getWaterLogs());
    setSleepLogs(getSleepLogs());
    setWorkoutLogs(getWorkoutLogs());
    setHealthStats(getHealthStats());
  };

  // On mount or trigger, sync from localStorage
  useEffect(() => {
    syncFromLocalStorage();
  }, [triggerCount]);

  // Unified custom Notification Trigger
  const triggerSystemNotification = (title: string, body: string) => {
    const settings = getNotificationSettings();
    if (!settings.enabled) return;

    // 1. Play clean Web Audio synthesis chime
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // Cute synth chirp sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5

      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.log('Web audio synth chime blocked by gesture policies:', e);
    }

    // 2. Fire Native Capacitor/Android notification if permitted, rollover with browser fallback
    try {
      LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Math.random() * 1000000),
            schedule: { at: new Date(Date.now() + 500) },
            smallIcon: 'ic_stat_icon_config_sample',
            actionTypeId: 'OPEN_ALERTS'
          }
        ]
      }).catch((err) => {
        console.log('Push skipped (running in browser mode):', err.message);
        // Fallback to traditional browser alert
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png',
          });
        }
      });
    } catch (nativeAppErr) {
      console.log('Not in native container context, using standard fallback:', nativeAppErr);
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png',
          });
        } catch (e) {
          console.log('Flipped nested iframe notification permission block:', e);
        }
      }
    }

    // 3. Log notification inside our local Inbox storage dynamically so user doesn't miss it
    const logEntry = {
      id: `log_${Date.now()}`,
      title,
      body,
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
    };

    const existingLogs = localStorage.getItem('android_notification_logs');
    const existingArr = existingLogs ? JSON.parse(existingLogs) : [];
    const updatedLogs = [logEntry, ...existingArr].slice(0, 30);
    localStorage.setItem('android_notification_logs', JSON.stringify(updatedLogs));

    // Force updates to render across active views
    setTriggerCount((prev) => prev + 1);
  };

  const pageVariants = {
    initial: { opacity: 0, x: -30, scale: 0.96 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24, mass: 0.8 } },
    exit: { opacity: 0, x: 30, scale: 0.96, transition: { duration: 0.2, ease: "easeInOut" } }
  };

  return (
    <AndroidShell
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab)}
      onDataRefresh={syncFromLocalStorage}
    >
      <div className="flex-1 flex flex-col justify-start relative">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <DashboardHome
                habits={habits}
                goals={goals}
                waterLogs={waterLogs}
                sleepLogs={sleepLogs}
                workoutLogs={workoutLogs}
                healthStats={healthStats}
                onDataRefresh={syncFromLocalStorage}
                triggerNotification={triggerSystemNotification}
              />
            </motion.div>
          )}

          {activeTab === 'habits' && (
            <motion.div key="habits" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <HabitsManager
                habits={habits}
                onDataRefresh={syncFromLocalStorage}
                triggerNotification={triggerSystemNotification}
              />
            </motion.div>
          )}

          {activeTab === 'goals' && (
            <motion.div key="goals" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <GoalsManager
                goals={goals}
                onDataRefresh={syncFromLocalStorage}
                triggerNotification={triggerSystemNotification}
              />
            </motion.div>
          )}

          {activeTab === 'health' && (
            <motion.div key="health" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <HealthTracker
                waterLogs={waterLogs}
                sleepLogs={sleepLogs}
                workoutLogs={workoutLogs}
                healthStats={healthStats}
                onDataRefresh={syncFromLocalStorage}
                triggerNotification={triggerSystemNotification}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-0">
              <SettingsTab
                habits={habits}
                goals={goals}
                waterLogs={waterLogs}
                onDataRefresh={syncFromLocalStorage}
                triggerNotification={triggerSystemNotification}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AndroidShell>
  );
}
