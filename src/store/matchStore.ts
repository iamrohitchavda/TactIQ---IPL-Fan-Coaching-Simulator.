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
  isSubmitting: boolean;
  submissionError: string | null;

  setUser: (user: User) => void;
  placeFielder: (position: string) => void;
  clearFielders: () => void;
  selectBowler: (name: string) => void;
  selectCaptain: (name: string) => void;
  submitPrediction: () => void;
  timeoutSubmit: () => void;
  revealResult: (result: AnalysisResult) => void;
  nextOver: () => void;
  setPhase: (phase: Phase) => void;
  setLiveCounter: (counter: number) => void;
  setLiveOvers: (overs: Over[], source: 'live' | 'demo', title: string, matchId?: string) => void;
  setMatchContext: (ctx: MatchContext) => void;
  setSubmitting: (val: boolean) => void;
  setSubmissionError: (err: string | null) => void;
  updateScoresFromOvers: () => void;
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
  isSubmitting: false,
  submissionError: null as string | null,
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

  submitPrediction: () => set({ phase: 'submitted', isSubmitting: true, submissionError: null }),

  timeoutSubmit: () =>
    set((state) => {
      const over = state.liveOvers[state.currentOverIndex];
      const missedResult: AnalysisResult = {
        fieldScore: 0,
        bowlingScore: 0,
        bonusPoints: 0,
        totalScore: 0,
        matchedPositions: [],
        missedPositions: over?.actualFieldPlacements || [],
        commentary: 'You missed the submission window! The captain set the field without your input.',
        keyInsight: 'Time management is crucial in cricket captaincy. Plan your tactics faster next over.',
        grade: 'F',
      };
      return {
        phase: 'result',
        overScores: [...state.overScores, missedResult],
        showResult: true,
        isSubmitting: false,
        submissionError: null,
      };
    }),

  revealResult: (result) =>
    set((state) => {
      const newScores = [...state.overScores, result];
      return {
        phase: 'result',
        overScores: newScores,
        showResult: true,
        isSubmitting: false,
        submissionError: null,
      };
    }),

  nextOver: () =>
    set((state) => {
      const nextIdx = state.currentOverIndex + 1;
      const isComplete = nextIdx >= state.liveOvers.length;
      return {
        currentOverIndex: nextIdx,
        fanPlacements: [],
        selectedBowler: null,
        phase: isComplete ? 'summary' : 'predict',
        showResult: false,
        isSubmitting: false,
        submissionError: null,
      };
    }),

  setPhase: (phase) => set({ phase }),

  setLiveCounter: (counter) => set({ liveCounter: counter }),

  setSubmitting: (val) => set({ isSubmitting: val }),

  setSubmissionError: (err) => set({ submissionError: err }),

  setLiveOvers: (overs, source, title, matchId) => {
    set((state) => {
      if (state.matchContext) {
        return { liveOvers: overs, dataSource: source, matchTitle: title, matchId: matchId || null };
      }
      const firstOver = overs[0];
      const lastOver = overs[overs.length - 1];
      const team1Name = firstOver?.batsmanNonStrike || 'Team 1';
      const team2Name = firstOver?.batsmanOnStrike || 'Team 2';
      const team1 = iplTeams2026.find((t) =>
        team1Name.toLowerCase().includes(t.short.toLowerCase()) ||
        team1Name.includes(t.name.split(' ')[0])
      );
      const team2 = iplTeams2026.find((t) =>
        team2Name.toLowerCase().includes(t.short.toLowerCase()) ||
        team2Name.includes(t.name.split(' ')[0])
      );
      const lastScore = lastOver?.runningScore || { runs: 0, wickets: 0 };
      const ctx: MatchContext = {
        team1: {
          name: team1?.name || team1Name,
          short: team1?.short || team1Name.substring(0, 2).toUpperCase(),
          captain: team1?.captain || 'Unknown',
          players: team1?.players || [],
          score: { ...lastScore, overs: lastOver?.overNumber || 0 },
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
      return { liveOvers: overs, dataSource: source, matchTitle: title, matchId: matchId || null, matchContext: ctx };
    });
  },

  setMatchContext: (ctx) => set({ matchContext: ctx }),

  updateScoresFromOvers: () =>
    set((state) => {
      if (!state.matchContext || state.liveOvers.length === 0) return state;
      const currentOver = state.liveOvers[state.currentOverIndex];
      if (!currentOver) return state;
      return {
        matchContext: {
          ...state.matchContext,
          team1: {
            ...state.matchContext.team1,
            score: { ...currentOver.runningScore, overs: currentOver.overNumber },
          },
        },
      };
    }),

  reset: () => set({ ...initialState, liveCounter: 2341 }),
}));
