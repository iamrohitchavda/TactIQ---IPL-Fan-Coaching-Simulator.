import type { Over } from '../types';
import { generateFieldPlacements, generateBowlerOptions, getPhaseLabel } from '../data/fieldGenerator';
import { overByOver as demoOvers, matchInfo as demoMatchInfo } from '../data/matchData';

// ── Types for CricAPI responses ──
interface CricMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  score: CricScore[];
  teamInfo?: { name: string; shortname: string }[];
  series?: { name: string };
}

interface CricScore {
  inning: string;
  r: number;
  w: number;
  o: number;
  batting: string;
}

interface CricScorecardPlayer {
  name: string;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
}

interface CricScorecardInnings {
  team: string;
  batting: {
    name: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    sr: number;
    out: boolean;
  }[];
  bowling: {
    name: string;
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
    economy: number;
  }[];
  balls: { ball: string; runs: number; batsman: string; bowler: string; description: string }[];
  runs: number;
  wickets: number;
  overs: string;
}

interface CricScorecardResponse {
  data: {
    matchInfo: {
      teams: string[];
      venue: string;
      status: string;
      series: { name: string };
      matchFormat: string;
      dateTimeGMT: string;
    };
    innings: CricScorecardInnings[];
    players: Record<string, CricScorecardPlayer>;
  };
  status: string;
}

// ── Helpers ──
function isT20Match(m: CricMatch): boolean {
  const name = (m.name || '').toLowerCase();
  const series = (m.series?.name || '').toLowerCase();
  return (
    name.includes('ipl') ||
    name.includes('t20') ||
    name.includes('twenty') ||
    series.includes('ipl') ||
    series.includes('t20') ||
    m.matchType === 'T20' ||
    m.matchType === 'Twenty20'
  );
}

function mapBowlerType(bowlingStyle: string): string {
  const s = (bowlingStyle || '').toLowerCase();
  if (s.includes('fast')) return 'Fast';
  if (s.includes('medium')) return 'Medium';
  if (s.includes('spin') || s.includes('offbreak') || s.includes('legbreak') || s.includes('googly')) return 'Spin';
  return 'Fast';
}

// ── Public API ──

/**
 * Fetch all current live matches from CricAPI via local proxy.
 */
export async function fetchCurrentMatches(): Promise<CricMatch[]> {
  try {
    const res = await fetch('/api/currentMatches?offset=0');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const matches = json?.data || [];
    return matches
      .filter((m: CricMatch) => m.status === 'live' || m.status === 'LIVE')
      .filter(isT20Match)
      .slice(0, 6);
  } catch (err) {
    console.error('Failed to fetch live matches:', err);
    return [];
  }
}

/**
 * Fetch full scorecard for a match.
 */
