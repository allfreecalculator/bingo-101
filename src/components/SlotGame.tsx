import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Sparkles, RefreshCw, HelpCircle, Trophy, Volume2, VolumeX } from 'lucide-react';

interface SlotGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

const REEL_SYMBOLS = [
  { char: '🍒', weight: 15, name: 'Cherry', mult: 3, color: 'text-rose-400' },
  { char: '🍋', weight: 15, name: 'Lemon', mult: 4, color: 'text-amber-300' },
  { char: '🍊', weight: 12, name: 'Orange', mult: 5, color: 'text-orange-400' },
  { char: '🍇', weight: 10, name: 'Grape', mult: 8, color: 'text-purple-400' },
  { char: '🔔', weight: 8, name: 'Bell', mult: 12, color: 'text-yellow-400' },
  { char: '💎', weight: 5, name: 'Diamond', mult: 25, color: 'text-cyan-400' },
  { char: '7️⃣', weight: 3, name: 'Seven', mult: 50, color: 'text-red-500' }
];

const SPINNING_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣', '🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣'];

export const SlotGame: React.FC<SlotGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [bet, setBet] = useState<number>(20);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [reelsSpinning, setReelsSpinning] = useState<boolean[]>([false, false, false]);
  // Cylindrical reels: each reel displays 3 items vertically (top, middle/payline, bottom)
  const [reels, setReels] = useState<string[][]>([
    ['🍋', '🍒', '🍊'],
    ['🍒', '💎', '🍇'],
    ['🍊', '7️⃣', '🍋']
  ]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [showPaytable, setShowPaytable] = useState<boolean>(false);
  const [leverPulled, setLeverPulled] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [spinHistory, setSpinHistory] = useState<string[]>([]);

  // Web Audio Synth FX Engine
  const playSound = (type: 'pull' | 'tick' | 'win' | 'lose') => {
    if (muted) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      if (type === 'pull') {
        // Heavy mechanical snap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'tick') {
        // High fidelity reel cog click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(750, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.03);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
      } else if (type === 'win') {
        // Happy pentatonic ascending casino ring
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
        });
      } else if (type === 'lose') {
        // Sad retro synth drop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(170, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  // Picker based on weighted items
  const getRandomSymbol = () => {
    const totalWeight = REEL_SYMBOLS.reduce((acc, curr) => acc + curr.weight, 0);
    let rand = Math.random() * totalWeight;
    for (const sym of REEL_SYMBOLS) {
      if (rand < sym.weight) return sym.char;
      rand -= sym.weight;
    }
    return REEL_SYMBOLS[0].char;
  };

  const handleSpin = () => {
    if (spinning) return;
    if (chips < bet) {
      triggerAlert('Insufficient chips to spin the golden reels!', 'error');
      return;
    }

    // Deduct wager
    onUpdateChips(-bet);
    setSpinning(true);
    setReelsSpinning([true, true, true]);
    setLastWin(null);
    onUpdateTask('play_slots', 1);

    // Audio / Visual triggers
    playSound('pull');
    setLeverPulled(true);
    setTimeout(() => setLeverPulled(false), 450);

    // TTS Voice Synthesizer
    if ('speechSynthesis' in window && !muted) {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('Spinning the golden reels!');
        u.volume = 0.25;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }

    // Pre-calculate winning combinations (middle row)
    const target1 = getRandomSymbol();
    const target2 = getRandomSymbol();
    const target3 = getRandomSymbol();

    // Start a single lightweight tick interval for audio feedback only (NO heavy state updates!)
    let ticks = 0;
    const tickInterval = setInterval(() => {
      playSound('tick');
      ticks++;
      if (ticks > 22) clearInterval(tickInterval);
    }, 90);

    // Staggered reel stops
    setTimeout(() => {
      setReelsSpinning(prev => [false, prev[1], prev[2]]);
      setReels(prev => [
        [getRandomSymbol(), target1, getRandomSymbol()],
        prev[1],
        prev[2]
      ]);
      playSound('pull');
    }, 1000);

    setTimeout(() => {
      setReelsSpinning(prev => [prev[0], false, prev[2]]);
      setReels(prev => [
        prev[0],
        [getRandomSymbol(), target2, getRandomSymbol()],
        prev[2]
      ]);
      playSound('pull');
    }, 1600);

    setTimeout(() => {
      clearInterval(tickInterval);
      setReelsSpinning([false, false, false]);
      setReels(prev => [
        prev[0],
        prev[1],
        [getRandomSymbol(), target3, getRandomSymbol()]
      ]);
      playSound('pull');
      
      // Calculate and reward
      finalizeResults(target1, target2, target3);
    }, 2200);
  };

  const finalizeResults = (r1: string, r2: string, r3: string) => {
    let multiplier = 0;
    let winMsg = '';

    if (r1 === r2 && r2 === r3) {
      const sym = REEL_SYMBOLS.find(s => s.char === r1);
      multiplier = sym ? sym.mult : 5;
      winMsg = `JACKPOT! Three ${sym?.name || 'matching'} symbols!`;
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      const matched = (r1 === r2 || r1 === r3) ? r1 : r2;
      const sym = REEL_SYMBOLS.find(s => s.char === matched);
      multiplier = sym ? Math.max(1.5, Math.round(sym.mult / 3)) : 1.5;
      winMsg = `Nice! Double ${sym?.name || 'matching'} symbols!`;
    }

    if (multiplier > 0) {
      const payout = Math.round(bet * multiplier);
      onUpdateChips(payout);
      setLastWin(payout);
      playSound('win');
      triggerAlert(`🎰 ${winMsg} Won ${payout} Chips!`, 'success');
      
      if (payout >= 150) {
        onUpdateTask('win_big', 1);
      }

      setSpinHistory(prev => [
        `🏆 Won +${payout} Chips (${r1}${r2}${r3})`,
        ...prev
      ].slice(0, 5));

      // Celebration voice readout
      if ('speechSynthesis' in window && !muted) {
        try {
          const u = new SpeechSynthesisUtterance(`Big win! You received ${payout} chips.`);
          u.volume = 0.3;
          u.pitch = 1.1;
          window.speechSynthesis.speak(u);
        } catch (e) {}
      }
    } else {
      setLastWin(0);
      playSound('lose');
      triggerAlert('Reels settled. Better luck on the next pull!', 'info');
      setSpinHistory(prev => [
        `❌ Lost (${r1}${r2}${r3})`,
        ...prev
      ].slice(0, 5));
    }

    setSpinning(false);
  };

  const adjustBet = (amount: number) => {
    if (spinning) return;
    setBet(prev => Math.max(5, prev + amount));
  };

  return (
    <div className="bg-[#0b0b1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative backing glow */}
      <div className="absolute top-0 right-0 w-52 h-52 bg-gradient-to-tr from-amber-500/10 to-yellow-500/5 rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Header Panel */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black uppercase font-mono tracking-widest px-3 py-1 rounded-full shadow-lg">
            Las Vegas Golden Reels
          </span>
          <h3 className="text-xl font-black tracking-tight text-white mt-2 flex items-center gap-2">
            🎰 Vegas Golden Reels
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">Classic 3-drum mechanical slot simulator with staggered stops</p>
        </div>

        <div className="flex gap-2">
          {/* Audio speaker toggle button */}
          <button
            onClick={() => setMuted(!muted)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all"
            title={muted ? 'Unmute Audio FX' : 'Mute Audio FX'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />}
          </button>

          <button
            onClick={() => setShowPaytable(!showPaytable)}
            className="p-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all text-xs flex items-center gap-1.5 font-mono font-bold"
            title="View Paytable Rules"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>PAYTABLE</span>
          </button>
        </div>
      </div>

      {/* Elegant Paytable Overlay */}
      <AnimatePresence>
        {showPaytable && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-black/40 border border-amber-400/20 rounded-2xl text-xs space-y-2 text-white/80 backdrop-blur-md">
              <div className="flex justify-between font-black border-b border-white/10 pb-1 text-amber-400">
                <span>Symbol Stack</span>
                <span>Payout (3 of a kind)</span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 font-mono text-[11px] pt-1.5">
                {REEL_SYMBOLS.map(sym => (
                  <React.Fragment key={sym.char}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{sym.char}</span>
                      <span className="font-bold text-white/80">{sym.name}</span>
                    </div>
                    <div className="text-right text-emerald-400 font-extrabold">{sym.mult}x Wager</div>
                  </React.Fragment>
                ))}
              </div>
              <p className="text-[9px] text-white/40 pt-2 border-t border-white/5 leading-relaxed">
                * Note: Matching double symbols (2 identical drums) award a consolidated multiplier calculated as roughly 1/3 of the 3-of-a-kind payout!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slots Physical Cabinet Frame */}
      <div className="bg-[#050510] border-2 border-zinc-800 rounded-3xl p-5 shadow-[inset_0_4px_20px_rgba(0,0,0,0.9),0_10px_30px_rgba(0,0,0,0.5)] relative flex items-center justify-between gap-5 overflow-hidden">
        
        {/* Payline Indicators on left & right margins without physical neon dots */}
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
          <span className="text-[7px] font-mono font-black text-white/30 tracking-wider rotate-180 write-vertical">WINLINE</span>
        </div>
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
          <span className="text-[7px] font-mono font-black text-white/30 tracking-wider write-vertical">WINLINE</span>
        </div>

        {/* 3 Mechanical drum reels */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm relative bg-[#04040a] p-3 rounded-2xl border border-white/5 shadow-inner">
          
          {/* Glowing central WINLINE bar background */}
          <div className="absolute inset-x-0 top-[37%] h-20 bg-amber-400/5 border-y border-dashed border-amber-400/20 pointer-events-none z-10 flex items-center justify-between px-2">
            <span className="text-[6px] font-bold text-amber-400/30 font-mono tracking-widest">PAYLINE</span>
            <span className="text-[6px] font-bold text-amber-400/30 font-mono tracking-widest">PAYLINE</span>
          </div>

          {reels.map((reelSymbols, reelIdx) => (
            <div
              key={reelIdx}
              className="bg-[#0f0f26]/80 border border-white/5 rounded-xl h-[170px] flex flex-col items-center justify-between py-2 relative overflow-hidden shadow-[inset_0_4px_15px_rgba(0,0,0,0.85)] select-none"
            >
              {/* Spherical top/bottom cylinder shading */}
              <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#04040a] to-transparent pointer-events-none z-10" />
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#04040a] to-transparent pointer-events-none z-10" />

              {/* Ticker reels column items */}
              {reelsSpinning[reelIdx] ? (
                <div className="flex flex-col items-center animate-reel-scroll filter blur-[2px] h-[340px] w-full justify-around select-none">
                  {SPINNING_SYMBOLS.map((sym, idx) => (
                    <div key={idx} className="flex items-center justify-center h-12 text-4xl">
                      {sym}
                    </div>
                  ))}
                </div>
              ) : (
                reelSymbols.map((symbol, symbolIdx) => {
                  const isMiddle = symbolIdx === 1;
                  return (
                    <motion.div
                      key={`${reelIdx}-${symbolIdx}`}
                      initial={{ y: -15, opacity: isMiddle ? 1 : 0.25 }}
                      animate={{ y: 0, opacity: isMiddle ? 1 : 0.25, scale: isMiddle ? 1.2 : 0.8 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                      className={`flex items-center justify-center h-12 transition-all ${
                        isMiddle 
                          ? 'font-black filter drop-shadow-[0_2px_10px_rgba(251,191,36,0.35)] relative z-20 scale-110' 
                          : 'blur-[0.5px] scale-90'
                      }`}
                    >
                      <span className="text-4xl">{symbol}</span>
                    </motion.div>
                  );
                })
              )}
            </div>
          ))}
        </div>

        {/* Physical Mechanical Lever Arm widget */}
        <div className="hidden sm:flex flex-col items-center justify-center w-12 h-[170px] relative bg-black/40 rounded-2xl border border-white/5 p-1 flex-shrink-0">
          <div className="absolute top-4 bottom-4 w-1 bg-zinc-800 rounded-full border border-zinc-700 shadow-inner" />
          
          {/* Handle pivot base */}
          <div className="absolute bottom-4 w-6 h-4 bg-zinc-700 border border-zinc-600 rounded-md z-10" />

          {/* Lever handle shaft and knob */}
          <motion.div
            animate={leverPulled ? { y: [0, 85, 0] } : { y: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center origin-bottom cursor-pointer z-20"
            onClick={handleSpin}
          >
            {/* Glossy red ball knob */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 border border-red-700 shadow-[0_0_12px_rgba(239,68,68,0.6)] active:scale-90 transition-transform" />
            {/* Metallic handle rod */}
            <div className="w-1.5 h-16 bg-gradient-to-r from-zinc-400 via-zinc-200 to-zinc-500 border-x border-zinc-600 rounded-b-md shadow-md" />
          </motion.div>
          <span className="absolute bottom-1.5 text-[6px] font-mono text-white/30 tracking-widest uppercase font-black">PULL</span>
        </div>
      </div>

      {/* Outcome Banner */}
      <div className="mt-4 text-center min-h-[44px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {lastWin !== null && (
            <motion.div
              key={lastWin}
              initial={{ scale: 0.9, opacity: 0, y: 5 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -5 }}
              className={`px-5 py-2 rounded-2xl text-xs font-mono font-bold border ${
                lastWin > 0 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-white/5 border-white/5 text-white/30'
              }`}
            >
              {lastWin > 0 ? (
                <span className="flex items-center gap-2 justify-center">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400 animate-bounce" /> 
                  WINNER! Received +{lastWin} Chips!
                </span>
              ) : (
                <span className="flex items-center gap-1.5 justify-center">
                  House Kept Wager. Spin again!
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Activity Log Panel */}
      {spinHistory.length > 0 && (
        <div className="mt-4 bg-black/20 rounded-xl p-3 border border-white/5 text-center">
          <span className="block text-[8px] font-mono text-white/30 uppercase tracking-widest font-black mb-2">
            Reel Outcome Log
          </span>
          <div className="flex gap-1.5 justify-center flex-wrap">
            {spinHistory.map((hist, idx) => (
              <span 
                key={idx} 
                className="px-2 py-0.5 bg-white/5 border border-white/10 text-white/70 font-mono text-[9px] rounded-lg font-bold shadow-sm"
              >
                {hist}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Betting Controls Dashboard */}
      <div className="mt-5 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Wager Chips
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustBet(-10)}
                disabled={spinning || bet <= 10}
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                -10
              </button>
              <span className="w-16 text-center font-mono font-black text-amber-400 text-sm flex items-center justify-center gap-0.5">
                <Coins className="w-3.5 h-3.5" />
                {bet}
              </span>
              <button
                onClick={() => adjustBet(10)}
                disabled={spinning || bet >= 500}
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                +10
              </button>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1 font-bold">
              Potential Jackpot
            </span>
            <div className="text-[11px] text-white/60 font-medium">
              Up To <span className="text-emerald-400 font-mono font-black">{(bet * 50)}</span> chips
            </div>
          </div>
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          type="button"
          className={`w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer ${
            spinning ? 'brightness-75 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
          {spinning ? 'PULLING HANDLE...' : 'SPIN THE REELS'}
        </button>
      </div>
    </div>
  );
};
