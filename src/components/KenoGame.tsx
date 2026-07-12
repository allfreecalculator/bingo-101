import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, Trophy, Sparkles, HelpCircle, RefreshCw, X, Check, Eye } from 'lucide-react';

interface KenoGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

// Low-overhead web audio synthesizer for satisfying mechanical retro soundscapes
class KenoAudio {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTick(isHit: boolean) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isHit ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(isHit ? 880 : 350, now);
      if (isHit) {
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
      } else {
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
      }

      gain.gain.setValueAtTime(isHit ? 0.05 : 0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  playWin() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Radiant rising chime chords
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.04, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.32);
      });
    } catch (e) {}
  }

  playSelect() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.04);
    } catch (e) {}
  }
}

// Classic Keno payout tables mapped dynamically by count of selected spots (1 to 10)
// Key: number of spots selected. Value: array where index corresponds to count of hits. Value at index is multiplier.
const PAYOUT_TABLES: { [spots: number]: { [hits: number]: number } } = {
  1: { 1: 3 },
  2: { 1: 1, 2: 9 },
  3: { 2: 2, 3: 16 },
  4: { 2: 1, 3: 5, 4: 55 },
  5: { 2: 1, 3: 3, 4: 15, 5: 250 },
  6: { 3: 2, 4: 7, 5: 60, 6: 1000 },
  7: { 3: 1, 4: 5, 5: 21, 6: 250, 7: 4000 },
  8: { 4: 3, 5: 12, 6: 100, 7: 1000, 8: 10000 },
  9: { 4: 2, 5: 9, 6: 44, 7: 335, 8: 4700, 9: 25000 },
  10: { 5: 2, 6: 24, 7: 142, 8: 1000, 9: 4500, 10: 50000 }
};

