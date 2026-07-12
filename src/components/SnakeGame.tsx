import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Play, 
  Trophy, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  Shield, 
  Zap, 
  Orbit, 
  Gauge,
  Palette
} from 'lucide-react';

interface SnakeGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface Point {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  life: number;
  maxLife: number;
}

type GameMode = 'CLASSIC' | 'PORTALS' | 'ASTEROIDS';
type ThemeId = 'CYBER' | 'SUNSET' | 'MATRIX';

interface GameTheme {
  primary: string;
  secondary: string;
  background: string;
  gridLine: string;
  snakeHead: string;
  snakeBody: string;
  glowColor: string;
}

const THEMES: Record<ThemeId, GameTheme> = {
  CYBER: {
    primary: '#3b82f6', // Cyber Blue
    secondary: '#10b981', // Emerald
    background: '#06071b',
    gridLine: '#101235',
    snakeHead: '#3b82f6',
    snakeBody: 'rgba(59, 130, 246, 0.75)',
    glowColor: '#3b82f6',
  },
  SUNSET: {
    primary: '#ec4899', // Hot Pink
    secondary: '#fbbf24', // Amber Gold
    background: '#0f0514',
    gridLine: '#240b2a',
    snakeHead: '#ec4899',
    snakeBody: 'rgba(236, 72, 153, 0.75)',
    glowColor: '#ec4899',
  },
  MATRIX: {
    primary: '#22c55e', // Neo Green
    secondary: '#eab308', // Cyber Yellow
    background: '#020a04',
    gridLine: '#081e0e',
    snakeHead: '#22c55e',
    snakeBody: 'rgba(34, 197, 94, 0.75)',
    glowColor: '#22c55e',
  }
};

// Payout Multiplier Ladder Tiers
const MULTIPLIERS = [
  { minScore: 0, mult: 0.0, label: 'No Return', style: 'text-white/40' },
  { minScore: 5, mult: 1.0, label: 'Money Back 🤝', style: 'text-blue-400 font-bold' },
  { minScore: 10, mult: 2.2, label: 'Double Up 💸', style: 'text-emerald-400 font-bold' },
  { minScore: 15, mult: 4.5, label: 'Super Win 🔥', style: 'text-pink-400 font-extrabold' },
  { minScore: 22, mult: 8.0, label: 'Jackpot Run 🚀', style: 'text-amber-400 font-extrabold animate-pulse' },
  { minScore: 30, mult: 15.0, label: 'Cosmic Legend 👑', style: 'text-cyan-400 font-black animate-bounce' },
];

class SnakeAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private initContext() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTurn() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.03);

      gain.gain.setValueAtTime(0.012, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.03);
    } catch (e) {}
  }

  playEat() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.04); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.08); // G5

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  playGold() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.025, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.14);
      });
    } catch (e) {}
  }

  playPowerup() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.32);
    } catch (e) {}
  }

  playCrash() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.4);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.42);
    } catch (e) {}
  }
}

