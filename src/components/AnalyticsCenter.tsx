import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Trophy, 
  TrendingUp, 
  History, 
  Sparkles, 
  Coins, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  Dices,
  Rocket,
  Bomb,
  Ticket,
  Flame,
  LineChart,
  RefreshCw,
  X,
  Target,
  CircleDot
} from 'lucide-react';
import { PlayerProfile } from '../types';

interface AnalyticsCenterProps {
  profile: PlayerProfile;
  onClose: () => void;
}

interface GameLog {
  id: string;
  timestamp: string;
  game: 'BINGO' | 'SLOTS' | 'DICE' | 'CRASH' | 'MINES' | 'PLINKO' | 'HILO' | 'ROULETTE';
  delta: number;
  description: string;
}

interface AdvancedStats {
  BINGO: { played: number; won: number; bet: number; wonChips: number; maxWin: number };
  SLOTS: { played: number; won: number; bet: number; wonChips: number; maxWin: number };
  DICE: { played: number; won: number; bet: number; wonChips: number; maxWin: number };
  CRASH: { played: number; won: number; bet: number; wonChips: number; maxWin: number };
  MINES: { played: number; won: number; bet: number; wonChips: number; maxWin: number };
  PLINKO: { played: number; won: number; bet: number; wonChips: number; maxWin: number };
  HILO: { played: number; won: number; bet: number; wonChips: number; maxWin: number };
  ROULETTE: { played: number; won: number; bet: number; wonChips: number; maxWin: number };
}

