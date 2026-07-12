import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, Sparkles, Volume2, VolumeX, HelpCircle, Trophy, Swords, Zap } from 'lucide-react';

interface RockPaperScissorsGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

type RPSChoice = 'ROCK' | 'PAPER' | 'SCISSORS';

interface ChoiceConfig {
  choice: RPSChoice;
  label: string;
  emoji: string;
  color: string;
  borderColor: string;
  glowColor: string;
}

const CHOICES: ChoiceConfig[] = [
  { choice: 'ROCK', label: '🪨 Cosmic Rock', emoji: '🪨', color: 'text-cyan-400', borderColor: 'border-cyan-500/30', glowColor: 'shadow-cyan-500/5' },
  { choice: 'PAPER', label: '📄 Solar Paper', emoji: '📄', color: 'text-yellow-400', borderColor: 'border-yellow-500/30', glowColor: 'shadow-yellow-500/5' },
  { choice: 'SCISSORS', label: '✂️ Nebula Scissors', emoji: '✂️', color: 'text-pink-400', borderColor: 'border-pink-500/30', glowColor: 'shadow-pink-500/5' }
];

const STREAK_MULTIPLIERS: Record<number, number> = {
  1: 2.0,
  2: 2.4,
  3: 3.2,
  4: 4.5,
  5: 6.0
};

class RPSAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playDuel() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.35);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.37);
    } catch (e) {}
  }

  playWin() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
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
}

