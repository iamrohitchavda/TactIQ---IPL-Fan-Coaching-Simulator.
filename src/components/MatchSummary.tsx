import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';
export default function MatchSummary() {
  const { overScores, reset, liveOvers } = useMatchStore();
  const [totalAnimated, setTotalAnimated] = useState(0);
  const [bestOver, setBestOver] = useState<{ num: number; score: number }>({ num: 1, score: 0 });
  const [selectedOver, setSelectedOver] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const totalScore = useMemo(
    () => overScores.reduce((sum, s) => sum + s.totalScore, 0),
    [overScores]
  );

  const avgAccuracy = useMemo(
    () => Math.round((totalScore / (overScores.length * 100)) * 100),
    [totalScore, overScores.length]
  );

  useEffect(() => {
    const maxOver = overScores.reduce(
      (best, s, i) => (s.totalScore > best.score ? { num: i + 1, score: s.totalScore } : best),
      { num: 1, score: 0 }
    );
    setBestOver(maxOver);
  }, [overScores]);

  // Animated score
  useEffect(() => {
    let current = 0;
    const target = totalScore;
    const interval = setInterval(() => {
      current += Math.ceil(target / 50);
      if (current >= target) {
        setTotalAnimated(target);
        clearInterval(interval);
      } else {
        setTotalAnimated(current);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [totalScore]);

  // Overall grade
  const overallGrade = useMemo(() => {
    const avg = totalScore / Math.max(1, overScores.length);
    if (avg >= 90) return { grade: 'S', color: 'text-accent-gold' };
    if (avg >= 75) return { grade: 'A', color: 'text-accent-green' };
    if (avg >= 60) return { grade: 'B', color: 'text-accent-blue' };
    if (avg >= 45) return { grade: 'C', color: 'text-accent-orange' };
    return { grade: 'D', color: 'text-accent-red' };
  }, [totalScore, overScores.length]);

  // Rank percentile
  const rankPct = useMemo(() => {
    const pct = 100 - (totalScore / (overScores.length * 100)) * 50;
    return Math.max(1, Math.round(Math.min(pct, 100)));
  }, [totalScore, overScores.length]);

  const rankLabel =
    rankPct <= 5
      ? 'Top 5% of coaches'
      : rankPct <= 15
        ? 'Top 15% of coaches'
        : rankPct <= 30
          ? 'Top 30% of coaches'
          : 'Above average coach';

  // Radar chart values
  const radarData = useMemo(() => {
    if (overScores.length === 0) return null;
    const ppOvers = overScores.slice(0, Math.min(6, overScores.length));
    const midOvers = overScores.slice(Math.min(6, overScores.length), Math.min(15, overScores.length));
    const deathOvers = overScores.slice(Math.min(15, overScores.length));
    const ppAvg =
      ppOvers.length > 0
        ? Math.round(ppOvers.reduce((s, o) => s + o.totalScore, 0) / ppOvers.length)
        : 0;
    const midAvg =
      midOvers.length > 0
        ? Math.round(midOvers.reduce((s, o) => s + o.totalScore, 0) / midOvers.length)
        : 0;
    const deathAvg =
      deathOvers.length > 0
        ? Math.round(deathOvers.reduce((s, o) => s + o.totalScore, 0) / deathOvers.length)
        : 0;
    const bowlAvg = Math.round(
      overScores.reduce((s, o) => s + o.bowlingScore, 0) / overScores.length
    );
    const bonusNorm = Math.min(100, Math.round(overScores.reduce((s, o) => s + o.bonusPoints, 0) * 10));

    return {
      powerplay: ppAvg,
      middle: midAvg,
      death: deathAvg,
      bowling: Math.round(bowlAvg * (100 / 40)),
      clutch: bonusNorm,
    };
  }, [overScores]);

  const handleCopy = () => {
    const text = `🏏 I scored ${totalScore}/2000 as Fan Coach\n${liveOvers[0]?.batsmanNonStrike || 'MI'} vs ${liveOvers[0]?.batsmanOnStrike || 'RCB'} • ${new Date().toLocaleDateString()}\nBest Over: Over ${bestOver.num} • Grade: ${overallGrade.grade}\nCan you beat me? → tactiq.app`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-accent-gold/20', text: 'text-accent-gold', border: 'border-accent-gold/30' };
    if (score >= 75) return { bg: 'bg-accent-green/20', text: 'text-accent-green', border: 'border-accent-green/30' };
    if (score >= 60) return { bg: 'bg-accent-blue/20', text: 'text-accent-blue', border: 'border-accent-blue/30' };
    if (score >= 45) return { bg: 'bg-accent-orange/20', text: 'text-accent-orange', border: 'border-accent-orange/30' };
    return { bg: 'bg-accent-red/20', text: 'text-accent-red', border: 'border-accent-red/30' };
  };

  // Show selected over details
  const selectedOverResult = selectedOver !== null ? overScores[selectedOver - 1] : null;
  const selectedOverData = selectedOver !== null ? liveOvers[selectedOver - 1] : null;

  return (
    <div className="min-h-screen bg-bg-primary py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-orbitron text-3xl font-bold text-white mb-2">MATCH COMPLETE</h1>
          <div className="inline-flex items-center gap-3 bg-bg-card border border-white/10 rounded-xl px-6 py-3">
            <span className="font-orbitron text-2xl text-accent-blue">{liveOvers[0]?.batsmanNonStrike || 'MI'}</span>
            <span className="font-orbitron text-4xl text-white font-bold">
              {liveOvers[liveOvers.length - 1]?.runningScore.runs || 217}
            </span>
            <span className="text-text-muted">/ {liveOvers[liveOvers.length - 1]?.runningScore.wickets || 6}</span>
          </div>
        </motion.div>

        {/* Coaching Record */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-card border border-white/10 rounded-xl p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
        >
          <div>
            <div className="font-orbitron text-3xl font-bold text-accent-gold">{totalAnimated}</div>
            <div className="font-outfit text-xs text-text-muted mt-1">Total / {overScores.length * 100}</div>
          </div>
          <div>
            <div className="font-orbitron text-3xl font-bold text-accent-green">
              {bestOver.score}
            </div>
            <div className="font-outfit text-xs text-text-muted mt-1">Best Over (Ov {bestOver.num})</div>
          </div>
          <div>
            <div className="font-orbitron text-3xl font-bold text-accent-blue">{avgAccuracy}%</div>
            <div className="font-outfit text-xs text-text-muted mt-1">Avg Accuracy</div>
          </div>
          <div>
            <div className="font-orbitron text-xl font-bold text-white">
              <span className={overallGrade.color}>{overallGrade.grade}</span>
            </div>
            <div className="font-outfit text-xs text-text-muted mt-1">National Rank</div>
            <div className="font-outfit text-[10px] text-accent-green">{rankLabel}</div>
          </div>
        </motion.div>

        {/* Over Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-card border border-white/10 rounded-xl p-4 mb-8"
        >
          <div className="font-orbitron text-xs text-text-muted tracking-wider mb-3">OVER TIMELINE</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {overScores.map((s, i) => {
              const gc = getGradeColor(s.totalScore);
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSelectedOver(i + 1)}
                  className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center ${gc.bg} border ${gc.border} transition-all ${
                    selectedOver === i + 1 ? 'ring-2 ring-accent-green' : ''
                  }`}
                >
                  <span className="font-orbitron text-[10px] text-text-muted">Ov {i + 1}</span>
                  <span className={`font-orbitron text-lg font-bold ${gc.text}`}>{s.totalScore}</span>
                  <span className={`font-orbitron text-[9px] ${gc.text}`}>{s.grade}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected over detail */}
        {selectedOverResult && selectedOverData && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-bg-elevated border border-white/10 rounded-xl p-4 mb-8"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-orbitron text-sm text-white">Over {selectedOver} Detail</span>
              <span className="font-outfit text-sm text-text-muted">{selectedOverData.overResult}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="font-outfit text-xs text-text-muted block">Bowler chosen (actual)</span>
                <span className="font-orbitron text-sm text-white">{selectedOverData.actualBowler}</span>
              </div>
              <div>
                <span className="font-outfit text-xs text-text-muted block">Score</span>
                <span className="font-orbitron text-lg font-bold text-accent-green">{selectedOverResult.totalScore}/100</span>
              </div>
              <div>
                <span className="font-outfit text-xs text-text-muted block">Grade</span>
                <span className={`font-orbitron text-lg font-bold ${getGradeColor(selectedOverResult.totalScore).text}`}>
                  {selectedOverResult.grade}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <span className="font-outfit text-xs text-text-muted block mb-1">Key Insight</span>
              <p className="font-outfit text-sm text-white">{selectedOverResult.keyInsight}</p>
            </div>
          </motion.div>
        )}

        {/* Radar Chart - CSS-based */}
        {radarData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-bg-card border border-white/10 rounded-xl p-6 mb-8"
          >
            <div className="font-orbitron text-xs text-text-muted tracking-wider mb-4">PERFORMANCE RADAR</div>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Powerplay\nAccuracy', value: radarData.powerplay, color: '#00FF87' },
                { label: 'Middle\nOvers', value: radarData.middle, color: '#00C2FF' },
                { label: 'Death\nAccuracy', value: radarData.death, color: '#FF6B00' },
                { label: 'Bowling\nInstinct', value: radarData.bowling, color: '#FFD700' },
                { label: 'Clutch\nCalls', value: radarData.clutch, color: '#FF3B5C' },
              ].map((axis, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="relative w-full aspect-square mb-1">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.05)" />
                      <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(255,255,255,0.05)" />
                      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="font-orbitron text-lg font-bold" fill={axis.color}>
                        {axis.value}
                      </text>
                    </svg>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, axis.value)}%`, background: axis.color }}
                    />
                  </div>
                  <span className="font-outfit text-[9px] text-text-muted text-center mt-1 leading-tight">
                    {axis.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-bg-card to-bg-elevated border border-white/10 rounded-xl p-6 mb-8"
        >
          <div className="font-orbitron text-lg font-bold text-accent-green mb-2">TactIQ</div>
          <div className="font-outfit text-sm text-white leading-relaxed mb-4">
            🏏 I scored {totalScore}/{overScores.length * 100} as Fan Coach<br />
            {liveOvers[0]?.batsmanNonStrike || 'MI'} vs {liveOvers[0]?.batsmanOnStrike || 'RCB'} •{' '}
            {new Date().toLocaleDateString()}<br />
            Best Over: Over {bestOver.num} ({bestOver.score}) • Grade: {overallGrade.grade}<br />
            Can you beat me? → tactiq.app
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="px-6 py-3 bg-accent-green/20 border border-accent-green text-accent-green font-orbitron text-sm font-bold rounded-xl hover:bg-accent-green/30 transition-all"
          >
            {copied ? '✓ COPIED!' : '📋 Copy Score Card'}
          </motion.button>
        </motion.div>

        {/* Play Again */}
        <div className="text-center pb-12">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="px-8 py-4 bg-white/5 border border-white/20 text-white font-orbitron font-bold rounded-xl hover:bg-white/10 transition-all tracking-wider"
          >
            COACH ANOTHER MATCH
          </motion.button>
        </div>
      </div>
    </div>
  );
}
