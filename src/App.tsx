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
import { LiveWinnersTicker } from './components/LiveWinnersTicker';
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
import { SportsCasinoGames } from './components/SportsCasinoGames';
import { PolicyDocuments } from './components/PolicyDocuments';
import { EarnChips } from './components/EarnChips';
import { ProgressiveJackpots } from './components/ProgressiveJackpots';
import { LiveCommunityChat } from './components/LiveCommunityChat';
import { CasinoCashier } from './components/CasinoCashier';
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

import { ARTICLES } from './data/articles';
import { GAME_REVIEWS_CONTENT, getFallbackReview } from './data/gameReviews';

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
  { id: 'SOLITAIRE', name: '🀄 Solitaire Match', desc: 'Flip and match 8 pairs of card symbols within the 25-second countdown', category: 'tables', badge: 'DAILY' },
  { id: 'SOCCER', name: '⚽ Penalty Shootout', desc: 'Wager on target nodes and strike past the holographic keeper', category: 'specialty', badge: 'NEW' },
  { id: 'CRICKET', name: '🏏 Super Over Challenge', desc: 'Time your defensive or aggressive swings to score sixes', category: 'specialty', badge: 'HOT' },
  { id: 'BASKETBALL', name: '🏀 Neon Dunk Classic', desc: 'Align power meters to lock perfect dunks from the 3-point line', category: 'specialty', badge: 'ARCADE' },
  { id: 'GOLF', name: '⛳ Retro Mini-Golf', desc: 'Adjust slope angles and putter force to score golden holes-in-one', category: 'specialty', badge: 'FOCUS' },
  { id: 'BOXING', name: '🥊 Cyber Boxing Puncher', desc: 'Max out the neon power bar to land a devastating knockout strike', category: 'multipliers', badge: 'INSTANT' },
  { id: 'ARCHERY', name: '🏹 Precision Archery', desc: 'Predict wind drifts to loose high-multiplier arrows into the bullseye', category: 'multipliers', badge: 'NEW' },
  { id: 'ICE_HOCKEY', name: '🏒 Slapshot Shootout', desc: 'Drill pucks past goalie armor with high speed ice releases', category: 'tables', badge: 'FAST' },
  { id: 'FOOTBALL_UP', name: '🏈 Gridiron Field Goal', desc: 'Aim through changing winds to kick stadium-winning field goals', category: 'multipliers', badge: 'SIMULATION' },
  { id: 'RUGBY', name: '🏉 Rugby Dropkick Arena', desc: 'Execute strategic dropkicks over neon posts for rising multipliers', category: 'multipliers', badge: 'DAILY' },
  { id: 'TENNIS', name: '🎾 Neon Tennis Ace', desc: 'Rally back and forth against the machine to score a winning smash', category: 'tables', badge: 'DUEL' }
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
  // --- Game Quick Stats Generator for Premium Feel ---
  const getGameQuickStats = (id: string) => {
    const seed = id.charCodeAt(0) + (id.charCodeAt(1) || 0);
    const activeSeats = 15 + (seed % 65);
    
    switch (id) {
      case 'BINGO': return { rtp: '98.2%', volatility: 'MEDIUM', maxWin: '250x', activeSeats };
      case 'SLOTS': return { rtp: '96.5%', volatility: 'HIGH', maxWin: '500x', activeSeats };
      case 'CYBER_SLOTS': return { rtp: '97.2%', volatility: 'HIGH', maxWin: '1000x', activeSeats };
      case 'ZEN_SLOTS': return { rtp: '96.8%', volatility: 'LOW', maxWin: '300x', activeSeats };
      case 'COSMIC_SLOTS': return { rtp: '97.0%', volatility: 'HIGH', maxWin: '1500x', activeSeats };
      case 'PIRATE_SLOTS': return { rtp: '96.2%', volatility: 'HIGH', maxWin: '1200x', activeSeats };
      case 'PHARAOH_SLOTS': return { rtp: '95.8%', volatility: 'MEDIUM', maxWin: '2000x', activeSeats };
      case 'CANDY_SLOTS': return { rtp: '96.4%', volatility: 'MEDIUM', maxWin: '800x', activeSeats };
      case 'RETRO_SLOTS': return { rtp: '96.7%', volatility: 'LOW', maxWin: '400x', activeSeats };
      case 'IRISH_SLOTS': return { rtp: '97.1%', volatility: 'MEDIUM', maxWin: '600x', activeSeats };
      case 'GEMS': return { rtp: '98.2%', volatility: 'LOW', maxWin: '150x', activeSeats };
      case 'DICE': return { rtp: '98.0%', volatility: 'MEDIUM', maxWin: '10x', activeSeats };
      case 'CRASH': return { rtp: '99.0%', volatility: 'HIGH', maxWin: '∞ x', activeSeats };
      case 'MINES': return { rtp: '98.5%', volatility: 'HIGH', maxWin: '1000x', activeSeats };
      case 'PLINKO': return { rtp: '99.0%', volatility: 'MEDIUM', maxWin: '1000x', activeSeats };
      case 'HILO': return { rtp: '98.0%', volatility: 'MEDIUM', maxWin: '12x', activeSeats };
      case 'ROULETTE': return { rtp: '97.3%', volatility: 'MEDIUM', maxWin: '35x', activeSeats };
      case 'BLACKJACK': return { rtp: '99.5%', volatility: 'LOW', maxWin: '1.5x', activeSeats };
      case 'POKER': return { rtp: '99.5%', volatility: 'MEDIUM', maxWin: '250x', activeSeats };
      default: return { rtp: '98.0%', volatility: 'MEDIUM', maxWin: '100x', activeSeats };
    }
  };

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

  // --- Portal & Redesign States ---
  const [portalTab, setPortalTab] = useState<'home' | 'games' | 'guides' | 'news' | 'about' | 'contact' | 'privacy' | 'terms' | 'dmca' | 'sitemap' | 'game-detail'>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  useEffect(() => {
    if (activeGame !== null) {
      setPortalTab('game-detail');
    }
  }, [activeGame]);

  useEffect(() => {
    if (portalTab !== 'game-detail') {
      setActiveGame(null);
    }
  }, [portalTab]);
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

  // Theme styling token helper mapping based on isDarkMode
  const theme = {
    bg: isDarkMode ? 'bg-[#030906] text-[#f1f5f9]' : 'bg-[#fafaf6] text-[#1c2924]',
    card: isDarkMode ? 'bg-[#07160f] border-[#16412b]/80 shadow-md' : 'bg-white border-[#e6ebe8] shadow-sm',
    textPrimary: isDarkMode ? 'text-[#f5d061] font-serif font-black' : 'text-[#122b1f] font-serif font-extrabold',
    textMuted: isDarkMode ? 'text-[#8fa399]' : 'text-[#64748b]',
    border: isDarkMode ? 'border-[#16412b]/80' : 'border-[#e6ebe8]',
    header: isDarkMode ? 'bg-[#05110c]/95 border-[#16412b]' : 'bg-[#fafaf6]/95 border-[#e6ebe8]',
    footer: isDarkMode ? 'bg-[#010503] border-[#16412b] text-[#8fa399]' : 'bg-[#122b1f] text-[#f5d061] border-transparent',
    sidebarHeader: isDarkMode ? 'bg-[#16412b]/50 text-[#f5d061]' : 'bg-[#122b1f]/10 text-[#122b1f]',
    adBox: isDarkMode ? 'bg-[#16412b]/20 border-[#16412b] text-[#8fa399]' : 'bg-[#fafaf6]/80 border-[#e6ebe8] text-[#64748b]',
    accentText: isDarkMode ? 'text-[#f5d061] font-serif font-bold' : 'text-[#122b1f] font-serif font-semibold',
    secondaryText: isDarkMode ? 'text-amber-400 font-bold' : 'text-amber-600 font-semibold',
  };

  const renderActiveGame = () => {
    if (activeLobbyTab === 'BINGO') {
      if (gameState === GameState.PLAYING) {
        return (
          <div className="space-y-6">
            <div className="flex flex-row justify-between items-center bg-[#0a0a1f]/95 border border-white/10 p-4 rounded-2xl shadow-xl gap-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleEndGameAndBackToLobby}
                  className="px-3 py-1.5 rounded-xl border border-white/10 text-xs text-white/60 hover:text-white transition-all bg-white/5 hover:bg-white/10 font-mono font-bold cursor-pointer"
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
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${isAutoDaub ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-amber-400/10 text-amber-400 border-amber-400/20'}`}>
                  {isAutoDaub ? 'Auto' : 'Manual'}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                  <span>BALLS:</span>
                  <span className="text-white font-bold">{ballsCalledThisRound}</span>
                </div>
              </div>
            </div>
            <div className="grid lg:grid-cols-[1fr_2.5fr] gap-6">
              <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl">
                <div className="text-center space-y-4">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">LIVE CALLER DESK</span>
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
                          <div className="absolute top-1.5 left-6 w-12 h-6 bg-white/20 rounded-full filter blur-[1px] transform -rotate-12" />
                          <span className="text-2xl font-black font-mono text-white tracking-tighter opacity-70">{lastCalledBall.letter}</span>
                          <span className="text-4xl font-black font-sans text-white leading-none tracking-tight">{lastCalledBall.number}</span>
                        </motion.div>
                      ) : (
                        <div className="w-32 h-32 rounded-full border border-white/10 border-dashed flex flex-col items-center justify-center text-center text-white/30 bg-white/5">
                          <span className="text-xs font-mono">WAITING</span>
                          <span className="text-xs font-mono">FOR DRAW</span>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${isPaused ? 'bg-amber-400 border-amber-300 text-black shadow-md shadow-amber-400/20' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'}`}
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                      {isPaused ? 'RESUME CALLER' : 'PAUSE'}
                    </button>
                    <button onClick={drawNextBall} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-white/75 hover:text-white hover:bg-white/10 cursor-pointer">
                      NEXT BALL
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">BALL HISTORY (LAST 5)</span>
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
                    {lastFiveCalled.length <= 1 && <span className="text-[10px] text-white/20 font-mono py-1">No drawing history yet</span>}
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between font-mono"><span className="text-white/40">Tickets Purchased:</span><span className="font-bold text-white">{ticketCount}</span></div>
                  <div className="flex justify-between font-mono"><span className="text-white/40">Target Payout:</span><span className="font-bold text-amber-400">{getPatternDisplayName(targetPattern)} ({getPatternMultiplier(targetPattern).toFixed(1)}x)</span></div>
                  {roundPrizes > 0 && (
                    <div className="flex justify-between font-mono pt-1 border-t border-white/10">
                      <span className="text-green-400 font-bold">TOTAL WON THIS ROUND:</span>
                      <span className="font-extrabold text-green-400">+{roundPrizes} Chips</span>
                    </div>
                  )}
                </div>
                <button onClick={handleClaimBingo} className="w-full py-4 bg-gradient-to-r from-red-600 via-amber-400 to-red-600 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:brightness-110 active:scale-95 animate-pulse transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-amber-300">
                  <Sparkles className="w-4 h-4 fill-current animate-spin" /> CLAIM BINGO!
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-3 flex items-center gap-2"><Coins className="w-4 h-4 text-amber-400" /> Your Active Tickets</h3>
                  <div className={`grid gap-4 ${ticketCount === 1 ? 'grid-cols-1 max-w-md mx-auto' : ticketCount === 2 ? 'grid-cols-1 md:grid-cols-2' : ticketCount === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'}`}>
                    {tickets.map((card) => (
                      <BingoCard key={card.id} card={card} onCellClick={handleCellClick} isManualDaub={!isAutoDaub} calledNumbers={calledNumbers} targetPatternIndices={getTargetIndices()} />
                    ))}
                  </div>
                </div>
                <BingoBoard calledNumbers={calledNumbers} lastCalledNumber={lastCalledBall?.number || null} />
              </div>
            </div>
          </div>
        );
      } else if (gameState === GameState.GAME_OVER) {
        return (
          <div className="max-w-xl mx-auto bg-[#0a0a1f]/95 border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(245,158,11,0.2)]"><Trophy className="w-8 h-8" /></div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">ROUND COMPLETE</span>
              <h2 className="text-2xl font-bold tracking-tight text-white">Vegas Lobby Recap</h2>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3.5 text-sm text-left">
              <div className="flex justify-between font-mono text-white/55"><span>Tickets Bought:</span><span className="font-bold text-white">{ticketCount}</span></div>
              <div className="flex justify-between font-mono text-white/55"><span>Target Goal:</span><span className="font-bold text-amber-400">{getPatternDisplayName(targetPattern)}</span></div>
              <div className="flex justify-between font-mono text-white/55"><span>Balls Drawn before End:</span><span className="font-bold text-white">{ballsCalledThisRound} / 75</span></div>
              <div className="flex justify-between font-mono pt-2 border-t border-white/10">
                <span className="font-bold text-white/70">Net Chip Rewards:</span>
                <span className={`font-extrabold ${roundPrizes > 0 ? 'text-green-400' : 'text-red-400'}`}>{roundPrizes > 0 ? `+${roundPrizes} Chips` : `-${ticketCount * 25} Chips`}</span>
              </div>
            </div>
            <button onClick={handleEndGameAndBackToLobby} className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer">RETURN TO LOBBY</button>
          </div>
        );
      } else {
        // Lobby tickets setup
        return (
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
            <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-6 space-y-6 shadow-2xl text-left">
              <div className="border-b border-white/5 pb-3">
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2"><Coins className="w-5 h-5 text-amber-400" /> BUY TICKETS & CHOOSE PATTERN</h2>
                <p className="text-[10px] text-white/40 font-mono">SELECT TICKET COUNTS AND PATTERN TO RUN ROUNDS</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-mono text-white/45 uppercase tracking-widest block">1. SELECT TICKET VOLUME</span>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setTicketCount(prev => Math.max(1, prev - 1))} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black hover:bg-white/10 text-white cursor-pointer">-</button>
                      <span className="text-xl font-mono font-black text-white w-8 text-center">{ticketCount}</span>
                      <button onClick={() => setTicketCount(prev => Math.min(4, prev + 1))} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black hover:bg-white/10 text-white cursor-pointer">+</button>
                    </div>
                    <span className="text-xs font-mono text-white/40">Cost: <strong className="text-amber-400 font-bold">{ticketCount * 25}</strong> Chips</span>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-mono text-white/45 uppercase tracking-widest block">2. SELECT TARGET PATTERN</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {Object.values(PatternType).map((p) => (
                      <button key={p} onClick={() => setTargetPattern(p)} className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${targetPattern === p ? 'bg-amber-400 border-amber-300 text-black font-extrabold shadow-md' : 'bg-white/5 border-white/5 hover:border-white/10 text-white/60'}`}>
                        <span className="block text-xs font-bold leading-tight">{getPatternDisplayName(p)}</span>
                        <span className="block text-[8px] font-mono mt-1 opacity-60">{getPatternMultiplier(p).toFixed(1)}x</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#111126]/60 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-white mb-0.5">Auto Dauber</span>
                      <p className="text-[10px] text-white/40">Stamps matching numbers automatically</p>
                    </div>
                    <button onClick={() => setIsAutoDaub(!isAutoDaub)} className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 cursor-pointer ${isAutoDaub ? 'bg-amber-400' : 'bg-white/10'}`}>
                      <div className={`w-4.5 h-4.5 rounded-full bg-black transition-transform duration-300 ${isAutoDaub ? 'translate-x-5.5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="p-4 bg-[#111126]/60 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-white mb-0.5">Voice Caller</span>
                      <p className="text-[10px] text-white/40">Speaks drawn numbers in real-time</p>
                    </div>
                    <button onClick={() => setIsVoiceEnabled(!isVoiceEnabled)} className={`w-12 h-6.5 rounded-full p-1 transition-colors duration-300 cursor-pointer ${isVoiceEnabled ? 'bg-amber-400' : 'bg-white/10'}`}>
                      <div className={`w-4.5 h-4.5 rounded-full bg-black transition-transform duration-300 ${isVoiceEnabled ? 'translate-x-5.5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={handleBuyTicketsAndStart} className="w-full py-4.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-amber-600 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Play className="w-4 h-4 fill-current" /> BUY TICKETS & PLAY
              </button>
            </div>
            <div className="bg-[#0a0a1f] border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6 shadow-2xl">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2 mb-4"><User className="w-4 h-4 text-amber-400" /> Customize Your Token</h3>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map((av) => (
                    <button key={av} onClick={() => setProfile(prev => ({ ...prev, avatar: av }))} className={`text-2xl p-2 rounded-xl transition-all border cursor-pointer ${profile.avatar === av ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/10 text-white/50'}`}>{av}</button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-[#111126]/60 rounded-2xl border border-white/5 space-y-3 text-left">
                <div className="flex justify-between text-xs"><span className="text-white/40 font-mono">Current Target:</span><span className="font-bold text-amber-400">{getPatternDisplayName(targetPattern)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-white/40 font-mono">Difficulty:</span><span className="font-bold text-white/80">{targetPattern === PatternType.BLACKOUT ? 'Jackpot / Hard' : 'Standard / Easy'}</span></div>
                <div className="flex justify-between text-xs"><span className="text-white/40 font-mono">Est. Prize multiplier:</span><span className="font-bold text-emerald-400 font-mono">{getPatternMultiplier(targetPattern).toFixed(1)}x</span></div>
              </div>
            </div>
          </div>
        );
      }
    }

    switch (activeLobbyTab) {
      case 'SLOTS':
        return (
          <SlotGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('SLOTS', delta, delta > 0 ? `Vegas Slots Spin: Won +${delta} Chips! 🎉` : `Vegas Slots: Placed ${Math.abs(delta)} Chip spin`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'CYBER_SLOTS':
        return (
          <CyberWildsSlots
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('CYBER_SLOTS', delta, delta > 0 ? `Cyber Wilds Slots Spin: Won +${delta} Chips! 🔥` : `Cyber Wilds Slots: Placed ${Math.abs(delta)} Chip spin`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'ZEN_SLOTS':
        return (
          <ZenSakuraSlots
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('ZEN_SLOTS', delta, delta > 0 ? `Zen Sakura Slots Spin: Won +${delta} Chips! 🌸` : `Zen Sakura Slots: Placed ${Math.abs(delta)} Chip spin`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'COSMIC_SLOTS':
        return (
          <CosmicVoidSlots
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('COSMIC_SLOTS', delta, delta > 0 ? `Cosmic Void Slots Spin: Won +${delta} Chips! 🪐` : `Cosmic Void Slots: Placed ${Math.abs(delta)} Chip spin`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'PIRATE_SLOTS':
        return (
          <PirateCoveSlots
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('PIRATE_SLOTS', delta, delta > 0 ? `Crimson Cove Slots Spin: Won +${delta} Chips! 🏴‍☠️` : `Crimson Cove Slots: Placed ${Math.abs(delta)} Chip spin`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'PHARAOH_SLOTS':
        return (
          <PharaohGoldSlots
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('PHARAOH_SLOTS', delta, delta > 0 ? `Pharaoh's Gold Slots Spin: Won +${delta} Chips! 🏺` : `Pharaoh's Gold Slots: Placed ${Math.abs(delta)} Chip spin`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'CANDY_SLOTS':
        return (
          <CandyWonderlandSlots
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('CANDY_SLOTS', delta, delta > 0 ? `Candy Wonderland Slots Spin: Won +${delta} Chips! 🍭` : `Candy Wonderland Slots: Placed ${Math.abs(delta)} Chip spin`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'RETRO_SLOTS':
        return (
          <RetroArcadeSlots
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('RETRO_SLOTS', delta, delta > 0 ? `Retro Arcade Slots Spin: Won +${delta} Chips! 🎮` : `Retro Arcade Slots: Placed ${Math.abs(delta)} Chip spin`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'IRISH_SLOTS':
        return (
          <LuckyLeprechaunSlots
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('IRISH_SLOTS', delta, delta > 0 ? `Lucky Leprechaun Slots Spin: Won +${delta} Chips! 🍀` : `Lucky Leprechaun Slots: Placed ${Math.abs(delta)} Chip spin`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'GEMS':
        return (
          <GemsFortuneGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('GEMS', delta, delta > 0 ? `Gems Fortune: Won +${delta} Chips! 💎` : `Gems Fortune: Placed ${Math.abs(delta)} Chip play`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'DICE':
        return (
          <DiceGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('DICE', delta, delta > 0 ? `Dice Duel: Won +${delta} Chips! 🎲` : `Dice Duel: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'CRASH':
        return (
          <CrashGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('CRASH', delta, delta > 0 ? `Rocket Crash: Won +${delta} Chips! 🚀` : `Rocket Crash: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'MINES':
        return (
          <MinesGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('MINES', delta, delta > 0 ? `Mines Floor: Won +${delta} Chips! 💣` : `Mines Floor: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'PLINKO':
        return (
          <PlinkoGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('PLINKO', delta, delta > 0 ? `Cosmic Plinko: Won +${delta} Chips! 🎯` : `Cosmic Plinko: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'HILO':
        return (
          <HiLoGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('HILO', delta, delta > 0 ? `Hi-Lo Duel: Won +${delta} Chips! 🃏` : `Hi-Lo Duel: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'ROULETTE':
        return (
          <RouletteGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('ROULETTE', delta, delta > 0 ? `Neon Roulette: Won +${delta} Chips! 🎡` : `Neon Roulette: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'BLACKJACK':
        return (
          <BlackjackGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('BLACKJACK', delta, delta > 0 ? `Vegas 21: Won +${delta} Chips! 🃏` : `Vegas 21: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'POKER':
        return (
          <VideoPokerGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('POKER', delta, delta > 0 ? `Video Poker Jacks or Better: Won +${delta} Chips! ♠️` : `Video Poker: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'KENO':
        return (
          <KenoGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('KENO', delta, delta > 0 ? `Cosmic Keno: Won +${delta} Chips! ✨` : `Cosmic Keno: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'SNAKE':
        return (
          <SnakeGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('SNAKE', delta, delta > 0 ? `Cosmic Snake: Won +${delta} Chips! 🐍` : `Cosmic Snake: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'COINFLIP':
        return (
          <CoinFlipGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('COINFLIP', delta, delta > 0 ? `Neon Coin Toss: Won +${delta} Chips! 🪙` : `Neon Coin Toss: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'WHEEL':
        return (
          <MegaWheelGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('WHEEL', delta, delta > 0 ? `Mega Wheel: Won +${delta} Chips! 🎡` : `Mega Wheel: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'TOWER':
        return (
          <TowerClimbGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('TOWER', delta, delta > 0 ? `Tower Climb: Won +${delta} Chips! 🏰` : `Tower Climb: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'SCRATCH':
        return (
          <ScratchCardGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('SCRATCH', delta, delta > 0 ? `Scratch Card: Won +${delta} Chips! 🎫` : `Scratch Card: Placed ${Math.abs(delta)} Chip card`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'RPS':
        return (
          <RockPaperScissorsGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('RPS', delta, delta > 0 ? `RPS Arena: Won +${delta} Chips! ✊` : `RPS Arena: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'SHELL':
        return (
          <ShellGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('SHELL', delta, delta > 0 ? `Shell Game: Won +${delta} Chips! 🐚` : `Shell Game: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'DERBY':
        return (
          <DerbyGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('DERBY', delta, delta > 0 ? `Vegas Derby Horse Win: Won +${delta} Chips! 🐎` : `Vegas Derby: Placed ${Math.abs(delta)} Chip forecast`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'DRAGON_TIGER':
        return (
          <DragonTigerGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('DRAGON_TIGER', delta, delta > 0 ? `Dragon Tiger: Won +${delta} Chips! 🐉` : `Dragon Tiger: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'PUSHER':
        return (
          <CoinPusherGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('PUSHER', delta, delta > 0 ? `Coin Pusher: Won +${delta} Chips! 🪙` : `Coin Pusher: Drops ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'LIMBO':
        return (
          <LimboGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('LIMBO', delta, delta > 0 ? `Limbo Multipliers: Won +${delta} Chips! 🚀` : `Limbo Multipliers: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'SHOOTER':
        return (
          <SpaceShooterGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('SHOOTER', delta, delta > 0 ? `Space Shooter: Won +${delta} Chips! 👾` : `Space Shooter: Entered ${Math.abs(delta)} Chip flight`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'BACCARAT':
        return (
          <BaccaratGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('BACCARAT', delta, delta > 0 ? `Neon Baccarat: Won +${delta} Chips! 🃏` : `Neon Baccarat: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'DARTS':
        return (
          <DartsGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('DARTS', delta, delta > 0 ? `Cosmic Darts: Won +${delta} Chips! 🎯` : `Cosmic Darts: Throws ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'PINATA':
        return (
          <PinataGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('PINATA', delta, delta > 0 ? `Pinata Fiesta smash: Won +${delta} Chips! 🪅` : `Pinata Fiesta: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'VAULT':
        return (
          <VaultGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('VAULT', delta, delta > 0 ? `Vault Crack: Won +${delta} Chips! 🔓` : `Vault Crack: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'MONTE':
        return (
          <MonteGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('MONTE', delta, delta > 0 ? `3-Card Monte: Won +${delta} Chips! 🃏` : `3-Card Monte: Bet ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'TAROT':
        return (
          <TarotGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('TAROT', delta, delta > 0 ? `Tarot Reading: Won +${delta} Chips! 🔮` : `Tarot Reading: Placed ${Math.abs(delta)} Chip read`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'BOWLING':
        return (
          <BowlingGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('BOWLING', delta, delta > 0 ? `Bowling Alley: Won +${delta} Chips! 🎳` : `Bowling Alley: Throws ${Math.abs(delta)} Chips`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'DRAGRACE':
        return (
          <DragRaceGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('DRAGRACE', delta, delta > 0 ? `Drag Race Win: Won +${delta} Chips! 🏎️` : `Drag Race: Entered ${Math.abs(delta)} Chip race`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'SOLITAIRE':
        return (
          <SolitaireGame
            chips={profile.chips}
            onUpdateChips={(delta) => handleUpdateChipsWithLog('SOLITAIRE', delta, delta > 0 ? `Solitaire Score: Won +${delta} Chips! 🃏` : `Solitaire: Entered ${Math.abs(delta)} Chip deal`)}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      case 'SOCCER':
      case 'CRICKET':
      case 'BASKETBALL':
      case 'GOLF':
      case 'BOXING':
      case 'ARCHERY':
      case 'ICE_HOCKEY':
      case 'FOOTBALL_UP':
      case 'RUGBY':
      case 'TENNIS':
        return (
          <SportsCasinoGames
            gameId={activeLobbyTab}
            chips={profile.chips}
            onUpdateChips={(delta) => {
              const gameName = CASINO_GAMES.find(g => g.id === activeLobbyTab)?.name || 'Sports';
              const desc = delta > 0 ? `${gameName} win: Won +${delta} Chips! 🏆` : `${gameName} match: Placed ${Math.abs(delta)} Chip wager`;
              handleUpdateChipsWithLog(activeLobbyTab as any, delta, desc);
            }}
            onUpdateTask={updateDailyTaskProgress}
            triggerAlert={triggerAlert}
          />
        );
      default:
        return <div className="text-white text-center py-10 font-mono">Select a casino cabinet to play.</div>;
    }
  };

  return (
    <div className={`min-h-screen font-sans antialiased selection:bg-amber-400 selection:text-black transition-colors duration-300 ${theme.bg}`}>
      {/* Ambient background lighting glow */}
      {isDarkMode && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#16412b]/15 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Main Bar / Header Navigation */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${theme.header} transition-all duration-300`}>
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Logo & Slogan */}
          <div 
            onClick={() => { setPortalTab('home'); setActiveGame(null); }}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] via-[#f3e5ab] to-[#aa7c11] p-[2px] shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-amber-300/40 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full rounded-full bg-[#07160f] flex items-center justify-center">
                <span className="text-xs font-serif font-black text-[#f5d061]">101</span>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-base font-serif font-black tracking-wider flex items-center gap-1.5 text-[#f5d061]">
                BING101 <span className={`text-[9px] ${isDarkMode ? 'bg-[#f5d061]/20 text-[#f5d061]' : 'bg-[#122b1f]/10 text-[#122b1f]'} border border-[#f5d061]/30 font-serif font-bold px-2 py-0.5 rounded-full`}>ROYALE</span>
              </h1>
              <p className="text-[8px] tracking-widest font-serif uppercase opacity-60">Verified Casino Simulator</p>
            </div>
          </div>

          {/* Search Box in Header */}
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
            <input
              type="text"
              placeholder="Search games or reviews..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (portalTab !== 'games' && portalTab !== 'game-detail') {
                  setPortalTab('games');
                }
              }}
              className={`w-full text-xs rounded-xl pl-10 pr-4 py-2 border transition-all ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-amber-400 focus:bg-white/10' 
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:shadow-sm'
              }`}
            />
          </div>

          {/* User profile & Actions Area */}
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                isDarkMode ? 'bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            {/* Interactive Faucet indicator */}
            <button
              type="button"
              onClick={() => {
                setPortalTab('cashier');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 bg-[#d4af37]/15 hover:bg-[#d4af37]/25 px-3.5 py-1.5 rounded-full border border-[#d4af37]/45 cursor-pointer transition-all hover:scale-105 active:scale-95 text-left"
              title="Click to Deposit/Withdraw Chips!"
            >
              <Coins className="w-4 h-4 text-[#f5d061]" />
              <div className="flex flex-col">
                <span className="text-xs font-serif font-bold text-[#f5d061] flex items-center gap-1 leading-none">
                  {profile.chips} <span className="text-[9px] font-normal opacity-70">Chips</span>
                  <span className="text-[8px] bg-[#d4af37] text-[#030906] px-1.5 py-0.5 rounded font-sans font-black uppercase tracking-tighter">
                    + GET
                  </span>
                </span>
              </div>
            </button>

            {/* Level / User Card */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
              <span className="text-xl leading-none select-none">{profile.avatar}</span>
              <div className="text-left">
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value.substring(0, 14) }))}
                  className={`bg-transparent border-b border-transparent hover:border-amber-400/40 focus:border-amber-400 text-xs font-bold focus:outline-none w-16 sm:w-20 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                  placeholder="Username"
                />
                <span className="block text-[8px] font-mono opacity-50 uppercase tracking-tight">
                  LVL {profile.level} {currentUser || customUser ? 'VIP' : 'GUEST'}
                </span>
              </div>
            </div>

            {/* Cloud Sync Indicators */}
            {(currentUser || customUser) && (
              <div 
                className="flex items-center justify-center p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                title={isSyncing ? "Saving progress to cloud..." : "VIP Profile synced in cloud"}
              >
                <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-pulse text-amber-400' : ''}`} />
              </div>
            )}

            {/* VIP Auth Trigger */}
            {currentUser || customUser ? (
              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                title="Log Out VIP Account"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-extrabold text-xs transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] cursor-pointer"
                title="Sign in to save your achievements!"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden md:inline">VIP SIGN IN</span>
              </button>
            )}
          </div>
        </div>

        {/* Second Row Horizontal Navigation Links */}
        <div className={`border-t ${theme.border} bg-[#000000]/10`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-none">
            <nav className="flex items-center gap-1 sm:gap-2">
              {[
                { id: 'home', label: '🏠 Home' },
                { id: 'games', label: '🎮 Play Games' },
                { id: 'cashier', label: '💸 Cashier' },
                { id: 'guides', label: '📖 Strategy Guides' },
                { id: 'news', label: '📰 Latest News' },
                { id: 'about', label: '👥 About Us' },
                { id: 'contact', label: '📬 Contact' }
              ].map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    setPortalTab(link.id as any);
                    if (link.id === 'games') setSelectedCategory('all');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-3.5 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    portalTab === link.id
                      ? isDarkMode ? 'bg-[#d4af37] text-[#030906] shadow-md shadow-[#d4af37]/10' : 'bg-[#122b1f] text-[#f5d061] shadow-md'
                      : `text-inherit opacity-75 hover:opacity-100 hover:bg-white/5`
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Highlighted Categories Selector Shortcuts */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold opacity-80">
              <span className="text-[10px] uppercase tracking-widest opacity-60">Hot Filters:</span>
              <button 
                onClick={() => { setPortalTab('games'); setSelectedCategory('slots'); }}
                className="hover:text-amber-400 transition-colors"
              >
                Slots
              </button>
              <span className="opacity-30">|</span>
              <button 
                onClick={() => { setPortalTab('games'); setSelectedCategory('multipliers'); }}
                className="hover:text-amber-400 transition-colors"
              >
                Multipliers
              </button>
              <span className="opacity-30">|</span>
              <button 
                onClick={() => { setPortalTab('games'); setSelectedCategory('tables'); }}
                className="hover:text-amber-400 transition-colors"
              >
                Tables
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Alert Messages */}
      <AnimatePresence>
        {feedbackMsg && (
          <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
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
              <div className="flex-1 text-left">
                <p className="text-xs font-semibold leading-relaxed">{feedbackMsg.text}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Primary Portal Content Container */}
      <main className={`mx-auto transition-all duration-300 max-w-7xl px-4 sm:px-6 py-6 sm:py-8`}>
        
        {/* HOMEPAGE VIEW */}
        {portalTab === 'home' && (
          <div className="space-y-8 animate-fade-in text-left">
            
            {/* LIVE CASINO REAL-TIME WINNERS TICKER & STATUS */}
            <LiveWinnersTicker isDarkMode={isDarkMode} />

            {/* LIVE TICKING PROGRESSIVE JACKPOTS */}
            <ProgressiveJackpots isDarkMode={isDarkMode} />
            
            {/* 1. HERO SECTION */}
            <section className={`relative rounded-3xl p-6 sm:p-12 border ${theme.card} shadow-xl text-center md:text-left overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/10 via-transparent to-[#07160f]/60 pointer-events-none" />
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#d4af37]/5 via-transparent to-transparent pointer-events-none blur-3xl" />
              
              <div className="relative z-10 max-w-3xl space-y-4">
                <span className="text-[10px] bg-[#d4af37]/10 border border-[#d4af37]/40 text-[#f5d061] font-serif font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-inner inline-block">
                  ⚜️ 100% Free educational guides & reviews
                </span>
                <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-wide leading-tight text-balance">
                  🏛️ Deluxe Game Guides & <strong className="text-[#f5d061] font-serif font-black">Royale Reviews</strong>
                </h2>
                <p className="text-sm sm:text-base opacity-75 max-w-2xl leading-relaxed">
                  Discover detailed game reviews, professional strategy guides, step-by-step how-to-plays, payouts tables, and realistic simulator mechanics for popular online casino games. Learn to manage your chip bankroll with completely zero real-money risk.
                </p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <button
                    onClick={() => { setPortalTab('games'); setSelectedCategory('all'); }}
                    className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#aa7c11] hover:from-[#f3e5ab] hover:to-[#d4af37] text-[#030906] font-serif font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-[#d4af37]/15 active:scale-95 transition-all cursor-pointer"
                  >
                    👑 Browse Games Floor
                  </button>
                  <button
                    onClick={() => setPortalTab('guides')}
                    className="px-6 py-3 bg-[#d4af37]/5 hover:bg-[#d4af37]/10 border border-[#d4af37]/35 hover:border-[#d4af37]/60 text-inherit font-serif font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer"
                  >
                    📜 Read Latest Articles
                  </button>
                </div>
              </div>
            </section>

            {/* 2. POPULAR CATEGORIES SHORTCUTS */}
            <section className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className={`text-base ${theme.textPrimary} uppercase tracking-wider`}>🎰 Popular Categories</h3>
                <p className="text-[10px] opacity-50 font-mono">DIRECT JUMP SHORTCUTS TO SPECIFIC GAME FLOORS</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { id: 'slots', label: '🎰 Video Slots', count: '10+ Tables' },
                  { id: 'tables', label: '🃏 Card Tables', count: '6+ Tables' },
                  { id: 'multipliers', label: '📈 Multipliers', count: '5+ Games' },
                  { id: 'specialty', label: '🔮 Specialty', count: '9+ Games' },
                  { id: 'earn_chips', label: '🎁 Faucets', count: 'Task Desk' },
                  { id: 'all', label: '🚀 All Games', count: '30+ Games' }
                ].map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setPortalTab('games');
                      setSelectedCategory(cat.id as any);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-4 rounded-xl border text-center cursor-pointer transition-all hover:scale-[1.03] ${theme.card} hover:border-blue-500/50 shadow-sm`}
                  >
                    <span className="block text-xs font-bold">{cat.label}</span>
                    <span className="text-[9px] font-mono opacity-50 block mt-1">{cat.count}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* PERFORMANCE STATISTICS FOR GUEST/VIP METRICS */}
            <section className="space-y-4">
              <LobbyStatistics profile={profile} />
            </section>

            {/* 3. FEATURED GAMES AREA */}
            <section className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="text-left">
                  <h3 className={`text-lg sm:text-xl ${theme.textPrimary} tracking-tight`}>🔥 Featured Games Reviews</h3>
                  <p className="text-[10px] opacity-50 font-mono">PLAY IN REAL-TIME OR READ THE OFFICIAL GUIDE</p>
                </div>
                <button 
                  onClick={() => { setPortalTab('games'); setSelectedCategory('all'); }}
                  className="text-xs font-bold text-blue-500 hover:underline"
                >
                  View All {CASINO_GAMES.length} Games &rarr;
                </button>
              </div>

              {/* Grid of featured games */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {CASINO_GAMES.slice(0, 6).map((game) => {
                  const stats = getGameQuickStats(game.id);
                  return (
                    <div 
                      key={game.id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-md hover:shadow-xl transition-all ${theme.card} hover:border-amber-400/30 relative overflow-hidden group`}
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                            game.badge === 'HOT' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            game.badge === 'NEW' ? 'bg-teal-500/10 text-teal-500 border border-teal-500/20' :
                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          }`}>
                            {game.badge || 'VIP'}
                          </span>
                          <span className="text-[9px] font-mono opacity-50 uppercase">{game.category}</span>
                        </div>
                        <h4 className="text-base font-bold group-hover:text-amber-400 transition-colors flex items-center gap-2">
                          {game.name}
                        </h4>
                        <p className="text-xs opacity-70 line-clamp-2 leading-relaxed">{game.desc}</p>
                        
                        {/* Interactive specs row */}
                        <div className="grid grid-cols-3 gap-1 py-2 text-center text-[10px] font-mono border-t border-b border-dashed border-white/5 opacity-80">
                          <div>
                            <span className="block text-[8px] opacity-40 uppercase">RTP</span>
                            <span className="font-bold text-emerald-400">{stats.rtp}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] opacity-40 uppercase">RISK</span>
                            <span className="font-bold text-amber-400">{stats.volatility}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] opacity-40 uppercase">SEATS</span>
                            <span className="font-bold text-blue-400 flex items-center justify-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {stats.activeSeats}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            setActiveLobbyTab(game.id as any);
                            setActiveGame(game.id);
                            setPortalTab('game-detail');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`py-2 rounded-xl text-[10px] font-serif font-extrabold tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1 group-hover:scale-[1.02] ${
                            isDarkMode ? 'bg-[#d4af37] hover:bg-[#f3e5ab] text-[#030906]' : 'bg-[#122b1f] hover:bg-[#1f4834] text-[#f5d061]'
                          }`}
                        >
                          🎮 Play Now
                        </button>
                        <button
                          onClick={() => {
                            setActiveGame(game.id);
                            setPortalTab('game-detail');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`py-2 rounded-xl border text-[10px] font-extrabold tracking-wider uppercase transition-all cursor-pointer text-center ${
                            isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          📖 Read Guide
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. LATEST STRATEGY ARTICLES */}
            <section className="space-y-6">
              <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="text-left">
                  <h3 className={`text-lg sm:text-xl ${theme.textPrimary} tracking-tight`}>📖 Latest Strategy & Guides</h3>
                  <p className="text-[10px] opacity-50 font-mono">EXPERT INSIGHTS ON ODDS, VOLATILITY, AND PROBABILITY MATHEMATICS</p>
                </div>
                <button 
                  onClick={() => setPortalTab('guides')}
                  className="text-xs font-bold text-blue-500 hover:underline"
                >
                  Browse Guide Archive &rarr;
                </button>
              </div>

              {/* Articles Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ARTICLES.map((art) => (
                  <article 
                    key={art.id}
                    className={`rounded-2xl border p-6 flex flex-col justify-between space-y-4 shadow-md ${theme.card} hover:border-blue-500/30 transition-all`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] opacity-60 font-mono">
                        <span className={`px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-950 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                          {art.category}
                        </span>
                        <span>{art.date}</span>
                      </div>
                      <h4 
                        onClick={() => { setActiveArticleId(art.id); setPortalTab('guides'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-lg font-bold hover:text-blue-500 cursor-pointer transition-colors leading-snug"
                      >
                        {art.title}
                      </h4>
                      <p className="text-xs opacity-70 leading-relaxed">{art.summary}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] opacity-60">
                      <span>By <strong>{art.author}</strong></span>
                      <button
                        onClick={() => { setActiveArticleId(art.id); setPortalTab('guides'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-blue-500 hover:underline font-bold flex items-center gap-1"
                      >
                        Read Guide ({art.readTime}) &rarr;
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* 5. WHY TRUST BING101 BENTO GRID */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className={`text-lg sm:text-xl ${theme.textPrimary} tracking-tight`}>🛡️ Why Trust Bing101 Casino?</h3>
                <p className="text-[10px] opacity-50 font-mono">OUR EDITORIAL PRINCIPLES AND RESPONSIBILITY METRICS</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: "✍️", title: "Original Reviews & Guides", desc: "Every single guide, tips list, and mathematical RTP review is written by human gaming enthusiasts after hours of simulator testing." },
                  { icon: "🔒", title: "100% Safe & Zero-Risk", desc: "We are an educational game simulator portal. No deposit, real-money transactions, or credit card inputs are ever required." },
                  { icon: "📊", title: "True Probabilistic Math", desc: "Our slots, plinko grids, and roulette wheels execute pure mathematical algorithms and pseudo-RNG coordinate matrices." },
                  { icon: "📱", title: "Superbly Mobile Responsive", desc: "The portal automatically collapses column layouts and scales play canvas grids to fit beautifully on any Android or iOS device." },
                  { icon: "💡", title: "Beginner Strategy Focused", desc: "We break down complex bankroll theories like the Martingale, Kelly Criterion, and Pascal triangles into simple step-by-step blueprints." },
                  { icon: "🎟️", title: "Full 75-Ball Vocal Caller", desc: "Our Bingo room boasts fully synthetic professional audio sequences to mimic physical Las Vegas bingo cages." }
                ].map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border shadow-sm ${theme.card} space-y-2`}>
                    <span className="text-2xl block">{item.icon}</span>
                    <h4 className="font-bold text-sm text-blue-500">{item.title}</h4>
                    <p className="text-xs opacity-75 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. TRENDING THIS WEEK PANEL */}
            <section className={`rounded-2xl border p-6 ${theme.card} shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center`}>
              <div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase font-bold tracking-widest">
                  Trending This Week
                </span>
                <h4 className="text-lg font-bold mt-1.5 leading-tight">Bingo 101 Activity Metrics</h4>
                <p className="text-xs opacity-70 mt-1 leading-relaxed">
                  Join thousands of daily casual strategy learners grinding out VIP achievements on our simulated gaming floor.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div className={`p-4 rounded-xl border ${theme.border} text-center`}>
                  <span className="text-2xl font-mono font-black text-blue-500">99.0% RTP</span>
                  <span className="block text-[10px] opacity-60 font-mono mt-0.5">HIGHEST ADVANTAGE (COSMIC PLINKO)</span>
                </div>
                <div className={`p-4 rounded-xl border ${theme.border} text-center`}>
                  <span className="text-2xl font-mono font-black text-emerald-500">2.4 Million+</span>
                  <span className="block text-[10px] opacity-60 font-mono mt-0.5">TOTAL CHIPS CLAIMED WEEKLY</span>
                </div>
              </div>
            </section>

            {/* 7. COMPREHENSIVE HOMEPAGE FAQS */}
            <section className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className={`text-lg sm:text-xl ${theme.textPrimary} tracking-tight`}>❓ Frequently Asked Questions</h3>
                <p className="text-[10px] opacity-50 font-mono">ANSWERS TO POPULAR INQUIRIES REGARDING CASINO MECHANICS & GUIDES</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { q: "Is Bing101 Casino a real money gambling site?", a: "No, absolutely not. Bing101 is a 100% free educational casino simulation platform. All chips, balances, levels, and payouts are purely virtual, designed for fun and training purposes only." },
                  { q: "What is an AdSense-compliant layout?", a: "AdSense-compliant design prioritizes original, high-value textual guides, detailed instructions, sitemaps, and strict terms before displaying any commercial advertisement sections." },
                  { q: "How do I claim more free chips if my balance hits zero?", a: "You can click on the 'Faucet (+ GET)' button in the header or access our 'Earn Chips' tab to claim completely free chip packages and complete daily quests." },
                  { q: "How are the card outcomes and spins determined?", a: "All tables are governed by certified mathematical pseudorandom number generators (pseudo-RNG) running server-side or locally, guaranteeing completely fair, un-rigged results." },
                  { q: "Can I save my profile chips across sessions?", a: "Yes, our engine stores your wagers, achievements, and level state directly inside your browser cache. You can also log in with a VIP account to sync progress to our secure cloud." },
                  { q: "How does 75-Ball Bingo differ from 90-Ball Bingo?", a: "75-Ball is played on a 5x5 grid with numbers 1 to 75, centering a wild FREE space, targeting visual geometric patterns. 90-Ball Bingo is played on a 3x9 grid targeting line completion metrics." },
                  { q: "What is slot volatility?", a: "Volatility represents payout distribution. High volatility slot machines pay out infrequently but carry extreme multiplier caps. Low volatility slots pay steady small prizes." },
                  { q: "How do active paylines impact my payouts?", a: "Activating multiple lines (diagonal and V-shape) expands the alignments the RNG evaluates, leading to more regular small wins but increasing the wager cost per spin." },
                  { q: "How does the Rocket Crash multiplier work?", a: "The rocket scales exponentially on a logarithmic curve. Survival probabilities decay at each tick, making early cashing out (under 1.5x) the most statistically sound strategy." },
                  { q: "How do I report bugs or suggest games?", a: "You can visit our Contact page or fill out our submit form. We regularly update our catalog and love to implement user suggestions!" }
                ].map((faq, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl border ${theme.card} shadow-sm space-y-1.5`}>
                    <h4 className="font-bold text-sm text-blue-500">Q: {faq.q}</h4>
                    <p className="text-xs opacity-75 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 8. EDITORIAL ABOUT US TEXT (600+ WORDS) */}
            <section className={`rounded-3xl border p-8 ${theme.card} space-y-4 shadow-sm`}>
              <h3 className={`text-xl sm:text-2xl ${theme.textPrimary} tracking-tight`}>👥 About Bing101 Casino & Learning Center</h3>
              <p className="text-xs leading-relaxed opacity-85">
                Bing101 Casino was established with a singular, clear mission: to provide the internet's most comprehensive, transparent, and high-quality educational resource for casino gaming mechanics, probabilities, and card game strategies. We believe that gaming entertainment should be safe, accessible, and mathematically understood. Our developers, mathematicians, and gaming historians have collaborated to write a robust ecosystem that fuses fully interactive virtual gaming cabinets with exhaustive, article-style guides.
              </p>
              <p className="text-xs leading-relaxed opacity-85">
                Underneath our neon-glowing, responsive interfaces lies a core commitment to mathematical accuracy. Each simulation—whether it is the peg-bouncing physics of Cosmic Plinko, the multiplier thresholds of Rocket Crash, the multi-line payline alignments of Cyber Wilds Slots, or the 75-ball drawing mechanisms of Classic Bingo—is powered by clean, certified pseudo-RNG logic. These simulators let players evaluate various bet regimes, manage simulated cash flow, and experience Fremont Street's raw variance without exposing themselves to real financial risks.
              </p>
              <p className="text-xs leading-relaxed opacity-85 font-semibold">
                How to Use Our Resource Effectively:
              </p>
              <ul className="list-disc pl-5 text-xs opacity-85 space-y-1.5">
                <li><strong>Analyze Volatility:</strong> Test the difference between low-volatility slots like Zen Sakura and high-volatility cabinets like Pharaoh's Gold to see how dry spells impact your chips.</li>
                <li><strong>Optimize Auto-Cashouts:</strong> Launch Rocket Crash and study historical crash points. Set auto-cashout brackets between 1.3x and 1.8x to verify how steady returns build compounding balances.</li>
                <li><strong>Calibrate Peg Densities:</strong> Increase rows from 8 to 16 in Cosmic Plinko, adjust risk profiles, and watch Pascal's binomial distribution map bouncing spheres to central bins.</li>
                <li><strong>Practice Card Sizing:</strong> Sit down at Blackjack Royale or Hi-Lo Duel to master basic charts, card counts, and bankroll division theories.</li>
              </ul>
              <p className="text-xs leading-relaxed opacity-85 pt-2">
                We are committed to continuous updates. As virtual technologies evolve, we add new slots, card duels, and mathematical guides to our portal. We do not support, promote, or encourage real-money wagering. We offer 100% free casino-style software that advocates for responsible casual gameplay, strict bankroll discipline, and educational statistics tracking. Thank you for choosing Bing101 Casino as your trusted guide and strategy resource!
              </p>
            </section>

          </div>
        )}

        {/* INTERACTIVE CASINO CASHIER & TRANSACTIONS PORTAL */}
        {portalTab === 'cashier' && (
          <div className="space-y-8 animate-fade-in text-left">
            <CasinoCashier
              profile={profile}
              onUpdateChips={(delta, desc) => handleUpdateChipsWithLog('CASHIER', delta, desc)}
              triggerAlert={triggerAlert}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* GAMES ARCHIVE VIEW */}
        {portalTab === 'games' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className={`text-2xl ${theme.textPrimary} tracking-tight`}>🎮 Simulated Casino Games Floor</h2>
              <p className="text-xs opacity-50 font-mono">CHOOSE FROM THE FULL CATALOG OF INTERACTIVE TRAINING BOARDS</p>
            </div>

            {/* Category selection and search bar */}
            <div className={`p-4 rounded-2xl border ${theme.card} flex flex-col lg:flex-row justify-between items-center gap-4`}>
              <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
                {[
                  { id: 'all', label: '🚀 All Games' },
                  { id: 'slots', label: '🎰 Slots' },
                  { id: 'tables', label: '🃏 Tables' },
                  { id: 'multipliers', label: '📈 Multipliers' },
                  { id: 'specialty', label: '🔮 Specialty' },
                  { id: 'earn_chips', label: '🎁 Earn Chips' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all border cursor-pointer ${
                      selectedCategory === cat.id
                        ? isDarkMode ? 'bg-[#d4af37] border-[#d4af37] text-[#030906] shadow-md shadow-[#d4af37]/10' : 'bg-[#122b1f] border-[#122b1f] text-[#f5d061] shadow-md'
                        : `bg-transparent border-transparent text-inherit opacity-70 hover:opacity-100 hover:bg-white/5`
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {selectedCategory !== 'earn_chips' && (
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input
                    type="text"
                    placeholder="Filter games by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full text-xs rounded-xl pl-10 pr-4 py-2 border transition-all ${
                      isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:bg-white/10' 
                        : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500'
                    }`}
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {(() => {
                    const filteredGames = CASINO_GAMES.filter(game => {
                      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            game.desc.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
                      return matchesSearch && matchesCategory;
                    });

                    if (filteredGames.length === 0) {
                      return (
                        <div className="col-span-full text-center py-12 border border-dashed rounded-3xl space-y-3">
                          <HelpCircle className="w-8 h-8 opacity-25 mx-auto" />
                          <p className="text-xs opacity-50 font-mono">No casino games found matching "{searchQuery}"</p>
                          <button 
                            type="button"
                            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
                            className="text-xs text-blue-500 font-bold underline"
                          >
                            Reset search filter
                          </button>
                        </div>
                      );
                    }

                    return filteredGames.map((game) => {
                      const stats = getGameQuickStats(game.id);
                      return (
                        <div 
                          key={game.id}
                          className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-lg transition-all ${theme.card} hover:border-amber-400/30 group`}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] opacity-65">
                              <span className="font-bold text-blue-500 uppercase">{game.category}</span>
                              <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px]">{game.badge || 'VIP'}</span>
                            </div>
                            <h3 className="text-base font-bold group-hover:text-amber-400 transition-colors">{game.name}</h3>
                            <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">{game.desc}</p>

                            {/* Dynamic stats deck */}
                            <div className="grid grid-cols-3 gap-1 py-2 text-center text-[10px] font-mono border-t border-b border-dashed border-white/5 opacity-80">
                              <div>
                                <span className="block text-[8px] opacity-40 uppercase">RTP</span>
                                <span className="font-bold text-emerald-400">{stats.rtp}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] opacity-40 uppercase">RISK</span>
                                <span className="font-bold text-amber-400">{stats.volatility}</span>
                              </div>
                              <div>
                                <span className="block text-[8px] opacity-40 uppercase">SEATS</span>
                                <span className="font-bold text-blue-400 flex items-center justify-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  {stats.activeSeats}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => {
                                setActiveLobbyTab(game.id as any);
                                setActiveGame(game.id);
                                setPortalTab('game-detail');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`py-2.5 rounded-xl text-[11px] font-serif font-extrabold uppercase transition-all cursor-pointer flex items-center justify-center gap-1 group-hover:scale-[1.02] ${
                                isDarkMode ? 'bg-[#d4af37] hover:bg-[#f3e5ab] text-[#030906]' : 'bg-[#122b1f] hover:bg-[#1f4834] text-[#f5d061]'
                              }`}
                            >
                              🎮 Play Now
                            </button>
                            <button
                              onClick={() => {
                                setActiveGame(game.id);
                                setPortalTab('game-detail');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`py-2.5 rounded-xl border text-[11px] font-extrabold uppercase transition-all cursor-pointer text-center ${
                                isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              📖 Read Guide
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STRATEGY ARTICLES CATALOG VIEW */}
        {portalTab === 'guides' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className={`text-2xl ${theme.textPrimary} tracking-tight`}>📖 Strategy Guides & Learning Desk</h2>
              <p className="text-xs opacity-50 font-mono">COMPLETE ARCHIVE OF MATHEMATICAL GAMING RESEARCH & STRATEGY ARTICLES</p>
            </div>

            {activeArticleId !== null ? (
              // Individual Expanded Article View
              (() => {
                const art = ARTICLES.find(a => a.id === activeArticleId);
                if (!art) return null;
                return (
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Expanded Article Column */}
                    <div className="lg:col-span-2 space-y-6">
                      <button
                        onClick={() => setActiveArticleId(null)}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                          isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <ArrowLeft className="w-4 h-4" /> Back to Guides List
                      </button>

                      <div className={`rounded-3xl border p-6 sm:p-8 space-y-4 shadow-sm ${theme.card}`}>
                        <div className="flex items-center gap-3 text-xs font-mono opacity-60">
                          <span className={`px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-950 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                            {art.category}
                          </span>
                          <span>Published: {art.date}</span>
                          <span>&bull;</span>
                          <span>{art.readTime}</span>
                        </div>

                        <h1 className={`text-2xl sm:text-4xl font-black leading-tight ${theme.textPrimary}`}>{art.title}</h1>
                        <p className="text-sm font-semibold opacity-80 leading-relaxed italic border-l-4 border-blue-500 pl-4 py-1">
                          {art.summary}
                        </p>

                        <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed opacity-90 space-y-4 pt-4 whitespace-pre-line">
                          {art.content}
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs">
                          <span className="text-2xl font-mono leading-none">🧠</span>
                          <div>
                            <span className="block opacity-50">Author Profile</span>
                            <span className="font-bold text-blue-500">{art.author}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar in Guide view */}
                    <div className="space-y-6">
                      <div className={`rounded-2xl border p-5 ${theme.card} space-y-4`}>
                        <h4 className="font-bold text-sm">Similar Guides</h4>
                        <div className="space-y-3">
                          {ARTICLES.filter(a => a.id !== activeArticleId).map(sim => (
                            <div 
                              key={sim.id}
                              onClick={() => { setActiveArticleId(sim.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className="group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-all text-left"
                            >
                              <span className="text-[10px] text-blue-500 font-bold uppercase block">{sim.category}</span>
                              <span className="text-xs font-bold leading-tight block group-hover:text-blue-500 transition-colors">{sim.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mock ad space */}
                      <div className={`rounded-2xl border-2 border-dashed p-6 text-center ${theme.adBox} flex flex-col justify-between h-64`}>
                        <span className="text-[9px] font-mono tracking-wider opacity-40">ADVERTISEMENT - 300x250 MEDIUM RECTANGLE</span>
                        <div className="space-y-1.5 py-4">
                          <span className="text-xl">🎟️</span>
                          <h5 className="text-xs font-black">GET 10,000 SIMULATED COINS!</h5>
                          <p className="text-[10px] opacity-75">Click here to register your VIP progress profile.</p>
                        </div>
                        <button 
                          onClick={() => setIsAuthModalOpen(true)}
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded-lg"
                        >
                          Unlock VIP Progress Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              // Main Guides Catalog Grid
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ARTICLES.map((art) => (
                  <div 
                    key={art.id}
                    className={`rounded-2xl border p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-blue-500/30 transition-all ${theme.card}`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] opacity-60 font-mono">
                        <span className={`px-2.5 py-0.5 rounded-full ${isDarkMode ? 'bg-blue-950 text-blue-400' : 'bg-blue-50 text-blue-700'}`}>
                          {art.category}
                        </span>
                        <span>{art.date}</span>
                      </div>
                      <h3 
                        onClick={() => { setActiveArticleId(art.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-lg font-bold hover:text-blue-500 cursor-pointer transition-colors leading-snug"
                      >
                        {art.title}
                      </h3>
                      <p className="text-xs opacity-75 leading-relaxed">{art.summary}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] opacity-60">
                      <span>By <strong>{art.author}</strong></span>
                      <button
                        onClick={() => { setActiveArticleId(art.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-blue-500 hover:underline font-bold"
                      >
                        Read Strategy Guide &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LATEST NEWS & ANNOUNCEMENTS VIEW */}
        {portalTab === 'news' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className={`text-2xl ${theme.textPrimary} tracking-tight`}>📰 Latest News & Updates</h2>
              <p className="text-xs opacity-50 font-mono">STAY INFORMED REGARDING NEW SLOT TABLES, SECURITY FEATURES & TOURNAMENTS</p>
            </div>

            <div className="space-y-6">
              {[
                { date: "July 15, 2026", title: "Pharaoh's Gold and Zen Sakura Slots Added to Casino Floor!", desc: "We are thrilled to launch two new state-of-the-art virtual slots! Pharaoh's Gold offers extreme volatility with expanding Giza wild alignments, while Zen Sakura provides peaceful garden atmospheres with highly frequent minor payouts, offering the perfect spectrum of mathematical risk.", tag: "Releases" },
                { date: "July 01, 2026", title: "VIP Cloud Progress Synchronization Module Now Live!", desc: "Never lose your XP milestones, custom titles, or chip balances again! Register a secure guest alias and password under our 'VIP SignIn' header flow. Our Firebase firestore integration secures player achievements with multi-click secure handshakes.", tag: "Features" },
                { date: "June 20, 2026", title: "Mathematical Plinko Probability Simulation Expanded", desc: "Cosmic Plinko peg geometry has been fully updated. Players can now select from 8 to 16 peg rows, dynamically monitoring standard binomial Pascal deflect distributions. The theoretical RTP remains an outstanding player-friendly 99.0%.", tag: "Analytics" }
              ].map((news, idx) => (
                <div key={idx} className={`p-6 rounded-2xl border shadow-sm ${theme.card} space-y-2`}>
                  <div className="flex justify-between items-center text-[10px] font-mono opacity-55">
                    <span className="font-bold text-blue-500 uppercase">{news.tag}</span>
                    <span>{news.date}</span>
                  </div>
                  <h4 className="text-base font-bold text-inherit">{news.title}</h4>
                  <p className="text-xs opacity-80 leading-relaxed">{news.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDITORIAL ABOUT US VIEW */}
        {portalTab === 'about' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className={`text-2xl ${theme.textPrimary} tracking-tight`}>👥 About Bing101 Learning Center</h2>
              <p className="text-xs opacity-50 font-mono">EXPLORE OUR MISSION, ETHICAL COMPLIANCE AND ARCHITECTURE DETAILS</p>
            </div>

            <div className={`p-6 sm:p-10 rounded-2xl border shadow-sm ${theme.card} space-y-6`}>
              <h3 className="text-lg font-bold text-blue-500">A Safe Space to Master Volatility & Bankroll Mechanics</h3>
              <p className="text-xs sm:text-sm leading-relaxed opacity-85">
                At Bing101, we believe that understanding the mathematics of gaming variance shouldn't require financial risk. Our platform is structured as an interactive pedagogical tool. We design beautiful, responsive mechanical slots and board games with certified, transparent pseudo-RNG logic so you can practice money-management rules.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className={`p-5 rounded-xl border ${theme.border} space-y-1.5`}>
                  <h4 className="font-bold text-xs uppercase text-blue-500 tracking-wider">Our Strategy Ethos</h4>
                  <p className="text-xs opacity-80 leading-relaxed">
                    We demystify the house edge. We describe Return to Player (RTP), volatility curves, and logarithmic multipliers. We provide extensive strategy guides written by verified statistical experts.
                  </p>
                </div>
                <div className={`p-5 rounded-xl border ${theme.border} space-y-1.5`}>
                  <h4 className="font-bold text-xs uppercase text-blue-500 tracking-wider">No-Purchase Compliance</h4>
                  <p className="text-xs opacity-80 leading-relaxed">
                    There are no credit cards, deposits, or paywalls. All gameplay progress is completely virtual and free. We strictly advocate for responsible casual gaming.
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed opacity-85 pt-2">
                Our design is built specifically to meet the high quality standards of AdSense, valuing dense, educational text guides and transparent policies. We hope you enjoy mastering our simulated games catalog!
              </p>
            </div>
          </div>
        )}

        {/* CONTACT US FORM VIEW */}
        {portalTab === 'contact' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className={`text-2xl ${theme.textPrimary} tracking-tight`}>📬 Contact the Editorial Desk</h2>
              <p className="text-xs opacity-50 font-mono">SUBMIT GAME SUGGESTIONS, BUG REPORTS OR STRATEGY INQUIRIES</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Form */}
              <div className={`lg:col-span-2 rounded-2xl border p-6 sm:p-8 shadow-sm ${theme.card}`}>
                <h3 className="text-sm font-bold uppercase text-blue-500 tracking-wider mb-4">Send Us a Secured Message</h3>
                
                {/* Contact Form Submission */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    triggerAlert('Thank you! Your feedback has been transmitted to our editorial server.', 'success');
                  }} 
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block font-bold opacity-75">Your Name / Guest Alias</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Elena Vance"
                        className={`w-full p-2.5 rounded-lg border focus:outline-none focus:border-blue-500 ${
                          isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block font-bold opacity-75">Your Email Address</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="elena@example.com"
                        className={`w-full p-2.5 rounded-lg border focus:outline-none focus:border-blue-500 ${
                          isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold opacity-75">Message Subject</label>
                    <select 
                      className={`w-full p-2.5 rounded-lg border focus:outline-none focus:border-blue-500 ${
                        isDarkMode ? 'bg-zinc-900 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <option>General Editorial Feedback</option>
                      <option>Game Mechanics / RNG Inquiry</option>
                      <option>Bug Report / Layout Suggestion</option>
                      <option>Business & Ad Placement Proposal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold opacity-75">Detailed Message</label>
                    <textarea 
                      required 
                      rows={5}
                      placeholder="Specify your suggestions or describe any bugs encountered on the casino floor..."
                      className={`w-full p-2.5 rounded-lg border focus:outline-none focus:border-blue-500 ${
                        isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase rounded-lg transition-all cursor-pointer"
                  >
                    🚀 Submit Secured Inquiry
                  </button>
                </form>
              </div>

              {/* Right Column: Office details */}
              <div className="space-y-6">
                <div className={`p-5 rounded-2xl border shadow-sm ${theme.card} space-y-3`}>
                  <h4 className="font-bold text-xs uppercase tracking-widest text-blue-500">Bing101 Head Office</h4>
                  <p className="text-xs opacity-75 leading-relaxed">
                    Las Vegas Boulevard South<br />
                    Las Vegas, NV 89109<br />
                    United States
                  </p>
                  <p className="text-xs opacity-50">Email: contact@bing101.com</p>
                </div>

                <div className={`rounded-2xl border-2 border-dashed p-6 text-center ${theme.adBox} h-48 flex flex-col justify-between`}>
                  <span className="text-[9px] font-mono tracking-wider opacity-45">GOOGLE ADSENSE APPROVED SLOT</span>
                  <div className="py-2 text-xs">
                    <p className="font-bold">Advertise on Bing101</p>
                    <p className="opacity-75 mt-0.5">Reach thousands of casual gaming strategy learners daily.</p>
                  </div>
                  <span className="text-[10px] text-blue-500 font-bold underline cursor-pointer">Submit Proposal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POLICY DOCUMENTS: PRIVACY, TERMS, DMCA */}
        {(portalTab === 'privacy' || portalTab === 'terms' || portalTab === 'dmca') && (
          <div className="space-y-8 animate-fade-in text-left max-w-4xl mx-auto">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className={`text-2xl ${theme.textPrimary} tracking-tight capitalize`}>
                {portalTab} Document
              </h2>
              <p className="text-xs opacity-50 font-mono">BING101 LEGAL AND REGULATORY COMPLIANCE MEMORANDUM</p>
            </div>

            <div className={`p-6 sm:p-10 rounded-2xl border shadow-sm ${theme.card} space-y-6 text-xs sm:text-sm leading-relaxed opacity-85`}>
              {portalTab === 'privacy' && (
                <>
                  <h3 className="text-lg font-bold text-blue-500">Privacy Policy</h3>
                  <p>
                    Last Updated: July 2026. At Bing101 Casino Guides, accessible via our simulated online portal, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Bing101 and how we use it. If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
                  </p>
                  <h4 className="font-bold mt-4">Log Files and Browser Cache</h4>
                  <p>
                    Bing101 follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
                  </p>
                  <h4 className="font-bold mt-4">Cookies and Web Beacons</h4>
                  <p>
                    Like any other website, Bing101 uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                  </p>
                  <h4 className="font-bold mt-4">Google DoubleClick DART Cookie</h4>
                  <p>
                    Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy.
                  </p>
                </>
              )}

              {portalTab === 'terms' && (
                <>
                  <h3 className="text-lg font-bold text-blue-500">Terms and Conditions</h3>
                  <p>
                    Welcome to Bing101 Casino! These terms and conditions outline the rules and regulations for the use of Bing101's Educational Simulator Website. By accessing this website we assume you accept these terms and conditions. Do not continue to use Bing101 if you do not agree to take all of the terms and conditions stated on this page.
                  </p>
                  <h4 className="font-bold mt-4">Simulated Currency and Fair Play</h4>
                  <p>
                    All chips, balances, XP level configurations, and progress metrics displayed on this website are 100% simulated and hold zero real-world cash value. There are no credit purchases, deposits, withdrawals, or money payouts of any kind. Play is designed for educational variance training only. Any attempt to exploit, hack, or reverse-engineer the pseudo-RNG algorithms of the simulated games is strictly prohibited.
                  </p>
                  <h4 className="font-bold mt-4">Limitation of Liability</h4>
                  <p>
                    In no event shall Bing101 Casino, nor any of its editors, developers, or administrators, be held liable for anything arising out of or in any way connected with your use of this simulated website. Bing101 shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this casino simulator.
                  </p>
                </>
              )}

              {portalTab === 'dmca' && (
                <>
                  <h3 className="text-lg font-bold text-blue-500">DMCA Copyright Policy</h3>
                  <p>
                    We respect the intellectual property rights of others. In accordance with the Digital Millennium Copyright Act (DMCA), we will respond expeditiously to claims of copyright infringement committed using our simulated portal if such claims are reported to our designated copyright administrator.
                  </p>
                  <h4 className="font-bold mt-4">Filing a Notice of Infringement</h4>
                  <p>
                    If you are a copyright owner or authorized agent thereof, please submit a written DMCA notification including: a physical or electronic signature of the copyright owner, clear identification of the copyrighted work claimed to have been infringed, identification of the material claimed to be infringing on our portal, and your complete contact coordinates. Notifications can be transmitted via our Contact Page or emailed to contact@bing101.com.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* VISUAL INDEX SITEMAP VIEW */}
        {portalTab === 'sitemap' && (
          <div className="space-y-8 animate-fade-in text-left">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className={`text-2xl ${theme.textPrimary} tracking-tight`}>🗺️ Visual Directory Sitemap</h2>
              <p className="text-xs opacity-50 font-mono">COMPLETE ARCHIVAL LAYOUT INDEX OF THE BING101 GAMING PORTAL</p>
            </div>

            <div className={`p-6 sm:p-10 rounded-2xl border shadow-sm ${theme.card} grid grid-cols-1 md:grid-cols-3 gap-8`}>
              <div className="space-y-3 text-xs">
                <h3 className="font-black text-blue-500 uppercase tracking-wider text-sm border-b pb-1.5 border-slate-200 dark:border-slate-800">
                  Portal Pages
                </h3>
                <ul className="space-y-1.5 font-bold text-left">
                  <li onClick={() => setPortalTab('home')} className="hover:text-blue-500 cursor-pointer">&bull; Homepage Learning Index</li>
                  <li onClick={() => setPortalTab('games')} className="hover:text-blue-500 cursor-pointer">&bull; Play Games Floor</li>
                  <li onClick={() => setPortalTab('guides')} className="hover:text-blue-500 cursor-pointer">&bull; Strategy Articles Library</li>
                  <li onClick={() => setPortalTab('news')} className="hover:text-blue-500 cursor-pointer">&bull; Casino News Center</li>
                  <li onClick={() => setPortalTab('about')} className="hover:text-blue-500 cursor-pointer">&bull; About Our Mission</li>
                  <li onClick={() => setPortalTab('contact')} className="hover:text-blue-500 cursor-pointer">&bull; Office Contact Desk</li>
                </ul>
              </div>

              <div className="space-y-3 text-xs text-left">
                <h3 className="font-black text-blue-500 uppercase tracking-wider text-sm border-b pb-1.5 border-slate-200 dark:border-slate-800">
                  Playable Slots & Cards
                </h3>
                <ul className="space-y-1 opacity-80 text-left">
                  {CASINO_GAMES.map(slot => (
                    <li 
                      key={slot.id} 
                      onClick={() => { setActiveGame(slot.id); setActiveLobbyTab(slot.id as any); setPortalTab('game-detail'); }}
                      className="hover:text-blue-500 hover:font-bold cursor-pointer transition-all"
                    >
                      &bull; {slot.name} Guide & Board
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 text-xs text-left">
                <h3 className="font-black text-blue-500 uppercase tracking-wider text-sm border-b pb-1.5 border-slate-200 dark:border-slate-800">
                  Legal Documents
                </h3>
                <ul className="space-y-1.5 font-bold text-left">
                  <li onClick={() => setPortalTab('privacy')} className="hover:text-blue-500 cursor-pointer">&bull; Privacy Policy Page</li>
                  <li onClick={() => setPortalTab('terms')} className="hover:text-blue-500 cursor-pointer">&bull; Terms & Conditions Page</li>
                  <li onClick={() => setPortalTab('dmca')} className="hover:text-blue-500 cursor-pointer">&bull; DMCA Copyright Guidelines</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* INDIVIDUAL GAME PAGE & PLAYABLE CABINET WRAPPER */}
        {portalTab === 'game-detail' && activeGame !== null && (
          <div className="space-y-6 text-left animate-fade-in">
            
            {/* Breadcrumb row */}
            <div className="flex items-center gap-2 text-[10px] uppercase font-mono opacity-60 flex-wrap">
              <span onClick={() => { setPortalTab('home'); setActiveGame(null); }} className="hover:text-blue-500 hover:font-bold cursor-pointer">Home</span>
              <ChevronRight className="w-3 h-3" />
              <span onClick={() => { setPortalTab('games'); setSelectedCategory(CASINO_GAMES.find(g => g.id === activeGame)?.category as any || 'all'); }} className="hover:text-blue-500 hover:font-bold cursor-pointer">
                {CASINO_GAMES.find(g => g.id === activeGame)?.category || 'Vegas'} Games
              </span>
              <ChevronRight className="w-3 h-3" />
              <span className="font-bold text-blue-500">{CASINO_GAMES.find(g => g.id === activeGame)?.name.substring(CASINO_GAMES.find(g => g.id === activeGame)?.name.indexOf(' ') + 1) || activeGame}</span>
            </div>

            {/* Main two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column (70%): Exhaustive Article Guide & Embed Play Cabin */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Game Review Article Header / Hero Area */}
                <div className={`p-6 sm:p-8 rounded-2xl border ${theme.card} relative overflow-hidden shadow-sm space-y-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono opacity-60">
                    <span>Last Updated: July 2026</span>
                    <span>&bull;</span>
                    <span>Author: Admin (Gaming Specialist)</span>
                    <span>&bull;</span>
                    <span className="text-emerald-500 font-bold">RNG APPROVED</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-4xl leading-none select-none">
                      {CASINO_GAMES.find(g => g.id === activeGame)?.name.split(' ')[0] || '🎮'}
                    </span>
                    <div>
                      <h1 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${theme.textPrimary}`}>
                        {CASINO_GAMES.find(g => g.id === activeGame)?.name || activeGame} Guide & Review
                      </h1>
                      <p className="text-xs opacity-75">{CASINO_GAMES.find(g => g.id === activeGame)?.desc}</p>
                    </div>
                  </div>

                  {/* 5-Star Rating Visual Indicator */}
                  <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs font-bold w-fit">
                    <span className="text-yellow-400 font-mono text-sm">★★★★★</span>
                    <span>4.9 / 5.0 (Vegas Verified Rating)</span>
                  </div>
                </div>

                {/* 2. Interactive Table of Contents */}
                <div className={`p-5 rounded-2xl border ${theme.card} space-y-2.5`}>
                  <span className="text-xs font-mono uppercase tracking-widest opacity-50 block">Table of Contents</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-blue-500">
                    <a href="#about" className="hover:underline">&bull; What is this game?</a>
                    <a href="#features" className="hover:underline">&bull; Key Features</a>
                    <a href="#how-to" className="hover:underline">&bull; How to Play</a>
                    <a href="#tips" className="hover:underline">&bull; Strategic Tips</a>
                    <a href="#pros-cons" className="hover:underline">&bull; Pros & Cons</a>
                    <a href="#play-game" className="hover:underline text-emerald-500">&bull; Play Game Live!</a>
                    <a href="#faqs" className="hover:underline">&bull; Common FAQs</a>
                    <a href="#conclusion" className="hover:underline">&bull; Final Verdict</a>
                  </div>
                </div>

                {/* 3. Section: What is this game? */}
                <section id="about" className="space-y-3 scroll-mt-24">
                  <h3 className={`text-lg sm:text-xl ${theme.textPrimary} border-b pb-1.5 ${theme.border}`}>
                    🎯 What is {CASINO_GAMES.find(g => g.id === activeGame)?.name.split(' ').slice(1).join(' ') || activeGame}?
                  </h3>
                  <p className="text-sm leading-relaxed opacity-85 whitespace-pre-line">
                    {GAME_REVIEWS_CONTENT[activeGame]?.intro || getFallbackReview(activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.name || activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.category || 'Vegas').intro}
                  </p>
                </section>

                {/* 4. Section: Features */}
                <section id="features" className="space-y-3 scroll-mt-24">
                  <h3 className={`text-lg sm:text-xl ${theme.textPrimary} border-b pb-1.5 ${theme.border}`}>
                    ⚙️ Key Features of the Board
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm pl-4 leading-relaxed">
                    {(GAME_REVIEWS_CONTENT[activeGame]?.features || getFallbackReview(activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.name || activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.category || 'Vegas').features).map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-500">&bull;</span>
                        <span className="opacity-95">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* 5. Section: How to Play Step-by-Step */}
                <section id="how-to" className="space-y-3 scroll-mt-24">
                  <h3 className={`text-lg sm:text-xl ${theme.textPrimary} border-b pb-1.5 ${theme.border}`}>
                    📝 Step-by-Step Instructions
                  </h3>
                  <ol className="space-y-2 text-xs sm:text-sm pl-4 leading-relaxed text-left">
                    {(GAME_REVIEWS_CONTENT[activeGame]?.howToPlaySteps || getFallbackReview(activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.name || activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.category || 'Vegas').howToPlaySteps).map((step, i) => (
                      <li key={i} className="flex gap-2 text-left">
                        <strong className="text-blue-500 font-mono flex-shrink-0">{i + 1}.</strong>
                        <span className="opacity-95 text-left">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* 6. Section: Strategic Tips */}
                <section id="tips" className="space-y-3 scroll-mt-24">
                  <h3 className={`text-lg sm:text-xl ${theme.textPrimary} border-b pb-1.5 ${theme.border}`}>
                    💡 Actionable Strategic Tips for Beginners
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm pl-4 leading-relaxed text-left">
                    {(GAME_REVIEWS_CONTENT[activeGame]?.tips || getFallbackReview(activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.name || activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.category || 'Vegas').tips).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-left">
                        <span className="text-emerald-500 flex-shrink-0">✔</span>
                        <span className="opacity-95 text-left">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* 7. Section: Pros & Cons Side-by-Side */}
                <section id="pros-cons" className="space-y-4 scroll-mt-24">
                  <h3 className={`text-lg sm:text-xl ${theme.textPrimary} border-b pb-1.5 ${theme.border}`}>
                    ⚖️ Pros & Cons Comparative
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-xs space-y-1.5">
                      <span className="font-bold text-green-500 block">Advantages (Pros)</span>
                      {(GAME_REVIEWS_CONTENT[activeGame]?.pros || getFallbackReview(activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.name || activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.category || 'Vegas').pros).map((pro, i) => (
                        <p key={i} className="flex gap-1.5 items-start">
                          <span className="text-green-500 font-bold">✓</span>
                          <span className="opacity-80">{pro}</span>
                        </p>
                      ))}
                    </div>
                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-xs space-y-1.5">
                      <span className="font-bold text-red-500 block">Limitations (Cons)</span>
                      {(GAME_REVIEWS_CONTENT[activeGame]?.cons || getFallbackReview(activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.name || activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.category || 'Vegas').cons).map((con, i) => (
                        <p key={i} className="flex gap-1.5 items-start">
                          <span className="text-red-500 font-bold">✗</span>
                          <span className="opacity-80">{con}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                </section>

                {/* 8. EMBED PLAY CABIN AREA */}
                <section id="play-game" className="space-y-4 scroll-mt-24">
                  <div className="flex justify-between items-center border-b pb-1.5 border-slate-200 dark:border-slate-800">
                    <h3 className={`text-lg sm:text-xl ${theme.textPrimary} text-emerald-500`}>
                      🎮 Play {CASINO_GAMES.find(g => g.id === activeGame)?.name.split(' ').slice(1).join(' ') || activeGame} Simulator
                    </h3>
                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono px-2 py-0.5 rounded font-black tracking-widest uppercase">
                      ⚡ LIVE SIMULATOR ACTIVE
                    </span>
                  </div>

                  <p className="text-xs opacity-75">
                    Engage with our fully functional interactive casino cabinet below. All spins, deals, and rolls use virtual chips, providing an completely safe gameplay experience.
                  </p>

                  {/* ACTIVE GAME VIEWPORT INJECTED HERE */}
                  <div className={`border-2 p-1 sm:p-2 rounded-2xl bg-black shadow-2xl relative ${isDarkMode ? 'border-amber-400/20' : 'border-slate-300'}`}>
                    {/* Visual header bar inside the cabinet frame */}
                    <div className="bg-[#1a1a1a] p-2.5 rounded-t-xl flex justify-between items-center text-[10px] font-mono text-white select-none">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="font-bold text-[9px] tracking-widest">BING101 RNG ENGINE v4.2</span>
                      </div>
                      <span className="opacity-60">100% RESPONSIBLE FREE SIMULATOR</span>
                    </div>

                    {/* Interactive play cabinet window */}
                    <div className="p-1 sm:p-4 bg-zinc-950 rounded-b-xl min-h-[450px]">
                      {/* Active Game Component Injected Here */}
                      {renderActiveGame()}
                    </div>
                  </div>
                </section>

                {/* 9. Section: FAQs */}
                <section id="faqs" className="space-y-4 scroll-mt-24">
                  <h3 className={`text-lg sm:text-xl ${theme.textPrimary} border-b pb-1.5 ${theme.border}`}>
                    ❓ Frequently Asked Questions ({CASINO_GAMES.find(g => g.id === activeGame)?.name.split(' ').slice(1).join(' ') || activeGame})
                  </h3>
                  <div className="space-y-3">
                    {(GAME_REVIEWS_CONTENT[activeGame]?.faqs || getFallbackReview(activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.name || activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.category || 'Vegas').faqs).map((faq, i) => (
                      <div key={i} className={`p-4 rounded-xl border ${theme.card} space-y-1.5`}>
                        <h4 className="font-bold text-xs sm:text-sm text-blue-500">Q: {faq.q}</h4>
                        <p className="text-xs sm:text-sm opacity-80 pl-4">A: {faq.a}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 10. Section: Conclusion / Verdict */}
                <section id="conclusion" className="space-y-3 scroll-mt-24">
                  <h3 className={`text-lg sm:text-xl ${theme.textPrimary} border-b pb-1.5 ${theme.border}`}>
                    🏁 Final Verdict: Why You Should Try This Simulator
                  </h3>
                  <p className="text-sm leading-relaxed opacity-85 whitespace-pre-line">
                    {GAME_REVIEWS_CONTENT[activeGame]?.conclusion || getFallbackReview(activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.name || activeGame, CASINO_GAMES.find(g => g.id === activeGame)?.category || 'Vegas').conclusion}
                  </p>
                </section>
              </div>

              {/* Right Column (30%): Fast Specs & Related Game Shortcuts */}
              <div className="space-y-6">
                
                {/* Specifications Bento Card */}
                <div className={`p-6 rounded-2xl border ${theme.card} space-y-4`}>
                  <h3 className={`text-sm ${theme.textPrimary} border-b pb-2 ${theme.border} uppercase tracking-wider`}>
                    📋 Specifications
                  </h3>
                  <div className="space-y-3 text-xs text-left">
                    <div className="flex justify-between">
                      <span className="opacity-60">Game Category:</span>
                      <span className="font-bold uppercase text-blue-500">{CASINO_GAMES.find(g => g.id === activeGame)?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">RTP Ratio:</span>
                      <span className="font-bold text-emerald-500">
                        {GAME_REVIEWS_CONTENT[activeGame]?.rtp || '97.5%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Volatility Level:</span>
                      <span className="font-bold text-amber-500">
                        {GAME_REVIEWS_CONTENT[activeGame]?.volatility || 'MEDIUM'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Bet Range Cap:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {GAME_REVIEWS_CONTENT[activeGame]?.betRange || '10 - 500 Chips'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Max Win Payout:</span>
                      <span className="font-bold text-yellow-500 font-mono">
                        {GAME_REVIEWS_CONTENT[activeGame]?.maxWin || '250x Stake'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Related Games Bento Card */}
                <div className={`p-6 rounded-2xl border ${theme.card} space-y-4`}>
                  <h3 className={`text-sm ${theme.textPrimary} border-b pb-2 ${theme.border} uppercase tracking-wider`}>
                    🎰 More Vegas Tables
                  </h3>
                  <div className="space-y-2.5">
                    {CASINO_GAMES.filter(g => g.id !== activeGame).slice(0, 5).map((game) => (
                      <div 
                        key={game.id}
                        onClick={() => {
                          setActiveGame(game.id);
                          setActiveLobbyTab(game.id as any);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`p-3 rounded-xl border border-transparent hover:border-blue-500/30 cursor-pointer transition-all hover:bg-blue-500/5 text-left flex justify-between items-center`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{game.name}</span>
                          <span className="text-[10px] opacity-50 uppercase font-mono">{game.category} Specs</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-40" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Responsible Gaming Safety Advisory */}
                <div className={`p-6 rounded-2xl border border-red-500/10 bg-red-500/5 text-xs text-left space-y-2.5`}>
                  <h4 className="font-bold text-red-500 uppercase tracking-wider">⚠️ Educational Simulator Advisory</h4>
                  <p className="opacity-75 leading-relaxed">
                    This game is a 100% free virtual simulation. No actual money, currency, or real-world prizes can be won or wagered. Bingo101 advocates for responsible entertainment and provides these models purely for mathematical and strategic demonstration purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* RENDER NOTHING IN SECOND MAIN (ELIMINATES DOUBLE GAME GLITCH) */}
      {false && (
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

            {['SOCCER', 'CRICKET', 'BASKETBALL', 'GOLF', 'BOXING', 'ARCHERY', 'ICE_HOCKEY', 'FOOTBALL_UP', 'RUGBY', 'TENNIS'].includes(activeLobbyTab as string) && (
              <SportsCasinoGames
                gameId={activeLobbyTab as string}
                chips={profile.chips}
                onUpdateChips={(delta) => {
                  const gameName = CASINO_GAMES.find(g => g.id === activeLobbyTab)?.name || 'Sports';
                  const desc = delta > 0 ? `${gameName} win: Won +${delta} Chips! 🏆` : `${gameName} match: Placed ${Math.abs(delta)} Chip wager`;
                  handleUpdateChipsWithLog(activeLobbyTab as any, delta, desc);
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
      )}

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

      {/* FLOATING COMMUNITY LIVE CHAT */}
      <LiveCommunityChat profile={profile} isDarkMode={isDarkMode} />
    </div>
  );
}
