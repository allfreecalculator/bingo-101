import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, Trophy, Users, Zap, Flame, Award } from 'lucide-react';

interface SimulatedWin {
  id: string;
  player: string;
  game: string;
  multiplier: number;
  chips: number;
  type: 'BIG_WIN' | 'JACKPOT' | 'STREAK' | 'MULTIPLIER';
  icon: string;
}

const PLAYER_NAMES = [
  'VegasKing_77', 'WildReels', 'SpinMaster_X', 'RoyalFlush', 'LuckyCharm_🍀',
  'JackpotJoe', 'CosmicClimber', 'PharaohGiza', 'CherriesWild', 'HighRoller_88',
  'GoldenGlory', 'DoubleDown', 'ZenCaster', 'CyberStrike', 'PlinkoPro',
  'RouletteRider', 'CrashAddict', 'BlackjackAce', 'SlotsQueen', 'LimboKing'
];

const GAMES = [
  { name: 'Vegas Slots', icon: '🎰', rtp: '96.5%' },
  { name: 'Classic Bingo', icon: '🎟️', rtp: '98.2%' },
  { name: 'Cyber Wilds Slots', icon: '🔥', rtp: '97.2%' },
  { name: 'Rocket Crash', icon: '🚀', rtp: '99.0%' },
  { name: 'Cosmic Plinko', icon: '🎯', rtp: '99.0%' },
  { name: 'Mines Floor', icon: '💣', rtp: '98.5%' },
  { name: 'Neon Roulette', icon: '🎡', rtp: '97.3%' },
  { name: 'Vegas 21', icon: '🃏', rtp: '99.5%' },
  { name: 'Dice Duel', icon: '🎲', rtp: '98.0%' },
  { name: 'Zen Sakura Slots', icon: '🌸', rtp: '96.8%' }
];

const WIN_TYPES = [
  { type: 'BIG_WIN', label: '🔥 BIG WIN', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { type: 'JACKPOT', label: '👑 JACKPOT', color: 'bg-amber-400/20 text-yellow-400 border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]' },
  { type: 'STREAK', label: '⚡ STREAK', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { type: 'MULTIPLIER', label: '📈 MULTIPLIER', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' }
] as const;

export const LiveWinnersTicker: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [winsList, setWinsList] = useState<SimulatedWin[]>([]);
  const [activePlayers, setActivePlayers] = useState(1240);
  const [accumulatedWinnings, setAccumulatedWinnings] = useState(1824950);

  // Initialize list
  useEffect(() => {
    const initialList: SimulatedWin[] = Array.from({ length: 6 }, (_, idx) => generateRandomWin());
    setWinsList(initialList);

    // Minor random shifts to active counts
    const intervalPlayers = setInterval(() => {
      setActivePlayers(prev => {
        const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
        return Math.max(1180, Math.min(1480, prev + delta));
      });
      setAccumulatedWinnings(prev => prev + Math.floor(Math.random() * 450) + 50);
    }, 4000);

    return () => clearInterval(intervalPlayers);
  }, []);

  // Periodically insert new win
  useEffect(() => {
    const intervalWin = setInterval(() => {
      const newWin = generateRandomWin();
      setWinsList(prev => [newWin, ...prev.slice(0, 5)]);
    }, 5000);

    return () => clearInterval(intervalWin);
  }, []);

  const generateRandomWin = (): SimulatedWin => {
    const player = PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)];
    const gameObj = GAMES[Math.floor(Math.random() * GAMES.length)];
    const winType = WIN_TYPES[Math.floor(Math.random() * WIN_TYPES.length)];
    
    let multiplier = 0;
    let chips = 0;

    if (winType.type === 'JACKPOT') {
      multiplier = Math.floor(Math.random() * 400) + 150;
      chips = Math.floor(Math.random() * 2500) + 1200;
    } else if (winType.type === 'BIG_WIN') {
      multiplier = Math.floor(Math.random() * 80) + 40;
      chips = Math.floor(Math.random() * 800) + 400;
    } else {
      multiplier = parseFloat((Math.random() * 25 + 2).toFixed(1));
      chips = Math.floor(Math.random() * 350) + 80;
    }

    return {
      id: `win-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      player,
      game: gameObj.name,
      icon: gameObj.icon,
      multiplier,
      chips,
      type: winType.type
    };
  };

  const getBadgeStyle = (type: string) => {
    const styleObj = WIN_TYPES.find(w => w.type === type);
    return styleObj ? styleObj.color : 'bg-white/10 text-white';
  };

  const getBadgeLabel = (type: string) => {
    const styleObj = WIN_TYPES.find(w => w.type === type);
    return styleObj ? styleObj.label : 'WIN';
  };

  return (
    <div id="live-winners-ticker-root" className="space-y-4">
      {/* Dynamic Network Status Ribbon */}
      <div 
        id="casino-network-ribbon"
        className={`rounded-2xl border p-3 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono transition-all ${
          isDarkMode 
            ? 'bg-[#05110c] border-[#16412b] text-[#8fa399]' 
            : 'bg-[#fafaf6] border-[#e6ebe8] text-[#122b1f]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold uppercase tracking-wider">LIVE CASINO NETWORK ACTIVE</span>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[10px]">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>PLAYERS ONLINE: <strong className="text-blue-500 font-bold">{activePlayers.toLocaleString()}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>POOL DISTRIBUTION: <strong className="text-amber-500 font-bold">98.42% RTP</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>TOTAL CLAIMS TODAY: <strong className="text-yellow-400 font-bold">{accumulatedWinnings.toLocaleString()} Chips</strong></span>
          </div>
        </div>
      </div>

      {/* horizontal marquee stream list */}
      <div id="ticker-marquee-box" className="relative w-full overflow-hidden rounded-2xl border bg-[#05050c]/80 border-white/5 py-3 shadow-inner">
        {/* Shading gradients to blend edge overflow */}
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[#030906] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#030906] to-transparent z-10 pointer-events-none" />

        <div className="w-full flex">
          <motion.div 
            className="flex items-center gap-4 whitespace-nowrap px-4"
            animate={{ x: [0, -1000] }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear"
            }}
          >
            {/* Repeated twice to handle loop overlaps seamlessly */}
            {[...winsList, ...winsList, ...winsList].map((win, index) => (
              <div 
                key={`${win.id}-${index}`}
                id={`win-ticker-item-${win.id}`}
                className="inline-flex items-center gap-2.5 bg-[#07160f]/90 border border-[#16412b]/60 px-3.5 py-2 rounded-xl text-left hover:border-amber-400/40 transition-colors shadow-lg pointer-events-auto cursor-pointer"
              >
                {/* Win Tag Badge */}
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getBadgeStyle(win.type)}`}>
                  {getBadgeLabel(win.type)}
                </span>

                {/* Player Name and Icon */}
                <div className="text-[11px] font-sans flex items-center gap-1.5">
                  <span className="text-white/40 font-mono font-bold">{win.icon}</span>
                  <span className="text-white font-bold tracking-tight">{win.player}</span>
                </div>

                <span className="text-white/30 text-xs">&rarr;</span>

                {/* Game and Payout detail */}
                <div className="text-[11px] font-sans">
                  <span className="text-white/50">{win.game}:</span>{' '}
                  <span className="text-emerald-400 font-black font-mono">+{win.chips} Chips</span>
                  <span className="text-[9px] text-amber-400 font-mono ml-1.5">({win.multiplier}x)</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