export const SnakeGame: React.FC<SnakeGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(25);

  // Synchronized state and ref pairs to solve stale closures perfectly
  const [isPlaying, setIsPlayingState] = useState<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const setIsPlaying = (val: boolean) => {
    isPlayingRef.current = val;
    setIsPlayingState(val);
  };

  const [isGameOver, setIsGameOverState] = useState<boolean>(false);
  const isGameOverRef = useRef<boolean>(false);
  const setIsGameOver = (val: boolean) => {
    isGameOverRef.current = val;
    setIsGameOverState(val);
  };

  const [score, setScoreState] = useState<number>(0);
  const scoreRef = useRef<number>(0);
  const setScore = (val: number | ((prev: number) => number)) => {
    if (typeof val === 'function') {
      const newVal = val(scoreRef.current);
      scoreRef.current = newVal;
      setScoreState(newVal);
    } else {
      scoreRef.current = val;
      setScoreState(val);
    }
  };

  const [goldChipsCollected, setGoldChipsCollectedState] = useState<number>(0);
  const goldChipsCollectedRef = useRef<number>(0);
  const setGoldChipsCollected = (val: number | ((prev: number) => number)) => {
    if (typeof val === 'function') {
      const newVal = val(goldChipsCollectedRef.current);
      goldChipsCollectedRef.current = newVal;
      setGoldChipsCollectedState(newVal);
    } else {
      goldChipsCollectedRef.current = val;
      setGoldChipsCollectedState(val);
    }
  };

  const [gameMode, setGameModeState] = useState<GameMode>('CLASSIC');
  const gameModeRef = useRef<GameMode>('CLASSIC');
  const setGameMode = (val: GameMode) => {
    gameModeRef.current = val;
    setGameModeState(val);
  };

  const [themeId, setThemeIdState] = useState<ThemeId>('CYBER');
  const themeIdRef = useRef<ThemeId>('CYBER');
  const setThemeId = (val: ThemeId) => {
    themeIdRef.current = val;
    setThemeIdState(val);
  };

  const [hasShield, setHasShieldState] = useState<boolean>(false);
  const hasShieldRef = useRef<boolean>(false);
  const setHasShield = (val: boolean) => {
    hasShieldRef.current = val;
    setHasShieldState(val);
  };

  const [isSlowMo, setIsSlowMoState] = useState<boolean>(false);
  const isSlowMoRef = useRef<boolean>(false);
  const setIsSlowMo = (val: boolean) => {
    isSlowMoRef.current = val;
    setIsSlowMoState(val);
  };

  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [highScore, setHighScore] = useState<number>(0);
  const [slowMoTimeLeft, setSlowMoTimeLeft] = useState<number>(0);

  // Core physics references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const directionRef = useRef<Point>({ x: 1, y: 0 });
  const nextDirectionRef = useRef<Point>({ x: 1, y: 0 });
  const foodRef = useRef<Point>({ x: 5, y: 5 });
  const isGoldFoodRef = useRef<boolean>(false);
  const gameLoopRef = useRef<number | null>(null);
  const audioRef = useRef<SnakeAudio | null>(null);

  // Portals state (for Portals mode)
  const portalARef = useRef<Point>({ x: 3, y: 3 });
  const portalBRef = useRef<Point>({ x: 16, y: 16 });

  // Asteroids coordinates list (for Asteroids mode)
  const asteroidsRef = useRef<Point[]>([]);

  // Special powerup coordinates
  const powerupRef = useRef<Point | null>(null);
  const powerupTypeRef = useRef<'SHIELD' | 'SLOWMO' | null>(null);

  // Canvas Particles array
  const particlesRef = useRef<Particle[]>([]);

  const GRID_SIZE = 20;

  useEffect(() => {
    audioRef.current = new SnakeAudio();
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = soundMuted;
    }
  }, [soundMuted]);

  // Handle slow motion Countdown
  useEffect(() => {
    if (!isPlaying) return;
    if (isSlowMo) {
      const timer = setInterval(() => {
        setSlowMoTimeLeft(prev => {
          if (prev <= 1) {
            setIsSlowMo(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSlowMo, isPlaying]);

  // Keyboard controls listener (Uses refs to avoid stale closures and endless event rebinding)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayingRef.current || isGameOverRef.current) return;
      const currentDir = directionRef.current;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) {
            nextDirectionRef.current = { x: 0, y: -1 };
            if (audioRef.current) audioRef.current.playTurn();
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) {
            nextDirectionRef.current = { x: 0, y: 1 };
            if (audioRef.current) audioRef.current.playTurn();
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) {
            nextDirectionRef.current = { x: -1, y: 0 };
            if (audioRef.current) audioRef.current.playTurn();
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) {
            nextDirectionRef.current = { x: 1, y: 0 };
            if (audioRef.current) audioRef.current.playTurn();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Particle creation helper
  const addParticles = (x: number, y: number, color: string, count: number = 8) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cellWidth = canvas.width / GRID_SIZE;
    const cellHeight = canvas.height / GRID_SIZE;
    const px = x * cellWidth + cellWidth / 2;
    const py = y * cellHeight + cellHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      particlesRef.current.push({
        x: px,
        y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1.0,
        size: 2 + Math.random() * 3,
        life: 0,
        maxLife: 20 + Math.floor(Math.random() * 15),
      });
    }
  };

  const getActiveMultiplier = (currentScore: number) => {
    let best = MULTIPLIERS[0];
    for (const m of MULTIPLIERS) {
      if (currentScore >= m.minScore) {
        best = m;
      }
    }
    return best;
  };

  const generateFood = () => {
    const snake = snakeRef.current;
    let newFood: Point;
    let attempts = 0;
    do {
      newFood = {
        x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
        y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
      };
      attempts++;
    } while (
      (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
      (gameModeRef.current === 'ASTEROIDS' && asteroidsRef.current.some(ast => ast.x === newFood.x && ast.y === newFood.y)) ||
      (gameModeRef.current === 'PORTALS' && (
        (newFood.x === portalARef.current.x && newFood.y === portalARef.current.y) ||
        (newFood.x === portalBRef.current.x && newFood.y === portalBRef.current.y)
      ))) &&
      attempts < 120
    );

    foodRef.current = newFood;
    isGoldFoodRef.current = Math.random() < 0.22; // 22% chance of gold double-food

    // Chance to spawn special powerup on the board (15% chance per food change)
    if (Math.random() < 0.15 && !powerupRef.current) {
      generatePowerup();
    }
  };

  const generatePowerup = () => {
    const snake = snakeRef.current;
    let newPowerup: Point;
    let attempts = 0;
    do {
      newPowerup = {
        x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
        y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
      };
      attempts++;
    } while (
      (snake.some(segment => segment.x === newPowerup.x && segment.y === newPowerup.y) ||
      (foodRef.current.x === newPowerup.x && foodRef.current.y === newPowerup.y) ||
      (gameModeRef.current === 'ASTEROIDS' && asteroidsRef.current.some(ast => ast.x === newPowerup.x && ast.y === newPowerup.y))) &&
      attempts < 100
    );

    powerupRef.current = newPowerup;
    powerupTypeRef.current = Math.random() < 0.5 ? 'SHIELD' : 'SLOWMO';
  };

  const startGame = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to play Cosmic Snake!', 'error');
      return;
    }

    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);

    // Initial Snake
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    directionRef.current = { x: 1, y: 0 };
    nextDirectionRef.current = { x: 1, y: 0 };
    setScore(0);
    setGoldChipsCollected(0);
    setHasShield(false);
    setIsSlowMo(false);
    setSlowMoTimeLeft(0);
    setIsGameOver(false);
    setIsPlaying(true);
    powerupRef.current = null;
    powerupTypeRef.current = null;
    particlesRef.current = [];

    // Mode-specific initial setups
    if (gameModeRef.current === 'ASTEROIDS') {
      // Spawn 5 stationary asteroid blocks
      const list: Point[] = [];
      while (list.length < 5) {
        const pt = {
          x: Math.floor(Math.random() * 16) + 2,
          y: Math.floor(Math.random() * 16) + 2,
        };
        // Ensure no collision with starting snake zone
        if (Math.abs(pt.x - 10) > 3 || Math.abs(pt.y - 10) > 1) {
          list.push(pt);
        }
      }
      asteroidsRef.current = list;
    } else {
      asteroidsRef.current = [];
    }

    if (gameModeRef.current === 'PORTALS') {
      // Setup portal pairs
      portalARef.current = { x: 3, y: 3 };
      portalBRef.current = { x: 16, y: 16 };
    }

    generateFood();

    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    
    let lastTime = 0;

    const loop = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const diff = timestamp - lastTime;

      // When SlowMo clock is active, tick at half speed
      const baseMs = 100; // Normal dynamic speed
      const targetMs = isSlowMoRef.current ? baseMs * 1.8 : baseMs;

      if (diff >= targetMs) {
        lastTime = timestamp;
        updateGamePhysics();
      } else {
        // Redraw at maximum refresh rate for particle effects!
        drawCanvas();
      }

      if (isPlayingRef.current) {
        gameLoopRef.current = requestAnimationFrame(loop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(loop);
  };

  const updateGamePhysics = () => {
    if (!isPlayingRef.current) return;

    const snake = [...snakeRef.current];
    const nextDir = nextDirectionRef.current;
    directionRef.current = nextDir;

    // Calculate next head coordinate
    let head = {
      x: snake[0].x + nextDir.x,
      y: snake[0].y + nextDir.y,
    };

    // Portal teleport check
    if (gameModeRef.current === 'PORTALS') {
      const pA = portalARef.current;
      const pB = portalBRef.current;
      if (head.x === pA.x && head.y === pA.y) {
        head = { ...pB };
        addParticles(pA.x, pA.y, '#a855f7', 12);
        addParticles(pB.x, pB.y, '#a855f7', 12);
        if (audioRef.current) audioRef.current.playTurn();
      } else if (head.x === pB.x && head.y === pB.y) {
        head = { ...pA };
        addParticles(pB.x, pB.y, '#a855f7', 12);
        addParticles(pA.x, pA.y, '#a855f7', 12);
        if (audioRef.current) audioRef.current.playTurn();
      }
    }

    // Boundary/Wall crash check
    const isWallCrash = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
    
    // Tail crash check
    const isTailCrash = snake.some(segment => segment.x === head.x && segment.y === head.y);

    // Asteroid collision
    const isAsteroidCrash = gameModeRef.current === 'ASTEROIDS' && asteroidsRef.current.some(ast => ast.x === head.x && ast.y === head.y);

    if (isWallCrash || isTailCrash || isAsteroidCrash) {
      if (hasShieldRef.current) {
        // Break shield instead of crashing!
        setHasShield(false);
        triggerAlert('🛡️ Cosmic Shield Absorbed Crash!', 'info');
        addParticles(snake[0].x, snake[0].y, '#06b6d4', 20); // Massive visual spark burst
        if (audioRef.current) audioRef.current.playPowerup();

        // Bounce back snake direction slightly to avoid instant re-crash
        nextDirectionRef.current = { x: -directionRef.current.x, y: -directionRef.current.y };
        return;
      } else {
        endGame();
        return;
      }
    }

    // Put new head onto tail array
    snake.unshift(head);

    // Food collision
    const food = foodRef.current;
    if (head.x === food.x && head.y === food.y) {
      const isGold = isGoldFoodRef.current;
      const theme = THEMES[themeIdRef.current];
      if (isGold) {
        setScore(prev => prev + 3);
        setGoldChipsCollected(prev => prev + 1);
        addParticles(food.x, food.y, theme.secondary, 15);
        if (audioRef.current) audioRef.current.playGold();
      } else {
        setScore(prev => prev + 1);
        addParticles(food.x, food.y, theme.primary, 10);
        if (audioRef.current) audioRef.current.playEat();
      }
      generateFood();
    } else {
      // Remove trailing cell if no food was eaten
      snake.pop();
    }

    // Powerup collision
    if (powerupRef.current && head.x === powerupRef.current.x && head.y === powerupRef.current.y) {
      const type = powerupTypeRef.current;
      if (type === 'SHIELD') {
        setHasShield(true);
        triggerAlert('🛡️ Shield Acquired! Survives 1 crash.', 'success');
        addParticles(powerupRef.current.x, powerupRef.current.y, '#3b82f6', 12);
      } else if (type === 'SLOWMO') {
        setIsSlowMo(true);
        setSlowMoTimeLeft(6);
        triggerAlert('⏱️ Chronos Warp Activated! Time slowed.', 'info');
        addParticles(powerupRef.current.x, powerupRef.current.y, '#fbbf24', 12);
      }
      if (audioRef.current) audioRef.current.playPowerup();
      powerupRef.current = null;
      powerupTypeRef.current = null;
    }

    snakeRef.current = snake;
    drawCanvas();
  };

  const endGame = () => {
    setIsPlaying(false);
    setIsGameOver(true);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    if (audioRef.current) audioRef.current.playCrash();

    // High fidelity reward calculations using Multiplier Ladder (uses ref score to avoid stale closure of 0)
    const finalScore = scoreRef.current;
    const currentTier = getActiveMultiplier(finalScore);
    const payout = Math.floor(betAmount * currentTier.mult);

    if (payout > 0) {
      onUpdateChips(payout);
      onUpdateTask('win_high_odds', 1);
      triggerAlert(`Snake finished! Score of ${finalScore} earned a ${currentTier.mult}x multiplier (+${payout} Chips)! 🏆`, 'success');
    } else {
      triggerAlert(`Crash! Score of ${finalScore} did not reach a multiplier. Earn 5+ points to win back your bet!`, 'info');
    }

    setHighScore(prev => Math.max(prev, finalScore));
  };

  // Safe voluntary Manual cashout
  const handleVoluntaryCashout = () => {
    if (!isPlayingRef.current || isGameOverRef.current) return;
    const finalScore = scoreRef.current;
    const currentTier = getActiveMultiplier(finalScore);
    const payout = Math.floor(betAmount * currentTier.mult);

    setIsPlaying(false);
    setIsGameOver(true);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }

    if (audioRef.current) audioRef.current.playGold();

    if (payout > 0) {
      onUpdateChips(payout);
      triggerAlert(`Successfully cashed out early! Score of ${finalScore} locked in ${currentTier.mult}x (+${payout} Chips)! 💰`, 'success');
    } else {
      triggerAlert('Cashed out early, but score was too low for returns. Reach at least 5 points to secure your bet!', 'info');
    }
    setHighScore(prev => Math.max(prev, finalScore));
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellWidth = width / GRID_SIZE;
    const cellHeight = height / GRID_SIZE;

    const theme = THEMES[themeIdRef.current];

    // 1. Draw solid background matching active theme setting
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw retro mesh grid lines
    ctx.strokeStyle = theme.gridLine;
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(width, i * cellHeight);
      ctx.stroke();
    }

    // 3. Draw Portals if in Portals mode
    if (gameModeRef.current === 'PORTALS') {
      const portals = [portalARef.current, portalBRef.current];
      portals.forEach((p, idx) => {
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#a855f7';
        // Pulsing radius animation
        const pulse = 0.35 + Math.sin(Date.now() * 0.006 + idx * Math.PI) * 0.08;
        ctx.fillStyle = 'rgba(168, 85, 247, 0.25)';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(
          p.x * cellWidth + cellWidth / 2,
          p.y * cellHeight + cellHeight / 2,
          cellWidth * pulse,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.stroke();

        // Inner core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(
          p.x * cellWidth + cellWidth / 2,
          p.y * cellHeight + cellHeight / 2,
          cellWidth * 0.15,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      });
    }

    // 4. Draw Asteroids blocks in Obstacle Mode
    if (gameModeRef.current === 'ASTEROIDS') {
      asteroidsRef.current.forEach((ast) => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#f97316';
        ctx.fillStyle = '#ea580c';
        
        const cx = ast.x * cellWidth + cellWidth / 2;
        const cy = ast.y * cellHeight + cellHeight / 2;

        ctx.beginPath();
        ctx.roundRect(
          ast.x * cellWidth + 2,
          ast.y * cellHeight + 2,
          cellWidth - 4,
          cellHeight - 4,
          6
        );
        ctx.fill();
        
        // Crag details
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 3, 2, 0, Math.PI * 2);
        ctx.arc(cx + 3, cy + 3, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // 5. Draw Special Powerups if spawned
    if (powerupRef.current) {
      const p = powerupRef.current;
      const type = powerupTypeRef.current;
      const color = type === 'SHIELD' ? '#3b82f6' : '#f59e0b';

      ctx.save();
      ctx.shadowBlur = 14;
      ctx.shadowColor = color;
      ctx.fillStyle = color;

      const cx = p.x * cellWidth + cellWidth / 2;
      const cy = p.y * cellHeight + cellHeight / 2;
      const pulse = 0.4 + Math.sin(Date.now() * 0.01) * 0.06;

      ctx.beginPath();
      ctx.arc(cx, cy, cellWidth * pulse, 0, Math.PI * 2);
      ctx.fill();

      // White core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, cellWidth * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Draw Food Chip (pulsing)
    const food = foodRef.current;
    const isGold = isGoldFoodRef.current;
    const foodColor = isGold ? theme.secondary : theme.primary;
    
    ctx.save();
    ctx.shadowBlur = 14 + Math.sin(Date.now() * 0.008) * 4;
    ctx.shadowColor = foodColor;
    ctx.fillStyle = foodColor;

    ctx.beginPath();
    ctx.arc(
      food.x * cellWidth + cellWidth / 2,
      food.y * cellHeight + cellHeight / 2,
      cellWidth * (isGold ? 0.42 : 0.38),
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Inside decorative white core highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(
      food.x * cellWidth + cellWidth / 2,
      food.y * cellHeight + cellHeight / 2,
      cellWidth * (isGold ? 0.16 : 0.12),
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    // 7. Draw Snake segments
    const snake = snakeRef.current;
    snake.forEach((segment, idx) => {
      ctx.save();
      
      // Dynamic color: Head has glowing corona or custom aura
      if (idx === 0) {
        ctx.shadowBlur = hasShieldRef.current ? 18 : 12;
        ctx.shadowColor = hasShieldRef.current ? '#06b6d4' : theme.glowColor;
        ctx.fillStyle = hasShieldRef.current ? '#06b6d4' : theme.snakeHead;

        ctx.beginPath();
        ctx.arc(
          segment.x * cellWidth + cellWidth / 2,
          segment.y * cellHeight + cellHeight / 2,
          cellWidth * 0.48,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Draw snake eyes
        ctx.fillStyle = '#ffffff';
        const eyeRadius = cellWidth * 0.1;
        const dir = directionRef.current;
        const cx = segment.x * cellWidth + cellWidth / 2;
        const cy = segment.y * cellHeight + cellHeight / 2;

        if (dir.x !== 0) { // Moving horizontally
          ctx.beginPath();
          ctx.arc(cx + dir.x * 2.5, cy - 3.5, eyeRadius, 0, Math.PI * 2);
          ctx.arc(cx + dir.x * 2.5, cy + 3.5, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
        } else { // Moving vertically
          ctx.beginPath();
          ctx.arc(cx - 3.5, cy + dir.y * 2.5, eyeRadius, 0, Math.PI * 2);
          ctx.arc(cx + 3.5, cy + dir.y * 2.5, eyeRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Body has progressive gradient scaling down
        const fillPercent = 1 - (idx / snake.length);
        ctx.shadowBlur = 4;
        ctx.shadowColor = theme.glowColor;
        ctx.fillStyle = `rgba(${themeIdRef.current === 'CYBER' ? '59, 130, 246' : themeIdRef.current === 'SUNSET' ? '236, 72, 153' : '34, 197, 94'}, ${fillPercent * 0.8 + 0.2})`;

        const padding = 1.2;
        ctx.beginPath();
        ctx.roundRect(
          segment.x * cellWidth + padding,
          segment.y * cellHeight + padding,
          cellWidth - padding * 2,
          cellHeight - padding * 2,
          5
        );
        ctx.fill();
      }
      ctx.restore();
    });

    // 8. Draw active Particles physics
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94; // Friction
      p.vy *= 0.94;
      p.life++;
      p.alpha = 1 - p.life / p.maxLife;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Filter dead particles
    particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);
  };

  const handleMobileDir = (x: number, y: number) => {
    if (!isPlayingRef.current || isGameOverRef.current) return;
    const currentDir = directionRef.current;
    if (x !== 0 && currentDir.x === -x) return;
    if (y !== 0 && currentDir.y === -y) return;

    nextDirectionRef.current = { x, y };
    if (audioRef.current) audioRef.current.playTurn();
  };

  const doubleBet = () => {
    setBetAmount(prev => Math.min(chips, prev * 2));
  };

  const halveBet = () => {
    setBetAmount(prev => Math.max(10, Math.round(prev / 2)));
  };

  const setBetMax = () => {
    setBetAmount(Math.min(chips, 1000));
  };

  const activeLadder = getActiveMultiplier(score);

  return (
    <div id="snake-arena-wrapper" className="bg-[#0b0c24]/85 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-90px] left-[-90px] w-64 h-64 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-90px] right-[-90px] w-64 h-64 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/5">
            <Orbit className="w-6 h-6 animate-spin-slow text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white uppercase font-sans flex items-center gap-2">
              Cosmic Neon Snake <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold">Stable v2.1</span>
            </h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Steer around portals & collect neon chips</p>
          </div>
        </div>

        {/* Audio / Theme controls in Header */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          
          {/* Theme selector */}
          <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
            <Palette className="w-3.5 h-3.5 text-white/40 ml-1.5" />
            {(['CYBER', 'SUNSET', 'MATRIX'] as const).map((tId) => (
              <button
                key={tId}
                onClick={() => setThemeId(tId)}
                className={`px-2 py-1 rounded-lg text-[9px] font-mono uppercase transition-all font-black cursor-pointer ${
                  themeId === tId 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-white/40 hover:text-white'
                }`}
              >
                {tId}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white transition-all cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
          </button>
          
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best: <span className="font-black text-amber-400">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Main Grid layout with Multiplier Ladder */}
      <div className="grid lg:grid-cols-[1fr_1.6fr_1fr] gap-6 items-start">
        
        {/* LEFT COLUMN: Controls & Wagers */}
        <div className="space-y-5">
          
          {/* Choose Game Mode Segment */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2.5">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Select Cosmic Grid Mode</span>
            <div className="flex flex-col gap-1.5">
              {[
                { mode: 'CLASSIC' as const, name: 'Classic Mode', desc: 'Standard retro neon matrix' },
                { mode: 'PORTALS' as const, name: 'Nebula Wormholes', desc: 'Teleporting cosmic portals' },
                { mode: 'ASTEROIDS' as const, name: 'Solar Asteroids', desc: 'Stationary burning block hazards' }
              ].map((m) => (
                <button
                  key={m.mode}
                  disabled={isPlaying}
                  onClick={() => setGameMode(m.mode)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer block ${
                    gameMode === m.mode
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-md shadow-indigo-500/5'
                      : 'bg-transparent text-white/40 border-transparent hover:bg-white/2 hover:text-white'
                  } disabled:opacity-60`}
                >
                  <div className="text-[11px] font-black uppercase tracking-wide">{m.name}</div>
                  <div className="text-[9px] text-white/45 font-mono">{m.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Enter Draw Wager bet size selector */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/60 uppercase font-bold tracking-wide flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> Place Wager
              </span>
              <span className="text-[10px] text-white/30 font-mono">Min: 10 | Max: 1,000</span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
              <input
                type="number"
                disabled={isPlaying}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Math.min(chips, parseInt(e.target.value) || 10)))}
                className="bg-transparent border-none outline-none text-white font-mono font-black text-base flex-1 min-w-0 disabled:opacity-50 pl-1"
              />
              {!isPlaying && (
                <div className="flex items-center gap-1">
                  <button onClick={halveBet} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">½</button>
                  <button onClick={doubleBet} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">2x</button>
                  <button onClick={setBetMax} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded border border-blue-500/20 transition-all cursor-pointer">Max</button>
                </div>
              )}
            </div>
          </div>

          {/* Active Powerups Status box */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Active Shield & Time Status</span>
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-2.5 rounded-xl border text-center font-mono text-[10px] flex flex-col items-center justify-center gap-1 transition-all ${
                hasShield ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25 shadow-lg' : 'bg-transparent text-white/20 border-white/5'
              }`}>
                <Shield className={`w-4 h-4 ${hasShield ? 'animate-bounce text-cyan-400' : ''}`} />
                <span className="font-bold">SHIELD {hasShield ? 'ON 🛡️' : 'OFF'}</span>
              </div>

              <div className={`p-2.5 rounded-xl border text-center font-mono text-[10px] flex flex-col items-center justify-center gap-1 transition-all ${
                isSlowMo ? 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow-lg' : 'bg-transparent text-white/20 border-white/5'
              }`}>
                <Zap className={`w-4 h-4 ${isSlowMo ? 'animate-pulse text-amber-400' : ''}`} />
                <span className="font-bold">SLOWMO {isSlowMo ? `${slowMoTimeLeft}s` : 'OFF'}</span>
              </div>
            </div>
          </div>

          {/* Core play controls */}
          {!isPlaying ? (
            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-blue-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> Insert Bet & Run
            </button>
          ) : (
            <button
              onClick={handleVoluntaryCashout}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              💰 Safe Cashout ({activeLadder.mult}x)
            </button>
          )}

        </div>

        {/* MIDDLE COLUMN: The Canvas Arena */}
        <div className="flex flex-col items-center justify-center space-y-5">
          
          {/* Canvas container */}
          <div className="relative border-[6px] border-white/10 rounded-3xl overflow-hidden bg-black shadow-inner">
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="block w-full max-w-[380px] aspect-square"
            />
            
            {/* Lobby Setup Overlay */}
            {!isPlaying && !isGameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-indigo-400 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="text-base font-black text-white uppercase tracking-tight">Insert Bet to Steer!</h4>
                  <p className="text-[11px] text-white/50 font-mono leading-relaxed max-w-[260px]">
                    Use keyboard <strong className="text-blue-400 font-bold">WASD / Arrow Keys</strong> or tactile touch buttons below to navigate the arena!
                  </p>
                </div>
                <button
                  onClick={startGame}
                  className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-black font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Launch Arena
                </button>
              </div>
            )}

            {/* Game Over Screen overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
                <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 font-bold text-xl">
                  💥
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-red-400 uppercase tracking-tight">Crashed Segment!</h4>
                  <p className="text-xs text-white/60 font-mono">Total chips collected: <strong className="text-white text-base">{score}</strong></p>
                </div>
                
                <div className="bg-white/5 rounded-xl px-5 py-2 border border-white/5 font-mono text-[10px] text-white/40">
                  Locked-in Multiplier: <span className="text-emerald-400 font-black text-xs">{activeLadder.mult}x</span>
                </div>

                <button
                  onClick={startGame}
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-black font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Start Again
                </button>
              </div>
            )}
          </div>

          {/* Tactical touch controls panel */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleMobileDir(0, -1)}
              className="w-12 h-10 bg-white/5 active:bg-blue-500/25 border border-white/10 hover:border-blue-500/30 rounded-xl flex items-center justify-center text-white/60 active:text-blue-400 transition-all cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleMobileDir(-1, 0)}
                className="w-12 h-10 bg-white/5 active:bg-blue-500/25 border border-white/10 hover:border-blue-500/30 rounded-xl flex items-center justify-center text-white/60 active:text-blue-400 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMobileDir(1, 0)}
                className="w-12 h-10 bg-white/5 active:bg-blue-500/25 border border-white/10 hover:border-blue-500/30 rounded-xl flex items-center justify-center text-white/60 active:text-blue-400 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => handleMobileDir(0, 1)}
              className="w-12 h-10 bg-white/5 active:bg-blue-500/25 border border-white/10 hover:border-blue-500/30 rounded-xl flex items-center justify-center text-white/60 active:text-blue-400 transition-all cursor-pointer"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Multiplier Ladder Tiers */}
        <div className="space-y-4">
          
          {/* Ladder board container */}
          <div className="bg-black/45 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Gauge className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest font-black">Multiplier Ladder</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {[...MULTIPLIERS].reverse().map((tier, idx) => {
                const isCurrent = activeLadder.minScore === tier.minScore;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-xl border text-[10px] font-mono transition-all ${
                      isCurrent 
                        ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-white border-emerald-500/40 shadow-md shadow-emerald-500/5' 
                        : 'bg-transparent text-white/40 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-emerald-400 animate-ping' : 'bg-white/15'}`} />
                      <span className="font-bold">{tier.label}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[9px] text-white/30 font-mono">Eaten: {tier.minScore}+</span>
                      <span className={`text-right text-xs font-black ${isCurrent ? 'text-emerald-400' : 'text-white/70'}`}>
                        {tier.mult.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simple rules instructions card */}
          <div className="bg-[#050516]/60 border border-white/5 rounded-2xl p-4 text-[10px] text-white/40 leading-relaxed space-y-2">
            <h5 className="font-bold text-white flex items-center gap-1.5 font-sans uppercase text-[10px] tracking-wider text-blue-400">
              <HelpCircle className="w-3.5 h-3.5" /> Strategy Tips
            </h5>
            <p>
              🛡️ Grab blue shield items to escape instant segment crashes!
            </p>
            <p>
              ⏱️ Clock timers slow down speed, giving you fine control.
            </p>
            <p>
              🌟 Grab your payout early by hitting the safe Cashout button before you crash!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
