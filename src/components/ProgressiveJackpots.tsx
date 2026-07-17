import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flame, Sparkles, AlertCircle, Zap } from 'lucide-react';

interface JackpotAlert {
  id: string;
  winner: string;
  amount: number;
  tier: 'GRAND' | 'MAJOR' | 'MINI';
}

export const ProgressiveJackpots: React.FC<{ isDarkMode: boolean; onUpdateChips?: (amount: number) => void }> = ({
  isDarkMode,
  onUpdateChips
}) => {
  // Live ticker states for jackpot pools
  const [grandJackpot, setGrandJackpot] = useState(1485290.45);
  const [majorJackpot, setMajorJackpot] = useState(258410.20);
  const [miniJackpot, setMiniJackpot] = useState(18420.85);

  // Active jackpot trigger notification
  const [currentAlert, setCurrentAlert] = useState<JackpotAlert | null>(null);

  // Tick jackpots upwards in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setGrandJackpot(prev => prev + 0.37);
      setMajorJackpot(prev => prev + 0.09);
      setMiniJackpot(prev => prev + 0.02);
    }, 150);

    return () => clearInterval(timer);
  }, []);

  // Simulate random jackpot win by other active players
  useEffect(() => {
    const triggerWin = () => {
      const players = [
        'LuckyRider_7', 'AlphaVegas', 'SpinAddict_99', 'RoyalQueen', 
        'GoldSeeker_🪙', 'JackpotSlayer', 'RouletteWizard', 'MegaWinGamer'
      ];
      const randomPlayer = players[Math.floor(Math.random() * players.length)];
      const tiers: ('GRAND' | 'MAJOR' | 'MINI')[] = ['MINI', 'MINI', 'MAJOR', 'MINI']; // Mini is most common, Major rare, Grand is extreme
      const chosenTier = tiers[Math.floor(Math.random() * tiers.length)];

      let winAmount = 0;
      if (chosenTier === 'MINI') {
        winAmount = Math.floor(miniJackpot);
        setMiniJackpot(12000.00); // Reset pool
      } else if (chosenTier === 'MAJOR') {
        winAmount = Math.floor(majorJackpot);
        setMajorJackpot(150000.00); // Reset pool
      } else {
        winAmount = Math.floor(grandJackpot);
        setGrandJackpot(1000000.00); // Reset pool
      }

      const alertId = `jackpot-${Date.now()}`;
      setCurrentAlert({
        id: alertId,
        winner: randomPlayer,
        amount: winAmount,
        tier: chosenTier
      });

      // Clear alert after 6 seconds
      setTimeout(() => {
        setCurrentAlert(prev => prev?.id === alertId ? null : prev);
      }, 6000);
    };

    // Trigger jackpot win every 40-70 seconds
    const intervalTime = (Math.random() * 30000) + 40000;
    const alertTimer = setInterval(triggerWin, intervalTime);

    return () => clearInterval(alertTimer);
  }, [miniJackpot, majorJackpot, grandJackpot]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div id="progressive-jackpot-root" className="space-y-4">
      {/* Visual Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
          <h3 className="text-sm font-serif font-black tracking-wider uppercase text-yellow-400 flex items-center gap-1.5">
            BINGO101 PROGRESSIVE POOLS <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-sans font-bold animate-pulse">HOT 🔥</span>
          </h3>
        </div>
        <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">Verified RTP 98.4%</span>
      </div>

      {/* 3 Tier Jackpot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GRAND JACKPOT CARD */}
        <motion.div
          id="grand-jackpot-card"
          whileHover={{ scale: 1.01 }}
          className="relative rounded-2xl p-5 border overflow-hidden bg-gradient-to-br from-[#120f04] via-[#211a07] to-[#070501] border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] flex flex-col justify-between"
        >
          {/* Neon Top Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
          <div className="absolute top-2 right-3 flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-red-500 rounded-full animate-ping" />
            <span className="text-[8px] font-mono font-black text-red-500 uppercase tracking-widest">LIVE POOL</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-amber-400 font-bold tracking-widest text-[10px] font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>GRAND JACKPOT</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#f5d061] tracking-tight mt-1.5 drop-shadow-[0_2px_10px_rgba(245,158,11,0.2)]">
              {formatCurrency(grandJackpot)} <span className="text-xs text-amber-500/60 font-medium">Chips</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] font-mono border-t border-amber-500/10 pt-2.5 text-amber-400/60">
            <span>MIN BET: 100 Chips</span>
            <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.5 rounded text-[8px] font-bold">1240x MULTIPLIER CAP</span>
          </div>
        </motion.div>

        {/* MAJOR JACKPOT CARD */}
        <motion.div
          id="major-jackpot-card"
          whileHover={{ scale: 1.01 }}
          className="relative rounded-2xl p-5 border overflow-hidden bg-gradient-to-br from-[#0c0812] via-[#161021] to-[#040207] border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)] flex flex-col justify-between"
        >
          {/* Neon Top Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" />
          <div className="absolute top-2 right-3 flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-mono font-bold text-purple-400 uppercase tracking-widest">ACTIVE</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-purple-400 font-bold tracking-widest text-[10px] font-mono">
              <Flame className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>MAJOR JACKPOT</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-purple-300 tracking-tight mt-1.5">
              {formatCurrency(majorJackpot)} <span className="text-xs text-purple-400/60 font-medium">Chips</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] font-mono border-t border-purple-500/10 pt-2.5 text-purple-400/60">
            <span>MIN BET: 25 Chips</span>
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold">600x MULTIPLIER CAP</span>
          </div>
        </motion.div>

        {/* MINI JACKPOT CARD */}
        <motion.div
          id="mini-jackpot-card"
          whileHover={{ scale: 1.01 }}
          className="relative rounded-2xl p-5 border overflow-hidden bg-gradient-to-br from-[#040f12] via-[#091e24] to-[#020709] border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col justify-between"
        >
          {/* Neon Top Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse" />
          <div className="absolute top-2 right-3 flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-[8px] font-mono font-bold text-cyan-400 uppercase tracking-widest">EASY ACCUMULATOR</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold tracking-widest text-[10px] font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>MINI ACCUMULATOR</span>
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-cyan-300 tracking-tight mt-1.5">
              {formatCurrency(miniJackpot)} <span className="text-xs text-cyan-400/60 font-medium">Chips</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] font-mono border-t border-cyan-500/10 pt-2.5 text-cyan-400/60">
            <span>MIN BET: 1 Chip</span>
            <span className="bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-1.5 py-0.5 rounded text-[8px] font-bold">120x MULTIPLIER CAP</span>
          </div>
        </motion.div>
      </div>

      {/* Floating Alert Congratulations HUD */}
      <AnimatePresence>
        {currentAlert && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            className="rounded-2xl p-4 bg-[#0a0d0a] border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-4 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 animate-spin">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left font-sans">
                <span className="text-[9px] font-mono uppercase bg-emerald-400/10 px-2 py-0.5 rounded-full text-emerald-400 font-bold tracking-wider">
                  💥 JACKPOT TRIGGERED!
                </span>
                <p className="text-xs font-bold text-white mt-1">
                  Congratulations <span className="text-yellow-400 font-mono font-black">{currentAlert.winner}</span>! Just hit the{' '}
                  <span className="text-emerald-400 font-mono font-black">{currentAlert.tier} Jackpot</span> and won{' '}
                  <span className="text-emerald-300 font-mono font-black">{currentAlert.amount.toLocaleString()} Chips!</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-emerald-400/60 block">RNG Verified</span>
              <span className="text-[8px] font-mono opacity-50 block">TXN_ID: {currentAlert.id}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
