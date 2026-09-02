import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Task } from '../models/task.model';
import { TaskStorage } from './task-storage';

const savedTask: Task = {
  id: 'task-1',
  title: 'Prepare notes',
  description: 'Collect the key points',
  status: 'todo',
  priority: 'medium',
  dueDate: '2099-05-12',
  createdAt: '2026-01-01T09:00:00.000Z',
  updatedAt: '2026-01-01T09:00:00.000Z',
};

describe('TaskStorage', () => {
  let storage: TaskStorage;

  beforeEach(() => {
    localStorage.clear();
    storage = new TaskStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts with an empty list when no data is saved', () => {
    expect(storage.read()).toEqual({ tasks: [], issue: null });
  });

  it('round-trips a versioned task list through local storage', () => {
    expect(storage.write([savedTask])).toBe(true);

    expect(storage.read()).toEqual({ tasks: [savedTask], issue: null });
    expect(JSON.parse(localStorage.getItem('taskflow.tasks.v1') ?? '').version).toBe(1);
  });

  it('reports malformed or unsupported saved data without throwing', () => {
    localStorage.setItem('taskflow.tasks.v1', '{bad json');

    expect(storage.read()).toEqual({ tasks: [], issue: 'corrupt' });

    localStorage.setItem('taskflow.tasks.v1', JSON.stringify({ version: 2, tasks: [savedTask] }));

    expect(storage.read()).toEqual({ tasks: [], issue: 'corrupt' });
  });

  it('reports unavailable browser storage and failed writes', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage is blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage is full');
    });

    expect(storage.read()).toEqual({ tasks: [], issue: 'unavailable' });
    expect(storage.write([savedTask])).toBe(false);
  });

  it('clears the saved task list', () => {
    storage.write([savedTask]);

    expect(storage.clear()).toBe(true);
    expect(storage.read()).toEqual({ tasks: [], issue: null });
  });
});
