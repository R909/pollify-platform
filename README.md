# 🐾 Pollify — Full-Stack Poll Platform

A production-ready poll platform with real-time analytics, public share links, authentication, expiry, and Socket.io live updates.

---

## Tech Stack

| Layer      | Tech                                              |
|------------|---------------------------------------------------|
| Frontend   | React 18 + TypeScript + Vite + Tailwind CSS       |
| Backend    | Node.js + Express + TypeScript                    |
| Database   | PostgreSQL 15 (Docker)                            |
| Auth       | JWT (jsonwebtoken) + bcryptjs                     |
| Validation | Zod                                               |
| Real-time  | Socket.io (WebSockets)                            |
| HTTP       | Axios                                             |

---

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 18+
- npm

---

### 1. Start the Database

```bash
docker compose up postgres -d
```

This starts PostgreSQL on `localhost:5432`. The schema is auto-created on first backend run.

---

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

Server starts at **http://localhost:4000**

---

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

App starts at **http://localhost:5173**

---

### Run Everything with Docker

```bash
docker compose up --build
```

This starts Postgres + Backend together. Run frontend separately with `npm run dev`.

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=4000
DATABASE_URL=postgresql://pollify:pollify123@localhost:5432/pollify
JWT_SECRET=pollify_super_secret_jwt_key_2024
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

---

## API Reference

### Auth
| Method | Route              | Auth | Description       |
|--------|--------------------|------|-------------------|
| POST   | /api/auth/register | —    | Create account    |
| POST   | /api/auth/login    | —    | Sign in           |
| GET    | /api/auth/me       | JWT  | Get current user  |

### Polls
| Method | Route                          | Auth     | Description                |
|--------|--------------------------------|----------|----------------------------|
| POST   | /api/polls                     | Required | Create poll                |
| GET    | /api/polls/my                  | Required | My polls list              |
| GET    | /api/polls/share/:token        | —        | Get poll by share token    |
| POST   | /api/polls/share/:token/respond| —        | Submit response            |
| GET    | /api/polls/:id/analytics       | Required | Analytics (creator only)   |
| POST   | /api/polls/:id/publish         | Required | Publish results            |
| POST   | /api/polls/:id/close           | Required | Close poll                 |
| DELETE | /api/polls/:id                 | Required | Delete poll                |

---

## Socket.io Events

### Client → Server
| Event        | Payload       | Description             |
|--------------|---------------|-------------------------|
| `join_poll`  | `pollId`      | Subscribe to live updates |
| `leave_poll` | `pollId`      | Unsubscribe             |

### Server → Client
| Event              | Payload                | Description                  |
|--------------------|------------------------|------------------------------|
| `response_count`   | `{ count: number }`    | New total after each response |
| `analytics_update` | Full analytics object  | Per-option counts updated    |
| `poll_published`   | `{ poll_id }`          | Poll was published           |

---

## Feature Overview

### Authentication
- JWT-based, 7-day expiry
- Protected routes on frontend via `<ProtectedRoute>`
- `optionalAuth` middleware for public poll routes

### Poll Creation
- Title, description, anonymous toggle, expiry datetime
- Dynamic questions: add/remove questions and options
- Per-question mandatory/optional flag
- Minimum 2 options per question

### Public Poll Sharing
- Unique 12-char share token per poll
- `/poll/:token` — no login required to respond
- Auto-checks expiry before accepting responses
- Shows closed state or published results when appropriate

### Analytics
- Total response count (live via Socket.io)
- Per-question option breakdown with percentages
- Creator can publish results (closes poll, makes results public)

### Real-time
- Socket.io room per poll (`poll:<uuid>`)
- Every new response emits updated counts + full analytics to all subscribers in that room

---

## Database Schema

```
users         — id, email, name, password_hash, created_at
polls         — id, creator_id, title, description, is_anonymous, expires_at,
                is_published, is_closed, share_token, created_at
questions     — id, poll_id, text, is_mandatory, order_index
options       — id, question_id, text, order_index
responses     — id, poll_id, respondent_name, submitted_at
answers       — id, response_id, question_id, option_id
```

---

## Project Structure

```
pollify-platform/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts          # Express + Socket.io server
│   │   ├── db/index.ts       # Pool + schema init
│   │   ├── middleware/auth.ts # JWT middleware
│   │   ├── schemas/index.ts  # Zod schemas
│   │   └── routes/
│   │       ├── auth.ts       # /api/auth
│   │       └── polls.ts      # /api/polls
└── frontend/
    └── src/
        ├── api/
        │   ├── index.ts      # Axios client + API functions
        │   └── socket.ts     # Socket.io client
        ├── components/
        │   ├── ui.tsx         # Design system (Card, Btn, Input…)
        │   ├── Navbar.tsx
        │   └── ProtectedRoute.tsx
        ├── contexts/
        │   └── AuthContext.tsx
        └── pages/
            ├── Home.tsx
            ├── Login.tsx
            ├── Register.tsx
            ├── Dashboard.tsx   # Poll list + stats
            ├── CreatePoll.tsx  # Dynamic form builder
            ├── Analytics.tsx   # Live analytics dashboard
            └── PublicPoll.tsx  # Respond / view results
```
