import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Coins, Trophy, Play, RefreshCw, Volume2, VolumeX, Heart, 
  HelpCircle, Sun, Gem, Star, Compass, Shield, Zap
} from 'lucide-react';

interface PharaohGoldSlotsProps {
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

const EGYPT_SYMBOLS: Record<string, SymbolMetadata> = {
  ANUBIS: { name: 'Gilded Anubis (Wild)', mult: 250, color: 'text-yellow-400', glow: 'shadow-yellow-500/80', bgGlow: 'bg-yellow-500/10' },
  SCARAB: { name: 'Jeweled Scarab', mult: 90, color: 'text-cyan-400', glow: 'shadow-cyan-500/70', bgGlow: 'bg-cyan-500/10' },
  PYRAMID: { name: 'Golden Pyramid', mult: 50, color: 'text-amber-500', glow: 'shadow-amber-500/70', bgGlow: 'bg-amber-500/10' },
  EYE: { name: 'Eye of Horus', mult: 30, color: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/70', bgGlow: 'bg-fuchsia-500/10' },
  ANKH: { name: 'Key of Life Ankh', mult: 18, color: 'text-yellow-300', glow: 'shadow-yellow-400/70', bgGlow: 'bg-yellow-500/10' },
  SOPHIA: { name: 'Papyrus Scroll', mult: 12, color: 'text-orange-300', glow: 'shadow-orange-400/70', bgGlow: 'bg-orange-500/10' },
  LOTUS: { name: 'Sacred Lotus', mult: 7, color: 'text-pink-400', glow: 'shadow-pink-500/70', bgGlow: 'bg-pink-500/10' },
  TALISMAN: { name: 'Desert Talisman', mult: 4, color: 'text-zinc-300', glow: 'shadow-zinc-300/70', bgGlow: 'bg-zinc-500/10' }
};

const SYMBOLS_POOL = ['ANUBIS', 'SCARAB', 'PYRAMID', 'EYE', 'ANKH', 'SOPHIA', 'LOTUS', 'TALISMAN'];
const WEIGHTED_SYMBOLS = [
  'TALISMAN', 'TALISMAN', 'TALISMAN', 'TALISMAN',
  'LOTUS', 'LOTUS', 'LOTUS',
  'SOPHIA', 'SOPHIA', 'SOPHIA',
  'ANKH', 'ANKH',
  'EYE', 'EYE',
  'PYRAMID',
  'SCARAB',
  'ANUBIS'
];
const SPINNING_SYMBOLS = ['ANUBIS', 'SCARAB', 'PYRAMID', 'EYE', 'ANKH', 'SOPHIA', 'LOTUS', 'TALISMAN', 'ANUBIS', 'SCARAB', 'PYRAMID', 'EYE', 'ANKH', 'SOPHIA', 'LOTUS', 'TALISMAN'];

const PAYLINES = [
  { id: 1, name: 'Sands of Giza', path: [1, 1, 1], color: 'border-yellow-500 text-yellow-500', shadow: 'shadow-yellow-500/50' },
  { id: 2, name: 'Pharaoh\'s Tomb', path: [0, 0, 0], color: 'border-amber-400 text-amber-400', shadow: 'shadow-amber-500/50' },
  { id: 3, name: 'Nile Current', path: [2, 2, 2], color: 'border-teal-400 text-teal-400', shadow: 'shadow-teal-500/50' },
  { id: 4, name: 'Desert Mirage', path: [0, 1, 2], color: 'border-fuchsia-400 text-fuchsia-400', shadow: 'shadow-fuchsia-500/50' },
  { id: 5, name: 'Scarab Ascent', path: [2, 1, 0], color: 'border-cyan-400 text-cyan-400', shadow: 'shadow-cyan-500/50' }
];

const playPharaohSound = (type: 'spin' | 'stop' | 'win' | 'lose' | 'lever' | 'jackpot' | 'wild', isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'spin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'stop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'win') {
      const notes = [293.66, 349.23, 440, 523.25];
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
      const notes = [329.63, 415.30, 493.88, 659.25, 830.61];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(freq * 2, ctx.currentTime + 1.2);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      });
    } else if (type === 'lever') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
};

