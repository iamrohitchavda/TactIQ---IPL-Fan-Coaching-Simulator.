interface LiveScore {
  id: string;
  name: string;
  score: string;
  teams: string[];
  status: string;
  venue: string;
  isIpl: boolean;
}

export async function fetchLiveScores(): Promise<LiveScore[]> {
  try {
    const res = await fetch('/api/currentMatches?offset=0');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const data = json?.data || [];
    interface ScoreItem { inning: string; r: number; w: number; o: number }
    interface MatchData { id: string; name: string; score?: ScoreItem[]; teams?: string[]; venue?: string; status: string; series?: { name: string } }
    return data
      .filter((m: MatchData) => m.status === 'LIVE' || m.status === 'live')
      .slice(0, 8)
      .map((m: MatchData) => ({
        id: m.id,
        name: m.name,
        score: (m.score || []).map((s: ScoreItem) => `${s.inning}: ${s.r}/${s.w} (${s.o})`).join(', '),
        teams: m.teams || [],
        venue: m.venue || '',
        status: m.status,
        isIpl: (m.name || '').toLowerCase().includes('ipl') || (m.series?.name || '').toLowerCase().includes('ipl'),
      }));
  } catch (err) {
    console.error('Failed to fetch live scores:', err);
    return [];
  }
}
