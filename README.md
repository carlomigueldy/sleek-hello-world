# sleek-hello-world

A sleek **Hello, World.** landing page with smooth animations, a live message feed, and a SQLite-backed REST API.

**Live:** [https://sleek-hello-world.vercel.app](https://sleek-hello-world.vercel.app)

---

## Features

- Aurora background + shimmer headline + staggered fade-in-up animations
- Leave a message with an optional author name (280-char limit)
- Paginated message feed with cursor-based pagination
- Rate limiting on message submission
- FeaturedMessage component + ServerPing latency badge
- Dark mode support

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/messages` | List messages (paginated, `?limit=N&before=ID`) |
| POST | `/api/messages` | Submit a message `{content, author?}` |
| GET | `/api/messages/random` | Get a random message |

## Running locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:4050](http://localhost:4050) (configured in `next.config.ts`).

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Tailwind CSS v4](https://tailwindcss.com)
- Deployed on [Vercel](https://vercel.com)
