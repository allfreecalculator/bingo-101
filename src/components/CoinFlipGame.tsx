import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, Sparkles, Volume2, VolumeX, HelpCircle, Trophy, RotateCw } from 'lucide-react';

interface CoinFlipGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

class CoinflipAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playFlip() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.3);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.32);
    } catch (e) {}
  }

  playWin() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
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

  playLoss() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(70, now + 0.25);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.27);
    } catch (e) {}
  }
}

export const CoinFlipGame: React.FC<CoinFlipGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(25);
  const [selectedSide, setSelectedSide] = useState<'HEADS' | 'TAILS'>('HEADS');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [resultSide, setResultSide] = useState<'HEADS' | 'TAILS' | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [highStreak, setHighStreak] = useState<number>(0);
  const [history, setHistory] = useState<Array<'HEADS' | 'TAILS'>>([]);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  const audioRef = useRef<CoinflipAudio>(new CoinflipAudio());

  const handleFlip = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips for this coin flip!', 'error');
      return;
    }

    setIsSpinning(true);
    setResultSide(null);
    onUpdateChips(-betAmount);
    audioRef.current.playFlip();

    // Trigger casino_wager task
    onUpdateTask('casino_wager', betAmount);

    // Simulate standard coin flip with elegant timeout transition
    setTimeout(() => {
      const landSide = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
      setResultSide(landSide);
      setIsSpinning(false);
      setHistory(prev => [landSide, ...prev.slice(0, 9)]);

      const won = landSide === selectedSide;
      if (won) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setHighStreak(prev => Math.max(prev, nextStreak));
        
        // Multiplier bonus ladder for streaks
        // Streak 1: 1.95x, Streak 2: 2.1x, Streak 3: 2.4x, Streak 4+: 3.0x
        let mult = 1.95;
        if (nextStreak === 2) mult = 2.1;
        else if (nextStreak === 3) mult = 2.4;
        else if (nextStreak >= 4) mult = 3.0;

        const payout = Math.floor(betAmount * mult);
        onUpdateChips(payout);
        audioRef.current.playWin();
        triggerAlert(`Success! The coin landed on ${landSide}. streak: ${nextStreak}x (+${payout} Chips)! 🎉`, 'success');
        onUpdateTask('win_high_odds', 1);
      } else {
        setStreak(0);
        audioRef.current.playLoss();
        triggerAlert(`Aww, the coin landed on ${landSide}. Better luck next flip! 🍀`, 'info');
      }
    }, 1200);
  };

  const setBetMax = () => setBetAmount(Math.min(chips, 1000));
  const doubleBet = () => setBetAmount(prev => Math.min(chips, prev * 2));
  const halveBet = () => setBetAmount(prev => Math.max(10, Math.round(prev / 2)));

  return (
    <div id="coinflip-game-container" className="bg-[#0c0d2b]/85 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Visual background decorations */}
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/5">
            <RotateCw className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white uppercase font-sans flex items-center gap-2">
              Neon Coin Flip <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-bold">Bonus Streaks</span>
            </h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Double up with consecutive win multiplier bonuses</p>
          </div>
        </div>

        {/* Audio control & Stats */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              const next = !soundMuted;
              setSoundMuted(next);
              audioRef.current.muted = next;
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white transition-all cursor-pointer animate-fade-in"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> High Streak: <span className="font-black text-amber-400">{highStreak}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_1.2fr_1fr] gap-6 items-start">
        
        {/* Left Col: Setup & Bets */}
        <div className="space-y-4">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">1. Select Side Guess</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                disabled={isSpinning}
                onClick={() => setSelectedSide('HEADS')}
                className={`p-3 rounded-xl border text-center font-mono text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedSide === 'HEADS' 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-lg shadow-cyan-500/5' 
                    : 'bg-transparent text-white/40 border-white/5 hover:text-white hover:border-white/10'
                } disabled:opacity-50`}
              >
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center font-black text-cyan-400 text-sm border border-cyan-500/30">H</div>
                <span className="font-bold uppercase tracking-wider text-[10px]">Heads</span>
              </button>

              <button
                disabled={isSpinning}
                onClick={() => setSelectedSide('TAILS')}
                className={`p-3 rounded-xl border text-center font-mono text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  selectedSide === 'TAILS' 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-lg shadow-amber-500/5' 
                    : 'bg-transparent text-white/40 border-white/5 hover:text-white hover:border-white/10'
                } disabled:opacity-50`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center font-black text-amber-400 text-sm border border-amber-500/30">T</div>
                <span className="font-bold uppercase tracking-wider text-[10px]">Tails</span>
              </button>
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/60 uppercase font-bold tracking-wide flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> Bet Amount
              </span>
              <span className="text-[10px] text-white/30 font-mono">Min: 10</span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
              <input
                type="number"
                disabled={isSpinning}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Math.min(chips, parseInt(e.target.value) || 10)))}
                className="bg-transparent border-none outline-none text-white font-mono font-black text-sm flex-1 min-w-0"
              />
              {!isSpinning && (
                <div className="flex items-center gap-1">
                  <button onClick={halveBet} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">½</button>
                  <button onClick={doubleBet} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">2x</button>
                  <button onClick={setBetMax} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white rounded border border-cyan-500/20 transition-all cursor-pointer">Max</button>
                </div>
              )}
            </div>
          </div>

          <button
            disabled={isSpinning}
            onClick={handleFlip}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-cyan-500/20 cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> FLIP THE COIN
          </button>
        </div>

        {/* Center Col: The Coin Animation Screen */}
        <div className="flex flex-col items-center justify-center bg-black/30 border border-white/5 rounded-3xl p-6 min-h-[250px] relative">
          
          <AnimatePresence mode="wait">
            {isSpinning ? (
              <motion.div
                key="spinning"
                animate={{ rotateY: 1080 }}
                transition={{ repeat: Infinity, duration: 0.4, ease: 'linear' }}
                className="w-32 h-32 rounded-full border-4 border-dashed border-cyan-400 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-white/50 font-black text-3xl shadow-2xl shadow-cyan-500/10"
              >
                ☯
              </motion.div>
            ) : resultSide ? (
              <motion.div
                key="result"
                initial={{ scale: 0.3, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 shadow-2xl ${
                  resultSide === 'HEADS'
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-300 shadow-cyan-500/20'
                    : 'bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-300 shadow-amber-500/20'
                }`}
              >
                <div className="text-3xl font-black text-white">{resultSide === 'HEADS' ? 'HEADS' : 'TAILS'}</div>
                <div className="text-2xl mt-1">{resultSide === 'HEADS' ? '🔵' : '🟡'}</div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                className="w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 flex flex-col items-center justify-center text-white/40 font-mono text-center"
              >
                <span className="text-[10px] uppercase font-bold tracking-wider">Choose Guess</span>
                <span className="text-xs font-black text-white/70 mt-1">{selectedSide}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current active streak tag */}
          {streak > 0 && (
            <div className="absolute top-3 right-3 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2 py-1 rounded-lg border border-emerald-500/30 font-black animate-pulse flex items-center gap-1">
              🔥 STREAK: {streak}
            </div>
          )}
        </div>

        {/* Right Col: Streak Multiplier list & History */}
        <div className="space-y-4">
          <div className="bg-black/45 border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Multiplier Ladder</span>
            <div className="flex flex-col gap-1.5 font-mono text-[10px]">
              {[
                { str: '4+ Streak', mult: '3.0x', style: 'text-amber-400 font-extrabold animate-pulse' },
                { str: '3 Streak', mult: '2.4x', style: 'text-pink-400 font-bold' },
                { str: '2 Streak', mult: '2.1x', style: 'text-blue-400 font-bold' },
                { str: '1 win', mult: '1.95x', style: 'text-white/70' }
              ].map((tier, idx) => (
                <div key={idx} className="flex justify-between p-1.5 border-b border-white/5">
                  <span className="text-white/50">{tier.str}</span>
                  <span className={tier.style}>{tier.mult}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Coin History</span>
            <div className="flex flex-wrap gap-1.5">
              {history.length === 0 ? (
                <span className="text-[10px] text-white/20 font-mono">No spins yet...</span>
              ) : (
                history.map((side, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                      side === 'HEADS' 
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25' 
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    }`}
                  >
                    {side[0]}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
