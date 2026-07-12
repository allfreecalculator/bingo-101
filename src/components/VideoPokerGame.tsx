import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, Trophy, Sparkles, HelpCircle, RefreshCw, Check, X, ShieldAlert } from 'lucide-react';

interface VideoPokerGameProps {
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

// Custom synth sounds for high-quality video poker machines
class PokerAudio {
  private ctx: AudioContext | null = null;

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCardDraw(index: number) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime + index * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400 + index * 50, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  playHold() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.06);
    } catch (e) {}
  }

  playWin(payout: number) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = payout >= 10 ? [392, 523, 659, 784, 1046] : [261, 329, 392, 523];
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.05, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.27);
      });
    } catch (e) {}
  }

  playShuffle() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      for (let j = 0; j < 6; j++) {
        const timeOffset = j * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220 + j * 40, now + timeOffset);
        gain.gain.setValueAtTime(0.03, now + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.05);
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

interface PayoutRule {
  name: string;
  multiplier: number;
  description: string;
}

const PAYOUT_RULES: PayoutRule[] = [
  { name: 'Royal Flush', multiplier: 250, description: '10-J-Q-K-A of same suit' },
  { name: 'Straight Flush', multiplier: 50, description: '5 consecutive cards of same suit' },
  { name: 'Four of a Kind', multiplier: 25, description: '4 cards of same rank' },
  { name: 'Full House', multiplier: 9, description: 'Three of a Kind & a Pair' },
  { name: 'Flush', multiplier: 6, description: '5 cards of same suit' },
  { name: 'Straight', multiplier: 4, description: '5 consecutive cards of any suit' },
  { name: 'Three of a Kind', multiplier: 3, description: '3 cards of same rank' },
  { name: 'Two Pair', multiplier: 2, description: 'Two distinct pairs' },
  { name: 'Jacks or Better', multiplier: 1, description: 'Pair of Jacks, Queens, Kings, or Aces' },
];

