import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Trophy, RefreshCw, Eye, Sparkles } from 'lucide-react';

interface ShellGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const ShellGame: React.FC<ShellGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [bet, setBet] = useState<number>(20);
  const [shuffling, setShuffling] = useState<boolean>(false);
  const [hasShuffled, setHasShuffled] = useState<boolean>(false);
  const [ballPosition, setBallPosition] = useState<number>(-1); // 0, 1, or 2
  const [revealed, setRevealed] = useState<boolean>(false);
  const [selectedCup, setSelectedCup] = useState<number>(-1);
  const [outcome, setOutcome] = useState<'win' | 'lose' | null>(null);

  const startShuffle = () => {
    if (shuffling) return;
    if (chips < bet) {
      triggerAlert('Insufficient chips to start cup shuffle!', 'error');
      return;
    }

    // Deduct bet
    onUpdateChips(-bet);
    onUpdateTask('play_shell', 1);

    setShuffling(true);
    setRevealed(false);
    setSelectedCup(-1);
    setOutcome(null);
    setHasShuffled(false);

    // Randomize winning cup position
    const winningIndex = Math.floor(Math.random() * 3);
    setBallPosition(winningIndex);

    // Simulated shuffling cycles
    let shuffleCount = 0;
    const interval = setInterval(() => {
      shuffleCount++;
      if (shuffleCount >= 5) {
        clearInterval(interval);
        setShuffling(false);
        setHasShuffled(true);
        triggerAlert('Cups shuffled! Follow your instincts and tap a cup.', 'info');
      }
    }, 350);
  };

  const handleCupSelection = (cupIndex: number) => {
    if (shuffling || !hasShuffled || revealed) return;

    setSelectedCup(cupIndex);
    setRevealed(true);

    if (cupIndex === ballPosition) {
      const winAmount = Math.round(bet * 2.8);
      onUpdateChips(winAmount);
      setOutcome('win');
      triggerAlert(`🎉 Correct! You found the diamond and won +${winAmount} Chips!`, 'success');
    } else {
      setOutcome('lose');
      triggerAlert('Empty! Better luck on the next shuffle.', 'info');
    }
  };

  const adjustBet = (amount: number) => {
    if (shuffling || (hasShuffled && !revealed)) return;
    setBet(prev => Math.max(5, prev + amount));
  };

  return (
    <div className="bg-[#0b0b1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Visual Accent Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[9px] bg-gradient-to-r from-purple-400 to-pink-500 text-white font-black uppercase font-mono tracking-widest px-3 py-1 rounded-full shadow-lg">
            Cup & Diamond Shell Game
          </span>
          <h3 className="text-xl font-black tracking-tight text-white mt-2 flex items-center gap-2">
            🔮 Golden Shell Duel
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">Focus carefully, watch the shuffle, and find the hidden diamond!</p>
        </div>
      </div>

      {/* The Playing Stage */}
      <div className="bg-[#04040c] border border-white/5 rounded-2xl py-12 px-6 shadow-inner relative flex flex-col items-center">
        
        {/* Cups alignment board */}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 w-full max-w-md relative z-10">
          {[0, 1, 2].map((idx) => {
            const isSelected = selectedCup === idx;
            const isBallHere = ballPosition === idx;
            
            return (
              <div key={idx} className="flex flex-col items-center justify-end h-48 relative">
                
                {/* Reveal state showing ball */}
                <AnimatePresence>
                  {revealed && isBallHere && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute bottom-4 flex flex-col items-center z-0"
                    >
                      <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">💎</span>
                      <span className="text-[8px] font-mono font-bold text-cyan-400 mt-1">FOUND IT</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Shuffling / Selected cup model */}
                <motion.button
                  disabled={shuffling || !hasShuffled || revealed}
                  onClick={() => handleCupSelection(idx)}
                  animate={
                    shuffling 
                      ? { 
                          x: [0, idx === 0 ? 120 : idx === 2 ? -120 : 60, idx === 0 ? 60 : -60, 0],
                          y: [0, -25, 10, -10, 0]
                        }
                      : revealed 
                      ? { y: isSelected || isBallHere ? -60 : 0 }
                      : { y: 0 }
                  }
                  transition={shuffling ? { duration: 0.35, ease: 'easeInOut' } : { type: 'spring', stiffness: 200, damping: 15 }}
                  className={`relative z-10 w-20 h-24 flex items-center justify-center rounded-t-3xl bg-gradient-to-b from-purple-600 to-indigo-800 border-2 border-purple-400/30 shadow-[0_10px_20px_rgba(0,0,0,0.5)] focus:outline-none transition-all ${
                    shuffling ? 'cursor-wait' : !hasShuffled ? 'opacity-80' : revealed ? 'opacity-90' : 'hover:scale-105 hover:border-purple-400 cursor-pointer'
                  }`}
                >
                  {/* Decorative engraving patterns */}
                  <div className="absolute inset-x-2 top-4 bottom-2 border-t border-b border-purple-300/10 flex flex-col justify-between py-1">
                    <div className="w-full h-[1px] bg-white/5" />
                    <div className="w-full h-1 bg-white/5 rounded-full" />
                    <div className="w-full h-[1px] bg-white/5" />
                  </div>

                  <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">🏺</span>
                </motion.button>

                {/* Cup shadow plate */}
                <div className="w-20 h-3 bg-black/60 rounded-full blur-[3px] mt-2 z-0" />
              </div>
            );
          })}
        </div>

        {/* Status prompt */}
        <div className="mt-8 text-center min-h-[30px]">
          {shuffling ? (
            <span className="text-xs font-mono font-black text-purple-400 animate-pulse flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              SHUFFLING THE CUPS... WATCH CLOSELY!
            </span>
          ) : !hasShuffled ? (
            <span className="text-xs font-mono text-white/40 flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-white/30" />
              Place your wager and tap shuffle to start!
            </span>
          ) : revealed ? (
            <div className="flex items-center gap-2 justify-center">
              {outcome === 'win' ? (
                <span className="text-xs font-mono text-emerald-400 font-extrabold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> YOU WON! +{Math.round(bet * 2.8)} CHIPS
                </span>
              ) : (
                <span className="text-xs font-mono text-white/50">
                  Empty cup! Diamond was under another shell.
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs font-mono text-amber-300 font-black animate-bounce flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> SELECT A CUP TO FIND THE DIAMOND!
            </span>
          )}
        </div>
      </div>

      {/* Betting Dashboard controls */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Wager Amount
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustBet(-10)}
                disabled={shuffling || (hasShuffled && !revealed)}
                type="button"
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
                disabled={shuffling || (hasShuffled && !revealed)}
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                +10
              </button>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Payout odds
            </span>
            <div className="text-xs text-white/80 font-black font-mono">
              <span className="text-emerald-400">2.8x</span> payout
            </div>
          </div>
        </div>

        <button
          onClick={startShuffle}
          disabled={shuffling || (hasShuffled && !revealed)}
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${shuffling ? 'animate-spin' : ''}`} />
          {shuffling ? 'SHUFFLING...' : 'SHUFFLE CUPS'}
        </button>
      </div>
    </div>
  );
};
