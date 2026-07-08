import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PatternType, BingoCardData, BingoCell } from '../types';
import { getPatternDisplayName, getPatternMultiplier } from '../utils/bingoEngine';
import { BookOpen, Star, HelpCircle, Trophy, Play, Award, Volume2, ShieldAlert } from 'lucide-react';

interface BingoAcademyProps {
  onClose?: () => void;
  onSelectPattern?: (pattern: PatternType) => void;
}

export const BingoAcademy: React.FC<BingoAcademyProps> = ({ onClose, onSelectPattern }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'patterns' | 'tips'>('rules');
  const [selectedPattern, setSelectedPattern] = useState<PatternType>(PatternType.LINE);

  // Hardcode a static card for demonstrating patterns
  const demoCardGrid: BingoCell[][] = [
    [
      { number: 12, daubed: false, column: 'B' },
      { number: 18, daubed: false, column: 'I' },
      { number: 35, daubed: false, column: 'N' },
      { number: 52, daubed: false, column: 'G' },
      { number: 64, daubed: false, column: 'O' }
    ],
    [
      { number: 4, daubed: false, column: 'B' },
      { number: 22, daubed: false, column: 'I' },
      { number: 41, daubed: false, column: 'N' },
      { number: 48, daubed: false, column: 'G' },
      { number: 70, daubed: false, column: 'O' }
    ],
    [
      { number: 15, daubed: false, column: 'B' },
      { number: 29, daubed: false, column: 'I' },
      { number: null, daubed: true, column: 'N' }, // FREE
      { number: 57, daubed: false, column: 'G' },
      { number: 61, daubed: false, column: 'O' }
    ],
    [
      { number: 9, daubed: false, column: 'B' },
      { number: 25, daubed: false, column: 'I' },
      { number: 38, daubed: false, column: 'N' },
      { number: 59, daubed: false, column: 'G' },
      { number: 68, daubed: false, column: 'O' }
    ],
    [
      { number: 1, daubed: false, column: 'B' },
      { number: 30, daubed: false, column: 'I' },
      { number: 44, daubed: false, column: 'N' },
      { number: 46, daubed: false, column: 'G' },
      { number: 73, daubed: false, column: 'O' }
    ]
  ];

  // Pattern definition indices
  const getPatternIndices = (pattern: PatternType): [number, number][] => {
    switch (pattern) {
      case PatternType.LINE:
        return [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]; // Top row demo line
      case PatternType.FOUR_CORNERS:
        return [[0, 0], [0, 4], [4, 0], [4, 4]];
      case PatternType.LETTER_X:
        return [
          [0, 0], [1, 1], [2, 2], [3, 3], [4, 4],
          [0, 4], [1, 3], [3, 1], [4, 0]
        ];
      case PatternType.PLUS_SIGN:
        return [
          [2, 0], [2, 1], [2, 2], [2, 3], [2, 4],
          [0, 2], [1, 2], [3, 2], [4, 2]
        ];
      case PatternType.BLACKOUT:
        const indices: [number, number][] = [];
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) indices.push([r, c]);
        }
        return indices;
    }
  };

  const patternIndices = getPatternIndices(selectedPattern);

  const getPatternExplanation = (pattern: PatternType): string => {
    switch (pattern) {
      case PatternType.LINE:
        return 'Any full horizontal row, vertical column, or diagonal line. Perfect for quick wins and fast-paced rounds!';
      case PatternType.FOUR_CORNERS:
        return 'Saturate all 4 outermost corners of your card (top-left, top-right, bottom-left, bottom-right). Requires high concentration!';
      case PatternType.LETTER_X:
        return 'Complete both major diagonal lines intersecting directly in the center FREE space. A classic casino pattern with a generous payout!';
      case PatternType.PLUS_SIGN:
        return 'Complete the entire middle horizontal row and middle vertical column. Looks like a giant plus (+) or cross on your card.';
      case PatternType.BLACKOUT:
        return 'Cover every single slot on your card! The ultimate bingo achievement. Extremely high difficulty with a massive jackpot multiplier!';
    }
  };

  return (
    <div className="bg-[#0a0a1f] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Decorative gradient light */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-400/10 rounded-xl border border-amber-500/20 text-amber-400">
            <BookOpen className="w-5.5 h-5.5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Bingo 101 Academy</h2>
            <p className="text-xs text-white/50">Master casino-style Bingo rules, patterns, and payouts</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all text-xs font-mono"
          >
            Exit Academy
          </button>
        )}
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 p-1 bg-[#05050a]/60 rounded-xl border border-white/10 mb-6">
        {[
          { id: 'rules', label: '1. How to Play', icon: HelpCircle },
          { id: 'patterns', label: '2. Winning Patterns', icon: Trophy },
          { id: 'tips', label: '3. Professional Tips', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] font-bold'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'rules' && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="space-y-4 text-sm text-white/80 leading-relaxed">
              <div className="bg-[#111126]/80 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                  <span className="text-xs bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded">B-I-N-G-O</span> 
                  Card Breakdown
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  A Bingo 75 card has 5 rows and 5 columns containing 24 random numbers and a middle <strong>FREE Space</strong>. Numbers are grouped logically by column:
                </p>
                <div className="grid grid-cols-5 gap-1.5 mt-3 text-center text-[10px] font-mono">
                  <div className="p-1 bg-blue-500/10 border border-blue-500/20 rounded text-blue-300"><b className="block text-xs text-blue-400">B</b>1-15</div>
                  <div className="p-1 bg-red-500/10 border border-red-500/20 rounded text-red-300"><b className="block text-xs text-red-400">I</b>16-30</div>
                  <div className="p-1 bg-purple-500/10 border border-purple-500/20 rounded text-purple-300"><b className="block text-xs text-purple-400">N</b>31-45</div>
                  <div className="p-1 bg-green-500/10 border border-green-500/20 rounded text-green-300"><b className="block text-xs text-green-400">G</b>46-60</div>
                  <div className="p-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-300"><b className="block text-xs text-yellow-400">O</b>61-75</div>
                </div>
              </div>

              <div className="bg-[#111126]/80 p-4 rounded-xl border border-white/10">
                <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" /> Game Mechanics
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-white/60">
                  <li>Choose to purchase <strong>1, 2, 3, or 4 tickets</strong> for the round.</li>
                  <li>Select a target pattern (e.g. Letter X) to set your winning goal.</li>
                  <li>The Live Caller draws randomized balls B1 to O75.</li>
                  <li>Stamp (daub) the numbers on your cards as they are drawn.</li>
                  <li>When you complete the pattern, hit <strong>BINGO!</strong> instantly.</li>
                </ol>
              </div>
            </div>

            <div className="space-y-4 bg-[#111126]/40 p-5 rounded-2xl border border-white/10">
              <h4 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" /> Manual vs Auto-Daub
              </h4>
              <p className="text-xs text-white/60 leading-relaxed">
                Our platform lets you customize your play style, just like in real casino halls:
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-[#05050a]/60 rounded-xl border border-white/10">
                  <span className="block text-xs font-bold text-red-400 mb-1">Manual Daub</span>
                  <p className="text-[10px] text-white/40">
                    Click each ticket square yourself. Yields a <strong>+25% XP and bonus chip payout</strong> for the added player focus required!
                  </p>
                </div>
                <div className="p-3 bg-[#05050a]/60 rounded-xl border border-white/10">
                  <span className="block text-xs font-bold text-green-400 mb-1">Auto-Daub</span>
                  <p className="text-[10px] text-white/40">
                    Sit back, relax, and let the casino engine stamp tickets automatically. Great for managing 4-ticket high-roller play!
                  </p>
                </div>
              </div>
              <div className="bg-amber-400/5 p-3 rounded-xl border border-amber-500/20 mt-4 flex gap-2 items-start">
                <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-300/90 leading-normal">
                  <strong>Watch out!</strong> Hitting the BINGO button when you do not actually have a pattern triggers a <strong>False Bingo penalty</strong>, deducting chips. Daub carefully!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'patterns' && (
          <motion.div
            key="patterns"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-[1.2fr_1fr] gap-6"
          >
            {/* Pattern Selector List */}
            <div className="space-y-2.5">
              {[
                PatternType.LINE,
                PatternType.FOUR_CORNERS,
                PatternType.LETTER_X,
                PatternType.PLUS_SIGN,
                PatternType.BLACKOUT,
              ].map((p) => {
                const isSelected = selectedPattern === p;
                return (
                  <div
                    key={p}
                    onClick={() => setSelectedPattern(p)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedPattern(p);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer outline-none focus:ring-1 focus:ring-amber-400/40 ${
                      isSelected
                        ? 'bg-amber-400/10 border-amber-400/50 text-white'
                        : 'bg-[#111126]/40 border-white/10 hover:border-white/20 text-white/50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                        Multiplier: {getPatternMultiplier(p).toFixed(1)}x
                      </span>
                      <span className={`font-sans font-bold text-sm ${isSelected ? 'text-amber-400' : 'text-white/80'}`}>
                        {getPatternDisplayName(p)}
                      </span>
                    </div>
                    {onSelectPattern && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPattern(p);
                        }}
                        className="px-2.5 py-1 text-[10px] bg-amber-400 text-black font-mono font-bold rounded hover:bg-amber-300 transition-colors shadow-md shadow-amber-500/15"
                      >
                        Select Goal
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pattern Visual Card Demo */}
            <div className="bg-[#111126]/30 border border-white/10 p-4 rounded-2xl flex flex-col items-center justify-between">
              <div className="text-center mb-3">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Interactive Demonstration</span>
                <p className="text-xs text-white/70 mt-1 font-sans px-3">
                  {getPatternExplanation(selectedPattern)}
                </p>
              </div>

              {/* Demo Mini Card Grid */}
              <div className="w-full max-w-[200px] border border-white/10 rounded-xl overflow-hidden bg-[#05050a] shadow-lg p-2.5">
                <div className="grid grid-cols-5 text-center text-xs font-black pb-1 mb-1 border-b border-white/10">
                  <span className="text-blue-400">B</span>
                  <span className="text-red-400">I</span>
                  <span className="text-purple-400">N</span>
                  <span className="text-green-400">G</span>
                  <span className="text-yellow-400">O</span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {demoCardGrid.map((rowCells, rIndex) =>
                    rowCells.map((cell, cIndex) => {
                      const isFree = cell.number === null;
                      const isMatch = patternIndices.some(([row, col]) => row === rIndex && col === cIndex);
                      
                      return (
                        <div
                          key={`${rIndex}-${cIndex}`}
                          className={`aspect-square rounded flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${
                            isFree
                              ? 'bg-amber-400/20 border border-amber-500/30 text-amber-300 text-[8px]'
                              : isMatch
                                ? 'bg-amber-400 text-black font-extrabold border border-amber-300 scale-105 shadow-md shadow-amber-500/10'
                                : 'bg-white/5 border border-white/5 text-white/20'
                          }`}
                        >
                          {isFree ? '★' : cell.number}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="text-[10px] text-white/30 text-center font-mono mt-3">
                Highlighted cells represents the winning configuration
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'tips' && (
          <motion.div
            key="tips"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <div className="space-y-4">
              <div className="flex gap-3 items-start p-3 bg-[#111126]/60 rounded-xl border border-white/10">
                <span className="text-lg">📈</span>
                <div>
                  <h5 className="font-bold text-white text-xs">Odds vs Payout Multipliers</h5>
                  <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                    Easy patterns like <strong>Line</strong> are completed quickly but pay smaller rewards. Harder patterns like <strong>Blackout</strong> pay a massive 15x chip multiplier! Balance your ticket purchase and patterns to build an optimal casino treasury.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-[#111126]/60 rounded-xl border border-white/10">
                <span className="text-lg">⚡</span>
                <div>
                  <h5 className="font-bold text-white text-xs">The High-Roller Multi-Card Strategy</h5>
                  <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                    Buying 4 tickets significantly increases your coverage odds, allowing you to hit Bingos much sooner. Use <strong>Auto-Daub</strong> when playing with 4 cards to ensure you never miss a number called during fast speeds!
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start p-3 bg-[#111126]/60 rounded-xl border border-white/10">
                <span className="text-lg">🎯</span>
                <div>
                  <h5 className="font-bold text-white text-xs">Manual Daub XP Stacking</h5>
                  <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                    If you want to level up your player profile and access higher tiers of casino achievements, toggle on <strong>Manual Daub</strong>. It offers extra experience points for each perfect stamp, allowing you to level up twice as fast.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-[#111126]/60 rounded-xl border border-white/10">
                <span className="text-lg">⏱️</span>
                <div>
                  <h5 className="font-bold text-white text-xs">Pace Management</h5>
                  <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                    If you are new to manual daubing, set the caller speed to <strong>Slow (5.0s)</strong>. Once you build confidence and quick coordination, bump it up to <strong>Fast (1.5s)</strong> for high-intensity action.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
