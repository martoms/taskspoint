import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  {
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then((module) => module.TASK_ROUTES),
    path: 'tasks',
  },
  { path: '**', redirectTo: 'tasks' },
];
