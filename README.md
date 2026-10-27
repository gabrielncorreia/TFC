# Trybe Futebol Clube

A REST API for a football league: teams, matches and live standings, with JWT login for the people who record match results. A ready-made React front end consumes it.

## Features

- Login with JWT; creating and editing matches requires a valid token
- List teams and matches, with a filter for matches in progress
- Create matches, update the score while they are in progress, and finish them
- League tables computed from the results: overall, home games only and away games only, ranked by points, wins, goal difference, goals scored and goals conceded

## Stack

- **Back end:** Node.js, Express and TypeScript, layered into routes, controllers, services and Sequelize models
- **Database:** MySQL, with schema and seed data managed by Sequelize migrations and seeders
- **Auth:** JSON Web Tokens
- **Tests:** integration tests with Mocha, Chai and Sinon
- **Infrastructure:** Docker Compose runs the front end, the API and MySQL together

## API

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/login` | Log in and receive a token |
| `GET` | `/login/validate` | Return the role of the token's user |
| `GET` | `/teams` | List all teams |
| `GET` | `/teams/:id` | Get one team |
| `GET` | `/matches` | List matches; `?inProgress=true` or `false` filters them |
| `POST` | `/matches` | Create a match (token required) |
| `PATCH` | `/matches/:id` | Update a match's score |
| `PATCH` | `/matches/:id/finish` | Finish a match |
| `GET` | `/leaderboard` | Overall standings |
| `GET` | `/leaderboard/home` | Standings from home games |
| `GET` | `/leaderboard/away` | Standings from away games |

## About the project

Built individually at [Trybe](https://www.betrybe.com/), which provided the front end. The API, the database models, migrations and seeders, the Docker setup and the tests are mine.

## Running locally

Requires Docker with Docker Compose. From the `app` folder:

```sh
docker-compose up -d --build
```

The front end runs at http://localhost:3000 and the API at http://localhost:3001. To run the tests, from `app/backend`:

```sh
npm install
npm test
```
