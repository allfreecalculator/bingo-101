import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Coins, Trophy, Play, RefreshCw, Volume2, VolumeX, Heart, 
  HelpCircle, Orbit, Sun, Star, Compass, Zap
} from 'lucide-react';

interface CosmicVoidSlotsProps {
  chips: number;
  onUpdateChips: (amount: number) => void;
  onUpdateTask?: (taskId: string, count: number) => void;
  triggerAlert: (text: string, type?: 'success' | 'error' | 'info') => void;
}

interface SymbolMetadata {
  name: string;
  mult: number;
  color: string;
  glow: string;
  bgGlow: string;
}

const COSMIC_SYMBOLS: Record<string, SymbolMetadata> = {
  VOID: { name: 'Void Singularity', mult: 150, color: 'text-violet-400', glow: 'shadow-violet-500/80', bgGlow: 'bg-violet-500/10' },
  QUASAR: { name: 'Hyper Quasar', mult: 60, color: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/70', bgGlow: 'bg-fuchsia-500/10' },
  PULSAR: { name: 'Pulsating Star', mult: 35, color: 'text-cyan-400', glow: 'shadow-cyan-500/70', bgGlow: 'bg-cyan-500/10' },
  NEBULA: { name: 'Stellar Nebula', mult: 20, color: 'text-emerald-400', glow: 'shadow-emerald-500/70', bgGlow: 'bg-emerald-500/10' },
  COMET: { name: 'Quantum Comet', mult: 12, color: 'text-blue-400', glow: 'shadow-blue-500/70', bgGlow: 'bg-blue-500/10' },
  ASTEROID: { name: 'Meteor Chunk', mult: 8, color: 'text-zinc-400', glow: 'shadow-zinc-500/70', bgGlow: 'bg-zinc-500/10' },
  ORBITER: { name: 'Deep Probe', mult: 5, color: 'text-amber-400', glow: 'shadow-amber-500/70', bgGlow: 'bg-amber-500/10' },
  DUST: { name: 'Cosmic Dust', mult: 3, color: 'text-rose-400', glow: 'shadow-rose-500/70', bgGlow: 'bg-rose-500/10' }
};

const SYMBOLS_POOL = ['VOID', 'QUASAR', 'PULSAR', 'NEBULA', 'COMET', 'ASTEROID', 'ORBITER', 'DUST'];
const WEIGHTED_SYMBOLS = [
  'DUST', 'DUST', 'DUST', 'DUST',
  'ORBITER', 'ORBITER', 'ORBITER',
  'ASTEROID', 'ASTEROID', 'ASTEROID',
  'COMET', 'COMET',
  'NEBULA', 'NEBULA',
  'PULSAR',
  'QUASAR',
  'VOID'
];
const SPINNING_SYMBOLS = ['VOID', 'QUASAR', 'PULSAR', 'NEBULA', 'COMET', 'ASTEROID', 'ORBITER', 'DUST', 'VOID', 'QUASAR', 'PULSAR', 'NEBULA', 'COMET', 'ASTEROID', 'ORBITER', 'DUST'];

const PAYLINES = [
  { id: 1, name: 'Ecliptic Plain', path: [1, 1, 1], color: 'border-violet-400 text-violet-400', shadow: 'shadow-violet-500/50' },
  { id: 2, name: 'Upper Orbit', path: [0, 0, 0], color: 'border-cyan-400 text-cyan-400', shadow: 'shadow-cyan-500/50' },
  { id: 3, name: 'Lower Orbit', path: [2, 2, 2], color: 'border-emerald-400 text-emerald-400', shadow: 'shadow-emerald-500/50' },
  { id: 4, name: 'Solar Flare', path: [0, 1, 2], color: 'border-amber-400 text-amber-400', shadow: 'shadow-amber-500/50' },
  { id: 5, name: 'Supernova Arc', path: [2, 1, 0], color: 'border-fuchsia-400 text-fuchsia-400', shadow: 'shadow-fuchsia-500/50' }
];

const playCosmicSound = (type: 'spin' | 'stop' | 'win' | 'lose' | 'lever' | 'jackpot' | 'wild', isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'spin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.55);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.55);
    } else if (type === 'stop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'win') {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    } else if (type === 'jackpot') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      });
    } else if (type === 'lever') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch (e) {}
};

