import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Trophy, RefreshCw, Sparkles, Navigation, ShieldAlert } from 'lucide-react';

interface SpaceShooterGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const SpaceShooterGame: React.FC<SpaceShooterGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [bet, setBet] = useState<number>(20);
  const [flying, setFlying] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [crashed, setCrashed] = useState<boolean>(false);
  const [cashedOut, setCashedOut] = useState<boolean>(false);
  const [payout, setPayout] = useState<number>(0);
  const [asteroids, setAsteroids] = useState<{ id: number; x: number; y: number; speed: number }[]>([]);

  const flightIntervalRef = useRef<any>(null);
  const asteroidIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (flightIntervalRef.current) clearInterval(flightIntervalRef.current);
      if (asteroidIntervalRef.current) clearInterval(asteroidIntervalRef.current);
    };
  }, []);

  const startFlight = () => {
    if (flying) return;
    if (chips < bet) {
      triggerAlert('Insufficient chips to launch spaceship!', 'error');
      return;
    }

    // Deduct wager
    onUpdateChips(-bet);
    onUpdateTask('play_spaceshooter', 1);

    setFlying(true);
    setCrashed(false);
    setCashedOut(false);
    setMultiplier(1.00);
    setPayout(0);
    setAsteroids([]);

    triggerAlert('Spaceship launched! Multiplier is climbing. Cashout before collision!', 'info');

    // Launch flying multiplier
    flightIntervalRef.current = setInterval(() => {
      setMultiplier(prev => {
        const increment = Math.random() * 0.05 + 0.02;
        const next = parseFloat((prev + increment).toFixed(2));

        // Crash probability calculation increases as multiplier rises!
        const crashProbability = (next - 1.00) * 0.015; // Higher multiplier = higher risk
        if (Math.random() < crashProbability) {
          triggerCrash();
        }

        return next;
      });
    }, 150);

    // Dynamic asteroid spawn visual effect
    asteroidIntervalRef.current = setInterval(() => {
      setAsteroids(prev => {
        const newAsteroid = {
          id: Date.now() + Math.random(),
          x: Math.random() * 80 + 10,
          y: -10,
          speed: Math.random() * 15 + 10
        };
        return [...prev, newAsteroid].map(ast => ({ ...ast, y: ast.y + ast.speed })).filter(ast => ast.y < 110);
      });
    }, 400);
  };

  const triggerCrash = () => {
    if (flightIntervalRef.current) clearInterval(flightIntervalRef.current);
    if (asteroidIntervalRef.current) clearInterval(asteroidIntervalRef.current);
    setFlying(false);
    setCrashed(true);
    triggerAlert('💥 COLLISION! Your ship collided with an asteroid! Lost wager chips.', 'error');
  };

  const handleCashout = () => {
    if (!flying || crashed || cashedOut) return;

    if (flightIntervalRef.current) clearInterval(flightIntervalRef.current);
    if (asteroidIntervalRef.current) clearInterval(asteroidIntervalRef.current);

    setFlying(false);
    setCashedOut(true);

    const winAmount = Math.round(bet * multiplier);
    setPayout(winAmount);
    onUpdateChips(winAmount);

    triggerAlert(`🚀 Successful Evacuation! Cashed out at ${multiplier}x. Won +${winAmount} Chips!`, 'success');
  };

  const adjustBet = (amount: number) => {
    if (flying) return;
    setBet(prev => Math.max(5, prev + amount));
  };

  return (
    <div className="bg-[#0b0b1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[9px] bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-black uppercase font-mono tracking-widest px-3 py-1 rounded-full shadow-lg">
            Retro Flight Suspense
          </span>
          <h3 className="text-xl font-black tracking-tight text-white mt-2 flex items-center gap-2">
            🚀 Aviator Space Shooter
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">Steer through cosmic asteroids! Cash out your climbing multiplier before collision!</p>
        </div>
      </div>

      {/* Interactive Space Combat field */}
      <div className="bg-[#03030a] border border-white/5 rounded-2xl h-64 mb-6 relative overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner">
        
        {/* Floating star field background */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div 
              key={i}
              className="absolute bg-white rounded-full w-0.5 h-0.5 animate-pulse"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Falling asteroids obstacle visualization */}
        {flying && asteroids.map(ast => (
          <div
            key={ast.id}
            className="absolute text-xl pointer-events-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-all duration-150"
            style={{ left: `${ast.x}%`, top: `${ast.y}%` }}
          >
            ☄️
          </div>
        ))}

        {/* Dynamic central metrics readout HUD */}
        <div className="relative z-10 text-center">
          <AnimatePresence mode="wait">
            {flying ? (
              <motion.div
                key="flying"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 1 }}
                className="text-center"
              >
                <div className="text-6xl font-black font-mono text-cyan-400 tracking-tighter">
                  {multiplier.toFixed(2)}x
                </div>
                <span className="text-[8px] font-mono font-black text-cyan-300 tracking-widest uppercase mt-2 inline-block animate-pulse bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/25">
                  THRUSTERS ACTIVE
                </span>
              </motion.div>
            ) : crashed ? (
              <motion.div
                key="crashed"
                initial={{ scale: 0.5, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                className="text-center"
              >
                <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-2 animate-bounce" />
                <div className="text-red-500 font-black text-3xl font-mono">EXPLODED!</div>
                <div className="text-white/40 text-[10px] font-mono mt-1">Collided at {multiplier}x</div>
              </motion.div>
            ) : cashedOut ? (
              <motion.div
                key="cashedout"
                initial={{ scale: 0.5, y: -20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="text-center"
              >
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2 animate-bounce" />
                <div className="text-emerald-400 font-black text-4xl font-mono">+{payout} Chips</div>
                <div className="text-white/40 text-[10px] font-mono mt-1">Ejected successfully at {multiplier}x</div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                className="text-center"
              >
                <div className="text-4xl mb-3 filter drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]">🛸</div>
                <div className="text-xs font-mono text-white/40">
                  Ready for cosmic lift-off! Maximize multi-burns.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Spaceship representation vector at the bottom */}
        <motion.div
          animate={
            flying 
              ? { y: [10, -10, 10], x: [-15, 15, -15], rotate: [-5, 5, -5] } 
              : crashed 
              ? { y: 150, opacity: 0, rotate: 180, scale: 0.5 }
              : { y: 0, x: 0, rotate: 0 }
          }
          transition={flying ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.5 }}
          className="absolute bottom-6 text-3xl pointer-events-none filter drop-shadow-[0_4px_10px_rgba(99,102,241,0.6)]"
        >
          {crashed ? '💥' : '🛸'}
        </motion.div>
      </div>

      {/* Control console deck */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Wager Amount
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustBet(-10)}
                disabled={flying}
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
                disabled={flying}
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
              >
                +10
              </button>
            </div>
          </div>
        </div>

        {flying ? (
          <button
            onClick={handleCashout}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.35)] cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>EJECT & CASHOUT</span>
          </button>
        ) : (
          <button
            onClick={startFlight}
            disabled={flying}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            <Navigation className="w-4 h-4 rotate-45" />
            <span>LAUNCH SPACESHIP</span>
          </button>
        )}
      </div>
    </div>
  );
};
