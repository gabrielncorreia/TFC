# Trybe Futebol Clube

A REST API for a football league: teams, matches and live standings, with JWT login for the people who record match results. A ready-made React front end consumes it.

## Live demo

Try it at **https://tfc-gabrielncorreia.vercel.app**. The login page shows a demo admin account (`admin@admin.com`) that can create, edit and finish matches. The demo data is restored every night at about midnight, Brasília time, so anything you change disappears by the next day.

The first request after a quiet period can take a few seconds while the API and the database wake up.

## Features

- Login with JWT and role-based access: only admins can create, edit and finish matches; other users get a read-only view
- List teams and matches, with a filter for matches in progress
- Create matches, update the score while they are in progress, and finish them
- Interface in Portuguese and English, following the browser language, with a switch in the header
- League tables computed from the results: overall, home games only and away games only, ranked by points, wins, goal difference, goals scored and goals conceded

## Stack

- **Back end:** Node.js, Express and TypeScript, layered into routes, controllers, services and Sequelize models
- **Database:** MySQL, with schema and seed data managed by Sequelize migrations and seeders
- **Auth:** JSON Web Tokens
- **Tests:** integration tests with Mocha, Chai and Sinon
- **Infrastructure:** Docker Compose runs the front end, the API and MySQL together locally
- **Hosting:** the front end and the API on Vercel, the database on TiDB Cloud (MySQL-compatible)

## API

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/login` | Log in and receive a token |
| `GET` | `/login/validate` | Return the role of the token's user |
| `GET` | `/teams` | List all teams |
| `GET` | `/teams/:id` | Get one team |
| `GET` | `/matches` | List matches; `?inProgress=true` or `false` filters them |
| `POST` | `/matches` | Create a match (admin token required) |
| `PATCH` | `/matches/:id` | Update a match's score (admin token required) |
| `PATCH` | `/matches/:id/finish` | Finish a match (admin token required) |
| `GET` | `/leaderboard` | Overall standings |
| `GET` | `/leaderboard/home` | Standings from home games |
| `GET` | `/leaderboard/away` | Standings from away games |
| `GET` | `/demo/reset` | Restore the demo data; called nightly by a Vercel cron job with `CRON_SECRET` |

Login is limited to 10 attempts per IP address every 15 minutes.

## About the project

Built individually at [Trybe](https://www.betrybe.com/), which provided the front end. The API, the database models, migrations and seeders, the Docker setup and the tests are mine.

## Running locally

Requires Docker with Docker Compose. The API signs its login tokens with a secret it reads from the `JWT_SECRET` environment variable and will not start without it. From the `app` folder, create an `app/.env` file holding a random value, then start the containers:

```sh
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
docker-compose up -d --build
```

The front end runs at http://localhost:3000 and the API at http://localhost:3001. The seeded local logins are `admin@admin.com` / `secret_admin` and `user@user.com` / `secret_user`; in production the seeder takes the passwords from `ADMIN_PASSWORD` and `USER_PASSWORD` instead. To run the tests, from `app/backend`:

```sh
npm install
npm test
```

## Deployment

The front end and the API are two Vercel projects built from this repository, with root directories `app/frontend` and `app/backend`. The database is a TiDB Cloud Starter instance. Its tables are created once with `npx sequelize-cli db:migrate`, and the nightly reset fills them.

| Variable | Project | Purpose |
| --- | --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` | API | Database connection; required in production |
| `DB_SSL` | API | `true` turns on verified TLS, which TiDB Cloud requires |
| `JWT_SECRET` | API | Signs login tokens; the API refuses to start without it |
| `ADMIN_PASSWORD`, `USER_PASSWORD` | API | Passwords of the seeded accounts in production; `ADMIN_PASSWORD` is the public demo password |
| `CRON_SECRET` | API | Protects `/demo/reset`; Vercel sends it with each cron call |
| `CORS_ORIGINS` | API | Comma-separated front-end origins allowed to call the API |
| `NODE_ENV` | API | `production` makes missing settings fail instead of using local defaults |
| `LOGIN_RATE_LIMIT` | API | Optional; login attempts per IP every 15 minutes (default 10) |
| `PORT` | API | Port for local runs (default 3001) |
| `REACT_APP_API_URL` | Front end | API address, compiled into the build |
| `REACT_APP_DEMO_EMAIL`, `REACT_APP_DEMO_PASSWORD` | Front end | Demo login shown on the login page; it is public by design |
| `REACT_APP_API_PORT` | Front end | Local API port when `REACT_APP_API_URL` is not set (default 3001) |
