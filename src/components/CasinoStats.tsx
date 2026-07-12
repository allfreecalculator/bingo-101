import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile, LeaderboardEntry, DailyTask } from '../types';
import { Trophy, Coins, Award, RefreshCw, BarChart2, Star, Sparkles } from 'lucide-react';
import { DailyTasks } from './DailyTasks';
import { AnalyticsCenter } from './AnalyticsCenter';

interface CasinoStatsProps {
  profile: PlayerProfile;
  onAddChips: (amount: number) => void;
  tasks: DailyTask[];
  onClaimTask: (taskId: string) => void;
  onAddTask?: (title: string, description: string, target: number, reward: number, icon: string) => void;
  onProgressTask?: (taskId: string, increment: number) => void;
}

// Fixed pool of bots for the leaderboard simulation
const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Vegas_Viper 🐍', chips: 2450, level: 12, avatar: '💎', isBot: true },
  { name: 'LadyLuck_777 🎰', chips: 1890, level: 9, avatar: '🍒', isBot: true },
  { name: 'Bingo_Baron 👑', chips: 1420, level: 7, avatar: '🎩', isBot: true },
  { name: 'GoldDigger ⛏️', chips: 950, level: 5, avatar: '🤠', isBot: true },
  { name: 'LuckyCharm 🍀', chips: 620, level: 4, avatar: '🍄', isBot: true },
];

