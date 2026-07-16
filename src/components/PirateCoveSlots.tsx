import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Coins, Trophy, Play, RefreshCw, Volume2, VolumeX, Heart, 
  HelpCircle, Compass, Anchor, Skull, Shield, Zap
} from 'lucide-react';

interface PirateCoveSlotsProps {
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

const PIRATE_SYMBOLS: Record<string, SymbolMetadata> = {
  KRAKEN: { name: 'Kraken Eye (Wild)', mult: 200, color: 'text-emerald-400', glow: 'shadow-emerald-500/80', bgGlow: 'bg-emerald-500/10' },
  CHEST: { name: 'Treasure Chest', mult: 80, color: 'text-amber-400', glow: 'shadow-amber-500/70', bgGlow: 'bg-amber-500/10' },
  SABERS: { name: 'Crossed Sabers', mult: 40, color: 'text-red-400', glow: 'shadow-red-500/70', bgGlow: 'bg-red-500/10' },
  SKULL: { name: 'Jolly Roger', mult: 25, color: 'text-zinc-200', glow: 'shadow-zinc-300/70', bgGlow: 'bg-zinc-500/10' },
  COMPASS: { name: 'Navigator Compass', mult: 15, color: 'text-cyan-400', glow: 'shadow-cyan-500/70', bgGlow: 'bg-cyan-500/10' },
  DOUBLOON: { name: 'Gold Doubloon', mult: 10, color: 'text-yellow-500', glow: 'shadow-yellow-500/70', bgGlow: 'bg-yellow-500/10' },
  ANCHOR: { name: 'Iron Anchor', mult: 6, color: 'text-blue-400', glow: 'shadow-blue-500/70', bgGlow: 'bg-blue-500/10' },
  MAP: { name: 'Chart Parchment', mult: 4, color: 'text-orange-400', glow: 'shadow-orange-500/70', bgGlow: 'bg-orange-500/10' }
};

const SYMBOLS_POOL = ['KRAKEN', 'CHEST', 'SABERS', 'SKULL', 'COMPASS', 'DOUBLOON', 'ANCHOR', 'MAP'];
const WEIGHTED_SYMBOLS = [
  'MAP', 'MAP', 'MAP', 'MAP',
  'ANCHOR', 'ANCHOR', 'ANCHOR',
  'DOUBLOON', 'DOUBLOON', 'DOUBLOON',
  'COMPASS', 'COMPASS',
  'SKULL', 'SKULL',
  'SABERS',
  'CHEST',
  'KRAKEN'
];
const SPINNING_SYMBOLS = ['KRAKEN', 'CHEST', 'SABERS', 'SKULL', 'COMPASS', 'DOUBLOON', 'ANCHOR', 'MAP', 'KRAKEN', 'CHEST', 'SABERS', 'SKULL', 'COMPASS', 'DOUBLOON', 'ANCHOR', 'MAP'];

const PAYLINES = [
  { id: 1, name: 'Main Deck', path: [1, 1, 1], color: 'border-amber-500 text-amber-500', shadow: 'shadow-amber-500/50' },
  { id: 2, name: 'Crow\'s Nest', path: [0, 0, 0], color: 'border-sky-400 text-sky-400', shadow: 'shadow-sky-500/50' },
  { id: 3, name: 'Undercurrent', path: [2, 2, 2], color: 'border-emerald-400 text-emerald-400', shadow: 'shadow-emerald-500/50' },
  { id: 4, name: 'Cross Winds', path: [0, 1, 2], color: 'border-rose-400 text-rose-400', shadow: 'shadow-rose-500/50' },
  { id: 5, name: 'Gale Force', path: [2, 1, 0], color: 'border-violet-400 text-violet-400', shadow: 'shadow-violet-500/50' }
];

const playPirateSound = (type: 'spin' | 'stop' | 'win' | 'lose' | 'lever' | 'jackpot' | 'wild', isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'spin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'stop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'win') {
      const notes = [293.66, 329.63, 349.23, 440.00];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.35);
      });
    } else if (type === 'jackpot') {
      const notes = [220, 277.18, 329.63, 440, 554.37];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(freq * 2, ctx.currentTime + 1.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.1);
      });
    } else if (type === 'lever') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
};

