import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TaskDraft } from '../models/task.model';
import { TaskStore } from './task-store';

const createDraft = (overrides: Partial<TaskDraft> = {}): TaskDraft => ({
  title: 'Write project update',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  ...overrides,
});

describe('TaskStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates, updates, completes, deletes, and persists tasks', () => {
    const store = TestBed.inject(TaskStore);
    const created = store.createTask(createDraft({ title: '  Review goals  ' }));

    expect(created.title).toBe('Review goals');
    expect(store.getTask(created.id)?.title).toBe('Review goals');

    const updated = store.updateTask(
      created.id,
      createDraft({
        title: 'Review annual goals',
        priority: 'high',
        status: 'in-progress',
      }),
    );

    expect(updated).toBe(true);
    expect(store.getTask(created.id)?.priority).toBe('high');

    store.setStatus(created.id, 'done');
    expect(store.getTask(created.id)?.status).toBe('done');

    const saved = JSON.parse(localStorage.getItem('taskflow.tasks.v1') ?? '');
    expect(saved.tasks[0].title).toBe('Review annual goals');

    store.deleteTask(created.id);
    expect(store.allTasks()).toEqual([]);
    expect(JSON.parse(localStorage.getItem('taskflow.tasks.v1') ?? '').tasks).toEqual([]);
  });

  it('derives task counts and sorts dated tasks before undated tasks', () => {
    const store = TestBed.inject(TaskStore);
    const later = store.createTask(createDraft({ title: 'Later', dueDate: '2099-06-02' }));
    const overdue = store.createTask(createDraft({ title: 'Overdue', dueDate: '2000-01-01' }));
    store.createTask(createDraft({ title: 'Complete', status: 'done', dueDate: '2000-02-01' }));
    const undated = store.createTask(createDraft({ title: 'No due date' }));

    expect(store.summary()).toEqual({ total: 4, open: 3, completed: 1, overdue: 1 });
    expect(store.visibleTasks().map((task) => task.id)).toEqual([
      overdue.id,
      store.allTasks()[2].id,
      later.id,
      undated.id,
    ]);
  });

  it('composes search, status, and priority filters', () => {
    const store = TestBed.inject(TaskStore);
    const launchTask = store.createTask(
      createDraft({
        title: 'Plan product launch',
        description: 'Coordinate the launch notes',
        priority: 'high',
      }),
    );
    store.createTask(
      createDraft({
        title: 'Review budget',
        status: 'in-progress',
        priority: 'low',
      }),
    );

    store.setSearchText('launch');
    store.setStatusFilter('todo');
    store.setPriorityFilter('high');

    expect(store.visibleTasks().map((task) => task.id)).toEqual([launchTask.id]);

    store.setSearchText('budget');
    expect(store.visibleTasks()).toEqual([]);

    store.clearFilters();
    expect(store.visibleTasks()).toHaveLength(2);
  });

  it('keeps in-memory tasks safe when saved data is corrupt until it is cleared', () => {
    localStorage.setItem('taskflow.tasks.v1', '{bad json');
    const store = TestBed.inject(TaskStore);
    const created = store.createTask(createDraft());

    expect(store.storageIssue()).toBe('corrupt');
    expect(localStorage.getItem('taskflow.tasks.v1')).toBe('{bad json');

    store.clearSavedData();

    expect(store.storageIssue()).toBeNull();
    expect(JSON.parse(localStorage.getItem('taskflow.tasks.v1') ?? '').tasks[0].id).toBe(
      created.id,
    );
  });
});
