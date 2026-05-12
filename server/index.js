import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, '.env') });
const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.CRICAPI_KEY || '';

const API_BASE = 'https://api.cricapi.com/v1';

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'] }));
app.use(express.json());

async function proxy(endpoint, res) {
  try {
    const sep = endpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE}${endpoint}${sep}apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(`Proxy error:`, err.message);
    res.status(502).json({ error: 'CricAPI fetch failed', detail: err.message });
  }
}

function asyncRoute(fn) {
  return (req, res, next) => fn(req, res).catch(next);
}

app.get('/api/currentMatches', asyncRoute(async (req, res) => {
  const offset = req.query.offset || 0;
  await proxy(`/currentMatches?offset=${offset}`, res);
}));

app.get('/api/matchScorecard', asyncRoute(async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Missing match id' });
  await proxy(`/match_scorecard?id=${id}`, res);
}));

app.get('/api/matchInfo', asyncRoute(async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Missing match id' });
  await proxy(`/match_info?id=${id}`, res);
}));

app.get('/api/players', asyncRoute(async (req, res) => {
  const search = req.query.search;
  if (!search) return res.status(400).json({ error: 'Missing search term' });
  await proxy(`/players?search=${encodeURIComponent(search)}`, res);
}));

app.get('/api/playerStats', asyncRoute(async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Missing player id' });
  await proxy(`/player_stats?id=${id}`, res);
}));

app.get('/api/espn-rss', async (req, res) => {
  try {
    const rsp = await fetch('https://static.espncricinfo.com/rss/livescores.xml');
    const text = await rsp.text();
    res.set('Content-Type', 'application/xml');
    res.send(text);
  } catch (err) {
    res.status(502).json({ error: 'ESPN RSS fetch failed' });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

app.listen(PORT, () => {
  console.log(`TactIQ proxy running on :${PORT}${API_KEY ? ' (CricAPI key set)' : ' (NO CricAPI key)'}`);
});
