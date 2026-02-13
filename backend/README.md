# Confessions Backend

Go/Fiber backend for authentication, confessions, comments, reactions, and realtime fan-out via Redis pub/sub + WebSocket.

## Tech stack

- Go 1.25
- Fiber v2
- GORM + PostgreSQL
- Redis (pub/sub + cache invalidation)
- JWT (HS256)

## Project structure

- `main.go`: server bootstrap, middleware, CORS, WebSocket endpoint, route setup.
- `config/`: DB initialization and UUID extension bootstrap.
- `controllers/`: HTTP handlers for auth, confessions, comments, reactions.
- `middleware/`: request middleware (`RequireAuth`).
- `models/`: GORM entities.
- `redis/`: Redis client and pub/sub subscriber.
- `routes/`: route registration.
- `utils/`: password hash, JWT, and email helpers.
- `websockets/`: in-memory WebSocket client registry and broadcast helper.

## Prerequisites

- Go `>= 1.25`
- PostgreSQL (with permission to create extension `uuid-ossp`)
- Redis

## Environment variables

Required:

- `DATABASE_URL`: PostgreSQL DSN used by GORM.
- `JWT_SECRET`: signing secret for JWT generation/validation.

Optional:

- `PORT`: API server port. Default: `5000`.
- `REDIS_ADDR`: Redis host:port. Default: `redis:6379`.
- `CORS_ALLOW_ORIGINS`: CORS allowlist string for Fiber CORS middleware. Default: `http://localhost:5173`.
- `RATE_LIMIT_MAX`: max requests per rate-limit window per client IP. Default: `100`.
- `RATE_LIMIT_WINDOW`: rate-limit window duration (Go duration format). Default: `1m`.

Example `.env`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/confessions?sslmode=disable
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
REDIS_ADDR=localhost:6379
CORS_ALLOW_ORIGINS=http://localhost:5173
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=1m
```

## Run locally

```bash
go mod download
go run .
```

Server:

- API base: `http://localhost:5000/api`
- WebSocket: `ws://localhost:5000/ws`

## Run with Docker (dev image)

The included `Dockerfile` installs `air` and starts the app with live reload.

```bash
docker build -t confessions-backend .
docker run --rm -p 5000:5000 --env-file .env confessions-backend
```

## Testing

Run all tests:

```bash
go test ./...
```

Current tests cover middleware auth, utility helpers, and Redis payload parsing helper.

## API overview

Public:

- `POST /api/register`
- `POST /api/login`

Protected (requires `Authorization: Bearer <token>`):

- `POST /api/confessions/`
- `GET /api/confessions/`
- `PUT /api/confessions/:id`
- `DELETE /api/confessions/:id`
- `POST /api/confessions/:id/star`
- `POST /api/confessions/:id/react`
- `GET /api/confessions/:id/comments`
- `POST /api/comments/:id`
- `PUT /api/comments/:id`
- `DELETE /api/comments/:id`
- `POST /api/comments/:id/react`
- `GET /api/comments/:id`
- `DELETE /api/reactions/:id/remove`

## Realtime and cache flow

- Controllers publish events to Redis channels in the `confessions:*` namespace.
- `redis.StartSubscriber()` listens to those channels and invalidates cache keys.
- A Redis pattern subscription in `main.go` rebroadcasts payloads to all connected WebSocket clients.
- On shutdown, Redis subscriber and websocket broadcaster goroutines are canceled via context.

## Security and operational notes

- JWT algorithm is explicitly enforced as `HS256` in middleware.
- Mutation endpoints enforce ownership checks for update/delete actions.
- `uuid-ossp` extension is created during startup for UUID defaults.
- Auto-migration runs at startup; use controlled migrations for strict production governance.
- Graceful shutdown handles `SIGINT`/`SIGTERM` and closes Fiber, Redis, and websocket connections.

## Known limitations

- No request rate limiting yet.
- No structured audit logging yet.
- No integration tests for DB-backed handlers yet.

## Suggested next steps

- Add integration tests for controller paths using a test Postgres instance.
- Add OpenAPI/Swagger spec for route contracts.
- Add graceful shutdown with context cancellation for Redis/websocket workers.
