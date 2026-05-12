import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';
import { overByOver, matchInfo as demoMatchInfo } from '../data/matchData';
import { iplTeams2026 } from '../data/teamData';

export default function MatchSelector() {
  const { setPhase, setLiveOvers, setMatchContext, selectCaptain } = useMatchStore();

  useEffect(() => {
    const t1 = iplTeams2026.find((t) => t.short === demoMatchInfo.team1);
    const t2 = iplTeams2026.find((t) => t.short === demoMatchInfo.team2);

    const title = `${demoMatchInfo.team1} vs ${demoMatchInfo.team2}`;
    setMatchContext({
      team1: {
        name: t1?.name || demoMatchInfo.team1,
        short: t1?.short || demoMatchInfo.team1,
        captain: t1?.captain || 'Shubman Gill',
        players: t1?.players || [],
        score: { runs: 0, wickets: 0, overs: 0 },
        batting: true,
      },
      team2: {
        name: t2?.name || demoMatchInfo.team2,
        short: t2?.short || demoMatchInfo.team2,
        captain: t2?.captain || 'Pat Cummins',
        players: t2?.players || [],
        score: { runs: 0, wickets: 0, overs: 0 },
        batting: false,
      },
      currentOver: 0,
      venue: demoMatchInfo.venue,
      matchTitle: title,
      tossWinner: t1?.short || demoMatchInfo.team1,
    });

    setLiveOvers(overByOver, 'live', title);
    selectCaptain('Pat Cummins');

    const timer = setTimeout(() => setPhase('login'), 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="text-center">
        <div className="flex justify-center gap-2 mb-4">
          <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
          <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="font-orbitron text-xs text-accent-green tracking-wider">LOADING</p>
          <p className="font-outfit text-sm text-text-muted mt-1">GT vs SRH • IPL 2026</p>
          <div className="mt-4 w-48 h-1 bg-white/[0.06] rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-accent-green rounded-full animate-progress-bar" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
