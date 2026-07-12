import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, Trophy, Sparkles, HelpCircle, LogOut, Check, X, RefreshCw, Layers, Zap } from 'lucide-react';

interface BlackjackGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface Card {
  value: number; // 1 to 11 for score calculation
  faceValue: number; // 1 (Ace) to 13 (King)
  suit: 'H' | 'D' | 'C' | 'S'; // Hearts, Diamonds, Clubs, Spades
  label: string;
}

// Low-overhead web audio synthesizer for high-fidelity mechanical and winning blackjack sounds
class BlackjackAudio {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCardDraw() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.1; // 100ms card slide
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.1);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  playWin() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Joyful arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        gain.gain.setValueAtTime(0.06, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.22);
      });
    } catch (e) {}
  }

  playLose() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  playPush() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(220, now + 0.15);

      gain.gain.setValueAtTime(0.05, now);
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
      for (let j = 0; j < 5; j++) {
        const timeOffset = j * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180 + j * 30, now + timeOffset);
        gain.gain.setValueAtTime(0.04, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.06);
      }
    } catch (e) {}
  }
}

const SUITS: Card['suit'][] = ['H', 'D', 'C', 'S'];
const CARD_DEFINITIONS = [
  { face: 1, label: 'A', val: 11 },
  { face: 2, label: '2', val: 2 },
  { face: 3, label: '3', val: 3 },
  { face: 4, label: '4', val: 4 },
  { face: 5, label: '5', val: 5 },
  { face: 6, label: '6', val: 6 },
  { face: 7, label: '7', val: 7 },
  { face: 8, label: '8', val: 8 },
  { face: 9, label: '9', val: 9 },
  { face: 10, label: '10', val: 10 },
  { face: 11, label: 'J', val: 10 },
  { face: 12, label: 'Q', val: 10 },
  { face: 13, label: 'K', val: 10 },
];

