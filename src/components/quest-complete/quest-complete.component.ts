import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuestService } from '../../services/quest.service';

@Component({
  selector: 'cot-quest-complete',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="complete">
      @if (questService.currentQuest(); as quest) {
        <div class="complete-icon">🎉</div>
        <h1>Quest Complete</h1>
        <h2>{{ quest.title }}</h2>
        <div class="points-earned">+{{ quest.merit_reward }} EZ Merit Points</div>
        <div class="actions">
          <a routerLink="/" class="btn-primary">More Quests</a>
          <a routerLink="/leaderboard" class="btn-secondary">Leaderboard</a>
        </div>
      } @else {
        <a routerLink="/">Back to Quest Board</a>
      }
    </div>
  `,
  styles: [`
    .complete { text-align: center; padding: 4rem 1.5rem; max-width: 500px; margin: 0 auto; }
    .complete-icon { font-size: 4rem; margin-bottom: 1rem; }
    h1 { margin: 0 0 0.5rem; font-size: 2rem; }
    h2 { margin: 0 0 1.5rem; font-size: 1.1rem; opacity: 0.7; font-weight: 400; }
    .points-earned {
      font-size: 1.5rem; font-weight: 700;
      color: var(--accent, #e8b94a); margin-bottom: 2rem;
    }
    .actions { display: flex; gap: 1rem; justify-content: center; }
    .btn-primary {
      padding: 0.7rem 1.75rem; background: var(--accent, #e8b94a);
      color: #1a1a1a; border-radius: 6px; text-decoration: none; font-weight: 600;
    }
    .btn-secondary {
      padding: 0.7rem 1.75rem; border: 1px solid var(--accent, #e8b94a);
      color: var(--accent, #e8b94a); border-radius: 6px; text-decoration: none; font-weight: 600;
    }
  `],
})
export class QuestCompleteComponent {
  questService = inject(QuestService);
}
