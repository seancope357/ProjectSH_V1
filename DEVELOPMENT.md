# Development Environment

## Options

- Dev Container (recommended): isolated, reproducible Node runtime and dependencies
- Local setup: use Node 20 via nvm and install dependencies

## Prerequisites

- Docker Desktop (for Dev Container)
- nvm (optional for local): `brew install nvm`

## Using Dev Container

1. Open this project in an editor that supports Dev Containers.
2. Reopen in Container; it will run `npm ci` and `npx prisma generate`.
3. Start dev server inside the container:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000`.

## Using Docker Compose

- Start:
  ```bash
  docker compose up
  ```
- Stop:
  ```bash
  docker compose down
  ```

## Local Setup (without Docker)

1. Ensure Node 20:
   ```bash
   nvm install && nvm use
   ```
2. Install dependencies and generate Prisma client:
   ```bash
   npm install && npx prisma generate
   ```
3. Create `.env.local` from `.env.example` and fill in keys.
4. Run dev server:
   ```bash
   npm run dev
   ```

## Debugging

- Start with inspector:
  ```bash
  npm run dev:inspect
  ```
- In Chrome, open `chrome://inspect` → "Open dedicated DevTools for Node".

## Testing

- Run tests:
  ```bash
  npm run test
  ```
- Coverage:
  ```bash
  npm run test:coverage
  ```
- UI mode:
  ```bash
  npm run test:ui
  ```

## Git Hooks

- Install hooks:
  ```bash
  npm run prepare
  ```
- On commit, staged files are linted and formatted via `lint-staged`.

## Notes

- Node version is pinned via `.nvmrc` to ensure consistency.
- Dev Container ensures dependency installation (`npm ci`) happens in a clean environment.
- Environment variables are documented in `README.md` and `SETUP.md`.
