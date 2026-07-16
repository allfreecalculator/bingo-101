import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Coins, Trophy, Play, RefreshCw, Volume2, VolumeX, Maximize2, 
  HelpCircle, Gift, Flame, Shield, Zap, Square, Eye, Key, Crown, Heart, HelpCircle as HelpIcon
} from 'lucide-react';

interface CyberWildsSlotsProps {
  chips: number;
  onUpdateChips: (amount: number) => void;
  onUpdateTask?: (taskId: string, count: number) => void;
  triggerAlert: (text: string, type?: 'success' | 'error' | 'info') => void;
}

interface SymbolMetadata {
  char: string;
  name: string;
  mult: number;
  color: string;
  glow: string;
  bgGlow: string;
}

const CYBER_SYMBOLS: Record<string, SymbolMetadata> = {
  WILD: { char: '🔥', name: 'Cyber Wild', mult: 100, color: 'text-orange-400', glow: 'shadow-orange-500/85', bgGlow: 'bg-orange-500/20' },
  EYE: { char: '👁️', name: 'Cyber Eye', mult: 40, color: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/75', bgGlow: 'bg-fuchsia-500/15' },
  CUBE: { char: '🧊', name: 'Grid Cube', mult: 25, color: 'text-cyan-400', glow: 'shadow-cyan-500/75', bgGlow: 'bg-cyan-500/15' },
  CROWN: { char: '👑', name: 'Matrix Crown', mult: 15, color: 'text-yellow-400', glow: 'shadow-yellow-500/75', bgGlow: 'bg-yellow-500/15' },
  HEART: { char: '💖', name: 'Neon Heart', mult: 10, color: 'text-rose-400', glow: 'shadow-rose-500/75', bgGlow: 'bg-rose-500/15' },
  KEY: { char: '🔑', name: 'Crypto Key', mult: 6, color: 'text-emerald-400', glow: 'shadow-emerald-500/75', bgGlow: 'bg-emerald-500/15' },
  COIN: { char: '🪙', name: 'Quantum Coin', mult: 4, color: 'text-amber-400', glow: 'shadow-amber-500/75', bgGlow: 'bg-amber-500/15' },
  BAR: { char: '⚡', name: 'Cyber BAR', mult: 2, color: 'text-blue-400', glow: 'shadow-blue-500/75', bgGlow: 'bg-blue-500/15' }
};

const SYMBOLS_POOL = ['WILD', 'EYE', 'CUBE', 'CROWN', 'HEART', 'KEY', 'COIN', 'BAR'];
const WEIGHTED_SYMBOLS = [
  'BAR', 'BAR', 'BAR', 'BAR',
  'COIN', 'COIN', 'COIN',
  'KEY', 'KEY', 'KEY',
  'HEART', 'HEART',
  'CROWN', 'CROWN',
  'CUBE',
  'EYE',
  'WILD'
];
const SPINNING_SYMBOLS = ['WILD', 'EYE', 'CUBE', 'CROWN', 'HEART', 'KEY', 'COIN', 'BAR', 'WILD', 'EYE', 'CUBE', 'CROWN', 'HEART', 'KEY', 'COIN', 'BAR'];

// 5 Active Paylines Matrix
// [RowIndex, RowIndex, RowIndex] for Reel 1, Reel 2, Reel 3
const PAYLINES = [
  { id: 1, name: 'Center Row', path: [1, 1, 1], color: 'border-cyan-400 text-cyan-400', shadow: 'shadow-cyan-500/50' },
  { id: 2, name: 'Top Row', path: [0, 0, 0], color: 'border-fuchsia-400 text-fuchsia-400', shadow: 'shadow-fuchsia-500/50' },
  { id: 3, name: 'Bottom Row', path: [2, 2, 2], color: 'border-emerald-400 text-emerald-400', shadow: 'shadow-emerald-500/50' },
  { id: 4, name: 'V-Shape Down', path: [0, 1, 2], color: 'border-amber-400 text-amber-400', shadow: 'shadow-amber-500/50' },
  { id: 5, name: 'V-Shape Up', path: [2, 1, 0], color: 'border-rose-400 text-rose-400', shadow: 'shadow-rose-500/50' }
];

// Synth sounds using Web Audio API
const playCyberSynth = (type: 'spin' | 'stop' | 'win' | 'lose' | 'lever' | 'jackpot' | 'wild', isMuted: boolean) => {
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
      osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'stop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'wild') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'win') {
      // Harmonic synth major chord
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + idx * 0.06 + 0.2);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.25);
      });
    } else if (type === 'jackpot') {
      // Arpeggiator cascade
      const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.3);
      });
    } else if (type === 'lever') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    }
  } catch (e) {}
};

