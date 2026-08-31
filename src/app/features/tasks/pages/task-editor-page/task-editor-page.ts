import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, maxLength, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskDraft, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../../models/task.model';
import { TaskStore } from '../../data-access/task-store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, FormRoot, RouterLink],
  selector: 'app-task-editor-page',
  styleUrl: './task-editor-page.scss',
  templateUrl: './task-editor-page.html',
})
export class TaskEditorPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(TaskStore);

  protected readonly taskId = this.route.snapshot.paramMap.get('taskId');
  protected readonly existingTask = this.taskId ? this.store.getTask(this.taskId) : undefined;
  protected readonly isEditing = this.taskId !== null;
  protected readonly priorityLabels = TASK_PRIORITY_LABELS;
  protected readonly statusLabels = TASK_STATUS_LABELS;
  protected readonly priorities = ['low', 'medium', 'high'] as const;
  protected readonly statuses = ['todo', 'in-progress', 'done'] as const;
  protected readonly taskModel = signal<TaskDraft>({
    title: this.existingTask?.title ?? '',
    description: this.existingTask?.description ?? '',
    status: this.existingTask?.status ?? 'todo',
    priority: this.existingTask?.priority ?? 'medium',
    dueDate: this.existingTask?.dueDate ?? '',
  });

  protected readonly taskForm = form(
    this.taskModel,
    (schema) => {
      required(schema.title, { message: 'Add a title for this task.' });
      maxLength(schema.title, 120, { message: 'Use 120 characters or fewer.' });
      maxLength(schema.description, 500, { message: 'Use 500 characters or fewer.' });
    },
    {
      submission: {
        action: async (field) => {
          const value = field().value();

          if (this.taskId) {
            this.store.updateTask(this.taskId, value);
          } else {
            this.store.createTask(value);
          }

          await this.router.navigateByUrl('/tasks');
        },
      },
    },
  );
}
