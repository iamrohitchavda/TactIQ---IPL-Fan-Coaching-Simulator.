import { motion } from 'framer-motion';
import type { Over } from '../types';
import { getPhaseAccent } from '../utils/phaseColors';

interface ScoreboardProps {
  over: Over;
  battingTeamName?: string;
}

const ballColors: Record<string, string> = {
  '0': 'bg-gray-500/80 text-white',
  '1': 'bg-white/90 text-black',
  '2': 'bg-white/90 text-black',
  '3': 'bg-white/90 text-black',
  '4': 'bg-accent-cyan/80 text-white',
  '6': 'bg-yellow-400/80 text-black',
  W: 'bg-accent-red/80 text-white',
};

const ballMap: Record<string, string> = {
  '0': '0', '1': '1', '2': '2', '3': '3',
  '4': '4', '6': '6', W: 'W',
};

export default function Scoreboard({ over, battingTeamName }: ScoreboardProps) {
  const accent = getPhaseAccent(over.overNumber);

  const overRuns = over.overBalls
    .filter((b) => b !== 'W')
    .reduce((sum, b) => sum + (parseInt(b, 10) || 0), 0);

  const wicketsInOver = over.overBalls.filter((b) => b === 'W').length;
  const fours = over.overBalls.filter((b) => b === '4').length;
  const sixes = over.overBalls.filter((b) => b === '6').length;

  return (
    <div className="space-y-3">
      {/* Score display */}
      <div className="glass-panel p-4 relative overflow-hidden">
        <div className="shimmer-overlay" />
        <div className="text-[9px] font-outfit text-text-muted tracking-wider mb-1 flex items-center gap-2">
          {battingTeamName && <span>{battingTeamName}</span>}
          <span className="w-1 h-1 rounded-full bg-white/[0.15]" />
          <span>BATTING</span>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex items-baseline gap-0">
            <span className="font-orbitron text-3xl sm:text-4xl font-black text-white tabular-nums">
              {over.runningScore.runs}
            </span>
            <span className="font-orbitron text-lg text-text-muted mx-1">/</span>
            <span className="font-orbitron text-2xl sm:text-3xl font-bold text-text-muted tabular-nums">
              {over.runningScore.wickets}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-orbitron text-xs text-text-dim tabular-nums">
              ({(over.overNumber - 1)}.{0} ov)
            </span>
          </div>
        </div>
      </div>

      {/* Phase badge + overs */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-orbitron font-bold tracking-wider border ${accent.border} ${accent.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${accent.text.replace('text-', 'bg-')}`} />
          <span className={accent.text}>{accent.label}</span>
          <span className="text-text-muted">•</span>
          <span className="text-white">OV {over.overNumber}</span>
        </div>
        <span className="font-outfit text-[10px] text-text-muted">
          {overRuns > 0 && <><span className="text-accent-green">{overRuns}</span> runs </>}
          {wicketsInOver > 0 && <><span className="text-accent-red">{wicketsInOver}</span> wkt </>}
        </span>
      </div>

      {/* Ball-by-ball */}
      <div className="glass-panel p-4">
        <div className="text-[10px] font-orbitron text-text-muted mb-3 tracking-wider">THIS OVER</div>
        <div className="flex gap-2 flex-wrap">
          {over.overBalls.map((ball, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.08 + 0.2, type: 'spring', stiffness: 300, damping: 15 }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-orbitron font-bold ${ballColors[ball] || 'border border-white/10 text-text-muted'}`}
            >
              {ballMap[ball] || '-'}
            </motion.div>
          ))}
        </div>
        {(fours > 0 || sixes > 0) && (
          <div className="flex gap-3 mt-2 text-[10px] font-outfit text-text-muted">
            {fours > 0 && <span>4s: <span className="text-accent-cyan">{fours}</span></span>}
            {sixes > 0 && <span>6s: <span className="text-yellow-400">{sixes}</span></span>}
          </div>
        )}
      </div>

      {/* Striker info */}
      <div className="glass-panel p-4">
        <div className="text-[10px] font-orbitron text-text-muted mb-2 tracking-wider">ON STRIKE</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent-gold/20 border border-accent-gold/30 flex items-center justify-center">
              <span className="text-accent-gold text-[10px]">★</span>
            </div>
            <span className="font-outfit text-sm font-semibold text-white">{over.batsmanOnStrike}</span>
          </div>
          <div className="text-right">
            <span className="font-orbitron text-xs text-accent-green">{over.strikerStats.strikeRate}</span>
            <span className="font-outfit text-[9px] text-text-muted ml-1">SR</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="font-outfit text-xs text-text-muted">{over.batsmanNonStrike}</span>
          </div>
          <span className="font-outfit text-[10px] text-text-dim">Non-striker</span>
        </div>
      </div>

      {/* Bowler */}
      <div className="glass-panel p-4">
        <div className="text-[10px] font-orbitron text-text-muted mb-2 tracking-wider">BOWLER</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-outfit text-sm font-semibold text-white">{over.actualBowler}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-orbitron ${
              over.bowlerType === 'Fast' ? 'bg-accent-red/15 text-accent-red border border-accent-red/20' :
              over.bowlerType === 'Spin' ? 'bg-yellow-400/15 text-yellow-400 border border-yellow-400/20' :
              'bg-accent-blue/15 text-accent-blue border border-accent-blue/20'
            }`}>
              {over.bowlerType}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
