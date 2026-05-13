/**
 * matchGenerator.ts
 * Generates a random IPL match between 2 teams with realistic over-by-over data.
 * Every session picks different teams, stadiums, and scenarios.
 */

import type { Over, BowlerOption } from '../types';
import { iplTeams2026, type IPLTeam } from './teamData';

// ─── Known bowler pools per team ────────────────────────────────────────────
const teamBowlers: Record<string, { name: string; type: 'Fast' | 'Fast-Medium' | 'Spin'; econ: number; wkts: number }[]> = {
  GT: [
    { name: 'Kagiso Rabada',    type: 'Fast',        econ: 7.8, wkts: 2 },
    { name: 'Mohammed Siraj',   type: 'Fast',        econ: 8.1, wkts: 1 },
    { name: 'Prasidh Krishna',  type: 'Fast-Medium', econ: 8.6, wkts: 1 },
    { name: 'Rashid Khan',      type: 'Spin',        econ: 6.2, wkts: 3 },
    { name: 'Sai Kishore',      type: 'Spin',        econ: 6.8, wkts: 2 },
    { name: 'Washington Sundar',type: 'Spin',        econ: 7.0, wkts: 1 },
  ],
  SRH: [
    { name: 'Pat Cummins',      type: 'Fast',        econ: 7.5, wkts: 1 },
    { name: 'Harshal Patel',    type: 'Fast',        econ: 8.2, wkts: 2 },
    { name: 'Brydon Carse',     type: 'Fast',        econ: 9.1, wkts: 1 },
    { name: 'Jaydev Unadkat',   type: 'Fast-Medium', econ: 8.8, wkts: 0 },
    { name: 'Zeeshan Ansari',   type: 'Spin',        econ: 6.5, wkts: 3 },
    { name: 'Liam Livingstone', type: 'Spin',        econ: 8.0, wkts: 1 },
  ],
  MI: [
    { name: 'Jasprit Bumrah',   type: 'Fast',        econ: 6.5, wkts: 2 },
    { name: 'Trent Boult',      type: 'Fast-Medium', econ: 7.9, wkts: 2 },
    { name: 'Hardik Pandya',    type: 'Fast-Medium', econ: 8.5, wkts: 1 },
    { name: 'Piyush Chawla',    type: 'Spin',        econ: 7.2, wkts: 2 },
    { name: 'Kumar Kartikeya',  type: 'Spin',        econ: 7.5, wkts: 2 },
    { name: 'Akash Madhwal',    type: 'Fast',        econ: 8.0, wkts: 1 },
  ],
  CSK: [
    { name: 'Deepak Chahar',    type: 'Fast-Medium', econ: 7.8, wkts: 2 },
    { name: 'Ravindra Jadeja',  type: 'Spin',        econ: 7.0, wkts: 2 },
    { name: 'Maheesh Theekshana',type:'Spin',        econ: 6.8, wkts: 3 },
    { name: 'Matheesha Pathirana',type:'Fast',       econ: 8.5, wkts: 2 },
    { name: 'Tushar Deshpande', type: 'Fast',        econ: 9.0, wkts: 1 },
    { name: 'Moeen Ali',        type: 'Spin',        econ: 7.3, wkts: 1 },
  ],
  RCB: [
    { name: 'Mohammed Siraj',   type: 'Fast',        econ: 8.1, wkts: 2 },
    { name: 'Josh Hazlewood',   type: 'Fast',        econ: 7.6, wkts: 2 },
    { name: 'Alzarri Joseph',   type: 'Fast',        econ: 8.8, wkts: 1 },
    { name: 'Wanindu Hasaranga',type: 'Spin',        econ: 7.2, wkts: 3 },
    { name: 'Yash Dayal',       type: 'Fast-Medium', econ: 9.0, wkts: 1 },
    { name: 'Glenn Maxwell',    type: 'Spin',        econ: 8.5, wkts: 1 },
  ],
  KKR: [
    { name: 'Mitchell Starc',   type: 'Fast',        econ: 8.2, wkts: 2 },
    { name: 'Pat Cummins',      type: 'Fast',        econ: 7.5, wkts: 2 },
    { name: 'Harshit Rana',     type: 'Fast',        econ: 9.1, wkts: 1 },
    { name: 'Sunil Narine',     type: 'Spin',        econ: 6.5, wkts: 2 },
    { name: 'Varun Chakaravarthy',type:'Spin',       econ: 7.0, wkts: 3 },
    { name: 'Andre Russell',    type: 'Fast-Medium', econ: 9.5, wkts: 1 },
  ],
  RR: [
    { name: 'Trent Boult',      type: 'Fast-Medium', econ: 7.9, wkts: 2 },
    { name: 'Avesh Khan',       type: 'Fast',        econ: 9.2, wkts: 1 },
    { name: 'Sandeep Sharma',   type: 'Fast-Medium', econ: 8.5, wkts: 2 },
    { name: 'Yuzvendra Chahal', type: 'Spin',        econ: 7.5, wkts: 3 },
    { name: 'Ravichandran Ashwin',type:'Spin',       econ: 6.9, wkts: 2 },
    { name: 'Riyan Parag',      type: 'Spin',        econ: 8.8, wkts: 1 },
  ],
  DC: [
    { name: 'Anrich Nortje',    type: 'Fast',        econ: 7.8, wkts: 2 },
    { name: 'Kagiso Rabada',    type: 'Fast',        econ: 7.9, wkts: 2 },
    { name: 'Mitchell Marsh',   type: 'Fast-Medium', econ: 8.8, wkts: 1 },
    { name: 'Axar Patel',       type: 'Spin',        econ: 6.8, wkts: 2 },
    { name: 'Kuldeep Yadav',    type: 'Spin',        econ: 7.2, wkts: 3 },
    { name: 'Mukesh Kumar',     type: 'Fast',        econ: 9.0, wkts: 1 },
  ],
  PBKS: [
    { name: 'Arshdeep Singh',   type: 'Fast-Medium', econ: 8.0, wkts: 2 },
    { name: 'Kagiso Rabada',    type: 'Fast',        econ: 7.9, wkts: 2 },
    { name: 'Sam Curran',       type: 'Fast-Medium', econ: 8.5, wkts: 2 },
    { name: 'Rahul Chahar',     type: 'Spin',        econ: 7.8, wkts: 2 },
    { name: 'Harpreet Brar',    type: 'Spin',        econ: 7.5, wkts: 2 },
    { name: 'Nathan Ellis',     type: 'Fast',        econ: 9.2, wkts: 1 },
  ],
  LSG: [
    { name: 'Mark Wood',        type: 'Fast',        econ: 8.0, wkts: 2 },
    { name: 'Avesh Khan',       type: 'Fast',        econ: 9.2, wkts: 1 },
    { name: 'Ravi Bishnoi',     type: 'Spin',        econ: 7.0, wkts: 3 },
    { name: 'Marcus Stoinis',   type: 'Fast-Medium', econ: 9.0, wkts: 1 },
    { name: 'Krunal Pandya',    type: 'Spin',        econ: 7.5, wkts: 2 },
    { name: 'Mohsin Khan',      type: 'Fast',        econ: 8.3, wkts: 2 },
  ],
};

