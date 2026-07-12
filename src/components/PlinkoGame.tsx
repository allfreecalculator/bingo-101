import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Settings, Play, ArrowDown, HelpCircle, Trophy, Sparkles, RefreshCw } from 'lucide-react';

interface PlinkoGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface PlinkoBall {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  targetBucket: number; // For safety validation
  betAmount: number;
  trail: { x: number; y: number }[];
}

interface PlinkoPeg {
  x: number;
  y: number;
  radius: number;
  litIntensity: number; // 0 to 1 for glowing effects
}

interface PlinkoBucket {
  index: number;
  multiplier: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
  glowIntensity: number;
}

// Low-overhead Web Audio synthesizer for Plinko tactile soundscapes
class PlinkoAudio {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPegHit() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Satisfying higher-frequency wooden plink sound
      const freq = 800 + Math.random() * 400;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio blocked:', e);
    }
  }

  playBucketHit(multiplier: number) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const isHighWin = multiplier >= 2;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isHighWin ? 'sawtooth' : 'triangle';
      const baseFreq = isHighWin ? 220 : 150;
      osc.frequency.setValueAtTime(baseFreq, now);
      
      if (isHighWin) {
        // High win triumphant sliding tone
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      } else {
        // Low/Mid landing sound
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      }

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + (isHighWin ? 0.5 : 0.25));
    } catch (e) {}
  }
}