export const BlackjackGame: React.FC<BlackjackGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [isDealerTurn, setIsDealerTurn] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<'WIN' | 'LOSE' | 'PUSH' | 'BLACKJACK' | null>(null);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [stats, setStats] = useState({ roundsPlayed: 0, highestWin: 0 });

  const audioRef = useRef<BlackjackAudio | null>(null);

  useEffect(() => {
    audioRef.current = new BlackjackAudio();
  }, []);

  const generateCard = (): Card => {
    const def = CARD_DEFINITIONS[Math.floor(Math.random() * CARD_DEFINITIONS.length)];
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    return {
      value: def.val,
      faceValue: def.face,
      suit,
      label: def.label,
    };
  };

  // Sum hand values taking Aces into account
  const calculateScore = (hand: Card[]): number => {
    let score = hand.reduce((sum, card) => sum + card.value, 0);
    let aces = hand.filter(card => card.faceValue === 1).length;

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }
    return score;
  };

  const startNewRound = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to place this Blackjack wager!', 'error');
      return;
    }

    if (audioRef.current) audioRef.current.playShuffle();

    // Deduct wager
    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);

    const p1 = generateCard();
    const d1 = generateCard();
    const p2 = generateCard();
    const d2 = generateCard();

    const initialPlayer = [p1, p2];
    const initialDealer = [d1, d2];

    setPlayerHand(initialPlayer);
    setDealerHand(initialDealer);
    setIsDealerTurn(false);
    setGameResult(null);
    setIsPlaying(true);

    const playerScore = calculateScore(initialPlayer);
    if (playerScore === 21) {
      // Natural Blackjack!
      handleStand(initialPlayer, initialDealer);
    }
  };

  const handleHit = () => {
    if (!isPlaying || isDealerTurn) return;

    if (audioRef.current) audioRef.current.playCardDraw();

    const newCard = generateCard();
    const nextHand = [...playerHand, newCard];
    setPlayerHand(nextHand);

    const score = calculateScore(nextHand);
    if (score > 21) {
      // Busted instantly!
      resolveRound(nextHand, dealerHand, true);
    }
  };

  const handleStand = (pHand = playerHand, dHand = dealerHand) => {
    if (!isPlaying || isDealerTurn) return;

    setIsDealerTurn(true);

    // Dealer artificial action loop: hit on soft 17s
    let currentDealerHand = [...dHand];
    let dealerScore = calculateScore(currentDealerHand);

    const interval = setInterval(() => {
      if (dealerScore < 17) {
        if (audioRef.current) audioRef.current.playCardDraw();
        const nextCard = generateCard();
        currentDealerHand.push(nextCard);
        dealerScore = calculateScore(currentDealerHand);
        setDealerHand([...currentDealerHand]);
      } else {
        clearInterval(interval);
        resolveRound(pHand, currentDealerHand, false);
      }
    }, 700);
  };

  const handleDoubleDown = () => {
    if (!isPlaying || isDealerTurn || playerHand.length !== 2) return;

    if (chips < betAmount) {
      triggerAlert('Insufficient chips to double down!', 'error');
      return;
    }

    // Deduct additional wager
    onUpdateChips(-betAmount);

    if (audioRef.current) audioRef.current.playCardDraw();
    const newCard = generateCard();
    const nextPlayerHand = [...playerHand, newCard];
    setPlayerHand(nextPlayerHand);

    const score = calculateScore(nextPlayerHand);
    if (score > 21) {
      resolveRound(nextPlayerHand, dealerHand, true, true);
    } else {
      // Dealer plays their turn immediately
      setIsDealerTurn(true);
      let currentDealerHand = [...dealerHand];
      let dealerScore = calculateScore(currentDealerHand);

      const interval = setInterval(() => {
        if (dealerScore < 17) {
          if (audioRef.current) audioRef.current.playCardDraw();
          const nextCard = generateCard();
          currentDealerHand.push(nextCard);
          dealerScore = calculateScore(currentDealerHand);
          setDealerHand([...currentDealerHand]);
        } else {
          clearInterval(interval);
          resolveRound(nextPlayerHand, currentDealerHand, false, true);
        }
      }, 700);
    }
  };

  const resolveRound = (pHand: Card[], dHand: Card[], playerBusted: boolean, isDoubled = false) => {
    setIsPlaying(false);
    const pScore = calculateScore(pHand);
    const dScore = calculateScore(dHand);
    const roundWager = isDoubled ? betAmount * 2 : betAmount;

    let result: 'WIN' | 'LOSE' | 'PUSH' | 'BLACKJACK' = 'LOSE';

    if (playerBusted) {
      result = 'LOSE';
    } else if (dScore > 21) {
      result = 'WIN';
    } else if (pScore > dScore) {
      // Check for Natural blackjack payout
      result = (pHand.length === 2 && pScore === 21) ? 'BLACKJACK' : 'WIN';
    } else if (pScore < dScore) {
      result = 'LOSE';
    } else {
      result = 'PUSH';
    }

    setGameResult(result);

    // Calculate payouts
    let payout = 0;
    if (result === 'WIN') {
      payout = roundWager * 2;
      if (audioRef.current) audioRef.current.playWin();
      setCurrentStreak(prev => {
        const next = prev + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
      onUpdateChips(payout);
      onUpdateTask('win_high_odds', 1);
      triggerAlert(`YOU WON! Hand scored ${pScore} against dealer's ${dScore}. Received +${payout} Chips!`, 'success');
    } else if (result === 'BLACKJACK') {
      payout = Math.round(roundWager * 2.5); // 3:2 payout on blackjack
      if (audioRef.current) audioRef.current.playWin();
      setCurrentStreak(prev => {
        const next = prev + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
      onUpdateChips(payout);
      onUpdateTask('win_high_odds', 1);
      triggerAlert(`NATURAL BLACKJACK! Payout ratio 3:2. Received +${payout} Chips! 🎉`, 'success');
    } else if (result === 'PUSH') {
      payout = roundWager;
      if (audioRef.current) audioRef.current.playPush();
      triggerAlert(`PUSH! Scores tied at ${pScore}. Reclaimed wager chips.`, 'info');
      onUpdateChips(payout);
    } else {
      if (audioRef.current) audioRef.current.playLose();
      setCurrentStreak(0);
      triggerAlert(`DEALER WINS! Scoring ${dScore} vs your ${pScore}. Better luck next hand!`, 'info');
    }

    setStats(prev => ({
      roundsPlayed: prev.roundsPlayed + 1,
      highestWin: Math.max(prev.highestWin, payout)
    }));
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

  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  // While player is active, hide Dealer's downcard from score calculation
  const displayedDealerScore = isDealerTurn || !isPlaying
    ? dealerScore
    : (dealerHand.length > 0 ? calculateScore([dealerHand[0]]) : 0);

  return (
    <div id="blackjack-duel-lobby" className="bg-[#0b0c24]/80 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Visual background overlays */}
      <div className="absolute top-[-90px] left-[20%] w-56 h-56 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-90px] right-[20%] w-56 h-56 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-400/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/5">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white uppercase font-sans">Classic Blackjack</h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Beat the Dealer at 21</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60">
            Active Streak: <span className="font-bold text-purple-400">{currentStreak}</span>
          </div>
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60">
            Best Streak: <span className="font-bold text-white">{bestStreak}</span>
          </div>
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> High Win: <span className="font-bold text-emerald-400">{stats.highestWin} 💰</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_2fr] gap-8 items-stretch">
        
        {/* Left Hand: Controls & Bet Placement */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Wager Desk */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-white/60 uppercase font-bold tracking-wide">Deal Wager</span>
                <span className="text-[10px] text-white/30 font-mono">Min: 10 | Max: 1,000</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <input
                  type="number"
                  disabled={isPlaying}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(10, Math.min(chips, parseInt(e.target.value) || 10)))}
                  className="bg-transparent border-none outline-none text-white font-mono font-black text-lg flex-1 min-w-0 disabled:opacity-50"
                />
                {!isPlaying && (
                  <div className="flex items-center gap-1">
                    <button onClick={halveBet} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">½</button>
                    <button onClick={doubleBet} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">2x</button>
                    <button onClick={setBetMax} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded border border-purple-500/20 transition-all cursor-pointer">Max</button>
                  </div>
                )}
              </div>
            </div>

            {/* Game instructions */}
            <div className="bg-purple-400/5 p-4 rounded-2xl border border-purple-500/10 text-[11px] text-white/50 leading-relaxed space-y-1.5">
              <h5 className="font-bold text-white flex items-center gap-1.5 font-sans uppercase text-[10px] tracking-wider text-purple-400">
                <HelpCircle className="w-3.5 h-3.5" /> Vegas 21 Rules
              </h5>
              <p>
                Get your cards as close to **21** as possible without going over. Aces count as 1 or 11. Dealer must hit on soft 17. Natural blackjack payouts pay **3:2**!
              </p>
            </div>

          </div>

          {/* Action buttons */}
          <div className="space-y-2.5 mt-4">
            {!isPlaying ? (
              <button
                onClick={startNewRound}
                disabled={chips < betAmount}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-purple-500/25 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Deal New Hand
              </button>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleHit}
                    disabled={playerScore >= 21}
                    className="py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs tracking-widest uppercase transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    Hit
                  </button>
                  <button
                    onClick={() => handleStand()}
                    className="py-3.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-black text-xs tracking-widest uppercase transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    Stand
                  </button>
                </div>
                {playerHand.length === 2 && chips >= betAmount && (
                  <button
                    onClick={handleDoubleDown}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs tracking-widest uppercase transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 fill-current animate-bounce" /> Double Down
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Hand: Dual Hands Board Arena */}
        <div className="bg-[#050516]/60 border border-white/5 rounded-3xl p-6 flex flex-col justify-between gap-6 min-h-[400px]">
          
          {/* DEALER'S HAND CONTAINER */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Dealer's Hand</span>
              {dealerHand.length > 0 && (
                <span className="text-xs font-mono font-black text-purple-400 bg-purple-400/5 px-2.5 py-0.5 rounded-full border border-purple-500/15">
                  Score: {displayedDealerScore}
                </span>
              )}
            </div>

            <div className="flex gap-3 min-h-[140px] items-center justify-start overflow-x-auto py-1">
              {dealerHand.length === 0 ? (
                <div className="w-24 h-36 rounded-xl border border-white/5 border-dashed bg-white/2 flex items-center justify-center text-white/10 font-mono text-xs">
                  Awaiting...
                </div>
              ) : (
                dealerHand.map((card, idx) => {
                  const isHidden = idx === 1 && !isDealerTurn && isPlaying;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0.7, rotateY: 90, opacity: 0 }}
                      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                      className={`relative w-24 h-36 rounded-xl shadow-lg flex flex-col justify-between p-3 select-none ${
                        isHidden 
                          ? 'bg-gradient-to-br from-purple-900 to-indigo-950 border border-purple-500/30' 
                          : 'bg-gradient-to-br from-white to-slate-100 text-black border-t border-x border-white'
                      }`}
                    >
                      {isHidden ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Layers className="w-8 h-8 text-purple-400/30 animate-pulse" />
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col items-center justify-start self-start">
                            <span className="text-sm font-black font-sans leading-none">{card.label}</span>
                            <span className={`text-xs leading-none ${getSuitColor(card.suit)}`}>
                              {getSuitSymbol(card.suit)}
                            </span>
                          </div>

                          <div className={`text-3xl self-center font-bold select-none ${getSuitColor(card.suit)}`}>
                            {getSuitSymbol(card.suit)}
                          </div>

                          <div className="flex flex-col items-center justify-start self-end rotate-180">
                            <span className="text-sm font-black font-sans leading-none">{card.label}</span>
                            <span className={`text-xs leading-none ${getSuitColor(card.suit)}`}>
                              {getSuitSymbol(card.suit)}
                            </span>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* GAME OUTCOME BANNER */}
          <div className="relative h-6 flex items-center justify-center">
            <AnimatePresence>
              {gameResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`absolute px-5 py-1.5 rounded-full border text-xs font-black uppercase tracking-widest font-mono shadow-md z-10 ${
                    gameResult === 'WIN' || gameResult === 'BLACKJACK' ? 'bg-emerald-400/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/5' :
                    gameResult === 'PUSH' ? 'bg-amber-400/15 border-amber-500/30 text-amber-400 shadow-amber-500/5' :
                    'bg-red-400/15 border-red-500/30 text-red-400 shadow-red-500/5'
                  }`}
                >
                  {gameResult === 'BLACKJACK' ? 'NATURAL BLACKJACK! 🎉' :
                   gameResult === 'WIN' ? 'WINNER! 🏆' :
                   gameResult === 'PUSH' ? 'PUSH/DRAW 🤝' : 'BUST / HOUSE WINS! 💥'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* PLAYER'S HAND CONTAINER */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Your Hand</span>
              {playerHand.length > 0 && (
                <span className="text-xs font-mono font-black text-pink-400 bg-pink-400/5 px-2.5 py-0.5 rounded-full border border-pink-500/15">
                  Score: {playerScore} {playerScore > 21 && ' (Busted!)'}
                </span>
              )}
            </div>

            <div className="flex gap-3 min-h-[140px] items-center justify-start overflow-x-auto py-1">
              {playerHand.length === 0 ? (
                <div className="w-24 h-36 rounded-xl border border-white/5 border-dashed bg-white/2 flex items-center justify-center text-white/10 font-mono text-xs">
                  Place wager...
                </div>
              ) : (
                playerHand.map((card, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.7, rotateY: 90, opacity: 0 }}
                    animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                    className="relative w-24 h-36 rounded-xl shadow-lg bg-gradient-to-br from-white to-slate-100 text-black border-t border-x border-white flex flex-col justify-between p-3 select-none shrink-0"
                  >
                    <div className="flex flex-col items-center justify-start self-start">
                      <span className="text-sm font-black font-sans leading-none">{card.label}</span>
                      <span className={`text-xs leading-none ${getSuitColor(card.suit)}`}>
                        {getSuitSymbol(card.suit)}
                      </span>
                    </div>

                    <div className={`text-3xl self-center font-bold select-none ${getSuitColor(card.suit)}`}>
                      {getSuitSymbol(card.suit)}
                    </div>

                    <div className="flex flex-col items-center justify-start self-end rotate-180">
                      <span className="text-sm font-black font-sans leading-none">{card.label}</span>
                      <span className={`text-xs leading-none ${getSuitColor(card.suit)}`}>
                        {getSuitSymbol(card.suit)}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
