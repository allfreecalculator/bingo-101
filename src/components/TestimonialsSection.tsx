import React from 'react';
import { MessageSquare, Star } from 'lucide-react';

interface Testimonial {
  name: string;
  avatar: string;
  role: string;
  comment: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'LadyLuck_777',
    avatar: '🍒',
    role: 'VIP Legend Rank',
    comment: 'I love the customizable card calling speeds! Being able to dial the caller up to hyper speed with Auto-Daub is an absolute blast.',
    rating: 5
  },
  {
    name: 'Vegas_Viper',
    avatar: '🐍',
    role: 'Elite Cards Veteran',
    comment: 'The Video Poker and Blackjack are tuned perfectly. No lag, crisp sound feedback, and the stats tracker keeps me perfectly informed of my performance!',
    rating: 5
  },
  {
    name: 'Bingo_Baron',
    avatar: '🎩',
    role: 'Vegas Regular',
    comment: 'The interactive Bingo 101 Academy clarified card pattern checking for me. It is the perfect training floor before jumping onto the real tables.',
    rating: 5
  }
];

export const TestimonialsSection: React.FC = () => {
  return (
    <div id="testimonials-section" className="space-y-4">
      <div className="flex justify-between items-center text-left">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" /> Guest Testimonials
          </h3>
          <p className="text-[10px] text-white/40 font-mono uppercase">Read authentic feedback from regular high-stakes players</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, idx) => (
          <div
            key={idx}
            className="p-5 bg-[#0a0a1f]/80 border border-white/5 rounded-3xl flex flex-col justify-between space-y-4 shadow-xl backdrop-blur-md relative overflow-hidden text-left"
          >
            {/* Glowing decoration */}
            <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/5 rounded-full blur-lg pointer-events-none" />

            <div className="space-y-3">
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-current" />
                ))}
              </div>

              {/* Comment text */}
              <p className="text-[11px] text-white/70 leading-relaxed italic">
                "{t.comment}"
              </p>
            </div>

            {/* Author profile */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/5">
              <span className="text-2xl filter drop-shadow select-none">{t.avatar}</span>
              <div>
                <h5 className="text-xs font-bold text-white">{t.name}</h5>
                <span className="text-[9px] font-mono text-white/30 uppercase">{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
