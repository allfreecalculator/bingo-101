import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BingoCardData, BingoCell } from '../types';
import { Sparkles, Star } from 'lucide-react';

interface BingoCardProps {
  card: BingoCardData;
  onCellClick?: (cardId: string, rowIndex: number, colIndex: number) => void;
  isManualDaub: boolean;
  calledNumbers: Set<number>;
  targetPatternIndices?: [number, number][]; // optional highlighted indices
  isInteractive?: boolean;
}

export const BingoCard: React.FC<BingoCardProps> = ({
  card,
  onCellClick,
  isManualDaub,
  calledNumbers,
  targetPatternIndices = [],
  isInteractive = true,
}) => {
  const isCellInTargetPattern = (r: number, c: number): boolean => {
    return targetPatternIndices.some(([row, col]) => row === r && col === c);
  };

  const isCellInWinningLine = (r: number, c: number): boolean => {
    return card.winningCells.some(([row, col]) => row === r && col === c);
  };

  return (
    <div className={`relative bg-[#111126]/90 border rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl transition-all duration-300 ${
      card.hasBingo 
        ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50' 
        : 'border-white/10 hover:border-white/20'
    }`}>
      {/* Top Header Card Info */}
      <div className="flex justify-between items-center px-4 pt-3 pb-2 bg-[#0a0a1f] border-b border-white/10 text-[10px] font-mono tracking-wider text-white/50">
        <span>TICKET #{card.id.substring(0, 5).toUpperCase()}</span>
        {card.hasBingo && (
          <span className="flex items-center gap-1 text-amber-400 font-bold animate-pulse text-xs tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> BINGO!
          </span>
        )}
      </div>

      {/* B-I-N-G-O Headers */}
      <div className="grid grid-cols-5 text-center bg-white/5 py-2.5 border-b border-white/10">
        {['B', 'I', 'N', 'G', 'O'].map((letter, idx) => (
          <div
            key={letter}
            className={`text-xl font-black font-sans tracking-tighter ${
              idx === 0 ? 'text-blue-400' :
              idx === 1 ? 'text-red-400' :
              idx === 2 ? 'text-purple-400' :
              idx === 3 ? 'text-green-400' : 'text-yellow-400'
            }`}
          >
            {letter}
          </div>
        ))}
      </div>

      {/* 5x5 Number Grid */}
      <div className="grid grid-cols-5 gap-1.5 p-3.5 bg-[#05050a]/90">
        {card.grid.map((rowCells, rIndex) =>
          rowCells.map((cell, cIndex) => {
            const isFree = cell.number === null;
            const isDaubed = cell.daubed;
            const isTarget = isCellInTargetPattern(rIndex, cIndex);
            const isWinning = isCellInWinningLine(rIndex, cIndex);
            
            // Check if user clicked a number that was called
            const isValidDaubClick = cell.number !== null && calledNumbers.has(cell.number);

            return (
              <button
                key={`${rIndex}-${cIndex}`}
                disabled={!isInteractive || isFree || (!isManualDaub && !isTarget)}
                onClick={() => {
                  if (isInteractive && onCellClick) {
                    onCellClick(card.id, rIndex, cIndex);
                  }
                }}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-300 font-mono text-base font-bold ${
                  isFree
                    ? 'bg-amber-400/10 border border-amber-500/20 text-amber-400 font-bold cursor-default'
                    : isDaubed
                      ? isWinning
                        ? 'bg-amber-500/40 text-white border border-amber-300/60 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                        : 'bg-white/10 border border-white/20 text-white/90'
                      : isTarget
                        ? 'bg-white/5 border border-dashed border-amber-500/40 text-white/30 hover:bg-white/10'
                        : 'bg-[#111126]/50 border border-white/5 text-white/60 hover:bg-white/5'
                } ${
                  isManualDaub && isValidDaubClick && !isDaubed && isInteractive
                    ? 'ring-2 ring-red-500/50 animate-pulse'
                    : ''
                }`}
                style={{ contentVisibility: 'auto' }}
              >
                {/* Visual Indicators */}
                {isTarget && !isDaubed && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-ping" />
                )}

                {/* Main Content (Number or FREE icon) */}
                {isFree ? (
                  <span className="text-[10px] uppercase font-sans tracking-wider text-amber-400 flex flex-col items-center justify-center">
                    <Star className="w-4.5 h-4.5 fill-amber-400 text-amber-500 animate-spin-slow mb-0.5" />
                    FREE
                  </span>
                ) : (
                  <span className={`${isWinning ? 'scale-110 font-extrabold text-lg text-amber-300' : ''} z-10 relative`}>
                    {cell.number}
                  </span>
                )}

                {/* Daub Stamp overlay */}
                <AnimatePresence>
                  {isDaubed && !isFree && (
                    <motion.div
                      initial={{ scale: 2.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className={`absolute inset-0 flex items-center justify-center rounded-lg pointer-events-none ${
                        isWinning
                          ? 'bg-gradient-to-br from-amber-400/30 to-amber-600/50 border border-amber-300/40 shadow-inner'
                          : 'bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/20 shadow-inner'
                      }`}
                    >
                      {/* Interactive Casino-Style stamp mark */}
                      <div className={`w-3/4 h-3/4 rounded-full flex items-center justify-center ${
                        isWinning 
                          ? 'bg-amber-500/80 text-white shadow-lg shadow-amber-400/30' 
                          : 'bg-amber-500/40 border border-amber-500/50 text-white shadow-lg'
                      }`}>
                        <span className="text-[9px] font-sans font-black tracking-tight uppercase select-none">
                          {isWinning ? '★' : 'Daub'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pulsating winner border overlay */}
                {isWinning && (
                  <div className="absolute inset-0 rounded-lg border-2 border-amber-400 animate-pulse pointer-events-none" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Ticket footer overlay */}
      <div className={`h-1 bg-gradient-to-r ${
        card.hasBingo 
          ? 'from-amber-400 via-amber-300 to-amber-500 animate-pulse' 
          : 'from-white/10 to-white/5'
      }`} />
    </div>
  );
};
