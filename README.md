# EventPulse — Event Management Backend API

Full backend for an event management platform: authentication & RBAC, events with
filtering/pagination/sorting/search, registration & capacity management, real-time
announcements over Socket.io, centralized validation & error handling, tests, and
API docs.

## 1) Setup

```bash
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
```

## 2) Run

```bash
npm run dev      # nodemon
npm start         # plain node
npm run seed      # populate sample categories, events and an admin user
npm test           # run unit + integration tests
```

Default seeded admin: `admin@eventpulse.com` / `Admin@1234`
(change this immediately after seeding a real/shared environment).

## 3) Key endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| GET | /api/events | Public |
| POST | /api/events | Admin |
| GET/PATCH/DELETE | /api/events/:id | Public GET, Admin write |
| POST | /api/events/:eventId/register | Authenticated |
| GET | /api/registrations/me | Authenticated |
| DELETE | /api/registrations/:id | Owner only |
| GET/POST | /api/events/:eventId/announcements | Public GET, Admin POST |
| GET | /health | Public |
| GET | /api-docs | Public (Swagger UI) |

## 4) Socket.io events

- Client emits `joinEvent` with an `eventId` to join that event's room.
- Server emits `newAnnouncement` to the room when an admin broadcasts a message.

## 5) Deployment

- Database: MongoDB Atlas (`MONGO_URI` in environment variables, never in code).
- Hosting: Vercel — set `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV` in the
  project's environment variable settings.
- `/health` confirms server + database availability post-deploy.

## 6) Git workflow

Commits follow Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
Tag the final release as `v1.0.0` and open a Pull Request describing the work.
