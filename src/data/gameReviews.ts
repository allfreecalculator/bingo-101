export interface GameReview {
  intro: string;
  features: string[];
  howToPlaySteps: string[];
  tips: string[];
  pros: string[];
  cons: string[];
  faqs: { q: string; a: string }[];
  conclusion: string;
  rtp?: string;
  volatility?: string;
  betRange?: string;
  maxWin?: string;
}

export const GAME_REVIEWS_CONTENT: Record<string, GameReview> = {
  BINGO: {
    intro: `Classic Bingo has been a staple of gaming halls worldwide for decades, and Bing101 brings this traditional 75-ball experience directly to your digital screen in its most polished form. Designed as an educational simulator, our 75-Ball Classic Bingo floor is optimized to teach players the intricate mechanics of card buying, pattern identification, call tempos, and daubing speed adjustments without any real-money risk.

Each round begins with a 5x5 ticket grid containing 24 random numbers and a "FREE" central star. As numbers are drawn from the physical simulator's cage, players can track falling ball sequences and earn substantial chip payouts based on five active pattern classes: Lines, Corners, Letters, Pluses, and Blackout Jackpots. Our simulator features real-time vocal audio calling tracks, customizable interval timers (ranging from 4-second beginner pacing to 0.8-second hyper-blitz rounds), and an instant "Auto-Daub" assistant that automates matching markers for a highly accessible, stress-free gaming environment.`,
    features: [
      "Custom Ticket Selection: Buy and track up to 4 tickets simultaneously to expand board coverage.",
      "Variable Ball Speeds: Select from Slow (4s), Normal (2s), or Hyper (0.8s) intervals to match your skill level.",
      "Professional Vocal Calling: High-fidelity audio announcements for all 75 numbers.",
      "Auto-Daub Assistant: Instantly stamps matching numbers, eliminating missed opportunities.",
      "Multi-Pattern Recognition: Automatically calculates payouts for lines, diagonals, and special shapes."
    ],
    howToPlaySteps: [
      "Choose your buy-in chip tier and select the number of active cards (1 to 4) you wish to purchase.",
      "Identify the current target winning pattern (e.g., Line, Corners, Plus, or Blackout) shown on the visual display board.",
      "Launch the drawing cycle. As balls are announced, watch your 5x5 grids for matching coordinates.",
      "If Auto-Daub is disabled, click the flashing cells on your cards manually to place your markers.",
      "Once you form the target pattern, click the glowing 'CLAIM BINGO' button before the caller announces the next ball to secure your rewards."
    ],
    tips: [
      "Keep Auto-Daub enabled when playing with 3 or 4 cards to ensure zero manual errors on fast draws.",
      "Play on Hyper speed if you want to farm XP and chips quickly to unlock high-tier VIP lobby ranks.",
      "Always verify the target pattern before purchasing cards; different patterns require very different column alignments."
    ],
    pros: [
      "Highly educational, explaining card coordinates simply.",
      "Authentic vocal call tracks and ball physics.",
      "Adjustable speed settings make it accessible to players of all ages.",
      "Completely offline-safe progress syncing."
    ],
    cons: [
      "High speed rounds might overwhelm absolute beginners if auto-daub is turned off.",
      "Requires active attention to click 'CLAIM BINGO' at the exact right moment."
    ],
    conclusion: `Bing101's Classic Bingo is the ultimate 75-ball training ground. It masterfully bridges the gap between old-school bingo halls and modern high-speed simulation, providing an incredibly satisfying, rewarding loop. Whether you are practicing your pattern-recognition speeds or simply looking to chill with some nostalgic caller tracks, this is the premier destination to enjoy zero-risk ticket action.`,
    faqs: [
      { q: "What is 75-Ball Bingo?", a: "It is the standard American bingo format played on a 5x5 card with numbers ranging from 1 to 75 under the letters B-I-N-G-O." },
      { q: "How does the 'FREE' space work?", a: "The central tile on every card acts as an automatic wild card. It is permanently stamped and counts toward any crossing winning patterns." },
      { q: "What are the number ranges for each column?", a: "B contains 1-15, I contains 16-30, N contains 31-45, G contains 46-60, and O contains 61-75." },
      { q: "Can I play multiple cards at once?", a: "Yes, our simulator supports buying and playing 1, 2, 3, or 4 tickets concurrently in a single round." },
      { q: "What happens if I miss a called number?", a: "If Auto-Daub is on, you will never miss a number. If it is off, you must click the cell manually. Missed numbers might prevent pattern completions." },
      { q: "How do I trigger a Bingo win?", a: "Once your card matches the target pattern, you must click the 'CLAIM BINGO' button to register your win and claim chips." },
      { q: "Is the caller voice real?", a: "Yes, we integrate high-quality synthetic vocal samples that mimic authentic casino announcer tracks." },
      { q: "What is a 'Blackout' in Bingo?", a: "A Blackout (or coverall) requires every single tile on your 5x5 card to be stamped. It offers the highest multiplier payout." },
      { q: "Does ball caller speed affect my payouts?", a: "Speed does not change the math, but faster speeds help you complete rounds and level up much faster." },
      { q: "Are the card draws random?", a: "Yes, cards and called balls are governed by a certified pseudo-RNG algorithm that ensures completely unbiased distribution." }
    ]
  },
  SLOTS: {
    intro: `Vegas Slots stands as the undisputed king of physical casino floors, and our simulator captures that high-contrast, premium single-line reel rotation experience in digital high-fidelity. Styled after traditional high-denomination mechanical slots, Vegas Slots offers players a masterclass in volatility, payline mathematics, and reel index tracking.

The machine features a classic 3-reel structure centering a single horizontal payline. Emblazoned with traditional symbols like Cherries, single, double, and triple Bars, and the elusive Golden Wild Diamonds, it is built to mimic Fremont Street's most generous high-roller layouts. Players can adjust coin sizes, watch realistic physics-based momentum deceleration on the virtual reels, and trigger automatic spin routines to analyze long-term win frequencies and Return-To-Player (RTP) statistics under different bet regimes.`,
    features: [
      "Classic 3-Reel Layout: Clean single-payline layout styled after mechanical machines.",
      "Expanding Diamond Wilds: Wild icons substitute for symbols and double payline payouts.",
      "High-Volatility Mechanics: Infrequent but substantial jackpot multipliers up to 500x.",
      "Realistic Momentum Physics: Reels decelerate smoothly with authentic bell and chime triggers.",
      "Continuous Auto-Spin: Sit back and track long-term payout trends effortlessly."
    ],
    howToPlaySteps: [
      "Use the bottom-deck +/- bet buttons to select your active chip wager per spin.",
      "Review the visual paytable located above the reels to understand symbol hierarchy.",
      "Click the large 'SPIN' button to initiate the 3-reel momentum cycle.",
      "Wait for the reels to come to a complete stop from left to right.",
      "If three identical icons (or combinations utilizing Diamond Wilds) align on the center line, claim your chips instantly."
    ],
    tips: [
      "Vegas Slots is a HIGH volatility game; keep your bet size under 5% of your total balance to survive dry spells.",
      "Diamond Wilds are your best friend. Even a single Wild on the line doubles your payout ratio.",
      "Use Auto-Spin to complete your daily tasks rapidly while monitoring your win/loss curves."
    ],
    pros: [
      "Impeccable mechanical feedback and sound effects.",
      "High payout multipliers make it extremely exciting.",
      "Simplistic layout makes it instantly understandable."
    ],
    cons: [
      "Only features a single central payline, meaning diagonal alignments do not count.",
      "High volatility can deplete a low balance quickly if wagers are too high."
    ],
    conclusion: `Vegas Slots is a masterfully crafted recreation of old-school casino gaming. By choosing realistic mechanics and high-contrast diamond alignments over modern convoluted video grids, it delivers an intense, pure slot experience. It is the perfect simulator to learn bankroll discipline and savor the timeless rush of the spin.`,
    faqs: [
      { q: "What is slot volatility?", a: "Volatility refers to how often a slot pays out. High volatility slots pay out less frequently but offer much larger jackpots." },
      { q: "What does RTP stand for?", a: "RTP means Return to Player. It is the theoretical percentage of wagered chips a slot machine returns to players over millions of spins." },
      { q: "How does the Diamond Wild symbol work?", a: "The Diamond Wild substitutes for any other symbol to form a winning payline and applies a multiplier to that win." },
      { q: "Are diagonal combinations counted?", a: "No, Vegas Slots is a classic single-line machine; symbols must align horizontally across the center line." },
      { q: "What is the maximum payout in Vegas Slots?", a: "Landing three Golden Wild Diamonds on the active line awards the grand jackpot of 500x your stake." },
      { q: "Can I stop the reels manually?", a: "The reels decelerate based on realistic physics, but you can tap SPIN during a spin to trigger a quick-stop." },
      { q: "Is there a strategy to win?", a: "Slots use a random generator, so there is no way to predict spins. The best strategy is managing your bet sizes." },
      { q: "Does auto-spin change my winning odds?", a: "No, auto-spin uses the exact same RNG as manual spins, just at a faster, automated pace." },
      { q: "Why did I get paid for a mix of Bar symbols?", a: "Any mix of Single, Double, or Triple Bar symbols forms a valid combination that pays a small safety return." },
      { q: "Are my virtual chips saved?", a: "Yes, your chip balance is stored securely in your local profile and synced to the cloud if you register a VIP account." }
    ]
  },
  CRASH: {
    intro: `Rocket Crash represents the cutting edge of modern online casino entertainment, departing from traditional reels and cards to introduce a real-time, player-directed multiplayer multiplier curve. Styled with a sleek cosmic neon aesthetic, Rocket Crash places players in the cockpit of a launching rocket, forcing them to make high-stakes, split-second decisions as the multiplier scales toward astronomical heights.

The premise is brilliantly simple: the rocket launches at a 1.00x multiplier and ascends continuously. As it climbs, your prospective payout climbs alongside it. However, the rocket can explode at any random, mathematically determined millisecond. If you cash out before the blast, you win your multiplied stake. If the rocket explodes first, your wager vaporizes. This simple dynamic creates a thrilling psychological battle between conservative compounding and high-risk jackpot chasing.`,
    features: [
      "Real-Time Multiplier Scaling: Watch multipliers climb exponentially in real-time.",
      "Custom Auto-Cashout: Specify an exact multiplier to automatically lock in profits.",
      "Adrenaline-Driven Gameplay: Player-controlled cashout puts you in complete control.",
      "Detailed History Tracker: Review the crash multipliers of the last 10 flights to spot trends.",
      "Smooth Vector Animations: Highly responsive UI optimized for desktop and mobile."
    ],
    howToPlaySteps: [
      "Input your target starting chip wager in the console field before the countdown ends.",
      "Optional: Set a safety Auto-Cashout threshold (e.g., 2.0x) to automate your exit.",
      "Click 'LAUNCH' to lock in your ticket for the next flight.",
      "Watch the rocket climb. The display shows your growing multiplier and live chip value.",
      "Click the large green 'CASH OUT' button to secure your winnings before the rocket combusts."
    ],
    tips: [
      "Automate your gameplay by using the Auto-Cashout at 1.5x. It is the most consistent way to build a bankroll.",
      "Do not chase losses by doubling wagers; Rocket Crash can experience consecutive low crashes (under 1.2x).",
      "Observe the history bar. If there have been 3 or 4 consecutive low crashes, a high-multiplier flight (5x+) is often on the horizon."
    ],
    pros: [
      "Puts the player in total control of their exit point.",
      "Potential for massive multipliers exceeding 100x+ in a single round.",
      "Extremely fast-paced and highly engaging."
    ],
    cons: [
      "Can crash instantly at 1.00x, giving zero reaction time for manual cashouts.",
      "Requires extremely fast internet and low screen latency to cash out manually."
    ],
    conclusion: `Rocket Crash is an absolute masterpiece of psychological gaming. It turns probability math into an interactive, high-tension sport where your nerves are tested on every single flight. It is highly recommended for strategic players who appreciate having complete agency over their risk-to-reward metrics.`,
    faqs: [
      { q: "What is a crash game?", a: "It is an arcade-style betting game where an active multiplier rises continuously and players must exit before it randomly crashes." },
      { q: "What is the lowest possible crash point?", a: "The rocket can crash immediately at 1.00x, which results in an instant loss for all active players." },
      { q: "What is the maximum multiplier?", a: "The multiplier is mathematically infinite, though our simulator caps extreme heights to protect table liquidity." },
      { q: "How does Auto-Cashout work?", a: "You input a target multiplier (like 1.8x). If the rocket reaches that height, the system automatically claims your win instantly." },
      { q: "Is the crash point pre-determined?", a: "Yes, the crash point is generated using a secure cryptographic hash before the flight begins, ensuring complete fairness." },
      { q: "Why did my manual cashout fail?", a: "In high-speed games, a split-second delay can mean the rocket crashed on the server before your click reached it." },
      { q: "Can I bet on multiple rockets?", a: "Our current simulator supports one high-performance rocket ticket per flight to keep the interface highly focused." },
      { q: "Does the history bar show patterns?", a: "Rounds are independent, but the history bar helps you visualize the distribution of multipliers over time." },
      { q: "How is the multiplier curve calculated?", a: "The rocket accelerates slowly at first, and then climbs much faster as it survives longer in orbit." },
      { q: "Is Rocket Crash fair?", a: "Yes, it is governed by a provably fair RNG formula that mirrors real-world crash algorithms." }
    ]
  },
  MINES: {
    intro: `Mines Floor delivers an immersive puzzle-adventure styled after the classic Microsoft Minesweeper, redesigned as a high-stakes, customizable casino multiplier. It is an exceptional game of strategic deduction and calculated risk, allowing players to customize the exact mathematical volatility of their board before flipping a single tile.

Played on a 5x5 grid of 25 face-down cards, the objective is to uncover glowing Golden Gems while avoiding hidden active landmines. Uncovering a gem increases your payout multiplier and lets you cash out immediately, or you can risk it all and flip another card. If you hit a mine, the game ends instantly and your accumulated chips are lost. With adjustable mine counts ranging from 1 to 24, players can configure everything from ultra-safe high-frequency grinds to high-risk, single-pick mega jackpots.`,
    features: [
      "Adjustable Volatility: Configure between 1 and 24 active hidden landmines.",
      "Face-Down 5x5 Grid: Clean, responsive neon tile-flipping interface.",
      "Exponential Multipliers: Each consecutive gem increases payouts dramatically.",
      "Flexible Cashout: Secure your earnings at any stage—no need to clear the board.",
      "Provably Fair Board: Reveals all hidden mine positions instantly upon cashout or loss."
    ],
    howToPlaySteps: [
      "Select your active bet size and choose the number of mines you want to hide on the board.",
      "Click 'START' to lock in your settings and initialize the 25 face-down tiles.",
      "Click any tile on the 5x5 board to flip it over.",
      "If you reveal a Golden Gem, your active multiplier increases. You can now click 'CASH OUT' to claim your chips.",
      "Continue flipping tiles to increase your multipliers, but avoid hitting a hidden mine."
    ],
    tips: [
      "Start with 3 mines. This offers a balanced multiplier curve where uncovering 3 or 4 gems easily doubles your stake.",
      "Do not get greedy. Secure your profit after 3-4 successful flips; clearing a board completely is statistically highly improbable.",
      "Use a 'Single-Flip' strategy on high mine counts (15+ mines). A single successful flip yields a massive payout, allowing you to exit immediately."
    ],
    pros: [
      "Highly tactical gameplay with complete control over board difficulty.",
      "Transparent mechanics—all mine coordinates are revealed when the round ends.",
      "Adjustable volatility fits any style of play."
    ],
    cons: [
      "A single mistake wipes out all progress for that round.",
      "Can be highly addictive due to the near-miss psychological effect."
    ],
    conclusion: `Mines Floor is a brilliant fusion of classic gaming and casino mathematics. It rewards patience, discipline, and probability analysis, making it a favorite for strategic players. By giving you the power to choose your hazard frequency, it stands as one of the most flexible and fair simulators on the web.`,
    faqs: [
      { q: "How many tiles are on the Mines board?", a: "The board consists of a 5x5 grid containing a total of 25 face-down tiles." },
      { q: "How do the payouts increase?", a: "Payouts multiply with each consecutive gem you reveal. More mines hidden on the board mean much higher multipliers per gem." },
      { q: "What happens if I click a mine?", a: "The game ends instantly, all hidden mines are revealed, and you lose your entire wager for that round." },
      { q: "When can I cash out?", a: "You can cash out and collect your current winnings at any time after revealing at least one Golden Gem." },
      { q: "What is the safest mine setting?", a: "Setting the game to 1 active mine is the safest configuration, though it offers very low multiplier increases." },
      { q: "What is the maximum mine setting?", a: "You can hide up to 24 mines, leaving only 1 single Golden Gem on the board for an extreme jackpot payout." },
      { q: "Are the mine positions fixed?", a: "No, mine locations are randomly distributed across the 25 tiles using a secure RNG before each round begins." },
      { q: "Can I change my bet mid-game?", a: "No, your bet size and mine count are locked once you click START and cannot be changed until the round is over." },
      { q: "Is there an 'Auto-Pick' feature?", a: "Our simulator focus is on manual tactical selection to keep you in complete control of your adventure." },
      { q: "Are mine layouts provably fair?", a: "Yes, our algorithm guarantees that mine locations do not shift during gameplay based on where you click." }
    ]
  },
  PLINKO: {
    intro: `Cosmic Plinko brings the classic game show pegboard experience into a futuristic neon casino layout, combining realistic gravity-based physics with adjustable mathematical risk brackets. It is one of the most relaxed yet statistically interesting games in the lobby, featuring the highest Return-To-Player (RTP) rating across our entire gaming catalog.

The board is a pyramid-shaped grid of steel pins. Players drop bouncing neon spheres from the top, watching them deflect left and right down the rows until they land in one of the multiplier bins at the bottom. The central bins offer low returns (under 1x) as they are the most statistically likely landing spots, while the outermost bins feature massive jackpot multipliers (up to 1000x on High risk). With adjustable row densities and variable risk levels, players can study the classic binomial distribution curves in real-time.`,
    features: [
      "Binomial Peg Pyramid: Real-time physics simulation of gravity-based ball drops.",
      "Adjustable Rows: Customize the pyramid depth from 8 to 16 rows to shift payouts.",
      "Variable Risk Settings: Select Low, Medium, or High risk profiles to change multiplier scales.",
      "High Return-To-Player (RTP): Boasts an outstanding 99% theoretical return rate.",
      "Multi-Ball Drops: Drop multiple balls in rapid succession for a thrilling cascade."
    ],
    howToPlaySteps: [
      "Configure your per-ball chip wager using the bottom +/- console buttons.",
      "Select your preferred Risk Level (Low, Medium, or High) and Row count (8 to 16 rows).",
      "Click the large 'DROP BALL' button to launch a bouncing sphere from the center top.",
      "Watch the ball deflect off the pegs as it cascades down Pascal's triangle.",
      "Claim the multiplier of the bottom bin the ball lands in. Profits are added to your wallet instantly."
    ],
    tips: [
      "For a stable and low-variance grind, play on Medium risk with 10 or 12 rows.",
      "If you are chasing the 1000x jackpot, set the board to High Risk and 16 rows, but keep your bet size extremely small.",
      "Drop multiple balls in a row (rapid tapping) to fill the board and balance out short-term statistical variance."
    ],
    pros: [
      "Spectacular physics simulation with satisfying sound design.",
      "Very high 99% RTP makes it highly generous.",
      "Completely adjustable risk and row depths."
    ],
    cons: [
      "Most balls will land in the center, resulting in a partial loss of your wager (e.g., 0.2x or 0.5x).",
      "Can feel passive as players do not control the ball's path once dropped."
    ],
    conclusion: `Cosmic Plinko is an absolute masterclass in statistical visualization. It is both a calming, visually gorgeous physics engine and a deep strategic tool to explore probability distributions. If you want a reliable game to enjoy while tracking long-term compounding returns, Plinko is the ultimate choice.`,
    faqs: [
      { q: "How does Plinko work?", a: "A ball is dropped from the top of a peg pyramid, deflecting off pins randomly before landing in a multiplier slot at the bottom." },
      { q: "What are the adjustable settings in Plinko?", a: "Players can adjust the Risk Level (Low, Medium, High) and the number of peg rows (8 to 16 rows)." },
      { q: "Why is the central bin payout so low?", a: "Statistically, there are far more paths leading to the center than the edges. Central bins pay less to offset extreme edge jackpots." },
      { q: "What is the maximum payout in Cosmic Plinko?", a: "On High Risk and 16 Rows, the outermost bins award a massive 1000x multiplier jackpot." },
      { q: "Can I drop multiple balls at once?", a: "Yes, our simulator supports dropping dozens of balls simultaneously to create gorgeous cascading waterfalls." },
      { q: "Does the ball's weight or drop speed change?", a: "Balls use a standardized physics model to ensure completely fair, unbiased distribution." },
      { q: "Is Plinko a high-volatility game?", a: "It is highly customizable. Low risk is very low volatility, while High risk with 16 rows is extremely volatile." },
      { q: "How does row count affect the game?", a: "Adding more rows increases the number of bins at the bottom and scales up both the risk and the maximum payout." },
      { q: "Are the peg bounces rigged?", a: "No, our physical deflection model is completely unbiased and calculated in real-time on every bounce." },
      { q: "What is the house edge on Plinko?", a: "At 99% RTP, Cosmic Plinko features an extremely player-friendly house edge of only 1%." }
    ]
  }
};

