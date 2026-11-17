# Sweety – Blood Glucose Tracker

Record up to 4 blood glucose readings a day and see daily, month-to-date and previous-month reports.
**Stack:** Node.js + Express, Neon PostgreSQL, React (Vite). Auth uses bcrypt + JWT.

## Prerequisites
Node.js 18+ and PostgreSQL 14+ (or Docker).

## Install & set up the database
```bash
# 1. Start PostgreSQL (option A: Docker)
docker compose up -d
#    option B: use your own Postgres and create a database called "sweety"
#    option C: use Neon Postgres and connect the Database URL

# 2. Server
cd server
cp .env.example .env        # edit DATABASE_URL / JWT_SECRET if needed
npm install
npm run migrate             # creates the tables
npm run seed                # demo user: demo@sweety.app / demo1234

# 3. Client
cd ../client
npm install
```

## Run
```bash
cd server && npm run dev    # API on http://localhost:4000
cd client && npm run dev    # App on http://localhost:5173 (proxies /api to the server)
```

## Tests
```bash
cd server && npm test       # validation rules + report calculations (no database needed)
```

## API
| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | returns `{ token, user }` |
| GET | `/api/readings?date=&page=1&limit=20` | only the logged-in user's readings (paginated) |
| POST / PUT / DELETE | `/api/readings[/:id]` | validated, see rules below |
| GET | `/api/reports?date=YYYY-MM-DD` | daily + month-to-date + previous month |

Validation (server is the source of truth, UI shows the messages): value required; whole number 40–600; one reading per slot per day; max 4 per day; date not in the future. The DB also enforces `UNIQUE(user_id, date, slot)` and a `CHECK` on value, so rules hold even under race conditions.

## Notes
**Assumptions**
- "Monthly" report = the whole month *before* the selected date's month (e.g. 15 Oct → 1–30 Sep).
- "Future" is judged using the server's local date.
- Editing a reading counts against the same rules (it can't collide with another slot or move to a future date).
- Dates are stored as Postgres `DATE` (no timezone) and handled as `YYYY-MM-DD` strings to avoid timezone bugs.
- Password minimum is 6 characters; JWT is stored in `localStorage` for simplicity.


**With more time**
- API integration tests with supertest against a test database; frontend tests with React Testing Library.
- Line chart (Recharts), Redis caching of reports, httpOnly cookie auth, rate limiting on login.
- Highlight out-of-range readings (low/high) in the UI.