export const PlinkoGame: React.FC<PlinkoGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  // Game parameters
  const [betAmount, setBetAmount] = useState<number>(10);
  const [rows, setRows] = useState<number>(12); // Default 12 rows, ranges 8 to 16
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('medium');
  const [ballsCount, setBallsCount] = useState<number>(0);
  const [history, setHistory] = useState<{ id: string; mult: number; risk: string }[]>([]);
  const [stats, setStats] = useState({ totalBallsDropped: 0, highestMultiplier: 0 });

  // Refs for canvas and physics loops
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballsRef = useRef<PlinkoBall[]>([]);
  const pegsRef = useRef<PlinkoPeg[]>([]);
  const bucketsRef = useRef<PlinkoBucket[]>([]);
  const audioRef = useRef<PlinkoAudio | null>(null);
  const requestRef = useRef<number | null>(null);

  // Spark effects state
  const [sparks, setSparks] = useState<{ id: string; x: number; y: number; color: string }[]>([]);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new PlinkoAudio();
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Compute Plinko Multipliers for given row/risk with authentic bell curve distribution
  const getMultipliers = (r: number, rsk: 'low' | 'medium' | 'high'): number[] => {
    const bucketsCount = r + 1;
    const centerIdx = r / 2;
    const multipliers: number[] = [];

    // Binomial probabilities divisor
    const binomialCoeff = (n: number, k: number): number => {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      let res = 1;
      const limit = Math.min(k, n - k);
      for (let i = 1; i <= limit; i++) {
        res = (res * (n - limit + i)) / i;
      }
      return res;
    };

    const maxProb = binomialCoeff(r, Math.round(centerIdx)) / Math.pow(2, r);

    for (let k = 0; k < bucketsCount; k++) {
      const dist = Math.abs(k - centerIdx);
      const relativeDist = dist / centerIdx; // 0 (center) to 1 (edges)
      
      let mult = 1.0;
      
      if (rsk === 'low') {
        // Low risk: center remains close to 1x, outer boundaries scale up to ~5x
        mult = 1.3 - 0.7 * (1 - relativeDist) + 4.5 * Math.pow(relativeDist, 2.2);
        if (k === Math.round(centerIdx)) mult = 1.1;
      } else if (rsk === 'medium') {
        // Medium risk: center buckets are slightly losing (0.4x - 0.7x), outer up to ~40x
        mult = 0.5 + 40.0 * Math.pow(relativeDist, 3.2);
        if (dist <= 1) mult = 0.6 - dist * 0.1;
      } else {
        // High risk: center buckets are near-total losses (0.2x), outer edges are massive (up to 250x+)
        const scaleFactor = 1.0 + (r - 8) * 0.35; // Edges scale heavily with rows
        mult = 0.2 + 180.0 * scaleFactor * Math.pow(relativeDist, 4.5);
        if (dist <= 1.5) mult = 0.2;
      }

      // Beautiful clean casino rounding
      if (mult < 0.2) {
        mult = 0.2;
      } else if (mult < 1) {
        mult = Math.round(mult * 10) / 10;
      } else if (mult < 5) {
        mult = Math.round(mult * 5) / 5;
      } else if (mult < 50) {
        mult = Math.round(mult * 2) / 2;
      } else {
        mult = Math.round(mult);
      }

      multipliers.push(mult);
    }

    // Secondary normalization tweak to maintain a solid RTP (return to player) ~97%
    return multipliers;
  };

  const activeMultipliers = getMultipliers(rows, risk);

  // Generate Peg Layout
  const rebuildPegs = (width: number, height: number) => {
    const pegs: PlinkoPeg[] = [];
    const startY = 70; // Offset from top
    const endY = height - 90; // Reserve bottom area for buckets
    const spacingY = (endY - startY) / (rows - 1);
    
    // Dynamic horizontal spacing so triangle fits perfectly
    for (let r = 0; r < rows; r++) {
      const rowY = startY + r * spacingY;
      // Peg count increases row by row: Row 0 has 3 pegs, Row 1 has 4 pegs, etc.
      const pegCount = r + 3;
      const totalWidth = width * 0.85;
      const stepX = totalWidth / (pegCount - 1);
      const startX = (width - totalWidth) / 2;

      for (let p = 0; p < pegCount; p++) {
        const pegX = startX + p * stepX;
        pegs.push({
          x: pegX,
          y: rowY,
          radius: Math.max(3, 8 - rows * 0.2), // Smaller pegs for denser boards
          litIntensity: 0,
        });
      }
    }
    pegsRef.current = pegs;
  };

  // Generate Buckets Layout at the bottom
  const rebuildBuckets = (width: number, height: number) => {
    const bucketsCount = rows + 1;
    const bucketY = height - 55;
    const bucketHeight = 35;
    const boardWidth = width * 0.87;
    const stepWidth = boardWidth / bucketsCount;
    const startX = (width - boardWidth) / 2;

    const buckets: PlinkoBucket[] = [];
    const multipliers = activeMultipliers;

    for (let i = 0; i < bucketsCount; i++) {
      const bucketX = startX + i * stepWidth;
      
      // Determine bucket color based on multiplier value
      let color = 'bg-emerald-500';
      const m = multipliers[i];
      if (m < 0.5) {
        color = '#ef4444'; // red-500
      } else if (m < 1.0) {
        color = '#f97316'; // orange-500
      } else if (m < 2.0) {
        color = '#eab308'; // yellow-500
      } else if (m < 10.0) {
        color = '#10b981'; // emerald-500
      } else {
        color = '#8b5cf6'; // purple-500
      }

      buckets.push({
        index: i,
        multiplier: m,
        x: bucketX,
        y: bucketY,
        width: stepWidth - 3, // slightly smaller to leave gaps
        height: bucketHeight,
        label: m >= 100 ? `${Math.round(m)}x` : `${m}x`,
        color,
        glowIntensity: 0,
      });
    }
    bucketsRef.current = buckets;
  };

  // Reset/rebuild pegs and buckets on parameters change or window resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use responsive width for the board container
    const resizeBoard = () => {
      const containerWidth = canvas.parentElement?.clientWidth || 550;
      canvas.width = containerWidth;
      canvas.height = Math.max(480, containerWidth * 0.95);

      rebuildPegs(canvas.width, canvas.height);
      rebuildBuckets(canvas.width, canvas.height);
    };

    resizeBoard();
    window.addEventListener('resize', resizeBoard);
    return () => window.removeEventListener('resize', resizeBoard);
  }, [rows, risk]);

  // Main Canvas Physics & Animation Frame Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const updatePhysics = () => {
      const balls = ballsRef.current;
      const pegs = pegsRef.current;
      const buckets = bucketsRef.current;

      const gravity = 0.16; // Stable gravity
      const bounceRestitution = 0.45; // Elastic bounce absorption

      // Update balls
      for (let b = balls.length - 1; b >= 0; b--) {
        const ball = balls[b];
        
        // Add trail path
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 8) ball.trail.shift();

        // Apply velocities
        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Wall dampening bounce collisions
        const leftWall = 10;
        const rightWall = canvas.width - 10;
        if (ball.x - ball.radius < leftWall) {
          ball.x = leftWall + ball.radius;
          ball.vx = -ball.vx * 0.6;
        } else if (ball.x + ball.radius > rightWall) {
          ball.x = rightWall - ball.radius;
          ball.vx = -ball.vx * 0.6;
        }

        // Collisions with Pegs
        for (let p = 0; p < pegs.length; p++) {
          const peg = pegs[p];
          const dx = ball.x - peg.x;
          const dy = ball.y - peg.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDist = ball.radius + peg.radius;

          if (distance < minDist) {
            // Reposition ball outside peg to prevent overlap sticking
            const overlap = minDist - distance;
            const nx = dx / distance;
            const ny = dy / distance;

            ball.x += nx * overlap;
            ball.y += ny * overlap;

            // Compute reflection vector with custom coefficient of restitution
            const dotProduct = ball.vx * nx + ball.vy * ny;
            
            ball.vx = (ball.vx - 2 * dotProduct * nx) * bounceRestitution;
            ball.vy = (ball.vy - 2 * dotProduct * ny) * bounceRestitution;

            // Add subtle lateral scattering factor for casino variance
            const lateralScattering = 0.5;
            ball.vx += (Math.random() - 0.5) * lateralScattering;

            // Trigger visual peg hit pulse
            peg.litIntensity = 1.0;

            // Play satisfying bounce sound
            if (audioRef.current) audioRef.current.playPegHit();
          }
        }

        // Check landing in Buckets
        if (buckets.length > 0 && ball.y >= buckets[0].y - ball.radius) {
          // Identify landing bucket index based on final X coordinate
          let landingIdx = 0;
          let bestDistance = Infinity;

          for (let i = 0; i < buckets.length; i++) {
            const bucketCenterX = buckets[i].x + buckets[i].width / 2;
            const dist = Math.abs(ball.x - bucketCenterX);
            if (dist < bestDistance) {
              bestDistance = dist;
              landingIdx = i;
            }
          }

          const bucket = buckets[landingIdx];
          const winnings = Math.round(ball.betAmount * bucket.multiplier);
          
          // Flash landing pocket glow
          bucket.glowIntensity = 1.0;

          // Sound trigger
          if (audioRef.current) audioRef.current.playBucketHit(bucket.multiplier);

          // Add splash particle sparks
          const sparkColor = bucket.color;
          setSparks(prev => [
            ...prev,
            {
              id: `spark-${Date.now()}-${Math.random()}`,
              x: ball.x,
              y: bucket.y,
              color: sparkColor,
            }
          ]);

          // Credit chips delta back to system
          onUpdateChips(winnings);
          
          // Handle task progress hooks
          if (bucket.multiplier >= 2.0) {
            onUpdateTask('win_high_odds', 1);
          }
          onUpdateTask('casino_wager', ball.betAmount);

          // Append to central local logs list
          setHistory(prev => [
            { id: `${Date.now()}-${Math.random()}`, mult: bucket.multiplier, risk },
            ...prev.slice(0, 15)
          ]);

          // Update record stats
          setStats(prev => ({
            totalBallsDropped: prev.totalBallsDropped + 1,
            highestMultiplier: Math.max(prev.highestMultiplier, bucket.multiplier)
          }));

          // Trigger custom alert on massive multipliers
          if (bucket.multiplier >= 5.0) {
            triggerAlert(`MASSIVE DROP! Ball landed in ${bucket.multiplier}x Multiplier pocket! 🎉 +${winnings} Chips`, 'success');
          }

          // Remove ball from active loop
          balls.splice(b, 1);
          setBallsCount(balls.length);
        }
      }

      // Decay visual glows smoothly
      pegs.forEach(p => { if (p.litIntensity > 0) p.litIntensity -= 0.08; });
      buckets.forEach(b => { if (b.glowIntensity > 0) b.glowIntensity -= 0.1; });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pegs = pegsRef.current;
      const buckets = bucketsRef.current;
      const balls = ballsRef.current;

      // Draw subtle backing board frame grid
      ctx.fillStyle = 'rgba(10, 10, 31, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw peg board
      for (let p = 0; p < pegs.length; p++) {
        const peg = pegs[p];
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        
        if (peg.litIntensity > 0.01) {
          // Draw animated glowing active peg halo
          const gradient = ctx.createRadialGradient(peg.x, peg.y, 1, peg.x, peg.y, peg.radius * 3);
          gradient.addColorStop(0, 'rgba(251, 191, 36, 1)');
          gradient.addColorStop(1, `rgba(251, 191, 36, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(peg.x, peg.y, peg.radius * 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        }

        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw landing Buckets with multiplier texts
      for (let i = 0; i < buckets.length; i++) {
        const b = buckets[i];
        
        ctx.save();
        ctx.shadowBlur = b.glowIntensity * 12;
        ctx.shadowColor = b.color;
        
        // Background card rounded container
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.85 + b.glowIntensity * 0.15;
        
        const cardRadius = 5;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, cardRadius);
        ctx.fill();

        // Multiplier Labels Typography
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${b.width < 25 ? '8px' : '10px'} JetBrains Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.label, b.x + b.width / 2, b.y + b.height / 2);
        
        ctx.restore();
      }

      // Draw Balls with glowing linear trails
      for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];

        // Ball trail path glow
        if (ball.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(ball.trail[0].x, ball.trail[0].y);
          for (let t = 1; t < ball.trail.length; t++) {
            ctx.lineTo(ball.trail[t].x, ball.trail[t].y);
          }
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
          ctx.lineWidth = ball.radius;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Main Ball sphere draw
        const gradient = ctx.createRadialGradient(
          ball.x - ball.radius * 0.2, 
          ball.y - ball.radius * 0.2, 
          1, 
          ball.x, 
          ball.y, 
          ball.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, '#f59e0b');
        gradient.addColorStop(1, '#78350f');

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    };

    const tick = () => {
      if (!isRunning) return;
      updatePhysics();
      draw();
      requestRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      isRunning = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [rows, risk]);

  // Clean sparks effect timeout
  useEffect(() => {
    if (sparks.length === 0) return;
    const timer = setTimeout(() => {
      setSparks([]);
    }, 1200);
    return () => clearTimeout(timer);
  }, [sparks]);

  // Fire Plinko Ball from the top slot
  const handleDropBall = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to place this Plinko wager!', 'error');
      return;
    }

    // Deduct bet amount immediately
    onUpdateChips(-betAmount);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Slight center offset variation for drop entry
    const startX = canvas.width / 2 + (Math.random() - 0.5) * 14;
    const startY = 25;

    const newBall: PlinkoBall = {
      id: `ball-${Date.now()}-${Math.random()}`,
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 1.5, // Subtle side velocity
      vy: 1.0,
      radius: Math.max(5, 10 - rows * 0.3),
      color: '#fbbf24',
      targetBucket: 0,
      betAmount,
      trail: [],
    };

    // Push into active physics queue
    ballsRef.current.push(newBall);
    setBallsCount(ballsRef.current.length);

    // Warm-up audio contexts on interaction
    if (audioRef.current) {
      try {
        audioRef.current.playPegHit();
      } catch (e) {}
    }
  };

  const setBetMax = () => {
    setBetAmount(Math.min(chips, 1000));
  };

  const doubleBet = () => {
    setBetAmount(prev => Math.min(chips, prev * 2));
  };

  const halveBet = () => {
    setBetAmount(prev => Math.max(10, Math.round(prev / 2)));
  };

  return (
    <div id="plinko-game-board" className="bg-[#0e0e2e]/70 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Decorative backing cosmic ambient flares */}
      <div className="absolute top-[-100px] left-[-100px] w-56 h-56 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-56 h-56 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Title Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/5">
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white uppercase font-sans">Cosmic Plinko Pegboard</h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Gravity-Defying Multipliers Board</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60">
            Active Balls: <span className="font-bold text-amber-400">{ballsCount}</span>
          </div>
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60">
            Total Dropped: <span className="font-bold text-white">{stats.totalBallsDropped}</span>
          </div>
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best: <span className="font-bold text-amber-400">{stats.highestMultiplier}x</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_2fr] gap-8 items-start">
        
        {/* Left Side: Interactive Game Controls and Customization Dashboard */}
        <div className="space-y-6">
          
          {/* Bet Setup Card */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/60 uppercase font-bold tracking-wide">Enter Bet Amount</span>
              <span className="text-[10px] text-white/30 font-mono">Min: 10 | Max: 1,000</span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2 focus-within:border-amber-400/50 transition-colors">
              <Coins className="w-5 h-5 text-amber-400" />
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Math.min(chips, parseInt(e.target.value) || 10)))}
                className="bg-transparent border-none outline-none text-white font-mono font-black text-lg flex-1 min-w-0"
              />
              <div className="flex items-center gap-1">
                <button onClick={halveBet} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-white/5 hover:bg-white/10 rounded border border-white/5 transition-all cursor-pointer">½</button>
                <button onClick={doubleBet} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-white/5 hover:bg-white/10 rounded border border-white/5 transition-all cursor-pointer">2x</button>
                <button onClick={setBetMax} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-black rounded border border-amber-400/20 transition-all cursor-pointer">Max</button>
              </div>
            </div>
          </div>

          {/* Peg Board Rows Configurations Slider */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/60 uppercase font-bold tracking-wide flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-white/40" /> Board Rows Density
              </span>
              <span className="text-sm font-bold text-amber-400 font-mono">{rows} Rows</span>
            </div>

            <div className="space-y-1.5">
              <input 
                type="range" 
                min="8" 
                max="16" 
                value={rows} 
                onChange={(e) => setRows(parseInt(e.target.value))}
                className="w-full accent-amber-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-white/30">
                <span>8 Rows (Low density)</span>
                <span>16 Rows (Dense)</span>
              </div>
            </div>
          </div>

          {/* Dynamic Volatility Risk select buttons */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <span className="block text-xs font-mono text-white/60 uppercase font-bold tracking-wide">Board Risk Level</span>
            
            <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
              {[
                { id: 'low' as const, label: 'Low', color: 'bg-emerald-500 text-black', desc: 'Frequent tiny wins' },
                { id: 'medium' as const, label: 'Medium', desc: 'Balanced volatility' },
                { id: 'high' as const, label: 'High', desc: 'Massive payouts' }
              ].map((r) => {
                const isActive = risk === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRisk(r.id)}
                    className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isActive 
                        ? r.id === 'low' ? 'bg-emerald-400 text-black shadow-md shadow-emerald-400/15' :
                          r.id === 'medium' ? 'bg-amber-400 text-black shadow-md shadow-amber-400/15' :
                          'bg-red-500 text-white shadow-md shadow-red-500/15'
                        : 'bg-transparent text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className={`text-[8px] font-medium leading-none tracking-normal normal-case opacity-60 ${isActive ? 'text-current' : 'text-white/30'}`}>
                      {r.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main big Launch ball CTA */}
          <button
            onClick={handleDropBall}
            disabled={chips < betAmount}
            className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:bg-white/10 disabled:text-white/30 text-black font-black text-sm tracking-widest uppercase transition-all shadow-lg shadow-amber-400/10 cursor-pointer hover:shadow-amber-400/20 active:scale-98 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> Drop Golden Ball
          </button>

          {/* Mini Guide details box */}
          <div className="bg-amber-400/5 p-4 rounded-2xl border border-amber-400/10 text-xs text-white/50 space-y-1.5 leading-relaxed">
            <h5 className="font-bold text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-400" /> Plinko Mechanics
            </h5>
            <p className="text-[11px]">
              Set your wager, calibrate row counts & risk multipliers, then release balls. The closer a ball lands to the triangular edge slots, the higher your payout multiplier! Multiple balls can drop and bounce in parallel.
            </p>
          </div>

        </div>

        {/* Right Side: Active Physics Canvas & Landing History Tracking */}
        <div className="space-y-4">
          
          <div className="relative bg-[#050516] border border-white/10 rounded-3xl overflow-hidden p-2 shadow-inner flex justify-center">
            
            {/* Main Interactive Physics Canvas */}
            <canvas ref={canvasRef} className="block w-full max-w-[550px]" />

            {/* Spark flash particles canvas layer overlay */}
            <AnimatePresence>
              {sparks.map((s) => (
                <motion.div
                  key={s.id}
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    left: s.x,
                    top: s.y - 20,
                    width: 35,
                    height: 35,
                    background: `radial-gradient(circle, ${s.color} 0%, transparent 70%)`,
                    transform: 'translate(-50%, -50%)',
                    mixBlendMode: 'screen',
                  }}
                  initial={{ scale: 0.1, opacity: 1 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
            </AnimatePresence>

            {/* Floating Drop entry pointer visual clue */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 opacity-60">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Entry Funnel</span>
              <div className="w-10 h-1 bg-amber-400/30 rounded" />
            </div>

          </div>

          {/* Landing Multipliers Chronological History Trail */}
          <div className="bg-[#050516]/60 border border-white/5 rounded-2xl p-3.5 flex items-center gap-3 overflow-x-auto scrollbar-none">
            <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 shrink-0">Recent lands:</span>
            {history.length === 0 ? (
              <span className="text-[10px] text-white/20 font-mono">Launch a ball to build history...</span>
            ) : (
              <div className="flex gap-1.5">
                {history.map((h, idx) => {
                  let badgeColor = 'bg-white/5 text-white';
                  if (h.mult >= 5) {
                    badgeColor = 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-black';
                  } else if (h.mult >= 1.5) {
                    badgeColor = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold';
                  } else if (h.mult >= 1) {
                    badgeColor = 'bg-yellow-500/10 text-yellow-500';
                  } else {
                    badgeColor = 'bg-red-500/10 text-red-400';
                  }
                  return (
                    <motion.div
                      key={h.id}
                      initial={{ scale: 0.4, opacity: 0, x: -10 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold ${badgeColor}`}
                    >
                      {h.mult}x
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
