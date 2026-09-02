import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { TaskListPage } from './task-list-page';

describe('TaskListPage', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [TaskListPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows the guided empty state when there are no saved tasks', () => {
    const fixture = TestBed.createComponent(TaskListPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Make room for what matters.');
    expect(compiled.querySelector('h3')?.textContent).toContain('A fresh start');
    expect(compiled.textContent).toContain('Create your first task');
  });
});
