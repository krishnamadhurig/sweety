# 🩸 Sweety – Blood Glucose Tracker

A small web app where a diabetes patient records up to 4 blood glucose readings a day
and views daily, month-to-date and monthly reports.

**Stack:** Node.js + Express API (MVC) · PostgreSQL · React (Vite)

## Demo

Screen recording: https://drive.google.com/file/d/1gvOob-ambWfAWcek69Kn8CUP28JflYfo/view?usp=sharing

## Features

- Sign up and log in. Passwords are hashed with bcrypt, sessions use JWT. Users only see their own readings.
- Add, view, edit and delete readings (date, time slot, value in mg/dl).
- Validation with clear messages in the UI: value required, whole number 40–600, one reading per slot per day, maximum 4 per day, no future dates.
- Reports with highest, lowest, average (1 decimal) and count, plus a friendly empty state:
  - **Daily**: the selected date (also lists each reading with its slot)
  - **Month-to-date**: 1st of the month up to the selected date
  - **Monthly**: the whole *previous* month
- Bonus: pagination on `GET /readings` (`?page=1&limit=20`).

## Project structure

```
sweety/
├── server/                 Express API (MVC)
│   ├── src/
│   │   ├── models/         User, Reading: the only code that runs SQL
│   │   ├── controllers/    auth, reading, report: read the request, apply rules, respond
│   │   ├── routes/         URL + method -> controller function
│   │   ├── services/       validation, dates, report maths (pure functions, unit tested)
│   │   ├── middleware/     JWT check
│   │   └── db/             schema.sql, migrate.js, seed.js, pool.js
│   └── tests/              unit tests (Node's built-in test runner)
├── client/                 React app (Vite): the View layer
│   └── src/components/     AuthForm, ReadingForm, ReadingsPage, ReportsPage
└── .env.example
```

## Prerequisites

- Node.js 20 or newer
- PostgreSQL 14 or newer

## Install
```bash
git clone https://github.com/krishnamadhurig/sweety.git
cd sweety

cd server && npm install
cd ../client && npm install
```

## Set up the database

1. Create a database user and database (in `psql`, pgAdmin or SQL Shell):

```sql
CREATE USER sweety WITH PASSWORD 'sweety';
CREATE DATABASE sweety OWNER sweety;
```

2. Create the settings file and edit `JWT_SECRET`:

```bash
cp .env.example server/.env
```

On Windows PowerShell: `copy .env.example server\.env`

3. Create the tables and the demo data:

```bash
cd server
npm run migrate    # creates the tables
npm run seed       # demo user + about 45 days of readings
```

Demo login: **demo@sweety.app** / **Demo@1234**

## Run

In two terminals:

```bash
# Terminal 1: API on http://localhost:4000
cd server
npm run dev

# Terminal 2: React app on http://localhost:5173
cd client
npm run dev
```

Open http://localhost:5173. In development Vite forwards `/api/*` to the server, so no CORS setup is needed.

## Run the tests

```bash
cd server
npm test
```

The tests cover the validation rules (required value, range 40–600, future dates, duplicate slot,
4 per day), the report maths (highest, lowest, average rounding, empty list) and the date ranges for the
daily, month-to-date and monthly reports (including January and leap-year February). They need no database.

## API summary

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` → `{ user, token }` |
| POST | `/auth/login` | `{ email, password }` → `{ user, token }` |
| GET | `/auth/me` | Current user |
| GET | `/readings?date=&page=&limit=` | List own readings (newest first) |
| POST | `/readings` | `{ date, slot, value }` |
| PUT | `/readings/:id` | Edit own reading |
| DELETE | `/readings/:id` | Delete own reading |
| GET | `/reports/daily?date=` | Stats and the day's readings |
| GET | `/reports/month-to-date?date=` | Stats from the 1st to the date |
| GET | `/reports/monthly?date=` | Stats for the month before the date's month |

`/readings` and `/reports` need the header `Authorization: Bearer <token>`.
Slots: `morning`, `after_breakfast`, `after_lunch`, `after_dinner`.
Errors come back as `{ "error": "message", "errors": { "field": "message" } }`.

## Notes

### Assumptions

- **Dates are plain `YYYY-MM-DD` strings** (and a PostgreSQL `DATE`), never timestamps, so time zones cannot move a reading to another day.
- **"Future" is judged by the server's date.** The browser also blocks future dates in the date picker.
- **Monthly report = the month before the selected date's month** (selected 15 Oct → 1–30 Sep), as in the brief's example.
- **When a day already has 4 readings, the "4 per day" message is shown** before the "duplicate slot" message.
- **Rules are enforced in three places:** the browser (instant feedback), the API (source of truth) and the database (`CHECK` and `UNIQUE` constraints), so two requests at the same moment cannot create a duplicate.
- The login error is the same for an unknown email and a wrong password, so the API does not reveal which emails are registered.
- Passwords need at least 8 characters.
- The JWT is kept in `localStorage` for simplicity.

### What I would improve with more time

- API integration tests (supertest with a test database) and React Testing Library tests for the reading form.
- A line chart of readings over the month (Recharts).
- Store the user's time zone, so "future date" is judged in their local time.
- Move the token to an httpOnly cookie, add rate limiting on login and a password reset flow.
- Report caching, a daily reminder background job and a doctor role.
- Highlight readings that are very low or very high.