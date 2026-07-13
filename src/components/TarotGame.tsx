import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, HelpCircle, Trophy, Volume2, VolumeX, Sparkles, Star } from 'lucide-react';

interface TarotGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface TarotCardDef {
  name: string;
  icon: string;
  desc: string;
  multiplier: number;
  effect?: string;
}

const DECK_TEMPLATES: TarotCardDef[] = [
  { name: 'The Sun', icon: '☀️', desc: 'Positive energy & major blessings', multiplier: 2.5 },
  { name: 'The Star', icon: '🌟', desc: 'Hope, light, and astronomical odds', multiplier: 1.8 },
  { name: 'The Empress', icon: '👑', desc: 'Royal abundance of cosmic fortunes', multiplier: 2.0 },
  { name: 'The Magician', icon: '🪄', desc: 'Alchemizes and multiplies current fate', multiplier: 3.0 },
  { name: 'The Moon', icon: '🌙', desc: 'Deep reflection of minor multipliers', multiplier: 1.2 },
  { name: 'Wheel of Fortune', icon: '🎡', desc: 'Chaos & unpredictable multipliers', multiplier: 1.5 },
  { name: 'The Fool', icon: '🃏', desc: 'Careless journey but retains stake', multiplier: 0.8 },
  { name: 'Death', icon: '💀', desc: 'Mortal end to safe accumulated payouts', multiplier: 0.2 }
];

class TarotAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playDraw() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playReveal(isGood: boolean) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isGood ? 880 : 220, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.32);
    } catch (e) {}
  }

  playJackpot() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.02, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.35);
      });
    } catch (e) {}
  }
}

