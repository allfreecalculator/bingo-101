import React from 'react';
import { PlayerProfile } from '../types';
import { Award, ShieldAlert, Sparkles, Star, ChevronRight } from 'lucide-react';

interface LobbyPlayerProgressProps {
  profile: PlayerProfile;
}

export const LobbyPlayerProgress: React.FC<LobbyPlayerProgressProps> = ({ profile }) => {
  const xpNeeded = profile.level * 100;
  const progressPercent = Math.min(100, (profile.xp / xpNeeded) * 100);

  const getVipTier = (lvl: number) => {
    if (lvl >= 15) return { name: 'Platinum Elite VIP 💎', color: 'text-sky-400 border-sky-400/30 bg-sky-400/5', desc: 'Unlimited Faucet limits & +50% Quest multipliers' };
    if (lvl >= 10) return { name: 'Vegas Gold Legend 👑', color: 'text-amber-400 border-amber-400/30 bg-amber-400/5', desc: 'Double hourly claim value & private high-stakes access' };
    if (lvl >= 5) return { name: 'Regular Silver Cardholder 🃏', color: 'text-slate-300 border-slate-300/30 bg-slate-300/5', desc: 'Earn +20% more chips from the Fortune Wheel' };
    return { name: 'Casino Bronze Apprentice 🥉', color: 'text-amber-600 border-amber-600/30 bg-amber-600/5', desc: 'Standard Faucet & Classic 75-Ball card buy-ins' };
  };

  const tier = getVipTier(profile.level);

  return (
    <div id="lobby-player-progress-section" className="space-y-4">
      <div className="flex justify-between items-center text-left">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Player Progress & VIP Club
          </h3>
          <p className="text-[10px] text-white/40 font-mono uppercase">Your active status and exclusive floor perks</p>
        </div>
      </div>

      <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col md:flex-row gap-6 justify-between items-center">
        {/* Left column: Level badge & bar */}
        <div className="w-full md:w-3/5 space-y-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-black font-black font-mono text-lg flex items-center justify-center shadow-lg shadow-amber-400/10">
              {profile.level}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Level {profile.level} High Roller <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              </h4>
              <p className="text-[10px] font-mono text-white/40 uppercase">XP Level Up Requirement</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div 
                className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full transition-all duration-1000" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/30 font-mono font-bold">
              <span>{profile.xp} XP</span>
              <span>{xpNeeded} XP TOTAL</span>
            </div>
          </div>
        </div>

        {/* Right column: VIP Card */}
        <div className={`w-full md:w-2/5 p-4 rounded-2xl border ${tier.color} text-left space-y-2 relative group overflow-hidden`}>
          <div className="absolute top-1 right-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Star className="w-24 h-24 fill-current text-white" />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/40">CURRENT CLUB TIER</span>
            <Star className="w-4 h-4 text-amber-400 fill-current" />
          </div>
          
          <h5 className="text-xs font-black uppercase tracking-tight text-white">
            {tier.name}
          </h5>
          
          <p className="text-[10px] text-white/60 leading-normal">
            {tier.desc}
          </p>
          
          <div className="pt-1.5 flex items-center gap-1 text-[8px] font-mono font-bold text-white/40 uppercase">
            LEVEL UP TO UNLOCK NEW TIERS <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
