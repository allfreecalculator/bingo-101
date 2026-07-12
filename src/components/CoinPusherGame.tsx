import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Sparkles, RefreshCw, Trophy, ArrowDown, HelpCircle } from 'lucide-react';

interface CoinPusherGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const CoinPusherGame: React.FC<CoinPusherGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [costPerDrop, setCostPerDrop] = useState<number>(10);
  const [pushing, setPushing] = useState<boolean>(false);
  
  // Coin Pusher simulation states
  const [ledgePile, setLedgePile] = useState<number>(45); // Current coins sitting on the ledge
  const [shakeMeter, setShakeMeter] = useState<number>(0); // Progress towards a big payout
  const [droppedCoins, setDroppedCoins] = useState<{ id: number; x: number; y: number }[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [pushedOffCount, setPushedOffCount] = useState<number | null>(null);

  // Auto mechanical sliding shelf animation simulator
  const [shelfForward, setShelfForward] = useState<boolean>(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setShelfForward(prev => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleDropCoin = () => {
    if (pushing) return;
    if (chips < costPerDrop) {
      triggerAlert('Insufficient chips to drop a coin!', 'error');
      return;
    }

    // Deduct cost
    onUpdateChips(-costPerDrop);
    onUpdateTask('play_pusher', 1);

    setPushing(true);
    setPushedOffCount(null);

    // Add a new falling coin
    const newId = Date.now();
    const randomX = Math.floor(Math.random() * 60) + 20; // 20% to 80% horizontal range
    setDroppedCoins(prev => [...prev, { id: newId, x: randomX, y: 0 }]);

    // Animate falling down onto the deck
    setTimeout(() => {
      // Shaking or physical reaction on the shelf pile
      const addedLedgeWeight = Math.random() * 2 + 1; // 1 to 3 coins worth of pressure
      const currentPile = ledgePile + addedLedgeWeight;
      setLedgePile(currentPile);

      // Chance to trigger coins falling off the front edge based on pile density!
      // If pile is high (> 40), more coins cascade
      let fallenCoins = 0;
      if (currentPile > 35) {
        const cascadeProbability = (currentPile - 30) / 40; // Higher density = more flow
        if (Math.random() < cascadeProbability) {
          fallenCoins = Math.floor(Math.random() * 3) + 1; // 1 to 3 coins fall off
        }
      }

      // Bonus Random Jackpots or Shake Meter triggers
      const nextShake = shakeMeter + Math.floor(Math.random() * 15) + 5;
      if (nextShake >= 100) {
        // GIANT CASCADE!
        fallenCoins += Math.floor(Math.random() * 6) + 4; // Add 4 to 9 additional coins
        setShakeMeter(0);
        triggerAlert('💥 ULTRA SHAKE! A massive wave of coins cascades off the edge!', 'success');
      } else {
        setShakeMeter(nextShake);
      }

      // Resolve results
      if (fallenCoins > 0) {
        const prizeAmount = fallenCoins * Math.round(costPerDrop * 1.5);
        onUpdateChips(prizeAmount);
        setPushedOffCount(fallenCoins);
        setLedgePile(prev => Math.max(20, prev - fallenCoins)); // Remove those from ledge
        triggerAlert(`🎯 Pushed ${fallenCoins} gold coins off the ledge! Won +${prizeAmount} Chips!`, 'success');
        setHistory(prev => [`🏆 Pushed ${fallenCoins} Coins (+${prizeAmount})`, ...prev].slice(0, 5));
      } else {
        setPushedOffCount(0);
        setHistory(prev => [`❌ Coin Dropped (Pile: ${Math.round(currentPile)})`, ...prev].slice(0, 5));
      }

      // Clear the temporary animated coin
      setDroppedCoins(prev => prev.filter(c => c.id !== newId));
      setPushing(false);
    }, 1000);
  };

  const adjustCost = (amount: number) => {
    if (pushing) return;
    setCostPerDrop(prev => Math.max(5, prev + amount));
  };

  return (
    <div className="bg-[#0b0b1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[9px] bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase font-mono tracking-widest px-3 py-1 rounded-full shadow-lg">
            Retro Neon Coin Pusher
          </span>
          <h3 className="text-xl font-black tracking-tight text-white mt-2 flex items-center gap-2">
            🪙 Golden Coin Pusher
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">Drop coins onto the moving shelf, push existing piles forward, and win chips!</p>
        </div>
      </div>

      {/* Cabinet Visual Board */}
      <div className="bg-[#04040c] border border-white/5 rounded-2xl p-6 mb-6 flex flex-col items-center relative overflow-hidden shadow-inner">
        
        {/* Piston / Sliding shelf track simulator */}
        <div className="w-full max-w-xs h-64 bg-zinc-950 border border-zinc-800 rounded-xl relative overflow-hidden flex flex-col justify-between p-3 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)]">
          
          {/* Moving Sweeper Bar at the top / back */}
          <motion.div
            animate={{ y: shelfForward ? 25 : 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="w-full h-8 bg-gradient-to-b from-zinc-700 to-zinc-800 border-b-2 border-amber-400/30 rounded-md flex items-center justify-center relative z-10 shadow-md"
          >
            <span className="text-[8px] font-mono text-amber-400/40 font-black tracking-widest">MECHANICAL SLIDE</span>
          </motion.div>

          {/* Golden Coin dropping animation container */}
          <div className="absolute inset-x-0 top-0 bottom-12 overflow-hidden pointer-events-none z-20">
            <AnimatePresence>
              {droppedCoins.map(coin => (
                <motion.div
                  key={coin.id}
                  initial={{ y: 0, opacity: 1, scale: 0.8 }}
                  animate={{ y: 160, opacity: [1, 1, 0.8], scale: 1.2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeIn' }}
                  className="absolute w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-600 via-yellow-400 to-amber-300 border border-yellow-700 flex items-center justify-center text-xs filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  style={{ left: `${coin.x}%` }}
                >
                  🪙
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* The Coin Ledge / Pile visualization */}
          <div className="w-full h-24 bg-gradient-to-b from-zinc-900 to-zinc-950 border-t-2 border-zinc-800 rounded-b-lg relative flex flex-col items-center justify-end pb-2">
            
            {/* Array of visual coins packed together on the ledge */}
            <div className="flex flex-wrap gap-1 justify-center max-w-[80%] absolute top-3">
              {Array.from({ length: Math.min(30, Math.round(ledgePile)) }).map((_, idx) => (
                <motion.div
                  key={idx}
                  animate={{ y: shelfForward ? 2 : 0 }}
                  className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-500 to-yellow-300 border border-yellow-600 shadow-sm flex-shrink-0 text-[8px] flex items-center justify-center"
                >
                  🪙
                </motion.div>
              ))}
            </div>

            {/* Glowing win chute edge at the absolute front bottom */}
            <div className="w-full h-4 bg-gradient-to-r from-yellow-400/10 via-yellow-400/20 to-yellow-400/10 border-t border-dashed border-yellow-400/40 absolute bottom-0 flex justify-between px-4 items-center">
              <span className="text-[6px] font-mono text-yellow-400/50">WIN CHUTE</span>
              <ArrowDown className="w-2.5 h-2.5 text-yellow-400/60 animate-bounce" />
              <span className="text-[6px] font-mono text-yellow-400/50">WIN CHUTE</span>
            </div>
          </div>

        </div>

        {/* Shake progress meter bar */}
        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between items-center text-[9px] font-mono text-white/40 mb-1">
            <span>CABINET TENSION METERS</span>
            <span className="text-yellow-400 font-bold">{shakeMeter}% SHAKE CHARGE</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-red-500 transition-all duration-300"
              style={{ width: `${shakeMeter}%` }}
            />
          </div>
        </div>

        {/* Status payout HUD */}
        <div className="mt-4 text-center min-h-[24px]">
          {pushedOffCount !== null && (
            <span className={`text-xs font-mono font-black ${pushedOffCount > 0 ? 'text-emerald-400' : 'text-white/40'}`}>
              {pushedOffCount > 0 
                ? `🎉 SUCCESS! ${pushedOffCount} coins fell! Recieved +${pushedOffCount * Math.round(costPerDrop * 1.5)} Chips!`
                : 'Coin settled on the pile. Keep pushing!'}
            </span>
          )}
        </div>
      </div>

      {/* Control panel deck */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Drop Chip cost
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustCost(-5)}
                disabled={pushing}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
              >
                -5
              </button>
              <span className="w-16 text-center font-mono font-black text-amber-400 text-sm flex items-center justify-center gap-0.5">
                <Coins className="w-3.5 h-3.5" />
                {costPerDrop}
              </span>
              <button
                onClick={() => adjustCost(5)}
                disabled={pushing}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
              >
                +5
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleDropCoin}
          disabled={pushing}
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          <ArrowDown className={`w-4 h-4 ${pushing ? 'animate-bounce' : ''}`} />
          {pushing ? 'COIN DROPPING...' : 'DROP GOLDEN COIN'}
        </button>
      </div>
    </div>
  );
};
