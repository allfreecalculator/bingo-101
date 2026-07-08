import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProfile, LeaderboardEntry } from '../types';
import { Trophy, Coins, Award, RefreshCw, BarChart2, Star, Sparkles } from 'lucide-react';

interface CasinoStatsProps {
  profile: PlayerProfile;
  onAddChips: (amount: number) => void;
}

// Fixed pool of bots for the leaderboard simulation
const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Vegas_Viper 🐍', chips: 2450, level: 12, avatar: '💎', isBot: true },
  { name: 'LadyLuck_777 🎰', chips: 1890, level: 9, avatar: '🍒', isBot: true },
  { name: 'Bingo_Baron 👑', chips: 1420, level: 7, avatar: '🎩', isBot: true },
  { name: 'GoldDigger ⛏️', chips: 950, level: 5, avatar: '🤠', isBot: true },
  { name: 'LuckyCharm 🍀', chips: 620, level: 4, avatar: '🍄', isBot: true },
];

export const CasinoStats: React.FC<CasinoStatsProps> = ({ profile, onAddChips }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wheelPrize, setWheelPrize] = useState<string | null>(null);
  const [wheelCooldown, setWheelCooldown] = useState(0); // seconds left
  const [cooldownDuration, setCooldownDuration] = useState<number>(30); // custom timer setting
  const [startTimerImmediately, setStartTimerImmediately] = useState<boolean>(true); // Cooldown starts instantly on spin click
  const [oneTimeMode, setOneTimeMode] = useState<boolean>(true); // Defaults to true per "only one time cool time" request
  const [hasSpun, setHasSpun] = useState<boolean>(false); // Track if one-time spin has been utilized
  const [autoStartOnSet, setAutoStartOnSet] = useState<boolean>(true); // Cooldown starts automatically when duration is set or changed
  const [oneTimeCooldown, setOneTimeCooldown] = useState<boolean>(true); // Cooldown is run only once
  const [cooldownUsed, setCooldownUsed] = useState<boolean>(false); // Whether the one-time cooldown has been triggered
  
  const isSpinningRef = useRef(false);

  // Wheel sectors
  const SECTORS = [
    { label: '50 Chips', value: 50 },
    { label: '15 Chips', value: 15 },
    { label: '100 Chips', value: 100 },
    { label: '25 Chips', value: 25 },
    { label: '500 Chips 🌟', value: 500 }, // Jackpot
    { label: '30 Chips', value: 30 },
    { label: '200 Chips', value: 200 },
    { label: '10 Chips', value: 10 },
  ];

  // Tick down wheel cooldown
  useEffect(() => {
    if (wheelCooldown > 0) {
      const timer = setTimeout(() => setWheelCooldown(wheelCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [wheelCooldown]);

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

  const handleSpinWheel = () => {
    if (wheelSpinning || wheelCooldown > 0 || isSpinningRef.current) return;
    if (oneTimeMode && hasSpun) return;

    isSpinningRef.current = true;
    setWheelSpinning(true);
    setWheelPrize(null);
    if (oneTimeMode) {
      setHasSpun(true);
    }

    // Pick a random sector
    const sectorIndex = Math.floor(Math.random() * SECTORS.length);
    const sectorAngle = 360 / SECTORS.length;
    // Calculate final rotation to align selected sector to top (270 degrees on wheel)
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full rotations
    const targetAngle = extraSpins * 360 + (360 - sectorIndex * sectorAngle);

    setWheelRotation(targetAngle);

    // One-time spin lock: start countdown/cooldown immediately on click
    if (startTimerImmediately) {
      if (!oneTimeCooldown || !cooldownUsed) {
        setWheelCooldown(cooldownDuration);
        setCooldownUsed(true);
      }
    }

    setTimeout(() => {
      isSpinningRef.current = false;
      setWheelSpinning(false);
      const prize = SECTORS[sectorIndex];
      setWheelPrize(prize.label);
      onAddChips(prize.value);
      
      // If timer is NOT configured to start immediately on click, start it now
      if (!startTimerImmediately) {
        if (!oneTimeCooldown || !cooldownUsed) {
          setWheelCooldown(cooldownDuration);
          setCooldownUsed(true);
        }
      }
    }, 4500);
  };

  const winRate = profile.stats.gamesPlayed > 0 
    ? Math.round((profile.stats.bingosWon / profile.stats.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* 1. Player Profile Statistics Dashboard */}
      <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <h3 className="text-sm font-semibold tracking-wider text-white/80 uppercase font-sans mb-4 pb-2 border-b border-white/10 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-amber-400" /> Casino Analytics
        </h3>

        <div className="grid grid-cols-2 gap-3.5 mb-4">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="block text-[10px] font-mono text-white/40 uppercase">Games Played</span>
            <span className="text-xl font-bold text-white font-mono">{profile.stats.gamesPlayed}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="block text-[10px] font-mono text-white/40 uppercase">Bingos Claimed</span>
            <span className="text-xl font-bold text-amber-400 font-mono flex items-center gap-1">
              <Trophy className="w-4 h-4" /> {profile.stats.bingosWon}
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="block text-[10px] font-mono text-white/40 uppercase">Win Rate</span>
            <span className="text-xl font-bold text-green-400 font-mono">{winRate}%</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="block text-[10px] font-mono text-white/40 uppercase">Highest Payout</span>
            <span className="text-xl font-bold text-yellow-500 font-mono flex items-center gap-1">
              <Coins className="w-4 h-4" /> {profile.stats.highestWin}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-4 rounded-xl border border-amber-500/20 text-xs">
          <div className="flex justify-between items-center mb-1.5 text-amber-400 font-bold">
            <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> High Roller Rank</span>
            <span>LVL {profile.level}</span>
          </div>
          <p className="text-white/60 leading-normal mb-2 text-[11px]">
            Accumulate XP to climb higher. Currently ranked as: <strong className="text-white">
              {profile.level >= 10 ? 'VIP Legend' : profile.level >= 5 ? 'Vegas Regular' : 'Casino Apprentice'}
            </strong>
          </p>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
            <div 
              className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (profile.xp / (profile.level * 100)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/30 font-mono mt-1">
            <span>{profile.xp} XP</span>
            <span>{profile.level * 100} XP for Lvl {profile.level + 1}</span>
          </div>
        </div>
      </div>

      {/* 2. Casino Lucky Wheel Faucet */}
      <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-white/80 uppercase font-sans mb-1 pb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Lucky Fortune Wheel
          </h3>
          <p className="text-[11px] text-white/50 mb-4 leading-relaxed">
            Short on chips? Take a free spin to win up to <strong className="text-amber-400">500 Chips</strong> instantly!
          </p>
        </div>

        {/* Wheel layout */}
        <div className="flex items-center justify-center gap-6 my-2 relative">
          <div className="relative w-36 h-36 flex-shrink-0">
            {/* Pointer */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-amber-400 filter drop-shadow" />
            
            {/* Wheel Canvas Mock */}
            <div 
              className="w-full h-full rounded-full border-4 border-white/10 bg-gradient-to-tr from-[#05050a] to-[#111126] shadow-xl overflow-hidden relative flex items-center justify-center transition-transform duration-[4500ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            >
              {/* Center Pivot */}
              <div className="absolute w-5 h-5 rounded-full bg-amber-400 border-2 border-white z-10 shadow-lg" />
              
              {/* Grid segments */}
              {SECTORS.map((sec, idx) => {
                const angle = 360 / SECTORS.length;
                return (
                  <div
                    key={idx}
                    className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                    style={{ transform: `rotate(${idx * angle}deg)` }}
                  >
                    <div className="absolute top-2 text-[8px] font-mono font-bold tracking-tighter text-white/40 transform -translate-y-0.5">
                      {sec.label.replace(' Chips', '')}
                    </div>
                    {/* Dividers */}
                    <div className="absolute w-[1px] h-1/2 bg-white/5 origin-bottom bottom-1/2" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-2">
            <div className="bg-[#111126]/60 border border-white/5 p-2.5 rounded-xl text-center space-y-1">
              <span className="block text-[9px] font-mono text-white/40 uppercase tracking-widest">Status</span>
              {wheelSpinning ? (
                <span className="text-xs font-bold text-amber-400 block animate-pulse">
                  🎰 SPINNING... {wheelCooldown > 0 ? `(${wheelCooldown}s)` : ''}
                </span>
              ) : wheelCooldown > 0 ? (
                <span className="text-xs font-bold text-white/80 block font-mono">
                  ⏳ COOLDOWN: {wheelCooldown}s
                </span>
              ) : oneTimeMode && hasSpun ? (
                <span className="text-xs font-bold text-amber-300 block">
                  ✅ ONE-TIME SPIN USED
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-400 block">
                  ✨ READY TO SPIN!
                </span>
              )}
              {wheelPrize && !wheelSpinning && (
                <div className="pt-1.5 border-t border-white/5 mt-1.5 flex flex-col items-center">
                  <span className="block text-[8px] font-mono text-amber-300 uppercase tracking-wider">Last Reward</span>
                  <span className="text-xs font-extrabold text-white block">{wheelPrize}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSpinWheel}
              disabled={wheelSpinning || wheelCooldown > 0 || (oneTimeMode && hasSpun && !wheelSpinning)}
              className={`w-full py-2 px-3 rounded-xl font-bold font-sans text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                wheelSpinning || wheelCooldown > 0 || (oneTimeMode && hasSpun && !wheelSpinning)
                  ? 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 text-black font-extrabold cursor-pointer hover:shadow-amber-400/20 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${wheelSpinning ? 'animate-spin' : ''}`} />
              {wheelSpinning 
                ? 'Spinning...' 
                : (oneTimeMode && hasSpun) 
                  ? 'One-Time Spin Used' 
                  : 'Free Spin'}
            </button>

            {/* Set Cooldown / Set Time Controls */}
            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <div className="flex items-center justify-between px-1 bg-white/5 py-1 rounded-lg">
                <span className="text-[9px] font-mono text-white/60 uppercase font-bold tracking-wider">
                  Spin Mode
                </span>
                <div className="flex items-center gap-1">
                  {oneTimeMode && hasSpun && !wheelSpinning && (
                    <button
                      type="button"
                      onClick={() => {
                        setHasSpun(false);
                        setWheelCooldown(0);
                        setWheelPrize(null);
                        setCooldownUsed(false);
                      }}
                      className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-amber-400 text-black border border-amber-300 hover:bg-amber-300"
                      title="Reset state to spin again"
                    >
                      RESET
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setOneTimeMode(!oneTimeMode);
                      setHasSpun(false);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border transition-all ${
                      oneTimeMode
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                    }`}
                    title="Toggle One-Time vs Recurring Spin Cooldown"
                  >
                    {oneTimeMode ? 'ONE-TIME' : 'RECURRING'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 bg-white/5 py-1 rounded-lg">
                <span className="text-[9px] font-mono text-white/60 uppercase font-bold tracking-wider">
                  Timer Start on Click
                </span>
                <button
                  type="button"
                  onClick={() => setStartTimerImmediately(!startTimerImmediately)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border transition-all ${
                    startTimerImmediately
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                  title="One-time spin starts cooldown instantly on click"
                >
                  {startTimerImmediately ? 'INSTANT' : 'ON END'}
                </button>
              </div>

              <div className="flex items-center justify-between px-1 bg-white/5 py-1 rounded-lg">
                <span className="text-[9px] font-mono text-white/60 uppercase font-bold tracking-wider">
                  Auto Start on Set
                </span>
                <button
                  type="button"
                  onClick={() => setAutoStartOnSet(!autoStartOnSet)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border transition-all ${
                    autoStartOnSet
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                  title="Automatically start cooldown countdown when a new duration is set"
                >
                  {autoStartOnSet ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="flex items-center justify-between px-1 bg-white/5 py-1 rounded-lg">
                <span className="text-[9px] font-mono text-white/60 uppercase font-bold tracking-wider">
                  One-Time Cooldown
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOneTimeCooldown(!oneTimeCooldown);
                    if (!oneTimeCooldown) {
                      setCooldownUsed(false);
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase border transition-all ${
                    oneTimeCooldown
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                  title="Cooldown runs only once. Subsequent spins have no cooldown duration"
                >
                  {oneTimeCooldown ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest text-center">
                Set Spin Cooldown
              </span>
              <div className="flex gap-1 justify-center items-center">
                {[5, 10, 30, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => {
                      setCooldownDuration(sec);
                      if (autoStartOnSet) {
                        setWheelCooldown(sec);
                        setCooldownUsed(true);
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition-all ${
                      cooldownDuration === sec
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 border-transparent text-white/50 hover:border-white/10'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
                <input
                  type="number"
                  min="2"
                  max="3600"
                  value={cooldownDuration}
                  onChange={(e) => {
                    const val = Math.max(2, Math.min(3600, parseInt(e.target.value) || 2));
                    setCooldownDuration(val);
                    if (autoStartOnSet) {
                      setWheelCooldown(val);
                      setCooldownUsed(true);
                    }
                  }}
                  className="w-10 bg-white/5 border border-white/10 rounded text-center text-[9px] text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  title="Custom Seconds Cooldown"
                  placeholder="Custom"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Simulated Live Casino Leaderboard */}
      <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md">
        <h3 className="text-sm font-semibold tracking-wider text-white/80 uppercase font-sans mb-3 pb-2 border-b border-white/10 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Active Players Leaderboard
        </h3>

        <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
          {combinedLeaderboard.slice(0, 5).map((player, idx) => {
            const isSelf = !player.isBot;
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
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white/30 font-mono w-4">#{idx + 1}</span>
                  <span className="text-base">{player.avatar}</span>
                  <div className="flex flex-col">
                    <span className={`font-semibold ${isSelf ? 'text-amber-400 font-bold' : 'text-white/80'}`}>
                      {player.name}
                    </span>
                    <span className="text-[9px] font-mono text-white/30 font-semibold">LEVEL {player.level}</span>
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
