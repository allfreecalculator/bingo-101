import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Coins, Trophy, Play, RefreshCw, Volume2, VolumeX, Heart, 
  HelpCircle, Star, Crown, Zap, Eye, Terminal, Gamepad2, ArrowUp, ArrowDown, Tv
} from 'lucide-react';

interface RetroArcadeSlotsProps {
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
  emoji: string;
}

const RETRO_SYMBOLS: Record<string, SymbolMetadata> = {
  GAMEPAD: { name: 'Golden Gamepad (Wild)', mult: 180, color: 'text-yellow-400', glow: 'shadow-yellow-500/80', bgGlow: 'bg-yellow-500/10', emoji: '🎮' },
  GHOST: { name: 'Pixel Ghost', mult: 70, color: 'text-red-400', glow: 'shadow-red-500/70', bgGlow: 'bg-red-500/10', emoji: '👻' },
  INVADER: { name: 'Space Invader', mult: 40, color: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/70', bgGlow: 'bg-fuchsia-500/10', emoji: '👾' },
  CASSETTE: { name: 'Vapor Cassette', mult: 25, color: 'text-pink-400', glow: 'shadow-pink-500/70', bgGlow: 'bg-pink-500/10', emoji: '📼' },
  FLOPPY: { name: 'Retro Floppy Disk', mult: 15, color: 'text-cyan-400', glow: 'shadow-cyan-500/70', bgGlow: 'bg-cyan-500/10', emoji: '💾' },
  JOYSTICK: { name: 'Classic Joystick', mult: 10, color: 'text-orange-400', glow: 'shadow-orange-400/70', bgGlow: 'bg-orange-500/10', emoji: '🕹️' },
  CHERRY: { name: 'Retro Cherry', mult: 6, color: 'text-red-500', glow: 'shadow-red-500/70', bgGlow: 'bg-red-500/10', emoji: '🍒' },
  PIXELCOIN: { name: '8-Bit Gold Coin', mult: 4, color: 'text-amber-400', glow: 'shadow-amber-400/70', bgGlow: 'bg-amber-500/10', emoji: '🪙' }
};

const SYMBOLS_POOL = ['GAMEPAD', 'GHOST', 'INVADER', 'CASSETTE', 'FLOPPY', 'JOYSTICK', 'CHERRY', 'PIXELCOIN'];
const WEIGHTED_SYMBOLS = [
  'PIXELCOIN', 'PIXELCOIN', 'PIXELCOIN', 'PIXELCOIN',
  'CHERRY', 'CHERRY', 'CHERRY',
  'JOYSTICK', 'JOYSTICK', 'JOYSTICK',
  'FLOPPY', 'FLOPPY',
  'CASSETTE', 'CASSETTE',
  'INVADER',
  'GHOST',
  'GAMEPAD'
];

const PAYLINES = [
  { id: 1, name: 'Horizontal Center', path: [1, 1, 1], color: 'border-cyan-400 text-cyan-400', shadow: 'shadow-cyan-500/50' },
  { id: 2, name: 'Horizontal Top', path: [0, 0, 0], color: 'border-fuchsia-400 text-fuchsia-400', shadow: 'shadow-fuchsia-500/50' },
  { id: 3, name: 'Horizontal Bottom', path: [2, 2, 2], color: 'border-yellow-400 text-yellow-400', shadow: 'shadow-yellow-500/50' },
  { id: 4, name: 'Diagonal Descending', path: [0, 1, 2], color: 'border-green-400 text-green-400', shadow: 'shadow-green-500/50' },
  { id: 5, name: 'Diagonal Ascending', path: [2, 1, 0], color: 'border-purple-400 text-purple-400', shadow: 'shadow-purple-500/50' }
];

const playRetroSound = (type: 'spin' | 'stop' | 'win' | 'lose' | 'lever' | 'jackpot' | 'card_flip' | 'correct' | 'wrong', isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'spin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(450, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'stop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'win') {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.02, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.22);
      });
    } else if (type === 'jackpot') {
      const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.02, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } else if (type === 'card_flip') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(340, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'correct') {
      const notes = [587.33, 880, 1174.66];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.025, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.18);
      });
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'lever') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {}
};

