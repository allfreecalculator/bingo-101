import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Sparkles, RefreshCw, HelpCircle, Trophy } from 'lucide-react';

interface SlotGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

const REEL_SYMBOLS = [
  { char: '🍒', weight: 15, name: 'Cherry', mult: 3 },
  { char: '🍋', weight: 15, name: 'Lemon', mult: 4 },
  { char: '🍊', weight: 12, name: 'Orange', mult: 5 },
  { char: '🍇', weight: 10, name: 'Grape', mult: 8 },
  { char: '🔔', weight: 8, name: 'Bell', mult: 12 },
  { char: '💎', weight: 5, name: 'Diamond', mult: 25 },
  { char: '7️⃣', weight: 3, name: 'Seven', mult: 50 }
];

export const SlotGame: React.FC<SlotGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [bet, setBet] = useState<number>(20);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [reels, setReels] = useState<string[]>(['🍒', '💎', '7️⃣']);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);

  // Helper to pick symbol based on weights
  const getRandomSymbol = () => {
    const totalWeight = REEL_SYMBOLS.reduce((acc, curr) => acc + curr.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const sym of REEL_SYMBOLS) {
      if (rand < sym.weight) return sym.char;
      rand -= sym.weight;
    }
    return REEL_SYMBOLS[0].char;
  };

  const handleSpin = () => {
    if (spinning) return;
    if (chips < bet) {
      triggerAlert('Insufficient chips to place this slot wager!', 'error');
      return;
    }

    // Deduct wager
    onUpdateChips(-bet);
    setSpinning(true);
    setLastWin(null);
    onUpdateTask('play_slots', 1);

    // Audio/speech synthesis support if available
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('Spinning reels!');
        u.volume = 0.3;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }

    // Simulate multi-step reel stopping
    let counter = 0;
    const interval = setInterval(() => {
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        finalizeSpin();
      }
    }, 100);
  };

  const finalizeSpin = () => {
    const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    setReels(finalReels);

    const [r1, r2, r3] = finalReels;
    let multiplier = 0;
    let winMsg = '';

    if (r1 === r2 && r2 === r3) {
      // 3 of a kind
      const sym = REEL_SYMBOLS.find(s => s.char === r1);
      multiplier = sym ? sym.mult : 5;
      winMsg = `JACKPOT! Three ${sym?.name || 'matching'} symbols!`;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      // 2 of a kind
      const matchedChar = r1 === r2 ? r1 : r3;
      const sym = REEL_SYMBOLS.find(s => s.char === matchedChar);
      multiplier = sym ? Math.max(1.5, Math.round(sym.mult / 3)) : 1.5;
      winMsg = `Nice! Double ${sym?.name || 'matching'} symbols!`;
    }

    if (multiplier > 0) {
      const payout = Math.round(bet * multiplier);
      onUpdateChips(payout);
      setLastWin(payout);
      triggerAlert(`🎰 ${winMsg} Won ${payout} Chips!`, 'success');
      
      if (payout >= 150) {
        onUpdateTask('win_big', 1);
      }
    } else {
      setLastWin(0);
      triggerAlert('No luck this time! Spin again.', 'info');
    }

    setSpinning(false);
  };

  const adjustBet = (amount: number) => {
    if (spinning) return;
    setBet(prev => Math.max(5, prev + amount));
  };

  return (
    <div className="bg-[#0a0a1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[10px] bg-amber-400 text-black font-black uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full">Mini-Game</span>
          <h3 className="text-lg font-black tracking-tight text-white mt-1 flex items-center gap-2">
            🎰 Vegas Golden Reels
          </h3>
          <p className="text-[10px] text-white/40 font-mono">Classic 3-Reel Slots Machine</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowPaytable(!showPaytable)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-xs flex items-center gap-1 font-mono"
            title="View Paytable"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PAYTABLE</span>
          </button>
        </div>
      </div>

      {/* Paytable Modal Overlap */}
      {showPaytable && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-[#111126] border border-amber-400/20 rounded-2xl text-xs space-y-2 text-white/80"
        >
          <div className="flex justify-between font-bold border-b border-white/10 pb-1 text-amber-400">
            <span>Symbol</span>
            <span>Payout (3 of a kind)</span>
          </div>
          <div className="grid grid-cols-2 gap-y-1.5 font-mono text-[11px]">
            {REEL_SYMBOLS.map(sym => (
              <React.Fragment key={sym.char}>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{sym.char}</span>
                  <span>{sym.name}</span>
                </div>
                <div className="text-right text-emerald-400 font-bold">{sym.mult}x Bet</div>
              </React.Fragment>
            ))}
          </div>
          <p className="text-[9px] text-white/40 pt-1.5 border-t border-white/5 leading-tight">
            * Note: Double matching symbols award a consolidated payout of up to 1/3 of the jackpot multiplier. Minimum bet is 5 chips.
          </p>
        </motion.div>
      )}

      {/* Slots Physical Frame */}
      <div className="bg-[#05050e] border-2 border-white/10 rounded-2xl p-6 shadow-inner relative flex flex-col items-center">
        {/* Payline markers */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-amber-400/40" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-amber-400/40" />

        {/* 3 Reels Showcase */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
          {reels.map((symbol, idx) => (
            <div
              key={idx}
              className="bg-[#11112a] border border-white/10 rounded-xl h-28 flex items-center justify-center relative overflow-hidden shadow-inner"
            >
              {/* Subtle grid backing lines */}
              <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${idx}-${symbol}`}
                  initial={{ y: spinning ? -60 : 0, opacity: spinning ? 0 : 1 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: spinning ? 60 : 0, opacity: spinning ? 0 : 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="text-4xl filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)] select-none"
                >
                  {symbol}
                </motion.span>
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Win Payout Display */}
        <div className="mt-5 text-center min-h-[36px] flex items-center justify-center">
          {lastWin !== null && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold ${
                lastWin > 0 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-white/5 border border-white/5 text-white/30'
              }`}
            >
              {lastWin > 0 ? (
                <span className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 animate-bounce" /> WINNER: +{lastWin} CHIPS!
                </span>
              ) : (
                <span>BET SETTLED / NO WIN</span>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Betting and Controls Dashboard */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Bet Amount
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustBet(-10)}
                disabled={spinning || bet <= 10}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                -10
              </button>
              <span className="w-16 text-center font-mono font-black text-amber-400 text-sm flex items-center justify-center gap-0.5">
                <Coins className="w-3.5 h-3.5" />
                {bet}
              </span>
              <button
                onClick={() => adjustBet(10)}
                disabled={spinning || bet >= 500}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                +10
              </button>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Current Wager
            </span>
            <div className="text-[11px] text-white/60 font-medium">
              Max Payout: <strong className="text-emerald-400 font-mono">{(bet * 50)}</strong> chips
            </div>
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer ${
            spinning ? 'brightness-75 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
          {spinning ? 'SPINNING...' : 'SPIN REELS'}
        </button>
      </div>
    </div>
  );
};
