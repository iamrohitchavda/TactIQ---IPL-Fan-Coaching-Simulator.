import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useMatchStore } from '../store/matchStore';
import { loadLiveMatchData } from '../services/liveMatchApi';
import { overByOver, matchInfo as demoMatchInfo } from '../data/matchData';
import { iplTeams2026 } from '../data/teamData';

interface LiveMatch {
  id: string;
  name: string;
  score: string;
  venue: string;
  teams: string[];
  isIpl: boolean;
}

export default function MatchSelector() {
  const { setPhase, setLiveOvers, setMatchContext } = useMatchStore();
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/currentMatches?offset=0');
        if (!res.ok) throw new Error('Server unavailable');
        const json = await res.json();
        const data = json?.data || [];
        const processed = data
          .filter((m: any) => {
            const n = (m.name || '').toLowerCase();
            const s = (m.series?.name || '').toLowerCase();
            return (
              m.status === 'LIVE' &&
              (n.includes('t20') || n.includes('ipl') || n.includes('twenty') || s.includes('ipl') || s.includes('t20'))
            );
          })
          .map((m: any) => ({
            id: m.id,
            name: m.name,
            score: (m.score || []).map((s: any) => `${s.inning}: ${s.r}/${s.w} (${s.o})`).join(', '),
            venue: m.venue || 'Unknown',
            teams: m.teams || [],
            isIpl: (m.name || '').toLowerCase().includes('ipl') || (m.series?.name || '').toLowerCase().includes('ipl'),
          }));

        const sorted = [...processed].sort((a, b) => (b.isIpl ? 1 : 0) - (a.isIpl ? 1 : 0));
        if (sorted.length > 0) {
          setLiveMatches(sorted.slice(0, 5));
          setError(null);
        } else {
          setError('No live T20 matches found');
        }
      } catch (err: any) {
        if (err.message === 'Server unavailable') {
          setError('Live server not available. Try demo mode.');
        } else {
          setError(err.message || 'Failed to load matches');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const buildContext = (team1Name: string, team2Name: string, title: string) => {
    const t1 = iplTeams2026.find((t) => team1Name.toLowerCase().includes(t.short.toLowerCase()));
    const t2 = iplTeams2026.find((t) => team2Name.toLowerCase().includes(t.short.toLowerCase()));
    setMatchContext({
      team1: {
        name: t1?.name || team1Name,
        short: t1?.short || team1Name.substring(0, 2).toUpperCase(),
        captain: t1?.captain || 'Unknown',
        players: t1?.players || [],
        score: { runs: 0, wickets: 0, overs: 0 },
        batting: true,
      },
      team2: {
        name: t2?.name || team2Name,
        short: t2?.short || team2Name.substring(0, 2).toUpperCase(),
        captain: t2?.captain || 'Unknown',
        players: t2?.players || [],
        score: { runs: 0, wickets: 0, overs: 0 },
        batting: false,
      },
      currentOver: 0,
      venue: 'Stadium',
      matchTitle: title,
      tossWinner: t1?.short || team1Name.substring(0, 2).toUpperCase(),
    });
  };

  const handleSelectLive = async (matchId: string, team1Name: string, team2Name: string, title: string) => {
    setLoading(true);
    buildContext(team1Name, team2Name, title);
    try {
      const data = await loadLiveMatchData(matchId);
      if (data?.overs && data.overs.length > 0) {
        setLiveOvers(data.overs, data.source, data.matchInfo?.name || title);
        setPhase('login');
      } else {
        setError('Could not load match data. Try demo instead.');
        setLoading(false);
      }
    } catch {
      setError('Failed to load match. Try demo instead.');
      setLoading(false);
    }
  };

  const handlePlayDemo = () => {
    buildContext(
      demoMatchInfo.team1Full || 'MI',
      demoMatchInfo.team2Full || 'RCB',
      `${demoMatchInfo.team1} vs ${demoMatchInfo.team2}`
    );
    setLiveOvers(overByOver, 'demo', `${demoMatchInfo.team1} vs ${demoMatchInfo.team2}`);
    setPhase('login');
  };

  const renderTeamInfo = (teamName: string) => {
    const team = iplTeams2026.find((t) => teamName.toLowerCase().includes(t.short.toLowerCase()));
    if (!team) return null;
    return (
      <div className="text-[10px] text-text-muted font-outfit mt-0.5">
        Captain: <span className="text-accent-gold">{team.captain}</span>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-bg-primary flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8">
          <h1 className="font-orbitron text-3xl font-bold text-accent-green">Tact<span className="text-white">IQ</span></h1>
          <p className="font-outfit text-text-muted mt-2">Pick a match and coach your team</p>
        </motion.div>

        {loading && (
          <div className="text-center py-12">
            <div className="flex justify-center gap-1 mb-4">
              <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-2 h-2 bg-accent-green rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
            <p className="font-outfit text-text-muted text-sm">Loading live matches...</p>
          </div>
        )}

        {error && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-bg-card border border-accent-orange/30 rounded-xl p-4 mb-6 text-center">
            <p className="font-outfit text-sm text-accent-orange">{error}</p>
          </motion.div>
        )}

        {!loading && liveMatches.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
              <span className="font-orbitron text-xs text-accent-green tracking-wider">LIVE MATCHES</span>
            </div>
            {liveMatches.map((m) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setMatchContext(/* will be set by handleSelectLive */ null as any);
                  handleSelectLive(m.id, m.teams[0] || '', m.teams[1] || '', m.name);
                }}
                className="w-full bg-bg-card border border-white/10 hover:border-accent-green/50 rounded-xl p-4 text-left transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron text-sm font-bold text-white">{m.teams[0] || 'Team 1'} vs {m.teams[1] || 'Team 2'}</span>
                    {m.isIpl && <span className="text-[10px] px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded-full font-orbitron">IPL</span>}
                    <span className="text-[10px] px-2 py-0.5 bg-accent-green/20 text-accent-green rounded-full font-orbitron">LIVE</span>
                  </div>
                  <span className="font-outfit text-xs text-text-muted">{m.venue}</span>
                </div>
                <p className="font-outfit text-sm text-accent-green mt-1">{m.score || 'Match in progress'}</p>
                <div className="flex gap-4 mt-1">
                  {renderTeamInfo(m.teams[0] || '')}
                  {renderTeamInfo(m.teams[1] || '')}
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {!loading && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="font-outfit text-xs text-text-muted">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handlePlayDemo}
              className="w-full bg-bg-card border border-accent-blue/30 hover:border-accent-blue rounded-xl p-5 text-center transition-all"
            >
              <div className="text-2xl mb-2">🏏</div>
              <p className="font-orbitron text-sm font-bold text-accent-blue">PLAY DEMO MATCH</p>
              <p className="font-outfit text-xs text-text-muted mt-1">
                MI vs RCB • Wankhede Stadium • 20 overs
              </p>
              <div className="flex gap-4 justify-center mt-2 text-[10px] text-text-muted font-outfit">
                <span>MI Captain: <span className="text-accent-gold">Hardik Pandya</span></span>
                <span>RCB Captain: <span className="text-accent-gold">Virat Kohli</span></span>
              </div>
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
