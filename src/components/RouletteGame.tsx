import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, Trophy, Sparkles, HelpCircle, RefreshCw, X, CircleDot } from 'lucide-react';

interface RouletteGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface BetOption {
  id: string;
  label: string;
  multiplier: number;
  type: 'number' | 'color' | 'parity' | 'range' | 'dozen';
  value: any; // specific number, 'red', 'black', 'even', 'odd', etc.
  colorClass: string;
}

interface PlacedBet {
  optionId: string;
  amount: number;
  label: string;
}

// Low-overhead web audio synthesizer for satisfying mechanical roulette soundscapes
class RouletteAudio {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300 + Math.random() * 200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);
    } catch (e) {}
  }

  playWin() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  playLose() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.3);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.3);
    } catch (e) {}
  }
}

// European Roulette sequence list (37 numbers: 0 to 36)
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
]);

const getNumberColor = (num: number): 'red' | 'black' | 'green' => {
  if (num === 0) return 'green';
  return RED_NUMBERS.has(num) ? 'red' : 'black';
};

export const RouletteGame: React.FC<RouletteGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [selectedBetSize, setSelectedBetSize] = useState<number>(10);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [recentOutcomes, setRecentOutcomes] = useState<number[]>([]);
  const [stats, setStats] = useState({ totalSpins: 0, maxWin: 0 });

  // Refs for spinning visual canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<RouletteAudio | null>(null);
  const animationRef = useRef<number | null>(null);
  const currentAngleRef = useRef<number>(0);

  // Re-build all standard Roulette Board options (outside render for clarity)
  const bettingOptions: BetOption[] = [
    // Special outside groupings
    { id: 'red', label: '🟥 RED', multiplier: 2, type: 'color', value: 'red', colorClass: 'bg-red-600 hover:bg-red-500 text-white' },
    { id: 'black', label: '⬛ BLACK', multiplier: 2, type: 'color', value: 'black', colorClass: 'bg-neutral-950 hover:bg-neutral-900 border border-white/20 text-white' },
    { id: 'even', label: 'EVEN', multiplier: 2, type: 'parity', value: 'even', colorClass: 'bg-[#18184a] hover:bg-[#202062] text-white border border-white/10' },
    { id: 'odd', label: 'ODD', multiplier: 2, type: 'parity', value: 'odd', colorClass: 'bg-[#18184a] hover:bg-[#202062] text-white border border-white/10' },
    { id: 'low', label: '1 - 18', multiplier: 2, type: 'range', value: 'low', colorClass: 'bg-[#18184a] hover:bg-[#202062] text-white border border-white/10' },
    { id: 'high', label: '19 - 36', multiplier: 2, type: 'range', value: 'high', colorClass: 'bg-[#18184a] hover:bg-[#202062] text-white border border-white/10' },
    // Dozens
    { id: 'doz_1', label: '1st 12', multiplier: 3, type: 'dozen', value: 1, colorClass: 'bg-[#18184a] hover:bg-[#202062] text-white border border-white/10' },
    { id: 'doz_2', label: '2nd 12', multiplier: 3, type: 'dozen', value: 2, colorClass: 'bg-[#18184a] hover:bg-[#202062] text-white border border-white/10' },
    { id: 'doz_3', label: '3rd 12', multiplier: 3, type: 'dozen', value: 3, colorClass: 'bg-[#18184a] hover:bg-[#202062] text-white border border-white/10' },
  ];

  // Number options (0 to 36)
  const numberOptions: BetOption[] = Array.from({ length: 37 }, (_, i) => {
    const color = getNumberColor(i);
    const colorClass = color === 'green'
      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
      : color === 'red'
      ? 'bg-red-600 hover:bg-red-500 text-white'
      : 'bg-neutral-950 hover:bg-neutral-900 text-white border border-white/10';
    return {
      id: `num_${i}`,
      label: `${i}`,
      multiplier: 36,
      type: 'number',
      value: i,
      colorClass
    };
  });

  // Combine both selections
  const allBettingOptions = [...bettingOptions, ...numberOptions];

  useEffect(() => {
    audioRef.current = new RouletteAudio();
    drawStaticWheel();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Compute sum total of currently active bets
  const activeWagerSum = placedBets.reduce((sum, bet) => sum + bet.amount, 0);

  // Initial render of the canvas
  const drawStaticWheel = (ballIndex: number | null = null, ballRadiusRatio: number = 0.65) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fluid sizing
    const size = Math.min(canvas.parentElement?.clientWidth || 320, 360);
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size / 2 - 15;
    const innerRadius = outerRadius - 38;

    ctx.clearRect(0, 0, size, size);

    // Draw backing wheel body
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius + 8, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a20';
    ctx.shadowColor = 'rgba(251, 191, 36, 0.2)';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw gold outer metallic rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#d97706'; // Gold/Amber-600
    ctx.lineWidth = 6;
    ctx.stroke();

    const sectorAngle = (Math.PI * 2) / 37;

    // Draw individual wheel number sectors
    for (let i = 0; i < 37; i++) {
      const num = WHEEL_NUMBERS[i];
      const startAngle = currentAngleRef.current + i * sectorAngle;
      const endAngle = startAngle + sectorAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, outerRadius - 3, startAngle, endAngle);
      ctx.closePath();

      const numColor = getNumberColor(num);
      ctx.fillStyle = numColor === 'green' ? '#10b981' : numColor === 'red' ? '#ef4444' : '#171717';
      ctx.fill();

      // Add neat radial dividing segments
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.15)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Draw Sector Text Number
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sectorAngle / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      // Offset translation to place near rim
      ctx.fillText(`${num}`, outerRadius - 14, 0);
      ctx.restore();
    }

    // Inner bronze spinner hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    const hubGradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, innerRadius);
    hubGradient.addColorStop(0, '#78350f');
    hubGradient.addColorStop(0.6, '#451a03');
    hubGradient.addColorStop(1, '#1e0c03');
    ctx.fillStyle = hubGradient;
    ctx.fill();

    // Draw center cross bars
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 35, centerY);
    ctx.lineTo(centerX + 35, centerY);
    ctx.moveTo(centerX, centerY - 35);
    ctx.lineTo(centerX, centerY + 35);
    ctx.stroke();

    // Render spinning ball indicator
    if (ballIndex !== null) {
      const ballAngle = currentAngleRef.current + ballIndex * sectorAngle + sectorAngle / 2;
      const ballDistance = innerRadius + (outerRadius - innerRadius) * ballRadiusRatio;
      const ballX = centerX + Math.cos(ballAngle) * ballDistance;
      const ballY = centerY + Math.sin(ballAngle) * ballDistance;

      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  // Place active wager slot chip on a specific board option
  const handlePlaceBet = (option: BetOption) => {
    if (isSpinning) return;

    if (chips < activeWagerSum + selectedBetSize) {
      triggerAlert('Insufficient chips to cover this additional Roulette wager!', 'error');
      return;
    }

    setPlacedBets(prev => {
      const existsIdx = prev.findIndex(b => b.optionId === option.id);
      if (existsIdx > -1) {
        const copy = [...prev];
        copy[existsIdx].amount += selectedBetSize;
        return copy;
      } else {
        return [...prev, { optionId: option.id, amount: selectedBetSize, label: option.label }];
      }
    });

    if (audioRef.current) audioRef.current.playTick();
  };

  // Reset/Clear currently placed desk chips
  const handleClearBets = () => {
    if (isSpinning) return;
    setPlacedBets([]);
  };

  // Main high-fidelity spin wheel animation loop
  const handleSpinWheel = () => {
    if (isSpinning) return;

    if (placedBets.length === 0) {
      triggerAlert('Please place at least one board bet chip before spinning!', 'error');
      return;
    }

    setIsSpinning(true);
    setTargetNumber(null);

    // Pick a completely random target index in WHEEL_NUMBERS
    const winningIdx = Math.floor(Math.random() * 37);
    const winningNumber = WHEEL_NUMBERS[winningIdx];

    let spinDuration = 3600; // ms (3.6s)
    let startTime: number | null = null;
    let initialSpinSpeed = 0.28; // radians per frame
    let lastAudioTickAngle = 0;

    const animateWheel = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < spinDuration) {
        const progress = elapsed / spinDuration;
        // Ease-out deceleration curve
        const easing = 1 - Math.pow(progress - 1, 4); 
        const speed = initialSpinSpeed * (1 - easing);

        // Advance wheel rotation angle
        currentAngleRef.current += speed;

        // Ball rotation simulation: revolves faster in opposite/same direction initially,
        // then settles into the target number socket pocket at the end of the easing
        const ballPosRatio = 0.55 + 0.45 * (1 - progress); // spiraling in
        
        // Find which sector coordinates align with the pocket index currently
        const currentBallSectorIdx = (winningIdx + Math.floor((1 - progress) * 75)) % 37;

        drawStaticWheel(currentBallSectorIdx, ballPosRatio);

        // Sound ticker on passing sectors
        const accumulatedRotationSectors = Math.floor(currentAngleRef.current / ((Math.PI * 2) / 37));
        if (accumulatedRotationSectors !== lastAudioTickAngle) {
          lastAudioTickAngle = accumulatedRotationSectors;
          if (audioRef.current) audioRef.current.playTick();
        }

        animationRef.current = requestAnimationFrame(animateWheel);
      } else {
        // Halt animation and snap ball directly into winning sector
        drawStaticWheel(winningIdx, 0.58);
        calculatePayout(winningNumber);
      }
    };

    animationRef.current = requestAnimationFrame(animateWheel);
  };

  // Process payouts based on hit results and placed chips
  const calculatePayout = (winningNum: number) => {
    const winColor = getNumberColor(winningNum);
    const isEven = winningNum !== 0 && winningNum % 2 === 0;
    const isOdd = winningNum !== 0 && winningNum % 2 !== 0;
    const isLow = winningNum >= 1 && winningNum <= 18;
    const isHigh = winningNum >= 19 && winningNum <= 36;
    
    // Dozens index check
    let dozenIdx = 0;
    if (winningNum >= 1 && winningNum <= 12) dozenIdx = 1;
    else if (winningNum >= 13 && winningNum <= 24) dozenIdx = 2;
    else if (winningNum >= 25 && winningNum <= 36) dozenIdx = 3;

    let totalWinningPayout = 0;

    // Evaluate each chip bet
    placedBets.forEach(bet => {
      const option = allBettingOptions.find(o => o.id === bet.optionId);
      if (!option) return;

      let isBetWon = false;

      if (option.type === 'number' && option.value === winningNum) {
        isBetWon = true;
      } else if (option.type === 'color' && option.value === winColor) {
        isBetWon = true;
      } else if (option.type === 'parity') {
        if (option.value === 'even' && isEven) isBetWon = true;
        if (option.value === 'odd' && isOdd) isBetWon = true;
      } else if (option.type === 'range') {
        if (option.value === 'low' && isLow) isBetWon = true;
        if (option.value === 'high' && isHigh) isBetWon = true;
      } else if (option.type === 'dozen' && option.value === dozenIdx) {
        isBetWon = true;
      }

      if (isBetWon) {
        totalWinningPayout += bet.amount * option.multiplier;
      }
    });

    const netResultChips = totalWinningPayout - activeWagerSum;

    // Synchronize chips with the game profile
    onUpdateChips(netResultChips);

    // Process tasks hooks
    if (totalWinningPayout > 0) {
      if (audioRef.current) audioRef.current.playWin();
      onUpdateTask('win_high_odds', 1);
      triggerAlert(`WHEEL HIT ${winningNum} (${winColor.toUpperCase()})! You won +${totalWinningPayout} Chips! 🎉`, 'success');
    } else {
      if (audioRef.current) audioRef.current.playLose();
      triggerAlert(`WHEEL HIT ${winningNum} (${winColor.toUpperCase()}). Best luck on the next spin!`, 'info');
    }

    onUpdateTask('casino_wager', activeWagerSum);

    // Save logs state
    setTargetNumber(winningNum);
    setRecentOutcomes(prev => [winningNum, ...prev.slice(0, 11)]);
    setStats(prev => ({
      totalSpins: prev.totalSpins + 1,
      maxWin: Math.max(prev.maxWin, totalWinningPayout)
    }));

    // Cleanup spinning triggers
    setPlacedBets([]);
    setIsSpinning(false);
  };

  const handleQuickDoubleBets = () => {
    if (isSpinning || placedBets.length === 0) return;
    const additionalCost = activeWagerSum;
    if (chips < activeWagerSum + additionalCost) {
      triggerAlert('Insufficient chips to double all Roulette bets!', 'error');
      return;
    }
    setPlacedBets(prev => prev.map(b => ({ ...b, amount: b.amount * 2 })));
  };

  return (
    <div id="roulette-neon-floor" className="bg-[#0b0c24]/80 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Decorative Neon Cosmic Flares */}
      <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-64 h-64 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Title Badge Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-400/5">
            <CircleDot className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white uppercase font-sans">Vegas Neon Roulette</h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Spiraling European Wheel Simulator</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60">
            Total Spins: <span className="font-bold text-emerald-400">{stats.totalSpins}</span>
          </div>
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best Win: <span className="font-bold text-emerald-400">{stats.maxWin} 💰</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 items-start">
        
        {/* Left Side: Spinning Wheel Canvas Display */}
        <div className="flex flex-col items-center space-y-6">
          
          <div className="relative bg-[#050516] border border-white/10 rounded-3xl p-5 shadow-inner w-full flex flex-col items-center min-h-[380px] justify-center">
            
            <canvas ref={canvasRef} className="block max-w-full" />

            {/* Float overlay showing spinning output */}
            <AnimatePresence>
              {targetNumber !== null && (
                <motion.div
                  initial={{ scale: 0.3, opacity: 0, y: 15 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  className="absolute bg-black/90 px-5 py-3.5 rounded-2xl border border-white/10 flex flex-col items-center gap-1 shadow-2xl z-10"
                >
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/40">Wheel Landed</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-lg ${
                      getNumberColor(targetNumber) === 'green' ? 'bg-emerald-500' :
                      getNumberColor(targetNumber) === 'red' ? 'bg-red-500' : 'bg-neutral-800'
                    }`}>
                      {targetNumber}
                    </div>
                    <span className="text-xs font-bold text-white uppercase font-mono">
                      {getNumberColor(targetNumber)}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Chronological Wheel outcomes record bar */}
          <div className="w-full bg-[#050516]/60 border border-white/5 rounded-2xl p-3.5 flex items-center gap-3 overflow-x-auto scrollbar-none min-h-[50px]">
            <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 shrink-0">Recent spins:</span>
            {recentOutcomes.length === 0 ? (
              <span className="text-[10px] text-white/20 font-mono">Spin the roulette wheel to build logs...</span>
            ) : (
              <div className="flex gap-2">
                {recentOutcomes.map((o, idx) => {
                  const col = getNumberColor(o);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0.5, opacity: 0, x: -10 }}
                      animate={{ scale: 1, opacity: 1, x: 0 }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white font-mono ${
                        col === 'green' ? 'bg-emerald-600' : col === 'red' ? 'bg-red-600' : 'bg-neutral-800'
                      }`}
                    >
                      {o}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Betting Board layout & Placement Actions */}
        <div className="space-y-6">
          
          {/* Bet sizes selectors */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/60 uppercase font-bold tracking-wide">Select Chip Size</span>
              <span className="text-[10px] text-amber-400 font-mono">Click options below to place wagers</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              {[10, 25, 50, 100, 500, 1000].map((size) => {
                const isActive = selectedBetSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedBetSize(size)}
                    disabled={isSpinning}
                    className={`px-4 py-2.5 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer select-none shrink-0 ${
                      isActive
                        ? 'bg-emerald-400 border-emerald-400 text-black shadow-lg shadow-emerald-400/10'
                        : 'bg-white/5 border-white/5 text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    🪙 {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Interactive Grid table */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-6">
            
            <div className="space-y-2">
              <span className="block text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Outside Bet Categories (Multiplier payouts: 2x - 3x)</span>
              
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {bettingOptions.map((option) => {
                  const chipsOnThis = placedBets.find(b => b.optionId === option.id)?.amount || 0;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handlePlaceBet(option)}
                      disabled={isSpinning}
                      className={`relative py-3 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer flex flex-col items-center justify-center gap-1 select-none min-h-[50px] ${option.colorClass}`}
                    >
                      <span>{option.label}</span>
                      <span className="opacity-40 text-[8px] font-mono font-medium lowercase">({option.multiplier}x payout)</span>

                      {/* Stacked Chip badge indicator if active */}
                      {chipsOnThis > 0 && (
                        <div className="absolute top-[-6px] right-[-6px] bg-amber-400 text-black font-mono font-black text-[9px] px-2 py-0.5 rounded-full shadow-lg shadow-black/80 animate-pulse border border-white">
                          🪙 {chipsOnThis}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Inside Number Board (Single odds payouts: 36x)</span>
              
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                {numberOptions.map((option) => {
                  const chipsOnThis = placedBets.find(b => b.optionId === option.id)?.amount || 0;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handlePlaceBet(option)}
                      disabled={isSpinning}
                      className={`relative py-2.5 rounded-lg text-xs font-mono font-black transition-all cursor-pointer flex items-center justify-center select-none ${option.colorClass}`}
                    >
                      {option.label}

                      {/* Small Stacked badge inside cells */}
                      {chipsOnThis > 0 && (
                        <div className="absolute bottom-[-2px] right-[-2px] bg-amber-400 text-black font-mono font-black text-[7px] px-1.5 rounded shadow border border-white leading-none scale-90">
                          {chipsOnThis}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick Desk Actions bar & Payout calculator summary */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
            
            <div className="flex flex-col gap-1 font-mono text-xs">
              <div className="text-white/40">
                Sum placed desk chips: <span className="font-bold text-white text-sm">🪙 {activeWagerSum}</span>
              </div>
              <div className="text-white/30 text-[10px]">
                Available balance remaining: <span className="font-bold text-white/60">🪙 {chips - activeWagerSum}</span>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleQuickDoubleBets}
                disabled={isSpinning || placedBets.length === 0}
                className="px-3.5 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/70 hover:text-white font-mono text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer"
              >
                2x Double Desk
              </button>
              <button
                onClick={handleClearBets}
                disabled={isSpinning || placedBets.length === 0}
                className="px-3.5 py-3 rounded-xl bg-red-500/10 border border-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>

          </div>

          {/* Primary CTA Roll button */}
          <button
            onClick={handleSpinWheel}
            disabled={isSpinning || placedBets.length === 0}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 disabled:from-white/10 disabled:to-white/10 text-black disabled:text-white/30 font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-emerald-500/15 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> Spin Roulette Wheel
          </button>

          {/* Instruction Guideline helper */}
          <div className="bg-emerald-400/5 p-4 rounded-2xl border border-emerald-500/10 text-[11px] text-white/50 leading-relaxed space-y-1">
            <h5 className="font-bold text-white flex items-center gap-1.5 font-sans uppercase text-[10px] tracking-wider text-emerald-400">
              <HelpCircle className="w-3.5 h-3.5" /> European Roulette Guidelines
            </h5>
            <p>
              Select your coin value, tap any betting pocket on the board to place your chips, and pull the spinner! Hit precise single numbers for maximum **36x payouts** or color/parity buckets for secure double returns.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