export const PirateCoveSlots: React.FC<PirateCoveSlotsProps> = ({
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
    ['CHEST', 'SABERS', 'ANCHOR'],
    ['KRAKEN', 'DOUBLOON', 'MAP'],
    ['COMPASS', 'SKULL', 'ANCHOR']
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
    playPirateSound('stop', isMuted);
  };

  const handleSpin = () => {
    if (spinning) return;

    const totalWager = bet * activePaylinesCount;
    if (chips < totalWager) {
      triggerAlert(`Ye need at least ${totalWager} Chips to charter this voyage, scallywag!`, 'error');
      setAutoSpinActive(false);
      return;
    }

    setSpinning(true);
    setLastWin(null);
    setWinningPaylines([]);
    onUpdateChips(-totalWager);
    playPirateSound('lever', isMuted);

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
    playPirateSound('spin', isMuted);

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
        playPirateSound('spin', isMuted);
      }
    }, isFastMode ? 60 : 100);

    const delayStep = isFastMode ? 350 : 700;

    stoppedRef.current.forEach((_, colIdx) => {
      const timer = setTimeout(() => {
        stoppedRef.current[colIdx] = true;
        playPirateSound('stop', isMuted);

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
      } else if (s1 === 'KRAKEN' && s2 === s3) {
        isWin = true;
        winSym = s2;
      } else if (s2 === 'KRAKEN' && s1 === s3) {
        isWin = true;
        winSym = s1;
      } else if (s3 === 'KRAKEN' && s1 === s2) {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'KRAKEN' && s2 === 'KRAKEN') {
        isWin = true;
        winSym = s3;
      } else if (s2 === 'KRAKEN' && s3 === 'KRAKEN') {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'KRAKEN' && s3 === 'KRAKEN') {
        isWin = true;
        winSym = s2;
      }

      if (isWin && winSym !== '') {
        const symbolMult = PIRATE_SYMBOLS[winSym]?.mult || 3;
        totalWinMultiplier += symbolMult;
        triggeredLines.push(line.id);
        if (symbolMult >= 80) jackpotHit = true;
      }
    }

    const netWin = Math.floor(bet * totalWinMultiplier);

    setWinningPaylines(triggeredLines);
    setLastWin(netWin);
    setSpinning(false);

    if (netWin > 0) {
      onUpdateChips(netWin);
      if (jackpotHit) {
        playPirateSound('jackpot', isMuted);
        triggerAlert(`☠️ KRAKEN RISING! MASSIVE CAPTAIN'S PLUNDER AWARDS +${netWin} Chips!`, 'success');
      } else {
        playPirateSound('win', isMuted);
        triggerAlert(`Aha! Found hidden booty! Plundered +${netWin} Chips.`, 'success');
      }

      setSpinHistory(prev => [
        `🏴‍☠️ Plunder +${netWin} (${triggeredLines.length} Paylines)`,
        ...prev
      ].slice(0, 5));

      if (onUpdateTask) {
        onUpdateTask('PIRATE_SLOTS_SPIN', 1);
      }
    } else {
      setSpinHistory(prev => [
        `🌊 Dead Calm Waters`,
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
    triggerAlert(`Set sails for ${spins} automatic ocean spins.`, 'info');
    setTimeout(() => {
      handleSpin();
    }, 200);
  };

  const stopAutoSpin = () => {
    setAutoSpinActive(false);
    setAutoSpinCount(0);
    triggerAlert('Voyage stopped. Cast the anchor!', 'info');
  };

  const renderPirateSymbol = (symbol: string, isMiddle: boolean = false) => {
    const meta = PIRATE_SYMBOLS[symbol];
    if (!meta) return <span className="text-3xl">🏴‍☠️</span>;

    const scaleClass = isMiddle ? 'scale-110' : 'scale-90 opacity-40';

    switch (symbol) {
      case 'KRAKEN':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-emerald-600/35 rounded-full blur-md animate-pulse" />
            <div className="absolute inset-0 border border-emerald-500 rounded-full animate-spin [animation-duration:6s]" />
            <div className="w-11 h-11 bg-black border border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_#10b981]">
              <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.1" />
                <path d="M12 2a30 30 0 0 0-3 10c0 4.5 1.5 8 3 10m0-20a30 30 0 0 1 3 10c0 4.5-1.5 8-3 10" />
                <ellipse cx="12" cy="12" rx="4" ry="2" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="#fff" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-emerald-600 text-black font-extrabold px-1.5 py-0.5 rounded-full font-mono select-none tracking-widest uppercase">WILD</span>
          </div>
        );
      case 'CHEST':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-amber-500/25 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_12px_#f59e0b]">
              <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 10h16v10H4z" fill="currentColor" fillOpacity="0.1" />
                <path d="M4 10s2-6 8-6 8 6 8 6H4z" />
                <circle cx="12" cy="10" r="1.5" fill="#000" stroke="currentColor" />
                <line x1="8" y1="14" x2="16" y2="14" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-amber-600 text-white font-mono font-bold px-1 rounded select-none">TREASURE</span>
          </div>
        );
      case 'SABERS':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-red-500 rounded-full flex items-center justify-center shadow-[0_0_10px_#ef4444]">
              <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 20L20 4M20 4h-6M20 4v6" />
                <path d="M20 20L4 4M4 4h6M4 4v6" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-red-600 text-white font-mono font-bold px-1 rounded select-none">SWORDS</span>
          </div>
        );
      case 'SKULL':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-zinc-600/20 rounded-full blur-md animate-pulse" />
            <div className="w-11 h-11 bg-black border border-zinc-500 rounded-full flex items-center justify-center shadow-[0_0_10px_#d4d4d8]">
              <Skull className="w-5.5 h-5.5 text-zinc-300" />
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-zinc-700 text-white font-mono font-bold px-1 rounded select-none">ROGUE</span>
          </div>
        );
      case 'COMPASS':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-cyan-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_10px_#22d3ee]">
              <Compass className="w-5.5 h-5.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-cyan-600/80 text-white font-mono font-bold px-1 rounded select-none">COMPASS</span>
          </div>
        );
      case 'DOUBLOON':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-yellow-500/25 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border-2 border-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_12px_#eab308]">
              <div className="w-7 h-7 rounded-full border border-dashed border-yellow-500/40 flex items-center justify-center">
                <Skull className="w-3.5 h-3.5 text-yellow-500" />
              </div>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-yellow-500 text-black font-mono font-black px-1 rounded-full select-none">GOLD</span>
          </div>
        );
      case 'ANCHOR':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-blue-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-blue-500 rounded-full flex items-center justify-center shadow-[0_0_10px_#3b82f6]">
              <Anchor className="w-5 h-5 text-blue-400" />
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-blue-600/80 text-white font-mono font-bold px-1 rounded select-none">ANCHOR</span>
          </div>
        );
      case 'MAP':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-orange-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-orange-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.3)]">
              <svg className="w-5.5 h-5.5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6l6-3 6 3 6-3v12l-6 3-6-3-6 3V6z" />
                <path d="M9 3v15M15 6v15" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-orange-500/80 text-white font-mono font-bold px-1 rounded select-none">MAP</span>
          </div>
        );
      default:
        return <span className="text-3xl select-none">🏴‍☠️</span>;
    }
  };

  return (
    <div id="pirate-cove-slots-root" className="space-y-6">
      
      {/* Top Header Panel */}
      <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex gap-2.5 items-center text-left">
          <span className="text-2xl animate-pulse">🏴‍☠️</span>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
              <span>CRIMSON COVE SLOTS</span>
              <span className="text-[8px] bg-amber-500/20 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded font-black tracking-widest">HIGH SEAS PLUNDER</span>
            </h4>
            <div className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[9px] text-zinc-400 font-mono">PIRATE CAPTAIN PLUNDER: {bet * 200} CHIPS</span>
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
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>
          <button 
            onClick={() => setShowPaytable(!showPaytable)}
            className={`p-2.5 rounded-xl border transition-all text-xs font-mono font-bold cursor-pointer ${
              showPaytable 
                ? 'bg-amber-500/20 border-amber-500 text-amber-400' 
                : 'bg-white/5 border-white/5 hover:border-white/10 text-white/50'
            }`}
          >
            BOOTY MAP
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
            className="bg-black/40 border border-amber-500/20 rounded-2xl p-4 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-amber-400/50">SEA CAPTAIN'S PLUNDER MULTIPLIERS</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {Object.entries(PIRATE_SYMBOLS).map(([key, sym]) => (
                <div key={key} className="flex items-center gap-2.5 p-2 bg-zinc-900/60 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-950/20 border border-amber-500/10 scale-90">
                    {renderPirateSymbol(key, true)}
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono text-zinc-400 leading-none">{sym.name}</span>
                    <span className="text-xs font-mono font-black text-amber-400">{sym.mult}x Wager</span>
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
        <div className="bg-[#0c0a06] border-2 border-amber-500/10 p-6 rounded-3xl relative min-h-[380px] flex flex-col justify-between overflow-hidden shadow-2xl">
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(245,158,11,0.03),transparent)] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/5 rounded-full pointer-events-none blur-3xl animate-pulse" />

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
                    className="absolute inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px]"
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
                  className="bg-[#120f09] border border-amber-500/10 rounded-2xl p-2 h-[260px] flex flex-col justify-between relative overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
                >
                  <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-amber-500/10 to-transparent" />
                  
                  {isColSpinning ? (
                    /* Spinning Mode */
                    <div className="flex flex-col items-center animate-reel-scroll filter blur-[1.5px] h-[340px] w-full justify-around select-none">
                      {SPINNING_SYMBOLS.map((sym, idx) => (
                        <div key={idx} className="flex items-center justify-center h-12">
                          {renderPirateSymbol(sym, true)}
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
                              ? 'bg-amber-500/5 border border-amber-500/15 scale-100 shadow-[0_0_12px_rgba(245,158,11,0.08)]' 
                              : 'opacity-30 scale-90'
                          }`}
                        >
                          {renderPirateSymbol(symbol, isMiddle)}
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
              <span className="block text-[8px] font-mono text-amber-400/50 uppercase tracking-widest">ACTIVE VOYAGES</span>
              <span className="text-xs font-mono font-bold text-white flex gap-1.5 items-center mt-0.5">
                {[1, 3, 5].map((val) => (
                  <button
                    key={val}
                    disabled={spinning}
                    onClick={() => {
                      setActivePaylinesCount(val);
                      playPirateSound('stop', isMuted);
                    }}
                    className={`px-2.5 py-0.5 rounded font-mono text-[9px] border transition-all ${
                      activePaylinesCount === val 
                        ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.25)] font-black' 
                        : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
                    }`}
                  >
                    {val} PATH{val > 1 ? 'S' : ''}
                  </button>
                ))}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-mono text-amber-400/50 uppercase tracking-widest">SEA CHART NAVIGATION</span>
              <span className="text-xs font-mono font-black text-amber-300">
                {lastWin !== null && lastWin > 0 ? `PLUNDER: x${lastWin / bet}` : 'SAILING STEADY'}
              </span>
            </div>
          </div>

        </div>

        {/* Wager Console Sidebar */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* Bet size adjust panel */}
          <div className="bg-[#120e06] border border-amber-500/5 p-5 rounded-3xl space-y-4 text-left shadow-xl">
            <span className="text-[10px] text-amber-400/50 font-mono uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> VOYAGE COIN ALLOCATION
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
                <span className="block text-[8px] font-mono text-zinc-400 uppercase">WAGER PER SAIL</span>
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
                    playPirateSound('stop', isMuted);
                  }}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-all ${
                    bet === val 
                      ? 'bg-amber-500 text-black border-amber-400 shadow-md' 
                      : 'bg-white/5 border-white/5 text-white/60 hover:border-white/10'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Core Action Board */}
          <div className="bg-[#120e06] border border-amber-500/5 p-5 rounded-3xl space-y-3 shadow-xl">
            {/* Primary Action Button */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} /> 
              {spinning ? 'PULLING HEAVY RIGGING...' : 'SPIN FOR TREASURE'}
            </button>

            {/* Speed Option */}
            <button
              onClick={() => {
                setIsFastMode(!isFastMode);
                playPirateSound('stop', isMuted);
              }}
              className={`w-full py-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                isFastMode 
                  ? 'bg-amber-400/10 border-amber-500 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                  : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isFastMode ? 'STORMY GALE MODE ACTIVE' : 'SWITCH TO GALE SPEED'}</span>
            </button>
          </div>

          {/* Auto spin selection controller */}
          <div className="bg-gradient-to-b from-[#1c160a] to-[#120e06] border border-white/5 p-4 rounded-2xl text-left">
            <span className="block text-[8px] font-mono text-amber-400/50 uppercase tracking-widest mb-2 font-black">AUTOMATIC VOYAGES</span>
            {autoSpinActive ? (
              <button
                onClick={stopAutoSpin}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>DROP ANCHOR NOW ({autoSpinCount} remaining)</span>
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    disabled={spinning}
                    onClick={() => startAutoSpin(val)}
                    className="py-1.5 bg-white/5 hover:bg-amber-500/20 border border-white/5 hover:border-amber-500/30 text-white/80 font-mono text-[10px] font-bold rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
        <div className="bg-[#0b0805] border border-amber-500/5 p-4 rounded-2xl text-left">
          <span className="block text-[8px] font-mono text-amber-400/40 uppercase tracking-widest mb-2 font-black">SHIP CAPTAIN'S LOGBOOK</span>
          <div className="flex gap-2 flex-wrap">
            {spinHistory.map((hist, idx) => (
              <span 
                key={idx}
                className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border ${
                  hist.includes('🏴‍☠️') 
                    ? 'bg-amber-500/10 border-amber-500/35 text-amber-300' 
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
