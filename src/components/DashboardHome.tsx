/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, GlassWater, Moon, Flame, Trophy, Plus, CheckCircle, Circle, AlertCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit, Goal, DailyWaterLog, SleepLog, WorkoutLog, HealthStat } from '../types';
import { saveWaterLogs, saveHabits } from '../lib/storage';

interface DashboardHomeProps {
  habits: Habit[];
  goals: Goal[];
  waterLogs: DailyWaterLog[];
  sleepLogs: SleepLog[];
  workoutLogs: WorkoutLog[];
  healthStats: HealthStat[];
  onDataRefresh: () => void;
  triggerNotification: (title: string, body: string) => void;
}

export default function DashboardHome({
  habits,
  goals,
  waterLogs,
  sleepLogs,
  workoutLogs,
  healthStats,
  onDataRefresh,
  triggerNotification,
}: DashboardHomeProps) {
  // Today date formatting
  const today = new Date();
  const todayDateStr = today.toISOString().split('T')[0];
  const dateHeading = today.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Today's Water Stats
  const todayWaterLog = waterLogs.find((w) => w.date === todayDateStr) || {
    date: todayDateStr,
    entries: [],
    dailyGoalMl: 3000,
  };
  const todayWaterIntake = todayWaterLog.entries.reduce((acc, entry) => acc + entry.amountMl, 0);
  const waterProgress = Math.min(100, Math.round((todayWaterIntake / todayWaterLog.dailyGoalMl) * 100));

  // Today's Sleep Stats
  const todaySleepLog = sleepLogs.find((s) => s.date === todayDateStr);

  // Today's Workouts
  const todayWorkout = workoutLogs.find((w) => w.date === todayDateStr);

  // Habits finished today
  const todayCompletedHabitsCount = habits.filter((h) => h.completedDates.includes(todayDateStr)).length;
  const totalHabitsCount = habits.length;
  const habitsProgress = totalHabitsCount > 0 ? Math.round((todayCompletedHabitsCount / totalHabitsCount) * 100) : 0;

  // Handles adding water dynamically
  const addWater = (amount: number) => {
    let updatedLogs = [...waterLogs];
    const logIndex = updatedLogs.findIndex((w) => w.date === todayDateStr);

    const newEntry = {
      id: `w_e_${Date.now()}`,
      amountMl: amount,
      loggedAt: new Date().toISOString(),
    };

    if (logIndex !== -1) {
      updatedLogs[logIndex] = {
        ...updatedLogs[logIndex],
        entries: [...updatedLogs[logIndex].entries, newEntry],
      };
    } else {
      updatedLogs.push({
        date: todayDateStr,
        dailyGoalMl: 3000,
        entries: [newEntry],
      });
    }

    saveWaterLogs(updatedLogs);
    onDataRefresh();
    triggerNotification('Water Logged 💧', `Successfully tracked +${amount}ml of water goal!`);
  };

  // Toggle quick habit completion
  const toggleHabit = (habitId: string) => {
    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        const isCompleted = h.completedDates.includes(todayDateStr);
        let dates = [...h.completedDates];
        if (isCompleted) {
          dates = dates.filter((d) => d !== todayDateStr);
        } else {
          dates.push(todayDateStr);
        }

        // recalculate streak simple rule
        let currentStreak = h.streak;
        if (!isCompleted) {
          currentStreak += 1;
        } else {
          currentStreak = Math.max(0, currentStreak - 1);
        }

        return {
          ...h,
          completedDates: dates,
          streak: currentStreak,
        };
      }
      return h;
    });

    saveHabits(updatedHabits);
    onDataRefresh();
    
    const targetHabit = habits.find(h => h.id === habitId);
    if (targetHabit && !targetHabit.completedDates.includes(todayDateStr)) {
      triggerNotification('Habit Completed! 🎯', `Marked "${targetHabit.name}" complete for today!`);
    }
  };

  // SVG parameters for water ring
  const ringRadius = 50;
  const ringStroke = 10;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (waterProgress / 100) * ringCircumference;

  return (
    <div className="flex-1 p-5 lg:p-8 flex flex-col justify-start w-full max-w-4xl mx-auto" id="dashboard-container">
      {/* Header */}
      <div className="mb-8 space-y-1">
        <h1 className="text-3xl font-black text-white font-sans tracking-tight">Overview.</h1>
        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono font-bold">{dateHeading}</p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-8">
        {/* WATER TRACKER WIDGET */}
        <div className="bg-zinc-950 p-4.5 rounded-3xl border border-zinc-900 flex flex-col justify-between relative shadow-sm min-h-[8.5rem]">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[9px] uppercase font-extrabold tracking-widest font-mono text-sky-500/70">Hydration</span>
            <GlassWater className="w-3.5 h-3.5 text-sky-500/70" />
          </div>
          <div className="text-white text-2xl font-black font-sans tracking-tight mb-3">
            {(todayWaterIntake / 1000).toFixed(1)} <span className="text-xs font-bold text-zinc-600">/ 3.0 L</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-3">
             <div className="h-full bg-sky-500 rounded-full transition-all duration-700" style={{width: `${waterProgress}%`}}></div>
          </div>
          <div className="flex gap-1.5 mt-auto w-full">
            <button onClick={() => addWater(250)} className="flex-1 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 py-1.5 rounded-xl text-[9px] font-bold font-mono transition-colors uppercase border border-zinc-800/60">+250ml</button>
            <button onClick={() => addWater(500)} className="flex-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 py-1.5 rounded-xl text-[9px] font-bold font-mono transition-colors uppercase border border-sky-500/20">+500ml</button>
          </div>
        </div>

        {/* HABIT COUNTER WIDGET */}
        <div className="bg-zinc-950 p-4.5 rounded-3xl border border-zinc-900 flex flex-col justify-between relative shadow-sm min-h-[8.5rem]">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[9px] uppercase font-extrabold tracking-widest font-mono text-purple-500/70">Routines</span>
            <Trophy className="w-3.5 h-3.5 text-purple-500/70" />
          </div>
          <div className="text-white text-2xl font-black font-sans tracking-tight mb-3">
            {todayCompletedHabitsCount} <span className="text-xs font-bold text-zinc-600">/ {totalHabitsCount}</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-3">
             <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{width: `${habitsProgress}%`}}></div>
          </div>
          <div className="mt-auto text-[9px] font-mono font-bold uppercase text-zinc-500 tracking-wider">
            {todayCompletedHabitsCount === totalHabitsCount && totalHabitsCount > 0 ? 'All completed!' : 'Actions remaining'}
          </div>
        </div>

        {/* SLEEP WIDGET */}
        <div className="bg-zinc-950 p-4.5 rounded-3xl border border-zinc-900 flex flex-col justify-between relative shadow-sm min-h-[8.5rem]">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[9px] uppercase font-extrabold tracking-widest font-mono text-rose-500/70">Recovery</span>
            <Moon className="w-3.5 h-3.5 text-rose-500/70" />
          </div>
          <div className="text-white text-2xl font-black font-sans tracking-tight mb-3">
            {todaySleepLog ? todaySleepLog.actualHours : '--'} <span className="text-xs font-bold text-zinc-600 tracking-normal">hrs</span>
          </div>
          <div className="mt-auto flex justify-between items-center text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider w-full border-t border-zinc-900 pt-3">
            <span>Score:</span>
            <span>{todaySleepLog?.qualityRating || 0}/5</span>
          </div>
        </div>

        {/* EXERCISE WIDGET */}
        <div className="bg-zinc-950 p-4.5 rounded-3xl border border-zinc-900 flex flex-col justify-between relative shadow-sm min-h-[8.5rem]">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-[9px] uppercase font-extrabold tracking-widest font-mono text-emerald-500/70">Activity</span>
            <Flame className="w-3.5 h-3.5 text-emerald-500/70" />
          </div>
          <div className="text-white text-xl font-black font-sans tracking-tight mb-3 truncate pr-2">
            {todayWorkout ? todayWorkout.type : 'Rest'}
          </div>
          <div className="mt-auto text-[9px] font-mono font-bold text-emerald-500 truncate border-t border-zinc-900 pt-3 uppercase tracking-wider">
             {todayWorkout ? `${todayWorkout.durationMinutes}m • ${todayWorkout.caloriesBurned}kc` : 'No logs today'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* ACTIVE HABITS LIST */}
        <div className="space-y-3.5">
          <h2 className="text-[10px] font-black text-zinc-500 font-mono tracking-widest uppercase mb-1">
            Agenda
          </h2>

          {habits.length === 0 ? (
            <div className="bg-zinc-950 border border-dashed border-zinc-900 p-6 rounded-3xl text-center">
              <p className="text-[11px] font-bold text-zinc-500">No routines defined.</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              className="space-y-2.5 bg-zinc-950 border border-zinc-900 p-3 rounded-3xl"
            >
              <AnimatePresence>
              {habits.slice(0, 4).map((habit) => {
                const isCompleted = habit.completedDates.includes(todayDateStr);
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, x: -10, scale: 0.98 },
                      visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => toggleHabit(habit.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-zinc-950 border border-transparent text-zinc-600'
                        : 'bg-zinc-900/50 border border-zinc-800/60 hover:bg-zinc-900/80 text-zinc-100 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div>
                        {isCompleted ? (
                          <CheckCircle className="w-4.5 h-4.5 text-zinc-600 shrink-0" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 text-zinc-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className={`text-xs font-bold tracking-tight ${isCompleted ? 'line-through text-zinc-600' : 'text-white'}`}>
                          {habit.name}
                        </span>
                        <span className="text-[9.5px] text-zinc-500 font-mono font-bold mt-0.5 uppercase">
                          🔥 {habit.streak} • {habit.reminderTime}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* GOALS SUMMARY */}
        <div className="space-y-3.5">
          <h2 className="text-[10px] font-black text-zinc-500 font-mono tracking-widest uppercase mb-1">
            Focus Tracks
          </h2>

          {goals.filter(g => !g.isCompleted).length === 0 ? (
            <div className="bg-zinc-950 border border-dashed border-zinc-900 p-6 rounded-3xl text-center">
              <p className="text-[11px] font-bold text-zinc-500">No active goals running.</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
              className="space-y-3"
            >
              <AnimatePresence>
              {goals.filter(g => !g.isCompleted).slice(0, 3).map((goal) => {
                const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
                return (
                  <motion.div 
                    layout
                    variants={{
                      hidden: { opacity: 0, x: -10, scale: 0.98 },
                      visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={goal.id} 
                    className="bg-zinc-950 border border-zinc-900 rounded-3xl p-4.5 space-y-3 shadow-sm relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                    <div className="flex items-center justify-between text-xs font-bold pl-2">
                      <span className="text-zinc-100">{goal.title}</span>
                      <span className="text-indigo-400 font-mono font-bold text-[10px]">{pct}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden ml-2 w-[calc(100%-12px)]">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-750"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-zinc-500 font-bold font-mono pl-2">
                      <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                      <span className="uppercase">Due: {goal.deadline}</span>
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
