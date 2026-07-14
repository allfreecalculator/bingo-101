import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, 
  Coins, 
  Clock, 
  Calendar, 
  Sparkles, 
  Check, 
  Tv, 
  MessageSquare, 
  Twitter, 
  Share2, 
  Award, 
  HelpCircle, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Trophy
} from 'lucide-react';
import { PlayerProfile, DailyTask } from '../types';
import { DailyTasks } from './DailyTasks';

interface EarnChipsProps {
  profile: PlayerProfile;
  onAddChips: (amount: number, description?: string) => void;
  triggerAlert: (text: string, type?: 'success' | 'error' | 'info') => void;
  tasks: DailyTask[];
  onClaimTask: (taskId: string) => void;
  onAddTask?: (title: string, description: string, target: number, reward: number, icon: string) => void;
  onProgressTask?: (taskId: string, increment: number) => void;
}

const TRIVIA_QUESTIONS = [
  {
    id: 1,
    question: "In classical 75-Ball Bingo, what range of numbers corresponds to the letter 'B'?",
    options: ["1 to 15", "16 to 30", "31 to 45", "46 to 60"],
    correct: 0,
    prize: 100
  },
  {
    id: 2,
    question: "What are the odds of rolling a total of 7 when throwing two standard 6-sided dice?",
    options: ["1 in 12", "1 in 6", "1 in 36", "1 in 8"],
    correct: 1,
    prize: 120
  },
  {
    id: 3,
    question: "In standard Blackjack, what is the payout ratio for hit on a Natural Blackjack?",
    options: ["1 to 1", "3 to 2", "2 to 1", "5 to 1"],
    correct: 1,
    prize: 100
  },
  {
    id: 4,
    question: "In classical 75-Ball Bingo, which letter contains the center 'FREE' square?",
    options: ["B", "I", "N", "G"],
    correct: 2,
    prize: 80
  },
  {
    id: 5,
    question: "In Roulette, how many green pockets exist on a standard double-zero (American) wheel?",
    options: ["1 pocket", "2 pockets", "3 pockets", "0 pockets"],
    correct: 1,
    prize: 150
  }
];

const PROGRESSIVE_STEPS = [
  { step: 0, label: '1st Spin', cooldownAfter: 300, displayCooldown: '5 Min' },
  { step: 1, label: '2nd Spin', cooldownAfter: 1800, displayCooldown: '30 Min' },
  { step: 2, label: '3rd Spin', cooldownAfter: 7200, displayCooldown: '2 Hours' },
  { step: 3, label: '4th Spin', cooldownAfter: 28800, displayCooldown: '8 Hours' },
  { step: 4, label: '5th Spin', cooldownAfter: 57600, displayCooldown: '16 Hours' },
  { step: 5, label: '6th Spin', cooldownAfter: 0, displayCooldown: 'Start Over' }
];

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

