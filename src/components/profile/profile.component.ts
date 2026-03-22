import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'cot-profile',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="profile">
      <a routerLink="/" class="back-link">&larr; Back to Quests</a>

      @if (auth.user(); as user) {
        <h1>{{ user.fullName }}</h1>
        <p class="merit-id">{{ user.meritId }}</p>
        <p class="coming-soon">Quest history and badges coming soon.</p>
      } @else {
        <p>Loading profile...</p>
      }
    </div>
  `,
  styles: [`
    .profile { max-width: 600px; margin: 0 auto; padding: 2rem 1.5rem; }
    .back-link { color: var(--accent, #e8b94a); text-decoration: none; font-size: 0.875rem; }
    h1 { margin: 0.75rem 0 0.25rem; }
    .merit-id { font-family: monospace; color: var(--accent, #e8b94a); font-weight: 700; }
    .coming-soon { opacity: 0.5; font-style: italic; margin-top: 2rem; }
  `],
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.checkAuth();
  }
}
