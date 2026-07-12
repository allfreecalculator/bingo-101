import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Play, Sparkles, Volume2, VolumeX, HelpCircle, Trophy, Disc } from 'lucide-react';

interface MegaWheelGameProps {
  chips: number;
  onUpdateChips: (delta: number) => void;
  onUpdateTask: (taskId: string, increment: number) => void;
  triggerAlert: (text: string, type: 'success' | 'error' | 'info') => void;
}

interface WheelSegment {
  label: string;
  mult: number;
  color: string;
  weight: number; // probability weight
}

const SEGMENTS: WheelSegment[] = [
  { label: '1x', mult: 1, color: '#10b981', weight: 45 },    // Emerald
  { label: '2x', mult: 2, color: '#06b6d4', weight: 25 },    // Cyan
  { label: '5x', mult: 5, color: '#6366f1', weight: 15 },    // Indigo
  { label: '10x', mult: 10, color: '#ec4899', weight: 10 },  // Pink
  { label: '20x', mult: 20, color: '#f59e0b', weight: 4 },   // Gold/Amber
  { label: '40x', mult: 40, color: '#ef4444', weight: 1 },   // Red/Jackpot
];

class WheelAudio {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (this.muted) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playTick() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(400, now + 0.015);
      gain.gain.setValueAtTime(0.008, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.02);
    } catch (e) {}
  }

  playWin() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.02, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.28);
      });
    } catch (e) {}
  }
}

