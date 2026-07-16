import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Coins, Trophy, Play, RefreshCw, Volume2, VolumeX, Heart, 
  HelpCircle, Star, Crown, Zap, Eye, Gift, ArrowRight, RotateCcw, Compass
} from 'lucide-react';

interface LuckyLeprechaunSlotsProps {
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

const IRISH_SYMBOLS: Record<string, SymbolMetadata> = {
  CLOVER: { name: 'Four-Leaf Clover (Wild)', mult: 150, color: 'text-emerald-400', glow: 'shadow-emerald-500/80', bgGlow: 'bg-emerald-500/10', emoji: '🍀' },
  POTOFGOLD: { name: 'Pot of Gold', mult: 80, color: 'text-yellow-400', glow: 'shadow-yellow-500/70', bgGlow: 'bg-yellow-500/10', emoji: '💰' },
  RAINBOW: { name: 'Magic Rainbow', mult: 40, color: 'text-pink-400', glow: 'shadow-pink-500/70', bgGlow: 'bg-pink-500/10', emoji: '🌈' },
  HAT: { name: 'Leprechaun Hat', mult: 22, color: 'text-green-500', glow: 'shadow-green-500/70', bgGlow: 'bg-green-500/10', emoji: '🎩' },
  HORSESHOE: { name: 'Lucky Horseshoe', mult: 14, color: 'text-yellow-300', glow: 'shadow-yellow-400/70', bgGlow: 'bg-yellow-500/10', emoji: '🌟' },
  HARP: { name: 'Golden Harp', mult: 10, color: 'text-amber-400', glow: 'shadow-amber-500/70', bgGlow: 'bg-amber-500/10', emoji: '🪕' },
  STOUT: { name: 'Cold Irish Pint', mult: 6, color: 'text-amber-800', glow: 'shadow-amber-800/70', bgGlow: 'bg-amber-800/10', emoji: '🍺' },
  SHILLING: { name: 'Golden Shilling', mult: 3, color: 'text-yellow-500', glow: 'shadow-yellow-500/70', bgGlow: 'bg-yellow-500/10', emoji: '🪙' }
};

const SYMBOLS_POOL = ['CLOVER', 'POTOFGOLD', 'RAINBOW', 'HAT', 'HORSESHOE', 'HARP', 'STOUT', 'SHILLING'];
const WEIGHTED_SYMBOLS = [
  'SHILLING', 'SHILLING', 'SHILLING', 'SHILLING',
  'STOUT', 'STOUT', 'STOUT',
  'HARP', 'HARP', 'HARP',
  'HORSESHOE', 'HORSESHOE',
  'HAT', 'HAT',
  'RAINBOW',
  'POTOFGOLD',
  'CLOVER'
];

const PAYLINES = [
  { id: 1, name: 'Rainbow Arch', path: [1, 1, 1], color: 'border-emerald-400 text-emerald-400', shadow: 'shadow-emerald-500/50' },
  { id: 2, name: 'Celtic Peak', path: [0, 0, 0], color: 'border-yellow-400 text-yellow-400', shadow: 'shadow-yellow-500/50' },
  { id: 3, name: 'Dublin Flat', path: [2, 2, 2], color: 'border-amber-500 text-amber-500', shadow: 'shadow-amber-500/50' },
  { id: 4, name: 'Clover Crossway', path: [0, 1, 2], color: 'border-pink-400 text-pink-400', shadow: 'shadow-pink-500/50' },
  { id: 5, name: 'Leprechaun trail', path: [2, 1, 0], color: 'border-sky-400 text-sky-400', shadow: 'shadow-sky-500/50' }
];

const playIrishSound = (type: 'spin' | 'stop' | 'win' | 'lose' | 'lever' | 'jackpot' | 'bonus' | 'card_flip' | 'correct' | 'wrong', isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'spin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(392, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'stop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(493.88, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'win') {
      const notes = [392.00, 440.00, 493.88, 587.33, 659.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.03, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.3);
      });
    } else if (type === 'jackpot') {
      const notes = [392, 493.88, 587.33, 784, 987.77, 1174.66, 1568];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.035, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.3);
      });
    } else if (type === 'bonus') {
      const notes = [329.63, 392.00, 440.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.45);
      });
    } else if (type === 'card_flip') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(294, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'correct') {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.03, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.2);
      });
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'lever') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(293.66, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {}
};

