# Styleguide

Follow existing Angular patterns before adding a new abstraction. Keep page templates and styles near the page component, and keep persistence separate from UI state.

## Angular and TypeScript

- Use standalone components and lazy routes; do not add an NgModule.
- Use `ChangeDetectionStrategy.OnPush`, Angular signals, and `@Service()` for app services.
- Inject collaborators with `inject()`.
- Keep task types and labels in the task model module.
- Use Signal Forms for task editor validation and submission.
- Keep localStorage calls inside `TaskStorage`.
- Use lower-case kebab-case file names; name components and selectors for their task role.
- Prefer explicit types for task states, priorities, and filters.

## UI

- Use the shared palette and controls in `src/styles.scss`.
- Keep page content readable on small screens; list rows may wrap, and actions must remain reachable.
- Use semantic headings, landmarks, native inputs, visible keyboard focus, and labels for controls.
- Provide an empty state, no-results state, validation feedback, and a recovery message for saved-data errors.
- Preserve reduced-motion support.

## Change workflow

1. Trace the current behavior through page, store, and storage.
2. Add or update the narrowest test for the behavior.
3. Keep README and architecture notes aligned with real commands and data flow.
4. Check keyboard use and a narrow viewport after UI changes.
