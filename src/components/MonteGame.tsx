import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, HelpCircle, Trophy, Volume2, VolumeX, Shuffle, RotateCw } from 'lucide-react';

interface MonteGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

class MonteAudio {
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
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.11);
    } catch (e) {}
  }

  playShuffle() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.15);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.17);
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
      osc.frequency.linearRampToValueAtTime(80, now + 0.2);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.22);
    } catch (e) {}
  }
}

interface CardState {
  id: number;
  type: 'QUEEN' | 'JOKER';
  position: number; // 0, 1, 2
}

export const MonteGame: React.FC<MonteGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [gameState, setGameState] = useState<'IDLE' | 'SHUFFLING' | 'WAITING_SELECTION' | 'REVEALED'>('IDLE');
  const [cards, setCards] = useState<CardState[]>([
    { id: 1, type: 'QUEEN', position: 1 }, // Center is Queen initially
    { id: 2, type: 'JOKER', position: 0 },
    { id: 3, type: 'JOKER', position: 2 }
  ]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<'WIN' | 'LOSS'>>([]);

  const audioRef = useRef<MonteAudio>(new MonteAudio());

  const toggleSound = () => {
    const nextMute = !soundMuted;
    setSoundMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleStartShuffle = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to play Vegas Monte!', 'error');
      return;
    }
    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);
    setGameState('SHUFFLING');
    setSelectedCardId(null);

    // Initial shuffle position reset
    setCards([
      { id: 1, type: 'QUEEN', position: 1 },
      { id: 2, type: 'JOKER', position: 0 },
      { id: 3, type: 'JOKER', position: 2 }
    ]);

    audioRef.current.playShuffle();

    // Trigger sequential visual swaps
    let swapsCount = 0;
    const interval = setInterval(() => {
      audioRef.current.playShuffle();
      setCards(prev => {
        const positions = [0, 1, 2];
        // Shuffle positions randomly
        const shuffledPos = [...positions].sort(() => Math.random() - 0.5);
        return prev.map((card, idx) => ({
          ...card,
          position: shuffledPos[idx]
        }));
      });

      swapsCount++;
      if (swapsCount >= 5) {
        clearInterval(interval);
        setGameState('WAITING_SELECTION');
        triggerAlert('Cards shuffled! Find the Gold Queen of Hearts!', 'info');
      }
    }, 400);
  };

  const handleSelectCard = (card: CardState) => {
    if (gameState !== 'WAITING_SELECTION' || selectedCardId !== null) return;

    setSelectedCardId(card.id);
    setGameState('REVEALED');
    audioRef.current.playFlip();

    setTimeout(() => {
      if (card.type === 'QUEEN') {
        const payout = Math.floor(betAmount * 2.5);
        onUpdateChips(payout);
        setStreak(prev => prev + 1);
        audioRef.current.playWin();
        triggerAlert(`EXCELLENT WATCH! You found the Gold Queen (+${payout} Chips)! 👑🎉`, 'success');
        onUpdateTask('win_high_odds', 1);
        setHistory(prev => ['WIN', ...prev.slice(0, 9)]);
      } else {
        setStreak(0);
        audioRef.current.playLoss();
        triggerAlert('Aww, that was a Joker card. Better luck next shuffle! 🃏', 'info');
        setHistory(prev => ['LOSS', ...prev.slice(0, 9)]);
      }
    }, 400);
  };

  const adjustBet = (amount: number) => {
    if (gameState !== 'IDLE' && gameState !== 'REVEALED') return;
    setBetAmount(prev => Math.max(10, Math.min(chips, prev + amount)));
  };

  const setBetMax = () => {
    if (gameState !== 'IDLE' && gameState !== 'REVEALED') return;
    setBetAmount(Math.min(chips, 1000));
  };

  return (
    <div id="monte-game-root" className="space-y-6">
      {/* GAME HEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2 tracking-wide uppercase">
            <Shuffle className="w-5 h-5 text-amber-400" /> Vegas 3-Card Monte
          </h3>
          <p className="text-[11px] text-white/50 font-mono">TRACK THE GOLDEN QUEEN AND SELECT HER TO MULTIPLY YOUR BET BY 2.5X</p>
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
                  disabled={gameState === 'SHUFFLING' || gameState === 'WAITING_SELECTION'}
                  className="bg-transparent text-sm font-mono font-black text-white focus:outline-none w-full"
                />
                <button
                  onClick={setBetMax}
                  disabled={gameState === 'SHUFFLING' || gameState === 'WAITING_SELECTION'}
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
                    disabled={gameState === 'SHUFFLING' || gameState === 'WAITING_SELECTION'}
                    className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[10px] font-mono font-bold rounded-lg border border-white/5"
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Streak & stats */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2 font-mono text-xs">
              <span className="text-[10px] text-white/40 uppercase block mb-1">STREAK & SCOREBOARD</span>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Current Win Streak:</span>
                <span className="font-bold text-amber-400">{streak} wins</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Win Multiplier Rate:</span>
                <span className="font-bold text-teal-400">2.5x Standard</span>
              </div>
            </div>

            {/* Guide */}
            <div className="bg-[#111126]/40 rounded-xl p-3 border border-white/5 text-[10px] text-white/50 space-y-1 font-mono">
              <span className="font-bold text-white/80 uppercase block mb-1 tracking-wider">GAME RULES</span>
              <p>• The game deals 1 Gold Queen & 2 Jokers face down.</p>
              <p>• The cards slide and swap positions in real-time.</p>
              <p>• Select the card you believe holds the Gold Queen.</p>
              <p>• Find her to collect an instant <b className="text-amber-400">2.5x payout</b>!</p>
            </div>
          </div>

          <div className="pt-4">
            {gameState === 'IDLE' || gameState === 'REVEALED' ? (
              <button
                onClick={handleStartShuffle}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Shuffle className="w-4 h-4" /> SHUFFLE & START GAME
              </button>
            ) : (
              <button
                disabled
                className="w-full py-4 bg-white/5 text-white/30 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 animate-pulse"
              >
                SHUFFLING IN FLIGHT...
              </button>
            )}
          </div>
        </div>

        {/* CARDS PLACEMENT BOARD */}
        <div className="bg-[#070719] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(24,16,48,0.7)_0%,rgba(5,5,15,1)_100%)]" />

          {/* DEALER TITLE */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10 text-[10px] font-mono text-white/40">
            <span>MONTE CRUISE CARNIVAL</span>
            <span className="font-bold text-teal-400 uppercase">{gameState}</span>
          </div>

          {/* THE CARDS */}
          <div className="relative w-full max-w-md h-56 flex items-center justify-center gap-4">
            {cards.map((card) => {
              const isSelected = selectedCardId === card.id;
              const isRevealed = gameState === 'REVEALED' || gameState === 'IDLE';

              // Calculate horizontal slide offsets based on position index (0, 1, 2)
              // Width of container is roughly 350px.
              // We've laid out standard positions where 0 = left, 1 = center, 2 = right.
              // Instead of absolute positioning which might break, we can use flex order or standard translates.
              // Let's use Framer Motion's absolute positions inside a relative box to slide smoothly!
              const offsetPercentage = card.position === 0 ? '-110%' : card.position === 2 ? '110%' : '0%';

              return (
                <motion.div
                  key={card.id}
                  animate={{ x: offsetPercentage }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  className="absolute w-24 h-36 sm:w-28 sm:h-40 rounded-xl"
                  style={{ zIndex: isSelected ? 30 : 10 }}
                >
                  <motion.button
                    onClick={() => handleSelectCard(card)}
                    disabled={gameState !== 'WAITING_SELECTION'}
                    className={`w-full h-full rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
                      isRevealed 
                        ? card.type === 'QUEEN'
                          ? 'bg-gradient-to-br from-amber-900/30 to-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'bg-white/5 border-white/10 text-white/40'
                        : isSelected
                        ? 'border-amber-400 bg-amber-400/10'
                        : 'bg-[#111126] border-white/10 hover:border-amber-400/30 cursor-pointer'
                    }`}
                  >
                    {isRevealed ? (
                      card.type === 'QUEEN' ? (
                        <div className="text-center space-y-1">
                          <span className="text-3xl filter drop-shadow-[0_0_6px_#f59e0b]">👑</span>
                          <span className="block font-sans text-xs font-black text-amber-400">GOLD QUEEN</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <span className="text-2xl opacity-40">🃏</span>
                          <span className="block font-mono text-[9px] font-bold text-white/30">JOKER</span>
                        </div>
                      )
                    ) : (
                      // Back of the card design
                      <div className="absolute inset-1.5 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center bg-[#090918]">
                        <Shuffle className="w-5 h-5 text-amber-400/40 animate-pulse" />
                        <span className="text-[8px] font-mono mt-1 text-white/20">VEGAS</span>
                      </div>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>

          {/* HISTORY STRIP */}
          <div className="absolute bottom-4 left-6 right-6 z-10 flex gap-1.5 justify-center font-mono">
            {history.slice(0, 5).map((h, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${h === 'WIN' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-500 border border-red-500/20'}`}>
                {h}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
