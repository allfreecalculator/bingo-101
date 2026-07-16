import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Coins, Trophy, Play, RefreshCw, Volume2, VolumeX, Maximize2, 
  HelpCircle, Gift, Compass, Flame, AlertCircle, Heart 
} from 'lucide-react';

interface GemsFortuneGameProps {
  chips: number;
  onUpdateChips: (amount: number) => void;
  onUpdateTask?: (taskId: string, count: number) => void;
  triggerAlert: (text: string, type?: 'success' | 'error' | 'info') => void;
}

// Gem Types & Scoring
type GemType = 'DIAMOND' | 'RUBY' | 'EMERALD' | 'AMETHYST' | 'SAPPHIRE' | 'CHEST';

interface GemItem {
  id: string;
  type: GemType;
  emoji: string;
  color: string;
  glow: string;
  isMatched?: boolean;
}

const GEMS_METADATA: Record<GemType, { emoji: string; color: string; glow: string; value: number }> = {
  DIAMOND: { emoji: '💎', color: 'from-cyan-400 to-blue-500', glow: 'shadow-cyan-500/50', value: 30 },
  RUBY: { emoji: '🍒', color: 'from-rose-500 to-red-600', glow: 'shadow-red-500/50', value: 20 },
  EMERALD: { emoji: '🍀', color: 'from-emerald-400 to-teal-500', glow: 'shadow-emerald-500/50', value: 15 },
  AMETHYST: { emoji: '🔮', color: 'from-purple-500 to-fuchsia-600', glow: 'shadow-purple-500/50', value: 10 },
  SAPPHIRE: { emoji: '💙', color: 'from-blue-500 to-indigo-600', glow: 'shadow-blue-500/50', value: 8 },
  CHEST: { emoji: '🎁', color: 'from-amber-400 to-yellow-500', glow: 'shadow-amber-400/80', value: 100 }
};

const GRID_SIZE = 5;

// Synth sound creator helper
const playSynthSound = (type: 'match' | 'swap' | 'chest' | 'lose' | 'select' | 'win', isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'select') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'swap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(554, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'match') {
      // Arpeggio chord
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.2);
      });
    } else if (type === 'chest') {
      // Epic chest fanfare
      [392, 523, 659, 783, 1046, 1318].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
      });
    } else if (type === 'win') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {}
};

