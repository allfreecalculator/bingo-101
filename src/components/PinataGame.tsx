import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, HelpCircle, Trophy, Volume2, VolumeX, Sparkles, Zap, Star } from 'lucide-react';

interface PinataGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

class PinataAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playSwing() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  playSmash() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Smash crack sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.2);

      // Sweet coin bell
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now); // B5
      gain2.gain.setValueAtTime(0.015, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start();
      osc2.stop(now + 0.17);
    } catch (e) {}
  }

  playBreakJackpot() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // White noise style blast
      const oscNode = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      oscNode.type = 'sawtooth';
      oscNode.frequency.setValueAtTime(120, now);
      oscNode.frequency.linearRampToValueAtTime(30, now + 0.6);
      gainNode.gain.setValueAtTime(0.035, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      oscNode.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      oscNode.start();
      oscNode.stop(now + 0.65);

      // Arpeggio chime
      const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.02, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.32);
      });
    } catch (e) {}
  }
}

export const PinataGame: React.FC<PinataGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [gameState, setGameState] = useState<'IDLE' | 'ACTIVE' | 'JACKPOT' | 'COMPLETED'>('IDLE');
  const [swingsLeft, setSwingsLeft] = useState<number>(0);
  const [crackPercent, setCrackPercent] = useState<number>(0);
  const [totalMultiplier, setTotalMultiplier] = useState<number>(0);
  const [accumulatedWinnings, setAccumulatedWinnings] = useState<number>(0);
  const [isWobbling, setIsWobbling] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [hitsList, setHitsList] = useState<number[]>([]);

  const audioRef = useRef<PinataAudio>(new PinataAudio());

  const toggleSound = () => {
    const nextMute = !soundMuted;
    setSoundMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleStartGame = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to place this bet!', 'error');
      return;
    }
    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);
    setCrackPercent(0);
    setSwingsLeft(5);
    setTotalMultiplier(0);
    setAccumulatedWinnings(0);
    setHitsList([]);
    setGameState('ACTIVE');
    triggerAlert('Cosmic Piñata placed! You have 5 high-power swings!', 'info');
  };

  const handleSwing = () => {
    if (swingsLeft <= 0 || gameState !== 'ACTIVE') return;

    audioRef.current.playSwing();
    setIsWobbling(true);
    setSwingsLeft(prev => prev - 1);

    setTimeout(() => {
      audioRef.current.playSmash();
      setIsWobbling(false);

      // Random multiplier from this swing (e.g., 0.15x to 1.5x)
      const hitMult = parseFloat((Math.random() * 1.15 + 0.15).toFixed(2));
      const swingWin = Math.floor(betAmount * hitMult);

      // Random crack contribution (15% to 25%)
      const addedCrack = Math.floor(Math.random() * 11) + 15;
      const nextCrack = Math.min(100, crackPercent + addedCrack);

      setCrackPercent(nextCrack);
      setTotalMultiplier(prev => parseFloat((prev + hitMult).toFixed(2)));
      setAccumulatedWinnings(prev => prev + swingWin);
      setHitsList(prev => [...prev, hitMult]);
      onUpdateChips(swingWin);

      if (nextCrack >= 100) {
        // JACKPOT EXPLOSION!
        setGameState('JACKPOT');
        audioRef.current.playBreakJackpot();
        
        // Huge Jackpot multi: 6x to 15x
        const jackMult = Math.floor(Math.random() * 10) + 6;
        const jackpotWin = betAmount * jackMult;
        
        setTimeout(() => {
          setTotalMultiplier(prev => parseFloat((prev + jackMult).toFixed(2)));
          setAccumulatedWinnings(prev => prev + jackpotWin);
          onUpdateChips(jackpotWin);
          triggerAlert(`BOOM! Piñata fully cracked! Jackpot bonus of ${jackMult}x (+${jackpotWin} Chips) awarded! 🪅🎉`, 'success');
          onUpdateTask('win_high_odds', 1);
          setGameState('COMPLETED');
        }, 800);
      } else if (swingsLeft - 1 === 0) {
        // Game completed without full crack
        setTimeout(() => {
          setGameState('COMPLETED');
          triggerAlert(`Piñata survived, but you collected +${accumulatedWinnings + swingWin} Chips! 🌟`, 'success');
        }, 600);
      } else {
        triggerAlert(`WHACK! Multiplier +${hitMult}x (+${swingWin} Chips)! Crack: ${nextCrack}%`, 'success');
      }
    }, 300);
  };

  const adjustBet = (amount: number) => {
    if (gameState !== 'IDLE' && gameState !== 'COMPLETED') return;
    setBetAmount(prev => Math.max(10, Math.min(chips, prev + amount)));
  };

  const setBetMax = () => {
    if (gameState !== 'IDLE' && gameState !== 'COMPLETED') return;
    setBetAmount(Math.min(chips, 1000));
  };

  return (
    <div id="pinata-game-root" className="space-y-6">
      {/* GAME HEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" /> Celestial Piñata Smash
          </h3>
          <p className="text-[11px] text-white/50 font-mono">SMASH THE FLOATING PIÑATA TO RELEASE JACKPOT MULTIPLIERS</p>
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
                  disabled={gameState === 'ACTIVE' || gameState === 'JACKPOT'}
                  className="bg-transparent text-sm font-mono font-black text-white focus:outline-none w-full"
                />
                <button
                  onClick={setBetMax}
                  disabled={gameState === 'ACTIVE' || gameState === 'JACKPOT'}
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
                    disabled={gameState === 'ACTIVE' || gameState === 'JACKPOT'}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-mono font-bold rounded-lg border border-white/5"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Score logs */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2 font-mono">
              <span className="text-[10px] text-white/40 uppercase block mb-1">Interactive Match Logs</span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Swings Remaining:</span>
                <span className="font-bold text-amber-400 text-sm">{gameState === 'IDLE' ? 5 : swingsLeft} / 5</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Total Multiplier Spilled:</span>
                <span className="font-bold text-teal-400 text-sm">{totalMultiplier}x</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Total Winnings:</span>
                <span className="font-bold text-white text-sm">{accumulatedWinnings} Chips</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-[#111126]/40 rounded-xl p-3 border border-white/5 text-[10px] text-white/50 space-y-1 font-mono">
              <span className="font-bold text-white/80 uppercase block mb-1 tracking-wider">HOW TO PLAY</span>
              <p>1. Set your bet per piñata contract.</p>
              <p>2. Buy your contract and click <b className="text-amber-400">SMASH PIÑATA</b>.</p>
              <p>3. Each of your 5 swings spills instant chips and increases the crack meter.</p>
              <p>4. Reach <b className="text-teal-400">100% Crack</b> to explode the star and win the <b className="text-red-400">Jackpot Multiplier (Up to 15x!)</b>!</p>
            </div>
          </div>

          <div className="pt-4">
            {gameState === 'IDLE' || gameState === 'COMPLETED' ? (
              <button
                onClick={handleStartGame}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> BUY PIÑATA CONTRACT
              </button>
            ) : (
              <button
                onClick={handleSwing}
                disabled={gameState !== 'ACTIVE' || swingsLeft <= 0}
                className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-black text-xs uppercase tracking-widest rounded-xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
              >
                <Zap className="w-4 h-4" /> SMASH COYOTE! (SWING) 🪅
              </button>
            )}
          </div>
        </div>

        {/* PIÑATA VISUAL AREA */}
        <div className="bg-[#070719] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,10,48,0.7)_0%,rgba(5,5,15,1)_100%)]" />

          {/* CRACK PROGRESS BAR */}
          <div className="absolute top-6 left-6 right-6 space-y-1 z-10">
            <div className="flex justify-between text-[10px] font-mono text-white/40">
              <span>🪅 PIÑATA CRACK LEVEL</span>
              <span className="font-bold text-teal-400">{crackPercent}% cracked</span>
            </div>
            <div className="w-full h-2.5 bg-white/5 border border-white/10 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-teal-500 via-amber-400 to-red-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                style={{ width: `${crackPercent}%` }}
              />
            </div>
          </div>

          {/* THE FLOATING NEON PIÑATA */}
          <div className="relative z-10 flex flex-col items-center justify-center h-52">
            <AnimatePresence mode="wait">
              {gameState === 'JACKPOT' ? (
                <motion.div 
                  key="jackpot"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.4, 1.1], opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center space-y-2"
                >
                  <div className="text-5xl animate-bounce">💥🪅✨</div>
                  <h4 className="text-xl font-black text-yellow-400 tracking-wider uppercase animate-pulse">JACKPOT EXPLOSION!</h4>
                </motion.div>
              ) : (
                <motion.div
                  key="active-pinata"
                  animate={isWobbling ? {
                    rotate: [0, -15, 15, -15, 10, -5, 0],
                    scale: [1, 1.1, 0.95, 1.05, 1],
                  } : {
                    y: [0, -10, 0],
                  }}
                  transition={isWobbling ? { duration: 0.4 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="cursor-pointer select-none filter drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] relative"
                  onClick={gameState === 'ACTIVE' ? handleSwing : undefined}
                >
                  {/* Glowing custom star-shaped holographic piñata icon */}
                  <div className="text-8xl relative flex items-center justify-center">
                    {crackPercent >= 75 ? '🦄💥' : crackPercent >= 50 ? '🦄⚡' : crackPercent >= 25 ? '🦄🩹' : '🦄'}
                    
                    {/* Crack overlays */}
                    {crackPercent >= 25 && (
                      <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-red-500 text-3xl select-none opacity-80 pointer-events-none transform rotate-12">
                        ⚡
                      </div>
                    )}
                    {crackPercent >= 60 && (
                      <div className="absolute inset-0 flex items-center justify-center font-mono font-black text-teal-400 text-2xl select-none opacity-80 pointer-events-none transform -rotate-12 translate-x-3">
                        ⚡
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Float visual indicators */}
            {gameState === 'ACTIVE' && (
              <div className="absolute top-1/2 -translate-y-1/2 text-2xl animate-ping duration-1500 pointer-events-none opacity-20 text-teal-400">
                ⭐
              </div>
            )}
          </div>

          {/* SPILLED HITS PREVIEW */}
          <div className="absolute bottom-4 left-6 right-6 z-10 flex gap-1.5 justify-center overflow-x-auto pb-1 max-w-full">
            {hitsList.map((hit, idx) => (
              <span key={idx} className="bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase">
                +{hit}x
              </span>
            ))}
          </div>

          {/* RESULTS DISPLAY OVERLAY */}
          {gameState === 'COMPLETED' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute z-20 bg-black/90 border border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center space-y-1.5 text-center"
            >
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
              <h4 className="text-xs font-black uppercase text-white/40">SPLATTER RECORD</h4>
              <p className="text-base font-black text-white">COLLECTED +{accumulatedWinnings} CHIPS!</p>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20 font-bold">
                Total Multiplier: {totalMultiplier}x
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
