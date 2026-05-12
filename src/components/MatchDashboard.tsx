import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';
import { getOverAnalysis } from '../services/claudeApi';
import { generateFieldPlacements } from '../data/fieldGenerator';
import { fetchLiveScores } from '../services/liveMatchApi';
import { getPhaseAccent } from '../utils/phaseColors';
import Ground from './Ground';
import Scoreboard from './Scoreboard';
import BowlerSelect from './BowlerSelect';
import Timer from './Timer';
import OverResult from './OverResult';
import type { AnalysisResult } from '../types';

export default function MatchDashboard() {
  const {
    currentOverIndex,
    fanPlacements,
    selectedBowler,
    phase,
    submitPrediction,
    revealResult,
    liveOvers,
    matchTitle,
    matchContext,
    isSubmitting,
    overScores,
  } = useMatchStore();

  const over = liveOvers[currentOverIndex];
  const [soundOn, setSoundOn] = useState(true);
  const [liveScores, setLiveScores] = useState<Array<{ id: string; name: string; score: string; isIpl: boolean }>>([]);

  const showOverlay = phase === 'result';

  // Live scores polling
  useEffect(() => {
    const fetch = async () => {
      try {
        const scores = await fetchLiveScores();
        if (scores.length > 0) setLiveScores(scores as Array<{ id: string; name: string; score: string; isIpl: boolean }>);
      } catch {
        // Live scores unavailable
      }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  // Derive current score from actual over data
  const currentScore = useMemo(() => over?.runningScore || { runs: 0, wickets: 0 }, [over?.runningScore]);
  const battingTeam = matchContext?.team1?.batting ? matchContext.team1 : matchContext?.team2;
  const bowlingTeam = matchContext?.team1?.batting ? matchContext.team2 : matchContext?.team1;

  const accent = over ? getPhaseAccent(over.overNumber) : null;
  const totalOvers = liveOvers.length;

  const canSubmit = fanPlacements.length === 9 && selectedBowler !== null && phase === 'predict' && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (fanPlacements.length !== 9 || !selectedBowler || !over || isSubmitting) return;

    console.log('Submitting state:', { fanPlacements, selectedBowler, overNumber: over.overNumber });

    submitPrediction();

    // Timeout recovery: if analysis takes > 15s, auto-continue
    const timeoutId = setTimeout(() => {
      console.log('Timeout recovery: forcing navigation');
      const fallbackResult: AnalysisResult = {
        fieldScore: 0, bowlingScore: 0, bonusPoints: 0, totalScore: 0,
        matchedPositions: [], missedPositions: [],
        commentary: 'Analysis timed out. Please continue.',
        keyInsight: 'Time management is key in captaincy.',
        grade: 'D',
      };
      revealResult(fallbackResult);
    }, 15000);

    try {
      const runsMatch = over.overResult.match(/(\d+)\s*runs/);
      const overRuns = runsMatch ? parseInt(runsMatch[1], 10) : 8;

      const captainPlacements = generateFieldPlacements(
        over.overNumber, over.bowlerType, over.strikerStats.strikeRate,
        over.strikerStats.weaknesses, overRuns,
      );

      const captainBowler = over.actualBowler || selectedBowler;

      const result = await getOverAnalysis({
        overNumber: over.overNumber,
        matchSituation: over.matchSituation,
        batsmanName: over.batsmanOnStrike,
        strikerSR: over.strikerStats.strikeRate,
        weakness: over.strikerStats.weaknesses,
        pitchCondition: over.pitchCondition,
        fanPlacements: [...fanPlacements],
        fanBowler: selectedBowler,
        fanBowlerType: over.bowlerOptions.find((b) => b.name === selectedBowler)?.type || '',
        actualPlacements: captainPlacements,
        actualBowler: captainBowler,
        overResult: over.overResult,
      });

      clearTimeout(timeoutId);
      console.log('Navigation success');
      console.log('Updated innings:', currentScore);
      revealResult(result);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Submit error:', err);
      const errorResult: AnalysisResult = {
        fieldScore: 0, bowlingScore: 0, bonusPoints: 0, totalScore: 0,
        matchedPositions: [], missedPositions: [],
        commentary: 'An error occurred during analysis.',
        keyInsight: 'Technical difficulties. Your submission was recorded.',
        grade: 'D',
      };
      revealResult(errorResult);
    }
  }, [fanPlacements, selectedBowler, over, isSubmitting, submitPrediction, revealResult, currentScore]);

  if (!over) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-4">
            <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
          </div>
          <p className="font-outfit text-text-muted text-sm">Loading match data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* OverResult overlay modal */}
      {showOverlay && phase === 'result' && <OverResult />}

      {/* Live Score Ticker */}
      {liveScores.length > 0 && (
        <div className="bg-accent-red/[0.03] border-b border-accent-red/[0.06] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-1 flex gap-6 text-[10px] font-outfit text-white animate-scroll-ticker whitespace-nowrap">
            {liveScores.map((s, i) => (
              <span key={s.id || i} className="flex-shrink-0">
                {s.isIpl && <span className="text-accent-cyan mr-1 font-orbitron text-[9px]">IPL</span>}
                <span className="font-semibold">{s.name}</span>
                <span className="text-accent-green ml-1">{s.score}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-orbitron text-sm font-bold">
              <span className="text-white">Tact</span><span className="text-accent-green">IQ</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 bg-accent-green/15 text-accent-green rounded font-orbitron border border-accent-green/20">
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm font-orbitron text-white font-bold">
            <span className="w-2 h-2 bg-accent-red rounded-full animate-pulse flex-shrink-0" />
            <span className="text-sm sm:text-base tracking-tight">{matchTitle || 'Match'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-accent-gold/15 to-accent-gold/5 border border-accent-gold/30">
              <span className="text-sm">👑</span>
              <span className="font-orbitron text-xs sm:text-sm text-accent-gold font-bold tracking-wide">PAT CUMMINS</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/15 border border-accent-green/30">
              <span className="text-[10px] font-outfit text-text-muted font-semibold">You</span>
              <span className="font-orbitron text-base sm:text-lg font-black text-accent-green tabular-nums">
                {overScores.reduce((sum, s) => sum + s.totalScore, 0)}
              </span>
              <span className="text-[9px] text-text-dim font-orbitron">/ {overScores.length * 100 || 0}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-text-muted font-outfit">
              <span className="text-accent-green">●</span>
              <span className="tabular-nums">{useMatchStore.getState().liveCounter.toLocaleString()}</span>
            </div>
            <button onClick={() => setSoundOn(!soundOn)} className="text-xs text-text-muted hover:text-white transition-colors">
              {soundOn ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </div>

      {/* Over Timeline Strip */}
      <div className="bg-bg-surface/50 border-b border-white/[0.03] px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-1">
          {Array.from({ length: totalOvers }, (_, i) => {
            const ov = i + 1;
            const ac = getPhaseAccent(ov);
            const isComplete = i < currentOverIndex;
            const isCurrent = i === currentOverIndex;
            const dotColor = ov <= 6 ? 'bg-accent-green' : ov <= 15 ? 'bg-accent-cyan' : 'bg-accent-orange';
            return (
              <div key={ov} className="relative flex-1 flex flex-col items-center">
                <div
                  className={`w-full h-1 rounded-full transition-all duration-300 ${
                    isComplete ? dotColor + ' opacity-70' :
                    isCurrent ? dotColor + ' opacity-100 shadow-[0_0_6px_rgba(0,255,157,0.4)]' :
                    'bg-white/[0.06]'
                  }`}
                />
                {isCurrent && (
                  <span className={`absolute -top-4 font-orbitron text-[8px] ${ac?.text || 'text-white'} font-bold`}>
                    {ov}
                  </span>
                )}
              </div>
            );
          })}
          <span className="ml-2 font-orbitron text-[8px] text-text-dim tracking-wider">{totalOvers} OV</span>
        </div>
      </div>

      {/* Team Score Bar — now uses actual over data */}
      {matchContext && (
        <div className="bg-gradient-to-r from-bg-surface via-bg-surface/80 to-bg-surface border-b border-white/[0.03]">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-orbitron text-base sm:text-lg font-bold text-white tracking-tight">{matchContext.team1.short}</div>
                <div className="font-outfit text-[8px] text-text-muted">{matchContext.team1.captain}</div>
              </div>
              <div className="flex items-baseline">
                <span className="font-orbitron text-2xl sm:text-3xl font-black text-accent-green tabular-nums">
                  {currentScore.runs}
                </span>
                <span className="font-orbitron text-lg text-text-muted mx-0.5">/</span>
                <span className="font-orbitron text-xl sm:text-2xl font-bold text-text-muted tabular-nums">
                  {currentScore.wickets}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-orbitron text-[9px] text-text-muted tracking-[0.15em]">
                {currentOverIndex > 0 ? `OVER ${currentOverIndex}.0` : 'OVER 0.0'}
              </span>
              {accent && (
                <span className={`font-orbitron text-[8px] ${accent.text} tracking-[0.15em]`}>
                  {accent.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline">
                <span className="font-orbitron text-2xl sm:text-3xl font-black text-accent-red tabular-nums">
                  {bowlingTeam?.score?.runs || 0}
                </span>
                <span className="font-orbitron text-lg text-text-muted mx-0.5">/</span>
                <span className="font-orbitron text-xl sm:text-2xl font-bold text-text-muted tabular-nums">
                  {bowlingTeam?.score?.wickets || 0}
                </span>
              </div>
              <div className="text-left">
                <div className="font-orbitron text-base sm:text-lg font-bold text-white tracking-tight">{matchContext.team2.short}</div>
                <div className="font-outfit text-[8px] text-text-muted">{matchContext.team2.captain}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase Predict Header */}
      {phase === 'predict' && accent && (
        <div className="max-w-7xl mx-auto px-4 pt-3 pb-1">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${accent.bg} ${accent.border} border rounded-xl p-3 text-center`}
            style={{ boxShadow: `0 0 20px ${accent.glow || 'transparent'}` }}
          >
            <div className="flex items-center justify-center gap-2">
              <span className={`font-orbitron text-[11px] ${accent.text} tracking-wider`}>⏳ {accent.label}</span>
              <span className="font-orbitron text-[11px] text-white font-bold">OVER {over.overNumber}</span>
            </div>
            <p className="font-outfit text-[10px] text-text-muted mt-1">
              Set field + pick bowler — what would <span className="text-accent-gold font-semibold">Pat Cummins</span> do?
            </p>
          </motion.div>
        </div>
      )}

      {/* Main 3-column layout */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">
        {/* Left column */}
        <motion.div
          key={`left-${currentOverIndex}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <Scoreboard over={over} battingTeamName={battingTeam?.name} />

          {/* Batting XI */}
          <div className="glass-panel p-3">
            <div className="text-[9px] font-orbitron text-text-muted tracking-wider mb-2 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-accent-green" />
              SQUAD
            </div>
            <div className="flex flex-wrap gap-1">
              {battingTeam?.players?.slice(0, 11).map((p) => (
                <span key={p} className="text-[9px] px-2 py-0.5 bg-white/[0.04] rounded text-text-muted font-outfit">{p}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Center column */}
        <motion.div
          key={`center-${currentOverIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center"
        >
          {/* Ground */}
          <div
            className={`rounded-2xl p-1 border ${accent?.border || 'border-white/[0.06]'}`}
            style={{ boxShadow: accent ? `0 0 25px ${accent.glow || 'transparent'}` : 'none' }}
          >
            <Ground overNumber={over.overNumber} />
          </div>

          {/* Field counter */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-green" />
              <span className="font-orbitron text-xs text-white/80 tabular-nums">
                {fanPlacements.length}/9
              </span>
            </div>
            {phase === 'predict' && fanPlacements.length > 0 && (
              <button
                onClick={() => useMatchStore.getState().clearFielders()}
                className="text-[10px] font-outfit text-text-muted hover:text-white transition-colors underline underline-offset-2"
              >
                Clear All
              </button>
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <motion.div
          key={`right-${currentOverIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <Timer key={`timer-${currentOverIndex}-${phase}`} />

          {/* Submitted state */}
          {phase === 'submitted' && (
            <div className="glass-panel p-5 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 rounded-full bg-accent-green/20 border border-accent-green/30 mx-auto mb-3 flex items-center justify-center"
              >
                <span className="text-accent-green text-xl font-bold">✓</span>
              </motion.div>
              <p className="font-orbitron text-sm text-accent-green tracking-wider">PREDICTION IN</p>
              <p className="text-[10px] text-text-muted font-outfit mt-2">
                <span className="text-accent-gold">Pat Cummins</span> is analysing...
              </p>
              <div className="flex items-center justify-center gap-1 mt-3">
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          )}

          {/* Bowler selection */}
          {phase === 'predict' && (
            <BowlerSelect options={over.bowlerOptions} />
          )}

          {/* Submit button */}
          {phase === 'predict' && (
            <motion.button
              whileHover={canSubmit ? { scale: 1.01 } : {}}
              whileTap={canSubmit ? { scale: 0.99 } : {}}
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className={`w-full py-4 rounded-xl font-orbitron font-bold text-sm tracking-[0.1em] transition-all duration-300 ${
                canSubmit
                  ? `${accent?.bg || 'bg-accent-green/10'} ${accent?.text || 'text-accent-green'} ${accent?.border || 'border-accent-green/30'} border hover:brightness-110`
                  : 'bg-white/[0.02] text-text-dim border border-white/[0.06] cursor-not-allowed'
              }`}
            >
              {canSubmit
                ? `SUBMIT OVER ${over.overNumber} TACTICS`
                : isSubmitting
                  ? 'SUBMITTING...'
                  : fanPlacements.length < 9
                    ? `PLACE ${9 - fanPlacements.length} MORE FIELDERS`
                    : !selectedBowler
                      ? 'SELECT A BOWLER'
                      : 'PLACE 9 + PICK BOWLER'}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
