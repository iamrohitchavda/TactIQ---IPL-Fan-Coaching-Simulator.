import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';
import { iplFacts } from '../data/matchData';
import { getOverAnalysis } from '../services/claudeApi';
import { speak } from '../services/audioFx';
import Ground from './Ground';
import Leaderboard from './Leaderboard';
import type { AnalysisResult } from '../types';

const gradeColors: Record<string, string> = {
  S: 'text-accent-gold bg-accent-gold/15 border-accent-gold/30',
  A: 'text-accent-green bg-accent-green/15 border-accent-green/30',
  B: 'text-accent-cyan bg-accent-cyan/15 border-accent-cyan/30',
  C: 'text-accent-orange bg-accent-orange/15 border-accent-orange/30',
  D: 'text-accent-red bg-accent-red/15 border-accent-red/30',
  F: 'text-accent-red bg-accent-red/20 border-accent-red/40',
};

export default function OverResult() {
  const {
    currentOverIndex,
    fanPlacements,
    selectedBowler,
    overScores,
    revealResult,
    nextOver,
    liveOvers,
  } = useMatchStore();

  const over = liveOvers[currentOverIndex];
  const hasStoredAnalysis = !!overScores[currentOverIndex];
  const storedAnalysis = overScores[currentOverIndex] ?? null;

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(storedAnalysis);
  const [loading, setLoading] = useState(!hasStoredAnalysis);
  const [capsDeciding, setCapsDeciding] = useState(!hasStoredAnalysis);
  const [factIndex, setFactIndex] = useState(0);
  const [fakeSubmitCount, setFakeSubmitCount] = useState(0);
  const [ballReveal, setBallReveal] = useState(0);
  const [wordReveal, setWordReveal] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [exitDone, setExitDone] = useState(false);
  // 10-second auto-redirect countdown
  const [nextOverCountdown, setNextOverCountdown] = useState(10);
  const [countdownActive, setCountdownActive] = useState(false);
  const confettiRef = useRef(false);
  const mountedRef = useRef(true);
  const scoreAnimRef = useRef(false);
  const spokenNextRef = useRef(false);

  // Fetch analysis if not already stored
  const fetchAndReveal = useCallback(async () => {
    if (!over || !mountedRef.current) return;
    setLoading(true);
    console.log('Fetching analysis for over', over.overNumber);

    const timeoutId = setTimeout(() => {
      if (!mountedRef.current) return;
      console.log('Analysis timeout - using fallback');
      const fallback: AnalysisResult = {
        fieldScore: 0, bowlingScore: 0, bonusPoints: 0, totalScore: 0,
        matchedPositions: [], missedPositions: [],
        commentary: 'Analysis timed out. Moving on!',
        keyInsight: 'Quick decisions matter in cricket.',
        grade: 'D',
      };
      setAnalysis(fallback);
      revealResult(fallback);
      setLoading(false);
    }, 10000);

    try {
      const result = await getOverAnalysis({
        overNumber: over.overNumber,
        matchSituation: over.matchSituation,
        batsmanName: over.batsmanOnStrike,
        strikerSR: over.strikerStats.strikeRate,
        weakness: over.strikerStats.weaknesses,
        pitchCondition: over.pitchCondition,
        fanPlacements,
        fanBowler: selectedBowler || '',
        fanBowlerType: over.bowlerOptions.find((b) => b.name === selectedBowler)?.type || '',
        actualPlacements: over.actualFieldPlacements,
        actualBowler: over.actualBowler,
        overResult: over.overResult,
      });

      clearTimeout(timeoutId);
      if (!mountedRef.current) return;
      console.log('Analysis complete:', result);
      setAnalysis(result);
      revealResult(result);
      setLoading(false);
    } catch (err) {
      clearTimeout(timeoutId);
      if (!mountedRef.current) return;
      console.error('Analysis failed:', err);
      const errorResult: AnalysisResult = {
        fieldScore: 0, bowlingScore: 0, bonusPoints: 0, totalScore: 0,
        matchedPositions: [], missedPositions: [],
        commentary: 'Error during analysis.',
        keyInsight: 'Technical glitch. Your effort is recorded!',
        grade: 'D',
      };
      setAnalysis(errorResult);
      revealResult(errorResult);
      setLoading(false);
    }
  }, [over, fanPlacements, selectedBowler, revealResult]);

  // Initialize: captain deciding phase + fetch
  useEffect(() => {
    mountedRef.current = true;
    if (!hasStoredAnalysis) {
      const factTimer = setInterval(() => setFactIndex((p) => (p + 1) % iplFacts.length), 2500);
      const submitTimer = setInterval(() => setFakeSubmitCount((p) => p + Math.floor(Math.random() * 40) + 10), 500);

      const capsTimer = setTimeout(() => {
        if (!mountedRef.current) return;
        setCapsDeciding(false);
        clearInterval(factTimer);
        clearInterval(submitTimer);
        fetchAndReveal();
      }, 4000);

      return () => {
        mountedRef.current = false;
        clearTimeout(capsTimer);
        clearInterval(factTimer);
        clearInterval(submitTimer);
      };
    }
  }, [currentOverIndex, hasStoredAnalysis, fetchAndReveal]);

  // Ball-by-ball reveal
  useEffect(() => {
    if (!capsDeciding && !loading && analysis && over) {
      const t = setTimeout(() => {
        if (ballReveal < over.overBalls.length) setBallReveal((p) => p + 1);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [capsDeciding, loading, analysis, ballReveal, over]);

  // Word-by-word analysis reveal
  useEffect(() => {
    if (analysis && !capsDeciding && !loading) {
      const words = (analysis.commentary + ' ' + analysis.keyInsight).split(' ');
      if (wordReveal < words.length) {
        const t = setTimeout(() => setWordReveal((p) => p + 1), 40);
        return () => clearTimeout(t);
      }
    }
  }, [analysis, capsDeciding, loading, wordReveal]);

  // Score counter animation
  useEffect(() => {
    if (!analysis || capsDeciding || loading || scoreAnimRef.current) return;
    scoreAnimRef.current = true;
    let current = 0;
    const target = analysis.totalScore;
    const interval = setInterval(() => {
      current += Math.max(1, Math.ceil(target / 25));
      if (current >= target) {
        setDisplayScore(target);
        clearInterval(interval);
      } else {
        setDisplayScore(current);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [analysis, capsDeciding, loading]);

  // Confetti effect
  useEffect(() => {
    if (!analysis || capsDeciding || loading || confettiRef.current) return;
    confettiRef.current = true;
    if (analysis.totalScore >= 80) {
      try {
        (window as unknown as { confetti?: (opts: Record<string, unknown>) => void }).confetti?.({ particleCount: 100, spread: 60, origin: { y: 0.5 } });
      } catch {
        // Confetti unavailable
      }
    }
  }, [analysis, capsDeciding, loading]);

  const handleNext = useCallback(() => {
    setExitDone(true);
    console.log('Overlay removed');
    setTimeout(() => {
      if (currentOverIndex >= 19) {
        useMatchStore.getState().setPhase('summary');
      } else {
        nextOver();
      }
    }, 100);
  }, [currentOverIndex, nextOver]);

  const isLastOver = currentOverIndex >= 19;

  // Start 10s countdown once analysis is loaded and score animation started
  useEffect(() => {
    if (!analysis || capsDeciding || loading) return;
    // Give the score animation 1.8s to finish before starting countdown
    const startTimer = setTimeout(() => {
      setCountdownActive(true);
    }, 2000);
    return () => clearTimeout(startTimer);
  }, [analysis, capsDeciding, loading]);

  // Countdown tick
  useEffect(() => {
    if (!countdownActive) return;
    if (nextOverCountdown <= 0) {
      handleNext();
      return;
    }
    // Speak at 3s mark
    if (nextOverCountdown === 3 && !spokenNextRef.current) {
      spokenNextRef.current = true;
      const msg = isLastOver ? 'Match complete! Viewing final results.' : 'Moving to the next over!';
      speak(msg, { rate: 1.0, pitch: 1.1 });
    }
    const t = setTimeout(() => setNextOverCountdown((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [countdownActive, nextOverCountdown, handleNext, isLastOver]);


  const fScore = analysis?.fieldScore ?? 0;
  const bScore = analysis?.bowlingScore ?? 0;
  const bonus = analysis?.bonusPoints ?? 0;
  const totalScore = analysis?.totalScore ?? 0;
  const grade = analysis?.grade ?? 'D';

  // Captain deciding phase overlay
  if (capsDeciding) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="fixed inset-0 z-50 bg-bg-primary flex flex-col items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-accent-green/[0.02] to-transparent pointer-events-none" />
          <div className="text-center px-4 relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-5xl mb-4"
            >
              👑
            </motion.div>
            <h2 className="font-orbitron text-lg text-accent-green mb-2">Pat Cummins is setting the field</h2>
            <div className="flex gap-1.5 justify-center mb-5">
              <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
            <p className="font-outfit text-text-muted text-sm mb-5">
              {fakeSubmitCount.toLocaleString()} fans have submitted their tactics
            </p>
            <div className="w-64 h-1.5 bg-white/[0.06] rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-accent-green rounded-full animate-progress-bar" />
            </div>
            <div className="mt-8 max-w-sm mx-auto">
              <p className="font-outfit text-text-muted text-[10px] italic mb-1">Did you know?</p>
              <p className="font-outfit text-white/80 text-xs">{iplFacts[factIndex]}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!analysis || exitDone) return null;

  const commentaryWords = analysis.commentary.split(' ');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%', transition: { duration: 0.3 } }}
        transition={{ type: 'spring', stiffness: 250, damping: 28 }}
        className="fixed inset-0 z-50 bg-bg-primary overflow-y-auto"
      >
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-accent-green/[0.03] to-transparent pointer-events-none" />

        <div className="relative max-w-2xl mx-auto px-4 py-8 pb-28">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-full text-[9px] font-orbitron text-text-muted tracking-wider mb-3"
            >
              OVER {over.overNumber} COMPLETE
            </motion.div>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="font-orbitron text-sm text-accent-green">You: {selectedBowler}</span>
              <span className="text-text-dim text-xs">vs</span>
              <span className="font-orbitron text-sm text-accent-red">Cummins: {over.actualBowler}</span>
            </div>
            <p className="font-outfit text-xs text-text-muted mt-1">{over.overResult}</p>
          </div>

          {/* Mini Ground */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-8 flex justify-center"
          >
            <Ground
              compact
              reviewMode
              fanPlacements={fanPlacements}
              actualPlacements={over.actualFieldPlacements}
              matchedPositions={analysis.matchedPositions}
              overNumber={over.overNumber}
            />
          </motion.div>

          {/* Ball-by-ball reveal */}
          <div className="flex gap-2 justify-center mb-8 flex-wrap">
            {over.overBalls.map((ball, i) => (
              <motion.div
                key={i}
                initial={{ y: -15, opacity: 0 }}
                animate={i < ballReveal ? { y: 0, opacity: 1 } : {}}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-orbitron font-bold ${
                  ball === '0' ? 'bg-gray-500/70 text-white' :
                  ball === '1' || ball === '2' || ball === '3' ? 'bg-white/80 text-black' :
                  ball === '4' ? 'bg-accent-cyan/70 text-white' :
                  ball === '6' ? 'bg-yellow-400/70 text-black' :
                  ball === 'W' ? 'bg-accent-red/70 text-white' :
                  'border border-white/10 text-text-muted'
                }`}
              >
                {ball}
              </motion.div>
            ))}
          </div>

          {/* Score Cards */}
          <div className="space-y-3 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel p-4"
            >
              <div className="flex justify-between text-sm mb-2">
                <span className="font-outfit text-text-muted">Field Placement</span>
                <span className="font-orbitron text-white tabular-nums">{fScore} / 60</span>
              </div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(fScore / 60) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-accent-green rounded-full"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="glass-panel p-4"
            >
              <div className="flex justify-between text-sm mb-2">
                <span className="font-outfit text-text-muted">Bowling Choice</span>
                <span className="font-orbitron text-white tabular-nums">{bScore} / 40</span>
              </div>
              <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(bScore / 40) * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-accent-cyan rounded-full"
                />
              </div>
            </motion.div>

            {bonus > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-panel p-4 border-accent-gold/20"
              >
                <div className="flex justify-between text-sm">
                  <span className="font-outfit text-accent-gold">Bonus Points</span>
                  <span className="font-orbitron text-accent-gold">+{bonus}</span>
                </div>
              </motion.div>
            )}

            {/* Total */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: 'spring', stiffness: 200, damping: 15 }}
              className="glass-panel p-6 text-center"
            >
              <div className="font-outfit text-text-muted text-xs mb-2 tracking-wider">TOTAL SCORE</div>
              <div
                className="font-orbitron text-4xl sm:text-5xl font-black tabular-nums"
                style={{ color: totalScore >= 80 ? '#FFD700' : totalScore >= 40 ? '#00FF9D' : '#FF3B5C' }}
              >
                {displayScore}
                <span className="text-xl text-text-muted">/100</span>
              </div>
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.3, type: 'spring', stiffness: 200, damping: 15 }}
                className={`inline-block mt-3 px-5 py-2 rounded-full border font-orbitron text-base font-bold ${gradeColors[grade] || gradeColors.D}`}
              >
                Grade {grade}
              </motion.div>
            </motion.div>
          </div>

          {/* AI Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="glass-panel p-4 mb-8"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-accent-cyan text-sm">✦</span>
              <span className="font-orbitron text-[10px] text-text-muted tracking-wider">AI COACH ANALYSIS</span>
            </div>
            {loading ? (
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            ) : (
              <div>
                <p className="font-outfit text-sm text-white/90 leading-relaxed">
                  {analysis.commentary.split(' ').map((w, i) => (
                    <span
                      key={i}
                      style={{
                        opacity: i < wordReveal && i < commentaryWords.length ? 1 : 0.2,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      {w}{' '}
                    </span>
                  ))}
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-accent-green/10 text-accent-green px-3 py-1.5 rounded-lg text-xs font-outfit border border-accent-green/20">
                  <span>💡</span>
                  {analysis.keyInsight}
                </div>
              </div>
            )}
          </motion.div>

          {/* Leaderboard */}
          <Leaderboard totalScore={totalScore} overNumber={over.overNumber} grade={grade} />

          {/* Next button with countdown */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="text-center"
          >
            {/* Countdown ring */}
            {countdownActive && (
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                    <circle
                      cx="24" cy="24" r="20"
                      fill="none"
                      stroke={nextOverCountdown <= 3 ? '#FF3B5C' : '#00FF9D'}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - nextOverCountdown / 10)}`}
                      style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                    />
                  </svg>
                  <span
                    className="absolute inset-0 flex items-center justify-center font-orbitron text-sm font-bold"
                    style={{ color: nextOverCountdown <= 3 ? '#FF3B5C' : '#00FF9D' }}
                  >
                    {nextOverCountdown}
                  </span>
                </div>
                <span className="font-outfit text-xs text-text-muted">
                  {isLastOver ? 'Match ends in' : 'Next over in'} {nextOverCountdown}s
                </span>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(0,255,157,0.2)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="px-10 py-4 bg-accent-green/10 border border-accent-green/40 text-accent-green font-orbitron font-bold rounded-2xl hover:bg-accent-green/20 transition-all tracking-[0.1em]"
            >
              {isLastOver ? 'VIEW MATCH REPORT  →' : `COACH OVER ${over.overNumber + 1}  →`}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
