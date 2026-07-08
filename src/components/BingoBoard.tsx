import React from 'react';
import { getBallLetter } from '../utils/bingoEngine';

interface BingoBoardProps {
  calledNumbers: Set<number>;
  lastCalledNumber: number | null;
}

export const BingoBoard: React.FC<BingoBoardProps> = ({ calledNumbers, lastCalledNumber }) => {
  const categories: { letter: 'B' | 'I' | 'N' | 'G' | 'O'; range: number[] }[] = [
    { letter: 'B', range: Array.from({ length: 15 }, (_, i) => i + 1) },
    { letter: 'I', range: Array.from({ length: 15 }, (_, i) => i + 16) },
    { letter: 'N', range: Array.from({ length: 15 }, (_, i) => i + 31) },
    { letter: 'G', range: Array.from({ length: 15 }, (_, i) => i + 46) },
    { letter: 'O', range: Array.from({ length: 15 }, (_, i) => i + 61) },
  ];

  const getLetterColor = (letter: string) => {
    switch (letter) {
      case 'B': return 'text-blue-400 border-blue-500/30';
      case 'I': return 'text-red-400 border-red-500/30';
      case 'N': return 'text-purple-400 border-purple-500/30';
      case 'G': return 'text-green-400 border-green-500/30';
      case 'O': return 'text-yellow-400 border-yellow-500/30';
      default: return 'text-white/40';
    }
  };

  const getCalledBg = (letter: string, isLast: boolean) => {
    if (isLast) return 'bg-amber-400 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] font-extrabold animate-pulse ring-2 ring-amber-400/50';
    
    switch (letter) {
      case 'B': return 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.2)]';
      case 'I': return 'bg-red-500/20 text-red-300 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]';
      case 'N': return 'bg-[#111126] text-purple-300 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.2)]';
      case 'G': return 'bg-green-500/20 text-green-300 border-green-500/40 shadow-[0_0_8px_rgba(34,197,94,0.2)]';
      case 'O': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-[0_0_8px_rgba(234,179,8,0.2)]';
      default: return 'bg-white/10 text-white/90 border-white/20';
    }
  };

  return (
    <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
        <h3 className="text-sm font-semibold tracking-wider text-white/80 uppercase font-sans">
          Master Game Board
        </h3>
        <div className="flex flex-wrap gap-4 items-center text-xs font-mono text-white/40">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10" /> Uncalled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/50" /> Called
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" /> Hot Ball
          </span>
        </div>
      </div>

      <div className="space-y-3 overflow-x-auto pb-1">
        {categories.map(({ letter, range }) => (
          <div key={letter} className="grid grid-cols-[32px_1fr] items-center gap-3 min-w-[480px]">
            {/* Column Label */}
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-black text-sm ${getLetterColor(letter)} bg-[#111126]`}>
              {letter}
            </div>

            {/* Column Numbers */}
            <div className="grid grid-cols-15 gap-1 select-none">
              {range.map((num) => {
                const isCalled = calledNumbers.has(num);
                const isLast = num === lastCalledNumber;

                return (
                  <div
                    key={num}
                    style={{ contentVisibility: 'auto' }}
                    className={`aspect-square rounded-md flex items-center justify-center text-xs font-mono font-bold border transition-all duration-300 ${
                      isCalled
                        ? getCalledBg(letter, isLast)
                        : 'bg-white/5 text-white/30 border-white/5 hover:text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
