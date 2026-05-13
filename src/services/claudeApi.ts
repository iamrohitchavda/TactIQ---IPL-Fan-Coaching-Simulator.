/**
 * claudeApi.ts
 * Local scoring engine for TactIQ.
 * No API key required — all analysis runs fully in the browser.
 */

import type { AnalysisResult } from '../types';

interface AnalysisParams {
  overNumber: number;
  matchSituation: string;
  batsmanName: string;
  strikerSR: number;
  weakness: string;
  pitchCondition: string;
  fanPlacements: string[];
  fanBowler: string;
  fanBowlerType: string;
  actualPlacements: string[];
  actualBowler: string;
  overResult: string;
}

/**
 * Score the fan's prediction against the captain's actual decisions.
 * Pure local logic — no network calls.
 */
export async function getOverAnalysis(params: AnalysisParams): Promise<AnalysisResult> {
  // Small artificial delay for UX (feels like analysis is happening)
  await new Promise((r) => setTimeout(r, 600));
  return scoreLocally(params);
}

function scoreLocally(params: AnalysisParams): AnalysisResult {
  const matched = params.fanPlacements.filter((p) =>
    params.actualPlacements.includes(p)
  );

  // Field score: 6 pts per exact match, 1 pt per placed-but-wrong position
  const fieldScore = Math.min(
    60,
    matched.length * 6 + (params.fanPlacements.length - matched.length) * 1
  );

  // Bowling score: 40 exact, 20 same type, 5 effort
  const bowlingScore =
    params.fanBowler === params.actualBowler
      ? 40
      : params.fanBowlerType === params.actualBowler
        ? 20
        : params.fanPlacements.length > 0
          ? 5
          : 0;

  // Bonus: extra 5 if 5+ field matches and bowler right
  const bonusPoints = matched.length >= 5 && params.fanBowler === params.actualBowler ? 5 : 0;

  const totalScore = Math.min(100, fieldScore + bowlingScore + bonusPoints);

  const grade =
    totalScore >= 90 ? 'S' :
    totalScore >= 75 ? 'A' :
    totalScore >= 60 ? 'B' :
    totalScore >= 45 ? 'C' :
    totalScore > 0   ? 'D' : 'F';

  const commentary =
    totalScore >= 80
      ? `Excellent read! You matched ${matched.length} of 9 positions and ${params.fanBowler === params.actualBowler ? 'nailed' : 'came close on'} the bowling choice. Your tactical instincts match elite captaincy.`
      : totalScore >= 55
        ? `Solid effort — ${matched.length} field positions correct. ${params.fanBowler !== params.actualBowler ? `The captain preferred ${params.actualBowler} for this situation.` : 'Good bowling choice!'} Study the match situation more closely.`
        : `Tough over. The captain set a ${params.matchSituation.toLowerCase().includes('death') ? 'defensive death' : 'strategic'} field that was hard to predict. Only ${matched.length} positions matched — keep analysing the game!`;

  const keyInsight =
    totalScore >= 75
      ? 'Your instincts align closely with elite captaincy.'
      : matched.length >= 5
        ? 'Your field was spot-on — work on the bowling selection next.'
        : `Focus on the ${params.matchSituation.split(',')[0].toLowerCase()} — it drives the field shape.`;

  return {
    fieldScore,
    bowlingScore,
    bonusPoints,
    totalScore,
    matchedPositions: matched,
    missedPositions: params.actualPlacements.filter((p) => !params.fanPlacements.includes(p)),
    commentary,
    keyInsight,
    grade,
  };
}
