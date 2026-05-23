/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle, Home, CheckSquare, Target, Activity, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaptic } from '../lib/haptic';

interface AndroidShellProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onDataRefresh: () => void;
}

export default function AndroidShell({
  children,
  activeTab,
  onTabChange,
  onDataRefresh,
}: AndroidShellProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative select-none" id="android-canvas-root">
      
      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-h-screen bg-zinc-950 relative z-10" id="main-panel-workspace">
        <main className="flex-1 overflow-y-auto w-full pb-36 lg:pb-40" id="main-viewport-scroller">
          {children}
        </main>
      </div>

      {/* Unified Bottom Application Dock */}
      <div className="fixed bottom-4 lg:bottom-8 inset-x-4 lg:inset-x-8 z-50 flex flex-row items-center justify-between gap-3">
        
        {/* Left: Secondary Navigation Panel (Horizontal) */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 p-1.5 lg:p-2 rounded-3xl flex flex-row gap-1 lg:gap-2 shadow-xl shrink min-w-0 overflow-x-auto no-scrollbar">
          {[
            { tab: 'habits', label: 'Habits', activeStyle: 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]', defaultStyle: 'text-emerald-400 hover:bg-emerald-500/10', icon: (
              <CheckSquare className="w-5 h-5 relative z-10" />
            ) },
            { tab: 'goals', label: 'Goals', activeStyle: 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]', defaultStyle: 'text-amber-400 hover:bg-amber-500/10', icon: (
              <Target className="w-5 h-5 relative z-10" />
            ) },
            { tab: 'health', label: 'Health', activeStyle: 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]', defaultStyle: 'text-cyan-400 hover:bg-cyan-500/10', icon: (
              <Activity className="w-5 h-5 relative z-10" />
            ) }
          ].map(({ tab, label, activeStyle, defaultStyle, icon }) => (
            <button
              key={tab}
              onClick={() => {
                triggerHaptic('light');
                onTabChange(tab);
              }}
              className="group relative flex flex-col items-center justify-center p-1 rounded-2xl transition-all cursor-pointer shrink-0"
              title={label}
            >
              <div className={`relative p-2.5 lg:p-3 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                activeTab === tab ? activeStyle : defaultStyle
              }`}>
                {icon}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-row items-center gap-4 lg:gap-6">
          {/* Center: Home Navigation Button */}
          <button
            onClick={() => {
              triggerHaptic('medium');
              onTabChange('home');
            }}
            className={`relative group shrink-0 flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] ${
              activeTab === 'home' 
              ? 'bg-indigo-500 scale-105' 
              : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'
            }`}
            title="Home"
          >
            {activeTab === 'home' && (
               <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-20"></span>
            )}
            <Home className={`w-5 h-5 lg:w-6 lg:h-6 z-10 transition-colors ${activeTab === 'home' ? 'text-white' : 'text-indigo-400 group-hover:text-white'}`} />
          </button>
  
          {/* Right: Settings Navigation Button */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onTabChange('settings');
            }}
            className={`relative group shrink-0 flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full transition-all duration-300 shadow-xl border ${
              activeTab === 'settings' 
              ? 'bg-zinc-700 border-zinc-600 scale-105' 
              : 'bg-zinc-900/80 backdrop-blur-xl border-zinc-800/80 hover:bg-zinc-800'
            }`}
            title="Settings"
          >
            {activeTab === 'settings' && (
              <span className="absolute inset-0 rounded-full animate-ping bg-zinc-500 opacity-20"></span>
            )}
            <SettingsIcon className={`w-5 h-5 lg:w-6 lg:h-6 z-10 transition-colors ${activeTab === 'settings' ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`} />
          </button>
        </div>

      </div>

      {/* Dynamic Toast Popup Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-55 max-w-[340px] bg-zinc-900 border border-zinc-800 text-indigo-100 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg text-xs"
            id="toast-overlay-div"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 stroke-[2px]" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