export const CasinoStats: React.FC<CasinoStatsProps> = ({ 
  profile, 
  onAddChips,
  tasks,
  onClaimTask,
  onAddTask,
  onProgressTask
}) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelPrize, setWheelPrize] = useState<string | null>(null);
  const [wheelCooldown, setWheelCooldown] = useState(0); // seconds left
  const [spinHistory, setSpinHistory] = useState<string[]>([]);

  // Progressive Wheel Cooldown sequence
  // Step 0: 1st spin -> next cooldown is 5 min (300s)
  // Step 1: 2nd spin -> next cooldown is 30 min (1800s)
  // Step 2: 3rd spin -> next cooldown is 2 hours (7200s)
  // Step 3: 4th spin -> next cooldown is 8 hours (28800s)
  // Step 4: 5th spin -> next cooldown is 16 hours (57600s)
  // Step 5: 6th spin -> Reset / Start Over
  const PROGRESSIVE_STEPS = [
    { step: 0, label: '1st Spin', cooldownAfter: 300, displayCooldown: '5 Min' },
    { step: 1, label: '2nd Spin', cooldownAfter: 1800, displayCooldown: '30 Min' },
    { step: 2, label: '3rd Spin', cooldownAfter: 7200, displayCooldown: '2 Hours' },
    { step: 3, label: '4th Spin', cooldownAfter: 28800, displayCooldown: '8 Hours' },
    { step: 4, label: '5th Spin', cooldownAfter: 57600, displayCooldown: '16 Hours' },
    { step: 5, label: '6th Spin', cooldownAfter: 0, displayCooldown: 'Start Over' }
  ];

  const [progressiveStep, setProgressiveStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('luckyWheelProgressStep');
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [currentCooldownMax, setCurrentCooldownMax] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('luckyWheelCooldownMax');
      return saved ? parseInt(saved, 10) : 300;
    } catch (e) {
      return 300;
    }
  });

  const updateProgressiveStep = (step: number) => {
    setProgressiveStep(step);
    try {
      localStorage.setItem('luckyWheelProgressStep', step.toString());
    } catch (e) {}
  };

  const isSpinningRef = useRef(false);

  // Wheel sectors with premium colors
  const SECTORS = [
    { label: '50 Chips', value: 50, color: '#f59e0b' },      // Amber
    { label: '15 Chips', value: 15, color: '#06b6d4' },      // Cyan
    { label: '100 Chips', value: 100, color: '#3b82f6' },    // Blue
    { label: '25 Chips', value: 25, color: '#ec4899' },      // Pink
    { label: '500 Chips 🌟', value: 500, color: '#ef4444' },  // Red (Jackpot)
    { label: '30 Chips', value: 30, color: '#8b5cf6' },      // Purple
    { label: '200 Chips', value: 200, color: '#f97316' },    // Orange
    { label: '10 Chips', value: 10, color: '#10b981' },      // Emerald
  ];

  // Helper for drawing SVG wedge sectors
  const getSectorPath = (index: number, total: number, cx: number, cy: number, r: number) => {
    const angle = 360 / total;
    // Rotate so sector index 0 is centered at top (12 o'clock)
    const startAngle = index * angle - 90 - angle / 2;
    const endAngle = index * angle - 90 + angle / 2;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };

  // Synthesize custom clicking tick sound using Web Audio API
  const playClickSound = (frequency = 600, duration = 0.05) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + duration);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  // Tick down wheel cooldown
  useEffect(() => {
    if (wheelCooldown > 0) {
      const timer = setTimeout(() => setWheelCooldown(wheelCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [wheelCooldown]);

  // Restore cooldown from localStorage on mount
  useEffect(() => {
    try {
      const savedExpiry = localStorage.getItem('luckyWheelCooldownExpiry');
      if (savedExpiry) {
        const expiryTime = parseInt(savedExpiry, 10);
        const timeLeft = Math.ceil((expiryTime - Date.now()) / 1000);
        if (timeLeft > 0) {
          setWheelCooldown(timeLeft);
        } else {
          setWheelCooldown(0);
          localStorage.removeItem('luckyWheelCooldownExpiry');
        }
      }
    } catch (e) {}
  }, []);

  const formatCooldownTime = (secs: number) => {
    if (secs <= 0) return '0s';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  };

  // Simulate leaderboard activity occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard((prev) =>
        prev.map((bot) => {
          // Bots occasionally win or lose chips
          const delta = Math.floor(Math.random() * 80) - 35; // net positive average
          const newChips = Math.max(100, bot.chips + delta);
          // Bots occasionally level up
          const levelUp = Math.random() > 0.95 ? 1 : 0;
          return {
            ...bot,
            chips: newChips,
            level: bot.level + levelUp,
          };
        })
      );
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Merge player profile into leaderboard and sort
  const combinedLeaderboard = [
    ...leaderboard,
    {
      name: `${profile.name} (You)`,
      chips: profile.chips,
      level: profile.level,
      avatar: profile.avatar,
      isBot: false,
    },
  ].sort((a, b) => b.chips - a.chips);

  const handleSpinWheel = () => {
    if (wheelSpinning || wheelCooldown > 0 || isSpinningRef.current) return;

    isSpinningRef.current = true;
    setWheelSpinning(true);
    setWheelPrize(null);

    // Pick a random sector
    const sectorIndex = Math.floor(Math.random() * SECTORS.length);
    const sectorAngle = 360 / SECTORS.length;
    // Calculate final rotation to align selected sector to top (270 degrees on wheel)
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full rotations
    const targetAngle = extraSpins * 360 + (360 - sectorIndex * sectorAngle);

    setWheelRotation(targetAngle);

    // Progressive cooldown duration depends on current progressiveStep
    const currentStepConfig = PROGRESSIVE_STEPS[progressiveStep];
    const nextCooldownSec = currentStepConfig.cooldownAfter;

    if (nextCooldownSec > 0) {
      setWheelCooldown(nextCooldownSec);
      setCurrentCooldownMax(nextCooldownSec);
      try {
        localStorage.setItem('luckyWheelCooldownMax', nextCooldownSec.toString());
        localStorage.setItem('luckyWheelCooldownExpiry', (Date.now() + nextCooldownSec * 1000).toString());
      } catch (e) {}
    }

    // Audio click ticker simulation
    let currentDelay = 50;
    const playNextClick = () => {
      if (!isSpinningRef.current) return;
      playClickSound(680, 0.03);
      currentDelay *= 1.15; // gradual deceleration delay multiplier
      if (currentDelay < 1200) {
        setTimeout(playNextClick, currentDelay);
      }
    };
    setTimeout(playNextClick, currentDelay);

    setTimeout(() => {
      isSpinningRef.current = false;
      setWheelSpinning(false);
      const prize = SECTORS[sectorIndex];
      setWheelPrize(prize.label);
      onAddChips(prize.value);
      setSpinHistory(prev => [prize.label, ...prev].slice(0, 5));
      
      // Update progressive step sequence
      // When Step 5 (6th Spin) is played, it loops back to 0 (Starts the round over!)
      const nextStep = (progressiveStep + 1) % PROGRESSIVE_STEPS.length;
      updateProgressiveStep(nextStep);

      // Speech synthesis celebration
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const speech = new SpeechSynthesisUtterance(`Congratulations! You won ${prize.label}!`);
          speech.pitch = 1.15;
          speech.volume = 0.25;
          window.speechSynthesis.speak(speech);
        } catch (e) {}
      }
    }, 4500);
  };

  const winRate = profile.stats.gamesPlayed > 0 
    ? Math.round((profile.stats.bingosWon / profile.stats.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {/* 1. Daily Casino Quests Panel */}
      <div className="lg:col-span-1 md:col-span-1 col-span-1 flex flex-col h-full">
        <DailyTasks 
          tasks={tasks} 
          onClaimTask={onClaimTask} 
          onAddTask={onAddTask}
          onProgressTask={onProgressTask}
        />
      </div>

      {/* 2. Casino Lucky Wheel Faucet (Lucky Fortune Wheel) */}
      <div className="lg:col-span-2 md:col-span-2 col-span-1 bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between h-full">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-white/80 uppercase font-sans mb-1 pb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Lucky Fortune Wheel
          </h3>
          <p className="text-[11px] text-white/50 mb-4 leading-relaxed">
            Short on chips? Take a free spin to win up to <strong className="text-amber-400">500 Chips</strong> instantly!
          </p>
        </div>

        {/* Wheel layout - side-by-side on sm screens and up */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
          <div className="relative w-44 h-44 flex-shrink-0">
            {/* Flashing Pointer Arrow pointing down to top center */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-yellow-400 filter drop-shadow-[0_2px_5px_rgba(234,179,8,0.5)] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-yellow-400 -mt-2 animate-pulse" />
            </div>
            
            {/* Clean, minimalist wheel indicator ring without lights */}
            <svg viewBox="0 0 216 216" className="w-full h-full select-none overflow-visible">
              {/* Subtle outer frame backing */}
              <circle cx="108" cy="108" r="100" fill="#04040c" stroke="#1e1e38" strokeWidth="1" />

              {/* Spinning SVG Wheel Group */}
              <g 
                style={{ 
                  transform: `rotate(${wheelRotation}deg)`,
                  transformOrigin: '108px 108px',
                  transition: wheelSpinning ? 'transform 4500ms cubic-bezier(0.15, 0.85, 0.2, 1)' : 'transform 100ms ease-out'
                }}
              >
                {/* Outer golden rim of the inner wheel */}
                <circle cx="108" cy="108" r="95" fill="#0c0c1e" stroke="#fbbf24" strokeWidth="2" />

                {/* Slices */}
                {SECTORS.map((sec, idx) => {
                  const angle = 360 / SECTORS.length;
                  const pathData = getSectorPath(idx, SECTORS.length, 108, 108, 94);
                  
                  // Text placement in center of wedge
                  const textAngle = idx * angle - 90;
                  const textRad = (textAngle * Math.PI) / 180;
                  // Center radial distance for text is 62px from 108,108
                  const textX = 108 + 62 * Math.cos(textRad);
                  const textY = 108 + 62 * Math.sin(textRad);

                  return (
                    <g key={idx}>
                      <path
                        d={pathData}
                        fill={sec.color}
                        opacity={0.8}
                        stroke="#050510"
                        strokeWidth="1.5"
                        className="hover:opacity-100 transition-opacity duration-300"
                        style={{
                          transformOrigin: '108px 108px'
                        }}
                      />
                      {/* Divider subtle line */}
                      <line 
                        x1="108" 
                        y1="108" 
                        x2={108 + 94 * Math.cos((idx * angle - 90 - angle/2) * Math.PI / 180)}
                        y2={108 + 94 * Math.sin((idx * angle - 90 - angle/2) * Math.PI / 180)}
                        stroke="#050510"
                        strokeWidth="1.5"
                      />
                      {/* Text label with rotation */}
                      <text
                        x={textX}
                        y={textY}
                        fill="#ffffff"
                        fontSize="7.5"
                        fontWeight="900"
                        fontFamily="monospace"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                        style={{
                          filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,1))'
                        }}
                      >
                        {sec.label.replace(' Chips', '')}
                      </text>
                    </g>
                  );
                })}

                {/* Inner hub decoration */}
                <circle cx="108" cy="108" r="22" fill="#04040c" stroke="#fbbf24" strokeWidth="2.5" />
                <circle cx="108" cy="108" r="14" fill="#1e1b4b" stroke="#ffffff" strokeWidth="1" />
                <circle cx="108" cy="108" r="6" fill="#fbbf24" />
              </g>
            </svg>
          </div>

          <div className="flex-1 w-full flex flex-col justify-center space-y-3">
            <div className="bg-[#111126]/60 border border-white/5 p-3 rounded-2xl text-center space-y-1.5 relative overflow-hidden shadow-inner">
              <span className="block text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">Cabinet Status</span>
              {wheelSpinning ? (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-amber-400 animate-pulse flex items-center gap-1.5 justify-center">
                    🎰 SHUFFLING WHEEL...
                  </span>
                  <span className="text-[10px] font-mono text-white/40">Fingers crossed!</span>
                </div>
              ) : wheelCooldown > 0 ? (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xs font-black text-white/70 font-mono tracking-wide flex items-center gap-1 justify-center">
                    ⏳ COOLDOWN: {formatCooldownTime(wheelCooldown)}
                  </span>
                  <span className="text-[9px] font-mono text-white/40 block mt-0.5">
                    Next up: {PROGRESSIVE_STEPS[progressiveStep]?.label}
                  </span>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-1.5 border border-white/5">
                    <div 
                      className="bg-amber-400 h-full transition-all duration-1000" 
                      style={{ width: `${Math.max(0, Math.min(100, (wheelCooldown / currentCooldownMax) * 100))}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5 animate-bounce">
                    ✨ {PROGRESSIVE_STEPS[progressiveStep]?.label} AVAILABLE!
                  </span>
                  <span className="text-[9px] font-mono text-white/30">
                    {progressiveStep === 5 ? 'Final Spin of Round - starts over after!' : `Next Cooldown will be ${PROGRESSIVE_STEPS[progressiveStep]?.displayCooldown}`}
                  </span>
                </div>
              )}

              {/* Dynamic Winner Banner celebrating live in UI */}
              <AnimatePresence>
                {wheelPrize && !wheelSpinning && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="pt-2 border-t border-white/10 mt-2 flex flex-col items-center bg-amber-400/5 p-2 rounded-xl border border-amber-400/10"
                  >
                    <span className="block text-[8px] font-mono text-amber-400 uppercase tracking-wider font-bold animate-pulse flex items-center gap-1">
                      <Trophy className="w-2.5 h-2.5 text-amber-400" /> CONGRATULATIONS!
                    </span>
                    <span className="text-xs font-black text-white block mt-0.5 tracking-tight">
                      Landed On: <span className="text-yellow-400">{wheelPrize}</span>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={handleSpinWheel}
              disabled={wheelSpinning || wheelCooldown > 0}
              className={`w-full py-3 px-4 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 transition-all shadow-lg border cursor-pointer ${
                wheelSpinning || wheelCooldown > 0
                  ? 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black border-yellow-300 font-extrabold hover:shadow-amber-500/20 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${wheelSpinning ? 'animate-spin' : ''}`} />
              {wheelSpinning 
                ? 'SPINNING CABINET...' 
                : wheelCooldown > 0
                  ? `LOCKED (${formatCooldownTime(wheelCooldown)})`
                  : `PULL ${PROGRESSIVE_STEPS[progressiveStep]?.label.toUpperCase()} HANDLE`}
            </button>

            {/* Spin History Tracker Panel */}
            {spinHistory.length > 0 && (
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="block text-[8px] font-mono text-white/30 uppercase tracking-widest text-center font-bold mb-1.5">
                  Recent Spin Rewards
                </span>
                <div className="flex gap-1 justify-center flex-wrap">
                  {spinHistory.map((hist, idx) => (
                    <span 
                      key={idx} 
                      className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-white/70 font-mono text-[8px] rounded font-bold"
                    >
                      🎁 {hist}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Progressive Fortune Journey Progress Timeline */}
            <div className="bg-[#111126]/40 border border-white/5 p-3 rounded-xl space-y-2">
              <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest text-center font-bold">
                🔮 Fortune Journey Progress
              </span>
              <div className="grid grid-cols-6 gap-0.5 relative pt-1">
                {/* Connecting background progress line */}
                <div className="absolute top-[17px] inset-x-4 h-[2px] bg-white/5 -z-0" />
                
                {PROGRESSIVE_STEPS.map((s) => {
                  const isActive = progressiveStep === s.step;
                  const isCompleted = progressiveStep > s.step;
                  
                  return (
                    <div key={s.step} className="flex flex-col items-center text-center relative z-10">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.5)] scale-110'
                            : isCompleted
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                              : 'bg-black/40 border-white/5 text-white/30'
                        }`}
                        title={`${s.label}: ${s.displayCooldown} cooldown`}
                      >
                        {isCompleted ? '✓' : s.step + 1}
                      </div>
                      <span className="text-[7px] font-mono text-white/40 mt-1 block leading-tight truncate w-full max-w-[45px]">
                        {s.displayCooldown === '0s' || s.displayCooldown === 'Start Over' ? 'Reset' : s.displayCooldown}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sandbox Controls for Testing */}
            <div className="pt-1 border-t border-white/5">
              <div className="flex items-center justify-between px-2 py-1.5 bg-white/5 rounded-xl border border-white/5">
                <div className="text-left">
                  <span className="block text-[8px] font-mono text-amber-400/80 uppercase font-black tracking-wider">
                    🛠️ Developer Sandbox
                  </span>
                  <span className="block text-[7px] text-white/30 font-mono">Simulate time intervals for audit</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setWheelCooldown(0);
                      try {
                        localStorage.removeItem('luckyWheelCooldownExpiry');
                      } catch (e) {}
                    }}
                    disabled={wheelCooldown === 0}
                    className="px-2 py-1 rounded text-[8px] font-mono font-bold uppercase bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/20 disabled:opacity-30 cursor-pointer transition-all active:scale-95"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateProgressiveStep(0);
                      setWheelCooldown(0);
                      setWheelPrize(null);
                      try {
                        localStorage.removeItem('luckyWheelCooldownExpiry');
                      } catch (e) {}
                    }}
                    className="px-2 py-1 rounded text-[8px] font-mono font-bold uppercase bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 cursor-pointer transition-all active:scale-95"
                  >
                    Reset Journey
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Stack of Casino Analytics and Active Players Leaderboard */}
      <div className="lg:col-span-1 md:col-span-1 col-span-1 flex flex-col gap-6">
        {/* Casino Analytics */}
        <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between h-full min-h-[220px]">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white/80 uppercase font-sans mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" /> Casino Analytics
            </h3>

            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="block text-[8px] font-mono text-white/40 uppercase">Games Played</span>
                <span className="text-base font-bold text-white font-mono">{profile.stats.gamesPlayed}</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="block text-[8px] font-mono text-white/40 uppercase">Bingos Claimed</span>
                <span className="text-base font-bold text-amber-400 font-mono flex items-center gap-0.5">
                  <Trophy className="w-3.5 h-3.5" /> {profile.stats.bingosWon}
                </span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="block text-[8px] font-mono text-white/40 uppercase">Win Rate</span>
                <span className="text-base font-bold text-green-400 font-mono">{winRate}%</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <span className="block text-[8px] font-mono text-white/40 uppercase">Highest Payout</span>
                <span className="text-base font-bold text-yellow-500 font-mono flex items-center gap-0.5">
                  <Coins className="w-3.5 h-3.5" /> {profile.stats.highestWin}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-3 rounded-xl border border-amber-500/20 text-xs mt-1">
            <div className="flex justify-between items-center mb-1 text-amber-400 font-bold">
              <span className="flex items-center gap-1 text-[10px]"><Award className="w-3 h-3" /> High Roller Rank</span>
              <span className="text-[10px]">LVL {profile.level}</span>
            </div>
            <p className="text-white/60 leading-normal mb-1.5 text-[10px]">
              Ranked as: <strong className="text-white">
                {profile.level >= 10 ? 'VIP Legend' : profile.level >= 5 ? 'Vegas Regular' : 'Casino Apprentice'}
              </strong>
            </p>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
              <div 
                className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (profile.xp / (profile.level * 100)) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-white/30 font-mono mt-0.5">
              <span>{profile.xp} XP</span>
              <span>{profile.level * 100} XP for Lvl {profile.level + 1}</span>
            </div>
          </div>

          <button 
            id="view-full-analytics-trigger"
            onClick={() => setIsAnalyticsModalOpen(true)}
            className="w-full mt-3 py-2 bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-black font-extrabold text-[10px] tracking-wider uppercase rounded-xl border border-amber-400/20 hover:border-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
          >
            <BarChart2 className="w-3.5 h-3.5" /> Full Games Analytics Center
          </button>
        </div>

        {/* Active Players Leaderboard */}
        <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between h-full min-h-[220px]">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white/80 uppercase font-sans mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Active Players Leaderboard
            </h3>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {combinedLeaderboard.slice(0, 5).map((player, idx) => {
                const isSelf = !player.isBot;
                return (
                  <div
                    key={player.name}
                    className={`flex items-center justify-between p-1.5 rounded-xl border text-[11px] transition-all ${
                      isSelf
                        ? 'bg-amber-400/10 border-amber-400/30'
                        : 'bg-white/5 border-white/5'
                    }`}
                    style={{ contentVisibility: 'auto' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white/30 font-mono w-3">{idx + 1}</span>
                      <span className="text-sm">{player.avatar}</span>
                      <div className="flex flex-col">
                        <span className={`font-semibold truncate max-w-[80px] ${isSelf ? 'text-amber-400 font-bold' : 'text-white/80'}`}>
                          {player.name}
                        </span>
                        <span className="text-[8px] font-mono text-white/30 font-semibold">LVL {player.level}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 font-mono font-bold text-white/80 text-[10px]">
                      <Coins className="w-3 h-3 text-amber-400" />
                      {player.chips}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Games Analytics Center Modal Overlay */}
      <AnimatePresence>
        {isAnalyticsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="absolute inset-0" onClick={() => setIsAnalyticsModalOpen(false)} />
            <AnalyticsCenter 
              profile={profile} 
              onClose={() => setIsAnalyticsModalOpen(false)} 
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
