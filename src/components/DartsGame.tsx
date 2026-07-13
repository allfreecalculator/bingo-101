import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, HelpCircle, Trophy, Volume2, VolumeX, Crosshair, ArrowRight } from 'lucide-react';

interface DartsGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

class DartsAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playThrow() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  playHit(isBullseye: boolean) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Hit sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isBullseye ? 880 : 330, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.22);

      if (isBullseye) {
        // Bullseye fanfare
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const oscFan = this.ctx!.createOscillator();
          const gainFan = this.ctx!.createGain();
          oscFan.type = 'triangle';
          oscFan.frequency.setValueAtTime(freq, now + 0.05 + idx * 0.06);
          gainFan.gain.setValueAtTime(0.015, now + 0.05 + idx * 0.06);
          gainFan.gain.exponentialRampToValueAtTime(0.001, now + 0.05 + idx * 0.06 + 0.15);
          oscFan.connect(gainFan);
          gainFan.connect(this.ctx!.destination);
          oscFan.start(now + 0.05 + idx * 0.06);
          oscFan.stop(now + 0.05 + idx * 0.06 + 0.17);
        });
      }
    } catch (e) {}
  }

  playMiss() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.32);
    } catch (e) {}
  }
}

export const DartsGame: React.FC<DartsGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [gameState, setGameState] = useState<'IDLE' | 'AIMING' | 'THROWN' | 'RESOLVED'>('IDLE');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(0);
  const [history, setHistory] = useState<Array<{ mult: number; type: string }>>([]);
  const [isAimingHorizontal, setIsAimingHorizontal] = useState<boolean>(true);
  
  // Aiming coordinates
  const [aimX, setAimX] = useState<number>(50); // 0 to 100 percentage
  const [aimY, setAimY] = useState<number>(50); // 0 to 100 percentage
  const [windX, setWindX] = useState<number>(0);
  const [windY, setWindY] = useState<number>(0);

  const audioRef = useRef<DartsAudio>(new DartsAudio());
  const timerRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  // Randomize wind on each round
  useEffect(() => {
    if (gameState === 'IDLE') {
      setWindX(Math.floor((Math.random() - 0.5) * 16));
      setWindY(Math.floor((Math.random() - 0.5) * 16));
    }
  }, [gameState]);

  // Handle aiming loop
  useEffect(() => {
    let speed = 4;
    let angle = 0;

    const tick = () => {
      angle += 0.05;
      if (gameState === 'AIMING') {
        if (isAimingHorizontal) {
          // Swing X coordinate back and forth
          setAimX(50 + Math.sin(angle * speed) * 45);
        } else {
          // Swing Y coordinate back and forth
          setAimY(50 + Math.cos(angle * speed) * 45);
        }
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    if (gameState === 'AIMING') {
      animFrameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, isAimingHorizontal]);

  const toggleSound = () => {
    const nextMute = !soundMuted;
    setSoundMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleStartAiming = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to place this bet!', 'error');
      return;
    }
    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);
    setGameState('AIMING');
    setIsAimingHorizontal(true);
    setAimX(50);
    setAimY(50);
  };

  const handleThrowLock = () => {
    if (isAimingHorizontal) {
      setIsAimingHorizontal(false);
    } else {
      // Locked both coordinates! Now resolve the hit
      setGameState('THROWN');
      audioRef.current.playThrow();

      // Apply wind drift to the final landing position
      const finalX = Math.max(0, Math.min(100, aimX + windX));
      const finalY = Math.max(0, Math.min(100, aimY + windY));

      // Calculate distance from center (50, 50)
      const dx = finalX - 50;
      const dy = finalY - 50;
      const dist = Math.sqrt(dx * dx + dy * dy);

      timerRef.current = setTimeout(() => {
        let mult = 0;
        let ringName = 'MISS';

        if (dist <= 4.5) {
          mult = 10.0;
          ringName = 'DOUBLE BULLSEYE! 🎯';
        } else if (dist <= 9) {
          mult = 5.0;
          ringName = 'BULLSEYE 🎯';
        } else if (dist <= 18) {
          mult = 3.0;
          ringName = 'TRIPLE RING 🔥';
        } else if (dist <= 30) {
          mult = 2.0;
          ringName = 'DOUBLE RING';
        } else if (dist <= 45) {
          mult = 1.2;
          ringName = 'INNER ZONE';
        } else if (dist <= 48) {
          mult = 0.8;
          ringName = 'OUTER ZONE';
        } else {
          mult = 0;
          ringName = 'OUT OF BOARD';
        }

        const payout = Math.floor(betAmount * mult);
        if (payout > 0) {
          onUpdateChips(payout);
          audioRef.current.playHit(mult >= 5);
          triggerAlert(`Dart landed on ${ringName}! Multiplier: ${mult}x (+${payout} Chips)! 🎉`, 'success');
          if (mult >= 5) onUpdateTask('win_high_odds', 1);
        } else {
          audioRef.current.playMiss();
          triggerAlert(`Missed! Dart landed out of bounds. Better luck next time! 🎯`, 'info');
        }

        setMultiplier(mult);
        setScore(payout);
        setHistory(prev => [{ mult, type: ringName }, ...prev.slice(0, 9)]);
        setGameState('RESOLVED');
      }, 900);
    }
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
    <div id="darts-game-root" className="space-y-6">
      {/* GAMEHEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase">
            <Crosshair className="w-5 h-5 text-amber-400 animate-spin" /> Neon Darts Duel
          </h3>
          <p className="text-[11px] text-white/50 font-mono">AIM THE CROSSHAIR, BRAVE THE WIND & HIT THE BULLSEYE</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all border border-white/5"
            title={soundMuted ? "Unmute" : "Mute"}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* DASHBOARD GRID */}
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
                  disabled={gameState === 'AIMING' || gameState === 'THROWN'}
                  className="bg-transparent text-sm font-mono font-black text-white focus:outline-none w-full"
                />
                <button
                  onClick={setBetMax}
                  disabled={gameState === 'AIMING' || gameState === 'THROWN'}
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
                    disabled={gameState === 'AIMING' || gameState === 'THROWN'}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-mono font-bold rounded-lg border border-white/5"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Wind conditions */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">Atmospheric Wind Drift</span>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white/80">
                  {windX === 0 && windY === 0 ? "⚡ Calm Air" : `💨 Horizontal: ${windX > 0 ? "➡️ Right" : "⬅️ Left"} (${Math.abs(windX)}px)`}
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-black uppercase bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  DRIFT ON
                </span>
              </div>
            </div>

            {/* Target Prize Table */}
            <div className="bg-[#111126]/40 rounded-xl p-3 border border-white/5 text-[10px] space-y-1.5 font-mono">
              <span className="font-bold text-white/60 uppercase block mb-1 text-[9px] tracking-wider">ZONE PAYOUT RULES</span>
              <div className="flex justify-between text-amber-400 font-extrabold border-b border-white/5 pb-1">
                <span>Double Bullseye</span>
                <span>10.0x Payout</span>
              </div>
              <div className="flex justify-between text-yellow-400 border-b border-white/5 pb-1">
                <span>Single Bullseye</span>
                <span>5.0x Payout</span>
              </div>
              <div className="flex justify-between text-teal-400 border-b border-white/5 pb-1">
                <span>Triple Ring</span>
                <span>3.0x Payout</span>
              </div>
              <div className="flex justify-between text-blue-400 border-b border-white/5 pb-1">
                <span>Double Ring</span>
                <span>2.0x Payout</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Inner/Outer board</span>
                <span>1.2x / 0.8x</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            {gameState === 'IDLE' || gameState === 'RESOLVED' ? (
              <button
                onClick={handleStartAiming}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> LOCK BET & AIM
              </button>
            ) : gameState === 'AIMING' ? (
              <button
                onClick={handleThrowLock}
                className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-black text-xs uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
              >
                <Crosshair className="w-4 h-4 animate-spin" /> {isAimingHorizontal ? 'LOCK X-AXIS' : 'RELEASE DART 🎯'}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-white/5 text-white/30 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5"
              >
                THROWING DART...
              </button>
            )}
          </div>
        </div>

        {/* TARGET BOARD AND VISUALS */}
        <div className="bg-[#070719] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          {/* Neon Starscape bg */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,16,48,0.8)_0%,rgba(5,5,15,1)_100%)]" />

          {/* DARTBOARD SVG */}
          <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 rounded-full flex items-center justify-center shadow-2xl border border-white/5">
            {/* Bullseye Rings */}
            <svg viewBox="0 0 100 100" className="w-full h-full transform rotate-12 transition-transform duration-[10s] ease-linear">
              {/* Outer Board ring */}
              <circle cx="50" cy="50" r="48" fill="#040410" stroke="#ffaa00" strokeWidth="1" strokeDasharray="3,3" />
              {/* Double ring zone */}
              <circle cx="50" cy="50" r="44" fill="none" stroke="#2563eb" strokeWidth="4" className="opacity-40" />
              {/* Inner zone */}
              <circle cx="50" cy="50" r="30" fill="#0c0a2a" stroke="#ffffff" strokeWidth="0.5" className="opacity-20" />
              {/* Triple ring zone */}
              <circle cx="50" cy="50" r="18" fill="none" stroke="#0d9488" strokeWidth="3.5" className="opacity-60" />
              {/* Single Bullseye */}
              <circle cx="50" cy="50" r="9" fill="#e11d48" stroke="#111" strokeWidth="0.5" />
              {/* Double Bullseye */}
              <circle cx="50" cy="50" r="4.5" fill="#facc15" stroke="#111" strokeWidth="0.5" />
              
              {/* Diagonal Neon Spokes */}
              <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <line x1="15" y1="15" x2="85" y2="85" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <line x1="15" y1="85" x2="85" y2="15" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            </svg>

            {/* AIMING LINES OVERLAY */}
            {(gameState === 'AIMING' || gameState === 'THROWN') && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Vertical slider aiming line */}
                <div 
                  className={`absolute top-0 bottom-0 w-[2px] transition-all duration-75 ${isAimingHorizontal ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-white/20'}`}
                  style={{ left: `${aimX}%` }}
                />
                {/* Horizontal slider aiming line */}
                <div 
                  className={`absolute left-0 right-0 h-[2px] transition-all duration-75 ${!isAimingHorizontal && gameState === 'AIMING' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-white/20'}`}
                  style={{ top: `${aimY}%` }}
                />
              </div>
            )}

            {/* TARGET RETAINING AIM DOT OR HIT DART */}
            {gameState === 'AIMING' && (
              <div 
                className="absolute w-4 h-4 rounded-full border border-red-500 bg-red-500/20 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                style={{ left: `${aimX}%`, top: `${aimY}%` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </div>
            )}

            {/* RESOLVED DART LOCATION */}
            {(gameState === 'THROWN' || gameState === 'RESOLVED') && (
              <motion.div 
                initial={{ scale: 3.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                style={{ 
                  left: `${aimX + (gameState === 'RESOLVED' ? windX : 0)}%`, 
                  top: `${aimY + (gameState === 'RESOLVED' ? windY : 0)}%` 
                }}
              >
                {/* Holographic glowing dart symbol */}
                <div className="relative">
                  <span className="text-lg filter drop-shadow-[0_0_6px_#facc15] animate-bounce">📍</span>
                  <div className="absolute w-12 h-12 -left-3 -top-3 rounded-full border border-dashed border-amber-400/40 animate-ping duration-1000" />
                </div>
              </motion.div>
            )}
          </div>

          {/* WIND DIRECTION ARROW OR STATS INDICATOR */}
          <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center z-10 text-[10px] font-mono text-white/50">
            <div>
              <span>AIMING STATUS: </span>
              <span className={`font-black uppercase tracking-wider ${
                gameState === 'AIMING' ? 'text-amber-400 animate-pulse' : 'text-white/30'
              }`}>
                {gameState === 'IDLE' ? "READY" : gameState === 'AIMING' ? (isAimingHorizontal ? "SETTING RANGE" : "LOCKING HEIGHT") : gameState === 'THROWN' ? "FLIGHT" : "RESOLVED"}
              </span>
            </div>

            {/* History mini list */}
            {history.length > 0 && (
              <div className="flex gap-1">
                {history.slice(0, 3).map((h, i) => (
                  <span key={i} className={`px-1.5 py-0.5 rounded ${h.mult > 1 ? 'bg-amber-400/15 text-amber-400 font-bold border border-amber-400/25' : 'bg-white/5 text-white/40'}`}>
                    {h.mult}x
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* HUGE WINNINGS PANEL OVERLAY */}
          <AnimatePresence>
            {gameState === 'RESOLVED' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="absolute z-20 bg-black/90 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1 text-center"
              >
                <Trophy className={`w-8 h-8 ${multiplier > 1 ? 'text-amber-400 animate-bounce' : 'text-white/30'}`} />
                <h4 className="text-xs font-black uppercase text-white/40">DARTBOARD REPORT</h4>
                <p className="text-base font-black text-white">{multiplier > 0 ? `WON +${score} CHIPS! 🎉` : 'MISS - TRY AGAIN!'}</p>
                <span className="text-[10px] font-mono text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-bold">
                  {multiplier.toFixed(1)}x multiplier
                </span>
                <button
                  onClick={() => setGameState('IDLE')}
                  className="mt-2.5 px-3 py-1 bg-white/10 hover:bg-white/15 text-white font-extrabold text-[10px] rounded-lg border border-white/5 flex items-center gap-1 cursor-pointer"
                >
                  NEXT SHOT <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