export const LuckyLeprechaunSlots: React.FC<LuckyLeprechaunSlotsProps> = ({
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

  // Reels
  const [reels, setReels] = useState<string[][]>([
    ['HAT', 'SHILLING', 'HORSESHOE'],
    ['HARP', 'CLOVER', 'STOUT'],
    ['STOUT', 'RAINBOW', 'POTOFGOLD']
  ]);

  const [lastWin, setLastWin] = useState<number | null>(null);
  const [spinHistory, setSpinHistory] = useState<string[]>([]);
  const [autoSpinActive, setAutoSpinActive] = useState<boolean>(false);
  const [winningPaylines, setWinningPaylines] = useState<number[]>([]);

  // Irish Luck Meter
  const [irishLuckMeter, setIrishLuckMeter] = useState<number>(0);

  // Pot of Gold Fortune Wheel State
  const [wheelActive, setWheelActive] = useState<boolean>(false);
  const [wheelSpinning, setWheelSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [wheelResult, setWheelResult] = useState<string>('');

  // Clover Card Gamble State
  const [gambleActive, setGambleActive] = useState<boolean>(false);
  const [gambleAmount, setGambleAmount] = useState<number>(0);
  const [gambleCard, setGambleCard] = useState<{ emoji: string; color: 'red' | 'black'; value: string } | null>(null);
  const [gambleCount, setGambleCount] = useState<number>(0);

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
    if (autoSpinActive && !spinning && !gambleActive && !wheelActive) {
      timer = setTimeout(() => {
        handleSpin();
      }, 1500);
    }
    return () => clearTimeout(timer);
  }, [autoSpinActive, spinning, gambleActive, wheelActive]);

  const adjustBet = (amount: number) => {
    if (spinning || freeSpinsRemaining > 0) return;
    const newBet = Math.max(10, Math.min(500, bet + amount));
    setBet(newBet);
    playIrishSound('stop', isMuted);
  };

  const handleSpin = () => {
    if (spinning || gambleActive || wheelActive) return;

    const totalWager = freeSpinsRemaining > 0 ? 0 : bet * activePaylinesCount;
    if (chips < totalWager && freeSpinsRemaining === 0) {
      triggerAlert(`Need ${totalWager} Chips for this Leprechaun spin.`, 'error');
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

    playIrishSound('lever', isMuted);

    if (onUpdateTask) {
      onUpdateTask('play_slots', 1);
    }

    // Determine final symbols
    const finalReels: string[][] = [];
    for (let col = 0; col < 3; col++) {
      const colSymbols: string[] = [];
      for (let row = 0; row < 3; row++) {
        const selectionSource = freeSpinsRemaining > 0 
          ? [...WEIGHTED_SYMBOLS, 'CLOVER', 'POTOFGOLD', 'RAINBOW']
          : WEIGHTED_SYMBOLS;
        const randSym = selectionSource[Math.floor(Math.random() * selectionSource.length)];
        colSymbols.push(randSym);
      }
      finalReels.push(colSymbols);
    }

    stoppedRef.current = [false, false, false];
    let playTicks = 0;
    playIrishSound('spin', isMuted);

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
        playIrishSound('spin', isMuted);
      }
    }, isFastMode ? 60 : 100);

    const delayStep = isFastMode ? 250 : 550;

    stoppedRef.current.forEach((_, colIdx) => {
      const timer = setTimeout(() => {
        stoppedRef.current[colIdx] = true;
        playIrishSound('stop', isMuted);

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

    // Check paylines
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
      } else if (s1 === 'CLOVER' && s2 === s3) {
        isWin = true;
        winSym = s2;
      } else if (s2 === 'CLOVER' && s1 === s3) {
        isWin = true;
        winSym = s1;
      } else if (s3 === 'CLOVER' && s1 === s2) {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'CLOVER' && s2 === 'CLOVER') {
        isWin = true;
        winSym = s3;
      } else if (s2 === 'CLOVER' && s3 === 'CLOVER') {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'CLOVER' && s3 === 'CLOVER') {
        isWin = true;
        winSym = s2;
      }

      if (isWin && winSym !== '') {
        const symbolMult = IRISH_SYMBOLS[winSym]?.mult || 3;
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
      
      if (freeSpinsRemaining > 0) {
        setFreeSpinsTotalWon(prev => prev + netWin);
      }

      setIrishLuckMeter(prev => Math.min(100, prev + 15));

      if (jackpotHit) {
        playIrishSound('jackpot', isMuted);
        triggerAlert(`⭐ LEPRECHAUN JACKPOT PLUNDER! Won +${netWin} Chips! 🍀`, 'success');
      } else {
        playIrishSound('win', isMuted);
        triggerAlert(`Lucky Celtic Match! Got +${netWin} Chips!`, 'success');
      }
      setSpinHistory(prev => [`Won +${netWin} Chips 🍀`, ...prev.slice(0, 19)]);
    } else {
      setIrishLuckMeter(prev => {
        const next = prev + 10;
        if (next >= 100) {
          setTimeout(() => {
            triggerIrishFortuneWheel();
          }, 600);
          return 0;
        }
        return next;
      });
      setSpinHistory(prev => ['No win (Luck +10%)', ...prev.slice(0, 19)]);
    }

    // Scatter Trigger: 3 or more Clover symbols triggers 8 Golden Free Spins!
    const scatterCount = grid.flat().filter(s => s === 'CLOVER').length;
    if (scatterCount >= 3) {
      setTimeout(() => {
        setFreeSpinsRemaining(8);
        setFreeSpinsMultiplier(3);
        setFreeSpinsTotalWon(0);
        playIrishSound('bonus', isMuted);
        triggerAlert(`🍀 SHAMROCK FRENZY! 8 Free Spins at 3x Multiplier!`, 'success');
      }, 700);
    }
  };

  // Trigger Pot of Gold Wheel
  const triggerIrishFortuneWheel = () => {
    setAutoSpinActive(false);
    setWheelActive(true);
    setWheelResult('');
    setWheelSpinning(false);
    playIrishSound('bonus', isMuted);
  };

  const handleSpinFortuneWheel = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    playIrishSound('spin', isMuted);

    const extraRotation = 1440 + Math.floor(Math.random() * 360);
    setWheelRotation(prev => prev + extraRotation);

    const slices = [
      { text: '600 Chips 🪙', payout: 600 },
      { text: '3x Total Bet 🌈', mult: 3 },
      { text: '1200 Chips 🍻', payout: 1200 },
      { text: '6x Total Bet 🎩', mult: 6 },
      { text: '2400 Chips 🌟', payout: 2400 },
      { text: '12x Total Bet 👑', mult: 12 },
      { text: '6000 CHIPS GRAND JACKPOT! 💰', payout: 6000 },
      { text: '4 FREE SPINS ROUND! 🍀', freeSpins: 4 }
    ];

    setTimeout(() => {
      setWheelSpinning(false);
      const normalizedAngle = (wheelRotation + extraRotation) % 360;
      const sliceSize = 360 / slices.length;
      const selectedIndex = Math.floor((360 - normalizedAngle) / sliceSize) % slices.length;
      const winner = slices[selectedIndex >= 0 ? selectedIndex : 0];

      setWheelResult(winner.text);
      playIrishSound('win', isMuted);

      if (winner.payout) {
        onUpdateChips(winner.payout);
        triggerAlert(`Pot of Gold awarded: +${winner.payout} Chips!`, 'success');
      } else if (winner.mult) {
        const finalReward = bet * activePaylinesCount * winner.mult;
        onUpdateChips(finalReward);
        triggerAlert(`Pot of Gold awarded: ${winner.mult}x bet (+${finalReward} Chips)!`, 'success');
      } else if (winner.freeSpins) {
        setFreeSpinsRemaining(winner.freeSpins);
        setFreeSpinsMultiplier(4);
        triggerAlert(`Pot of Gold awarded: ${winner.freeSpins} Free Spins at 4x multiplier!`, 'success');
      }
    }, 4000);
  };

  // Shamrock Card Gamble
  const openGambleGame = () => {
    if (!lastWin || lastWin <= 0) return;
    setAutoSpinActive(false);
    setGambleAmount(lastWin);
    setGambleCard(null);
    setGambleCount(0);
    setGambleActive(true);
    playIrishSound('bonus', isMuted);
  };

  const handleGambleGuess = (guess: 'red' | 'black') => {
    playIrishSound('card_flip', isMuted);

    const cards = [
      { emoji: '🍀 Green Shamrock', color: 'red', value: 'Celtic Emerald' },
      { emoji: '🌈 Gold Coin', color: 'red', value: 'Rainbow Sovereign' },
      { emoji: '🍺 Irish Stout', color: 'black', value: 'Dublin Pint' },
      { emoji: '🎩 Black Pipe', color: 'black', value: 'Magic Clay' }
    ] as const;

    const selectedCard = cards[Math.floor(Math.random() * cards.length)];
    setGambleCard(selectedCard);

    if (selectedCard.color === guess) {
      setTimeout(() => {
        onUpdateChips(gambleAmount);
        setGambleAmount(prev => prev * 2);
        setGambleCount(prev => prev + 1);
        playIrishSound('correct', isMuted);
        triggerAlert('🍀 LUCKY CHOICE! Win Doubled!', 'success');
      }, 300);
    } else {
      setTimeout(() => {
        onUpdateChips(-gambleAmount);
        setGambleAmount(0);
        playIrishSound('wrong', isMuted);
        triggerAlert('🍺 WRONG PINTS GUESS! Lost current win.', 'error');
        setTimeout(() => {
          setGambleActive(false);
          setLastWin(0);
        }, 1500);
      }, 300);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-green-950 to-emerald-950 border-4 border-emerald-500/40 rounded-3xl p-6 shadow-[0_0_35px_rgba(16,185,129,0.25)] relative overflow-hidden">
      {/* Visual glowing clovers */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-5">
        <div className="absolute top-5 left-5 w-20 h-20 bg-emerald-500 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-5 right-5 w-24 h-24 bg-yellow-500 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-emerald-500/20 pb-4 mb-5 gap-4 relative z-10 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-500 flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-2xl">🍀</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-yellow-300 tracking-tight">
                Lucky Leprechaun
              </h2>
              {freeSpinsRemaining > 0 ? (
                <span className="bg-emerald-500 text-white border border-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                  SHAMROCK SPIN: {freeSpinsMultiplier}x
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full">
                  POT OF GOLD
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-200/60 mt-0.5">Find pots of gold & spin the Leprechaun fortune compass!</p>
          </div>
        </div>

        {/* Top controls */}
        <div className="flex items-center gap-2">
          {irishLuckMeter > 0 && (
            <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-300 uppercase font-mono">Irish Luck:</span>
              <div className="w-16 bg-emerald-950 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full animate-pulse" style={{ width: `${irishLuckMeter}%` }} />
              </div>
              <span className="text-[10px] font-mono text-emerald-300">{irishLuckMeter}%</span>
            </div>
          )}

          <button
            onClick={() => setShowPaytable(!showPaytable)}
            className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all text-xs font-medium"
          >
            Rules
          </button>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-emerald-400" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
          </button>
        </div>
      </div>

      {/* Paytable */}
      <AnimatePresence>
        {showPaytable && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-950/80 border border-emerald-500/30 rounded-2xl p-4 mb-5 relative z-10 font-sans"
          >
            <h3 className="text-sm font-bold text-emerald-200 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              Leprechaun Paytable & Celtic Multipliers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(IRISH_SYMBOLS).map(([key, value]) => (
                <div key={key} className="bg-emerald-900/30 border border-emerald-500/10 rounded-xl p-2.5 flex items-center gap-2">
                  <span className="text-2xl">{value.emoji}</span>
                  <div>
                    <p className="text-[11px] font-medium text-emerald-100 leading-tight">{value.name.replace(' (Wild)', '')}</p>
                    <p className="text-xs font-bold text-emerald-400 font-mono leading-none mt-1">{value.mult}x</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* LEFT: Reels */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-emerald-950/40 border-4 border-emerald-500/40 rounded-3xl p-5 shadow-inner relative flex flex-col items-center">
            
            {/* Free Spins Glowing border */}
            {freeSpinsRemaining > 0 && (
              <div className="absolute inset-0 rounded-[22px] border-4 border-emerald-500 animate-pulse pointer-events-none z-30" />
            )}

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
              {winningPaylines.map(lineId => (
                <div key={lineId} className="absolute inset-x-4 inset-y-4 rounded-2xl border-2 border-yellow-400 animate-pulse" />
              ))}
            </div>

            {/* Reels Grid */}
            <div className="grid grid-cols-3 gap-4 w-full">
              {reels.map((column, colIdx) => (
                <div key={colIdx} className="bg-emerald-950/60 border border-emerald-500/20 rounded-2xl p-2 h-72 flex flex-col justify-between overflow-hidden shadow-inner relative">
                  <AnimatePresence mode="popLayout">
                    {column.map((symKey, rowIdx) => {
                      const sym = IRISH_SYMBOLS[symKey] || IRISH_SYMBOLS.SHILLING;
                      return (
                        <motion.div
                          key={`${colIdx}-${rowIdx}-${symKey}`}
                          initial={spinning ? { y: -80, opacity: 0.5 } : { y: 0, opacity: 1 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 80, opacity: 0.5 }}
                          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                          className={`flex-1 flex flex-col items-center justify-center rounded-xl my-1 border border-emerald-500/5 ${sym.bgGlow} transition-all relative group overflow-hidden`}
                        >
                          <span className="text-4xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] animate-pulse">{sym.emoji}</span>
                          <span className="text-[9px] text-emerald-300/40 font-mono mt-1 font-medium">{sym.name.split(' ')[0]}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Bottom active info */}
            <div className="flex justify-between w-full mt-4 border-t border-emerald-500/10 pt-3 px-1 text-xs">
              <div className="flex items-center gap-1 text-emerald-400">
                <span>🍀 Active Paths:</span>
                <span className="font-bold text-emerald-200 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {activePaylinesCount} / 5
                </span>
              </div>
              <div className="flex gap-1">
                {PAYLINES.map(line => (
                  <button
                    key={line.id}
                    disabled={spinning || freeSpinsRemaining > 0}
                    onClick={() => setActivePaylinesCount(line.id)}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition-all ${
                      line.id <= activePaylinesCount
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
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
        <div className="flex flex-col justify-between bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-5 shadow-lg">
          <div>
            {/* Balance */}
            <div className="bg-emerald-900/20 border border-emerald-500/10 rounded-2xl p-4 mb-4 flex items-center justify-between font-sans">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400 animate-bounce" />
                <div>
                  <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono">Available Balance</p>
                  <p className="text-xl font-black text-emerald-100 font-mono mt-0.5">{chips.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Free Spins Accumulated */}
            {freeSpinsRemaining > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 mb-4 text-center font-sans">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">SHAMROCK BONUS ACCUMULATOR</p>
                <p className="text-xl font-bold text-emerald-300 font-mono mt-1.5">+{freeSpinsTotalWon.toLocaleString()} Chips</p>
                <p className="text-[10px] text-emerald-400/70 mt-1">{freeSpinsRemaining} FREE SPINS LEFT</p>
              </div>
            )}

            {/* Bet sizes */}
            <div className="space-y-3.5 mb-5 font-sans">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-300 font-medium">Line Bet size:</span>
                <span className="text-emerald-200 font-bold font-mono">{bet} Chips</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[-100, -10, 10, 100].map(val => (
                  <button
                    key={val}
                    disabled={spinning || freeSpinsRemaining > 0}
                    onClick={() => adjustBet(val)}
                    className="py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/15 text-xs font-mono font-semibold transition-all"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* spin outcome */}
            <div className="border-t border-emerald-500/10 pt-4 space-y-2 mb-4 font-sans">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-300/60">Total Cost:</span>
                <span className="text-emerald-200 font-bold">
                  {freeSpinsRemaining > 0 ? 'FREE SPIN' : `${bet * activePaylinesCount} Chips`}
                </span>
              </div>

              {lastWin !== null && (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-emerald-500/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-300/60 font-bold">Spin Result:</span>
                    <span className={`font-bold font-mono ${lastWin > 0 ? 'text-green-400 text-sm' : 'text-emerald-300/40'}`}>
                      {lastWin > 0 ? `+${lastWin.toLocaleString()} Chips` : 'No Match'}
                    </span>
                  </div>

                  {lastWin > 0 && !spinning && (
                    <button
                      onClick={openGambleGame}
                      className="w-full py-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-black text-[11px] uppercase tracking-wider animate-bounce flex items-center justify-center gap-1"
                    >
                      🍀 Shamrock Red/Black Card Gamble!
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 font-sans">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsFastMode(!isFastMode)}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isFastMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-emerald-900/10 border-emerald-500/10 text-emerald-400'
                }`}
              >
                Turbo Mode
              </button>
              <button
                onClick={() => setAutoSpinActive(!autoSpinActive)}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  autoSpinActive ? 'bg-emerald-500/30 border-emerald-500 text-emerald-300' : 'bg-emerald-900/10 border-emerald-500/10 text-emerald-400'
                }`}
              >
                Auto Spin
              </button>
            </div>

            <button
              onClick={handleSpin}
              disabled={spinning}
              className={`w-full py-4 rounded-2xl font-black text-lg tracking-wider uppercase transition-all border ${
                spinning
                  ? 'bg-emerald-950/60 border-emerald-500/20 text-emerald-500'
                  : 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white border-emerald-400 shadow-xl shadow-emerald-500/25 hover:brightness-110'
              }`}
            >
              {spinning ? 'Spinning Shamrocks...' : 'Spin Compass!'}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Leprechaun Fortune Wheel */}
      <AnimatePresence>
        {wheelActive && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-emerald-900 via-green-950 to-emerald-950 border-4 border-emerald-400/50 rounded-3xl p-6 max-w-md w-full text-center relative overflow-hidden"
            >
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-200 to-yellow-300 uppercase tracking-tight mb-2">
                🍀 Pot of Gold Fortune Wheel! 🍀
              </h3>
              <p className="text-xs text-emerald-200/70 mb-6">Spin the divine Celtic compass for massive multipliers!</p>

              {/* Graphical Fortune Wheel */}
              <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
                <div className="absolute top-0 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-yellow-400 z-30 drop-shadow-md" />
                
                <motion.div
                  className="w-full h-full rounded-full border-8 border-emerald-400 shadow-2xl relative overflow-hidden"
                  style={{
                    backgroundImage: `conic-gradient(
                      from 0deg,
                      #10b981 0deg 45deg,
                      #f59e0b 45deg 90deg,
                      #047857 90deg 135deg,
                      #34d399 135deg 180deg,
                      #eab308 180deg 225deg,
                      #059669 225deg 270deg,
                      #f59e0b 270deg 315deg,
                      #10b981 315deg 360deg
                    )`,
                  }}
                  animate={{ rotate: wheelRotation }}
                  transition={wheelSpinning ? { duration: 4, ease: [0.12, 0.8, 0.15, 1] } : { duration: 0 }}
                >
                  {[
                    '600 CHIPS', '3x BET', '1.2K CHIPS', '6x BET',
                    '2.4K CHIPS', '12x BET', '6K GRAND', 'FREE SPIN'
                  ].map((text, idx) => (
                    <div
                      key={idx}
                      className="absolute top-1/2 left-1/2 w-1/2 h-10 -translate-x-1/2 -translate-y-1/2 origin-left text-[9px] font-bold text-white uppercase text-right pr-4 tracking-tighter"
                      style={{ transform: `rotate(${idx * 45 + 22.5}deg) translate(0px, -50%)` }}
                    >
                      {text}
                    </div>
                  ))}
                </motion.div>

                <div className="absolute w-16 h-16 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center shadow-lg z-20 animate-pulse">
                  <span className="text-xl">🍀</span>
                </div>
              </div>

              {wheelResult && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-900/40 border border-emerald-500/30 p-3 rounded-2xl mb-4 text-center"
                >
                  <p className="text-[10px] text-emerald-300 uppercase tracking-widest font-mono">CELTIC REWARD UNLOCKED</p>
                  <p className="text-xl font-bold text-yellow-400 font-sans">{wheelResult}</p>
                </motion.div>
              )}

              <div className="flex gap-2">
                <button
                  disabled={wheelSpinning}
                  onClick={handleSpinFortuneWheel}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-40"
                >
                  {wheelSpinning ? 'SPINNING COMPASS...' : '🍀 SPIN CELTIC COMPASS! 🍀'}
                </button>
                
                {(!wheelSpinning && wheelResult) && (
                  <button
                    onClick={() => setWheelActive(false)}
                    className="px-6 py-3.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase transition-all"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Clover Card Gamble */}
      <AnimatePresence>
        {gambleActive && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-emerald-950 via-zinc-900 to-zinc-950 border-4 border-emerald-500/40 rounded-3xl p-6 max-w-sm w-full text-center relative overflow-hidden"
            >
              <h3 className="text-xl font-bold text-emerald-300 uppercase tracking-wide mb-1 flex items-center justify-center gap-1.5">
                🍀 Celtic Clover Card Gamble!
              </h3>
              <p className="text-xs text-emerald-200/60 mb-5">Predict if the Shamrock flavor is Clover Red or Licorice Black!</p>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 mb-5">
                <p className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest leading-none">CURRENT GAMBLE VALUE</p>
                <p className="text-2xl font-black text-yellow-400 font-mono mt-1.5">{gambleAmount.toLocaleString()} CHIPS</p>
                <p className="text-[9px] text-emerald-200/60 mt-1 uppercase font-mono">Guessed Correctly: {gambleCount} Stages</p>
              </div>

              {/* Card board */}
              <div className="h-44 flex items-center justify-center mb-6">
                <AnimatePresence mode="wait">
                  {gambleCard ? (
                    <motion.div
                      key={gambleCard.emoji}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      className={`w-28 h-40 rounded-2xl border-4 bg-zinc-900/90 flex flex-col items-center justify-center shadow-2xl relative ${
                        gambleCard.color === 'red' ? 'border-emerald-500 text-emerald-400' : 'border-zinc-500 text-zinc-300'
                      }`}
                    >
                      <span className="text-3xl mb-1">{gambleCard.color === 'red' ? '🍀' : '🍺'}</span>
                      <p className="text-xs font-bold leading-none uppercase mt-2">{gambleCard.value}</p>
                      <p className="text-[9px] text-zinc-500 font-mono mt-1 leading-none">{gambleCard.emoji}</p>
                    </motion.div>
                  ) : (
                    <motion.div className="w-28 h-40 rounded-2xl border-4 border-emerald-500/20 bg-emerald-900/20 flex flex-col items-center justify-center shadow-2xl animate-pulse">
                      <span className="text-3xl text-emerald-400">❓</span>
                      <p className="text-[10px] text-emerald-300 font-bold uppercase mt-2">CELTIC CARD</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-3">
                {gambleAmount > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleGambleGuess('red')}
                      className="py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-600/20"
                    >
                      <span className="text-lg">🍀</span>
                      Shamrock Red
                    </button>
                    <button
                      onClick={() => handleGambleGuess('black')}
                      className="py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1 shadow-lg"
                    >
                      <span className="text-lg">🍺</span>
                      Pint Black
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-red-400 font-bold uppercase animate-pulse">💥 GAMBLE LOST! EXITING...</p>
                )}

                <div className="flex gap-2 border-t border-emerald-500/10 pt-4 mt-2">
                  <button
                    disabled={gambleAmount <= 0}
                    onClick={() => {
                      setGambleActive(false);
                      triggerAlert(`Smart Choice! Banked +${gambleAmount} Chips securely!`, 'success');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 font-bold uppercase text-xs transition-all"
                  >
                    🔒 BANK CHIPS
                  </button>
                  <button
                    onClick={() => setGambleActive(false)}
                    className="py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase transition-all"
                  >
                    Close
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
