import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';

export default function MatchSummary() {
  const { overScores, reset, liveOvers, matchContext } = useMatchStore();
  const [totalAnimated, setTotalAnimated] = useState(0);
  const bestOver = useMemo(() => {
    return overScores.reduce(
      (best, s, i) => (s.totalScore > best.score ? { num: i + 1, score: s.totalScore } : best),
      { num: 1, score: 0 }
    );
  }, [overScores]);
  const [selectedOver, setSelectedOver] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const totalScore = useMemo(
    () => overScores.reduce((sum, s) => sum + s.totalScore, 0),
    [overScores]
  );

  const avgAccuracy = useMemo(
    () => overScores.length > 0 ? Math.round(totalScore / (overScores.length * 100) * 100) : 0,
    [totalScore, overScores.length]
  );

  // Animated total score
  useEffect(() => {
    let current = 0;
    const target = totalScore;
    const interval = setInterval(() => {
      current += Math.max(1, Math.ceil(target / 40));
      if (current >= target) {
        setTotalAnimated(target);
        clearInterval(interval);
      } else {
        setTotalAnimated(current);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [totalScore]);

  const overallGrade = useMemo(() => {
    const avg = totalScore / Math.max(1, overScores.length);
    if (avg >= 90) return { grade: 'S', color: 'text-accent-gold' };
    if (avg >= 75) return { grade: 'A', color: 'text-accent-green' };
    if (avg >= 60) return { grade: 'B', color: 'text-accent-cyan' };
    if (avg >= 45) return { grade: 'C', color: 'text-accent-orange' };
    return { grade: 'D', color: 'text-accent-red' };
  }, [totalScore, overScores.length]);

  const rankPct = useMemo(() => {
    const pct = 100 - (totalScore / (overScores.length * 100)) * 50;
    return Math.max(1, Math.round(Math.min(pct, 100)));
  }, [totalScore, overScores.length]);

  const rankLabel = rankPct <= 5 ? 'Top 5%' : rankPct <= 15 ? 'Top 15%' : rankPct <= 30 ? 'Top 30%' : 'Above Average';

  // Radar chart
  const radarData = useMemo(() => {
    if (overScores.length === 0) return null;
    const ppOvers = overScores.slice(0, Math.min(6, overScores.length));
    const midOvers = overScores.slice(Math.min(6, overScores.length), Math.min(15, overScores.length));
    const deathOvers = overScores.slice(Math.min(15, overScores.length));
    const ppAvg = ppOvers.length > 0 ? Math.round(ppOvers.reduce((s, o) => s + o.totalScore, 0) / ppOvers.length) : 0;
    const midAvg = midOvers.length > 0 ? Math.round(midOvers.reduce((s, o) => s + o.totalScore, 0) / midOvers.length) : 0;
    const deathAvg = deathOvers.length > 0 ? Math.round(deathOvers.reduce((s, o) => s + o.totalScore, 0) / deathOvers.length) : 0;
    const bowlAvg = overScores.length > 0 ? Math.round(overScores.reduce((s, o) => s + o.bowlingScore, 0) / overScores.length) : 0;
    const bonusNorm = Math.min(100, Math.round(overScores.reduce((s, o) => s + o.bonusPoints, 0) * 10));

    return { powerplay: ppAvg, middle: midAvg, death: deathAvg, bowling: Math.round(bowlAvg * (100 / 40)), clutch: bonusNorm };
  }, [overScores]);

  const getGradeColor = (score: number) => {
    if (score >= 90) return { bg: 'bg-accent-gold/15', text: 'text-accent-gold', border: 'border-accent-gold/20' };
    if (score >= 75) return { bg: 'bg-accent-green/15', text: 'text-accent-green', border: 'border-accent-green/20' };
    if (score >= 60) return { bg: 'bg-accent-cyan/15', text: 'text-accent-cyan', border: 'border-accent-cyan/20' };
    if (score >= 45) return { bg: 'bg-accent-orange/15', text: 'text-accent-orange', border: 'border-accent-orange/20' };
    return { bg: 'bg-accent-red/15', text: 'text-accent-red', border: 'border-accent-red/20' };
  };

  const handleCopy = () => {
    const team1 = matchContext?.team1.short || liveOvers[0]?.batsmanNonStrike || 'MI';
    const team2 = matchContext?.team2.short || liveOvers[0]?.batsmanOnStrike || 'RCB';
    const totalPossible = overScores.length * 100;
    const text = [
      `🏏 TactIQ Match Report`,
      `${team1} vs ${team2}`,
      `Score: ${totalScore}/${totalPossible}  •  Grade: ${overallGrade.grade}`,
      `Best Over: Over ${bestOver.num} (${bestOver.score})  •  Avg: ${avgAccuracy}%`,
      `Rank: ${rankLabel}`,
      `Can you beat me? → play tactiq`,
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Last over for score display
  const lastOver = liveOvers[liveOvers.length - 1];
  const firstOver = liveOvers[0];

  return (
    <div className="min-h-screen bg-bg-primary py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mb-2">MATCH COMPLETE</h1>
          <div className="inline-flex items-center gap-3 glass-panel px-6 py-3">
            <span className="font-orbitron text-lg text-accent-cyan">{matchContext?.team1.short || firstOver?.batsmanNonStrike || 'Team 1'}</span>
            <div className="flex items-baseline gap-1">
              <span className="font-orbitron text-3xl font-black text-white tabular-nums">
                {lastOver?.runningScore.runs || 0}
              </span>
              <span className="font-orbitron text-lg text-text-muted">/</span>
              <span className="font-orbitron text-xl font-bold text-text-muted tabular-nums">
                {lastOver?.runningScore.wickets || 0}
              </span>
            </div>
            <span className="text-text-dim text-xs font-orbitron">OV {lastOver?.overNumber || 20}</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel p-6 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
        >
          <div>
            <div className="font-orbitron text-2xl sm:text-3xl font-bold text-accent-gold tabular-nums">{totalAnimated}</div>
            <div className="font-outfit text-[10px] text-text-muted mt-1">Total / {overScores.length * 100}</div>
          </div>
          <div>
            <div className="font-orbitron text-2xl sm:text-3xl font-bold text-accent-green tabular-nums">{bestOver.score}</div>
            <div className="font-outfit text-[10px] text-text-muted mt-1">Best (Ov {bestOver.num})</div>
          </div>
          <div>
            <div className="font-orbitron text-2xl sm:text-3xl font-bold text-accent-cyan tabular-nums">{avgAccuracy}%</div>
            <div className="font-outfit text-[10px] text-text-muted mt-1">Avg Accuracy</div>
          </div>
          <div>
            <div className={`font-orbitron text-2xl sm:text-3xl font-bold ${overallGrade.color}`}>{overallGrade.grade}</div>
            <div className="font-outfit text-[10px] text-text-muted mt-1">{rankLabel}</div>
          </div>
        </motion.div>

        {/* Over Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-4 mb-8"
        >
          <div className="font-orbitron text-[10px] text-text-muted tracking-wider mb-3">OVER TIMELINE</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {overScores.map((s, i) => {
              const gc = getGradeColor(s.totalScore);
              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedOver(selectedOver === i + 1 ? null : i + 1)}
                  className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center ${gc.bg} border ${gc.border} transition-all ${
                    selectedOver === i + 1 ? 'ring-1 ring-accent-green' : ''
                  }`}
                >
                  <span className="font-orbitron text-[9px] text-text-muted">Ov {i + 1}</span>
                  <span className={`font-orbitron text-base font-bold ${gc.text} tabular-nums`}>{s.totalScore}</span>
                  <span className={`font-orbitron text-[8px] ${gc.text}`}>{s.grade}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Selected over detail */}
        {selectedOver !== null && overScores[selectedOver - 1] && liveOvers[selectedOver - 1] && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-panel p-4 mb-8 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-orbitron text-xs text-white">Over {selectedOver} Detail</span>
              <span className="font-outfit text-xs text-text-muted">{liveOvers[selectedOver - 1].overResult}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="font-outfit text-[10px] text-text-muted block">Bowler</span>
                <span className="font-orbitron text-sm text-white">{liveOvers[selectedOver - 1].actualBowler}</span>
              </div>
              <div>
                <span className="font-outfit text-[10px] text-text-muted block">Score</span>
                <span className="font-orbitron text-lg font-bold text-accent-green tabular-nums">{overScores[selectedOver - 1].totalScore}/100</span>
              </div>
              <div>
                <span className="font-outfit text-[10px] text-text-muted block">Grade</span>
                <span className={`font-orbitron text-lg font-bold ${getGradeColor(overScores[selectedOver - 1].totalScore).text}`}>
                  {overScores[selectedOver - 1].grade}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <span className="font-outfit text-[10px] text-text-muted block mb-1">Insight</span>
              <p className="font-outfit text-xs text-white/80">{overScores[selectedOver - 1].keyInsight}</p>
            </div>
          </motion.div>
        )}

        {/* Performance Radar */}
        {radarData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-panel p-5 mb-8"
          >
            <div className="font-orbitron text-[10px] text-text-muted tracking-wider mb-4">PERFORMANCE BREAKDOWN</div>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'PP\nAccuracy', value: radarData.powerplay, color: '#00FF9D' },
                { label: 'Middle\nOvers', value: radarData.middle, color: '#00D9FF' },
                { label: 'Death\nOvers', value: radarData.death, color: '#FF6B35' },
                { label: 'Bowling\nInstinct', value: radarData.bowling, color: '#FFD700' },
                { label: 'Clutch\nCalls', value: radarData.clutch, color: '#8B5CF6' },
              ].map((axis, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="relative w-full aspect-square mb-1">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.04)" />
                      <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.04)" />
                      <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(255,255,255,0.04)" />
                      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="font-orbitron text-lg font-bold" fill={axis.color}>
                        {axis.value}
                      </text>
                    </svg>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, axis.value)}%`, background: axis.color }} />
                  </div>
                  <span className="font-outfit text-[8px] text-text-muted text-center mt-1 leading-tight whitespace-pre-line">
                    {axis.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel-strong p-6 mb-8 text-center"
        >
          <div className="font-orbitron text-sm font-bold text-accent-green mb-3">TactIQ</div>
          <div className="font-outfit text-xs text-white/70 leading-relaxed mb-4">
            🏏 Scored {totalScore}/{overScores.length * 100} as Fan Coach<br />
            {matchContext?.team1.short || firstOver?.batsmanNonStrike || 'Team'} vs {matchContext?.team2.short || firstOver?.batsmanOnStrike || 'Team'}<br />
            Best: Over {bestOver.num} ({bestOver.score}) • Grade: {overallGrade.grade}<br />
            Rank: {rankLabel}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopy}
            className="px-6 py-3 bg-accent-green/10 border border-accent-green/30 text-accent-green font-orbitron text-xs font-bold rounded-xl hover:bg-accent-green/20 transition-all"
          >
            {copied ? '✓ COPIED!' : '📋 Copy Score Card'}
          </motion.button>
        </motion.div>

        {/* Play Again */}
        <div className="text-center pb-12">
          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(0,255,157,0.15)' }}
            whileTap={{ scale: 0.97 }}
            onClick={reset}
            className="px-8 py-4 bg-white/[0.03] border border-white/[0.08] text-white font-orbitron font-bold rounded-2xl hover:bg-white/[0.06] transition-all tracking-[0.05em]"
          >
            COACH ANOTHER MATCH
          </motion.button>
        </div>
      </div>
    </div>
  );
}