export const GemsFortuneGame: React.FC<GemsFortuneGameProps> = ({ 
  chips, 
  onUpdateChips, 
  onUpdateTask, 
  triggerAlert 
}) => {
  const [bet, setBet] = useState<number>(50);
  const [grid, setGrid] = useState<GemItem[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [roundWin, setRoundWin] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Bonus Treasure State
  const [isBonusActive, setIsBonusActive] = useState<boolean>(false);
  const [bonusChests, setBonusChests] = useState<{ id: number; multiplier: number; opened: boolean }[]>([]);
  const [bonusRoundsLeft, setBonusRoundsLeft] = useState<number>(0);
  const [accumulatedBonusChips, setAccumulatedBonusChips] = useState<number>(0);

  // Initialize random grid
  const createRandomGrid = (): GemItem[][] => {
    const types: GemType[] = ['DIAMOND', 'RUBY', 'EMERALD', 'AMETHYST', 'SAPPHIRE', 'CHEST'];
    const newGrid: GemItem[][] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      const row: GemItem[] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        // Lower chest chance so it feels like a rare bonus
        let type = types[Math.floor(Math.random() * (types.length - 1))];
        if (Math.random() < 0.08) {
          type = 'CHEST';
        }
        row.push({
          id: `${r}-${c}-${Date.now()}-${Math.random()}`,
          type,
          emoji: GEMS_METADATA[type].emoji,
          color: GEMS_METADATA[type].color,
          glow: GEMS_METADATA[type].glow
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  };

  useEffect(() => {
    setGrid(createRandomGrid());
  }, []);

  const handleBetChange = (amount: number) => {
    if (isPlaying) return;
    const newBet = Math.max(10, Math.min(500, bet + amount));
    setBet(newBet);
    playSynthSound('select', isMuted);
  };

  // Check for Match-3 or more in rows and columns
  const checkMatches = (currentGrid: GemItem[][]): { gridWithMatches: GemItem[][]; matchedCount: number; hasChestMatch: boolean } => {
    let matchedCount = 0;
    let hasChestMatch = false;

    // Create deep copy
    const marked = currentGrid.map(row => row.map(gem => ({ ...gem, isMatched: false })));

    // 1. Check Horizontal Rows
    for (let r = 0; r < GRID_SIZE; r++) {
      let matchLength = 1;
      let matchType: GemType | null = null;
      for (let c = 0; c < GRID_SIZE; c++) {
        const currentType = marked[r][c].type;
        if (c > 0 && currentType === marked[r][c - 1].type) {
          matchLength++;
        } else {
          if (matchLength >= 3 && matchType) {
            for (let i = c - matchLength; i < c; i++) {
              marked[r][i].isMatched = true;
              matchedCount++;
              if (matchType === 'CHEST') hasChestMatch = true;
            }
          }
          matchLength = 1;
          matchType = currentType;
        }
      }
      // Trailing row checks
      if (matchLength >= 3 && matchType) {
        for (let i = GRID_SIZE - matchLength; i < GRID_SIZE; i++) {
          marked[r][i].isMatched = true;
          matchedCount++;
          if (matchType === 'CHEST') hasChestMatch = true;
        }
      }
    }

    // 2. Check Vertical Columns
    for (let c = 0; c < GRID_SIZE; c++) {
      let matchLength = 1;
      let matchType: GemType | null = null;
      for (let r = 0; r < GRID_SIZE; r++) {
        const currentType = marked[r][c].type;
        if (r > 0 && currentType === marked[r - 1][c].type) {
          matchLength++;
        } else {
          if (matchLength >= 3 && matchType) {
            for (let i = r - matchLength; i < r; i++) {
              marked[i][c].isMatched = true;
              matchedCount++;
              if (matchType === 'CHEST') hasChestMatch = true;
            }
          }
          matchLength = 1;
          matchType = currentType;
        }
      }
      if (matchLength >= 3 && matchType) {
        for (let i = GRID_SIZE - matchLength; i < GRID_SIZE; i++) {
          marked[i][c].isMatched = true;
          matchedCount++;
          if (matchType === 'CHEST') hasChestMatch = true;
        }
      }
    }

    return { gridWithMatches: marked, matchedCount, hasChestMatch };
  };

  // Perform Swap Action
  const handleCellClick = async (r: number, c: number) => {
    if (isPlaying || isBonusActive) return;

    if (selectedCell === null) {
      setSelectedCell({ r, c });
      playSynthSound('select', isMuted);
    } else {
      const prevR = selectedCell.r;
      const prevC = selectedCell.c;

      // Check if clicked cell is adjacent
      const isAdjacent = (Math.abs(prevR - r) === 1 && prevC === c) || (Math.abs(prevC - c) === 1 && prevR === r);

      if (!isAdjacent) {
        setSelectedCell({ r, c });
        playSynthSound('select', isMuted);
        return;
      }

      // Check chips sufficiency
      if (chips < bet) {
        triggerAlert("Insufficient chips to initiate matching sweep! Add chips from daily rewards.", "error");
        setSelectedCell(null);
        return;
      }

      // Deduct bet and start round
      setIsPlaying(true);
      onUpdateChips(-bet);
      setRoundWin(0);
      setScore(0);
      setMultiplier(1);
      setSelectedCell(null);
      playSynthSound('swap', isMuted);

      // Perform swap in local grid copy
      const tempGrid = grid.map(row => row.map(cell => ({ ...cell })));
      const tempGem = tempGrid[prevR][prevC];
      tempGrid[prevR][prevC] = tempGrid[r][c];
      tempGrid[r][c] = tempGem;

      setGrid(tempGrid);

      // Evaluate Matches
      setTimeout(() => {
        processGridTurn(tempGrid);
      }, 350);
    }
  };

  const processGridTurn = async (currentGrid: GemItem[][]) => {
    const { gridWithMatches, matchedCount, hasChestMatch } = checkMatches(currentGrid);

    if (matchedCount > 0) {
      // Mark matches first
      setGrid(gridWithMatches);
      playSynthSound('match', isMuted);

      // Calculate Scores
      let turnScore = 0;
      gridWithMatches.forEach(row => {
        row.forEach(gem => {
          if (gem.isMatched) {
            turnScore += GEMS_METADATA[gem.type].value;
          }
        });
      });

      const payoutMultiplier = multiplier;
      const stepWin = Math.floor(turnScore * (bet / 50) * payoutMultiplier);

      setScore(prev => prev + turnScore);
      setRoundWin(prev => prev + stepWin);
      
      // Credit chips
      onUpdateChips(stepWin);

      // Alert about matches
      triggerAlert(`Matched GEMS! Score +${turnScore} & Earned +${stepWin} Chips! (x${payoutMultiplier})`, "success");

      // Cascade / Remove matches
      setTimeout(() => {
        const cascadedGrid = cascadeGems(gridWithMatches);
        setGrid(cascadedGrid);
        setMultiplier(prev => prev + 1);

        // Run checking recursively on newly fell gems
        setTimeout(() => {
          processGridTurn(cascadedGrid);
        }, 400);
      }, 500);

      // Check if chests triggered a bonus game
      if (hasChestMatch) {
        setTimeout(() => {
          triggerBonusLevel();
        }, 1200);
      }

    } else {
      // Turn finishes with no more matches
      setIsPlaying(false);
      playSynthSound('win', isMuted);
    }
  };

  const cascadeGems = (currentGrid: GemItem[][]): GemItem[][] => {
    const types: GemType[] = ['DIAMOND', 'RUBY', 'EMERALD', 'AMETHYST', 'SAPPHIRE', 'CHEST'];
    const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));

    // Go column by column bottom to top
    for (let c = 0; c < GRID_SIZE; c++) {
      const columnGems: GemItem[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        if (!newGrid[r][c].isMatched) {
          columnGems.push(newGrid[r][c]);
        }
      }

      // Add new random gems on top of column to restore 5 items
      while (columnGems.length < GRID_SIZE) {
        let type = types[Math.floor(Math.random() * (types.length - 1))];
        if (Math.random() < 0.08) {
          type = 'CHEST';
        }
        columnGems.unshift({
          id: `new-${Date.now()}-${Math.random()}`,
          type,
          emoji: GEMS_METADATA[type].emoji,
          color: GEMS_METADATA[type].color,
          glow: GEMS_METADATA[type].glow
        });
      }

      // Populate grid column back
      for (let r = 0; r < GRID_SIZE; r++) {
        newGrid[r][c] = columnGems[r];
      }
    }

    return newGrid;
  };

  // Reset grid completely manually
  const handleShuffleGrid = () => {
    if (isPlaying || isBonusActive) return;
    if (chips < bet) {
      triggerAlert("Insufficient chips to trigger a full board drop!", "error");
      return;
    }
    setIsPlaying(true);
    onUpdateChips(-bet);
    setRoundWin(0);
    setScore(0);
    setMultiplier(1);
    const newGrid = createRandomGrid();
    setGrid(newGrid);
    playSynthSound('swap', isMuted);

    setTimeout(() => {
      processGridTurn(newGrid);
    }, 400);
  };

  // --- Bonus Treasure Game logic ---
  const triggerBonusLevel = () => {
    playSynthSound('chest', isMuted);
    triggerAlert("✨ 🎁 JACKPOT TREASURE LEVEL UNLOCKED! Pick mystery chests to reveal multipliers! 🎁 ✨", "success");
    
    // Generate 6 random chests
    const multipliers = [2.5, 4, 5, 8, 10, 15];
    const randomized = multipliers.map((mult, idx) => ({
      id: idx,
      multiplier: mult,
      opened: false
    })).sort(() => Math.random() - 0.5);

    setBonusChests(randomized);
    setBonusRoundsLeft(3);
    setAccumulatedBonusChips(0);
    setIsBonusActive(true);
  };

  const handleOpenChest = (chestId: number) => {
    if (bonusRoundsLeft <= 0) return;

    setBonusChests(prev => prev.map(c => {
      if (c.id === chestId) {
        if (c.opened) return c;
        const prizeChips = Math.floor(bet * c.multiplier);
        setAccumulatedBonusChips(prevScore => prevScore + prizeChips);
        onUpdateChips(prizeChips);
        triggerAlert(`Opened Chest! Found a ${c.multiplier}x Multiplier (+${prizeChips} Chips)! 👑`, "success");
        playSynthSound('match', isMuted);
        return { ...c, opened: true };
      }
      return c;
    }));

    setBonusRoundsLeft(prev => {
      const next = prev - 1;
      if (next === 0) {
        // Delay exiting so they see the opened chests
        setTimeout(() => {
          setIsBonusActive(false);
          triggerAlert(`Bonus Level Ended! Total rewards claimed: +${accumulatedBonusChips} Chips! 🎪`, "success");
        }, 1800);
      }
      return next;
    });
  };

  return (
    <div id="gems-fortune-active-pane" className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-2xl">
        <div className="flex gap-2 items-center">
          <span className="text-xl">💎</span>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">GEMS FORTUNE</h4>
            <div className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-white/40 font-mono">15,820 PLAYERS ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-1.5 items-center">
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isFavorite 
                ? 'bg-rose-500/20 border-rose-500 text-rose-500' 
                : 'bg-white/5 border-white/5 hover:border-white/10 text-white/50'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:border-white/10 text-white/50 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-xl border border-white/5 bg-white/5 hover:border-white/10 text-white/50 transition-all cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid & Playboard */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* Game Box */}
        <div className="bg-[#030310] border border-white/5 p-5 rounded-3xl relative min-h-[380px] flex flex-col justify-between overflow-hidden shadow-2xl">
          
          {/* Neon Grid Glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 rounded-full pointer-events-none blur-3xl" />
          
          {/* Normal Mode Play Board */}
          {!isBonusActive ? (
            <div className="relative flex flex-col items-center justify-center space-y-4 my-auto">
              {/* Instructions banner */}
              <div className="text-center">
                <span className="text-[9px] text-white/30 font-mono uppercase tracking-widest">
                  {selectedCell ? 'Now choose an adjacent gem to swap!' : 'Click any gem & adjacent to swap and match-3'}
                </span>
              </div>

              {/* Grid 5x5 */}
              <div className="grid grid-cols-5 gap-2 p-3.5 bg-white/5 rounded-2xl border border-white/10 relative z-10">
                {grid.map((row, rIdx) => 
                  row.map((gem, cIdx) => {
                    const isSelected = selectedCell?.r === rIdx && selectedCell?.c === cIdx;
                    
                    return (
                      <motion.button
                        key={gem.id}
                        onClick={() => handleCellClick(rIdx, cIdx)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center text-2xl filter transition-all duration-200 cursor-pointer ${
                          isSelected 
                            ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105' 
                            : gem.isMatched 
                              ? 'bg-red-500/30 border-red-500 scale-90 opacity-40' 
                              : 'bg-[#111126]/90 border-white/5 hover:border-white/20 hover:scale-103'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="filter drop-shadow select-none">{gem.emoji}</span>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            
            /* Bonus Pick Level Modal Mode */
            <div className="relative z-20 flex flex-col items-center justify-center space-y-4 my-auto text-center py-6">
              <div className="space-y-1 animate-pulse">
                <span className="text-[10px] bg-amber-400 text-black font-black font-mono px-3 py-0.5 rounded-full uppercase tracking-wider">🎁 BONUS TREASURE LEVEL 🎁</span>
                <h3 className="text-lg font-black text-white">CHOOSE {bonusRoundsLeft} MYSTERY CHESTS</h3>
                <p className="text-[10px] text-white/50">Each chest multiplies your active {bet} chip bet!</p>
              </div>

              {/* Mystery Chests Grid */}
              <div className="grid grid-cols-3 gap-4 max-w-sm pt-2">
                {bonusChests.map((chest) => (
                  <motion.button
                    key={chest.id}
                    disabled={chest.opened || bonusRoundsLeft <= 0}
                    onClick={() => handleOpenChest(chest.id)}
                    className={`w-20 h-20 rounded-2xl border flex flex-col justify-center items-center gap-1 transition-all relative overflow-hidden cursor-pointer ${
                      chest.opened
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                        : 'bg-amber-400/10 border-amber-400/30 hover:border-amber-400 text-amber-400'
                    }`}
                    whileHover={{ scale: chest.opened ? 1 : 1.05 }}
                  >
                    {chest.opened ? (
                      <>
                        <span className="text-xl">🔓</span>
                        <span className="text-xs font-mono font-bold">{chest.multiplier}x</span>
                      </>
                    ) : (
                      <>
                        <span className="text-2xl animate-bounce" style={{ animationDuration: '3s' }}>🎁</span>
                        <span className="text-[8px] font-mono tracking-widest text-white/50 uppercase">PICK</span>
                      </>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Accumulated bonus score */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-center">
                <span className="block text-[8px] text-white/40 uppercase font-mono">Bonus Accumulated Gains</span>
                <span className="text-sm font-mono font-black text-emerald-400">+{accumulatedBonusChips} CHIPS</span>
              </div>
            </div>
          )}

          {/* Quick Stats Panel inside Playboard */}
          <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-left">
            <div>
              <span className="block text-[8px] font-mono text-white/40 uppercase">TURN SCORE</span>
              <span className="text-sm font-mono font-bold text-white">{score}</span>
            </div>
            <div>
              <span className="block text-[8px] font-mono text-white/40 uppercase text-center">CHAIN MULTIPLIER</span>
              <span className="text-sm font-mono font-black text-amber-400 text-center block">x{multiplier}</span>
            </div>
            <div>
              <span className="block text-[8px] font-mono text-white/40 uppercase text-right">CHIP YIELD</span>
              <span className="text-sm font-mono font-bold text-emerald-400 text-right block">+{roundWin}</span>
            </div>
          </div>

        </div>

        {/* Control Console Sidebar */}
        <div className="space-y-4 flex flex-col justify-between">
          
          {/* Bet size adjust panel */}
          <div className="bg-[#0a0a1f] border border-white/10 p-5 rounded-3xl space-y-4 text-left shadow-xl">
            <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> WAGER SIZE SELECTOR
            </span>

            <div className="flex justify-between items-center">
              <button 
                onClick={() => handleBetChange(-10)}
                disabled={isPlaying}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold border border-white/5 cursor-pointer disabled:opacity-45"
              >
                -10
              </button>
              
              <div className="text-center">
                <span className="block text-[8px] font-mono text-white/40 uppercase">ACTIVE COINS</span>
                <span className="text-2xl font-mono font-black text-white">{bet}</span>
                <span className="block text-[8px] text-white/30">Chips Per Drop</span>
              </div>

              <button 
                onClick={() => handleBetChange(10)}
                disabled={isPlaying}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 font-bold border border-white/5 cursor-pointer disabled:opacity-45"
              >
                +10
              </button>
            </div>

            {/* Quick selectors */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[50, 100, 200, 500].map((val) => (
                <button
                  key={val}
                  disabled={isPlaying}
                  onClick={() => {
                    setBet(val);
                    playSynthSound('select', isMuted);
                  }}
                  className={`py-1.5 rounded-lg border text-xs font-mono font-bold cursor-pointer transition-all ${
                    bet === val 
                      ? 'bg-amber-400 text-black border-amber-300 shadow-md' 
                      : 'bg-white/5 border-white/5 text-white/60 hover:border-white/10'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Core Action Board */}
          <div className="bg-[#0a0a1f] border border-white/10 p-5 rounded-3xl space-y-3 shadow-xl">
            {/* Primary Action Button */}
            <button
              onClick={handleShuffleGrid}
              disabled={isPlaying || isBonusActive}
              className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} /> 
              {isPlaying ? 'SWEEPING BOARD...' : 'BOARD DROP MATCH'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (isPlaying || isBonusActive) return;
                  // Trigger a simulated hint/auto-assist match swap
                  let found = false;
                  for (let r = 0; r < GRID_SIZE && !found; r++) {
                    for (let c = 0; c < GRID_SIZE && !found; c++) {
                      // Try horizontal swap
                      if (c < GRID_SIZE - 1) {
                        const testGrid = grid.map(row => row.map(cell => ({ ...cell })));
                        const temp = testGrid[r][c];
                        testGrid[r][c] = testGrid[r][c + 1];
                        testGrid[r][c + 1] = temp;
                        const match = checkMatches(testGrid);
                        if (match.matchedCount > 0) {
                          handleCellClick(r, c);
                          setTimeout(() => handleCellClick(r, c + 1), 300);
                          found = true;
                        }
                      }
                      // Try vertical swap
                      if (r < GRID_SIZE - 1 && !found) {
                        const testGrid = grid.map(row => row.map(cell => ({ ...cell })));
                        const temp = testGrid[r][c];
                        testGrid[r][c] = testGrid[r + 1][c];
                        testGrid[r + 1][c] = temp;
                        const match = checkMatches(testGrid);
                        if (match.matchedCount > 0) {
                          handleCellClick(r, c);
                          setTimeout(() => handleCellClick(r + 1, c), 300);
                          found = true;
                        }
                      }
                    }
                  }
                  if (!found) {
                    triggerAlert("No instant match-3 patterns found. Try shuffling with standard drop!", "info");
                  }
                }}
                disabled={isPlaying || isBonusActive}
                className="flex-1 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-white/80 hover:bg-white/10 hover:border-white/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AUTO-MATCH ASSIST
              </button>
            </div>
          </div>

          {/* Quick payouts panel */}
          <div className="bg-gradient-to-b from-[#111126] to-[#0a0a1f] border border-white/5 p-4 rounded-2xl text-left">
            <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest mb-2">PAYOUT TABLE EXCEL</span>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(GEMS_METADATA).map(([type, data]) => (
                <div key={type} className="flex items-center gap-1 p-1 bg-white/5 rounded border border-white/5">
                  <span className="text-sm select-none">{data.emoji}</span>
                  <div className="leading-none">
                    <span className="text-[7px] font-mono text-white/40 block leading-none">{type.substring(0, 5)}</span>
                    <span className="text-[10px] font-mono font-bold text-amber-500 leading-none">{data.value} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
