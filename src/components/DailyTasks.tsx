import React, { useState } from 'react';
import { DailyTask } from '../types';
import { Check, Coins, Sparkles, Trophy, Calendar, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface DailyTasksProps {
  tasks: DailyTask[];
  onClaimTask: (taskId: string) => void;
  onAddTask?: (title: string, description: string, target: number, reward: number, icon: string) => void;
  onProgressTask?: (taskId: string, increment: number) => void;
}

export const DailyTasks: React.FC<DailyTasksProps> = ({ 
  tasks, 
  onClaimTask,
  onAddTask,
  onProgressTask
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTarget, setNewTarget] = useState(5);
  const [newReward, setNewReward] = useState(150);
  const [newIcon, setNewIcon] = useState('🌟');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;
    if (onAddTask) {
      onAddTask(newTitle, newDesc, newTarget, newReward, newIcon);
      setNewTitle('');
      setNewDesc('');
      setNewTarget(5);
      setNewReward(150);
      setNewIcon('🌟');
      setShowAddForm(false);
    }
  };
  return (
    <div className="bg-[#0a0a1f]/90 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-1 pb-1">
          <h3 className="text-sm font-semibold tracking-wider text-white/80 uppercase font-sans flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" /> Daily Casino Quests
          </h3>
          <span className="text-[9px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" /> RESETS DAILY
          </span>
        </div>
        <p className="text-[11px] text-white/50 mb-4 leading-relaxed">
          Complete Vegas-style challenges daily to bag simulated bonus chips!
        </p>
      </div>

      <div className="space-y-3.5 my-1">
        {tasks.map((task) => {
          const isCompleted = task.current >= task.target;
          const isClaimed = task.claimed;
          const progressPercent = Math.min(100, Math.round((task.current / task.target) * 100));

          return (
            <div
              key={task.id}
              className={`p-3 rounded-xl border transition-all ${
                isClaimed
                  ? 'bg-[#111126]/30 border-white/5 opacity-60'
                  : isCompleted
                  ? 'bg-amber-400/5 border-amber-400/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]'
                  : 'bg-white/5 border-white/5'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1.5">
                {/* Icon & Details */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xl flex-shrink-0" role="img" aria-label="task-icon">
                    {task.icon}
                  </span>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${isClaimed ? 'text-white/40 line-through' : 'text-white'}`}>
                      {task.title}
                    </span>
                    <span className="text-[10px] text-white/40 leading-tight">
                      {task.description}
                    </span>
                  </div>
                </div>

                {/* Progress Count / Reward tag */}
                <div className="text-right flex-shrink-0">
                  <div className="text-[10px] font-mono text-white/60 font-semibold">
                    {task.current} / {task.target}
                  </div>
                  <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400 justify-end mt-0.5">
                    <Coins className="w-3 h-3" />
                    +{task.reward}
                  </div>
                </div>
              </div>

              {/* Progress Slider Bar and Action Button */}
              <div className="flex items-center gap-4 mt-2">
                {/* Progress bar */}
                <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isClaimed
                        ? 'bg-zinc-500'
                        : isCompleted
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Button Action */}
                {isClaimed ? (
                  <button
                    disabled
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[10px] font-mono cursor-not-allowed uppercase"
                  >
                    <Check className="w-3 h-3" /> Claimed
                  </button>
                ) : isCompleted ? (
                  <button
                    onClick={() => onClaimTask(task.id)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-extrabold text-[10px] font-mono cursor-pointer uppercase shadow-md shadow-amber-400/20 hover:shadow-amber-400/40 active:scale-95 transition-all animate-pulse"
                  >
                    <Sparkles className="w-3 h-3 fill-current" /> Claim
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {onProgressTask && (
                      <button
                        onClick={() => onProgressTask(task.id, 1)}
                        className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-[10px] font-mono cursor-pointer transition-all"
                        title="Simulate / Advance Progress"
                      >
                        +1
                      </button>
                    )}
                    <button
                      disabled
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-white/30 font-semibold text-[10px] font-mono cursor-not-allowed uppercase"
                    >
                      Active
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Quest Accordion */}
      {onAddTask && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold text-xs flex justify-between items-center transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-sans">
              <Plus className="w-3.5 h-3.5 text-amber-400" /> Add Custom Quest
            </span>
            {showAddForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAddForm && (
            <form onSubmit={handleSubmit} className="mt-3 p-3 bg-[#111126]/40 rounded-xl border border-white/5 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono text-white/40 uppercase">Quest Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Slots Pro"
                    className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/40 uppercase">Icon</label>
                  <select
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                  >
                    <option value="🌟">🌟 Star</option>
                    <option value="🎰">🎰 Slots</option>
                    <option value="🎲">🎲 Dice</option>
                    <option value="👑">👑 Crown</option>
                    <option value="🏆">🏆 Trophy</option>
                    <option value="💎">💎 Diamond</option>
                    <option value="🍒">🍒 Cherry</option>
                    <option value="🎯">🎯 Target</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-white/40 uppercase">Quest Goal / Description</label>
                <input
                  type="text"
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Spin slots or roll dice"
                  className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono text-white/40 uppercase">Target Count</label>
                  <input
                    type="number"
                    min="1"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-white/40 uppercase">Chips Reward</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={newReward}
                    onChange={(e) => setNewReward(Math.max(10, parseInt(e.target.value) || 10))}
                    className="w-full bg-[#05050f] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-extrabold text-xs tracking-wider uppercase rounded-lg transition-all"
              >
                CREATE QUEST & ADD REWARD
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