export async function fetchMatchScorecard(matchId: string): Promise<CricScorecardInnings[] | null> {
  try {
    const res = await fetch(`/api/matchScorecard?id=${matchId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: CricScorecardResponse = await res.json();
    return json?.data?.innings || null;
  } catch (err) {
    console.error('Failed to fetch scorecard:', err);
    return null;
  }
}

/**
 * Fetch match info.
 */
export async function fetchMatchInfo(matchId: string): Promise<CricMatch | null> {
  try {
    const res = await fetch(`/api/matchInfo?id=${matchId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json?.data || null;
  } catch (err) {
    console.error('Failed to fetch match info:', err);
    return null;
  }
}

/**
 * Transform a CricAPI scorecard into our Over[] format.
 * For data CricAPI doesn't provide (field placements, bowler options),
 * we procedurally generate realistic values.
 */
export function transformScorecardToOvers(
  innings: CricScorecardInnings[],
  matchInfo: CricMatch | null,
): Over[] {
  if (!innings || innings.length === 0) return [];

  const firstInnings = innings[0];
  const totalBalls = firstInnings?.balls || [];
  const bowlers = firstInnings?.bowling || [];
  const batsmen = firstInnings?.batting || [];

  // Group balls by over
  const overMap = new Map<number, { ballIndex: string; runs: number; batsman: string; bowler: string }[]>();
  for (const b of totalBalls) {
    const overNum = parseInt(b.ball?.split('.')?.[0] || '0', 10);
    if (!overMap.has(overNum)) overMap.set(overNum, []);
    overMap.get(overNum)!.push({
      ballIndex: b.ball,
      runs: b.runs,
      batsman: b.batsman || '',
      bowler: b.bowler || '',
    });
  }

  const overs: Over[] = [];
  let cumulativeRuns = 0;
  let cumulativeWickets = 0;

  const maxOvers = Math.min(20, Math.max(...Array.from(overMap.keys()), totalBalls.length > 0 ? Math.ceil(totalBalls.length / 6) : 0));

  for (let i = 1; i <= maxOvers; i++) {
    const overBalls = overMap.get(i) || [];
    const overBallSymbols: string[] = [];

    let overRuns = 0;
    let overWickets = 0;

    // If we have real ball data, use it
    if (overBalls.length > 0) {
      for (const b of overBalls) {
        if (b.runs === 0) overBallSymbols.push('0');
        else if (b.runs <= 3) overBallSymbols.push(String(b.runs));
        else if (b.runs === 4) overBallSymbols.push('4');
        else if (b.runs === 6) overBallSymbols.push('6');
        else overBallSymbols.push(String(b.runs));
        overRuns += b.runs;
      }
    } else {
      // Generate synthetic balls for overs without data
      for (let b = 0; b < 6; b++) {
        const r = Math.random();
        if (r < 0.1) { overBallSymbols.push('0'); }
        else if (r < 0.3) { overBallSymbols.push('1'); }
        else if (r < 0.4) { overBallSymbols.push('2'); }
        else if (r < 0.6) { overBallSymbols.push('0'); }
        else if (r < 0.75) { overBallSymbols.push('4'); }
        else if (r < 0.82) { overBallSymbols.push('6'); }
        else if (r < 0.88) { overBallSymbols.push('W'); overWickets++; }
        else { overBallSymbols.push('1'); }
      }
      overRuns = overBallSymbols.filter((s) => s !== 'W' && s !== '0').reduce((sum, s) => sum + parseInt(s || '0', 10), 0);
    }

    cumulativeRuns += overRuns;
    cumulativeWickets += overWickets;

    // Determine main bowler for this over
    const uniqueBowlers = [...new Set(overBalls.length > 0 ? overBalls.map((b) => b.bowler) : [])];
    const mainBowler = uniqueBowlers[0] || bowlers[i % bowlers.length]?.name || 'Unknown';
    const bowlerObj = bowlers.find((b) => b.name === mainBowler);
    const bowlerType = mapBowlerType(bowlerObj?.name || '');

    // Batsmen on strike
    const batsmanOnStrike = overBalls.length > 0 ? overBalls[0]?.batsman : batsmen[i % batsmen.length]?.name || 'Unknown';
    const batsmanNonStrike = batsmen.find((b) => b.name !== batsmanOnStrike)?.name || batsmen[(i + 1) % batsmen.length]?.name || 'Unknown';
    const strikerObj = batsmen.find((b) => b.name === batsmanOnStrike);

    // Generate field placements (CricAPI doesn't provide these)
    const weakness = strikerObj?.name
      ? `${bowlerType === 'Spin' ? 'sweep miscue' : 'short ball, pace'}`
      : 'standard';
    const placements = generateFieldPlacements(i, bowlerType, strikerObj?.sr || 130, weakness, overRuns);

    // Generate bowler options from actual bowlers in the match
    const availableBowlers = bowlers.map((b) => ({
      name: b.name,
      type: mapBowlerType(b.name),
      economy: b.economy,
      wickets: b.wickets,
    }));

    if (availableBowlers.length < 3) {
      // Pad with fake options
      const types = ['Fast', 'Spin', 'Medium'];
      for (let j = availableBowlers.length; j < 3; j++) {
        availableBowlers.push({
          name: `Bowler ${j + 1}`,
          type: types[j % 3],
          economy: 8,
          wickets: 0,
        });
      }
    }

    const bowlerOptions = generateBowlerOptions(availableBowlers, i);

    overs.push({
      overNumber: i,
      bowler: mainBowler,
      bowlerType,
      batsmanOnStrike,
      batsmanNonStrike,
      strikerStats: {
        recentForm: `${strikerObj?.runs || 0},${Math.floor(Math.random() * 50)},${Math.floor(Math.random() * 50)}`,
        weaknesses: bowlerType === 'Spin' ? 'sweep miscue' : 'short ball, pace',
        strikeRate: strikerObj?.sr || 130,
      },
      pitchCondition: matchInfo?.venue?.toLowerCase().includes('wankhede')
        ? 'Batting friendly, true bounce'
        : 'Standard pitch, even bounce',
      matchSituation: getPhaseLabel(i),
      actualFieldPlacements: placements,
      actualBowler: mainBowler,
      overResult: `${overRuns} runs${overWickets > 0 ? `, ${overWickets} wicket${overWickets > 1 ? 's' : ''}` : ', 0 wickets'}`,
      overBalls: overBallSymbols.length >= 6 ? overBallSymbols.slice(0, 6) : [...overBallSymbols, ...Array(6 - overBallSymbols.length).fill('0')],
      bowlerOptions,
      runningScore: { runs: cumulativeRuns, wickets: cumulativeWickets },
    });
  }

  return overs;
}

/**
 * Full pipeline: fetch live data and transform to Over[].
 * Returns null if no live match available or fetch fails.
 */
export async function loadLiveMatchData(matchId?: string): Promise<{
  overs: Over[];
  matchInfo: CricMatch | null;
  source: 'live' | 'demo';
} | null> {
  let targetId = matchId;
  let innings: CricScorecardInnings[] | null = null;
  let info: CricMatch | null = null;

  try {
    if (!targetId) {
      const matches = await fetchCurrentMatches();
      if (matches.length > 0) {
        targetId = matches[0].id;
        info = matches[0];
        innings = await fetchMatchScorecard(targetId);
      }
    } else {
      const [fetchedInfo, fetchedInnings] = await Promise.all([
        fetchMatchInfo(targetId),
        fetchMatchScorecard(targetId),
      ]);
      info = fetchedInfo;
      innings = fetchedInnings;
    }
  } catch (err) {
    console.error('Live data fetch failed, falling back to demo:', err);
  }

  if (innings && innings.length > 0) {
    const overs = transformScorecardToOvers(innings, info);
    return { overs, matchInfo: info, source: 'live' };
  }
  if (info && !innings) {
    return null;
  }

  // Fallback: return demo data
  console.log('Falling back to demo match data');
  return {
    overs: demoOvers,
    matchInfo: {
      id: 'demo',
      name: `${demoMatchInfo.team1} vs ${demoMatchInfo.team2}`,
      matchType: 'T20',
      status: 'LIVE',
      venue: demoMatchInfo.venue,
      date: new Date().toISOString(),
      dateTimeGMT: new Date().toISOString(),
      teams: [demoMatchInfo.team1, demoMatchInfo.team2],
      score: [],
      series: { name: 'IPL 2026' },
    },
    source: 'demo',
  };
}