export const RetroArcadeSlots: React.FC<RetroArcadeSlotsProps> = ({
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

  // Reels State
  const [reels, setReels] = useState<string[][]>([
    ['INVADER', 'CHERRY', 'FLOPPY'],
    ['JOYSTICK', 'GAMEPAD', 'CASSETTE'],
    ['FLOPPY', 'GHOST', 'PIXELCOIN']
  ]);

  const [lastWin, setLastWin] = useState<number | null>(null);
  const [spinHistory, setSpinHistory] = useState<string[]>([]);
  const [autoSpinActive, setAutoSpinActive] = useState<boolean>(false);
  const [winningPaylines, setWinningPaylines] = useState<number[]>([]);

  // Combo high-score meter
  const [comboMeter, setComboMeter] = useState<number>(0);

  // Arcade Cabinets Choice Bonus Round
  const [bonusActive, setBonusActive] = useState<boolean>(false);
  const [cabinets, setCabinets] = useState<{ id: number; reward: string; opened: boolean; val: number }[]>([
    { id: 1, reward: '???', opened: false, val: 0 },
    { id: 2, reward: '???', opened: false, val: 0 },
    { id: 3, reward: '???', opened: false, val: 0 }
  ]);

  // High-Low Gamble Game State
  const [gambleActive, setGambleActive] = useState<boolean>(false);
  const [gambleAmount, setGambleAmount] = useState<number>(0);
  const [gambleCurrentVal, setGambleCurrentVal] = useState<number>(5);
  const [gambleHistory, setGambleHistory] = useState<number[]>([]);

  // Free Spins State
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState<number>(0);
  const [freeSpinsMultiplier, setFreeSpinsMultiplier] = useState<number>(1);
  const [freeSpinsTotalWon, setFreeSpinsTotalWon] = useState<number>(0);

  const stoppedRef = useRef<boolean[]>([true, true, true]);
  const stopTimersRef = useRef<any[]>([]);
  const tickIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      stopTimersRef.current.forEach(t => clearTimeout(t));
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    let timer: any;
    if (autoSpinActive && !spinning && !gambleActive && !bonusActive) {
      timer = setTimeout(() => {
        handleSpin();
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [autoSpinActive, spinning, gambleActive, bonusActive]);

  const adjustBet = (amount: number) => {
    if (spinning || freeSpinsRemaining > 0) return;
    const newBet = Math.max(10, Math.min(500, bet + amount));
    setBet(newBet);
    playRetroSound('stop', isMuted);
  };

  const handleSpin = () => {
    if (spinning || gambleActive || bonusActive) return;

    const totalWager = freeSpinsRemaining > 0 ? 0 : bet * activePaylinesCount;
    if (chips < totalWager && freeSpinsRemaining === 0) {
      triggerAlert(`Need ${totalWager} Chips for this Retro Insertion.`, 'error');
      setAutoSpinActive(false);
      return;
    }

    setSpinning(true);
    setLastWin(null);
    setWinningPaylines([]);
    
    if (freeSpinsRemaining > 0) {
      setFreeSpinsRemaining(prev => prev - 1);
    } else {
      onUpdateChips(-totalWager);
    }

    playRetroSound('lever', isMuted);

    if (onUpdateTask) {
      onUpdateTask('play_slots', 1);
    }

    const finalReels: string[][] = [];
    for (let col = 0; col < 3; col++) {
      const colSymbols: string[] = [];
      for (let row = 0; row < 3; row++) {
        const sourceSymbols = freeSpinsRemaining > 0 
          ? [...WEIGHTED_SYMBOLS, 'GAMEPAD', 'GHOST', 'INVADER'] 
          : WEIGHTED_SYMBOLS;
        const randSym = sourceSymbols[Math.floor(Math.random() * sourceSymbols.length)];
        colSymbols.push(randSym);
      }
      finalReels.push(colSymbols);
    }

    stoppedRef.current = [false, false, false];
    let playTicks = 0;
    playRetroSound('spin', isMuted);

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
        playRetroSound('spin', isMuted);
      }
    }, isFastMode ? 60 : 100);

    const delayStep = isFastMode ? 250 : 550;

    stoppedRef.current.forEach((_, colIdx) => {
      const timer = setTimeout(() => {
        stoppedRef.current[colIdx] = true;
        playRetroSound('stop', isMuted);

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
      } else if (s1 === 'GAMEPAD' && s2 === s3) {
        isWin = true;
        winSym = s2;
      } else if (s2 === 'GAMEPAD' && s1 === s3) {
        isWin = true;
        winSym = s1;
      } else if (s3 === 'GAMEPAD' && s1 === s2) {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'GAMEPAD' && s2 === 'GAMEPAD') {
        isWin = true;
        winSym = s3;
      } else if (s2 === 'GAMEPAD' && s3 === 'GAMEPAD') {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'GAMEPAD' && s3 === 'GAMEPAD') {
        isWin = true;
        winSym = s2;
      }

      if (isWin && winSym !== '') {
        const symbolMult = RETRO_SYMBOLS[winSym]?.mult || 4;
        totalWinMultiplier += symbolMult;
        triggeredLines.push(line.id);
        if (symbolMult >= 50) jackpotHit = true;
      }
    }

    let spinWinMult = totalWinMultiplier;
    if (freeSpinsRemaining > 0 && spinWinMult > 0) {
      spinWinMult *= freeSpinsMultiplier;
    }

    const netWin = Math.floor(bet * spinWinMult);

    setWinningPaylines(triggeredLines);
    setLastWin(netWin);
    setSpinning(false);

    if (netWin > 0) {
      onUpdateChips(netWin);
      setComboMeter(prev => Math.min(100, prev + 20));

      if (freeSpinsRemaining > 0) {
        setFreeSpinsTotalWon(prev => prev + netWin);
      }

      if (jackpotHit) {
        playRetroSound('jackpot', isMuted);
        triggerAlert(`👾 8-BIT HIGH SCORE OVERFLOW! Won +${netWin} Chips! 🎮`, 'success');
      } else {
        playRetroSound('win', isMuted);
        triggerAlert(`Retro Align! Got +${netWin} Chips!`, 'success');
      }
      setSpinHistory(prev => [`Won +${netWin} Chips 👾`, ...prev.slice(0, 19)]);
    } else {
      setComboMeter(prev => {
        const next = prev + 12;
        if (next >= 100) {
          setTimeout(() => {
            triggerRetroCabinetBonus();
          }, 600);
          return 0;
        }
        return next;
      });
      setSpinHistory(prev => ['No align (Meter +12%)', ...prev.slice(0, 19)]);
    }

    // Scatter trigger for Free Spins: 3 GAMEPAD symbols triggers Pac-Frenzy!
    const scatterCount = grid.flat().filter(s => s === 'GAMEPAD').length;
    if (scatterCount >= 3) {
      setTimeout(() => {
        setFreeSpinsRemaining(10);
        setFreeSpinsMultiplier(4);
        setFreeSpinsTotalWon(0);
        playRetroSound('jackpot', isMuted);
        triggerAlert(`👾 PAC-FRENZY ACTIVE! 10 Free Arcade Spins at 4x Multiplier!`, 'success');
      }, 700);
    }
  };

  // Launch Cabinets Choice Bonus game
  const triggerRetroCabinetBonus = () => {
    setAutoSpinActive(false);
    
    // Seed cabinets with prizes
    const prizes = [
      { id: 1, reward: '800 CHIPS 🪙', val: 800, opened: false },
      { id: 2, reward: '2500 CHIPS ⭐', val: 2500, opened: false },
      { id: 3, reward: '1200 CHIPS 🕹️', val: 1200, opened: false }
    ];
    // Shuffle
    const shuffled = prizes.sort(() => Math.random() - 0.5);
    setCabinets(shuffled);
    setBonusActive(true);
    playRetroSound('win', isMuted);
  };

  const handleChooseCabinet = (cabinetId: number) => {
    setCabinets(prev => prev.map(cab => {
      if (cab.id === cabinetId && !cab.opened) {
        onUpdateChips(cab.val);
        playRetroSound('jackpot', isMuted);
        triggerAlert(`Cabinet Unlocked! Awarded +${cab.val} Chips!`, 'success');
        return { ...cab, opened: true };
      }
      return cab;
    }));
  };

  // High-Low Gamble
  const openGambleGame = () => {
    if (!lastWin || lastWin <= 0) return;
    setAutoSpinActive(false);
    setGambleAmount(lastWin);
    setGambleCurrentVal(Math.floor(Math.random() * 8) + 2); // 2 to 9
    setGambleHistory([]);
    setGambleActive(true);
    playRetroSound('win', isMuted);
  };

  const handleHighLowGuess = (guess: 'higher' | 'lower') => {
    playRetroSound('card_flip', isMuted);
    const nextVal = Math.floor(Math.random() * 11) + 1; // 1 to 11

    const correct = (guess === 'higher' && nextVal >= gambleCurrentVal) || 
                    (guess === 'lower' && nextVal <= gambleCurrentVal);

    setGambleHistory(prev => [gambleCurrentVal, ...prev]);
    setGambleCurrentVal(nextVal);

    if (correct) {
      setTimeout(() => {
        onUpdateChips(gambleAmount); // Doubles it
        setGambleAmount(prev => prev * 2);
        playRetroSound('correct', isMuted);
        triggerAlert('⬆️ CORRECT RETRO GUESS! Payout Doubled!', 'success');
      }, 300);
    } else {
      setTimeout(() => {
        onUpdateChips(-gambleAmount);
        setGambleAmount(0);
        playRetroSound('wrong', isMuted);
        triggerAlert('⬇️ GAME OVER! Payout Zeroed.', 'error');
        setTimeout(() => {
          setGambleActive(false);
          setLastWin(0);
        }, 1500);
      }, 300);
    }
  };

  return (
    <div className="bg-zinc-950 border-4 border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] relative overflow-hidden font-mono">
      {/* 8-bit grid pattern scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] z-20" />
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-cyan-500/20 pb-4 mb-5 gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center animate-pulse">
            <span className="text-2xl">👾</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-cyan-400 tracking-wide">
                Retro Arcade Slots
              </h2>
              {freeSpinsRemaining > 0 ? (
                <span className="bg-yellow-400 text-black text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                  PAC-FRENZY: {freeSpinsMultiplier}x
                </span>
              ) : (
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] px-2 py-0.5 rounded">
                  8-BIT SCANLINES
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">Insert chips, hit combinations & unlock retro pixel bonuses!</p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          {comboMeter > 0 && (
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded border border-zinc-800">
              <span className="text-[9px] font-bold text-cyan-400 uppercase">Combo:</span>
              <div className="w-16 bg-zinc-950 h-2 rounded overflow-hidden">
                <div className="bg-cyan-400 h-full animate-pulse" style={{ width: `${comboMeter}%` }} />
              </div>
              <span className="text-[9px] text-cyan-300">{comboMeter}%</span>
            </div>
          )}

          <button
            onClick={() => setShowPaytable(!showPaytable)}
            className="p-1.5 rounded bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-800 text-[10px]"
          >
            Paytable
          </button>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-800"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-cyan-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
          </button>
        </div>
      </div>

      {/* Rules paytable */}
      <AnimatePresence>
        {showPaytable && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-900 border border-cyan-500/20 rounded-xl p-4 mb-5 relative z-10 text-xs text-cyan-200"
          >
            <p className="text-cyan-400 font-bold mb-2">👾 Retro Payout Guide</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(RETRO_SYMBOLS).map(([key, value]) => (
                <div key={key} className="bg-zinc-950 p-2 rounded border border-cyan-950 flex items-center gap-2">
                  <span className="text-xl">{value.emoji}</span>
                  <div>
                    <p className="text-[10px] text-white font-bold">{value.name.replace(' (Wild)', '')}</p>
                    <p className="text-[10px] text-cyan-400">{value.mult}x</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-zinc-500 mt-2">🎮 Gamepads act as Wilds and trigger 10 PAC-FRENZY Free Spins when 3 land!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* LEFT: Reels */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 border-2 border-cyan-500/20 rounded-2xl p-4 relative">
            
            {/* Free Spins border */}
            {freeSpinsRemaining > 0 && (
              <div className="absolute inset-0 rounded-[14px] border-2 border-yellow-400 animate-pulse pointer-events-none z-30" />
            )}

            {/* Winning Payline Guides */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
              {winningPaylines.map(lineId => (
                <div key={lineId} className="absolute inset-x-2 inset-y-2 rounded border-2 border-yellow-400 animate-pulse bg-cyan-400/5" />
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-3">
              {reels.map((column, colIdx) => (
                <div key={colIdx} className="bg-black border border-cyan-950 rounded-xl p-2 h-64 flex flex-col justify-between overflow-hidden relative shadow-inner">
                  <AnimatePresence mode="popLayout">
                    {column.map((symKey, rowIdx) => {
                      const sym = RETRO_SYMBOLS[symKey] || RETRO_SYMBOLS.PIXELCOIN;
                      return (
                        <motion.div
                          key={`${colIdx}-${rowIdx}-${symKey}`}
                          initial={spinning ? { y: -70, opacity: 0.3 } : { y: 0, opacity: 1 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 70, opacity: 0.3 }}
                          transition={{ type: 'tween', duration: 0.15 }}
                          className={`flex-1 flex flex-col items-center justify-center rounded-lg my-1 border border-cyan-500/5 ${sym.bgGlow} relative overflow-hidden`}
                        >
                          <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{sym.emoji}</span>
                          <span className="text-[8px] text-cyan-300/40 uppercase mt-1">{sym.name.split(' ')[0]}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Bottom active info */}
            <div className="flex justify-between mt-3 text-[10px] text-zinc-400">
              <div>ACTIVE PATHS: <span className="text-cyan-400 font-bold">{activePaylinesCount} / 5</span></div>
              <div className="flex gap-1">
                {PAYLINES.map(line => (
                  <button
                    key={line.id}
                    disabled={spinning || freeSpinsRemaining > 0}
                    onClick={() => setActivePaylinesCount(line.id)}
                    className={`px-1 rounded text-[8px] border ${
                      line.id <= activePaylinesCount ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'bg-black border-zinc-800 text-zinc-600'
                    }`}
                  >
                    L{line.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: controls */}
        <div className="flex flex-col justify-between bg-zinc-900 border border-cyan-500/10 rounded-2xl p-4">
          <div>
            {/* Balance */}
            <div className="bg-black p-3 rounded-xl border border-cyan-950 flex items-center justify-between mb-3">
              <div>
                <p className="text-[8px] text-zinc-500 uppercase">IN-CABINET BALANCE</p>
                <p className="text-lg font-bold text-white font-mono mt-0.5">{chips.toLocaleString()}</p>
              </div>
              <Coins className="w-5 h-5 text-yellow-400" />
            </div>

            {/* Free Spins Accumulator */}
            {freeSpinsRemaining > 0 && (
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 mb-3 text-center">
                <p className="text-[8px] text-yellow-400 font-bold uppercase tracking-widest">PAC-FRENZY TOTAL WIN</p>
                <p className="text-lg font-bold text-yellow-300 font-mono mt-1">+{freeSpinsTotalWon.toLocaleString()} Chips</p>
                <p className="text-[8px] text-zinc-400 mt-1">{freeSpinsRemaining} FREE SPINS LEFT</p>
              </div>
            )}

            {/* Wager */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] mb-2">
                <span className="text-zinc-400">CREDIT PER PATH:</span>
                <span className="text-cyan-400">{bet} Chips</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[-100, -10, 10, 100].map(val => (
                  <button
                    key={val}
                    disabled={spinning || freeSpinsRemaining > 0}
                    onClick={() => adjustBet(val)}
                    className="py-1 bg-zinc-950 border border-zinc-800 text-[10px] hover:bg-cyan-950 rounded text-cyan-300 disabled:opacity-30"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Cost and results */}
            <div className="border-t border-cyan-950 pt-3 space-y-1 mb-3 text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">TOTAL COST:</span>
                <span className="text-zinc-300 font-bold">
                  {freeSpinsRemaining > 0 ? 'FREE SPIN' : `${bet * activePaylinesCount} Chips`}
                </span>
              </div>
              {lastWin !== null && (
                <div className="flex flex-col gap-1.5 border-t border-cyan-950 pt-1.5 mt-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">LAST PAYLINE VALUE:</span>
                    <span className={`font-bold ${lastWin > 0 ? 'text-green-400' : 'text-zinc-600'}`}>
                      {lastWin > 0 ? `+${lastWin}` : 'ZERO'}
                    </span>
                  </div>

                  {lastWin > 0 && !spinning && (
                    <button
                      onClick={openGambleGame}
                      className="w-full py-1 rounded bg-yellow-400 text-black text-[9px] font-bold uppercase animate-pulse hover:brightness-110"
                    >
                      👾 GAMBLE: High-Low Guess!
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setIsFastMode(!isFastMode)}
                className={`py-1 rounded text-[10px] font-bold ${isFastMode ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400' : 'bg-zinc-950 text-zinc-500 border border-zinc-800'}`}
              >
                TURBO: {isFastMode ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => setAutoSpinActive(!autoSpinActive)}
                className={`py-1 rounded text-[10px] font-bold ${autoSpinActive ? 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500 animate-pulse' : 'bg-zinc-950 text-zinc-500 border border-zinc-800'}`}
              >
                AUTO: {autoSpinActive ? 'ON' : 'OFF'}
              </button>
            </div>

            <button
              onClick={handleSpin}
              disabled={spinning}
              className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                spinning 
                  ? 'bg-zinc-950 border-zinc-900 text-zinc-600'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-cyan-400/40 hover:brightness-110 shadow-lg'
              }`}
            >
              {spinning ? 'PROCESSING...' : freeSpinsRemaining > 0 ? 'PAC SPIN!' : 'INSERT TO SPIN'}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Cabinets Choice Game */}
      <AnimatePresence>
        {bonusActive && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border-2 border-cyan-500 rounded-3xl p-6 max-w-sm w-full text-center"
            >
              <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-widest mb-2">
                🎮 RETRO BONUS: CHOOSE CABINET 🎮
              </h3>
              <p className="text-[10px] text-zinc-500 mb-6 uppercase">Unlock custom retro cabinet to gain premium Chip yields!</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {cabinets.map(cab => (
                  <button
                    key={cab.id}
                    disabled={cab.opened}
                    onClick={() => handleChooseCabinet(cab.id)}
                    className={`h-28 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      cab.opened 
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-500' 
                        : 'bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:scale-105'
                    }`}
                  >
                    <Gamepad2 className={`w-8 h-8 mb-2 ${cab.opened ? 'text-zinc-600' : 'text-cyan-400 animate-bounce'}`} />
                    <span className="text-[9px] font-bold uppercase">{cab.opened ? cab.reward : `CABINET ${cab.id}`}</span>
                  </button>
                ))}
              </div>

              {cabinets.some(c => c.opened) && (
                <button
                  onClick={() => setBonusActive(false)}
                  className="w-full py-2 bg-cyan-500/20 border border-cyan-500 text-cyan-300 text-[10px] uppercase font-bold hover:bg-cyan-500/30"
                >
                  Bank & Continue
                </button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: High-Low Gamble */}
      <AnimatePresence>
        {gambleActive && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border-2 border-yellow-500 rounded-3xl p-6 max-w-xs w-full text-center"
            >
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-1">
                👾 8-Bit High-Low Card Game
              </h3>
              <p className="text-[9px] text-zinc-500 uppercase mb-4">Guess if next card value is HIGHER or LOWER!</p>

              {/* Payout */}
              <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl mb-4 text-center">
                <span className="text-[8px] text-zinc-600 block">CURRENT RETRO VALUE</span>
                <span className="text-xl font-bold text-yellow-400">{gambleAmount.toLocaleString()} CHIPS</span>
              </div>

              {/* Main guess visual */}
              <div className="h-32 flex items-center justify-center mb-5">
                <div className="w-24 h-28 border-2 border-yellow-400 bg-zinc-900 rounded-xl flex flex-col items-center justify-center shadow-lg relative">
                  <span className="text-3xl text-yellow-400">👾</span>
                  <span className="text-lg font-black text-white mt-1">VAL: {gambleCurrentVal}</span>
                </div>
              </div>

              <div className="space-y-3">
                {gambleAmount > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleHighLowGuess('higher')}
                      className="py-2.5 rounded bg-yellow-500 text-black font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 hover:brightness-110"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                      Higher
                    </button>
                    <button
                      onClick={() => handleHighLowGuess('lower')}
                      className="py-2.5 rounded bg-zinc-800 text-white font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-zinc-700"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-zinc-400" />
                      Lower
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-red-500 font-bold uppercase animate-pulse">LOST! RETRY FROM ARCADE LOBBY...</p>
                )}

                <div className="flex gap-2 pt-2 border-t border-zinc-800 mt-2">
                  <button
                    disabled={gambleAmount <= 0}
                    onClick={() => {
                      setGambleActive(false);
                      triggerAlert(`Smart decision! Banked +${gambleAmount} Chips safely!`, 'success');
                    }}
                    className="flex-1 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-300 font-bold text-[9px] uppercase"
                  >
                    🔒 BANK CHIPS
                  </button>
                  <button
                    onClick={() => setGambleActive(false)}
                    className="py-1.5 px-3 bg-zinc-900 text-zinc-500 text-[9px] uppercase font-bold"
                  >
                    Quit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
