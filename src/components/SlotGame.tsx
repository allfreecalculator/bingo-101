import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Sparkles, RefreshCw, HelpCircle, Trophy, Volume2, VolumeX, Zap, Hand, Play, Square } from 'lucide-react';

interface SlotGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

const REEL_SYMBOLS = [
  { char: 'CHERRY', weight: 15, name: 'Cherry', mult: 3, color: 'text-rose-400', emoji: '🍒' },
  { char: 'LEMON', weight: 15, name: 'Lemon', mult: 4, color: 'text-amber-300', emoji: '🍋' },
  { char: 'PLUM', weight: 12, name: 'Plum/Grape', mult: 5, color: 'text-purple-400', emoji: '🍇' },
  { char: 'BAR', weight: 10, name: 'BAR', mult: 8, color: 'text-cyan-400', emoji: '➖' },
  { char: 'BELL', weight: 8, name: 'Bell', mult: 12, color: 'text-yellow-400', emoji: '🔔' },
  { char: 'DIAMOND', weight: 5, name: 'Diamond', mult: 25, color: 'text-cyan-400', emoji: '💎' },
  { char: '7', weight: 3, name: 'Lucky 7', mult: 50, color: 'text-red-500', emoji: '7️⃣' },
  { char: 'DOLLAR', weight: 2, name: 'Golden Dollar', mult: 100, color: 'text-yellow-500', emoji: '💲' }
];

const SPINNING_SYMBOLS = ['CHERRY', 'LEMON', 'PLUM', 'BAR', 'BELL', 'DIAMOND', '7', 'DOLLAR', 'CHERRY', 'LEMON', 'PLUM', 'BAR', 'BELL', 'DIAMOND', '7', 'DOLLAR'];

