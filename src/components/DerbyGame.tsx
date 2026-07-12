import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Trophy, RefreshCw, Play, CircleDot, Award } from 'lucide-react';

interface DerbyGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface Horse {
  id: number;
  name: string;
  emoji: string;
  color: string;
  odds: number;
  laneColor: string;
}

const HORSES: Horse[] = [
  { id: 1, name: 'Neon Thunder', emoji: '⚡', color: 'text-amber-400', odds: 2.2, laneColor: 'border-amber-500/20 bg-amber-500/5' },
  { id: 2, name: 'Cyber Bullet', emoji: '🚀', color: 'text-cyan-400', odds: 3.5, laneColor: 'border-cyan-500/20 bg-cyan-500/5' },
  { id: 3, name: 'Glitch Star', emoji: '💫', color: 'text-purple-400', odds: 4.8, laneColor: 'border-purple-500/20 bg-purple-500/5' },
  { id: 4, name: 'Omega Runner', emoji: '🪐', color: 'text-pink-400', odds: 6.0, laneColor: 'border-pink-500/20 bg-pink-500/5' },
  { id: 5, name: 'Volt Charger', emoji: '🔥', color: 'text-red-400', odds: 12.0, laneColor: 'border-red-500/20 bg-red-500/5' }
];

export const DerbyGame: React.FC<DerbyGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [bet, setBet] = useState<number>(20);
  const [selectedHorseId, setSelectedHorseId] = useState<number>(1);
  const [racing, setRacing] = useState<boolean>(false);
  const [raceOver, setRaceOver] = useState<boolean>(false);
  const [positions, setPositions] = useState<number[]>([0, 0, 0, 0, 0]);
  const [winnerId, setWinnerId] = useState<number>(-1);

  const raceIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (raceIntervalRef.current) clearInterval(raceIntervalRef.current);
    };
  }, []);

  const startRace = () => {
    if (racing) return;
    if (chips < bet) {
      triggerAlert('Insufficient chips to place a race book bet!', 'error');
      return;
    }

    // Deduct wager
    onUpdateChips(-bet);
    onUpdateTask('play_derby', 1);

    setRacing(true);
    setRaceOver(false);
    setWinnerId(-1);
    setPositions([0, 0, 0, 0, 0]);

    triggerAlert('And they are off! The cyber-derby is underway!', 'info');

    raceIntervalRef.current = setInterval(() => {
      setPositions(prev => {
        const next = [...prev];
        let finalizedWinner = -1;

        for (let i = 0; i < next.length; i++) {
          // Dynamic acceleration burst
          const step = Math.random() * 8 + (Math.random() > 0.8 ? 5 : 1);
          next[i] = Math.min(100, next[i] + step);

          if (next[i] >= 100 && finalizedWinner === -1) {
            finalizedWinner = i + 1; // Horse IDs are 1-indexed
          }
        }

        if (finalizedWinner !== -1) {
          clearInterval(raceIntervalRef.current);
          setRacing(false);
          setRaceOver(true);
          setWinnerId(finalizedWinner);
          resolveRace(finalizedWinner);
        }

        return next;
      });
    }, 120);
  };

  const resolveRace = (winnerId: number) => {
    const winningHorse = HORSES.find(h => h.id === winnerId);
    if (!winningHorse) return;

    if (winnerId === selectedHorseId) {
      const payout = Math.round(bet * winningHorse.odds);
      onUpdateChips(payout);
      triggerAlert(`🏆 ${winningHorse.name} won! You placed first and won +${payout} Chips!`, 'success');
    } else {
      triggerAlert(`🏁 Race complete! ${winningHorse.name} took first. Try another bet!`, 'info');
    }
  };

  const adjustBet = (amount: number) => {
    if (racing) return;
    setBet(prev => Math.max(5, prev + amount));
  };

  return (
    <div className="bg-[#0b0b1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Backing Glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[9px] bg-gradient-to-r from-emerald-400 to-cyan-500 text-black font-black uppercase font-mono tracking-widest px-3 py-1 rounded-full shadow-lg">
            Cyber Virtual Derby
          </span>
          <h3 className="text-xl font-black tracking-tight text-white mt-2 flex items-center gap-2">
            🐎 Neon Derby Stadium
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">Select your racer, evaluate odds, and cheer them across the finish line!</p>
        </div>
      </div>

      {/* The Stadium Rails */}
      <div className="bg-[#04040c] border border-white/5 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="space-y-4">
          {HORSES.map((horse, idx) => {
            const progress = positions[idx];
            const isWinner = winnerId === horse.id;
            const isSelected = selectedHorseId === horse.id;

            return (
              <div key={horse.id} className="relative">
                {/* Horse stats track header */}
                <div className="flex justify-between items-center text-[10px] font-mono text-white/50 mb-1 px-1">
                  <span className="font-bold flex items-center gap-1">
                    <span className={horse.color}>{horse.emoji}</span>
                    <span className="text-white/80">{horse.name}</span>
                    {isSelected && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 rounded font-black">YOUR BET</span>}
                  </span>
                  <span className="text-emerald-400 font-extrabold">{horse.odds}x Odds</span>
                </div>

                {/* Track lane */}
                <div className={`h-8 border rounded-xl relative overflow-hidden flex items-center ${horse.laneColor}`}>
                  {/* Grid markings */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90].map(m => (
                      <div key={m} className="w-[1px] h-full bg-white/40" />
                    ))}
                  </div>

                  {/* Racing horse model */}
                  <motion.div
                    animate={{ left: `${progress}%` }}
                    transition={{ type: 'tween', ease: 'easeInOut' }}
                    className="absolute -translate-x-1/2 flex items-center gap-1 z-10"
                    style={{ left: `${progress}%` }}
                  >
                    <span className="text-xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">{horse.emoji}</span>
                    {isWinner && (
                      <span className="absolute -top-4 -right-2 text-xs text-yellow-400 animate-bounce">👑</span>
                    )}
                  </motion.div>

                  {/* Finish banner */}
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-red-600/30 border-l border-red-500/50 flex flex-col items-center justify-around">
                    <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                    <div className="w-1 h-1 bg-white rounded-full animate-ping delay-100" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Betting Desk Board */}
      <div className="grid sm:grid-cols-[1fr_1.5fr] gap-4 items-center">
        
        {/* Horse selector panel */}
        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex flex-col gap-2">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-black">
            SELECT SPORTBOOK RACER
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {HORSES.map(h => (
              <button
                key={h.id}
                disabled={racing}
                onClick={() => setSelectedHorseId(h.id)}
                className={`py-1.5 px-3 rounded-lg border text-left transition-all flex items-center justify-between text-[11px] font-mono cursor-pointer ${
                  selectedHorseId === h.id
                    ? 'bg-amber-400 border-amber-400 text-black font-bold'
                    : 'bg-black/30 border-white/5 text-white/70 hover:border-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{h.emoji}</span>
                  <span>{h.name}</span>
                </span>
                <span className={selectedHorseId === h.id ? 'text-black font-black' : 'text-emerald-400 font-extrabold'}>
                  {h.odds}x
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bets & Action panel */}
        <div className="bg-white/5 border border-[#ffffff05] p-4 rounded-2xl flex flex-col justify-between h-full">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-2 font-black">
              WAGER amount
            </span>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => adjustBet(-10)}
                disabled={racing}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
              >
                -10
              </button>
              <span className="w-20 text-center font-mono font-black text-amber-400 text-base flex items-center justify-center gap-1">
                <Coins className="w-4 h-4" />
                {bet}
              </span>
              <button
                onClick={() => adjustBet(10)}
                disabled={racing}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
              >
                +10
              </button>
            </div>
            
            <div className="text-[10px] text-white/40 font-mono mb-4 leading-relaxed">
              * Racer payouts are resolved exactly as <span className="text-white/70 font-bold">Odds x Bet</span>! Higher risk horses award significantly higher jackpot multipliers.
            </div>
          </div>

          <button
            onClick={startRace}
            disabled={racing}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            <Play className={`w-4 h-4 fill-black ${racing ? 'animate-pulse' : ''}`} />
            {racing ? 'STADIUM RACING...' : 'PLACE BET & START DERBY'}
          </button>
        </div>

      </div>
    </div>
  );
};
