import { motion } from 'framer-motion';
import type { Over } from '../types';

interface ScoreboardProps {
  over: Over;
}

const ballColors: Record<string, string> = {
  '0': 'bg-gray-500',
  '1': 'bg-white text-black',
  '2': 'bg-white text-black',
  '3': 'bg-white text-black',
  '4': 'bg-accent-blue',
  '6': 'bg-yellow-400 text-black',
  W: 'bg-accent-red',
};

const ballSymbols: Record<string, string> = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '6': '6',
  W: 'W',
};

export default function Scoreboard({ over }: ScoreboardProps) {
  const phaseLabel =
    over.overNumber <= 6
      ? { text: 'POWERPLAY', color: 'bg-green-500/20 text-green-400 border-green-500/40' }
      : over.overNumber <= 15
        ? { text: 'MIDDLE OVERS', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' }
        : { text: 'DEATH', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' };

  const totalOvers = over.overNumber;

  return (
    <div className="space-y-4">
      {/* Scoreboard */}
      <div className="bg-bg-card border border-white/10 rounded-xl p-4">
        <div className="text-xs text-text-muted font-outfit mb-1">{over.batsmanNonStrike} batting first</div>
        <div className="flex items-end gap-3">
          <span className="font-orbitron text-4xl font-bold text-white">
            {over.runningScore.runs}
            <span className="text-2xl text-text-muted"> / {over.runningScore.wickets}</span>
          </span>
          <span className="font-orbitron text-lg text-text-muted mb-1">({totalOvers}.0 ov)</span>
        </div>
      </div>

      {/* Batsmen */}
      <div className="bg-bg-card border border-white/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-accent-gold text-sm">★</span>
            <span className="font-outfit font-semibold text-white">{over.batsmanOnStrike}</span>
          </div>
          <span className="font-orbitron text-sm text-accent-green">{over.strikerStats.strikeRate} SR</span>
        </div>
        <div className="flex items-center justify-between text-text-muted">
          <span className="font-outfit">{over.batsmanNonStrike}</span>
          <span className="font-orbitron text-sm">— SR</span>
        </div>
      </div>

      {/* This Over */}
      <div className="bg-bg-card border border-white/10 rounded-xl p-4">
        <div className="text-xs font-orbitron text-text-muted mb-3 tracking-wider">THIS OVER</div>
        <div className="flex gap-2">
          {over.overBalls.map((ball, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.1 + 0.3, type: 'spring', stiffness: 300, damping: 15 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-orbitron font-bold ${ballColors[ball] || 'border border-white/20 text-text-muted'}`}
            >
              {ballSymbols[ball] || '-'}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bowler */}
      <div className="bg-bg-card border border-white/10 rounded-xl p-4">
        <div className="text-xs font-orbitron text-text-muted mb-2 tracking-wider">BOWLER</div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-outfit font-semibold text-white">{over.actualBowler}</span>
            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-orbitron ${
              over.bowlerType === 'Fast' ? 'bg-accent-red/20 text-accent-red border border-accent-red/30' :
              over.bowlerType === 'Spin' ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' :
              'bg-accent-blue/20 text-accent-blue border border-accent-blue/30'
            }`}>
              {over.bowlerType}
            </span>
          </div>
          <div className="text-xs text-text-muted font-outfit">
            Eco: {over.bowlerOptions[0].economy} • Wkts: {over.bowlerOptions[0].wickets}
          </div>
        </div>
      </div>

      {/* Situation badge */}
      <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-orbitron font-bold tracking-wider border ${phaseLabel.color}`}>
        {phaseLabel.text}
      </div>
    </div>
  );
}
