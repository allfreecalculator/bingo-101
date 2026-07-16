import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Coins, Trophy, Play, RefreshCw, Volume2, VolumeX, Heart, 
  HelpCircle, Flower, Star, Wind, Moon, Sun, Trees, Compass
} from 'lucide-react';

interface ZenSakuraSlotsProps {
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

const ZEN_SYMBOLS: Record<string, SymbolMetadata> = {
  SAKURA: { name: 'Sakura Wild', mult: 120, color: 'text-pink-400', glow: 'shadow-pink-500/80', bgGlow: 'bg-pink-500/10' },
  YIN_YANG: { name: 'Yin Yang', mult: 50, color: 'text-zinc-200', glow: 'shadow-zinc-300/70', bgGlow: 'bg-zinc-500/10' },
  KOI: { name: 'Golden Koi', mult: 30, color: 'text-orange-400', glow: 'shadow-orange-500/70', bgGlow: 'bg-orange-500/10' },
  TORII: { name: 'Torii Gate', mult: 18, color: 'text-red-500', glow: 'shadow-red-500/70', bgGlow: 'bg-red-500/10' },
  BONSAI: { name: 'Bonsai Tree', mult: 12, color: 'text-emerald-400', glow: 'shadow-emerald-500/70', bgGlow: 'bg-emerald-500/10' },
  FAN: { name: 'Folding Fan', mult: 8, color: 'text-violet-400', glow: 'shadow-violet-500/70', bgGlow: 'bg-violet-500/10' },
  LOTUS: { name: 'Lotus Flower', mult: 5, color: 'text-teal-400', glow: 'shadow-teal-500/70', bgGlow: 'bg-teal-500/10' },
  JADE: { name: 'Jade Coin', mult: 3, color: 'text-green-500', glow: 'shadow-green-500/70', bgGlow: 'bg-green-500/10' }
};

const SYMBOLS_POOL = ['SAKURA', 'YIN_YANG', 'KOI', 'TORII', 'BONSAI', 'FAN', 'LOTUS', 'JADE'];
const WEIGHTED_SYMBOLS = [
  'JADE', 'JADE', 'JADE', 'JADE',
  'LOTUS', 'LOTUS', 'LOTUS',
  'FAN', 'FAN', 'FAN',
  'BONSAI', 'BONSAI',
  'TORII', 'TORII',
  'KOI',
  'YIN_YANG',
  'SAKURA'
];
const SPINNING_SYMBOLS = ['SAKURA', 'YIN_YANG', 'KOI', 'TORII', 'BONSAI', 'FAN', 'LOTUS', 'JADE', 'SAKURA', 'YIN_YANG', 'KOI', 'TORII', 'BONSAI', 'FAN', 'LOTUS', 'JADE'];

const PAYLINES = [
  { id: 1, name: 'Center Path', path: [1, 1, 1], color: 'border-pink-400 text-pink-400', shadow: 'shadow-pink-500/50' },
  { id: 2, name: 'Upper Path', path: [0, 0, 0], color: 'border-sky-400 text-sky-400', shadow: 'shadow-sky-500/50' },
  { id: 3, name: 'Lower Path', path: [2, 2, 2], color: 'border-emerald-400 text-emerald-400', shadow: 'shadow-emerald-500/50' },
  { id: 4, name: 'Mountain Path', path: [2, 1, 0], color: 'border-amber-400 text-amber-400', shadow: 'shadow-amber-500/50' },
  { id: 5, name: 'Valley Path', path: [0, 1, 2], color: 'border-fuchsia-400 text-fuchsia-400', shadow: 'shadow-fuchsia-500/50' }
];

// Soothing Organic Chime Sounds using Web Audio API
const playZenSound = (type: 'spin' | 'stop' | 'win' | 'lose' | 'lever' | 'jackpot' | 'wild', isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'spin') {
      // Wind chime sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'stop') {
      // Soft woodblock tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(147, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'win') {
      // Pentatonic chime chord
      const freqs = [523.25, 587.33, 659.25, 783.99, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.03, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.35);
      });
    } else if (type === 'jackpot') {
      // Healing bowl ringing
      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      });
    } else if (type === 'lever') {
      // Gentle water ripple trigger
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {}
};

