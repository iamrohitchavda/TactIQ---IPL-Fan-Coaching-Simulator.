import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { fakeFanNames } from '../data/matchData';
import { useMatchStore } from '../store/matchStore';

interface LeaderboardProps {
  totalScore: number;
  overNumber: number;
  grade: string;
}

interface Entry {
  name: string;
  score: number;
}

function seededRand(seed: number): number {
  const x = Math.sin(seed * 9973 + 49297) * 49297;
  return x - Math.floor(x);
}

export default function Leaderboard({ totalScore, overNumber, grade }: LeaderboardProps) {
  const { user, liveCounter } = useMatchStore();

  const leaderboard = useMemo<Entry[]>(() => {
    const entries: Entry[] = fakeFanNames.map((name, i) => {
      const s = overNumber * 1000 + totalScore;
      return {
        name,
        score: Math.max(20, Math.min(100, totalScore + Math.floor((seededRand(s + i * 7) - 0.5) * 60) + Math.floor(seededRand(s + i * 13) * 20))),
      };
    });
    entries.sort((a, b) => b.score - a.score);
    return entries.slice(0, 5);
  }, [totalScore, overNumber]);

  const userRank = (() => {
    const allScores = [...leaderboard.map((e) => e.score), totalScore];
    allScores.sort((a, b) => b - a);
    const rank = allScores.indexOf(totalScore) + 1;
    const total = allScores.length;
    return Math.max(1, Math.floor((rank / total) * (liveCounter * 0.01)));
  })();

  const totalFans = Math.max(2000, liveCounter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="glass-panel p-4 mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent-gold text-base">🏆</span>
        <span className="font-orbitron text-[10px] text-text-muted tracking-wider">LEADERBOARD</span>
      </div>
      <div className="space-y-1.5">
        {leaderboard.map((entry, i) => (
          <div key={entry.name} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-[11px] text-text-dim w-5">{i + 1}.</span>
              <span className="font-outfit text-sm text-white">{entry.name}</span>
            </div>
            <span className="font-orbitron text-sm text-white/80">{entry.score}</span>
          </div>
        ))}
        <div className="border-t border-white/[0.06] pt-2 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-[11px] text-accent-green w-5">★</span>
              <span className="font-outfit text-sm text-accent-green font-semibold">{user?.username || 'You'}</span>
            </div>
            <span className="font-orbitron text-sm text-accent-green font-bold">{totalScore}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/[0.04] text-center">
        <p className="font-outfit text-[11px] text-text-muted">
          Rank{' '}
          <span className="font-orbitron text-accent-green font-bold">#{userRank.toLocaleString()}</span>
          {' '}of {totalFans.toLocaleString()} fans
        </p>
        {grade === 'S' && (
          <p className="font-outfit text-[11px] text-accent-gold mt-1">Top 1% of coaches this over!</p>
        )}
      </div>
    </motion.div>
  );
}
