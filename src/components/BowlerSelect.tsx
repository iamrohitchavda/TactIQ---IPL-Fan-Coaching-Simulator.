import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';
import type { BowlerOption } from '../types';

interface BowlerSelectProps {
  options: BowlerOption[];
}

export default function BowlerSelect({ options }: BowlerSelectProps) {
  const { selectedBowler, selectBowler } = useMatchStore();

  const typeColor = (type: string) => {
    if (type === 'Fast') return { bg: '#FF3B5C22', text: '#FF3B5C', border: '#FF3B5C44', label: 'FAST' };
    if (type === 'Spin') return { bg: '#FFD70022', text: '#FFD700', border: '#FFD70044', label: 'SPIN' };
    return { bg: '#00C2FF22', text: '#00C2FF', border: '#00C2FF44', label: 'MEDIUM' };
  };

  return (
    <div className="bg-bg-card border border-white/10 rounded-xl p-4">
      <div className="text-xs font-orbitron text-text-muted tracking-wider mb-3">CHOOSE YOUR BOWLER</div>
      <div className="space-y-3">
        {options.map((bowler, idx) => {
          const tc = typeColor(bowler.type);
          const selected = selectedBowler === bowler.name;
          const maxCost = Math.max(...bowler.recentCosts, 1);
          const minCost = Math.min(...bowler.recentCosts);

          return (
            <motion.div
              key={bowler.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => selectBowler(bowler.name)}
              className={`relative p-3 rounded-xl border cursor-pointer transition-all ${
                selected
                  ? 'border-accent-green bg-accent-green/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              {selected && (
                <div className="absolute inset-0 rounded-xl border-2 border-accent-green/50" style={{ boxShadow: '0 0 15px rgba(0,255,135,0.2)' }} />
              )}
              <div className="flex items-center justify-between mb-2">
                <span className="font-outfit font-semibold text-sm text-white">{bowler.name}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-orbitron"
                  style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}
                >
                  {tc.label}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-text-muted font-outfit mb-2">
                <span>Eco: {bowler.economy}</span>
                <span>Wkts: {bowler.wickets}</span>
              </div>
              {/* Sparkline */}
              <svg width="100%" height="20" viewBox={`0 0 ${bowler.recentCosts.length * 20} 20`} className="opacity-50">
                <polyline
                  fill="none"
                  stroke={selected ? '#00FF87' : '#6B8CA8'}
                  strokeWidth="1.5"
                  points={bowler.recentCosts
                    .map((c, i) => `${i * 20 + 10},${20 - ((c - minCost) / (maxCost - minCost || 1)) * 16 - 2}`)
                    .join(' ')}
                />
                {bowler.recentCosts.map((c, i) => (
                  <circle
                    key={i}
                    cx={i * 20 + 10}
                    cy={20 - ((c - minCost) / (maxCost - minCost || 1)) * 16 - 2}
                    r="1.5"
                    fill={selected ? '#00FF87' : '#6B8CA8'}
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
