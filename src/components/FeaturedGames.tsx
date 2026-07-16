import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Play, Award, Zap, Flame } from 'lucide-react';

interface FeaturedGamesProps {
  onPlayGame: (gameId: string) => void;
}

const FEATURED = [
  {
    id: 'BINGO',
    name: 'Classic Bingo 101',
    desc: 'The ultimate 75-Ball classic experience. Play with automatic stamps, customizable voice calling speeds, and complete pattern checkups.',
    category: 'SPECIALTY',
    payout: 'Up to 25x',
    badge: 'POPULAR',
    icon: '🎟️',
    color: 'from-amber-500/20 to-yellow-600/10 border-amber-500/30 text-amber-400',
    btnBg: 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black border-yellow-300'
  },
  {
    id: 'SLOTS',
    name: 'Vegas Golden Slots',
    desc: 'Spin the premium golden reels, match high-paying cherry, bar, and diamond symbols, and secure multi-tier wild chip jackpots.',
    category: 'SLOTS',
    payout: 'Up to 500x',
    badge: 'HOT',
    icon: '🎰',
    color: 'from-rose-500/20 to-pink-600/10 border-rose-500/30 text-rose-400',
    btnBg: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white border-rose-400/50'
  },
  {
    id: 'CRASH',
    name: 'Rocket Crash',
    desc: 'Watch the rocket climb to high cosmic coordinates. Cash out before the combustion occurs to score exponential chip multipliers.',
    category: 'MULTIPLIERS',
    payout: 'Infinite x',
    badge: 'TRENDING',
    icon: '🚀',
    color: 'from-blue-500/20 to-indigo-600/10 border-blue-500/30 text-blue-400',
    btnBg: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white border-blue-400/50'
  }
];

export const FeaturedGames: React.FC<FeaturedGamesProps> = ({ onPlayGame }) => {
  return (
    <div id="featured-games-section" className="space-y-4">
      <div className="flex justify-between items-center text-left">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Featured Games
          </h3>
          <p className="text-[10px] text-white/40 font-mono uppercase">Premium picked single player classics for premium payouts</p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-[9px] bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded border border-amber-400/20 font-bold uppercase tracking-wider font-mono">
          <Zap className="w-3 h-3 text-amber-400 animate-pulse" /> High Return Rate (98.2% RTP)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURED.map((game, idx) => (
          <motion.div
            key={game.id}
            whileHover={{ y: -6, scale: 1.015 }}
            className={`relative rounded-3xl p-5 border bg-gradient-to-b ${game.color} flex flex-col justify-between space-y-4 shadow-2xl overflow-hidden group text-left h-[230px]`}
          >
            {/* Glowing decorative sphere */}
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:scale-125 transition-transform pointer-events-none" />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold tracking-widest text-white/30 uppercase">
                  {game.category}
                </span>
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
                  <Flame className="w-2.5 h-2.5" /> {game.badge}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-3xl filter drop-shadow-md select-none">{game.icon}</span>
                <div>
                  <h4 className="text-base font-black text-white tracking-tight group-hover:text-amber-400 transition-colors">
                    {game.name}
                  </h4>
                  <span className="block text-[9px] font-mono text-white/40">Payout: <strong className="text-emerald-400 font-bold">{game.payout}</strong></span>
                </div>
              </div>

              <p className="text-[11px] text-white/60 leading-relaxed line-clamp-3">
                {game.desc}
              </p>
            </div>

            <button
              id={`play-featured-${game.id.toLowerCase()}`}
              onClick={() => onPlayGame(game.id)}
              className={`w-full py-2.5 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer border ${game.btnBg} active:scale-95`}
            >
              <Play className="w-3 h-3 fill-current" /> PLAY NOW
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