const getSectorPath = (index: number, total: number, cx: number, cy: number, r: number) => {
  const angle = 360 / total;
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

export const EarnChips: React.FC<EarnChipsProps> = ({ 
  profile, 
  onAddChips, 
  triggerAlert,
  tasks,
  onClaimTask,
  onAddTask,
  onProgressTask
}) => {
  // --- Daily Check-In State ---
  const [lastCheckIn, setLastCheckIn] = useState<string>(() => {
    return localStorage.getItem('earn_last_checkin') || '';
  });
  const [checkInStreak, setCheckInStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('earn_checkin_streak') || '0', 10);
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const checkedInToday = lastCheckIn === todayStr;

  const DAILY_REWARDS = [100, 150, 200, 250, 350, 500, 1000];

  const handleDailyCheckIn = () => {
    if (checkedInToday) {
      triggerAlert("You have already checked in today! Come back tomorrow.", "error");
      return;
    }

    // Determine new streak
    let newStreak = checkInStreak + 1;
    if (newStreak > 7) {
      newStreak = 1; // restart streak after 7 days
    }

    const reward = DAILY_REWARDS[newStreak - 1];
    setLastCheckIn(todayStr);
    setCheckInStreak(newStreak);
    localStorage.setItem('earn_last_checkin', todayStr);
    localStorage.setItem('earn_checkin_streak', newStreak.toString());

    onAddChips(reward, `Daily Check-In Reward (Day ${newStreak})`);
    triggerAlert(`Claimed Day ${newStreak} check-in bonus of +${reward} Chips! 🎁`, "success");

    // Audio sound simulation
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {}
  };

  // --- Hourly Faucet State ---
  const [faucetCooldown, setFaucetCooldown] = useState<number>(0);
  const FAUCET_COOLDOWN_SEC = 3600; // 1 Hour

  useEffect(() => {
    const lastClaim = localStorage.getItem('earn_last_faucet_claim');
    if (lastClaim) {
      const elapsed = Math.floor((Date.now() - parseInt(lastClaim, 10)) / 1000);
      if (elapsed < FAUCET_COOLDOWN_SEC) {
        setFaucetCooldown(FAUCET_COOLDOWN_SEC - elapsed);
      }
    }
  }, []);

  useEffect(() => {
    if (faucetCooldown > 0) {
      const interval = setInterval(() => {
        setFaucetCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [faucetCooldown]);

  const handleFaucetClaim = () => {
    if (faucetCooldown > 0) {
      triggerAlert("Faucet is cooling down. Wait for the timer!", "error");
      return;
    }

    const faucetReward = 150;
    const now = Date.now();
    localStorage.setItem('earn_last_faucet_claim', now.toString());
    setFaucetCooldown(FAUCET_COOLDOWN_SEC);

    onAddChips(faucetReward, "Hourly Casino Faucet Claim");
    triggerAlert(`Hourly Faucet Claimed! Added +${faucetReward} Chips! ⚡`, "success");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Lucky Fortune Wheel State ---
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelPrize, setWheelPrize] = useState<string | null>(null);
  const [wheelCooldown, setWheelCooldown] = useState(0); // seconds left
  const [spinHistory, setSpinHistory] = useState<string[]>([]);
  
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

  // Tick down wheel cooldown
  useEffect(() => {
    if (wheelCooldown > 0) {
      const timer = setTimeout(() => setWheelCooldown(wheelCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [wheelCooldown]);

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
      
      onAddChips(prize.value, `Lucky Fortune Wheel: Won ${prize.label}`);
      triggerAlert(`Added ${prize.value} chips from Lucky Wheel! 🎯`, 'success');
      setSpinHistory(prev => [prize.label, ...prev].slice(0, 5));
      
      // Update progressive step sequence
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

  // --- Vegas Scratchers Cooldown ---
  const [scratcherCooldown, setScratcherCooldown] = useState<number>(0);
  const SCRATCHER_COOLDOWN_SEC = 300; // 5 mins
  const [scratcherCells, setScratcherCells] = useState<{ id: number; symbol: string; revealed: boolean }[]>([]);
  const [scratchWinAmount, setScratchWinAmount] = useState<number | null>(null);
  const [hasScratchedAll, setHasScratchedAll] = useState(false);

  const SYMBOLS = ['🎰', '🍒', '💎', '👑', '🍀', '💰'];

  useEffect(() => {
    const lastScratch = localStorage.getItem('earn_last_scratcher_claim');
    if (lastScratch) {
      const elapsed = Math.floor((Date.now() - parseInt(lastScratch, 10)) / 1000);
      if (elapsed < SCRATCHER_COOLDOWN_SEC) {
        setScratcherCooldown(SCRATCHER_COOLDOWN_SEC - elapsed);
      }
    }
  }, []);

  useEffect(() => {
    if (scratcherCooldown > 0) {
      const interval = setInterval(() => {
        setScratcherCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [scratcherCooldown]);

  const generateScratcher = () => {
    if (scratcherCooldown > 0) return;

    // Pick a winning structure randomly (30% chance of triple match, otherwise mixed)
    const isWinner = Math.random() < 0.45;
    let pool: string[] = [];
    if (isWinner) {
      const winningSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      pool = [winningSym, winningSym, winningSym];
    } else {
      // Pick 3 random, distinct symbols
      const shuffled = [...SYMBOLS].sort(() => Math.random() - 0.5);
      pool = shuffled.slice(0, 3);
    }

    const cells = pool.map((sym, idx) => ({
      id: idx,
      symbol: sym,
      revealed: false
    }));

    setScratcherCells(cells);
    setScratchWinAmount(null);
    setHasScratchedAll(false);
  };

  // Generate initial card on mount
  useEffect(() => {
    if (scratcherCooldown === 0 && scratcherCells.length === 0) {
      generateScratcher();
    }
  }, [scratcherCooldown, scratcherCells.length]);

  const handleRevealCell = (cellId: number) => {
    if (scratcherCooldown > 0 || hasScratchedAll) return;

    setScratcherCells(prev => {
      const updated = prev.map(c => c.id === cellId ? { ...c, revealed: true } : c);
      
      // If all elements are now revealed
      const allRevealed = updated.every(c => c.revealed);
      if (allRevealed) {
        setHasScratchedAll(true);
        // Calculate Win
        const first = updated[0].symbol;
        const matchedAll = updated.every(c => c.symbol === first);
        
        let prize = 35; // Consolation prize for participating
        if (matchedAll) {
          if (first === '💎') prize = 350;
          else if (first === '👑') prize = 250;
          else if (first === '💰') prize = 200;
          else prize = 150;
        }

        setScratchWinAmount(prize);
        onAddChips(prize, `Free Scratcher: Revealed ${updated.map(u => u.symbol).join(' ')}`);
        
        if (matchedAll) {
          triggerAlert(`MEGA MATCH! You scratched 3x ${first} and won +${prize} Chips! 💎`, "success");
        } else {
          triggerAlert(`Scratch Card complete! Won consolation reward: +${prize} Chips!`, "info");
        }

        // Set cooldown
        const now = Date.now();
        localStorage.setItem('earn_last_scratcher_claim', now.toString());
        setScratcherCooldown(SCRATCHER_COOLDOWN_SEC);
      }
      return updated;
    });
  };

  // --- Trivia Challenge State ---
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [triviaCooldown, setTriviaCooldown] = useState<number>(0);
  const TRIVIA_COOLDOWN_SEC = 240; // 4 mins

  useEffect(() => {
    const lastTrivia = localStorage.getItem('earn_last_trivia_claim');
    if (lastTrivia) {
      const elapsed = Math.floor((Date.now() - parseInt(lastTrivia, 10)) / 1000);
      if (elapsed < TRIVIA_COOLDOWN_SEC) {
        setTriviaCooldown(TRIVIA_COOLDOWN_SEC - elapsed);
      }
    }
    // Set random question
    setCurrentQuestionIdx(Math.floor(Math.random() * TRIVIA_QUESTIONS.length));
  }, []);

  useEffect(() => {
    if (triviaCooldown > 0) {
      const interval = setInterval(() => {
        setTriviaCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [triviaCooldown]);

  const handleAnswerTrivia = (optIdx: number) => {
    if (hasAnswered || triviaCooldown > 0) return;

    setSelectedOption(optIdx);
    setHasAnswered(true);

    const question = TRIVIA_QUESTIONS[currentQuestionIdx];
    const isCorrect = optIdx === question.correct;

    if (isCorrect) {
      onAddChips(question.prize, `Trivia Whiz: Correct answer!`);
      triggerAlert(`CORRECT ANSWER! Added +${question.prize} Chips! 🎓`, "success");
    } else {
      triggerAlert(`Wrong! The correct answer was "${question.options[question.correct]}". Better luck next time!`, "error");
    }

    // Set cooldown
    const now = Date.now();
    localStorage.setItem('earn_last_trivia_claim', now.toString());
    setTriviaCooldown(TRIVIA_COOLDOWN_SEC);
  };

  const handleNextQuestion = () => {
    setHasAnswered(false);
    setSelectedOption(null);
    setCurrentQuestionIdx((currentQuestionIdx + 1) % TRIVIA_QUESTIONS.length);
  };

  // --- Social / Micro Promotion tasks state ---
  const [promoClaims, setPromoClaims] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('earn_promo_claims');
    return saved ? JSON.parse(saved) : {};
  });
  const [activePromoTask, setActivePromoTask] = useState<string | null>(null);
  const [promoTimer, setPromoTimer] = useState<number>(0);

  const PROMO_TASKS = [
    {
      id: 'verify_profile',
      title: 'Verify Casino VIP Status',
      desc: 'Verify details to establish premium level credentials',
      reward: 150,
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      actionLabel: 'Verify Account',
      loadingLabel: 'Verifying Security...',
      duration: 3
    },
    {
      id: 'watch_intro',
      title: 'Watch Bingo 101 Tutorial',
      desc: 'Learn high-tier patterns and automatic stamp tips',
      reward: 200,
      icon: <Tv className="w-5 h-5 text-blue-400" />,
      actionLabel: 'Watch 5s Video Clip',
      loadingLabel: 'Playing Tutorial...',
      duration: 5
    },
    {
      id: 'join_discord',
      title: 'Join Community Hub',
      desc: 'Join active casino discussion channels & lobby codes',
      reward: 120,
      icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
      actionLabel: 'Open Discord Web',
      loadingLabel: 'Joining Server...',
      duration: 3
    },
    {
      id: 'follow_twitter',
      title: 'Follow Vegas Floor Updates',
      desc: 'Get modern alerts on jackpot schedules and high-roller bonuses',
      reward: 120,
      icon: <Twitter className="w-5 h-5 text-sky-400" />,
      actionLabel: 'Follow on Twitter',
      loadingLabel: 'Subscribing Feed...',
      duration: 3
    },
    {
      id: 'share_wa',
      title: 'Invite 101 Apprentices',
      desc: 'Share learning academy features with your lobby buddies',
      reward: 100,
      icon: <Share2 className="w-5 h-5 text-green-400" />,
      actionLabel: 'Generate Invite Link',
      loadingLabel: 'Sharing Invitation...',
      duration: 4
    }
  ];

  const handleStartPromoTask = (taskId: string, duration: number, reward: number) => {
    if (promoClaims[taskId]) return;

    setActivePromoTask(taskId);
    setPromoTimer(duration);

    const interval = setInterval(() => {
      setPromoTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setActivePromoTask(null);
          
          // Complete Task
          const updated = { ...promoClaims, [taskId]: true };
          setPromoClaims(updated);
          localStorage.setItem('earn_promo_claims', JSON.stringify(updated));

          onAddChips(reward, `Completed Promo: ${PROMO_TASKS.find(p => p.id === taskId)?.title}`);
          triggerAlert(`Task Completed successfully! Added +${reward} Chips! 🎉`, "success");

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-amber-500/10 via-[#0a0a1f]/80 to-blue-500/5 border border-white/10 p-5 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left space-y-1">
          <span className="text-[10px] bg-amber-400 text-black font-black uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full">Free Claims</span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">Get Free Chips Center</h2>
          <p className="text-xs text-white/50 max-w-lg leading-relaxed">
            Run low on chips? Complete instant claims, daily sign-ins, daily quests, and spins on the fortune wheel to refuel your Vegas balance absolutely free!
          </p>
        </div>
        <div className="flex items-center gap-2 bg-amber-400/10 px-4 py-2.5 rounded-2xl border border-amber-400/20">
          <Coins className="w-5 h-5 text-amber-400 animate-bounce" />
          <div className="text-left font-mono">
            <span className="block text-[8px] text-white/40 leading-none">YOUR BALANCE</span>
            <span className="text-sm font-black text-amber-400">{profile.chips} CHIPS</span>
          </div>
        </div>
      </div>

      {/* FEATURED SECTION: Lucky Fortune Wheel & Daily Casino Quests Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lucky Fortune Wheel Panel */}
        <div className="lg:col-span-2 bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between h-full">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white/80 uppercase font-sans mb-1 pb-1 flex items-center gap-2 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Lucky Fortune Wheel
            </h3>
            <p className="text-[11px] text-white/50 mb-4 leading-relaxed">
              Short on chips? Take a free spin to win up to <strong className="text-amber-400">500 Chips</strong> instantly!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 my-2">
            <div className="relative w-44 h-44 flex-shrink-0">
              {/* Flashing Pointer Arrow pointing down to top center */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-yellow-400 filter drop-shadow-[0_2px_5px_rgba(234,179,8,0.5)] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-yellow-400 -mt-2 animate-pulse" />
              </div>
              
              {/* Spinning Wheel */}
              <svg viewBox="0 0 216 216" className="w-full h-full select-none overflow-visible">
                <circle cx="108" cy="108" r="100" fill="#04040c" stroke="#1e1e38" strokeWidth="1" />
                <g 
                  style={{ 
                    transform: `rotate(${wheelRotation}deg)`,
                    transformOrigin: '108px 108px',
                    transition: wheelSpinning ? 'transform 4500ms cubic-bezier(0.15, 0.85, 0.2, 1)' : 'transform 100ms ease-out'
                  }}
                >
                  <circle cx="108" cy="108" r="95" fill="#0c0c1e" stroke="#fbbf24" strokeWidth="2" />
                  {SECTORS.map((sec, idx) => {
                    const angle = 360 / SECTORS.length;
                    const pathData = getSectorPath(idx, SECTORS.length, 108, 108, 94);
                    
                    const textAngle = idx * angle - 90;
                    const textRad = (textAngle * Math.PI) / 180;
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
                        />
                        <line 
                          x1="108" 
                          y1="108" 
                          x2={108 + 94 * Math.cos((idx * angle - 90 - angle/2) * Math.PI / 180)}
                          y2={108 + 94 * Math.sin((idx * angle - 90 - angle/2) * Math.PI / 180)}
                          stroke="#050510"
                          strokeWidth="1.5"
                        />
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
                          style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,1))' }}
                        >
                          {sec.label.replace(' Chips', '')}
                        </text>
                      </g>
                    );
                  })}
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
                      {progressiveStep === 5 ? 'Final Spin - starts over after!' : `Next Cooldown will be ${PROGRESSIVE_STEPS[progressiveStep]?.displayCooldown}`}
                    </span>
                  </div>
                )}

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

              {/* Developer Sandbox inside EarnChips for Wheel */}
              <div className="pt-1 border-t border-white/5">
                <div className="flex items-center justify-between px-2 py-1.5 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-left">
                    <span className="block text-[8px] font-mono text-amber-400/80 uppercase font-black tracking-wider">
                      🛠️ Dev Sandbox
                    </span>
                    <span className="block text-[7px] text-white/30 font-mono">Skip wheel cooling cycle</span>
                  </div>
                  <div className="flex gap-1">
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
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Casino Quests Panel */}
        <div className="lg:col-span-1 bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-0 shadow-xl overflow-hidden flex flex-col justify-between h-full">
          <DailyTasks 
            tasks={tasks} 
            onClaimTask={onClaimTask} 
            onAddTask={onAddTask}
            onProgressTask={onProgressTask}
          />
        </div>
      </div>

      {/* Main Grid: Check-in & Faucet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Daily Sign-In Streak Board */}
        <div className="lg:col-span-2 bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" /> 7-Day VIP Check-In Streak
            </h3>
            <p className="text-[11px] text-white/40 font-mono">CLAIM DAILY BONUSES TO BOOST YOUR RETAINED ACCOUNT</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 my-4">
            {DAILY_REWARDS.map((reward, idx) => {
              const day = idx + 1;
              const isClaimed = checkInStreak >= day && (checkedInToday || day < checkInStreak);
              const isCurrentToClaim = !checkedInToday && checkInStreak === day - 1;

              return (
                <div 
                  key={day}
                  className={`relative p-3 rounded-xl border flex flex-col items-center justify-between transition-all h-24 ${
                    isClaimed 
                      ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60 text-emerald-400'
                      : isCurrentToClaim
                        ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-white scale-105 z-10'
                        : 'bg-white/5 border-white/5 text-white/40'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase">Day {day}</span>
                  <div className="my-1 text-center">
                    <span className="text-lg block">
                      {day === 7 ? '🎁' : '🪙'}
                    </span>
                    <span className={`text-xs font-mono font-extrabold ${isCurrentToClaim ? 'text-amber-400' : ''}`}>
                      +{reward}
                    </span>
                  </div>
                  {isClaimed ? (
                    <span className="text-[8px] font-mono uppercase bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 font-bold">Claimed</span>
                  ) : isCurrentToClaim ? (
                    <span className="text-[8px] font-mono uppercase bg-amber-400 text-black px-1.5 py-0.5 rounded font-black animate-pulse">Claim Now</span>
                  ) : (
                    <span className="text-[8px] font-mono uppercase text-white/30">Locked</span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleDailyCheckIn}
            disabled={checkedInToday}
            className={`w-full py-3.5 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 transition-all border cursor-pointer ${
              checkedInToday 
                ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black border-yellow-300 font-extrabold shadow-lg hover:shadow-amber-500/20 active:scale-95'
            }`}
          >
            <Gift className="w-4 h-4" />
            {checkedInToday ? `CLAIMED TODAY (STREAK: ${checkInStreak}/7 DAYS)` : 'CLAIM TODAY\'S CASINO CHIPS'}
          </button>
        </div>

        {/* 2. Hourly Faucet Cabinet */}
        <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" /> Hourly Vegas Faucet
            </h3>
            <p className="text-[11px] text-white/40 font-mono">CLAIM 150 CHIPS ABSOLUTELY FREE EVERY HOUR</p>
          </div>

          <div className="my-6 text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Sparkles className={`w-8 h-8 ${faucetCooldown === 0 ? 'animate-spin' : ''}`} />
            </div>
            {faucetCooldown > 0 ? (
              <div className="space-y-1">
                <span className="block text-2xl font-mono font-black text-white/80 tracking-widest">{formatTime(faucetCooldown)}</span>
                <span className="block text-[9px] font-mono text-white/40 uppercase">Ticking down... See you soon!</span>
              </div>
            ) : (
              <div className="space-y-0.5">
                <span className="block text-sm font-black text-cyan-400 animate-pulse">⚡ FAUCET FUEL CHARGED ⚡</span>
                <span className="block text-[10px] text-white/50 font-mono">Claim 150 simulated chips right now</span>
              </div>
            )}
          </div>

          <button
            onClick={handleFaucetClaim}
            disabled={faucetCooldown > 0}
            className={`w-full py-3.5 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-2 transition-all border cursor-pointer ${
              faucetCooldown > 0
                ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed font-mono'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black border-cyan-300 font-extrabold shadow-lg hover:shadow-cyan-500/20 active:scale-95'
            }`}
          >
            <Clock className="w-4 h-4" />
            {faucetCooldown > 0 ? `LOCKED (${formatTime(faucetCooldown)})` : 'DRAIN HOURLY FAUCET (+150)'}
          </button>
        </div>
      </div>

      {/* Second Grid: Scratcher & Trivia Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. Vegas Free Scratcher Card */}
        <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" /> Free Vegas Scratch Card
            </h3>
            <p className="text-[11px] text-white/40 font-mono">REVEAL 3 MATCHING SYMBOLS. REFRESHES EVERY 5 MINS.</p>
          </div>

          {/* Interactive Scratcher Slate */}
          <div className="my-5 p-4 bg-black/40 border border-white/5 rounded-2xl space-y-3.5 text-center">
            {scratcherCooldown > 0 ? (
              <div className="py-6 space-y-1.5">
                <span className="text-2xl block">⏳</span>
                <span className="block text-xs text-white/40 font-mono uppercase">Scratchers Locked for cooldown</span>
                <span className="text-sm font-black text-purple-400 font-mono">Locked: {formatTime(scratcherCooldown)}</span>
              </div>
            ) : (
              <div>
                <span className="block text-[9px] font-mono text-purple-400 uppercase tracking-widest font-bold mb-3">TAP EACH BOX TO SCRATCH AND WIN</span>
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  {scratcherCells.map((cell) => (
                    <button
                      key={cell.id}
                      onClick={() => handleRevealCell(cell.id)}
                      disabled={cell.revealed || scratcherCooldown > 0}
                      className={`h-20 rounded-xl border flex items-center justify-center text-2xl transition-all cursor-pointer ${
                        cell.revealed 
                          ? 'bg-purple-950/20 border-purple-500/30 text-white shadow-inner scale-95'
                          : 'bg-gradient-to-br from-purple-600 to-indigo-800 border-purple-400 text-yellow-300 font-black font-mono shadow-md shadow-purple-900/30 hover:brightness-110 active:scale-95'
                      }`}
                    >
                      {cell.revealed ? cell.symbol : '❓'}
                    </button>
                  ))}
                </div>

                {scratchWinAmount !== null && (
                  <div className="mt-3.5 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl inline-block">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      🏆 Scratcher Complete! Won +{scratchWinAmount} Chips!
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center text-[10px] text-white/40 font-mono">
            {scratcherCooldown > 0 
              ? `Next Scratch card ready in ${formatTime(scratcherCooldown)}` 
              : 'Scratch 3 items. Match 3 to score massive Chip multipliers!'}
          </div>
        </div>

        {/* 4. Daily Casino Trivia Challenge */}
        <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" /> Casino Brain Trivia Whiz
            </h3>
            <p className="text-[11px] text-white/40 font-mono">ANSWER CORRECTLY TO CLAIM CHIPS (4 MINS COOLDOWN)</p>
          </div>

          {/* Interactive Question Card */}
          <div className="my-4 p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
            {triviaCooldown > 0 && !hasAnswered ? (
              <div className="py-8 text-center space-y-1.5">
                <span className="text-xl block">🎓</span>
                <span className="block text-xs text-white/40 font-mono uppercase">Brain Refreshing Challenge...</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">Cooldown Remaining: {formatTime(triviaCooldown)}</span>
                <button
                  onClick={handleNextQuestion}
                  className="mt-3 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white hover:bg-white/10"
                >
                  Skip Cooldown (Read next question pool)
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-white/40 font-bold pb-2 border-b border-white/5">
                  <span>TRIVIA CHALLENGE</span>
                  <span className="text-emerald-400">+{TRIVIA_QUESTIONS[currentQuestionIdx].prize} CHIPS PRIZE</span>
                </div>
                
                <h4 className="text-xs font-bold text-white leading-relaxed">
                  {TRIVIA_QUESTIONS[currentQuestionIdx].question}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                  {TRIVIA_QUESTIONS[currentQuestionIdx].options.map((opt, oIdx) => {
                    const isSelected = selectedOption === oIdx;
                    const isCorrect = oIdx === TRIVIA_QUESTIONS[currentQuestionIdx].correct;

                    return (
                      <button
                        key={oIdx}
                        disabled={hasAnswered || triviaCooldown > 0}
                        onClick={() => handleAnswerTrivia(oIdx)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                          hasAnswered
                            ? isCorrect
                              ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300'
                              : isSelected
                                ? 'bg-red-950/30 border-red-500 text-red-300'
                                : 'bg-white/5 border-white/5 opacity-40'
                            : 'bg-[#111126]/60 border-white/5 hover:border-emerald-500/40 hover:bg-white/5 text-white/80'
                        }`}
                      >
                        <span className="font-mono font-bold text-[10px] text-white/40 mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {hasAnswered && (
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[10px] font-mono text-white/40">
                      Cooldown started. Lock your brain cells!
                    </span>
                    <button
                      onClick={handleNextQuestion}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all"
                    >
                      Next Question Pool →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center text-[10px] text-white/30 font-mono">
            Vegas learning features are fully supported! Complete challenges daily.
          </div>
        </div>
      </div>

      {/* Third Section: Simulated Micro promotional wall */}
      <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl">
        <div className="space-y-1 mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" /> Simulated VIP Social Rewards
          </h3>
          <p className="text-[11px] text-white/40 font-mono">CLAIM MASSIVE SIMULATED CHIPS FOR SPREADING CASINO ACADEMY LESSONS</p>
        </div>

        <div className="divide-y divide-white/5">
          {PROMO_TASKS.map((task) => {
            const isClaimed = promoClaims[task.id];
            const isActive = activePromoTask === task.id;

            return (
              <div 
                key={task.id}
                className="py-4 flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors"
                style={{ contentVisibility: 'auto' }}
              >
                <div className="flex items-start gap-3.5 text-center sm:text-left">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex-shrink-0 mx-auto sm:mx-0">
                    {task.icon}
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white">{task.title}</h4>
                    <p className="text-[10px] text-white/45 max-w-lg leading-relaxed">{task.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto justify-center sm:justify-end">
                  <div className="flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20 font-mono text-xs font-bold text-amber-400">
                    <Coins className="w-3.5 h-3.5" />
                    +{task.reward}
                  </div>

                  {isClaimed ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 cursor-not-allowed"
                    >
                      <Check className="w-3.5 h-3.5" /> Claimed
                    </button>
                  ) : isActive ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 font-extrabold text-[10px] font-mono uppercase tracking-wider flex items-center gap-2 cursor-not-allowed animate-pulse"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      {task.loadingLabel} ({promoTimer}s)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartPromoTask(task.id, task.duration, task.reward)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white hover:border-amber-400/40 hover:text-amber-400 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {task.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