// Fallback review generator for other games
export const getFallbackReview = (id: string, name: string, category: string): GameReview => {
  const cleanName = name.replace(/[^a-zA-Z0-9 ]/g, '').trim();
  return {
    intro: `Welcome to the official Bing101 review of ${name}. As part of our commitment to providing the web's most trusted online casino guides and strategic resources, we have put this premium ${category} game through rigorous testing. This detailed review explores the underlying RNG mechanics, mobile responsiveness, payout volatility, and tactical tips to help both beginners and advanced players maximize their simulated chips.

${name} offers a highly immersive, responsive interface styled with our signature eye-safe dark neon theme. Whether you are aiming to complete your daily achievements, practice strategic bankroll management, or simply enjoy a premium casual simulation, this table is configured to provide outstanding gameplay with zero financial risk.`,
    features: [
      `Premium ${category} Design: Custom particle effects and responsive layouts optimized for mobile.`,
      "RNG-Certified Gameplay: Powered by a clean, fully transparent pseudo-random generator.",
      "Interactive Controls: Snappy, tactile buttons with clear, high-contrast text indicators.",
      "Durable Progress Syncing: Save your XP, wagers, and level stats directly to your profile.",
      "VIP Achievements Integration: Completing rounds on this table contributes to massive chip rewards."
    ],
    howToPlaySteps: [
      "Use the +/- wager buttons located at the bottom control bar to define your starting chip bet.",
      "Review the game console parameters, including multiplier scales or payout cards.",
      "Initiate the active play cycle by tapping the main action button (e.g., Draw, Spin, or Deal).",
      "Engage with any on-screen decision elements (such as choosing cards, colors, or target limits).",
      "Claim your chip returns instantly when a winning match is verified by the RNG engine."
    ],
    tips: [
      "Always start with small wagers (1% of your balance) on a new game to understand its payout tempo.",
      "Integrate your gameplay with the 'Earn Chips' faucet tasks to get free balance boosts as you play.",
      "Keep an eye on the RTP ratios—different specialty games offer very different mathematical advantages."
    ],
    pros: [
      "Incredibly clean, fast-loading, and mobile-responsive.",
      "No real money is ever required, offering safe and secure casino practice.",
      "Satisfying visual feedback and fluid animations."
    ],
    cons: [
      "Does not support real-money wagering, which may disappoint high-stakes purists.",
      "Some tables have steep learning curves for absolute beginners."
    ],
    conclusion: `${name} is an exceptional addition to the Bing101 Casino platform. It perfectly balances educational strategy guides with interactive entertainment, allowing you to enjoy authentic casino thrills in a fully secure, responsible environment. Try it today and start scaling your VIP tier!`,
    faqs: [
      { q: `What is ${name}?`, a: `It is a premium simulated ${category} game designed to help players enjoy authentic casino mechanics with zero risk.` },
      { q: "Is it safe to play?", a: "Absolutely! There are no real-money deposits, purchases, or withdrawals. It is 100% free-to-play." },
      { q: "How do I get more chips?", a: "You can claim free chips instantly in the 'Earn Chips' lobby or complete daily tasks to reload your balance." },
      { q: "Are the odds rigged?", a: "No, all tables use certified pseudo-RNG algorithms that guarantee fair, completely random outcomes." },
      { q: "Does this game support mobile?", a: "Yes, the interface is fully responsive and designed to fit perfectly on any smartphone or tablet screen." },
      { q: "Do I need to create an account to save progress?", a: "Your progress is saved locally on your device. However, you can register a VIP account to sync your balance to the cloud." },
      { q: "What is the best strategy for this table?", a: "Focus on consistent, small bets and utilize our strategic tips to survive natural statistical variance." },
      { q: "Does this game help with real casino games?", a: "Yes, it is an excellent training simulator to learn betting rules and math without risking real capital." },
      { q: "Why is the theme dark?", a: "We use a dark, low-blue-light color scheme to protect your eyes and ensure maximum comfort during long gaming sessions." },
      { q: "How do I contact support if I find a bug?", a: "You can visit our Contact page in the footer menu to submit any feedback or bug reports to our admin team." }
    ]
  };
};
