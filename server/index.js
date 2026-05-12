import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
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

app.get('/api/currentMatches', (req, res) => {
  const offset = req.query.offset || 0;
  proxy(`/currentMatches?offset=${offset}`, res);
});

app.get('/api/matchScorecard', (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Missing match id' });
  proxy(`/match_scorecard?id=${id}`, res);
});

app.get('/api/matchInfo', (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Missing match id' });
  proxy(`/match_info?id=${id}`, res);
});

app.get('/api/players', (req, res) => {
  const search = req.query.search;
  if (!search) return res.status(400).json({ error: 'Missing search term' });
  proxy(`/players?search=${encodeURIComponent(search)}`, res);
});

app.get('/api/playerStats', (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Missing player id' });
  proxy(`/player_stats?id=${id}`, res);
});

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

app.listen(PORT, () => {
  console.log(`TactIQ proxy running on :${PORT}${API_KEY ? ' (CricAPI key set)' : ' (NO CricAPI key)'}`);
});
