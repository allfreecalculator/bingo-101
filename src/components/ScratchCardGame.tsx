import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, Sparkles, Volume2, VolumeX, HelpCircle, Trophy, Ticket, Scissors } from 'lucide-react';

interface ScratchCardGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface ScratchSymbol {
  name: string;
  emoji: string;
  mult: number;
  color: string;
}

const SYMBOLS: ScratchSymbol[] = [
  { name: 'Cherry', emoji: '🍒', mult: 1, color: 'text-red-400' },
  { name: 'Lemon', emoji: '🍋', mult: 2, color: 'text-yellow-400' },
  { name: 'Grape', emoji: '🍇', mult: 5, color: 'text-purple-400' },
  { name: 'Diamond', emoji: '💎', mult: 15, color: 'text-cyan-400 font-black' },
  { name: 'Bell', emoji: '🔔', mult: 40, color: 'text-amber-400 font-extrabold animate-pulse' },
  { name: 'Crown', emoji: '👑', mult: 100, color: 'text-pink-400 font-black animate-bounce' },
];

type TicketTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'COSMIC';

interface TierConfig {
  name: string;
  cost: number;
  borderColor: string;
  bgColor: string;
  cardColor: string;
}

const TIERS: Record<TicketTier, TierConfig> = {
  BRONZE: { name: '🥉 Bronze Scratch', cost: 25, borderColor: 'border-orange-500/30', bgColor: 'bg-orange-500/5', cardColor: 'from-orange-500/20 to-orange-950/40' },
  SILVER: { name: '🥈 Silver Scratch', cost: 100, borderColor: 'border-slate-400/30', bgColor: 'bg-slate-400/5', cardColor: 'from-slate-400/20 to-slate-800/40' },
  GOLD: { name: '🥇 Gold Scratch', cost: 250, borderColor: 'border-yellow-400/30', bgColor: 'bg-yellow-400/5', cardColor: 'from-yellow-500/20 to-yellow-950/40' },
  COSMIC: { name: '👑 Cosmic Megafail', cost: 1000, borderColor: 'border-pink-500/40', bgColor: 'bg-pink-500/5', cardColor: 'from-pink-500/20 to-pink-950/40' }
};

class ScratchAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playScratch() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.setValueAtTime(150, now + 0.04);
      gain.gain.setValueAtTime(0.005, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  playWin() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [587.33, 698.46, 880, 1174.66]; // D5, F5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.02, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.22);
      });
    } catch (e) {}
  }
}

