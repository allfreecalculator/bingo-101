import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Users, Shield, MessageSquare, ChevronRight, Minimize2, HelpCircle, Sparkles, Smile, Flame } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  vipTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'GUEST';
  content: string;
  timestamp: string;
  avatar: string;
  isCurrentUser?: boolean;
}

const CHAT_TEMPLATES = [
  { content: "OMG BINGO FULL HOUSE JUST HIT! 🎟️🔥", weight: 3 },
  { content: "Is anyone hitting good multipliers on Rocket Crash? I got 12x", weight: 2 },
  { content: "Cyber Wilds slots are absolutely printing tonight! 🎰🚀", weight: 2 },
  { content: "Just reached GOLD tier VIP! Reload bonus feels good.", weight: 3 },
  { content: "Double down on Vegas 21 worked, dealer busted! 🃏🃏", weight: 2 },
  { content: "Plinko ball hit the 100x slot! No way! 🎉🎯", weight: 3 },
  { content: "Limbo is so fast-paced, i set 5x and got it on 3rd spin", weight: 2 },
  { content: "Who wants to send me a tip? Just kidding, GL everyone!", weight: 1 },
  { content: "Anyone tried the Dice game? What is your strategy?", weight: 2 },
  { content: "Zen Sakura is so relaxing, visual design is 10/10", weight: 2 },
  { content: "RTP on Mines is verified. Just cleared 5 mines and cashed out! 💣", weight: 3 },
  { content: "Just triggered the Mini Jackpot earlier! Easiest 18k chips of my life 🤑", weight: 2 }
];

const BOT_PLAYERS = [
  { name: 'VegasKing_77', vip: 'DIAMOND', avatar: '👑' },
  { name: 'SpinQueen', vip: 'GOLD', avatar: '🌸' },
  { name: 'PlinkoPro', vip: 'PLATINUM', avatar: '🎯' },
  { name: 'DoubleDown_Ace', vip: 'SILVER', avatar: '🃏' },
  { name: 'LuckyCharm_🍀', vip: 'BRONZE', avatar: '✨' },
  { name: 'CyberStrike', vip: 'PLATINUM', avatar: '⚡' },
  { name: 'Minesweeper9', vip: 'GOLD', avatar: '💣' },
  { name: 'JackpotJoe', vip: 'GOLD', avatar: '💰' },
  { name: 'RouletteRider', vip: 'SILVER', avatar: '🎡' },
  { name: 'CosmicClimber', vip: 'DIAMOND', avatar: '🚀' }
] as const;

