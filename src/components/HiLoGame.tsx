import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, Trophy, Sparkles, HelpCircle, ArrowUp, ArrowDown, LogOut, Check, X, RefreshCw } from 'lucide-react';

interface HiLoGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface Card {
  value: number; // 2 to 14 (Jack=11, Queen=12, King=13, Ace=14)
  suit: 'H' | 'D' | 'C' | 'S'; // Hearts, Diamonds, Clubs, Spades
  label: string;
}

// Sound effects generator for high-fidelity immersion
class HiLoAudio {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCardFlip() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Swoosh noise
      const bufferSize = this.ctx.sampleRate * 0.12; // 120ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.1);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  playSuccess() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, now); // E4
      osc.frequency.setValueAtTime(440, now + 0.08); // A4
      osc.frequency.setValueAtTime(554, now + 0.16); // C#5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playError() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.25);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playShuffle() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Quick sequence of tiny swooshes
      for (let j = 0; j < 4; j++) {
        const timeOffset = j * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200 + j * 50, now + timeOffset);
        gain.gain.setValueAtTime(0.03, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.07);
      }
    } catch (e) {}
  }
}

const SUITS: Card['suit'][] = ['H', 'D', 'C', 'S'];
const VALUES = [
  { val: 2, label: '2' },
  { val: 3, label: '3' },
  { val: 4, label: '4' },
  { val: 5, label: '5' },
  { val: 6, label: '6' },
  { val: 7, label: '7' },
  { val: 8, label: '8' },
  { val: 9, label: '9' },
  { val: 10, label: '10' },
  { val: 11, label: 'J' },
  { val: 12, label: 'Q' },
  { val: 13, label: 'K' },
  { val: 14, label: 'A' },
];

