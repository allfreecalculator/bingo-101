import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, HelpCircle, Trophy, Volume2, VolumeX, Shield, ShieldAlert, Key, Unlock } from 'lucide-react';

interface VaultGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

const VAULT_TIERS = [
  { level: 1, multiplier: 1.4, label: 'Bronze Safe' },
  { level: 2, multiplier: 2.1, label: 'Silver Safe' },
  { level: 3, multiplier: 3.2, label: 'Gold Safe' },
  { level: 4, multiplier: 5.5, label: 'Platinum Safe' },
  { level: 5, multiplier: 12.0, label: 'Obsidian Core' }
];

class VaultAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playBeep() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playUnlock() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.setValueAtTime(1000, now + 0.08);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  playAlarm() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.4);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.42);
    } catch (e) {}
  }

  playCashout() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5-E5-G5-C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.02, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.27);
      });
    } catch (e) {}
  }
}

export const VaultGame: React.FC<VaultGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [currentLevel, setCurrentLevel] = useState<number>(1); // Tier 1 to 5
  const [gameState, setGameState] = useState<'IDLE' | 'ACTIVE' | 'BUSTED' | 'CASHOUT_DONE'>('IDLE');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null); // Index selected in current level
  const [safeStatus, setSafeStatus] = useState<Array<'UNKNOWN' | 'GOLD' | 'ALARM'>>(['UNKNOWN', 'UNKNOWN', 'UNKNOWN']);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([]);

  const audioRef = useRef<VaultAudio>(new VaultAudio());

  const toggleSound = () => {
    const nextMute = !soundMuted;
    setSoundMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleStartHeist = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to start vault drilling!', 'error');
      return;
    }
    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);
    setCurrentLevel(1);
    setSelectedIndex(null);
    setSafeStatus(['UNKNOWN', 'UNKNOWN', 'UNKNOWN']);
    setGameState('ACTIVE');
    triggerAlert('Heist initiated! Choose one of the 3 Bronze safes.', 'info');
  };

  const handleChooseSafe = (index: number) => {
    if (gameState !== 'ACTIVE' || selectedIndex !== null) return;

    audioRef.current.playBeep();
    setSelectedIndex(index);

    setTimeout(() => {
      // Determine layout of this level's safes. 2 Gold, 1 Alarm.
      // Randomly allocate one safe to be the ALARM safe (0, 1, or 2).
      const alarmIndex = Math.floor(Math.random() * 3);
      
      const newStatus = safeStatus.map((_, i) => {
        if (i === alarmIndex) return 'ALARM';
        return 'GOLD';
      });

      setSafeStatus(newStatus);

      if (index === alarmIndex) {
        // ALARM TRIGGERED! BUSTED!
        setGameState('BUSTED');
        audioRef.current.playAlarm();
        triggerAlert(`SECURITY ALERT! Laser alarm tripped in Safe ${String.fromCharCode(65 + index)}! You lost the heist wager! 🚨`, 'error');
        setHistory(prev => [0, ...prev.slice(0, 9)]);
      } else {
        // SUCCESSFUL DRILL!
        audioRef.current.playUnlock();
        const tier = VAULT_TIERS.find(t => t.level === currentLevel)!;
        triggerAlert(`Success! Safe ${String.fromCharCode(65 + index)} unlocked! Current multiplier: ${tier.multiplier}x.`, 'success');

        if (currentLevel === 5) {
          // Unlocked the maximum Obsidian Core! Auto cashout
          const payout = Math.floor(betAmount * 12.0);
          onUpdateChips(payout);
          setGameState('CASHOUT_DONE');
          triggerAlert(`CONGRATULATIONS! You cleared all 5 vaults! Obsidian Core parsed (+${payout} Chips)! 🏆👑`, 'success');
          onUpdateTask('win_high_odds', 1);
          setHistory(prev => [12.0, ...prev.slice(0, 9)]);
        }
      }
    }, 800);
  };

  const handleCashOut = () => {
    if (gameState !== 'ACTIVE' || selectedIndex === null || safeStatus[selectedIndex] === 'ALARM') return;

    const currentMultiplier = VAULT_TIERS.find(t => t.level === currentLevel)!.multiplier;
    const payout = Math.floor(betAmount * currentMultiplier);

    onUpdateChips(payout);
    audioRef.current.playCashout();
    setGameState('CASHOUT_DONE');
    triggerAlert(`Cashed out safely with ${currentMultiplier}x multiplier (+${payout} Chips)! 💼💵`, 'success');
    if (currentMultiplier >= 3) onUpdateTask('win_high_odds', 1);
    setHistory(prev => [currentMultiplier, ...prev.slice(0, 9)]);
  };

  const handleNextLevel = () => {
    if (gameState !== 'ACTIVE' || selectedIndex === null || safeStatus[selectedIndex] === 'ALARM') return;
    
    // Advance to next level
    setCurrentLevel(prev => prev + 1);
    setSelectedIndex(null);
    setSafeStatus(['UNKNOWN', 'UNKNOWN', 'UNKNOWN']);
    triggerAlert(`Drilling deep! Enter Vault Level ${currentLevel + 1}.`, 'info');
  };

  const adjustBet = (amount: number) => {
    if (gameState !== 'IDLE' && gameState !== 'BUSTED' && gameState !== 'CASHOUT_DONE') return;
    setBetAmount(prev => Math.max(10, Math.min(chips, prev + amount)));
  };

  const setBetMax = () => {
    if (gameState !== 'IDLE' && gameState !== 'BUSTED' && gameState !== 'CASHOUT_DONE') return;
    setBetAmount(Math.min(chips, 1000));
  };

  const activeMultiplier = VAULT_TIERS.find(t => t.level === currentLevel)?.multiplier || 1;

  return (
    <div id="vault-game-root" className="space-y-6">
      {/* GAME HEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase">
            <Unlock className="w-5 h-5 text-amber-400 animate-pulse" /> Vault Escape Heist
          </h3>
          <p className="text-[11px] text-white/50 font-mono">CHOOSE THE RIGHT DIGITAL SAFES & ESCAPE THE SECURITY LASERS</p>
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

      {/* HEIST GRID */}
      <div className="grid lg:grid-cols-[1.2fr_1.6fr] gap-6">
        {/* HEIST CONTROL RACK */}
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
                  disabled={gameState === 'ACTIVE'}
                  className="bg-transparent text-sm font-mono font-black text-white focus:outline-none w-full"
                />
                <button
                  onClick={setBetMax}
                  disabled={gameState === 'ACTIVE'}
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
                    disabled={gameState === 'ACTIVE'}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-mono font-bold rounded-lg border border-white/5"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Escaping Multipliers Ladder */}
            <div className="bg-[#111126]/40 rounded-xl p-3 border border-white/5 space-y-1 font-mono text-[10px]">
              <span className="font-bold text-white/60 uppercase block mb-1">HEIST ESCALATOR TIER</span>
              {VAULT_TIERS.map((tier) => {
                const isActive = currentLevel === tier.level && gameState === 'ACTIVE';
                return (
                  <div 
                    key={tier.level} 
                    className={`flex justify-between items-center px-2 py-1.5 rounded transition-all ${
                      isActive 
                        ? 'bg-amber-400 text-black font-extrabold shadow-md' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <span>Lvl {tier.level}: {tier.label}</span>
                    <span className={isActive ? 'text-black' : 'text-amber-400 font-bold'}>{tier.multiplier.toFixed(1)}x</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {gameState === 'IDLE' || gameState === 'BUSTED' || gameState === 'CASHOUT_DONE' ? (
              <button
                onClick={handleStartHeist}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> DEPLOY VACUUM DRILL
              </button>
            ) : selectedIndex !== null && safeStatus[selectedIndex] === 'GOLD' ? (
              <div className="flex gap-2">
                <button
                  onClick={handleCashOut}
                  className="flex-1 py-4.5 bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  💼 SECURE MONEY (CASH OUT)
                </button>
                <button
                  onClick={handleNextLevel}
                  className="flex-1 py-4.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  ⚡ DRILL NEXT VAULT
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-white/5 text-white/30 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5"
              >
                CHOOSE A VAULT SAFE TO PROCEED
              </button>
            )}
          </div>
        </div>

        {/* HEIST DEPLOYMENT ZONE */}
        <div className="bg-[#070719] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,24,48,0.7)_0%,rgba(5,5,15,1)_100%)]" />

          {/* ACTIVE LEVEL INDICATOR BAR */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 text-[10px] font-mono text-white/40">
            <span>VAULT LAYER ENTRANCE</span>
            <span className="font-black text-amber-400">VAULT {currentLevel} / 5</span>
          </div>

          {/* SAFES DEPLOYMENT BOARD */}
          <div className="relative z-10 grid grid-cols-3 gap-4 w-full max-w-sm">
            {['A', 'B', 'C'].map((char, index) => {
              const isSelected = selectedIndex === index;
              const status = isSelected ? safeStatus[index] : 'UNKNOWN';

              return (
                <motion.button
                  key={index}
                  whileHover={gameState === 'ACTIVE' && selectedIndex === null ? { scale: 1.05 } : {}}
                  onClick={() => handleChooseSafe(index)}
                  disabled={gameState !== 'ACTIVE' || selectedIndex !== null}
                  className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-3 relative overflow-hidden transition-all duration-300 ${
                    status === 'GOLD' 
                      ? 'bg-green-500/10 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                      : status === 'ALARM' 
                      ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,110,110,0.4)] animate-bounce' 
                      : isSelected 
                      ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-white/5 border-white/10 hover:border-amber-400/40 text-white/50 hover:text-white cursor-pointer'
                  }`}
                >
                  <span className="absolute top-2 left-3 font-mono text-[9px] font-bold text-white/30">SAFE {char}</span>
                  
                  {status === 'GOLD' ? (
                    <div className="text-center space-y-1">
                      <span className="text-3xl filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]">💰</span>
                      <span className="block font-mono text-[8px] font-bold text-green-400">GOLD</span>
                    </div>
                  ) : status === 'ALARM' ? (
                    <div className="text-center space-y-1">
                      <ShieldAlert className="w-8 h-8 text-red-500 animate-spin" />
                      <span className="block font-mono text-[8px] font-bold text-red-500">ALARM</span>
                    </div>
                  ) : (
                    <div className="text-center space-y-1">
                      <Key className={`w-8 h-8 mx-auto ${gameState === 'ACTIVE' && selectedIndex === null ? 'text-amber-400 animate-pulse' : 'text-white/20'}`} />
                      <span className="block font-mono text-[8px]">LOCKED</span>
                    </div>
                  )}

                  {/* Ripple overlay on selection */}
                  {isSelected && status === 'UNKNOWN' && (
                    <div className="absolute inset-0 border border-amber-400 animate-ping rounded-2xl duration-1000" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* BOTTOM TIPS */}
          <div className="absolute bottom-4 left-6 right-6 z-10 text-center font-mono text-[9px] text-white/30">
            {gameState === 'ACTIVE' && selectedIndex === null ? (
              <span>⚡ TAP ANY COLD SAFE TO UNLOCK GOLD ACCRETION</span>
            ) : gameState === 'ACTIVE' ? (
              <span>💼 SELECT ESCAPE OPTION OR CONTINUE TO NEXT VAULT RISK</span>
            ) : (
              <span>⚡ INITIALIZE HEIST CORE TO RUN SAFE CHANCES</span>
            )}
          </div>

          {/* BUSTED OVERLAY */}
          <AnimatePresence>
            {gameState === 'BUSTED' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="absolute z-20 bg-black/95 border border-red-500/30 rounded-2xl p-5 flex flex-col items-center justify-center space-y-1.5 text-center max-w-xs"
              >
                <ShieldAlert className="w-10 h-10 text-red-500 animate-bounce" />
                <h4 className="text-sm font-black uppercase text-red-500 tracking-widest">HEIST BUSTED!</h4>
                <p className="text-xs text-white/60">An alarm triggered security blockades. Drilling cut short.</p>
                <button
                  onClick={() => setGameState('IDLE')}
                  className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] rounded-lg tracking-wider cursor-pointer"
                >
                  CLEAN SLATE & RE-DEPLOY
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CASH OUT REPORT OVERLAY */}
          <AnimatePresence>
            {gameState === 'CASHOUT_DONE' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="absolute z-20 bg-black/95 border border-green-500/30 rounded-2xl p-5 flex flex-col items-center justify-center space-y-1.5 text-center max-w-xs"
              >
                <Trophy className="w-10 h-10 text-green-400 animate-bounce" />
                <h4 className="text-sm font-black uppercase text-green-400 tracking-widest">SECURE RETREAT!</h4>
                <p className="text-xs text-white/60">Landed successfully! Multiplier: {activeMultiplier}x</p>
                <button
                  onClick={() => setGameState('IDLE')}
                  className="mt-3 px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white font-extrabold text-[10px] rounded-lg tracking-wider cursor-pointer"
                >
                  LOAD NEXT VAULT RUN
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