export const ZenSakuraSlots: React.FC<ZenSakuraSlotsProps> = ({
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

  // Grid layout: 3 reels, each showing 3 rows
  const [reels, setReels] = useState<string[][]>([
    ['LOTUS', 'JADE', 'FAN'],
    ['BONSAI', 'SAKURA', 'KOI'],
    ['FAN', 'TORII', 'LOTUS']
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
    playZenSound('stop', isMuted);
  };

  const handleSpin = () => {
    if (spinning) return;

    const totalWager = bet * activePaylinesCount;
    if (chips < totalWager) {
      triggerAlert(`Your account requires ${totalWager} Chips for this Zen alignment.`, 'error');
      setAutoSpinActive(false);
      return;
    }

    setSpinning(true);
    setLastWin(null);
    setWinningPaylines([]);
    onUpdateChips(-totalWager);
    playZenSound('lever', isMuted);

    // Get 3 final reels randomly
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
    playZenSound('spin', isMuted);

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
        playZenSound('spin', isMuted);
      }
    }, isFastMode ? 60 : 100);

    const delayStep = isFastMode ? 350 : 700;

    stoppedRef.current.forEach((_, colIdx) => {
      const timer = setTimeout(() => {
        stoppedRef.current[colIdx] = true;
        playZenSound('stop', isMuted);

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
      } else if (s1 === 'SAKURA' && s2 === s3) {
        isWin = true;
        winSym = s2;
      } else if (s2 === 'SAKURA' && s1 === s3) {
        isWin = true;
        winSym = s1;
      } else if (s3 === 'SAKURA' && s1 === s2) {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'SAKURA' && s2 === 'SAKURA') {
        isWin = true;
        winSym = s3;
      } else if (s2 === 'SAKURA' && s3 === 'SAKURA') {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'SAKURA' && s3 === 'SAKURA') {
        isWin = true;
        winSym = s2;
      }

      if (isWin && winSym !== '') {
        const symbolMult = ZEN_SYMBOLS[winSym]?.mult || 3;
        totalWinMultiplier += symbolMult;
        triggeredLines.push(line.id);
        if (symbolMult >= 50) jackpotHit = true;
      }
    }

    const netWin = Math.floor(bet * totalWinMultiplier);

    setWinningPaylines(triggeredLines);
    setLastWin(netWin);
    setSpinning(false);

    if (netWin > 0) {
      onUpdateChips(netWin);
      if (jackpotHit) {
        playZenSound('jackpot', isMuted);
        triggerAlert(`🌸 ZEN REVELATION! Pristine sakura alignment awards +${netWin} Chips!`, 'success');
      } else {
        playZenSound('win', isMuted);
        triggerAlert(`Harmonious alignment completed! Earned +${netWin} Chips.`, 'success');
      }

      setSpinHistory(prev => [
        `🌸 Harmonies +${netWin} (${triggeredLines.length} Lines)`,
        ...prev
      ].slice(0, 5));

      if (onUpdateTask) {
        onUpdateTask('ZEN_SLOTS_SPIN', 1);
      }
    } else {
      setSpinHistory(prev => [
        `🍃 Restoring Balance`,
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
    triggerAlert(`Initiating ${spins} tranquil automatic garden spins.`, 'info');
    setTimeout(() => {
      handleSpin();
    }, 200);
  };

  const stopAutoSpin = () => {
    setAutoSpinActive(false);
    setAutoSpinCount(0);
    triggerAlert('Tranquil cycle terminated.', 'info');
  };

  const renderZenSymbol = (symbol: string, isMiddle: boolean = false) => {
    const meta = ZEN_SYMBOLS[symbol];
    if (!meta) return <span className="text-3xl">🌸</span>;

    const scaleClass = isMiddle ? 'scale-110' : 'scale-90 opacity-40';

    switch (symbol) {
      case 'SAKURA':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-pink-400/25 rounded-full blur-md animate-pulse" />
            <div className="absolute inset-0 border border-pink-400/30 rounded-full animate-spin [animation-duration:15s]" />
            <div className="w-11 h-11 bg-[#100b14] border border-pink-400 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(244,114,182,0.8)]">
              <svg className="w-6 h-6 text-pink-400 fill-pink-300/10 drop-shadow-[0_0_6px_#f472b6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C10.5 4 8 4 6.5 5.5 5 7 5 9.5 6 11c1.5 2.5 4.5 4 6 7 1.5-3 4.5-4.5 6-7 1-1.5 1-4-.5-5.5C16 4 13.5 4 12 2z" />
                <path d="M12 12c.5 1.5 2 2.5 3.5 3M12 12c-.5 1.5-2 2.5-3.5 3" />
                <circle cx="12" cy="11" r="1.5" fill="#f472b6" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-pink-500 text-black font-extrabold px-1.5 py-0.5 rounded-full font-mono select-none tracking-widest uppercase">WILD</span>
          </div>
        );
      case 'YIN_YANG':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-zinc-400/20 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-zinc-500 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.3)] overflow-hidden relative">
              <svg className="w-9 h-9 text-zinc-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" fill="#000" />
                <path d="M12 2a10 10 0 000 20 5 5 0 000-10 5 5 0 010-10z" fill="#fff" />
                <circle cx="12" cy="7" r="1.5" fill="#000" />
                <circle cx="12" cy="17" r="1.5" fill="#fff" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono font-bold px-1 rounded select-none">BALANCE</span>
          </div>
        );
      case 'KOI':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-md animate-pulse" />
            <div className="w-11 h-11 bg-[#100c05] border border-orange-500 rounded-full flex items-center justify-center shadow-[0_0_10px_#f97316]">
              <svg className="w-6 h-6 text-orange-400 fill-orange-500/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8 4 6 8 6 12s2 8 6 10c4-2 6-6 6-10s-2-8-6-10z" />
                <path d="M12 6c-1.5 2-2 4-2 6s.5 4 2 6M12 6c1.5 2 2 4 2 6s-.5 4-2 6" />
                <path d="M9 10c-1.5-.5-3 .5-3 2s1.5 2.5 3 2M15 10c1.5-.5 3 .5 3 2s-1.5 2.5-3 2" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-orange-500 text-black font-mono font-black px-1 rounded select-none">KOI</span>
          </div>
        );
      case 'TORII':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-red-600/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-[#140606] border border-red-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.7)]">
              <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 6h18M5 9h14M7 9v11M17 9v11M3 4c3 1 15 1 18 0" strokeLinecap="round" />
                <path d="M5 6v3M19 6v3" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-red-600/80 text-white font-mono font-bold px-1 rounded select-none">TORII</span>
          </div>
        );
      case 'BONSAI':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-emerald-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-[#06140c] border border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.7)]">
              <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 18c-3 0-5-1-5-2.5s2-2.5 5-2.5 5 1 5 2.5-2 2.5-5 2.5z" fill="currentColor" fillOpacity="0.1" />
                <path d="M12 13v5M12 15c-1-1-3-1-4-2M12 14c1-.5 3-1.5 4-1M8 12c-1.5-1-1.5-3 0-4s3 .5 3 2c0-1.5 1.5-3 3-2.5s2.5 2.5 1 3.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-emerald-600/80 text-white font-mono font-bold px-1 rounded select-none">BONSAI</span>
          </div>
        );
      case 'FAN':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-violet-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-[#0c0614] border border-violet-400 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(167,139,250,0.7)]">
              <svg className="w-6 h-6 text-violet-400 fill-violet-500/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 20l-9-9a13 13 0 0 1 18 0l-9 9z" />
                <path d="M12 20L7.5 12.5M12 20l4.5-7.5M12 20V11" />
                <circle cx="12" cy="20" r="1" fill="currentColor" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-violet-600/80 text-white font-mono font-bold px-1 rounded select-none">FAN</span>
          </div>
        );
      case 'LOTUS':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-teal-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-[#061414] border border-teal-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(20,184,166,0.7)]">
              <svg className="w-6 h-6 text-teal-400 fill-teal-500/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c-1.5 3.5-4 5.5-6.5 6.5C3 10.5 3 13 4.5 14.5c2.5 2.5 5 1.5 7.5 4.5 2.5-3 5-2 7.5-4.5 1.5-1.5 1.5-4-1-5C16 8.5 13.5 6.5 12 3z" />
                <path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-teal-600/80 text-white font-mono font-bold px-1 rounded select-none">LOTUS</span>
          </div>
        );
      case 'JADE':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-green-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-[#061406] border-2 border-green-500 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.7)]">
              <div className="w-5 h-5 rounded border border-dashed border-green-400/40 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-black border border-green-500 rotate-45" />
              </div>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-green-600 text-white font-mono font-bold px-1 rounded-full select-none">JADE</span>
          </div>
        );
      default:
        return <span className="text-3xl select-none">🌸</span>;
    }
  };

  return (
    <div id="zen-sakura-slots-root" className="space-y-6">
      
      {/* Top Header Panel */}
      <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex gap-2.5 items-center text-left">
          <span className="text-2xl animate-pulse">🌸</span>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
              <span>ZEN SAKURA SLOTS</span>
              <span className="text-[8px] bg-pink-500/20 border border-pink-500/30 text-pink-400 px-1.5 py-0.5 rounded font-black tracking-widest">AESTHETIC</span>
            </h4>
            <div className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
              <span className="text-[9px] text-zinc-400 font-mono">SAKURA GARDEN ALIGNMENT: {bet * 120} COINS</span>
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
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-pink-400" />}
          </button>
          <button 
            onClick={() => setShowPaytable(!showPaytable)}
            className={`p-2.5 rounded-xl border transition-all text-xs font-mono font-bold cursor-pointer ${
              showPaytable 
                ? 'bg-pink-500/20 border-pink-500 text-pink-400' 
                : 'bg-white/5 border-white/5 hover:border-white/10 text-white/50'
            }`}
          >
            ALIGNMENTS
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
            className="bg-black/40 border border-pink-500/20 rounded-2xl p-4 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-pink-400/50">ZEN ALIGNMENT TABLE</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {Object.entries(ZEN_SYMBOLS).map(([key, sym]) => (
                <div key={key} className="flex items-center gap-2.5 p-2 bg-zinc-900/60 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-pink-950/20 border border-pink-500/10 scale-90">
                    {renderZenSymbol(key, true)}
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono text-zinc-400 leading-none">{sym.name}</span>
                    <span className="text-xs font-mono font-black text-pink-400">{sym.mult}x Wager</span>
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
        <div className="bg-[#0b080f] border-2 border-pink-500/10 p-6 rounded-3xl relative min-h-[380px] flex flex-col justify-between overflow-hidden shadow-2xl">
          
          {/* Zen artistic bamboo background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(244,114,182,0.03),transparent)] pointer-events-none" />
          
          {/* Visual glow backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/5 rounded-full pointer-events-none blur-3xl animate-pulse" />

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
                    className="absolute inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-pink-400 to-transparent blur-[1px]"
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
                  className="bg-[#0f0b14] border border-pink-500/10 rounded-2xl p-2 h-[260px] flex flex-col justify-between relative overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
                >
                  <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-pink-500/10 to-transparent" />
                  
                  {isColSpinning ? (
                    /* Spinning Mode */
                    <div className="flex flex-col items-center animate-reel-scroll filter blur-[1.5px] h-[340px] w-full justify-around select-none">
                      {SPINNING_SYMBOLS.map((sym, idx) => (
                        <div key={idx} className="flex items-center justify-center h-12">
                          {renderZenSymbol(sym, true)}
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
                              ? 'bg-pink-500/5 border border-pink-500/15 scale-100 shadow-[0_0_12px_rgba(244,114,182,0.08)]' 
                              : 'opacity-30 scale-90'
                          }`}
                        >
                          {renderZenSymbol(symbol, isMiddle)}
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
              <span className="block text-[8px] font-mono text-pink-400/50 uppercase tracking-widest">ACTIVE PATHWAYS</span>
              <span className="text-xs font-mono font-bold text-white flex gap-1.5 items-center mt-0.5">
                {[1, 3, 5].map((val) => (
                  <button
                    key={val}
                    disabled={spinning}
                    onClick={() => {
                      setActivePaylinesCount(val);
                      playZenSound('stop', isMuted);
                    }}
                    className={`px-2.5 py-0.5 rounded font-mono text-[9px] border transition-all ${
                      activePaylinesCount === val 
                        ? 'bg-pink-500 text-black border-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.25)] font-black' 
                        : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
                    }`}
                  >
                    {val} PATH{val > 1 ? 'S' : ''}
                  </button>
                ))}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-mono text-pink-400/50 uppercase tracking-widest">ALIGNMENT STATUS</span>
              <span className="text-xs font-mono font-black text-amber-300">
                {lastWin !== null && lastWin > 0 ? `REVELATION: x${lastWin / bet}` : 'SEEKING HARMONY'}
              </span>
            </div>
          </div>

        </div>

        {/* Wager Console Sidebar */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* Bet size adjust panel */}
          <div className="bg-[#0e0a14] border border-pink-500/5 p-5 rounded-3xl space-y-4 text-left shadow-xl">
            <span className="text-[10px] text-pink-400/50 font-mono uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <Coins className="w-3.5 h-3.5 text-pink-400" /> CHIP offering ADJUSTER
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
                <span className="block text-[8px] font-mono text-zinc-400 uppercase">OFFERING PER PATH</span>
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
                    playZenSound('stop', isMuted);
                  }}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-all ${
                    bet === val 
                      ? 'bg-pink-500 text-black border-pink-400 shadow-md' 
                      : 'bg-white/5 border-white/5 text-white/60 hover:border-white/10'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Core Action Board */}
          <div className="bg-[#0e0a14] border border-pink-500/5 p-5 rounded-3xl space-y-3 shadow-xl">
            {/* Primary Action Button */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full py-4 bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-300 hover:to-rose-400 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} /> 
              {spinning ? 'ALIGNING REELS...' : 'COMMENCE ALIGNMENT'}
            </button>

            {/* Speed Option */}
            <button
              onClick={() => {
                setIsFastMode(!isFastMode);
                playZenSound('stop', isMuted);
              }}
              className={`w-full py-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                isFastMode 
                  ? 'bg-pink-400/10 border-pink-500 text-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.2)]' 
                  : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>{isFastMode ? 'WHISPER MODE ACTIVE' : 'SWITCH TO WHISPER'}</span>
            </button>
          </div>

          {/* Auto spin selection controller */}
          <div className="bg-gradient-to-b from-[#16101c] to-[#0e0a14] border border-white/5 p-4 rounded-2xl text-left">
            <span className="block text-[8px] font-mono text-pink-400/50 uppercase tracking-widest mb-2 font-black">MEDITATIVE ROTATIONS</span>
            {autoSpinActive ? (
              <button
                onClick={stopAutoSpin}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>CEASE ROTATIONS ({autoSpinCount} remaining)</span>
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    disabled={spinning}
                    onClick={() => startAutoSpin(val)}
                    className="py-1.5 bg-white/5 hover:bg-pink-500/20 border border-white/5 hover:border-pink-500/30 text-white/80 font-mono text-[10px] font-bold rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
        <div className="bg-[#09060b] border border-pink-500/5 p-4 rounded-2xl text-left">
          <span className="block text-[8px] font-mono text-pink-400/40 uppercase tracking-widest mb-2 font-black">BALANCE LOG TRACE</span>
          <div className="flex gap-2 flex-wrap">
            {spinHistory.map((hist, idx) => (
              <span 
                key={idx}
                className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border ${
                  hist.includes('🌸') 
                    ? 'bg-pink-500/10 border-pink-500/35 text-pink-300' 
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
