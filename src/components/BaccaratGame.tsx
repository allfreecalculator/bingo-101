import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Trophy, Spade, Heart, HelpCircle, Award } from 'lucide-react';

interface BaccaratGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface Card {
  suit: string;
  value: string;
  weight: number;
}

const SUITS = ['♠', '♥', '♦', '♣'];
const CARDS_POOL = [
  { val: 'A', weight: 1 },
  { val: '2', weight: 2 },
  { val: '3', weight: 3 },
  { val: '4', weight: 4 },
  { val: '5', weight: 5 },
  { val: '6', weight: 6 },
  { val: '7', weight: 7 },
  { val: '8', weight: 8 },
  { val: '9', weight: 9 },
  { val: '10', weight: 0 },
  { val: 'J', weight: 0 },
  { val: 'Q', weight: 0 },
  { val: 'K', weight: 0 }
];

export const BaccaratGame: React.FC<BaccaratGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert
}) => {
  const [bet, setBet] = useState<number>(20);
  const [betSide, setBetSide] = useState<'PLAYER' | 'BANKER' | 'TIE'>('PLAYER');
  const [dealing, setDealing] = useState<boolean>(false);
  
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [outcome, setOutcome] = useState<'PLAYER' | 'BANKER' | 'TIE' | null>(null);
  const [showRules, setShowRules] = useState<boolean>(false);

  const drawRandomCard = (): Card => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const base = CARDS_POOL[Math.floor(Math.random() * CARDS_POOL.length)];
    return { suit, value: base.val, weight: base.weight };
  };

  const getHandScore = (hand: Card[]) => {
    const sum = hand.reduce((acc, curr) => acc + curr.weight, 0);
    return sum % 10;
  };

  const handlePlayRound = () => {
    if (dealing) return;
    if (chips < bet) {
      triggerAlert('Insufficient chips to deal a Baccarat hand!', 'error');
      return;
    }

    // Deduct wager
    onUpdateChips(-bet);
    onUpdateTask('play_baccarat', 1);

    setDealing(true);
    setPlayerCards([]);
    setBankerCards([]);
    setOutcome(null);

    // Phase 1: Draw first cards
    setTimeout(() => {
      const p1 = drawRandomCard();
      const b1 = drawRandomCard();
      setPlayerCards([p1]);
      setBankerCards([b1]);

      // Phase 2: Draw second cards
      setTimeout(() => {
        const p2 = drawRandomCard();
        const b2 = drawRandomCard();
        const tempPlayer = [p1, p2];
        const tempBanker = [b1, b2];
        setPlayerCards(tempPlayer);
        setBankerCards(tempBanker);

        let pScore = getHandScore(tempPlayer);
        let bScore = getHandScore(tempBanker);

        // Standard Tableau third-card rules logic
        let drewThirdPlayer = false;
        let thirdPlayerCard: Card | null = null;
        const finalPlayer = [...tempPlayer];
        const finalBanker = [...tempBanker];

        // Natural check: If either side has 8 or 9, no third cards are drawn
        if (pScore < 8 && bScore < 8) {
          // Player third card rule: Player draws if score is 0-5
          if (pScore <= 5) {
            thirdPlayerCard = drawRandomCard();
            finalPlayer.push(thirdPlayerCard);
            drewThirdPlayer = true;
            pScore = getHandScore(finalPlayer);
          }

          // Banker third card rule:
          // If Player did not draw a third card, Banker draws if score is 0-5
          if (!drewThirdPlayer) {
            if (bScore <= 5) {
              finalBanker.push(drawRandomCard());
              bScore = getHandScore(finalBanker);
            }
          } else if (thirdPlayerCard) {
            // Banker rules dependent on Player third card value
            const p3Val = thirdPlayerCard.weight;
            let bankerDraws = false;

            if (bScore <= 2) bankerDraws = true;
            else if (bScore === 3 && p3Val !== 8) bankerDraws = true;
            else if (bScore === 4 && [2, 3, 4, 5, 6, 7].includes(p3Val)) bankerDraws = true;
            else if (bScore === 5 && [4, 5, 6, 7].includes(p3Val)) bankerDraws = true;
            else if (bScore === 6 && [6, 7].includes(p3Val)) bankerDraws = true;

            if (bankerDraws) {
              finalBanker.push(drawRandomCard());
              bScore = getHandScore(finalBanker);
            }
          }
        }

        // Apply visual states with minor delay for cinematic feel
        setTimeout(() => {
          setPlayerCards(finalPlayer);
          setBankerCards(finalBanker);

          // Resolve outcomes
          let result: 'PLAYER' | 'BANKER' | 'TIE' = 'TIE';
          if (pScore > bScore) result = 'PLAYER';
          else if (bScore > pScore) result = 'BANKER';

          setOutcome(result);
          setDealing(false);

          // Resolve payout
          if (result === betSide) {
            const multiplier = result === 'TIE' ? 9 : result === 'BANKER' ? 1.95 : 2.0;
            const winnings = Math.round(bet * multiplier);
            onUpdateChips(winnings);
            triggerAlert(`🎉 Classic Baccarat! ${result} won! You received +${winnings} Chips!`, 'success');
          } else {
            triggerAlert(`Dealer finalized score: Player [${pScore}] vs Banker [${bScore}]. ${result} won.`, 'info');
          }
        }, 800);

      }, 600);
    }, 500);
  };

  const adjustBet = (amount: number) => {
    if (dealing) return;
    setBet(prev => Math.max(5, prev + amount));
  };

  return (
    <div className="bg-[#0b0b1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[9px] bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black uppercase font-mono tracking-widest px-3 py-1 rounded-full shadow-lg">
            High Roller Vegas Table Game
          </span>
          <h3 className="text-xl font-black tracking-tight text-white mt-2 flex items-center gap-2">
            🃏 Baccarat Royale
          </h3>
          <p className="text-[10px] text-white/40 font-mono mt-0.5">Bet on Player, Banker, or Tie. Point total closest to 9 wins!</p>
        </div>

        <button
          onClick={() => setShowRules(!showRules)}
          className="p-2 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          RULES
        </button>
      </div>

      {/* Rules overlay panel */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-black/40 border border-amber-400/20 rounded-2xl text-xs space-y-2 text-white/80 font-mono leading-relaxed">
              <p className="font-bold text-amber-400 border-b border-white/10 pb-1">Baccarat Tableau Rules</p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Face cards & Tens count as <span className="text-yellow-400 font-bold">0</span>, Aces as <span className="text-cyan-400 font-bold">1</span>. Other cards keep face value.</li>
                <li>Final score is computed modulo 10 (e.g., 7 + 8 = 15, score is 5).</li>
                <li>Bet payouts: Player pays <span className="text-emerald-400">2x</span>, Banker pays <span className="text-emerald-400">1.95x</span> (5% house commission), Tie pays <span className="text-emerald-400">9x</span>!</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table grid layout */}
      <div className="bg-[#04040c] border border-white/5 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-2 gap-8 relative z-10">
          
          {/* Player Wing */}
          <div className="flex flex-col items-center p-4 bg-blue-950/20 border border-blue-500/10 rounded-2xl">
            <div className="flex justify-between w-full items-center mb-4">
              <span className="text-xs font-black font-mono text-blue-400 tracking-widest">PLAYER HAND</span>
              <span className="bg-blue-500/15 text-blue-300 font-mono text-xs font-black px-2 py-0.5 rounded-md">
                Score: {getHandScore(playerCards)}
              </span>
            </div>

            <div className="flex gap-2 min-h-[144px] items-center justify-center">
              {playerCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.5, y: -40, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  className="w-16 h-24 bg-white rounded-lg flex flex-col justify-between p-2 text-black shadow-lg"
                >
                  <div className="text-xs font-black leading-none flex justify-between">
                    <span>{card.value}</span>
                    <span className={['♥', '♦'].includes(card.suit) ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                  </div>
                  <div className="text-2xl text-center self-center">{card.suit}</div>
                  <div className="text-xs font-black leading-none rotate-180 flex justify-between">
                    <span>{card.value}</span>
                    <span className={['♥', '♦'].includes(card.suit) ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                  </div>
                </motion.div>
              ))}
              {playerCards.length === 0 && <span className="text-white/10 text-4xl">🎴</span>}
            </div>
          </div>

          {/* Banker Wing */}
          <div className="flex flex-col items-center p-4 bg-emerald-950/20 border border-emerald-500/10 rounded-2xl">
            <div className="flex justify-between w-full items-center mb-4">
              <span className="text-xs font-black font-mono text-emerald-400 tracking-widest">BANKER HAND</span>
              <span className="bg-emerald-500/15 text-emerald-300 font-mono text-xs font-black px-2 py-0.5 rounded-md">
                Score: {getHandScore(bankerCards)}
              </span>
            </div>

            <div className="flex gap-2 min-h-[144px] items-center justify-center">
              {bankerCards.map((card, idx) => (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.5, y: -40, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  className="w-16 h-24 bg-white rounded-lg flex flex-col justify-between p-2 text-black shadow-lg"
                >
                  <div className="text-xs font-black leading-none flex justify-between">
                    <span>{card.value}</span>
                    <span className={['♥', '♦'].includes(card.suit) ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                  </div>
                  <div className="text-2xl text-center self-center">{card.suit}</div>
                  <div className="text-xs font-black leading-none rotate-180 flex justify-between">
                    <span>{card.value}</span>
                    <span className={['♥', '♦'].includes(card.suit) ? 'text-red-500' : 'text-black'}>{card.suit}</span>
                  </div>
                </motion.div>
              ))}
              {bankerCards.length === 0 && <span className="text-white/10 text-4xl">🎴</span>}
            </div>
          </div>

        </div>

        {/* Dynamic center status badge */}
        <div className="mt-6 text-center min-h-[28px]">
          {outcome && (
            <span className={`text-xs font-mono font-black tracking-widest py-1.5 px-5 rounded-full border ${
              outcome === 'TIE' 
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 animate-pulse'
                : outcome === 'PLAYER'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 animate-pulse'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse'
            }`}>
              {outcome === 'TIE' ? '👔 TIE DECLARED!' : `🏆 ${outcome} WINNER!`}
            </span>
          )}
        </div>
      </div>

      {/* Betting Side Selection Tabs */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {[
          { side: 'PLAYER', label: '👤 PLAYER', mult: '2.00x Payout', color: 'border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10' },
          { side: 'TIE', label: '👔 TIE', mult: '9.00x Payout', color: 'border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10' },
          { side: 'BANKER', label: '🏦 BANKER', mult: '1.95x Payout', color: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10' }
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
              {item.mult}
            </span>
          </button>
        ))}
      </div>

      {/* Bets Desk Controls */}
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
          onClick={handlePlayRound}
          disabled={dealing}
          className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-xs tracking-wider uppercase rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg cursor-pointer"
        >
          {dealing ? 'DEALING TABLEAU...' : 'DEAL TABLEAU'}
        </button>
      </div>
    </div>
  );
};
