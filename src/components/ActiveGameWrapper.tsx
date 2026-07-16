import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, BookOpen, Coins, Sparkles, Info, HelpCircle, Trophy, Play, 
  CheckCircle, MessageSquare, Settings, ShieldCheck, Lock, HeartHandshake, 
  ChevronLeft, Star, Award, Monitor, Zap, Eye, RotateCcw, ThumbsUp 
} from 'lucide-react';
import { PlayerProfile } from '../types';

interface ActiveGameWrapperProps {
  activeGame: string;
  profile: PlayerProfile;
  onPlayGame: (gameId: string) => void;
  onBackToLobby: () => void;
  children: React.ReactNode;
}

// Full 32 games list metadata catalog
interface GameMeta {
  id: string;
  name: string;
  icon: string;
  category: string;
  tagline: string;
  payout: string;
  rtp: string;
  volatility: string;
  maxWin: string;
  betRange: string;
  about: string;
  controls: string[];
  howToPlay: string[];
  screenshots: { label: string; desc: string; icon: string }[];
  achievements: { title: string; desc: string; reward: string }[];
  reviews: { name: string; avatar: string; rating: number; comment: string }[];
}

const DEFAULT_META = (id: string, name: string): GameMeta => {
  const cleanName = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const icon = name.split(' ')[0] || '🎮';
  return {
    id,
    name,
    icon,
    category: 'Vegas Classic',
    tagline: `Experience simulated luxury playing our premium ${cleanName} suite.`,
    payout: 'Up to 100x',
    rtp: '97.5% RTP',
    volatility: 'MEDIUM',
    maxWin: '250x Stake',
    betRange: '10 - 500 Chips',
    about: `Welcome to ${cleanName} Floor! This game is an iconic staple of the classic casino experience, fully tuned and animated with modern RNG mechanics. Test your decision-making and mathematical strategies in a secure, fun-first environment.`,
    controls: [
      'Bet Selector (+/-): Choose your active wager amount.',
      'Action Button: Trigger game cycles, draws, or rolls.',
      'Auto-Spin: Toggle continuous automatic plays (when available).',
      'Paytable: Access full payout ratios and combo rewards.'
    ],
    howToPlay: [
      `Specify your active chip wager using the bottom-deck controls.`,
      `Engage the main interactive elements on the screen to draw, roll, or slide.`,
      `Match winning symbols or achieve strategic hand metrics higher than the dealer.`,
      `Claim chip returns automatically and scale up your overall experience tier!`
    ],
    screenshots: [
      { label: 'Bet Setup Screen', desc: 'Initialize your starting chips and adjust volatile parameters.', icon: '⚙️' },
      { label: 'Active Play Mode', desc: 'Match high-yielding neon nodes and watch custom particle explosions.', icon: '⚡' },
      { label: 'Win Celebration', desc: 'Savor high-contrast jackpot flags and live XP progress banners.', icon: '🏆' }
    ],
    achievements: [
      { title: `${cleanName} Pioneer`, desc: `Log your very first active round on this table`, reward: '+150 XP' },
      { title: `High Roller Streak`, desc: `Secure consecutive wins within the same session`, reward: '+300 XP' }
    ],
    reviews: [
      { name: 'LadyLuck_777', avatar: '🍒', rating: 5, comment: `Controls are so responsive! I love the modern visual styling of this classic.` },
      { name: 'Vegas_Viper', avatar: '🐍', rating: 5, comment: `Extremely fair RNG. Perfect simulator to practice before testing on a live floor.` },
      { name: 'Bingo_Baron', avatar: '🎩', rating: 4, comment: `Beautiful visual contrast. The dark neon theme makes it highly eye-safe for long nights.` }
    ]
  };
};

