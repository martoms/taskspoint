import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  PriorityFilter,
  StatusFilter,
  Task,
  TaskPriority,
  TaskStatus,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from '../../models/task.model';
import { TaskStore } from '../../data-access/task-store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  selector: 'app-task-list-page',
  styleUrl: './task-list-page.scss',
  templateUrl: './task-list-page.html',
})
export class TaskListPage {
  protected readonly store = inject(TaskStore);
  protected readonly statusLabels = TASK_STATUS_LABELS;
  protected readonly priorityLabels = TASK_PRIORITY_LABELS;
  protected readonly statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'todo', label: 'To do' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'done', label: 'Done' },
  ];
  protected readonly priorityOptions: { value: PriorityFilter; label: string }[] = [
    { value: 'all', label: 'All priorities' },
    { value: 'low', label: 'Low priority' },
    { value: 'medium', label: 'Medium priority' },
    { value: 'high', label: 'High priority' },
  ];

  protected onSearchInput(event: Event): void {
    this.store.setSearchText((event.target as HTMLInputElement).value);
  }

  protected onStatusChange(event: Event): void {
    this.store.setStatusFilter((event.target as HTMLSelectElement).value as StatusFilter);
  }

  protected onPriorityChange(event: Event): void {
    this.store.setPriorityFilter((event.target as HTMLSelectElement).value as PriorityFilter);
  }

  protected toggleCompletion(task: Task): void {
    const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    this.store.setStatus(task.id, nextStatus);
  }

  protected removeTask(task: Task): void {
    const confirmed = globalThis.confirm('Delete "' + task.title + '"? This cannot be undone.');
    if (confirmed) {
      this.store.deleteTask(task.id);
    }
  }

  protected isOverdue(task: Task): boolean {
    return task.status !== 'done' && task.dueDate !== null && task.dueDate < this.todayKey();
  }

  protected formatDueDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(
      new Date(year, month - 1, day),
    );
  }

  protected clearFilters(): void {
    this.store.clearFilters();
  }

  protected clearSavedData(): void {
    this.store.clearSavedData();
  }

  protected retryStorage(): void {
    this.store.retryStorage();
  }

  protected priorityClass(priority: TaskPriority): string {
    return 'priority-' + priority;
  }

  protected statusClass(status: TaskStatus): string {
    return 'status-' + status;
  }

  private todayKey(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    return [year, month, day].join('-');
  }
}
