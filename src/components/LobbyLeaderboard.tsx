import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile, LeaderboardEntry } from '../types';
import { Trophy, Coins, Award, Users, ShieldAlert } from 'lucide-react';

interface LobbyLeaderboardProps {
  profile: PlayerProfile;
}

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Vegas_Viper 🐍', chips: 2450, level: 12, avatar: '💎', isBot: true },
  { name: 'LadyLuck_777 🎰', chips: 1890, level: 9, avatar: '🍒', isBot: true },
  { name: 'Bingo_Baron 👑', chips: 1420, level: 7, avatar: '🎩', isBot: true },
  { name: 'GoldDigger ⛏️', chips: 950, level: 5, avatar: '🤠', isBot: true },
  { name: 'LuckyCharm 🍀', chips: 620, level: 4, avatar: '🍄', isBot: true },
];

export const LobbyLeaderboard: React.FC<LobbyLeaderboardProps> = ({ profile }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [recentWin, setRecentWin] = useState<string | null>(null);

  // Simulate occasional activity on the leaderboard
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random bot
      const botIdx = Math.floor(Math.random() * INITIAL_LEADERBOARD.length);
      const chosenBot = INITIAL_LEADERBOARD[botIdx];
      
      const delta = Math.floor(Math.random() * 90) - 30; // positive bias
      
      setLeaderboard((prev) =>
        prev.map((bot, idx) => {
          if (idx === botIdx) {
            const newChips = Math.max(100, bot.chips + delta);
            const levelUp = Math.random() > 0.95 ? 1 : 0;
            return {
              ...bot,
              chips: newChips,
              level: bot.level + levelUp,
            };
          }
          return bot;
        })
      );

      if (delta > 20) {
        setRecentWin(`${chosenBot.name} just won +${delta} chips in golden reels!`);
        setTimeout(() => setRecentWin(null), 4000);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Merge the user's live profile details
  const combined = [
    ...leaderboard,
    {
      name: `${profile.name} (You)`,
      chips: profile.chips,
      level: profile.level,
      avatar: profile.avatar || '💎',
      isBot: false,
    }
  ].sort((a, b) => b.chips - a.chips);

  return (
    <div id="lobby-leaderboard-section" className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center text-left gap-2">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Active Players Leaderboard
          </h3>
          <p className="text-[10px] text-white/40 font-mono uppercase">Live standings of VIP players active on the floor</p>
        </div>

        {/* Live Ticker */}
        <div className="h-6 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {recentWin ? (
              <motion.div
                key={recentWin}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md flex items-center gap-1"
              >
                <Coins className="w-3 h-3 text-emerald-400" /> {recentWin}
              </motion.div>
            ) : (
              <span className="text-[9px] font-mono text-white/30 uppercase flex items-center gap-1 py-0.5">
                <Users className="w-3 h-3" /> 6 PLAYERS ONLINE NOW
              </span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Beautiful podium grid for top 3 */}
        <div className="grid grid-cols-3 gap-3 mb-4 pt-2">
          {/* 2nd place (rendered left) */}
          {combined[1] && (
            <div className="flex flex-col items-center justify-end text-center pb-2 bg-white/5 border border-white/5 rounded-2xl p-3 relative mt-6">
              <span className="absolute -top-3 text-lg font-bold text-slate-400 font-mono">2nd</span>
              <span className="text-2xl mb-1 filter drop-shadow">{combined[1].avatar}</span>
              <span className="text-[10px] font-extrabold text-white truncate max-w-[80px]">{combined[1].name}</span>
              <span className="text-[8px] text-white/40 font-mono">LVL {combined[1].level}</span>
              <span className="text-[10px] text-amber-400 font-mono font-bold mt-1 flex items-center gap-0.5">
                <Coins className="w-3 h-3" /> {combined[1].chips}
              </span>
            </div>
          )}

          {/* 1st place (rendered center, raised) */}
          {combined[0] && (
            <div className="flex flex-col items-center justify-end text-center pb-3 bg-amber-400/10 border border-amber-400/20 rounded-2xl p-4 relative shadow-amber-400/5 shadow-xl">
              <span className="absolute -top-4 text-xl font-bold text-amber-400 font-mono flex items-center gap-0.5">
                👑 1st
              </span>
              <span className="text-3xl mb-1 filter drop-shadow-md">{combined[0].avatar}</span>
              <span className="text-xs font-black text-amber-400 truncate max-w-[100px]">{combined[0].name}</span>
              <span className="text-[8px] text-white/40 font-mono">LVL {combined[0].level}</span>
              <span className="text-xs text-amber-300 font-mono font-black mt-1 flex items-center gap-0.5">
                <Coins className="w-3.5 h-3.5" /> {combined[0].chips}
              </span>
            </div>
          )}

          {/* 3rd place (rendered right) */}
          {combined[2] && (
            <div className="flex flex-col items-center justify-end text-center pb-2 bg-white/5 border border-white/5 rounded-2xl p-3 relative mt-8">
              <span className="absolute -top-3 text-lg font-bold text-amber-700 font-mono">3rd</span>
              <span className="text-2xl mb-1 filter drop-shadow">{combined[2].avatar}</span>
              <span className="text-[10px] font-extrabold text-white truncate max-w-[80px]">{combined[2].name}</span>
              <span className="text-[8px] text-white/40 font-mono">LVL {combined[2].level}</span>
              <span className="text-[10px] text-amber-400 font-mono font-bold mt-1 flex items-center gap-0.5">
                <Coins className="w-3 h-3" /> {combined[2].chips}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable list for rank 4 and below */}
        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
          {combined.slice(3).map((player, idx) => {
            const isSelf = player.name.includes('(You)');
            return (
              <div
                key={player.name}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                  isSelf
                    ? 'bg-amber-400/10 border-amber-400/30'
                    : 'bg-white/5 border-white/5'
                }`}
                style={{ contentVisibility: 'auto' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-white/30 font-mono w-4">{idx + 4}</span>
                  <span className="text-base">{player.avatar}</span>
                  <div className="flex flex-col text-left">
                    <span className={`font-semibold truncate max-w-[120px] ${isSelf ? 'text-amber-400 font-extrabold' : 'text-white/80'}`}>
                      {player.name}
                    </span>
                    <span className="text-[8px] font-mono text-white/30">LVL {player.level}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono font-bold text-white/80">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {player.chips}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
