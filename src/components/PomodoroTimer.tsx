import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, SkipForward, Flame, Settings } from 'lucide-react';

type Mode = 'work' | 'short' | 'long';

export const PomodoroTimer: React.FC = () => {
  const { addToast } = useApp();
  
  const [mode, setMode] = useState<Mode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalSessions, setTotalSessions] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Customizable durations in minutes
  const [durations, setDurations] = useState({
    work: 25,
    short: 5,
    long: 15
  });

  const timerRef = useRef<number | null>(null);

  // Play synthetic web audio API chime
  const playNotificationSound = (type: 'finish' | 'click') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (type === 'finish') {
        // High, double chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // Soft click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      console.log('AudioContext blocked or unsupported', e);
    }
  };

  // Sync remaining seconds when mode or durations change
  useEffect(() => {
    setTimeLeft(durations[mode] * 60);
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [mode, durations]);

  // Main countdown effect loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    playNotificationSound('finish');
    
    if (mode === 'work') {
      const nextSessionsCount = totalSessions + 1;
      setTotalSessions(nextSessionsCount);
      addToast('Focus session complete! Take a break! ☕', 'success', 5000);
      
      // Celebrate with confetti
      import('canvas-confetti').then((confetti) => {
        confetti.default({ particleCount: 60, spread: 50 });
      });

      // Automatically queue short break or long break
      if (nextSessionsCount % 4 === 0) {
        setMode('long');
      } else {
        setMode('short');
      }
    } else {
      setMode('work');
      addToast('Break finished! Back to focus! ⚡', 'info', 5000);
    }
  };

  const toggleTimer = () => {
    playNotificationSound('click');
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    playNotificationSound('click');
    setIsRunning(false);
    setTimeLeft(durations[mode] * 60);
  };

  const skipTimer = () => {
    playNotificationSound('click');
    setIsRunning(false);
    
    if (mode === 'work') {
      setMode('short');
      addToast('Skipped to short break', 'info');
    } else {
      setMode('work');
      addToast('Skipped to focus session', 'info');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Circular progress dimensions
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / (durations[mode] * 60);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={`w-full rounded-2xl glass-panel border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-glow-primary transition-all duration-300 ${isExpanded ? 'p-5' : 'p-3'}`}>
      {/* Title block */}
      <div 
        className={`flex items-center justify-between cursor-pointer group ${isExpanded ? 'mb-4' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? "Collapse timer" : "Expand timer"}
      >
        <div className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200 font-semibold text-sm group-hover:text-primary-500 transition-colors">
          <Flame className="w-4 h-4 text-primary-500 fill-primary-500/20" />
          Focus Pomodoro
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full uppercase tracking-wider" title="Total completed sessions">
            SESS: {totalSessions}
          </span>
          {isExpanded && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(!isSettingsOpen); }}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
              title="Timer settings"
              aria-label="Timer settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <>
          {isSettingsOpen ? (
        /* Settings View */
        <div className="space-y-3 py-1 animate-fadeIn">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Adjust durations (mins)</div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-neutral-400 dark:text-neutral-500 block mb-1">Focus</label>
              <input
                type="number"
                value={durations.work}
                onChange={(e) => setDurations(prev => ({ ...prev, work: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-full text-center p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 dark:text-neutral-500 block mb-1">Short</label>
              <input
                type="number"
                value={durations.short}
                onChange={(e) => setDurations(prev => ({ ...prev, short: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-full text-center p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 dark:text-neutral-500 block mb-1">Long</label>
              <input
                type="number"
                value={durations.long}
                onChange={(e) => setDurations(prev => ({ ...prev, long: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-full text-center p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-xs font-semibold text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="w-full mt-2 py-1.5 rounded-lg bg-primary-500 text-white font-medium text-xs transition-colors hover:bg-primary-600 focus:outline-none shadow-sm"
          >
            Save Settings
          </button>
        </div>
      ) : (
        /* Timer View */
        <div className="flex flex-col items-center">
          {/* Phase toggler */}
          <div className="flex bg-neutral-100 dark:bg-neutral-900/60 p-1 rounded-xl w-full mb-5 border border-neutral-200/50 dark:border-neutral-800/50">
            {(['work', 'short', 'long'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all focus:outline-none ${
                  mode === m
                    ? 'bg-white dark:bg-neutral-800 text-primary-500 shadow-sm border border-neutral-200/50 dark:border-white/5'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                }`}
              >
                {m === 'work' ? 'Focus' : m === 'short' ? 'Short' : 'Long'}
              </button>
            ))}
          </div>

          {/* SVG Progress Ring */}
          <div className="relative flex items-center justify-center w-40 h-40 mb-5">
            <svg className="w-full h-full" viewBox="0 0 144 144">
              {/* Underlay Track ring */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-neutral-200 dark:stroke-neutral-800/80 fill-none"
                strokeWidth="6"
              />
              {/* Animating Progress ring */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="pomodoro-progress-ring stroke-primary-500 fill-none transition-all duration-300"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold tracking-tight font-mono text-neutral-800 dark:text-neutral-100">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                {mode === 'work' ? 'stay focused' : 'take a break'}
              </span>
            </div>
          </div>

          {/* Controller buttons */}
          <div className="flex gap-2">
            <button
              onClick={resetTimer}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleTimer}
              title={isRunning ? "Pause timer" : "Start timer"}
              className={`px-6 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 focus:outline-none flex items-center gap-1.5 shadow-sm border ${
                isRunning
                  ? 'bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  : 'bg-primary-500 border-primary-600 text-white hover:bg-primary-600 shadow-glow-primary'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  PAUSE
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  START
                </>
              )}
            </button>
            <button
              onClick={skipTimer}
              className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus:outline-none"
              title="Skip to next phase"
              aria-label="Skip phase"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
