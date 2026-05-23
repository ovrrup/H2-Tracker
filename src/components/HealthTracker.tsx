/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GlassWater, Moon, Flame, Heart, ChevronRight, Plus, Droplets, Trash2, Shield, Calendar, Scale, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { DailyWaterLog, SleepLog, WorkoutLog, HealthStat } from '../types';
import { saveWaterLogs, saveSleepLogs, saveWorkoutLogs, saveHealthStats } from '../lib/storage';
import { triggerHaptic } from '../lib/haptic';
import { motion, AnimatePresence } from 'motion/react';

interface HealthTrackerProps {
  waterLogs: DailyWaterLog[];
  sleepLogs: SleepLog[];
  workoutLogs: WorkoutLog[];
  healthStats: HealthStat[];
  onDataRefresh: () => void;
  triggerNotification: (title: string, body: string) => void;
}

type HealthSubCategory = 'water' | 'sleep' | 'workout' | 'stats';

export default function HealthTracker({
  waterLogs,
  sleepLogs,
  workoutLogs,
  healthStats,
  onDataRefresh,
  triggerNotification,
}: HealthTrackerProps) {
  const [subCategory, setSubCategory] = useState<HealthSubCategory>('water');

  // Today dynamic string
  const todayStr = new Date().toISOString().split('T')[0];

  // =====================
  // 1. WATER TRACKER LOGIC
  // =====================
  const [waterCustomVal, setWaterCustomVal] = useState(250);
  const handleAddCustomWater = (e: React.FormEvent) => {
    e.preventDefault();
    if (waterCustomVal <= 0) return;
    
    let updated = [...waterLogs];
    const logIndex = updated.findIndex(w => w.date === todayStr);
    const entry = { id: `w_e_${Date.now()}`, amountMl: waterCustomVal, loggedAt: new Date().toISOString() };
    
    if (logIndex !== -1) {
      updated[logIndex] = {
        ...updated[logIndex],
        entries: [...updated[logIndex].entries, entry]
      };
    } else {
      updated.push({
        date: todayStr,
        dailyGoalMl: 3000,
        entries: [entry]
      });
    }
    
    saveWaterLogs(updated);
    onDataRefresh();
    triggerHaptic('success');
    triggerNotification('Hydration Registered 💧', `Logged ${waterCustomVal}ml of water intake.`);
  };

  const handleDeleteWaterEntry = (entryId: string) => {
    triggerHaptic('warning');
    const updated = waterLogs.map(w => {
      if (w.date === todayStr) {
        return {
          ...w,
          entries: w.entries.filter(e => e.id !== entryId)
        };
      }
      return w;
    }).filter(w => w.entries.length > 0);

    saveWaterLogs(updated);
    triggerHaptic('success');
    onDataRefresh();
  };

  const handleClearWaterToday = () => {
    triggerHaptic('warning');
    const updated = waterLogs.filter(w => w.date !== todayStr);
    saveWaterLogs(updated);
    triggerHaptic('success');
    onDataRefresh();
  };

  // =====================
  // 2. SLEEP tracker logic
  // =====================
  const [bedTime, setBedTime] = useState('22:30');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepHours, setSleepHours] = useState(8.5);
  const [sleepQuality, setSleepQuality] = useState(4);
  const [sleepNotes, setSleepNotes] = useState('');

  const handleLogSleep = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: SleepLog = {
      id: `sleep_${Date.now()}`,
      date: todayStr,
      bedTime,
      wakeTime,
      actualHours: Number(sleepHours),
      qualityRating: Number(sleepQuality),
      notes: sleepNotes.trim() || undefined,
    };

    // check if today already logged to prevent duplicates, replace
    let updated = sleepLogs.filter(s => s.date !== todayStr);
    updated.push(newLog);
    saveSleepLogs(updated);
    onDataRefresh();
    setSleepNotes('');
    triggerHaptic('success');

    triggerNotification('Sleep Cycle Stored 🌙', `Recorded ${sleepHours}hr sleep session. Rating: ${sleepQuality}/5.`);
  };

  const handleDeleteSleep = (id: string) => {
    triggerHaptic('warning');
    saveSleepLogs(sleepLogs.filter(s => s.id !== id));
    triggerHaptic('success');
    onDataRefresh();
  };

  // =====================
  // 3. WORKOUTS tracker logic
  // =====================
  const [workoutType, setWorkoutType] = useState('Running');
  const [workoutDuration, setWorkoutDuration] = useState(30);
  const [workoutIntensity, setWorkoutIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [workoutCalories, setWorkoutCalories] = useState(250);
  const [workoutNotes, setWorkoutNotes] = useState('');

  const handleLogWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: WorkoutLog = {
      id: `workout_${Date.now()}`,
      date: todayStr,
      type: workoutType,
      durationMinutes: Number(workoutDuration),
      intensity: workoutIntensity,
      caloriesBurned: Number(workoutCalories) || undefined,
      notes: workoutNotes.trim() || undefined,
    };

    const updated = [...workoutLogs, newLog];
    saveWorkoutLogs(updated);
    onDataRefresh();
    setWorkoutNotes('');
    triggerHaptic('success');

    triggerNotification('Workout Activity Captured 🏃🏽‍♂️', `Stored ${workoutDuration} minutes of ${workoutType}!`);
  };

  const handleDeleteWorkout = (id: string) => {
    triggerHaptic('warning');
    saveWorkoutLogs(workoutLogs.filter(w => w.id !== id));
    triggerHaptic('success');
    onDataRefresh();
  };

  // =====================
  // 4. HEALTH INDEX TRACKER
  // =====================
  const [sysBp, setSysBp] = useState(120);
  const [diaBp, setDiaBp] = useState(80);
  const [weight, setWeight] = useState(75.5);
  const [heartRate, setHeartRate] = useState(65);

  const handleLogHealthStats = (e: React.FormEvent) => {
    e.preventDefault();
    const newStat: HealthStat = {
      id: `health_index_${Date.now()}`,
      date: todayStr,
      weightKg: Number(weight) || undefined,
      systolicBp: Number(sysBp) || undefined,
      diastolicBp: Number(diaBp) || undefined,
      restingHeartRateBpm: Number(heartRate) || undefined,
    };

    // Replace if today exists
    let updated = healthStats.filter(h => h.date !== todayStr);
    updated.push(newStat);
    saveHealthStats(updated);
    onDataRefresh();
    triggerHaptic('success');

    triggerNotification('Biometrics Logged 📈', 'Successfully saved resting heart rate, blood pressure, and weight indicators.');
  };

  const handleDeleteHealthStat = (id: string) => {
    triggerHaptic('warning');
    const updated = healthStats.filter(h => h.id !== id);
    saveHealthStats(updated);
    triggerHaptic('success');
    onDataRefresh();
  };

  // ============================================
  // CHART BUILDERS: LAST 7 DAYS DYNAMIC DATA
  // ============================================
  const last7Dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const getWeekDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { weekday: 'short' }).slice(0, 2);
  };

  return (
    <div className="flex-1 p-5 lg:p-8 space-y-6 flex flex-col justify-start w-full max-w-4xl mx-auto select-none" id="health-tracker-root">
      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white font-sans tracking-tight">Health.</h1>
          <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono font-bold">LOG METRICS AND VITALS</p>
        </div>
      </div>

      {/* Metric Categories Nav Deck */}
      <div className="grid grid-cols-4 gap-1.5 bg-zinc-950 border border-zinc-900 p-1.5 rounded-3xl shadow-sm" id="health-tracker-subtabs">
        <button
          onClick={() => {
            triggerHaptic('light');
            setSubCategory('water');
          }}
          className={`flex flex-col items-center py-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
            subCategory === 'water'
              ? 'bg-sky-500/15 text-sky-400 border border-sky-505/20 font-black'
              : 'text-zinc-500 hover:text-white border border-transparent hover:bg-zinc-900/40'
          }`}
        >
          <GlassWater className="w-5 h-5 mb-1.5 stroke-[2px]" />
          <span>Water</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setSubCategory('sleep');
          }}
          className={`flex flex-col items-center py-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
            subCategory === 'sleep'
              ? 'bg-rose-500/15 text-rose-450 border border-rose-500/20 font-black'
              : 'text-zinc-500 hover:text-white border border-transparent hover:bg-zinc-900/40'
          }`}
        >
          <Moon className="w-5 h-5 mb-1.5 stroke-[2px]" />
          <span>Sleep</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setSubCategory('workout');
          }}
          className={`flex flex-col items-center py-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer relative ${
            subCategory === 'workout'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-black'
              : 'text-zinc-500 hover:text-white border border-transparent hover:bg-zinc-900/40'
          }`}
        >
          <div className="absolute top-1.5 right-1.5 md:right-3 md:top-2 animate-pulse">
            <span className="text-[6.5px] bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 px-1 py-0.5 rounded shadow-sm">Enchanting...</span>
          </div>
          <Flame className="w-5 h-5 mb-1.5 stroke-[2px]" />
          <span>Workout</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setSubCategory('stats');
          }}
          className={`flex flex-col items-center py-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
            subCategory === 'stats'
              ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-505/20 font-black'
              : 'text-zinc-500 hover:text-white border border-transparent hover:bg-zinc-900/40'
          }`}
        >
          <Heart className="w-5 h-5 mb-1.5 stroke-[2px]" />
          <span>Biometrics</span>
        </button>
      </div>

      {/* SUB-CATEGORY CONTENT DECKS */}
      <AnimatePresence mode="wait">

      {/* 1. HYDRO DECK */}
      {subCategory === 'water' && (
        <motion.div 
          key="water"
          initial={{ opacity: 0, x: -15, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          exit={{ opacity: 0, x: 15, scale: 0.98, transition: { duration: 0.15 } }}
          className="space-y-6" id="water-section"
        >
          {/* Form */}
          <form onSubmit={handleAddCustomWater} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-sm">
            <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <GlassWater className="w-4 h-4 text-sky-400" />
              LOG WATER CONSUMPTION
            </h3>

            {/* High Contrast Standard Goal Banner */}
            <div className="bg-sky-505/10 border border-sky-500/20 p-3.5 rounded-2xl flex justify-between items-center text-xs text-zinc-205">
              <span className="font-bold">DAILY STANDARD INTAKE:</span>
              <span className="font-mono bg-sky-500/15 text-sky-400 border border-sky-500/25 px-2.5 py-1 rounded-xl font-bold">3000 ML (3.0L)</span>
            </div>
 
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="number"
                  value={waterCustomVal}
                  onChange={(e) => setWaterCustomVal(Number(e.target.value))}
                  min={50}
                  max={2000}
                  className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-450 border border-sky-500/30 text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>LOG VOLUME</span>
              </button>
            </div>
 
            <div className="flex items-center justify-between text-[11px] font-bold font-mono text-zinc-400 border-t border-zinc-800/80 pt-3.5">
              <span>Required Daily Baseline Goal: 3.0 Liters</span>
              <button
                type="button"
                onClick={handleClearWaterToday}
                className="text-[11px] text-zinc-350 underline font-bold hover:text-rose-450 transition-all cursor-pointer"
              >
                Clear Day Logs
              </button>
            </div>
          </form>

          {/* Today's Individual Hydration Log Entries */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-3.5 text-white shadow-sm">
            <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider text-left border-b border-zinc-851/50 pb-2">
              Today's Hydration Log Entries
            </h3>
            {(() => {
              const todayLog = waterLogs.find(w => w.date === todayStr);
              if (!todayLog || todayLog.entries.length === 0) {
                return (
                  <p className="text-[10px] text-zinc-650 font-bold italic py-2 text-center">No hydration records logged today</p>
                );
              }
              return (
                <motion.div 
                  initial="hidden" 
                  animate="visible" 
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                  className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs"
                >
                  <AnimatePresence>
                  {todayLog.entries.slice().reverse().map((entry) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      key={entry.id} 
                      className="bg-zinc-900/50 border border-zinc-800/60 p-3 rounded-2xl flex justify-between items-center text-white"
                    >
                      <div className="flex items-center gap-2">
                        <Droplets className="w-3.5 h-3.5 text-sky-400" />
                        <span className="font-mono text-[10px] text-zinc-550">
                          {new Date(entry.loggedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span className="font-bold text-sky-400">{entry.amountMl} ml</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteWaterEntry(entry.id); }}
                        className="text-zinc-550 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                        title="Delete this entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </motion.div>
              );
            })()}
          </div>
 
          {/* VISUAL CHART - Hydration bars */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4 text-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-mono text-sky-400 font-bold block">
                  7-Day Analysis • Avg: {Math.round(last7Dates.reduce((acc, dateStr) => acc + (waterLogs.find(w => w.date === dateStr)?.entries.reduce((sum, e) => sum + e.amountMl, 0) || 0), 0) / 7)}ml / day
                </span>
                <h3 className="text-sm font-bold font-sans text-white tracking-tight mt-0.5">
                  Weekly Hydration Progress
                </h3>
              </div>
              <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-mono px-2.5 py-1 rounded-xl font-bold">
                LEVEL METRIC
              </span>
            </div>
 
            {/* Recharts Bar Chart */}
            <div className="w-full h-44 bg-zinc-900/50 rounded-2xl p-4.5 border border-zinc-800/60 relative mt-1 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Dates.map(dateStr => ({
                  name: getWeekDayName(dateStr),
                  amount: waterLogs.find(w => w.date === dateStr)?.entries.reduce((sum, e) => sum + e.amountMl, 0) || 0
                }))}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                  <Tooltip cursor={{ fill: 'rgba(39, 39, 42, 0.4)' }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#38bdf8' }} itemStyle={{ color: '#38bdf8' }} formatter={(value: number) => [`${value} ml`, 'Intake']} />
                  <ReferenceLine y={3000} stroke="#0ea5e9" strokeDasharray="3 3" opacity={0.4} />
                  <Bar dataKey="amount" fill="#0ea5e9" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
              <div className="absolute right-3 top-3 text-[8.5px] font-mono font-bold text-sky-400 bg-zinc-900 px-2 py-0.5 border border-sky-500/15 rounded uppercase">3000ML OPTIMAL</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. SLEEP DECK */}
      {subCategory === 'sleep' && (
        <motion.div 
          key="sleep"
          initial={{ opacity: 0, x: -15, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          exit={{ opacity: 0, x: 15, scale: 0.98, transition: { duration: 0.15 } }}
          className="space-y-6" id="sleep-section"
        >
          {/* Log Form */}
          <form onSubmit={handleLogSleep} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-sm">
            <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Moon className="w-4.5 h-4.5 text-rose-400" />
              LOG SLEEPMETER INTERVAL
            </h3>

            {/* High Contrast Sleep Standard Banner */}
            <div className="bg-rose-505/10 border border-rose-500/20 p-3.5 rounded-2xl flex justify-between items-center text-xs text-zinc-200">
              <span className="font-bold">RECOMMENDED SLEEP STANDARD:</span>
              <span className="font-mono bg-rose-500/15 text-rose-400 border border-rose-500/25 px-2.5 py-1 rounded-xl font-bold">8.0 HOURS/DAY</span>
            </div>
 
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                  Duration (Hours)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  min={1}
                  max={24}
                  className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none"
                  required
                />
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                  Quality Score
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setSleepQuality(val)}
                      className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        sleepQuality === val
                          ? 'bg-rose-500/20 border-rose-500/30 text-rose-404 font-black'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
 
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                Dream Diagnostics / Status
              </label>
              <textarea
                value={sleepNotes}
                onChange={(e) => setSleepNotes(e.target.value)}
                placeholder="Deep sleep, high dream recall, zero wakeups..."
                rows={2}
                className="w-full text-xs font-medium text-white bg-zinc-950 border border-zinc-805 rounded-xl px-3.5 py-3.5 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none placeholder:text-zinc-600"
              />
            </div>
 
            <button
              type="submit"
              className="w-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-450 border border-rose-500/30 text-xs font-bold py-3.5 rounded-2xl transition-all cursor-pointer"
            >
              SAVE SLEEPMETER METRICS
            </button>
          </form>
 
          {/* VISUAL CHART - Sleep Lines */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4 text-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-mono text-rose-400 font-bold block">
                  7-Day Analysis • Avg: {(last7Dates.reduce((acc, dateStr) => acc + (sleepLogs.find(s => s.date === dateStr)?.actualHours || 0), 0) / 7).toFixed(1)} hrs / day
                </span>
                <h3 className="text-sm font-bold font-sans text-white tracking-tight mt-0.5">
                  Sleep Duration Variance
                </h3>
              </div>
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-mono px-2.5 py-1 rounded-xl font-bold">
                INDEX METRIC
              </span>
            </div>
 
            {/* Recharts Sleep Area Chart */}
            <div className="w-full h-44 bg-zinc-900/50 rounded-2xl p-4.5 border border-zinc-800/60 relative mt-1 overflow-hidden">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={last7Dates.map(dateStr => ({
                   name: getWeekDayName(dateStr),
                   hours: sleepLogs.find(s => s.date === dateStr)?.actualHours || 0
                 }))}>
                   <defs>
                     <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                   <Tooltip cursor={{ stroke: 'rgba(244, 63, 94, 0.2)', strokeWidth: 2 }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#fb7185' }} itemStyle={{ color: '#fb7185' }} formatter={(value: number) => [`${value} hrs`, 'Duration']} />
                   <ReferenceLine y={8} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.5} />
                   <Area type="monotone" dataKey="hours" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                 </AreaChart>
               </ResponsiveContainer>
               <div className="absolute left-3 top-3 text-[8px] font-mono font-bold text-rose-400 bg-zinc-900 border border-rose-500/20 px-2 py-0.5 rounded uppercase">8.0 HRS STANDARD</div>
            </div>
 
            {/* Historical logs checklist */}
            <div className="space-y-2 mt-4 pt-4 border-t border-zinc-851/50">
              <h4 className="text-[10px] font-mono tracking-wider font-bold uppercase text-zinc-500">Biological Sleep Log</h4>
              {sleepLogs.length === 0 ? (
                <p className="text-[10px] text-zinc-650 font-bold italic text-left">No sleeping cycles registered</p>
              ) : (
                <motion.div 
                  initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                  className="max-h-28 overflow-y-auto space-y-2 pr-1 text-xs scrollbar-thin"
                >
                  <AnimatePresence>
                  {sleepLogs.slice().reverse().map((log) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      key={log.id} 
                      className="bg-zinc-900/50 border border-zinc-800/60 p-3 rounded-2xl flex justify-between items-center text-white"
                    >
                      <div>
                        <span className="font-bold text-[10px] font-mono text-zinc-500 mr-2">{log.date}</span>
                        <span className="font-extrabold text-rose-400 text-xs">{log.actualHours} hrs</span>
                        <span className="text-[9.5px] text-zinc-400 font-bold ml-2.5 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-lg">Quality Score: {log.qualityRating}/5</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeleteSleep(log.id); }}
                        className="text-zinc-550 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                        title="Delete this sleep record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. WORKOUTS DECK */}
      {subCategory === 'workout' && (
        <motion.div 
          key="workout"
          initial={{ opacity: 0, x: -15, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          exit={{ opacity: 0, x: 15, scale: 0.98, transition: { duration: 0.15 } }}
          className="space-y-6" id="workout-section"
        >
          <form onSubmit={handleLogWorkout} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-sm">
            <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
              LOG EXERCISE PROTOCOL
            </h3>
 
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                  Workout Category
                </label>
                <select
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 focus:border-emerald-500 outline-none"
                >
                  <option value="Running">Cardio Running</option>
                  <option value="Cycling">Outdoor Cycling</option>
                  <option value="Strength Gym">Strength & Lifting</option>
                  <option value="Ashtanga Yoga">Restorative Yoga</option>
                  <option value="HIIT Conditioning">HIIT Metabolic</option>
                  <option value="Swimming">Swimming</option>
                </select>
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  value={workoutDuration}
                  onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                  min={5}
                  max={300}
                  className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>
 
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                  Intensity
                </label>
                <div className="grid grid-cols-3 gap-1.5 py-1">
                  {(['low', 'moderate', 'high'] as const).map((it) => (
                    <button
                      type="button"
                      key={it}
                      onClick={() => setWorkoutIntensity(it)}
                      className={`text-[9px] font-bold py-2 rounded-xl border uppercase tracking-wider text-center transition-all cursor-pointer ${
                        workoutIntensity === it
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 font-extrabold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                      }`}
                    >
                      {it}
                    </button>
                  ))}
                </div>
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                  Est. Calories (kcal)
                </label>
                <input
                  type="number"
                  value={workoutCalories}
                  onChange={(e) => setWorkoutCalories(Number(e.target.value))}
                  min={0}
                  className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-3 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>
 
            <button
              type="submit"
              className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold py-3.5 rounded-2xl transition-all cursor-pointer"
            >
              STORE WORKOUT SESSION
            </button>
          </form>
 
          {/* Workout History list */}
          <div className="space-y-3.5 bg-zinc-950 border border-zinc-900 rounded-3xl p-5 text-white shadow-sm">
            <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider text-left border-b border-zinc-800/80 pb-2">
              Registered Workout Indices
            </h3>
 
            {workoutLogs.length === 0 ? (
              <div className="border border-dashed border-zinc-800 bg-zinc-950 p-6 rounded-2xl text-center">
                <p className="text-xs text-zinc-500 font-bold italic">No exercise routines captured today</p>
              </div>
            ) : (
              <motion.div 
                initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin"
              >
                <AnimatePresence>
                {workoutLogs.slice().reverse().map((wo) => {
                  const badgeColor = wo.intensity === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : wo.intensity === 'moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-505/20';
                  
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      key={wo.id} 
                      className="bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-3 flex justify-between items-center"
                    >
                      <div className="text-left text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white">{wo.type}</span>
                          <span className={`text-[8.5px] uppercase tracking-widest px-2 py-0.5 rounded-full border font-mono font-bold ${badgeColor}`}>
                            {wo.intensity}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono tracking-tight font-bold pt-0.5">
                          {wo.date} • {wo.durationMinutes} min • {wo.caloriesBurned || 0} kcal
                        </p>
                      </div>
 
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteWorkout(wo.id); }}
                        className="p-1.5 rounded-lg text-zinc-550 hover:text-rose-450 hover:bg-zinc-900 cursor-pointer transition-colors"
                        title="Delete this workout log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
 
      {/* 4. BIOMETRICS DECK */}
      {subCategory === 'stats' && (
        <motion.div 
          key="stats"
          initial={{ opacity: 0, x: -15, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }}
          exit={{ opacity: 0, x: 15, scale: 0.98, transition: { duration: 0.15 } }}
          className="space-y-6" id="stats-section"
        >
          {/* Form */}
          <form onSubmit={handleLogHealthStats} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4 text-zinc-100 shadow-sm">
            <h3 className="text-xs font-bold font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4.5 h-4.5 text-indigo-400" />
              LOG BIOLOGIC INDICES
            </h3>
 
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  min={10}
                  max={500}
                  className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-3 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                  Systolic BP
                </label>
                <input
                  type="number"
                  value={sysBp}
                  onChange={(e) => setSysBp(Number(e.target.value))}
                  min={50}
                  max={250}
                  className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-3 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
 
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                  Diastolic BP
                </label>
                <input
                  type="number"
                  value={diaBp}
                  onChange={(e) => setDiaBp(Number(e.target.value))}
                  min={30}
                  max={170}
                  className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-3 focus:border-indigo-500 outline-none"
                  required
                />
              </div>
            </div>
 
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                Resting Heart Rate (BPM)
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                min={30}
                max={220}
                className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 focus:border-indigo-500 outline-none"
                required
              />
            </div>
 
            <button
              type="submit"
              className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 text-xs font-bold py-3.5 rounded-2xl transition-all cursor-pointer"
            >
              SAVE BIOMETRICS DATASET
            </button>
          </form>
 
          {/* VISUAL CHART - WEIGHT INDEX */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4 text-white shadow-sm">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 font-bold block">
                  7-Day Analysis
                </span>
                <h3 className="text-sm font-bold font-sans text-white tracking-tight mt-0.5">
                  Weight Metric Index
                </h3>
              </div>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-mono px-2.5 py-1 rounded-xl font-bold">
                BIOL VALUE
              </span>
            </div>
 
            {/* Recharts Line tracker */}
            <div className="w-full h-36 bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/60 relative overflow-hidden">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={last7Dates.map(dateStr => ({
                   name: getWeekDayName(dateStr),
                   weight: healthStats.find(h => h.date === dateStr)?.weightKg || null
                 }))}>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#71717a', fontWeight: 'bold' }} dy={10} />
                   <Tooltip cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }} contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#818cf8' }} itemStyle={{ color: '#818cf8' }} formatter={(value: number) => [`${value} kg`, 'Weight']} />
                   <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#18181b' }} activeDot={{ r: 6, fill: '#818cf8' }} connectNulls />
                 </LineChart>
               </ResponsiveContainer>
            </div>
 

          </div>
 
          {/* Biometrics Log Checklist */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-3.5 text-white shadow-sm">
            <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider text-left border-b border-zinc-851/50 pb-2">
              Historical Biometrics Dataset Logs
            </h3>
            {healthStats.length === 0 ? (
              <p className="text-[10px] text-zinc-650 font-bold italic py-2 text-center">No biometrics data logged yet</p>
            ) : (
              <motion.div 
                initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
                className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs scrollbar-thin text-left"
              >
                <AnimatePresence>
                {healthStats.slice().reverse().map((stat) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    key={stat.id} 
                    className="bg-zinc-900/50 border border-zinc-800/60 p-3.5 rounded-2xl flex justify-between items-center text-white"
                  >
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-[9.5px] text-zinc-500 font-bold">{stat.date}</span>
                        <span className="bg-indigo-500/10 text-indigo-400 text-[9px] px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold uppercase font-mono">
                          {stat.weightKg || '--'} kg
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-bold font-mono">
                        Pulse BP: {stat.restingHeartRateBpm || '--'} BPM • {stat.systolicBp || '--'}/{stat.diastolicBp || '--'} mmHg
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteHealthStat(stat.id); }}
                      className="text-zinc-550 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                      title="Delete this entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
