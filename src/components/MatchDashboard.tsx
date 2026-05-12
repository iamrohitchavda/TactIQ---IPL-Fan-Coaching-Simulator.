import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';
import { getOverAnalysis } from '../services/claudeApi';
import { generateFieldPlacements } from '../data/fieldGenerator';
import Ground from './Ground';
import Scoreboard from './Scoreboard';
import BowlerSelect from './BowlerSelect';
import Timer from './Timer';
import OverResult from './OverResult';
import type { AnalysisResult as AnalysisResultType } from '../types';

export default function MatchDashboard() {
  const {
    currentOverIndex,
    fanPlacements,
    selectedBowler,
    selectedCaptain,
    phase,
    liveCounter,
    setLiveCounter,
    submitPrediction,
    revealResult,
    liveOvers,
    matchTitle,
    dataSource,
    matchContext,
  } = useMatchStore();

  const over = liveOvers[currentOverIndex];
  const [soundOn, setSoundOn] = useState(true);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter(liveCounter + Math.floor(Math.random() * 60) - 30);
    }, 4000);
    return () => clearInterval(interval);
  }, [liveCounter, setLiveCounter]);

  // Auto-generate captain placements when revealing
  const handleSubmit = async () => {
    if (fanPlacements.length !== 9 || !selectedBowler || !over) return;
    submitPrediction();
    setFetching(true);

    // Parse over result for context
    const runsMatch = over.overResult.match(/(\d+)\s*runs/);
    const overRuns = runsMatch ? parseInt(runsMatch[1], 10) : 8;

    // Generate captain's placements for THIS over
    const captainPlacements = generateFieldPlacements(
      over.overNumber,
      over.bowlerType,
      over.strikerStats.strikeRate,
      over.strikerStats.weaknesses,
      overRuns,
    );

    // Pick captain's bowler from the options the actual match used
    const captainBowler = over.actualBowler || selectedBowler;

    const result: AnalysisResultType = await getOverAnalysis({
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

    setFetching(false);
    revealResult(result);
  };

  const canSubmit = fanPlacements.length === 9 && selectedBowler !== null && phase === 'predict';

  const battingTeam = matchContext?.team1?.batting ? matchContext.team1 : matchContext?.team2;

  if (!over) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <p className="font-outfit text-text-muted">No match data loaded.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {phase === 'result' && <OverResult />}

      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-bg-primary/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-orbitron text-sm font-bold text-accent-green">TactIQ</span>
            {dataSource === 'live' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-accent-green/20 text-accent-green rounded font-orbitron">LIVE</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs font-outfit text-white">
            <span>🔴</span>
            <span className="font-semibold">{matchTitle || 'Match'}</span>
            {dataSource === 'demo' && (
              <span className="text-text-muted text-[10px]">(Demo)</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-outfit text-text-muted">👥 {liveCounter.toLocaleString()} coaching</span>
            <button onClick={() => setSoundOn(!soundOn)} className="text-sm text-text-muted hover:text-white transition-colors">
              {soundOn ? '🔊' : '🔇'}
            </button>
          </div>
        </div>
      </div>

      {/* Team Bar */}
      {matchContext && (
        <div className="bg-bg-card border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-orbitron font-bold text-white">{matchContext.team1.short}</span>
              <span className="font-orbitron text-accent-green">{matchContext.team1.score.runs}/{matchContext.team1.score.wickets}</span>
              <span className="text-text-muted">Captain: <span className="text-accent-gold">{matchContext.team1.captain}</span></span>
            </div>
            <span className="font-orbitron text-accent-blue text-sm">vs</span>
            <div className="flex items-center gap-3">
              <span className="font-orbitron font-bold text-white">{matchContext.team2.short}</span>
              <span className="font-orbitron text-accent-green">{matchContext.team2.score.runs}/{matchContext.team2.score.wickets}</span>
              <span className="text-text-muted">Captain: <span className="text-accent-gold">{matchContext.team2.captain}</span></span>
            </div>
          </div>
        </div>
      )}

      {/* Predict Header */}
      {phase === 'predict' && (
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="bg-accent-green/10 border border-accent-green/30 rounded-xl p-3 text-center">
            <p className="font-orbitron text-xs text-accent-green tracking-wider">
              ⏳ PREDICT OVER {over.overNumber} — What would you do as captain?
            </p>
            <p className="font-outfit text-[10px] text-text-muted mt-1">
              Set your field and choose your bowler before the over starts
            </p>
          </div>
        </div>
      )}

      {/* Main 3-column layout */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-[28%_44%_28%] gap-4">
        {/* Left column */}
        <motion.div
          key={`left-${currentOverIndex}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4 overflow-y-auto max-h-[calc(100vh-80px)]"
        >
          <Scoreboard over={over} />

          {/* Team playing XI (compact) */}
          <div className="bg-bg-card border border-white/10 rounded-xl p-3">
            <div className="text-[10px] font-orbitron text-text-muted tracking-wider mb-1">BATTING XI</div>
            <div className="flex flex-wrap gap-1">
              {battingTeam?.players?.slice(0, 6).map((p) => (
                <span key={p} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-text-muted font-outfit">{p}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Center column */}
        <motion.div
          key={`center-${currentOverIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <Ground overNumber={over.overNumber} />

          <div className="flex items-center gap-4 mt-3">
            <span className="font-orbitron text-sm text-accent-green">
              Fielders Placed: {fanPlacements.length} / 9
            </span>
            {phase === 'predict' && fanPlacements.length > 0 && (
              <button
                onClick={() => useMatchStore.getState().clearFielders()}
                className="text-xs font-outfit text-text-muted hover:text-white transition-colors underline"
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
          className="space-y-4"
        >
          <Timer />

          {/* Captain selector */}
          {phase === 'predict' && matchContext && (
            <div className="bg-bg-card border border-white/10 rounded-xl p-3">
              <div className="text-[10px] font-orbitron text-text-muted tracking-wider mb-2">YOUR CAPTAIN PICK</div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => useMatchStore.getState().selectCaptain(matchContext.team1.captain)}
                  className={`flex-1 py-2 rounded-lg text-xs font-orbitron border transition-all ${
                    selectedCaptain === matchContext.team1.captain
                      ? 'bg-accent-green/20 border-accent-green text-accent-green'
                      : 'bg-white/5 border-white/10 text-text-muted hover:border-white/30'
                  }`}
                >
                  {matchContext.team1.short}<br/>{matchContext.team1.captain.split(' ').pop()}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => useMatchStore.getState().selectCaptain(matchContext.team2.captain)}
                  className={`flex-1 py-2 rounded-lg text-xs font-orbitron border transition-all ${
                    selectedCaptain === matchContext.team2.captain
                      ? 'bg-accent-green/20 border-accent-green text-accent-green'
                      : 'bg-white/5 border-white/10 text-text-muted hover:border-white/30'
                  }`}
                >
                  {matchContext.team2.short}<br/>{matchContext.team2.captain.split(' ').pop()}
                </motion.button>
              </div>
            </div>
          )}

          {phase === 'submitted' && (
            <div className="bg-bg-card border border-accent-green/30 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">✓</div>
              <p className="font-orbitron text-sm text-accent-green">PREDICTION SUBMITTED</p>
              {fetching && (
                <div className="mt-3">
                  <p className="text-xs text-text-muted font-outfit mb-2">Captain {selectedCaptain || matchContext?.team1.captain} is setting the field...</p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {phase === 'predict' && (
            <BowlerSelect options={over.bowlerOptions} />
          )}

          {phase === 'predict' && (
            <motion.button
              whileHover={canSubmit ? { scale: 1.02 } : {}}
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-4 rounded-xl font-orbitron font-bold text-sm tracking-wider transition-all ${
                canSubmit
                  ? 'bg-accent-green text-black hover:bg-accent-green/90 shadow-lg shadow-accent-green/20'
                  : 'bg-white/5 text-text-muted border border-white/10 cursor-not-allowed'
              }`}
            >
              {canSubmit ? 'SUBMIT YOUR TACTICS' : 'PLACE 9 + PICK BOWLER'}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
