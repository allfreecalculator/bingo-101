import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Coins, Trophy, Play, RefreshCw, Volume2, VolumeX, Heart, 
  HelpCircle, Star, Crown, Smile, Zap, Eye, Gift, ArrowRight, RotateCcw, ShieldAlert
} from 'lucide-react';

interface CandyWonderlandSlotsProps {
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

const CANDY_SYMBOLS: Record<string, SymbolMetadata> = {
  LOLLIPOP: { name: 'Rainbow Lollipop (Wild)', mult: 150, color: 'text-pink-400', glow: 'shadow-pink-500/80', bgGlow: 'bg-pink-500/10', emoji: '🍭' },
  CHOCOLATE: { name: 'Golden Chocolate', mult: 60, color: 'text-yellow-400', glow: 'shadow-yellow-500/70', bgGlow: 'bg-yellow-500/10', emoji: '🍫' },
  GUMDROP: { name: 'Sweet Gumdrop', mult: 35, color: 'text-red-400', glow: 'shadow-red-500/70', bgGlow: 'bg-red-500/10', emoji: '🍬' },
  DONUT: { name: 'Glazed Donut', mult: 20, color: 'text-rose-400', glow: 'shadow-rose-500/70', bgGlow: 'bg-rose-500/10', emoji: '🍩' },
  COOKIE: { name: 'Choco Cookie', mult: 12, color: 'text-amber-500', glow: 'shadow-amber-500/70', bgGlow: 'bg-amber-500/10', emoji: '🍪' },
  CUPCAKE: { name: 'Strawberry Cupcake', mult: 8, color: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/70', bgGlow: 'bg-fuchsia-500/10', emoji: '🧁' },
  HONEY: { name: 'Golden Honey Jar', mult: 5, color: 'text-amber-400', glow: 'shadow-amber-400/70', bgGlow: 'bg-amber-500/10', emoji: '🍯' },
  MARSHMALLOW: { name: 'Puffy Marshmallow', mult: 3, color: 'text-teal-300', glow: 'shadow-teal-300/70', bgGlow: 'bg-teal-500/10', emoji: '🍥' }
};

const SYMBOLS_POOL = ['LOLLIPOP', 'CHOCOLATE', 'GUMDROP', 'DONUT', 'COOKIE', 'CUPCAKE', 'HONEY', 'MARSHMALLOW'];
const WEIGHTED_SYMBOLS = [
  'MARSHMALLOW', 'MARSHMALLOW', 'MARSHMALLOW', 'MARSHMALLOW',
  'HONEY', 'HONEY', 'HONEY',
  'CUPCAKE', 'CUPCAKE', 'CUPCAKE',
  'COOKIE', 'COOKIE',
  'DONUT', 'DONUT',
  'GUMDROP',
  'CHOCOLATE',
  'LOLLIPOP'
];

const PAYLINES = [
  { id: 1, name: 'Sugar Lane', path: [1, 1, 1], color: 'border-pink-400 text-pink-400', shadow: 'shadow-pink-500/50' },
  { id: 2, name: 'Frosting Peak', path: [0, 0, 0], color: 'border-indigo-400 text-indigo-400', shadow: 'shadow-indigo-500/50' },
  { id: 3, name: 'Cookie Valley', path: [2, 2, 2], color: 'border-rose-400 text-rose-400', shadow: 'shadow-rose-500/50' },
  { id: 4, name: 'Lollipop Slide', path: [0, 1, 2], color: 'border-yellow-400 text-yellow-400', shadow: 'shadow-yellow-500/50' },
  { id: 5, name: 'Caramel Cascade', path: [2, 1, 0], color: 'border-teal-400 text-teal-400', shadow: 'shadow-teal-500/50' }
];

const playCandySound = (type: 'spin' | 'stop' | 'win' | 'lose' | 'lever' | 'jackpot' | 'bonus' | 'card_flip' | 'correct' | 'wrong', isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'spin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'stop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'win') {
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
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
      const freqs = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        osc.frequency.linearRampToValueAtTime(freq * 1.5, ctx.currentTime + idx * 0.05 + 0.3);
        gain.gain.setValueAtTime(0.03, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.4);
      });
    } else if (type === 'bonus') {
      const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.55);
      });
    } else if (type === 'card_flip') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'correct') {
      const notes = [659.25, 880, 1046.5];
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
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'lever') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch (e) {}
};