// ─── Batting pools per team ─────────────────────────────────────────────────
const teamBatsmen: Record<string, string[]> = {
  GT:   ['Shubman Gill', 'Sai Sudharsan', 'Jos Buttler', 'Shahrukh Khan', 'Rahul Tewatia', 'Glenn Phillips', 'Washington Sundar'],
  SRH:  ['Travis Head', 'Abhishek Sharma', 'Ishan Kishan', 'Heinrich Klaasen', 'Nitish Kumar Reddy', 'Liam Livingstone'],
  MI:   ['Rohit Sharma', 'Ishan Kishan', 'Suryakumar Yadav', 'Hardik Pandya', 'Tim David', 'Dewald Brevis'],
  CSK:  ['Ruturaj Gaikwad', 'Devon Conway', 'Shivam Dube', 'MS Dhoni', 'Moeen Ali', 'Ajinkya Rahane'],
  RCB:  ['Virat Kohli', 'Faf du Plessis', 'Glenn Maxwell', 'Raj Patidar', 'Dinesh Karthik', 'Cam Green'],
  KKR:  ['Sunil Narine', 'Phil Salt', 'Venkatesh Iyer', 'Shreyas Iyer', 'Andre Russell', 'Rinku Singh'],
  RR:   ['Yashasvi Jaiswal', 'Jos Buttler', 'Sanju Samson', 'Riyan Parag', 'Shimron Hetmyer', 'Dhruv Jurel'],
  DC:   ['Prithvi Shaw', 'David Warner', 'Mitchell Marsh', 'Rishabh Pant', 'Axar Patel', 'Lalit Yadav'],
  PBKS: ['Jonny Bairstow', 'Shikhar Dhawan', 'Sam Curran', 'Liam Livingstone', 'Jitesh Sharma', 'Atharva Taide'],
  LSG:  ['KL Rahul', 'Quinton de Kock', 'Nicholas Pooran', 'Marcus Stoinis', 'Deepak Hooda', 'Ayush Badoni'],
};