export const VideoPokerGame: React.FC<VideoPokerGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(10);
  const [gameState, setGameState] = useState<'IDLE' | 'DEALT' | 'RESOLVED'>('IDLE');
  const [hand, setHand] = useState<Card[]>([]);
  const [heldIndices, setHeldIndices] = useState<Set<number>>(new Set());
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [stats, setStats] = useState({ roundsPlayed: 0, highestWin: 0 });
  
  const audioRef = useRef<PokerAudio | null>(null);

  useEffect(() => {
    audioRef.current = new PokerAudio();
  }, []);

  const createDeck = (): Card[] => {
    const deck: Card[] = [];
    SUITS.forEach(suit => {
      VALUES.forEach(v => {
        deck.push({ value: v.val, suit, label: v.label });
      });
    });
    return deck;
  };

  const drawCards = (count: number, excludeList: Card[]): Card[] => {
    const deck = createDeck().filter(
      card => !excludeList.some(ex => ex.value === card.value && ex.suit === card.suit)
    );
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * deck.length);
      drawn.push(deck.splice(idx, 1)[0]);
    }
    return drawn;
  };

  const handleDeal = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to place this Video Poker wager!', 'error');
      return;
    }

    if (audioRef.current) audioRef.current.playShuffle();

    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);

    const initialDraw = drawCards(5, []);
    setHand(initialDraw);
    setHeldIndices(new Set());
    setGameResult(null);
    setGameState('DEALT');

    // Fun quick audio card draw succession
    initialDraw.forEach((_, idx) => {
      setTimeout(() => {
        if (audioRef.current && gameState === 'IDLE') {
          audioRef.current.playCardDraw(idx);
        }
      }, idx * 60);
    });
  };

  const toggleHold = (index: number) => {
    if (gameState !== 'DEALT') return;
    
    if (audioRef.current) audioRef.current.playHold();

    const next = new Set(heldIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setHeldIndices(next);
  };

  const handleDraw = () => {
    if (gameState !== 'DEALT') return;

    // Filter cards to replace
    const nextHand = [...hand];
    const keptCards = hand.filter((_, idx) => heldIndices.has(idx));
    const newDraws = drawCards(5 - heldIndices.size, keptCards);

    let drawCounter = 0;
    for (let i = 0; i < 5; i++) {
      if (!heldIndices.has(i)) {
        nextHand[i] = newDraws[drawCounter++];
        if (audioRef.current) audioRef.current.playCardDraw(i);
      }
    }

    setHand(nextHand);
    evaluateHand(nextHand);
  };

  const evaluateHand = (finalHand: Card[]) => {
    const sorted = [...finalHand].sort((a, b) => a.value - b.value);
    
    // Check groupings
    const valueCounts: { [key: number]: number } = {};
    finalHand.forEach(c => {
      valueCounts[c.value] = (valueCounts[c.value] || 0) + 1;
    });

    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const uniqueValues = Object.keys(valueCounts).length;

    // Check Flush
    const isFlush = finalHand.every(c => c.suit === finalHand[0].suit);

    // Check Straight
    let isStraight = false;
    if (uniqueValues === 5) {
      if (sorted[4].value - sorted[0].value === 4) {
        isStraight = true;
      }
      // Special Ace-Low straight (Ace=14, 2, 3, 4, 5)
      if (sorted[4].value === 14 && sorted[0].value === 2 && sorted[1].value === 3 && sorted[2].value === 4 && sorted[3].value === 5) {
        isStraight = true;
      }
    }

    let resultName = 'No Pair';
    let multiplier = 0;

    if (isFlush && isStraight) {
      if (sorted[0].value === 10 && sorted[4].value === 14) {
        resultName = 'Royal Flush';
        multiplier = 250;
      } else {
        resultName = 'Straight Flush';
        multiplier = 50;
      }
    } else if (counts[0] === 4) {
      resultName = 'Four of a Kind';
      multiplier = 25;
    } else if (counts[0] === 3 && counts[1] === 2) {
      resultName = 'Full House';
      multiplier = 9;
    } else if (isFlush) {
      resultName = 'Flush';
      multiplier = 6;
    } else if (isStraight) {
      resultName = 'Straight';
      multiplier = 4;
    } else if (counts[0] === 3) {
      resultName = 'Three of a Kind';
      multiplier = 3;
    } else if (counts[0] === 2 && counts[1] === 2) {
      resultName = 'Two Pair';
      multiplier = 2;
    } else if (counts[0] === 2) {
      // Find pair value (Jacks or Better)
      const pairVal = parseInt(Object.keys(valueCounts).find(key => valueCounts[parseInt(key)] === 2) || '0');
      if (pairVal >= 11) {
        resultName = 'Jacks or Better';
        multiplier = 1;
      }
    }

    setGameState('RESOLVED');
    setGameResult(multiplier > 0 ? resultName : 'Lose');

    const payout = betAmount * multiplier;
    if (payout > 0) {
      if (audioRef.current) audioRef.current.playWin(multiplier);
      onUpdateChips(payout);
      onUpdateTask('win_high_odds', 1);
      triggerAlert(`Video Poker WIN! Hit ${resultName} for a ${multiplier}x payout. Received +${payout} Chips! 🎉`, 'success');
    } else {
      triggerAlert(`Aww, ${resultName}! Let's try another hand!`, 'info');
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

  return (
    <div id="video-poker-arena" className="bg-[#0b0c24]/80 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Glow Effects */}
      <div className="absolute top-[-90px] right-[-90px] w-56 h-56 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-90px] left-[-90px] w-56 h-56 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/5">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white uppercase font-sans">Retro Video Poker</h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Jacks or Better draw draw arena</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60">
            Played: <span className="font-bold text-white">{stats.roundsPlayed}</span>
          </div>
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> High Payout: <span className="font-bold text-amber-400">{stats.highestWin} 💰</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_2fr] gap-8 items-start">
        
        {/* Left Hand side: Payout board & Bet controls */}
        <div className="space-y-6">
          
          {/* Payout board matrix table */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-1.5">
            <span className="block text-[10px] font-mono text-amber-400/70 uppercase tracking-widest font-bold mb-2">Jacks or Better Payout Matrix</span>
            <div className="grid grid-cols-2 text-[10px] font-mono text-white/30 border-b border-white/5 pb-1 uppercase font-bold">
              <span>Hand Combo</span>
              <span className="text-right">Multiplier</span>
            </div>
            <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
              {PAYOUT_RULES.map((rule, idx) => {
                const isActiveResult = gameResult === rule.name;
                return (
                  <div
                    key={idx}
                    className={`flex justify-between items-center px-2 py-1 rounded transition-colors text-xs font-mono ${
                      isActiveResult
                        ? 'bg-amber-400/20 text-amber-400 font-bold border border-amber-500/20'
                        : 'text-white/60 hover:bg-white/2'
                    }`}
                  >
                    <span className="truncate max-w-[130px]">{rule.name}</span>
                    <span className={`font-black ${isActiveResult ? 'text-amber-400' : 'text-slate-300'}`}>{rule.multiplier}x</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bet size Selector input */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/60 uppercase font-bold tracking-wide">Enter Bet Wager</span>
              <span className="text-[10px] text-white/30 font-mono">Min: 10 | Max: 1,000</span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <input
                type="number"
                disabled={gameState === 'DEALT'}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Math.min(chips, parseInt(e.target.value) || 10)))}
                className="bg-transparent border-none outline-none text-white font-mono font-black text-lg flex-1 min-w-0 disabled:opacity-50"
              />
              {gameState !== 'DEALT' && (
                <div className="flex items-center gap-1">
                  <button onClick={halveBet} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">½</button>
                  <button onClick={doubleBet} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">2x</button>
                  <button onClick={setBetMax} className="px-2.5 py-1 text-[10px] font-bold font-mono uppercase bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-white rounded border border-amber-500/20 transition-all cursor-pointer">Max</button>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Core Actions */}
          <div className="space-y-2 mt-4">
            {gameState !== 'DEALT' ? (
              <button
                onClick={handleDeal}
                disabled={chips < betAmount}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> Deal New Poker Hand
              </button>
            ) : (
              <button
                onClick={handleDraw}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4 animate-spin" /> Draw Poker Cards
              </button>
            )}
          </div>

        </div>

        {/* Right Hand side: Interactive Poker Board Cards */}
        <div className="bg-[#050516]/60 border border-white/5 rounded-3xl p-6 flex flex-col justify-between space-y-8 items-center min-h-[380px]">
          
          <div className="w-full flex justify-between items-center px-1">
            <span className="text-[9px] font-mono uppercase text-white/30 tracking-wider">Dealt Video Hand</span>
            {gameState === 'DEALT' && (
              <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-400/5 px-2 py-0.5 rounded-full border border-amber-500/10">
                Pick cards to HOLD and tap DRAW
              </span>
            )}
            {gameState === 'RESOLVED' && (
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                gameResult && gameResult !== 'Lose'
                  ? 'text-emerald-400 bg-emerald-400/5 border-emerald-500/10'
                  : 'text-red-400 bg-red-400/5 border-red-500/10'
              }`}>
                {gameResult === 'Lose' ? 'Busted Hand' : `Payout Triggered: ${gameResult}`}
              </span>
            )}
          </div>

          {/* Cards Arena Board list */}
          <div className="flex gap-2.5 sm:gap-4 justify-center items-center w-full overflow-x-auto py-3">
            {hand.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-16 h-28 sm:w-24 sm:h-36 rounded-xl border border-white/5 border-dashed bg-white/2 flex items-center justify-center text-white/5 font-mono text-[10px]">
                  Slot {i+1}
                </div>
              ))
            ) : (
              hand.map((card, idx) => {
                const isHeld = heldIndices.has(idx);
                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, rotateY: 90, opacity: 0 }}
                    animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                    whileHover={gameState === 'DEALT' ? { y: -6 } : {}}
                    onClick={() => toggleHold(idx)}
                    className={`relative w-16 h-28 sm:w-24 sm:h-36 rounded-xl shadow-lg flex flex-col justify-between p-2.5 sm:p-3 select-none cursor-pointer transition-all ${
                      isHeld 
                        ? 'bg-gradient-to-br from-amber-400 to-amber-500 text-black border-2 border-white' 
                        : 'bg-gradient-to-br from-white to-slate-100 text-black border-t border-x border-white'
                    }`}
                  >
                    {/* Hold Banner Sticker indicator */}
                    {isHeld && (
                      <div className="absolute top-[-10px] left-1/2 translate-x-[-50%] bg-neutral-900 border border-amber-400 text-amber-400 font-mono font-black text-[7px] sm:text-[9px] px-2 py-0.5 rounded-full shadow-lg">
                        HELD
                      </div>
                    )}

                    <div className="flex flex-col items-center justify-start self-start">
                      <span className="text-xs sm:text-base font-black font-sans leading-none">{card.label}</span>
                      <span className={`text-xs sm:text-sm leading-none ${isHeld ? 'text-black' : getSuitColor(card.suit)}`}>
                        {getSuitSymbol(card.suit)}
                      </span>
                    </div>

                    <div className={`text-2xl sm:text-4xl self-center font-bold select-none ${isHeld ? 'text-black' : getSuitColor(card.suit)}`}>
                      {getSuitSymbol(card.suit)}
                    </div>

                    <div className="flex flex-col items-center justify-start self-end rotate-180">
                      <span className="text-xs sm:text-base font-black font-sans leading-none">{card.label}</span>
                      <span className={`text-xs sm:text-sm leading-none ${isHeld ? 'text-black' : getSuitColor(card.suit)}`}>
                        {getSuitSymbol(card.suit)}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Guidelines box help */}
          <div className="w-full bg-[#050516]/60 border border-white/5 rounded-2xl p-4 text-[11px] text-white/50 leading-relaxed space-y-1">
            <h5 className="font-bold text-white flex items-center gap-1.5 font-sans uppercase text-[10px] tracking-wider text-amber-400">
              <HelpCircle className="w-3.5 h-3.5" /> Video Poker Rules
            </h5>
            <p>
              Hold any cards you wish to keep by tapping them (indicated by a golden background), then click **DRAW** to replace the rest. Payouts trigger on Jacks or Better and scale dynamically based on the poker hands hierarchy!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