const GAME_METADATA_OVERRIED: Record<string, Partial<GameMeta>> = {
  BINGO: {
    category: 'Specialty & Tickets',
    tagline: 'Traditional 75-Ball bingo cards with high-speed automated daubing.',
    payout: 'Up to 250x (Blackout)',
    rtp: '98.2% RTP',
    volatility: 'MEDIUM',
    maxWin: '250x Stake',
    betRange: '10 - 200 Chips',
    about: 'Classic US-style 75-Ball Bingo featuring a 5x5 ticket grid. Built for multiple ticket management, customizable vocal calling speeds, and complete pattern checkups, it offers a secure simulated lobby to master card daubing under any layout configuration.',
    controls: [
      'Card Count (+/-): Buy up to 4 simultaneous tickets.',
      'Caller Speed: Adjust from Slow (4s), Normal (2s), to Hyper (0.8s) intervals.',
      'Auto Daub Switch: Toggle instant automatic stamps for matching numbers.',
      'Voice Announcer: Enable/disable high-quality vocal calling audio tracks.',
      'CLAIM BINGO: Press to check patterns and trigger cash rewards.'
    ],
    howToPlay: [
      'Select your target pattern (Line, Corners, Plus, or Jackpot Blackout).',
      'Choose card count and ticket buy-in chips.',
      'Listen to the caller and check matching column-numbers (B1-O75).',
      'Secure a complete path matching the target grid.',
      'Click CLAIM BINGO immediately before the pool expires to collect the pot.'
    ],
    screenshots: [
      { label: 'Ticket Purchase Lobby', desc: 'Customize ticket counts, target patterns, and callers.', icon: '🎟️' },
      { label: 'Active Board Play', desc: 'Track falling balls, auto daubs, and high-visibility check boxes.', icon: '📊' },
      { label: 'Jackpot Bingo Claim', desc: 'Claim and review winning patterns with custom gold particle showers.', icon: '👑' }
    ],
    achievements: [
      { title: 'Bingo Pioneer', desc: 'Secure your first successful card patterns', reward: '+150 XP' },
      { title: 'Blackout Conqueror', desc: 'Fill all 25 numbers on a single ticket', reward: '+500 XP & 1000 Chips' }
    ],
    reviews: [
      { name: 'Bingo_Baron', avatar: '🎩', rating: 5, comment: 'Auto-Daub at Hyper speed is an absolute rush! Best simulation on the web.' },
      { name: 'LuckyCharm_🍀', avatar: '🍄', rating: 5, comment: 'Voice caller sounds incredibly authentic. Outstanding practice tool!' }
    ]
  },
  SLOTS: {
    category: 'Vegas Reels',
    tagline: 'Premium 3-reel high-multiplier classic golden slots.',
    payout: 'Up to 500x Jackpot',
    rtp: '96.5% RTP',
    volatility: 'HIGH',
    maxWin: '500x Stake',
    betRange: '5 - 500 Chips',
    about: 'Take a trip to the Fremont Street floor. This classic single-line slot machine boasts diamond wilds, golden bars, and triple cherry multiplier combinations. High volatility means massive payout potential for lucky consecutive spins.',
    controls: [
      'Wager Size (+/-): Raise or lower your per-spin stake.',
      'SPIN: Trigger a manual reel rotation cycle.',
      'AUTO-SPIN: Turn on automatic reels for continuous wagering.',
      'Paytable Button: View full symbol combination pay structures.'
    ],
    howToPlay: [
      'Use the +/- coin buttons to define your total spin bet.',
      'Click SPIN to launch the 3 golden reels.',
      'Align three identical symbols horizontally on the central payline.',
      'Match Wild Diamond icons to substitute for other items and double your payout.'
    ],
    screenshots: [
      { label: 'Idle Reels Front', desc: 'Savor beautiful golden physical cabinet textures and paylines.', icon: '🎰' },
      { label: 'High Roller Reels Spin', desc: 'Watch neon blurs slide past as multiplier ratios evaluate.', icon: '⚡' },
      { label: 'Diamond Jackpot Lineup', desc: 'Unlock full wild multipliers with cascading high coins.', icon: '💎' }
    ],
    achievements: [
      { title: 'Cherry Poppers', desc: 'Match 3 Cherry icons on the primary payline', reward: '+100 XP' },
      { title: 'Golden Mega Jackpot', desc: 'Align 3 Wild Diamonds to scoop the 500x pot', reward: '+500 XP' }
    ],
    reviews: [
      { name: 'SlotStar_🎰', avatar: '🍒', rating: 5, comment: 'Wild diamonds hit hard! Got a 200x payout on my tenth spin.' },
      { name: 'Vegas_Viper', avatar: '🐍', rating: 5, comment: 'Physics are snappy, visual lighting is beautiful, and volatility is perfectly tuned.' }
    ]
  },
  CRASH: {
    category: 'Arcade Multiplier',
    tagline: 'Scale cosmic heights and cash out before the rocket combustion.',
    payout: 'Infinite Multiplier',
    rtp: '97.0% RTP',
    volatility: 'EXCELLENT',
    maxWin: '10,000x+ Stake',
    betRange: '10 - 1000 Chips',
    about: 'A fast-paced modern multiplier game centering a neon rocket ascending into orbit. The higher it flies, the higher your payout multiplier. But watch out—it can explode at any random millisecond. Cash out in time to win!',
    controls: [
      'Wager Field: Input starting chips to stake on the flight.',
      'Auto Cashout Multiplier: Specify a target threshold to auto-secure funds.',
      'LAUNCH/PLACE BET: Register your ticket for the next flight.',
      'CASH OUT Button: Click during active flight to secure live multiplier.'
    ],
    howToPlay: [
      'Enter your active chip bet before launch.',
      'Watch the flight multiplier climb from 1.0x upward.',
      'Wait for the highest possible multiplier for premium returns.',
      'Click CASH OUT before the rocket explodes. If it combusts first, you lose.'
    ],
    screenshots: [
      { label: 'Launch Pad Prep', desc: 'Configure wager chips and target auto cashout parameters.', icon: '🚀' },
      { label: 'Ascending Orbit Flight', desc: 'Watch coordinates climb alongside live participant logs.', icon: '📈' },
      { label: 'Cosmic Detonation', desc: 'Sudden combustion screen emphasizing missed or scored targets.', icon: '💥' }
    ],
    achievements: [
      { title: 'Astronaut Trainee', desc: 'Successfully cash out a flight at 2.0x or higher', reward: '+150 XP' },
      { title: 'To the Moon & Back', desc: 'Survive and cash out above a 10.0x flight', reward: '+400 XP' }
    ],
    reviews: [
      { name: 'SpacePunter', avatar: '🤠', rating: 5, comment: 'What an absolute adrenaline rush! The cash out button is super responsive.' },
      { name: 'StealthCardist', avatar: '🎩', rating: 4, comment: 'Tuned with incredibly fair curves. Perfect game for strategic players.' }
    ]
  },
  MINES: {
    category: 'Puzzle Grid',
    tagline: 'Reveal golden gems and avoid hidden active landmines.',
    payout: 'Up to 800x Stake',
    rtp: '98.0% RTP',
    volatility: 'ADJUSTABLE',
    maxWin: '800x Stake',
    betRange: '10 - 500 Chips',
    about: 'A thrilling high-stakes strategy game played on a 5x5 grid. Hide up to 24 mines, click tiles to locate gems and multiply your winnings, and cash out whenever you feel the risk is too high.',
    controls: [
      'Mines Count Selection: Choose between 1 and 24 active hidden hazards.',
      'Bet Selector: Set chips to wager on the grid.',
      'START GAME: Initialize and lock the tiles.',
      'CASH OUT: Click to lock in current multiplied rewards.'
    ],
    howToPlay: [
      'Adjust your bet and selected mines count (more mines = higher multiplier).',
      'Click tiles on the 5x5 board to reveal hidden items.',
      'Finding a Golden Gem increases your active multipliers.',
      'Avoid hidden mines. If you hit one, the game ends immediately and your bet is lost.',
      'Click Cash Out anytime to claim your accrued winnings.'
    ],
    screenshots: [
      { label: 'Board Setup Deck', desc: 'Select hazard frequencies and place initial chip wagers.', icon: '💣' },
      { label: 'Tile Exploration', desc: 'Flip glowing neon cards to secure consecutive multipliers.', icon: '💎' },
      { label: 'Payout Safety Lock', desc: 'Cash out active rewards, showing all previously hidden mines.', icon: '🔓' }
    ],
    achievements: [
      { title: 'Stealth Sweeper', desc: 'Find 5 gems consecutively with 5+ mines active', reward: '+200 XP' },
      { title: 'Diamond Miner', desc: 'Dodge all hazards to clear a 3-mine board completely', reward: '+500 XP' }
    ],
    reviews: [
      { name: 'BoomBuster', avatar: '🍄', rating: 5, comment: 'Adjustable volatility is so fun. 10 mines gives crazy multipliers!' },
      { name: 'GoldDigger', avatar: '🤠', rating: 5, comment: 'My absolute go-to for building up my lobby bankroll. Highly strategic.' }
    ]
  },
  PLINKO: {
    category: 'Physics Board',
    tagline: 'Drop falling pegs into high-yield multi-tier jackpot bins.',
    payout: 'Up to 1000x Stake',
    rtp: '99.0% RTP',
    volatility: 'ADJUSTABLE',
    maxWin: '1000x Stake',
    betRange: '5 - 1000 Chips',
    about: 'Drop neon bouncing spheres down a multi-row pyramid pegboard. Watch gravity cascade balls past pins into high-yielding slot coordinates. With adjustable row depths and variable risk brackets, Plinko offers the highest RTP in the casino.',
    controls: [
      'Risk Selection: Toggle Low, Medium, or High volatility brackets.',
      'Rows Adjuster: Select pyramid density ranging from 8 to 16 lines.',
      'Wager Size (+/-): Set chip cost per sphere drop.',
      'DROP BALL: Drop a ball down the active peg board.'
    ],
    howToPlay: [
      'Select your Risk Level and peg row density.',
      'Configure your chip bet value per drop.',
      'Click DROP BALL to launch spheres from the center top.',
      'Watch physics deflect the balls towards the left or right edges.',
      'Collect the multiplier of the bottom bin the ball lands in.'
    ],
    screenshots: [
      { label: 'Pyramid Board Screen', desc: 'Pick row sizes and explore different multiplier scales.', icon: '🔺' },
      { label: 'Cascade Multi-Drop', desc: 'Drop multiple balls in rapid succession to create bounce patterns.', icon: '⚪' },
      { label: 'Border Slot Jackpot', desc: 'Secure maximum returns on high-risk outer slot bins.', icon: '👑' }
    ],
    achievements: [
      { title: 'Peg Master', desc: 'Land a bouncing ball in an outer 10x+ bin', reward: '+200 XP' },
      { title: 'Gravity King', desc: 'Hit the legendary 1000x bin on High Risk mode', reward: '+1000 XP & 2000 Chips' }
    ],
    reviews: [
      { name: 'Gravity_Drop', avatar: '🪐', rating: 5, comment: 'The physics look incredibly clean! Very fun dropping 10 balls at once.' },
      { name: 'Bingo_Baron', avatar: '🎩', rating: 5, comment: 'Perfect recreation of the classic game show pegboard. Outstanding.' }
    ]
  },
  GEMS: {
    category: 'Slots',
    tagline: 'Match colorful gems and discover hidden treasures.',
    payout: 'Up to 500x Stake',
    rtp: '97.5% RTP',
    volatility: 'MEDIUM',
    maxWin: '500x Stake',
    betRange: '10 - 500 Chips',
    about: 'Embark on an exciting adventure filled with sparkling gems, treasure chests, and rewarding challenges. Match gems, unlock bonuses, and climb the leaderboard.',
    controls: [
      'Gem Selector: Tap a gem and then an adjacent one to swap places and form a line of 3.',
      'Board Drop: Fall a completely new layout of cascading gems onto the 5x5 board.',
      'Auto-Match Assist: Search the active table grid for immediate high-value swap opportunities.'
    ],
    howToPlay: [
      'Choose your target wager chips using the console button bar.',
      'Tap or click a gem followed by any adjacent gem to trigger a swap.',
      'Match 3 or more gems of the same type horizontally or vertically to clear them.',
      'Trigger consecutive cascades to increase chain multipliers and unlock the bonus treasure chests!'
    ],
    screenshots: [
      { label: 'Gems Classic Layout', desc: 'Savor colorful gem icons including Rubies, Emeralds, and Chests.', icon: '💎' },
      { label: 'Chain Multipliers', desc: 'Watch consecutive cascading sweeps score massive chip returns.', icon: '⚡' },
      { label: 'Bonus Treasure Chests', desc: 'Unlock the secret picks screen and open lucky chests.', icon: '🎁' }
    ],
    achievements: [
      { title: 'Gem Pioneer', desc: 'Score your first chain reaction match on the table', reward: '+150 XP' },
      { title: 'Mystery Chest Seeker', desc: 'Unlock and claim the Jackpot Treasure Level rewards', reward: '+300 XP' }
    ],
    reviews: [
      { name: 'LadyLuck_777', avatar: '🍒', rating: 5, comment: 'Amazing graphics and fun gameplay.' },
      { name: 'Puzzler_Pro', avatar: '👑', rating: 5, comment: 'Very addictive puzzle game.' },
      { name: 'Vegas_Viper', avatar: '🐍', rating: 5, comment: 'Runs smoothly on mobile.' }
    ]
  },
  CYBER_SLOTS: {
    category: 'Slots',
    tagline: 'Futuristic 3-reel multi-payline cyberpunk slot machine.',
    payout: 'Up to 500x Stake',
    rtp: '97.2% RTP',
    volatility: 'MEDIUM-HIGH',
    maxWin: '500x Stake',
    betRange: '10 - 500 Chips',
    about: 'Enter the glowing cyber grid. This advanced multi-payline slot machine features expanding Wild Fires, cryptographic keys, and virtual multiplier matrices. Play with up to 5 lines simultaneously for maximum hit frequency!',
    controls: [
      'Wager Size (+/-): Adjust your bet size per active payline.',
      'Active Paylines (1-3-5): Select how many neon laser line paths to activate.',
      'SPIN: Trigger a cycle in the grid.',
      'AUTO PLAY: Initiate high-speed automated spins.'
    ],
    howToPlay: [
      'Adjust your bet size and select 1, 3, or 5 active paylines.',
      'Click SPIN to run the cryptographic cyber reels.',
      'Match 3 symbols horizontally or in a V-shape along active paths.',
      'Match Wild Flame symbols to substitute for any grid items and boost payouts!'
    ],
    screenshots: [
      { label: 'Core Neon Grid', desc: 'Savor high-contrast neon reels with integrated glowing laser paths.', icon: '🔥' },
      { label: 'Cyber Wild Expansion', desc: 'Trigger massive hits with wild multipliers and glowing matrix gates.', icon: '⚡' },
      { label: 'Automated Matrix Spins', desc: 'Initiate up to 100 continuous cybernetic spins.', icon: '🤖' }
    ],
    achievements: [
      { title: 'Cyber Explorer', desc: 'Spin the cybernetic slot machine 10 times', reward: '+150 XP' },
      { title: 'Wild Jackpot Core', desc: 'Hit a high-value 3-Wild lineup along an active laser payline', reward: '+400 XP & 1000 Chips' }
    ],
    reviews: [
      { name: 'Matrix_Ghost', avatar: '👁️', rating: 5, comment: 'Love the look and feel! The visual neon bloom effects are top tier.' },
      { name: 'ChipCollector99', avatar: '🦾', rating: 5, comment: 'Setting 5 paylines makes wins super frequent. Unbelievably fun.' }
    ]
  }
};