export const TarotGame: React.FC<TarotGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [gameState, setGameState] = useState<'IDLE' | 'READING' | 'RESOLVED'>('IDLE');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  
  const [gameDeck, setGameDeck] = useState<TarotCardDef[]>([]);
  const [drawnCards, setDrawnCards] = useState<TarotCardDef[]>([]);
  const [drawnIndexes, setDrawnIndexes] = useState<number[]>([]);
  const [history, setHistory] = useState<number[]>([]);

  const audioRef = useRef<TarotAudio>(new TarotAudio());

  const toggleSound = () => {
    const nextMute = !soundMuted;
    setSoundMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleStartReading = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to start Tarot reading!', 'error');
      return;
    }
    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);

    // Shuffle the deck from our template list
    const shuffledDeck = [...DECK_TEMPLATES]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6); // Deal 6 cards face down on table

    setGameDeck(shuffledDeck);
    setDrawnCards([]);
    setDrawnIndexes([]);
    setGameState('READING');
    triggerAlert('Cards dealt face down on Velvet Table! Pick 3 to reveal your fortune.', 'info');
  };

  const handleDrawCard = (index: number) => {
    if (gameState !== 'READING' || drawnCards.length >= 3 || drawnIndexes.includes(index)) return;

    audioRef.current.playDraw();
    const card = gameDeck[index];
    const newDrawn = [...drawnCards, card];
    const newIndexes = [...drawnIndexes, index];

    setDrawnCards(newDrawn);
    setDrawnIndexes(newIndexes);

    audioRef.current.playReveal(card.multiplier >= 1.0);

    if (newDrawn.length === 3) {
      // Complete! Calculate product of multipliers
      let finalMult = 1.0;
      newDrawn.forEach(c => {
        finalMult *= c.multiplier;
      });

      // round final multiplier to 2 decimals
      finalMult = parseFloat(finalMult.toFixed(2));
      const payout = Math.floor(betAmount * finalMult);

      setTimeout(() => {
        if (payout > 0) {
          onUpdateChips(payout);
          if (finalMult >= 3.0) {
            audioRef.current.playJackpot();
            triggerAlert(`Aura aligned! Draw product: ${finalMult}x (+${payout} Chips)! 🔮🎉`, 'success');
            onUpdateTask('win_high_odds', 1);
          } else {
            triggerAlert(`Fate reading complete. Multiplier: ${finalMult}x (+${payout} Chips).`, 'success');
          }
        } else {
          triggerAlert('Fate yielded 0 chips! Better luck next alignment! 🌌', 'info');
        }
        setHistory(prev => [finalMult, ...prev.slice(0, 9)]);
        setGameState('RESOLVED');
      }, 700);
    } else {
      triggerAlert(`Drew card ${newDrawn.length}: ${card.name} (${card.multiplier}x)!`, 'success');
    }
  };

  const adjustBet = (amount: number) => {
    if (gameState !== 'IDLE' && gameState !== 'RESOLVED') return;
    setBetAmount(prev => Math.max(10, Math.min(chips, prev + amount)));
  };

  const setBetMax = () => {
    if (gameState !== 'IDLE' && gameState !== 'RESOLVED') return;
    setBetAmount(Math.min(chips, 1000));
  };

  // calculate current reading product
  let cumulativeMultiplier = 1.0;
  drawnCards.forEach(c => {
    cumulativeMultiplier *= c.multiplier;
  });
  if (drawnCards.length === 0) cumulativeMultiplier = 0;

  return (
    <div id="tarot-game-root" className="space-y-6">
      {/* GAME HEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" /> Mystic Cosmic Tarot
          </h3>
          <p className="text-[11px] text-white/50 font-mono">DRAW THREE FATE CARDS TO REVEAL EXPONENTIAL MULTIPLIER COMBINATIONS</p>
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
                  disabled={gameState === 'READING'}
                  className="bg-transparent text-sm font-mono font-black text-white focus:outline-none w-full"
                />
                <button
                  onClick={setBetMax}
                  disabled={gameState === 'READING'}
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
                    disabled={gameState === 'READING'}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-mono font-bold rounded-lg border border-white/5"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading details */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2 font-mono text-xs">
              <span className="text-[10px] text-white/40 uppercase block mb-1">Fortune Slots (Picked {drawnCards.length} / 3)</span>
              
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {[0, 1, 2].map(idx => {
                  const card = drawnCards[idx];
                  return (
                    <div key={idx} className="bg-white/5 rounded p-2 border border-white/5 min-h-[50px] flex flex-col justify-center">
                      {card ? (
                        <>
                          <span className="text-lg block">{card.icon}</span>
                          <span className="text-[8px] font-bold text-amber-400 truncate">{card.name}</span>
                          <span className="text-[8px] text-white/50">{card.multiplier}x</span>
                        </>
                      ) : (
                        <span className="text-white/20 text-xs">?</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                <span className="text-white/60">Reading Multiplier:</span>
                <span className="font-bold text-teal-400">{cumulativeMultiplier.toFixed(2)}x</span>
              </div>
            </div>

            {/* Guide */}
            <div className="bg-[#111126]/40 rounded-xl p-3 border border-white/5 text-[10px] text-white/50 space-y-1 font-mono">
              <span className="font-bold text-white/80 uppercase block mb-1 tracking-wider">TAROT CARD COMPOSITION</span>
              <p>🔮 Multipliers compounding together! (e.g. 2.5x * 1.8x * 2.0x = 9.0x payout!)</p>
              <p>💀 BEWARE <b className="text-red-500">Death Card (0.2x)</b> which diminishes other fortunes.</p>
            </div>
          </div>

          <div className="pt-4">
            {gameState === 'IDLE' || gameState === 'RESOLVED' ? (
              <button
                onClick={handleStartReading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" /> DRAW FORTUNE DECK
              </button>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-white/5 text-white/30 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 animate-pulse"
              >
                ALIGNING SACRED CHIPS...
              </button>
            )}
          </div>
        </div>

        {/* FATE LAYOUT BOARD */}
        <div className="bg-[#070719] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(48,16,48,0.7)_0%,rgba(5,5,15,1)_100%)]" />

          {/* VELVET SPREAD TITLE */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 text-[10px] font-mono text-white/40">
            <span>VELVET ORACLE TABLE</span>
            <span className="font-bold text-purple-400">THE HEIST SPREAD</span>
          </div>

          {/* 6 TABLE CARDS */}
          {gameState === 'IDLE' ? (
            <div className="text-center space-y-2 z-10 text-white/40 p-10 font-mono">
              <span className="text-4xl animate-pulse block">🔮</span>
              <p className="text-[11px]">INITIALIZE READINGS TO DEPLOY CARD ALIGNMENT</p>
            </div>
          ) : (
            <div className="relative z-10 grid grid-cols-3 gap-3 w-full max-w-sm">
              {gameDeck.map((card, index) => {
                const isDrawn = drawnIndexes.includes(index);
                return (
                  <motion.button
                    key={index}
                    whileHover={!isDrawn && gameState === 'READING' ? { scale: 1.05 } : {}}
                    onClick={() => handleDrawCard(index)}
                    disabled={gameState !== 'READING' || isDrawn}
                    className={`aspect-[2/3] rounded-xl border flex flex-col items-center justify-center p-2 relative overflow-hidden transition-all duration-300 ${
                      isDrawn 
                        ? 'bg-purple-950/20 border-purple-500/30 opacity-40 text-purple-500/40' 
                        : 'bg-indigo-950/40 border-indigo-500/40 hover:border-purple-400 text-white cursor-pointer shadow-lg'
                    }`}
                  >
                    {!isDrawn ? (
                      <div className="absolute inset-1 border border-dashed border-purple-400/20 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-xl animate-pulse filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">✨</span>
                        <span className="text-[7px] font-mono mt-1 text-purple-300/40">FATE</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-2xl block">{card.icon}</span>
                        <span className="text-[9px] font-bold text-amber-400 truncate">{card.name}</span>
                        <span className="text-[9px] text-white/50">{card.multiplier}x</span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* HISTORY STRIP */}
          <div className="absolute bottom-4 left-6 right-6 z-10 flex gap-1.5 justify-center font-mono">
            {history.slice(0, 5).map((h, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {h}x
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