export const PharaohGoldSlots: React.FC<PharaohGoldSlotsProps> = ({
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
    ['PYRAMID', 'EYE', 'LOTUS'],
    ['ANUBIS', 'SCARAB', 'TALISMAN'],
    ['ANKH', 'SOPHIA', 'EYE']
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
    playPharaohSound('stop', isMuted);
  };

  const handleSpin = () => {
    if (spinning) return;

    const totalWager = bet * activePaylinesCount;
    if (chips < totalWager) {
      triggerAlert(`Ye need at least ${totalWager} Chips to unlock the tomb!`, 'error');
      setAutoSpinActive(false);
      return;
    }

    setSpinning(true);
    setLastWin(null);
    setWinningPaylines([]);
    onUpdateChips(-totalWager);
    playPharaohSound('lever', isMuted);

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
    playPharaohSound('spin', isMuted);

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
        playPharaohSound('spin', isMuted);
      }
    }, isFastMode ? 60 : 100);

    const delayStep = isFastMode ? 350 : 700;

    stoppedRef.current.forEach((_, colIdx) => {
      const timer = setTimeout(() => {
        stoppedRef.current[colIdx] = true;
        playPharaohSound('stop', isMuted);

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
      } else if (s1 === 'ANUBIS' && s2 === s3) {
        isWin = true;
        winSym = s2;
      } else if (s2 === 'ANUBIS' && s1 === s3) {
        isWin = true;
        winSym = s1;
      } else if (s3 === 'ANUBIS' && s1 === s2) {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'ANUBIS' && s2 === 'ANUBIS') {
        isWin = true;
        winSym = s3;
      } else if (s2 === 'ANUBIS' && s3 === 'ANUBIS') {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'ANUBIS' && s3 === 'ANUBIS') {
        isWin = true;
        winSym = s2;
      }

      if (isWin && winSym !== '') {
        const symbolMult = EGYPT_SYMBOLS[winSym]?.mult || 3;
        totalWinMultiplier += symbolMult;
        triggeredLines.push(line.id);
        if (symbolMult >= 90) jackpotHit = true;
      }
    }

    const netWin = Math.floor(bet * totalWinMultiplier);

    setWinningPaylines(triggeredLines);
    setLastWin(netWin);
    setSpinning(false);

    if (netWin > 0) {
      onUpdateChips(netWin);
      if (jackpotHit) {
        playPharaohSound('jackpot', isMuted);
        triggerAlert(`🏺 ANUBIS CRUCIBLE! Ancient gods bestow +${netWin} Chips!`, 'success');
      } else {
        playPharaohSound('win', isMuted);
        triggerAlert(`Tomb revealed! Retrieved +${netWin} Chips!`, 'success');
      }

      setSpinHistory(prev => [
        `🏺 Relic +${netWin} (${triggeredLines.length} Chambers)`,
        ...prev
      ].slice(0, 5));

      if (onUpdateTask) {
        onUpdateTask('PHARAOH_SLOTS_SPIN', 1);
      }
    } else {
      setSpinHistory(prev => [
        `🏜️ Lost in Sands`,
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
    triggerAlert(`Commencing ${spins} automatic tomb investigations.`, 'info');
    setTimeout(() => {
      handleSpin();
    }, 200);
  };

  const stopAutoSpin = () => {
    setAutoSpinActive(false);
    setAutoSpinCount(0);
    triggerAlert('Tomb exploration halted.', 'info');
  };

  const renderEgyptSymbol = (symbol: string, isMiddle: boolean = false) => {
    const meta = EGYPT_SYMBOLS[symbol];
    if (!meta) return <span className="text-3xl">🏺</span>;

    const scaleClass = isMiddle ? 'scale-110' : 'scale-90 opacity-40';

    switch (symbol) {
      case 'ANUBIS':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-yellow-600/35 rounded-full blur-md animate-pulse" />
            <div className="absolute inset-0 border border-yellow-500 rounded-full animate-spin [animation-duration:8s]" />
            <div className="w-11 h-11 bg-black border-2 border-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_15px_#eab308]">
              <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L9 9h6l-3-7zM7 22l2-11h6l2 11H7z" fill="currentColor" fillOpacity="0.1" />
                <path d="M12 9v11M9 13h6" />
                <circle cx="12" cy="6" r="1" fill="#fff" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-yellow-600 text-black font-extrabold px-1.5 py-0.5 rounded-full font-mono select-none tracking-widest uppercase">WILD</span>
          </div>
        );
      case 'SCARAB':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-cyan-500/25 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_12px_#22d3ee]">
              <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.1" />
                <path d="M12 4v16M8 8h8M8 16h8M6 12h12" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-cyan-600 text-white font-mono font-bold px-1 rounded select-none">SCARAB</span>
          </div>
        );
      case 'PYRAMID':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-amber-500 rounded-full flex items-center justify-center shadow-[0_0_10px_#f59e0b]">
              <svg className="w-6 h-6 text-amber-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l10 16H2L12 2z" fill="currentColor" fillOpacity="0.1" />
                <path d="M12 2v16" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-amber-600 text-white font-mono font-bold px-1 rounded select-none">PYRAMID</span>
          </div>
        );
      case 'EYE':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-fuchsia-600/20 rounded-full blur-md animate-pulse" />
            <div className="w-11 h-11 bg-black border border-fuchsia-500 rounded-full flex items-center justify-center shadow-[0_0_10px_#d946ef]">
              <svg className="w-5.5 h-5.5 text-fuchsia-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-fuchsia-700 text-white font-mono font-bold px-1 rounded select-none">HORUS</span>
          </div>
        );
      case 'ANKH':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-yellow-400/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-yellow-300 rounded-full flex items-center justify-center shadow-[0_0_10px_#facc15]">
              <svg className="w-5.5 h-5.5 text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 10v11M8 14h8" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-yellow-600 text-black font-mono font-bold px-1 rounded select-none">ANKH</span>
          </div>
        );
      case 'SOPHIA':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-orange-500/25 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-orange-400 rounded-full flex items-center justify-center shadow-[0_0_12px_#f97316]">
              <svg className="w-5.5 h-5.5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-orange-500 text-white font-mono font-black px-1 rounded-full select-none">SCROLL</span>
          </div>
        );
      case 'LOTUS':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-pink-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-pink-400 rounded-full flex items-center justify-center shadow-[0_0_10px_#f472b6]">
              <svg className="w-5 h-5 text-pink-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2c1.5 4 5 5 5 10s-3.5 10-5 10-5-5-5-10 3.5-6 5-10z" />
              </svg>
            </div>
            <span className="absolute -bottom-1 text-[6px] bg-pink-600/80 text-white font-mono font-bold px-1 rounded select-none">LOTUS</span>
          </div>
        );
      case 'TALISMAN':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
            <div className="absolute inset-0 bg-zinc-500/15 rounded-full blur-md" />
            <div className="w-11 h-11 bg-black border border-zinc-400 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.1)]">
              <Shield className="w-5.5 h-5.5 text-zinc-300" />
            </div>
            <span className="absolute -bottom-1 text-[6.5px] bg-zinc-500/80 text-white font-mono font-bold px-1 rounded select-none">TALISMAN</span>
          </div>
        );
      default:
        return <span className="text-3xl select-none">🏺</span>;
    }
  };

  return (
    <div id="pharaoh-gold-slots-root" className="space-y-6">
      
      {/* Top Header Panel */}
      <div className="flex justify-between items-center bg-zinc-900/40 border border-zinc-800 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex gap-2.5 items-center text-left">
          <span className="text-2xl animate-pulse">🏺</span>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans flex items-center gap-1.5">
              <span>PHARAOH'S GOLD SLOTS</span>
              <span className="text-[8px] bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-1.5 py-0.5 rounded font-black tracking-widest">TOMBS OF GIZA</span>
            </h4>
            <div className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-[9px] text-zinc-400 font-mono">PHARAOH'S TREASURY MULTIPLIER: {bet * 250} CHIPS</span>
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
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-yellow-400" />}
          </button>
          <button 
            onClick={() => setShowPaytable(!showPaytable)}
            className={`p-2.5 rounded-xl border transition-all text-xs font-mono font-bold cursor-pointer ${
              showPaytable 
                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' 
                : 'bg-white/5 border-white/5 hover:border-white/10 text-white/50'
            }`}
          >
            TOMB RELICS
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
            className="bg-black/40 border border-yellow-500/20 rounded-2xl p-4 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-yellow-400/50">DIVINE TREASURE MULTIPLIERS</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {Object.entries(EGYPT_SYMBOLS).map(([key, sym]) => (
                <div key={key} className="flex items-center gap-2.5 p-2 bg-zinc-900/60 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-950/20 border border-yellow-500/10 scale-90">
                    {renderEgyptSymbol(key, true)}
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono text-zinc-400 leading-none">{sym.name}</span>
                    <span className="text-xs font-mono font-black text-yellow-400">{sym.mult}x Bet</span>
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
        <div className="bg-[#0f0b04] border-2 border-yellow-500/10 p-6 rounded-3xl relative min-h-[380px] flex flex-col justify-between overflow-hidden shadow-2xl">
          
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(234,179,8,0.03),transparent)] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-500/5 rounded-full pointer-events-none blur-3xl animate-pulse" />

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
                    className="absolute inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent blur-[1px]"
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
                  className="bg-[#181206] border border-yellow-500/10 rounded-2xl p-2 h-[260px] flex flex-col justify-between relative overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
                >
                  <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-yellow-500/10 to-transparent" />
                  
                  {isColSpinning ? (
                    /* Spinning Mode */
                    <div className="flex flex-col items-center animate-reel-scroll filter blur-[1.5px] h-[340px] w-full justify-around select-none">
                      {SPINNING_SYMBOLS.map((sym, idx) => (
                        <div key={idx} className="flex items-center justify-center h-12">
                          {renderEgyptSymbol(sym, true)}
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
                              ? 'bg-yellow-500/5 border border-yellow-500/15 scale-100 shadow-[0_0_12px_rgba(234,179,8,0.08)]' 
                              : 'opacity-30 scale-90'
                          }`}
                        >
                          {renderEgyptSymbol(symbol, isMiddle)}
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
              <span className="block text-[8px] font-mono text-yellow-400/50 uppercase tracking-widest">ACTIVE EXPLORATIONS</span>
              <span className="text-xs font-mono font-bold text-white flex gap-1.5 items-center mt-0.5">
                {[1, 3, 5].map((val) => (
                  <button
                    key={val}
                    disabled={spinning}
                    onClick={() => {
                      setActivePaylinesCount(val);
                      playPharaohSound('stop', isMuted);
                    }}
                    className={`px-2.5 py-0.5 rounded font-mono text-[9px] border transition-all ${
                      activePaylinesCount === val 
                        ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.25)] font-black' 
                        : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
                    }`}
                  >
                    {val} PATH{val > 1 ? 'S' : ''}
                  </button>
                ))}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-mono text-yellow-400/50 uppercase tracking-widest">AMULET ALIGNMENT</span>
              <span className="text-xs font-mono font-black text-yellow-400 font-bold">
                {lastWin !== null && lastWin > 0 ? `ANCIENT GOLD: x${lastWin / bet}` : 'ALIGNING RELICS'}
              </span>
            </div>
          </div>

        </div>

        {/* Wager Console Sidebar */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* Bet size adjust panel */}
          <div className="bg-[#181206] border border-yellow-500/5 p-5 rounded-3xl space-y-4 text-left shadow-xl">
            <span className="text-[10px] text-yellow-400/50 font-mono uppercase tracking-widest flex items-center gap-1.5 font-bold">
              <Coins className="w-3.5 h-3.5 text-yellow-400" /> TOMB COIN ALLOCATION
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
                <span className="block text-[8px] font-mono text-zinc-400 uppercase">WAGER PER EXPEDITION</span>
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
                    playPharaohSound('stop', isMuted);
                  }}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-all ${
                    bet === val 
                      ? 'bg-yellow-500 text-black border-yellow-400 shadow-md' 
                      : 'bg-white/5 border-white/5 text-white/60 hover:border-white/10'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Core Action Board */}
          <div className="bg-[#181206] border border-yellow-500/5 p-5 rounded-3xl space-y-3 shadow-xl">
            {/* Primary Action Button */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} /> 
              {spinning ? 'OPENING SECRET PASSAGES...' : 'SEEK PHARAOH\'S GOLD'}
            </button>

            {/* Speed Option */}
            <button
              onClick={() => {
                setIsFastMode(!isFastMode);
                playPharaohSound('stop', isMuted);
              }}
              className={`w-full py-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                isFastMode 
                  ? 'bg-yellow-400/10 border-yellow-500 text-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.2)]' 
                  : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isFastMode ? 'SANDSTORM MODE ENGAGED' : 'SWITCH TO SANDSTORM SPEED'}</span>
            </button>
          </div>

          {/* Auto spin selection controller */}
          <div className="bg-gradient-to-b from-[#251b0a] to-[#181206] border border-white/5 p-4 rounded-2xl text-left">
            <span className="block text-[8px] font-mono text-yellow-400/50 uppercase tracking-widest mb-2 font-black">AUTOMATIC EXPLORING</span>
            {autoSpinActive ? (
              <button
                onClick={stopAutoSpin}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>HALT EXCAVATION ({autoSpinCount} remaining)</span>
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    disabled={spinning}
                    onClick={() => startAutoSpin(val)}
                    className="py-1.5 bg-white/5 hover:bg-yellow-500/20 border border-white/5 hover:border-yellow-500/30 text-white/80 font-mono text-[10px] font-bold rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
        <div className="bg-[#0f0b04] border border-yellow-500/5 p-4 rounded-2xl text-left">
          <span className="block text-[8px] font-mono text-yellow-400/40 uppercase tracking-widest mb-2 font-black">EXCAVATION CHRONICLES</span>
          <div className="flex gap-2 flex-wrap">
            {spinHistory.map((hist, idx) => (
              <span 
                key={idx}
                className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border ${
                  hist.includes('🏺') 
                    ? 'bg-yellow-500/10 border-yellow-500/35 text-yellow-300' 
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