export const CyberWildsSlots: React.FC<CyberWildsSlotsProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [bet, setBet] = useState<number>(50);
  const [activePaylinesCount, setActivePaylinesCount] = useState<number>(3); // 1, 3, or 5 paylines
  const [spinning, setSpinning] = useState<boolean>(false);
  const [isFastMode, setIsFastMode] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  
  // Grid layout: 3 reels, each showing 3 rows
  const [reels, setReels] = useState<string[][]>([
    ['BAR', 'COIN', 'KEY'],
    ['KEY', 'WILD', 'HEART'],
    ['COIN', 'CROWN', 'BAR']
  ]);

  const [lastWin, setLastWin] = useState<number | null>(null);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [spinHistory, setSpinHistory] = useState<string[]>([]);
  const [autoSpinActive, setAutoSpinActive] = useState<boolean>(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);

  // Winning lines from the last spin to highlight in the UI
  const [winningPaylines, setWinningPaylines] = useState<number[]>([]);

  const targetsRef = useRef<string[]>(['BAR', 'COIN', 'KEY']);
  const stoppedRef = useRef<boolean[]>([true, true, true]);
  const stopTimersRef = useRef<any[]>([]);
  const tickIntervalRef = useRef<any>(null);

  // Cleanup timers on unmount
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
    playCyberSynth('stop', isMuted);
  };

  const handleSpin = () => {
    if (spinning) return;

    // Check chips
    const totalWager = bet * activePaylinesCount;
    if (chips < totalWager) {
      triggerAlert(`Insufficient chips to cover all active paylines. Total wager: ${totalWager} Chips!`, 'error');
      setAutoSpinActive(false);
      return;
    }

    setSpinning(true);
    setLastWin(null);
    setWinningPaylines([]);
    onUpdateChips(-totalWager);
    playCyberSynth('lever', isMuted);

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

    // Prepare simulated spinning effect
    stoppedRef.current = [false, false, false];
    
    // Play sci-fi spin sound loop
    let playTicks = 0;
    playCyberSynth('spin', isMuted);
    
    tickIntervalRef.current = setInterval(() => {
      playTicks++;
      setReels(prev => prev.map((col, cIdx) => {
        if (stoppedRef.current[cIdx]) return col;
        // Shift symbols downward
        const shifted = [...col];
        const nextSym = SYMBOLS_POOL[Math.floor(Math.random() * SYMBOLS_POOL.length)];
        shifted.unshift(nextSym);
        shifted.pop();
        return shifted;
      }));

      if (playTicks % 3 === 0 && !isMuted) {
        playCyberSynth('spin', isMuted);
      }
    }, isFastMode ? 60 : 100);

    // Staggered stop times
    const delayStep = isFastMode ? 350 : 700;
    
    stoppedRef.current.forEach((_, colIdx) => {
      const timer = setTimeout(() => {
        stoppedRef.current[colIdx] = true;
        playCyberSynth('stop', isMuted);
        
        // Lock in final symbols
        setReels(prev => {
          const next = [...prev];
          next[colIdx] = finalReels[colIdx];
          return next;
        });

        // If this is the last reel, evaluate results
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

    // Check each active payline
    for (let i = 0; i < activePaylinesCount; i++) {
      const line = PAYLINES[i];
      const s1 = grid[0][line.path[0]];
      const s2 = grid[1][line.path[1]];
      const s3 = grid[2][line.path[2]];

      // Math matches logic
      // Check for 3 matching symbols or combinations of WILD
      let isWin = false;
      let winSym = '';

      if (s1 === s2 && s2 === s3) {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'WILD' && s2 === s3) {
        isWin = true;
        winSym = s2;
      } else if (s2 === 'WILD' && s1 === s3) {
        isWin = true;
        winSym = s1;
      } else if (s3 === 'WILD' && s1 === s2) {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'WILD' && s2 === 'WILD') {
        isWin = true;
        winSym = s3;
      } else if (s2 === 'WILD' && s3 === 'WILD') {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'WILD' && s3 === 'WILD') {
        isWin = true;
        winSym = s2;
      }

      if (isWin && winSym !== '') {
        const symbolMult = CYBER_SYMBOLS[winSym]?.mult || 2;
        totalWinMultiplier += symbolMult;
        triggeredLines.push(line.id);
        if (symbolMult >= 40) jackpotHit = true;
      }
    }

    const netWin = Math.floor(bet * totalWinMultiplier);

    setWinningPaylines(triggeredLines);
    setLastWin(netWin);
    setSpinning(false);

    if (netWin > 0) {
      onUpdateChips(netWin);
      if (jackpotHit) {
        playCyberSynth('jackpot', isMuted);
        triggerAlert(`👑 CYBER MEGA WIN! You matched high-value tech nodes and pocketed +${netWin} Chips!`, 'success');
      } else {
        playCyberSynth('win', isMuted);
        triggerAlert(`Matched Payline Nodes! Earned +${netWin} Chips! 🎉`, 'success');
      }

      setSpinHistory(prev => [
        `🏆 Win +${netWin} (${triggeredLines.length} Lines Match)`,
        ...prev
      ].slice(0, 5));

      if (onUpdateTask) {
        onUpdateTask('CYBER_SLOTS_SPIN', 1);
      }
    } else {
      setSpinHistory(prev => [
        `❌ Lost Wager (0 Match)`,
        ...prev
      ].slice(0, 5));
    }

    // Handle auto play loop
    if (autoSpinActive && autoSpinCount > 0) {
      const remainingSpins = autoSpinCount - 1;
      setAutoSpinCount(remainingSpins);
      if (remainingSpins <= 0) {
        setAutoSpinActive(false);
      } else {
        setTimeout(() => {
          handleSpin();
        }, 1200);
      }
    }
  };

  const startAutoSpin = (spins: number) => {
    if (spinning) return;
    setAutoSpinCount(spins);
    setAutoSpinActive(true);
    triggerAlert(`Initiating ${spins} Automated Cybernetic Matrix Spins!`, 'info');
    // Start first spin immediately
    setTimeout(() => {
      handleSpin();
    }, 200);
  };

  const stopAutoSpin = () => {
    setAutoSpinActive(false);
    setAutoSpinCount(0);
    triggerAlert('Automated play sequence terminated.', 'info');
  };

  const renderCyberSymbol = (symbol: string, isMiddle: boolean = false) => {
    const meta = CYBER_SYMBOLS[symbol];
    if (!meta) return <span className="text-3xl">🧩</span>;

    switch (symbol) {
      case 'WILD':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${isMiddle ? 'scale-110' : 'scale-90 opacity-40'}`}>
            <div className="absolute inset-0 bg-orange-600/35 rounded-full blur-md animate-pulse" />
            <span className="text-4xl filter drop-shadow-[0_0_12px_#fb923c] select-none animate-bounce" style={{ animationDuration: '2s' }}>🔥</span>
            <span className="absolute bottom-[-4px] text-[8px] bg-orange-500 text-black font-black px-1 rounded font-mono select-none">WILD</span>
          </div>
        );
      case 'EYE':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${isMiddle ? 'scale-110' : 'scale-90 opacity-40'}`}>
            <div className="absolute inset-0 bg-fuchsia-500/25 rounded-full blur-md" />
            <span className="text-4xl filter drop-shadow-[0_0_10px_#d946ef] select-none">👁️</span>
          </div>
        );
      case 'CUBE':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${isMiddle ? 'scale-110' : 'scale-90 opacity-40'}`}>
            <div className="absolute inset-0 bg-cyan-500/25 rounded-full blur-md animate-pulse" />
            <span className="text-4xl filter drop-shadow-[0_0_10px_#22d3ee] select-none">🧊</span>
          </div>
        );
      case 'CROWN':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${isMiddle ? 'scale-110' : 'scale-90 opacity-40'}`}>
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md" />
            <span className="text-4xl filter drop-shadow-[0_0_10px_#facc15] select-none">👑</span>
          </div>
        );
      case 'HEART':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${isMiddle ? 'scale-110' : 'scale-90 opacity-40'}`}>
            <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-md" />
            <span className="text-4xl filter drop-shadow-[0_0_10px_#fb7185] select-none">💖</span>
          </div>
        );
      case 'KEY':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${isMiddle ? 'scale-110' : 'scale-90 opacity-40'}`}>
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-md" />
            <span className="text-4xl filter drop-shadow-[0_0_8px_#34d399] select-none">🔑</span>
          </div>
        );
      case 'COIN':
        return (
          <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${isMiddle ? 'scale-110' : 'scale-90 opacity-40'}`}>
            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md" />
            <span className="text-4xl filter drop-shadow-[0_0_8px_#fbbf24] select-none animate-pulse">🪙</span>
          </div>
        );
      case 'BAR':
        return (
          <div className={`bg-[#030310] border-2 border-blue-400 rounded-lg px-3 py-1 shadow-[0_0_10px_rgba(96,165,250,0.8)] flex flex-col justify-center items-center scale-90 ${isMiddle ? 'scale-105' : 'scale-80 opacity-30'}`}>
            <span className="text-[10px] font-black tracking-widest text-blue-400 font-mono leading-none flex items-center gap-1">
              <Zap className="w-2 h-2 fill-blue-400 text-transparent" /> CYBER
            </span>
            <div className="w-10 h-[1.5px] bg-blue-400/80 my-0.5" />
            <span className="text-[10px] font-black tracking-widest text-blue-400 font-mono leading-none">BAR</span>
          </div>
        );
      default:
        return <span className="text-3xl select-none">{meta.char}</span>;
    }
  };

  return (
    <div id="cyber-wilds-active-pane" className="space-y-6">
      
      {/* Top Header Panel */}
      <div className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-2xl">
        <div className="flex gap-2 items-center">
          <span className="text-2xl animate-pulse">🔥</span>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>CYBER WILDS SLOTS</span>
              <span className="text-[8px] bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-1.5 py-0.5 rounded font-black">HIGH MULTIPLIER</span>
            </h4>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[9px] text-white/40 font-mono">JACKPOT STACKED: {bet * 100} COINS</span>
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
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
          <button 
            onClick={() => setShowPaytable(!showPaytable)}
            className={`p-2.5 rounded-xl border transition-all text-xs font-mono font-bold cursor-pointer ${
              showPaytable 
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
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
            className="bg-black/40 border border-cyan-500/20 rounded-2xl p-4 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-cyan-400/50">CYBER PAYOUT TABLE</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              {Object.entries(CYBER_SYMBOLS).map(([key, sym]) => (
                <div key={key} className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-950/20 text-xl border border-cyan-500/10">
                    {sym.char}
                  </div>
                  <div>
                    <span className="block text-[9px] font-mono text-white/40 leading-none">{sym.name}</span>
                    <span className="text-xs font-mono font-black text-cyan-400">{sym.mult}x Wager</span>
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
        <div className="bg-[#030310] border-2 border-cyan-500/20 p-6 rounded-3xl relative min-h-[380px] flex flex-col justify-between overflow-hidden shadow-2xl">
          
          {/* Cyber matrix background lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          
          {/* Visual glow backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full pointer-events-none blur-3xl" />

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
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`absolute inset-x-8 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1.5px]`}
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
                  className="bg-[#06061a] border border-cyan-500/15 rounded-2xl p-2 h-[260px] flex flex-col justify-between relative overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]"
                >
                  {/* Neon vertical alignment border strip */}
                  <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent" />
                  
                  {isColSpinning ? (
                    /* Spinning Mode */
                    <div className="flex flex-col items-center animate-reel-scroll filter blur-[2px] h-[340px] w-full justify-around select-none">
                      {SPINNING_SYMBOLS.map((sym, idx) => (
                        <div key={idx} className="flex items-center justify-center h-12">
                          {renderCyberSymbol(sym, true)}
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
                          initial={{ scale: 0.85, opacity: 0.5 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className={`flex items-center justify-center h-16 w-full rounded-xl transition-all ${
                            isMiddle 
                              ? 'bg-cyan-500/5 border border-cyan-500/20 scale-100 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                              : 'opacity-40 scale-90'
                          }`}
                        >
                          {renderCyberSymbol(symbol, isMiddle)}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom active win banner */}
          <div className="mt-4 border-t border-cyan-500/15 pt-3.5 flex justify-between items-center text-left">
            <div>
              <span className="block text-[8px] font-mono text-cyan-400/50 uppercase tracking-widest">ACTIVE PAYLINES</span>
              <span className="text-xs font-mono font-bold text-white flex gap-1.5 items-center mt-0.5">
                {[1, 3, 5].map((val) => (
                  <button
                    key={val}
                    disabled={spinning}
                    onClick={() => {
                      setActivePaylinesCount(val);
                      playCyberSynth('stop', isMuted);
                    }}
                    className={`px-2 py-0.5 rounded font-black text-[9px] border transition-all ${
                      activePaylinesCount === val 
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                        : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
                    }`}
                  >
                    {val} LINE{val > 1 ? 'S' : ''}
                  </button>
                ))}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-mono text-cyan-400/50 uppercase tracking-widest">TOTAL MULTIPLIER</span>
              <span className="text-sm font-mono font-black text-amber-400">
                {lastWin !== null && lastWin > 0 ? `WINNER! x${lastWin / bet}` : 'WAITING FOR SPIN'}
              </span>
            </div>
          </div>

        </div>

        {/* Wager Console Sidebar */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* Bet size adjust panel */}
          <div className="bg-[#0a0a1f] border border-cyan-500/10 p-5 rounded-3xl space-y-4 text-left shadow-xl">
            <span className="text-[10px] text-cyan-400/50 font-mono uppercase tracking-widest flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-cyan-400" /> MATRIX wager SELECTOR
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
                <span className="block text-[8px] font-mono text-white/40 uppercase">BET PER LINE</span>
                <span className="text-2xl font-mono font-black text-white">{bet}</span>
                <span className="block text-[8px] text-white/30">Chips</span>
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
                    playCyberSynth('stop', isMuted);
                  }}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-all ${
                    bet === val 
                      ? 'bg-cyan-500 text-black border-cyan-400 shadow-md' 
                      : 'bg-white/5 border-white/5 text-white/60 hover:border-white/10'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Core Action Board */}
          <div className="bg-[#0a0a1f] border border-cyan-500/10 p-5 rounded-3xl space-y-3 shadow-xl">
            {/* Primary Action Button */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} /> 
              {spinning ? 'SPINNING NODES...' : 'SPIN ACTIVE GRID'}
            </button>

            {/* Speed Option */}
            <button
              onClick={() => {
                setIsFastMode(!isFastMode);
                playCyberSynth('stop', isMuted);
              }}
              className={`w-full py-2.5 rounded-xl border text-xs font-mono font-bold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                isFastMode 
                  ? 'bg-amber-400/10 border-amber-500 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]' 
                  : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isFastMode ? 'TURBO MODE ACTIVE' : 'SWITCH TO TURBO MODE'}</span>
            </button>
          </div>

          {/* Auto spin selection controller */}
          <div className="bg-gradient-to-b from-[#111126] to-[#0a0a1f] border border-cyan-500/5 p-4 rounded-2xl text-left">
            <span className="block text-[8px] font-mono text-cyan-400/50 uppercase tracking-widest mb-2 font-black">AUTOMATED MULTI-SPINS</span>
            {autoSpinActive ? (
              <button
                onClick={stopAutoSpin}
                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-red-400 text-transparent" />
                <span>HALT AUTO PLAY ({autoSpinCount} left)</span>
              </button>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 20, 50, 100].map((val) => (
                  <button
                    key={val}
                    disabled={spinning}
                    onClick={() => startAutoSpin(val)}
                    className="py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/30 text-white/80 font-mono text-[10px] font-bold rounded-lg transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
        <div className="bg-[#030310] border border-cyan-500/10 p-4 rounded-2xl text-left">
          <span className="block text-[8px] font-mono text-cyan-400/40 uppercase tracking-widest mb-2 font-black">MATRIX HISTORY TRACE</span>
          <div className="flex gap-2 flex-wrap">
            {spinHistory.map((hist, idx) => (
              <span 
                key={idx}
                className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded-lg border ${
                  hist.includes('🏆') 
                    ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-300' 
                    : 'bg-white/5 border-white/5 text-white/40'
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
