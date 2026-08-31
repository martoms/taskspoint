import { Routes } from '@angular/router';

export const TASK_ROUTES: Routes = [
  {
    loadComponent: () =>
      import('./pages/task-list-page/task-list-page').then((module) => module.TaskListPage),
    path: '',
  },
  {
    loadComponent: () =>
      import('./pages/task-editor-page/task-editor-page').then((module) => module.TaskEditorPage),
    path: 'new',
  },
  {
    loadComponent: () =>
      import('./pages/task-editor-page/task-editor-page').then((module) => module.TaskEditorPage),
    path: ':taskId/edit',
  },
];
