import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'What is Bingo 101 and how do I learn standard 75-Ball rules?',
    answer: 'Bingo 101 is a simulated social casino and learning academy. Standard 75-Ball Bingo uses a 5x5 grid with numbers 1 to 75. To learn full ticket patterns (Horizontal lines, Corners, Letter X, Plus signs, or Blackout), you can open our built-in interactive "Bingo 101 Academy" using the book icon in the lobby header.'
  },
  {
    question: 'How do I claim free chips when my wallet runs dry?',
    answer: 'We offer multiple free ways to claim chips under the "Earn Chips" category: claim our hourly faucet, spin the Golden Lucky Wheel, crack open free Scratchers, or complete your Daily Tasks listed in the rewards board.'
  },
  {
    question: 'What is "Auto Daub" and how does it help?',
    answer: 'Auto Daub automatically stamps matching called numbers on all your active tickets instantly. This is highly useful when playing multiple cards at high calling speeds so you never miss a winning combination.'
  },
  {
    question: 'Can I play with real money or cash out chips?',
    answer: 'No. Bingo 101 Casino is 100% simulated for entertainment and instructional purposes. All chip balances, prizes, levels, and wagers are entirely digital and hold no real-world monetary value.'
  }
];

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div id="faq-section" className="space-y-4">
      <div className="flex justify-between items-center text-left">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" /> Casino Academy & FAQ
          </h3>
          <p className="text-[10px] text-white/40 font-mono uppercase">Get quick help on mechanics, odds, and floor rules</p>
        </div>
      </div>

      <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-3xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="border-b border-white/5 last:border-none pb-3 last:pb-0"
            >
              <button
                type="button"
                id={`faq-toggle-${idx}`}
                onClick={() => toggle(idx)}
                className="w-full flex justify-between items-center py-2.5 text-left text-xs font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-amber-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/40" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[11px] text-white/50 leading-relaxed pt-1.5 pb-2 text-left">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
