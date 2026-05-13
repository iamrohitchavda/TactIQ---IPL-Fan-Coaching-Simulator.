# 🏏 TactIQ — Be the Captain. Outsmart the Game.

TactIQ is a real-time IPL cricket strategy game where **you** set the field and pick the bowler before every over — competing against the captain's actual decisions.

---

## 🎙️ Signature Feature: Live AI Voice Commentary

> **TactIQ talks to you — no config, no API key, no downloads needed.**

Every action in the game is narrated by a **Google UK English Female voice** using the browser's built-in Web Speech API:

| Trigger | Voice Says |
|---|---|
| Over starts | *"You have 30 seconds! Place your fielders and select your bowler."* |
| You place a fielder | *Speaks the position name (e.g. "Mid On", "Deep Square Leg")* |
| You pick a bowler | *"[Bowler name] selected"* |
| Countdown (last 10s) | *"10… 9… 8… 7…"* with increasing urgency |
| Time's up | *"Time's up!"* |
| Next over in 3s | *"Moving to the next over!"* |

Toggle the **🔊 / 🔇** button in the top bar to mute/unmute at any time. Muting cancels any ongoing speech immediately.

> Works best in **Chrome** (uses Google UK English Female voice). Firefox/Safari fall back to their default English voice.

---

## 🚀 Running Locally — 3 Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in browser
# → http://localhost:5173
```

**That's it.** No API keys. No `.env` setup. No backend needed.

---

## 🎮 How to Play

1. **Enter as Coach** on the lobby screen
2. A **random IPL match** is generated (different teams & stadium every session)
3. Each over you have **30 seconds** to:
   - Place **9 fielders** on the ground by tapping positions
   - Select **1 bowler** from the options
4. When you complete your selection, it **auto-submits** — no button needed
5. See how your tactics compare to the captain's decisions
6. After **10 seconds** of viewing your result, the next over starts automatically
7. After 20 overs, view the **Final Leaderboard** and your match grade

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| State | Zustand |
| Voice | Web Speech API (built into browser) |
| Scoring | 100% local — no backend |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Lobby.tsx          # Landing screen + random match generator
│   ├── MatchDashboard.tsx  # Main game screen (field + timer + bowler)
│   ├── Ground.tsx         # Interactive cricket field SVG
│   ├── Timer.tsx          # 30-second countdown with voice
│   ├── BowlerSelect.tsx   # Bowler selection panel
│   ├── OverResult.tsx     # Score reveal + 10s auto-next
│   └── MatchSummary.tsx   # Final leaderboard + match report
├── data/
│   ├── matchGenerator.ts  # Random IPL match generator (all 10 teams)
│   └── teamData.ts        # Real IPL 2026 squads & stadiums
├── services/
│   ├── audioFx.ts         # 🎙️ Voice FX engine (Web Speech API)
│   └── claudeApi.ts       # Local scoring engine (no API needed)
└── store/
    └── matchStore.ts      # Global game state (Zustand)
```

---

## 🏟️ Supported IPL Teams

GT · SRH · MI · CSK · RCB · KKR · RR · DC · PBKS · LSG

Every match randomly pairs 2 teams with their real bowlers, batsmen, and home stadium. Seed changes every minute — you'll never play the same match twice.

---

## 📦 Build for Production

```bash
npm run build
# Output in dist/
```

---

## 🔇 No External APIs Used

All game logic, scoring, and match generation runs **entirely in your browser**.
The `server/` folder contains an optional CricAPI proxy for a live score ticker — it is **not required** to play the game.
