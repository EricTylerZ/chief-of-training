import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'cot-login',
  standalone: true,
  template: `
    <div class="login">
      @if (auth.loading()) {
        <p>Checking authentication...</p>
      } @else if (auth.isLoggedIn()) {
        <p>You are logged in as {{ auth.user()?.fullName }}. Redirecting...</p>
      } @else {
        <div class="login-card">
          <div class="login-icon">🎓</div>
          <h1>Sign in to Chief of Training</h1>
          <p>Use your EZ Merit account to sign in.</p>
          <a [href]="auth.getLoginUrl('/')" class="btn-primary">Sign In with EZ Merit</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .login { max-width: 400px; margin: 0 auto; padding: 4rem 1.5rem; text-align: center; }
    .login-card {
      padding: 2rem;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
    }
    .login-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    h1 { margin: 0 0 0.75rem; font-size: 1.25rem; }
    p { opacity: 0.7; margin-bottom: 1.5rem; }
    .btn-primary {
      display: inline-block; padding: 0.8rem 2rem;
      background: var(--accent, #e8b94a); color: #1a1a1a;
      border-radius: 6px; font-weight: 600; text-decoration: none;
    }
  `],
})
export class LoginComponent implements OnInit {
  auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.checkAuth();
  }
}
