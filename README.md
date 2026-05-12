# TactIQ — IPL Fan Coaching Simulator

Be the captain. Outsmart the game.

A single-page web application where fans act as the captain each over, placing fielders and choosing the bowler. After the over, their decisions are scored against the actual captain's move using the Claude Anthropic API.

## Tech Stack

- React 19 + Vite 6 + TypeScript
- Tailwind CSS (dark stadium theme)
- Framer Motion (animations)
- Zustand (global match state)
- Recharts (final summary radar chart)
- Anthropic Claude API for scoring + tactical commentary

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create environment file:
   ```
   cp .env.example .env
   ```

3. Add your Anthropic API key to `.env`:
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-...
   ```

4. Start the dev server:
   ```
   npm run dev
   ```

5. Open http://localhost:5173

## Features

- **Lobby** — Immersive hero with rotating cricket ball, live fan counter, animated crowd bars
- **Login** — Quick email/username entry, persisted to localStorage
- **3-Column Match Dashboard** — Scoreboard, SVG cricket ground (26 field positions), timer, bowler selection, submit tactics
- **SVG Cricket Ground** — Full interactive field with 26 fixed position slots, click to place/remove numbered tokens (9 required)
- **30-Second Timer** — Conic-gradient countdown with auto-submit, color transitions (green → orange → red)
- **Captain Deciding Phase** — 8-second dramatic wait with IPL facts, live fan submit counter, progress bar
- **Over Result Modal** — Ground comparison (fan green vs captain orange, matched gold), ball-by-ball reveal, scored breakdown (field/bowling/bonus), AI analysis with word-by-word reveal, confetti (80+), leaderboard snapshot
- **Match Summary** — Total score, best over, grade, radar chart, over timeline with click-to-expand details, share card, play again
- **Immersive Details** — Live fan counter (fluctuating), sound FX via Web Audio API, floodlight glow animations, starburst matched positions

## Project Structure

```
tactiq/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── App.tsx                ← phase-based screen rendering
│   ├── main.tsx
│   ├── index.css              ← CSS variables + base styles
│   ├── types/index.ts         ← TypeScript interfaces
│   ├── data/matchData.ts      ← 20-over match data + field positions
│   ├── store/matchStore.ts    ← Zustand state management
│   ├── services/claudeApi.ts  ← Claude API + fallback scoring
│   └── components/
│       ├── Lobby.tsx
│       ├── Login.tsx
│       ├── MatchDashboard.tsx
│       ├── Ground.tsx         ← SVG cricket ground
│       ├── Scoreboard.tsx
│       ├── BowlerSelect.tsx
│       ├── Timer.tsx
│       ├── OverResult.tsx
│       ├── Leaderboard.tsx
│       └── MatchSummary.tsx
```

## API Key Free Mode

The app works fully without an API key using a built-in fallback scoring algorithm. Add an API key for Claude-powered tactical analysis.

## License

MIT
