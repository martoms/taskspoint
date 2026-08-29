import { Service } from '@angular/core';
import { Task, TASK_PRIORITIES, TASK_STATUSES } from '../models/task.model';

export type StorageIssue = 'corrupt' | 'unavailable';

export interface TaskStorageReadResult {
  tasks: Task[];
  issue: StorageIssue | null;
}

interface StoredTasks {
  version: 1;
  tasks: Task[];
}

@Service()
export class TaskStorage {
  private readonly key = 'taskflow.tasks.v1';

  read(): TaskStorageReadResult {
    let storedValue: string | null;

    try {
      storedValue = globalThis.localStorage.getItem(this.key);
    } catch {
      return { issue: 'unavailable', tasks: [] };
    }

    if (storedValue === null) {
      return { issue: null, tasks: [] };
    }

    try {
      const parsed: unknown = JSON.parse(storedValue);

      if (!this.isStoredTasks(parsed)) {
        return { issue: 'corrupt', tasks: [] };
      }

      return { issue: null, tasks: parsed.tasks };
    } catch {
      return { issue: 'corrupt', tasks: [] };
    }
  }

  write(tasks: Task[]): boolean {
    try {
      const value: StoredTasks = { version: 1, tasks };
      globalThis.localStorage.setItem(this.key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  clear(): boolean {
    try {
      globalThis.localStorage.removeItem(this.key);
      return true;
    } catch {
      return false;
    }
  }

  private isStoredTasks(value: unknown): value is StoredTasks {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }

    const record = value as Record<string, unknown>;
    return (
      record['version'] === 1 &&
      Array.isArray(record['tasks']) &&
      record['tasks'].every((task: unknown) => this.isTask(task))
    );
  }

  private isTask(value: unknown): value is Task {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false;
    }

    const task = value as Record<string, unknown>;
    return (
      typeof task['id'] === 'string' &&
      typeof task['title'] === 'string' &&
      typeof task['description'] === 'string' &&
      typeof task['status'] === 'string' &&
      TASK_STATUSES.includes(task['status'] as Task['status']) &&
      typeof task['priority'] === 'string' &&
      TASK_PRIORITIES.includes(task['priority'] as Task['priority']) &&
      (typeof task['dueDate'] === 'string' || task['dueDate'] === null) &&
      typeof task['createdAt'] === 'string' &&
      typeof task['updatedAt'] === 'string'
    );
  }
}
