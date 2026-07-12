import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Flame, Star, Trophy, RefreshCw, Sparkles, Bomb, CircleAlert, CheckCircle } from 'lucide-react';

interface MinesGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

type TileState = 'hidden' | 'gem' | 'mine' | 'mine-revealed';

interface Tile {
  id: number;
  state: TileState;
}

// Pre-calculate binomial coefficients to find combinations (25 choose k)
function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let res = 1;
  const limit = Math.min(k, n - k);
  for (let i = 1; i <= limit; i++) {
    res = (res * (n - limit + i)) / i;
  }
  return res;
}

// Calculate Mines multipliers with standard 2% house edge
function getMinesMultiplier(minesCount: number, gemsPicked: number): number {
  if (gemsPicked === 0) return 1.0;
  const n = 25; // Total tiles
  const totalGems = n - minesCount;
  
  if (gemsPicked > totalGems) return 0;
  
  // probability of picking k safe tiles: (totalGems choose k) / (n choose k)
  const prob = combinations(totalGems, gemsPicked) / combinations(n, gemsPicked);
  if (prob === 0) return 0;
  
  const rawMultiplier = 1.0 / prob;
  const houseEdgeMultiplier = rawMultiplier * 0.98; // 2% house edge
  
  // Format with high accuracy but readable scale
  return Math.max(1.01, Math.round(houseEdgeMultiplier * 100) / 100);
}

// Lightweight Web Audio sound generator for premium casino sensory feedback
class CasinoAudio {
  private ctx: AudioContext | null = null;

  constructor() {
    // Lazy initialized on first user interaction to satisfy browser policies
  }

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
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio Context block:', e);
    }
  }

  playRevealGem(gemsCount: number) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const baseFreq = 400 + (gemsCount * 65); // Ascending scale as they find gems
      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);
      osc1.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + 0.15);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(baseFreq * 1.25, now);
      osc2.frequency.linearRampToValueAtTime(baseFreq * 1.875, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch (e) {}
  }

  playExplosion() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const noiseGain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.6);

      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      // Low pass filter for heavy bass rumble
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);

      osc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.8);
    } catch (e) {}
  }

  playCashout() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Quick sparkling major-chord arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.1, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.4);
      });
    } catch (e) {}
  }
}

const audio = new CasinoAudio();

