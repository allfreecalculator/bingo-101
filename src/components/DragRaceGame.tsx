import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, HelpCircle, Trophy, Volume2, VolumeX, Zap, Shield } from 'lucide-react';

interface DragRaceGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

const CARS = [
  { id: 'RED', name: '🔴 RED METEOR', speed: 85, accel: 65, color: '#ef4444' },
  { id: 'BLUE', name: '🔵 BLUE LIGHTNING', speed: 65, accel: 85, color: '#3b82f6' },
  { id: 'GOLD', name: '🟡 GOLD HORIZON', speed: 75, accel: 75, color: '#fbbf24' }
];

class RaceAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playRev() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(350, now + 0.3);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.32);
    } catch (e) {}
  }

  playShift() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.setValueAtTime(150, now + 0.08);
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playWin() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
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

export const DragRaceGame: React.FC<DragRaceGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [selectedCarId, setSelectedCarId] = useState<string>('RED');
  const [gameState, setGameState] = useState<'IDLE' | 'COUNTDOWN' | 'RACING' | 'RESOLVED'>('IDLE');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  const [countdown, setCountdown] = useState<number>(3);
  const [playerDistance, setPlayerDistance] = useState<number>(0);
  const [rivalDistance, setRivalDistance] = useState<number>(0);

  // Shifting mechanics
  const [revLevel, setRevLevel] = useState<number>(0); // 0 to 100 rev meter
  const [perfectShifts, setPerfectShifts] = useState<number>(0);
  const [totalShifts, setTotalShifts] = useState<number>(0);
  const [history, setHistory] = useState<Array<'WIN' | 'LOSS'>>([]);

  const audioRef = useRef<RaceAudio>(new RaceAudio());
  const gameIntervalRef = useRef<any>(null);

  const toggleSound = () => {
    const nextMute = !soundMuted;
    setSoundMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleStartRace = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to fuel race car!', 'error');
      return;
    }
    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);
    setGameState('COUNTDOWN');
    setCountdown(3);
    setPlayerDistance(0);
    setRivalDistance(0);
    setPerfectShifts(0);
    setTotalShifts(0);
    setRevLevel(0);

    let count = 3;
    const interval = setInterval(() => {
      audioRef.current.playRev();
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        setGameState('RACING');
        startMainRaceLoop();
      }
    }, 1000);
  };

  const startMainRaceLoop = () => {
    let pDist = 0;
    let rDist = 0;
    let rev = 0;

    gameIntervalRef.current = setInterval(() => {
      // Oscillate rev level for player shift timing (rises rapidly, drops after shifting)
      rev = (rev + 10) % 110;
      setRevLevel(rev);

      // Rival accelerates steadily
      rDist += Math.random() * 2 + 3.5;

      // Player accumulates distance based on acceleration of chosen car and general racing speeds
      const car = CARS.find(c => c.id === selectedCarId)!;
      const baseSpeed = car.speed * 0.05;
      pDist += Math.random() * 2 + baseSpeed;

      setPlayerDistance(Math.min(100, pDist));
      setRivalDistance(Math.min(100, rDist));

      // Resolve race if either car crosses finish line (distance >= 100)
      if (pDist >= 100 || rDist >= 100) {
        clearInterval(gameIntervalRef.current);
        resolveRace(pDist, rDist);
      }
    }, 150);
  };

  const handleShiftGear = () => {
    if (gameState !== 'RACING') return;

    audioRef.current.playShift();
    setTotalShifts(prev => prev + 1);

    // Perfect shifts occur in the sweet spot (75% to 92% rev counter)
    if (revLevel >= 75 && revLevel <= 92) {
      setPerfectShifts(prev => prev + 1);
      // Give instant distance surge
      setPlayerDistance(prev => Math.min(100, prev + 12));
      triggerAlert('🔥 PERFECT GEAR SHIFT! Massive turbo boost activated!', 'success');
    } else {
      triggerAlert('Sloppy shift! Watch your RPM dial.', 'info');
    }

    // Reset rev level on shift
    setRevLevel(0);
  };

  const resolveRace = (finalPlayer: number, finalRival: number) => {
    const won = finalPlayer >= finalRival;
    setGameState('RESOLVED');

    if (won) {
      // Payout multiplier: 2.0x base, +0.2x for each perfect shift
      const mult = 2.0 + (perfectShifts * 0.25);
      const payout = Math.floor(betAmount * mult);
      onUpdateChips(payout);
      audioRef.current.playWin();
      triggerAlert(`VICTORY! You crossed 1st with ${perfectShifts} perfect shifts! Multiplier: ${mult}x (+${payout} Chips)! 🏎️🔥`, 'success');
      onUpdateTask('win_high_odds', 1);
      setHistory(prev => ['WIN', ...prev.slice(0, 9)]);
    } else {
      triggerAlert('Defeat! Rival car outpaced you at the finish. Refine shift timing! 🏁', 'info');
      setHistory(prev => ['LOSS', ...prev.slice(0, 9)]);
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

  const activeCar = CARS.find(c => c.id === selectedCarId)!;

  return (
    <div id="dragrace-game-root" className="space-y-6">
      {/* GAME HEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase">
            <Zap className="w-5 h-5 text-amber-400 animate-bounce" /> Cyber Drag Race
          </h3>
          <p className="text-[11px] text-white/50 font-mono">SHIFT GEARS IN THE GREEN RPM ZONE TO OUTRUN RIVAL SUPERCARS</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all border border-white/5"
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
                  disabled={gameState !== 'IDLE' && gameState !== 'RESOLVED'}
                  className="bg-transparent text-sm font-mono font-black text-white focus:outline-none w-full"
                />
                <button
                  onClick={setBetMax}
                  disabled={gameState !== 'IDLE' && gameState !== 'RESOLVED'}
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
                    disabled={gameState !== 'IDLE' && gameState !== 'RESOLVED'}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-mono font-bold rounded-lg border border-white/5"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Car selection list */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block mb-2">Select Your Machine</span>
              <div className="grid grid-cols-3 gap-2">
                {CARS.map(c => {
                  const isSel = selectedCarId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCarId(c.id)}
                      disabled={gameState !== 'IDLE' && gameState !== 'RESOLVED'}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        isSel 
                          ? 'bg-amber-400/10 border-amber-400 text-white shadow-md' 
                          : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10'
                      }`}
                    >
                      <span className="text-[10px] font-bold tracking-tight truncate w-full">{c.name}</span>
                      <span className="text-[8px] font-mono text-white/30 mt-1">SPD: {c.speed}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* RPM TACHOMETER DESIGN */}
            <div className="bg-[#111126]/60 border border-white/5 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono text-white/40">
                <span>ENGINE RPM SPEED</span>
                <span className={revLevel >= 75 && revLevel <= 92 ? 'text-green-400 font-bold animate-pulse' : ''}>
                  {revLevel >= 92 ? '🔴 OVERHEAT' : revLevel >= 75 ? '⚡ SHIFT NOW!' : '🟢 REVVING'}
                </span>
              </div>
              
              {/* Tachometer gauge */}
              <div className="relative h-4 bg-white/5 border border-white/10 rounded-full overflow-hidden p-0.5">
                {/* Perfect Shift Target highlight green (75% to 92%) */}
                <div className="absolute left-[75%] right-[8%] top-0 bottom-0 bg-green-500/20 border-l border-r border-green-500/30" />
                <div 
                  className={`h-full rounded-full transition-all duration-75 ${
                    revLevel >= 92 ? 'bg-red-500' : revLevel >= 75 ? 'bg-green-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, revLevel)}%` }}
                />
              </div>
              <span className="block text-[8px] font-mono text-white/30 text-center uppercase">
                SWEET GEAR MATCH ZONE IS HIGHLIGHTED GREEN
              </span>
            </div>
          </div>

          <div className="pt-2">
            {gameState === 'IDLE' || gameState === 'RESOLVED' ? (
              <button
                onClick={handleStartRace}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> PLACE WAGER & STAGE CAR
              </button>
            ) : (
              <button
                onClick={handleShiftGear}
                disabled={gameState !== 'RACING'}
                className="w-full py-4.5 bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
              >
                <Zap className="w-4 h-4" /> GEAR SHIFT (RPM TAP) 🏎️💨
              </button>
            )}
          </div>
        </div>

        {/* RACE STAGE TRACK VISUALS */}
        <div className="bg-[#070719] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,48,24,0.7)_0%,rgba(5,5,15,1)_100%)]" />

          {/* ACTIVE RACE TRACK STAGE */}
          {gameState === 'COUNTDOWN' ? (
            <div className="text-center space-y-2 z-10 font-mono">
              <span className="text-6xl text-amber-400 font-black animate-bounce">{countdown}</span>
              <p className="text-xs text-white/50 tracking-widest">PREPARING TO LAUNCH ENGINE...</p>
            </div>
          ) : (
            <div className="relative z-10 w-full max-w-sm space-y-6">
              {/* RACER 1: PLAYER CAR */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span className="font-bold text-white/70">YOUR {activeCar.name}</span>
                  <span>{Math.floor(playerDistance)}m / 100m</span>
                </div>
                <div className="h-10 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden flex items-center px-2">
                  <motion.div 
                    animate={{ x: `${playerDistance * 3}px` }}
                    className="text-2xl"
                  >
                    🏎️🔥
                  </motion.div>
                  {/* Grid finish line check */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-[repeating-linear-gradient(45deg,#000,#000_4px,#fff_4px,#fff_8px)]" />
                </div>
              </div>

              {/* RACER 2: RIVAL AI CAR */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-white/40">
                  <span className="font-bold text-red-400">RIVAL REAPER RACER</span>
                  <span>{Math.floor(rivalDistance)}m / 100m</span>
                </div>
                <div className="h-10 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden flex items-center px-2">
                  <motion.div 
                    animate={{ x: `${rivalDistance * 3}px` }}
                    className="text-2xl"
                  >
                    🏎️💀
                  </motion.div>
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-[repeating-linear-gradient(45deg,#000,#000_4px,#fff_4px,#fff_8px)]" />
                </div>
              </div>
            </div>
          )}

          {/* HISTORY STRIP */}
          <div className="absolute bottom-4 left-6 right-6 z-10 flex gap-1.5 justify-center font-mono">
            {history.slice(0, 5).map((h, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${h === 'WIN' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-500 border border-red-500/20'}`}>
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
