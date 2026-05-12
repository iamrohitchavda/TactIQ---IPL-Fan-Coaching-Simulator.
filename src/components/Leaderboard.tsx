import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { fakeFanNames } from '../data/matchData';
import { useMatchStore } from '../store/matchStore';

interface LeaderboardProps {
  totalScore: number;
  overNumber: number;
  grade: string;
}

export default function Leaderboard({ totalScore, overNumber, grade }: LeaderboardProps) {
  const { user, liveCounter } = useMatchStore();

  const leaderboard = useMemo(() => {
    const entries = fakeFanNames.map((name) => ({
      name,
      score: Math.max(
        20,
        Math.min(100, totalScore + Math.floor((Math.random() - 0.5) * 60) + Math.floor(Math.random() * 20))
      ),
    }));
    entries.sort((a, b) => b.score - a.score);
    return entries.slice(0, 5);
  }, [totalScore, overNumber]);

  const userRank = useMemo(() => {
    const allScores = [...leaderboard.map((e) => e.score), totalScore];
    allScores.sort((a, b) => b - a);
    const rank = allScores.indexOf(totalScore) + 1;
    const total = allScores.length;
    return Math.max(1, Math.floor((rank / total) * (liveCounter * 0.01)));
  }, [leaderboard, totalScore, liveCounter]);

  const totalFans = Math.max(2000, liveCounter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8 }}
      className="bg-bg-card border border-white/10 rounded-xl p-4 mb-8"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🏆</span>
        <span className="font-orbitron text-xs text-text-muted tracking-wider">LEADERBOARD</span>
      </div>
      <div className="space-y-2">
        {leaderboard.map((entry, i) => (
          <div
            key={entry.name}
            className="flex items-center justify-between py-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-xs text-text-muted w-5">{i + 1}.</span>
              <span className="font-outfit text-sm text-white">{entry.name}</span>
            </div>
            <span className="font-orbitron text-sm text-white">{entry.score}</span>
          </div>
        ))}
        {/* User */}
        <div className="border-t border-white/10 pt-2 mt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-orbitron text-xs text-accent-green w-5">★</span>
              <span className="font-outfit text-sm text-accent-green">{user?.username || 'You'}</span>
            </div>
            <span className="font-orbitron text-sm text-accent-green font-bold">{totalScore}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <p className="font-outfit text-xs text-text-muted">
          You are{' '}
          <span className="font-orbitron text-accent-green">
            #{userRank.toLocaleString()}
          </span>{' '}
          of {totalFans.toLocaleString()} fans
        </p>
        {grade === 'S' && (
          <p className="font-outfit text-xs text-accent-gold mt-1">Top 1% of coaches this over!</p>
        )}
      </div>
    </motion.div>
  );
}
