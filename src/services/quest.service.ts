import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface Quest {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  tier: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  merit_reward: number;
  steps_count: number;
  estimated_minutes: number;
  active: boolean;
}

export interface QuestStep {
  id: string;
  quest_id: string;
  order_index: number;
  step_type: 'lesson' | 'quiz' | 'choice' | 'checkpoint';
  title: string;
  content: {
    markdown?: string;
    question?: string;
    options?: { label: string; value: string; correct?: boolean }[];
    choices?: { label: string; description: string; next_step_id: string }[];
  };
  next_step_id: string | null;
  branches: { condition: string; next_step_id: string }[] | null;
  merit_points: number;
}

export interface QuestProgress {
  id: string;
  person_slug: string;
  quest_id: string;
  current_step_id: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at: string | null;
  merit_awarded: number;
}

@Injectable({ providedIn: 'root' })
export class QuestService {
  private api = inject(ApiService);

  readonly quests = signal<Quest[]>([]);
  readonly currentQuest = signal<Quest | null>(null);
  readonly currentStep = signal<QuestStep | null>(null);
  readonly progress = signal<QuestProgress | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loadQuests(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.get<{ quests: Quest[] }>('/api/quests').subscribe({
      next: (data) => {
        this.quests.set(data.quests || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load quests');
        this.loading.set(false);
      },
    });
  }

  loadQuest(slug: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.get<{ quest: Quest; progress: QuestProgress | null }>(`/api/quests/${slug}`).subscribe({
      next: (data) => {
        this.currentQuest.set(data.quest);
        this.progress.set(data.progress);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Quest not found');
        this.loading.set(false);
      },
    });
  }

  loadStep(questSlug: string, stepId: string): void {
    this.api.get<{ step: QuestStep }>(`/api/quests/${questSlug}/steps/${stepId}`).subscribe({
      next: (data) => this.currentStep.set(data.step),
      error: (err) => this.error.set(err.message || 'Step not found'),
    });
  }

  startQuest(questSlug: string): void {
    this.api.post<{ progress: QuestProgress; first_step: QuestStep }>(`/api/quests/${questSlug}/start`).subscribe({
      next: (data) => {
        this.progress.set(data.progress);
        this.currentStep.set(data.first_step);
      },
      error: (err) => this.error.set(err.message || 'Failed to start quest'),
    });
  }

  submitStep(questSlug: string, stepId: string, response: unknown): void {
    this.api.post<{ next_step: QuestStep | null; points_awarded: number; quest_complete: boolean }>(
      `/api/quests/${questSlug}/steps/${stepId}/submit`,
      { response }
    ).subscribe({
      next: (data) => {
        if (data.quest_complete) {
          const p = this.progress();
          if (p) this.progress.set({ ...p, status: 'completed', completed_at: new Date().toISOString() });
          this.currentStep.set(null);
        } else if (data.next_step) {
          this.currentStep.set(data.next_step);
        }
      },
      error: (err) => this.error.set(err.message || 'Failed to submit step'),
    });
  }
}
