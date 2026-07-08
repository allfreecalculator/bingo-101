import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, RefreshCw, Trophy, ShieldAlert, Sparkles } from 'lucide-react';

interface DiceGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

type BetOption = 'LOW' | 'HIGH';

export const DiceGame: React.FC<DiceGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [betAmount, setBetAmount] = useState<number>(20);
  const [betOption, setBetOption] = useState<BetOption>('LOW');
  const [rolling, setRolling] = useState<boolean>(false);
  const [playerRoll, setPlayerRoll] = useState<number>(50);
  
  const [result, setResult] = useState<{
    roll: number;
    outcome: string;
    chipsWon: number;
  } | null>(null);

  const rollingRef = useRef(false);

  const handleRoll = () => {
    if (rolling || rollingRef.current) return;
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to place this dice prediction!', 'error');
      return;
    }

    // Deduct bet
    onUpdateChips(-betAmount);
    setRolling(true);
    rollingRef.current = true;
    setResult(null);

    // Voice announcement
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('Predicting range for 100-sided roll!');
        u.volume = 0.25;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }

    // Rapid random number animation ticks
    let ticks = 0;
    const interval = setInterval(() => {
      setPlayerRoll(Math.floor(Math.random() * 101));
      ticks++;
      if (ticks > 15) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 100);
  };

  const finalizeRoll = () => {
    const finalRoll = Math.floor(Math.random() * 101);
    setPlayerRoll(finalRoll);

    const isLow = finalRoll <= 50;
    const isHigh = finalRoll >= 50;
    
    let won = false;
    let outcomeStr = '';

    if (finalRoll === 50) {
      outcomeStr = `Roll is exactly 50! Both ranges win!`;
      won = true; // Both LOW and HIGH win at exactly 50
    } else if (finalRoll < 50) {
      outcomeStr = `Roll: ${finalRoll} (Low Range: 0 to 50)`;
      won = betOption === 'LOW';
    } else {
      outcomeStr = `Roll: ${finalRoll} (High Range: 50 to 100)`;
      won = betOption === 'HIGH';
    }

    const multiplier = 2;
    const chipsWon = won ? Math.round(betAmount * multiplier) : 0;

    if (chipsWon > 0) {
      onUpdateChips(chipsWon);
      triggerAlert(`🎲 Prediction Won! +${chipsWon} Chips! (${outcomeStr})`, 'success');
      onUpdateTask('win_dice', 1);
      
      if (chipsWon >= 150) {
        onUpdateTask('win_big', 1);
      }
    } else {
      triggerAlert(`Prediction Lost! (${outcomeStr}) Try again!`, 'info');
    }

    setResult({
      roll: finalRoll,
      outcome: outcomeStr,
      chipsWon
    });
    setRolling(false);
    rollingRef.current = false;
  };

  const adjustBet = (amount: number) => {
    if (rolling) return;
    setBetAmount(prev => Math.max(5, prev + amount));
  };

  return (
    <div className="bg-[#0a0a1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-amber-400 text-black font-black uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full">Mini-Game</span>
          <h3 className="text-xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
            🎲 100-Sided Roll Predictor
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">High velocity rolls from 0 to 100. Predict low or high ranges!</p>
        </div>
      </div>

      {/* Dynamic Betting Options Grid (Only 0-50 and 50-100) */}
      <div className="mb-6">
        <span className="block text-[9px] font-mono text-white/40 uppercase tracking-widest mb-2 font-bold text-center sm:text-left">
          Choose Your Prediction Range:
        </span>
        
        <div className="grid grid-cols-2 gap-4">
          {([
            { key: 'LOW', label: 'LOW RANGE (0 to 50)', desc: 'Lands under or equal to 50', bg: 'hover:border-cyan-500/30', borderSel: 'border-cyan-400 text-cyan-200 bg-cyan-400/5 shadow-[0_0_15px_rgba(34,211,238,0.15)]' },
            { key: 'HIGH', label: 'HIGH RANGE (50 to 100)', desc: 'Lands over or equal to 50', bg: 'hover:border-purple-500/30', borderSel: 'border-purple-400 text-purple-200 bg-purple-400/5 shadow-[0_0_15px_rgba(192,132,252,0.15)]' }
          ] as const).map((opt) => {
            const isSelected = betOption === opt.key;
            return (
              <button
                key={opt.key}
                disabled={rolling}
                type="button"
                onClick={() => setBetOption(opt.key)}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? opt.borderSel
                    : `bg-[#111126]/60 border-white/5 text-white/60 ${opt.bg}`
                }`}
              >
                <span className="text-[13px] font-extrabold uppercase tracking-wider">{opt.label}</span>
                <span className="text-[10px] font-mono text-white/40 mt-1">{opt.desc}</span>
                <span className="text-[9px] font-mono mt-2 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Pays 2x Payout
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dice Table */}
      <div className="bg-[#05050e] border border-white/10 rounded-2xl p-6 shadow-inner relative flex flex-col items-center">
        
        <div className="flex flex-col items-center text-center space-y-4 w-full max-w-xs">
          <div className="flex items-center gap-1.5 justify-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">100-Sided Roll Indicator</span>
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          </div>

          {/* Glowing Digital D100 Meter */}
          <div className="relative flex items-center justify-center w-36 h-36 rounded-full border border-white/10 bg-white/5 shadow-2xl overflow-hidden group">
            <div className="absolute inset-2 rounded-full border border-dashed border-white/5 animate-spin-slow" />
            <div className={`absolute inset-0.5 rounded-full filter blur-[15px] transition-all opacity-40 ${
              playerRoll <= 50 ? 'bg-cyan-500/40' : 'bg-purple-500/40'
            }`} />
            <span className={`text-5xl font-mono font-black tracking-tighter relative z-10 transition-all ${
              rolling 
                ? 'text-white/40 scale-95' 
                : playerRoll <= 50 
                  ? 'text-cyan-400 shadow-cyan-500/10' 
                  : 'text-purple-400 shadow-purple-500/10'
            }`}>
              {playerRoll}
            </span>
            <span className="absolute bottom-5 text-[8px] font-mono text-white/30 tracking-widest font-bold">
              {rolling ? 'SPINNING...' : playerRoll <= 50 ? '0 - 50 LOW' : '50 - 100 HIGH'}
            </span>
          </div>

          {/* Visual Gauge track showing 0-100 scale */}
          <div className="w-full space-y-1">
            <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/10 relative">
              {/* Shaded low/high visual halves */}
              <div className="absolute left-0 top-0 w-1/2 h-full bg-cyan-500/10 border-r border-dashed border-white/15" />
              <div className="absolute right-0 top-0 w-1/2 h-full bg-purple-500/10" />
              
              {/* Rolling indicator track */}
              <motion.div 
                className={`h-full rounded-full transition-all ${
                  playerRoll <= 50 
                    ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' 
                    : 'bg-gradient-to-r from-purple-600 to-amber-400'
                }`}
                animate={{ width: `${playerRoll}%` }}
                transition={{ type: 'spring', damping: 14 }}
              />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-white/30 px-0.5 font-bold">
              <span>0</span>
              <span className="text-amber-400/60 text-[9px] font-black">50</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Outcome Banner */}
      <div className="my-4 text-center min-h-[40px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.outcome}
              initial={{ scale: 0.9, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -5 }}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border ${
                result.chipsWon > 0 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-white/5 border-white/5 text-white/40'
              }`}
            >
              {result.chipsWon > 0 ? (
                <span className="flex items-center gap-1.5 justify-center">
                  <Trophy className="w-3.5 h-3.5 animate-bounce text-amber-400" /> 
                  WINNER! {result.outcome} — Received +{result.chipsWon} Chips!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 justify-center">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  House Won the Wager. {result.outcome}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bet Configuration Drawer & Trigger Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Bet Amount
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => adjustBet(-10)}
                disabled={rolling || betAmount <= 10}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                -10
              </button>
              <span className="w-16 text-center font-mono font-black text-amber-400 text-sm flex items-center justify-center gap-0.5">
                <Coins className="w-3.5 h-3.5" />
                {betAmount}
              </span>
              <button
                type="button"
                onClick={() => adjustBet(10)}
                disabled={rolling || betAmount >= 500}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                +10
              </button>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1 font-bold">
              Predicting Option
            </span>
            <span className="block text-xs font-bold text-amber-300 font-mono mt-1 uppercase">
              {betOption === 'LOW' ? '0 to 50 (Low)' : '50 to 100 (High)'}
            </span>
          </div>
        </div>

        <button
          onClick={handleRoll}
          disabled={rolling}
          type="button"
          className={`w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer ${
            rolling ? 'brightness-75 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${rolling ? 'animate-spin' : ''}`} />
          {rolling ? 'ROLLING METER...' : 'INITIATE ROLL'}
        </button>
      </div>
    </div>
  );
};
