import { create } from 'zustand';
import type { AnalysisResult, Over, Phase, User, MatchContext } from '../types';
import { iplTeams2026 } from '../data/teamData';

interface MatchState {
  user: User | null;
  currentOverIndex: number;
  fanPlacements: string[];
  selectedBowler: string | null;
  selectedCaptain: string | null;
  phase: Phase;
  overScores: AnalysisResult[];
  liveCounter: number;
  showResult: boolean;
  liveOvers: Over[];
  dataSource: 'live' | 'demo';
  matchTitle: string;
  matchId: string | null;
  matchContext: MatchContext | null;
  predictionHistory: AnalysisResult[];
  setUser: (user: User) => void;
  placeFielder: (position: string) => void;
  clearFielders: () => void;
  selectBowler: (name: string) => void;
  selectCaptain: (name: string) => void;
  submitPrediction: () => void;
  revealResult: (result: AnalysisResult) => void;
  nextOver: () => void;
  setPhase: (phase: Phase) => void;
  setLiveCounter: (counter: number) => void;
  setLiveOvers: (overs: Over[], source: 'live' | 'demo', title: string, matchId?: string) => void;
  setMatchContext: (ctx: MatchContext) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  currentOverIndex: 0,
  fanPlacements: [] as string[],
  selectedBowler: null as string | null,
  selectedCaptain: null as string | null,
  phase: 'lobby' as Phase,
  overScores: [] as AnalysisResult[],
  liveCounter: 2341,
  showResult: false,
  liveOvers: [] as Over[],
  dataSource: 'demo' as 'live' | 'demo',
  matchTitle: '',
  matchId: null as string | null,
  matchContext: null as MatchContext | null,
  predictionHistory: [] as AnalysisResult[],
};

export const useMatchStore = create<MatchState>((set) => ({
  ...initialState,
  setUser: (user) => set({ user, phase: 'predict' }),
  placeFielder: (position) =>
    set((state) => {
      const exists = state.fanPlacements.includes(position);
      return {
        fanPlacements: exists
          ? state.fanPlacements.filter((p) => p !== position)
          : state.fanPlacements.length < 9
            ? [...state.fanPlacements, position]
            : state.fanPlacements,
      };
    }),
  clearFielders: () => set({ fanPlacements: [] }),
  selectBowler: (name) =>
    set((state) => ({
      selectedBowler: state.selectedBowler === name ? null : name,
    })),
  selectCaptain: (name) =>
    set({ selectedCaptain: name }),
  submitPrediction: () => set({ phase: 'submitted' }),
  revealResult: (result) =>
    set((state) => ({
      phase: 'result',
      overScores: [...state.overScores, result],
      showResult: true,
    })),
  nextOver: () =>
    set((state) => ({
      currentOverIndex: state.currentOverIndex + 1,
      fanPlacements: [],
      selectedBowler: null,
      selectedCaptain: null,
      phase: 'predict',
      showResult: false,
    })),
  setPhase: (phase) => set({ phase }),
  setLiveCounter: (counter) => set({ liveCounter: counter }),
  setLiveOvers: (overs, source, title, matchId) => {
    // Auto-build match context from overs/teams
    const firstOver = overs[0];
    const lastOver = overs[overs.length - 1];
    const team1Name = firstOver?.batsmanNonStrike || 'Team 1';
    const team2Name = firstOver?.batsmanOnStrike || 'Team 2';
    const team1 = iplTeams2026.find((t) => team1Name.toLowerCase().includes(t.short.toLowerCase()) || team1Name.includes(t.name.split(' ')[0]));
    const team2 = iplTeams2026.find((t) => team2Name.toLowerCase().includes(t.short.toLowerCase()) || team2Name.includes(t.name.split(' ')[0]));

    const ctx: MatchContext = {
      team1: {
        name: team1?.name || team1Name,
        short: team1?.short || team1Name.substring(0, 2).toUpperCase(),
        captain: team1?.captain || 'Unknown',
        players: team1?.players || [],
        score: lastOver?.runningScore ? { ...lastOver.runningScore, overs: lastOver.overNumber } : { runs: 0, wickets: 0, overs: 0 },
        batting: true,
      },
      team2: {
        name: team2?.name || team2Name,
        short: team2?.short || team2Name.substring(0, 2).toUpperCase(),
        captain: team2?.captain || 'Unknown',
        players: team2?.players || [],
        score: { runs: 0, wickets: 0, overs: 0 },
        batting: false,
      },
      currentOver: 0,
      venue: 'Stadium',
      matchTitle: title,
      tossWinner: team1?.short || team1Name.substring(0, 2).toUpperCase(),
    };

    set({ liveOvers: overs, dataSource: source, matchTitle: title, matchId: matchId || null, matchContext: ctx });
  },
  setMatchContext: (ctx) => set({ matchContext: ctx }),
  reset: () => set({ ...initialState, liveCounter: 2341 }),
}));