const SUGGESTED_OTHER_GAMES = [
  { id: 'SLOTS', name: '🎰 Vegas Slots', category: 'Reels' },
  { id: 'CYBER_SLOTS', name: '🔥 Cyber Wilds Slots', category: 'Reels' },
  { id: 'BINGO', name: '🎟️ Classic Bingo', category: 'Specialty' },
  { id: 'GEMS', name: '💎 Gems Fortune', category: 'Slots' },
  { id: 'CRASH', name: '🚀 Rocket Crash', category: 'Multipliers' },
  { id: 'MINES', name: '💣 Mines Floor', category: 'Multipliers' },
  { id: 'PLINKO', name: '🎯 Cosmic Plinko', category: 'Multipliers' }
];

export const ActiveGameWrapper: React.FC<ActiveGameWrapperProps> = ({ 
  activeGame, 
  profile, 
  onPlayGame, 
  onBackToLobby, 
  children 
}) => {
  const [activeTab, setActiveTab] = useState<'play' | 'about' | 'how-to' | 'reviews'>('play');

  // Find base name from the list
  const baseGameInfo = SUGGESTED_OTHER_GAMES.find(g => g.id === activeGame) || { name: `${activeGame} Game`, category: 'Vegas Classic' };
  
  // Resolve unified metadata catalog
  const meta: GameMeta = {
    ...DEFAULT_META(activeGame, baseGameInfo.name),
    ...(GAME_METADATA_OVERRIED[activeGame] || {})
  };

  // Get similar games (filter out current active game)
  const similarGames = SUGGESTED_OTHER_GAMES
    .filter(g => g.id !== activeGame)
    .slice(0, 3);

  // Scroll to top of window on active game change to mimic full page transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab('play');
  }, [activeGame]);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* 2. Game Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-amber-500/10 via-[#0a0a1f] to-indigo-500/10 border border-white/10 text-left shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-400/5 via-transparent to-transparent pointer-events-none blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent pointer-events-none blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-400/10 border border-amber-400/20 text-amber-400 font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                {meta.category} Game
              </span>
              <span className="text-[10px] bg-white/5 border border-white/10 text-white/50 font-mono tracking-widest px-2.5 py-0.5 rounded-md">
                RNG CERTIFIED
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-4xl filter drop-shadow select-none">{meta.icon}</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {meta.name}
                </h1>
                <p className="text-xs text-white/50">{meta.tagline}</p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Tag */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl min-w-[200px] sm:min-w-[320px]">
            <div>
              <span className="block text-[8px] font-mono text-white/40 uppercase">RTP RATIO</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{meta.rtp}</span>
            </div>
            <div>
              <span className="block text-[8px] font-mono text-white/40 uppercase">VOLATILITY</span>
              <span className="text-xs font-mono font-bold text-amber-400">{meta.volatility}</span>
            </div>
            <div className="hidden sm:block">
              <span className="block text-[8px] font-mono text-white/40 uppercase">MAX PAYOUT</span>
              <span className="text-xs font-mono font-bold text-yellow-500">{meta.payout}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-white/10 gap-1.5 pb-0">
        {[
          { id: 'play', label: '🎮 PLAY GAME', icon: <Monitor className="w-3.5 h-3.5" /> },
          { id: 'about', label: '📖 ABOUT & INFO', icon: <Info className="w-3.5 h-3.5" /> },
          { id: 'how-to', label: '📋 HOW TO PLAY', icon: <HelpCircle className="w-3.5 h-3.5" /> },
          { id: 'reviews', label: '⭐ GUEST REVIEWS', icon: <MessageSquare className="w-3.5 h-3.5" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-extrabold tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-amber-400 text-amber-400 bg-white/5 rounded-t-xl'
                : 'border-transparent text-white/40 hover:text-white/80'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Game Window (Main Focus) & Active Game Interface */}
      {activeTab === 'play' && (
        <div className="space-y-8 animate-fade-in">
          {/* Main active game container */}
          <div className="bg-[#050510]/80 border border-white/10 rounded-3xl p-3 sm:p-6 shadow-3xl overflow-hidden relative min-h-[400px]">
            {children}
          </div>

          {/* 4. Game Controls Card */}
          <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-5 sm:p-6 text-left shadow-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2 pb-2 border-b border-white/5">
              <Settings className="w-4 h-4 text-amber-400" /> Game Console Controls Schematic
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meta.controls.map((ctrl, index) => {
                const parts = ctrl.split(':');
                return (
                  <div key={index} className="flex items-start gap-2.5 p-3 bg-white/5 border border-white/5 rounded-xl">
                    <span className="w-5 h-5 rounded-md bg-amber-400/10 text-amber-400 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="text-xs leading-relaxed">
                      {parts[1] ? (
                        <>
                          <strong className="text-white font-semibold">{parts[0]}</strong>: 
                          <span className="text-white/60">{parts[1]}</span>
                        </>
                      ) : (
                        <span className="text-white/60">{ctrl}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Game Information Deck */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'RTP Compliance', value: meta.rtp, sub: 'RNG Verified Payouts', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> },
              { label: 'Wager Limits', value: meta.betRange, sub: 'Chips Bet Capacity', icon: <Coins className="w-4 h-4 text-amber-400" /> },
              { label: 'Variance Risk', value: meta.volatility, sub: 'Return Distribution', icon: <Zap className="w-4 h-4 text-yellow-500 animate-pulse" /> },
              { label: 'Maximum Multiplier', value: meta.maxWin, sub: 'Premium Jackpot Cap', icon: <Trophy className="w-4 h-4 text-amber-500" /> }
            ].map((info, idx) => (
              <div key={idx} className="p-4 bg-[#0a0a1f]/80 border border-white/5 rounded-2xl flex flex-col justify-between h-24 text-left">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-mono font-bold text-white/40 uppercase tracking-widest">{info.label}</span>
                  {info.icon}
                </div>
                <div>
                  <span className="block text-sm font-black text-white font-mono">{info.value}</span>
                  <span className="block text-[8px] font-mono text-white/30 uppercase">{info.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 8. Screenshot / Aesthetic Mockup Gallery */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-400" /> Cabinet Layout Previews
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {meta.screenshots.map((shot, idx) => (
                <div 
                  key={idx}
                  className="bg-gradient-to-b from-[#0a0a1f] to-[#050510] border border-white/5 hover:border-white/10 rounded-2xl p-4 text-left space-y-2 relative overflow-hidden transition-all group h-32 flex flex-col justify-between"
                >
                  <div className="absolute top-1 right-2 opacity-5 pointer-events-none group-hover:scale-110 transition-transform text-4xl">
                    {shot.icon}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono font-bold text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 inline-block">
                      PHASE {idx + 1}: {shot.label}
                    </span>
                    <p className="text-[10px] text-white/50 leading-normal line-clamp-3">
                      {shot.desc}
                    </p>
                  </div>
                  <span className="text-[8px] font-mono text-white/20 uppercase flex items-center gap-1">
                    <Monitor className="w-3 h-3" /> ACTIVE FRAME VIEW
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. About Game */}
      {activeTab === 'about' && (
        <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-6 text-left space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" /> Historical Lore & About Game
            </h3>
            <span className="text-[10px] font-mono text-white/40 uppercase">FLOOR ARCHIVE</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed max-w-3xl">
            {meta.about}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                💎 True Mathematical Safety
              </h4>
              <p className="text-[10px] text-white/50 leading-normal">
                This digital simulation uses standard linear congruent pseudorandom generator cycles to provide completely transparent, provably fair odds. All seed outcomes are calculated instantly client-side.
              </p>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
              <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                🎰 Responsible Entertainment First
              </h4>
              <p className="text-[10px] text-white/50 leading-normal">
                As a fully functional social casino suite, players can study probability weights, test bet ranges, and experience VIP high roller ladders with zero monetary risks. All balances remain offline inside your browser sandbox.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 7. How to Play */}
      {activeTab === 'how-to' && (
        <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-6 text-left space-y-4 animate-fade-in">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/80 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" /> Strategic Playbook & Rules
            </h3>
            <span className="text-[10px] font-mono text-white/40 uppercase">STEP-BY-STEP</span>
          </div>
          <div className="space-y-3">
            {meta.howToPlay.map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <span className="w-7 h-7 rounded-full bg-amber-400 text-black font-black font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Step {idx + 1}: {idx === 0 ? 'Wager' : idx === 1 ? 'Action' : idx === 2 ? 'Evaluate' : 'Claim'}
                  </h4>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    {step}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. Player Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center text-left">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" /> Floor Feedback & Reviews
              </h3>
              <p className="text-[10px] text-white/40 font-mono uppercase">User satisfaction scores verified by active logs</p>
            </div>
            <div className="bg-amber-400/10 text-amber-400 px-3 py-1 rounded-xl border border-amber-400/20 font-bold font-mono text-xs flex items-center gap-1">
              ★ 4.9 <span className="text-[10px] text-white/40 font-normal">/ 5.0</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {meta.reviews.map((rev, idx) => (
              <div 
                key={idx} 
                className="p-5 bg-[#0a0a1f]/80 border border-white/5 rounded-3xl flex flex-col justify-between space-y-4 shadow-xl text-left"
              >
                <div className="space-y-2">
                  <div className="flex gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="flex items-center gap-2.5 pt-3 border-t border-white/5">
                  <span className="text-xl select-none filter drop-shadow">{rev.avatar}</span>
                  <div>
                    <h5 className="text-xs font-bold text-white">{rev.name}</h5>
                    <span className="text-[8px] font-mono text-white/30 uppercase">VERIFIED ROUNDS PLAYER</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. Achievements Milestone Badges */}
      <div className="space-y-4 text-left">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Game-Specific Achievements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {meta.achievements.map((ach, idx) => (
            <div 
              key={idx}
              className="p-4 bg-[#0a0a1f]/90 border border-white/5 rounded-2xl flex items-center justify-between gap-4 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-400/20 text-lg">
                  🏆
                </div>
                <div className="space-y-0.5 text-left">
                  <h4 className="text-xs font-bold text-white leading-tight">{ach.title}</h4>
                  <p className="text-[10px] text-white/40 leading-normal">{ach.desc}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
                {ach.reward}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 10. Similar Games / Recommendations */}
      <div className="space-y-4 text-left">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> More Floor Recommendations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {similarGames.map((game) => (
            <div 
              key={game.id}
              className="bg-[#0a0a1f]/80 border border-white/5 hover:border-amber-400/30 rounded-2xl p-4 flex justify-between items-center group transition-all"
            >
              <div className="text-left space-y-0.5">
                <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                  {game.name}
                </h4>
                <span className="block text-[8px] font-mono text-white/30 uppercase">{game.category} Classic</span>
              </div>
              <button
                onClick={() => onPlayGame(game.id)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-400 text-white hover:text-black transition-all cursor-pointer border border-white/10 hover:border-amber-400"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 13. Specialized Game View Footer */}
      <footer className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-white/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-sans font-black uppercase tracking-wider">
              Bingo 101 <strong className="text-amber-400">RNG Verified</strong>
            </span>
          </div>
          <p className="text-[9px] font-mono text-white/30 max-w-xl leading-normal">
            Certified by independent client-side virtual seeds. This simulation is intended purely for recreational and pedagogical training purposes. Play responsibly.
          </p>
        </div>

        <button
          onClick={onBackToLobby}
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Return to Lobby Floor
        </button>
      </footer>

    </div>
  );
};