export const CandyWonderlandSlots: React.FC<CandyWonderlandSlotsProps> = ({
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
    ['CUPCAKE', 'MARSHMALLOW', 'COOKIE'],
    ['DONUT', 'LOLLIPOP', 'HONEY'],
    ['COOKIE', 'GUMDROP', 'CUPCAKE']
  ]);

  const [lastWin, setLastWin] = useState<number | null>(null);
  const [spinHistory, setSpinHistory] = useState<string[]>([]);
  const [autoSpinActive, setAutoSpinActive] = useState<boolean>(false);
  const [winningPaylines, setWinningPaylines] = useState<number[]>([]);

  // Free Spins State
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState<number>(0);
  const [freeSpinsMultiplier, setFreeSpinsMultiplier] = useState<number>(1);
  const [freeSpinsTotalWon, setFreeSpinsTotalWon] = useState<number>(0);

  // Candy Bonus Meter (consecutive non-wins or special events trigger this)
  const [sugarRushMeter, setSugarRushMeter] = useState<number>(0);

  // Bonus Fortune Wheel State
  const [bonusWheelActive, setBonusWheelActive] = useState<boolean>(false);
  const [wheelSpinning, setWheelSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [wheelResult, setWheelResult] = useState<string>('');

  // Interactive Suit Gamble State (Red Card vs Black Card)
  const [gambleActive, setGambleActive] = useState<boolean>(false);
  const [gambleAmount, setGambleAmount] = useState<number>(0);
  const [gambleCard, setGambleCard] = useState<{ emoji: string; color: 'red' | 'black'; value: string } | null>(null);
  const [gambleCount, setGambleCount] = useState<number>(0);

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
    if (autoSpinActive && !spinning && !gambleActive && !bonusWheelActive) {
      const waitTime = freeSpinsRemaining > 0 ? 1200 : 1600;
      timer = setTimeout(() => {
        handleSpin();
      }, waitTime);
    }
    return () => clearTimeout(timer);
  }, [autoSpinActive, spinning, gambleActive, bonusWheelActive, freeSpinsRemaining]);

  const adjustBet = (amount: number) => {
    if (spinning || freeSpinsRemaining > 0) return;
    const newBet = Math.max(10, Math.min(500, bet + amount));
    setBet(newBet);
    playCandySound('stop', isMuted);
  };

  const handleSpin = () => {
    if (spinning || gambleActive || bonusWheelActive) return;

    const totalWager = freeSpinsRemaining > 0 ? 0 : bet * activePaylinesCount;
    if (chips < totalWager && freeSpinsRemaining === 0) {
      triggerAlert(`You need ${totalWager} Chips for this sugar rush spin.`, 'error');
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

    playCandySound('lever', isMuted);

    if (onUpdateTask) {
      onUpdateTask('play_slots', 1);
    }

    // Determine final symbols
    const finalReels: string[][] = [];
    for (let col = 0; col < 3; col++) {
      const colSymbols: string[] = [];
      for (let row = 0; row < 3; row++) {
        // High win rates if in Free Spins round!
        const selectionSource = freeSpinsRemaining > 0 
          ? [...WEIGHTED_SYMBOLS, 'LOLLIPOP', 'CHOCOLATE', 'GUMDROP', 'LOLLIPOP']
          : WEIGHTED_SYMBOLS;
        const randSym = selectionSource[Math.floor(Math.random() * selectionSource.length)];
        colSymbols.push(randSym);
      }
      finalReels.push(colSymbols);
    }

    stoppedRef.current = [false, false, false];
    let playTicks = 0;
    playCandySound('spin', isMuted);

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
        playCandySound('spin', isMuted);
      }
    }, isFastMode ? 60 : 100);

    const delayStep = isFastMode ? 300 : 600;

    stoppedRef.current.forEach((_, colIdx) => {
      const timer = setTimeout(() => {
        stoppedRef.current[colIdx] = true;
        playCandySound('stop', isMuted);

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
      } else if (s1 === 'LOLLIPOP' && s2 === s3) {
        isWin = true;
        winSym = s2;
      } else if (s2 === 'LOLLIPOP' && s1 === s3) {
        isWin = true;
        winSym = s1;
      } else if (s3 === 'LOLLIPOP' && s1 === s2) {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'LOLLIPOP' && s2 === 'LOLLIPOP') {
        isWin = true;
        winSym = s3;
      } else if (s2 === 'LOLLIPOP' && s3 === 'LOLLIPOP') {
        isWin = true;
        winSym = s1;
      } else if (s1 === 'LOLLIPOP' && s3 === 'LOLLIPOP') {
        isWin = true;
        winSym = s2;
      }

      if (isWin && winSym !== '') {
        const symbolMult = CANDY_SYMBOLS[winSym]?.mult || 3;
        totalWinMultiplier += symbolMult;
        triggeredLines.push(line.id);
        if (symbolMult >= 50) jackpotHit = true;
      }
    }

    // Multiply if in free spins round
    let spinWinMult = totalWinMultiplier;
    if (freeSpinsRemaining > 0 && spinWinMult > 0) {
      spinWinMult *= freeSpinsMultiplier;
    }

    const netWin = Math.floor(bet * spinWinMult);

    setWinningPaylines(triggeredLines);
    setLastWin(netWin);
    setSpinning(false);

    // Random sugar rush bonus chance!
    const scatterCount = grid.flat().filter(s => s === 'LOLLIPOP').length;
    
    if (netWin > 0) {
      onUpdateChips(netWin);
      
      if (freeSpinsRemaining > 0) {
        setFreeSpinsTotalWon(prev => prev + netWin);
      }

      setSugarRushMeter(prev => Math.min(100, prev + 15));

      if (jackpotHit) {
        playCandySound('jackpot', isMuted);
        triggerAlert(`⭐ CANDY JACKPOT OVERFLOW! Won +${netWin} Chips! 🍭`, 'success');
      } else {
        playCandySound('win', isMuted);
        triggerAlert(`Sugary Win! Got +${netWin} Chips across paylines!`, 'success');
      }
      setSpinHistory(prev => [`Won +${netWin} Chips 🍭`, ...prev.slice(0, 19)]);
    } else {
      // Build up the sugar rush meter on non-winning spins to prevent boredom!
      setSugarRushMeter(prev => {
        const next = prev + 10;
        if (next >= 100) {
          setTimeout(() => {
            triggerSugarRushBonusWheel();
          }, 600);
          return 0;
        }
        return next;
      });
      setSpinHistory(prev => ['No win (Meter +10%)', ...prev.slice(0, 19)]);
    }

    // Scatter Trigger for Free Spins Round! (3 or more LOLLIPOPs anywhere on screen)
    if (scatterCount >= 3) {
      setTimeout(() => {
        const fsCount = 8;
        const fsMult = Math.floor(Math.random() * 4) + 2; // 2x to 5x multipliers
        setFreeSpinsRemaining(fsCount);
        setFreeSpinsMultiplier(fsMult);
        setFreeSpinsTotalWon(0);
        playCandySound('bonus', isMuted);
        triggerAlert(`🌈 SCATTER MULTIPLIER FRENZY! 8 Free Spins at ${fsMult}x Mult!`, 'success');
      }, 700);
    }
  };

  // Launch Sugar Rush Bonus Wheel
  const triggerSugarRushBonusWheel = () => {
    setAutoSpinActive(false);
    setBonusWheelActive(true);
    setWheelResult('');
    setWheelSpinning(false);
    playCandySound('bonus', isMuted);
  };

  const handleSpinBonusWheel = () => {
    if (wheelSpinning) return;
    setWheelSpinning(true);
    playCandySound('spin', isMuted);

    const extraRotation = 1800 + Math.floor(Math.random() * 360);
    setWheelRotation(prev => prev + extraRotation);

    const wheelSlices = [
      { text: '500 Chips 🍬', payout: 500 },
      { text: '2x TOTAL BET 🌟', mult: 2 },
      { text: '1000 Chips 🍫', payout: 1000 },
      { text: '5x TOTAL BET 🧁', mult: 5 },
      { text: '2000 Chips 🍭', payout: 2000 },
      { text: '10x TOTAL BET 👑', mult: 10 },
      { text: '5000 CHIPS JACKPOT! 🏆', payout: 5000 },
      { text: 'FREE SPINS ROUND! 🌈', freeSpins: 5 }
    ];

    setTimeout(() => {
      setWheelSpinning(false);
      const normalizedAngle = (wheelRotation + extraRotation) % 360;
      const sliceSize = 360 / wheelSlices.length;
      // Index calculation taking direction of rotation into account
      const selectedIndex = Math.floor((360 - normalizedAngle) / sliceSize) % wheelSlices.length;
      const winner = wheelSlices[selectedIndex >= 0 ? selectedIndex : 0];

      setWheelResult(winner.text);
      playCandySound('win', isMuted);

      if (winner.payout) {
        onUpdateChips(winner.payout);
        triggerAlert(`Bonus Wheel awarded: +${winner.payout} Chips!`, 'success');
      } else if (winner.mult) {
        const finalReward = bet * activePaylinesCount * winner.mult;
        onUpdateChips(finalReward);
        triggerAlert(`Bonus Wheel awarded: ${winner.mult}x bet size (+${finalReward} Chips)!`, 'success');
      } else if (winner.freeSpins) {
        setFreeSpinsRemaining(winner.freeSpins);
        setFreeSpinsMultiplier(3);
        triggerAlert(`Bonus Wheel awarded: ${winner.freeSpins} Free Spins at 3x multiplier!`, 'success');
      }
    }, 4000);
  };

  // Suit Card Gamble Screen (🍓 Red / 🍫 Black)
  const openGambleGame = () => {
    if (!lastWin || lastWin <= 0) return;
    setAutoSpinActive(false);
    setGambleAmount(lastWin);
    setGambleCard(null);
    setGambleCount(0);
    setGambleActive(true);
    playCandySound('bonus', isMuted);
  };

  const handleGambleGuess = (guess: 'red' | 'black') => {
    playCandySound('card_flip', isMuted);
    
    // Pick random sweet card
    const cardOptions = [
      { emoji: '🍓 Strawberry Jam', color: 'red', value: 'Red Queen' },
      { emoji: '🍒 Cherry Syrup', color: 'red', value: 'Red King' },
      { emoji: '🍫 Dark Chocolate', color: 'black', value: 'Black Jack' },
      { emoji: '🍇 Licorice Twist', color: 'black', value: 'Black Ace' }
    ] as const;

    const selectedCard = cardOptions[Math.floor(Math.random() * cardOptions.length)];
    setGambleCard(selectedCard);

    if (selectedCard.color === guess) {
      setTimeout(() => {
        const doubleWin = gambleAmount; // Add another equal amount to double it
        onUpdateChips(doubleWin);
        setGambleAmount(prev => prev * 2);
        setGambleCount(prev => prev + 1);
        playCandySound('correct', isMuted);
        triggerAlert('🍓 CORRECT! Win Doubled!', 'success');
      }, 300);
    } else {
      setTimeout(() => {
        // Lose the gamble amount (already gained on spin, so subtract it back)
        onUpdateChips(-gambleAmount);
        setGambleAmount(0);
        playCandySound('wrong', isMuted);
        triggerAlert('🍫 WRONG GUMDROP GUESS! Lost current win.', 'error');
        setTimeout(() => {
          setGambleActive(false);
          setLastWin(0);
        }, 1500);
      }, 300);
    }
  };

  return (
    <div className="bg-gradient-to-br from-pink-950 via-purple-950 to-rose-950/70 border-4 border-pink-500/40 rounded-3xl p-6 shadow-[0_0_35px_rgba(236,72,153,0.25)] relative overflow-hidden backdrop-blur-md">
      {/* Sparkly Ambient Sweets */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-pink-500 filter blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-fuchsia-500 filter blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-purple-500 filter blur-2xl animate-pulse" />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-pink-500/20 pb-4 mb-5 gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-pink-500/20 animate-bounce">
            <span className="text-2xl">🍭</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-rose-300 font-sans tracking-tight">
                Candy Wonderland
              </h2>
              {freeSpinsRemaining > 0 ? (
                <span className="bg-red-500 text-white border border-red-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-white" />
                  FREE SPIN: {freeSpinsMultiplier}x MULT!
                </span>
              ) : (
                <span className="bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  Sweet Cascade
                </span>
              )}
            </div>
            <p className="text-xs text-pink-200/60 mt-0.5">Cascade sugar paylines & trigger the Sweet Fortune Bonus Wheel!</p>
          </div>
        </div>

        {/* Top Control strip */}
        <div className="flex items-center gap-2">
          {sugarRushMeter > 0 && (
            <div className="flex items-center gap-2 bg-pink-500/10 px-3 py-1.5 rounded-xl border border-pink-500/20">
              <span className="text-[10px] font-bold text-pink-300 uppercase font-mono">Sugar Rush:</span>
              <div className="w-16 bg-pink-950 h-2.5 rounded-full overflow-hidden border border-pink-500/10">
                <div className="bg-gradient-to-r from-pink-500 to-fuchsia-500 h-full" style={{ width: `${sugarRushMeter}%` }} />
              </div>
              <span className="text-[10px] font-mono text-pink-300">{sugarRushMeter}%</span>
            </div>
          )}

          <button
            onClick={() => setShowPaytable(!showPaytable)}
            className="p-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/20 transition-all flex items-center gap-1.5 text-xs font-medium"
          >
            <Eye className="w-4 h-4 text-pink-400" />
            Rules
          </button>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/20 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-pink-400" /> : <Volume2 className="w-4 h-4 text-pink-300" />}
          </button>
        </div>
      </div>

      {/* Rules and Multipliers */}
      <AnimatePresence>
        {showPaytable && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-pink-950/80 border border-pink-500/30 rounded-2xl p-4 mb-5 relative z-10 font-sans"
          >
            <h3 className="text-sm font-bold text-pink-200 mb-3 flex items-center gap-2">
              <Gift className="w-4 h-4 text-pink-400" />
              Sugar Paytable & Winning Multipliers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(CANDY_SYMBOLS).map(([key, value]) => (
                <div key={key} className="bg-pink-900/30 border border-pink-500/10 rounded-xl p-2.5 flex items-center gap-2">
                  <span className="text-2xl">{value.emoji}</span>
                  <div>
                    <p className="text-[11px] font-medium text-pink-100/90 leading-tight">{value.name.replace(' (Wild)', '')}</p>
                    <p className="text-xs font-bold text-pink-400 font-mono leading-none mt-1">{value.mult}x bet</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-pink-200/60 border-t border-pink-500/10 pt-3">
              <p>🍭 <strong>Rainbow Lollipop (Wild)</strong> aligns with any symbol. Landing <strong>3 Lollipops</strong> on reels triggers a special <strong>Scatter Multiplier Free Spins frenzy round!</strong></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {/* LEFT: Game Reel Board */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-pink-950/40 border-4 border-pink-500/40 rounded-3xl p-5 shadow-inner relative flex flex-col items-center">
            
            {/* Free Spins Glowing Border */}
            {freeSpinsRemaining > 0 && (
              <div className="absolute inset-0 rounded-[22px] border-4 border-red-500 animate-pulse pointer-events-none z-30" />
            )}

            {/* Payline Visual Overlay Guides */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
              {winningPaylines.map(lineId => {
                const line = PAYLINES.find(l => l.id === lineId);
                if (!line) return null;
                return (
                  <div key={lineId} className="absolute inset-x-4 inset-y-4 rounded-2xl border-2 animate-pulse border-pink-400 shadow-lg shadow-pink-500/20" />
                );
              })}
            </div>

            {/* Reels Grid (3 columns x 3 rows) */}
            <div className="grid grid-cols-3 gap-4 w-full">
              {reels.map((column, colIdx) => (
                <div key={colIdx} className="bg-pink-950/60 border border-pink-500/20 rounded-2xl p-2 h-72 flex flex-col justify-between overflow-hidden shadow-inner relative">
                  <AnimatePresence mode="popLayout">
                    {column.map((symKey, rowIdx) => {
                      const sym = CANDY_SYMBOLS[symKey] || CANDY_SYMBOLS.MARSHMALLOW;
                      return (
                        <motion.div
                          key={`${colIdx}-${rowIdx}-${symKey}`}
                          initial={spinning ? { y: -80, opacity: 0.5 } : { y: 0, opacity: 1 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 80, opacity: 0.5 }}
                          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                          className={`flex-1 flex flex-col items-center justify-center rounded-xl my-1 border border-pink-500/5 ${sym.bgGlow} transition-all relative group overflow-hidden`}
                        >
                          <span className="text-4xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] animate-pulse">{sym.emoji}</span>
                          <span className="text-[9px] text-pink-300/40 font-mono mt-1 font-medium">{sym.name.split(' ')[0]}</span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Glowing Payline Side Trackers */}
            <div className="flex justify-between w-full mt-4 border-t border-pink-500/10 pt-3 px-1 text-xs">
              <div className="flex items-center gap-1">
                <span className="text-pink-400">🍬 Active Lines:</span>
                <span className="font-bold text-pink-200 font-mono bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                  {activePaylinesCount} / 5
                </span>
              </div>
              <div className="flex gap-1">
                {PAYLINES.map(line => (
                  <button
                    key={line.id}
                    disabled={spinning || freeSpinsRemaining > 0}
                    onClick={() => {
                      if (activePaylinesCount === line.id) {
                        setActivePaylinesCount(Math.max(1, line.id - 1));
                      } else {
                        setActivePaylinesCount(line.id);
                      }
                      playCandySound('stop', isMuted);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition-all ${
                      line.id <= activePaylinesCount
                        ? 'bg-pink-500/20 border-pink-500/40 text-pink-300 shadow-sm shadow-pink-500/10'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:bg-zinc-800/40'
                    }`}
                  >
                    L{line.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Slot Control Dashboard */}
        <div className="flex flex-col justify-between bg-pink-950/20 border border-pink-500/20 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div>
            {/* Chips Ledger */}
            <div className="bg-pink-900/20 border border-pink-500/10 rounded-2xl p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-pink-500/10 rounded-xl">
                  <Coins className="w-5 h-5 text-pink-400 animate-bounce" />
                </div>
                <div>
                  <p className="text-[10px] text-pink-400 uppercase tracking-widest font-mono">Available Balance</p>
                  <p className="text-xl font-black text-pink-100 font-mono mt-0.5">{chips.toLocaleString()}</p>
                </div>
              </div>
              <span className="bg-pink-500/10 text-pink-300 border border-pink-500/30 text-[10px] px-2 py-0.5 rounded font-mono">CHIPS</span>
            </div>

            {/* Free Spins Total Won Tracker */}
            {freeSpinsRemaining > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 mb-4 text-center">
                <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest leading-none">FREE SPINS BONUS ACCUMULATOR</p>
                <p className="text-xl font-bold text-red-300 font-mono mt-1.5">+{freeSpinsTotalWon.toLocaleString()} Chips</p>
                <p className="text-[10px] text-red-400/70 mt-1">{freeSpinsRemaining} Free Spins Remaining</p>
              </div>
            )}

            {/* Wager Setting */}
            <div className="space-y-3.5 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-pink-300 font-medium flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                  Line Bet size:
                </span>
                <span className="text-xs font-bold font-mono text-pink-200">{bet} Chips</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[-100, -10, 10, 100].map(val => (
                  <button
                    key={val}
                    disabled={spinning || freeSpinsRemaining > 0}
                    onClick={() => adjustBet(val)}
                    className="py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 active:scale-95 text-pink-300 border border-pink-500/15 text-xs font-mono font-semibold transition-all disabled:opacity-40"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Net Cost per Spin */}
            <div className="border-t border-pink-500/10 pt-4 space-y-2 mb-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-pink-300/60">Total Stake ({activePaylinesCount} Lines × {bet} Chips):</span>
                <span className="font-bold text-pink-200 font-mono">
                  {freeSpinsRemaining > 0 ? 'FREE SPIN' : `${(bet * activePaylinesCount).toLocaleString()} Chips`}
                </span>
              </div>

              {lastWin !== null && (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-pink-500/10">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-pink-300/60 font-bold">Spin Result:</span>
                    <span className={`font-bold font-mono ${lastWin > 0 ? 'text-green-400 text-sm' : 'text-pink-300/40'}`}>
                      {lastWin > 0 ? `+${lastWin.toLocaleString()} Chips` : 'No Match'}
                    </span>
                  </div>

                  {lastWin > 0 && !spinning && (
                    <button
                      onClick={openGambleGame}
                      className="w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-[11px] uppercase tracking-wider animate-bounce hover:brightness-110 flex items-center justify-center gap-1"
                    >
                      🎲 Double-or-Nothing Guessing Gamble!
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Mode Switchers */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsFastMode(!isFastMode)}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isFastMode 
                    ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-md shadow-pink-500/10' 
                    : 'bg-pink-900/10 border-pink-500/10 text-pink-400 hover:bg-pink-950/30'
                }`}
              >
                ⚡ Turbo Mode: {isFastMode ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => {
                  setAutoSpinActive(!autoSpinActive);
                  playCandySound('lever', isMuted);
                }}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  autoSpinActive 
                    ? 'bg-fuchsia-600/30 border-fuchsia-500 text-fuchsia-300 shadow-md shadow-fuchsia-500/10' 
                    : 'bg-pink-900/10 border-pink-500/10 text-pink-400 hover:bg-pink-950/30'
                }`}
              >
                🔄 Auto Spin: {autoSpinActive ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* SPIN BUTTON */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              className={`w-full py-4 rounded-2xl font-black text-lg tracking-wider uppercase transition-all relative overflow-hidden active:scale-95 ${
                spinning
                  ? 'bg-pink-950/60 border border-pink-500/20 text-pink-500 cursor-not-allowed shadow-inner'
                  : 'bg-gradient-to-r from-pink-500 via-fuchsia-500 to-rose-500 text-white shadow-xl shadow-pink-500/25 hover:shadow-pink-500/40 border border-pink-400/30 cursor-pointer hover:brightness-110'
              }`}
            >
              {spinning ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sifting Sugar...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Play className="w-5 h-5 fill-white" />
                  {freeSpinsRemaining > 0 ? 'Free Spin!' : 'Spin Candy!'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Interactive Fortune Wheel Game */}
      <AnimatePresence>
        {bonusWheelActive && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-pink-900 via-purple-950 to-pink-950 border-4 border-pink-400/50 rounded-3xl p-6 max-w-md w-full text-center relative overflow-hidden"
            >
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-fuchsia-200 to-yellow-300 uppercase tracking-tight mb-2">
                🍬 Sugar Rush Fortune Wheel! 🍬
              </h3>
              <p className="text-xs text-pink-200/70 mb-6">Your loyalty meter is full! Spin for premium multipliers!</p>

              {/* Graphical Fortune Wheel */}
              <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
                {/* Pointer Indicator */}
                <div className="absolute top-0 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-yellow-400 z-30 drop-shadow-md" />
                
                <motion.div
                  className="w-full h-full rounded-full border-8 border-pink-400 shadow-2xl relative overflow-hidden"
                  style={{
                    backgroundImage: `conic-gradient(
                      from 0deg,
                      #ec4899 0deg 45deg,
                      #f59e0b 45deg 90deg,
                      #8b5cf6 90deg 135deg,
                      #10b981 135deg 180deg,
                      #f43f5e 180deg 225deg,
                      #d946ef 225deg 270deg,
                      #3b82f6 270deg 315deg,
                      #eab308 315deg 360deg
                    )`,
                  }}
                  animate={{ rotate: wheelRotation }}
                  transition={wheelSpinning ? { duration: 4, ease: [0.12, 0.8, 0.15, 1] } : { duration: 0 }}
                >
                  {/* Visual Slices Text */}
                  {[
                    '500 CHIPS', '2x BET', '1K CHIPS', '5x BET',
                    '2K CHIPS', '10x BET', '5K COINS', 'FREE SPIN'
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

                {/* Center Core Button */}
                <div className="absolute w-16 h-16 rounded-full bg-white border-4 border-pink-500 flex items-center justify-center shadow-lg z-20">
                  <span className="text-xl">🍭</span>
                </div>
              </div>

              {wheelResult && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-pink-900/40 border border-pink-500/30 p-3 rounded-2xl mb-4 text-center"
                >
                  <p className="text-[10px] text-pink-300 uppercase tracking-widest font-mono">SWEET PRIZE UNLOCKED</p>
                  <p className="text-xl font-bold text-yellow-400 font-sans">{wheelResult}</p>
                </motion.div>
              )}

              <div className="flex gap-2">
                <button
                  disabled={wheelSpinning}
                  onClick={handleSpinBonusWheel}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-40"
                >
                  {wheelSpinning ? 'SPINNING...' : '🍭 SPIN FOR GOLD! 🍭'}
                </button>
                
                {(!wheelSpinning && wheelResult) && (
                  <button
                    onClick={() => setBonusWheelActive(false)}
                    className="px-6 py-3.5 rounded-2xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase transition-all"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Guessing Gamble Card Game */}
      <AnimatePresence>
        {gambleActive && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-sans backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-zinc-900 via-pink-950 to-zinc-950 border-4 border-pink-500/40 rounded-3xl p-6 max-w-sm w-full text-center relative overflow-hidden"
            >
              <h3 className="text-xl font-bold text-pink-300 uppercase tracking-wide mb-1 flex items-center justify-center gap-1.5">
                🍓 Sweet Gamble Card Guess!
              </h3>
              <p className="text-xs text-pink-200/60 mb-5">Guess next Card flavor color to DOUBLE your current prize!</p>

              {/* Active Gambled Chips */}
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-3 mb-5">
                <p className="text-[9px] text-pink-400 font-mono uppercase tracking-widest leading-none">CURRENT GAMBLE VALUE</p>
                <p className="text-2xl font-black text-yellow-400 font-mono mt-1.5">{gambleAmount.toLocaleString()} CHIPS</p>
                <p className="text-[9px] text-pink-200/60 mt-1 uppercase font-mono">Guessed Correctly: {gambleCount} Stages</p>
              </div>

              {/* Interactive Card Board */}
              <div className="h-44 flex items-center justify-center mb-6">
                <AnimatePresence mode="wait">
                  {gambleCard ? (
                    <motion.div
                      key={gambleCard.emoji}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      className={`w-28 h-40 rounded-2xl border-4 bg-zinc-900/90 flex flex-col items-center justify-center shadow-2xl relative ${
                        gambleCard.color === 'red' ? 'border-pink-500 text-pink-400' : 'border-zinc-500 text-zinc-300'
                      }`}
                    >
                      <span className="text-3xl mb-1">{gambleCard.color === 'red' ? '🍓' : '🍫'}</span>
                      <p className="text-xs font-bold leading-none uppercase mt-2">{gambleCard.value}</p>
                      <p className="text-[9px] text-zinc-500 font-mono mt-1 leading-none">{gambleCard.emoji}</p>
                    </motion.div>
                  ) : (
                    <motion.div className="w-28 h-40 rounded-2xl border-4 border-pink-500/20 bg-pink-900/20 flex flex-col items-center justify-center shadow-2xl animate-pulse">
                      <span className="text-3xl text-pink-400">❓</span>
                      <p className="text-[10px] text-pink-300 font-bold uppercase mt-2">SUGAR CARD</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-3">
                {gambleAmount > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleGambleGuess('red')}
                      className="py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-500 active:scale-95 text-white font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1 shadow-lg shadow-pink-600/20"
                    >
                      <span className="text-lg">🍓</span>
                      Red Syrup
                    </button>
                    <button
                      onClick={() => handleGambleGuess('black')}
                      className="py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-black uppercase tracking-wider flex flex-col items-center justify-center gap-1 shadow-lg"
                    >
                      <span className="text-lg">🍫</span>
                      Dark Choco
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-red-400 font-bold uppercase animate-pulse">💥 GAMBLE LOST! EXITING...</p>
                )}

                <div className="flex gap-2 border-t border-pink-500/10 pt-4 mt-2">
                  <button
                    disabled={gambleAmount <= 0}
                    onClick={() => {
                      setGambleActive(false);
                      triggerAlert(`Smart Choice! banked +${gambleAmount} Chips securely!`, 'success');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30 font-bold uppercase text-xs transition-all disabled:opacity-40"
                  >
                    🔒 BANK CHIPS
                  </button>
                  <button
                    onClick={() => setGambleActive(false)}
                    className="py-2.5 px-4 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-bold uppercase transition-all"
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
