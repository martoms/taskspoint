# Taskflow

Taskflow is a local-first task manager for organizing work with priorities, due dates, and clear progress tracking.

## Run it

Requirements: Node.js 24.15 or newer in the 24.x line, and npm 11.8.0.

```sh
npm ci
npm start
```

Open [http://localhost:4200](http://localhost:4200). The dev server binds to `0.0.0.0`, so another device on the same network can open the machine's LAN address on port 4200.

## Try it

- Add and edit tasks with a title, notes, status, priority, and due date.
- Search by title or notes; combine status and priority filters.
- Mark tasks complete, reopen them, or delete them.
- Reload the page. Tasks stay in this browser's local storage.
- Use browser devtools to inspect the `taskflow.tasks.v1` storage entry.

There is no server, account, or cross-device sync. Data belongs to the current browser profile.

## Checks

```sh
npm test
npm run e2e
npm run build
npm run format:check
```

The unit tests use Vitest. Playwright starts the app on port 4200 and checks the main browser flows in Chromium.

To save desktop and mobile screenshots plus an evidence report, start the app in one terminal, then run:

```sh
npm run ui:review
```

Screenshots and the report go to the ignored `artifacts/ui-review/` folder.

## Learn by tracing

1. Start at `src/main.ts` and `src/app/app.config.ts` to see how Angular boots.
2. Follow `src/app/app.routes.ts` into the lazy task routes.
3. Trace the task list page into `TaskStore`, then into `TaskStorage`.
4. Follow the editor's Signal Forms schema and submission action.
5. Change one behavior, add a test, and compare the screen before and after.

See [the learning guide](docs/learning-guide.md), [architecture](docs/architecture.md), [styleguide](docs/styleguide.md).
