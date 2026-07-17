import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Sparkles, 
  Target, 
  Zap, 
  RotateCw, 
  Play, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Compass,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
  Gauge,
  Flame,
  Shield,
  ZapOff
} from 'lucide-react';

interface SportsCasinoGamesProps {
  gameId: string;
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

// Full Audio Engine for Immersive Sports Experience
class SportsSoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playWhistle() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.setValueAtTime(1300, now + 0.08);
      osc.frequency.setValueAtTime(900, now + 0.16);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  playImpact() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.15);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playSwish() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.18);
    } catch (e) {}
  }

  playCrowdCheers() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.6, now + 0.25);
        gain.gain.setValueAtTime(0.015, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start();
        osc.stop(now + 0.8);
      });
    } catch (e) {}
  }

  playBuzzer() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, now);
      osc2.frequency.setValueAtTime(112, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch (e) {}
  }

  playBeep(freq = 600, duration = 0.1) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + duration + 0.05);
    } catch (e) {}
  }
}

const audio = new SportsSoundEngine();

export const SportsCasinoGames: React.FC<SportsCasinoGamesProps> = ({
  gameId,
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // High-fidelity Game State:
  // 'idle' = Place bet & read playbook
  // 'setup' = Interactive aiming/calibrating/setup parameters before release
  // 'action' = Real-time active simulation where player interacts (timing clicks, QTEs, serving, aiming)
  // 'result' = Final sports-payout summary
  const [gameState, setGameState] = useState<'idle' | 'setup' | 'action' | 'result'>('idle');
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [highStreak, setHighStreak] = useState<number>(0);
  const [payoutResult, setPayoutResult] = useState<number>(0);
  const [gameResultMsg, setGameResultMsg] = useState<string>('');

  // Universal physics & wind calibration
  const [windSpeed, setWindSpeed] = useState<number>(0);
  const [windDirection, setWindDirection] = useState<'LEFT' | 'RIGHT' | 'NONE'>('NONE');

  // --- GAME 1: SOCCER PENALTY SHOOTOUT STATE ---
  const [soccerZone, setSoccerZone] = useState<number>(4); // Quadrant 0-8
  const [soccerPower, setSoccerPower] = useState<number>(0); // 0-100 charge
  const [soccerCurve, setSoccerCurve] = useState<number>(0); // -50 (Left spin) to +50 (Right spin)
  const [soccerKickStep, setSoccerKickStep] = useState<'zone' | 'power' | 'curve'>('zone');

  // --- GAME 2: CRICKET timing state ---
  const [cricketPitchDistance, setCricketPitchDistance] = useState<number>(0); // 0 (bowler release) to 100 (batting strike crease)
  const [cricketSpeedMode, setCricketSpeedMode] = useState<'FAST' | 'SPIN' | 'SWING'>('FAST');
  const [cricketBatStyle, setCricketBatStyle] = useState<'DEFENSIVE' | 'BALANCED' | 'AGGRESSIVE'>('BALANCED');

  // --- GAME 3: BASKETBALL APEX JUMP SHOT ---
  const [basketJumpApex, setBasketJumpApex] = useState<number>(0); // 0 to 100 elevation
  const [basketJumpDirection, setBasketJumpDirection] = useState<'up' | 'down'>('up');
  const [basketRimMovement, setBasketRimMovement] = useState<number>(50); // Rim horizontal oscillation

  // --- GAME 4: RETRO MINI-GOLF VECTOR PUZZLER ---
  const [golfPuttAngle, setGolfPuttAngle] = useState<number>(0); // -45 to +45 offset degrees
  const [golfPuttForce, setGolfPuttForce] = useState<number>(50); // 0-100 putter strike power
  const [golfObstaclePos, setGolfObstaclePos] = useState<number>(0); // Windmill blade rotation position

  // --- GAME 5: CYBER BOXING QTE SEQUENCE ---
  const [boxingQtePrompt, setBoxingQtePrompt] = useState<'JAB' | 'HOOK' | 'UPPERCUT'>('JAB');
  const [boxingQteStep, setBoxingQteStep] = useState<number>(0); // 0, 1, 2 punches required
  const [boxingQteSequence, setBoxingQteSequence] = useState<string[]>([]);
  const [boxingQteTimer, setBoxingQteTimer] = useState<number>(100); // percentage time left

  // --- GAME 6: PRECISION ARCHERY SCOPE DRIFT ---
  const [archeryScopeX, setArcheryScopeX] = useState<number>(0); // horizontal drift offset
  const [archeryScopeY, setArcheryScopeY] = useState<number>(0); // vertical drift offset

  // --- GAME 7: ICE HOCKEY GOALIE DEFENDER SLOTS ---
  const [hockeyPuckTarget, setHockeyPuckTarget] = useState<number>(1); // Left 0, Center 1, Right 2
  const [hockeyDefenderPos, setHockeyDefenderPos] = useState<number>(50); // sliding blocking wall offset

  // --- GAME 8: GRIDIRON FIELD GOAL WIND BLOWER ---
  const [footballKickArrow, setFootballKickArrow] = useState<number>(0); // -60 to 60 aim angle sways
  const [footballArrowDirection, setFootballArrowDirection] = useState<'left' | 'right'>('right');

  // --- GAME 9: RUGBY DROPKICK ELEVATION METER ---
  const [rugbyCrossbarHeight, setRugbyCrossbarHeight] = useState<number>(60); // Variable crossbar gate height
  const [rugbyKickVerticalAngle, setRugbyKickVerticalAngle] = useState<number>(0); // User angle

  // --- GAME 10: NEON TENNIS ACE ARCHADE RALLY ---
  const [tennisBallPosition, setTennisBallPosition] = useState<'LEFT' | 'RIGHT' | 'NONE'>('NONE');
  const [tennisPlayerPosition, setTennisPlayerPosition] = useState<'LEFT' | 'RIGHT'>('LEFT');
  const [tennisRallyCount, setTennisRallyCount] = useState<number>(0);
  const [tennisTimer, setTennisTimer] = useState<number>(100);

  // Core Simulation & Live Ball Render Coordinates
  const [ballCoords, setBallCoords] = useState<{ x: number; y: number; scale: number; rotate: number }>({ x: 0, y: 0, scale: 1, rotate: 0 });
  const [goalieCoords, setGoalieCoords] = useState<number>(0); // Goalkeeper horizontal block coordinate

  // Tick timers
  const intervalRef = useRef<any>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    resetWind();
    return () => {
      clearInterval(intervalRef.current);
      cancelAnimationFrame(animationRef.current);
    };
  }, [gameId]);

  const resetWind = () => {
    const speed = Math.floor(Math.random() * 22);
    const directions: ('LEFT' | 'RIGHT' | 'NONE')[] = ['LEFT', 'RIGHT', 'NONE'];
    const dir = directions[Math.floor(Math.random() * directions.length)];
    setWindSpeed(speed);
    setWindDirection(speed === 0 ? 'NONE' : dir);
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    audio.muted = next;
  };

  // --- INITIATE ACTIVE CASINO STAGE ---
  const handleEnterArena = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to lock in this sports wager!', 'error');
      return;
    }

    onUpdateChips(-betAmount);
    audio.playWhistle();
    setIsPlaying(true);
    setGameState('setup');

    // Reset game-specific parameters
    setSoccerKickStep('zone');
    setSoccerPower(0);
    setSoccerCurve(0);
    setCricketPitchDistance(0);
    setTennisRallyCount(0);
    setBoxingQteStep(0);
    setBoxingQteSequence([]);
    setBallCoords({ x: 0, y: 0, scale: 1, rotate: 0 });

    // Initialize state dynamics for specific games
    if (gameId === 'BASKETBALL') {
      startBasketballRimOscillation();
    } else if (gameId === 'GOLF') {
      startGolfWindmillObstacle();
    } else if (gameId === 'FOOTBALL_UP') {
      startFootballArrowSway();
    }
  };

  // --- BASKETBALL HOOP MOVE ---
  const startBasketballRimOscillation = () => {
    let dir = 'right';
    let val = 50;
    intervalRef.current = setInterval(() => {
      if (dir === 'right') {
        val += 3;
        if (val >= 90) dir = 'left';
      } else {
        val -= 3;
        if (val <= 10) dir = 'right';
      }
      setBasketRimMovement(val);
    }, 30);
  };

  // --- GOLF WINDMILL MOVE ---
  const startGolfWindmillObstacle = () => {
    let rotation = 0;
    intervalRef.current = setInterval(() => {
      rotation = (rotation + 4) % 360;
      setGolfObstaclePos(rotation);
    }, 32);
  };

  // --- FOOTBALL KICK ARROW SWAY ---
  const startFootballArrowSway = () => {
    let val = -60;
    let dir = 'right';
    intervalRef.current = setInterval(() => {
      if (dir === 'right') {
        val += 4;
        if (val >= 60) dir = 'left';
      } else {
        val -= 4;
        if (val <= -60) dir = 'right';
      }
      setFootballKickArrow(val);
    }, 24);
  };

  // --- INITIATE SOCCER SUB-STEPS ---
  const handleSoccerNextStep = () => {
    audio.playBeep(450, 0.08);
    if (soccerKickStep === 'zone') {
      setSoccerKickStep('power');
      // Slide power bar up and down
      let dir = 'up';
      let power = 0;
      intervalRef.current = setInterval(() => {
        setSoccerPower(prev => {
          if (dir === 'up') {
            if (prev >= 100) { dir = 'down'; return 98; }
            return prev + 5;
          } else {
            if (prev <= 0) { dir = 'up'; return 2; }
            return prev - 5;
          }
        });
      }, 20);
    } else if (soccerKickStep === 'power') {
      clearInterval(intervalRef.current);
      setSoccerKickStep('curve');
      // Wobble curve bar left and right
      let dir = 'right';
      intervalRef.current = setInterval(() => {
        setSoccerCurve(prev => {
          if (dir === 'right') {
            if (prev >= 50) { dir = 'left'; return 48; }
            return prev + 4;
          } else {
            if (prev <= -50) { dir = 'right'; return -48; }
            return prev - 4;
          }
        });
      }, 22);
    } else {
      // Release Curve selection and launch!
      clearInterval(intervalRef.current);
      executeSoccerPenalty();
    }
  };

  // --- RELEASE SOCCER PENALTY ---
  const executeSoccerPenalty = () => {
    setGameState('action');
    audio.playImpact();
    
    // Compute goalkeeper defense coordinate and win evaluation
    const isOvercharged = soccerPower > 88; // Flies over the bar
    const isUnderpowered = soccerPower < 35; // Too slow, goalkeeper picks up
    const isPerfectPower = soccerPower >= 65 && soccerPower <= 85;
    const goalieBlockZone = Math.floor(Math.random() * 9); // Goalie covers random sector

    const accuracyScore = Math.abs(soccerCurve); // closer to 0 means straight kick
    const isWin = !isOvercharged && !isUnderpowered && soccerZone !== goalieBlockZone && (isPerfectPower || Math.random() < 0.5);

    // Goal Animation Trajectory
    let tick = 0;
    const maxTicks = 45;
    
    // Goalie dives left, right or centers
    const goalieDivedX = ((goalieBlockZone % 3) - 1) * 90;

    const anim = () => {
      tick++;
      const progress = tick / maxTicks;
      const tX = ((soccerZone % 3) - 1) * 110 + (soccerCurve * 1.2);
      const tY = -(Math.floor(soccerZone / 3) + 1) * 55 - (isOvercharged ? 60 : 0);

      setBallCoords({
        x: tX * progress,
        y: tY * progress,
        scale: 1 - progress * 0.5,
        rotate: progress * 1080
      });

      setGoalieCoords(goalieDivedX * Math.min(1, progress * 1.5));

      if (tick < maxTicks) {
        animationRef.current = requestAnimationFrame(anim);
      } else {
        let feedback = '';
        if (isOvercharged) {
          feedback = `💥 OVER THE BAR! You completely blasted the ball with too much power (${soccerPower}%) into the stands!`;
        } else if (isUnderpowered) {
          feedback = `🧤 TOO WEAK! A slow roll (${soccerPower}%) easily scooped up by the goalkeeper's central stance.`;
        } else if (soccerZone === goalieBlockZone) {
          feedback = `❌ STUNNING SAVE! The goalkeeper dived straight to zone Z-${soccerZone + 1} and punched your ball away!`;
        } else {
          feedback = `⚽ GOAL! A magnificent curve shot bending at ${Math.abs(soccerCurve)}° directly into target zone Z-${soccerZone + 1}!`;
        }
        completeCasinoSportsMatch(isWin, 2.20, feedback);
      }
    };
    animationRef.current = requestAnimationFrame(anim);
  };

  // --- CRICKET LAUNCH ---
  const launchCricketBowler = () => {
    setGameState('action');
    setCricketPitchDistance(0);

    const isDefensive = cricketBatStyle === 'DEFENSIVE';
    const isAggressive = cricketBatStyle === 'AGGRESSIVE';

    // Speed up incoming ball based on modes
    const speed = cricketSpeedMode === 'FAST' ? 2.5 : cricketSpeedMode === 'SWING' ? 1.8 : 1.3;

    let dist = 0;
    intervalRef.current = setInterval(() => {
      dist += speed;
      setCricketPitchDistance(dist);

      // Play click beat as ball nears strike box
      if (Math.abs(dist - 78) < 4) {
        audio.playBeep(800, 0.05);
      }

      if (dist >= 100) {
        // Player missed the swing window (Bowled!)
        clearInterval(intervalRef.current);
        audio.playBuzzer();
        completeCasinoSportsMatch(false, 0, `🔴 CLEAN BOWLED! You didn't swing in time! The bowler shattered your stumps.`);
      }
    }, 20);
  };

  // --- CRICKET PLAYER SWINGS THE BAT ---
  const handleCricketSwing = () => {
    clearInterval(intervalRef.current);
    
    // Evaluate swing timing (crease sweet spot is 74 to 86 distance)
    const timingOffset = Math.abs(cricketPitchDistance - 80);
    const isPerfectTiming = timingOffset <= 5;
    const isGoodTiming = timingOffset <= 12;

    setGameState('action');
    audio.playImpact();

    const isDefensive = cricketBatStyle === 'DEFENSIVE';
    const isBalanced = cricketBatStyle === 'BALANCED';
    const isAggressive = cricketBatStyle === 'AGGRESSIVE';

    let isWin = false;
    let mult = 1.95;
    let feedback = '';

    if (isPerfectTiming) {
      isWin = true;
      if (isDefensive) {
        mult = 1.45;
        feedback = `🏏 PERFECT TIMING! Elegant defense block, bouncing ball safely to boundary for 1 Single!`;
      } else if (isBalanced) {
        mult = 2.80;
        feedback = `🏏 CRACKING DRIVE! textbook drive splits the fielders flat to the rope for 4 Runs!`;
      } else {
        mult = 6.20;
        feedback = `🚀 STADIUM ROOF BLAST! Spectacular aggressive swing cleared the entire stadium for a massive 6 Runs!`;
      }
    } else if (isGoodTiming) {
      if (isDefensive) {
        isWin = true;
        mult = 1.20;
        feedback = `🏏 SAFE BLOCK! Soft tap behind the crease secures 1 easy run.`;
      } else if (isBalanced) {
        isWin = Math.random() < 0.70;
        mult = 2.10;
        feedback = isWin 
          ? `🏏 DRIPPED THROUGH COVER! Ball rolls over the grass edge for 4 Runs!`
          : `🔴 CAUGHT AT COVER! Caught by a soaring mid-wicket fielder.`;
      } else {
        isWin = Math.random() < 0.40;
        mult = 5.20;
        feedback = isWin
          ? `🚀 BOUNDARY ROPE CLEAR! Thick edge sails over deep square leg for 6 Runs!`
          : `🔴 CAUGHT ON THE BOUNDARY! A towering shot, but didn't have the distance. Caught on the line!`;
      }
    } else {
      // Bad timing
      isWin = false;
      feedback = cricketPitchDistance < 74 
        ? `🔴 TOO EARLY! You swung way before the ball reached the pitch crease.`
        : `🔴 TOO LATE! The ball had already bypassed your batting blade.`;
    }

    // Flight ball away
    let tick = 0;
    const maxTicks = 40;
    const anim = () => {
      tick++;
      const progress = tick / maxTicks;
      if (isWin) {
        setBallCoords({
          x: (isAggressive ? 220 : -140) * progress,
          y: -220 * progress,
          scale: 1.3 - progress * 0.8,
          rotate: progress * 1000
        });
      } else {
        setBallCoords({
          x: 20 * progress,
          y: 60 * progress,
          scale: 1,
          rotate: progress * 180
        });
      }

      if (tick < maxTicks) {
        animationRef.current = requestAnimationFrame(anim);
      } else {
        completeCasinoSportsMatch(isWin, mult, feedback);
      }
    };
    animationRef.current = requestAnimationFrame(anim);
  };

  // --- BASKETBALL JUMP ACTION ---
  const launchBasketballJump = () => {
    setGameState('action');
    setBasketJumpApex(0);
    setBasketJumpDirection('up');

    // Make player rise and fall
    intervalRef.current = setInterval(() => {
      setBasketJumpApex(prev => {
        if (basketJumpDirection === 'up') {
          if (prev >= 100) {
            setBasketJumpDirection('down');
            return 98;
          }
          return prev + 4;
        } else {
          if (prev <= 0) {
            // Missed release (touched ground!)
            clearInterval(intervalRef.current);
            audio.playBuzzer();
            completeCasinoSportsMatch(false, 0, `💥 AIR BALL! You touched down without releasing the basketball.`);
          }
          return prev - 4;
        }
      });
    }, 20);
  };

  // --- BASKETBALL RELEASE BALL ---
  const handleBasketballRelease = () => {
    clearInterval(intervalRef.current);
    audio.playSwish();

    // Sweet spot is apex elevation 82 to 96
    const isPerfectApex = basketJumpApex >= 80 && basketJumpApex <= 95;
    const rimAlignOffset = Math.abs(basketRimMovement - 50); // Rim moves. 40 to 60 is perfect center
    const isPerfectAlign = rimAlignOffset <= 12;

    const isWin = isPerfectApex && isPerfectAlign;
    const feedback = isWin 
      ? `🏀 SWISH! A perfect release at the apex of your jump (${basketJumpApex}%) hitting nothing but neon net!`
      : !isPerfectApex 
        ? `💥 BRICK! Your release timing was completely off (${basketJumpApex}% height). The ball clanged hard off the rim.`
        : `💥 CLANK! Ball was aligned but the backboard rim was moving out of range.`;

    let tick = 0;
    const maxTicks = 45;
    const anim = () => {
      tick++;
      const progress = tick / maxTicks;
      // Ball arcs up and then down into the net position
      const tX = (basketRimMovement - 50) * 3 * progress;
      const tY = -240 * Math.sin(progress * Math.PI) + (progress * 50);

      setBallCoords({
        x: tX,
        y: tY,
        scale: 1.2 - progress * 0.4,
        rotate: progress * 540
      });

      if (tick < maxTicks) {
        animationRef.current = requestAnimationFrame(anim);
      } else {
        completeCasinoSportsMatch(isWin, 2.80, feedback);
      }
    };
    animationRef.current = requestAnimationFrame(anim);
  };

  // --- GOLF PUZZLE PUITING RELEASE ---
  const executeGolfPutt = () => {
    setGameState('action');
    audio.playImpact();
    clearInterval(intervalRef.current);

    // Wind obstacle penalty
    const drift = windDirection === 'LEFT' ? -windSpeed * 1.5 : windDirection === 'RIGHT' ? windSpeed * 1.5 : 0;
    const finalAngle = golfPuttAngle + (drift * 0.8);
    const angleOffset = Math.abs(finalAngle); // 0 is straight hole

    // Windmill check: rotation between 120 and 180 degrees blocks target
    const windmillBlocks = golfObstaclePos >= 110 && golfObstaclePos <= 190;
    
    // Perfect force sweet spot is 65 to 80
    const isForcePerfect = golfPuttForce >= 65 && golfPuttForce <= 82;

    const isWin = angleOffset <= 8 && !windmillBlocks && isForcePerfect;

    let tick = 0;
    const maxTicks = 55;
    const anim = () => {
      tick++;
      const progress = tick / maxTicks;
      const tX = finalAngle * 3 * progress;
      const tY = -180 * progress;

      setBallCoords({
        x: tX,
        y: tY,
        scale: 1 - progress * 0.4,
        rotate: progress * 360
      });

      if (tick < maxTicks) {
        animationRef.current = requestAnimationFrame(anim);
      } else {
        let feedback = '';
        if (windmillBlocks) {
          feedback = `🏜️ WINDMILL BLOCKED! Your golf ball bounced hard off the spinning obstacle sails!`;
        } else if (!isForcePerfect) {
          feedback = golfPuttForce > 82 
            ? `💥 TOO HARD! The ball zipped right past the hole cup and rolled off-green.`
            : `🏜️ TOO SLOW! Your ball didn't reach the target hole and trickled to a stop.`;
        } else if (angleOffset > 8) {
          feedback = `💨 WIND DRIFTED! Heavy drift curve (${finalAngle.toFixed(1)}°) pushed your golf ball out of the cup ring.`;
        } else {
          feedback = `⛳ HOLE-IN-ONE! Exquisite putt rolling gracefully through the windmill aperture right into the cup!`;
        }
        completeCasinoSportsMatch(isWin, 4.20, feedback);
      }
    };
    animationRef.current = requestAnimationFrame(anim);
  };

  // --- BOXING COMBO QUICK-TIME EVENT ---
  const startBoxingComboQte = () => {
    setGameState('action');
    setBoxingQteStep(0);
    setBoxingQteTimer(100);
    setBoxingQteSequence([]);

    // Generate sequence of 3 quick punches
    const punches: ('JAB' | 'HOOK' | 'UPPERCUT')[] = ['JAB', 'HOOK', 'UPPERCUT'];
    const randomizedSeq = [
      punches[Math.floor(Math.random() * 3)],
      punches[Math.floor(Math.random() * 3)],
      punches[Math.floor(Math.random() * 3)]
    ];
    
    setBoxingQtePrompt(randomizedSeq[0]);

    // Fast-burning timer
    let timeLeft = 100;
    intervalRef.current = setInterval(() => {
      timeLeft -= 1.8;
      setBoxingQteTimer(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(intervalRef.current);
        audio.playBuzzer();
        completeCasinoSportsMatch(false, 0, `🛡️ SHIELDED! Opponent countered! You timed out during your combo sequence.`);
      }
    }, 24);

    // Save full pattern in state ref
    (window as any).boxingComboPattern = randomizedSeq;
  };

  const handleBoxingPunchClick = (punch: 'JAB' | 'HOOK' | 'UPPERCUT') => {
    const pattern = (window as any).boxingComboPattern || [];
    const currentRequired = pattern[boxingQteStep];

    if (punch === currentRequired) {
      audio.playImpact();
      const nextStep = boxingQteStep + 1;
      setBoxingQteStep(nextStep);
      setBoxingQteSequence(prev => [...prev, punch]);

      if (nextStep >= 3) {
        // Combo success! Massive knockout strike
        clearInterval(intervalRef.current);
        executeBoxingKoStrike(true);
      } else {
        // Next punch in queue
        setBoxingQtePrompt(pattern[nextStep]);
        setBoxingQteTimer(100); // refresh QTE timer
      }
    } else {
      // Wrong punch clicked! Break combo!
      clearInterval(intervalRef.current);
      audio.playBuzzer();
      executeBoxingKoStrike(false);
    }
  };

  const executeBoxingKoStrike = (isComboSuccess: boolean) => {
    let tick = 0;
    const maxTicks = 35;
    const anim = () => {
      tick++;
      const progress = tick / maxTicks;
      setBallCoords({
        x: Math.sin(progress * Math.PI * 4) * (isComboSuccess ? 15 : -10),
        y: -progress * 60,
        scale: 1 + Math.sin(progress * Math.PI) * 0.7,
        rotate: 0
      });

      if (tick < maxTicks) {
        animationRef.current = requestAnimationFrame(anim);
      } else {
        const feedback = isComboSuccess 
          ? `🥊 DEVASTATING KNOCKOUT! You executed the flawless 3-punch combo flatlining the heavyweight contender!`
          : `🛡️ COMBO BROKEN! You threw the wrong punch type, breaking your alignment force.`;
        completeCasinoSportsMatch(isComboSuccess, 3.50, feedback);
      }
    };
    animationRef.current = requestAnimationFrame(anim);
  };

  // --- ARCHERY AIM WIND SCOPE ACTION ---
  const launchArcheryTargetHold = () => {
    setGameState('action');
    
    // Scope drifts according to wind conditions
    let driftX = 0;
    let driftY = 0;
    let tick = 0;

    intervalRef.current = setInterval(() => {
      tick++;
      // Apply harmonic sways + wind force
      const windPushX = windDirection === 'LEFT' ? -windSpeed * 1.2 : windDirection === 'RIGHT' ? windSpeed * 1.2 : 0;
      const swayX = Math.sin(tick * 0.1) * 35 + windPushX;
      const swayY = Math.cos(tick * 0.12) * 30 + (windSpeed * 0.3);

      setArcheryScopeX(swayX);
      setArcheryScopeY(swayY);
    }, 28);
  };

  const handleArcheryFightWind = (dir: 'L' | 'R' | 'U' | 'D') => {
    audio.playBeep(500, 0.05);
    // User adjusts scope coordinates to fight wind drift
    if (dir === 'L') setArcheryScopeX(prev => prev - 12);
    if (dir === 'R') setArcheryScopeX(prev => prev + 12);
    if (dir === 'U') setArcheryScopeY(prev => prev - 12);
    if (dir === 'D') setArcheryScopeY(prev => prev + 12);
  };

  const executeArcheryArrowRelease = () => {
    clearInterval(intervalRef.current);
    audio.playImpact();

    // Check scope closeness to target center
    const totalOffset = Math.sqrt(archeryScopeX * archeryScopeX + archeryScopeY * archeryScopeY);
    const isBullseye = totalOffset <= 15;
    const isOuterRing = totalOffset <= 45;

    let isWin = false;
    let multiplier = 0;
    let feedback = '';

    if (isBullseye) {
      isWin = true;
      multiplier = 6.50;
      feedback = `🏹 BULLSEYE 10X! Arrow drilled perfectly into the central gold ring at ${totalOffset.toFixed(1)}px center offset!`;
    } else if (isOuterRing) {
      isWin = Math.random() < 0.60;
      multiplier = 2.40;
      feedback = isWin 
        ? `🏹 IN THE RED! High-precision release hits the 8-point ring for a winning payout!`
        : `💨 ARROW DRIFTED! Wind caught your shaft, skimming the outer board tripod.`;
    } else {
      isWin = false;
      feedback = `💨 MISSED BOARD! Arrow drifted completely out of bounds into the background netting.`;
    }

    let tick = 0;
    const maxTicks = 40;
    const anim = () => {
      tick++;
      const progress = tick / maxTicks;
      setBallCoords({
        x: archeryScopeX * progress,
        y: -180 * progress + (archeryScopeY * progress),
        scale: 1.2 - progress * 0.9,
        rotate: isWin ? 0 : 25
      });

      if (tick < maxTicks) {
        animationRef.current = requestAnimationFrame(anim);
      } else {
        completeCasinoSportsMatch(isWin, multiplier, feedback);
      }
    };
    animationRef.current = requestAnimationFrame(anim);
  };

  // --- ICE HOCKEY ACTION ---
  const launchIceHockeyMatch = () => {
    setGameState('action');
    // sliding defense wall
    let dir = 'right';
    let val = 10;
    intervalRef.current = setInterval(() => {
      if (dir === 'right') {
        val += 6;
        if (val >= 90) dir = 'left';
      } else {
        val -= 6;
        if (val <= 10) dir = 'right';
      }
      setHockeyDefenderPos(val);
    }, 24);
  };

  const handleHockeySlapshotRelease = () => {
    clearInterval(intervalRef.current);
    audio.playImpact();

    // Check if the moving defender blocked the user's targeted slot (Left:0, Center:1, Right:2)
    let isWin = false;
    const defenderZone = hockeyDefenderPos < 35 ? 0 : hockeyDefenderPos < 65 ? 1 : 2;

    isWin = hockeyPuckTarget !== defenderZone;
    const feedback = isWin 
      ? `🏒 GOAL! Slapshot zipped past defender zone slot-${defenderZone + 1} clean into the mesh!`
      : `🏒 SHOT SMOTHERED! The sliding defense guard slid straight to your slot, absorbing the puck.`;

    let tick = 0;
    const maxTicks = 40;
    const anim = () => {
      tick++;
      const progress = tick / maxTicks;
      const tX = (hockeyPuckTarget - 1) * 110;

      setBallCoords({
        x: tX * progress,
        y: -180 * progress,
        scale: 1 - progress * 0.5,
        rotate: progress * 720
      });

      if (tick < maxTicks) {
        animationRef.current = requestAnimationFrame(anim);
      } else {
        completeCasinoSportsMatch(isWin, 2.20, feedback);
      }
    };
    animationRef.current = requestAnimationFrame(anim);
  };

  // --- FOOTBALL KICK LOCKING STEPS ---
  const handleFootballKickRelease = () => {
    clearInterval(intervalRef.current);
    setGameState('action');
    audio.playImpact();

    // Compensate sway angle against wind push
    const drift = windDirection === 'LEFT' ? -windSpeed * 1.8 : windDirection === 'RIGHT' ? windSpeed * 1.8 : 0;
    const netOffset = footballKickArrow + (drift * 0.8);

    // Goal is open between -35 and +35 net degrees offset
    const isWin = Math.abs(netOffset) <= 35;
    const feedback = isWin 
      ? `🏈 GOOD FIELD GOAL! The kick sailed beautifully right down the middle with wind correction!`
      : `🏈 WIDE LEFT/RIGHT! Stadium wind drifted the football wide off the stadium crossbars.`;

    let tick = 0;
    const maxTicks = 45;
    const anim = () => {
      tick++;
      const progress = tick / maxTicks;
      setBallCoords({
        x: netOffset * 2.5 * progress,
        y: -230 * progress,
        scale: 1.1 - progress * 0.7,
        rotate: progress * 1080
      });

      if (tick < maxTicks) {
        animationRef.current = requestAnimationFrame(anim);
      } else {
        completeCasinoSportsMatch(isWin, 2.50, feedback);
      }
    };
    animationRef.current = requestAnimationFrame(anim);
  };

  // --- RUGBY DROPKICK RELEASE ---
  const launchRugbyKickMeter = () => {
    setGameState('action');
    // random target gate height
    setRugbyCrossbarHeight(45 + Math.floor(Math.random() * 35));
    setRugbyKickVerticalAngle(0);

    // Speed indicator upwards
    intervalRef.current = setInterval(() => {
      setRugbyKickVerticalAngle(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current);
          audio.playBuzzer();
          completeCasinoSportsMatch(false, 0, `🏉 SHOT FLOPPED! You delayed your dropkick click, causing a fumble.`);
        }
        return prev + 3;
      });
    }, 22);
  };

  const handleRugbyKickLock = () => {
    clearInterval(intervalRef.current);
    audio.playImpact();

    // sweet spot: angle must be within 15 points of targeted gate height
    const isWin = Math.abs(rugbyKickVerticalAngle - rugbyCrossbarHeight) <= 12;
    const feedback = isWin 
      ? `🏉 EXTRA POINTS! Superb trajectory elevation (${rugbyKickVerticalAngle}%) clears the H-post crossbar!`
      : `🏉 MISSED TARGET! Elevation was ${rugbyKickVerticalAngle > rugbyCrossbarHeight ? 'too high' : 'too low'}, falling short.`;

    let tick = 0;
    const maxTicks = 45;
    const anim = () => {
      tick++;
      const progress = tick / maxTicks;
      setBallCoords({
        x: 0,
        y: -220 * progress,
        scale: 1.2 - progress * 0.6,
        rotate: progress * 720
      });

      if (tick < maxTicks) {
        animationRef.current = requestAnimationFrame(anim);
      } else {
        completeCasinoSportsMatch(isWin, 2.30, feedback);
      }
    };
    animationRef.current = requestAnimationFrame(anim);
  };

  // --- NEON TENNIS ACE ACTIVE RALLY DUEL ---
  const startTennisRallyMatch = () => {
    setGameState('action');
    setTennisRallyCount(0);
    triggerNextTennisVolley(0);
  };

  const triggerNextTennisVolley = (currentRally: number) => {
    const nextSide: 'LEFT' | 'RIGHT' = Math.random() < 0.5 ? 'LEFT' : 'RIGHT';
    setTennisBallPosition(nextSide);
    setTennisTimer(100);

    // Fast timer decreases per rally count! Extremely engaging!
    const timeLimit = Math.max(800, 2200 - currentRally * 180);
    let elapsed = 0;

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      elapsed += 40;
      const remaining = 100 - (elapsed / timeLimit) * 100;
      setTennisTimer(remaining);

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        audio.playBuzzer();
        // Missed returning
        completeCasinoSportsMatch(false, 0, `🎾 MISSED RETURN! Ball flew past your side. Final rally streak: ${currentRally} returns.`);
      }
    }, 40);
  };

  const handleTennisReturnClick = (side: 'LEFT' | 'RIGHT') => {
    setTennisPlayerPosition(side);

    if (side === tennisBallPosition) {
      // Returned successfully!
      audio.playSwish();
      const nextRally = tennisRallyCount + 1;
      setTennisRallyCount(nextRally);
      setTennisBallPosition('NONE');

      // Add combo multiplier rewards on success
      triggerAlert(`Rally Combo returned! Stak: ${nextRally}`, 'success');

      // Auto bounce volley ball animation
      setBallCoords({ x: side === 'LEFT' ? -90 : 90, y: -180, scale: 0.6, rotate: 180 });
      setTimeout(() => {
        setBallCoords({ x: 0, y: 0, scale: 1, rotate: 0 });
      }, 300);

      // Trigger next volley check
      setTimeout(() => {
        triggerNextTennisVolley(nextRally);
      }, 400);

    } else {
      // Wrong positioning! Match lost
      clearInterval(intervalRef.current);
      audio.playBuzzer();
      completeCasinoSportsMatch(false, 0, `🎾 WRONG SIDE! You sprinted left but the volley shot went right!`);
    }
  };

  const handleTennisCashout = () => {
    clearInterval(intervalRef.current);
    audio.playCrowdCheers();

    const currentRally = tennisRallyCount;
    if (currentRally === 0) {
      completeCasinoSportsMatch(false, 0, `🎾 You cashed out with 0 returns, recovering nothing.`);
      return;
    }

    // Multiply chips based on length of rally sequence!
    const mult = 1.0 + (currentRally * 0.85); // e.g. 3 returns = 3.55x payout!
    const feedback = `🏆 EXQUISITE CASHOUT! You completed ${currentRally} successive rallies and claimed a massive ${mult.toFixed(2)}x sport multiplier!`;
    completeCasinoSportsMatch(true, mult, feedback);
  };


  // --- COMMIT SPORT RESULT OUTCOME ---
  const completeCasinoSportsMatch = (isWin: boolean, multiplier: number, message: string) => {
    setGameResultMsg(message);
    setGameState('result');
    clearInterval(intervalRef.current);
    cancelAnimationFrame(animationRef.current);

    if (isWin) {
      const reward = Math.floor(betAmount * multiplier);
      onUpdateChips(reward);
      setPayoutResult(reward);
      setWinStreak(prev => {
        const next = prev + 1;
        if (next > highStreak) setHighStreak(next);
        return next;
      });
      audio.playCrowdCheers();
      triggerAlert(`WINNER! +${reward} Chips added to wallet!`, 'success');
      onUpdateTask('play_games', 1);
    } else {
      setPayoutResult(0);
      setWinStreak(0);
      triggerAlert('Sport match finished! Try another strategic approach!', 'info');
    }
    resetWind();
  };

  const handleReturnToLobby = () => {
    setIsPlaying(false);
    setGameState('idle');
    setPayoutResult(0);
    setGameResultMsg('');
  };

  const getGameConfig = () => {
    switch (gameId) {
      case 'SOCCER':
        return { name: 'Penalty Shootout', bg: 'from-emerald-950/90 to-green-900/40 border-emerald-500/30', icon: '⚽', guide: 'Choose target quadrant, then lock the exact force sweet-spot. Lastly, adjust the curve ball index to steer clear of the holographic diving goalie.' };
      case 'CRICKET':
        return { name: 'Super Over Challenge', bg: 'from-amber-950/90 to-amber-900/40 border-amber-500/30', icon: '🏏', guide: 'Time your defensive or aggressive swinging blade. Tap Swing the moment the incoming bowler pitch enters the yellow sweet-spot circle.' };
      case 'BASKETBALL':
        return { name: 'Neon Dunk Classic', bg: 'from-purple-950/90 to-indigo-900/40 border-indigo-500/30', icon: '🏀', guide: 'Gain jump altitude. Tap Release Ball at the exact apex of your jump when the moving hoops index coordinates perfectly!' };
      case 'GOLF':
        return { name: 'Retro Mini-Golf', bg: 'from-teal-950/90 to-emerald-900/40 border-teal-500/30', icon: '⛳', guide: 'Compensate target vectors against atmospheric drift. Deliver the precise golf putter force to slip past the spinning windmill.' };
      case 'BOXING':
        return { name: 'Cyber Boxing Puncher', bg: 'from-red-950/90 to-rose-900/40 border-red-500/30', icon: '🥊', guide: 'Fast Quick-Time Event! Strike the requested flashing punch button sequences in rapid progression to trigger an unstoppable KO punch combo!' };
      case 'ARCHERY':
        return { name: 'Precision Archery', bg: 'from-cyan-950/90 to-sky-900/40 border-cyan-500/30', icon: '🏹', guide: 'Fight crosswinds by physically adjusting the scope pad keys, then loose your multiplier arrows dead-center on the target bullboard.' };
      case 'ICE_HOCKEY':
        return { name: 'Slapshot Shootout', bg: 'from-sky-950/90 to-blue-900/40 border-blue-500/30', icon: '🏒', guide: 'Select an open goal sector, wait for the sliding defense guardians to clear, then release a high-velocity ice slapshot!' };
      case 'FOOTBALL_UP':
        return { name: 'Gridiron Field Goal', bg: 'from-yellow-950/90 to-orange-900/40 border-orange-500/30', icon: '🏈', guide: 'Release a dynamic stadium stadium-winning kick. Counteract sweeping winds to score right through the upright yellow posts.' };
      case 'RUGBY':
        return { name: 'Rugby Dropkick Arena', bg: 'from-indigo-950/90 to-indigo-900/40 border-indigo-500/30', icon: '🏉', guide: 'Coordinate angle elevation grids to lift the rugby dropkick clear above the fluctuating neon H-post crossbar gates.' };
      case 'TENNIS':
        return { name: 'Neon Tennis Ace', bg: 'from-lime-950/90 to-lime-900/40 border-lime-500/30', icon: '🎾', guide: 'Highly Interactive Duel! Move Left or Right in split-seconds to return the machine serve. Accumulate rally multiplier streaks and cash out or risk it all!' };
      default:
        return { name: 'Vegas Sports Classic', bg: 'from-slate-900 to-slate-800 border-slate-700', icon: '🏆', guide: 'Secure your sport wager and calibrate physics vectors to claim multipliers.' };
    }
  };

  const config = getGameConfig();

  return (
    <div className={`p-6 rounded-3xl border ${config.bg} relative overflow-hidden shadow-2xl bg-gradient-to-b backdrop-blur-md animate-fade-in`}>
      {/* Visual background aesthetics */}
      <div className="absolute -left-16 -top-16 w-56 h-56 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10 mb-6 text-left">
        <div className="flex items-center gap-3">
          <div className="text-4xl filter drop-shadow select-none animate-bounce">{config.icon}</div>
          <div>
            <h2 className="text-base font-serif font-black tracking-widest uppercase text-[#f5d061] flex items-center gap-2">
              {config.name} <span className="bg-red-500/20 text-red-400 text-[8px] font-mono px-2 py-0.5 rounded-full border border-red-500/30 animate-pulse">ARCADE LIVE</span>
            </h2>
            <p className="text-[10px] text-white/40 font-mono uppercase tracking-widest">
              PROFESSIONAL SIMULATOR CABIN • CRYPTO VERIFIABLE RNG
            </p>
          </div>
        </div>

        {/* HUD Statistics */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="bg-black/50 border border-white/10 px-3 py-1 rounded-xl text-center">
            <span className="block text-[8px] text-white/30 uppercase font-mono">CURRENT STREAK</span>
            <span className="text-xs font-black text-amber-400 font-mono flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 animate-pulse text-red-500" />
              {winStreak} Wins
            </span>
          </div>
          <div className="bg-black/50 border border-white/10 px-3 py-1 rounded-xl text-center">
            <span className="block text-[8px] text-white/30 uppercase font-mono">STADIUM RECORD</span>
            <span className="text-xs font-black text-white/80 font-mono">{highStreak} Max</span>
          </div>
          
          <button 
            onClick={toggleSound}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white cursor-pointer transition-all"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Stage layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side Panel: Playbook & Bet Controls */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between text-left">
          
          <div className="space-y-3.5">
            {/* Arena Playbook */}
            <div className="p-4 bg-black/60 border border-white/15 rounded-2xl space-y-2">
              <h4 className="text-[10px] font-mono text-[#f5d061] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> OFFICIAL TOURNAMENT RULEBOOK
              </h4>
              <p className="text-[11px] text-white/70 leading-relaxed font-sans">
                {config.guide}
              </p>
            </div>

            {/* Weather Wind Station */}
            <div className="p-4 bg-black/60 border border-white/10 rounded-2xl flex justify-between items-center">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">STADIUM ATMOSPHERE WEATHER</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                  {windSpeed > 0 ? `${windSpeed} MPH Vector Direction: ${windDirection}` : 'CALM ZERO-WIND CHAMBER'}
                </span>
              </div>
              <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full border ${
                windSpeed > 10 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {windSpeed > 10 ? 'HIGH DRIFT' : 'IDEAL COND'}
              </span>
            </div>
          </div>

          {/* Betting control panel */}
          <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">CHIP BET AMOUNT</span>
                <span className="text-xs font-bold text-[#f5d061] font-mono">{betAmount} CHIPS</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 50, 100, 500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    disabled={isPlaying}
                    onClick={() => setBetAmount(val)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      betAmount === val
                        ? 'bg-[#f5d061] text-black border-amber-300 font-extrabold shadow-md scale-102'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20 disabled:opacity-40'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {gameState === 'idle' ? (
              <button
                onClick={handleEnterArena}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 via-amber-500 to-amber-600 hover:brightness-110 text-black font-serif font-black uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current animate-pulse" />
                ENTER ACTIVE STADIUM
              </button>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="text-center font-mono text-[10px] text-emerald-400 py-2.5 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-pulse">
                  🎮 GAME IN PLAY • SHIELDED
                </div>
                {gameState !== 'result' && (
                  <button
                    onClick={handleReturnToLobby}
                    className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-mono uppercase tracking-wider text-[10px] rounded-xl border border-red-500/20 transition-all cursor-pointer"
                  >
                    ABORT & FORFEIT MATCH
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: High-End Virtual Interactive Screen Console */}
        <div className="lg:col-span-7 bg-[#05060b] border border-white/15 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[440px] shadow-2xl">
          
          {/* Dynamic stadium grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

          {/* STATE 1: IDLE STAGE */}
          {gameState === 'idle' && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 flex-grow z-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center text-4xl animate-pulse select-none filter drop-shadow">
                  {config.icon}
                </div>
                <div className="absolute inset-0 rounded-full border border-dashed border-amber-400/30 animate-spin [animation-duration:15s]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-black text-white uppercase tracking-widest font-serif">Awaiting Athlete Entry</h3>
                <p className="text-[11px] text-white/50 max-w-sm leading-relaxed font-mono">
                  LOCK IN YOUR CHIP WAGER ON THE PANEL CONTROLLER, THEN CLICK "ENTER ACTIVE STADIUM" TO RENDER THE FULLY INTERACTIVE SPORTS FIELD.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: INTERACTIVE SETUP AND CALIBRATION STAGE */}
          {gameState === 'setup' && (
            <div className="flex-grow flex flex-col justify-between z-10 space-y-6">
              
              {/* SPECIALIZED DETAILED SPORT FIELD SIMULATORS */}
              <div className="p-4 bg-black/60 rounded-2xl border border-white/10 flex-grow flex flex-col justify-center items-center relative overflow-hidden min-h-[220px]">
                
                {/* ⚽ SOCCER SETUP (Zone & Power & Curve step-by-step picker) */}
                {gameId === 'SOCCER' && (
                  <div className="w-full max-w-xs space-y-4">
                    <div className="text-center font-mono text-[9px] text-[#f5d061] uppercase tracking-widest font-bold">
                      Interactive Goal Net (Pick Zone & Strike)
                    </div>

                    <div className="relative border-4 border-b-0 border-white/80 rounded-t-xl bg-gradient-to-t from-emerald-950/40 to-black/80 aspect-[16/7] overflow-hidden p-1.5 shadow-inner">
                      {/* Goalkeeper Position Preview */}
                      <div className="absolute left-[45%] bottom-0 w-10 h-11 bg-cyan-400/30 border border-cyan-400 rounded-t-full flex items-center justify-center text-lg pointer-events-none select-none">
                        🧤
                      </div>

                      <div className="grid grid-cols-3 grid-rows-3 gap-1 h-full relative z-10">
                        {[...Array(9)].map((_, idx) => (
                          <button
                            key={idx}
                            disabled={soccerKickStep !== 'zone'}
                            onClick={() => {
                              setSoccerZone(idx);
                              audio.playBeep(400, 0.08);
                            }}
                            className={`rounded border text-[9px] font-mono font-black flex items-center justify-center transition-all ${
                              soccerZone === idx 
                                ? 'bg-[#f5d061] border-amber-300 text-black shadow-lg scale-102 font-black' 
                                : 'bg-black/50 border-white/10 text-white/40 hover:text-white disabled:opacity-40'
                            }`}
                          >
                            Z-{idx + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step Controls */}
                    {soccerKickStep === 'zone' && (
                      <button
                        onClick={handleSoccerNextStep}
                        className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-mono font-black text-[10px] rounded-lg tracking-widest uppercase cursor-pointer hover:brightness-110"
                      >
                        LOCK TARGET ZONE (Z-{soccerZone + 1}) →
                      </button>
                    )}

                    {soccerKickStep === 'power' && (
                      <div className="space-y-2">
                        <div className="flex justify-between font-mono text-[8px] text-white/50">
                          <span>POWER GAUGE:</span>
                          <span className="text-emerald-400 font-bold">{soccerPower}%</span>
                        </div>
                        <div className="w-full h-3 bg-black/60 rounded-full border border-white/10 overflow-hidden relative">
                          <div className="h-full bg-gradient-to-r from-yellow-500 to-red-500 transition-all duration-30" style={{ width: `${soccerPower}%` }} />
                          <div className="absolute top-0 bottom-0 left-[65%] right-[15%] border-l border-r border-dashed border-white/60 bg-emerald-500/20" />
                        </div>
                        <button
                          onClick={handleSoccerNextStep}
                          className="w-full py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-mono font-black text-[10px] rounded-lg tracking-widest uppercase cursor-pointer hover:brightness-110"
                        >
                          RELEASE POWER LOCK →
                        </button>
                      </div>
                    )}

                    {soccerKickStep === 'curve' && (
                      <div className="space-y-2">
                        <div className="flex justify-between font-mono text-[8px] text-white/50">
                          <span>SPIN/CURVE INDEX:</span>
                          <span className="text-amber-400 font-bold">{soccerCurve > 0 ? `+${soccerCurve}° Right` : `${soccerCurve}° Left`}</span>
                        </div>
                        <div className="w-full h-3 bg-black/60 rounded-full border border-white/10 overflow-hidden relative">
                          <div className="absolute top-0 bottom-0 w-2 bg-white transition-all duration-30" style={{ left: `${50 + (soccerCurve)}%` }} />
                        </div>
                        <button
                          onClick={handleSoccerNextStep}
                          className="w-full py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-mono font-black text-[10px] rounded-lg tracking-widest uppercase cursor-pointer hover:brightness-110"
                        >
                          RELEASE AND CURVE STRIKE!
                        </button>
                      </div>
                    )}

                  </div>
                )}

                {/* 🏏 CRICKET SETUP (Batting Style & Pitch release) */}
                {gameId === 'CRICKET' && (
                  <div className="w-full max-w-xs space-y-4">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest block text-center font-bold">
                      CRICKET MATCH ALIGNMENT
                    </span>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'FAST', label: '🔥 PACER', desc: 'Searing speed' },
                        { id: 'SPIN', label: '🌀 GOOGLY', desc: 'Wobble path' },
                        { id: 'SWING', label: '🍃 SWING', desc: 'Wind curved' }
                      ].map(m => (
                        <button
                          key={m.id}
                          onClick={() => { setCricketSpeedMode(m.id as any); audio.playBeep(420, 0.05); }}
                          className={`p-2 rounded-lg border text-[9px] font-mono transition-all ${
                            cricketSpeedMode === m.id 
                              ? 'bg-amber-400 text-black border-amber-300 font-black' 
                              : 'bg-black/50 border-white/10 text-white/40'
                          }`}
                        >
                          <div className="font-bold">{m.label}</div>
                          <div className="text-[7px] opacity-70">{m.desc}</div>
                        </button>
                      ))}
                    </div>

                    {/* Choose Swing Style */}
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2">
                      <div className="text-[8px] font-mono text-white/40 uppercase">Batting swing strategy:</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'DEFENSIVE', label: '🛡️ Defense (1.45x)', detail: 'Easy safe single' },
                          { id: 'BALANCED', label: '🏏 Normal (2.80x)', detail: 'Clean cover drive' },
                          { id: 'AGGRESSIVE', label: '🚀 Slog (6.20x)', detail: 'Huge out of park' }
                        ].map(s => (
                          <button
                            key={s.id}
                            onClick={() => { setCricketBatStyle(s.id as any); audio.playBeep(450, 0.05); }}
                            className={`p-1.5 rounded-lg border text-[8px] font-mono transition-all ${
                              cricketBatStyle === s.id 
                                ? 'bg-amber-400 border-amber-300 text-black font-black' 
                                : 'bg-black/40 border-white/5 text-white/50'
                            }`}
                          >
                            <div>{s.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={launchCricketBowler}
                      className="w-full py-3 bg-amber-400 text-black font-serif font-black text-xs uppercase rounded-xl tracking-wider hover:brightness-110 cursor-pointer"
                    >
                      PITCH THE BALL 🟢
                    </button>
                  </div>
                )}

                {/* 🏀 BASKETBALL SETUP (Apex released setup) */}
                {gameId === 'BASKETBALL' && (
                  <div className="w-full max-w-xs space-y-4 text-center">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest block font-bold">
                      JUMP SHOOTER HEIGHT MATRIX
                    </span>

                    <div className="relative w-full aspect-[16/8] rounded-xl border border-indigo-500/20 bg-gradient-to-t from-indigo-950/20 to-black overflow-hidden flex justify-center items-center">
                      <div className="absolute top-2 w-16 h-10 border border-white/30 bg-black/40 rounded flex items-end justify-center pb-1">
                        <div className="w-8 h-1 bg-red-500 rounded" />
                      </div>

                      {/* Moving hoops marker preview */}
                      <div 
                        className="absolute w-2 h-2 bg-indigo-400 rounded-full transition-all duration-30" 
                        style={{ left: `${basketRimMovement}%`, top: '40%' }}
                      />

                      <div className="text-3xl animate-bounce">🏀</div>
                    </div>

                    <p className="text-[10px] text-white/50 font-mono">
                      Rim coordinate oscillating at <span className="text-[#f5d061] font-bold">{basketRimMovement}%</span> offset
                    </p>

                    <button
                      onClick={launchBasketballJump}
                      className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-serif font-black text-xs uppercase rounded-xl tracking-wider cursor-pointer"
                    >
                      LEAP AND JUMP SHOT 🏀
                    </button>
                  </div>
                )}

                {/* ⛳ MINI-GOLF SETUP */}
                {gameId === 'GOLF' && (
                  <div className="w-full max-w-xs space-y-4">
                    <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest block text-center font-bold">
                      ALIGN PUTTER VECTOR
                    </span>

                    {/* Windmill Wind Indicators */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-[7px] font-mono text-white/30">Putt Angle Dial:</div>
                        <div className="text-xs font-bold font-mono text-teal-400">{golfPuttAngle}°</div>
                        <input 
                          type="range" 
                          min="-45" 
                          max="45" 
                          value={golfPuttAngle}
                          onChange={(e) => {
                            setGolfPuttAngle(parseInt(e.target.value));
                            audio.playBeep(350 + Math.abs(parseInt(e.target.value)) * 2, 0.05);
                          }}
                          className="w-full accent-teal-400 cursor-pointer h-1 bg-white/10 rounded-full"
                        />
                      </div>

                      <div className="p-2 bg-black/40 rounded-lg border border-white/5">
                        <div className="text-[7px] font-mono text-white/30">Strike Force Dial:</div>
                        <div className="text-xs font-bold font-mono text-teal-400">{golfPuttForce}%</div>
                        <input 
                          type="range" 
                          min="10" 
                          max="100" 
                          value={golfPuttForce}
                          onChange={(e) => {
                            setGolfPuttForce(parseInt(e.target.value));
                            audio.playBeep(300 + parseInt(e.target.value) * 3, 0.05);
                          }}
                          className="w-full accent-teal-400 cursor-pointer h-1 bg-white/10 rounded-full"
                        />
                      </div>
                    </div>

                    <div className="text-center font-mono text-[8px] text-teal-400/80 animate-pulse uppercase">
                      Cyber Obstacle Sails Rotating at {golfObstaclePos}°
                    </div>

                    <button
                      onClick={executeGolfPutt}
                      className="w-full py-3 bg-teal-500 text-black font-serif font-black text-xs uppercase rounded-xl tracking-wider hover:brightness-110 cursor-pointer"
                    >
                      EXECUTE MINI-PUTT ⛳
                    </button>
                  </div>
                )}

                {/* 🥊 CYBER BOXING SETUP */}
                {gameId === 'BOXING' && (
                  <div className="w-full max-w-xs space-y-4 text-center">
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest block font-bold">
                      PREPARE MULTI-PUNCH COMBO
                    </span>

                    <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-xl space-y-2">
                      <div className="text-[10px] text-white/70">
                        Combos require executing JAB, HOOK, or UPPERCUT sequences in split seconds.
                      </div>
                      <span className="text-xs font-black text-amber-400 font-mono">COMBO MULTIPLIER: 3.50x</span>
                    </div>

                    <button
                      onClick={startBoxingComboQte}
                      className="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white font-serif font-black text-xs uppercase rounded-xl tracking-wider cursor-pointer"
                    >
                      INITIATE STRIKE SEQUENCE 🥊
                    </button>
                  </div>
                )}

                {/* 🏹 ARCHERY SETUP */}
                {gameId === 'ARCHERY' && (
                  <div className="w-full max-w-xs space-y-4 text-center">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">
                      ARCHERY TARGET HOLDING RANGE
                    </span>

                    <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-center space-y-1">
                      <div className="text-[9px] text-white/40 uppercase">Archery Payout Factor:</div>
                      <div className="text-base font-black text-[#f5d061] font-mono">BULLSEYE MULTIPLIER: 6.50x</div>
                    </div>

                    <button
                      onClick={launchArcheryTargetHold}
                      className="w-full py-3 bg-cyan-500 text-black font-serif font-black text-xs uppercase rounded-xl tracking-wider hover:brightness-110 cursor-pointer"
                    >
                      DRAW BOWSTRINGS 🏹
                    </button>
                  </div>
                )}

                {/* 🏒 ICE HOCKEY SETUP */}
                {gameId === 'ICE_HOCKEY' && (
                  <div className="w-full max-w-xs space-y-4">
                    <span className="text-[10px] font-mono text-sky-400 uppercase tracking-widest block text-center font-bold">
                      SLAPSHOT RANGE DEFENDERS
                    </span>

                    <div className="grid grid-cols-3 gap-2">
                      {['SLOT-1 (Left)', 'SLOT-2 (Center)', 'SLOT-3 (Right)'].map((label, idx) => (
                        <button
                          key={idx}
                          onClick={() => { setHockeyPuckTarget(idx); audio.playBeep(450, 0.05); }}
                          className={`py-2 px-1 rounded-lg border text-[9px] font-mono transition-all ${
                            hockeyPuckTarget === idx 
                              ? 'bg-sky-400 text-black border-sky-300 font-black' 
                              : 'bg-black/50 border-white/10 text-white/40'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={launchIceHockeyMatch}
                      className="w-full py-3 bg-sky-500 text-black font-serif font-black text-xs uppercase rounded-xl tracking-wider hover:brightness-110 cursor-pointer"
                    >
                      ENGAGE ICE MATCH 🏒
                    </button>
                  </div>
                )}

                {/* 🏈 FOOTBALL FIELD GOAL SETUP */}
                {(gameId === 'FOOTBALL_UP' || gameId === 'RUGBY') && (
                  <div className="w-full max-w-xs space-y-4 text-center">
                    <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest block font-bold">
                      FIELD GOAL STADIUM GATES
                    </span>

                    <div className="p-4 bg-yellow-950/20 border border-yellow-500/20 rounded-xl space-y-1">
                      <div className="text-[9px] text-white/40 uppercase">Upright post layout:</div>
                      <div className="text-xs font-bold font-mono text-white">CROSSBAR GOAL MULTIPLIER: 2.50x</div>
                    </div>

                    {gameId === 'FOOTBALL_UP' ? (
                      <button
                        onClick={handleFootballKickRelease}
                        className="w-full py-3 bg-yellow-500 text-black font-serif font-black text-xs uppercase rounded-xl tracking-wider hover:brightness-110 cursor-pointer"
                      >
                        ALIGN FIELD KICKER 🏈
                      </button>
                    ) : (
                      <button
                        onClick={launchRugbyKickMeter}
                        className="w-full py-3 bg-yellow-500 text-black font-serif font-black text-xs uppercase rounded-xl tracking-wider hover:brightness-110 cursor-pointer"
                      >
                        START ELEVATION GAUGE 🏉
                      </button>
                    )}
                  </div>
                )}

                {/* 🎾 TENNIS ACE SETUP */}
                {gameId === 'TENNIS' && (
                  <div className="w-full max-w-xs space-y-4 text-center">
                    <span className="text-[10px] font-mono text-lime-400 uppercase tracking-widest block font-bold">
                      ARCADE RALLY MACHINE ROOM
                    </span>

                    <div className="p-4 bg-lime-950/20 border border-lime-500/20 rounded-xl space-y-2 text-center">
                      <div className="text-[9px] text-white/40 uppercase">Tennis Rally Multipliers:</div>
                      <div className="text-[11px] text-white/90 font-sans leading-relaxed">
                        Earn +0.85x payout multipliers with every return bounce. Cashout anytime or risk dropping!
                      </div>
                    </div>

                    <button
                      onClick={startTennisRallyMatch}
                      className="w-full py-3.5 bg-lime-500 text-black font-serif font-black text-xs uppercase rounded-xl tracking-wider hover:brightness-110 cursor-pointer"
                    >
                      START THE TENNIS RALLY 🎾
                    </button>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* STATE 3: ACTION DYNAMIC PLAY-BY-PLAY STAGE */}
          {gameState === 'action' && (
            <div className="flex-grow flex flex-col justify-between z-10 space-y-4">
              
              {/* VIRTUAL STADIUM SCREEN VIEW */}
              <div className="relative w-full flex-grow border border-white/10 rounded-2xl bg-gradient-to-b from-black to-[#090a10] overflow-hidden flex flex-col items-center justify-center min-h-[250px] p-4">
                
                {/* 🏏 CRICKET ACTION TIMING STAGE */}
                {gameId === 'CRICKET' && (
                  <div className="w-full max-w-xs flex flex-col justify-center items-center space-y-4 flex-grow">
                    <div className="relative w-full aspect-[16/7] bg-black/60 rounded-xl border border-white/5 flex flex-col items-center justify-center overflow-hidden">
                      {/* Stadium grass stripes */}
                      <div className="absolute inset-x-0 bottom-0 h-10 bg-emerald-950/30" />
                      
                      {/* Glowing Batter Strike Box sweet spot */}
                      <div className="absolute w-20 h-20 rounded-full border-2 border-dashed border-yellow-400/60 animate-pulse flex items-center justify-center" style={{ bottom: '2px' }}>
                        <span className="text-[7px] text-yellow-400/60 font-mono">SWING CREASE</span>
                      </div>

                      {/* Stumps */}
                      <div className="absolute bottom-1 bg-amber-600/80 w-1 h-8 rounded" />
                      <div className="absolute bottom-1 bg-amber-600/80 w-1 h-8 rounded ml-4" />

                      {/* Flying cricket ball */}
                      <div 
                        className="absolute bg-red-600 text-[10px] w-6 h-6 rounded-full flex items-center justify-center border border-red-400 shadow-[0_0_12px_red] font-black transition-all"
                        style={{
                          bottom: `${cricketPitchDistance}%`,
                          transform: `scale(${0.4 + (cricketPitchDistance / 100) * 1.5})`
                        }}
                      >
                        🔴
                      </div>
                    </div>

                    <div className="w-full space-y-1.5">
                      <div className="flex justify-between text-[8px] font-mono text-white/50">
                        <span>BALL POSITION:</span>
                        <span className={`font-bold ${Math.abs(cricketPitchDistance - 80) <= 6 ? 'text-green-400 animate-pulse' : 'text-amber-500'}`}>
                          {cricketPitchDistance < 74 ? 'BOWLER INCOMING' : Math.abs(cricketPitchDistance - 80) <= 6 ? '💥 STRIKE NOW! 💥' : 'PAST BAT'}
                        </span>
                      </div>
                      <button
                        onClick={handleCricketSwing}
                        className="w-full py-3 bg-[#f5d061] text-black font-serif font-black uppercase text-xs rounded-xl tracking-wider cursor-pointer active:scale-95"
                      >
                        🏏 SWING BAT!
                      </button>
                    </div>
                  </div>
                )}

                {/* 🏀 BASKETBALL ACTION APEX STAGE */}
                {gameId === 'BASKETBALL' && (
                  <div className="w-full max-w-xs flex flex-col justify-center items-center space-y-4 flex-grow">
                    
                    {/* Animated vertical elevation gauge */}
                    <div className="w-full grid grid-cols-12 gap-3 flex-grow">
                      
                      {/* Vertical Elevation track */}
                      <div className="col-span-2 h-36 bg-black/80 border border-white/10 rounded-full relative flex flex-col items-center justify-end p-0.5">
                        <div 
                          className="w-full rounded-full bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500 transition-all duration-30" 
                          style={{ height: `${basketJumpApex}%` }}
                        />
                        {/* Target Apex line */}
                        <div className="absolute bottom-[80%] left-0 right-0 h-1 bg-emerald-400 border-t border-b border-black" />
                      </div>

                      {/* Simulation Canvas preview */}
                      <div className="col-span-10 h-36 border border-white/5 bg-black/60 rounded-xl relative overflow-hidden flex flex-col justify-between p-3">
                        <div className="text-[7px] font-mono text-white/30 uppercase">NEON SHOOTER HEIGHT</div>
                        
                        {/* Hoop Rim on top right */}
                        <div 
                          className="absolute w-12 h-6 border-t-2 border-red-500 rounded-b-lg bg-black/50 transition-all duration-30"
                          style={{ right: '10px', top: '15px', transform: `translateX(${(basketRimMovement - 50) * 0.5}px)` }}
                        >
                          <div className="w-8 h-4 border-l border-r border-dashed border-white/30 mx-auto" />
                        </div>

                        {/* Basketball Athlete Silhouette elevation */}
                        <div 
                          className="absolute text-2xl transition-all duration-30"
                          style={{ left: '20px', bottom: `${10 + (basketJumpApex * 0.7)}px` }}
                        >
                          🏃🏀
                        </div>
                      </div>

                    </div>

                    <div className="w-full space-y-1.5">
                      <div className="flex justify-between text-[8px] font-mono text-white/50">
                        <span>ELEVATION:</span>
                        <span className={`font-bold ${basketJumpApex >= 80 && basketJumpApex <= 95 ? 'text-green-400' : 'text-indigo-400'}`}>
                          {basketJumpApex}% APEX height
                        </span>
                      </div>
                      <button
                        onClick={handleBasketballRelease}
                        className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-serif font-black uppercase text-xs rounded-xl tracking-wider cursor-pointer"
                      >
                        🎯 RELEASE BASKETBALL
                      </button>
                    </div>
                  </div>
                )}

                {/* 🥊 CYBER BOXING PUNCH COMBO QTE STAGE */}
                {gameId === 'BOXING' && (
                  <div className="w-full max-w-xs flex flex-col justify-center items-center space-y-4 flex-grow">
                    <div className="text-center space-y-1">
                      <span className="text-[8px] font-mono text-red-400 uppercase tracking-widest block">ACTIVE COMBO PROGRESS</span>
                      
                      {/* Combo steps indicators */}
                      <div className="flex justify-center gap-2">
                        {[0, 1, 2].map(step => (
                          <div 
                            key={step} 
                            className={`w-10 h-2 rounded-full border ${
                              boxingQteStep > step 
                                ? 'bg-red-500 border-red-400' 
                                : 'bg-black/80 border-white/10'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Prompter Target card */}
                    <div className="p-4 bg-black/80 border-2 border-red-500/40 rounded-2xl text-center space-y-2 w-full shadow-lg">
                      <span className="text-[9px] font-mono text-white/40 uppercase">STRIKE PUNCH TYPE IMMEDIATELY!</span>
                      <h3 className="text-2xl font-serif font-black tracking-widest text-[#f5d061] animate-pulse">
                        {boxingQtePrompt}
                      </h3>
                      
                      {/* QTE Time slider */}
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 transition-all duration-30" style={{ width: `${boxingQteTimer}%` }} />
                      </div>
                    </div>

                    {/* Multi-punch controllers */}
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {['JAB', 'HOOK', 'UPPERCUT'].map((p) => (
                        <button
                          key={p}
                          onClick={() => handleBoxingPunchClick(p as any)}
                          className="py-2.5 bg-white/5 hover:bg-red-500 hover:text-black border border-white/10 rounded-xl font-mono text-[9px] font-bold text-white transition-all cursor-pointer uppercase tracking-wider"
                        >
                          {p === 'JAB' ? '🤛 JAB' : p === 'HOOK' ? '🤜 HOOK' : '👊 UPPER'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🏹 ARCHERY ACTIVE AIMING STAGE */}
                {gameId === 'ARCHERY' && (
                  <div className="w-full max-w-xs flex flex-col justify-center items-center space-y-4 flex-grow">
                    
                    {/* Archery target with live drifting scope */}
                    <div className="relative w-40 h-40 rounded-full border border-white/10 bg-black/60 flex items-center justify-center overflow-hidden">
                      {/* Outer concentric rings */}
                      <div className="w-32 h-32 rounded-full border border-dashed border-white/20 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border border-blue-400/30 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full border border-red-400/40 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-[#f5d061]/80" />
                          </div>
                        </div>
                      </div>

                      {/* Real Drifting reticle target scope */}
                      <div 
                        className="absolute w-12 h-12 border-2 border-dashed border-cyan-400 rounded-full flex items-center justify-center transition-all duration-30"
                        style={{
                          transform: `translate(${archeryScopeX}px, ${archeryScopeY}px)`
                        }}
                      >
                        {/* crosshair pins */}
                        <div className="w-4 h-0.5 bg-cyan-400 absolute" />
                        <div className="h-4 w-0.5 bg-cyan-400 absolute" />
                      </div>
                    </div>

                    {/* Scope adjust keys */}
                    <div className="space-y-1.5 w-full">
                      <div className="grid grid-cols-3 gap-1 max-w-[150px] mx-auto text-center">
                        <div />
                        <button onClick={() => handleArcheryFightWind('U')} className="py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded font-mono text-[8px] text-white">▲ UP</button>
                        <div />
                        <button onClick={() => handleArcheryFightWind('L')} className="py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded font-mono text-[8px] text-white">◀ L</button>
                        <button onClick={executeArcheryArrowRelease} className="py-1 bg-red-500 hover:bg-red-600 text-black font-mono text-[8px] font-bold rounded">🎯</button>
                        <button onClick={() => handleArcheryFightWind('R')} className="py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded font-mono text-[8px] text-white">R ▶</button>
                        <div />
                        <button onClick={() => handleArcheryFightWind('D')} className="py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded font-mono text-[8px] text-white">▼ DWN</button>
                        <div />
                      </div>
                      <div className="text-center text-[8px] font-mono text-white/40">
                        Fight drifting wind coordinates! Center the scope reticle.
                      </div>
                    </div>
                  </div>
                )}

                {/* 🏒 ICE HOCKEY MATCH GOAL RELEASE */}
                {gameId === 'ICE_HOCKEY' && (
                  <div className="w-full max-w-xs flex flex-col justify-center items-center space-y-4 flex-grow">
                    <div className="relative w-full aspect-[16/7] bg-black/60 rounded-xl border border-white/5 overflow-hidden flex justify-center items-center">
                      <div className="absolute left-[38%] bottom-0 w-12 h-10 bg-blue-500/30 border border-blue-400 rounded-t" />

                      {/* Sliding defense block */}
                      <div 
                        className="absolute w-8 h-8 bg-red-500/40 border border-red-500 rounded-full flex items-center justify-center text-xs transition-all duration-30"
                        style={{ left: `${hockeyDefenderPos}%`, bottom: '2px' }}
                      >
                        🛡️
                      </div>

                      <div className="absolute bottom-2 left-4 text-xs font-mono text-[#f5d061] font-bold">
                        TARGETING: SLOT-{hockeyPuckTarget + 1}
                      </div>
                    </div>

                    <button
                      onClick={handleHockeySlapshotRelease}
                      className="w-full py-3 bg-sky-400 text-black font-serif font-black uppercase text-xs rounded-xl tracking-wider cursor-pointer"
                    >
                      🏒 RELEASE SLAPSHOT!
                    </button>
                  </div>
                )}

                {/* 🏉 RUGBY DROPKICK GAUGE */}
                {gameId === 'RUGBY' && (
                  <div className="w-full max-w-xs flex flex-col justify-center items-center space-y-4 flex-grow">
                    
                    <div className="w-full h-10 bg-black/80 border border-white/10 rounded-xl relative overflow-hidden flex items-center px-2">
                      {/* Targeted target window */}
                      <div 
                        className="absolute h-full bg-emerald-500/30 border-l border-r border-emerald-400" 
                        style={{ left: `${rugbyCrossbarHeight - 6}%`, right: `${100 - (rugbyCrossbarHeight + 6)}%` }}
                      />
                      {/* Sweeping cursor bar */}
                      <div 
                        className="absolute w-2 h-full bg-white border border-black transition-all duration-30" 
                        style={{ left: `${rugbyKickVerticalAngle}%` }}
                      />
                    </div>

                    <div className="text-center space-y-1">
                      <div className="text-[8px] text-white/40 font-mono uppercase">DROPKICK ELEVATION METER</div>
                      <span className="text-xs text-amber-400 font-mono font-black">TARGET SLOT: {rugbyCrossbarHeight}% HEIGHT</span>
                    </div>

                    <button
                      onClick={handleRugbyKickLock}
                      className="w-full py-3 bg-yellow-500 text-black font-serif font-black uppercase text-xs rounded-xl tracking-wider cursor-pointer"
                    >
                      🏉 LOCK KICK FORCE
                    </button>
                  </div>
                )}

                {/* 🎾 TENNIS ACE ACTIVE RALLY DUEL STAGE */}
                {gameId === 'TENNIS' && (
                  <div className="w-full max-w-xs flex flex-col justify-center items-center space-y-4 flex-grow">
                    
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[9px] font-mono text-white/50">RALLY MULTIPLIER:</span>
                      <span className="text-xs font-black text-lime-400 font-mono">
                        {(1.0 + (tennisRallyCount * 0.85)).toFixed(2)}x Payout
                      </span>
                    </div>

                    {/* Court View */}
                    <div className="relative w-full h-32 border border-white/10 bg-black/60 rounded-xl overflow-hidden flex justify-between items-end px-12 pb-2">
                      {/* Net line */}
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20" />

                      {/* Ball launcher position top center */}
                      <div className="absolute top-2 left-1/2 -ml-3 text-lg">🤖</div>

                      {/* Flying Tennis Ball */}
                      {tennisBallPosition !== 'NONE' && (
                        <div 
                          className="absolute text-xl animate-bounce"
                          style={{
                            left: tennisBallPosition === 'LEFT' ? '25%' : '75%',
                            top: '40%'
                          }}
                        >
                          🎾
                        </div>
                      )}

                      {/* Player position */}
                      <div 
                        className="text-2xl transition-all duration-150"
                        style={{ marginLeft: tennisPlayerPosition === 'LEFT' ? '0' : 'auto' }}
                      >
                        🏃‍♂️🎾
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full">
                      <button
                        onClick={() => handleTennisReturnClick('LEFT')}
                        className="py-2 bg-lime-500 hover:brightness-110 text-black font-mono text-[9px] font-bold rounded-xl"
                      >
                        ◀ MOVE LEFT
                      </button>
                      <button
                        onClick={handleTennisCashout}
                        disabled={tennisRallyCount === 0}
                        className="py-2 bg-[#f5d061] disabled:opacity-45 text-black font-mono text-[9px] font-black rounded-xl"
                      >
                        🏆 CLAIM CHIPS
                      </button>
                      <button
                        onClick={() => handleTennisReturnClick('RIGHT')}
                        className="py-2 bg-lime-500 hover:brightness-110 text-black font-mono text-[9px] font-bold rounded-xl"
                      >
                        MOVE RIGHT ▶
                      </button>
                    </div>

                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-lime-400 transition-all duration-40" style={{ width: `${tennisTimer}%` }} />
                    </div>
                  </div>
                )}

                {/* Simulated Goalkeeper or physics elements for other projectile animations */}
                {['SOCCER', 'ICE_HOCKEY'].includes(gameId) && (
                  <div className="absolute top-12 w-full flex justify-center">
                    <div 
                      className="w-12 h-12 bg-cyan-400/30 border border-cyan-400 rounded-full flex items-center justify-center text-xl shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-500"
                      style={{
                        transform: `translateX(${goalieCoords}px)`
                      }}
                    >
                      🧤
                    </div>
                  </div>
                )}

                {/* Animated projectile for non-timing elements (Soccer, Golf, Football up) */}
                {['SOCCER', 'GOLF', 'FOOTBALL_UP'].includes(gameId) && (
                  <div 
                    className="absolute bottom-10 z-20 text-3xl select-none filter drop-shadow transition-all duration-30"
                    style={{
                      transform: `translate(${ballCoords.x}px, ${ballCoords.y}px) scale(${ballCoords.scale}) rotate(${ballCoords.rotate}deg)`
                    }}
                  >
                    {gameId === 'SOCCER' ? '⚽' : gameId === 'GOLF' ? '⚪' : '🏈'}
                  </div>
                )}

              </div>

            </div>
          )}

          {/* STATE 4: RESULT SCREEN */}
          {gameState === 'result' && (
            <div className="space-y-5 flex-grow flex flex-col justify-between text-center z-10">
              <div className="p-5 bg-black/60 rounded-2xl border border-white/10 space-y-4 flex-grow flex flex-col justify-center items-center">
                
                {payoutResult > 0 ? (
                  <>
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl select-none filter drop-shadow animate-bounce">
                        👑
                      </div>
                      <div className="absolute inset-0 rounded-full border border-dashed border-emerald-400/30 animate-spin" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">
                        OUTCOME SECURED
                      </span>
                      <h4 className="text-xl font-serif font-black text-[#f5d061] tracking-wide">
                        +{payoutResult.toLocaleString()} CHIPS COLLECTED!
                      </h4>
                      <p className="text-xs text-white/90 max-w-sm italic mt-1.5 px-4 leading-relaxed font-sans">
                        "{gameResultMsg}"
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-2xl select-none animate-pulse">
                      ❌
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-red-400 font-bold uppercase tracking-widest block">
                        OUTCOME SECURED
                      </span>
                      <h4 className="text-xs font-bold text-white/60 font-mono">
                        Target missed.
                      </h4>
                      <p className="text-[11px] text-white/40 max-w-sm italic mt-1.5 px-4 leading-relaxed font-sans">
                        "{gameResultMsg}"
                      </p>
                    </div>
                  </>
                )}

              </div>

              <button
                onClick={handleReturnToLobby}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/15 rounded-xl font-mono text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4 animate-spin" /> RETURN AND PLAY AGAIN
              </button>
            </div>
          )}

          {/* Console Absolute Footer */}
          <div className="border-t border-white/5 pt-2 flex justify-between items-center opacity-40 text-[8px] font-mono uppercase tracking-widest">
            <span>RNG STATUS: PROTECTED SECURE LOCK</span>
            <span>LICENSED TOYOTA SPORT CLASSIC</span>
          </div>

        </div>

      </div>
    </div>
  );
};
