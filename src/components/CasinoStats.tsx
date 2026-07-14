import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { PlayerProfile, LeaderboardEntry } from '../types';
import { Trophy, Coins, Award, BarChart2 } from 'lucide-react';
import { AnalyticsCenter } from './AnalyticsCenter';

interface CasinoStatsProps {
  profile: PlayerProfile;
}

// Fixed pool of bots for the leaderboard simulation
const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Vegas_Viper 🐍', chips: 2450, level: 12, avatar: '💎', isBot: true },
  { name: 'LadyLuck_777 🎰', chips: 1890, level: 9, avatar: '🍒', isBot: true },
  { name: 'Bingo_Baron 👑', chips: 1420, level: 7, avatar: '🎩', isBot: true },
  { name: 'GoldDigger ⛏️', chips: 950, level: 5, avatar: '🤠', isBot: true },
  { name: 'LuckyCharm 🍀', chips: 620, level: 4, avatar: '🍄', isBot: true },
];

export const CasinoStats: React.FC<CasinoStatsProps> = ({ profile }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);

  // Simulate leaderboard activity occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard((prev) =>
        prev.map((bot) => {
          // Bots occasionally win or lose chips
          const delta = Math.floor(Math.random() * 80) - 35; // net positive average
          const newChips = Math.max(100, bot.chips + delta);
          // Bots occasionally level up
          const levelUp = Math.random() > 0.95 ? 1 : 0;
          return {
            ...bot,
            chips: newChips,
            level: bot.level + levelUp,
          };
        })
      );
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Merge player profile into leaderboard and sort
  const combinedLeaderboard = [
    ...leaderboard,
    {
      name: `${profile.name} (You)`,
      chips: profile.chips,
      level: profile.level,
      avatar: profile.avatar,
      isBot: false,
    },
  ].sort((a, b) => b.chips - a.chips);

  const winRate = profile.stats.gamesPlayed > 0 
    ? Math.round((profile.stats.bingosWon / profile.stats.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {/* 1. Casino Analytics */}
      <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between h-full min-h-[250px]">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-white/80 uppercase font-sans mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" /> Casino Analytics
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="block text-[9px] font-mono text-white/40 uppercase">Games Played</span>
              <span className="text-lg font-bold text-white font-mono">{profile.stats.gamesPlayed}</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="block text-[9px] font-mono text-white/40 uppercase">Bingos Claimed</span>
              <span className="text-lg font-bold text-amber-400 font-mono flex items-center gap-1">
                <Trophy className="w-4 h-4" /> {profile.stats.bingosWon}
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="block text-[9px] font-mono text-white/40 uppercase">Win Rate</span>
              <span className="text-lg font-bold text-green-400 font-mono">{winRate}%</span>
            </div>
            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
              <span className="block text-[9px] font-mono text-white/40 uppercase">Highest Payout</span>
              <span className="text-lg font-bold text-yellow-500 font-mono flex items-center gap-1">
                <Coins className="w-4 h-4" /> {profile.stats.highestWin}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-4 rounded-xl border border-amber-500/20 text-xs mt-1">
          <div className="flex justify-between items-center mb-1 text-amber-400 font-bold">
            <span className="flex items-center gap-1 text-[10px]"><Award className="w-3.5 h-3.5" /> High Roller Rank</span>
            <span className="text-[10px]">LVL {profile.level}</span>
          </div>
          <p className="text-white/60 leading-normal mb-2 text-[10px]">
            Ranked as: <strong className="text-white">
              {profile.level >= 10 ? 'VIP Legend' : profile.level >= 5 ? 'Vegas Regular' : 'Casino Apprentice'}
            </strong>
          </p>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
            <div 
              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (profile.xp / (profile.level * 100)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] text-white/30 font-mono mt-1">
            <span>{profile.xp} XP</span>
            <span>{profile.level * 100} XP for Lvl {profile.level + 1}</span>
          </div>
        </div>

        <button 
          id="view-full-analytics-trigger"
          onClick={() => setIsAnalyticsModalOpen(true)}
          className="w-full mt-4 py-2.5 bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-black font-extrabold text-[10px] tracking-wider uppercase rounded-xl border border-amber-400/20 hover:border-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <BarChart2 className="w-3.5 h-3.5" /> Full Games Analytics Center
        </button>
      </div>

      {/* 2. Active Players Leaderboard */}
      <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between h-full min-h-[250px]">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-white/80 uppercase font-sans mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Active Players Leaderboard
          </h3>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {combinedLeaderboard.map((player, idx) => {
              const isSelf = !player.isBot;
              return (
                <div
                  key={player.name}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                    isSelf
                      ? 'bg-amber-400/10 border-amber-400/30'
                      : 'bg-white/5 border-white/5'
                  }`}
                  style={{ contentVisibility: 'auto' }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-white/30 font-mono w-4">{idx + 1}</span>
                    <span className="text-base">{player.avatar}</span>
                    <div className="flex flex-col">
                      <span className={`font-semibold truncate max-w-[120px] ${isSelf ? 'text-amber-400 font-bold' : 'text-white/80'}`}>
                        {player.name}
                      </span>
                      <span className="text-[9px] font-mono text-white/30 font-semibold">LVL {player.level}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-white/80 text-xs">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {player.chips}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Full-Screen Games Analytics Center Modal Overlay */}
      <AnimatePresence>
        {isAnalyticsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
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
