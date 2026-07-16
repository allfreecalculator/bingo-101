import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GameState, 
  PatternType, 
  BingoCardData, 
  PlayerProfile, 
  CalledBall,
  DailyTask
} from './types';
import { 
  generateBingoCard, 
  getBallLetter, 
  checkBingoPattern, 
  generateBallPool,
  getPatternDisplayName,
  getPatternMultiplier
} from './utils/bingoEngine';
import { BingoCard } from './components/BingoCard';
import { BingoBoard } from './components/BingoBoard';
import { BingoAcademy } from './components/BingoAcademy';
import { CasinoStats } from './components/CasinoStats';
import { DailyTasks } from './components/DailyTasks';
import { FeaturedGames } from './components/FeaturedGames';
import { LobbyStatistics } from './components/LobbyStatistics';
import { LobbyLeaderboard } from './components/LobbyLeaderboard';
import { LobbyPlayerProgress } from './components/LobbyPlayerProgress';
import { LobbyAchievements } from './components/LobbyAchievements';
import { LobbyDailyRewards } from './components/LobbyDailyRewards';
import { FAQSection } from './components/FAQSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { LobbyFooter } from './components/LobbyFooter';
import { ActiveGameWrapper } from './components/ActiveGameWrapper';
import { SlotGame } from './components/SlotGame';
import { CyberWildsSlots } from './components/CyberWildsSlots';
import { ZenSakuraSlots } from './components/ZenSakuraSlots';
import { CosmicVoidSlots } from './components/CosmicVoidSlots';
import { PirateCoveSlots } from './components/PirateCoveSlots';
import { PharaohGoldSlots } from './components/PharaohGoldSlots';
import { CandyWonderlandSlots } from './components/CandyWonderlandSlots';
import { RetroArcadeSlots } from './components/RetroArcadeSlots';
import { LuckyLeprechaunSlots } from './components/LuckyLeprechaunSlots';
import { GemsFortuneGame } from './components/GemsFortuneGame';
import { DiceGame } from './components/DiceGame';
import { CrashGame } from './components/CrashGame';
import { MinesGame } from './components/MinesGame';
import { PlinkoGame } from './components/PlinkoGame';
import { HiLoGame } from './components/HiLoGame';
import { RouletteGame } from './components/RouletteGame';
import { BlackjackGame } from './components/BlackjackGame';
import { VideoPokerGame } from './components/VideoPokerGame';
import { KenoGame } from './components/KenoGame';
import { SnakeGame } from './components/SnakeGame';
import { CoinFlipGame } from './components/CoinFlipGame';
import { MegaWheelGame } from './components/MegaWheelGame';
import { TowerClimbGame } from './components/TowerClimbGame';
import { ScratchCardGame } from './components/ScratchCardGame';
import { RockPaperScissorsGame } from './components/RockPaperScissorsGame';
import { ShellGame } from './components/ShellGame';
import { DerbyGame } from './components/DerbyGame';
import { DragonTigerGame } from './components/DragonTigerGame';
import { CoinPusherGame } from './components/CoinPusherGame';
import { LimboGame } from './components/LimboGame';
import { SpaceShooterGame } from './components/SpaceShooterGame';
import { BaccaratGame } from './components/BaccaratGame';
import { DartsGame } from './components/DartsGame';
import { PinataGame } from './components/PinataGame';
import { VaultGame } from './components/VaultGame';
import { MonteGame } from './components/MonteGame';
import { TarotGame } from './components/TarotGame';
import { BowlingGame } from './components/BowlingGame';
import { DragRaceGame } from './components/DragRaceGame';
import { SolitaireGame } from './components/SolitaireGame';
import { PolicyDocuments } from './components/PolicyDocuments';
import { EarnChips } from './components/EarnChips';
import { 
  Coins, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Pause, 
  BookOpen, 
  Sliders, 
  Trophy, 
  AlertCircle, 
  User, 
  Shuffle, 
  Info,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  Sparkles,
  LogIn,
  LogOut,
  Cloud,
  CloudOff,
  Lock,
  Mail,
  UserPlus,
  Loader2,
  ArrowLeft,
  Search
} from 'lucide-react';
import { 
  auth, 
  savePlayerProfile, 
  loadPlayerProfile, 
  googleProvider,
  FirebaseUser,
  registerCasinoAccount,
  loginCasinoAccount,
  saveCasinoAccountProfile,
  loadCasinoAccountProfileOnly
} from './utils/firebase';
import { 
  signOut, 
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';

const AVATARS = ['💎', '🃏', '🎲', '👑', '🍀', '💰', '🍒', '🎩', '🦖'];

const CASINO_GAMES = [
  { id: 'BINGO', name: '🎟️ Classic Bingo', desc: '75-Ball classic bingo floor with custom speed & voice calling', category: 'specialty', badge: 'POPULAR' },
  { id: 'SLOTS', name: '🎰 Vegas Slots', desc: 'Spin golden reels & win massive chip jackpots', category: 'slots', badge: 'HOT' },
  { id: 'CYBER_SLOTS', name: '🔥 Cyber Wilds Slots', desc: 'Sizzle with expanding multi-line cyber wild spins', category: 'slots', badge: 'NEW' },
  { id: 'ZEN_SLOTS', name: '🌸 Zen Sakura Slots', desc: 'Find inner peace with balanced high-multiplier garden spins', category: 'slots', badge: 'AESTHETIC' },
  { id: 'COSMIC_SLOTS', name: '🪐 Cosmic Void Slots', desc: 'Align gravitational singularities for high-multiplier cosmic paylines', category: 'slots', badge: 'SCI-FI' },
  { id: 'PIRATE_SLOTS', name: '🏴‍☠️ Crimson Cove Slots', desc: 'Settle sails to plunder captain\'s bounty on the high seas', category: 'slots', badge: 'HIGH SEAS' },
  { id: 'PHARAOH_SLOTS', name: '🏺 Pharaoh\'s Gold Slots', desc: 'Excavate hidden Giza chambers to find ancient divine multipliers', category: 'slots', badge: 'MYTHICAL' },
  { id: 'CANDY_SLOTS', name: '🍭 Candy Wonderland', desc: 'Savor sweet paylines & sugar multiplier rush cascades', category: 'slots', badge: 'SWEET' },
  { id: 'RETRO_SLOTS', name: '👾 Retro Arcade Slots', desc: '8-bit retro scanlines with golden gamepad wild aligns', category: 'slots', badge: 'RETRO' },
  { id: 'IRISH_SLOTS', name: '🍀 Lucky Leprechaun', desc: 'Align four-leaf clovers & find Irish pots of gold', category: 'slots', badge: 'LUCKY' },
  { id: 'GEMS', name: '💎 Gems Fortune', desc: 'Match colorful gems and discover hidden treasures', category: 'specialty', badge: 'NEW' },
  { id: 'DICE', name: '🎲 Dice Duel', desc: 'Roll the bones in an intense showdown vs House Dealer', category: 'tables', badge: 'FAVORITE' },
  { id: 'CRASH', name: '🚀 Rocket Crash', desc: 'Cash out before the rocket crashes for exponential payouts', category: 'multipliers', badge: 'TRENDING' },
  { id: 'MINES', name: '💣 Mines Floor', desc: 'Dodge active mines for consecutive cash out multipliers', category: 'multipliers', badge: 'NEW' },
  { id: 'PLINKO', name: '🎯 Cosmic Plinko', desc: 'Drop pegs onto dynamic high-multiplier pegboards', category: 'multipliers', badge: 'POPULAR' },
  { id: 'HILO', name: '🔥 Hi-Lo Duel', desc: 'Predict if the next drawn card is higher or lower', category: 'tables', badge: 'EASY' },
  { id: 'ROULETTE', name: '🎡 Neon Roulette', desc: 'Bet on numbers, colors, or ranges in this classic wheel', category: 'tables', badge: 'CLASSIC' },
  { id: 'BLACKJACK', name: '🃏 Vegas 21', desc: 'Draw cards and beat the dealer without exceeding 21', category: 'tables', badge: 'VIP' },
  { id: 'POKER', name: '♠️ Video Poker', desc: 'Draw Jacks or Better to secure premium payout tiers', category: 'tables', badge: 'SKILL' },
  { id: 'KENO', name: '✨ Cosmic Keno', desc: 'Select hot numbers to match live casino draws', category: 'specialty', badge: 'CLASSIC' },
  { id: 'SNAKE', name: '🎮 Cosmic Snake', desc: 'Neon arcade snake eating chips to increase multipliers', category: 'specialty', badge: 'ARCADE' },
  { id: 'COINFLIP', name: '🪙 Neon Coin Toss', desc: 'Predict heads or tails to build multiplier streaks', category: 'multipliers', badge: 'INSTANT' },
  { id: 'WHEEL', name: '🎡 Dream Mega Wheel', desc: 'Spin the probability wedges for instant prize values', category: 'specialty', badge: 'POPULAR' },
  { id: 'TOWER', name: '🏰 Tower Climb', desc: 'Climb high-risk ladders while avoiding game over tiles', category: 'multipliers', badge: 'HIGH RISK' },
  { id: 'SCRATCH', name: '🎫 Cosmic Scratchers', desc: 'Scratch & match 3 cards for instant-win multipliers', category: 'specialty', badge: 'INSTANT' },
  { id: 'RPS', name: '⚔️ RPS Showdown', desc: 'Vegas Rock-Paper-Scissors against advanced AI Dealer', category: 'specialty', badge: 'DUEL' },
  { id: 'SHELL', name: '🔮 Golden Shells', desc: 'Keep your eyes on the shells to find the hidden diamond', category: 'specialty', badge: 'FOCUS' },
  { id: 'DERBY', name: '🐎 Cyber Derby', desc: 'Place your wagers on high-speed virtual neon horse racing', category: 'specialty', badge: 'SIMULATION' },
  { id: 'DRAGON_TIGER', name: '🐉 Dragon Tiger', desc: 'Choose between Dragon, Tiger, or Tie in high-speed card duels', category: 'tables', badge: 'FAST' },
  { id: 'PUSHER', name: '🪙 Coin Pusher', desc: 'Drop coins onto moving ledges and cascade massive chip piles', category: 'specialty', badge: 'COIN PUSHER' },
  { id: 'LIMBO', name: '🚀 Limbo Roll', desc: 'Specify target payout multiplier and roll instant targets', category: 'multipliers', badge: 'INSTANT' },
  { id: 'SHOOTER', name: '☄️ Space Shooter', desc: 'Steer space fighter and shoot asteroids to stack multipliers', category: 'specialty', badge: 'ARCADE' },
  { id: 'BACCARAT', name: '👑 Baccarat Royale', desc: 'Bet on Banker, Player, or Tie in classic high roller card play', category: 'tables', badge: 'VIP' },
  { id: 'DARTS', name: '🎯 Neon Darts', desc: 'Aim, throw, and brave atmospheric winds to hit the double bullseye', category: 'specialty', badge: 'NEW' },
  { id: 'PINATA', name: '🪅 Cosmic Piñata', desc: 'Buy contract swings to crack open a floating galaxy piñata', category: 'specialty', badge: 'DAILY' },
  { id: 'VAULT', name: '📦 Vault Escape', desc: 'Drill and unlock 5 levels of digital safes while evading alarms', category: 'multipliers', badge: 'HOT' },
  { id: 'MONTE', name: '🃏 Three-Card Monte', desc: 'Watch the holographic cards shuffle and locate the Golden Queen', category: 'tables', badge: 'NEW' },
  { id: 'TAROT', name: '🔮 Mystic Tarot', desc: 'Draw three cards of fate to build multiplying fortune structures', category: 'specialty', badge: 'DAILY' },
  { id: 'BOWLING', name: '🎳 Cosmic Bowling', desc: 'Lock aim angle & delivery power to knock down neon pin spreads', category: 'specialty', badge: 'ARCADE' },
  { id: 'DRAGRACE', name: '🏎️ Cyber Drag Race', desc: 'Gear shift at perfect engine RPM speeds to outrun rival drag racers', category: 'specialty', badge: 'NEW' },
  { id: 'SOLITAIRE', name: '🀄 Solitaire Match', desc: 'Flip and match 8 pairs of card symbols within the 25-second countdown', category: 'tables', badge: 'DAILY' }
] as const;

const INITIAL_DAILY_TASKS: DailyTask[] = [
  {
    id: 'daily_checkin',
    title: 'Daily VIP Check-In',
    description: 'Claim your daily casino bonus chips',
    target: 1,
    current: 1, // Auto-completed as they are logged in and checked-in
    reward: 100,
    completed: true,
    claimed: false,
    icon: '🎟️'
  },
  {
    id: 'play_games',
    title: 'Casino Active',
    description: 'Play 2 rounds of Bingo on the casino floor',
    target: 2,
    current: 0,
    reward: 150,
    completed: false,
    claimed: false,
    icon: '🎟️'
  },
  {
    id: 'play_slots',
    title: 'Slot Enthusiast',
    description: 'Spin the Vegas Golden Reels 5 times',
    target: 5,
    current: 0,
    reward: 120,
    completed: false,
    claimed: false,
    icon: '🎰'
  },
  {
    id: 'win_dice',
    title: 'Dice Duel Champion',
    description: 'Win 2 rounds of Vegas Dice Duel against dealer',
    target: 2,
    current: 0,
    reward: 180,
    completed: false,
    claimed: false,
    icon: '🎲'
  },
  {
    id: 'daub_numbers',
    title: 'Precision Stamper',
    description: 'Manually daub 10 called numbers',
    target: 10,
    current: 0,
    reward: 120,
    completed: false,
    claimed: false,
    icon: '🎯'
  },
  {
    id: 'win_bingo',
    title: 'Vegas Legend',
    description: 'Claim at least 1 winning BINGO pattern',
    target: 1,
    current: 0,
    reward: 200,
    completed: false,
    claimed: false,
    icon: '👑'
  }
];

const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const checkAndResetDailyTasks = (p: PlayerProfile): PlayerProfile => {
  const today = getTodayDateString();
  if (p.lastDailyReset !== today || !p.dailyTasks || p.dailyTasks.length === 0) {
    return {
      ...p,
      lastDailyReset: today,
      dailyTasks: INITIAL_DAILY_TASKS.map(t => {
        if (t.id === 'daily_checkin') {
          return { ...t, current: 1, completed: true, claimed: false };
        }
        return { ...t, current: 0, completed: false, claimed: false };
      })
    };
  }
  return p;
};

interface GameCard {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  badge?: string;
  category: 'slots' | 'tables' | 'multipliers' | 'specialty';
  bgColor: string;
  payout: string;
}

const GAMES: GameCard[] = [
  { id: 'BINGO', title: 'Bingo Floor', emoji: '🎟️', desc: '75-Ball classical Bingo games', badge: 'Popular', category: 'specialty', bgColor: 'from-blue-600/20 to-indigo-600/20 border-blue-500/30', payout: 'Up to 15x' },
  { id: 'SLOTS', title: 'Vegas Slots', emoji: '🎰', desc: 'Spin & Win the Golden Reels', badge: 'Hot', category: 'slots', bgColor: 'from-amber-600/20 to-red-600/20 border-amber-500/30', payout: 'Up to 1000x' },
  { id: 'CYBER_SLOTS', title: 'Cyber Wilds Slots', emoji: '🔥', desc: 'Sizzle with expanding multi-line cyber wild spins', badge: 'New', category: 'slots', bgColor: 'from-orange-600/20 to-red-600/20 border-orange-500/30', payout: 'Up to 500x' },
  { id: 'ZEN_SLOTS', title: 'Zen Sakura Slots', emoji: '🌸', desc: 'Find inner peace with balanced high-multiplier garden spins', badge: 'Aesthetic', category: 'slots', bgColor: 'from-pink-600/20 to-rose-800/20 border-pink-500/30', payout: 'Up to 1200x' },
  { id: 'COSMIC_SLOTS', title: 'Cosmic Void Slots', emoji: '🪐', desc: 'Align gravitational singularities for high-multiplier cosmic paylines', badge: 'Sci-Fi', category: 'slots', bgColor: 'from-violet-600/20 to-indigo-900/20 border-violet-500/30', payout: 'Up to 1500x' },
  { id: 'PIRATE_SLOTS', title: 'Crimson Cove Slots', emoji: '🏴‍☠️', desc: 'Settle sails to plunder captain\'s bounty on the high seas', badge: 'Plunder', category: 'slots', bgColor: 'from-amber-600/20 to-yellow-900/20 border-amber-500/30', payout: 'Up to 1000x' },
  { id: 'PHARAOH_SLOTS', title: 'Pharaoh\'s Gold Slots', emoji: '🏺', desc: 'Excavate hidden Giza chambers to find ancient divine multipliers', badge: 'Myth', category: 'slots', bgColor: 'from-yellow-600/20 to-amber-900/20 border-yellow-500/30', payout: 'Up to 1250x' },
  { id: 'CANDY_SLOTS', title: 'Candy Wonderland', emoji: '🍭', desc: 'Savor sweet paylines & sugar multiplier rush cascades', badge: 'Sweet', category: 'slots', bgColor: 'from-pink-600/20 to-fuchsia-800/20 border-pink-500/30', payout: 'Up to 1500x' },
  { id: 'RETRO_SLOTS', title: 'Retro Arcade Slots', emoji: '👾', desc: '8-bit retro scanlines with golden gamepad wild aligns', badge: 'Retro', category: 'slots', bgColor: 'from-cyan-600/20 to-indigo-800/20 border-cyan-500/30', payout: 'Up to 1800x' },
  { id: 'IRISH_SLOTS', title: 'Lucky Leprechaun', emoji: '🍀', desc: 'Align four-leaf clovers & find Irish pots of gold', badge: 'Lucky', category: 'slots', bgColor: 'from-emerald-600/20 to-yellow-800/20 border-emerald-500/30', payout: 'Up to 1500x' },
  { id: 'GEMS', title: 'Gems Fortune', emoji: '💎', desc: 'Match colorful gems and discover hidden treasures', badge: 'New', category: 'slots', bgColor: 'from-cyan-600/20 to-blue-800/20 border-cyan-500/30', payout: 'Up to 500x' },
  { id: 'CRASH', title: 'Rocket Crash', emoji: '🚀', desc: 'Exponential multipliers space flight', badge: 'Trending', category: 'multipliers', bgColor: 'from-purple-600/20 to-indigo-600/20 border-purple-500/30', payout: 'Unlimited' },
  { id: 'MINES', title: 'Mines Floor', desc: 'Dodge mines and collect multiplier tiles', emoji: '💣', category: 'multipliers', bgColor: 'from-red-600/20 to-zinc-800/20 border-red-500/30', payout: 'Up to 500x' },
  { id: 'BLACKJACK', title: 'Vegas 21', emoji: '🃏', desc: 'Classic Vegas Blackjack vs Dealer', badge: 'VIP Floor', category: 'tables', bgColor: 'from-emerald-600/20 to-teal-800/20 border-emerald-500/30', payout: '3:2 Payout' },
  { id: 'ROULETTE', title: 'Neon Roulette', emoji: '🎡', desc: 'Interactive live-wheel European roulette', category: 'slots', bgColor: 'from-indigo-600/20 to-purple-800/20 border-indigo-500/30', payout: '35:1 Payout' },
  { id: 'BACCARAT', title: 'Baccarat Royale', emoji: '👑', desc: 'Vegas high roller baccarat tables', category: 'tables', bgColor: 'from-yellow-600/20 to-amber-800/20 border-yellow-500/30', payout: '9:1 Payout' },
  { id: 'PLINKO', title: 'Cosmic Plinko', emoji: '🎯', desc: 'Pegboard bouncing gravity multipliers', category: 'specialty', bgColor: 'from-teal-600/20 to-cyan-800/20 border-teal-500/30', payout: 'Up to 110x' },
  { id: 'DICE', title: 'Dice Duel', emoji: '🎲', desc: 'Roll bones vs dealer in 3D Dice', category: 'specialty', bgColor: 'from-rose-600/20 to-orange-800/20 border-rose-500/30', payout: 'Up to 6x' },
  { id: 'HILO', title: 'Hi-Lo Duel', emoji: '🔥', desc: 'Predict card values higher or lower', category: 'specialty', bgColor: 'from-orange-600/20 to-red-800/20 border-orange-500/30', payout: 'Multiplier' },
  { id: 'POKER', title: 'Video Poker', emoji: '♠️', desc: 'Draw poker hands with Jacks or Better', category: 'tables', bgColor: 'from-sky-600/20 to-blue-800/20 border-sky-500/30', payout: 'Up to 800x' },
  { id: 'KENO', title: 'Cosmic Keno', emoji: '✨', desc: 'Pick lucky numbers in Vegas board', category: 'specialty', bgColor: 'from-fuchsia-600/20 to-pink-800/20 border-fuchsia-500/30', payout: 'Up to 10000x' },
  { id: 'SNAKE', title: 'Cosmic Snake', emoji: '🎮', desc: 'Neon retro arcade snake chips eat', badge: 'Retro', category: 'specialty', bgColor: 'from-green-600/20 to-emerald-800/20 border-green-500/30', payout: 'Multiplier' },
  { id: 'COINFLIP', title: 'Neon Coin Toss', emoji: '🪙', desc: 'Streak coin toss prediction rewards', category: 'specialty', bgColor: 'from-yellow-600/20 to-orange-800/20 border-yellow-500/30', payout: 'Streak' },
  { id: 'WHEEL', title: 'Dream Mega Wheel', emoji: '🎡', desc: 'Wedge-based fortune multiplier wheel', category: 'slots', bgColor: 'from-violet-600/20 to-indigo-800/20 border-violet-500/30', payout: 'Up to 40x' },
  { id: 'TOWER', title: 'Tower Climb', emoji: '🏰', desc: 'Climb safety ladder and avoid traps', category: 'multipliers', bgColor: 'from-emerald-600/20 to-green-800/20 border-emerald-500/30', payout: 'Up to 150x' },
  { id: 'SCRATCH', title: 'Cosmic Scratchers', emoji: '🎫', desc: 'Scratch gold foil cards to match 3', category: 'specialty', bgColor: 'from-pink-600/20 to-purple-800/20 border-pink-500/30', payout: 'Up to 500x' },
  { id: 'RPS', title: 'RPS Showdown', emoji: '⚔️', desc: 'Rock paper scissors duel vs advanced AI', category: 'specialty', bgColor: 'from-slate-600/20 to-zinc-800/20 border-slate-500/30', payout: 'Double' },
  { id: 'SHELL', title: 'Golden Shells', emoji: '🔮', desc: 'Follow the shuffling cups to find gem', category: 'specialty', bgColor: 'from-amber-600/20 to-yellow-800/20 border-amber-500/30', payout: '3x Payout' },
  { id: 'DERBY', title: 'Cyber Derby', emoji: '🐎', desc: 'Bets on neon cybernetic horse race', category: 'specialty', bgColor: 'from-blue-600/20 to-cyan-800/20 border-blue-500/30', payout: 'Up to 12x' },
  { id: 'DRAGON_TIGER', title: 'Dragon Tiger', emoji: '🐉', desc: 'High-speed classic two-card baccarat style', category: 'tables', bgColor: 'from-red-600/20 to-yellow-800/20 border-red-500/30', payout: 'Double/Tie' },
  { id: 'PUSHER', title: 'Coin Pusher', emoji: '🪙', desc: 'Push gold coins off high-payout shelves', category: 'slots', bgColor: 'from-yellow-500/20 to-amber-700/20 border-yellow-400/30', payout: 'Cascades' },
  { id: 'LIMBO', title: 'Limbo Roll', emoji: '🚀', desc: 'Aim high multipliers before rocket drops', category: 'multipliers', bgColor: 'from-pink-600/20 to-rose-800/20 border-pink-500/30', payout: 'Up to 1000x' },
  { id: 'SHOOTER', title: 'Space Shooter', emoji: '☄️', desc: 'Arcade shoot enemies and dodge asteroids', category: 'specialty', bgColor: 'from-indigo-600/20 to-sky-800/20 border-indigo-500/30', payout: 'Multiplier' },
];

export default function App() {
  // --- Profile State & Persistence ---
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    const saved = localStorage.getItem('bingo_casino_profile');
    let loaded: PlayerProfile;
    if (saved) {
      try {
        loaded = JSON.parse(saved);
      } catch (e) {
        loaded = {
          chips: 500,
          xp: 0,
          level: 1,
          name: 'VegasGuest',
          avatar: '🎲',
          stats: {
            gamesPlayed: 0,
            bingosWon: 0,
            totalChipsWon: 0,
            highestWin: 0,
            perfectDaubsCount: 0
          }
        };
      }
    } else {
      loaded = {
        chips: 500,
        xp: 0,
        level: 1,
        name: 'VegasGuest',
        avatar: '🎲',
        stats: {
          gamesPlayed: 0,
          bingosWon: 0,
          totalChipsWon: 0,
          highestWin: 0,
          perfectDaubsCount: 0
        }
      };
    }
    return checkAndResetDailyTasks(loaded);
  });

  useEffect(() => {
    localStorage.setItem('bingo_casino_profile', JSON.stringify(profile));
  }, [profile]);

  // --- Firebase VIP Authentication State ---
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [customUser, setCustomUser] = useState<string | null>(() => {
    return localStorage.getItem('bingo_casino_username');
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [clickStep, setClickStep] = useState<number>(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Clear auth error when modal closes
  useEffect(() => {
    if (!isAuthModalOpen) {
      setAuthError(null);
    }
  }, [isAuthModalOpen]);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          const cloudProfile = await loadPlayerProfile(user.uid);
          if (cloudProfile) {
            setProfile(checkAndResetDailyTasks(cloudProfile as PlayerProfile));
            triggerAlert('Welcome back! Cloud profile synchronized.', 'success');
          } else {
            // First time logging in, backup current local achievements to the cloud
            await savePlayerProfile(user.uid, profile);
            triggerAlert('Welcome! VIP profile created and saved to cloud.', 'success');
          }
        } catch (error) {
          console.error('Error fetching cloud profile:', error);
          triggerAlert('Could not sync with cloud profile.', 'error');
        } finally {
          setIsSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync profile to cloud when values change (debounced to avoid Firestore spam)
  useEffect(() => {
    if (!currentUser) return;

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await savePlayerProfile(currentUser.uid, profile);
      } catch (error) {
        console.error('Cloud auto-save error:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 1500); // 1.5 seconds debounce

    return () => clearTimeout(timer);
  }, [profile, currentUser]);

  // Load custom profile on startup if custom username is saved
  useEffect(() => {
    const initCustomAccount = async () => {
      if (customUser) {
        setIsSyncing(true);
        try {
          const cloudProfile = await loadCasinoAccountProfileOnly(customUser);
          if (cloudProfile) {
            setProfile(checkAndResetDailyTasks(cloudProfile as PlayerProfile));
          }
        } catch (error) {
          console.error('Error auto-syncing custom account:', error);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    initCustomAccount();
  }, [customUser]);

  // Sync profile to custom account in Firestore when values change (debounced)
  useEffect(() => {
    if (!customUser) return;

    const timer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await saveCasinoAccountProfile(customUser, profile);
      } catch (error) {
        console.error('Custom account auto-save error:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [profile, customUser]);

  // --- Game Settings ---
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [activeLobbyTab, setActiveLobbyTab] = useState<string>('BINGO');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'slots' | 'tables' | 'multipliers' | 'specialty'>('all');
  const [ticketCount, setTicketCount] = useState<number>(2); // Default 2 tickets
  const [targetPattern, setTargetPattern] = useState<PatternType>(PatternType.LINE);
  const [callerSpeed, setCallerSpeed] = useState<number>(3000); // ms (Default Normal 3s)
  const [isAutoDaub, setIsAutoDaub] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);

  // --- Playing Game States ---
  const [tickets, setTickets] = useState<BingoCardData[]>([]);
  const [ballPool, setBallPool] = useState<number[]>([]);
  const [calledNumbers, setCalledNumbers] = useState<Set<number>>(new Set());
  const [lastCalledBall, setLastCalledBall] = useState<CalledBall | null>(null);
  const [lastFiveCalled, setLastFiveCalled] = useState<CalledBall[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isAcademyOpen, setIsAcademyOpen] = useState<boolean>(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState<boolean>(false);
  const [activePolicyTab, setActivePolicyTab] = useState<'about' | 'contact' | 'privacy' | 'terms'>('privacy');

  // --- Sound/UI Feedback State ---
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activeCallInterval, setActiveCallInterval] = useState<any>(null);
  const [gameEndTime, setGameEndTime] = useState<number | null>(null);
  const [ballsCalledThisRound, setBallsCalledThisRound] = useState<number>(0);
  const [roundPrizes, setRoundPrizes] = useState<number>(0);

  const feedbackTimeout = useRef<any>(null);

  // Trigger brief alert banner
  const triggerAlert = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    setFeedbackMsg({ text, type });
    feedbackTimeout.current = setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  // --- Daily Tasks Handlers & Reset Monitor ---
  const updateDailyTaskProgress = (taskId: string, increment: number) => {
    setProfile((prev) => {
      if (!prev.dailyTasks) return prev;
      const updatedTasks = prev.dailyTasks.map((t) => {
        if (t.id !== taskId) return t;
        if (t.claimed) return t;

        const newCurrent = Math.min(t.target, t.current + increment);
        const completed = newCurrent >= t.target;
        
        if (completed && !t.completed) {
          triggerAlert(`Quest Completed: "${t.title}"! Claim your chips!`, 'success');
        }

        return {
          ...t,
          current: newCurrent,
          completed
        };
      });

      return {
        ...prev,
        dailyTasks: updatedTasks
      };
    });
  };

  const handleClaimDailyTask = (taskId: string) => {
    setProfile((prev) => {
      if (!prev.dailyTasks) return prev;
      
      const task = prev.dailyTasks.find(t => t.id === taskId);
      if (!task || !task.completed || task.claimed) return prev;

      const updatedTasks = prev.dailyTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, claimed: true };
        }
        return t;
      });

      triggerAlert(`Claimed ${task.reward} Chips for completing "${task.title}"!`, 'success');

      return {
        ...prev,
        chips: prev.chips + task.reward,
        dailyTasks: updatedTasks
      };
    });
  };

  const handleAddCustomTask = (title: string, description: string, target: number, reward: number, icon: string) => {
    const newId = `custom_${Date.now()}`;
    const newTask: DailyTask = {
      id: newId,
      title,
      description,
      target,
      current: 0,
      reward,
      completed: false,
      claimed: false,
      icon
    };
    setProfile(prev => ({
      ...prev,
      dailyTasks: [...(prev.dailyTasks || []), newTask]
    }));
    triggerAlert(`Custom quest "${title}" added with a +${reward} Chips reward!`, 'success');
  };

  const handleProgressCustomTask = (taskId: string, increment: number) => {
    updateDailyTaskProgress(taskId, increment);
  };

  useEffect(() => {
    const checkReset = () => {
      setProfile((prev) => {
        const reseted = checkAndResetDailyTasks(prev);
        if (reseted.lastDailyReset !== prev.lastDailyReset) {
          triggerAlert('New day! Daily quests have been reset.', 'info');
        }
        return reseted;
      });
    };

    checkReset();
    const interval = setInterval(checkReset, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- VIP Authentication Handlers ---
  const handleCustomAuth = async () => {
    if (!usernameInput.trim() || !passwordInput) {
      const errMsg = 'Please enter both username and password.';
      triggerAlert(errMsg, 'error');
      setAuthError(errMsg);
      return;
    }
    if (passwordInput.length < 6) {
      const errMsg = 'Password must be at least 6 characters.';
      triggerAlert(errMsg, 'error');
      setAuthError(errMsg);
      return;
    }
    
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      if (authMode === 'login') {
        try {
          const cloudProfile = await loginCasinoAccount(usernameInput, passwordInput);
          setProfile(checkAndResetDailyTasks(cloudProfile as PlayerProfile));
          localStorage.setItem('bingo_casino_username', usernameInput.trim());
          setCustomUser(usernameInput.trim());
          triggerAlert(`Welcome back, ${usernameInput}! VIP Synced.`, 'success');
          setIsAuthModalOpen(false);
          setUsernameInput('');
          setPasswordInput('');
          setClickStep(0);
          setAuthError(null);
        } catch (loginErr: any) {
          if (loginErr.message?.includes('Username not found')) {
            setAuthMode('signup');
            const infoMsg = `Username not found. Switched to 'Register' mode so you can create this account!`;
            triggerAlert(infoMsg, 'info');
            setAuthError(infoMsg);
          } else {
            throw loginErr;
          }
        }
      } else {
        const newProfile = await registerCasinoAccount(usernameInput, passwordInput, profile);
        setProfile(checkAndResetDailyTasks(newProfile as PlayerProfile));
        localStorage.setItem('bingo_casino_username', usernameInput.trim());
        setCustomUser(usernameInput.trim());
        triggerAlert(`Registered successfully as ${usernameInput}! VIP Profile Created.`, 'success');
        setIsAuthModalOpen(false);
        setUsernameInput('');
        setPasswordInput('');
        setClickStep(0);
        setAuthError(null);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Authentication failed.';
      triggerAlert(errMsg, 'error');
      setAuthError(errMsg);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleButtonClickStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput) {
      const errMsg = 'Please fill in both Username and Password.';
      triggerAlert(errMsg, 'error');
      setAuthError(errMsg);
      return;
    }
    if (passwordInput.length < 6) {
      const errMsg = 'Password must be at least 6 characters.';
      triggerAlert(errMsg, 'error');
      setAuthError(errMsg);
      return;
    }

    setAuthError(null);
    const nextStep = clickStep + 1;
    if (nextStep >= 3) {
      handleCustomAuth();
    } else {
      setClickStep(nextStep);
      triggerAlert(`Step ${nextStep}/3 Verified! Click ${3 - nextStep} more time(s) to finalize.`, 'info');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      triggerAlert('Logged in with Google! Synced VIP progress.', 'success');
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error(err);
      triggerAlert('Google Sign-In failed or was cancelled.', 'error');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (currentUser) {
        await signOut(auth);
      }
      setCustomUser(null);
      localStorage.removeItem('bingo_casino_username');
      setProfile({
        chips: 500,
        xp: 0,
        level: 1,
        name: 'VegasGuest',
        avatar: '🎲',
        stats: {
          gamesPlayed: 0,
          bingosWon: 0,
          totalChipsWon: 0,
          highestWin: 0,
          perfectDaubsCount: 0
        }
      });
      triggerAlert('Signed out. Local guest profile restored.', 'info');
    } catch (error) {
      console.error('Logout error:', error);
      triggerAlert('Failed to sign out.', 'error');
    }
  };

  // --- Casino Action Logging Engine ---
  const trackGameAction = (
    game: string,
    delta: number,
    description: string
  ) => {
    try {
      // 1. Append to localStorage logs list
      const entry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        game,
        delta,
        description
      };
      
      const savedLogs = localStorage.getItem('bingo_casino_logs_v1');
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      logs.unshift(entry);
      localStorage.setItem('bingo_casino_logs_v1', JSON.stringify(logs.slice(0, 50)));

      // 2. Accumulate in localStorage advanced stats
      const savedStats = localStorage.getItem('bingo_casino_adv_stats_v1');
      const stats = savedStats ? JSON.parse(savedStats) : {
        BINGO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        SLOTS: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        DICE: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        CRASH: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        MINES: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        PLINKO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        HILO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        ROULETTE: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        BLACKJACK: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        POKER: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        KENO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        SNAKE: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        COINFLIP: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        WHEEL: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        TOWER: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        SCRATCH: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        RPS: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        SHELL: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        DERBY: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        DRAGON_TIGER: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        PUSHER: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        LIMBO: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        SHOOTER: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 },
        BACCARAT: { played: 0, won: 0, bet: 0, wonChips: 0, maxWin: 0 }
      };

      const gameStats = (stats as any)[game];
      if (gameStats) {
        if (delta < 0) {
          gameStats.played += 1;
          gameStats.bet += Math.abs(delta);
        } else if (delta > 0) {
          gameStats.won += 1;
          gameStats.wonChips += delta;
          gameStats.maxWin = Math.max(gameStats.maxWin, delta);
        }
        localStorage.setItem('bingo_casino_adv_stats_v1', JSON.stringify(stats));
      }
    } catch (e) {
      console.error('Error logging transaction', e);
    }
  };

  const handleUpdateChipsWithLog = (
    game: string,
    delta: number,
    description?: string
  ) => {
    setProfile(prev => {
      const updatedChips = prev.chips + delta;
      
      // Update global profile statistics
      const updatedStats = { ...prev.stats };
      if (delta < 0) {
        updatedStats.gamesPlayed += 1;
      } else if (delta > 0) {
        updatedStats.totalChipsWon += delta;
        updatedStats.highestWin = Math.max(updatedStats.highestWin, delta);
      }

      // Generate description if not provided
      const finalDesc = description || (delta > 0 ? `${game} Profit: +${delta} Chips! 🎉` : `${game} wager: -${Math.abs(delta)} Chips`);
      
      // Trigger local storage and analytical logging
      trackGameAction(game, delta, finalDesc);

      return {
        ...prev,
        chips: updatedChips,
        stats: updatedStats
      };
    });
  };

  // --- Voice Engine ---
  const speakNumber = (num: number) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // stop current sound
      const letter = getBallLetter(num);
      const text = `${letter}. ${num}. ${letter}, ${num}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis blocked or errored', e);
    }
  };

  // --- Buying Tickets & Game Launch ---
  const handleBuyTicketsAndStart = () => {
    const cost = ticketCount * 25; // 25 chips per ticket
    if (profile.chips < cost) {
      triggerAlert('Insufficient chips! Grab a Free Spin or buy fewer tickets.', 'error');
      return;
    }

    // Deduct entry fee
    handleUpdateChipsWithLog('BINGO', -cost, `Bought ${ticketCount} Bingo Tickets`);

    // Generate Tickets
    const generated: BingoCardData[] = Array.from({ length: ticketCount }, (_, i) => 
      generateBingoCard(`ticket-${Date.now()}-${i}`)
    );

    setTickets(generated);
    setCalledNumbers(new Set());
    setLastCalledBall(null);
    setLastFiveCalled([]);
    setBallsCalledThisRound(0);
    setRoundPrizes(0);
    
    // Shuffle Caller Pool
    const pool = generateBallPool();
    setBallPool(pool);

    // Enter game state
    setGameState(GameState.PLAYING);
    setIsPaused(false);
    triggerAlert(`Bought ${ticketCount} Tickets for ${cost} Chips! Good luck!`, 'success');
  };

  // --- Core Game Loop (Ball Drawer) ---
  const drawNextBall = () => {
    if (isPaused) return;

    setBallPool((prevPool) => {
      if (prevPool.length === 0) {
        // Pool exhausted! End Game.
        handleNoMoreBalls();
        return prevPool;
      }

      const nextNum = prevPool[0];
      const remaining = prevPool.slice(1);
      const letter = getBallLetter(nextNum);
      const drawnBall: CalledBall = { number: nextNum, letter };

      speakNumber(nextNum);

      // Save drawn ball
      setCalledNumbers((prevCalled) => {
        const nextCalled = new Set(prevCalled);
        nextCalled.add(nextNum);

        // Auto-Daub Check
        if (isAutoDaub) {
          setTickets((prevTickets) => 
            prevTickets.map((card) => {
              const updatedGrid = card.grid.map((row) =>
                row.map((cell) => {
                  if (cell.number === nextNum) {
                    return { ...cell, daubed: true };
                  }
                  return cell;
                })
              );
              return { ...card, grid: updatedGrid };
            })
          );
        }

        return nextCalled;
      });

      setLastCalledBall(drawnBall);
      setLastFiveCalled((prevFive) => [drawnBall, ...prevFive].slice(0, 5));
      setBallsCalledThisRound((prev) => prev + 1);

      return remaining;
    });
  };

  const drawNextBallRef = useRef(drawNextBall);
  useEffect(() => {
    drawNextBallRef.current = drawNextBall;
  });

  // Setup interval on state transition
  useEffect(() => {
    if (gameState === GameState.PLAYING && !isPaused) {
      const interval = setInterval(() => {
        drawNextBallRef.current();
      }, callerSpeed);
      setActiveCallInterval(interval);
      return () => clearInterval(interval);
    } else {
      if (activeCallInterval) {
        clearInterval(activeCallInterval);
        setActiveCallInterval(null);
      }
    }
  }, [gameState, isPaused, callerSpeed]);

  const handleNoMoreBalls = () => {
    setGameState(GameState.GAME_OVER);
    triggerAlert('All 75 balls have been called! Round over.', 'info');
  };

  // --- Manual Daub Handler ---
  const handleCellClick = (cardId: string, rIdx: number, cIdx: number) => {
    if (isAutoDaub || gameState !== GameState.PLAYING) return;

    setTickets((prevTickets) =>
      prevTickets.map((card) => {
        if (card.id !== cardId) return card;

        const cell = card.grid[rIdx][cIdx];
        if (cell.number === null || cell.daubed) return card;

        // Is it called?
        const isDrawn = calledNumbers.has(cell.number);

        if (isDrawn) {
          // Correct Stamp!
          const updatedGrid = card.grid.map((r, rowIdx) =>
            r.map((c, colIdx) => {
              if (rowIdx === rIdx && colIdx === cIdx) {
                return { ...c, daubed: true };
              }
              return c;
            })
          );

          // Add minor XP on manual stamp
          setProfile((prev) => ({
            ...prev,
            xp: prev.xp + 5
          }));

          updateDailyTaskProgress('daub_numbers', 1);

          return { ...card, grid: updatedGrid };
        } else {
          // Warning
          triggerAlert(`Number ${cell.number} hasn't been called yet! Watch the board.`, 'error');
        }

        return card;
      })
    );
  };

  // --- Bingo Claim Checker ---
  const handleClaimBingo = () => {
    if (gameState !== GameState.PLAYING) return;

    let totalWinningPrizes = 0;
    let anyWinningCard = false;

    // Verify all purchased cards
    const verifiedTickets = tickets.map((card) => {
      const { won, winningCells } = checkBingoPattern(card, targetPattern);

      if (won && !card.hasBingo) {
        anyWinningCard = true;
        
        // Calculate payout
        const multiplier = getPatternMultiplier(targetPattern);
        const prize = Math.round(25 * multiplier); // Base payout per ticket cost
        totalWinningPrizes += prize;

        return {
          ...card,
          hasBingo: true,
          winningCells
        };
      }
      return card;
    });

    if (anyWinningCard) {
      setTickets(verifiedTickets);
      setRoundPrizes((prev) => prev + totalWinningPrizes);

      // Award profile
      const earnedXP = 100 + (isAutoDaub ? 0 : 50); // bonus XP for manual daub
      
      setProfile((prev) => {
        const nextXP = prev.xp + earnedXP;
        const currentLvlLimit = prev.level * 100;
        const levelUp = nextXP >= currentLvlLimit;

        return {
          ...prev,
          chips: prev.chips + totalWinningPrizes,
          xp: levelUp ? nextXP - currentLvlLimit : nextXP,
          level: levelUp ? prev.level + 1 : prev.level,
          stats: {
            ...prev.stats,
            bingosWon: prev.stats.bingosWon + 1,
            totalChipsWon: prev.stats.totalChipsWon + totalWinningPrizes,
            highestWin: Math.max(prev.stats.highestWin, totalWinningPrizes)
          }
        };
      });

      updateDailyTaskProgress('win_bingo', 1);
      trackGameAction('BINGO', totalWinningPrizes, `Bingo Claim: Won ${totalWinningPrizes} Chips! 🎉`);

      // Pause caller immediately to let them celebrate
      setIsPaused(true);
      triggerAlert(`🎰 BINGO! You won ${totalWinningPrizes} Chips and +${earnedXP} XP!`, 'success');
    } else {
      // False Bingo penalty
      const penalty = 15;
      setProfile((prev) => ({
        ...prev,
        chips: Math.max(0, prev.chips - penalty)
      }));
      trackGameAction('BINGO', -penalty, `False Bingo penalty`);
      triggerAlert(`False Bingo! No matching pattern yet. Penalty: -${penalty} Chips.`, 'error');
    }
  };

  // Level Up check
  useEffect(() => {
    const currentLvlLimit = profile.level * 100;
    if (profile.xp >= currentLvlLimit) {
      setProfile((prev) => ({
        ...prev,
        level: prev.level + 1,
        xp: prev.xp - currentLvlLimit
      }));
      triggerAlert(`🎉 LEVEL UP! Welcome to Casino Level ${profile.level + 1}!`, 'success');
    }
  }, [profile.xp, profile.level]);

  // --- End Round Cleanups ---
  const handleEndGameAndBackToLobby = () => {
    // Save stats
    setProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        gamesPlayed: prev.stats.gamesPlayed + 1
      }
    }));

    updateDailyTaskProgress('play_games', 1);

    setGameState(GameState.LOBBY);
    setTickets([]);
    setCalledNumbers(new Set());
    setLastCalledBall(null);
    setActiveGame(null);
  };

  // Pattern Highlight demonstration indices helper for active card render during gaming
  const getTargetIndices = (): [number, number][] => {
    switch (targetPattern) {
      case PatternType.LINE:
        return []; // Dynamic, so we don't pre-render
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

  return (
    <div className="min-h-screen bg-[#05050a] text-white font-sans antialiased selection:bg-amber-400 selection:text-black">
      {/* Top ambient casino lighting effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Bar / Header Navigation */}
      {activeGame === null && (
        <header className="sticky top-0 z-30 bg-[#0a0a1f]/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 p-[2px] shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-300 flex items-center justify-center">
              <div className="w-full h-full rounded-lg bg-[#05050a] flex items-center justify-center">
                <span className="text-sm font-black text-amber-400 font-mono">101</span>
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                BINGO 101 <span className="text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/30 font-bold px-2.5 py-0.5 rounded-full">CASINO</span>
              </h1>
              <p className="text-[9px] text-white/40 font-mono">ESTABLISHED Vegas, USA</p>
            </div>
          </div>

          {/* Profile Bar */}
          <div className="flex items-center gap-3">
            {/* Interactive Faucet indicator */}
            <button
              type="button"
              onClick={() => {
                setGameState(GameState.LOBBY);
                setActiveGame(null);
                setSelectedCategory('earn_chips');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const mainEl = document.querySelector('main');
                if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 bg-amber-400/10 hover:bg-amber-400/20 px-3 py-1.5 rounded-xl border border-amber-400/20 shadow-inner cursor-pointer transition-all hover:scale-105 active:scale-95 group text-left"
              title="Click to Earn Free Chips!"
            >
              <Coins className="w-4 h-4 text-amber-400 group-hover:animate-bounce" />
              <div className="flex flex-col">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
                  {profile.chips} <span className="text-[9px] text-white/40 font-normal">Chips</span>
                  <span className="text-[8px] bg-amber-400 text-black px-1 py-0.2 rounded font-black font-sans uppercase tracking-tighter">
                    + GET
                  </span>
                </span>
              </div>
            </button>

            {/* Level / User Card */}
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-xl">{profile.avatar}</span>
              <div>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value.substring(0, 14) }))}
                  className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-amber-400 text-xs font-bold text-white focus:outline-none w-20 sm:w-24 transition-colors"
                  placeholder="Enter alias..."
                />
                <span className="block text-[8px] font-mono text-white/30 uppercase tracking-tight">
                  LVL {profile.level} {currentUser || customUser ? 'VIP MEMBER' : 'GUEST'}
                </span>
              </div>
            </div>

            {/* Cloud Sync Status Indicator */}
            {(currentUser || customUser) && (
              <div 
                className="flex items-center justify-center p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                title={isSyncing ? "Saving progress to cloud..." : "VIP Profile synced in cloud"}
              >
                <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-pulse text-amber-400' : ''}`} />
              </div>
            )}

            {/* VIP Auth Actions */}
            {currentUser || customUser ? (
              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer animate-fade-in"
                title="Log Out VIP Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-extrabold text-xs transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 cursor-pointer"
                title="Sign in to save your achievements!"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden md:inline">VIP JOIN</span>
              </button>
            )}

            {/* Action buttons */}
            <button
              onClick={() => setIsAcademyOpen(true)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
              title="Bingo 101 Academy"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      )}

      {/* Floating Alert Messages */}
      <AnimatePresence>
        {feedbackMsg && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
                feedbackMsg.type === 'success' 
                  ? 'bg-green-950/90 border-green-500/40 text-green-300' 
                  : feedbackMsg.type === 'error'
                    ? 'bg-red-950/90 border-red-500/40 text-red-300'
                    : 'bg-zinc-900/95 border-zinc-700 text-zinc-300'
              }`}
            >
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                feedbackMsg.type === 'success' ? 'text-green-400' : feedbackMsg.type === 'error' ? 'text-red-400' : 'text-amber-400'
              }`} />
              <div className="flex-1">
                <p className="text-xs font-semibold leading-relaxed">{feedbackMsg.text}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className={`mx-auto transition-all duration-300 ${
        activeGame !== null 
          ? `w-full max-w-none p-0 sm:p-4 max-sm:fixed max-sm:inset-x-0 max-sm:z-40 max-sm:bg-[#05050a] max-sm:overflow-y-auto ${
              gameState === GameState.PLAYING 
                ? 'max-sm:top-0 max-sm:h-screen' 
                : 'max-sm:top-[60px] max-sm:h-[calc(100vh-60px)]'
            }` 
          : 'max-w-7xl px-4 sm:px-6 py-8 animate-fade-in'
      }`}>
        
        {/* LOBBY GAME SCREEN */}
        {gameState === GameState.LOBBY && (
          <div className="space-y-8">
            {/* 2. Hero Banner, 3. Statistics, 4. Featured Games */}
            {activeGame === null && selectedCategory !== 'earn_chips' && (
              <>
                {/* 2. Hero Banner */}
                <div className="bg-gradient-to-r from-amber-500/15 via-[#0a0a1f]/90 to-blue-500/10 border border-white/10 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden group text-left">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/5 via-transparent to-transparent pointer-events-none" />
                  <div className="space-y-2 text-center md:text-left relative z-10">
                    <span className="text-[9px] bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black uppercase font-mono tracking-widest px-3 py-1 rounded-full shadow-md shadow-amber-400/10 inline-block">
                      Learn & Play 101
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                      Welcome to the <strong className="text-amber-400">Bingo 101 Casino</strong>
                    </h2>
                    <p className="text-xs text-white/60 max-w-xl leading-relaxed">
                      Try your luck across our simulated gaming floors! Master classical 75-Ball Bingo patterns, explore Vegas slots, and scale multipliers in high-speed arcade action.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAcademyOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-extrabold text-xs transition-all tracking-wider shadow-lg hover:shadow-amber-400/15 active:scale-95 cursor-pointer relative z-10"
                  >
                    <BookOpen className="w-4 h-4" /> LEARN BINGO 101
                  </button>
                </div>

                {/* 3. Statistics */}
                <LobbyStatistics profile={profile} />

                {/* 4. Featured Games */}
                <FeaturedGames 
                  onPlayGame={(gameId) => {
                    setActiveGame(gameId);
                    setActiveLobbyTab(gameId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                />
              </>
            )}

            {/* Active Game Top Bar OR Lobby Selection Cards Grid */}
            {activeGame !== null ? (
              /* FLOATING/STICKY DEDICATED TOP BAR FOR ACTIVE GAME */
              <div className="fixed inset-x-0 top-0 z-50 sm:sticky sm:top-0 sm:z-40 bg-[#0a0a1f]/95 backdrop-blur-md border-b sm:border border-white/10 p-3 sm:p-4 rounded-none sm:rounded-3xl shadow-2xl flex flex-row justify-between items-center gap-3 h-[60px] sm:h-auto">
                <div className="flex items-center gap-2 sm:gap-4 text-left">
                  <button
                    onClick={() => {
                      if (activeGame === 'BINGO') {
                        handleEndGameAndBackToLobby();
                      } else {
                        setActiveGame(null);
                      }
                    }}
                    className="flex items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80 hover:text-white transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back to Lobby</span>
                    <span className="sm:hidden">Exit</span>
                  </button>
                  
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-lg sm:text-xl">
                      {CASINO_GAMES.find(g => g.id === activeGame)?.name.split(' ')[0] || '🎮'}
                    </span>
                    <div>
                      <h2 className="text-xs sm:text-sm font-black uppercase text-white tracking-wide">
                        {CASINO_GAMES.find(g => g.id === activeGame)?.name.substring(CASINO_GAMES.find(g => g.id === activeGame)?.name.indexOf(' ') + 1) || activeGame}
                      </h2>
                      <span className="hidden sm:block text-[9px] text-white/40 font-mono uppercase tracking-widest">
                        {CASINO_GAMES.find(g => g.id === activeGame)?.category} Game
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Wallet & Level Display */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-400/10 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-400/20 shadow-inner">
                    <Coins className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                    <span className="text-xs font-mono font-black text-amber-400">
                      {profile.chips}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                    <span className="text-xs font-bold font-mono text-white/80">Lvl {profile.level}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* THE LOBBY VIEW - SEARCH, CATEGORIES & BEAUTIFUL RESPONSIVE CARDS GRID */
              <div className="space-y-8">
                {/* Filter categories & Search bar */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0a0a1f]/80 p-4 rounded-3xl border border-white/10 shadow-lg">
                  {/* Category Pill Buttons */}
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {[
                      { id: 'all', label: '🚀 All Games' },
                      { id: 'slots', label: '🎰 Slots' },
                      { id: 'tables', label: '🃏 Table Games' },
                      { id: 'multipliers', label: '📈 Multipliers' },
                      { id: 'specialty', label: '🔮 Specialty' },
                      { id: 'earn_chips', label: '🎁 Earn Chips' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-amber-400 border-amber-300 text-black shadow-md shadow-amber-400/20'
                            : 'bg-white/5 border-transparent text-white/60 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Search input */}
                  {selectedCategory !== 'earn_chips' && (
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search 24+ Vegas games..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-semibold text-white placeholder-white/35 focus:outline-none focus:border-amber-400 transition-all"
                      />
                    </div>
                  )}
                </div>

                {selectedCategory === 'earn_chips' ? (
                  <EarnChips
                    profile={profile}
                    onAddChips={(amount, desc) => handleUpdateChipsWithLog('EARN', amount, desc)}
                    triggerAlert={triggerAlert}
                    tasks={profile.dailyTasks || []}
                    onClaimTask={handleClaimDailyTask}
                    onAddTask={handleAddCustomTask}
                    onProgressTask={handleProgressCustomTask}
                  />
                ) : (
                  /* Grid of games cards */
                  <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="text-left">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Popular Slots & Tables
                      </h3>
                      <p className="text-[10px] text-white/40 font-mono">CHOOSE FROM THE CASINO GAMES LIST</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400/80 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20">
                      {CASINO_GAMES.length} GAMES
                    </span>
                  </div>

                  {/* Cards Render */}
                  {(() => {
                    const filteredGames = CASINO_GAMES.filter(game => {
                      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            game.desc.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
                      return matchesSearch && matchesCategory;
                    });

                    if (filteredGames.length === 0) {
                      return (
                        <div className="text-center py-12 bg-white/5 border border-white/5 border-dashed rounded-3xl space-y-3">
                          <HelpCircle className="w-8 h-8 text-white/20 mx-auto" />
                          <p className="text-xs text-white/40 font-mono">No casino games matched "{searchQuery}"</p>
                          <button 
                            type="button"
                            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                            className="text-xs text-amber-400 font-bold underline"
                          >
                            Reset filters
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {filteredGames.map((game) => (
                          <motion.div
                            key={game.id}
                            whileHover={{ scale: 1.02, y: -4 }}
                            className="bg-gradient-to-b from-[#0a0a1f] to-[#050510] border border-white/10 hover:border-amber-400/40 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.05)] transition-all group relative overflow-hidden text-left"
                          >
                            <div className="absolute -right-10 -top-10 w-24 h-24 bg-amber-400/5 rounded-full blur-xl group-hover:bg-amber-400/10 transition-colors pointer-events-none" />
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                {game.badge && (
                                  <span className={`text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-md tracking-wider ${
                                    game.badge === 'HOT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                    game.badge === 'NEW' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' :
                                    game.badge === 'VIP' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                    game.badge === 'TRENDING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                    'bg-amber-400/20 text-amber-400 border border-amber-400/30'
                                  }`}>
                                    {game.badge}
                                  </span>
                                )}
                                <span className="text-white/20 text-[10px] font-mono uppercase tracking-widest">{game.category}</span>
                              </div>
                              
                              <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">{game.name}</h3>
                              <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">{game.desc}</p>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setActiveLobbyTab(game.id as any);
                                setActiveGame(game.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                const mainEl = document.querySelector('main');
                                if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full py-2.5 rounded-xl bg-white/5 group-hover:bg-amber-400 group-hover:text-black border border-white/10 group-hover:border-amber-300 text-xs font-extrabold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              PLAY NOW <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
                )}
              </div>
            )}

            {/* Conditional Game Views wrapped inside dynamic ActiveGameWrapper */}
            {activeGame !== null && (
              <ActiveGameWrapper
                activeGame={activeGame}
                profile={profile}
                onPlayGame={(gameId) => {
                  if (activeGame === 'BINGO') {
                    handleEndGameAndBackToLobby();
                  }
                  setActiveGame(gameId);
                  setActiveLobbyTab(gameId as any);
                  triggerAlert(`Switched to ${CASINO_GAMES.find(g => g.id === gameId)?.name}!`, 'info');
                }}
                onBackToLobby={() => {
                  if (activeGame === 'BINGO') {
                    handleEndGameAndBackToLobby();
                  } else {
                    setActiveGame(null);
                  }
                }}
              >

            {/* Conditional Game Views */}
            {activeLobbyTab === 'SLOTS' && (
              <SlotGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Vegas Slots Spin: Won +${delta} Chips! 🎉` : `Vegas Slots: Placed ${Math.abs(delta)} Chip spin`;
                  handleUpdateChipsWithLog('SLOTS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'CYBER_SLOTS' && (
              <CyberWildsSlots
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Cyber Wilds Slots Spin: Won +${delta} Chips! 🔥` : `Cyber Wilds Slots: Placed ${Math.abs(delta)} Chip spin`;
                  handleUpdateChipsWithLog('CYBER_SLOTS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'ZEN_SLOTS' && (
              <ZenSakuraSlots
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Zen Sakura Slots Spin: Won +${delta} Chips! 🌸` : `Zen Sakura Slots: Placed ${Math.abs(delta)} Chip spin`;
                  handleUpdateChipsWithLog('ZEN_SLOTS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'COSMIC_SLOTS' && (
              <CosmicVoidSlots
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Cosmic Void Slots Spin: Won +${delta} Chips! 🪐` : `Cosmic Void Slots: Placed ${Math.abs(delta)} Chip spin`;
                  handleUpdateChipsWithLog('COSMIC_SLOTS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'PIRATE_SLOTS' && (
              <PirateCoveSlots
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Crimson Cove Slots Spin: Won +${delta} Chips! 🏴‍☠️` : `Crimson Cove Slots: Placed ${Math.abs(delta)} Chip spin`;
                  handleUpdateChipsWithLog('PIRATE_SLOTS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'PHARAOH_SLOTS' && (
              <PharaohGoldSlots
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Pharaoh's Gold Slots Spin: Won +${delta} Chips! 🏺` : `Pharaoh's Gold Slots: Placed ${Math.abs(delta)} Chip spin`;
                  handleUpdateChipsWithLog('PHARAOH_SLOTS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'CANDY_SLOTS' && (
              <CandyWonderlandSlots
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Candy Wonderland Slots Spin: Won +${delta} Chips! 🍭` : `Candy Wonderland Slots: Placed ${Math.abs(delta)} Chip spin`;
                  handleUpdateChipsWithLog('CANDY_SLOTS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'RETRO_SLOTS' && (
              <RetroArcadeSlots
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Retro Arcade Slots Spin: Won +${delta} Chips! 🎮` : `Retro Arcade Slots: Placed ${Math.abs(delta)} Chip spin`;
                  handleUpdateChipsWithLog('RETRO_SLOTS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'IRISH_SLOTS' && (
              <LuckyLeprechaunSlots
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Lucky Leprechaun Slots Spin: Won +${delta} Chips! 🍀` : `Lucky Leprechaun Slots: Placed ${Math.abs(delta)} Chip spin`;
                  handleUpdateChipsWithLog('IRISH_SLOTS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'GEMS' && (
              <GemsFortuneGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Gems Fortune Match: Won +${delta} Chips! 💎` : `Gems Fortune Match: Placed ${Math.abs(delta)} Chip wager`;
                  handleUpdateChipsWithLog('GEMS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'DICE' && (
              <DiceGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Dice Duel Round: Defeated Dealer! Won +${delta} Chips 🎲` : `Dice Duel Round: Dealer won. Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('DICE', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'CRASH' && (
              <CrashGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Rocket Flight Cashout: Won +${delta} Chips! 🚀` : `Rocket Flight: Crashed! Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('CRASH', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'MINES' && (
              <MinesGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Mines Sweeper Cashout: Won +${delta} Chips! 💣` : `Mines Sweeper: Hit a Mine! Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('MINES', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'PLINKO' && (
              <PlinkoGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Plinko Land: Won +${delta} Chips! 🎯` : `Plinko wager: Placed ${Math.abs(delta)} Chip drop`;
                  handleUpdateChipsWithLog('PLINKO', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'HILO' && (
              <HiLoGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Hi-Lo Duel Cashout: Won +${delta} Chips! 🏆` : `Hi-Lo Duel wager: Placed ${Math.abs(delta)} Chip wager`;
                  handleUpdateChipsWithLog('HILO', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'ROULETTE' && (
              <RouletteGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Vegas Neon Roulette win: Won +${delta} Chips! 🎉` : `Vegas Neon Roulette bet: Placed ${Math.abs(delta)} Chip board bet`;
                  handleUpdateChipsWithLog('ROULETTE', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'BLACKJACK' && (
              <BlackjackGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Classic Blackjack win: Won +${delta} Chips! 🎉` : `Classic Blackjack bet: Placed ${Math.abs(delta)} Chip bet`;
                  handleUpdateChipsWithLog('BLACKJACK', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'POKER' && (
              <VideoPokerGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Video Poker win: Won +${delta} Chips! 🎉` : `Video Poker bet: Placed ${Math.abs(delta)} Chip bet`;
                  handleUpdateChipsWithLog('POKER', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'KENO' && (
              <KenoGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Cosmic Keno win: Won +${delta} Chips! 🎉` : `Cosmic Keno bet: Placed ${Math.abs(delta)} Chip board bet`;
                  handleUpdateChipsWithLog('KENO', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'SNAKE' && (
              <SnakeGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Cosmic Snake win: Won +${delta} Chips! 🎉` : `Cosmic Snake bet: Placed ${Math.abs(delta)} Chip wager`;
                  handleUpdateChipsWithLog('SNAKE', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'COINFLIP' && (
              <CoinFlipGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Neon Coin Toss: Landed correctly! Won +${delta} Chips! 🎉` : `Neon Coin Toss wager: Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('COINFLIP', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'WHEEL' && (
              <MegaWheelGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Dream Mega Wheel: Hit multiplier! Won +${delta} Chips! 🎡` : `Dream Mega Wheel wager: Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('WHEEL', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'TOWER' && (
              <TowerClimbGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Neon Tower Climb: Cashout payout! Won +${delta} Chips! 🏰` : `Neon Tower Climb wager: Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('TOWER', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'SCRATCH' && (
              <ScratchCardGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Cosmic Scratchers: Matched symbols! Won +${delta} Chips! 🎫` : `Cosmic Scratchers ticket: Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('SCRATCH', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'RPS' && (
              <RockPaperScissorsGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `RPS Showdown: Won duel! Won +${delta} Chips! ⚔️` : `RPS Showdown duel: Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('RPS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'SHELL' && (
              <ShellGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Golden Shells win: Won +${delta} Chips! 🔮` : `Golden Shells bet: Placed ${Math.abs(delta)} Chip wager`;
                  handleUpdateChipsWithLog('SHELL', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'DERBY' && (
              <DerbyGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Cyber Derby win: Racer took 1st! Won +${delta} Chips! 🐎` : `Cyber Derby bet: Placed ${Math.abs(delta)} Chip racer wager`;
                  handleUpdateChipsWithLog('DERBY', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'DRAGON_TIGER' && (
              <DragonTigerGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Dragon Tiger Duel payout: Won +${delta} Chips! 🐉` : `Dragon Tiger Duel bet: Placed ${Math.abs(delta)} Chip duel wager`;
                  handleUpdateChipsWithLog('DRAGON_TIGER', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'PUSHER' && (
              <CoinPusherGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Coin Pusher gold cascade: Won +${delta} Chips! 🪙` : `Coin Pusher play: Dropped ${Math.abs(delta)} Chip coin`;
                  handleUpdateChipsWithLog('PUSHER', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'LIMBO' && (
              <LimboGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Limbo roll multiplier: Won +${delta} Chips! 🚀` : `Limbo roll wager: Placed ${Math.abs(delta)} Chip roll`;
                  handleUpdateChipsWithLog('LIMBO', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'SHOOTER' && (
              <SpaceShooterGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Space Shooter cashout: Won +${delta} Chips! ☄️` : `Space Shooter crash: Placed ${Math.abs(delta)} Chip launch bet`;
                  handleUpdateChipsWithLog('SHOOTER', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'BACCARAT' && (
              <BaccaratGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Baccarat Royale payout: Won +${delta} Chips! 👑` : `Baccarat Royale bet: Placed ${Math.abs(delta)} Chip table wager`;
                  handleUpdateChipsWithLog('BACCARAT', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'DARTS' && (
              <DartsGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Neon Darts: Hit target! Won +${delta} Chips! 🎯` : `Neon Darts throw: Placed ${Math.abs(delta)} Chip bet`;
                  handleUpdateChipsWithLog('DARTS', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'PINATA' && (
              <PinataGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Cosmic Piñata Splatter: Won +${delta} Chips! 🪅` : `Cosmic Piñata contract: Placed ${Math.abs(delta)} Chip contract wager`;
                  handleUpdateChipsWithLog('PINATA', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'VAULT' && (
              <VaultGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Vault Escape cashout: Won +${delta} Chips! 📦` : `Vault Escape heist: Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('VAULT', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'MONTE' && (
              <MonteGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Three-Card Monte: Found Gold Queen! Won +${delta} Chips! 👑` : `Three-Card Monte: Lost ${Math.abs(delta)} Chips`;
                  handleUpdateChipsWithLog('MONTE', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'TAROT' && (
              <TarotGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Mystic Tarot draw: Won +${delta} Chips! 🔮` : `Mystic Tarot reading: Placed ${Math.abs(delta)} Chip wager`;
                  handleUpdateChipsWithLog('TAROT', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'BOWLING' && (
              <BowlingGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Cosmic Bowling frame: Won +${delta} Chips! 🎳` : `Cosmic Bowling roll: Placed ${Math.abs(delta)} Chip wager`;
                  handleUpdateChipsWithLog('BOWLING', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'DRAGRACE' && (
              <DragRaceGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Cyber Drag Race winner: Won +${delta} Chips! 🏎️` : `Cyber Drag Race track: Placed ${Math.abs(delta)} Chip wager`;
                  handleUpdateChipsWithLog('DRAGRACE', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'SOLITAIRE' && (
              <SolitaireGame
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const desc = delta > 0 ? `Solitaire Match clearing: Won +${delta} Chips! 🀄` : `Solitaire Match entry: Placed ${Math.abs(delta)} Chip wager`;
                  handleUpdateChipsWithLog('SOLITAIRE', delta, desc);
                }}
                onUpdateTask={updateDailyTaskProgress}
                triggerAlert={triggerAlert}
              />
            )}

            {activeLobbyTab === 'BINGO' && (
              /* Quick Lobby Setup Panel & Buy Desk */
              <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 animate-fade-in">
                {/* Game Setup */}
                <div className="bg-[#0a0a1f] border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" /> Casino Floor Settings
                  </h3>

                  {/* Grid selectors */}
                  <div className="space-y-4">
                    {/* Pattern Selection */}
                    <div>
                      <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wide">
                        Select Target Winning Pattern
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                        {[
                          { id: PatternType.LINE, label: 'Line', mult: 2.5 },
                          { id: PatternType.FOUR_CORNERS, label: 'Corners', mult: 4.0 },
                          { id: PatternType.LETTER_X, label: 'Letter X', mult: 6.0 },
                          { id: PatternType.PLUS_SIGN, label: 'Plus (+)', mult: 5.0 },
                          { id: PatternType.BLACKOUT, label: 'Blackout', mult: 15.0 },
                        ].map((pat) => {
                          const isSelected = targetPattern === pat.id;
                          return (
                            <button
                              key={pat.id}
                              onClick={() => setTargetPattern(pat.id)}
                              className={`p-3 rounded-xl border text-center transition-all flex flex-col justify-center items-center ${
                                isSelected
                                  ? 'bg-amber-400/10 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                  : 'bg-white/5 border-white/5 hover:border-white/10 text-white/60'
                              }`}
                            >
                              <span className="text-xs font-bold font-sans">{pat.label}</span>
                              <span className="text-[9px] font-mono text-amber-500 mt-1 font-bold">{pat.mult.toFixed(1)}x Payout</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ticket Buy Slider */}
                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <div>
                        <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wide flex justify-between">
                          <span>Number of Tickets</span>
                          <span className="text-amber-400 font-bold">{ticketCount} Tickets</span>
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4].map((num) => (
                            <button
                              key={num}
                              onClick={() => setTicketCount(num)}
                              className={`flex-1 py-3 rounded-xl border font-bold text-sm ${
                                ticketCount === num
                                  ? 'bg-amber-400 border-amber-300 text-black shadow-md shadow-amber-400/20'
                                  : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10 hover:text-white'
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                        <span className="block text-[10px] text-white/30 font-mono mt-1.5">
                          Each ticket costs 25 chips. Entry: {ticketCount * 25} chips.
                        </span>
                      </div>

                      {/* Speeds */}
                      <div>
                        <label className="block text-xs text-white/40 font-mono mb-2 uppercase tracking-wide">
                          Caller Game Speed
                        </label>
                        <div className="flex gap-2">
                          {[
                            { label: 'Slow (5s)', value: 5000 },
                            { label: 'Normal (3s)', value: 3000 },
                            { label: 'Fast (1.5s)', value: 1500 },
                          ].map((sp) => (
                            <button
                              key={sp.value}
                              onClick={() => setCallerSpeed(sp.value)}
                              className={`flex-1 py-3 rounded-xl border text-xs font-bold ${
                                callerSpeed === sp.value
                                  ? 'bg-amber-400/10 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                  : 'bg-white/5 border-white/5 text-white/50 hover:border-white/10 hover:text-white'
                              }`}
                            >
                              {sp.label}
                            </button>
                          ))}
                        </div>
                        <span className="block text-[10px] text-white/30 font-mono mt-1.5">
                          Adjusts speed of ball calling in real-time.
                        </span>
                      </div>
                    </div>

                    {/* Autodaub & Voice options */}
                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-[#111126]/60 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
                        <div>
                          <span className="block text-xs font-bold text-white mb-0.5">Auto-Daub Tickets</span>
                          <p className="text-[10px] text-white/40">Stamps called numbers automatically</p>
                        </div>
                        <button
                          onClick={() => setIsAutoDaub(!isAutoDaub)}
                          className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 ${
                            isAutoDaub ? 'bg-amber-400' : 'bg-white/10'
                          }`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full bg-black transition-transform duration-300 ${
                            isAutoDaub ? 'translate-x-5.5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <div className="p-4 bg-[#111126]/60 rounded-2xl border border-white/5 flex items-center justify-between hover:border-white/10 transition-colors">
                        <div>
                          <span className="block text-xs font-bold text-white mb-0.5">Voice Caller</span>
                          <p className="text-[10px] text-white/40">Speaks drawn numbers in real-time</p>
                        </div>
                        <button
                          onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                          className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 ${
                            isVoiceEnabled ? 'bg-amber-400' : 'bg-white/10'
                          }`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full bg-black transition-transform duration-300 ${
                            isVoiceEnabled ? 'translate-x-5.5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Big PLAY CTA */}
                  <button
                    onClick={handleBuyTicketsAndStart}
                    className="w-full py-4.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-amber-600 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" /> BUY TICKETS & PLAY
                  </button>
                </div>

                {/* Sidebar Profile Card Selection */}
                <div className="bg-[#0a0a1f] border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2 mb-4">
                      <User className="w-4 h-4 text-amber-400" /> Customize Your Token
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATARS.map((av) => (
                        <button
                          key={av}
                          onClick={() => setProfile(prev => ({ ...prev, avatar: av }))}
                          className={`text-2xl p-2 rounded-xl transition-all border ${
                            profile.avatar === av
                              ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                              : 'bg-white/5 border-white/5 hover:border-white/10 text-white/50'
                          }`}
                        >
                          {av}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-[#111126]/60 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40 font-mono">Current Target:</span>
                      <span className="font-bold text-amber-400">{getPatternDisplayName(targetPattern)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40 font-mono">Difficulty:</span>
                      <span className="font-bold text-white/80">
                        {targetPattern === PatternType.BLACKOUT ? 'Jackpot / Hard' : 'Standard / Easy'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40 font-mono">Est. Prize multiplier:</span>
                      <span className="font-bold text-emerald-400 font-mono">{getPatternMultiplier(targetPattern).toFixed(1)}x</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

              </ActiveGameWrapper>
            )}

            {/* 7. Daily Rewards, 8. Leaderboard, 9. Player Progress, 10. Achievements, 11. FAQ, 12. Testimonials, 13. Footer */}
            {activeGame === null && selectedCategory !== 'earn_chips' && (
              <>
                {/* 7. Daily Rewards */}
                <LobbyDailyRewards 
                  profile={profile} 
                  onAddChips={(amount, desc) => handleUpdateChipsWithLog('EARN', amount, desc)}
                  triggerAlert={triggerAlert}
                />

                {/* 8. Leaderboard */}
                <LobbyLeaderboard profile={profile} />

                {/* 9. Player Progress */}
                <LobbyPlayerProgress profile={profile} />

                {/* 10. Achievements */}
                <LobbyAchievements 
                  profile={profile} 
                  onClaimReward={(amount, desc) => handleUpdateChipsWithLog('ACHIEVEMENT', amount, desc)}
                />

                {/* 11. FAQ */}
                <FAQSection />

                {/* 12. Testimonials */}
                <TestimonialsSection />

                {/* 13. Footer */}
                <LobbyFooter 
                  onOpenAcademy={() => setIsAcademyOpen(true)} 
                  onOpenPolicies={() => {
                    setActivePolicyTab('privacy');
                    setIsPolicyOpen(true);
                  }}
                />
              </>
            )}
          </div>
        )}

        {/* ACTIVE PLAYING SCREEN */}
        {gameState === GameState.PLAYING && (
          <div className="space-y-6 p-4 sm:p-0">
            
            {/* HUD Status Bar */}
            <div className="flex flex-row justify-between items-center bg-[#0a0a1f]/95 border-b sm:border border-white/10 p-3 sm:p-4 rounded-none sm:rounded-2xl shadow-xl gap-3 max-sm:sticky max-sm:top-0 max-sm:z-50 max-sm:-mx-4 max-sm:-mt-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={handleEndGameAndBackToLobby}
                  className="px-3 py-1.5 rounded-xl border border-white/10 text-[11px] sm:text-xs text-white/60 hover:text-white transition-all bg-white/5 hover:bg-white/10 font-mono font-bold"
                >
                  Exit
                </button>
                <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
                  <span className="font-mono">Target Pattern:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" /> {getPatternDisplayName(targetPattern)}
                  </span>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Auto Daub state pill */}
                <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono uppercase font-bold border ${
                  isAutoDaub 
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' 
                    : 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                }`}>
                  {isAutoDaub ? 'Auto' : 'Manual'}
                </span>

                {/* Draw status */}
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white/40 font-mono">
                  <span>BALLS:</span>
                  <span className="text-white font-bold">{ballsCalledThisRound}</span>
                </div>
              </div>
            </div>

            {/* Grid Layout of Caller panel & Tickets */}
            <div className="grid lg:grid-cols-[1fr_2.5fr] gap-6">
              
              {/* Left Side: Live Caller Sphere */}
              <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl">
                
                {/* Caller Ball Section */}
                <div className="text-center space-y-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">
                    LIVE CALLER DESK
                  </span>

                  {/* Gigantic Sphere representation */}
                  <div className="flex justify-center my-4">
                    <AnimatePresence mode="wait">
                      {lastCalledBall ? (
                        <motion.div
                          key={`${lastCalledBall.number}`}
                          initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
                          animate={{ rotate: 0, scale: 1, opacity: 1 }}
                          exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
                          transition={{ type: 'spring', damping: 11 }}
                          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl relative border-4 ${
                            lastCalledBall.letter === 'B' ? 'bg-gradient-to-br from-blue-600 to-blue-800 border-blue-400/80 shadow-blue-500/20' :
                            lastCalledBall.letter === 'I' ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400/80 shadow-red-500/20' :
                            lastCalledBall.letter === 'N' ? 'bg-gradient-to-br from-amber-500 to-amber-700 border-amber-400/80 shadow-amber-500/20' :
                            lastCalledBall.letter === 'G' ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-400/80 shadow-green-500/20' :
                            'bg-gradient-to-br from-purple-600 to-purple-800 border-purple-400/80 shadow-purple-500/20'
                          }`}
                        >
                          {/* Inner Sphere lighting gloss effect */}
                          <div className="absolute top-1.5 left-6 w-12 h-6 bg-white/20 rounded-full filter blur-[1px] transform -rotate-12" />
                          
                          {/* Sphere Value */}
                          <span className="text-2xl font-black font-mono text-white tracking-tighter opacity-70">
                            {lastCalledBall.letter}
                          </span>
                          <span className="text-4xl font-black font-sans text-white leading-none tracking-tight">
                            {lastCalledBall.number}
                          </span>
                        </motion.div>
                      ) : (
                        <div className="w-32 h-32 rounded-full border border-white/10 border-dashed flex flex-col items-center justify-center text-center text-white/30 bg-white/5">
                          <span className="text-xs font-mono">WAITING</span>
                          <span className="text-xs font-mono">FOR DRAW</span>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Active speed and controls buttons */}
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                        isPaused 
                          ? 'bg-amber-400 border-amber-300 text-black shadow-md shadow-amber-400/20' 
                          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                      {isPaused ? 'RESUME CALLER' : 'PAUSE'}
                    </button>
                    <button
                      onClick={() => {
                        // Force instantaneous draw
                        drawNextBall();
                      }}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-white/75 hover:text-white hover:bg-white/10"
                    >
                      NEXT BALL
                    </button>
                  </div>
                </div>

                {/* Last Called list */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">
                    BALL HISTORY (LAST 5)
                  </span>
                  <div className="flex gap-2 justify-center">
                    {lastFiveCalled.slice(1, 5).map((ball, idx) => (
                      <div
                        key={`${ball.number}-${idx}`}
                        className={`w-9 h-9 rounded-full border text-xs font-mono font-bold flex items-center justify-center ${
                          ball.letter === 'B' ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' :
                          ball.letter === 'I' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                          ball.letter === 'N' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                          ball.letter === 'G' ? 'bg-green-500/10 border-green-500/30 text-green-300' :
                          'bg-purple-500/10 border-purple-500/30 text-purple-300'
                        }`}
                      >
                        {ball.letter}{ball.number}
                      </div>
                    ))}
                    {lastFiveCalled.length <= 1 && (
                      <span className="text-[10px] text-white/20 font-mono py-1">No drawing history yet</span>
                    )}
                  </div>
                </div>

                {/* Interactive Payout summary desk */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span className="text-white/40">Tickets Purchased:</span>
                    <span className="font-bold text-white">{ticketCount}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-white/40">Target Payout:</span>
                    <span className="font-bold text-amber-400">{getPatternDisplayName(targetPattern)} ({getPatternMultiplier(targetPattern).toFixed(1)}x)</span>
                  </div>
                  {roundPrizes > 0 && (
                    <div className="flex justify-between font-mono pt-1 border-t border-white/10">
                      <span className="text-green-400 font-bold">TOTAL WON THIS ROUND:</span>
                      <span className="font-extrabold text-green-400">+{roundPrizes} Chips</span>
                    </div>
                  )}
                </div>

                {/* Giant PULSING BINGO TRIGGER */}
                <button
                  onClick={handleClaimBingo}
                  className="w-full py-4 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:brightness-110 active:scale-95 animate-pulse transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300"
                >
                  <Sparkles className="w-4 h-4 fill-current animate-spin" /> CLAIM BINGO!
                </button>
              </div>

              {/* Right Side: Player's Active Tickets Grid */}
              <div className="space-y-6">
                
                {/* Tickets grid */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-3 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" /> Your Active Tickets
                  </h3>

                  <div className={`grid gap-4 ${
                    ticketCount === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                    ticketCount === 2 ? 'grid-cols-1 md:grid-cols-2' :
                    ticketCount === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'
                  }`}>
                    {tickets.map((card) => (
                      <BingoCard
                        key={card.id}
                        card={card}
                        onCellClick={handleCellClick}
                        isManualDaub={!isAutoDaub}
                        calledNumbers={calledNumbers}
                        targetPatternIndices={getTargetIndices()}
                      />
                    ))}
                  </div>
                </div>

                {/* Master calling board for cross checks */}
                <BingoBoard calledNumbers={calledNumbers} lastCalledNumber={lastCalledBall?.number || null} />
              </div>
            </div>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === GameState.GAME_OVER && (
          <div className="max-w-xl mx-auto bg-[#0a0a1f]/95 border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ROUND COMPLETE</span>
              <h2 className="text-2xl font-bold tracking-tight text-white">Vegas Lobby Recap</h2>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3.5 text-sm text-left">
              <div className="flex justify-between font-mono text-white/55">
                <span>Tickets Bought:</span>
                <span className="font-bold text-white">{ticketCount}</span>
              </div>
              <div className="flex justify-between font-mono text-white/55">
                <span>Target Goal:</span>
                <span className="font-bold text-amber-400">{getPatternDisplayName(targetPattern)}</span>
              </div>
              <div className="flex justify-between font-mono text-white/55">
                <span>Balls Drawn before End:</span>
                <span className="font-bold text-white">{ballsCalledThisRound} / 75</span>
              </div>
              <div className="flex justify-between font-mono pt-2 border-t border-white/10">
                <span className="font-bold text-white/70">Net Chip Rewards:</span>
                <span className={`font-extrabold ${roundPrizes > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {roundPrizes > 0 ? `+${roundPrizes} Chips` : `-${ticketCount * 25} Chips`}
                </span>
              </div>
            </div>

            <button
              onClick={handleEndGameAndBackToLobby}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer"
            >
              RETURN TO LOBBY
            </button>
          </div>
        )}
      </main>

      {/* FOOTER METADATA / INFORMATION */}
      <footer className="bg-[#05050a] border-t border-white/10 py-12 px-6 mt-16 text-center text-xs text-white/40 font-mono space-y-4">
        {/* Compliance Pages Links list */}
        <div className="flex flex-wrap justify-center items-center gap-6 pb-2 text-[11px]">
          {[
            { id: 'about', label: 'ABOUT US' },
            { id: 'contact', label: 'CONTACT US' },
            { id: 'privacy', label: 'PRIVACY POLICY' },
            { id: 'terms', label: 'TERMS & CONDITIONS' }
          ].map((link) => (
            <button
              key={link.id}
              id={`footer-link-${link.id}`}
              onClick={() => {
                setActivePolicyTab(link.id as any);
                setIsPolicyOpen(true);
              }}
              className="text-white/40 hover:text-amber-400 transition-colors font-bold uppercase tracking-wider cursor-pointer border-b border-transparent hover:border-amber-400/30 pb-0.5"
            >
              {link.label}
            </button>
          ))}
        </div>

        <p>© 2026 BINGO 101 CASINO - FULLY SECURED PLAYGROUND</p>
        <p className="max-w-md mx-auto text-[10px] text-white/30 leading-relaxed">
          This platform uses fully simulated non-monetary currency for learning & entertainment purposes only. Practice rules, auto-daub combinations, and claim jackpot ratios inside our safe system.
        </p>
      </footer>

      {/* Bingo 101 Academy Modal Overlay */}
      <AnimatePresence>
        {isAcademyOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl"
            >
              <BingoAcademy
                onClose={() => setIsAcademyOpen(false)}
                onSelectPattern={(pat) => {
                  setTargetPattern(pat);
                  setIsAcademyOpen(false);
                  triggerAlert(`Target pattern updated to: ${getPatternDisplayName(pat)}`, 'success');
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Corporate Compliance Policy documents Modal Overlay */}
      <AnimatePresence>
        {isPolicyOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl flex justify-center"
            >
              <PolicyDocuments
                initialTab={activePolicyTab}
                onClose={() => setIsPolicyOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIP Authentication Modal Overlay */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0a0a1f]/95 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_35px_rgba(245,158,11,0.15)] relative"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setClickStep(0);
                }}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors cursor-pointer text-xs font-mono"
              >
                [ESC CLOSE]
              </button>

              {/* Title Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Lock className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white uppercase">
                  {authMode === 'login' ? 'VIP Vault Sign-In' : 'VIP Vault Registration'}
                </h3>
                <p className="text-[11px] text-white/60 leading-relaxed max-w-xs mx-auto">
                  {authMode === 'login' 
                    ? 'Enter your casino username and secure password to restore your chips and level.'
                    : 'Create a brand new casino profile with a custom password to claim your starting VIP benefits.'}
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5 text-center text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    authMode === 'login' 
                      ? 'bg-amber-400 text-black font-black' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    authMode === 'signup' 
                      ? 'bg-amber-400 text-black font-black' 
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  NEW REGISTER
                </button>
              </div>

              {/* Credentials Form */}
              <form onSubmit={handleButtonClickStep} className="space-y-4">
                {authError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-200 text-xs font-mono font-medium leading-relaxed flex items-center gap-2">
                    <span className="text-red-400 text-sm">⚠️</span>
                    <div className="text-left flex-1">
                      <span className="font-bold text-red-400 block uppercase text-[10px] tracking-wider mb-0.5">SECURITY WARNING</span>
                      {authError}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-white/40 font-mono uppercase tracking-wider">
                    Casino Username
                  </label>
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 16));
                      setAuthError(null);
                    }}
                    placeholder="e.g. VegasKing77"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] text-white/40 font-mono uppercase tracking-wider">
                    Secure Password (min. 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setAuthError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white placeholder-white/20 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                {/* Triple Click Security Requirement Interface */}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                      3-Click Security Check
                    </span>
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      Step {clickStep} of 3
                    </span>
                  </div>

                  {/* Indicator lights for clicks */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[1, 2, 3].map((step) => {
                      const isActive = clickStep >= step;
                      return (
                        <div
                          key={step}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isActive
                              ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : 'bg-white/5 border border-white/5'
                          }`}
                        />
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthLoading}
                    className="w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-black font-black text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {isAuthLoading ? (
                      <span className="flex items-center gap-1.5 font-bold">
                        <Loader2 className="w-4 h-4 animate-spin text-black" />
                        ACCESSING SECURE SERVER...
                      </span>
                    ) : (
                      <>
                        <span className="font-extrabold tracking-widest text-xs">
                          {clickStep === 0 && 'INITIALIZE ACCESS [CLICK 1]'}
                          {clickStep === 1 && 'ESTABLISH CONNECT [CLICK 2]'}
                          {clickStep === 2 && 'AUTHORIZE VAULT [FINAL CLICK]'}
                        </span>
                        <span className="text-[8px] font-mono opacity-60">
                          {clickStep < 2 
                            ? `Requires ${3 - clickStep} sequential clicks to trigger` 
                            : 'Ready for authorization check!'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Disclaimer */}
              <p className="text-[10px] text-center text-white/30 font-mono pt-2">
                By entering, you confirm you are registering simulated credits for entertainment only.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
