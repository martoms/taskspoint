# Learning guide

Use browser devtools and tests as a map. Start with one path and follow it end to end.

## 1. Boot and routes

Read `src/main.ts`, `src/app/app.config.ts`, and `src/app/app.routes.ts`. Follow the lazy import into `tasks.routes.ts`. Add a temporary route mentally, then find where it would load a component.

## 2. Signals and derived UI

Open `task-store.ts`. Find the writable signals, computed summary, visible task list, and action methods. Change a filter in the browser and trace the event from the list page back to the derived signal.

Try changing the sort order. Add a focused store test before changing the implementation.

## 3. Forms and validation

Read `task-editor-page.ts` next to its template. Trace the model, Signal Forms schema, field binding, error message, and submission action. Try lowering the title limit, then adjust the test to describe the intended rule.

## 4. Persistence and recovery

Open `task-storage.ts` and inspect the `taskflow.tasks.v1` entry in browser devtools. Edit its JSON to make it invalid, reload the page, and observe the recovery notice. The app preserves corrupt saved data until the user clears it.

## 5. Browser behavior

Read `e2e/task-manager.spec.ts`. Each test follows a user flow through the rendered app. Try a task change in the UI, then extend an end-to-end test to lock in the behavior.

## Small exercises

- Add a tag field from model through form, storage, list rendering, and tests.
- Add a due-date filter and verify it composes with search and status.
- Add a store test for a storage write failure.
- Improve the task row's keyboard interaction without replacing native controls.

Make one change at a time. Run the narrowest related test first, then the full checks in the README when ready.
