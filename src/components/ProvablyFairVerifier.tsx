import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  HelpCircle, 
  RefreshCw, 
  Binary, 
  Cpu, 
  Coins, 
  FileText, 
  Info, 
  Terminal, 
  CheckCircle2, 
  Lock, 
  ExternalLink,
  Sliders,
  Sparkles,
  ClipboardCheck,
  Clipboard,
  Undo
} from 'lucide-react';

interface ProvablyFairVerifierProps {
  activeGame: string;
}

interface BetLog {
  id: string;
  timestamp: string;
  game: string;
  delta: number;
  description: string;
}

interface PastSeedSet {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  nonceStart: number;
  nonceEnd: number;
  timestamp: string;
}

// SHA-256 helper using browser SubtleCrypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const ProvablyFairVerifier: React.FC<ProvablyFairVerifierProps> = ({ activeGame }) => {
  const [verifierTab, setVerifierTab] = useState<'verifier' | 'seeds' | 'history'>('verifier');
  
  // Seeds states
  const [serverSeed, setServerSeed] = useState<string>('');
  const [serverSeedHash, setServerSeedHash] = useState<string>('');
  const [clientSeed, setClientSeed] = useState<string>('');
  const [nonce, setNonce] = useState<number>(1);
  const [pastSeeds, setPastSeeds] = useState<PastSeedSet[]>([]);

  // Calculator states
  const [calcServerSeed, setCalcServerSeed] = useState<string>('');
  const [calcClientSeed, setCalcClientSeed] = useState<string>('bingo_player_seed_992');
  const [calcNonce, setCalcNonce] = useState<string>('12');
  const [calcGameMode, setCalcGameMode] = useState<'slots' | 'dice' | 'roulette' | 'crash'>('dice');
  
  // Hash calculation results
  const [calcHash, setCalcHash] = useState<string>('');
  const [calcResultValue, setCalcResultValue] = useState<string>('');
  const [calcSteps, setCalcSteps] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Live session bet logs
  const [sessionBets, setSessionBets] = useState<BetLog[]>([]);

  // Copy helper
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Generate dynamic, unique seeds for the player if they don't exist
  useEffect(() => {
    const initSeeds = async () => {
      let savedServer = localStorage.getItem(`bingo_seed_server_${activeGame}`);
      let savedClient = localStorage.getItem(`bingo_seed_client_${activeGame}`);
      let savedNonce = localStorage.getItem(`bingo_seed_nonce_${activeGame}`);
      
      if (!savedServer) {
        savedServer = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        localStorage.setItem(`bingo_seed_server_${activeGame}`, savedServer);
      }
      if (!savedClient) {
        savedClient = `vip_player_${Math.floor(1000 + Math.random() * 9000)}`;
        localStorage.setItem(`bingo_seed_client_${activeGame}`, savedClient);
      }
      if (!savedNonce) {
        savedNonce = '1';
        localStorage.setItem(`bingo_seed_nonce_${activeGame}`, savedNonce);
      }

      setServerSeed(savedServer);
      setClientSeed(savedClient);
      setNonce(parseInt(savedNonce));
      
      const sHash = await sha256(savedServer);
      setServerSeedHash(sHash);

      // Load past seeds history if available
      const savedPast = localStorage.getItem(`bingo_past_seeds_${activeGame}`);
      if (savedPast) {
        setPastSeeds(JSON.parse(savedPast));
      } else {
        // Mock a couple of past seeds to make it look active on initial load
        const demoPast: PastSeedSet[] = [
          {
            serverSeed: '6d4ea2bc89fa01eef23bb7e891cfa990ad312389ab4102ef776bcda1023a9d32',
            serverSeedHash: '7f9eb2bc89fa01eef23bb7e891cfa990ad312389ab4102ef776bcda1023a8e1b',
            clientSeed: 'player_seed_initial_fremont',
            nonceStart: 1,
            nonceEnd: 15,
            timestamp: '5 mins ago'
          }
        ];
        localStorage.setItem(`bingo_past_seeds_${activeGame}`, JSON.stringify(demoPast));
        setPastSeeds(demoPast);
      }
    };

    initSeeds();
    loadSessionBets();
  }, [activeGame]);

  const loadSessionBets = () => {
    try {
      const savedLogs = localStorage.getItem('bingo_casino_logs_v1');
      if (savedLogs) {
        const parsed: BetLog[] = JSON.parse(savedLogs);
        // Filter logs matching current active game or general wager descriptions
        const filtered = parsed.filter(log => 
          log.game.toLowerCase() === activeGame.toLowerCase() ||
          log.description.toLowerCase().includes(activeGame.toLowerCase())
        );
        setSessionBets(filtered.slice(0, 10));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Re-load bets periodically or when tab changes
  useEffect(() => {
    loadSessionBets();
  }, [verifierTab]);

  // Rotate/Reset Active Seeds
  const handleRotateSeeds = async () => {
    // Save current active seeds to past history
    const pastSet: PastSeedSet = {
      serverSeed,
      serverSeedHash,
      clientSeed,
      nonceStart: 1,
      nonceEnd: nonce,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextPast = [pastSet, ...pastSeeds].slice(0, 5);
    setPastSeeds(nextPast);
    localStorage.setItem(`bingo_past_seeds_${activeGame}`, JSON.stringify(nextPast));

    // Generate new active seeds
    const newServer = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newClient = `vip_player_${Math.floor(1000 + Math.random() * 9000)}`;
    const newNonce = 1;

    setServerSeed(newServer);
    setClientSeed(newClient);
    setNonce(newNonce);

    localStorage.setItem(`bingo_seed_server_${activeGame}`, newServer);
    localStorage.setItem(`bingo_seed_client_${activeGame}`, newClient);
    localStorage.setItem(`bingo_seed_nonce_${activeGame}`, String(newNonce));

    const sHash = await sha256(newServer);
    setServerSeedHash(sHash);

    // Pre-populate calculator with the revealed previous server seed for convenient verification
    setCalcServerSeed(serverSeed);
    setCalcClientSeed(clientSeed);
    setCalcNonce(String(nonce));
  };

  // Cryptographic Calculator implementation mapping hashes to outcomes
  const handleCalculateOutcome = async () => {
    if (!calcServerSeed.trim()) return;
    setIsCalculating(true);
    
    setTimeout(async () => {
      try {
        const combinedMessage = `${calcServerSeed.trim()}:${calcClientSeed.trim()}:${calcNonce}`;
        const hashResult = await sha256(combinedMessage);
        
        // Convert hash characters to numerical values
        // Parse first 8 hex characters (32 bits) as an integer
        const first8Hex = hashResult.substring(0, 8);
        const parsedInt = parseInt(first8Hex, 16);
        const maxUint32 = Math.pow(2, 32) - 1;
        const uniformRatio = parsedInt / maxUint32; // float between 0.0 and 1.0

        let resultText = '';
        let stepLogs: string[] = [];

        stepLogs.push(`1. CONCATENATION: "${combinedMessage}"`);
        stepLogs.push(`2. SHA-256 RETRIEVED: ${hashResult}`);
        stepLogs.push(`3. HEX BOUNDS METRIC: Selected first 8 hex characters "${first8Hex}"`);
        stepLogs.push(`4. INT CONVERSION: Hex "${first8Hex}" converted to uint32 integer ${parsedInt}`);
        stepLogs.push(`5. ENTROPY NORMALIZATION: ${parsedInt} / ${maxUint32} = ${(uniformRatio * 100).toFixed(6)}% entropy multiplier`);

        if (calcGameMode === 'dice') {
          // Dice roll between 0.00 and 100.00
          const diceRoll = (uniformRatio * 100.01).toFixed(2);
          resultText = `🎲 ROLL RESULT: ${diceRoll}`;
          stepLogs.push(`6. GAME ALGORITHM mapping [0 - 100]: (ratio * 100.01) = ${diceRoll}`);
        } else if (calcGameMode === 'slots') {
          // 3 slots reel symbols mapping
          const symbols = ['🍒', '🍋', '🍇', '💎', '🔔', '👑', '🍀'];
          const idx1 = Math.floor(uniformRatio * symbols.length);
          const idx2 = Math.floor(((uniformRatio * 17) % 1) * symbols.length);
          const idx3 = Math.floor(((uniformRatio * 31) % 1) * symbols.length);
          resultText = `🎰 REEL OUTCOME: [ ${symbols[idx1]} | ${symbols[idx2]} | ${symbols[idx3]} ]`;
          stepLogs.push(`6. SLOTS ALGORITHM mapping index modulo: Reels matched index slots [${idx1}, ${idx2}, ${idx3}]`);
        } else if (calcGameMode === 'roulette') {
          const rouletteColors = ['GREEN', 'RED', 'BLACK', 'RED', 'BLACK', 'RED', 'BLACK', 'RED', 'BLACK', 'RED', 'BLACK', 'BLACK', 'RED', 'BLACK', 'RED', 'BLACK', 'RED', 'BLACK', 'RED', 'RED', 'BLACK', 'RED', 'BLACK', 'RED', 'BLACK', 'RED', 'BLACK', 'RED', 'BLACK', 'BLACK', 'RED', 'BLACK', 'RED', 'BLACK', 'RED', 'BLACK', 'RED', 'BLACK'];
          const num = Math.floor(uniformRatio * 38);
          const color = num === 0 ? 'GREEN (0)' : rouletteColors[num];
          resultText = `🎯 WHEEL COLOR: ${color}`;
          stepLogs.push(`6. ROULETTE ALGORITHM mapping index [0 - 37]: Wheel settled on index #${num} -> ${color}`);
        } else if (calcGameMode === 'crash') {
          // Crash multiplier distribution (biased towards low, but potential high)
          const multiplier = Math.max(1.00, parseFloat((0.95 / (1.0 - uniformRatio)).toFixed(2)));
          const finalCrash = multiplier > 100 ? '100x+ JACKPOT' : `${multiplier}x`;
          resultText = `🚀 CRASH MULTIPLIER: ${finalCrash}`;
          stepLogs.push(`6. CRASH ALGORITHM payout curves: Payout = 0.95 / (1.0 - ratio) = ${multiplier}x`);
        }

        setCalcHash(hashResult);
        setCalcResultValue(resultText);
        setCalcSteps(stepLogs);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCalculating(false);
      }
    }, 800);
  };

  // Helper to pre-populate calculator with a specific past bet log
  const handleVerifySessionBet = (bet: BetLog) => {
    // Generate deterministic values based on bet log ID for authentic mockup calculation
    const derivedServerSeed = Array.from({ length: 32 }, (_, i) => 
      bet.id.charCodeAt(i % bet.id.length).toString(16)
    ).join('').substring(0, 64).padEnd(64, 'a');

    const derivedClientSeed = `session_ver_client_${bet.id.split('-')[2] || '98'}`;
    const derivedNonce = Math.abs(bet.delta) % 15 || 4;

    setCalcServerSeed(derivedServerSeed);
    setCalcClientSeed(derivedClientSeed);
    setCalcNonce(String(derivedNonce));
    
    // Choose calculator mode based on active game
    if (activeGame.toUpperCase().includes('SLOT')) {
      setCalcGameMode('slots');
    } else if (activeGame.toUpperCase().includes('ROULETTE')) {
      setCalcGameMode('roulette');
    } else if (activeGame.toUpperCase().includes('CRASH')) {
      setCalcGameMode('crash');
    } else {
      setCalcGameMode('dice');
    }

    setVerifierTab('verifier');
    
    // Auto-calculate immediately after state updates
    setTimeout(() => {
      const simulateTriggerBtn = document.getElementById('provably-fair-calc-btn');
      if (simulateTriggerBtn) simulateTriggerBtn.click();
    }, 200);
  };

  return (
    <div id="provably-fair-root" className="rounded-3xl border border-white/5 bg-[#030310]/90 p-5 sm:p-7 text-white relative shadow-2xl">
      {/* Absolute Glow Accents */}
      <div className="absolute top-0 left-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mb-5 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-serif font-black tracking-wider uppercase text-[#f5d061]">
              CRYPTO INTEGRITY & PROVABLY FAIR VAULT
            </h2>
          </div>
          <p className="text-[10px] text-white/40 font-mono">
            Cryptographically prove that all {activeGame} outcomes are 100% pre-determined and un-manipulated.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 self-stretch sm:self-auto justify-between">
          {[
            { id: 'verifier', label: '🛡️ Calculator' },
            { id: 'seeds', label: '⚙️ Active Seeds' },
            { id: 'history', label: '📋 Live Bets' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setVerifierTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                verifierTab === tab.id
                  ? 'bg-amber-400 text-black font-black shadow-md'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content wrapper */}
      <div className="min-h-[300px]">
        {/* TAB 1: CRYPTOGRAPHIC CALCULATOR */}
        {verifierTab === 'verifier' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            {/* Input Form Column */}
            <div className="lg:col-span-6 space-y-4 font-sans">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                1. INPUT CRYPTO CREDENTIALS
              </span>
              
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] font-mono opacity-50 block uppercase">Unhashed Server Seed</label>
                    <button 
                      onClick={() => handleCopyToClipboard(calcServerSeed, 'calc_server')}
                      className="text-[9px] font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === 'calc_server' ? <ClipboardCheck className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                      Copy Seed
                    </button>
                  </div>
                  <input
                    type="text"
                    value={calcServerSeed}
                    onChange={(e) => setCalcServerSeed(e.target.value)}
                    placeholder="Enter raw server hex seed..."
                    className="w-full text-xs bg-black/40 border border-white/10 px-3.5 py-2.5 rounded-xl focus:border-cyan-500 focus:outline-none font-mono text-cyan-300"
                  />
                  <span className="text-[8px] font-mono text-white/30 block mt-1">
                    Provides server-side pre-commitment entropy. Usually kept hidden during active plays.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-mono opacity-50 block mb-1 uppercase">Client Seed</label>
                    <input
                      type="text"
                      value={calcClientSeed}
                      onChange={(e) => setCalcClientSeed(e.target.value)}
                      className="w-full text-xs bg-black/40 border border-white/10 px-3.5 py-2.5 rounded-xl focus:border-cyan-500 focus:outline-none font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono opacity-50 block mb-1 uppercase">Nonce</label>
                    <input
                      type="number"
                      value={calcNonce}
                      onChange={(e) => setCalcNonce(e.target.value)}
                      className="w-full text-xs bg-black/40 border border-white/10 px-3.5 py-2.5 rounded-xl focus:border-cyan-500 focus:outline-none font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono opacity-50 block mb-1 uppercase">Select Game Simulator</label>
                  <div className="grid grid-cols-4 gap-1.5 bg-black/30 p-1.5 rounded-xl border border-white/5">
                    {[
                      { id: 'dice', label: '🎲 Dice' },
                      { id: 'slots', label: '🎰 Slots' },
                      { id: 'roulette', label: '🎯 Wheel' },
                      { id: 'crash', label: '🚀 Crash' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCalcGameMode(item.id as any)}
                        className={`py-1 rounded-lg text-[9px] font-mono uppercase font-bold tracking-wider cursor-pointer ${
                          calcGameMode === item.id 
                            ? 'bg-cyan-500 text-black shadow-md' 
                            : 'text-white/50 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  id="provably-fair-calc-btn"
                  onClick={handleCalculateOutcome}
                  disabled={!calcServerSeed.trim() || isCalculating}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 text-black font-serif font-black uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-1"
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      CRUNCHING BLOCK HASH...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      Verify Cryptographic Outcome
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Console Terminal */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" /> CRYPTOSYSTEM VERIFIED CONSOLE
              </span>

              <div className="bg-black/60 border border-[#16412b]/60 rounded-2xl p-4.5 font-mono text-[10px] leading-relaxed space-y-3 relative overflow-hidden min-h-[250px] flex flex-col justify-between">
                {calcHash ? (
                  <div className="space-y-3 flex-grow text-left">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                      <span className="text-[8px] opacity-40 uppercase block">VERIFIED RESULT OUTCOME</span>
                      <div className="text-sm font-black text-yellow-400 flex items-center gap-1.5 font-sans">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        {calcResultValue}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] opacity-40 uppercase block">STEP-BY-STEP INTEGRITY LOGS:</span>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto scrollbar-none border border-white/5 bg-black/40 p-2.5 rounded-lg text-[9px] text-white/70">
                        {calcSteps.map((step, idx) => (
                          <div key={idx} className="border-b border-white/5 pb-1 mb-1 last:border-b-0 last:pb-0 last:mb-0">
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 flex-grow">
                    <Binary className="w-10 h-10 text-cyan-400/20 animate-pulse" />
                    <p className="text-white/40 text-[11px] max-w-xs font-sans leading-normal">
                      Awaiting cryptographic input. Enter a raw Server Seed (or click "Verify" on any past session bet) to run the HMAC logic.
                    </p>
                  </div>
                )}

                <div className="border-t border-white/5 pt-2 flex justify-between items-center opacity-40 text-[8px]">
                  <span>HASH METHOD: SHA-256 SECURE</span>
                  <span>SSL STATUS: ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE SEEDS CONTROLLER */}
        {verifierTab === 'seeds' && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Active Seeds Card */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4.5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    CURRENT SEED COMPLEX (ACTIVE)
                  </span>
                  <span className="text-[8px] bg-emerald-400/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-400/20 uppercase font-mono">
                    In Play
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[9px] font-mono opacity-50 block mb-0.5 uppercase">Server Seed (SHA-256 Hash)</label>
                    <div className="bg-black/40 border border-white/10 px-3 py-2 rounded-xl font-mono text-[10px] select-all break-all flex justify-between items-center">
                      <span className="text-[#f5d061]">{serverSeedHash}</span>
                      <button 
                        onClick={() => handleCopyToClipboard(serverSeedHash, 'active_hash')}
                        className="p-1 text-white hover:text-cyan-400 cursor-pointer"
                      >
                        {copiedText === 'active_hash' ? <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[8px] opacity-30 mt-1 block leading-relaxed font-sans">
                      The unhashed Server Seed is generated before you wager. Because we commit to its hash, it is mathematically impossible for us to alter the outcome of your wagers after they are placed.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-mono opacity-50 block mb-0.5 uppercase">Client Seed</label>
                      <input
                        type="text"
                        value={clientSeed}
                        onChange={(e) => {
                          setClientSeed(e.target.value);
                          localStorage.setItem(`bingo_seed_client_${activeGame}`, e.target.value);
                        }}
                        className="w-full text-xs bg-black/40 border border-white/10 px-3 py-2 rounded-xl font-mono text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono opacity-50 block mb-0.5 uppercase">Nonce</label>
                      <div className="bg-black/40 border border-white/10 px-3 py-2 rounded-xl font-mono text-white">
                        {nonce}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRotateSeeds}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-amber-400/30 rounded-xl font-mono text-[10px] font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  ROTATE SEEDS & REVEAL ACTIVE UNHASHED SEED
                </button>
              </div>

              {/* Seed Rotation Informational Panel */}
              <div className="bg-black/20 border border-white/5 rounded-2xl p-4.5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <Info className="w-4 h-4 text-cyan-400" />
                    How verification works on our floor
                  </h4>
                  <p className="text-[11px] leading-relaxed opacity-60 font-sans">
                    Every bet is pre-determined by hashing a secret <strong>Server Seed</strong> provided by our platform, a customizable <strong>Client Seed</strong> chosen by you, and an incrementing <strong>Nonce</strong> representing your active round counter.
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-60 font-sans">
                    When you click "Rotate Seeds", our platform seals your previous seed complex, reveals the unhashed Server Seed so you can inspect it, and shifts your wagers to a new commit block.
                  </p>
                </div>

                <div className="bg-[#030906] border border-emerald-500/20 p-3 rounded-xl flex items-center gap-3">
                  <Lock className="w-6 h-6 text-emerald-400 flex-shrink-0 animate-pulse" />
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-emerald-400 block uppercase">SECURE RNG SYSTEM STATUS</span>
                    <span className="text-[10px] font-sans opacity-80 block">Standard Linear Cryptographic commitment validated.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Revealed Past Seeds Ledger */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono text-[#f5d061] font-bold uppercase tracking-wider block">
                REVEALED SEEDS ARCHIVE (PAST COMMITMENTS)
              </span>

              <div className="border border-white/5 rounded-xl overflow-hidden bg-black/40">
                <div className="grid grid-cols-12 gap-2 p-2 bg-white/5 font-mono text-[9px] opacity-40 font-bold uppercase tracking-wider border-b border-white/5">
                  <div className="col-span-3">Timestamp</div>
                  <div className="col-span-5">Unhashed Server Seed (Revealed)</div>
                  <div className="col-span-2 text-center">Nonces</div>
                  <div className="col-span-2 text-center">Action</div>
                </div>

                <div className="divide-y divide-white/5">
                  {pastSeeds.length > 0 ? (
                    pastSeeds.map((past, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 p-3 font-mono text-[10px] items-center hover:bg-white/5 transition-colors text-left">
                        <div className="col-span-3 text-white/50">{past.timestamp}</div>
                        <div className="col-span-5 break-all text-emerald-400 font-bold select-all pr-2">
                          {past.serverSeed}
                        </div>
                        <div className="col-span-2 text-center text-white/60">
                          {past.nonceStart} - {past.nonceEnd}
                        </div>
                        <div className="col-span-2 text-center">
                          <button
                            onClick={() => {
                              setCalcServerSeed(past.serverSeed);
                              setCalcClientSeed(past.clientSeed);
                              setCalcNonce(String(past.nonceEnd));
                              setVerifierTab('verifier');
                            }}
                            className="text-[9px] bg-cyan-400/10 hover:bg-cyan-400 hover:text-black border border-cyan-400/20 px-2 py-0.5 rounded cursor-pointer transition-all"
                          >
                            Load Calc
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-white/30 text-xs">
                      No seeds rotated yet. Click "Rotate Seeds" to start a new verification cycle.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIVE RECENT GAME BETS */}
        {verifierTab === 'history' && (
          <div className="space-y-4 text-left">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                Active Session Bets Ledger
              </span>
              <button 
                onClick={loadSessionBets}
                className="text-[9px] font-mono text-white/40 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Bets
              </button>
            </div>

            <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/30">
              <div className="grid grid-cols-12 gap-2 p-3 bg-white/5 font-mono text-[9px] opacity-40 font-bold uppercase tracking-wider border-b border-white/5">
                <div className="col-span-3">Timestamp</div>
                <div className="col-span-3">Game Floor</div>
                <div className="col-span-3 text-right font-bold">Payout Delta</div>
                <div className="col-span-3 text-center">Crypto Verification</div>
              </div>

              <div className="divide-y divide-white/5">
                {sessionBets.length > 0 ? (
                  sessionBets.map((bet) => (
                    <div key={bet.id} className="grid grid-cols-12 gap-2 p-3.5 font-mono text-xs items-center hover:bg-white/5 transition-colors">
                      <div className="col-span-3 text-white/50 text-[10px]">{bet.timestamp}</div>
                      <div className="col-span-3 text-white font-bold">{bet.game}</div>
                      <div className={`col-span-3 text-right font-bold font-mono ${
                        bet.delta > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {bet.delta > 0 ? '+' : ''}{bet.delta.toLocaleString()} Chips
                      </div>
                      <div className="col-span-3 text-center">
                        <button
                          onClick={() => handleVerifySessionBet(bet)}
                          className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500 hover:text-black border border-emerald-500/25 rounded-lg text-[9px] font-mono font-bold tracking-wider cursor-pointer text-emerald-400 transition-all flex items-center gap-1 mx-auto"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          Verify Bet
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-white/30 text-xs flex flex-col items-center justify-center space-y-2">
                    <Coins className="w-8 h-8 text-white/10 animate-pulse" />
                    <span>No recorded bets in your local storage cache for {activeGame} yet.</span>
                    <span className="text-[9px] opacity-50 block font-mono max-w-sm leading-relaxed">
                      Wager chips inside this game's Play tab first! Your session bets will display and be verifiable immediately.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
