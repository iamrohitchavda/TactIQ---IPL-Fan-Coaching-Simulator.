export interface BowlerOption {
  name: string;
  type: string;
  economy: number;
  wickets: number;
  recentCosts: number[];
}

export interface Over {
  overNumber: number;
  bowler: string;
  bowlerType: string;
  batsmanOnStrike: string;
  batsmanNonStrike: string;
  strikerStats: {
    recentForm: string;
    weaknesses: string;
    strikeRate: number;
  };
  pitchCondition: string;
  matchSituation: string;
  actualFieldPlacements: string[];
  actualBowler: string;
  overResult: string;
  overBalls: string[];
  bowlerOptions: BowlerOption[];
  runningScore: { runs: number; wickets: number };
}

export interface AnalysisResult {
  fieldScore: number;
  bowlingScore: number;
  bonusPoints: number;
  totalScore: number;
  matchedPositions: string[];
  missedPositions: string[];
  commentary: string;
  keyInsight: string;
  grade: string;
}

export interface User {
  email: string;
  username: string;
  password?: string;
}

export interface PredictSubmission {
  fanPlacements: string[];
  selectedBowler: string | null;
  selectedCaptain: string | null;
}

export type Phase = 'lobby' | 'matchSelect' | 'login' | 'predict' | 'submitted' | 'reveal' | 'result' | 'summary';

export interface MatchTeam {
  name: string;
  short: string;
  captain: string;
  players: string[];
  score: { runs: number; wickets: number; overs: number };
  batting: boolean;
}

export interface MatchContext {
  team1: MatchTeam;
  team2: MatchTeam;
  currentOver: number;
  venue: string;
  matchTitle: string;
  tossWinner: string;
}
