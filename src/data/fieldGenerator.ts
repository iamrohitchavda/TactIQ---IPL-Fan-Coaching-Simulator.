import { fieldPositions } from './matchData';

const powerplayTemplates: string[][] = [
  ['Slip', 'Gully', 'Point', 'Cover', 'Mid Off', 'Mid On', 'Mid Wicket', 'Square Leg', 'Fine Leg Inner'],
  ['Slip', 'Gully', 'Point', 'Cover', 'Extra Cover', 'Mid Off', 'Mid On', 'Mid Wicket', 'Fine Leg Inner'],
  ['Slip', 'Backward Point', 'Point', 'Cover', 'Mid Off', 'Mid On', 'Mid Wicket', 'Square Leg', 'Fine Leg Inner'],
];

const middleOversTemplates: string[][] = [
  ['Point', 'Cover', 'Extra Cover', 'Mid Off', 'Mid On', 'Mid Wicket', 'Long On', 'Deep Mid Wicket', 'Deep Square Leg'],
  ['Point', 'Cover', 'Mid Off', 'Long Off', 'Long On', 'Mid Wicket', 'Deep Mid Wicket', 'Deep Square Leg', 'Long On'],
  ['Cover', 'Extra Cover', 'Mid Off', 'Mid On', 'Mid Wicket', 'Long On', 'Deep Mid Wicket', 'Deep Square Leg', 'Deep Cover'],
];

const deathOversTemplates: string[][] = [
  ['Deep Cover', 'Long Off', 'Long On', 'Deep Mid Wicket', 'Deep Square Leg', 'Deep Fine Leg', 'Third Man Deep', 'Deep Point', 'Mid Wicket'],
  ['Deep Cover', 'Long Off', 'Long On', 'Deep Mid Wicket', 'Deep Square Leg', 'Deep Fine Leg', 'Third Man Deep', 'Deep Point', 'Cover'],
  ['Deep Cover', 'Long Off', 'Long On', 'Deep Mid Wicket', 'Deep Square Leg', 'Deep Fine Leg', 'Third Man Deep', 'Deep Point', 'Mid Off'],
];

const closeInPositions = new Set([
  'Slip', 'Leg Slip', 'Gully', 'Forward Short Leg', 'Silly Mid On',
  'Silly Mid Off', 'Backward Point', 'Fine Leg Inner', 'Third Man Inner',
]);

const boundaryPositions = new Set([
  'Deep Cover', 'Long Off', 'Long On', 'Deep Mid Wicket', 'Deep Square Leg',
  'Deep Fine Leg', 'Deep Backward Square', 'Third Man Deep', 'Deep Point',
]);

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function parseWeakness(weakness: string): {
  shortBall: boolean;
  spin: boolean;
  pace: boolean;
  sweep: boolean;
  legSide: boolean;
  offSide: boolean;
} {
  const w = weakness.toLowerCase();
  return {
    shortBall: w.includes('short') || w.includes('bouncer') || w.includes('pace'),
    spin: w.includes('spin') || w.includes('sweep') || w.includes('miscue'),
    pace: w.includes('pace') || w.includes('short') || w.includes('yorker') || w.includes('slower'),
    sweep: w.includes('sweep') || w.includes('miscue'),
    legSide: w.includes('leg') || w.includes('sweep'),
    offSide: w.includes('off') || w.includes('outside') || w.includes('slip'),
  };
}

