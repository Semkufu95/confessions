Backend (Go/Fiber)

Directory layout:

- `main.go`: app entrypoint, middleware setup, WebSocket endpoint, route registration.
- `config/`: database initialization and UUID extension setup.
- `controllers/`: HTTP handlers for auth, confessions, comments, and reactions.
- `middleware/`: auth middleware.
- `models/`: GORM data models.
- `redis/`: Redis client and pub/sub subscriber for cache invalidation.
- `routes/`: API route registration.
- `utils/`: utility helpers (password hashing, JWT, email format validation).
- `websockets/`: connected-client tracking and broadcast helper.

Notes:

- Auth is JWT-based. Protected routes are mounted under `/api`.
- Redis pub/sub channels use the `confessions:*` namespace.
- Database schema is auto-migrated at startup.
