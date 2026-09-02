import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

type TaskInput = {
  priority?: 'low' | 'medium' | 'high';
  status?: 'todo' | 'in-progress' | 'done';
  title: string;
};

const createTask = async (page: Page, task: TaskInput): Promise<void> => {
  await page.goto('/tasks/new');
  await page.getByLabel('Task title').fill(task.title);
  await page.getByLabel('Priority').selectOption(task.priority ?? 'medium');
  await page.getByLabel('Status').selectOption(task.status ?? 'todo');
  await page.getByRole('button', { name: 'Create task' }).click();
  await expect(page.getByRole('heading', { name: task.title })).toBeVisible();
};

test('creates, edits, persists, completes, and deletes a task', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Make room for what matters.' })).toBeVisible();

  await page.getByRole('link', { name: 'Add a task' }).click();
  await page.getByLabel('Task title').fill('Quarterly planning');
  await page.locator('#task-description').fill('Prepare the roadmap review');
  await page.getByLabel('Priority').selectOption('high');
  await page.getByLabel('Status').selectOption('in-progress');
  await page.locator('#task-due-date').fill('2099-05-12');
  await page.getByRole('button', { name: 'Create task' }).click();

  await expect(page.getByRole('heading', { name: 'Quarterly planning' })).toBeVisible();
  await expect(page.getByText('Prepare the roadmap review')).toBeVisible();

  await page.getByRole('link', { name: 'Edit task: Quarterly planning' }).click();
  await page.getByLabel('Task title').fill('Quarterly roadmap planning');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: 'Quarterly roadmap planning' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Quarterly roadmap planning' })).toBeVisible();
  await page.getByRole('button', { name: 'Mark complete: Quarterly roadmap planning' }).click();
  await expect(
    page.getByRole('button', { name: 'Reopen task: Quarterly roadmap planning' }),
  ).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete task: Quarterly roadmap planning' }).click();
  await expect(page.getByRole('heading', { name: 'A fresh start' })).toBeVisible();
});

test('composes search, status, and priority filters', async ({ page }) => {
  await createTask(page, { title: 'Release plan', priority: 'high' });
  await createTask(page, { title: 'Release QA', priority: 'high', status: 'in-progress' });
  await createTask(page, { title: 'Budget review', priority: 'low' });

  await page.getByLabel('Search tasks').fill('release');
  await page.getByLabel('Filter by status').selectOption('todo');
  await page.getByLabel('Filter by priority').selectOption('high');
  await expect(page.locator('.task-row')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Release plan' })).toBeVisible();

  await page.getByLabel('Filter by status').selectOption('in-progress');
  await expect(page.locator('.task-row')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Release QA' })).toBeVisible();

  await page.getByLabel('Search tasks').fill('not on the list');
  await expect(page.getByRole('heading', { name: 'No tasks found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.task-row')).toHaveCount(3);
});

test('shows a required-title error and keeps invalid tasks out of the list', async ({ page }) => {
  await page.goto('/tasks/new');
  await page.getByRole('button', { name: 'Create task' }).click();

  await expect(page.getByRole('alert')).toContainText('Add a title for this task.');
  await expect(page.locator('#task-title')).toHaveAttribute('aria-invalid', 'true');
});
