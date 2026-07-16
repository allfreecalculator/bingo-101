import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile } from '../types';
import { Trophy, Coins, Lock, CheckCircle2, Award, Gift } from 'lucide-react';

interface LobbyAchievementsProps {
  profile: PlayerProfile;
  onClaimReward: (amount: number, description: string) => void;
}

interface Achievement {
  id: string;
  title: string;
  desc: string;
  reward: number;
  icon: string;
  evaluate: (profile: PlayerProfile) => boolean;
}

const ACHIEVEMENTS_LIST: Achievement[] = [
  {
    id: 'first_game',
    title: 'First Step on Floor',
    desc: 'Play at least 1 round of any casino game',
    reward: 150,
    icon: '🎰',
    evaluate: (p) => p.stats.gamesPlayed >= 1
  },
  {
    id: 'bingo_winner',
    title: 'Bingo Pioneer',
    desc: 'Win your first Classic 75-Ball Bingo round',
    reward: 200,
    icon: '🎟️',
    evaluate: (p) => p.stats.bingosWon >= 1
  },
  {
    id: 'level_three',
    title: 'Rising Vegas Star',
    desc: 'Reach Level 3 on your Casino Profile',
    reward: 250,
    icon: '⭐',
    evaluate: (p) => p.level >= 3
  },
  {
    id: 'high_win_50',
    title: 'Lobby High Roller',
    desc: 'Score a single win payout of 50 chips or higher',
    reward: 300,
    icon: '💰',
    evaluate: (p) => p.stats.highestWin >= 50
  },
  {
    id: 'five_games',
    title: 'Experienced Punter',
    desc: 'Log 5 active gaming rounds on the floor',
    reward: 400,
    icon: '🃏',
    evaluate: (p) => p.stats.gamesPlayed >= 5
  },
  {
    id: 'level_five',
    title: 'VIP Lounge Entry',
    desc: 'Reach Level 5 on your Casino Profile',
    reward: 500,
    icon: '👑',
    evaluate: (p) => p.level >= 5
  }
];

export const LobbyAchievements: React.FC<LobbyAchievementsProps> = ({ profile, onClaimReward }) => {
  const [claimedList, setClaimedList] = useState<string[]>([]);

  // Load claimed achievements from localStorage to persist
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`claimed_achievements_${profile.name || 'default'}`);
      if (saved) {
        setClaimedList(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading achievements', e);
    }
  }, [profile.name]);

  const handleClaim = (ach: Achievement) => {
    if (claimedList.includes(ach.id)) return;
    
    // Add to claimed list
    const updated = [...claimedList, ach.id];
    setClaimedList(updated);
    try {
      localStorage.setItem(`claimed_achievements_${profile.name || 'default'}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    // Reward player
    onClaimReward(ach.reward, `Unlocked Achievement: ${ach.title}`);
  };

  return (
    <div id="lobby-achievements-section" className="space-y-4">
      <div className="flex justify-between items-center text-left">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Casino Achievements & Badges
          </h3>
          <p className="text-[10px] text-white/40 font-mono uppercase">Master different milestones to earn large chip bonuses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ACHIEVEMENTS_LIST.map((ach) => {
          const isUnlocked = ach.evaluate(profile);
          const isClaimed = claimedList.includes(ach.id);

          return (
            <motion.div
              key={ach.id}
              whileHover={isUnlocked && !isClaimed ? { scale: 1.01 } : {}}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-36 relative overflow-hidden transition-all duration-300 ${
                isClaimed
                  ? 'bg-emerald-950/20 border-emerald-500/10 text-white/40'
                  : isUnlocked
                    ? 'bg-[#0a0a1f]/90 border-amber-400/30 shadow-lg shadow-amber-400/5'
                    : 'bg-white/5 border-white/5 text-white/40'
              }`}
            >
              {/* Top Row: Icon and Status Badge */}
              <div className="flex justify-between items-start">
                <span className="text-2xl filter drop-shadow">{ach.icon}</span>
                
                {isClaimed ? (
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> CLAIMED
                  </span>
                ) : isUnlocked ? (
                  <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full animate-pulse">
                    UNLOCKED
                  </span>
                ) : (
                  <span className="text-[9px] font-mono font-bold text-white/20 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> LOCKED
                  </span>
                )}
              </div>

              {/* Title & Desc */}
              <div className="space-y-1">
                <h4 className={`text-xs font-bold leading-tight ${isClaimed ? 'text-white/40 line-through' : 'text-white'}`}>
                  {ach.title}
                </h4>
                <p className="text-[10px] text-white/50 leading-tight">
                  {ach.desc}
                </p>
              </div>

              {/* Bottom Reward Button / Details */}
              <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-amber-400 font-mono font-semibold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" /> +{ach.reward}
                </span>

                {isUnlocked && !isClaimed && (
                  <button
                    id={`claim-achievement-${ach.id}`}
                    onClick={() => handleClaim(ach)}
                    className="text-[9px] font-sans font-bold uppercase px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Gift className="w-3 h-3" /> Claim
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
