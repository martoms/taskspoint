import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { TaskEditorPage } from './task-editor-page';

describe('TaskEditorPage', () => {
  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [TaskEditorPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows the required title error after an invalid submission', async () => {
    const fixture = TestBed.createComponent(TaskEditorPage);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('#task-title-error') as HTMLElement;

    expect(error.textContent).toContain('Add a title for this task.');
    expect(fixture.nativeElement.querySelector('#task-title')?.getAttribute('aria-invalid')).toBe(
      'true',
    );
  });
});
