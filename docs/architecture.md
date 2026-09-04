# Architecture

Taskflow is a single-page Angular 22 application. It uses standalone components, lazy feature routes, zoneless change detection, signals, and browser local storage.

## Request and update path

```text
Browser URL
  -> app.routes.ts
  -> lazy tasks.routes.ts
  -> page component
       -> TaskStore signals and actions
            -> TaskStorage
                 -> localStorage (taskflow.tasks.v1)
```

- `App` owns the shared header and router outlet.
- The task feature owns list and editor pages, task models, and data access.
- `TaskStore` owns in-memory state, CRUD actions, search/filter state, and derived counts.
- `TaskStorage` reads and writes the versioned storage envelope. It turns malformed data and browser storage failures into explicit issues instead of throwing into the UI.
- The list page renders signals and sends user actions to the store.
- The editor uses Signal Forms validation, then submits a task draft to the store.

Task writes update the signal state and persist a version 1 envelope. If saved JSON is corrupt, Taskflow preserves it until the user chooses **Clear saved copy**. If browser storage is unavailable, the current session remains usable but cannot persist between reloads.

## Source map

- `src/main.ts`, `src/app/app.config.ts`: bootstrap and providers.
- `src/app/app.routes.ts`: app-level routes.
- `src/app/features/tasks/tasks.routes.ts`: lazy task routes.
- `src/app/features/tasks/models/task.model.ts`: task and filter types.
- `src/app/features/tasks/data-access/`: state and persistence.
- `src/app/features/tasks/pages/`: list and editor UI.
- `src/styles.scss`: design tokens and shared controls.

## Boundaries

The app has no API, backend, authentication, analytics, or cross-device sync. Browser storage is the persistence boundary. Keep browser storage access inside `TaskStorage`; pages should depend on the store rather than touching storage directly.

## Validation

- `npm test`: focused unit and component tests.
- `npm run e2e`: browser flows for create, edit, reload, complete, delete, filters, and validation.
- `npm run build`: production bundle.