export const LiveCommunityChat: React.FC<{ 
  isDarkMode: boolean; 
  profileName: string;
  profileLevel: number;
  vipTier: string;
  avatar: string;
}> = ({ isDarkMode, profileName, profileLevel, vipTier, avatar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [activeMembers, setActiveMembers] = useState(148);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with some default mock conversations
  useEffect(() => {
    const defaultMessages: ChatMessage[] = [
      {
        id: 'msg-1',
        sender: 'VegasKing_77',
        vipTier: 'DIAMOND',
        content: "Welcome to the Bingo101 Casino lobby! Best luck tonight fellas! 🍀🍾",
        timestamp: getFormattedTime(4),
        avatar: '👑'
      },
      {
        id: 'msg-2',
        sender: 'SpinQueen',
        vipTier: 'GOLD',
        content: "Thanks! Slots have been very nice to me the last 30 minutes.",
        timestamp: getFormattedTime(3),
        avatar: '🌸'
      },
      {
        id: 'msg-3',
        sender: 'LuckyCharm_🍀',
        vipTier: 'BRONZE',
        content: "What is the best slot machine to play right now? Zen Sakura or Cyber Wilds?",
        timestamp: getFormattedTime(2),
        avatar: '✨'
      },
      {
        id: 'msg-4',
        sender: 'CyberStrike',
        vipTier: 'PLATINUM',
        content: "Definitely Cyber Wilds, the volatility is insane but payouts are worth it!",
        timestamp: getFormattedTime(1),
        avatar: '⚡'
      }
    ];
    setMessages(defaultMessages);

    // Minor fluctuations in active chatters
    const chatterTimer = setInterval(() => {
      setActiveMembers(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3));
    }, 8000);

    return () => clearInterval(chatterTimer);
  }, []);

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Periodically ingest new simulated bot message
  useEffect(() => {
    const botTimer = setInterval(() => {
      // Pick a random bot
      const bot = BOT_PLAYERS[Math.floor(Math.random() * BOT_PLAYERS.length)];
      const msgTemplate = CHAT_TEMPLATES[Math.floor(Math.random() * CHAT_TEMPLATES.length)];

      const newMsg: ChatMessage = {
        id: `bot-msg-${Date.now()}`,
        sender: bot.name,
        vipTier: bot.vip as any,
        content: msgTemplate.content,
        timestamp: getFormattedTime(0),
        avatar: bot.avatar
      };

      setMessages(prev => [...prev.slice(-49), newMsg]); // Keep last 50
    }, 12000); // Send message every 12 seconds

    return () => clearInterval(botTimer);
  }, []);

  function getFormattedTime(minusMinutes = 0) {
    const date = new Date(Date.now() - minusMinutes * 60000);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  // Handle user sending message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: profileName || 'You (Player)',
      vipTier: (vipTier === 'VIP' ? 'GOLD' : 'GUEST') as any,
      content: userInput.trim(),
      timestamp: getFormattedTime(0),
      avatar: avatar || '👤',
      isCurrentUser: true
    };

    setMessages(prev => [...prev, userMsg]);
    const sentText = userInput.trim().toLowerCase();
    setUserInput('');

    // Trigger funny simulated AI/bot reactions back to the user within 1-2 seconds
    setTimeout(() => {
      let botResponse = '';
      let respondingBot = BOT_PLAYERS[Math.floor(Math.random() * BOT_PLAYERS.length)];

      if (sentText.includes('hi') || sentText.includes('hello') || sentText.includes('hey')) {
        botResponse = `Hey there ${profileName}! Welcome to the VIP Lounge chat! GL! 🍀`;
      } else if (sentText.includes('win') || sentText.includes('lose') || sentText.includes('chips')) {
        botResponse = `I just won some chips on Crash! Hope you get a 100x payout today!`;
      } else if (sentText.includes('best game') || sentText.includes('what to play') || sentText.includes('recommend')) {
        const games = ['Classic Bingo', 'Rocket Crash', 'Mines Floor', 'Pharaoh Gold Slots', 'Zen Sakura'];
        const chosen = games[Math.floor(Math.random() * games.length)];
        botResponse = `You should definitely try "${chosen}"! It's super hot right now! 🔥`;
      } else if (sentText.includes('jackpot') || sentText.includes('progressive')) {
        botResponse = `The Grand Jackpot is nearly 1.5M chips now, whoever hits it is going to be rich 👑`;
      } else if (sentText.includes('how are you') || sentText.includes('how\'s it going')) {
        botResponse = `Doing great! Just watching the wins roll in on the ticker. You?`;
      } else {
        const replies = [
          `Good luck ${profileName}! Let's cash out big!`,
          `Totally agree. Hope the RNG gods are with us! ✨`,
          `Haha true! Good luck on your next game! 🎮`,
          `Wow, nice one! Play safe, guys.`
        ];
        botResponse = replies[Math.floor(Math.random() * replies.length)];
      }

      const botMsg: ChatMessage = {
        id: `bot-reply-${Date.now()}`,
        sender: respondingBot.name,
        vipTier: respondingBot.vip as any,
        content: botResponse,
        timestamp: getFormattedTime(0),
        avatar: respondingBot.avatar
      };

      setMessages(prev => [...prev, botMsg]);
    }, 1500 + Math.random() * 1000);
  };

  const getVipBadgeColor = (tier: string) => {
    switch (tier) {
      case 'DIAMOND': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'PLATINUM': return 'bg-slate-300/10 text-purple-300 border-purple-500/20';
      case 'GOLD': return 'bg-amber-400/20 text-yellow-400 border-amber-400/30 font-black';
      case 'SILVER': return 'bg-slate-400/10 text-slate-300 border-slate-400/20';
      case 'BRONZE': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-white/5 text-white/50 border-white/10';
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          id="toggle-community-chat"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-3 rounded-full font-serif font-bold text-xs uppercase tracking-wider cursor-pointer shadow-2xl border transition-all ${
            isOpen 
              ? 'bg-red-500 border-red-500/40 text-white' 
              : isDarkMode 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300/30 shadow-[0_5px_15px_rgba(245,158,11,0.3)]' 
                : 'bg-[#122b1f] text-[#f5d061] border-[#1f4834]'
          }`}
        >
          <MessageSquare className="w-4 h-4 animate-pulse" />
          <span>{isOpen ? 'Close Chat' : '💬 Community Chat'}</span>
          <span className="bg-black/10 px-1.5 py-0.5 rounded text-[10px] text-white">
            {activeMembers}
          </span>
        </motion.button>
      </div>

      {/* Side Slide-Out Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="community-chat-panel"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className={`fixed top-24 right-4 z-40 w-full max-w-sm h-[calc(100vh-180px)] rounded-3xl border flex flex-col overflow-hidden shadow-2xl backdrop-blur-md transition-all duration-300 ${
              isDarkMode 
                ? 'bg-[#050906]/95 border-emerald-500/20 text-white' 
                : 'bg-white/95 border-slate-200 text-slate-800'
            }`}
          >
            {/* Chat Room Header */}
            <div className={`p-4 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <h4 className="text-xs font-serif font-black tracking-wider uppercase text-yellow-400 flex items-center gap-1">
                    LIVE LOBBY DISCUSSION <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                  </h4>
                  <p className="text-[10px] opacity-50 flex items-center gap-1 font-mono">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
                    {activeMembers} Online players chatting
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Stream Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  id={`chat-msg-row-${msg.id}`}
                  className={`flex gap-2 text-xs items-start ${msg.isCurrentUser ? 'flex-row-reverse' : ''}`}
                >
                  {/* Sender Avatar */}
                  <span className="text-lg select-none p-1 bg-white/5 rounded-lg border border-white/5 leading-none">
                    {msg.avatar}
                  </span>

                  {/* Message bubble */}
                  <div className={`flex flex-col max-w-[80%] ${msg.isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold ${msg.isCurrentUser ? 'text-amber-400' : 'text-white/80'}`}>
                        {msg.sender}
                      </span>
                      <span className={`text-[8px] px-1 rounded border scale-90 ${getVipBadgeColor(msg.vipTier)}`}>
                        {msg.vipTier}
                      </span>
                      <span className="text-[8px] opacity-35 font-mono">{msg.timestamp}</span>
                    </div>

                    <div 
                      className={`mt-1 p-2.5 rounded-2xl text-xs text-left leading-relaxed ${
                        msg.isCurrentUser 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-tr-none shadow-md' 
                          : isDarkMode 
                            ? 'bg-[#101b13] border border-[#1d3525] text-slate-100 rounded-tl-none' 
                            : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Action Input footer */}
            <form onSubmit={handleSendMessage} className={`p-3 border-t flex gap-2 ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.substring(0, 120))}
                  placeholder="Ask a recommendation or say hello..."
                  className={`w-full text-xs rounded-xl pl-3.5 pr-8 py-2.5 border transition-all ${
                    isDarkMode 
                      ? 'bg-black/40 border-white/10 text-white placeholder-white/30 focus:border-amber-400 focus:bg-black/70' 
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setUserInput(prev => prev + " 🎰🔥")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 text-xs"
                  title="Emoji shortcut"
                >
                  🔥
                </button>
              </div>

              <button
                type="submit"
                className={`p-2.5 rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all flex items-center justify-center ${
                  isDarkMode ? 'bg-[#d4af37] text-[#030906]' : 'bg-[#122b1f] text-[#f5d061]'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
