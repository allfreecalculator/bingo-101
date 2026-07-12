import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, Sparkles, Volume2, VolumeX, HelpCircle, Trophy, ShieldAlert, Award, Star } from 'lucide-react';

interface TowerClimbGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

// Fixed 8-floor tower setup
const FLOORS_COUNT = 8;

// Multiplier configurations based on skull/hazard count per floor
const RISK_MULTIPLIERS: Record<number, number[]> = {
  1: [1.25, 1.6, 2.1, 2.8, 3.8, 5.2, 7.2, 10.0], // 1 skull out of 4 blocks
  2: [1.8, 3.4, 6.5, 12.5, 24.0, 46.0, 88.0, 150.0], // 2 skulls out of 4 blocks
  3: [3.8, 15.0, 58.0, 220.0, 850.0, 1200.0, 1500.0, 2000.0] // 3 skulls out of 4 blocks
};

class TowerAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playSafe() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.08);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  playCashout() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.02, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.17);
      });
    } catch (e) {}
  }

  playSkull() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.35);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.37);
    } catch (e) {}
  }
}

export const TowerClimbGame: React.FC<TowerClimbGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(25);
  const [skullsCount, setSkullsCount] = useState<number>(1); // Default 1 skull per floor
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentFloor, setCurrentFloor] = useState<number>(0); // 0-based index floor level (Floor 0, Floor 1, etc)
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [highScore, setHighScore] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Keep track of floor tile contents
  // Each floor contains 4 blocks, either 'GEM' or 'SKULL'
  const [floorBlocks, setFloorBlocks] = useState<Record<number, Array<'GEM' | 'SKULL'>>>({});
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<Record<number, number>>({});
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  const audioRef = useRef<TowerAudio>(new TowerAudio());

  const startTower = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to play Tower Climb!', 'error');
      return;
    }

    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);

    setIsPlaying(true);
    setCurrentFloor(0);
    setMultiplier(1.0);
    setIsGameOver(false);
    setSelectedBlockIdx({});
    
    // Seed floor blocks (Gem or Skull distributions per floor)
    const map: Record<number, Array<'GEM' | 'SKULL'>> = {};
    for (let f = 0; f < FLOORS_COUNT; f++) {
      const arr: Array<'GEM' | 'SKULL'> = Array(4).fill('GEM');
      let skullsSeeded = 0;
      while (skullsSeeded < skullsCount) {
        const rand = Math.floor(Math.random() * 4);
        if (arr[rand] === 'GEM') {
          arr[rand] = 'SKULL';
          skullsSeeded++;
        }
      }
      map[f] = arr;
    }
    setFloorBlocks(map);
  };

  const handleBlockSelect = (floorIdx: number, blockIdx: number) => {
    if (!isPlaying || floorIdx !== currentFloor || isGameOver) return;

    // Record the selection
    setSelectedBlockIdx(prev => ({ ...prev, [floorIdx]: blockIdx }));

    const content = floorBlocks[floorIdx]?.[blockIdx];
    if (content === 'GEM') {
      audioRef.current.playSafe();
      const mults = RISK_MULTIPLIERS[skullsCount];
      const nextMultiplier = mults[floorIdx];
      setMultiplier(nextMultiplier);

      if (floorIdx === FLOORS_COUNT - 1) {
        // Reached peak summit! Auto cashout peak win!
        const peakPayout = Math.floor(betAmount * nextMultiplier);
        onUpdateChips(peakPayout);
        setHighScore(prev => Math.max(prev, peakPayout));
        setIsPlaying(false);
        audioRef.current.playCashout();
        triggerAlert(`👑 AMAZING SUMMIT CONQUERED! Reached the top of the tower for ${nextMultiplier}x (+${peakPayout} Chips)! 🎉`, 'success');
        onUpdateTask('win_high_odds', 1);
      } else {
        // Advance to next floor
        setCurrentFloor(prev => prev + 1);
      }
    } else {
      // Hit a Skull Hazard! Game Over.
      audioRef.current.playSkull();
      setIsGameOver(true);
      setIsPlaying(false);
      triggerAlert(`💥 Strike! Hit a skull on Floor ${floorIdx + 1}. Tower collapsed!`, 'info');
    }
  };

  const handleCashout = () => {
    if (!isPlaying || isGameOver || multiplier <= 1.0) return;

    const payout = Math.floor(betAmount * multiplier);
    onUpdateChips(payout);
    setHighScore(prev => Math.max(prev, payout));
    setIsPlaying(false);
    audioRef.current.playCashout();
    triggerAlert(`💰 Locked-In! Reached Floor ${currentFloor} with a ${multiplier}x multiplier. Earned +${payout} Chips!`, 'success');
  };

  const setBetMax = () => setBetAmount(Math.min(chips, 1000));
  const doubleBet = () => setBetAmount(prev => Math.min(chips, prev * 2));
  const halveBet = () => setBetAmount(prev => Math.max(10, Math.round(prev / 2)));

  return (
    <div id="tower-game-container" className="bg-[#080720]/85 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Background radial gradients */}
      <div className="absolute top-[-60px] left-[-60px] w-52 h-52 bg-emerald-500/10 rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-52 h-52 bg-pink-500/10 rounded-full blur-[70px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <Award className="w-6 h-6 animate-pulse text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white uppercase font-sans flex items-center gap-2">
              Neon Tower Climb <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">Risk Ladder</span>
            </h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Select safe tiles to climb floors, or cash out early</p>
          </div>
        </div>

        {/* Audio control & Stats */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              const next = !soundMuted;
              setSoundMuted(next);
              audioRef.current.muted = next;
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white transition-all cursor-pointer animate-fade-in"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best Climb: <span className="font-black text-amber-400">{highScore}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_1.3fr_1fr] gap-6 items-start">
        
        {/* Left column: Controls */}
        <div className="space-y-4">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2.5">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">1. Select Skulls Per Floor</span>
            <div className="grid grid-cols-3 gap-1.5">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  disabled={isPlaying}
                  onClick={() => setSkullsCount(count)}
                  className={`py-2 rounded-xl border font-mono text-xs cursor-pointer block ${
                    skullsCount === count
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : 'bg-white/5 text-white/40 border-transparent hover:border-white/10 hover:text-white'
                  } disabled:opacity-50`}
                >
                  <div className="font-bold">{count} 💀</div>
                  <div className="text-[7px] text-white/30 uppercase tracking-tight mt-0.5">
                    {count === 1 ? 'Low' : count === 2 ? 'Medium' : 'Extreme'} Risk
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/60 uppercase font-bold tracking-wide flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> Tower Wager
              </span>
              <span className="text-[10px] text-white/30 font-mono">Min: 10</span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
              <input
                type="number"
                disabled={isPlaying}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Math.min(chips, parseInt(e.target.value) || 10)))}
                className="bg-transparent border-none outline-none text-white font-mono font-black text-sm flex-1 min-w-0"
              />
              {!isPlaying && (
                <div className="flex items-center gap-1">
                  <button onClick={halveBet} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">½</button>
                  <button onClick={doubleBet} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">2x</button>
                  <button onClick={setBetMax} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded border border-emerald-500/20 transition-all cursor-pointer">Max</button>
                </div>
              )}
            </div>
          </div>

          {!isPlaying ? (
            <button
              onClick={startTower}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" /> ENTER TOWER LOBBY
            </button>
          ) : (
            <button
              onClick={handleCashout}
              disabled={multiplier <= 1.0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              💰 CASHOUT ({multiplier.toFixed(2)}x)
            </button>
          )}
        </div>

        {/* Center column: High Fidelity Vertical Tower Grid */}
        <div className="bg-black/30 border border-white/5 rounded-3xl p-5 flex flex-col items-center justify-center space-y-3 min-h-[400px]">
          <div className="w-full flex justify-between items-center px-2 text-[9px] font-mono text-white/40 uppercase tracking-widest">
            <span>Summit</span>
            <span>Floor Grid Selector</span>
            <span>Ground</span>
          </div>

          <div className="w-full flex flex-col-reverse gap-2">
            {Array(FLOORS_COUNT).fill(0).map((_, fIdx) => {
              const isCurrent = fIdx === currentFloor && isPlaying;
              const isPast = fIdx < currentFloor;
              const isLocked = fIdx > currentFloor;
              const mult = RISK_MULTIPLIERS[skullsCount][fIdx];

              return (
                <div
                  key={fIdx}
                  className={`grid grid-cols-[1.5fr_4fr] gap-3 items-center p-1.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/10 border-emerald-500/35 shadow-lg shadow-emerald-500/5 scale-102'
                      : isPast
                      ? 'bg-white/5 border-white/5 opacity-80'
                      : 'bg-transparent border-transparent opacity-30'
                  }`}
                >
                  {/* Payout Tag for this Floor */}
                  <div className="text-center font-mono text-[9px] font-bold">
                    <div className="text-white/40 uppercase">Fl.{fIdx + 1}</div>
                    <div className={isPast || isCurrent ? 'text-emerald-400 font-extrabold text-xs' : 'text-white/30'}>
                      {mult.toFixed(2)}x
                    </div>
                  </div>

                  {/* 4 blocks grid */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {Array(4).fill(0).map((_, bIdx) => {
                      const wasSelected = selectedBlockIdx[fIdx] === bIdx;
                      const revealContent = floorBlocks[fIdx]?.[bIdx];
                      const isRevealed = isGameOver || (isPast && wasSelected);

                      return (
                        <button
                          key={bIdx}
                          disabled={!isCurrent || isGameOver}
                          onClick={() => handleBlockSelect(fIdx, bIdx)}
                          className={`h-9 rounded-lg border flex items-center justify-center text-xs font-mono transition-all cursor-pointer ${
                            isRevealed
                              ? revealContent === 'GEM'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                : 'bg-red-500/20 border-red-500 text-red-500'
                              : wasSelected && !isRevealed && isPlaying
                              ? 'bg-indigo-500/30 border-indigo-500 text-white animate-pulse'
                              : isCurrent
                              ? 'bg-[#10b981]/15 border-emerald-500/30 text-emerald-400 hover:bg-[#10b981]/30 hover:border-emerald-400'
                              : 'bg-black/40 border-white/5 text-white/10'
                          }`}
                        >
                          {isRevealed ? (
                            revealContent === 'GEM' ? '💎' : '💀'
                          ) : isCurrent ? (
                            '?'
                          ) : (
                            '•'
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Risk Guide & Tips */}
        <div className="space-y-4">
          <div className="bg-black/45 border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Tower Multipliers list</span>
            <div className="flex flex-col gap-1 font-mono text-[9px]">
              {RISK_MULTIPLIERS[skullsCount].map((mult, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-white/40">Floor {idx + 1} Step</span>
                  <span className="text-emerald-400 font-bold">{mult.toFixed(2)}x</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#050516]/60 border border-white/5 rounded-2xl p-4 text-[10px] text-white/40 leading-relaxed space-y-2">
            <h5 className="font-bold text-white flex items-center gap-1.5 font-sans uppercase text-[10px] tracking-wider text-emerald-400">
              <Star className="w-3.5 h-3.5 text-emerald-400" /> Tower climbing Guide
            </h5>
            <p>
              🛡️ Choose the skull count carefully: More skulls mean incredible vertical multipliers, but dodging them is highly volatile!
            </p>
            <p>
              🌟 Lock in your gains: Don't get too greedy. If you have a decent multiplier, hit the cashout button!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
