export enum GameState {
  LOBBY = 'LOBBY',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum PatternType {
  LINE = 'LINE',
  FOUR_CORNERS = 'FOUR_CORNERS',
  LETTER_X = 'LETTER_X',
  PLUS_SIGN = 'PLUS_SIGN',
  BLACKOUT = 'BLACKOUT'
}

export interface BingoCell {
  number: number | null; // null represents FREE space
  daubed: boolean;
  column: 'B' | 'I' | 'N' | 'G' | 'O';
}

export interface BingoCardData {
  id: string;
  grid: BingoCell[][]; // 5x5 grid [row][col]
  hasBingo: boolean;
  winningCells: [number, number][]; // indices of winning cells
}

export interface GameStats {
  gamesPlayed: number;
  bingosWon: number;
  totalChipsWon: number;
  highestWin: number;
  perfectDaubsCount: number;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface PlayerProfile {
  chips: number;
  xp: number;
  level: number;
  name: string;
  avatar: string;
  stats: GameStats;
  dailyTasks?: DailyTask[];
  lastDailyReset?: string; // Format YYYY-MM-DD
}

export interface LeaderboardEntry {
  name: string;
  chips: number;
  level: number;
  avatar: string;
  isBot: boolean;
}

export interface CalledBall {
  number: number;
  letter: 'B' | 'I' | 'N' | 'G' | 'O';
}
