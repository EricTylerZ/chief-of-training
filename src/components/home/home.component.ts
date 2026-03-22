import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { QuestService, Quest } from '../../services/quest.service';

@Component({
  selector: 'cot-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home">
      <!-- Hero: for strangers first, members second -->
      <section class="hero">
        <div class="hero-icon">🎓</div>
        <h1>Chief of Training</h1>
        <p class="hero-subtitle">
          Learn something new. Earn EZ Merit Points doing it.
        </p>
        <p class="hero-desc">
          Quest-based learning built by an Air Force training professional.
          Pick a topic, work through the steps, earn points along the way.
        </p>
        @if (auth.isLoggedIn()) {
          <div class="hero-welcome">
            <p>Welcome back, {{ auth.user()?.fullName }}.</p>
          </div>
        } @else {
          <a [href]="auth.getLoginUrl()" class="btn-primary">Sign In with EZ Merit</a>
        }
      </section>

      <!-- Quest Board -->
      <section class="quest-board">
        <h2>Available Quests</h2>

        @if (questService.loading()) {
          <p class="loading">Loading quests...</p>
        }

        @if (questService.error()) {
          <p class="error">{{ questService.error() }}</p>
        }

        @if (!questService.loading() && questService.quests().length === 0 && !questService.error()) {
          <div class="empty">
            <p>Quests are being built. Check back soon.</p>
            <p class="subtle">The AI is writing training content as fast as it can.</p>
          </div>
        }

        <div class="quest-grid">
          @for (quest of questService.quests(); track quest.id) {
            <a [routerLink]="['/quest', quest.slug]" class="quest-card">
              <div class="quest-icon">{{ quest.icon }}</div>
              <div class="quest-info">
                <h3>{{ quest.title }}</h3>
                <p>{{ quest.description }}</p>
                <div class="quest-meta">
                  <span class="quest-tier" [class]="quest.tier">{{ quest.tier }}</span>
                  <span>{{ quest.steps_count }} steps</span>
                  <span>{{ quest.estimated_minutes }} min</span>
                  <span class="quest-points">{{ quest.merit_reward }} pts</span>
                </div>
              </div>
            </a>
          }
        </div>
      </section>

      <!-- What is this: for strangers who scrolled past the quests -->
      <section class="about-section">
        <h2>What is Chief of Training?</h2>
        <div class="about-cards">
          <div class="about-card">
            <div class="about-icon">🎯</div>
            <h3>Learn by Doing</h3>
            <p>
              Every quest walks you through real knowledge step by step.
              Quiz yourself, make choices, see where different paths lead.
            </p>
          </div>
          <div class="about-card">
            <div class="about-icon">🎖️</div>
            <h3>Earn EZ Merit Points</h3>
            <p>
              Complete steps and quests to earn points on the EZ Merit leaderboard.
              The points do not buy anything. They are just for fun.
            </p>
          </div>
          <div class="about-card">
            <div class="about-icon">🛡️</div>
            <h3>Part of the Ecosystem</h3>
            <p>
              Chief of Training is one piece of Eric Zosso's ecosystem.
              Your EZ Merit login works here and everywhere else.
            </p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home { max-width: 900px; margin: 0 auto; padding: 0 1.5rem 3rem; }

    .hero {
      text-align: center;
      padding: 4rem 1rem 3rem;
    }
    .hero-icon { font-size: 3rem; margin-bottom: 0.5rem; }
    .hero h1 { font-size: 2.25rem; margin: 0 0 0.5rem; }
    .hero-subtitle { font-size: 1.2rem; opacity: 0.85; margin: 0 0 1rem; }
    .hero-desc {
      max-width: 550px;
      margin: 0 auto 1.5rem;
      font-size: 0.95rem;
      line-height: 1.6;
      opacity: 0.7;
    }
    .hero-welcome { margin-top: 1rem; }
    .btn-primary {
      display: inline-block;
      padding: 0.8rem 2rem;
      background: var(--accent, #e8b94a);
      color: #1a1a1a;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
    }

    .quest-board { margin-top: 2rem; }
    .quest-board h2 { margin-bottom: 1.25rem; }
    .loading, .error { opacity: 0.6; }
    .empty { text-align: center; padding: 2rem; opacity: 0.6; }
    .subtle { font-size: 0.85rem; font-style: italic; }

    .quest-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .quest-card {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      background: rgba(255,255,255,0.04);
      text-decoration: none;
      color: inherit;
      transition: border-color 0.15s, transform 0.1s;
    }
    .quest-card:hover {
      border-color: var(--accent, #e8b94a);
      transform: translateY(-1px);
    }
    .quest-icon { font-size: 1.75rem; flex-shrink: 0; padding-top: 0.15rem; }
    .quest-info { flex: 1; }
    .quest-info h3 { margin: 0 0 0.35rem; font-size: 1rem; }
    .quest-info p { margin: 0 0 0.5rem; font-size: 0.85rem; opacity: 0.7; line-height: 1.5; }
    .quest-meta {
      display: flex;
      gap: 0.75rem;
      font-size: 0.75rem;
      opacity: 0.5;
    }
    .quest-tier {
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .quest-tier.beginner { color: #22c55e; }
    .quest-tier.intermediate { color: #3b82f6; }
    .quest-tier.advanced { color: #a855f7; }
    .quest-points { color: var(--accent, #e8b94a); font-weight: 600; }

    .about-section { margin-top: 3rem; }
    .about-section h2 { margin-bottom: 1.25rem; }
    .about-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }
    .about-card {
      padding: 1.25rem;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      text-align: center;
    }
    .about-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
    .about-card h3 { margin: 0 0 0.5rem; font-size: 0.95rem; }
    .about-card p { margin: 0; font-size: 0.85rem; opacity: 0.7; line-height: 1.5; }
  `],
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  questService = inject(QuestService);

  ngOnInit(): void {
    this.auth.checkAuth();
    this.questService.loadQuests();
  }
}