const renderSlotSymbol = (symbol: string, isMiddle: boolean = false) => {
  const scaleClass = isMiddle ? 'scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]' : 'scale-90 opacity-40';
  
  switch (symbol) {
    case '7':
      return (
        <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
          <div className="absolute inset-0 bg-red-600/30 rounded-full blur-md animate-pulse" />
          <svg className="w-11 h-11 filter drop-shadow-[0_2px_8px_rgba(239,68,68,0.8)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad7" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="35%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              <linearGradient id="stroke7" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f87171" />
              </linearGradient>
            </defs>
            <path 
              d="M6 4h12l-6 16H8l5-12H6V4z" 
              fill="url(#grad7)" 
              stroke="url(#stroke7)" 
              strokeWidth="1.2" 
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute top-1 right-1 animate-ping">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
          </div>
        </div>
      );

    case 'BAR':
      return (
        <div className={`transition-all duration-300 ${scaleClass}`}>
          <div className="bg-gradient-to-b from-gray-900 via-zinc-950 to-gray-900 border-2 border-cyan-400/80 rounded-lg px-3 py-1 shadow-[0_0_12px_rgba(34,211,238,0.7)] flex flex-col justify-center items-center w-14">
            <span className="text-[8px] font-black tracking-widest text-cyan-400 font-mono leading-none">BAR</span>
            <div className="w-10 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent my-1" />
            <span className="text-[8px] font-black tracking-widest text-cyan-400 font-mono leading-none">BAR</span>
          </div>
        </div>
      );

    case 'BELL':
      return (
        <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-md" />
          <svg className="w-10 h-10 filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.7)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradBell" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="19.5" r="2.5" fill="#ca8a04" stroke="#fef08a" strokeWidth="0.5" />
            <path 
              d="M12 2a5 5 0 00-5 5v5.5L4.5 17h15L17 12.5V7a5 5 0 00-5-5z" 
              fill="url(#gradBell)" 
              stroke="#fef08a" 
              strokeWidth="0.75" 
            />
            <path d="M10 4.5a3 3 0 012-.5" stroke="#ffffff" strokeWidth="0.75" strokeLinecap="round" />
            <rect x="10" y="1" width="4" height="2" rx="1" fill="#a16207" stroke="#fef08a" strokeWidth="0.5" />
          </svg>
        </div>
      );

    case 'CHERRY':
      return (
        <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
          <div className="absolute inset-0 bg-rose-500/25 rounded-full blur-md" />
          <svg className="w-11 h-11 filter drop-shadow-[0_2px_8px_rgba(244,63,94,0.8)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradCherry" x1="0.2" y1="0.2" x2="0.8" y2="0.8">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="35%" stopColor="#f43f5e" />
                <stop offset="85%" stopColor="#be123c" />
                <stop offset="100%" stopColor="#4c0519" />
              </linearGradient>
              <linearGradient id="stemGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#15803d" />
              </linearGradient>
            </defs>
            <path d="M16 3c-1.5 1.5-3.5 5.5-4 9M16 3c-3 1-7.5 4.5-8 9.5" stroke="url(#stemGrad)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 3c-2 .5-3 2.5-3 2.5s2.5.5 3-2.5z" fill="#22c55e" stroke="#15803d" strokeWidth="0.5" />
            <circle cx="7.5" cy="14.5" r="4.5" fill="url(#gradCherry)" stroke="#fda4af" strokeWidth="0.5" />
            <circle cx="6.2" cy="12.5" r="1.2" fill="#ffffff" opacity="0.8" />
            <circle cx="15.5" cy="14" r="4.5" fill="url(#gradCherry)" stroke="#fda4af" strokeWidth="0.5" />
            <circle cx="14.2" cy="12" r="1.2" fill="#ffffff" opacity="0.8" />
          </svg>
        </div>
      );

    case 'DIAMOND':
      return (
        <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
          <div className="absolute inset-0 bg-cyan-500/25 rounded-full blur-md" />
          <svg className="w-11 h-11 filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.8)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradDia1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id="gradDia2" x1="1" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
            </defs>
            <path d="M12 2L4 9l8 13 8-13-8-7z" fill="url(#gradDia1)" />
            <path d="M12 2L8.5 9h7L12 2z" fill="#f0f9ff" opacity="0.8" />
            <path d="M8.5 9L12 22l3.5-13h-7z" fill="url(#gradDia2)" opacity="0.7" />
            <path d="M4 9h4.5L12 22 4 9z" fill="#0284c7" opacity="0.9" />
            <path d="M20 9h-4.5L12 22 20 9z" fill="#0c4a6e" opacity="0.9" />
            <path d="M12 2L4 9l8 13 8-13-8-7z" stroke="#ffffff" strokeWidth="0.5" />
          </svg>
        </div>
      );

    case 'LEMON':
      return (
        <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md" />
          <svg className="w-10 h-10 filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)] rotate-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradLemon" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="40%" stopColor="#fef08a" />
                <stop offset="85%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
            </defs>
            <path 
              d="M21 11.5c.5-1.5-.5-4-3-6.5S13 2 11.5 2.5c-2.5 1-8 6-9 9-.8 2.5.5 6 3 8.5s6.5 3.5 9 2.5c1.1-.5 5.5-6.5 6.5-11z" 
              fill="url(#gradLemon)" 
              stroke="#fef08a" 
              strokeWidth="0.75" 
            />
            <path d="M4.5 16.5c2 2.5 5.5 3.5 8 2.5" stroke="#facc15" strokeWidth="0.75" />
            <circle cx="11.5" cy="11.5" r="5" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 1.5" opacity="0.6" />
            <circle cx="15.5" cy="8" r="1.2" fill="#ffffff" opacity="0.8" />
          </svg>
        </div>
      );

    case 'PLUM':
      return (
        <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
          <div className="absolute inset-0 bg-purple-500/25 rounded-full blur-md" />
          <svg className="w-11 h-11 filter drop-shadow-[0_2px_8px_rgba(168,85,247,0.8)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradPlum" x1="0.2" y1="0.2" x2="0.8" y2="0.8">
                <stop offset="0%" stopColor="#f3e8ff" />
                <stop offset="35%" stopColor="#c084fc" />
                <stop offset="75%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
            </defs>
            <path d="M12 6C11 3.5 8.5 3 8.5 3" stroke="#22c55e" strokeWidth="1.2" />
            <path d="M12 6c1.5-1 3-1 3-1s-1 2-3 1z" fill="#22c55e" />
            <circle cx="12" cy="13.5" r="6" fill="url(#gradPlum)" stroke="#e9d5ff" strokeWidth="0.5" />
            <path d="M12 7.5c-.5 1.5-.5 4.5 0 6" stroke="#581c87" strokeWidth="0.5" opacity="0.5" />
            <circle cx="10" cy="10.5" r="1.3" fill="#ffffff" opacity="0.85" />
          </svg>
        </div>
      );

    case 'DOLLAR':
      return (
        <div className={`relative flex items-center justify-center w-14 h-14 transition-all duration-300 ${scaleClass}`}>
          <div className="absolute inset-0 bg-yellow-500/35 rounded-full blur-md" />
          <svg className="w-11 h-11 filter drop-shadow-[0_0_10px_#eab308] animate-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gradGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="10" fill="url(#gradGold)" stroke="#fef08a" strokeWidth="0.75" />
            <circle cx="12" cy="12" r="8" stroke="#ca8a04" strokeWidth="0.5" strokeDasharray="2 1" />
            <path 
              d="M12 5v14M14.5 8H11a2.5 2.5 0 000 5h2a2.5 2.5 0 010 5H9" 
              stroke="#854d0e" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path d="M5.5 8.5A7.5 7.5 0 0112 4.5" stroke="#ffffff" strokeWidth="0.75" strokeLinecap="round" opacity="0.8" />
          </svg>
        </div>
      );

    default:
      return <span className="text-4xl select-none">{symbol}</span>;
  }
};

const getSymbolEmoji = (symbol: string): string => {
  const sym = REEL_SYMBOLS.find(s => s.char === symbol);
  return sym ? sym.emoji : symbol;
};

export const SlotGame: React.FC<SlotGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [bet, setBet] = useState<number>(20);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [reelsSpinning, setReelsSpinning] = useState<boolean[]>([false, false, false]);
  
  // Custom states requested
  const [isFastMode, setIsFastMode] = useState<boolean>(false);
  const [autoSpinActive, setAutoSpinActive] = useState<boolean>(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(0);

  // Cylindrical reels: each reel displays 3 items vertically (top, middle/payline, bottom)
  const [reels, setReels] = useState<string[][]>([
    ['LEMON', 'CHERRY', 'PLUM'],
    ['CHERRY', 'DIAMOND', 'PLUM'],
    ['PLUM', '7', 'LEMON']
  ]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [leverPulled, setLeverPulled] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [spinHistory, setSpinHistory] = useState<string[]>([]);

  // Safety tracking for staggered / manual stops
  const targetsRef = useRef<string[]>(['LEMON', 'CHERRY', 'PLUM']);
  const stoppedRef = useRef<boolean[]>([true, true, true]);
  const stopTimersRef = useRef<any[]>([]);
  const tickIntervalRef = useRef<any>(null);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      stopTimersRef.current.forEach(t => clearTimeout(t));
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    };
  }, []);

  // Trigger next auto-spin cycle
  useEffect(() => {
    if (autoSpinActive && autoSpinCount > 0 && !spinning) {
      if (chips < bet) {
        triggerAlert('Insufficient chips to continue auto spins!', 'error');
        setAutoSpinActive(false);
        setAutoSpinCount(0);
        return;
      }
      
      const delay = isFastMode ? 300 : 800;
      const timer = setTimeout(() => {
        handleSpin();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoSpinActive, autoSpinCount, spinning, chips, bet, isFastMode]);

  // Web Audio Synth FX Engine
  const playSound = (type: 'pull' | 'tick' | 'win' | 'lose' | 'lever_grab') => {
    if (muted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'lever_grab') {
        // High frequency friction click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.02, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'pull') {
        // Heavy mechanical snap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'tick') {
        // High fidelity reel cog click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } else if (type === 'win') {
        // Happy pentatonic ascending casino ring
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
        });
      } else if (type === 'lose') {
        // Sad retro synth drop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(170, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  // Picker based on weighted items
  const getRandomSymbol = () => {
    const totalWeight = REEL_SYMBOLS.reduce((acc, curr) => acc + curr.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const sym of REEL_SYMBOLS) {
      if (rand < sym.weight) return sym.char;
      rand -= sym.weight;
    }
    return REEL_SYMBOLS[0].char;
  };

  const handleSpin = () => {
    if (spinning) return;
    if (chips < bet) {
      triggerAlert('Insufficient chips to spin the golden reels!', 'error');
      setAutoSpinActive(false);
      setAutoSpinCount(0);
      return;
    }

    // Deduct wager
    onUpdateChips(-bet);
    setSpinning(true);
    setReelsSpinning([true, true, true]);
    stoppedRef.current = [false, false, false];
    setLastWin(null);
    onUpdateTask('play_slots', 1);

    // Audio / Visual triggers
    playSound('pull');
    setLeverPulled(true);
    setTimeout(() => setLeverPulled(false), isFastMode ? 220 : 450);

    // TTS Voice Synthesizer
    if ('speechSynthesis' in window && !muted) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('Spinning!');
        u.volume = 0.15;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }

    // Pre-calculate winning combinations (middle row)
    const target1 = getRandomSymbol();
    const target2 = getRandomSymbol();
    const target3 = getRandomSymbol();
    targetsRef.current = [target1, target2, target3];

    // Clear any previous timers safely
    stopTimersRef.current.forEach(t => clearTimeout(t));
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);

    // Start tick audio feedback interval
    let ticks = 0;
    const maxTicks = isFastMode ? 10 : 22;
    const tickSpeed = isFastMode ? 45 : 90;
    tickIntervalRef.current = setInterval(() => {
      playSound('tick');
      ticks++;
      if (ticks >= maxTicks) clearInterval(tickIntervalRef.current);
    }, tickSpeed);

    // Staggered stop delays based on speed multiplier
    const delay1 = isFastMode ? 300 : 1000;
    const delay2 = isFastMode ? 550 : 1600;
    const delay3 = isFastMode ? 800 : 2200;

    const t1 = setTimeout(() => {
      attemptStopReel(0);
    }, delay1);

    const t2 = setTimeout(() => {
      attemptStopReel(1);
    }, delay2);

    const t3 = setTimeout(() => {
      attemptStopReel(2);
    }, delay3);

    stopTimersRef.current = [t1, t2, t3];
  };

  const attemptStopReel = (reelIdx: number) => {
    if (stoppedRef.current[reelIdx]) return; // Guard against multiple stop triggers (e.g. manual skill stop + scheduled timeout)

    stoppedRef.current[reelIdx] = true;
    setReelsSpinning(prev => {
      const next = [...prev];
      next[reelIdx] = false;
      return next;
    });
    setReels(prev => {
      const next = [...prev];
      next[reelIdx] = [getRandomSymbol(), targetsRef.current[reelIdx], getRandomSymbol()];
      return next;
    });
    playSound('pull');

    // If all three drums are finalized, resolve payout
    if (stoppedRef.current.every(val => val === true)) {
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      finalizeResults(targetsRef.current[0], targetsRef.current[1], targetsRef.current[2]);
    }
  };

  const finalizeResults = (r1: string, r2: string, r3: string) => {
    let multiplier = 0;
    let winMsg = '';

    if (r1 === r2 && r2 === r3) {
      const sym = REEL_SYMBOLS.find(s => s.char === r1);
      multiplier = sym ? sym.mult : 5;
      winMsg = `JACKPOT! Three ${sym?.name || 'matching'} symbols!`;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      const matched = (r1 === r2 || r1 === r3) ? r1 : r2;
      const sym = REEL_SYMBOLS.find(s => s.char === matched);
      multiplier = sym ? Math.max(1.5, Math.round(sym.mult / 3)) : 1.5;
      winMsg = `Nice! Double ${sym?.name || 'matching'} symbols!`;
    }

    if (multiplier > 0) {
      const payout = Math.round(bet * multiplier);
      onUpdateChips(payout);
      setLastWin(payout);
      playSound('win');
      triggerAlert(`🎰 ${winMsg} Won ${payout} Chips!`, 'success');
      
      if (payout >= 150) {
        onUpdateTask('win_big', 1);
      }

      setSpinHistory(prev => [
        `🏆 Won +${payout} Chips (${getSymbolEmoji(r1)}${getSymbolEmoji(r2)}${getSymbolEmoji(r3)})`,
        ...prev
      ].slice(0, 5));

      // Celebration voice readout
      if ('speechSynthesis' in window && !muted) {
        try {
          const u = new SpeechSynthesisUtterance(`Big win! You received ${payout} chips.`);
          u.volume = 0.25;
          u.pitch = 1.1;
          window.speechSynthesis.speak(u);
        } catch (e) {}
      }
    } else {
      setLastWin(0);
      playSound('lose');
      triggerAlert('Reels settled. Better luck on the next pull!', 'info');
      setSpinHistory(prev => [
        `❌ Lost (${getSymbolEmoji(r1)}${getSymbolEmoji(r2)}${getSymbolEmoji(r3)})`,
        ...prev
      ].slice(0, 5));
    }

    setSpinning(false);

    // Auto-spin count decrement handler
    if (autoSpinActive && autoSpinCount > 0) {
      setAutoSpinCount(prev => {
        const next = prev - 1;
        if (next === 0) {
          setAutoSpinActive(false);
          triggerAlert('Auto spins completed!', 'success');
        }
        return next;
      });
    }
  };

  const adjustBet = (amount: number) => {
    if (spinning) return;
    setBet(prev => Math.max(5, prev + amount));
  };

  const startAutoSpin = (count: number) => {
    if (spinning) return;
    if (chips < bet) {
      triggerAlert('Insufficient chips to start auto spins!', 'error');
      return;
    }
    setAutoSpinActive(true);
    setAutoSpinCount(count);
    handleSpin();
  };

  const stopAutoSpin = () => {
    setAutoSpinActive(false);
    setAutoSpinCount(0);
    triggerAlert('Auto spin stopped', 'info');
  };

  return (
    <div className="bg-[#0b0b1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative backing glow */}
      <div className="absolute top-0 right-0 w-52 h-52 bg-gradient-to-tr from-amber-500/10 to-yellow-500/5 rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Header Panel */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black uppercase font-mono tracking-widest px-3 py-1 rounded-full shadow-lg">
            Las Vegas Golden Reels
          </span>
          <h3 className="text-xl font-black tracking-tight text-white mt-2 flex items-center gap-2">
            🎰 Vegas Golden Reels
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">Classic 3-drum mechanical slot simulator with skill manual stops & turbo spin</p>
        </div>

        <div className="flex gap-2">
          {/* Audio speaker toggle button */}
          <button
            onClick={() => setMuted(!muted)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
            title={muted ? 'Unmute Audio FX' : 'Mute Audio FX'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
          </button>

          <button
            onClick={() => setShowPaytable(!showPaytable)}
            className="p-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-xs flex items-center gap-1.5 font-mono font-bold"
            title="View Paytable Rules"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>PAYTABLE</span>
          </button>
        </div>
      </div>

      {/* Elegant Paytable Overlay */}
      <AnimatePresence>
        {showPaytable && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-black/40 border border-amber-400/20 rounded-2xl text-xs space-y-2 text-white/80 backdrop-blur-md">
              <div className="flex justify-between font-black border-b border-white/10 pb-1 text-amber-400">
                <span>Symbol Stack</span>
                <span>Payout (3 of a kind)</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 font-mono text-[11px] pt-1.5">
                {REEL_SYMBOLS.map(sym => (
                  <React.Fragment key={sym.char}>
                    <div className="flex items-center gap-2">
                      <div className="scale-75 flex items-center justify-center -ml-2 w-10 h-10">
                        {renderSlotSymbol(sym.char, true)}
                      </div>
                      <span className="font-bold text-white/80">{sym.name}</span>
                    </div>
                    <div className="text-right text-emerald-400 font-extrabold">{sym.mult}x Wager</div>
                  </React.Fragment>
                ))}
              </div>
              <p className="text-[9px] text-white/40 pt-2 border-t border-white/5 leading-relaxed">
                * Note: Matching double symbols (2 identical drums) award a consolidated multiplier calculated as roughly 1/3 of the 3-of-a-kind payout!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slots Physical Cabinet Frame */}
      <div className="bg-[#050510] border-2 border-zinc-800 rounded-3xl p-5 shadow-[inset_0_4px_20px_rgba(0,0,0,0.9),0_10px_30px_rgba(0,0,0,0.5)] relative flex items-center justify-between gap-5 overflow-hidden">
        
        {/* Payline Indicators on left & right margins without physical neon dots */}
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
          <span className="text-[7px] font-mono font-black text-white/30 tracking-wider rotate-180 write-vertical">WINLINE</span>
        </div>
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
          <span className="text-[7px] font-mono font-black text-white/30 tracking-wider write-vertical">WINLINE</span>
        </div>

        {/* 3 Mechanical drum reels */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm relative bg-[#04040a] p-3 rounded-2xl border border-white/5 shadow-inner">
          
          {/* Glowing central WINLINE bar background */}
          <div className="absolute inset-x-0 top-[37%] h-20 bg-amber-400/5 border-y border-dashed border-amber-400/20 pointer-events-none z-10 flex items-center justify-between px-2">
            <span className="text-[6px] font-bold text-amber-400/30 font-mono tracking-widest">PAYLINE</span>
            <span className="text-[6px] font-bold text-amber-400/30 font-mono tracking-widest">PAYLINE</span>
          </div>

          {reels.map((reelSymbols, reelIdx) => (
            <div
              key={reelIdx}
              onClick={() => attemptStopReel(reelIdx)}
              className={`bg-[#0f0f26]/80 border border-white/5 rounded-xl h-[170px] flex flex-col items-center justify-between py-2 relative overflow-hidden shadow-[inset_0_4px_15px_rgba(0,0,0,0.85)] select-none transition-all ${
                reelsSpinning[reelIdx] ? 'cursor-pointer hover:border-amber-400/50 hover:bg-[#151535]' : ''
              }`}
              title={reelsSpinning[reelIdx] ? "Tap to Stop (Manual Override)" : undefined}
            >
              {/* Spherical top/bottom cylinder shading */}
              <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#04040a] to-transparent pointer-events-none z-10" />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#04040a] to-transparent pointer-events-none z-10" />

              {/* Ticker reels column items */}
              {reelsSpinning[reelIdx] ? (
                <>
                  <div className="flex flex-col items-center animate-reel-scroll filter blur-[2px] h-[340px] w-full justify-around select-none">
                    {SPINNING_SYMBOLS.map((sym, idx) => (
                      <div key={idx} className="flex items-center justify-center h-12">
                        {renderSlotSymbol(sym, true)}
                      </div>
                    ))}
                  </div>
                  {/* Skill manual-stop interactive overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity duration-150 z-20">
                    <Hand className="w-5 h-5 text-amber-400 animate-bounce" />
                    <span className="text-[8px] font-mono font-black text-amber-300 tracking-wider">STOP REEL</span>
                  </div>
                </>
              ) : (
                reelSymbols.map((symbol, symbolIdx) => {
                  const isMiddle = symbolIdx === 1;
                  return (
                    <motion.div
                      key={`${reelIdx}-${symbolIdx}`}
                      initial={{ y: -15, opacity: isMiddle ? 1 : 0.25 }}
                      animate={{ y: 0, opacity: isMiddle ? 1 : 0.25, scale: isMiddle ? 1.2 : 0.8 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                      className={`flex items-center justify-center h-12 transition-all ${
                        isMiddle 
                          ? 'font-black filter drop-shadow-[0_2px_10px_rgba(251,191,36,0.35)] relative z-20 scale-110' 
                          : 'blur-[0.5px] scale-90'
                      }`}
                    >
                      {renderSlotSymbol(symbol, isMiddle)}
                    </motion.div>
                  );
                })
              )}
            </div>
          ))}
        </div>

        {/* Physical Mechanical Lever Arm widget - fully draggable for manual feel */}
        <div className="hidden sm:flex flex-col items-center justify-center w-12 h-[170px] relative bg-black/40 rounded-2xl border border-white/5 p-1 flex-shrink-0">
          <div className="absolute top-4 bottom-4 w-1 bg-zinc-800 rounded-full border border-zinc-700 shadow-inner" />
          
          {/* Handle pivot base */}
          <div className="absolute bottom-4 w-6 h-4 bg-zinc-700 border border-zinc-600 rounded-md z-10" />

          {/* Lever handle shaft and knob */}
          <motion.div
            drag={spinning ? false : "y"}
            dragConstraints={{ top: 0, bottom: 85 }}
            dragElastic={0.15}
            onDragStart={() => playSound('lever_grab')}
            onDragEnd={(event, info) => {
              if (info.offset.y > 45 && !spinning) {
                handleSpin();
              }
            }}
            animate={leverPulled ? { y: [0, 85, 0] } : { y: 0 }}
            transition={leverPulled ? { duration: isFastMode ? 0.22 : 0.45, ease: 'easeInOut' } : { type: 'spring', stiffness: 350, damping: 18 }}
            className={`absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center origin-bottom z-20 ${
              spinning ? 'cursor-not-allowed opacity-40' : 'cursor-grab active:cursor-grabbing hover:scale-105'
            }`}
            style={{ y: 0 }}
            title={spinning ? "Locked while spinning" : "Pull with your hand to Spin!"}
          >
            {/* Glossy red ball knob with hover effect */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 border border-red-700 shadow-[0_0_12px_rgba(239,68,68,0.6)] hover:shadow-[0_0_16px_rgba(239,68,68,0.8)] active:scale-90 transition-transform" />
            {/* Metallic handle rod */}
            <div className="w-1.5 h-16 bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 border-x border-zinc-600 rounded-b-md shadow-md" />
          </motion.div>
          <span className="absolute bottom-1.5 text-[6px] font-mono text-white/30 tracking-widest uppercase font-black">PULL</span>
        </div>
      </div>

      {/* Custom Speed & Auto Controls Panel requested by user */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
        
        {/* Speed Selector Panel (2x Turbo Speed Option) */}
        <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1 font-bold">
              Spin Speed Option
            </span>
            <span className="text-[11px] text-white/75 font-semibold flex items-center gap-1">
              {isFastMode ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Turbo Mode (2x Fast Speed)</span>
                </>
              ) : (
                <>
                  <span className="text-white/40">🐢</span>
                  <span>Classic Mechanical Speed</span>
                </>
              )}
            </span>
          </div>
          <button
            onClick={() => setIsFastMode(!isFastMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              isFastMode 
                ? 'bg-amber-400 text-black border-amber-400 hover:bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Zap className={`w-3 h-3 ${isFastMode ? 'fill-black' : ''}`} />
            <span>{isFastMode ? '⚡ FAST' : '2X FAST'}</span>
          </button>
        </div>

        {/* Auto-Spin Segmented Panel (10, 20, 50, 100, 250, 1000) */}
        <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1.5">
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider font-bold flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-white/40 text-transparent" />
              Auto Spins Controller
            </span>
            {autoSpinActive && (
              <span className="text-[10px] font-mono text-emerald-400 font-bold animate-pulse flex items-center gap-1">
                <span>● Running</span>
                <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-300">{autoSpinCount} left</span>
              </span>
            )}
          </div>
          
          {autoSpinActive ? (
            <button
              onClick={stopAutoSpin}
              className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Square className="w-3 h-3 fill-red-400 text-transparent" />
              <span>STOP AUTO SPIN</span>
            </button>
          ) : (
            <div className="flex gap-1">
              {[10, 20, 50, 100, 250, 1000].map(count => (
                <button
                  key={count}
                  onClick={() => startAutoSpin(count)}
                  disabled={spinning}
                  className="flex-1 py-1.5 bg-white/5 hover:bg-amber-400/25 border border-white/10 text-white/80 hover:text-amber-300 font-mono text-[10px] font-black rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title={`Run ${count} Auto Spins`}
                >
                  {count}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Outcome Banner */}
      <div className="mt-4 text-center min-h-[44px] flex items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {lastWin !== null && (
            <motion.div
              key={lastWin}
              initial={{ scale: 0.9, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -5 }}
              className={`px-5 py-2 rounded-2xl text-xs font-mono font-bold border ${
                lastWin > 0 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-white/5 border-white/5 text-white/30'
              }`}
            >
              {lastWin > 0 ? (
                <span className="flex items-center gap-2 justify-center">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400 animate-bounce" /> 
                  WINNER! Received +{lastWin} Chips!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 justify-center">
                  House Kept Wager. Spin again!
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Activity Log Panel */}
      {spinHistory.length > 0 && (
        <div className="mt-4 bg-black/20 rounded-xl p-3 border border-white/5 text-center relative z-10">
          <span className="block text-[8px] font-mono text-white/30 uppercase tracking-widest font-black mb-2">
            Reel Outcome Log
          </span>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {spinHistory.map((hist, idx) => (
              <span 
                key={idx} 
                className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/70 font-mono text-[9px] rounded-lg font-bold shadow-sm"
              >
                {hist}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Betting Controls Dashboard */}
      <div className="mt-5 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Wager Chips
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustBet(-10)}
                disabled={spinning || bet <= 10}
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                -10
              </button>
              <span className="w-16 text-center font-mono font-black text-amber-400 text-sm flex items-center justify-center gap-0.5">
                <Coins className="w-3.5 h-3.5" />
                {bet}
              </span>
              <button
                onClick={() => adjustBet(10)}
                disabled={spinning || bet >= 500}
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                +10
              </button>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1 font-bold">
              Potential Jackpot
            </span>
            <div className="text-[11px] text-white/60 font-medium">
              Up To <span className="text-emerald-400 font-mono font-black">{(bet * 50)}</span> chips
            </div>
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          type="button"
          className={`w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer ${
            spinning ? 'brightness-75 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
          {spinning ? 'PULLING HANDLE...' : 'SPIN THE REELS'}
        </button>
      </div>
    </div>
  );
};
