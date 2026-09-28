# FinTrack (mm-fe)

FinTrack is the Angular frontend for the Money Management app — a personal finance SPA for tracking transactions, budgets, and dashboards. Built with Angular 21 (standalone components, signals), Tailwind CSS v4, and Vitest.

This is one of two independent apps in the repo (sibling `mm-be/` is the Express + Mongoose REST API). The frontend requires the backend running to authenticate and load data.

## Prerequisites

- Node.js and npm
- A `.env` file in `mm-fe/` defining `API_URL` (falls back to `http://localhost:3000` if unset)
- The `mm-be/` backend running (see its own README/CLAUDE.md for setup)

## Development server

To start a local development server, run:

```bash
npm start
```

This runs `prestart` first, which generates `src/environments/environment.ts` from `mm-fe/.env` (via `scripts/generate-env.js`) — that file is gitignored and should never be edited directly. Once the server is running, open `http://localhost:4200/`. The app will automatically reload whenever you modify source files.

## Building

To build the project for production, run:

```bash
npm run build
```

This regenerates the environment file and compiles to the `dist/` directory. Production budgets: 500kB warn / 1MB error for the initial bundle, 4kB warn / 8kB error per component stylesheet.

## Running unit tests

Unit tests run via [Vitest](https://vitest.dev/) using `@angular/build:unit-test`:

```bash
npm test
```

To run a single test file:

```bash
npx ng test --include src/features/settings/settings.spec.ts
```

If you run `ng test` directly (bypassing `npm test`/`npm start`), the environment file won't be generated automatically — run `npm run generate-env` first.

## Formatting

Code style is enforced with Prettier (`printWidth: 100`, single quotes, Angular parser for HTML). No linter is configured.

## Notes

- `db.json` and `json-server` in this repo are leftovers from before the real backend existed and are not used by the app.
- Auth, theming, and other architecture details are documented in the repo's `CLAUDE.md`.