export const MegaWheelGame: React.FC<MegaWheelGameProps> = ({
  chips,
  onUpdateChips,
  onUpdateTask,
  triggerAlert,
}) => {
  const [betAmount, setBetAmount] = useState<number>(25);
  const [selectedTarget, setSelectedTarget] = useState<number>(1); // e.g. bet on 1x, 2x, 5x, 10x, 20x, 40x
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [winningSegment, setWinningSegment] = useState<WheelSegment | null>(null);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [bestWin, setBestWin] = useState<number>(0);

  const audioRef = useRef<WheelAudio>(new WheelAudio());

  // Visual wheel representation with 24 wedges based on weight probabilities
  // We construct a physical 24-wedge map
  const constructedWedges = useRef<WheelSegment[]>([]);
  if (constructedWedges.current.length === 0) {
    const list: WheelSegment[] = [];
    // Approximate distributions: 10 Emerald (1x), 6 Cyan (2x), 4 Indigo (5x), 2 Pink (10x), 1 Amber (20x), 1 Red (40x) = 24 segments
    const wedgesPattern = [
      SEGMENTS[0], SEGMENTS[1], SEGMENTS[0], SEGMENTS[2], SEGMENTS[0], SEGMENTS[3],
      SEGMENTS[0], SEGMENTS[1], SEGMENTS[0], SEGMENTS[2], SEGMENTS[0], SEGMENTS[4],
      SEGMENTS[0], SEGMENTS[1], SEGMENTS[0], SEGMENTS[2], SEGMENTS[0], SEGMENTS[3],
      SEGMENTS[0], SEGMENTS[1], SEGMENTS[0], SEGMENTS[2], SEGMENTS[1], SEGMENTS[5]
    ];
    constructedWedges.current = wedgesPattern;
  }

  const handleSpin = () => {
    if (chips < betAmount) {
      triggerAlert('Insufficient chips to spin the Mega Wheel!', 'error');
      return;
    }

    setIsSpinning(true);
    setWinningSegment(null);
    onUpdateChips(-betAmount);
    onUpdateTask('casino_wager', betAmount);

    // Play ticking simulation
    let tickCount = 0;
    const ticker = setInterval(() => {
      audioRef.current.playTick();
      tickCount++;
      if (tickCount > 25) clearInterval(ticker);
    }, 120);

    // Randomize a wedge index
    const totalWedges = constructedWedges.current.length;
    const winningIndex = Math.floor(Math.random() * totalWedges);
    const targetWedge = constructedWedges.current[winningIndex];

    // Compute rotation degrees
    // We want the wedge to align at the top pointing pointer (which is at 270 degrees on a standard clock)
    // Degrees per wedge = 360 / 24 = 15 deg
    const wedgeDegrees = 360 / totalWedges;
    // Align center of the selected wedge to the top pointer
    const targetRotation = (totalWedges - winningIndex) * wedgeDegrees - (wedgeDegrees / 2) + 270;
    
    // Spin around multiple full circles (e.g., 5 extra circles)
    const finalRotation = rotation + (360 * 5) + targetRotation - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWinningSegment(targetWedge);
      setHistory(prev => [targetWedge.label, ...prev.slice(0, 9)]);

      const isWin = targetWedge.mult === selectedTarget;
      if (isWin) {
        // Return is bet + bet * multiplier
        const winPayout = Math.floor(betAmount * targetWedge.mult) + betAmount;
        onUpdateChips(winPayout);
        setBestWin(prev => Math.max(prev, winPayout));
        audioRef.current.playWin();
        triggerAlert(`🎯 Hit! The wheel landed on ${targetWedge.label}. Won +${winPayout} Chips! 🎉`, 'success');
        onUpdateTask('win_high_odds', 1);
      } else {
        triggerAlert(`The wheel landed on ${targetWedge.label}. Bet was on ${selectedTarget}x. Try again!`, 'info');
      }
    }, 3200);
  };

  const setBetMax = () => setBetAmount(Math.min(chips, 1000));
  const doubleBet = () => setBetAmount(prev => Math.min(chips, prev * 2));
  const halveBet = () => setBetAmount(prev => Math.max(10, Math.round(prev / 2)));

  return (
    <div id="megawheel-game-container" className="bg-[#0e0a29]/85 border border-white/10 rounded-3xl p-5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-md animate-fade-in">
      
      {/* Background decoration flares */}
      <div className="absolute top-[-40px] left-[-40px] w-56 h-56 bg-purple-500/10 rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute bottom-[-40px] right-[-40px] w-56 h-56 bg-indigo-500/10 rounded-full blur-[70px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/5">
            <Disc className="w-6 h-6 animate-spin-slow text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white uppercase font-sans flex items-center gap-2">
              Dream Mega Wheel <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold">Multiplier Lobby</span>
            </h3>
            <p className="text-[10px] text-white/50 font-mono uppercase tracking-widest">Place your bet on 1x, 2x, 5x, 10x, 20x or 40x segments</p>
          </div>
        </div>

        {/* Cooldown controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              const next = !soundMuted;
              setSoundMuted(next);
              audioRef.current.muted = next;
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white transition-all cursor-pointer animate-fade-in"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
          </button>
          
          <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 text-[10px] font-mono text-white/60 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Max Win: <span className="font-black text-amber-400">{bestWin}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_1.3fr_1fr] gap-6 items-start">
        
        {/* Left column: Choose target segment & bet size */}
        <div className="space-y-4">
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2.5">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">1. Select Bet Multiplier</span>
            <div className="grid grid-cols-3 gap-2">
              {SEGMENTS.map((seg) => (
                <button
                  key={seg.mult}
                  disabled={isSpinning}
                  onClick={() => setSelectedTarget(seg.mult)}
                  className={`p-2.5 rounded-xl border text-center font-mono text-xs transition-all cursor-pointer block ${
                    selectedTarget === seg.mult
                      ? 'bg-indigo-500/20 text-white border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-white/5 text-white/40 border-transparent hover:border-white/10 hover:text-white'
                  } disabled:opacity-50`}
                >
                  <div className="font-black text-sm" style={{ color: seg.color }}>{seg.label}</div>
                  <div className="text-[8px] text-white/30 font-bold uppercase mt-0.5">Win {seg.mult}x</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-white/60 uppercase font-bold tracking-wide flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> Wager Bet
              </span>
              <span className="text-[10px] text-white/30 font-mono">Min: 10</span>
            </div>

            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
              <input
                type="number"
                disabled={isSpinning}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Math.min(chips, parseInt(e.target.value) || 10)))}
                className="bg-transparent border-none outline-none text-white font-mono font-black text-sm flex-1 min-w-0"
              />
              {!isSpinning && (
                <div className="flex items-center gap-1">
                  <button onClick={halveBet} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">½</button>
                  <button onClick={doubleBet} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-white/5 hover:bg-white/10 rounded border border-white/5 cursor-pointer">2x</button>
                  <button onClick={setBetMax} className="px-2 py-0.5 text-[9px] font-bold font-mono bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded border border-indigo-500/20 transition-all cursor-pointer">Max</button>
                </div>
              )}
            </div>
          </div>

          <button
            disabled={isSpinning}
            onClick={handleSpin}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs tracking-widest uppercase transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> SPIN DREAM WHEEL
          </button>
        </div>

        {/* Center column: Gorgeous Glowing SVG Wheel with dynamic needle */}
        <div className="flex flex-col items-center justify-center relative min-h-[280px]">
          {/* Top indicator needle pointer */}
          <div className="absolute top-[5px] z-20 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-red-500 drop-shadow-md animate-bounce" />
            <div className="w-2.5 h-2.5 rounded-full bg-white border border-red-500 shadow-inner mt-[-6px]" />
          </div>

          {/* SVG Wheel Plate */}
          <div className="relative w-56 h-56 rounded-full border-8 border-white/10 bg-black/60 shadow-[0_0_40px_rgba(99,102,241,0.2)] overflow-visible">
            <motion.svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              animate={{ rotate: rotation }}
              transition={isSpinning ? { duration: 3.2, ease: 'easeOut' } : { duration: 0 }}
            >
              {constructedWedges.current.map((seg, idx) => {
                const total = constructedWedges.current.length;
                const angle = 360 / total;
                const startAngle = idx * angle;
                const endAngle = (idx + 1) * angle;

                // Sector trigonometry paths
                const rad = Math.PI / 180;
                const r = 90;
                const cx = 100;
                const cy = 100;

                const x1 = cx + r * Math.cos(startAngle * rad);
                const y1 = cy + r * Math.sin(startAngle * rad);
                const x2 = cx + r * Math.cos(endAngle * rad);
                const y2 = cy + r * Math.sin(endAngle * rad);

                const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

                // Center of text wedge
                const textAngle = startAngle + angle / 2;
                const tx = cx + (r * 0.65) * Math.cos(textAngle * rad);
                const ty = cy + (r * 0.65) * Math.sin(textAngle * rad);

                return (
                  <g key={idx}>
                    <path
                      d={path}
                      fill={seg.color}
                      stroke="#0d081f"
                      strokeWidth="1.5"
                      opacity="0.85"
                      className="hover:opacity-100 transition-opacity"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill="#ffffff"
                      fontSize="7"
                      fontWeight="black"
                      fontFamily="monospace"
                      textAnchor="middle"
                      transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
              
              {/* Center Cap hub */}
              <circle cx="100" cy="100" r="20" fill="#0d081f" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              <circle cx="100" cy="100" r="14" fill="#6366f1" opacity="0.3" />
            </motion.svg>
          </div>

          <AnimatePresence>
            {winningSegment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 px-4 py-2 rounded-2xl border flex items-center gap-2 animate-fade-in text-center font-mono text-xs font-black"
                style={{ borderColor: winningSegment.color, backgroundColor: `${winningSegment.color}15`, color: winningSegment.color }}
              >
                🏆 RESULT: {winningSegment.label} MULTIPLIER!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right column: Probability weight guide & history */}
        <div className="space-y-4">
          <div className="bg-black/45 border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Wedge Distributions</span>
            <div className="flex flex-col gap-1.5 font-mono text-[10px]">
              {SEGMENTS.map((seg, idx) => (
                <div key={idx} className="flex justify-between p-1.5 border-b border-white/5">
                  <span style={{ color: seg.color }} className="font-bold">{seg.label} Wedge</span>
                  <span className="text-white/40">Odds: {seg.weight}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2">
            <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">Wheel History</span>
            <div className="flex flex-wrap gap-1.5">
              {history.length === 0 ? (
                <span className="text-[10px] text-white/20 font-mono">No spins yet...</span>
              ) : (
                history.map((h, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-white/5 text-white/75 border border-white/5"
                  >
                    {h}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
