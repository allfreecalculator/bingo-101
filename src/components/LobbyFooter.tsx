import React from 'react';
import { ShieldCheck, Lock, HeartHandshake, HelpCircle } from 'lucide-react';

interface LobbyFooterProps {
  onOpenAcademy: () => void;
  onOpenPolicies?: () => void;
}

export const LobbyFooter: React.FC<LobbyFooterProps> = ({ onOpenAcademy, onOpenPolicies }) => {
  return (
    <footer id="lobby-footer-section" className="border-t border-white/10 pt-8 pb-12 mt-12 space-y-6 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Brand & Description */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎟️</span>
            <span className="font-sans font-black text-white uppercase tracking-wider text-sm">
              Bingo 101 <strong className="text-amber-400">Casino</strong>
            </span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed max-w-sm">
            The world's premium 75-Ball classic simulation suite. Learn game-theoretic bingo patterns, adjust speech calling rates, and master 24+ casino side games.
          </p>
        </div>

        {/* Center Column: Quick Navigation */}
        <div className="space-y-3">
          <h5 className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest">
            Floor Directory
          </h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={onOpenAcademy}
              className="text-white/40 hover:text-amber-400 text-[11px] transition-colors self-start text-left"
            >
              📖 Academy Manual
            </button>
            <span className="text-white/20 text-[11px]">🎰 24+ Vegas Slots</span>
            <span className="text-white/20 text-[11px]">📈 Multipliers</span>
            <span className="text-white/20 text-[11px]">🔮 Specialty Games</span>
            {onOpenPolicies && (
              <button
                onClick={onOpenPolicies}
                className="text-white/40 hover:text-amber-400 text-[11px] transition-colors self-start text-left"
              >
                ⚖️ Privacy & Policies
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Trust and Standards */}
        <div className="space-y-2.5">
          <h5 className="text-[10px] font-mono font-bold text-white/70 uppercase tracking-widest">
            Simulated Gaming Standards
          </h5>
          <div className="space-y-1.5 text-[10px] text-white/40 leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-400/80">
              <ShieldCheck className="w-3.5 h-3.5" /> Certified Simulated RNG Play
            </div>
            <div className="flex items-center gap-1.5 text-amber-400/80">
              <HeartHandshake className="w-3.5 h-3.5" /> Simulated Social Responsibility
            </div>
            <div className="flex items-center gap-1.5 text-sky-400/80">
              <Lock className="w-3.5 h-3.5" /> Encrypted Device Persistence
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Regulatory / Fun Disclaimer */}
      <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] text-white/30 font-mono">
        <p className="max-w-2xl leading-normal text-center sm:text-left">
          DISCLAIMER: Bingo 101 Casino is an interactive training app and social casino simulated strictly for fun and educational purposes. No real money gambling or actual cash payouts can occur. Play responsibly.
        </p>
        <span className="flex-shrink-0">
          © 2026 BINGO 101 CASINO. ALL RIGHTS SIMULATED.
        </span>
      </div>
    </footer>
  );
};