const matchSituations = {
  powerplay:  ['Powerplay, field restrictions in place, 2 slips allowed', 'Powerplay, captain leads the attack', 'Powerplay, need a breakthrough', 'Powerplay, batsmen looking to capitalise'],
  middle:     ['Middle overs, containment strategy', 'Middle overs, spin twin in play', 'Middle overs, set batsman accelerating', 'Middle overs, new batsman settling in'],
  death:      ['Death overs, yorker-length attack', 'Death overs, power hitters unleashed', 'Death overs, cutters and slower balls key', 'Final stretch, all out attack'],
};

const pitchConditions = [
  'True pitch, good carry to keeper',
  'Two-paced, some variable bounce',
  'Gripping for spinners',
  'Good batting track, fast outfield',
  'Hard and bouncy, movement off the seam',
  'Cracked surface, slower balls effective',
  'Pitch showing wear, helping spinners',
];

const fieldPositionSets = {
  powerplay:  ['Slip', 'Gully', 'Point', 'Cover', 'Mid Off', 'Mid On', 'Mid Wicket', 'Fine Leg Inner', 'Third Man Inner'],
  powerplayV2:['Slip', 'Gully', 'Point', 'Cover', 'Extra Cover', 'Mid Off', 'Mid On', 'Mid Wicket', 'Square Leg'],
  middle:     ['Point', 'Cover', 'Extra Cover', 'Mid Off', 'Long Off', 'Long On', 'Mid Wicket', 'Deep Square Leg', 'Deep Mid Wicket'],
  middleV2:   ['Point', 'Cover', 'Mid Off', 'Mid On', 'Mid Wicket', 'Long On', 'Deep Mid Wicket', 'Deep Square Leg', 'Long Off'],
  death:      ['Deep Cover', 'Long Off', 'Long On', 'Deep Mid Wicket', 'Deep Square Leg', 'Deep Fine Leg', 'Third Man Deep', 'Deep Point', 'Mid Wicket'],
  deathV2:    ['Deep Cover', 'Long Off', 'Long On', 'Deep Mid Wicket', 'Deep Square Leg', 'Deep Fine Leg', 'Third Man Deep', 'Deep Point', 'Cover'],
};

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────
function seededRand(seed: number): number {
  const x = Math.sin(seed * 127773 + 16807) * 2147483647;
  return (x - Math.floor(x));
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRand(seed) * arr.length)];
}

