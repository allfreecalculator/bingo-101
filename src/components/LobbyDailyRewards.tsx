import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { PlayerProfile } from '../types';
import { Gift, Coins, Flame, Hourglass, Zap } from 'lucide-react';

interface LobbyDailyRewardsProps {
  profile: PlayerProfile;
  onAddChips: (amount: number, description: string) => void;
  triggerAlert: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const DAILY_REWARDS_VALUES = [100, 150, 200, 250, 350, 500, 1000];
const FAUCET_COOLDOWN_SEC = 3600; // 1 Hour

export const LobbyDailyRewards: React.FC<LobbyDailyRewardsProps> = ({ profile, onAddChips, triggerAlert }) => {
  // --- Daily Check-In State ---
  const [lastCheckIn, setLastCheckIn] = useState<string>(() => {
    return localStorage.getItem('earn_last_checkin') || '';
  });
  const [checkInStreak, setCheckInStreak] = useState<number>(() => {
    return parseInt(localStorage.getItem('earn_checkin_streak') || '0', 10);
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const checkedInToday = lastCheckIn === todayStr;

  // --- Hourly Faucet State ---
  const [faucetCooldown, setFaucetCooldown] = useState<number>(0);

  useEffect(() => {
    const lastClaim = localStorage.getItem('earn_last_faucet_claim');
    if (lastClaim) {
      const elapsed = Math.floor((Date.now() - parseInt(lastClaim, 10)) / 1000);
      if (elapsed < FAUCET_COOLDOWN_SEC) {
        setFaucetCooldown(FAUCET_COOLDOWN_SEC - elapsed);
      }
    }
  }, []);

  useEffect(() => {
    if (faucetCooldown > 0) {
      const interval = setInterval(() => {
        setFaucetCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [faucetCooldown]);

  const handleDailyCheckIn = () => {
    if (checkedInToday) {
      triggerAlert("You have already checked in today! Come back tomorrow.", "error");
      return;
    }

    let newStreak = checkInStreak + 1;
    if (newStreak > 7) {
      newStreak = 1; // reset streak back to 1
    }

    const reward = DAILY_REWARDS_VALUES[newStreak - 1];
    setLastCheckIn(todayStr);
    setCheckInStreak(newStreak);
    localStorage.setItem('earn_last_checkin', todayStr);
    localStorage.setItem('earn_checkin_streak', newStreak.toString());

    onAddChips(reward, `Daily Check-In Reward (Day ${newStreak})`);
    triggerAlert(`Claimed Day ${newStreak} check-in bonus of +${reward} Chips! 🎁`, "success");

    // Play chime audio
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {}
  };

  const handleFaucetClaim = () => {
    if (faucetCooldown > 0) {
      triggerAlert("Faucet is cooling down. Wait for the timer!", "error");
      return;
    }

    const faucetReward = 150;
    const now = Date.now();
    localStorage.setItem('earn_last_faucet_claim', now.toString());
    setFaucetCooldown(FAUCET_COOLDOWN_SEC);

    onAddChips(faucetReward, "Hourly Casino Faucet Claim");
    triggerAlert(`Hourly Faucet Claimed! Added +${faucetReward} Chips! ⚡`, "success");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="lobby-daily-rewards-section" className="space-y-4">
      <div className="flex justify-between items-center text-left">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-400 animate-bounce" /> Daily Rewards & Hourly Faucet
          </h3>
          <p className="text-[10px] text-white/40 font-mono uppercase">Collect your complementary chip grants regularly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2.5fr_1fr] gap-6">
        {/* Day check-in calendar card */}
        <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> 7-Day VIP Sign-in Calendar
            </span>
            <span className="text-[10px] text-white/60 font-mono">Streak: <strong className="text-amber-400">{checkInStreak} Days</strong></span>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {DAILY_REWARDS_VALUES.map((val, idx) => {
              const dayNum = idx + 1;
              const isPassed = dayNum < checkInStreak || (dayNum === checkInStreak && checkedInToday);
              const isCurrent = dayNum === checkInStreak && !checkedInToday;
              const isNext = dayNum === checkInStreak + 1 || (dayNum === 1 && checkInStreak === 7 && !checkedInToday);

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-center flex flex-col justify-between h-20 transition-all ${
                    isPassed
                      ? 'bg-emerald-950/20 border-emerald-500/20 text-white/30'
                      : isCurrent
                        ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)] text-white'
                        : 'bg-white/5 border-white/5 text-white/50'
                  }`}
                >
                  <span className="text-[8px] font-mono uppercase tracking-tighter">Day {dayNum}</span>
                  <span className="text-base filter drop-shadow">🎁</span>
                  <span className={`text-[9px] font-mono font-bold ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>+{val}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleDailyCheckIn}
            disabled={checkedInToday}
            className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg border cursor-pointer active:scale-98 ${
              checkedInToday
                ? 'bg-white/5 border-transparent text-white/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black border-yellow-300'
            }`}
          >
            {checkedInToday ? 'CLAIMED TODAY ✓' : 'CLAIM DAILY CHECK-IN BONUS'}
          </button>
        </div>

        {/* Faucet hourly desk card */}
        <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between text-left backdrop-blur-md">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> HOURLY FAUCET
            </span>
            <p className="text-[10px] text-white/50 leading-relaxed">
              Claim 150 bonus chips free every hour to stay active.
            </p>
          </div>

          <div className="text-center py-4">
            {faucetCooldown > 0 ? (
              <div className="flex flex-col items-center space-y-1">
                <Hourglass className="w-6 h-6 text-amber-400/60 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-xl font-mono font-bold text-white tracking-wider">
                  {formatTime(faucetCooldown)}
                </span>
                <span className="text-[8px] font-mono text-white/30 uppercase">Cooldown Active</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-1">
                <Gift className="w-6 h-6 text-emerald-400 animate-bounce" />
                <span className="text-xl font-mono font-black text-emerald-400 tracking-wider">
                  READY
                </span>
                <span className="text-[8px] font-mono text-white/30 uppercase">Instant Grant</span>
              </div>
            )}
          </div>

          <button
            onClick={handleFaucetClaim}
            disabled={faucetCooldown > 0}
            className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg border cursor-pointer active:scale-98 ${
              faucetCooldown > 0
                ? 'bg-white/5 border-transparent text-white/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-emerald-400/50'
            }`}
          >
            {faucetCooldown > 0 ? 'COOLING DOWN' : 'CLAIM 150 CHIPS'}
          </button>
        </div>
      </div>
    </div>
  );
};
