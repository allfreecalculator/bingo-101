import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Coins, 
  Wallet, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  TrendingUp, 
  ChevronRight, 
  Clock, 
  AlertTriangle,
  Sparkles,
  DollarSign,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { PlayerProfile } from '../types';

interface CasinoCashierProps {
  profile: PlayerProfile;
  onUpdateChips: (amount: number, description?: string) => void;
  triggerAlert: (text: string, type?: 'success' | 'error' | 'info') => void;
  isDarkMode: boolean;
}

interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW';
  amount: number;
  fiatEquivalent: number;
  method: string;
  status: 'COMPLETED' | 'PROCESSING' | 'PENDING' | 'FAILED';
  date: string;
}

const DEPOSIT_PACKAGES = [
  { chips: 1000, price: 9.99, bonus: 0, tag: 'STARTER' },
  { chips: 5000, price: 39.99, bonus: 500, tag: 'POPULAR' },
  { chips: 15000, price: 99.99, bonus: 2500, tag: 'BEST_VALUE' },
  { chips: 50000, price: 299.99, bonus: 12500, tag: 'VIP_HIGH_ROLLER' }
];

export const CasinoCashier: React.FC<CasinoCashierProps> = ({
  profile,
  onUpdateChips,
  triggerAlert,
  isDarkMode
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [selectedPackage, setSelectedPackage] = useState<typeof DEPOSIT_PACKAGES[0]>(DEPOSIT_PACKAGES[1]);
  const [depositMethod, setDepositMethod] = useState<'card' | 'crypto' | 'bank'>('card');
  const [withdrawMethod, setWithdrawMethod] = useState<'usdt' | 'bank'>('usdt');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('500');
  const [withdrawAddress, setWithdrawAddress] = useState<string>('');

  // Transaction processing simulator state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingMsg, setProcessingMsg] = useState('');
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);

  // Card input states
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardHolder, setCardHolder] = useState(profile.name || 'JOHN DOE');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('***');

  const [txHistory, setTxHistory] = useState<Transaction[]>([]);

  // Initialize history
  useEffect(() => {
    const defaultTx: Transaction[] = [
      {
        id: 'TX-9824-D',
        type: 'DEPOSIT',
        amount: 2500,
        fiatEquivalent: 25.00,
        method: 'Visa Platinum',
        status: 'COMPLETED',
        date: getFormattedDate(3)
      },
      {
        id: 'TX-4122-W',
        type: 'WITHDRAW',
        amount: 800,
        fiatEquivalent: 8.00,
        method: 'USDT (TRC-20)',
        status: 'COMPLETED',
        date: getFormattedDate(2)
      },
      {
        id: 'TX-1052-D',
        type: 'DEPOSIT',
        amount: 1000,
        fiatEquivalent: 10.00,
        method: 'USDT Cryptopay',
        status: 'COMPLETED',
        date: getFormattedDate(1)
      }
    ];
    setTxHistory(defaultTx);
  }, []);

  function getFormattedDate(daysAgo = 0) {
    const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Simulate Deposit Pipeline
  const handleSimulateDeposit = () => {
    setIsProcessing(true);
    setProcessingStep(1);
    setSuccessTxn(null);
    setProcessingMsg('Initiating banking handshake protocol...');

    // Multi-stage simulated payment gateway
    setTimeout(() => {
      setProcessingStep(2);
      setProcessingMsg('Performing multi-factor anti-fraud audit (RNG safe)...');
    }, 1500);

    setTimeout(() => {
      setProcessingStep(3);
      setProcessingMsg(`Awaiting settlement block for ${selectedPackage.chips + selectedPackage.bonus} Chips...`);
    }, 3200);

    setTimeout(() => {
      const totalChips = selectedPackage.chips + selectedPackage.bonus;
      onUpdateChips(totalChips, `Deposited $${selectedPackage.price} package (+${totalChips} Chips)`);
      
      const newTx: Transaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}-D`,
        type: 'DEPOSIT',
        amount: totalChips,
        fiatEquivalent: selectedPackage.price,
        method: depositMethod === 'card' ? 'Visa Platinum' : depositMethod === 'crypto' ? 'USDT (Tether)' : 'Net Banking',
        status: 'COMPLETED',
        date: getFormattedDate(0)
      };

      setTxHistory(prev => [newTx, ...prev]);
      setSuccessTxn(newTx);
      setProcessingStep(4);
      setProcessingMsg('Transaction settled successfully!');
      triggerAlert(`Successfully deposited! Added ${totalChips.toLocaleString()} Chips!`, 'success');
    }, 5000);
  };

  // Simulate Withdrawal Pipeline
  const handleSimulateWithdrawal = () => {
    const parsedAmt = parseInt(withdrawAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      triggerAlert('Please enter a valid chip withdrawal quantity', 'error');
      return;
    }

    if (parsedAmt > profile.chips) {
      triggerAlert('Insufficient chips balance inside player wallet', 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(1);
    setSuccessTxn(null);
    setProcessingMsg('Validating VIP roll-over requirements...');

    // Multi-stage withdrawal pipeline
    setTimeout(() => {
      setProcessingStep(2);
      setProcessingMsg('Submitting transaction requests to test block network ledger...');
    }, 1500);

    setTimeout(() => {
      setProcessingStep(3);
      setProcessingMsg('Pending multi-sig approval node check...');
    }, 3000);

    setTimeout(() => {
      onUpdateChips(-parsedAmt, `Withdrew ${parsedAmt} chips as Cash Equivalent`);
      
      const fiatValue = parseFloat((parsedAmt / 100).toFixed(2));
      const newTx: Transaction = {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}-W`,
        type: 'WITHDRAW',
        amount: parsedAmt,
        fiatEquivalent: fiatValue,
        method: withdrawMethod === 'usdt' ? 'USDT (TRC-20)' : 'Instant Wire Transfer',
        status: 'COMPLETED',
        date: getFormattedDate(0)
      };

      setTxHistory(prev => [newTx, ...prev]);
      setSuccessTxn(newTx);
      setProcessingStep(4);
      setProcessingMsg('Withdrawal processed!');
      triggerAlert(`Withdrawal processed! ${parsedAmt.toLocaleString()} Chips deducted.`, 'success');
    }, 4800);
  };

  return (
    <div id="casino-cashier-root" className={`rounded-3xl border p-6 ${isDarkMode ? 'bg-[#030906]/85 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800'} shadow-xl relative`}>
      {/* Absolute Glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Cashier Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-dashed border-white/10 pb-5 mb-6">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-serif font-black tracking-wider uppercase text-yellow-400">
              CASHIER & TRANSACTION VAULT
            </h2>
          </div>
          <p className="text-xs opacity-50 font-mono mt-0.5">Secure, instant 1-Click chip ledger settlements</p>
        </div>

        {/* Action Tabs Selector */}
        <div className="flex items-center gap-1.5 bg-black/30 p-1.5 rounded-xl border border-white/5">
          {(['deposit', 'withdraw', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSuccessTxn(null);
                setIsProcessing(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-emerald-500 text-black'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'deposit' ? '📥 Deposit' : tab === 'withdraw' ? '📤 Withdraw' : '📋 History'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Panel Content with Loading Overlay */}
      <div className="relative min-h-[340px]">
        {/* Animated Processing Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#030906]/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center rounded-2xl"
            >
              {processingStep < 4 ? (
                <div className="space-y-4 max-w-sm">
                  <div className="relative h-16 w-16 mx-auto">
                    {/* Ring loader */}
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 animate-spin" />
                    <Coins className="absolute inset-4 w-8 h-8 text-yellow-400 animate-bounce" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 tracking-widest uppercase block animate-pulse">
                      PROCESSING SETTLEMENT...
                    </span>
                    <p className="text-xs font-semibold text-white/95">{processingMsg}</p>
                  </div>

                  {/* Stage bar dots */}
                  <div className="flex justify-center items-center gap-1.5 pt-2">
                    {[1, 2, 3].map((dot) => (
                      <div 
                        key={dot}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                          processingStep >= dot ? 'bg-emerald-400 scale-110' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-5 max-w-md"
                >
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">SETTLEMENT SUCCESSFUL!</h3>
                    <p className="text-xs text-white/70">
                      Your ledger balances have been completely adjusted in compliance with local regulations.
                    </p>
                  </div>

                  {successTxn && (
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-left space-y-1.5 font-mono text-[10px] max-w-xs mx-auto">
                      <div className="flex justify-between">
                        <span className="opacity-40">TX ID:</span>
                        <span className="font-bold text-white">{successTxn.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-40">TYPE:</span>
                        <span className="font-bold text-emerald-400">{successTxn.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-40">LEDGER AMT:</span>
                        <span className="font-bold text-yellow-400">+{successTxn.amount.toLocaleString()} Chips</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-40">FIAT CONV:</span>
                        <span className="font-bold text-white">${successTxn.fiatEquivalent.toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-40">METHOD:</span>
                        <span className="font-bold text-white">{successTxn.method}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setIsProcessing(false)}
                    className="px-6 py-2 bg-emerald-500 text-black text-xs font-serif font-black uppercase rounded-xl tracking-wider hover:bg-emerald-400 transition-all cursor-pointer"
                  >
                    Close Ledger Receipts
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: DEPOSIT PORTAL */}
        {activeTab === 'deposit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
            {/* Packages deck */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">
                1. Select Chip Allocation Package
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEPOSIT_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.tag}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`rounded-2xl p-4 border text-left cursor-pointer transition-all flex flex-col justify-between h-32 ${
                      selectedPackage.tag === pkg.tag
                        ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                        : 'border-white/5 bg-black/10 hover:border-white/10 hover:bg-black/20'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] font-mono font-black uppercase tracking-wider bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                          {pkg.tag.replace('_', ' ')}
                        </span>
                        {pkg.bonus > 0 && (
                          <span className="text-[8px] font-sans font-bold bg-amber-400 text-black px-1.5 py-0.5 rounded animate-pulse">
                            +{pkg.bonus} BONUS CHIPS
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-mono font-extrabold text-white mt-2 flex items-center gap-1">
                        {(pkg.chips + pkg.bonus).toLocaleString()} <span className="text-[10px] font-medium text-emerald-400">Chips</span>
                      </h4>
                    </div>

                    <div className="flex justify-between items-end text-xs pt-2 border-t border-white/5 mt-2">
                      <span className="opacity-40 text-[9px] font-mono">FIAT RATE</span>
                      <span className="font-bold text-yellow-400 font-mono">${pkg.price} USD</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment card parameters form */}
            <div className="lg:col-span-5 space-y-4 border-l border-dashed border-white/10 pl-0 lg:pl-6 max-lg:border-l-0 max-lg:pt-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">
                2. Settle Gateway Method
              </span>

              {/* Sub tabs method choice */}
              <div className="grid grid-cols-3 gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
                {(['card', 'crypto', 'bank'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDepositMethod(m)}
                    className={`py-1.5 rounded-lg text-[9px] font-mono uppercase tracking-widest transition-all cursor-pointer ${
                      depositMethod === m
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {m === 'card' ? '💳 Card' : m === 'crypto' ? '🪙 USDT' : '🏦 UPI'}
                  </button>
                ))}
              </div>

              {/* Dynamic form parameters based on depositMethod */}
              {depositMethod === 'card' && (
                <div className="space-y-3.5 text-xs font-sans">
                  {/* Visual card item */}
                  <div className="rounded-xl p-4 bg-gradient-to-br from-neutral-800 to-neutral-950 border border-white/10 text-white font-mono space-y-4 relative overflow-hidden">
                    <div className="absolute top-2 right-4 flex items-center gap-1 opacity-50">
                      <Lock className="w-3 h-3" />
                      <span className="text-[8px]">SSL SECURE</span>
                    </div>
                    <div className="text-[10px] tracking-widest">GATEWAY CREDIT</div>

                    <div className="text-sm font-bold tracking-widest pt-2">
                      {cardNumber}
                    </div>

                    <div className="flex justify-between text-[9px] opacity-75">
                      <div>
                        <span className="block text-[7px] opacity-40">CARD HOLDER</span>
                        {cardHolder}
                      </div>
                      <div>
                        <span className="block text-[7px] opacity-40">EXPIRY</span>
                        {cardExpiry}
                      </div>
                      <div>
                        <span className="block text-[7px] opacity-40">CVV</span>
                        {cardCvv}
                      </div>
                    </div>
                  </div>

                  {/* Form inputs */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] font-mono opacity-50 block uppercase mb-1">Card number</label>
                      <input 
                        type="text" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)} 
                        className="w-full text-xs bg-black/40 border border-white/10 px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none font-mono text-white" 
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-[9px] font-mono opacity-50 block uppercase mb-1">Holder Name</label>
                        <input 
                          type="text" 
                          value={cardHolder} 
                          onChange={(e) => setCardHolder(e.target.value)} 
                          className="w-full text-xs bg-black/40 border border-white/10 px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none text-white font-mono" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono opacity-50 block uppercase mb-1">CVV</label>
                        <input 
                          type="text" 
                          value={cardCvv} 
                          onChange={(e) => setCardCvv(e.target.value)} 
                          className="w-full text-xs bg-black/40 border border-white/10 px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none font-mono text-white" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {depositMethod === 'crypto' && (
                <div className="space-y-3.5 text-xs font-mono">
                  <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 text-center space-y-2.5">
                    <span className="text-[9px] font-black uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                      BLOCKCHAIN CRYPTO DISPENSARY
                    </span>
                    <p className="text-[11px] leading-relaxed opacity-80 text-left font-sans">
                      Send exactly <strong className="text-cyan-300 font-mono">${selectedPackage.price} USDT</strong> on the Tron Network (TRC-20) to this deposit address:
                    </p>

                    <div className="bg-black/40 border border-white/5 p-2 rounded-xl font-bold break-all select-all text-[10px] text-yellow-300">
                      TY8jWvH1kS9hF7B3g6mPnD1f8gKzP9L8uW
                    </div>

                    <span className="text-[9px] text-cyan-400/60 block">
                      RNG transactions settle within 1 node confirmations (~15s)
                    </span>
                  </div>
                </div>
              )}

              {depositMethod === 'bank' && (
                <div className="space-y-3.5 text-xs font-mono">
                  <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-4 text-center space-y-2.5">
                    <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      SECURE UPI / INSTANT BANK PORTAL
                    </span>
                    <p className="text-[11px] leading-relaxed opacity-80 text-left font-sans">
                      Deposit instantly via UPI. Scan or pay to the virtual casino ID:
                    </p>

                    <div className="bg-black/40 border border-white/5 p-2.5 rounded-xl font-bold select-all text-xs text-yellow-300">
                      bingo101pay@royalebank
                    </div>

                    <span className="text-[9px] text-amber-400/60 block">
                      Settle your fiat accounts in real-time.
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSimulateDeposit}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black font-serif font-black uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                💳 Settle {selectedPackage.price} USD & Credits
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: WITHDRAWAL PORTAL */}
        {activeTab === 'withdraw' && (
          <div className="max-w-xl mx-auto space-y-5 text-left">
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono opacity-50 block uppercase">AVAILABLE CHIPS FOR CASH-OUT</span>
                <span className="text-xl font-mono font-extrabold text-[#f5d061]">
                  {profile.chips.toLocaleString()} <span className="text-xs text-white/50 font-medium">Chips</span>
                </span>
              </div>
              <div className="text-right text-[10px] font-mono text-emerald-400/80">
                <span>Equivalent rate: 100 CHIPS = $1.00 USD</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">
                1. Select Withdrawal Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setWithdrawMethod('usdt')}
                  className={`rounded-2xl p-4 border text-left cursor-pointer transition-all ${
                    withdrawMethod === 'usdt'
                      ? 'border-cyan-500 bg-cyan-500/5'
                      : 'border-white/5 bg-black/10 hover:border-white/10'
                  }`}
                >
                  <div className="text-xs font-bold text-white mb-1">Tether USDT (TRC-20)</div>
                  <p className="text-[10px] opacity-50 font-sans leading-relaxed">Fast blockchain settlement. Direct to crypto wallets.</p>
                </div>

                <div
                  onClick={() => setWithdrawMethod('bank')}
                  className={`rounded-2xl p-4 border text-left cursor-pointer transition-all ${
                    withdrawMethod === 'bank'
                      ? 'border-amber-400 bg-amber-400/5'
                      : 'border-white/5 bg-black/10 hover:border-white/10'
                  }`}
                >
                  <div className="text-xs font-bold text-white mb-1">Instant Bank Transfer</div>
                  <p className="text-[10px] opacity-50 font-sans leading-relaxed">Direct bank wire. Settles inside standard business hours.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold mb-1.5">
                  2. Chips quantity to cash out
                </label>
                <div className="relative">
                  <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400" />
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter chips amount..."
                    className="w-full text-xs bg-black/40 border border-white/10 pl-10 pr-4 py-3 rounded-xl focus:border-emerald-500 focus:outline-none font-mono text-white"
                  />
                </div>
                <span className="text-[9px] font-mono opacity-40 mt-1 block">
                  Est. Cash Payout: ${(parseInt(withdrawAmount || '0') / 100).toFixed(2)} USD
                </span>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold mb-1.5">
                  3. Payout Destination ID
                </label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  placeholder={withdrawMethod === 'usdt' ? 'Enter TRC-20 address...' : 'Enter Bank Account IBAN/routing...'}
                  className="w-full text-xs bg-black/40 border border-white/10 px-4 py-3 rounded-xl focus:border-emerald-500 focus:outline-none font-mono text-white"
                />
              </div>
            </div>

            <button
              onClick={handleSimulateWithdrawal}
              className="w-full py-4 bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-amber-400/30 hover:border-amber-400 text-yellow-400 font-serif font-black uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer shadow-lg"
            >
              📤 Request Chip Liquid Transfer & Verification
            </button>
          </div>
        )}

        {/* TAB 3: TRANSACTION LEDGER HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3.5 text-left">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block font-bold">
              Archived Ledger Records (RNG Authenticated)
            </span>

            <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/20">
              <div className="grid grid-cols-12 gap-2 p-3 bg-white/5 font-mono text-[9px] opacity-40 font-bold uppercase tracking-wider border-b border-white/5">
                <div className="col-span-3">TX ID</div>
                <div className="col-span-2 text-center">Type</div>
                <div className="col-span-3 text-right">Chips Amount</div>
                <div className="col-span-2 text-right">Fiat Conversion</div>
                <div className="col-span-2 text-center">Status</div>
              </div>

              <div className="divide-y divide-white/5">
                {txHistory.map((txn) => (
                  <div key={txn.id} className="grid grid-cols-12 gap-2 p-3.5 font-mono text-xs items-center hover:bg-white/5 transition-colors">
                    <div className="col-span-3 text-white/50 text-[10px] font-bold">{txn.id}</div>
                    <div className="col-span-2 text-center">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                        txn.type === 'DEPOSIT' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-400/10 text-yellow-400 border-amber-400/20'
                      }`}>
                        {txn.type}
                      </span>
                    </div>
                    <div className="col-span-3 text-right font-bold text-white">
                      {txn.type === 'DEPOSIT' ? '+' : '-'}{txn.amount.toLocaleString()} Chips
                    </div>
                    <div className="col-span-2 text-right text-white/60">
                      ${txn.fiatEquivalent.toFixed(2)}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-[9px] text-emerald-400 flex items-center justify-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {txn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