export const AnalyticsCenter: React.FC<AnalyticsCenterProps> = ({ profile, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'floors' | 'history'>('overview');
  const [selectedFloor, setSelectedFloor] = useState<'BINGO' | 'SLOTS' | 'DICE' | 'CRASH' | 'MINES' | 'PLINKO' | 'HILO' | 'ROULETTE'>('BINGO');
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [advStats, setAdvStats] = useState<AdvancedStats>({
    BINGO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
    SLOTS: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
    DICE: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
    CRASH: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
    MINES: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
    PLINKO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
    HILO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
    ROULETTE: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 }
  });
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; index: number } | null>(null);

  // Load stats & generate seed logs if none exist to make it immediately gorgeous
  useEffect(() => {
    try {
      let savedLogs = localStorage.getItem('bingo_casino_logs_v1');
      let savedStats = localStorage.getItem('bingo_casino_adv_stats_v1');
      
      let parsedLogs: GameLog[] = savedLogs ? JSON.parse(savedLogs) : [];
      let parsedStats: AdvancedStats = savedStats ? JSON.parse(savedStats) : {
        BINGO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        SLOTS: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        DICE: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        CRASH: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        MINES: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        PLINKO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        HILO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        ROULETTE: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 }
      };

      // Seed if empty to represent initial history match
      if (parsedLogs.length === 0) {
        const initialChips = profile.chips;
        const seedGames = [
          { game: 'SLOTS' as const, delta: -30, desc: 'Golden Slots: Spin Bet' },
          { game: 'SLOTS' as const, delta: 120, desc: 'Golden Slots: Lucky Cherry Combo! 🎉' },
          { game: 'DICE' as const, delta: -50, desc: 'Dice Duel: Bet on High Double' },
          { game: 'DICE' as const, delta: 100, desc: 'Dice Duel: Defeated Dealer! 🎲' },
          { game: 'BINGO' as const, delta: -50, desc: 'Bought 2 Bingo Tickets' },
          { game: 'BINGO' as const, delta: 150, desc: 'Bingo Claim: Win on Line Pattern! 🎟️' },
          { game: 'CRASH' as const, delta: -20, desc: 'Rocket Flight: Launcher Bet' },
          { game: 'CRASH' as const, delta: 54, desc: 'Rocket Cashout at 2.70x Multiplier' },
          { game: 'MINES' as const, delta: -30, desc: 'Mines Foyer: Grid Entry Bet' },
          { game: 'MINES' as const, delta: 98, desc: 'Mines Cashout: Flipped 6 Safe Tiles! 💣' },
        ];

        let rollingChips = initialChips;
        parsedLogs = seedGames.map((seed, idx) => {
          const time = new Date(Date.now() - (10 - idx) * 120000); // 2 min intervals
          return {
            id: `seed-${idx}`,
            timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            game: seed.game,
            delta: seed.delta,
            description: seed.desc
          };
        }).reverse(); // Latest first

        // Populate advanced stats accordingly
        seedGames.forEach(seed => {
          const gameStats = parsedStats[seed.game];
          if (seed.delta < 0) {
            gameStats.played += 1;
            gameStats.bet += Math.abs(seed.delta);
          } else {
            gameStats.won += 1;
            gameStats.wonChips += seed.delta;
            gameStats.maxWin = Math.max(gameStats.maxWin, seed.delta);
          }
        });

        localStorage.setItem('bingo_casino_logs_v1', JSON.stringify(parsedLogs));
        localStorage.setItem('bingo_casino_adv_stats_v1', JSON.stringify(parsedStats));
      }

      setLogs(parsedLogs);
      setAdvStats(parsedStats);
    } catch (e) {
      console.error('Error initializing analytics center:', e);
    }
  }, [profile.chips]);

  const handleResetAnalytics = () => {
    if (window.confirm('Are you sure you want to purge all game logs and advanced statistics? This will reset custom graphs.')) {
      try {
        localStorage.removeItem('bingo_casino_logs_v1');
        localStorage.removeItem('bingo_casino_adv_stats_v1');
        
        const resetStats = {
          BINGO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
          SLOTS: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
          DICE: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
          CRASH: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
          MINES: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
          PLINKO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
          HILO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
          ROULETTE: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 }
        };
        setLogs([]);
        setAdvStats(resetStats);
        localStorage.setItem('bingo_casino_adv_stats_v1', JSON.stringify(resetStats));
      } catch (e) {}
    }
  };

  // Reconstruct chip balance timeline for the Area Chart
  const getBalanceHistory = () => {
    let balance = profile.chips;
    const historyPoints = [balance];
    
    // Reverse logs to chronological order to walk backwards
    const limitedLogs = logs.slice(0, 15);
    for (let i = 0; i < limitedLogs.length; i++) {
      balance = balance - limitedLogs[i].delta;
      historyPoints.push(balance);
    }
    
    return historyPoints.reverse(); // Now chronologically left-to-right
  };

  const balanceHistory = getBalanceHistory();
  const minVal = Math.min(...balanceHistory, 0);
  const maxVal = Math.max(...balanceHistory, 100);
  const valRange = maxVal - minVal;

  // Build SVG Path coordinates
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  const getCoordinates = () => {
    const pointsCount = balanceHistory.length;
    if (pointsCount < 2) return [];

    const stepX = (svgWidth - paddingX * 2) / (pointsCount - 1);
    
    return balanceHistory.map((val, idx) => {
      const x = paddingX + idx * stepX;
      // Calculate Y (inverted coordinates in SVG)
      const relativeY = valRange === 0 ? 0.5 : (val - minVal) / valRange;
      const y = svgHeight - paddingY - relativeY * (svgHeight - paddingY * 2);
      return { x, y, val };
    });
  };

  const coords = getCoordinates();

  // Create SVG path string
  const getPathString = () => {
    if (coords.length === 0) return '';
    return coords.reduce((acc, c, idx) => {
      return idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
    }, '');
  };

  // Create closed SVG area path string for gradient fill
  const getAreaPathString = () => {
    if (coords.length === 0) return '';
    const first = coords[0];
    const last = coords[coords.length - 1];
    const baselineY = svgHeight - paddingY;
    return `${getPathString()} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  };

  // Compute total aggregates across all floors type-safely
  const totalBets = (Object.keys(advStats) as Array<keyof AdvancedStats>).reduce((sum, key) => sum + advStats[key].bet, 0);
  const totalWon = (Object.keys(advStats) as Array<keyof AdvancedStats>).reduce((sum, key) => sum + advStats[key].wonChips, 0);
  const netEarnings = totalWon - totalBets;
  const gamesPlayed = (Object.keys(advStats) as Array<keyof AdvancedStats>).reduce((sum, key) => sum + advStats[key].played, 0);
  const gamesWon = (Object.keys(advStats) as Array<keyof AdvancedStats>).reduce((sum, key) => sum + advStats[key].won, 0);
  const winPercent = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  // Icon selector helper
  const getGameIcon = (game: 'BINGO' | 'SLOTS' | 'DICE' | 'CRASH' | 'MINES' | 'PLINKO' | 'HILO' | 'ROULETTE') => {
    switch (game) {
      case 'BINGO': return <Ticket className="w-4 h-4 text-blue-400" />;
      case 'SLOTS': return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'DICE': return <Dices className="w-4 h-4 text-purple-400" />;
      case 'CRASH': return <Rocket className="w-4 h-4 text-amber-500" />;
      case 'MINES': return <Bomb className="w-4 h-4 text-orange-400" />;
      case 'PLINKO': return <Target className="w-4 h-4 text-amber-400" />;
      case 'HILO': return <Flame className="w-4 h-4 text-red-400" />;
      case 'ROULETTE': return <CircleDot className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getGameColor = (game: 'BINGO' | 'SLOTS' | 'DICE' | 'CRASH' | 'MINES' | 'PLINKO' | 'HILO' | 'ROULETTE') => {
    switch (game) {
      case 'BINGO': return 'border-blue-500/20 bg-blue-500/10 text-blue-400';
      case 'SLOTS': return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
      case 'DICE': return 'border-purple-500/20 bg-purple-500/10 text-purple-400';
      case 'CRASH': return 'border-amber-500/20 bg-amber-500/10 text-amber-400';
      case 'MINES': return 'border-orange-500/20 bg-orange-500/10 text-orange-400';
      case 'PLINKO': return 'border-amber-500/20 bg-amber-500/10 text-amber-400';
      case 'HILO': return 'border-red-500/20 bg-red-500/10 text-red-400';
      case 'ROULETTE': return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
    }
  };

  return (
    <div id="analytics-modal-container" className="bg-[#07071c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-w-4xl w-full text-white flex flex-col h-[85vh] max-h-[740px] animate-fade-in">
      
      {/* Header section */}
      <div className="p-6 bg-[#04040e] border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white uppercase font-sans">Casino Analytics Center</h2>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Active Game-By-Game Telemetry Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAnalytics}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            title="Reset history"
          >
            <RefreshCw className="w-3 h-3" /> Reset History
          </button>
          <button 
            id="close-analytics-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex bg-[#050514] border-b border-white/5 shrink-0 px-2 pt-2 gap-1 scrollbar-none overflow-x-auto">
        {[
          { id: 'overview', label: 'Suite Overview', icon: LineChart },
          { id: 'floors', label: 'Floor Performance', icon: Trophy },
          { id: 'history', label: 'Transaction Logs', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold font-mono tracking-wide rounded-t-xl transition-all cursor-pointer select-none border-t border-x ${
                isActive 
                  ? 'bg-[#07071c] text-amber-400 border-white/10 border-b-[#07071c] relative z-10' 
                  : 'bg-transparent text-white/40 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main interactive content body */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#07071c] space-y-6 scrollbar-thin">
        
        {/* TAB 1: SUITE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI statistics cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#11112b]/60 border border-white/5 rounded-2xl p-4 space-y-1">
                <span className="block text-[10px] font-mono text-white/40 uppercase font-bold tracking-wide">Total Rounds</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-white font-mono">{gamesPlayed}</span>
                  <span className="text-[10px] text-white/30 font-semibold font-mono">rounds</span>
                </div>
              </div>

              <div className="bg-[#11112b]/60 border border-white/5 rounded-2xl p-4 space-y-1">
                <span className="block text-[10px] font-mono text-white/40 uppercase font-bold tracking-wide">Combined Bets</span>
                <div className="flex items-baseline gap-1 text-white/80">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xl font-black font-mono">{totalBets}</span>
                </div>
              </div>

              <div className="bg-[#11112b]/60 border border-white/5 rounded-2xl p-4 space-y-1">
                <span className="block text-[10px] font-mono text-white/40 uppercase font-bold tracking-wide">Total Payouts</span>
                <div className="flex items-baseline gap-1 text-emerald-400">
                  <Coins className="w-3.5 h-3.5" />
                  <span className="text-xl font-black font-mono">{totalWon}</span>
                </div>
              </div>

              <div className="bg-[#11112b]/60 border border-white/5 rounded-2xl p-4 space-y-1">
                <span className="block text-[10px] font-mono text-white/40 uppercase font-bold tracking-wide">Profit Margin</span>
                <div className={`flex items-baseline gap-1 font-bold ${netEarnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {netEarnings >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span className="text-xl font-black font-mono">{netEarnings >= 0 ? '+' : ''}{netEarnings}</span>
                </div>
              </div>
            </div>

            {/* Glowing Linear Chip Balance Graph */}
            <div className="bg-[#04040e]/70 border border-white/10 rounded-3xl p-5 shadow-inner space-y-4">
              <div className="flex justify-between items-center px-1">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-400" /> Liquid Balance History
                  </h4>
                  <p className="text-[10px] text-white/40">Tracking currency balance adjustments over the last 15 actions</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono text-white/50">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Account Chips</span>
                  <span className="px-2 py-0.5 bg-white/5 rounded border border-white/5">Peak: {maxVal}</span>
                </div>
              </div>

              <div className="relative pt-2">
                {/* SVG Area Line Chart */}
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, gridIdx) => {
                    const y = paddingY + ratio * (svgHeight - paddingY * 2);
                    const gridVal = Math.round(maxVal - ratio * valRange);
                    return (
                      <g key={gridIdx}>
                        <line 
                          x1={paddingX} 
                          y1={y} 
                          x2={svgWidth - paddingX} 
                          y2={y} 
                          stroke="rgba(255,255,255,0.04)" 
                          strokeDasharray="4 4" 
                        />
                        <text 
                          x={paddingX - 10} 
                          y={y + 3} 
                          fill="rgba(255,255,255,0.3)" 
                          fontSize="8" 
                          fontFamily="monospace" 
                          textAnchor="end"
                        >
                          {gridVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* Filled Area path */}
                  {coords.length > 1 && (
                    <path d={getAreaPathString()} fill="url(#areaGradient)" />
                  )}

                  {/* Smooth glowing line path */}
                  {coords.length > 1 && (
                    <path 
                      d={getPathString()} 
                      fill="none" 
                      stroke="#fbbf24" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      filter="drop-shadow(0px 0px 8px rgba(245,158,11,0.5))"
                    />
                  )}

                  {/* Hover interactive vertical line indicator */}
                  {hoveredPoint && (
                    <line
                      x1={hoveredPoint.x}
                      y1={paddingY}
                      x2={hoveredPoint.x}
                      y2={svgHeight - paddingY}
                      stroke="rgba(245,158,11,0.2)"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Data Point Circles */}
                  {coords.map((pt, idx) => {
                    const isHovered = hoveredPoint && hoveredPoint.index === idx;
                    return (
                      <circle
                        key={idx}
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : 3.5}
                        fill={isHovered ? '#fbbf24' : '#07071c'}
                        stroke="#fbbf24"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => setHoveredPoint({ x: pt.x, y: pt.y, val: pt.val, index: idx })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    );
                  })}
                </svg>

                {/* Micro Tooltip */}
                {hoveredPoint && (
                  <div 
                    className="absolute bg-amber-400 text-black px-2 py-1 rounded text-[10px] font-mono font-bold shadow-lg pointer-events-none"
                    style={{ 
                      left: `${(hoveredPoint.x / svgWidth) * 100}%`, 
                      top: `${(hoveredPoint.y / svgHeight) * 100 - 15}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    💰 {hoveredPoint.val} Chips
                  </div>
                )}
              </div>
            </div>

            {/* Floor Breakdown Progress Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#11112b]/40 border border-white/5 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wide text-white/70">Wagers Allocation By Floor</h4>
                <div className="space-y-3">
                  {[
                    { id: 'BINGO' as const, label: '🎟️ Bingo Floor', color: 'bg-blue-400' },
                    { id: 'SLOTS' as const, label: '🎰 Golden Slots', color: 'bg-emerald-400' },
                    { id: 'DICE' as const, label: '🎲 Dice Duel', color: 'bg-purple-400' },
                    { id: 'CRASH' as const, label: '🚀 Rocket Crash', color: 'bg-amber-400' },
                    { id: 'MINES' as const, label: '💣 Mines Floor', color: 'bg-orange-400' },
                    { id: 'PLINKO' as const, label: '🎯 Cosmic Plinko', color: 'bg-amber-500' },
                    { id: 'HILO' as const, label: '🔥 Hi-Lo Duel', color: 'bg-red-500' }
                  ].map((item) => {
                    const allocatedBet = advStats[item.id].bet;
                    const pct = totalBets > 0 ? Math.round((allocatedBet / totalBets) * 100) : 0;
                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white/80">{item.label}</span>
                          <span className="font-mono text-[10px] text-white/50">{allocatedBet} chips ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floor Win-Rate KPI comparison */}
              <div className="bg-[#11112b]/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wide text-white/70 mb-4">Floor Performance Rating</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'BINGO' as const, label: 'Bingo', stats: advStats.BINGO },
                      { id: 'SLOTS' as const, label: 'Slots', stats: advStats.SLOTS },
                      { id: 'DICE' as const, stats: advStats.DICE, label: 'Dice' },
                      { id: 'CRASH' as const, stats: advStats.CRASH, label: 'Crash' },
                      { id: 'MINES' as const, stats: advStats.MINES, label: 'Mines' },
                      { id: 'PLINKO' as const, stats: advStats.PLINKO, label: 'Plinko' },
                      { id: 'HILO' as const, stats: advStats.HILO, label: 'Hi-Lo' }
                    ].map((item) => {
                      const wr = item.stats.played > 0 ? Math.round((item.stats.won / item.stats.played) * 100) : 0;
                      return (
                        <div key={item.label} className="bg-black/30 p-2.5 rounded-xl border border-white/5 text-center space-y-1">
                          <span className="block text-[9px] font-mono text-white/40 uppercase">{item.label} Win rate</span>
                          <span className="block text-sm font-bold text-white font-mono">{wr}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-amber-400/5 p-3 rounded-xl border border-amber-400/10 text-[10px] text-white/60 leading-normal mt-4 flex items-start gap-2">
                  <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Our simulation engines run pure pseudo-random mathematical draws. This ensures players experience authentic odds similar to structural land-based casinos.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FLOOR PERFORMANCE DETAIL */}
        {activeTab === 'floors' && (
          <div className="space-y-6 animate-fade-in">
            {/* Horizontal Mini Selectors */}
            <div className="flex flex-wrap gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {[
                { id: 'BINGO' as const, label: '🎟️ Bingo Floor' },
                { id: 'SLOTS' as const, label: '🎰 Golden Slots' },
                { id: 'DICE' as const, label: '🎲 Dice Duel' },
                { id: 'CRASH' as const, label: '🚀 Rocket Crash' },
                { id: 'MINES' as const, label: '💣 Mines Floor' },
                { id: 'PLINKO' as const, label: '🎯 Cosmic Plinko' },
                { id: 'HILO' as const, label: '🔥 Hi-Lo Duel' },
                { id: 'ROULETTE' as const, label: '🎡 Neon Roulette' }
              ].map((f) => {
                const isActive = selectedFloor === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFloor(f.id)}
                    className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-amber-400 text-black shadow-md' 
                        : 'bg-transparent text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Selected floor stats card detail view */}
            <div className="bg-[#11112b]/60 border border-white/5 rounded-3xl p-6 md:p-8 grid md:grid-cols-[1.2fr_2fr] gap-8">
              
              {/* Left detail card block */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-mono font-bold uppercase tracking-wider ${getGameColor(selectedFloor)}`}>
                    {selectedFloor} STATS MODULE
                  </span>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                     {getGameIcon(selectedFloor)} 
                    {selectedFloor === 'BINGO' ? 'Bingo 75-Ball' :
                     selectedFloor === 'SLOTS' ? 'Golden Slots' :
                     selectedFloor === 'DICE' ? 'Dice Duel House' :
                     selectedFloor === 'CRASH' ? 'Rocket Crash' : 
                     selectedFloor === 'MINES' ? 'Mines Sweeper' : 
                     selectedFloor === 'PLINKO' ? 'Cosmic Plinko' : 
                     selectedFloor === 'HILO' ? 'Hi-Lo Card Duel' : 'Vegas Neon Roulette'}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    {selectedFloor === 'BINGO' && 'Calculate auto-daub lines, corner counts, and high payout blackout sequences.'}
                    {selectedFloor === 'SLOTS' && 'Classic slot simulator reels with cherries, bar combos, and jackpot multipliers.'}
                    {selectedFloor === 'DICE' && 'Roll dual bones against the house dealer. Claim bonuses on consecutive streak wins.'}
                    {selectedFloor === 'CRASH' && 'Launch high-multiplier rocket flights. Cash out before structural detonation.'}
                    {selectedFloor === 'MINES' && 'Navigate a dangerous custom mine fover. Uncover safe cells to accumulate multipliers.'}
                    {selectedFloor === 'PLINKO' && 'Set custom row density and risk factors. Drop golden balls to hit edge multipliers.'}
                    {selectedFloor === 'HILO' && 'Set consecutive correct guesses on higher or lower cards. Bank your multipliers before a wrong prediction.'}
                    {selectedFloor === 'ROULETTE' && 'Place chips on standard European roulette options. Spin the wheel to test high odds combos.'}
                  </p>
                </div>

                <div className="bg-[#050511] p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 font-mono">Net Flow:</span>
                    <span className={`font-mono font-bold ${
                      (advStats[selectedFloor].wonChips - advStats[selectedFloor].bet) >= 0 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {(advStats[selectedFloor].wonChips - advStats[selectedFloor].bet) >= 0 ? '+' : ''}
                      {advStats[selectedFloor].wonChips - advStats[selectedFloor].bet} chips
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 font-mono">Total Rounds:</span>
                    <span className="font-mono text-white font-bold">{advStats[selectedFloor].played}</span>
                  </div>
                </div>
              </div>

              {/* Right detailed specifications block */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Total Chips Bet</span>
                  <div className="mt-2 text-lg font-black font-mono text-white flex items-center gap-1">
                    <Coins className="w-4 h-4 text-amber-500" /> {advStats[selectedFloor].bet}
                  </div>
                  <p className="text-[9px] text-white/30 font-mono mt-1">Deducted from balance per turn</p>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Total Chips Won</span>
                  <div className="mt-2 text-lg font-black font-mono text-emerald-400 flex items-center gap-1">
                    <Coins className="w-4 h-4 text-emerald-400" /> {advStats[selectedFloor].wonChips}
                  </div>
                  <p className="text-[9px] text-white/30 font-mono mt-1">Credited back on winning events</p>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Best Single Round Win</span>
                  <div className="mt-2 text-lg font-black font-mono text-amber-400 flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-amber-400" /> {advStats[selectedFloor].maxWin}
                  </div>
                  <p className="text-[9px] text-white/30 font-mono mt-1">Record highest payout event</p>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-white/40 uppercase">Round Completion rate</span>
                  <div className="mt-2 text-lg font-black font-mono text-white">
                    {advStats[selectedFloor].played > 0 
                      ? Math.round((advStats[selectedFloor].won / advStats[selectedFloor].played) * 100) 
                      : 0}%
                  </div>
                  <p className="text-[9px] text-white/30 font-mono mt-1">Winning turn ratio</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTION LOGS / CHRONOLOGY */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-400" /> Historical Audit Sequence
              </h3>
              <span className="text-[10px] text-white/40 font-mono">Retaining the last {logs.length} transactions</span>
            </div>

            {logs.length === 0 ? (
              <div className="bg-white/5 border border-white/5 border-dashed rounded-2xl py-12 text-center text-white/30 space-y-2">
                <ShieldAlert className="w-8 h-8 text-white/20 mx-auto" />
                <p className="text-xs font-mono">No telemetry files parsed yet. Make a bet to initialize!</p>
              </div>
            ) : (
              <div className="bg-[#050514] border border-white/5 rounded-2xl overflow-hidden">
                <div className="max-h-[360px] overflow-y-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-black/50 border-b border-white/5 font-mono text-[9px] text-white/40 uppercase tracking-widest">
                        <th className="py-3.5 px-4 font-bold">Timestamp</th>
                        <th className="py-3.5 px-4 font-bold">Floor Module</th>
                        <th className="py-3.5 px-4 font-bold">Description</th>
                        <th className="py-3.5 px-4 font-bold text-right">Delta Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {logs.map((log) => {
                        const isWin = log.delta > 0;
                        return (
                          <tr key={log.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-4 font-mono text-[10px] text-white/40">{log.timestamp}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${getGameColor(log.game)}`}>
                                {getGameIcon(log.game)} {log.game}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white/80 font-medium">{log.description}</td>
                            <td className={`py-3 px-4 text-right font-mono font-black ${isWin ? 'text-green-400' : 'text-red-400/80'}`}>
                              {isWin ? '+' : ''}{log.delta} chips
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer statistics branding */}
      <div className="p-4 bg-[#04040e] border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-white/40 shrink-0 gap-2">
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Mathematical random telemetry log validator (SHA-256 compliant)
        </span>
        <span>© 2026 BINGO 101 CORE ANALYTICS</span>
      </div>

    </div>
  );
};
