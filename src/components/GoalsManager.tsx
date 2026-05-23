import React, { useState } from 'react';
import { Plus, Trash2, Calendar, CheckSquare, Square, ChevronRight, MessageSquare, ListTodo, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { Goal } from '../types';
import { saveGoals } from '../lib/storage';
import { triggerHaptic } from '../lib/haptic';
import { motion, AnimatePresence } from 'motion/react';

interface GoalsManagerProps {
  goals: Goal[];
  onDataRefresh: () => void;
  triggerNotification: (title: string, body: string) => void;
}

export default function GoalsManager({
  goals,
  onDataRefresh,
  triggerNotification,
}: GoalsManagerProps) {
  // Goals form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetValue, setTargetValue] = useState(1);
  const [currentValue, setCurrentValue] = useState(0);
  const [unit, setUnit] = useState('times');
  const [category, setCategory] = useState<'fitness' | 'health' | 'learning' | 'personal' | 'life'>('fitness');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]);

  // Tab filters
  const [goalsTab, setGoalsTab] = useState<'active' | 'completed'>('active');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetValue <= 0) return;

    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      title: title.trim(),
      targetValue,
      currentValue: Math.min(targetValue, Math.max(0, currentValue)),
      unit: unit.trim() || 'units',
      category,
      deadline,
      createdAt: new Date().toISOString(),
      isCompleted: currentValue >= targetValue,
    };

    const updatedGoals = [...goals, newGoal];
    saveGoals(updatedGoals);
    onDataRefresh();

    // Reset Form
    setTitle('');
    setTargetValue(1);
    setCurrentValue(0);
    setUnit('times');
    setCategory('fitness');
    setShowAddForm(false);

    triggerNotification(
      'Target Benchmark Established! 🎯',
      `Goal "${newGoal.title}" has been registered. Target value: ${targetValue} ${unit}.`
    );
  };

  const handleProgressChange = (e: React.MouseEvent, goalId: string, delta: number) => {
    e.stopPropagation();
    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        const newVal = Math.min(g.targetValue, Math.max(0, g.currentValue + delta));
        const isCompletedNow = newVal >= g.targetValue;
        
        if (isCompletedNow && !g.isCompleted) {
          triggerNotification(
            'Goal Accomplished! 🎉',
            `Outstanding achievement! You have completed the objective: "${g.title}"!`
          );
        }

        return {
          ...g,
          currentValue: newVal,
          isCompleted: isCompletedNow,
        };
      }
      return g;
    });

    saveGoals(updatedGoals);
    onDataRefresh();
  };

  const toggleGoalStatus = (e: React.MouseEvent, goalId: string) => {
    e.stopPropagation();
    const updatedGoals = goals.map((g) => {
      if (g.id === goalId) {
        const isCompleted = !g.isCompleted;
        const currentVal = isCompleted ? g.targetValue : 0;
        
        if (isCompleted) {
          triggerNotification(
            'Goal Accomplished! 🎉',
            `Outstanding achievement! You have completed: "${g.title}"!`
          );
        }

        return {
          ...g,
          isCompleted,
          currentValue: currentVal,
        };
      }
      return g;
    });

    saveGoals(updatedGoals);
    onDataRefresh();
  };

  const handleDeleteGoal = (goalId: string) => {
    triggerHaptic('medium');
    const updatedGoals = goals.filter((g) => g.id !== goalId);
    saveGoals(updatedGoals);
    onDataRefresh();
  };

  const filteredGoals = goals.filter((g) => 
    goalsTab === 'active' ? !g.isCompleted : g.isCompleted
  );

  const getDaysRemainingStr = (deadlineStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(deadlineStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today deadline';
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    return `${diffDays} days left`;
  };

  return (
    <div className="flex-1 p-5 lg:p-8 space-y-6 flex flex-col justify-start w-full max-w-4xl mx-auto select-none" id="goals-manager-root">
      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white font-sans tracking-tight">Focus Tracks.</h1>
          <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-mono font-bold">ACHIEVE STRATEGIC MILESTONES</p>
        </div>
        
        {/* Utility trigger to add */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-white hover:text-black font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Focus</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleCreateGoal}
          className="bg-zinc-950 p-6 rounded-3xl border border-zinc-900 space-y-4 text-white animate-fade-in shadow-sm"
        >
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 uppercase font-mono">
            <Layers className="w-4 h-4 text-amber-400" />
            REGISTER STRATEGIC OBJECTIVE
          </h3>

          <div className="space-y-1">
            <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
              Goal Objective
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lose 5kg weight, Run 100km total..."
              className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none placeholder:text-zinc-600"
              maxLength={70}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                Target Value
              </label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                min={1}
                className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 focus:border-amber-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                Starting Val
              </label>
              <input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(Number(e.target.value))}
                min={0}
                className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 focus:border-amber-500 outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                Unit Metric
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, km, steps"
                className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 focus:border-amber-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                Sector
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-3 focus:border-amber-500 outline-none"
              >
                <option value="fitness">Fitness / Workout</option>
                <option value="health">Health Indices</option>
                <option value="learning">Self Learning</option>
                <option value="personal">Personal Routine</option>
                <option value="life">Lifespan Indices</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-wider font-extrabold text-zinc-500 uppercase">
                Target Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs font-bold text-white bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 focus:border-amber-500 outline-none whitespace-nowrap"
                required
              />
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 text-[11px] font-bold text-zinc-400 bg-zinc-950 border border-transparent py-3 rounded-xl hover:bg-zinc-900 cursor-pointer"
            >
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 text-[11px] font-bold text-amber-400 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 py-3 rounded-xl cursor-pointer"
            >
              ESTABLISH OBJECTIVE
            </button>
          </div>
        </form>
      )}

      {/* Selector Tabs: Active vs Completed */}
      <div className="flex bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800/80" id="goals-tab-headers">
        <button
          onClick={() => setGoalsTab('active')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-xl tracking-wider transition-all cursor-pointer ${
            goalsTab === 'active'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Active Targets ({goals.filter((g) => !g.isCompleted).length})
        </button>
        <button
          onClick={() => setGoalsTab('completed')}
          className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-xl tracking-wider transition-all cursor-pointer ${
            goalsTab === 'completed'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Completed ({goals.filter((g) => g.isCompleted).length})
        </button>
      </div>

      {/* Milestones dynamic renderer */}
      {filteredGoals.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="border border-dashed border-zinc-800 bg-zinc-900/40 rounded-3xl p-8 text-center flex-1 flex flex-col justify-center items-center select-none">
          {goalsTab === 'active' ? (
            <>
              <ListTodo className="w-6 h-6 text-zinc-600 mb-2" />
              <p className="text-sm font-bold text-zinc-400 leading-none">
                No active targets set
              </p>
              <p className="text-xs text-zinc-600 mt-2 max-w-[260px] mx-auto leading-relaxed">
                Create custom milestones to accelerate long-term motivation.
              </p>
            </>
          ) : (
            <>
              <Sparkles className="w-6 h-6 text-zinc-600 mb-2" />
              <p className="text-sm font-bold text-zinc-400 leading-none">
                No completed achievements yet
              </p>
              <p className="text-xs text-zinc-600 mt-2 max-w-[260px] mx-auto leading-relaxed">
                Reach 100% completion on active targets to see them listed here!
              </p>
            </>
          )}
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
          {filteredGoals.map((goal) => {
            const progressPercent = Math.min(
              100,
              Math.max(0, Math.round((goal.currentValue / goal.targetValue) * 100))
            );

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4 relative overflow-hidden group shadow-sm"
              >
                {/* Visual Category line banner */}
                <div className="absolute top-0 left-0 w-full h-1 bg-zinc-950">
                  <div
                    className={`${goal.isCompleted ? 'bg-emerald-400' : 'bg-amber-400'} h-full transition-all duration-500`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                <div className="flex gap-4 justify-between items-start pt-1">
                  <div className="flex gap-3 items-start">
                    {/* Tick checkbox status */}
                    <button
                      onClick={(e) => toggleGoalStatus(e, goal.id)}
                      className={`p-1 mt-0.5 hover:scale-110 transition-all cursor-pointer ${goal.isCompleted ? 'text-emerald-400' : 'text-zinc-600 hover:text-amber-400'}`}
                    >
                      {goal.isCompleted ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-400">
                        {goal.category}
                      </span>
                      <h3 className={`text-sm font-black mt-2 tracking-tight ${goal.isCompleted ? 'line-through text-zinc-600' : 'text-white'}`}>
                        {goal.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }}
                    className="p-1.5 rounded-lg border border-transparent hover:border-rose-500/20 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-600 transition-all cursor-pointer relative z-40 shrink-0"
                    title="Remove Objective"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar and adjustments */}
                <div className="space-y-3">
                  <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/60 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider font-bold">Progress Status</span>
                      <span className="text-sm font-black text-white font-mono mt-0.5">
                        {goal.currentValue} <span className="text-zinc-500 font-bold text-xs">{goal.unit}</span>
                        <span className="text-zinc-600 text-[10px] font-bold font-sans tracking-wide"> / {goal.targetValue} Target</span>
                      </span>
                    </div>

                    {!goal.isCompleted && (
                      <div className="flex items-center gap-1.5 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                        <button
                          onClick={(e) => handleProgressChange(e, goal.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition-all cursor-pointer"
                        >
                          -1
                        </button>
                        <button
                          onClick={(e) => handleProgressChange(e, goal.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg transition-all cursor-pointer"
                        >
                          +1
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold font-mono pt-1">
                    <div className="flex items-center gap-1.5 leading-none">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Deadline: {goal.deadline}</span>
                    </div>
                    <span className={`px-2 py-0.5 border rounded-lg uppercase font-bold text-[9px] ${goal.isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}>
                      {goal.isCompleted ? 'COMPLETE!' : getDaysRemainingStr(goal.deadline)}
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
  );
}