export const HiLoGame: React.FC<HiLoGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [nextCard, setNextCard] = useState<Card | null>(null);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [guessHistory, setGuessHistory] = useState<Card[]>([]);
  const [isWrongGuess, setIsWrongGuess] = useState<boolean>(false);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [stats, setStats] = useState({ roundsPlayed: 0, highestWin: 0 });

  const audioRef = useRef<HiLoAudio | null>(null);

  useEffect(() => {
    audioRef.current = new HiLoAudio();
  }, []);

  const generateRandomCard = (excludeCard?: Card | null): Card => {
    let randVal = VALUES[Math.floor(Math.random() * VALUES.length)];
    let randSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
    
    // Ensure we don't draw the exact same card in sequence
    while (excludeCard && excludeCard.value === randVal.val && excludeCard.suit === randSuit) {
      randVal = VALUES[Math.floor(Math.random() * VALUES.length)];
      randSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
    }

    return {
      value: randVal.val,
      suit: randSuit,
      label: randVal.label,
    };
  };

  // Trigger deck initial shuffle and begin round
  const handleStartGame = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to place this Hi-Lo duel wager!', 'error');
      return;
    }

    // Initialize state
    onUpdateChips(-betAmount);
    setGameActive(true);
    setIsWrongGuess(false);
    setMultiplier(1.0);
    setGuessHistory([]);
    
    const cardOne = generateRandomCard();
    setCurrentCard(cardOne);
    setNextCard(null);

    if (audioRef.current) {
      audioRef.current.playShuffle();
    }
  };

  // Compute probability based multipliers
  // Returns { higherMultiplier, lowerMultiplier }
  const getGuessMultipliers = (card: Card) => {
    const val = card.value;
    // Total values count is 13 (2 to 14)
    // Cards below: val - 2
    // Cards above: 14 - val
    // Equal cards: 1 (not counted in Hi/Lo, usually a push or low percentage loss)
    const totalCards = 13;
    const cardsBelow = val - 2;
    const cardsAbove = 14 - val;

    // Standard house edge coefficient (e.g. 96.5% RTP payout)
    const houseEdge = 0.965;

    // Multiplier = (Total Options / Favorable Options) * RTP
    const rawHigher = cardsAbove > 0 ? (totalCards / cardsAbove) : 15;
    const rawLower = cardsBelow > 0 ? (totalCards / cardsBelow) : 15;

    // Apply soft caps and clean decimal rounding
    const cleanMult = (raw: number) => {
      const result = raw * houseEdge;
      if (result < 1.05) return 1.05;
      if (result > 15) return 15.0;
      return Math.round(result * 100) / 100;
    };

    return {
      higher: cleanMult(rawHigher),
      lower: cleanMult(rawLower)
    };
  };

  const { higher: multHigher, lower: multLower } = currentCard 
    ? getGuessMultipliers(currentCard) 
    : { higher: 1.5, lower: 1.5 };

  // Playguess selection handler
  const handleGuess = (direction: 'HIGH' | 'LOW') => {
    if (!currentCard || isFlipping || isWrongGuess) return;

    setIsFlipping(true);
    if (audioRef.current) audioRef.current.playCardFlip();

    const next = generateRandomCard(currentCard);
    setNextCard(next);

    setTimeout(() => {
      let isCorrect = false;

      if (direction === 'HIGH') {
        isCorrect = next.value >= currentCard.value;
      } else {
        isCorrect = next.value <= currentCard.value;
      }

      if (isCorrect) {
        if (audioRef.current) audioRef.current.playSuccess();
        
        // Accumulate multiplier
        const stepMultiplier = direction === 'HIGH' ? multHigher : multLower;
        const newMultiplier = Math.round(multiplier * stepMultiplier * 100) / 100;
        setMultiplier(newMultiplier);
        
        // Add to history
        setGuessHistory(prev => [...prev, currentCard]);
        setCurrentCard(next);
        setNextCard(null);

        onUpdateTask('win_high_odds', 1); // Track streaks towards task
      } else {
        if (audioRef.current) audioRef.current.playError();
        setIsWrongGuess(true);
        triggerAlert(`Aww! Card was a ${next.label}. You lost the active Hi-Lo chain!`, 'error');
      }

      setIsFlipping(false);
    }, 600);
  };

  // Safe Cashout payout collector
  const handleCashout = () => {
    if (!gameActive || isWrongGuess || !currentCard) return;

    const payout = Math.round(betAmount * multiplier);
    
    // Save record stats
    setStats(prev => ({
      roundsPlayed: prev.roundsPlayed + 1,
      highestWin: Math.max(prev.highestWin, payout)
    }));
    setBestStreak(prev => Math.max(prev, guessHistory.length));

    // Credit chips back
    onUpdateChips(payout);
    onUpdateTask('casino_wager', betAmount);

    triggerAlert(`CASHOUT SUCCESS! Recouped ${multiplier}x Multiplier. Recieved +${payout} Chips! 🎉`, 'success');

    // Reset game room state
    setGameActive(false);
  };

  const getSuitSymbol = (suit: Card['suit']) => {
    switch (suit) {
      case 'H': return '♥';
      case 'D': return '♦';
      case 'C': return '♣';
      case 'S': return '♠';
    }
  };

  const getSuitColor = (suit: Card['suit']) => {
    return (suit === 'H' || suit === 'D') ? 'text-red-500' : 'text-slate-300';
  };

  const setBetMax = () => {
    setBetAmount(Math.min(chips, 1000));
  };

  const doubleBet = () => {
    setBetAmount(prev => Math.min(chips, prev * 2));
  };

  const halveBet = () => {
    setBetAmount(prev => Math.max(10, Math.round(prev / 2)));
  };

  return (
    <div id="hilo-card-duel" className="bg-[#0b0c24]/80 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Visual Backing Accent Overlays */}
      <div className="absolute top-[-80px] right-[-80px] w-48 h-48 bg-red-500/10 rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-48 h-48 bg-purple-500/10 rounded-full blur-[70px] pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-500/20 text-red-500 flex items-center justify-center shadow-lg shadow-red-500/5">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white uppercase font-sans">Hi-Lo Card Duel</h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Prediction Streak Arena</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60">
            Consecutive Flips: <span className="font-bold text-amber-400">{guessHistory.length}</span>
          </div>
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60">
            Best Streak: <span className="font-bold text-white">{bestStreak}</span>
          </div>
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> High Win: <span className="font-bold text-amber-400">{stats.highestWin} 💰</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_2fr] gap-8 items-stretch">
        
        {/* Left Interactive Side Menu */}
        <div className="space-y-6 flex flex-col justify-between">
          
          <div className="space-y-4">
            
            {/* Bet Setup input field */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-white/60 uppercase font-bold tracking-wide">Place Round Wager</span>
                <span className="text-[10px] text-white/30 font-mono">Min: 10 | Max: 1,000</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2 transition-colors">
                <Coins className="w-5 h-5 text-amber-400" />
                <input
                  type="number"
                  disabled={gameActive}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(10, Math.min(chips, parseInt(e.target.value) || 10)))}
                  className="bg-transparent border-none outline-none text-white font-mono font-black text-lg flex-1 min-w-0 disabled:opacity-50"
                />
                {!gameActive && (
                  <div className="flex items-center gap-1">
                    <button onClick={halveBet} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-white/5 hover:bg-white/10 rounded border border-white/5 transition-all cursor-pointer">½</button>
                    <button onClick={doubleBet} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-white/5 hover:bg-white/10 rounded border border-white/5 transition-all cursor-pointer">2x</button>
                    <button onClick={setBetMax} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded border border-red-500/20 transition-all cursor-pointer">Max</button>
                  </div>
                )}
              </div>
            </div>

            {/* Current Multiplier Metrics Display */}
            {gameActive && (
              <div className="bg-[#1a1128]/60 border border-purple-500/20 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                <span className="text-[9px] font-mono uppercase text-purple-400 font-bold tracking-widest">Active Payout Pool</span>
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">{multiplier}x</span>
                  <span className="text-lg font-black text-white/80 font-mono">+{Math.round(betAmount * multiplier)} chips</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: `${Math.min(100, guessHistory.length * 15)}%` }} />
                </div>
              </div>
            )}

            {/* Micro Rules Guidelines Box */}
            <div className="bg-red-400/5 p-4 rounded-2xl border border-red-400/10 text-[11px] text-white/50 leading-relaxed space-y-1">
              <h5 className="font-bold text-white flex items-center gap-1.5 font-sans uppercase text-[10px] tracking-wider text-red-400">
                <HelpCircle className="w-3.5 h-3.5" /> Duel Strategies
              </h5>
              <p>
                Multipliers scale dynamically according to draw probabilities! For example, guessing "Higher" on a 3 yields a low multiplier, while guessing "Lower" yields massive returns. Aces are high (14), Twos are low (2). Ties are correct wins!
              </p>
            </div>

          </div>

          {/* Core Interactive Action Buttons Section */}
          <div className="space-y-2 mt-4">
            {!gameActive ? (
              <button
                onClick={handleStartGame}
                disabled={chips < betAmount}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-amber-500 text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-red-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Initialize Deck Duel
              </button>
            ) : isWrongGuess ? (
              <button
                onClick={handleStartGame}
                disabled={chips < betAmount}
                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs tracking-widest uppercase transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Deal New Hand
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCashout}
                  className="py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-widest uppercase transition-all shadow-md cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" /> Cashout Pool
                </button>
                <button
                  onClick={() => {
                    setGameActive(false);
                    setIsWrongGuess(false);
                  }}
                  className="py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5 text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer active:scale-98"
                >
                  Forfeit Hand
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Graphic Duel Arena */}
        <div className="bg-[#050516]/60 border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-6 items-center min-h-[380px]">
          
          <div className="w-full flex justify-between items-center px-2">
            <span className="text-[9px] font-mono uppercase text-white/30 tracking-wider">Hi-Lo Match Deck</span>
            {gameActive && !isWrongGuess && (
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-400/5 px-2 py-0.5 rounded-full border border-emerald-500/10">Round is live</span>
            )}
            {isWrongGuess && (
              <span className="text-[10px] font-mono text-red-400 font-bold bg-red-400/5 px-2 py-0.5 rounded-full border border-red-500/10">Busted</span>
            )}
          </div>

          {/* Interactive Card Board Arena */}
          <div className="flex items-center justify-center gap-8 w-full">
            <AnimatePresence mode="wait">
              {/* CURRENT CARD CONTAINER */}
              {currentCard ? (
                <motion.div
                  key={currentCard.label + currentCard.suit}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="relative w-36 h-52 bg-gradient-to-br from-white to-slate-100 rounded-2xl shadow-xl shadow-black/60 p-4 flex flex-col justify-between text-black cursor-default select-none border-t border-x border-white/80"
                >
                  {/* Card Corner Index */}
                  <div className="flex flex-col items-center justify-start self-start">
                    <span className="text-xl font-black font-sans leading-none">{currentCard.label}</span>
                    <span className={`text-base leading-none ${getSuitColor(currentCard.suit)}`}>
                      {getSuitSymbol(currentCard.suit)}
                    </span>
                  </div>

                  {/* Huge Central Suit Watermark */}
                  <div className={`text-6xl self-center font-bold select-none opacity-95 ${getSuitColor(currentCard.suit)}`}>
                    {getSuitSymbol(currentCard.suit)}
                  </div>

                  {/* Reversed Bottom Index */}
                  <div className="flex flex-col items-center justify-start self-end rotate-180">
                    <span className="text-xl font-black font-sans leading-none">{currentCard.label}</span>
                    <span className={`text-base leading-none ${getSuitColor(currentCard.suit)}`}>
                      {getSuitSymbol(currentCard.suit)}
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* Empty Card Placement Slot */
                <div className="w-36 h-52 rounded-2xl border border-white/5 border-dashed bg-white/2 flex items-center justify-center text-white/10 font-mono text-xs">
                  Place wager...
                </div>
              )}
            </AnimatePresence>

            {/* DUAL DECISION BUTTONS COMPONENT */}
            {gameActive && !isWrongGuess && (
              <div className="flex flex-col gap-3">
                
                {/* HIGHER OPTION BUTTON */}
                <button
                  onClick={() => handleGuess('HIGH')}
                  className="w-28 py-4 rounded-2xl bg-white/5 hover:bg-amber-400 group border border-white/10 hover:border-amber-400 text-white hover:text-black flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md hover:shadow-amber-400/10"
                >
                  <ArrowUp className="w-5 h-5 text-amber-500 group-hover:text-black transition-colors animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-wider font-sans leading-none">Higher</span>
                  <span className="text-[9px] font-mono opacity-60 leading-none">{multHigher}x</span>
                </button>

                {/* LOWER OPTION BUTTON */}
                <button
                  onClick={() => handleGuess('LOW')}
                  className="w-28 py-4 rounded-2xl bg-white/5 hover:bg-red-500 group border border-white/10 hover:border-red-500 text-white hover:text-white flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md hover:shadow-red-500/10"
                >
                  <ArrowDown className="w-5 h-5 text-red-500 group-hover:text-white transition-colors animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-wider font-sans leading-none">Lower</span>
                  <span className="text-[9px] font-mono opacity-60 leading-none">{multLower}x</span>
                </button>

              </div>
            )}
          </div>

          {/* Historical Round Streak Tracker log */}
          <div className="w-full bg-[#050516]/60 border border-white/5 rounded-2xl p-3 flex items-center gap-3 overflow-x-auto scrollbar-none min-h-[50px]">
            <span className="text-[9px] font-mono uppercase text-white/30 tracking-wider shrink-0">Previous cards:</span>
            {guessHistory.length === 0 ? (
              <span className="text-[10px] text-white/25 font-mono">No card draws recorded...</span>
            ) : (
              <div className="flex gap-2 items-center">
                {guessHistory.map((h, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.5, opacity: 0, x: -10 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    className="flex items-center bg-white px-2 py-0.5 rounded border border-white/10 text-black text-[10px] font-mono font-bold select-none"
                  >
                    <span>{h.label}</span>
                    <span className={`text-[11px] font-bold ${getSuitColor(h.suit)} ml-0.5`}>
                      {getSuitSymbol(h.suit)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