export function generateFieldPlacements(
  overNumber: number,
  bowlerType: string,
  batsmanSR: number,
  weakness: string = '',
  overRuns: number = 8,
): string[] {
  let templates: string[][];
  if (overNumber <= 6) {
    templates = powerplayTemplates;
  } else if (overNumber <= 15) {
    templates = middleOversTemplates;
  } else {
    templates = deathOversTemplates;
  }

  const seed = overNumber * 7 + (bowlerType === 'Fast' ? 3 : bowlerType === 'Spin' ? 7 : 5);
  const idx = Math.floor(seededRandom(seed) * templates.length);
  const base = [...templates[idx]];

  const parsed = parseWeakness(weakness);
  const isAggressive = batsmanSR > 140;

  // Determine if field should shift leg-side or off-side based on weakness
  const shiftLeg = parsed.shortBall || parsed.legSide || (bowlerType === 'Fast' && isAggressive);
  const shiftOff = parsed.offSide || parsed.spin;
  const defendBoundary = isAggressive || overRuns > 10 || overNumber > 16;
  const attackClose = batsmanSR < 120 && !isAggressive && overNumber <= 10;

  // Swap positions based on context
  for (let i = 0; i < base.length; i++) {
    const pos = base[i];

    // Replace circle positions with deep if defending boundary
    if (defendBoundary && !closeInPositions.has(pos) && !boundaryPositions.has(pos) && seededRandom(seed + i * 3) > 0.6) {
      const deepReplacement = [...boundaryPositions].filter((d) => !base.includes(d));
      const chosen = deepReplacement[Math.floor(seededRandom(seed + i * 7) * deepReplacement.length)];
      if (chosen) base[i] = chosen;
    }

    // Replace with close-in catchers if attacking
    if (attackClose && !boundaryPositions.has(pos) && seededRandom(seed + i * 5) > 0.7) {
      const closeReplacement = [...closeInPositions].filter((c) => !base.includes(c));
      const chosen = closeReplacement[Math.floor(seededRandom(seed + i * 11) * closeReplacement.length)];
      if (chosen) base[i] = chosen;
    }

    // If batsman weak vs short ball, pull leg-side boundary riders in tighter
    if (shiftLeg && pos === 'Deep Square Leg' && seededRandom(seed + i) > 0.5) {
      base[i] = 'Square Leg';
    }
    if (shiftLeg && pos === 'Deep Fine Leg' && seededRandom(seed + i + 1) > 0.5) {
      base[i] = 'Fine Leg Inner';
    }

    // If batsman weak vs spin, add close-in off-side catchers
    if (shiftOff && pos === 'Long Off' && seededRandom(seed + i + 2) > 0.5) {
      base[i] = 'Extra Cover';
    }
    if (shiftOff && pos === 'Deep Cover' && seededRandom(seed + i + 3) > 0.5) {
      base[i] = 'Cover';
    }
  }

  // Pace bowlers get more leg-side fielders in death overs
  if (bowlerType === 'Fast' && overNumber > 16) {
    const hasDeepFine = base.includes('Deep Fine Leg');
    const hasFineInner = base.includes('Fine Leg Inner');
    if (!hasDeepFine && !hasFineInner && seededRandom(seed + 50) > 0.5) {
      const idx = Math.floor(seededRandom(seed + 51) * base.length);
      base[idx] = 'Deep Fine Leg';
    }
  }

  // Spin bowlers get more off-side fielders in middle overs
  if (bowlerType === 'Spin' && overNumber >= 7 && overNumber <= 15) {
    const hasSlip = base.includes('Slip');
    if (!hasSlip && seededRandom(seed + 60) > 0.5) {
      const idx = Math.floor(seededRandom(seed + 61) * base.length);
      base[idx] = 'Slip';
    }
  }

  const shuffled = [...fieldPositions].sort((a, b) => {
    const sa = seededRandom(seed + a.name.charCodeAt(0));
    const sb = seededRandom(seed + b.name.charCodeAt(0));
    return sa - sb;
  });

  const replacement = shuffled.find((p) => !base.includes(p.name));

  if (replacement && seededRandom(seed + 100) > 0.7) {
    const replaceIdx = Math.floor(seededRandom(seed + 200) * base.length);
    const copy = [...base];
    copy[replaceIdx] = replacement.name;
    return copy;
  }

  return base;
}

export function generateBowlerOptions(
  bowlers: { name: string; type: string; economy?: number; wickets?: number }[],
  overNumber: number
): { name: string; type: string; economy: number; wickets: number; recentCosts: number[] }[] {
  const shuffled = [...bowlers].sort((a, _b) => seededRandom(overNumber * 13 + a.name.length) - 0.5);
  const selected = shuffled.slice(0, 3);

  return selected.map((b) => ({
    name: b.name,
    type: b.type || 'Fast',
    economy: b.economy ?? +(6 + Math.random() * 4).toFixed(1),
    wickets: b.wickets ?? Math.floor(Math.random() * 3),
    recentCosts: Array.from({ length: 5 }, () => Math.floor(Math.random() * 8) + 4),
  }));
}

export function getPhaseLabel(overNumber: number): string {
  if (overNumber <= 6) return 'Powerplay, field restrictions applied';
  if (overNumber <= 15) return 'Middle overs, consolidation phase';
  return 'Death overs, yorkers and variations';
}
