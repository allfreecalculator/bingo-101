import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Trophy, HelpCircle, Spade, Heart } from 'lucide-react';

interface DragonTigerGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface Card {
  suit: string;
  value: string;
  rank: number;
}

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = [
  { val: 'A', rank: 1 },
  { val: '2', rank: 2 },
  { val: '3', rank: 3 },
  { val: '4', rank: 4 },
  { val: '5', rank: 5 },
  { val: '6', rank: 6 },
  { val: '7', rank: 7 },
  { val: '8', rank: 8 },
  { val: '9', rank: 9 },
  { val: '10', rank: 10 },
  { val: 'J', rank: 11 },
  { val: 'Q', rank: 12 },
  { val: 'K', rank: 13 }
];

export const DragonTigerGame: React.FC<DragonTigerGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [bet, setBet] = useState<number>(20);
  const [betSide, setBetSide] = useState<'DRAGON' | 'TIGER' | 'TIE'>('DRAGON');
  const [dealing, setDealing] = useState<boolean>(false);
  const [dragonCard, setDragonCard] = useState<Card | null>(null);
  const [tigerCard, setTigerCard] = useState<Card | null>(null);
  const [outcome, setOutcome] = useState<'DRAGON' | 'TIGER' | 'TIE' | null>(null);

  const drawRandomCard = (): Card => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const valObj = VALUES[Math.floor(Math.random() * VALUES.length)];
    return { suit, value: valObj.val, rank: valObj.rank };
  };

  const handlePlay = () => {
    if (dealing) return;
    if (chips < bet) {
      triggerAlert('Insufficient chips to deal a Dragon Tiger round!', 'error');
      return;
    }

    // Deduct bet
    onUpdateChips(-bet);
    onUpdateTask('play_dragontiger', 1);

    setDealing(true);
    setDragonCard(null);
    setTigerCard(null);
    setOutcome(null);

    // Deal Dragon Card
    setTimeout(() => {
      const dCard = drawRandomCard();
      setDragonCard(dCard);
      
      // Deal Tiger Card
      setTimeout(() => {
        const tCard = drawRandomCard();
        setTigerCard(tCard);

        // Determine result
        let result: 'DRAGON' | 'TIGER' | 'TIE' = 'TIE';
        if (dCard.rank > tCard.rank) {
          result = 'DRAGON';
        } else if (tCard.rank > dCard.rank) {
          result = 'TIGER';
        }

        setOutcome(result);
        setDealing(false);

        // Resolve bets
        if (result === betSide) {
          const multiplier = result === 'TIE' ? 8 : 1.95;
          const winnings = Math.round(bet * multiplier);
          onUpdateChips(winnings);
          triggerAlert(`🎉 Payout! ${result} won! You received +${winnings} Chips!`, 'success');
        } else {
          triggerAlert(`Dealer finalized: ${result} won. Better luck on the next deal!`, 'info');
        }
      }, 800);
    }, 600);
  };

  const adjustBet = (amount: number) => {
    if (dealing) return;
    setBet(prev => Math.max(5, prev + amount));
  };

  return (
    <div className="bg-[#0b0b1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Visual Ambient Decor */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[9px] bg-gradient-to-r from-red-500 to-amber-500 text-white font-black uppercase font-mono tracking-widest px-3 py-1 rounded-full shadow-lg">
            High Speed Card Duel
          </span>
          <h3 className="text-xl font-black tracking-tight text-white mt-2 flex items-center gap-2">
            🐉 Dragon Tiger Showdown
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">Place your bet on Dragon, Tiger, or Tie. Kings are high, Aces are low!</p>
        </div>
      </div>

      {/* Duel Arena Floor */}
      <div className="bg-[#04040c] border border-white/5 rounded-2xl p-6 mb-6 relative">
        <div className="grid grid-cols-2 gap-8 relative z-10">
          
          {/* Dragon Wing */}
          <div className="flex flex-col items-center p-4 bg-red-950/20 border border-red-500/10 rounded-2xl">
            <span className="text-sm font-black font-mono text-red-400 tracking-widest mb-4">DRAGON</span>
            
            <div className="w-24 h-36 rounded-xl border-2 border-dashed border-red-500/30 flex items-center justify-center relative bg-black/40">
              <AnimatePresence>
                {dragonCard && (
                  <motion.div
                    initial={{ scale: 0.5, y: -100, rotate: -15, opacity: 0 }}
                    animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
                    className="absolute inset-0 bg-white rounded-xl flex flex-col justify-between p-3 text-black shadow-lg"
                  >
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>{dragonCard.value}</span>
                      <span className={['♥', '♦'].includes(dragonCard.suit) ? 'text-red-500' : 'text-black'}>{dragonCard.suit}</span>
                    </div>
                    <div className="text-4xl text-center self-center">{dragonCard.suit}</div>
                    <div className="flex justify-between items-center text-lg font-bold rotate-180">
                      <span>{dragonCard.value}</span>
                      <span className={['♥', '♦'].includes(dragonCard.suit) ? 'text-red-500' : 'text-black'}>{dragonCard.suit}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!dragonCard && <span className="text-3xl text-red-500/20">🐉</span>}
            </div>
          </div>

          {/* Tiger Wing */}
          <div className="flex flex-col items-center p-4 bg-amber-950/20 border border-amber-500/10 rounded-2xl">
            <span className="text-sm font-black font-mono text-amber-400 tracking-widest mb-4">TIGER</span>
            
            <div className="w-24 h-36 rounded-xl border-2 border-dashed border-amber-500/30 flex items-center justify-center relative bg-black/40">
              <AnimatePresence>
                {tigerCard && (
                  <motion.div
                    initial={{ scale: 0.5, y: -100, rotate: 15, opacity: 0 }}
                    animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
                    className="absolute inset-0 bg-white rounded-xl flex flex-col justify-between p-3 text-black shadow-lg"
                  >
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>{tigerCard.value}</span>
                      <span className={['♥', '♦'].includes(tigerCard.suit) ? 'text-red-500' : 'text-black'}>{tigerCard.suit}</span>
                    </div>
                    <div className="text-4xl text-center self-center">{tigerCard.suit}</div>
                    <div className="flex justify-between items-center text-lg font-bold rotate-180">
                      <span>{tigerCard.value}</span>
                      <span className={['♥', '♦'].includes(tigerCard.suit) ? 'text-red-500' : 'text-black'}>{tigerCard.suit}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!tigerCard && <span className="text-3xl text-amber-500/20">🐅</span>}
            </div>
          </div>

        </div>

        {/* Duel Result Header Banner */}
        <div className="mt-6 text-center min-h-[28px]">
          {outcome && (
            <span className={`text-sm font-mono font-black tracking-widest py-1.5 px-4 rounded-full border ${
              outcome === 'TIE' 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                : outcome === 'DRAGON'
                ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
            }`}>
              {outcome === 'TIE' ? '👔 THE ROUND IS A TIE!' : `🏆 ${outcome} WINS THE DUEL!`}
            </span>
          )}
        </div>
      </div>

      {/* Betting Segment Selection */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {[
          { side: 'DRAGON', label: '🐉 DRAGON', mult: '1.95x', color: 'border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10' },
          { side: 'TIE', label: '👔 TIE', mult: '8.00x', color: 'border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10' },
          { side: 'TIGER', label: '🐅 TIGER', mult: '1.95x', color: 'border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10' }
        ].map(item => (
          <button
            key={item.side}
            disabled={dealing}
            onClick={() => setBetSide(item.side as any)}
            className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
              betSide === item.side
                ? 'bg-amber-400 border-amber-400 text-black font-black shadow-lg shadow-amber-400/15'
                : `${item.color}`
            }`}
          >
            <span className="text-xs font-black tracking-wider">{item.label}</span>
            <span className={`text-[10px] font-mono mt-0.5 font-extrabold ${betSide === item.side ? 'text-black/60' : 'opacity-60'}`}>
              {item.mult} Payout
            </span>
          </button>
        ))}
      </div>

      {/* Betting Desk Board */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div>
            <span className="block text-[9px] font-mono text-white/40 uppercase tracking-wider mb-1">
              Wager Amount
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustBet(-10)}
                disabled={dealing}
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
              >
                -10
              </button>
              <span className="w-16 text-center font-mono font-black text-amber-400 text-sm flex items-center justify-center gap-0.5">
                <Coins className="w-3.5 h-3.5" />
                {bet}
              </span>
              <button
                onClick={() => adjustBet(10)}
                disabled={dealing}
                type="button"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 disabled:opacity-30 transition-all cursor-pointer"
              >
                +10
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlay}
          disabled={dealing}
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          {dealing ? 'DEALING CARDS...' : 'DEAL ROUND'}
        </button>
      </div>
    </div>
  );
};
