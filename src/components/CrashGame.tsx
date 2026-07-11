import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Coins, Sparkles, TrendingUp, ShieldAlert, Award, Volume2, VolumeX, ArrowUpRight } from 'lucide-react';

interface CrashGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export const CrashGame: React.FC<CrashGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  // Game states
  const [betAmount, setBetAmount] = useState<number>(50);
  const [autoCashoutValue, setAutoCashoutValue] = useState<string>('2.5');
  const [isAutoCashoutEnabled, setIsAutoCashoutEnabled] = useState<boolean>(false);
  
  const [gameState, setGameState] = useState<'IDLE' | 'COUNTDOWN' | 'FLYING' | 'CRASHED' | 'CASHED_OUT'>('IDLE');
  const [countdown, setCountdown] = useState<number>(3);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(null);
  const [chipsWon, setChipsWon] = useState<number>(0);
  
  // History of previous crashes
  const [crashHistory, setCrashHistory] = useState<number[]>(() => {
    return [1.45, 3.21, 1.12, 10.45, 2.15, 1.88, 4.22, 1.05];
  });

  const [muted, setMuted] = useState<boolean>(false);

  // Refs for drawing & audio loops
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const gameStateRef = useRef(gameState);
  const multiplierRef = useRef(1.0);
  const crashPointRef = useRef(1.0);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<{ x: number; y: number; speed: number; r: number }[]>([]);
  
  // Audio context references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Synchronize state ref to bypass closures
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    multiplierRef.current = currentMultiplier;
  }, [currentMultiplier]);

  // Initialize stars once
  useEffect(() => {
    const tempStars = [];
    for (let i = 0; i < 40; i++) {
      tempStars.push({
        x: Math.random() * 500,
        y: Math.random() * 300,
        speed: 0.5 + Math.random() * 1.5,
        r: 0.5 + Math.random() * 1.2
      });
    }
    starsRef.current = tempStars;
  }, []);

  // Web Audio FX Init / Start
  const startEngineSound = () => {
    if (muted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, ctx.currentTime); // Low engine hum initially
      
      gain.gain.setValueAtTime(0.005, ctx.currentTime); // Quiet hum
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn("Audio error:", e);
    }
  };

  const updateEngineSound = (mult: number) => {
    if (muted || !oscillatorRef.current || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      // Frequency rises linearly with multiplier
      const targetFreq = Math.min(440, 60 + (mult - 1) * 35);
      oscillatorRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
      
      // Volume rises slightly as height grows
      const targetVol = Math.min(0.03, 0.005 + (mult - 1) * 0.002);
      gainNodeRef.current?.gain.setTargetAtTime(targetVol, ctx.currentTime, 0.2);
    } catch (e) {}
  };

  const stopEngineSound = (type: 'crash' | 'cashout' | 'mute') => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {}

    if (muted) return;

    // Play secondary effects
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'crash') {
        // Crash explosion noise (white noise burst)
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.3);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === 'cashout') {
        // High luxury chime
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc2.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.15); // C6
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        
        osc1.start();
        osc2.start();
        
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
            ctx.close();
          } catch (e) {}
        }, 500);
        return;
      }
      setTimeout(() => {
        try { ctx.close(); } catch (e) {}
      }, 500);
    } catch (e) {}
  };

  // Launch countdown trigger
  const handleLaunch = () => {
    if (gameState !== 'IDLE' && gameState !== 'CRASHED' && gameState !== 'CASHED_OUT') return;
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to launch rocket! Place a lower wager.', 'error');
      return;
    }

    // Deduct bet amount
    onUpdateChips(-betAmount);
    setChipsWon(0);
    setCashoutMultiplier(null);
    setCurrentMultiplier(1.0);
    multiplierRef.current = 1.0;
    particlesRef.current = [];
    
    // Select a secure, exciting crash multiplier
    // Standard crash math: 97% RTP, multiplier formula = 0.97 / (1 - random)
    const random = Math.random();
    // Enforce house edge but allow wild runs (e.g. up to 60x max for visual reasons)
    let selectedCrashPoint = 0.98 / (1.0 - random * 0.98);
    // Instant crash (1.00x) check 3.5% probability
    if (Math.random() < 0.035) {
      selectedCrashPoint = 1.00;
    }
    // Cap at 75x for stellar rewards
    selectedCrashPoint = Math.min(75, Math.max(1.0, parseFloat(selectedCrashPoint.toFixed(2))));
    crashPointRef.current = selectedCrashPoint;

    setGameState('COUNTDOWN');
    setCountdown(3);
  };

  // Handle countdown tick down
  useEffect(() => {
    if (gameState !== 'COUNTDOWN') return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Start flight
          setGameState('FLYING');
          startEngineSound();
          return 0;
        }
        return prev - 1;
      });
    }, 850);

    return () => clearInterval(timer);
  }, [gameState]);

  // Flying engine tick
  useEffect(() => {
    if (gameState !== 'FLYING') return;

    let startTime = Date.now();
    let animId: number;

    const gameLoop = () => {
      const elapsed = (Date.now() - startTime) / 1000; // seconds
      
      // Calculate multiplier curve (rises exponentially: 1.00 + elapsed^1.5 * scale)
      const multiplierRate = 0.07;
      let nextMult = 1.0 + Math.pow(elapsed, 1.28) * multiplierRate;
      nextMult = Math.round(nextMult * 100) / 100;

      // Auto-cashout checker
      if (isAutoCashoutEnabled) {
        const threshold = parseFloat(autoCashoutValue);
        if (!isNaN(threshold) && threshold > 1.0 && nextMult >= threshold && threshold <= crashPointRef.current) {
          handleCashout(threshold);
          return;
        }
      }

      // Check if crashed
      if (nextMult >= crashPointRef.current) {
        // Boom!
        setCurrentMultiplier(crashPointRef.current);
        triggerCrash();
        return;
      }

      setCurrentMultiplier(nextMult);
      updateEngineSound(nextMult);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    requestRef.current = animId;

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [gameState, isAutoCashoutEnabled, autoCashoutValue]);

  // Trigger cashout action
  const handleCashout = (specificMult?: number) => {
    if (gameStateRef.current !== 'FLYING') return;

    const finalMult = specificMult || multiplierRef.current;
    const winnings = Math.round(betAmount * finalMult);
    
    setCashoutMultiplier(finalMult);
    setChipsWon(winnings);
    setGameState('CASHED_OUT');
    
    // Add chips won
    onUpdateChips(winnings);
    stopEngineSound('cashout');

    // Stats and notifications
    triggerAlert(`🚀 Star Cashout! Claimed +${winnings} Chips at ${finalMult.toFixed(2)}x!`, 'success');
    onUpdateTask('play_slots', 1); // Contributes to tasks
    
    if (winnings >= 200) {
      onUpdateTask('win_dice', 1);
    }

    // Add to history
    setCrashHistory((prev) => [crashPointRef.current, ...prev.slice(0, 11)]);
  };

  // Crash event
  const triggerCrash = () => {
    setGameState('CRASHED');
    stopEngineSound('crash');
    triggerAlert(`💥 EXPLODED at ${crashPointRef.current.toFixed(2)}x! Better luck on the next orbit.`, 'error');
    
    // Add to history
    setCrashHistory((prev) => [crashPointRef.current, ...prev.slice(0, 11)]);
  };

  // Canvas drawing effect for Space Flight
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.parentElement?.clientWidth || 500;
    let height = canvas.height = 300;

    // Resize canvas on layout changes
    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 300;
      }
    };
    window.addEventListener('resize', handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const state = gameStateRef.current;
      const mult = multiplierRef.current;

      // Draw Grid / Coordinate lines (fades in slightly)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let i = 50; i < width; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height - 30);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let i = 40; i < height - 30; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Bottom baseline axis
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height - 30);
      ctx.lineTo(width, height - 30);
      ctx.stroke();

      // Horizontal Axis Labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '10px monospace';
      ctx.fillText('0s', 15, height - 15);
      ctx.fillText('5s', width * 0.25, height - 15);
      ctx.fillText('10s', width * 0.5, height - 15);
      ctx.fillText('15s', width * 0.75, height - 15);
      ctx.fillText('Velocity', width - 55, height - 15);

      // Scroll/update stars downwards and leftwards depending on state
      const starSpeedFactor = state === 'FLYING' ? 1 + (mult - 1) * 1.5 : 0.4;
      starsRef.current.forEach((star) => {
        star.y += star.speed * starSpeedFactor;
        star.x -= star.speed * starSpeedFactor * 0.5;

        // Reset stars
        if (star.y > height - 30) {
          star.y = 0;
          star.x = Math.random() * width;
        }
        if (star.x < 0) {
          star.x = width;
          star.y = Math.random() * (height - 30);
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${star.speed * 0.35})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Calculate rocket coordinates along a bezier exponential flight curve
      // Origin is bottom left (30px offset)
      // Destination moves towards top-right of canvas as multiplier increases
      let startX = 40;
      let startY = height - 35;
      
      // Map progress
      let progress = Math.min(1.0, (mult - 1.0) / 10.0); // scales up to 11x visually
      let rocketX = startX + progress * (width - 120);
      let rocketY = startY - Math.pow(progress, 1.2) * (height - 100);

      // Constrain inside bounds
      rocketX = Math.max(startX, Math.min(width - 60, rocketX));
      rocketY = Math.max(40, Math.min(startY, rocketY));

      if (state === 'FLYING' || state === 'CASHED_OUT' || state === 'CRASHED') {
        // Draw Curved Path Line
        ctx.strokeStyle = state === 'CRASHED' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        // Quad curve path
        ctx.quadraticCurveTo((startX + rocketX) / 2, startY + 10, rocketX, rocketY);
        ctx.stroke();

        // Rocket booster engine fire particles
        if (state === 'FLYING') {
          const spawnCount = 2 + Math.floor(mult / 3);
          for (let p = 0; p < spawnCount; p++) {
            const angle = Math.PI * 1.2 + (Math.random() * 0.3); // back-facing angle
            const speed = 1.5 + Math.random() * 3 + (mult * 0.5);
            particlesRef.current.push({
              x: rocketX - 5,
              y: rocketY + 5,
              vx: Math.cos(angle) * speed - (mult * 0.2),
              vy: Math.sin(angle) * speed + (mult * 0.2),
              size: 2 + Math.random() * 4,
              color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444', // yellow vs red
              alpha: 0.9,
              life: 0,
              maxLife: 20 + Math.random() * 15
            });
          }
        }

        // Draw Explosion Particle ring when crashed
        if (state === 'CRASHED' && particlesRef.current.length === 0) {
          for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.0 + Math.random() * 6;
            particlesRef.current.push({
              x: rocketX,
              y: rocketY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: 3 + Math.random() * 6,
              color: i % 3 === 0 ? '#ef4444' : i % 3 === 1 ? '#f59e0b' : '#3f3f46',
              alpha: 1.0,
              life: 0,
              maxLife: 40 + Math.random() * 25
            });
          }
        }
      }

      // Update & Draw particles
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1.0 - (p.life / p.maxLife);

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; // reset
      });

      // Filter dead particles
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      // Render Rocket Sprite
      if (state === 'FLYING' || state === 'CASHED_OUT') {
        ctx.save();
        ctx.translate(rocketX, rocketY);
        
        // Rotate slightly upwards based on climb progress
        const tilt = -Math.PI / 12 - (progress * Math.PI / 8);
        ctx.rotate(tilt);

        // Rocket body
        ctx.fillStyle = '#f4f4f5'; // White metal
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cockpit window
        ctx.fillStyle = '#38bdf8'; // Sky blue glass
        ctx.beginPath();
        ctx.arc(6, -1, 3, 0, Math.PI * 2);
        ctx.fill();

        // Rocket nose cone
        ctx.fillStyle = '#ef4444'; // Red nose
        ctx.beginPath();
        ctx.moveTo(11, -5);
        ctx.quadraticCurveTo(18, 0, 11, 5);
        ctx.fill();

        // Bottom thruster booster engine
        ctx.fillStyle = '#71717a';
        ctx.fillRect(-19, -3, 4, 6);

        // Rocket fins
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-11, -4);
        ctx.lineTo(-18, -10);
        ctx.lineTo(-11, -7);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-11, 4);
        ctx.lineTo(-18, 10);
        ctx.lineTo(-11, 7);
        ctx.fill();

        ctx.restore();
      }

      // Drawn HUD Text elements (Cashed out flag or Crash cross)
      if (state === 'CASHED_OUT') {
        ctx.fillStyle = '#10b981'; // Green flag
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText('✓ CASH OUT', rocketX - 25, rocketY - 20);
      } else if (state === 'CRASHED') {
        // Red indicator cross
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(rocketX - 8, rocketY - 8);
        ctx.lineTo(rocketX + 8, rocketY + 8);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rocketX + 8, rocketY - 8);
        ctx.lineTo(rocketX - 8, rocketY + 8);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Clean audio ref on component unmount
  useEffect(() => {
    return () => {
      try {
        if (oscillatorRef.current) oscillatorRef.current.stop();
        if (audioCtxRef.current) audioCtxRef.current.close();
      } catch (e) {}
    };
  }, []);

  // Half, double multipliers
  const adjustBet = (mode: 'HALF' | 'DOUBLE' | 'MAX' | 'MIN') => {
    if (gameState === 'FLYING' || gameState === 'COUNTDOWN') return;
    if (mode === 'HALF') {
      setBetAmount(prev => Math.max(10, Math.floor(prev / 2)));
    } else if (mode === 'DOUBLE') {
      setBetAmount(prev => Math.min(chips, prev * 2));
    } else if (mode === 'MIN') {
      setBetAmount(10);
    } else if (mode === 'MAX') {
      setBetAmount(Math.min(500, chips));
    }
  };

  return (
    <div className="bg-[#0a0a1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Header and Crash History strip */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-black uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full">
            High Volatility
          </span>
          <h3 className="text-xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
            🚀 Vegas Rocket Crash
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">Watch the multiplier climb! Cash out before the rocket explodes!</p>
        </div>

        {/* History dots */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full md:max-w-md scrollbar-none">
          <span className="text-[8px] font-mono font-bold text-white/30 uppercase tracking-wider mr-1">History:</span>
          {crashHistory.map((hist, index) => {
            const isMega = hist >= 10.0;
            const isMedium = hist >= 2.0;
            return (
              <span
                key={index}
                className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold shrink-0 ${
                  isMega 
                    ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30 shadow-[0_0_8px_rgba(251,191,36,0.15)]'
                    : isMedium
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/10'
                      : 'bg-white/5 text-white/40 border border-transparent'
                }`}
              >
                {hist.toFixed(2)}x
              </span>
            );
          })}
        </div>
      </div>

      {/* Core Simulator Stage */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        
        {/* Left Side: Canvas + Multiplier HUD */}
        <div className="bg-[#05050e] border border-white/10 rounded-2xl p-4 shadow-inner relative flex flex-col justify-between overflow-hidden group min-h-[300px]">
          
          {/* Audio controller */}
          <button
            onClick={() => {
              const nextMuted = !muted;
              setMuted(nextMuted);
              if (nextMuted) {
                stopEngineSound('mute');
              }
            }}
            className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all z-20 cursor-pointer"
            title={muted ? "Unmute sounds" : "Mute sounds"}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Canvas Component */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 block pointer-events-none" />

          {/* Centered Floating HUD elements (Multiplier count & status alerts) */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center py-10">
            <AnimatePresence mode="wait">
              
              {/* Countdowns */}
              {gameState === 'COUNTDOWN' && (
                <motion.div
                  key="countdown"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="flex flex-col items-center justify-center space-y-1.5"
                >
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">Ignition sequence</span>
                  <span className="text-6xl font-black tracking-tight text-white font-mono">{countdown}s</span>
                  <span className="text-[9px] font-mono text-white/30 uppercase">Engines spooling...</span>
                </motion.div>
              )}

              {/* Flight Multiplier Panel */}
              {(gameState === 'FLYING' || gameState === 'CASHED_OUT' || gameState === 'CRASHED') && (
                <motion.div
                  key="multiplier"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center space-y-1"
                >
                  {gameState === 'CASHED_OUT' && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-bounce">
                      🚀 Cashed Out!
                    </span>
                  )}
                  {gameState === 'CRASHED' && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                      💥 Exploded
                    </span>
                  )}
                  {gameState === 'FLYING' && (
                    <span className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1">
                      Orbit Altitude
                    </span>
                  )}

                  <span className={`text-6xl sm:text-7xl font-mono font-black tracking-tighter transition-all ${
                    gameState === 'CRASHED' 
                      ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.2)] line-through' 
                      : gameState === 'CASHED_OUT' 
                        ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                        : 'text-white'
                  }`}>
                    {currentMultiplier.toFixed(2)}x
                  </span>

                  <span className="text-[10px] font-mono text-white/40 tracking-wider">
                    {gameState === 'FLYING' 
                      ? `Current payout: ${Math.round(betAmount * currentMultiplier)} Chips` 
                      : gameState === 'CASHED_OUT'
                        ? `Cashed out at ${cashoutMultiplier?.toFixed(2)}x`
                        : `Crashed point: ${crashPointRef.current.toFixed(2)}x`
                    }
                  </span>
                </motion.div>
              )}

              {/* Idle screen info */}
              {gameState === 'IDLE' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center space-y-3.5 max-w-xs px-4"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500/10 to-red-500/10 flex items-center justify-center border border-white/10 shadow-lg animate-pulse">
                    <Rocket className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Rocket Ready for Launch</h4>
                    <p className="text-[10px] text-white/40 font-sans leading-relaxed mt-1">
                      Set your wager, toggle Auto-Cashout triggers if desired, and launch into the atmosphere to multiply your chips.
                    </p>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Footer warning line inside board */}
          <div className="relative z-10 w-full flex justify-between items-center text-[8px] font-mono text-white/20 px-2 border-t border-white/5 pt-2 mt-2">
            <span>FLIGHT RADAR ACTIVE</span>
            <span>AUTO-EJECT ESCAPE SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Right Side: Bet Controls & Configuration Drawer */}
        <div className="flex flex-col justify-between space-y-4">
          
          {/* Bet Amount Panel */}
          <div className="bg-[#111126]/40 border border-white/5 rounded-2xl p-4.5 space-y-4">
            <div>
              <span className="block text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1.5 font-bold">
                Wager Amount (Chips)
              </span>
              
              <div className="flex gap-1.5">
                <input
                  type="number"
                  disabled={gameState === 'FLYING' || gameState === 'COUNTDOWN'}
                  value={betAmount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setBetAmount(Math.min(chips, Math.max(10, val)));
                  }}
                  className="bg-[#05050e] border border-white/10 hover:border-white/20 focus:border-amber-400 text-sm font-black font-mono text-amber-400 text-center px-3 py-2.5 rounded-xl focus:outline-none flex-1 transition-colors disabled:opacity-40"
                />
                
                <button
                  type="button"
                  disabled={gameState === 'FLYING' || gameState === 'COUNTDOWN'}
                  onClick={() => adjustBet('HALF')}
                  className="px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold rounded-xl transition-all disabled:opacity-30 cursor-pointer"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={gameState === 'FLYING' || gameState === 'COUNTDOWN'}
                  onClick={() => adjustBet('DOUBLE')}
                  className="px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold rounded-xl transition-all disabled:opacity-30 cursor-pointer"
                >
                  2x
                </button>
                <button
                  type="button"
                  disabled={gameState === 'FLYING' || gameState === 'COUNTDOWN'}
                  onClick={() => adjustBet('MAX')}
                  className="px-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold text-amber-400/80 rounded-xl transition-all disabled:opacity-30 cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Quick Chips Select Grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {[10, 20, 50, 100].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={gameState === 'FLYING' || gameState === 'COUNTDOWN' || chips < preset}
                  onClick={() => setBetAmount(preset)}
                  className={`py-1.5 border rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    betAmount === preset
                      ? 'border-amber-400 text-amber-300 bg-amber-400/5 font-extrabold'
                      : 'bg-black/35 border-white/5 text-white/50 hover:border-white/10'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Section: Auto Cashout target */}
          <div className="bg-[#111126]/40 border border-white/5 rounded-2xl p-4.5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold text-white mb-0.5">Auto Cashout</span>
                <p className="text-[10px] text-white/40">Ejects automatically at target</p>
              </div>
              <button
                disabled={gameState === 'FLYING' || gameState === 'COUNTDOWN'}
                onClick={() => setIsAutoCashoutEnabled(!isAutoCashoutEnabled)}
                className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 disabled:opacity-40 cursor-pointer ${
                  isAutoCashoutEnabled ? 'bg-amber-400' : 'bg-white/10'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-300 ${
                  isAutoCashoutEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <AnimatePresence>
              {isAutoCashoutEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2 pt-1"
                >
                  <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest font-bold">
                    Target Multiplier Threshold
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={gameState === 'FLYING' || gameState === 'COUNTDOWN'}
                      value={autoCashoutValue}
                      onChange={(e) => setAutoCashoutValue(e.target.value)}
                      className="w-full bg-[#05050e] border border-white/10 focus:border-amber-400 text-sm font-black font-mono text-amber-400 px-3 py-2 rounded-xl focus:outline-none transition-colors"
                      placeholder="e.g. 2.00"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-white/30">x</span>
                  </div>
                  <div className="flex gap-1.5">
                    {['1.5', '2.0', '3.0', '5.0'].map((mul) => (
                      <button
                        key={mul}
                        type="button"
                        disabled={gameState === 'FLYING' || gameState === 'COUNTDOWN'}
                        onClick={() => setAutoCashoutValue(mul)}
                        className={`flex-1 py-1 rounded border text-[9px] font-mono transition-all cursor-pointer ${
                          autoCashoutValue === mul
                            ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                            : 'bg-black/20 border-white/5 text-white/40 hover:border-white/10'
                        }`}
                      >
                        {mul}x
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Trigger Button */}
          <div>
            {gameState === 'FLYING' ? (
              <button
                onClick={() => handleCashout()}
                type="button"
                className="w-full py-4.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-black text-sm tracking-widest uppercase rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(16,185,129,0.35)] active:scale-95 cursor-pointer"
              >
                <ArrowUpRight className="w-5 h-5 animate-pulse" />
                CASH OUT NOW
              </button>
            ) : (
              <button
                onClick={handleLaunch}
                disabled={gameState === 'COUNTDOWN' || chips < betAmount}
                type="button"
                className={`w-full py-4.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-sm tracking-widest uppercase rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer disabled:brightness-50 disabled:scale-100 disabled:cursor-not-allowed`}
              >
                <Rocket className="w-5 h-5" />
                {gameState === 'COUNTDOWN' ? 'ENGINES IGNITING...' : 'LAUNCH ROCKET'}
              </button>
            )}
          </div>

          {/* Outcome Chime Summary Block */}
          <div className="min-h-[50px] flex items-center justify-center text-center">
            <AnimatePresence mode="wait">
              {gameState === 'CASHED_OUT' && (
                <motion.div
                  key="win-banner"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs font-mono font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-2 justify-center w-full"
                >
                  <Award className="w-4 h-4 text-amber-400 animate-bounce" />
                  SUCCESS! Claimed +{chipsWon} Chips (+{(currentMultiplier - 1.0).toFixed(2)}x yield)!
                </motion.div>
              )}

              {gameState === 'CRASHED' && (
                <motion.div
                  key="loose-banner"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2 justify-center w-full"
                >
                  <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                  House collected the wager. Fuel tank exploded!
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
};