function shuffleSlice<T>(arr: T[], n: number, seed: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(seededRand(seed + i) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

// ─── Main generator ─────────────────────────────────────────────────────────
export function generateMatch(): {
  overs: Over[];
  team1: IPLTeam;
  team2: IPLTeam;
  venue: string;
  title: string;
} {
  const seed = Math.floor(Date.now() / 60000); // Changes every minute for variety

  // Pick 2 different teams
  const shuffledTeams = shuffleSlice(iplTeams2026, 10, seed);
  const battingTeam  = shuffledTeams[0];
  const bowlingTeam  = shuffledTeams[1];

  // Pick venue (one of the two home grounds)
  const venue = seededRand(seed + 77) > 0.5 ? battingTeam.homeGround : bowlingTeam.homeGround;
  const title = `${battingTeam.short} vs ${bowlingTeam.short}`;

  const bowlingPool = teamBowlers[bowlingTeam.short] || teamBowlers.SRH;
  const battingPool = teamBatsmen[battingTeam.short] || teamBatsmen.GT;

  const overs: Over[] = [];
  let runningRuns    = 0;
  let runningWickets = 0;
  let batIdx         = 0;

  for (let i = 0; i < 20; i++) {
    const overNum = i + 1;
    const ispp    = overNum <= 6;
    const isDeath = overNum >= 16;
    const phase   = ispp ? 'powerplay' : isDeath ? 'death' : 'middle';

    // Pick bowler for this over (avoid same bowler 3 overs in a row)
    const prevBowler = overs[i - 1]?.actualBowler;
    const prev2Bowler = overs[i - 2]?.actualBowler;
    const availBowlers = bowlingPool.filter(b => b.name !== prevBowler || b.name !== prev2Bowler);
    const bowlerData = pick(availBowlers.length ? availBowlers : bowlingPool, seed + i * 31);

    // Batsmen on strike
    if (runningWickets < battingPool.length - 2 && i > 0 && overs[i-1].overBalls.includes('W')) batIdx++;
    const striker    = battingPool[Math.min(batIdx, battingPool.length - 1)];
    const nonStriker = battingPool[Math.min(batIdx + 1, battingPool.length - 1)];

    // Over runs: powerplay 7–12, middle 6–11, death 10–18
    const minRuns = ispp ? 7 : isDeath ? 10 : 6;
    const maxRuns = ispp ? 14 : isDeath ? 20 : 13;
    const overRuns = minRuns + Math.floor(seededRand(seed + i * 17) * (maxRuns - minRuns));
    const hasWicket = !isDeath && seededRand(seed + i * 41) < 0.18;

    // Generate balls
    const balls: string[] = [];
    let remaining = overRuns;
    let wicketBall = hasWicket ? Math.floor(seededRand(seed + i * 53) * 5) + 1 : -1;
    for (let b = 0; b < 6; b++) {
      if (b === wicketBall) { balls.push('W'); if (runningWickets < 9) runningWickets++; continue; }
      if (b === 5) { balls.push(String(Math.max(0, remaining))); remaining = 0; continue; }
      const r = Math.min(remaining, Math.floor(seededRand(seed + i * 7 + b * 3) < 0.15 ? 6 : seededRand(seed + i * 11 + b * 5) < 0.25 ? 4 : seededRand(seed + i * 13 + b * 7) * 4));
      balls.push(String(r));
      remaining = Math.max(0, remaining - r);
    }

    runningRuns += overRuns;

    // Field placements
    const ppSets = [fieldPositionSets.powerplay, fieldPositionSets.powerplayV2];
    const midSets = [fieldPositionSets.middle, fieldPositionSets.middleV2];
    const deathSets = [fieldPositionSets.death, fieldPositionSets.deathV2];
    const placementSet = ispp ? ppSets[Math.floor(seededRand(seed + i * 3) * ppSets.length)]
      : isDeath ? deathSets[Math.floor(seededRand(seed + i * 5) * deathSets.length)]
      : midSets[Math.floor(seededRand(seed + i * 7) * midSets.length)];

    // Build 3 bowler options for user
    const otherBowlers = bowlingPool.filter(b => b.name !== bowlerData.name);
    const option2 = pick(otherBowlers, seed + i * 61);
    const option3 = pick(otherBowlers.filter(b => b.name !== option2.name), seed + i * 71);
    const bowlerOptions: BowlerOption[] = [bowlerData, option2, option3].map(b => ({
      name: b.name,
      type: b.type,
      economy: b.econ,
      wickets: b.wkts,
      recentCosts: Array.from({ length: 5 }, (_, j) => Math.floor(5 + seededRand(seed + i * 23 + j * 7) * 9)),
    }));

    const situationPool = matchSituations[phase];

    overs.push({
      overNumber: overNum,
      bowler: bowlerData.name,
      bowlerType: bowlerData.type,
      batsmanOnStrike: striker,
      batsmanNonStrike: nonStriker,
      strikerStats: {
        recentForm: Array.from({ length: 3 }, (_, j) => Math.floor(20 + seededRand(seed + i * 19 + j * 11) * 90)).join(','),
        weaknesses: pick(['short ball, LBW prone', 'spin, googly', 'short of length, swing', 'fuller length off-stump', 'pace, bouncers'], seed + i * 29),
        strikeRate: 120 + Math.floor(seededRand(seed + i * 37) * 60),
      },
      pitchCondition: pick(pitchConditions, seed + i * 43),
      matchSituation: pick(situationPool, seed + i * 47),
      actualFieldPlacements: placementSet,
      actualBowler: bowlerData.name,
      overResult: `${overRuns} runs, ${hasWicket ? '1 wicket' : '0 wickets'}`,
      overBalls: balls,
      bowlerOptions,
      runningScore: { runs: runningRuns, wickets: runningWickets },
    });
  }

  return { overs, team1: battingTeam, team2: bowlingTeam, venue, title };
}
