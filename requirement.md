# 🃏 Planning Poker – Steering Document (Next.js + Socket.IO)

## Overview
Real-time lightweight Planning Poker for agile teams.  
Single-repository Next.js app with integrated Socket.IO.

## MVP Goals
- Real-time collaborative estimation
- Support: Fibonacci (1,2,3,5,8,13,?) + T-Shirt (XS,S,M,L,XL)
- Room-based sessions (shareable URL)
- No authentication / login
- Responsive + dark mode friendly
- Local dev + single-container Docker

## Non-Goals (MVP)
- Persistent storage / history
- User accounts / teams
- Integrations (Jira, GitHub, etc.)
- Roles / permissions
- Voting timer

## Architecture
- Framework: Next.js 15 (App Router) + TypeScript
- Real-time: Socket.IO v4 (attached to Next.js)
- Styling: Tailwind CSS + shadcn/ui
- Client state: Zustand
- Store: In-memory (MVP) → Redis/Upstash later
- Deployment: Docker (single service)

## Folder Structure
```
planning-poker/
├─ app/
│  ├─ (room)/
│  │  ├─ page.tsx
│  │  └─ layout.tsx
│  ├─ api/socket/route.ts       ← Socket.IO server
│  ├─ layout.tsx
│  └─ page.tsx                  ← home / create room
├─ components/
│  ├─ ui/                       ← shadcn
│  ├─ VotingCards.tsx
│  ├─ ParticipantList.tsx
│  ├─ Consensus.tsx
├─ lib/
│  ├─ socket.ts                 ← typed client
│  ├─ socket-events.ts
│  └─ types.ts
├─ store/
│  └─ roomStore.ts              ← Zustand
├─ public/
├─ Dockerfile
├─ docker-compose.yml
├─ next.config.mjs
└─ tsconfig.json
```


## Data Models

```ts
enum EstimationMode { FIBONACCI = "FIBONACCI", TSHIRT = "TSHIRT" }

interface Participant {
  id: string        // socket.id
  name: string
  vote?: string | number
}

interface RoomState {
  roomId: string
  mode: EstimationMode
  revealed: boolean
  participants: Record<string, Participant>
}
```

## Socket Events

**Client → Server**

- join-room { roomId, name }
- vote { roomId, value }
- reveal { roomId }
- reset-round { roomId }
- change-mode { roomId, mode }

**Server → Client**

- room-state RoomState
- participant-join { name }
- participant-leave { id }
- votes-revealed RoomState

## Core Flow

1. Create / join room via URL
2. Select card → vote stored hidden
3. Reveal → show votes + consensus
4. Reset → new round

## Consensus

- Fibonacci: all equal → consensus; else min/max/avg
- T-Shirt: majority wins; tie → no consensus

## Tech Summary

| Layer     | Choice                  |
| --------- | ----------------------- |
| Framework | Next.js 15 App Router   |
| Real-time | Socket.IO v4            |
| UI        | Tailwind + shadcn/ui    |
| State     | Zustand                 |
| Container | Docker (single service) |
# Commands
## Dev
npm install
npm run dev

## Docker
docker compose up --build