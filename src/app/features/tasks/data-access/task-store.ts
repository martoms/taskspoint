import { computed, inject, Service, signal } from '@angular/core';
import {
  PriorityFilter,
  StatusFilter,
  Task,
  TaskDraft,
  TaskStatus,
  TaskSummary,
} from '../models/task.model';
import { StorageIssue, TaskStorage } from './task-storage';

@Service()
export class TaskStore {
  private readonly storage = inject(TaskStorage);
  private readonly storageIssueState = signal<StorageIssue | null>(null);

  readonly allTasks = signal<Task[]>([]);
  readonly searchText = signal('');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly priorityFilter = signal<PriorityFilter>('all');

  readonly visibleTasks = computed(() => {
    const query = this.searchText().trim().toLocaleLowerCase();
    const status = this.statusFilter();
    const priority = this.priorityFilter();

    return this.allTasks()
      .filter((task) => {
        const matchesText =
          query.length === 0 ||
          task.title.toLocaleLowerCase().includes(query) ||
          task.description.toLocaleLowerCase().includes(query);
        const matchesStatus = status === 'all' || task.status === status;
        const matchesPriority = priority === 'all' || task.priority === priority;

        return matchesText && matchesStatus && matchesPriority;
      })
      .sort((left, right) => {
        if (left.dueDate && right.dueDate) {
          return (
            left.dueDate.localeCompare(right.dueDate) ||
            right.createdAt.localeCompare(left.createdAt)
          );
        }

        if (left.dueDate) {
          return -1;
        }

        if (right.dueDate) {
          return 1;
        }

        return right.createdAt.localeCompare(left.createdAt);
      });
  });

  readonly summary = computed<TaskSummary>(() => {
    const tasks = this.allTasks();
    const today = this.localDateKey(new Date());

    return {
      total: tasks.length,
      open: tasks.filter((task) => task.status !== 'done').length,
      completed: tasks.filter((task) => task.status === 'done').length,
      overdue: tasks.filter(
        (task) => task.status !== 'done' && task.dueDate !== null && task.dueDate < today,
      ).length,
    };
  });

  readonly storageIssue = this.storageIssueState.asReadonly();
  readonly storageWarning = computed(() => {
    switch (this.storageIssue()) {
      case 'corrupt':
        return 'Saved task data could not be read. Your current changes are only kept for this session.';
      case 'unavailable':
        return 'Browser storage is unavailable. Your tasks will stay in memory until you close this tab.';
      default:
        return null;
    }
  });

  constructor() {
    const result = this.storage.read();
    this.allTasks.set(result.tasks);
    this.storageIssueState.set(result.issue);
  }

  createTask(draft: TaskDraft): Task {
    const now = new Date().toISOString();
    const task: Task = {
      ...this.normalizeDraft(draft),
      id:
        globalThis.crypto?.randomUUID?.() ??
        'task-' + Date.now() + '-' + Math.random().toString(36).slice(2),
      createdAt: now,
      updatedAt: now,
    };

    this.updateTasks((tasks) => [...tasks, task]);
    return task;
  }

  updateTask(id: string, draft: TaskDraft): boolean {
    const currentTask = this.getTask(id);
    if (!currentTask) {
      return false;
    }

    const updatedTask: Task = {
      ...currentTask,
      ...this.normalizeDraft(draft),
      updatedAt: new Date().toISOString(),
    };

    this.updateTasks((tasks) => tasks.map((task) => (task.id === id ? updatedTask : task)));
    return true;
  }

  setStatus(id: string, status: TaskStatus): void {
    this.updateTasks((tasks) =>
      tasks.map((task) =>
        task.id === id ? { ...task, status, updatedAt: new Date().toISOString() } : task,
      ),
    );
  }

  deleteTask(id: string): void {
    this.updateTasks((tasks) => tasks.filter((task) => task.id !== id));
  }

  getTask(id: string): Task | undefined {
    return this.allTasks().find((task) => task.id === id);
  }

  setSearchText(value: string): void {
    this.searchText.set(value);
  }

  setStatusFilter(value: StatusFilter): void {
    this.statusFilter.set(value);
  }

  setPriorityFilter(value: PriorityFilter): void {
    this.priorityFilter.set(value);
  }

  clearFilters(): void {
    this.searchText.set('');
    this.statusFilter.set('all');
    this.priorityFilter.set('all');
  }

  clearSavedData(): void {
    if (!this.storage.clear()) {
      this.storageIssueState.set('unavailable');
      return;
    }

    this.storageIssueState.set(null);
    this.persist(this.allTasks());
  }

  retryStorage(): void {
    if (this.storageIssue() !== 'corrupt') {
      this.persist(this.allTasks());
    }
  }

  private updateTasks(update: (tasks: Task[]) => Task[]): void {
    const tasks = update(this.allTasks());
    this.allTasks.set(tasks);
    this.persist(tasks);
  }

  private persist(tasks: Task[]): void {
    if (this.storageIssue() === 'corrupt') {
      return;
    }

    this.storageIssueState.set(this.storage.write(tasks) ? null : 'unavailable');
  }

  private normalizeDraft(draft: TaskDraft): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      title: draft.title.trim(),
      description: draft.description.trim(),
      status: draft.status,
      priority: draft.priority,
      dueDate: draft.dueDate || null,
    };
  }

  private localDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return [year, month, day].join('-');
  }
}
