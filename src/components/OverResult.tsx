import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';
import { iplFacts } from '../data/matchData';
import { getOverAnalysis } from '../services/claudeApi';
import Ground from './Ground';
import Leaderboard from './Leaderboard';

export default function OverResult() {
  const {
    currentOverIndex,
    fanPlacements,
    selectedBowler,
    selectedCaptain,
    overScores,
    revealResult,
    nextOver,
    setPhase,
    liveOvers,
  } = useMatchStore();

  const over = liveOvers[currentOverIndex];
  const [analysis, setAnalysis] = useState(overScores[currentOverIndex] ?? null);
  const [loading, setLoading] = useState(!overScores[currentOverIndex]);
  const [capsDeciding, setCapsDeciding] = useState(true);
  const [factIndex, setFactIndex] = useState(0);
  const [fakeSubmitCount, setFakeSubmitCount] = useState(0);
  const [ballReveal, setBallReveal] = useState(0);
  const [wordReveal, setWordReveal] = useState(0);
  const [scoreAnimated, setScoreAnimated] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const confettiRef = useRef<boolean>(false);

  useEffect(() => {
    if (!overScores[currentOverIndex]) {
      const fetchAnalysis = async () => {
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
        setAnalysis(result);
        revealResult(result);
        setLoading(false);
      };

      // Captain deciding phase
      const factTimer = setInterval(() => {
        setFactIndex((p) => (p + 1) % iplFacts.length);
      }, 2500);
      const submitTimer = setInterval(() => {
        setFakeSubmitCount((p) => p + Math.floor(Math.random() * 40) + 10);
      }, 500);

      const capsTimer = setTimeout(() => {
        setCapsDeciding(false);
        clearInterval(factTimer);
        clearInterval(submitTimer);
        setPhase('reveal');
        fetchAnalysis();
      }, 8000);

      return () => {
        clearTimeout(capsTimer);
        clearInterval(factTimer);
        clearInterval(submitTimer);
      };
    } else {
      setAnalysis(overScores[currentOverIndex]);
      setLoading(false);
      setCapsDeciding(false);
    }
  }, []);

  // Ball by ball reveal
  useEffect(() => {
    if (!capsDeciding && !loading && analysis) {
      const t = setTimeout(() => {
        if (ballReveal < over.overBalls.length) {
          setBallReveal((p) => p + 1);
        }
      }, 400);
      return () => clearTimeout(t);
    }
  }, [capsDeciding, loading, analysis, ballReveal, over.overBalls.length]);

  // Ball reveal sound
  useEffect(() => {
    if (ballReveal > 0 && ballReveal <= over.overBalls.length) {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        osc.frequency.value = 220;
        osc.connect(ctx.destination);
        osc.start();
        setTimeout(() => {
          osc.stop();
          ctx.close();
        }, 80);
      } catch (e) { /* ignore */ }
    }
  }, [ballReveal]);

  // Word-by-word analysis reveal
  useEffect(() => {
    if (analysis && !capsDeciding) {
      const words = (analysis.commentary + ' ' + analysis.keyInsight).split(' ');
      if (wordReveal < words.length) {
        const t = setTimeout(() => setWordReveal((p) => p + 1), 50);
        return () => clearTimeout(t);
      }
    }
  }, [analysis, capsDeciding, wordReveal]);

  // Score counter animation
  useEffect(() => {
    if (analysis && !capsDeciding && !scoreAnimated) {
      setScoreAnimated(true);
      let current = 0;
      const target = analysis.totalScore;
      const interval = setInterval(() => {
        current += Math.ceil(target / 30);
        if (current >= target) {
          setDisplayScore(target);
          clearInterval(interval);
        } else {
          setDisplayScore(current);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [analysis, capsDeciding, scoreAnimated]);

  // Confetti effect
  useEffect(() => {
    if (analysis && !capsDeciding && !confettiRef.current) {
      confettiRef.current = true;
      if (analysis.totalScore >= 80) {
        try {
          (window as any).confetti?.({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        } catch (e) { /* ignore */ }
      }
    }
  }, [analysis, capsDeciding]);

  const isLastOver = currentOverIndex >= 19;

  // Fallback analysis
  const fieldScore = analysis?.fieldScore ?? 0;
  const bowlingScore = analysis?.bowlingScore ?? 0;
  const bonusPoints = analysis?.bonusPoints ?? 0;
  const totalScore = analysis?.totalScore ?? 0;
  const grade = analysis?.grade ?? 'D';

  const gradeColors: Record<string, string> = {
    S: 'text-accent-gold bg-accent-gold/20 border-accent-gold',
    A: 'text-accent-green bg-accent-green/20 border-accent-green',
    B: 'text-accent-blue bg-accent-blue/20 border-accent-blue',
    C: 'text-accent-orange bg-accent-orange/20 border-accent-orange',
    D: 'text-accent-red bg-accent-red/20 border-accent-red',
  };

  // Captain deciding phase
  if (capsDeciding) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-lg flex flex-col items-center justify-center"
      >
        <div className="text-center px-4">
          <div className="text-4xl mb-4">🧢</div>
          <h2 className="font-orbitron text-xl text-accent-green mb-2">Captain is deciding</h2>
          <div className="flex gap-1 justify-center mb-6">
            <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
          </div>
          <p className="font-outfit text-text-muted text-sm mb-6">
            {fakeSubmitCount.toLocaleString()} fans have submitted
          </p>
          <div className="w-64 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-accent-green rounded-full animate-progress" style={{ animationDuration: '8s' }} />
          </div>
          <div className="mt-8 max-w-md mx-auto">
            <p className="font-outfit text-text-muted text-xs italic">Did you know?</p>
            <p className="font-outfit text-white text-sm mt-1">{iplFacts[factIndex]}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!analysis) return null;

  const commentaryWords = analysis.commentary.split(' ');

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed inset-0 z-50 bg-bg-primary overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-orbitron text-2xl font-bold text-white"
          >
            OVER {over.overNumber} COMPLETE
          </motion.h2>
          <div className="flex items-center justify-center gap-3 mt-1">
            <span className="font-outfit text-sm text-accent-green">You chose: {selectedBowler}</span>
            <span className="text-text-muted">vs</span>
            <span className="font-outfit text-sm text-accent-orange">Captain: {over.actualBowler}</span>
          </div>
          <p className="font-outfit text-text-muted text-xs mt-1">{over.overResult}</p>
          {selectedCaptain && (
            <p className="font-outfit text-xs text-text-muted mt-1">Your captain pick: <span className="text-accent-gold">{selectedCaptain}</span></p>
          )}
        </div>

        {/* Mini Ground */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Ground
            compact={true}
            reviewMode={true}
            fanPlacements={fanPlacements}
            actualPlacements={over.actualFieldPlacements}
            matchedPositions={analysis.matchedPositions}
            overNumber={over.overNumber}
          />
        </motion.div>

        {/* Ball-by-ball reveal */}
        <div className="flex gap-2 justify-center mb-8">
          {over.overBalls.map((ball, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, opacity: 0 }}
              animate={i < ballReveal ? { y: 0, opacity: 1 } : {}}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-orbitron font-bold ${
                ball === '0' ? 'bg-gray-500 text-white' :
                ball === '1' || ball === '2' || ball === '3' ? 'bg-white text-black' :
                ball === '4' ? 'bg-accent-blue text-white' :
                ball === '6' ? 'bg-yellow-400 text-black' :
                ball === 'W' ? 'bg-accent-red text-white' :
                'border border-white/20 text-text-muted'
              }`}
            >
              {ball}
            </motion.div>
          ))}
        </div>

        {/* Score Cards */}
        <div className="space-y-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-bg-card border border-white/10 rounded-xl p-4"
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="font-outfit text-text-muted">Field Placement</span>
              <span className="font-orbitron text-white">{fieldScore} / 60</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(fieldScore / 60) * 100}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="h-full bg-accent-green rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-bg-card border border-white/10 rounded-xl p-4"
          >
            <div className="flex justify-between text-sm mb-2">
              <span className="font-outfit text-text-muted">Bowling Choice</span>
              <span className="font-orbitron text-white">{bowlingScore} / 40</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(bowlingScore / 40) * 100}%` }}
                transition={{ duration: 1, delay: 0.85 }}
                className="h-full bg-accent-blue rounded-full"
              />
            </div>
          </motion.div>

          {bonusPoints > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-bg-card border border-accent-gold/30 rounded-xl p-4"
            >
              <div className="flex justify-between text-sm">
                <span className="font-outfit text-accent-gold">Bonus Points</span>
                <span className="font-orbitron text-accent-gold">+{bonusPoints}</span>
              </div>
            </motion.div>
          )}

          {/* Total */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
            className="bg-bg-card border border-white/10 rounded-xl p-6 text-center"
          >
            <div className="font-outfit text-text-muted text-sm mb-1">TOTAL</div>
            <div
              className="font-orbitron text-5xl font-bold"
              style={{ color: totalScore >= 80 ? '#FFD700' : totalScore >= 40 ? '#00FF87' : '#FF3B5C' }}
            >
              {displayScore} / 100
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1.5, type: 'spring', stiffness: 200, damping: 15 }}
              className={`inline-block mt-3 px-5 py-2 rounded-full border font-orbitron text-lg font-bold ${gradeColors[grade] || gradeColors.D}`}
            >
              Grade {grade}
            </motion.div>
          </motion.div>
        </div>

        {/* AI Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-bg-card border border-white/10 rounded-xl p-4 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🧠</span>
            <span className="font-orbitron text-xs text-text-muted tracking-wider">AI COACH ANALYSIS</span>
          </div>
          {loading ? (
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          ) : (
            <div>
              <p className="font-outfit text-sm text-white leading-relaxed">
                {analysis.commentary.split(' ').map((w, i) => (
                  <span
                    key={i}
                    style={{
                      opacity: i < wordReveal && i < commentaryWords.length ? 1 : 0.3,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {w}{' '}
                  </span>
                ))}
              </p>
              <div className="mt-3 inline-block bg-accent-green/15 text-accent-green px-3 py-1.5 rounded-lg text-sm font-outfit">
                {analysis.keyInsight}
              </div>
            </div>
          )}
        </motion.div>

        {/* Leaderboard */}
        <Leaderboard totalScore={totalScore} overNumber={over.overNumber} grade={grade} />

        {/* Next button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (isLastOver) {
                useMatchStore.getState().setPhase('summary');
              } else {
                nextOver();
              }
            }}
            className="px-10 py-4 bg-accent-green/20 border border-accent-green text-accent-green font-orbitron font-bold rounded-xl hover:bg-accent-green/30 transition-all tracking-wider"
          >
            {isLastOver ? 'VIEW MATCH REPORT  →' : `COACH OVER ${over.overNumber + 1}  →`}
          </motion.button>
        </motion.div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 8s linear forwards;
        }
      `}</style>
    </motion.div>
  );
}
