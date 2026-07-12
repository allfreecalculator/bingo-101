import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Trophy, RefreshCw, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

interface LimboGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const LimboGame: React.FC<LimboGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [bet, setBet] = useState<number>(20);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.00);
  const [rolling, setRolling] = useState<boolean>(false);
  const [rolledResult, setRolledResult] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<'win' | 'lose' | null>(null);

  const calculateWinProbability = (target: number) => {
    // 98% house baseline probability divisor
    return Math.min(98, (98 / target)).toFixed(2);
  };

  const handleRoll = () => {
    if (rolling) return;
    if (chips < bet) {
      triggerAlert('Insufficient chips to submit your Limbo bet!', 'error');
      return;
    }

    // Deduct bet
    onUpdateChips(-bet);
    onUpdateTask('play_limbo', 1);

    setRolling(true);
    setRolledResult(null);
    setOutcome(null);

    // Random roll generator following Pareto crypto distribution
    // Formula: roll = 98 / (100 * Math.random()) with minimum of 1.00
    setTimeout(() => {
      const randVal = Math.random();
      let roll = 0.98 / (1 - randVal);
      if (roll < 1.00) roll = 1.00;
      
      // Cap max possible roll for sanity
      if (roll > 100000) roll = 100000;

      const roundedRoll = parseFloat(roll.toFixed(2));
      setRolledResult(roundedRoll);

      const isWin = roundedRoll >= targetMultiplier;
      setOutcome(isWin ? 'win' : 'lose');
      setRolling(false);

      if (isWin) {
        const winnings = Math.round(bet * targetMultiplier);
        onUpdateChips(winnings);
        triggerAlert(`🎉 CRASH HIGHER! Roll hit ${roundedRoll}x. Won +${winnings} Chips!`, 'success');
      } else {
        triggerAlert(`Target missed. Rolled ${roundedRoll}x. Try lowering target for safer bets!`, 'info');
      }
    }, 700);
  };

  const adjustBet = (amount: number) => {
    if (rolling) return;
    setBet(prev => Math.max(5, prev + amount));
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (rolling) return;
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setTargetMultiplier(Math.max(1.01, Math.min(1000, val)));
    }
  };

  return (
    <div className="bg-[#0b0b1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative radial blur */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[9px] bg-gradient-to-r from-cyan-400 to-emerald-500 text-black font-black uppercase font-mono tracking-widest px-3 py-1 rounded-full shadow-lg">
            Crypto Infinite Multipliers
          </span>
          <h3 className="text-xl font-black tracking-tight text-white mt-2 flex items-center gap-2">
            🚀 Limbo Instant Roll
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">Define your target multiplier. If the random roll is higher, you win the payout!</p>
        </div>
      </div>

      {/* Roll Arena Display screen */}
      <div className="bg-[#04040c] border border-white/5 rounded-2xl py-12 px-6 mb-6 flex flex-col items-center justify-center min-h-[180px] shadow-inner relative overflow-hidden">
        
        {/* Particle speed lines when rolling */}
        {rolling && (
          <div className="absolute inset-0 overflow-hidden opacity-30">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className="absolute bg-gradient-to-r from-transparent via-cyan-400 to-transparent h-[1px] w-full animate-pulse"
                style={{ top: `${i * 20}%`, animationDuration: `${0.2 + i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {rolling ? (
            <motion.div
              key="rolling"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center font-mono font-black text-6xl text-cyan-400 animate-pulse tracking-tighter"
            >
              SPINNING...
            </motion.div>
          ) : rolledResult !== null ? (
            <motion.div
              key={rolledResult}
              initial={{ scale: 0.3, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 15 }}
              className="text-center"
            >
              <div className={`text-7xl font-black font-mono tracking-tighter filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] ${
                outcome === 'win' 
                  ? 'text-emerald-400' 
                  : 'text-red-500'
              }`}>
                {rolledResult.toFixed(2)}x
              </div>
              <span className={`text-[10px] font-mono font-black tracking-widest px-3 py-1 rounded-full uppercase mt-3 inline-block border ${
                outcome === 'win'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/25 text-red-400'
              }`}>
                {outcome === 'win' ? '🎯 TARGET PASSED' : '❌ CRASHED BELOW TARGET'}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <TrendingUp className="w-12 h-12 text-cyan-500/30 mx-auto mb-3" />
              <div className="text-white/40 text-xs font-mono">
                Set target and roll. Expected probability: <span className="text-emerald-400 font-extrabold">{calculateWinProbability(targetMultiplier)}%</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Target Setting Controls */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        
        {/* Target multiplier input */}
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
          <label className="block text-[9px] font-mono text-white/40 uppercase tracking-widest font-black mb-2">
            TARGET MULTIPLIER (x)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.05"
              min="1.01"
              max="1000"
              disabled={rolling}
              value={targetMultiplier}
              onChange={handleTargetChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white font-mono font-black text-sm focus:outline-none focus:border-cyan-400 transition-all text-center"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 font-bold font-mono text-xs pointer-events-none">x</span>
          </div>
        </div>

        {/* Win chance and payoff simulation HUD */}
        <div className="bg-white/5 border border-[#ffffff05] p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-widest font-black mb-1">
              PROBABILITY WIN CHANCE
            </span>
            <div className="text-sm font-mono font-black text-emerald-400">
              {calculateWinProbability(targetMultiplier)}%
            </div>
            <p className="text-[9px] text-white/40 mt-1 leading-relaxed">
              Inversely proportional based on mathematical crypto casino standard divisor.
            </p>
          </div>
        </div>

      </div>

      {/* Betting Desk Board */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Wager Amount
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustBet(-10)}
                disabled={rolling}
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
              >
                -10
              </button>
              <span className="w-16 text-center font-mono font-black text-amber-400 text-sm flex items-center justify-center gap-0.5">
                <Coins className="w-3.5 h-3.5" />
                {bet}
              </span>
              <button
                onClick={() => adjustBet(10)}
                disabled={rolling}
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
              >
                +10
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleRoll}
          disabled={rolling}
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-emerald-500 hover:from-cyan-300 hover:to-emerald-400 text-black font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${rolling ? 'animate-spin' : ''}`} />
          {rolling ? 'ROLLING MULTIPLIER...' : 'SUBMIT ROLL'}
        </button>
      </div>
    </div>
  );
};
