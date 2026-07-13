import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, HelpCircle, Trophy, Volume2, VolumeX, RotateCw, Hourglass } from 'lucide-react';

interface SolitaireGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface TileDef {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = ['⭐', '🌙', '💎', '👑', '♠️', '♥️', '🍀', '🚀'];

class MatchAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playFlip() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.1);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  playMatch(isFinal: boolean) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(isFinal ? 1046.5 : 783.99, now + 0.1); // C6 or G5
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.27);
    } catch (e) {}
  }
}

export const SolitaireGame: React.FC<SolitaireGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'RESOLVED'>('IDLE');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  const [tiles, setTiles] = useState<TileDef[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [timer, setTimer] = useState<number>(25); // 25 seconds countdown
  const [pairsMatched, setPairsMatched] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([]);

  const audioRef = useRef<MatchAudio>(new MatchAudio());
  const timerIntervalRef = useRef<any>(null);

  // Countdown clock tick
  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            resolveSolitaireGame(pairsMatched, true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState, pairsMatched]);

  const toggleSound = () => {
    const nextMute = !soundMuted;
    setSoundMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleStartGame = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to play Solitaire Match!', 'error');
      return;
    }
    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);

    // Create 16 tiles (8 pairs) and shuffle
    const deckSymbols = [...SYMBOLS, ...SYMBOLS];
    const shuffledSymbols = deckSymbols.sort(() => Math.random() - 0.5);

    const initialTiles = shuffledSymbols.map((sym, idx) => ({
      id: idx,
      symbol: sym,
      isFlipped: false,
      isMatched: false
    }));

    setTiles(initialTiles);
    setSelectedIds([]);
    setTimer(25);
    setPairsMatched(0);
    setGameState('PLAYING');
    triggerAlert('Cards dealt! You have 25 seconds to pair all symbols!', 'info');
  };

  const handleTileClick = (id: number) => {
    if (gameState !== 'PLAYING' || selectedIds.length >= 2 || selectedIds.includes(id)) return;

    audioRef.current.playFlip();
    const targetTile = tiles.find(t => t.id === id)!;
    if (targetTile.isMatched || targetTile.isFlipped) return;

    // Flip tile
    setTiles(prev => prev.map(t => t.id === id ? { ...t, isFlipped: true } : t));
    const nextSelected = [...selectedIds, id];
    setSelectedIds(nextSelected);

    if (nextSelected.length === 2) {
      const firstTile = tiles.find(t => t.id === nextSelected[0])!;
      const secondTile = tiles.find(t => t.id === nextSelected[1])!;

      if (firstTile.symbol === secondTile.symbol) {
        // MATCH!
        const newMatchedCount = pairsMatched + 1;
        setPairsMatched(newMatchedCount);
        audioRef.current.playMatch(newMatchedCount === 8);

        setTimeout(() => {
          setTiles(prev => prev.map(t => 
            t.id === nextSelected[0] || t.id === nextSelected[1]
              ? { ...t, isMatched: true, isFlipped: true }
              : t
          ));
          setSelectedIds([]);

          // Check if all matched
          if (newMatchedCount === 8) {
            clearInterval(timerIntervalRef.current);
            resolveSolitaireGame(8, false);
          } else {
            triggerAlert(`Matched pair! +0.15x partial reward stacked.`, 'success');
          }
        }, 500);
      } else {
        // NO MATCH - flip back
        setTimeout(() => {
          setTiles(prev => prev.map(t => 
            t.id === nextSelected[0] || t.id === nextSelected[1]
              ? { ...t, isFlipped: false }
              : t
          ));
          setSelectedIds([]);
        }, 800);
      }
    }
  };

  const resolveSolitaireGame = (finalPairs: number, timeExpired: boolean) => {
    setGameState('RESOLVED');

    // Multipliers: Clear all = 3.0x, otherwise matched pairs earn 0.15x partial each
    let mult = 0;
    if (finalPairs === 8) {
      mult = 3.0;
    } else {
      mult = parseFloat((finalPairs * 0.15).toFixed(2));
    }

    const payout = Math.floor(betAmount * mult);
    if (payout > 0) {
      onUpdateChips(payout);
    }

    if (finalPairs === 8) {
      triggerAlert(`EXCELLENT MEMORY! Cleared grid in time! Multiplier: 3.0x (+${payout} Chips)! 🀄🏆`, 'success');
      onUpdateTask('win_high_odds', 1);
    } else if (timeExpired) {
      triggerAlert(`Time expired! Matched ${finalPairs} pairs. Payout: ${mult}x (+${payout} Chips).`, 'info');
    }

    setHistory(prev => [finalPairs, ...prev.slice(0, 9)]);
  };

  const adjustBet = (amount: number) => {
    if (gameState !== 'IDLE' && gameState !== 'RESOLVED') return;
    setBetAmount(prev => Math.max(10, Math.min(chips, prev + amount)));
  };

  const setBetMax = () => {
    if (gameState !== 'IDLE' && gameState !== 'RESOLVED') return;
    setBetAmount(Math.min(chips, 1000));
  };

  return (
    <div id="solitaire-game-root" className="space-y-6">
      {/* GAME HEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase">
            <Hourglass className="w-5 h-5 text-amber-400" /> Solitaire Match
          </h3>
          <p className="text-[11px] text-white/50 font-mono">MATCH ALL NEON PAIRS UNDER THE TIME LIMIT TO SCORE A 3.0X JACKPOT</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all border border-white/5"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* GAME LOBBY GRID */}
      <div className="grid lg:grid-cols-[1fr_1.8fr] gap-6">
        {/* CONTROLS */}
        <div className="bg-[#0a0a1f] border border-white/10 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block mb-1.5">Wager Settings</span>
              <div className="flex items-center gap-2 bg-[#111126]/60 border border-white/5 rounded-xl p-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(10, Math.min(chips, parseInt(e.target.value) || 0)))}
                  disabled={gameState === 'PLAYING'}
                  className="bg-transparent text-sm font-mono font-black text-white focus:outline-none w-full"
                />
                <button
                  onClick={setBetMax}
                  disabled={gameState === 'PLAYING'}
                  className="px-2.5 py-1 text-[10px] font-black uppercase font-mono bg-amber-400 text-black hover:bg-amber-300 rounded-lg tracking-wider"
                >
                  MAX
                </button>
              </div>
              <div className="flex gap-1.5 mt-2">
                {[-50, -10, 10, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => adjustBet(val)}
                    disabled={gameState === 'PLAYING'}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-mono font-bold rounded-lg border border-white/5"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Match indicators */}
            <div className="bg-[#111126]/60 border border-white/5 rounded-xl p-4 space-y-2 font-mono text-xs">
              <span className="text-[10px] text-white/40 uppercase block mb-1">SCORE METRICS</span>
              <div className="flex justify-between items-center text-xs">
                <span>Countdown Clock:</span>
                <span className={`font-black text-sm ${timer <= 8 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`}>
                  ⏳ {timer}s
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Matched Pairs:</span>
                <span className="font-bold text-teal-400 text-sm">{pairsMatched} / 8</span>
              </div>
            </div>

            {/* Guide */}
            <div className="bg-[#111126]/40 rounded-xl p-3 border border-white/5 text-[10px] text-white/50 space-y-1 font-mono">
              <span className="font-bold text-white/80 uppercase block mb-1 tracking-wider">GAME BONUSES</span>
              <p>• Clear the full grid for a massive <b className="text-yellow-400">3.0x Jackpot Payout</b>.</p>
              <p>• Each individual matched pair stacks a <b className="text-teal-400">0.15x return</b> even if you run out of time.</p>
            </div>
          </div>

          <div className="pt-2">
            {gameState === 'IDLE' || gameState === 'RESOLVED' ? (
              <button
                onClick={handleStartGame}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> DRAW INTERACTIVE GRID
              </button>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-white/5 text-white/30 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 animate-pulse"
              >
                CLOCK TICKING... MATCH QUICK ⚡
              </button>
            )}
          </div>
        </div>

        {/* TILES CONTAINER AREA */}
        <div className="bg-[#070719] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(24,16,48,0.7)_0%,rgba(5,5,15,1)_100%)]" />

          {/* ACTIVE GRID */}
          {gameState === 'IDLE' ? (
            <div className="text-center space-y-2 z-10 text-white/40 font-mono p-10">
              <span className="text-4xl animate-pulse block">🎴</span>
              <p className="text-[11px]">INITIALIZE MATCH TO DEPLOY 4X4 CARD PLACEMENTS</p>
            </div>
          ) : (
            <div className="relative z-10 grid grid-cols-4 gap-2 w-full max-w-sm">
              {tiles.map((tile) => {
                const isSelected = selectedIds.includes(tile.id);
                const showSymbol = tile.isFlipped || tile.isMatched || isSelected;

                return (
                  <motion.button
                    key={tile.id}
                    whileHover={!showSymbol && gameState === 'PLAYING' ? { scale: 1.05 } : {}}
                    onClick={() => handleTileClick(tile.id)}
                    disabled={gameState !== 'PLAYING' || showSymbol}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
                      tile.isMatched 
                        ? 'bg-green-500/10 border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.35)] opacity-60' 
                        : showSymbol
                        ? 'bg-[#111126] border-amber-400 text-white'
                        : 'bg-indigo-950/40 border-white/10 hover:border-amber-400 cursor-pointer shadow-lg'
                    }`}
                  >
                    {showSymbol ? (
                      <span className="text-2xl filter drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]">
                        {tile.symbol}
                      </span>
                    ) : (
                      <div className="absolute inset-1.5 border border-dashed border-white/15 rounded-lg flex flex-col items-center justify-center bg-[#090918]">
                        <span className="text-[9px] font-mono text-white/20">🎴</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* RESULTS OVERLAY */}
          {gameState === 'RESOLVED' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute z-20 bg-black/95 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center space-y-1.5 text-center"
            >
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
              <h4 className="text-xs font-black uppercase text-white/40">MEMORY SUMMARY</h4>
              <p className="text-base font-black text-white">
                {pairsMatched === 8 ? '🏆 GRID FULLY CLEARED!' : `MATCHED ${pairsMatched} PAIRS!`}
              </p>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20 font-bold">
                Payout Multiplier: {pairsMatched === 8 ? 3.0 : parseFloat((pairsMatched * 0.15).toFixed(2))}x
              </span>
              <button
                onClick={() => setGameState('IDLE')}
                className="mt-3 px-3 py-1 bg-white/10 hover:bg-white/15 text-white font-extrabold text-[10px] rounded-lg border border-white/5 flex items-center gap-1 cursor-pointer"
              >
                PLAY AGAIN
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
