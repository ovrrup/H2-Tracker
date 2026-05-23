import React, { useState } from 'react';
import { Plus, Trash2, Check, Clock, Calendar, Star, Info, Target, ListFilter, AlertCircle } from 'lucide-react';
import { Habit } from '../types';
import { saveHabits } from '../lib/storage';
import { triggerHaptic } from '../lib/haptic';
import { motion, AnimatePresence } from 'motion/react';

interface HabitsManagerProps {
  habits: Habit[];
  onDataRefresh: () => void;
  triggerNotification: (title: string, body: string) => void;
}

export default function HabitsManager({
  habits,
  onDataRefresh,
  triggerNotification,
}: HabitsManagerProps) {
  // Habit creation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [category, setCategory] = useState<'fitness' | 'nutrition' | 'mind' | 'productivity' | 'custom'>('fitness');
  const [reminderTime, setReminderTime] = useState('08:00');
  
  // Tag Filter state
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Generate last 7 days list for history grid
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const formatDateStr = (date: Date) => date.toISOString().split('T')[0];
  const formatDayLabel = (date: Date) => date.toLocaleDateString([], { weekday: 'narrow' });

  // Handle Habit completion toggle
  const toggleHabitOnDate = (habitId: string, dateStr: string) => {
    const updatedHabits = habits.map((h) => {
      if (h.id === habitId) {
        const isCompleted = h.completedDates.includes(dateStr);
        let dates = [...h.completedDates];
        if (isCompleted) {
          dates = dates.filter((d) => d !== dateStr);
        } else {
          dates.push(dateStr);
        }

        let streak = h.streak;
        if (!isCompleted && dateStr === formatDateStr(new Date())) {
          streak = Math.max(1, streak + 1);
        } else if (isCompleted && dateStr === formatDateStr(new Date())) {
          streak = Math.max(0, streak - 1);
        }

        return {
          ...h,
          completedDates: dates,
          streak,
        };
      }
      return h;
    });

    saveHabits(updatedHabits);
    onDataRefresh();
  };

  // Add a new Habit
  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newHabit: Habit = {
      id: `habit_${Date.now()}`,
      name: name.trim(),
      frequency,
      category,
      createdAt: new Date().toISOString(),
      completedDates: [],
      streak: 0,
      reminderTime,
    };

    const updatedHabits = [...habits, newHabit];
    saveHabits(updatedHabits);
    onDataRefresh();

    setName('');
    setFrequency('daily');
    setCategory('fitness');
    setReminderTime('08:00');
    setShowAddForm(false);

    triggerNotification(
      'New Habit Programmed! 📅',
      `Habit "${newHabit.name}" successfully created with reminder at ${reminderTime}.`
    );
  };

  // Delete Habit
  const handleDeleteHabit = (habitId: string) => {
    triggerHaptic('medium');
    const updatedHabits = habits.filter((h) => h.id !== habitId);
    saveHabits(updatedHabits);
    onDataRefresh();
  };

  const filteredHabits = filterCategory === 'all' 
    ? habits 
    : habits.filter((h) => h.category === filterCategory);

  return (
    <div className="flex-1 p-5 lg:p-8 space-y-6 flex flex-col justify-start w-full max-w-4xl mx-auto select-none" id="habits-manager-root">
      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white font-sans tracking-tight">Routines.</h1>
          <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono font-bold">MANAGE YOUR DAILY HABITS</p>
        </div>
        
        {/* Utility trigger to add */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-white hover:text-black font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Routine</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleCreateHabit}
          className="bg-zinc-950 p-6 rounded-3xl border border-zinc-900 space-y-4 text-white animate-fade-in shadow-sm"
        >
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 uppercase font-mono">
            <Target className="w-4 h-4 text-indigo-400" />
            CONSTRUCT HABIT
          </h3>

          <div className="space-y-1">
            <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
              Habit Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cardio Session, Read 10 Pages..."
              className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-zinc-600"
              maxLength={40}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 focus:border-indigo-500 outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                Alarm Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 focus:border-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
              Category Tag
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['fitness', 'nutrition', 'mind', 'productivity', 'custom'] as const).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[9px] font-bold py-2.5 rounded-xl border text-center uppercase tracking-wider transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400 font-extrabold'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 text-[11px] font-bold text-zinc-400 bg-zinc-950 border border-transparent py-3 rounded-xl cursor-pointer hover:bg-zinc-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 text-[11px] font-bold text-indigo-400 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 py-3 rounded-xl cursor-pointer"
            >
              INITIALIZE HABIT
            </button>
          </div>
        </form>
      )}

      {/* Category filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none" id="habits-filters">
        <ListFilter className="w-4 h-4 text-zinc-500 shrink-0" />
        {['all', 'fitness', 'nutrition', 'mind', 'productivity', 'custom'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-2 text-[9px] font-bold uppercase tracking-wider rounded-xl border transition-all cursor-pointer shrink-0 ${
              filterCategory === cat
                ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habits Checklist Panel */}
      {filteredHabits.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="border border-dashed border-zinc-800 bg-zinc-900/40 rounded-3xl p-8 text-center flex-1 flex flex-col justify-center items-center">
          <AlertCircle className="w-6 h-6 text-zinc-600 mb-2" />
          <p className="text-sm font-bold text-zinc-400 leading-none">
            No routines registered yet
          </p>
          <p className="text-xs text-zinc-600 mt-2 max-w-[260px] mx-auto leading-relaxed">
            Construct a custom habit routine with the **New Habit** button to start tracking.
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } }
          }} 
          className="space-y-4 flex-1 overflow-y-auto pr-0.5 scrollbar-thin"
        >
          <AnimatePresence>
          {filteredHabits.map((habit) => {
            const todayStr = formatDateStr(new Date());
            const isCompletedToday = habit.completedDates.includes(todayStr);

            let accentTheme = 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
            if (habit.category === 'fitness') {
              accentTheme = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            } else if (habit.category === 'nutrition') {
              accentTheme = 'bg-sky-500/10 border-sky-500/20 text-sky-400';
            } else if (habit.category === 'mind') {
              accentTheme = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
            } else if (habit.category === 'productivity') {
              accentTheme = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
            } else {
              accentTheme = 'bg-violet-500/10 border-violet-500/20 text-violet-400';
            }

            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4 group transition-all shadow-sm"
              >
                <div className="flex gap-4 items-start justify-between">
                  <div className="flex-1">
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-lg border ${accentTheme}`}>
                      {habit.category} • {habit.frequency}
                    </span>
                    <h3 className={`text-sm font-black mt-2 tracking-tight ${isCompletedToday ? 'line-through text-zinc-600' : 'text-zinc-100'}`}>
                      {habit.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteHabit(habit.id); }}
                      className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 transition-all cursor-pointer relative z-40"
                      title="Delete Habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-bold border-t border-zinc-800/80 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Alarm: {habit.reminderTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400/80 font-mono">
                    <Star className="w-3 h-3 fill-amber-400/50" />
                    <span>STREAK: {habit.streak}</span>
                  </div>
                </div>

                <div className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/60 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase text-zinc-500">
                    <span>7 DAYS TRACKER</span>
                    <span className="text-emerald-400/80 flex items-center gap-1 border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <span>✓</span> {habit.completedDates.length} Days total
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1.5 pt-0.5">
                    {last7Days.map((day) => {
                      const dayStr = formatDateStr(day);
                      const isDone = habit.completedDates.includes(dayStr);
                      const isToday = dayStr === todayStr;

                      return (
                        <div
                          key={dayStr}
                          onClick={() => toggleHabitOnDate(habit.id, dayStr)}
                          className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all cursor-pointer ${
                            isDone 
                              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                              : isToday 
                              ? 'bg-zinc-900 border-zinc-700 text-zinc-300'
                              : 'bg-zinc-900/40 border-zinc-800 text-zinc-600 hover:bg-zinc-800'
                          }`}
                          title={`Click to mark ${day.toLocaleDateString()}`}
                        >
                          <span className={`${isDone ? 'text-emerald-400' : 'text-zinc-550'} text-[8.5px] font-bold uppercase font-mono tracking-tight leading-none mb-1`}>
                            {formatDayLabel(day)}
                          </span>
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isDone ? 'border-emerald-500 bg-emerald-500/20' : 'border-zinc-700 bg-zinc-900'
                          }`}>
                            {isDone && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