export const KenoGame: React.FC<KenoGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betSize, setBetSize] = useState<number>(10);
  const [selectedSpots, setSelectedSpots] = useState<Set<number>>(new Set());
  const [drawnBalls, setDrawnBalls] = useState<Set<number>>(new Set());
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentBallNumber, setCurrentBallNumber] = useState<number | null>(null);
  const [stats, setStats] = useState({ totalDraws: 0, bestWin: 0 });
  const [gameResult, setGameResult] = useState<{ hitsCount: number; payout: number; multiplier: number } | null>(null);

  const audioRef = useRef<KenoAudio | null>(null);

  useEffect(() => {
    audioRef.current = new KenoAudio();
  }, []);

  const handleToggleSpot = (num: number) => {
    if (isDrawing) return;

    if (audioRef.current) audioRef.current.playSelect();

    if (!selectedSpots.has(num) && selectedSpots.size >= 10) {
      triggerAlert('You can choose a maximum of 10 spots on Keno!', 'info');
      return;
    }

    setSelectedSpots(prev => {
      const next = new Set(prev);
      if (next.has(num)) {
        next.delete(num);
      } else {
        next.add(num);
      }
      return next;
    });
    setGameResult(null);
  };

  const handleClearBoard = () => {
    if (isDrawing) return;
    setSelectedSpots(new Set());
    setDrawnBalls(new Set());
    setGameResult(null);
  };

  const handleQuickPick = () => {
    if (isDrawing) return;
    handleClearBoard();
    const pickSet = new Set<number>();
    while (pickSet.size < 10) {
      const randomVal = Math.floor(Math.random() * 80) + 1;
      pickSet.add(randomVal);
    }
    setSelectedSpots(pickSet);
  };

  const handleStartDraw = () => {
    if (isDrawing) return;

    if (selectedSpots.size === 0) {
      triggerAlert('Please select at least 1 spot (number) on the Keno floor before playing!', 'error');
      return;
    }

    if (chips < betSize) {
      triggerAlert('Insufficient chips to place this Keno wager!', 'error');
      return;
    }

    // Deduct wager chips
    onUpdateChips(-betSize);
    onUpdateTask('casino_wager', betSize);

    setIsDrawing(true);
    setDrawnBalls(new Set());
    setGameResult(null);

    // Build the 20 winning keno balls pool
    const pool = Array.from({ length: 80 }, (_, i) => i + 1);
    const winningBalls: number[] = [];
    for (let i = 0; i < 20; i++) {
      const randIdx = Math.floor(Math.random() * pool.length);
      winningBalls.push(pool.splice(randIdx, 1)[0]);
    }

    // Sequentially drop keno balls (draws phase)
    let dropIdx = 0;
    const dropInterval = setInterval(() => {
      if (dropIdx < 20) {
        const nextBall = winningBalls[dropIdx];
        setCurrentBallNumber(nextBall);
        setDrawnBalls(prev => {
          const next = new Set(prev);
          next.add(nextBall);
          return next;
        });

        const isHit = selectedSpots.has(nextBall);
        if (audioRef.current) {
          audioRef.current.playTick(isHit);
        }

        dropIdx++;
      } else {
        clearInterval(dropInterval);
        resolveGame(winningBalls);
      }
    }, 150); // Fast, snappy draw phase
  };

  const resolveGame = (finalBalls: number[]) => {
    const hitsCount = finalBalls.filter(ball => selectedSpots.has(ball)).length;
    const spotsCount = selectedSpots.size;

    // Retrieve multipliers index
    const rule = PAYOUT_TABLES[spotsCount];
    const multiplier = rule && rule[hitsCount] ? rule[hitsCount] : 0;
    const payout = betSize * multiplier;

    if (payout > 0) {
      if (audioRef.current) audioRef.current.playWin();
      onUpdateChips(payout);
      onUpdateTask('win_high_odds', 1);
      triggerAlert(`KENO WINNER! Hit ${hitsCount}/${spotsCount} spots. Paid ${multiplier}x (+${payout} Chips)! 🎉`, 'success');
    } else {
      triggerAlert(`Draw complete! Hit ${hitsCount}/${spotsCount} spots. Better luck next draw!`, 'info');
    }

    setGameResult({
      hitsCount,
      payout,
      multiplier
    });

    setStats(prev => ({
      totalDraws: prev.totalDraws + 1,
      bestWin: Math.max(prev.bestWin, payout)
    }));

    setIsDrawing(false);
    setCurrentBallNumber(null);
  };

  // UI multiplier list calculations
  const renderPayoutGuideList = () => {
    const spotSize = selectedSpots.size;
    if (spotSize === 0) {
      return (
        <span className="text-[10px] text-white/30 font-mono">
          Pick 1-10 spots on the board to view target multiplier levels...
        </span>
      );
    }

    const table = PAYOUT_TABLES[spotSize];
    return (
      <div className="space-y-1">
        <span className="block text-[9px] font-mono text-amber-400 font-bold tracking-wider uppercase">
          Dynamic Odds ({spotSize} spots chosen)
        </span>
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          {Object.entries(table).map(([hits, mult]) => (
            <div key={hits} className="flex justify-between border-b border-white/5 pb-0.5 px-1 text-white/70">
              <span>{hits} Hits:</span>
              <span className="text-emerald-400 font-bold">{mult}x</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const doubleBet = () => {
    setBetSize(prev => Math.min(chips, prev * 2));
  };

  const halveBet = () => {
    setBetSize(prev => Math.max(10, Math.round(prev / 2)));
  };

  return (
    <div id="keno-floor-panel" className="bg-[#0b0c24]/80 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Decorative gradients */}
      <div className="absolute top-[-80px] left-[-80px] w-52 h-52 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-80px] right-[-80px] w-52 h-52 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/5">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white uppercase font-sans">Cosmic Neon Keno</h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Pick 10 spots for 50,000x jackpot</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60">
            Total Draws: <span className="font-bold text-cyan-400">{stats.totalDraws}</span>
          </div>
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best Draw: <span className="font-bold text-emerald-400">{stats.bestWin} 💰</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1.1fr] gap-8 items-start">
        
        {/* Left column: Keno 80 numbers interactive board */}
        <div className="space-y-4">
          
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-white/40 uppercase tracking-wide">Board Selector</span>
            <span className="font-mono text-white/60 font-bold bg-white/5 border border-white/5 rounded-full px-3 py-1">
              Spots Selected: <span className="text-cyan-400">{selectedSpots.size} / 10</span>
            </span>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-3xl p-5 shadow-inner">
            <div className="grid grid-cols-10 gap-1.5 max-h-[380px] overflow-y-auto pr-1">
              {Array.from({ length: 80 }, (_, i) => {
                const num = i + 1;
                const isSelected = selectedSpots.has(num);
                const isDrawn = drawnBalls.has(num);
                const isHit = isSelected && isDrawn;

                let btnClass = "bg-white/5 border-white/5 text-white/60 hover:bg-white/10";
                if (isHit) {
                  btnClass = "bg-emerald-500 border-emerald-400 text-black shadow-lg shadow-emerald-500/30 font-black animate-ping-once";
                } else if (isDrawn) {
                  btnClass = "bg-red-500/20 border-red-500/30 text-red-300";
                } else if (isSelected) {
                  btnClass = "bg-cyan-500 border-cyan-400 text-black shadow-lg shadow-cyan-500/20 font-black";
                }

                return (
                  <button
                    key={num}
                    onClick={() => handleToggleSpot(num)}
                    disabled={isDrawing}
                    className={`h-10 sm:h-11 rounded-lg border text-xs sm:text-sm font-mono font-bold flex items-center justify-center transition-all cursor-pointer select-none relative ${btnClass}`}
                  >
                    {num}

                    {/* Small pulsing spot dot inside cell */}
                    {isSelected && !isDrawn && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Desk selections */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-[10px] font-mono text-white/40 leading-relaxed uppercase">
              Remaining balance: <span className="font-bold text-white">🪙 {chips - betSize}</span>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <button
                onClick={handleQuickPick}
                disabled={isDrawing}
                className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-white/70 hover:text-white font-mono text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40"
              >
                🪄 Quick Pick 10
              </button>
              <button
                onClick={handleClearBoard}
                disabled={isDrawing || selectedSpots.size === 0}
                className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          </div>

        </div>

        {/* Right column: odds guide, bet, current drawer actions */}
        <div className="space-y-6">
          
          {/* Dynamic draw ball output visual */}
          <div className="bg-[#050516]/60 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[120px] text-center gap-3">
            {isDrawing && currentBallNumber !== null ? (
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Drawing winning Keno Ball</span>
                <div className="flex items-center justify-center">
                  <motion.div
                    key={currentBallNumber}
                    initial={{ scale: 0.3, y: 10, rotate: -45 }}
                    animate={{ scale: 1, y: 0, rotate: 0 }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-black font-mono font-black text-2xl flex items-center justify-center shadow-lg shadow-cyan-400/25 border border-white/20"
                  >
                    {currentBallNumber}
                  </motion.div>
                </div>
              </div>
            ) : gameResult ? (
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-white/40 uppercase">Result Summary</span>
                <h4 className={`text-base font-black uppercase ${gameResult.multiplier > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {gameResult.multiplier > 0 ? `Winner! Hit ${gameResult.hitsCount}/${selectedSpots.size}` : 'Draw Finished! 0 Hits'}
                </h4>
                {gameResult.multiplier > 0 && (
                  <p className="text-[11px] font-mono text-white/60">
                    Received {gameResult.multiplier}x payout: <span className="text-emerald-400 font-bold">+{gameResult.payout} Chips 🎉</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1 text-white/30 font-mono text-[11px]">
                <p>Awaiting game draw wagers...</p>
                <p className="text-[9px] text-white/20">20 numbers will be drawn sequentially from the grid</p>
              </div>
            )}
          </div>

          {/* Dynamic dynamic payout odds table */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 shadow-inner">
            {renderPayoutGuideList()}
          </div>

          {/* Bet Size selector input */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/60 uppercase font-bold tracking-wide">Select Draw Bet</span>
              <span className="text-[10px] text-white/30 font-mono">Min: 10 | Max: 1,000</span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <input
                type="number"
                disabled={isDrawing}
                value={betSize}
                onChange={(e) => setBetSize(Math.max(10, Math.min(chips, parseInt(e.target.value) || 10)))}
                className="bg-transparent border-none outline-none text-white font-mono font-black text-lg flex-1 min-w-0 disabled:opacity-50"
              />
              {!isDrawing && (
                <div className="flex items-center gap-1">
                  <button onClick={halveBet} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">½</button>
                  <button onClick={doubleBet} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">2x</button>
                </div>
              )}
            </div>
          </div>

          {/* Trigger Play action */}
          <button
            onClick={handleStartDraw}
            disabled={isDrawing || selectedSpots.size === 0}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-black disabled:text-white/30 font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-cyan-500/10 cursor-pointer disabled:from-white/10 disabled:to-white/10 select-none flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> Start Keno Ball Draw
          </button>

          {/* Rules info box */}
          <div className="bg-cyan-400/5 p-4 rounded-2xl border border-cyan-500/10 text-[11px] text-white/50 leading-relaxed space-y-1">
            <h5 className="font-bold text-white flex items-center gap-1.5 font-sans uppercase text-[10px] tracking-wider text-cyan-400">
              <HelpCircle className="w-3.5 h-3.5" /> Vegas Keno Rules
            </h5>
            <p>
              Select between 1 and 10 numbers (spots) on the board. The machine drops **20 dynamic numbers** randomly. Hit the required quota of matching spots to multiply your wager!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
