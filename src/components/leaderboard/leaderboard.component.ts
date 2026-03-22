import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MeritService } from '../../services/merit.service';

@Component({
  selector: 'cot-leaderboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="leaderboard">
      <a routerLink="/" class="back-link">&larr; Back to Quests</a>
      <h1>Leaderboard</h1>
      <p class="subtitle">Top EZ Merit Point earners across the ecosystem.</p>

      @if (meritService.error()) {
        <p class="error">{{ meritService.error() }}</p>
      }

      @if (meritService.leaderboard().length > 0) {
        <div class="lb-list">
          @for (entry of meritService.leaderboard(); track entry.slug; let i = $index) {
            <div class="lb-row">
              <span class="lb-rank">{{ i < 3 ? medals[i] : '#' + (i + 1) }}</span>
              <span class="lb-name">
                {{ entry.name }}
                @if (entry.is_bot) { <span class="bot-tag">bot</span> }
              </span>
              <span class="lb-points">{{ entry.balance.toLocaleString() }} pts</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .leaderboard { max-width: 600px; margin: 0 auto; padding: 2rem 1.5rem; }
    .back-link { color: var(--accent, #e8b94a); text-decoration: none; font-size: 0.875rem; }
    h1 { margin: 0.75rem 0 0.25rem; }
    .subtitle { opacity: 0.6; margin-bottom: 1.5rem; font-size: 0.9rem; }
    .error { color: #ef4444; }
    .lb-list { display: flex; flex-direction: column; gap: 0.25rem; }
    .lb-row {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem; border-radius: 6px;
      background: rgba(255,255,255,0.03);
    }
    .lb-rank { width: 2rem; text-align: center; font-size: 1.1rem; }
    .lb-name { flex: 1; font-size: 0.9rem; }
    .bot-tag {
      display: inline-block; font-size: 0.55rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.05em;
      background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.4);
      padding: 0.1rem 0.3rem; border-radius: 3px; margin-left: 0.3rem;
      vertical-align: middle;
    }
    .lb-points { font-weight: 600; color: var(--accent, #e8b94a); font-size: 0.9rem; }
  `],
})
export class LeaderboardComponent implements OnInit {
  meritService = inject(MeritService);
  medals = ['\uD83E\uDD47', '\uD83E\uDD48', '\uD83E\uDD49'];

  ngOnInit(): void {
    this.meritService.loadLeaderboard();
  }
}
