import { BingoCardData, BingoCell, PatternType } from '../types';

function generateRandomUnique(min: number, max: number, count: number): number[] {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

export function generateBingoCard(id: string): BingoCardData {
  const bNums = generateRandomUnique(1, 15, 5);
  const iNums = generateRandomUnique(16, 30, 5);
  const nNums = generateRandomUnique(31, 45, 4); // 4 numbers, middle is FREE
  const gNums = generateRandomUnique(46, 60, 5);
  const oNums = generateRandomUnique(61, 75, 5);

  const grid: BingoCell[][] = Array.from({ length: 5 }, () => []);

  for (let row = 0; row < 5; row++) {
    grid[row] = [
      { number: bNums[row], daubed: false, column: 'B' },
      { number: iNums[row], daubed: false, column: 'I' },
      { number: row === 2 ? null : nNums[row > 2 ? row - 1 : row], daubed: row === 2, column: 'N' }, // middle row, index 2 is FREE
      { number: gNums[row], daubed: false, column: 'G' },
      { number: oNums[row], daubed: false, column: 'O' }
    ];
  }

  return {
    id,
    grid,
    hasBingo: false,
    winningCells: []
  };
}

export function getBallLetter(num: number): 'B' | 'I' | 'N' | 'G' | 'O' {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
  throw new Error(`Invalid Bingo number: ${num}`);
}

export function checkBingoPattern(
  card: BingoCardData,
  pattern: PatternType
): { won: boolean; winningCells: [number, number][] } {
  const grid = card.grid;

  switch (pattern) {
    case PatternType.LINE: {
      const winningLines: [number, number][] = [];
      let won = false;

      // Check horizontal rows
      for (let r = 0; r < 5; r++) {
        let rowComplete = true;
        const currentLine: [number, number][] = [];
        for (let c = 0; c < 5; c++) {
          currentLine.push([r, c]);
          if (!grid[r][c].daubed) {
            rowComplete = false;
          }
        }
        if (rowComplete) {
          won = true;
          winningLines.push(...currentLine);
        }
      }

      // Check vertical columns
      for (let c = 0; c < 5; c++) {
        let colComplete = true;
        const currentLine: [number, number][] = [];
        for (let r = 0; r < 5; r++) {
          currentLine.push([r, c]);
          if (!grid[r][c].daubed) {
            colComplete = false;
          }
        }
        if (colComplete) {
          won = true;
          winningLines.push(...currentLine);
        }
      }

      // Main diagonal (0,0) to (4,4)
      let diag1Complete = true;
      const diag1: [number, number][] = [];
      for (let i = 0; i < 5; i++) {
        diag1.push([i, i]);
        if (!grid[i][i].daubed) {
          diag1Complete = false;
        }
      }
      if (diag1Complete) {
        won = true;
        winningLines.push(...diag1);
      }

      // Anti diagonal (0,4) to (4,0)
      let diag2Complete = true;
      const diag2: [number, number][] = [];
      for (let i = 0; i < 5; i++) {
        diag2.push([i, 4 - i]);
        if (!grid[i][4 - i].daubed) {
          diag2Complete = false;
        }
      }
      if (diag2Complete) {
        won = true;
        winningLines.push(...diag2);
      }

      return { won, winningCells: winningLines };
    }

    case PatternType.FOUR_CORNERS: {
      const corners: [number, number][] = [[0, 0], [0, 4], [4, 0], [4, 4]];
      const won = corners.every(([r, c]) => grid[r][c].daubed);
      return { won, winningCells: won ? corners : [] };
    }

    case PatternType.LETTER_X: {
      const cells: [number, number][] = [
        [0, 0], [1, 1], [2, 2], [3, 3], [4, 4],
        [0, 4], [1, 3], [3, 1], [4, 0]
      ];
      const won = cells.every(([r, c]) => grid[r][c].daubed);
      return { won, winningCells: won ? cells : [] };
    }

    case PatternType.PLUS_SIGN: {
      const cells: [number, number][] = [
        [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], // Row 2
        [0, 2], [1, 2], [3, 2], [4, 2]         // Col 2 (excluding (2,2) twice)
      ];
      const won = cells.every(([r, c]) => grid[r][c].daubed);
      return { won, winningCells: won ? cells : [] };
    }

    case PatternType.BLACKOUT: {
      const cells: [number, number][] = [];
      let won = true;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          cells.push([r, c]);
          if (!grid[r][c].daubed) {
            won = false;
          }
        }
      }
      return { won, winningCells: won ? cells : [] };
    }

    default:
      return { won: false, winningCells: [] };
  }
}

export function getPatternDisplayName(pattern: PatternType): string {
  switch (pattern) {
    case PatternType.LINE: return 'Any Line (Row, Col, Diag)';
    case PatternType.FOUR_CORNERS: return 'Four Corners';
    case PatternType.LETTER_X: return 'Letter X';
    case PatternType.PLUS_SIGN: return 'Plus Sign (+)';
    case PatternType.BLACKOUT: return 'Blackout (Full House)';
  }
}

export function getPatternMultiplier(pattern: PatternType): number {
  switch (pattern) {
    case PatternType.LINE: return 2.5;
    case PatternType.FOUR_CORNERS: return 4.0;
    case PatternType.LETTER_X: return 6.0;
    case PatternType.PLUS_SIGN: return 5.0;
    case PatternType.BLACKOUT: return 15.0;
  }
}

// Generate an array of 75 randomized balls for caller pool
export function generateBallPool(): number[] {
  const pool = Array.from({ length: 75 }, (_, i) => i + 1);
  const result: number[] = [];
  while (pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}