export const RockPaperScissorsGame: React.FC<RockPaperScissorsGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(25);
  const [playerChoice, setPlayerChoice] = useState<RPSChoice>('ROCK');
  const [isDueling, setIsDueling] = useState<boolean>(false);
  const [dealerChoice, setDealerChoice] = useState<RPSChoice | null>(null);
  const [duelResult, setDuelResult] = useState<'WIN' | 'LOSS' | 'DRAW' | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [highStreak, setHighStreak] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [banter, setBanter] = useState<string>('Greetings, carbon-based life form. Choose your weapon and let us duel!');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  const audioRef = useRef<RPSAudio>(new RPSAudio());

  const handleDuel = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to duel in RPS!', 'error');
      return;
    }

    setIsDueling(true);
    setDealerChoice(null);
    setDuelResult(null);
    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);
    audioRef.current.playDuel();

    // Smart dealer thinking banter
    const duelBanter = [
      'Scanning your neural networks...',
      'Computing standard game probabilities...',
      'Predicting your classic reflex vectors...',
    ];
    setBanter(duelBanter[Math.floor(Math.random() * duelBanter.length)]);

    setTimeout(() => {
      // Pick random choice for dealer
      const choices: RPSChoice[] = ['ROCK', 'PAPER', 'SCISSORS'];
      const pick = choices[Math.floor(Math.random() * choices.length)];
      setDealerChoice(pick);

      // Determine outcome
      let result: 'WIN' | 'LOSS' | 'DRAW' = 'DRAW';
      if (playerChoice === pick) {
        result = 'DRAW';
      } else if (
        (playerChoice === 'ROCK' && pick === 'SCISSORS') ||
        (playerChoice === 'PAPER' && pick === 'ROCK') ||
        (playerChoice === 'SCISSORS' && pick === 'PAPER')
      ) {
        result = 'WIN';
      } else {
        result = 'LOSS';
      }

      setDuelResult(result);
      setIsDueling(false);

      if (result === 'WIN') {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setHighStreak(prev => Math.max(prev, nextStreak));

        // Progressive multiplier payouts for streaks
        const mult = STREAK_MULTIPLIERS[Math.min(nextStreak, 5)];
        const payout = Math.floor(betAmount * mult);
        onUpdateChips(payout);
        audioRef.current.playWin();
        
        setBanter(`Ah, outstanding move! You defeated my ${pick} with your ${playerChoice}. Current Streak: ${nextStreak}`);
        triggerAlert(`Victory! Won a ${mult}x return (+${payout} Chips)! 🎉`, 'success');
        setHistory(prev => [`Win vs ${pick} (${payout}c)`, ...prev.slice(0, 9)]);
        onUpdateTask('win_high_odds', 1);
      } else if (result === 'DRAW') {
        // Draw return wager back
        onUpdateChips(betAmount);
        setBanter(`Synchronized neural synapses. We both picked ${pick}. Wager returned.`);
        triggerAlert('Draw duel! Your wager has been returned.', 'info');
        setHistory(prev => [`Draw with ${pick}`, ...prev.slice(0, 9)]);
      } else {
        setStreak(0);
        setBanter(`Predicted! My ${pick} completely overrides your ${playerChoice}. Better luck next duel!`);
        triggerAlert(`Defeat! The AI dealer countered you with ${pick}.`, 'info');
        setHistory(prev => [`Lost to ${pick}`, ...prev.slice(0, 9)]);
      }
    }, 1200);
  };

  const setBetMax = () => setBetAmount(Math.min(chips, 1000));
  const doubleBet = () => setBetAmount(prev => Math.min(chips, prev * 2));
  const halveBet = () => setBetAmount(prev => Math.max(10, Math.round(prev / 2)));

  const activeMult = STREAK_MULTIPLIERS[Math.min(streak + 1, 5)];

  return (
    <div id="rps-game-container" className="bg-[#05111c]/85 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Background decorations */}
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-pink-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/25 text-pink-400 flex items-center justify-center shadow-lg shadow-pink-500/5">
            <Swords className="w-6 h-6 animate-pulse text-pink-400" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white uppercase font-sans flex items-center gap-2">
              Galactic Showdown <span className="text-[9px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30 font-bold">RPS Arena</span>
            </h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Beat the smart AI dealer to stack consecutive streak multipliers</p>
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
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
          </button>
          
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best Streak: <span className="font-black text-amber-400">{highStreak}</span>
          </div>
        </div>
      </div>

      {/* AI Dealer banter box */}
      <div className="bg-black/45 border border-pink-500/25 p-3 rounded-2xl flex items-center gap-3 text-white/85 font-mono text-xs">
        <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-base border border-pink-500/30">🤖</div>
        <div className="italic">"{banter}"</div>
      </div>

      <div className="grid md:grid-cols-[1fr_1.3fr_1fr] gap-6 items-start">
        
        {/* Left column: Controls */}
        <div className="space-y-4">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2.5">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">1. Choose Weapon</span>
            <div className="flex flex-col gap-2">
              {CHOICES.map((config) => (
                <button
                  key={config.choice}
                  disabled={isDueling}
                  onClick={() => setPlayerChoice(config.choice)}
                  className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                    playerChoice === config.choice
                      ? 'bg-pink-500/10 text-white border-pink-500/40 shadow-lg'
                      : 'bg-transparent text-white/40 border-transparent hover:bg-white/2 hover:text-white'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide">{config.label}</span>
                  </div>
                  <span className={`text-[9px] font-mono ${playerChoice === config.choice ? 'text-pink-400 font-bold' : 'text-white/20'}`}>
                    {playerChoice === config.choice ? 'Selected' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/60 uppercase font-bold tracking-wide flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> Duel Wager
              </span>
              <span className="text-[10px] text-white/30 font-mono">Min: 10</span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
              <input
                type="number"
                disabled={isDueling}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Math.min(chips, parseInt(e.target.value) || 10)))}
                className="bg-transparent border-none outline-none text-white font-mono font-black text-sm flex-1 min-w-0"
              />
              {!isDueling && (
                <div className="flex items-center gap-1">
                  <button onClick={halveBet} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">½</button>
                  <button onClick={doubleBet} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">2x</button>
                  <button onClick={setBetMax} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-pink-500/10 text-pink-400 hover:bg-pink-500 hover:text-white rounded border border-pink-500/20 transition-all cursor-pointer">Max</button>
                </div>
              )}
            </div>
          </div>

          <button
            disabled={isDueling}
            onClick={handleDuel}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-pink-500/20 cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Swords className="w-4 h-4 fill-current" /> DUEL DEALER
          </button>
        </div>

        {/* Center column: Dual reveal plates */}
        <div className="flex flex-col items-center justify-center bg-black/30 border border-white/5 rounded-3xl p-6 min-h-[250px] relative">
          
          <div className="flex items-center gap-4 w-full justify-around">
            
            {/* Player block card */}
            <div className="text-center space-y-1.5 flex-1 max-w-[100px]">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-black block">You</span>
              <div className="aspect-square w-full rounded-2xl bg-white/5 border border-pink-500/20 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                <span className="text-3xl">{CHOICES.find(c => c.choice === playerChoice)?.emoji}</span>
                <span className="text-[8px] font-bold text-pink-400 uppercase tracking-tight mt-1">{playerChoice}</span>
              </div>
            </div>

            {/* Battle text VS */}
            <div className="text-center font-mono text-xs text-white/30 font-black animate-pulse">
              VS
            </div>

            {/* AI Dealer card */}
            <div className="text-center space-y-1.5 flex-1 max-w-[100px]">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest font-black block">Dealer</span>
              <div className="aspect-square w-full rounded-2xl bg-black/60 border border-white/5 flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {isDueling ? (
                    <motion.span
                      key="thinking"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
                      className="text-xl text-pink-400"
                    >
                      🔮
                    </motion.span>
                  ) : dealerChoice ? (
                    <motion.div
                      key="reveal"
                      initial={{ scale: 0.4, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-3xl">{CHOICES.find(c => c.choice === dealerChoice)?.emoji}</span>
                      <span className="text-[8px] font-bold text-white/50 uppercase tracking-tight mt-1">{dealerChoice}</span>
                    </motion.div>
                  ) : (
                    <span key="empty" className="text-lg text-white/10">?</span>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>

          {/* Result tag */}
          {duelResult && (
            <div className={`mt-5 font-mono text-xs font-black px-4 py-2 rounded-xl border uppercase ${
              duelResult === 'WIN' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 animate-bounce' 
                : duelResult === 'DRAW' 
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                : 'bg-white/5 text-white/40 border-white/5'
            }`}>
              {duelResult === 'WIN' ? `Victory (+${activeMult}x)!` : duelResult === 'DRAW' ? 'Draw - Bet back' : 'Defeated'}
            </div>
          )}

          {/* Current streak badge */}
          {streak > 0 && (
            <div className="absolute top-3 right-3 bg-pink-500/15 text-pink-400 text-[10px] font-mono px-2.5 py-1 rounded-lg border border-pink-500/25 font-black flex items-center gap-1 animate-pulse">
              <Zap className="w-3.5 h-3.5 text-pink-400" /> STREAK: {streak}
            </div>
          )}

        </div>

        {/* Right column: Multipliers ladder */}
        <div className="space-y-4">
          <div className="bg-black/45 border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Streak Rewards</span>
            <div className="flex flex-col gap-1.5 font-mono text-[10px]">
              {[
                { label: '5+ Win Streak', mult: '6.0x Payout', style: 'text-amber-400 font-extrabold animate-pulse' },
                { label: '4 Win Streak', mult: '4.5x Payout', style: 'text-pink-400 font-bold' },
                { label: '3 Win Streak', mult: '3.2x Payout', style: 'text-purple-400 font-bold' },
                { label: '2 Win Streak', mult: '2.4x Payout', style: 'text-blue-400 font-bold' },
                { label: '1 Win Streak', mult: '2.0x Payout', style: 'text-emerald-400' }
              ].map((tier, idx) => (
                <div key={idx} className="flex justify-between p-1.5 border-b border-white/5">
                  <span className="text-white/40">{tier.label}</span>
                  <span className={tier.style}>{tier.mult}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">RPS Duel History</span>
            <div className="flex flex-wrap gap-1.5">
              {history.length === 0 ? (
                <span className="text-[10px] text-white/20 font-mono">No duels yet...</span>
              ) : (
                history.map((h, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-white/5 text-white/75 border border-white/5"
                  >
                    {h}
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