export const ScratchCardGame: React.FC<ScratchCardGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [activeTier, setActiveTier] = useState<TicketTier>('BRONZE');
  const [ticketBought, setTicketBought] = useState<boolean>(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [cardGrid, setCardGrid] = useState<ScratchSymbol[]>([]);
  const [payoutResult, setPayoutResult] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [bestWin, setBestWin] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  const audioRef = useRef<ScratchAudio>(new ScratchAudio());

  const handleBuyTicket = () => {
    const config = TIERS[activeTier];
    if (chips < config.cost) {
      triggerAlert(`Insufficient chips to buy a ${config.name} ticket!`, 'error');
      return;
    }

    onUpdateChips(-config.cost);
    onUpdateTask('casino_wager', config.cost);

    setTicketBought(true);
    setRevealed({});
    setPayoutResult(null);

    // Generate a fresh 3x3 scratch card grid (9 symbols total)
    // We want to create high probability of small wins and low probability of jackpots
    const grid: ScratchSymbol[] = [];
    
    // Check if we will win first (approx 35% chance of a winning ticket)
    const isWinner = Math.random() < 0.35;
    if (isWinner) {
      // Pick a random winning symbol
      const rollSym = Math.random();
      let winSym = SYMBOLS[0]; // Cherry
      if (rollSym < 0.45) winSym = SYMBOLS[0]; // Cherry
      else if (rollSym < 0.75) winSym = SYMBOLS[1]; // Lemon
      else if (rollSym < 0.90) winSym = SYMBOLS[2]; // Grape
      else if (rollSym < 0.96) winSym = SYMBOLS[3]; // Diamond
      else if (rollSym < 0.99) winSym = SYMBOLS[4]; // Bell
      else winSym = SYMBOLS[5]; // Crown

      // Place 3 of this symbol in the grid
      for (let i = 0; i < 3; i++) {
        grid.push(winSym);
      }

      // Fill remaining 6 slots with random symbols ensuring no other 3 matches
      while (grid.length < 9) {
        const randSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const counts = grid.filter(s => s.name === randSym.name).length;
        if (counts < 2) {
          grid.push(randSym);
        }
      }

      // Shuffle the grid
      grid.sort(() => Math.random() - 0.5);
    } else {
      // Create a losing grid
      while (grid.length < 9) {
        const randSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const counts = grid.filter(s => s.name === randSym.name).length;
        if (counts < 2) {
          grid.push(randSym);
        } else {
          // Fallback to Cherry
          grid.push(SYMBOLS[0]);
        }
      }
    }

    setCardGrid(grid);
  };

  const handleTileScratch = (idx: number) => {
    if (!ticketBought || revealed[idx]) return;

    audioRef.current.playScratch();
    const nextRevealed = { ...revealed, [idx]: true };
    setRevealed(nextRevealed);

    // If all 9 are scratched, perform win calculation
    if (Object.keys(nextRevealed).length === 9) {
      setTimeout(() => calculateWinResult(), 400);
    }
  };

  const handleScratchAll = () => {
    if (!ticketBought) return;
    
    audioRef.current.playScratch();
    const allRev: Record<number, boolean> = {};
    for (let i = 0; i < 9; i++) {
      allRev[i] = true;
    }
    setRevealed(allRev);
    setTimeout(() => calculateWinResult(), 400);
  };

  const calculateWinResult = () => {
    const symbolCounts: Record<string, number> = {};
    cardGrid.forEach((sym) => {
      symbolCounts[sym.name] = (symbolCounts[sym.name] || 0) + 1;
    });

    // Check if any symbol hit 3 matches
    let winSym: ScratchSymbol | null = null;
    Object.keys(symbolCounts).forEach((name) => {
      if (symbolCounts[name] >= 3) {
        winSym = SYMBOLS.find(s => s.name === name) || null;
      }
    });

    const ticketConfig = TIERS[activeTier];
    if (winSym) {
      const payout = Math.floor(ticketConfig.cost * winSym.mult);
      onUpdateChips(payout);
      setPayoutResult(payout);
      setBestWin(prev => Math.max(prev, payout));
      audioRef.current.playWin();
      triggerAlert(`🎉 CONGRATS! Matched 3x ${winSym.name} for a ${winSym.mult}x return! Won +${payout} Chips!`, 'success');
      setHistory(prev => [`Win ${winSym!.name} (${payout}c)`, ...prev.slice(0, 9)]);
      onUpdateTask('win_high_odds', 1);
    } else {
      setPayoutResult(0);
      triggerAlert('No matches this time! Purchase another ticket to scratch again! 🎟️', 'info');
      setHistory(prev => ['Lose card', ...prev.slice(0, 9)]);
    }

    setTicketBought(false);
  };

  return (
    <div id="scratchcard-game-container" className="bg-[#110521]/85 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Background decorations */}
      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/25 text-pink-400 flex items-center justify-center shadow-lg shadow-pink-500/5">
            <Ticket className="w-6 h-6 animate-pulse text-pink-400" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white uppercase font-sans flex items-center gap-2">
              Cosmic Scratchers <span className="text-[9px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30 font-bold">Instawin cards</span>
            </h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Match 3 identical neon symbols to win up to 100x rewards</p>
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
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
          </button>
          
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best Card: <span className="font-black text-amber-400">{bestWin}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_1.3fr_1fr] gap-6 items-start">
        
        {/* Left column: Ticket shop */}
        <div className="space-y-4">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2.5">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">1. Select Ticket Tier</span>
            <div className="flex flex-col gap-1.5">
              {(Object.keys(TIERS) as TicketTier[]).map((tierKey) => {
                const config = TIERS[tierKey];
                return (
                  <button
                    key={tierKey}
                    disabled={ticketBought}
                    onClick={() => setActiveTier(tierKey)}
                    className={`p-3 rounded-xl border transition-all text-left cursor-pointer flex justify-between items-center ${
                      activeTier === tierKey
                        ? `bg-pink-500/10 text-pink-300 border-pink-500/30 shadow-md`
                        : 'bg-transparent text-white/40 border-transparent hover:bg-white/2 hover:text-white'
                    } disabled:opacity-50`}
                  >
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-wide">{config.name}</div>
                      <div className="text-[9px] text-white/30 font-mono">Jackpot: Up to {config.cost * 100}c</div>
                    </div>
                    <div className="font-mono text-xs font-black text-white">{config.cost} c</div>
                  </button>
                );
              })}
            </div>
          </div>

          {!ticketBought ? (
            <button
              onClick={handleBuyTicket}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-pink-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4" /> PURCHASE TICKET
            </button>
          ) : (
            <button
              onClick={handleScratchAll}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4" /> SCRATCH ALL TILES
            </button>
          )}
        </div>

        {/* Center column: Interactive Scratch Foil Grid */}
        <div className="flex flex-col items-center justify-center">
          
          <div className="bg-[#0b0615] border-[6px] border-white/10 rounded-3xl p-5 w-full max-w-[320px] relative overflow-hidden shadow-2xl">
            {/* Inside ticket background glow pattern */}
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-pink-500/5" />

            <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-4">
              <span className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-wider">Scratch 3 Matches</span>
              <span className="text-[11px] font-black text-pink-400 font-mono">
                {ticketBought ? TIERS[activeTier].name : 'Buy Card!'}
              </span>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-3 gap-2.5 relative z-10">
              {ticketBought ? (
                cardGrid.map((sym, idx) => {
                  const isRevealed = revealed[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => handleTileScratch(idx)}
                      className={`h-20 rounded-2xl border transition-all flex flex-col items-center justify-center relative cursor-pointer overflow-hidden ${
                        isRevealed 
                          ? 'bg-black/60 border-white/5 text-white' 
                          : 'bg-gradient-to-br from-pink-500/30 to-purple-800/40 border-pink-500/40 text-pink-300 shadow-md hover:scale-102 hover:border-pink-400'
                      }`}
                    >
                      {isRevealed ? (
                        <div className="text-center animate-fade-in flex flex-col items-center justify-center">
                          <span className="text-2xl">{sym.emoji}</span>
                          <span className={`text-[8px] uppercase tracking-wider font-bold mt-1 ${sym.color}`}>
                            {sym.name}
                          </span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Sparkles className="w-4 h-4 text-pink-300 animate-pulse mx-auto mb-1" />
                          <span className="text-[9px] font-mono font-bold tracking-tight uppercase text-pink-200">Scratch</span>
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                Array(9).fill(0).map((_, idx) => (
                  <div
                    key={idx}
                    className="h-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center opacity-40 text-white/20 font-mono text-[9px] uppercase font-bold"
                  >
                    Locked
                  </div>
                ))
              )}
            </div>

            {/* Results popup overlays */}
            <AnimatePresence>
              {payoutResult !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/5 text-center"
                >
                  {payoutResult > 0 ? (
                    <div>
                      <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">🏆 Scratchcard payout</div>
                      <div className="text-lg font-black text-white font-mono mt-0.5">+{payoutResult} Chips! 🎉</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-[10px] font-mono text-white/40 font-bold uppercase tracking-widest">Better luck next card!</div>
                      <div className="text-xs font-mono text-white/60 mt-0.5">No match. Scratch again! 🎟️</div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

        {/* Right column: Symbol odds and guide */}
        <div className="space-y-4">
          <div className="bg-black/45 border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Symbols & Payout Multipliers</span>
            <div className="flex flex-col gap-1.5 font-mono text-[10px]">
              {SYMBOLS.map((sym, idx) => (
                <div key={idx} className="flex justify-between p-1 border-b border-white/5">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span>{sym.emoji}</span>
                    <span className="text-white/60">{sym.name}</span>
                  </span>
                  <span className="text-pink-400 font-extrabold">{sym.mult}x</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Scratch History</span>
            <div className="flex flex-col gap-1">
              {history.length === 0 ? (
                <span className="text-[10px] text-white/20 font-mono">No tickets scratched...</span>
              ) : (
                history.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-1.5 rounded-lg text-[9px] font-mono font-bold bg-white/5 text-white/75 border border-white/5"
                  >
                    {h}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