export const MinesGame: React.FC<MinesGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tiles, setTiles] = useState<Tile[]>(
    Array.from({ length: 25 }, (_, i) => ({ id: i, state: 'hidden' }))
  );
  const [minePositions, setMinePositions] = useState<Set<number>>(new Set());
  const [gemsFound, setGemsFound] = useState<number>(0);
  const [nextMultiplier, setNextMultiplier] = useState<number>(1.0);
  const [hasHitMine, setHasHitMine] = useState<boolean>(false);
  const [recentCashedOut, setRecentCashedOut] = useState<number[]>(() => {
    const saved = localStorage.getItem('mines_recent_wins');
    return saved ? JSON.parse(saved) : [1.41, 2.12, 1.15, 3.82, 1.88];
  });

  // Keep a pool of preview multipliers for next levels to show risk progression
  const stepsPreviewCount = 6;
  const multipliersPreview = Array.from({ length: stepsPreviewCount }, (_, index) => {
    return getMinesMultiplier(minesCount, gemsFound + index + 1);
  });

  // Start Mines Game
  const handleStartGame = () => {
    if (isPlaying) return;
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to place this bet!', 'error');
      return;
    }
    if (betAmount <= 0) {
      triggerAlert('Please enter a valid bet amount.', 'error');
      return;
    }

    // Deduct chips and set playing state
    onUpdateChips(-betAmount);
    audio.playTick();

    // Randomize mine positions
    const newMinePositions = new Set<number>();
    while (newMinePositions.size < minesCount) {
      const idx = Math.floor(Math.random() * 25);
      newMinePositions.add(idx);
    }

    setMinePositions(newMinePositions);
    setTiles(Array.from({ length: 25 }, (_, i) => ({ id: i, state: 'hidden' })));
    setGemsFound(0);
    setHasHitMine(false);
    setIsPlaying(true);
    setNextMultiplier(getMinesMultiplier(minesCount, 1));
    triggerAlert(`Mines game started with ${minesCount} hidden mines! Be careful!`, 'info');
  };

  // Tile Selection Click Handler
  const handleTileClick = (index: number) => {
    if (!isPlaying || tiles[index].state !== 'hidden') return;

    if (minePositions.has(index)) {
      // Hit a Mine - LOSE GAME
      audio.playExplosion();
      setHasHitMine(true);
      setIsPlaying(false);

      // Reveal everything
      setTiles(prev =>
        prev.map((t) => {
          if (t.id === index) {
            return { ...t, state: 'mine' }; // Exploded one
          } else if (minePositions.has(t.id)) {
            return { ...t, state: 'mine-revealed' }; // Other mines
          } else {
            return { ...t, state: t.state === 'hidden' ? 'hidden' : 'gem' };
          }
        })
      );

      triggerAlert(`💥 BOOM! You hit a mine and lost ${betAmount} chips.`, 'error');
    } else {
      // Safe reveal - found a GEM!
      const nextGemsCount = gemsFound + 1;
      audio.playRevealGem(nextGemsCount);
      setGemsFound(nextGemsCount);

      // Update state of single tile
      setTiles(prev =>
        prev.map((t) => (t.id === index ? { ...t, state: 'gem' } : t))
      );

      // Calculate new multipliers
      const currentPayoutMult = getMinesMultiplier(minesCount, nextGemsCount);
      const nextPayoutMult = getMinesMultiplier(minesCount, nextGemsCount + 1);
      setNextMultiplier(nextPayoutMult);

      // Update casino floor progress tasks
      onUpdateTask('play_games', 1);

      // Check if all safe tiles are found
      const maxPossibleGems = 25 - minesCount;
      if (nextGemsCount === maxPossibleGems) {
        // Auto cashout!
        const winValue = Math.round(betAmount * currentPayoutMult);
        onUpdateChips(winValue);
        audio.playCashout();
        setIsPlaying(false);

        // Save history
        const updatedHistory = [currentPayoutMult, ...recentCashedOut.slice(0, 4)];
        setRecentCashedOut(updatedHistory);
        localStorage.setItem('mines_recent_wins', JSON.stringify(updatedHistory));

        triggerAlert(`👑 Perfect Game! You cleared the board and won ${winValue} chips! (${currentPayoutMult}x)`, 'success');
      }
    }
  };

  // Cashout current winnings
  const handleCashout = () => {
    if (!isPlaying || gemsFound === 0) return;

    const currentMultiplier = getMinesMultiplier(minesCount, gemsFound);
    const winValue = Math.round(betAmount * currentMultiplier);

    onUpdateChips(winValue);
    audio.playCashout();
    setIsPlaying(false);

    // Save history
    const updatedHistory = [currentMultiplier, ...recentCashedOut.slice(0, 4)];
    setRecentCashedOut(updatedHistory);
    localStorage.setItem('mines_recent_wins', JSON.stringify(updatedHistory));

    // Reveal all mine locations nicely
    setTiles(prev =>
      prev.map((t) => (minePositions.has(t.id) ? { ...t, state: 'mine-revealed' } : t))
    );

    triggerAlert(`💰 Cashed Out! Won ${winValue} Chips at ${currentMultiplier}x multiplier!`, 'success');
  };

  const adjustBet = (multiplier: number) => {
    if (isPlaying) return;
    setBetAmount(prev => {
      const val = Math.max(10, Math.round(prev * multiplier));
      return val > chips ? chips : val;
    });
    audio.playTick();
  };

  const incrementBet = (amount: number) => {
    if (isPlaying) return;
    setBetAmount(prev => {
      const val = Math.max(10, prev + amount);
      return val > chips ? chips : val;
    });
    audio.playTick();
  };

  const handleMinesCountChange = (count: number) => {
    if (isPlaying) return;
    setMinesCount(count);
    audio.playTick();
  };

  // Quick chips display calculations
  const currentMultiplierForBet = getMinesMultiplier(minesCount, gemsFound);
  const potentialWinValue = Math.round(betAmount * currentMultiplierForBet);
  const nextWinValue = Math.round(betAmount * getMinesMultiplier(minesCount, gemsFound + 1));

  return (
    <div className="bg-[#0e0e29]/95 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md animate-fade-in text-white">
      {/* Top Banner / Game Stats Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10 mb-6">
        <div>
          <span className="text-[10px] bg-amber-400 text-black font-black uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full">
            High Risk, High Reward
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" /> 101 Mines Floor
          </h2>
          <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
            Dodge hidden landmines on the 5x5 board. Cashout at any level or risk it for giant multiplier gold stars!
          </p>
        </div>

        {/* Recent Cashed Out Multipliers Bar */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono uppercase text-white/40 tracking-wider">Recent Wins:</span>
          <div className="flex gap-1.5 overflow-x-auto">
            {recentCashedOut.map((mult, idx) => (
              <span
                key={idx}
                className={`text-[10px] font-bold font-mono px-2 py-1 rounded-md border ${
                  mult >= 3.0 
                    ? 'bg-amber-400/20 text-amber-400 border-amber-400/30'
                    : mult >= 1.5
                      ? 'bg-emerald-400/15 text-emerald-400 border-emerald-400/20'
                      : 'bg-white/5 text-white/60 border-white/5'
                }`}
              >
                {mult}x
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8">
        {/* Left Side: Game Controller Panel */}
        <div className="bg-[#060614]/80 p-5 rounded-2xl border border-white/5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Bet Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-white/50 font-mono uppercase tracking-wider flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> Wager Chips
                </label>
                <span className="text-[10px] text-white/30 font-mono">Bal: {chips} 🪙</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  disabled={isPlaying}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 10))}
                  className="w-full bg-[#11112e] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold font-mono focus:outline-none focus:border-amber-400 disabled:opacity-50 text-white"
                />
              </div>

              {/* Quick multipliers */}
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                <button
                  disabled={isPlaying}
                  onClick={() => adjustBet(0.5)}
                  className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold font-mono transition-colors disabled:opacity-30 cursor-pointer"
                >
                  1/2
                </button>
                <button
                  disabled={isPlaying}
                  onClick={() => adjustBet(2)}
                  className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold font-mono transition-colors disabled:opacity-30 cursor-pointer"
                >
                  2X
                </button>
                <button
                  disabled={isPlaying}
                  onClick={() => incrementBet(50)}
                  className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold font-mono transition-colors disabled:opacity-30 cursor-pointer"
                >
                  +50
                </button>
                <button
                  disabled={isPlaying}
                  onClick={() => incrementBet(100)}
                  className="py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold font-mono transition-colors disabled:opacity-30 cursor-pointer"
                >
                  +100
                </button>
                <button
                  disabled={isPlaying}
                  onClick={() => setBetAmount(chips)}
                  className="py-1.5 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 rounded-lg text-[10px] font-bold font-mono text-amber-400 transition-colors disabled:opacity-30 cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Mines Count selector */}
            <div>
              <label className="block text-xs text-white/50 font-mono uppercase tracking-wider mb-2">
                Number of Landmines
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 3, 5, 10, 24].map((count) => (
                  <button
                    key={count}
                    disabled={isPlaying}
                    onClick={() => handleMinesCountChange(count)}
                    className={`py-2 rounded-xl border text-xs font-bold font-mono transition-all ${
                      minesCount === count
                        ? 'bg-amber-400 text-black border-amber-300 font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'bg-white/5 border-transparent text-white/60 hover:border-white/10 hover:text-white'
                    } disabled:opacity-50 cursor-pointer`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <span className="block text-[9px] text-white/30 font-mono mt-1.5 leading-normal">
                More mines increase risks but scale up payouts exponentially at a blazing speed!
              </span>
            </div>

            {/* Steps / Risk Level Indicator */}
            {isPlaying && (
              <div className="bg-[#121235] p-3 rounded-xl border border-amber-400/15 text-xs space-y-1.5 animate-pulse">
                <div className="flex justify-between font-mono">
                  <span className="text-white/40">Gems Found:</span>
                  <span className="font-bold text-amber-400">{gemsFound} / {25 - minesCount}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-white/40">Next Gem multiplier:</span>
                  <span className="font-bold text-emerald-400">{(getMinesMultiplier(minesCount, gemsFound + 1))}x</span>
                </div>
              </div>
            )}
          </div>

          {/* Action CTA Buttons */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            {!isPlaying ? (
              <button
                onClick={handleStartGame}
                disabled={chips < betAmount}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-amber-600 text-black font-extrabold text-xs tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-current" /> PLACE BET & START
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 text-center text-[10px] text-white/40 font-mono pb-1 animate-pulse">
                  GEMS CLEARED: {gemsFound} ⭐ | WINNABLE: {potentialWinValue} 🪙
                </div>
                
                <button
                  onClick={handleCashout}
                  disabled={gemsFound === 0}
                  className="w-full col-span-2 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs tracking-widest uppercase rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trophy className="w-4 h-4" /> CASHOUT {potentialWinValue} 🪙
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Mines 5x5 Grid */}
        <div className="flex flex-col justify-between">
          {/* Step visual progress tracker (Stake-like multiplier list) */}
          <div className="mb-4 bg-[#050514] p-3 rounded-xl border border-white/5 overflow-hidden">
            <div className="flex gap-2 justify-between items-center text-center overflow-x-auto scrollbar-thin pr-1">
              {multipliersPreview.map((mult, idx) => {
                const step = gemsFound + idx + 1;
                const isNext = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`flex-1 min-w-[55px] p-2 rounded-lg border flex flex-col justify-center items-center transition-all ${
                      isNext && isPlaying
                        ? 'bg-amber-400/20 border-amber-400 text-amber-400 scale-105 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        : 'bg-white/5 border-transparent text-white/40'
                    }`}
                  >
                    <span className="text-[8px] font-mono uppercase tracking-wider block opacity-60">Step {step}</span>
                    <span className={`text-[10px] font-bold font-mono mt-0.5 ${isNext && isPlaying ? 'text-amber-400' : 'text-white/80'}`}>
                      {mult}x
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actual 5x5 Tiles Grid */}
          <div className="grid grid-cols-5 gap-3 max-w-md mx-auto aspect-square w-full bg-[#050514]/90 p-4.5 rounded-2xl border border-white/10 relative shadow-inner">
            <AnimatePresence>
              {tiles.map((tile, idx) => {
                const isMine = tile.state === 'mine';
                const isMineRevealed = tile.state === 'mine-revealed';
                const isGem = tile.state === 'gem';
                const isHidden = tile.state === 'hidden';

                return (
                  <button
                    key={tile.id}
                    disabled={!isPlaying || !isHidden}
                    onClick={() => handleTileClick(idx)}
                    className="relative w-full aspect-square rounded-xl focus:outline-none transition-all disabled:cursor-default"
                  >
                    <motion.div
                      whileHover={isPlaying && isHidden ? { scale: 1.05, borderColor: 'rgba(245, 158, 11, 0.4)' } : {}}
                      whileTap={isPlaying && isHidden ? { scale: 0.95 } : {}}
                      className={`w-full h-full rounded-xl border flex items-center justify-center transition-all ${
                        isHidden
                          ? isPlaying
                            ? 'bg-[#15153b] border-white/10 hover:bg-[#1a1a48] cursor-pointer shadow-md'
                            : 'bg-[#0f0f29]/80 border-white/5 opacity-50'
                          : isGem
                            ? 'bg-gradient-to-br from-amber-400/20 to-yellow-500/15 border-amber-400 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                            : isMine
                              ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500 text-red-500 animate-shake'
                              : 'bg-gradient-to-br from-red-500/10 to-transparent border-red-500/30 text-red-400 opacity-60'
                      }`}
                    >
                      {isGem && (
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="flex flex-col items-center justify-center"
                        >
                          <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                          <span className="text-[8px] font-bold font-mono mt-0.5 text-amber-400 bg-amber-400/10 px-1 rounded">
                            {getMinesMultiplier(minesCount, gemsFound)}x
                          </span>
                        </motion.div>
                      )}

                      {(isMine || isMineRevealed) && (
                        <motion.div
                          initial={{ scale: 0, rotate: 45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                        >
                          <Bomb className={`w-6 h-6 ${isMine ? 'text-red-500 animate-pulse' : 'text-red-400'}`} />
                        </motion.div>
                      )}

                      {isHidden && isPlaying && (
                        <div className="w-2 h-2 rounded-full bg-white/10" />
                      )}
                    </motion.div>
                  </button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Grid Footer Details */}
          <div className="flex justify-between items-center text-[10px] font-mono text-white/30 px-2 mt-4">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400/60" /> Gems Cleared: {gemsFound}
            </span>
            <span className="flex items-center gap-1">
              <Bomb className="w-3.5 h-3.5 text-red-400/60" /> Mines Planted: {minesCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
