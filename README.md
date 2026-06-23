# Quizify

A real-time multiplayer pub quiz web app. A host creates a game, players join via code or QR, and everyone plays through categorized rounds with live scoring.

Built with Next.js + Node.js/Express + Socket.IO.

**Live demo:** https://quizify-sooty-mu.vercel.app/

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express, Socket.IO, TypeScript |
| Real-time | Socket.IO (WebSocket with fallback) |
| Deployment | Railway (backend), Vercel (frontend) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Quick start

```powershell
.\start-dev.ps1
```

This starts both the backend and frontend concurrently.

### Manual start

```powershell
# Terminal 1 — backend (http://localhost:3001)
cd backend
npm install
npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
```

---

## Environment Variables

**backend/.env**

```
PORT=3001
CORS_ORIGINS=http://localhost:3000
```

**frontend/.env.local**

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

---

## Project Structure

```
├── backend/
│   └── src/
│       ├── index.ts          # Express server + all socket event handlers
│       ├── gameManager.ts    # Room, player, and scoring logic
│       ├── questions.ts      # 60 hardcoded questions across 6 categories
│       └── types.ts          # Shared TypeScript interfaces
├── frontend/
│   └── app/
│       ├── page.tsx              # Landing page
│       ├── host/setup/           # Quiz configuration (name, duration, category)
│       ├── host/game/[code]/     # Host game view (waiting room → live → leaderboard)
│       ├── join/                 # Join by code + nickname
│       ├── join/[code]/          # Join via QR code pre-fill
│       └── play/                 # Player game screen (all states)
├── start-dev.ps1             # Dev startup script
```

---

## How It Works

1. **Host** visits `/host/setup`, configures a quiz, and gets a 4-letter room code + QR code.
2. **Players** join at `/join` or scan the QR to land on `/join/[code]`.
3. Host starts the game; questions are broadcast to all players via Socket.IO.
4. Players answer within the time limit — faster correct answers score more points.
5. After each round a leaderboard is shown; final scores are displayed at the end.

### Scoring

- Correct answer: **100 pts**
- Speed bonus: up to **50 pts** (proportional to time remaining)

### Quiz lengths

| Mode | Rounds | Questions per round |
|---|---|---|
| Short | 2 | 5 |
| Medium | 4 | 5 |
| Long | 6 | 5 |

---

## Socket Events

### Client → Server

| Event | Description |
|---|---|
| `host:create` | Create a new room |
| `host:start` | Start the quiz |
| `host:next` | Advance to next question or round |
| `host:skip` | Skip remaining wait time |
| `player:join` | Join a room with a nickname |
| `player:answer` | Submit an answer |

### Server → Client

| Event | Description |
|---|---|
| `quiz:started` | Quiz has begun |
| `quiz:question` | New question (answer hidden from players) |
| `quiz:question-ended` | Reveals correct answer + updated scores |
| `quiz:round-end` | End-of-round leaderboard |
| `quiz:ended` | Final scores |
| `quiz:answer-received` | Count of players who have answered |
| `quiz:player-joined` | A new player joined the waiting room |
| `quiz:host-disconnected` | Host left the game |
| `quiz:player-left` | A player disconnected |

---

## Known Limitations

- Game state is **in-memory only** — a server restart wipes all active games.
- No reconnection recovery for dropped players.
- Teams mode UI exists but only solo scoring is implemented.
