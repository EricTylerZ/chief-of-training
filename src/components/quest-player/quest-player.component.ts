import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuestService } from '../../services/quest.service';

@Component({
  selector: 'cot-quest-player',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="quest-player">
      @if (questService.currentQuest(); as quest) {
        <div class="quest-header">
          <a routerLink="/" class="back-link">&larr; Back to Quests</a>
          <h1>{{ quest.icon }} {{ quest.title }}</h1>
        </div>

        @if (questService.currentStep(); as step) {
          <div class="step-card">
            <div class="step-progress">
              Step {{ step.order_index + 1 }} of {{ quest.steps_count }}
            </div>
            <h2>{{ step.title }}</h2>

            @switch (step.step_type) {
              @case ('lesson') {
                <div class="lesson-content">
                  <p>{{ step.content.markdown }}</p>
                </div>
                <button class="btn-primary" (click)="submitStep(step.id, { read: true })">
                  Continue
                </button>
              }

              @case ('quiz') {
                <div class="quiz-content">
                  <p class="quiz-question">{{ step.content.question }}</p>
                  <div class="quiz-options">
                    @for (option of step.content.options; track option.value) {
                      <button
                        class="quiz-option"
                        [class.selected]="selectedAnswer() === option.value"
                        (click)="selectedAnswer.set(option.value)"
                      >
                        {{ option.label }}
                      </button>
                    }
                  </div>
                </div>
                <button
                  class="btn-primary"
                  [disabled]="!selectedAnswer()"
                  (click)="submitStep(step.id, { answer: selectedAnswer() })"
                >
                  Submit Answer
                </button>
              }

              @case ('choice') {
                <div class="choice-content">
                  <div class="choices">
                    @for (choice of step.content.choices; track choice.label) {
                      <button
                        class="choice-btn"
                        (click)="submitStep(step.id, { choice: choice.next_step_id })"
                      >
                        <strong>{{ choice.label }}</strong>
                        <span>{{ choice.description }}</span>
                      </button>
                    }
                  </div>
                </div>
              }

              @case ('checkpoint') {
                <div class="checkpoint-content">
                  <p>{{ step.content.markdown }}</p>
                </div>
                <button class="btn-primary" (click)="submitStep(step.id, { reflected: true })">
                  Continue
                </button>
              }
            }
          </div>
        } @else if (!questService.loading()) {
          <!-- Quest loaded but no current step = not started yet -->
          <div class="quest-intro">
            <p>{{ quest.description }}</p>
            <div class="quest-stats">
              <span>{{ quest.steps_count }} steps</span>
              <span>{{ quest.estimated_minutes }} minutes</span>
              <span>{{ quest.merit_reward }} EZ Merit Points</span>
            </div>
            <button class="btn-primary" (click)="questService.startQuest(quest.slug)">
              Start Quest
            </button>
          </div>
        }

        @if (questService.progress()?.status === 'completed') {
          <div class="completion-banner">
            <h2>Quest Complete!</h2>
            <p>{{ quest.merit_reward }} EZ Merit Points earned.</p>
            <a routerLink="/" class="btn-primary">Back to Quest Board</a>
          </div>
        }
      } @else if (questService.loading()) {
        <p class="loading">Loading quest...</p>
      } @else if (questService.error()) {
        <p class="error">{{ questService.error() }}</p>
      }
    </div>
  `,
  styles: [`
    .quest-player { max-width: 700px; margin: 0 auto; padding: 2rem 1.5rem; }
    .back-link { color: var(--accent, #e8b94a); text-decoration: none; font-size: 0.875rem; }
    .quest-header h1 { margin: 0.75rem 0 1.5rem; font-size: 1.5rem; }

    .step-card {
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 2rem;
      background: rgba(255,255,255,0.03);
    }
    .step-progress {
      font-size: 0.75rem;
      opacity: 0.5;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .step-card h2 { margin: 0 0 1.25rem; font-size: 1.25rem; }

    .lesson-content p { line-height: 1.7; margin-bottom: 1.5rem; opacity: 0.85; }

    .quiz-question { font-weight: 600; margin-bottom: 1rem; }
    .quiz-options { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
    .quiz-option {
      padding: 0.75rem 1rem;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px;
      background: transparent;
      color: inherit;
      text-align: left;
      cursor: pointer;
      font-size: 0.9rem;
      transition: border-color 0.15s;
    }
    .quiz-option:hover { border-color: rgba(255,255,255,0.3); }
    .quiz-option.selected { border-color: var(--accent, #e8b94a); background: rgba(232,185,74,0.08); }

    .choices { display: flex; flex-direction: column; gap: 0.75rem; }
    .choice-btn {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1rem 1.25rem;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      background: transparent;
      color: inherit;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.15s;
    }
    .choice-btn:hover { border-color: var(--accent, #e8b94a); }
    .choice-btn strong { font-size: 0.95rem; }
    .choice-btn span { font-size: 0.8rem; opacity: 0.6; }

    .checkpoint-content p { line-height: 1.7; margin-bottom: 1.5rem; opacity: 0.85; font-style: italic; }

    .btn-primary {
      display: inline-block;
      padding: 0.7rem 1.75rem;
      background: var(--accent, #e8b94a);
      color: #1a1a1a;
      border: none;
      border-radius: 6px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
    }
    .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

    .quest-intro { text-align: center; padding: 2rem; }
    .quest-intro p { max-width: 500px; margin: 0 auto 1.5rem; line-height: 1.6; opacity: 0.8; }
    .quest-stats {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      font-size: 0.85rem;
      opacity: 0.5;
      margin-bottom: 1.5rem;
    }

    .completion-banner {
      text-align: center;
      padding: 2rem;
      margin-top: 1.5rem;
      border: 2px solid #22c55e;
      border-radius: 10px;
      background: rgba(34,197,94,0.08);
    }
    .completion-banner h2 { margin: 0 0 0.5rem; color: #22c55e; }
    .completion-banner p { margin: 0 0 1rem; }

    .loading, .error { text-align: center; padding: 3rem; opacity: 0.6; }
  `],
})
export class QuestPlayerComponent implements OnInit {
  questService = inject(QuestService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  selectedAnswer = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const slug = params.get('slug');
        if (slug) this.questService.loadQuest(slug);
      });
  }

  submitStep(stepId: string, response: unknown): void {
    const quest = this.questService.currentQuest();
    if (!quest) return;
    this.selectedAnswer.set(null);
    this.questService.submitStep(quest.slug, stepId, response);
  }
}
