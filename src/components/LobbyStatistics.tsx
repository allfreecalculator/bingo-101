import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile } from '../types';
import { BarChart2, Trophy, Coins, Award, Percent, ChevronRight } from 'lucide-react';
import { AnalyticsCenter } from './AnalyticsCenter';

interface LobbyStatisticsProps {
  profile: PlayerProfile;
}

export const LobbyStatistics: React.FC<LobbyStatisticsProps> = ({ profile }) => {
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  const winRate = profile.stats.gamesPlayed > 0 
    ? Math.round((profile.stats.bingosWon / profile.stats.gamesPlayed) * 100) 
    : 0;

  const STATS_ITEMS = [
    {
      label: 'GAMES PLAYED',
      value: profile.stats.gamesPlayed,
      icon: <Award className="w-5 h-5 text-indigo-400" />,
      desc: 'Active sessions played across casino floor',
      color: 'from-indigo-500/10 to-transparent border-indigo-500/10'
    },
    {
      label: 'BINGOS CLAIMED',
      value: profile.stats.bingosWon,
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      desc: 'Successful card patterns checked out',
      color: 'from-amber-500/10 to-transparent border-amber-500/10'
    },
    {
      label: 'WIN RATE',
      value: `${winRate}%`,
      icon: <Percent className="w-5 h-5 text-emerald-400" />,
      desc: 'Percentage of rounds scored with wins',
      color: 'from-emerald-500/10 to-transparent border-emerald-500/10'
    },
    {
      label: 'HIGHEST PAYOUT',
      value: `${profile.stats.highestWin} Chips`,
      icon: <Coins className="w-5 h-5 text-yellow-500" />,
      desc: 'Max chips scooped in a single action',
      color: 'from-yellow-500/10 to-transparent border-yellow-500/10'
    }
  ];

  return (
    <div id="lobby-statistics-section" className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center text-left gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" /> Casino Performance statistics
          </h3>
          <p className="text-[10px] text-white/40 font-mono uppercase">Live tracker of your learning and wagering activities</p>
        </div>
        
        <button
          onClick={() => setIsAnalyticsModalOpen(true)}
          className="flex items-center gap-1 text-[10px] bg-white/5 hover:bg-white/10 text-amber-400 font-bold border border-white/10 px-3 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          ANALYTICS CENTER <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS_ITEMS.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2 }}
            className={`p-4 bg-[#0a0a1f]/80 border rounded-2xl flex flex-col justify-between h-28 bg-gradient-to-br ${item.color} shadow-lg text-left relative overflow-hidden`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono font-bold text-white/40 tracking-wider">
                {item.label}
              </span>
              {item.icon}
            </div>

            <div className="space-y-1">
              <span className="text-lg md:text-xl font-black text-white font-mono block tracking-tight">
                {item.value}
              </span>
              <span className="text-[9px] text-white/30 block leading-tight truncate">
                {item.desc}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isAnalyticsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <div className="absolute inset-0" onClick={() => setIsAnalyticsModalOpen(false)} />
            <AnalyticsCenter 
              profile={profile} 
              onClose={() => setIsAnalyticsModalOpen(false)} 
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
