import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GameState, 
  PatternType, 
  BingoCardData, 
  PlayerProfile, 
  CalledBall,
  DailyTask
} from './types';
import { 
  generateBingoCard, 
  getBallLetter, 
  checkBingoPattern, 
  generateBallPool,
  getPatternDisplayName,
  getPatternMultiplier
} from './utils/bingoEngine';
import { BingoCard } from './components/BingoCard';
import { BingoBoard } from './components/BingoBoard';
import { BingoAcademy } from './components/BingoAcademy';
import { CasinoStats } from './components/CasinoStats';
import { DailyTasks } from './components/DailyTasks';
import { SlotGame } from './components/SlotGame';
import { DiceGame } from './components/DiceGame';
import { CrashGame } from './components/CrashGame';
import { MinesGame } from './components/MinesGame';
import { PlinkoGame } from './components/PlinkoGame';
import { HiLoGame } from './components/HiLoGame';
import { RouletteGame } from './components/RouletteGame';
import { PolicyDocuments } from './components/PolicyDocuments';
import { 
  Coins, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Pause, 
  BookOpen, 
  Sliders, 
  Trophy, 
  AlertCircle, 
  User, 
  Shuffle, 
  Info,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Sparkles,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  Lock,
  Mail,
  UserPlus,
  Loader2
} from 'lucide-react';
import { 
  auth, 
  savePlayerProfile, 
  loadPlayerProfile, 
  googleProvider,
  FirebaseUser,
  registerCasinoAccount,
  loginCasinoAccount,
  saveCasinoAccountProfile,
  loadCasinoAccountProfileOnly
} from './utils/firebase';
import { 
  signOut, 
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';

const AVATARS = ['💎', '🃏', '🎲', '👑', '🍀', '💰', '🍒', '🎩', '🦖'];

const INITIAL_DAILY_TASKS: DailyTask[] = [
  {
    id: 'daily_checkin',
    title: 'Daily VIP Check-In',
    description: 'Claim your daily casino bonus chips',
    target: 1,
    current: 1, // Auto-completed as they are logged in and checked-in
    reward: 100,
    completed: true,
    claimed: false,
    icon: '🎟️'
  },
  {
    id: 'play_games',
    title: 'Casino Active',
    description: 'Play 2 rounds of Bingo on the casino floor',
    target: 2,
    current: 0,
    reward: 150,
    completed: false,
    claimed: false,
    icon: '🎟️'
  },
  {
    id: 'play_slots',
    title: 'Slot Enthusiast',
    description: 'Spin the Vegas Golden Reels 5 times',
    target: 5,
    current: 0,
    reward: 120,
    completed: false,
    claimed: false,
    icon: '🎰'
  },
  {
    id: 'win_dice',
    title: 'Dice Duel Champion',
    description: 'Win 2 rounds of Vegas Dice Duel against dealer',
    target: 2,
    current: 0,
    reward: 180,
    completed: false,
    claimed: false,
    icon: '🎲'
  },
  {
    id: 'daub_numbers',
    title: 'Precision Stamper',
    description: 'Manually daub 10 called numbers',
    target: 10,
    current: 0,
    reward: 120,
    completed: false,
    claimed: false,
    icon: '🎯'
  },
  {
    id: 'win_bingo',
    title: 'Vegas Legend',
    description: 'Claim at least 1 winning BINGO pattern',
    target: 1,
    current: 0,
    reward: 200,
    completed: false,
    claimed: false,
    icon: '👑'
  }
];

const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const checkAndResetDailyTasks = (p: PlayerProfile): PlayerProfile => {
  const today = getTodayDateString();
  if (p.lastDailyReset !== today || !p.dailyTasks || p.dailyTasks.length === 0) {
    return {
      ...p,
      lastDailyReset: today,
      dailyTasks: INITIAL_DAILY_TASKS.map(t => {
        if (t.id === 'daily_checkin') {
          return { ...t, current: 1, completed: true, claimed: false };
        }
        return { ...t, current: 0, completed: false, claimed: false };
      })
    };
  }
  return p;
};

export default function App() {
  // --- Profile State & Persistence ---
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    const saved = localStorage.getItem('bingo_casino_profile');
    let loaded: PlayerProfile;
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        loaded = {
          chips: 500,
          xp: 0,
          level: 1,
          name: 'VegasGuest',
          avatar: '🎲',
          stats: {
            gamesPlayed: 0,
            bingosWon: 0,
            totalChipsWon: 0,
            highestWin: 0,
            perfectDaubsCount: 0
          }
        };
      }
    } else {
      loaded = {
        chips: 500,
        xp: 0,
        level: 1,
        name: 'VegasGuest',
        avatar: '🎲',
        stats: {
          gamesPlayed: 0,
          bingosWon: 0,
          totalChipsWon: 0,
          highestWin: 0,
          perfectDaubsCount: 0
        }
      };
    }
    return checkAndResetDailyTasks(loaded);
  });

  useEffect(() => {
    localStorage.setItem('bingo_casino_profile', JSON.stringify(profile));
  }, [profile]);

  // --- Firebase VIP Authentication State ---
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [customUser, setCustomUser] = useState<string | null>(() => {
    return localStorage.getItem('bingo_casino_username');
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [clickStep, setClickStep] = useState<number>(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Clear auth error when modal closes
  useEffect(() => {
    if (!isAuthModalOpen) {
      setAuthError(null);
    }
  }, [isAuthModalOpen]);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          const cloudProfile = await loadPlayerProfile(user.uid);
          if (cloudProfile) {
            setProfile(checkAndResetDailyTasks(cloudProfile as PlayerProfile));
            triggerAlert('Welcome back! Cloud profile synchronized.', 'success');
          } else {
            // First time logging in, backup current local achievements to the cloud
            await savePlayerProfile(user.uid, profile);
            triggerAlert('Welcome! VIP profile created and saved to cloud.', 'success');
          }
        } catch (error) {
          console.error('Error fetching cloud profile:', error);
          triggerAlert('Could not sync with cloud profile.', 'error');
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync profile to cloud when values change (debounced to avoid Firestore spam)
  useEffect(() => {
    if (!currentUser) return;

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await savePlayerProfile(currentUser.uid, profile);
      } catch (error) {
        console.error('Cloud auto-save error:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(timer);
  }, [profile, currentUser]);

  // Load custom profile on startup if custom username is saved
  useEffect(() => {
    const initCustomAccount = async () => {
      if (customUser) {
        setIsSyncing(true);
        try {
          const cloudProfile = await loadCasinoAccountProfileOnly(customUser);
          if (cloudProfile) {
            setProfile(checkAndResetDailyTasks(cloudProfile as PlayerProfile));
          }
        } catch (error) {
          console.error('Error auto-syncing custom account:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    initCustomAccount();
  }, [customUser]);

  // Sync profile to custom account in Firestore when values change (debounced)
  useEffect(() => {
    if (!customUser) return;

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await saveCasinoAccountProfile(customUser, profile);
      } catch (error) {
        console.error('Custom account auto-save error:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [profile, customUser]);

  // --- Game Settings ---
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [activeLobbyTab, setActiveLobbyTab] = useState<'BINGO' | 'SLOTS' | 'DICE' | 'CRASH' | 'MINES' | 'PLINKO' | 'HILO' | 'ROULETTE'>('BINGO');
  const [ticketCount, setTicketCount] = useState<number>(2); // Default 2 tickets
  const [targetPattern, setTargetPattern] = useState<PatternType>(PatternType.LINE);
  const [callerSpeed, setCallerSpeed] = useState<number>(3000); // ms (Default Normal 3s)
  const [isAutoDaub, setIsAutoDaub] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);

  // --- Playing Game States ---
  const [tickets, setTickets] = useState<BingoCardData[]>([]);
  const [ballPool, setBallPool] = useState<number[]>([]);
  const [calledNumbers, setCalledNumbers] = useState<Set<number>>(new Set());
  const [lastCalledBall, setLastCalledBall] = useState<CalledBall | null>(null);
  const [lastFiveCalled, setLastFiveCalled] = useState<CalledBall[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isAcademyOpen, setIsAcademyOpen] = useState<boolean>(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState<boolean>(false);
  const [activePolicyTab, setActivePolicyTab] = useState<'about' | 'contact' | 'privacy' | 'terms'>('privacy');

  // --- Sound/UI Feedback State ---
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activeCallInterval, setActiveCallInterval] = useState<any>(null);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [ballsCalledThisRound, setBallsCalledThisRound] = useState<number>(0);
  const [roundPrizes, setRoundPrizes] = useState<number>(0);

  const feedbackTimeout = useRef<any>(null);

  // Trigger brief alert banner
  const triggerAlert = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    setFeedbackMsg({ text, type });
    feedbackTimeout.current = setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  // --- Daily Tasks Handlers & Reset Monitor ---
  const updateDailyTaskProgress = (taskId: string, increment: number) => {
    setProfile((prev) => {
      if (!prev.dailyTasks) return prev;
      const updatedTasks = prev.dailyTasks.map((t) => {
        if (t.id !== taskId) return t;
        if (t.claimed) return t;

        const newCurrent = Math.min(t.target, t.current + increment);
        const completed = newCurrent >= t.target;
        
        if (completed && !t.completed) {
          triggerAlert(`Quest Completed: "${t.title}"! Claim your chips!`, 'success');
        }

        return {
          ...t,
          current: newCurrent,
          completed
        };
      });

      return {
        ...prev,
        dailyTasks: updatedTasks
      };
    });
  };

  const handleClaimDailyTask = (taskId: string) => {
    setProfile((prev) => {
      if (!prev.dailyTasks) return prev;
      
      const task = prev.dailyTasks.find(t => t.id === taskId);
      if (!task || !task.completed || task.claimed) return prev;

      const updatedTasks = prev.dailyTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, claimed: true };
        }
        return t;
      });

      triggerAlert(`Claimed ${task.reward} Chips for completing "${task.title}"!`, 'success');

      return {
        ...prev,
        chips: prev.chips + task.reward,
        dailyTasks: updatedTasks
      };
    });
  };

  const handleAddCustomTask = (title: string, description: string, target: number, reward: number, icon: string) => {
    const newId = `custom_${Date.now()}`;
    const newTask: DailyTask = {
      id: newId,
      title,
      description,
      target,
      current: 0,
      reward,
      completed: false,
      claimed: false,
      icon
    };
    setProfile(prev => ({
      ...prev,
      dailyTasks: [...(prev.dailyTasks || []), newTask]
    }));
    triggerAlert(`Custom quest "${title}" added with a +${reward} Chips reward!`, 'success');
  };

  const handleProgressCustomTask = (taskId: string, increment: number) => {
    updateDailyTaskProgress(taskId, increment);
  };

  useEffect(() => {
    const checkReset = () => {
      setProfile((prev) => {
        const reseted = checkAndResetDailyTasks(prev);
        if (reseted.lastDailyReset !== prev.lastDailyReset) {
          triggerAlert('New day! Daily quests have been reset.', 'info');
        }
        return reseted;
      });
    };

    checkReset();
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- VIP Authentication Handlers ---
  const handleCustomAuth = async () => {
    if (!usernameInput.trim() || !passwordInput) {
      const errMsg = 'Please enter both username and password.';
      triggerAlert(errMsg, 'error');
      setAuthError(errMsg);
      return;
    }
    if (passwordInput.length < 6) {
      const errMsg = 'Password must be at least 6 characters.';
      triggerAlert(errMsg, 'error');
      setAuthError(errMsg);
      return;
    }
    
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'login') {
        try {
          const cloudProfile = await loginCasinoAccount(usernameInput, passwordInput);
          setProfile(checkAndResetDailyTasks(cloudProfile as PlayerProfile));
          localStorage.setItem('bingo_casino_username', usernameInput.trim());
          setCustomUser(usernameInput.trim());
          triggerAlert(`Welcome back, ${usernameInput}! VIP Synced.`, 'success');
          setIsAuthModalOpen(false);
          setUsernameInput('');
          setPasswordInput('');
          setClickStep(0);
          setAuthError(null);
        } catch (loginErr: any) {
          if (loginErr.message?.includes('Username not found')) {
            setAuthMode('signup');
            const infoMsg = `Username not found. Switched to 'Register' mode so you can create this account!`;
            triggerAlert(infoMsg, 'info');
            setAuthError(infoMsg);
          } else {
            throw loginErr;
          }
        }
      } else {
        const newProfile = await registerCasinoAccount(usernameInput, passwordInput, profile);
        setProfile(checkAndResetDailyTasks(newProfile as PlayerProfile));
        localStorage.setItem('bingo_casino_username', usernameInput.trim());
        setCustomUser(usernameInput.trim());
        triggerAlert(`Registered successfully as ${usernameInput}! VIP Profile Created.`, 'success');
        setIsAuthModalOpen(false);
        setUsernameInput('');
        setPasswordInput('');
        setClickStep(0);
        setAuthError(null);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Authentication failed.';
      triggerAlert(errMsg, 'error');
      setAuthError(errMsg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleButtonClickStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput) {
      const errMsg = 'Please fill in both Username and Password.';
      triggerAlert(errMsg, 'error');
      setAuthError(errMsg);
      return;
    }
    if (passwordInput.length < 6) {
      const errMsg = 'Password must be at least 6 characters.';
      triggerAlert(errMsg, 'error');
      setAuthError(errMsg);
      return;
    }

    setAuthError(null);
    const nextStep = clickStep + 1;
    if (nextStep >= 3) {
      handleCustomAuth();
    } else {
      setClickStep(nextStep);
      triggerAlert(`Step ${nextStep}/3 Verified! Click ${3 - nextStep} more time(s) to finalize.`, 'info');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      triggerAlert('Logged in with Google! Synced VIP progress.', 'success');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error(err);
      triggerAlert('Google Sign-In failed or was cancelled.', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (currentUser) {
        await signOut(auth);
      }
      setCustomUser(null);
      localStorage.removeItem('bingo_casino_username');
      setProfile({
        chips: 500,
        xp: 0,
        level: 1,
        name: 'VegasGuest',
        avatar: '🎲',
        stats: {
          gamesPlayed: 0,
          bingosWon: 0,
          totalChipsWon: 0,
          highestWin: 0,
          perfectDaubsCount: 0
        }
      });
      triggerAlert('Signed out. Local guest profile restored.', 'info');
    } catch (error) {
      console.error('Logout error:', error);
      triggerAlert('Failed to sign out.', 'error');
    }
  };

  // --- Casino Action Logging Engine ---
  const trackGameAction = (
    game: 'BINGO' | 'SLOTS' | 'DICE' | 'CRASH' | 'MINES' | 'PLINKO' | 'HILO' | 'ROULETTE',
    delta: number,
    description: string
  ) => {
    try {
      // 1. Append to localStorage logs list
      const entry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        game,
        delta,
        description
      };
      
      const savedLogs = localStorage.getItem('bingo_casino_logs_v1');
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      logs.unshift(entry);
      localStorage.setItem('bingo_casino_logs_v1', JSON.stringify(logs.slice(0, 50)));

      // 2. Accumulate in localStorage advanced stats
      const savedStats = localStorage.getItem('bingo_casino_adv_stats_v1');
      const stats = savedStats ? JSON.parse(savedStats) : {
        BINGO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        SLOTS: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        DICE: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        CRASH: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        MINES: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        PLINKO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        HILO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        ROULETTE: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 }
      };

      const gameStats = stats[game];
      if (gameStats) {
        if (delta < 0) {
          gameStats.played += 1;
          gameStats.bet += Math.abs(delta);
        } else if (delta > 0) {
          gameStats.won += 1;
          gameStats.wonChips += delta;
          gameStats.maxWin = Math.max(gameStats.maxWin, delta);
        }
        localStorage.setItem('bingo_casino_adv_stats_v1', JSON.stringify(stats));
      }
    } catch (e) {
      console.error('Error logging transaction', e);
    }
  };

  const handleUpdateChipsWithLog = (
    game: 'BINGO' | 'SLOTS' | 'DICE' | 'CRASH' | 'MINES' | 'PLINKO' | 'HILO' | 'ROULETTE',
    delta: number,
    description?: string
  ) => {
    setProfile(prev => {
      const updatedChips = prev.chips + delta;
      
      // Update global profile statistics
      const updatedStats = { ...prev.stats };
      if (delta < 0) {
        updatedStats.gamesPlayed += 1;
      } else if (delta > 0) {
        updatedStats.totalChipsWon += delta;
        updatedStats.highestWin = Math.max(updatedStats.highestWin, delta);
      }

      // Generate description if not provided
      const finalDesc = description || (delta > 0 ? `${game} Profit: +${delta} Chips! 🎉` : `${game} wager: -${Math.abs(delta)} Chips`);
      
      // Trigger local storage and analytical logging
      trackGameAction(game, delta, finalDesc);

      return {
        ...prev,
        chips: updatedChips,
        stats: updatedStats
      };
    });
  };

  // --- Voice Engine ---
  const speakNumber = (num: number) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // stop current sound
      const letter = getBallLetter(num);
      const text = `${letter}. ${num}. ${letter}, ${num}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis blocked or errored', e);
    }
  };

  // --- Buying Tickets & Game Launch ---
  const handleBuyTicketsAndStart = () => {
    const cost = ticketCount * 25; // 25 chips per ticket
    if (profile.chips < cost) {
      triggerAlert('Insufficient chips! Grab a Free Spin or buy fewer tickets.', 'error');
      return;
    }

    // Deduct entry fee
    handleUpdateChipsWithLog('BINGO', -cost, `Bought ${ticketCount} Bingo Tickets`);

    // Generate Tickets
    const generated: BingoCardData[] = Array.from({ length: ticketCount }, (_, i) => 
      generateBingoCard(`ticket-${Date.now()}-${i}`)
    );

    setTickets(generated);
    setCalledNumbers(new Set());
    setLastCalledBall(null);
    setLastFiveCalled([]);
    setBallsCalledThisRound(0);
    setRoundPrizes(0);
    
    // Shuffle Caller Pool
    const pool = generateBallPool();
    setBallPool(pool);

    // Enter game state
    setGameState(GameState.PLAYING);
    setIsPaused(false);
    triggerAlert(`Bought ${ticketCount} Tickets for ${cost} Chips! Good luck!`, 'success');
  };

  // --- Core Game Loop (Ball Drawer) ---
  const drawNextBall = () => {
    if (isPaused) return;

    setBallPool((prevPool) => {
      if (prevPool.length === 0) {
        // Pool exhausted! End Game.
        handleNoMoreBalls();
        return prevPool;
      }

      const nextNum = prevPool[0];
      const remaining = prevPool.slice(1);
      const letter = getBallLetter(nextNum);
      const drawnBall: CalledBall = { number: nextNum, letter };

      speakNumber(nextNum);

      // Save drawn ball
      setCalledNumbers((prevCalled) => {
        const nextCalled = new Set(prevCalled);
        nextCalled.add(nextNum);

        // Auto-Daub Check
        if (isAutoDaub) {
          setTickets((prevTickets) => 
            prevTickets.map((card) => {
              const updatedGrid = card.grid.map((row) =>
                row.map((cell) => {
                  if (cell.number === nextNum) {
                    return { ...cell, daubed: true };
                  }
                  return cell;
                })
              );
              return { ...card, grid: updatedGrid };
            })
          );
        }

        return nextCalled;
      });

      setLastCalledBall(drawnBall);
      setLastFiveCalled((prevFive) => [drawnBall, ...prevFive].slice(0, 5));
      setBallsCalledThisRound((prev) => prev + 1);

      return remaining;
    });
  };

  const drawNextBallRef = useRef(drawNextBall);
  useEffect(() => {
    drawNextBallRef.current = drawNextBall;
  });

  // Setup interval on state transition
  useEffect(() => {
    if (gameState === GameState.PLAYING && !isPaused) {
      const interval = setInterval(() => {
        drawNextBallRef.current();
      }, callerSpeed);
      setActiveCallInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (activeCallInterval) {
        clearInterval(activeCallInterval);
        setActiveCallInterval(null);
      }
    }
  }, [gameState, isPaused, callerSpeed]);

  const handleNoMoreBalls = () => {
    setGameState(GameState.GAME_OVER);
    triggerAlert('All 75 balls have been called! Round over.', 'info');
  };

  // --- Manual Daub Handler ---
  const handleCellClick = (cardId: string, rIdx: number, cIdx: number) => {
    if (isAutoDaub || gameState !== GameState.PLAYING) return;

    setTickets((prevTickets) =>
      prevTickets.map((card) => {
        if (card.id !== cardId) return card;

        const cell = card.grid[rIdx][cIdx];
        if (cell.number === null || cell.daubed) return card;

        // Is it called?
        const isDrawn = calledNumbers.has(cell.number);

        if (isDrawn) {
          // Correct Stamp!
          const updatedGrid = card.grid.map((r, rowIdx) =>
            r.map((c, colIdx) => {
              if (rowIdx === rIdx && colIdx === cIdx) {
                return { ...c, daubed: true };
              }
              return c;
            })
          );

          // Add minor XP on manual stamp
          setProfile((prev) => ({
            ...prev,
            xp: prev.xp + 5
          }));

          updateDailyTaskProgress('daub_numbers', 1);

          return { ...card, grid: updatedGrid };
        } else {
          // Warning
          triggerAlert(`Number ${cell.number} hasn't been called yet! Watch the board.`, 'error');
        }

        return card;
      })
    );
  };

  // --- Bingo Claim Checker ---
  const handleClaimBingo = () => {
    if (gameState !== GameState.PLAYING) return;

    let totalWinningPrizes = 0;
    let anyWinningCard = false;

    // Verify all purchased cards
    const verifiedTickets = tickets.map((card) => {
      const { won, winningCells } = checkBingoPattern(card, targetPattern);

      if (won && !card.hasBingo) {
        anyWinningCard = true;
        
        // Calculate payout
        const multiplier = getPatternMultiplier(targetPattern);
        const prize = Math.round(25 * multiplier); // Base payout per ticket cost
        totalWinningPrizes += prize;

        return {
          ...card,
          hasBingo: true,
          winningCells
        };
      }
      return card;
    });

    if (anyWinningCard) {
      setTickets(verifiedTickets);
      setRoundPrizes((prev) => prev + totalWinningPrizes);

      // Award profile
      const earnedXP = 100 + (isAutoDaub ? 0 : 50); // bonus XP for manual daub
      
      setProfile((prev) => {
        const nextXP = prev.xp + earnedXP;
        const currentLvlLimit = prev.level * 100;
        const levelUp = nextXP >= currentLvlLimit;

        return {
          ...prev,
          chips: prev.chips + totalWinningPrizes,
          xp: levelUp ? nextXP - currentLvlLimit : nextXP,
          level: levelUp ? prev.level + 1 : prev.level,
          stats: {
            ...prev.stats,
            bingosWon: prev.stats.bingosWon + 1,
            totalChipsWon: prev.stats.totalChipsWon + totalWinningPrizes,
            highestWin: Math.max(prev.stats.highestWin, totalWinningPrizes)
          }
        };
      });

      updateDailyTaskProgress('win_bingo', 1);
      trackGameAction('BINGO', totalWinningPrizes, `Bingo Claim: Won ${totalWinningPrizes} Chips! 🎉`);

      // Pause caller immediately to let them celebrate
      setIsPaused(true);
      triggerAlert(`🎰 BINGO! You won ${totalWinningPrizes} Chips and +${earnedXP} XP!`, 'success');
    } else {
      // False Bingo penalty
      const penalty = 15;
      setProfile((prev) => ({
        ...prev,
        chips: Math.max(0, prev.chips - penalty)
      }));
      trackGameAction('BINGO', -penalty, `False Bingo penalty`);
      triggerAlert(`False Bingo! No matching pattern yet. Penalty: -${penalty} Chips.`, 'error');
    }
  };

  // Level Up check
  useEffect(() => {
    const currentLvlLimit = profile.level * 100;
    if (profile.xp >= currentLvlLimit) {
      setProfile((prev) => ({
        ...prev,
        level: prev.level + 1,
        xp: prev.xp - currentLvlLimit
      }));
      triggerAlert(`🎉 LEVEL UP! Welcome to Casino Level ${profile.level + 1}!`, 'success');
    }
  }, [profile.xp, profile.level]);

  // --- End Round Cleanups ---
  const handleEndGameAndBackToLobby = () => {
    // Save stats
    setProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        gamesPlayed: prev.stats.gamesPlayed + 1
      }
    }));

    updateDailyTaskProgress('play_games', 1);

    setGameState(GameState.LOBBY);
    setTickets([]);
    setCalledNumbers(new Set());
    setLastCalledBall(null);
  };

  // Pattern Highlight demonstration indices helper for active card render during gaming
  const getTargetIndices = (): [number, number][] => {
    switch (targetPattern) {
      case PatternType.LINE:
        return []; // Dynamic, so we don't pre-render
      case PatternType.FOUR_CORNERS:
        return [[0, 0], [0, 4], [4, 0], [4, 4]];
      case PatternType.LETTER_X:
        return [
          [0, 0], [1, 1], [2, 2], [3, 3], [4, 4],
          [0, 4], [1, 3], [3, 1], [4, 0]
        ];
      case PatternType.PLUS_SIGN:
        return [
          [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
          [0, 2], [1, 2], [3, 2], [4, 2]
        ];
      case PatternType.BLACKOUT:
        const indices: [number, number][] = [];
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) indices.push([r, c]);
        }
        return indices;
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-white font-sans antialiased selection:bg-amber-400 selection:text-black">
      {/* Top ambient casino lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Bar / Header Navigation */}
      <header className="sticky top-0 z-30 bg-[#0a0a1f]/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 p-[2px] shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300 flex items-center justify-center">
              <div className="w-full h-full rounded-lg bg-[#05050a] flex items-center justify-center">
                <span className="text-sm font-black text-amber-400 font-mono">101</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                BINGO 101 <span className="text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/30 font-bold px-2.5 py-0.5 rounded-full">CASINO</span>
              </h1>
              <p className="text-[9px] text-white/40 font-mono">ESTABLISHED Vegas, USA</p>
            </div>
          </div>

          {/* Profile Bar */}
          <div className="flex items-center gap-3">
            {/* Interactive Faucet indicator */}
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-0.5">
                  {profile.chips} <span className="text-[9px] text-white/40 font-normal">Chips</span>
                </span>
              </div>
            </div>

            {/* Level / User Card */}
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-xl">{profile.avatar}</span>
              <div>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value.substring(0, 14) }))}
                  className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-400 text-xs font-bold text-white focus:outline-none w-20 sm:w-24 transition-colors"
                  placeholder="Enter alias..."
                />
                <span className="block text-[8px] font-mono text-white/30 uppercase tracking-tight">
                  LVL {profile.level} {currentUser || customUser ? 'VIP MEMBER' : 'GUEST'}
                </span>
              </div>
            </div>

            {/* Cloud Sync Status Indicator */}
            {(currentUser || customUser) && (
              <div 
                className="flex items-center justify-center p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                title={isSyncing ? "Saving progress to cloud..." : "VIP Profile synced in cloud"}
              >
                <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-pulse text-amber-400' : ''}`} />
              </div>
            )}

            {/* VIP Auth Actions */}
            {currentUser || customUser ? (
              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer animate-fade-in"
                title="Log Out VIP Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-extrabold text-xs transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 cursor-pointer"
                title="Sign in to save your achievements!"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden md:inline">VIP JOIN</span>
              </button>
            )}

            {/* Action buttons */}
            <button
              onClick={() => setIsAcademyOpen(true)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
              title="Bingo 101 Academy"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Alert Messages */}
      <AnimatePresence>
        {feedbackMsg && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
                feedbackMsg.type === 'success' 
                  ? 'bg-green-950/90 border-green-500/40 text-green-300' 
                  : feedbackMsg.type === 'error'
                    ? 'bg-red-950/90 border-red-500/40 text-red-300'
                    : 'bg-zinc-900/95 border-zinc-700 text-zinc-300'
              }`}
            >
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                feedbackMsg.type === 'success' ? 'text-green-400' : feedbackMsg.type === 'error' ? 'text-red-400' : 'text-amber-400'
              }`} />
              <div className="flex-1">
                <p className="text-xs font-semibold leading-relaxed">{feedbackMsg.text}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* LOBBY GAME SCREEN */}
        {gameState === GameState.LOBBY && (
          <div className="space-y-8">
            {/* Promo Header banner */}
            <div className="bg-gradient-to-r from-amber-500/10 via-[#0a0a1f]/80 to-blue-500/5 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] bg-amber-400 text-black font-black uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full">Learn & Play 101</span>
                <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Get Started at the Casino Floor</h2>
                <p className="text-xs text-white/50 max-w-lg leading-relaxed">
                  Try your luck across the casino floor! Play standard classical 75-Ball Bingo, roll the bones in Dice Duel, or spin the reels in the Golden Vegas Slots!
                </p>
              </div>
              <button
                onClick={() => setIsAcademyOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs transition-all tracking-wider shadow-lg active:scale-95 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" /> LEARN BINGO 101
              </button>
            </div>

            {/* Interactive Casino Game Lobby Selector Tabs */}
            <div className="flex flex-wrap gap-3 bg-[#0a0a1f]/80 p-2 rounded-2xl border border-white/10">
              {[
                { tab: 'BINGO', label: '🎟️ Bingo Floor', desc: '75-Ball classic' },
                { tab: 'SLOTS', label: '🎰 Vegas Slots', desc: 'Spin & Win' },
                { tab: 'DICE', label: '🎲 Dice Duel', desc: 'VS House Dealer' },
                { tab: 'CRASH', label: '🚀 Rocket Crash', desc: 'Exponential multiplier' },
                { tab: 'MINES', label: '💣 Mines Floor', desc: 'Dodge & Multiplier' },
                { tab: 'PLINKO', label: '🎯 Cosmic Plinko', desc: 'Pegboard Multipliers' },
                { tab: 'HILO', label: '🔥 Hi-Lo Duel', desc: 'Predict Higher/Lower' },
                { tab: 'ROULETTE', label: '🎡 Neon Roulette', desc: 'Interactive Wheel' }
              ].map((t) => {
                const isActive = activeLobbyTab === t.tab;
                return (
                  <button
                    key={t.tab}
                    onClick={() => setActiveLobbyTab(t.tab as any)}
                    className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl border text-left transition-all flex flex-col justify-center cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 border-amber-300 text-black shadow-md shadow-amber-400/10'
                        : 'bg-white/5 border-transparent text-white/60 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-wider">{t.label}</span>
                    <span className={`text-[9px] font-mono ${isActive ? 'text-black/60 font-semibold' : 'text-white/40'}`}>
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Conditional Game Views */}
            {activeLobbyTab === 'SLOTS' && (
              <SlotGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Vegas Slots Spin: Won +${delta} Chips! 🎉` : `Vegas Slots: Placed ${Math.abs(delta)} Chip spin`;
                  handleUpdateChipsWithLog('SLOTS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'DICE' && (
              <DiceGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Dice Duel Round: Defeated Dealer! Won +${delta} Chips 🎲` : `Dice Duel Round: Dealer won. Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('DICE', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'CRASH' && (
              <CrashGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Rocket Flight Cashout: Won +${delta} Chips! 🚀` : `Rocket Flight: Crashed! Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('CRASH', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'MINES' && (
              <MinesGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Mines Sweeper Cashout: Won +${delta} Chips! 💣` : `Mines Sweeper: Hit a Mine! Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('MINES', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'PLINKO' && (
              <PlinkoGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Plinko Land: Won +${delta} Chips! 🎯` : `Plinko wager: Placed ${Math.abs(delta)} Chip drop`;
                  handleUpdateChipsWithLog('PLINKO', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'HILO' && (
              <HiLoGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Hi-Lo Duel Cashout: Won +${delta} Chips! 🏆` : `Hi-Lo Duel wager: Placed ${Math.abs(delta)} Chip wager`;
                  handleUpdateChipsWithLog('HILO', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'ROULETTE' && (
              <RouletteGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Vegas Neon Roulette win: Won +${delta} Chips! 🎉` : `Vegas Neon Roulette bet: Placed ${Math.abs(delta)} Chip board bet`;
                  handleUpdateChipsWithLog('ROULETTE', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'BINGO' && (
              /* Quick Lobby Setup Panel & Buy Desk */
              <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 animate-fade-in">
                {/* Game Setup */}
                <div className="bg-[#0a0a1f] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" /> Casino Floor Settings
                  </h3>

                  {/* Grid selectors */}
                  <div className="space-y-4">
                    {/* Pattern Selection */}
                    <div>
                      <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wide">
                        Select Target Winning Pattern
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {[
                          { id: PatternType.LINE, label: 'Line', mult: 2.5 },
                          { id: PatternType.FOUR_CORNERS, label: 'Corners', mult: 4.0 },
                          { id: PatternType.LETTER_X, label: 'Letter X', mult: 6.0 },
                          { id: PatternType.PLUS_SIGN, label: 'Plus (+)', mult: 5.0 },
                          { id: PatternType.BLACKOUT, label: 'Blackout', mult: 15.0 },
                        ].map((pat) => {
                          const isSelected = targetPattern === pat.id;
                          return (
                            <button
                              key={pat.id}
                              onClick={() => setTargetPattern(pat.id)}
                              className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-center items-center ${
                                isSelected
                                  ? 'bg-amber-400/10 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                  : 'bg-white/5 border-white/5 hover:border-white/10 text-white/60'
                              }`}
                            >
                              <span className="text-xs font-bold font-sans">{pat.label}</span>
                              <span className="text-[9px] font-mono text-amber-500 mt-1 font-bold">{pat.mult.toFixed(1)}x Payout</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ticket Buy Slider */}
                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wide flex justify-between">
                          <span>Number of Tickets</span>
                          <span className="text-amber-400 font-bold">{ticketCount} Tickets</span>
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((num) => (
                            <button
                              key={num}
                              onClick={() => setTicketCount(num)}
                              className={`flex-1 py-3 rounded-xl border font-bold text-sm ${
                                ticketCount === num
                                  ? 'bg-amber-400 border-amber-300 text-black shadow-md shadow-amber-400/20'
                                  : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10 hover:text-white'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                        <span className="block text-[10px] text-white/30 font-mono mt-1.5">
                          Each ticket costs 25 chips. Entry: {ticketCount * 25} chips.
                        </span>
                      </div>

                      {/* Speeds */}
                      <div>
                        <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wide">
                          Caller Game Speed
                        </label>
                        <div className="flex gap-2">
                          {[
                            { label: 'Slow (5s)', value: 5000 },
                            { label: 'Normal (3s)', value: 3000 },
                            { label: 'Fast (1.5s)', value: 1500 },
                          ].map((sp) => (
                            <button
                              key={sp.value}
                              onClick={() => setCallerSpeed(sp.value)}
                              className={`flex-1 py-3 rounded-xl border text-xs font-bold ${
                                callerSpeed === sp.value
                                  ? 'bg-amber-400/10 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                  : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10 hover:text-white'
                              }`}
                            >
                              {sp.label}
                            </button>
                          ))}
                        </div>
                        <span className="block text-[10px] text-white/30 font-mono mt-1.5">
                          Adjusts speed of ball calling in real-time.
                        </span>
                      </div>
                    </div>

                    {/* Autodaub & Voice options */}
                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-[#111126]/60 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
                        <div>
                          <span className="block text-xs font-bold text-white mb-0.5">Auto-Daub Tickets</span>
                          <p className="text-[10px] text-white/40">Stamps called numbers automatically</p>
                        </div>
                        <button
                          onClick={() => setIsAutoDaub(!isAutoDaub)}
                          className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 ${
                            isAutoDaub ? 'bg-amber-400' : 'bg-white/10'
                          }`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full bg-black transition-transform duration-300 ${
                            isAutoDaub ? 'translate-x-5.5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="p-4 bg-[#111126]/60 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
                        <div>
                          <span className="block text-xs font-bold text-white mb-0.5">Voice Caller</span>
                          <p className="text-[10px] text-white/40">Speaks drawn numbers in real-time</p>
                        </div>
                        <button
                          onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                          className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 ${
                            isVoiceEnabled ? 'bg-amber-400' : 'bg-white/10'
                          }`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full bg-black transition-transform duration-300 ${
                            isVoiceEnabled ? 'translate-x-5.5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Big PLAY CTA */}
                  <button
                    onClick={handleBuyTicketsAndStart}
                    className="w-full py-4.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-amber-600 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" /> BUY TICKETS & PLAY
                  </button>
                </div>

                {/* Sidebar Profile Card Selection */}
                <div className="bg-[#0a0a1f] border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2 mb-4">
                      <User className="w-4 h-4 text-amber-400" /> Customize Your Token
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATARS.map((av) => (
                        <button
                          key={av}
                          onClick={() => setProfile(prev => ({ ...prev, avatar: av }))}
                          className={`text-2xl p-2 rounded-xl transition-all border ${
                            profile.avatar === av
                              ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                              : 'bg-white/5 border-white/5 hover:border-white/10 text-white/50'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#111126]/60 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40 font-mono">Current Target:</span>
                      <span className="font-bold text-amber-400">{getPatternDisplayName(targetPattern)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40 font-mono">Difficulty:</span>
                      <span className="font-bold text-white/80">
                        {targetPattern === PatternType.BLACKOUT ? 'Jackpot / Hard' : 'Standard / Easy'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40 font-mono">Est. Prize multiplier:</span>
                      <span className="font-bold text-emerald-400 font-mono">{getPatternMultiplier(targetPattern).toFixed(1)}x</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bento Grid: Daily Quests, Analytics, Lucky Wheel & Leaderboard */}
            <CasinoStats 
              profile={profile} 
              onAddChips={(amount) => {
                setProfile(prev => ({
                  ...prev,
                  chips: prev.chips + amount
                }));
                triggerAlert(`Added ${amount} chips from Lucky Wheel!`, 'success');
              }} 
              tasks={profile.dailyTasks || []}
              onClaimTask={handleClaimDailyTask}
              onAddTask={handleAddCustomTask}
              onProgressTask={handleProgressCustomTask}
            />
          </div>
        )}

        {/* ACTIVE PLAYING SCREEN */}
        {gameState === GameState.PLAYING && (
          <div className="space-y-6">
            
            {/* HUD Status Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#0a0a1f]/90 border border-white/10 p-4 rounded-2xl shadow-xl gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleEndGameAndBackToLobby}
                  className="px-3.5 py-1.5 rounded-xl border border-white/10 text-xs text-white/60 hover:text-white transition-all bg-white/5 hover:bg-white/10 font-mono"
                >
                  Quit to Lobby
                </button>
                <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
                  <span className="font-mono">Target Pattern:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" /> {getPatternDisplayName(targetPattern)}
                  </span>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-3">
                {/* Auto Daub state pill */}
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                  isAutoDaub 
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' 
                    : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                }`}>
                  {isAutoDaub ? 'Auto Daub ON' : 'Manual Daub (Bonus XP!)'}
                </span>

                {/* Draw status */}
                <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                  <span>BALLS CALLED:</span>
                  <span className="text-white font-bold">{ballsCalledThisRound}</span>
                </div>
              </div>
            </div>

            {/* Grid Layout of Caller panel & Tickets */}
            <div className="grid lg:grid-cols-[1fr_2.5fr] gap-6">
              
              {/* Left Side: Live Caller Sphere */}
              <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl">
                
                {/* Caller Ball Section */}
                <div className="text-center space-y-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                    LIVE CALLER DESK
                  </span>

                  {/* Gigantic Sphere representation */}
                  <div className="flex justify-center my-4">
                    <AnimatePresence mode="wait">
                      {lastCalledBall ? (
                        <motion.div
                          key={`${lastCalledBall.number}`}
                          initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                          animate={{ rotate: 0, scale: 1, opacity: 1 }}
                          exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                          transition={{ type: 'spring', damping: 11 }}
                          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl relative border-4 ${
                            lastCalledBall.letter === 'B' ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400/80 shadow-blue-500/20' :
                            lastCalledBall.letter === 'I' ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400/80 shadow-red-500/20' :
                            lastCalledBall.letter === 'N' ? 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-400/80 shadow-amber-500/20' :
                            lastCalledBall.letter === 'G' ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-400/80 shadow-green-500/20' :
                            'bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400/80 shadow-purple-500/20'
                          }`}
                        >
                          {/* Inner Sphere lighting gloss effect */}
                          <div className="absolute top-1.5 left-6 w-12 h-6 bg-white/20 rounded-full filter blur-[1px] transform -rotate-12" />
                          
                          {/* Sphere Value */}
                          <span className="text-2xl font-black font-mono text-white tracking-tighter opacity-70">
                            {lastCalledBall.letter}
                          </span>
                          <span className="text-4xl font-black font-sans text-white leading-none tracking-tight">
                            {lastCalledBall.number}
                          </span>
                        </motion.div>
                      ) : (
                        <div className="w-32 h-32 rounded-full border border-white/10 border-dashed flex flex-col items-center justify-center text-center text-white/30 bg-white/5">
                          <span className="text-xs font-mono">WAITING</span>
                          <span className="text-xs font-mono">FOR DRAW</span>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Active speed and controls buttons */}
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                        isPaused 
                          ? 'bg-amber-400 border-amber-300 text-black shadow-md shadow-amber-400/20' 
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                      {isPaused ? 'RESUME CALLER' : 'PAUSE'}
                    </button>
                    <button
                      onClick={() => {
                        // Force instantaneous draw
                        drawNextBall();
                      }}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-white/75 hover:text-white hover:bg-white/10"
                    >
                      NEXT BALL
                    </button>
                  </div>
                </div>

                {/* Last Called list */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">
                    BALL HISTORY (LAST 5)
                  </span>
                  <div className="flex gap-2 justify-center">
                    {lastFiveCalled.slice(1, 5).map((ball, idx) => (
                      <div
                        key={`${ball.number}-${idx}`}
                        className={`w-9 h-9 rounded-full border text-xs font-mono font-bold flex items-center justify-center ${
                          ball.letter === 'B' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' :
                          ball.letter === 'I' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                          ball.letter === 'N' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                          ball.letter === 'G' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                          'bg-purple-500/10 border-purple-500/30 text-purple-300'
                        }`}
                      >
                        {ball.letter}{ball.number}
                      </div>
                    ))}
                    {lastFiveCalled.length <= 1 && (
                      <span className="text-[10px] text-white/20 font-mono py-1">No drawing history yet</span>
                    )}
                  </div>
                </div>

                {/* Interactive Payout summary desk */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-white/40">Tickets Purchased:</span>
                    <span className="font-bold text-white">{ticketCount}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-white/40">Target Payout:</span>
                    <span className="font-bold text-amber-400">{getPatternDisplayName(targetPattern)} ({getPatternMultiplier(targetPattern).toFixed(1)}x)</span>
                  </div>
                  {roundPrizes > 0 && (
                    <div className="flex justify-between font-mono pt-1 border-t border-white/10">
                      <span className="text-green-400 font-bold">TOTAL WON THIS ROUND:</span>
                      <span className="font-extrabold text-green-400">+{roundPrizes} Chips</span>
                    </div>
                  )}
                </div>

                {/* Giant PULSING BINGO TRIGGER */}
                <button
                  onClick={handleClaimBingo}
                  className="w-full py-4 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:brightness-110 active:scale-95 animate-pulse transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300"
                >
                  <Sparkles className="w-4 h-4 fill-current animate-spin" /> CLAIM BINGO!
                </button>
              </div>

              {/* Right Side: Player's Active Tickets Grid */}
              <div className="space-y-6">
                
                {/* Tickets grid */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-3 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" /> Your Active Tickets
                  </h3>

                  <div className={`grid gap-4 ${
                    ticketCount === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                    ticketCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
                    ticketCount === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
                  }`}>
                    {tickets.map((card) => (
                      <BingoCard
                        key={card.id}
                        card={card}
                        onCellClick={handleCellClick}
                        isManualDaub={!isAutoDaub}
                        calledNumbers={calledNumbers}
                        targetPatternIndices={getTargetIndices()}
                      />
                    ))}
                  </div>
                </div>

                {/* Master calling board for cross checks */}
                <BingoBoard calledNumbers={calledNumbers} lastCalledNumber={lastCalledBall?.number || null} />
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === GameState.GAME_OVER && (
          <div className="max-w-xl mx-auto bg-[#0a0a1f]/95 border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ROUND COMPLETE</span>
              <h2 className="text-2xl font-bold tracking-tight text-white">Vegas Lobby Recap</h2>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3.5 text-sm text-left">
              <div className="flex justify-between font-mono text-white/55">
                <span>Tickets Bought:</span>
                <span className="font-bold text-white">{ticketCount}</span>
              </div>
              <div className="flex justify-between font-mono text-white/55">
                <span>Target Goal:</span>
                <span className="font-bold text-amber-400">{getPatternDisplayName(targetPattern)}</span>
              </div>
              <div className="flex justify-between font-mono text-white/55">
                <span>Balls Drawn before End:</span>
                <span className="font-bold text-white">{ballsCalledThisRound} / 75</span>
              </div>
              <div className="flex justify-between font-mono pt-2 border-t border-white/10">
                <span className="font-bold text-white/70">Net Chip Rewards:</span>
                <span className={`font-extrabold ${roundPrizes > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {roundPrizes > 0 ? `+${roundPrizes} Chips` : `-${ticketCount * 25} Chips`}
                </span>
              </div>
            </div>

            <button
              onClick={handleEndGameAndBackToLobby}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
            >
              RETURN TO LOBBY
            </button>
          </div>
        )}
      </main>

      {/* FOOTER METADATA / INFORMATION */}
      <footer className="bg-[#05050a] border-t border-white/10 py-12 px-6 mt-16 text-center text-xs text-white/40 font-mono space-y-4">
        {/* Compliance Pages Links list */}
        <div className="flex flex-wrap justify-center items-center gap-6 pb-2 text-[11px]">
          {[
            { id: 'about', label: 'ABOUT US' },
            { id: 'contact', label: 'CONTACT US' },
            { id: 'privacy', label: 'PRIVACY POLICY' },
            { id: 'terms', label: 'TERMS & CONDITIONS' }
          ].map((link) => (
            <button
              key={link.id}
              id={`footer-link-${link.id}`}
              onClick={() => {
                setActivePolicyTab(link.id as any);
                setIsPolicyOpen(true);
              }}
              className="text-white/40 hover:text-amber-400 transition-colors font-bold uppercase tracking-wider cursor-pointer border-b border-transparent hover:border-amber-400/30 pb-0.5"
            >
              {link.label}
            </button>
          ))}
        </div>

        <p>© 2026 BINGO 101 CASINO - FULLY SECURED PLAYGROUND</p>
        <p className="max-w-md mx-auto text-[10px] text-white/30 leading-relaxed">
          This platform uses fully simulated non-monetary currency for learning & entertainment purposes only. Practice rules, auto-daub combinations, and claim jackpot ratios inside our safe system.
        </p>
      </footer>

      {/* Bingo 101 Academy Modal Overlay */}
      <AnimatePresence>
        {isAcademyOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl"
            >
              <BingoAcademy
                onClose={() => setIsAcademyOpen(false)}
                onSelectPattern={(pat) => {
                  setTargetPattern(pat);
                  setIsAcademyOpen(false);
                  triggerAlert(`Target pattern updated to: ${getPatternDisplayName(pat)}`, 'success');
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Corporate Compliance Policy documents Modal Overlay */}
      <AnimatePresence>
        {isPolicyOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl flex justify-center"
            >
              <PolicyDocuments
                initialTab={activePolicyTab}
                onClose={() => setIsPolicyOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIP Authentication Modal Overlay */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0a0a1f]/95 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_35px_rgba(245,158,11,0.15)] relative"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setClickStep(0);
                }}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer text-xs font-mono"
              >
                [ESC CLOSE]
              </button>

              {/* Title Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white uppercase">
                  {authMode === 'login' ? 'VIP Vault Sign-In' : 'VIP Vault Registration'}
                </h3>
                <p className="text-[11px] text-white/60 leading-relaxed max-w-xs mx-auto">
                  {authMode === 'login' 
                    ? 'Enter your casino username and secure password to restore your chips and level.'
                    : 'Create a brand new casino profile with a custom password to claim your starting VIP benefits.'}
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5 text-center text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    authMode === 'login' 
                      ? 'bg-amber-400 text-black font-black' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    authMode === 'signup' 
                      ? 'bg-amber-400 text-black font-black' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  NEW REGISTER
                </button>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleButtonClickStep} className="space-y-4">
                {authError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-200 text-xs font-mono font-medium leading-relaxed flex items-center gap-2">
                    <span className="text-red-400 text-sm">⚠️</span>
                    <div className="text-left flex-1">
                      <span className="font-bold text-red-400 block uppercase text-[10px] tracking-wider mb-0.5">SECURITY WARNING</span>
                      {authError}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-white/40 font-mono uppercase tracking-wider">
                    Casino Username
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 16));
                      setAuthError(null);
                    }}
                    placeholder="e.g. VegasKing77"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-white/40 font-mono uppercase tracking-wider">
                    Secure Password (min. 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setAuthError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Triple Click Security Requirement Interface */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      3-Click Security Check
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      Step {clickStep} of 3
                    </span>
                  </div>

                  {/* Indicator lights for clicks */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[1, 2, 3].map((step) => {
                      const isActive = clickStep >= step;
                      return (
                        <div
                          key={step}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : 'bg-white/5 border border-white/5'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-black font-black text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isAuthLoading ? (
                      <span className="flex items-center gap-1.5 font-bold">
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        ACCESSING SECURE SERVER...
                      </span>
                    ) : (
                      <>
                        <span className="font-extrabold tracking-widest text-xs">
                          {clickStep === 0 && 'INITIALIZE ACCESS [CLICK 1]'}
                          {clickStep === 1 && 'ESTABLISH CONNECT [CLICK 2]'}
                          {clickStep === 2 && 'AUTHORIZE VAULT [FINAL CLICK]'}
                        </span>
                        <span className="text-[8px] font-mono opacity-60">
                          {clickStep < 2 
                            ? `Requires ${3 - clickStep} sequential clicks to trigger` 
                            : 'Ready for authorization check!'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Disclaimer */}
              <p className="text-[10px] text-center text-white/30 font-mono pt-2">
                By entering, you confirm you are registering simulated credits for entertainment only.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
