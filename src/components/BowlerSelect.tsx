import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';
import type { BowlerOption } from '../types';
import { speak } from '../services/audioFx';

interface BowlerSelectProps {
  options: BowlerOption[];
}

const typeConfig: Record<string, { bg: string; text: string; border: string; label: string }> = {
  Fast: { bg: 'bg-accent-red/10', text: 'text-accent-red', border: 'border-accent-red/20', label: 'FAST' },
  Spin: { bg: 'bg-yellow-400/10', text: 'text-yellow-400', border: 'border-yellow-400/20', label: 'SPIN' },
  'Fast-Medium': { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', border: 'border-accent-cyan/20', label: 'MEDIUM' },
};

export default function BowlerSelect({ options }: BowlerSelectProps) {
  const { selectedBowler, selectBowler } = useMatchStore();

  return (
    <div className="glass-panel p-4">
      <div className="text-[10px] font-orbitron text-text-muted tracking-wider mb-3">
        PICK YOUR BOWLER
      </div>
      <div className="space-y-2.5">
        {options.map((bowler, idx) => {
          const tc = typeConfig[bowler.type] || typeConfig['Fast-Medium'];
          const selected = selectedBowler === bowler.name;
          const maxCost = Math.max(...bowler.recentCosts, 1);
          const minCost = Math.min(...bowler.recentCosts);

          return (
            <motion.div
              key={bowler.name}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => {
                selectBowler(bowler.name);
                speak(`${bowler.name} selected`, { rate: 1.0, pitch: 1.1 });
              }}
              className={`relative p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                selected
                  ? 'border-accent-green/40 bg-accent-green/8'
                  : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              {selected && (
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(0,255,157,0.3), 0 0 20px rgba(0,255,157,0.1)' }}
                />
              )}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {selected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-accent-green text-sm"
                    >
                      ✓
                    </motion.span>
                  )}
                  <span className="font-outfit font-semibold text-sm text-white">{bowler.name}</span>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-orbitron ${tc.bg} ${tc.text} ${tc.border}`}>
                  {tc.label}
                </span>
              </div>
              <div className="flex gap-3 text-[11px] text-text-muted font-outfit">
                <span>Eco: <span className="text-white/80">{bowler.economy}</span></span>
                <span>Wkts: <span className="text-white/80">{bowler.wickets}</span></span>
              </div>
              {/* Sparkline */}
              <svg width="100%" height="16" viewBox={`0 0 ${bowler.recentCosts.length * 20} 16`} className="mt-1 opacity-40">
                <polyline
                  fill="none"
                  stroke={selected ? '#00FF9D' : '#556677'}
                  strokeWidth="1.2"
                  points={bowler.recentCosts
                    .map((c, i) => `${i * 20 + 10},${14 - ((c - minCost) / (maxCost - minCost || 1)) * 12}`)
                    .join(' ')}
                />
                {bowler.recentCosts.map((c, i) => (
                  <circle
                    key={i}
                    cx={i * 20 + 10}
                    cy={14 - ((c - minCost) / (maxCost - minCost || 1)) * 12}
                    r="1.5"
                    fill={selected ? '#00FF9D' : '#556677'}
                  />
                ))}
              </svg>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