export const CosmicVoidSlots: React.FC<CosmicVoidSlotsProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [bet, setBet] = useState<number>(50);
  const [activePaylinesCount, setActivePaylinesCount] = useState<number>(3);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [isFastMode, setIsFastMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);

  const [reels, setReels] = useState<string[][]>([
    ['NEBULA', 'COMET', 'ASTEROID'],
    ['PULSAR', 'VOID', 'ASTEROID'],
    ['ORBITER', 'DUST', 'NEBULA']
  ]);

  const [lastWin, setLastWin] = useState<number | null>(null);
  const [spinHistory, setSpinHistory] = useState<string[]>([]);
  const [autoSpinActive, setAutoSpinActive] = useState<boolean>(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [winningPaylines, setWinningPaylines] = useState<number[]>([]);

  const stoppedRef = useRef<boolean[]>([true, true, true]);
  const stopTimersRef = useRef<any[]>([]);
  const tickIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopTimersRef.current.forEach(t => clearTimeout(t));
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, []);

  const adjustBet = (amount: number) => {
    if (spinning) return;
    const newBet = Math.max(10, Math.min(500, bet + amount));
    setBet(newBet);
    playCosmicSound('stop', isMuted);
  };

  const handleSpin = () => {
    if (spinning) return;

    const totalWager = bet * activePaylinesCount;
    if (chips < totalWager) {
      triggerAlert(`Cosmic energies require ${totalWager} Chips to warp spacetime.`, 'error');
      setAutoSpinActive(false);
      return;
    }

    setSpinning(true);
    setLastWin(null);
    setWinningPaylines([]);
    onUpdateChips(-totalWager);
    playCosmicSound('lever', isMuted);

    const finalReels: string[][] = [];
    for (let col = 0; col < 3; col++) {
      const colSymbols: string[] = [];
      for (let row = 0; row < 3; row++) {
        const randSym = WEIGHTED_SYMBOLS[Math.floor(Math.random() * WEIGHTED_SYMBOLS.length)];
        colSymbols.push(randSym);
      }
      finalReels.push(colSymbols);
    }

    stoppedRef.current = [false, false, false];
    let playTicks = 0;
    playCosmicSound('spin', isMuted);

    tickIntervalRef.current = setInterval(() => {
      playTicks++;
      setReels(prev => prev.map((col, cIdx) => {
        if (stoppedRef.current[cIdx]) return col;
        const shifted = [...col];
        const nextSym = SYMBOLS_POOL[Math.floor(Math.random() * SYMBOLS_POOL.length)];
        shifted.unshift(nextSym);
        shifted.pop();
        return shifted;
      }));

      if (playTicks % 3 === 0 && !isMuted) {
        playCosmicSound('spin', isMuted);
      }
    }, isFastMode ? 60 : 100);

    const delayStep = isFastMode ? 350 : 700;

    stoppedRef.current.forEach((_, colIdx) => {
      const timer = setTimeout(() => {
        stoppedRef.current[colIdx] = true;
        playCosmicSound('stop', isMuted);

        setReels(prev => {
          const next = [...prev];
          next[colIdx] = finalReels[colIdx];
          return next;
        });

        if (colIdx === 2) {
          clearInterval(tickIntervalRef.current);
          evaluateSpinResults(finalReels);
        }
      }, delayStep * (colIdx + 1));

      stopTimersRef.current.push(timer);
    });
  };

  const evaluateSpinResults = (grid: string[][]) => {
    let totalWinMultiplier = 0;
    const triggeredLines: number[] = [];
    let jackpotHit = false;

    for (let i = 0; i < activePaylinesCount; i++) {
      const line = PAYLINES[i];
      const s1 = grid[0][line.path[0]];
      const s2 = grid[1][line.path[1]];
      const s3 = grid[2][line.path[2]];

      let isWin = false;
      let winSym = '';

      if (s1 === s2 && s2 === s3) {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'VOID' && s2 === s3) {
        isWin = true;
        winSym = s2;
      } else if (s2 === 'VOID' && s1 === s3) {
        isWin = true;
        winSym = s1;
      } else if (s3 === 'VOID' && s1 === s2) {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'VOID' && s2 === 'VOID') {
        isWin = true;
        winSym = s3;
      } else if (s2 === 'VOID' && s3 === 'VOID') {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'VOID' && s3 === 'VOID') {
        isWin = true;
        winSym = s2;
      }

      if (isWin && winSym !== '') {
        const symbolMult = COSMIC_SYMBOLS[winSym]?.mult || 3;
        totalWinMultiplier += symbolMult;
        triggeredLines.push(line.id);
        if (symbolMult >= 60) jackpotHit = true;
      }
    }

    const netWin = Math.floor(bet * totalWinMultiplier);

    setWinningPaylines(triggeredLines);
    setLastWin(netWin);
    setSpinning(false);

    if (netWin > 0) {
      onUpdateChips(netWin);
      if (jackpotHit) {
        playCosmicSound('jackpot', isMuted);
        triggerAlert(`🪐 VOID EXTRACTION! You aligned celestial singularities for +${netWin} Chips!`, 'success');
      } else {
        playCosmicSound('win', isMuted);
        triggerAlert(`Warp gate active! Aligned celestial coordinates for +${netWin} Chips.`, 'success');
      }

      setSpinHistory(prev => [
        `🪐 Orbit +${netWin} (${triggeredLines.length} Coordinates)`,
        ...prev
      ].slice(0, 5));

      if (onUpdateTask) {
        onUpdateTask('COSMIC_SLOTS_SPIN', 1);
      }
    } else {
      setSpinHistory(prev => [
        `☄️ Lost Orbit`,
        ...prev
      ].slice(0, 5));
    }

    if (autoSpinActive && autoSpinCount > 0) {
      const remainingSpins = autoSpinCount - 1;
      setAutoSpinCount(remainingSpins);
      if (remainingSpins <= 0) {
        setAutoSpinActive(false);
      } else {
        setTimeout(() => {
          handleSpin();
        }, 1300);
      }
    }
  };

  const startAutoSpin = (spins: number) => {
    if (spinning) return;
    setAutoSpinCount(spins);
    setAutoSpinActive(true);
    triggerAlert(`Initiating ${spins} automated orbit cycles.`, 'info');
    setTimeout(() => {
      handleSpin();
    }, 200);
  };

  const stopAutoSpin = () => {
    setAutoSpinActive(false);
    setAutoSpinCount(0);
    triggerAlert('Space voyage sequence deactivated.', 'info');
  };

  const renderCosmicSymbol = (symbol: string, isMiddle: boolean = false) => {
    const meta = COSMIC_SYMBOLS[symbol];
    if (!meta) return <span className="text-3xl">🪐</span>;

    const scaleClass = isMiddle ? 'scale-110' : 'scale-90 opacity-40';

    switch (symbol) {
      case 'VOID':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-violet-600/30 rounded-full blur-md animate-ping" />
            <div className="absolute inset-0 border border-violet-500 rounded-full animate-spin [animation-duration:4s]" />
            <div className="w-11 h-11 bg-black border-2 border-violet-500 rounded-full flex items-center justify-center shadow-[0_0_15px_#8b5cf6]">
              <svg className="w-6 h-6 text-violet-400 animate-spin" style={{ animationDuration: '6s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" strokeDasharray="6 3" />
                <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" fill="currentColor" fillOpacity="0.2" />
                <circle cx="12" cy="12" r="2" fill="#fff" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-violet-600 text-white font-extrabold px-1.5 py-0.5 rounded-full font-mono select-none tracking-widest uppercase shadow-md">WILD</span>
          </div>
        );
      case 'QUASAR':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-fuchsia-500/25 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-fuchsia-500 rounded-full flex items-center justify-center shadow-[0_0_12px_#d946ef]">
              <svg className="w-6 h-6 text-fuchsia-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20M5.636 5.636l12.728 12.728M5.636 18.364L18.364 5.636" strokeLinecap="round" />
                <circle cx="12" cy="12" r="4" fill="#000" stroke="currentColor" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-fuchsia-600 text-white font-mono font-bold px-1 rounded select-none">QUASAR</span>
          </div>
        );
      case 'PULSAR':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md animate-pulse" />
            <div className="w-11 h-11 bg-black border border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_10px_#22d3ee]">
              <svg className="w-6 h-6 text-cyan-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-cyan-500 text-black font-mono font-bold px-1 rounded select-none">PULSAR</span>
          </div>
        );
      case 'NEBULA':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-emerald-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_10px_#34d399]">
              <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3c-1.2 0-2.4.6-3.2 1.6C8 3.4 6.3 3.1 4.8 4s-1.7 2.7-.9 4.1c-1.2.7-1.9 2-1.9 3.4 0 1.4.7 2.7 1.9 3.4-.8 1.4-.6 3.2.9 4.1s3.2.6 4-1.6c.8 1 2 1.6 3.2 1.6s2.4-.6 3.2-1.6c.8 2.2 2.5 2.5 4 1.6s1.7-2.7.9-4.1c1.2-.7 1.9-2 1.9-3.4 0-1.4-.7-2.7-1.9-3.4.8-1.4.6-3.2-.9-4.1s-3.2-.6-4 1.6c-.8-1-2-1.6-3.2-1.6z" fill="currentColor" fillOpacity="0.1" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-emerald-600/80 text-white font-mono font-bold px-1 rounded select-none">NEBULA</span>
          </div>
        );
      case 'COMET':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-blue-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-blue-400 rounded-full flex items-center justify-center shadow-[0_0_10px_#60a5fa]">
              <svg className="w-6 h-6 text-blue-400 -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M19 5L5 19M19 5h-7M19 5v7M13 5L5 13M17 9l-8 8" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-blue-600/80 text-white font-mono font-bold px-1 rounded select-none">COMET</span>
          </div>
        );
      case 'ASTEROID':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-zinc-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-zinc-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              <svg className="w-6 h-6 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l4 1 3 4-1 6-4 3-5-1-4-5 1-6 6-2z" fill="currentColor" fillOpacity="0.2" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <circle cx="14" cy="13" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-zinc-600 text-white font-mono font-bold px-1 rounded select-none">ROCK</span>
          </div>
        );
      case 'ORBITER':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-amber-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-amber-500 rounded-full flex items-center justify-center shadow-[0_0_10px_#f59e0b]">
              <Orbit className="w-5.5 h-5.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-amber-500 text-black font-mono font-bold px-1 rounded select-none">PROBE</span>
          </div>
        );
      case 'DUST':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-rose-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-rose-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.3)]">
              <div className="flex gap-1 animate-pulse">
                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full" />
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
              </div>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-rose-500/80 text-white font-mono font-bold px-1 rounded-full select-none">DUST</span>
          </div>
        );
      default:
        return <span className="text-3xl select-none">🪐</span>;
    }
  };

  return (
    <div id="cosmic-void-slots-root" className="space-y-6">
      
      {/* Top Header Panel */}
      <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex gap-2.5 items-center text-left">
          <span className="text-2xl animate-pulse">🪐</span>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
              <span>COSMIC VOID SLOTS</span>
              <span className="text-[8px] bg-violet-500/20 border border-violet-500/30 text-violet-400 px-1.5 py-0.5 rounded font-black tracking-widest">SCI-FI SPACETIME</span>
            </h4>
            <div className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[9px] text-zinc-400 font-mono">VOID EXTRACTION ACCUMULATOR: {bet * 150} COINS</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-1.5 items-center">
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isFavorite 
                ? 'bg-rose-500/20 border-rose-500 text-rose-500' 
                : 'bg-white/5 border-white/5 hover:border-white/10 text-white/50'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:border-white/10 text-white/50 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-violet-400" />}
          </button>
          <button 
            onClick={() => setShowPaytable(!showPaytable)}
            className={`p-2.5 rounded-xl border transition-all text-xs font-mono font-bold cursor-pointer ${
              showPaytable 
                ? 'bg-violet-500/20 border-violet-500 text-violet-400' 
                : 'bg-white/5 border-white/5 hover:border-white/10 text-white/50'
            }`}
          >
            PAYTABLE
          </button>
        </div>
      </div>

      {/* Paytable Dropdown Panel */}
      <AnimatePresence>
        {showPaytable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/40 border border-violet-500/20 rounded-2xl p-4 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-violet-400/50">COSMIC SECTOR MULTIPLIERS</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {Object.entries(COSMIC_SYMBOLS).map(([key, sym]) => (
                <div key={key} className="flex items-center gap-2.5 p-2 bg-zinc-900/60 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-950/20 border border-violet-500/10 scale-90">
                    {renderCosmicSymbol(key, true)}
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono text-zinc-400 leading-none">{sym.name}</span>
                    <span className="text-xs font-mono font-black text-violet-400">{sym.mult}x Bet</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        
        {/* Slot Reels Container */}
        <div className="bg-[#05040a] border-2 border-violet-500/10 p-6 rounded-3xl relative min-h-[380px] flex flex-col justify-between overflow-hidden shadow-2xl">
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.03),transparent)] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500/5 rounded-full pointer-events-none blur-3xl animate-pulse" />

          {/* Paylines laser overlay indicators */}
          {winningPaylines.length > 0 && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {winningPaylines.map(lineId => {
                const line = PAYLINES.find(l => l.id === lineId);
                if (!line) return null;
                return (
                  <motion.div 
                    key={lineId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2.0 }}
                    className="absolute inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-violet-400 to-transparent blur-[1px]"
                    style={{
                      top: line.path[0] === 0 ? '25%' : line.path[0] === 1 ? '50%' : '75%'
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Reels Display (3x3 Grid Matrix) */}
          <div className="relative z-10 grid grid-cols-3 gap-4 max-w-md mx-auto my-auto w-full pt-4">
            {reels.map((col, colIdx) => {
              const isColSpinning = spinning && !stoppedRef.current[colIdx];
              
              return (
                <div 
                  key={colIdx}
                  className="bg-[#090712] border border-violet-500/10 rounded-2xl p-2 h-[260px] flex flex-col justify-between relative overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
                >
                  <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-violet-500/10 to-transparent" />
                  
                  {isColSpinning ? (
                    /* Spinning Mode */
                    <div className="flex flex-col items-center animate-reel-scroll filter blur-[1.5px] h-[340px] w-full justify-around select-none">
                      {SPINNING_SYMBOLS.map((sym, idx) => (
                        <div key={idx} className="flex items-center justify-center h-12">
                          {renderCosmicSymbol(sym, true)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Stable Mode */
                    col.map((symbol, rowIdx) => {
                      const isMiddle = rowIdx === 1;
                      
                      return (
                        <motion.div
                          key={`${colIdx}-${rowIdx}-${symbol}`}
                          initial={{ scale: 0.9, opacity: 0.6 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                          className={`flex items-center justify-center h-16 w-full rounded-xl transition-all ${
                            isMiddle 
                              ? 'bg-violet-500/5 border border-violet-500/15 scale-100 shadow-[0_0_12px_rgba(139,92,246,0.08)]' 
                              : 'opacity-30 scale-90'
                          }`}
                        >
                          {renderCosmicSymbol(symbol, isMiddle)}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom active win banner */}
          <div className="mt-4 border-t border-white/5 pt-3.5 flex justify-between items-center text-left">
            <div>
              <span className="block text-[8px] font-mono text-violet-400/50 uppercase tracking-widest">ACTIVE ORBITS</span>
              <span className="text-xs font-mono font-bold text-white flex gap-1.5 items-center mt-0.5">
                {[1, 3, 5].map((val) => (
                  <button
                    key={val}
                    disabled={spinning}
                    onClick={() => {
                      setActivePaylinesCount(val);
                      playCosmicSound('stop', isMuted);
                    }}
                    className={`px-2.5 py-0.5 rounded font-mono text-[9px] border transition-all ${
                      activePaylinesCount === val 
                        ? 'bg-violet-500 text-black border-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.25)] font-black' 
                        : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
                    }`}
                  >
                    {val} PATH{val > 1 ? 'S' : ''}
                  </button>
                ))}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-mono text-violet-400/50 uppercase tracking-widest">WAVE HARMONICS</span>
              <span className="text-xs font-mono font-black text-amber-300">
                {lastWin !== null && lastWin > 0 ? `SINGULARITY: x${lastWin / bet}` : 'ORBIT STABLE'}
              </span>
            </div>
          </div>

        </div>

        {/* Wager Console Sidebar */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* Bet size adjust panel */}
          <div className="bg-[#0c0a12] border border-violet-500/5 p-5 rounded-3xl space-y-4 text-left shadow-xl">
            <span className="text-[10px] text-violet-400/50 font-mono uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <Coins className="w-3.5 h-3.5 text-violet-400" /> SPACETIME QUANTUM INPUT
            </span>

            <div className="flex justify-between items-center">
              <button 
                onClick={() => adjustBet(-10)}
                disabled={spinning}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold border border-white/5 cursor-pointer disabled:opacity-45"
              >
                -10
              </button>
              
              <div className="text-center">
                <span className="block text-[8px] font-mono text-zinc-400 uppercase">WAGER PER ORBIT</span>
                <span className="text-2xl font-mono font-black text-white">{bet}</span>
                <span className="block text-[8px] text-zinc-500">Chips</span>
              </div>

              <button 
                onClick={() => adjustBet(10)}
                disabled={spinning}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold border border-white/5 cursor-pointer disabled:opacity-45"
              >
                +10
              </button>
            </div>

            {/* Quick selectors */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  disabled={spinning}
                  onClick={() => {
                    setBet(val);
                    playCosmicSound('stop', isMuted);
                  }}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-all ${
                    bet === val 
                      ? 'bg-violet-500 text-black border-violet-400 shadow-md' 
                      : 'bg-white/5 border-white/5 text-white/60 hover:border-white/10'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Core Action Board */}
          <div className="bg-[#0c0a12] border border-violet-500/5 p-5 rounded-3xl space-y-3 shadow-xl">
            {/* Primary Action Button */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full py-4 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-400 hover:to-fuchsia-500 text-white font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} /> 
              {spinning ? 'SPINNING ORBITS...' : 'ENGAGE HYPERDRIVE'}
            </button>

            {/* Speed Option */}
            <button
              onClick={() => {
                setIsFastMode(!isFastMode);
                playCosmicSound('stop', isMuted);
              }}
              className={`w-full py-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                isFastMode 
                  ? 'bg-violet-400/10 border-violet-500 text-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.2)]' 
                  : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isFastMode ? 'WARP SPEED ENGAGED' : 'SWITCH TO HYPERDRIVE'}</span>
            </button>
          </div>

          {/* Auto spin selection controller */}
          <div className="bg-gradient-to-b from-[#181124] to-[#0c0a12] border border-white/5 p-4 rounded-2xl text-left">
            <span className="block text-[8px] font-mono text-violet-400/50 uppercase tracking-widest mb-2 font-black">AUTOMATED WARPING</span>
            {autoSpinActive ? (
              <button
                onClick={stopAutoSpin}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>CEASE WARPING ({autoSpinCount} remaining)</span>
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    disabled={spinning}
                    onClick={() => startAutoSpin(val)}
                    className="py-1.5 bg-white/5 hover:bg-violet-500/20 border border-white/5 hover:border-violet-500/30 text-white/80 font-mono text-[10px] font-bold rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {val}x
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Outcome Log */}
      {spinHistory.length > 0 && (
        <div className="bg-[#07050b] border border-violet-500/5 p-4 rounded-2xl text-left">
          <span className="block text-[8px] font-mono text-violet-400/40 uppercase tracking-widest mb-2 font-black">SPACETIME ANOMALY LOG</span>
          <div className="flex gap-2 flex-wrap">
            {spinHistory.map((hist, idx) => (
              <span 
                key={idx}
                className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border ${
                  hist.includes('🪐') 
                    ? 'bg-violet-500/10 border-violet-500/35 text-violet-300' 
                    : 'bg-white/5 border-white/5 text-zinc-500'
                }`}
              >
                {hist}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
