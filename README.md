# Taskflow

A local-first task manager built with Angular 22. Organize work with task status, priority, due dates, and notes, then search and filter the list as it grows.

## Run locally

Requirements: Node.js 24.15 or newer in the 24.x line, and npm 11.8.0.

```sh
npm ci
npm start
```

Open [http://localhost:4200](http://localhost:4200). Tasks are stored in this browser's local storage.

## Available commands

```sh
npm test
npm run e2e
npm run build
npm run format:check
```

Unit and component tests use Vitest. Playwright covers the main task flows in Chromium.
