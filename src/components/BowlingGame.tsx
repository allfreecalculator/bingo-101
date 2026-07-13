import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, HelpCircle, Trophy, Volume2, VolumeX, Flame } from 'lucide-react';

interface BowlingGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

class BowlingAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playRoll() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.8);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.linearRampToValueAtTime(0.005, now + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.85);
    } catch (e) {}
  }

  playCrash(pins: number) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Explosion style crash
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.45);

      if (pins === 10) {
        // Strike fanfare
        const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // Strike chord
        freqs.forEach((freq, idx) => {
          const oscFan = this.ctx!.createOscillator();
          const gainFan = this.ctx!.createGain();
          oscFan.type = 'sine';
          oscFan.frequency.setValueAtTime(freq, now + idx * 0.06);
          gainFan.gain.setValueAtTime(0.02, now + idx * 0.06);
          gainFan.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);
          oscFan.connect(gainFan);
          gainFan.connect(this.ctx!.destination);
          oscFan.start(now + idx * 0.06);
          oscFan.stop(now + idx * 0.06 + 0.32);
        });
      }
    } catch (e) {}
  }
}

export const BowlingGame: React.FC<BowlingGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [gameState, setGameState] = useState<'IDLE' | 'LOCKING_AIM' | 'LOCKING_POWER' | 'ROLLING' | 'RESULT'>('IDLE');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  
  const [aim, setAim] = useState<number>(50); // 0 to 100
  const [power, setPower] = useState<number>(50); // 0 to 100
  const [isAimingRight, setIsAimingRight] = useState<boolean>(true);
  const [isPowerRising, setIsPowerRising] = useState<boolean>(true);

  const [pinsKnocked, setPinsKnocked] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([]);

  const audioRef = useRef<BowlingAudio>(new BowlingAudio());
  const animationRef = useRef<number | null>(null);

  // Aim and power animation loop
  useEffect(() => {
    let speed = 3;
    let angle = 0;

    const tick = () => {
      angle += 0.04;
      if (gameState === 'LOCKING_AIM') {
        setAim(50 + Math.sin(angle * speed) * 45);
        animationRef.current = requestAnimationFrame(tick);
      } else if (gameState === 'LOCKING_POWER') {
        setPower(50 + Math.cos(angle * speed) * 45);
        animationRef.current = requestAnimationFrame(tick);
      }
    };

    if (gameState === 'LOCKING_AIM' || gameState === 'LOCKING_POWER') {
      animationRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameState]);

  const toggleSound = () => {
    const nextMute = !soundMuted;
    setSoundMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleStartBowling = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips for Cosmic Bowling!', 'error');
      return;
    }
    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);
    setGameState('LOCKING_AIM');
    setAim(50);
    setPower(50);
    setPinsKnocked(0);
    setMultiplier(0);
  };

  const handleLockState = () => {
    if (gameState === 'LOCKING_AIM') {
      setGameState('LOCKING_POWER');
    } else if (gameState === 'LOCKING_POWER') {
      setGameState('ROLLING');
      audioRef.current.playRoll();

      setTimeout(() => {
        // Calculate physics/knockdown of pins
        // Perfect aim is 50. Power is ideally > 75.
        const aimOffset = Math.abs(aim - 50); // 0 (perfect) to 50
        const finalPower = power;

        let knocked = 0;

        if (aimOffset <= 4 && finalPower >= 80) {
          knocked = 10; // STRIKE!
        } else if (aimOffset <= 10 && finalPower >= 65) {
          knocked = Math.floor(Math.random() * 3) + 7; // 7, 8, 9 pins
        } else if (aimOffset <= 20) {
          knocked = Math.floor(Math.random() * 4) + 4; // 4 to 7 pins
        } else if (aimOffset <= 35) {
          knocked = Math.floor(Math.random() * 4) + 1; // 1 to 4 pins
        } else {
          knocked = 0; // GUTTER BALL!
        }

        let mult = 0;
        if (knocked === 10) {
          mult = 3.5;
        } else if (knocked >= 7) {
          mult = 1.8;
        } else {
          mult = parseFloat((knocked * 0.15).toFixed(2));
        }

        const payout = Math.floor(betAmount * mult);
        if (payout > 0) {
          onUpdateChips(payout);
          if (knocked === 10) onUpdateTask('win_high_odds', 1);
        }

        audioRef.current.playCrash(knocked);
        setPinsKnocked(knocked);
        setMultiplier(mult);
        setHistory(prev => [knocked, ...prev.slice(0, 9)]);
        
        if (knocked === 10) {
          triggerAlert(`STRIKE! You knocked down all 10 pins! Multiplier: 3.5x (+${payout} Chips)! 🎳🔥`, 'success');
        } else if (knocked >= 7) {
          triggerAlert(`Nice throw! ${knocked} pins knocked! Multiplier: 1.8x (+${payout} Chips).`, 'success');
        } else if (knocked > 0) {
          triggerAlert(`Broke pins! ${knocked} pins down (+${payout} Chips).`, 'info');
        } else {
          triggerAlert('Gutter ball! No pins hit. Try adjusting aim next frame! 🎳', 'error');
        }
        
        setGameState('RESULT');
      }, 1200);
    }
  };

  const adjustBet = (amount: number) => {
    if (gameState !== 'IDLE' && gameState !== 'RESULT') return;
    setBetAmount(prev => Math.max(10, Math.min(chips, prev + amount)));
  };

  const setBetMax = () => {
    if (gameState !== 'IDLE' && gameState !== 'RESULT') return;
    setBetAmount(Math.min(chips, 1000));
  };

  return (
    <div id="bowling-game-root" className="space-y-6">
      {/* GAME HEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase">
            <Flame className="w-5 h-5 text-amber-500 animate-bounce" /> Cosmic Neon Bowling
          </h3>
          <p className="text-[11px] text-white/50 font-mono">LOCK PERFECT ANGLES & RELEASE MAXIMUM POWER FOR A STRIKE</p>
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

      {/* GAME GRID */}
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
                  disabled={gameState !== 'IDLE' && gameState !== 'RESULT'}
                  className="bg-transparent text-sm font-mono font-black text-white focus:outline-none w-full"
                />
                <button
                  onClick={setBetMax}
                  disabled={gameState !== 'IDLE' && gameState !== 'RESULT'}
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
                    disabled={gameState !== 'IDLE' && gameState !== 'RESULT'}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-mono font-bold rounded-lg border border-white/5"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Gauge displays */}
            <div className="bg-[#111126]/60 border border-white/5 rounded-xl p-4 space-y-3 font-mono text-xs">
              <span className="text-[10px] text-white/40 uppercase block">FLIGHT CONTROLLER</span>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span>Aim Angle:</span>
                  <span className="font-bold text-amber-400">{Math.floor(aim)}%</span>
                </div>
                <div className="h-2.5 bg-white/5 border border-white/10 rounded-full overflow-hidden p-0.5 relative">
                  <div className="h-full w-2.5 bg-amber-400 rounded-full absolute transition-all" style={{ left: `${aim}%`, transform: 'translateX(-50%)' }} />
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-white/20" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span>Ball Speed / Power:</span>
                  <span className="font-bold text-teal-400">{Math.floor(power)}%</span>
                </div>
                <div className="h-2.5 bg-white/5 border border-white/10 rounded-full overflow-hidden p-0.5 relative">
                  <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${power}%` }} />
                </div>
              </div>
            </div>

            {/* Payout table */}
            <div className="bg-[#111126]/40 rounded-xl p-3 border border-white/5 text-[10px] space-y-1.5 font-mono">
              <span className="font-bold text-white/60 uppercase block mb-1">ALLEY REWARD TIERS</span>
              <div className="flex justify-between text-yellow-400 border-b border-white/5 pb-1">
                <span>Strike! (10 pins)</span>
                <span>3.5x Payout</span>
              </div>
              <div className="flex justify-between text-teal-400 border-b border-white/5 pb-1">
                <span>Spare! (7-9 pins)</span>
                <span>1.8x Payout</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Any pins (1-6)</span>
                <span>0.15x per pin</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            {gameState === 'IDLE' || gameState === 'RESULT' ? (
              <button
                onClick={handleStartBowling}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> LOCK BET & START FRAME
              </button>
            ) : (
              <button
                onClick={handleLockState}
                className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-black text-xs uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
              >
                {gameState === 'LOCKING_AIM' ? 'LOCK AIM ANGLE 🎯' : 'ROLL BOWLING BALL 🎳'}
              </button>
            )}
          </div>
        </div>

        {/* ALLEY STAGE */}
        <div className="bg-[#070719] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(24,20,48,0.7)_0%,rgba(5,5,15,1)_100%)]" />

          {/* Perspective neon lane drawn on SVG */}
          <div className="relative z-10 w-full max-w-sm h-64 flex flex-col justify-between items-center">
            {/* Ten bowling pins in triangle pattern at top of lane */}
            <div className="grid grid-cols-4 gap-2 text-center w-36 h-12 flex justify-center items-center">
              {gameState === 'ROLLING' ? (
                <div className="col-span-4 font-mono font-black text-amber-400 text-xs animate-ping">BALL IN FLIGHT...</div>
              ) : gameState === 'RESULT' ? (
                <div className="col-span-4 text-center font-mono space-y-1">
                  <span className="text-3xl">🎳</span>
                  <p className="text-xs font-black text-teal-400 uppercase">HIT: {pinsKnocked} PINS DOWN!</p>
                </div>
              ) : (
                // Pins standing
                <div className="col-span-4 flex flex-col items-center gap-1.5">
                  <div className="flex gap-2">⚪</div>
                  <div className="flex gap-2">⚪ ⚪</div>
                  <div className="flex gap-2">⚪ ⚪ ⚪</div>
                  <div className="flex gap-2 text-[9px] font-mono text-white/40">TEN-PIN SPREAD</div>
                </div>
              )}
            </div>

            {/* Glowing lane lines */}
            <svg viewBox="0 0 100 100" className="w-full h-36 pointer-events-none">
              {/* Lane borders */}
              <line x1="20" y1="100" x2="45" y2="0" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
              <line x1="80" y1="100" x2="55" y2="0" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
              {/* Center arrows */}
              <polygon points="50,10 48,20 52,20" fill="rgba(168,85,247,0.3)" />
              <polygon points="40,30 38,40 42,40" fill="rgba(168,85,247,0.3)" />
              <polygon points="60,30 58,40 62,40" fill="rgba(168,85,247,0.3)" />
            </svg>

            {/* The Rolling Ball */}
            {gameState === 'ROLLING' && (
              <motion.div
                initial={{ y: 80, scale: 1.5, x: (aim - 50) * 1.5 }}
                animate={{ y: 0, scale: 0.4, x: (aim - 50) * 0.3 }}
                transition={{ duration: 1.0, ease: 'easeIn' }}
                className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 border border-purple-400 shadow-[0_0_10px_#818cf8] flex items-center justify-center"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              </motion.div>
            )}
          </div>

          {/* HISTORICAL PIN RECORD STRIP */}
          <div className="absolute bottom-4 left-6 right-6 z-10 flex gap-1.5 justify-center font-mono">
            {history.slice(0, 5).map((h, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${h === 10 ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' : 'bg-white/5 text-white/40'}`}>
                {h === 10 ? 'STRIKE' : `${h} Pins`}
              </span>
            ))}
          </div>

          {/* RESULTS DISPLAY OVERLAY */}
          {gameState === 'RESULT' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute z-20 bg-black/90 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center space-y-1.5 text-center"
            >
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
              <h4 className="text-xs font-black uppercase text-white/40">SCORE REPORT</h4>
              <p className="text-base font-black text-white">{pinsKnocked === 10 ? '🎳 STRIKE MATCH!' : `KNOCKED ${pinsKnocked} PINS!`}</p>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20 font-bold">
                Winnings: {multiplier}x multiplier
              </span>
              <button
                onClick={() => setGameState('IDLE')}
                className="mt-3 px-3 py-1 bg-white/10 hover:bg-white/15 text-white font-extrabold text-[10px] rounded-lg border border-white/5 flex items-center gap-1 cursor-pointer"
              >
                PLAY AGAIN
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
